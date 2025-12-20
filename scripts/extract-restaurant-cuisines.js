import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { STANDARD_CUISINE_TYPES, CUISINE_MAPPING, standardizeCuisines } from '../src/data/standardCuisineTypes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env.local');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Extract cuisine types from restaurant data using Gemini
 */
async function extractCuisinesWithGemini(restaurant) {
  // Build context from available data
  const context = [
    restaurant.name || '',
    restaurant.description || '',
    restaurant.summary || '',
    restaurant.tagline || '',
    restaurant.review_summary || '',
    restaurant.unique_content || ''
  ].filter(Boolean).join('\n\n');

  if (!context || context.trim().length < 20) {
    // Not enough data to extract cuisines
    return [];
  }

  const prompt = `Analyze this restaurant information and extract 1-2 specific cuisine types.

RESTAURANT: ${restaurant.name}
CONTEXT:
${context}

AVAILABLE CUISINE TYPES (choose 1-2 that best match, use exact names):
${STANDARD_CUISINE_TYPES.join(', ')}

TASK:
1. Identify the PRIMARY cuisine type from the restaurant information
2. Optionally identify a SECONDARY cuisine type if the restaurant clearly serves multiple cuisines
3. Choose from the list above - use EXACT names as shown
4. If unsure, use "International" as fallback
5. Prioritize specific cuisines over "International"
6. If seafood/fish is prominent, use "Seafood"
7. If Italian/pizza/pasta is prominent, use "Italian"
8. If Asian (Chinese, Thai, Indian, Japanese, Korean, Vietnamese), use "Asian"
9. If Caribbean/Latin/Mexican, use "Caribbean & Latin"
10. If Mediterranean/Greek/Middle Eastern, use "Mediterranean"
11. If French/Spanish/German/British, use "European"
12. If steakhouse/BBQ/grill, use "Steakhouse & Grill"
13. If vegetarian/vegan/healthy, use "Vegetarian & Vegan"
14. If cafe/coffee/bakery/dessert, use "Cafés & Casual Eats"
15. If fusion/contemporary, use "Fusion"
16. If American/burgers/diner, use "American"

OUTPUT: Return ONLY a JSON array of 1-2 cuisine type strings, exactly as they appear in the list above.
Example: ["Italian"]
Example: ["Seafood", "Caribbean & Latin"]
Example: ["Asian"]
Example: ["International"] (only if nothing else matches)

Return ONLY the JSON array, no other text.`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite', // Cheapest option
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent results
        maxOutputTokens: 100,
        responseMimeType: 'application/json'
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    let cuisines = [];
    try {
      cuisines = JSON.parse(text);
      if (!Array.isArray(cuisines)) {
        cuisines = [];
      }
    } catch (e) {
      // Try to extract array from text
      const arrayMatch = text.match(/\[.*?\]/);
      if (arrayMatch) {
        cuisines = JSON.parse(arrayMatch[0]);
      }
    }
    
    // Standardize and validate cuisines
    const standardized = standardizeCuisines(cuisines);
    
    // Ensure we have at least one cuisine (standardizeCuisines always returns at least "International")
    return standardized.slice(0, 2); // Max 2 cuisines
    
  } catch (error) {
    console.warn(`Error extracting cuisines for ${restaurant.name}:`, error.message);
    return ['International']; // Fallback
  }
}

/**
 * Update restaurant cuisines in database
 */
async function updateRestaurantCuisines(restaurantId, cuisines) {
  try {
    const { error } = await supabase
      .from('restaurants')
      .update({ 
        cuisines: cuisines,
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurantId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating restaurant ${restaurantId}:`, error.message);
    return false;
  }
}

/**
 * Check if restaurant needs cuisine extraction
 */
function needsCuisineExtraction(restaurant) {
  const cuisines = restaurant.cuisines || [];
  
  // Check if cuisines are generic, missing, or "International" (needs better classification)
  const genericCuisines = ['Restaurant', 'Food', 'Takeaway', 'Delivery', 'International'];
  const hasOnlyGeneric = cuisines.length === 0 || 
    cuisines.every(c => genericCuisines.includes(c));
  
  // Also check if cuisines are not in our standard list (12 types)
  const hasNonStandard = cuisines.some(c => !STANDARD_CUISINE_TYPES.includes(c));
  
  return hasOnlyGeneric || hasNonStandard;
}

/**
 * Main function to process restaurants
 */
async function processRestaurants(destinationId = null, batchSize = 50, maxRestaurants = null) {
  console.log('\n🚀 STARTING CUISINE EXTRACTION\n');
  console.log('━'.repeat(60));
  
  // Build query
  let query = supabase
    .from('restaurants')
    .select('id, name, description, summary, tagline, review_summary, unique_content, cuisines, destination_id')
    .eq('is_active', true);
  
  if (destinationId) {
    query = query.eq('destination_id', destinationId);
    console.log(`📍 Processing restaurants for: ${destinationId}\n`);
  } else {
    console.log(`📍 Processing all restaurants\n`);
  }
  
  // Fetch restaurants in batches
  let offset = 0;
  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  let totalCost = 0;
  
  while (true) {
    const { data, error } = await query
      .range(offset, offset + batchSize - 1);
    
    if (error) {
      console.error('Error fetching restaurants:', error);
      break;
    }
    
    if (!data || data.length === 0) {
      break;
    }
    
    // Filter restaurants that need cuisine extraction
    const restaurantsToProcess = data.filter(needsCuisineExtraction);
    
    console.log(`\n📦 Batch ${Math.floor(offset / batchSize) + 1}: ${data.length} restaurants`);
    console.log(`   ${restaurantsToProcess.length} need cuisine extraction`);
    
    // Process each restaurant
    for (const restaurant of restaurantsToProcess) {
      try {
        // Extract cuisines
        const cuisines = await extractCuisinesWithGemini(restaurant);
        
        if (cuisines.length > 0) {
          // Update database
          const success = await updateRestaurantCuisines(restaurant.id, cuisines);
          
          if (success) {
            updated++;
            console.log(`   ✅ ${restaurant.name}: ${cuisines.join(', ')}`);
          } else {
            errors++;
            console.log(`   ❌ ${restaurant.name}: Failed to update`);
          }
        } else {
          skipped++;
          console.log(`   ⏭️  ${restaurant.name}: No cuisines extracted`);
        }
        
        processed++;
        
        // Cost estimate: ~500 tokens per request (input + output)
        // Gemini Flash Lite: $0.075 per 1M input tokens, $0.30 per 1M output tokens
        // Average: ~$0.0001 per restaurant
        totalCost += 0.0001;
        
        // Rate limiting: small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check max limit
        if (maxRestaurants && processed >= maxRestaurants) {
          console.log(`\n⏹️  Reached max limit of ${maxRestaurants} restaurants`);
          break;
        }
        
      } catch (error) {
        errors++;
        console.error(`   ❌ Error processing ${restaurant.name}:`, error.message);
      }
    }
    
    // Check if we should continue
    if (maxRestaurants && processed >= maxRestaurants) {
      break;
    }
    
    if (data.length < batchSize) {
      break; // Last batch
    }
    
    offset += batchSize;
  }
  
  console.log('\n━'.repeat(60));
  console.log(`\n✅ PROCESSING COMPLETE!`);
  console.log(`📊 Statistics:`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`\n💰 Estimated Cost: $${totalCost.toFixed(2)}`);
  console.log(`   (Based on Gemini Flash Lite pricing)`);
  console.log(`\n👀 NEXT STEPS:`);
  console.log(`   1. Verify cuisine extraction in database`);
  console.log(`   2. Test restaurant guide filtering`);
  console.log(`   3. Run for more destinations if needed`);
}

// Main execution
async function main() {
  const destinationId = process.argv[2] || null; // Optional: process specific destination
  const maxRestaurants = process.argv[3] ? parseInt(process.argv[3]) : null; // Optional: limit number
  
  await processRestaurants(destinationId, 50, maxRestaurants);
}

main().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});

