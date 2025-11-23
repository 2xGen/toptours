/**
 * Generate SEO content (unique description, SEO title, meta description) for restaurants
 * using Google Gemini API
 * 
 * Usage:
 *   node scripts/generate-restaurant-seo-content.js [destinationId] [restaurantSlug]
 * 
 * Examples:
 *   node scripts/generate-restaurant-seo-content.js aruba
 *   node scripts/generate-restaurant-seo-content.js aruba the-vue-rooftop-aruba-aruba
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env.local');
  console.error('   Get your API key from: https://makersuite.google.com/app/apikey');
  console.error('   Or use: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

console.log(`🔑 Using API key (first 10 chars): ${GEMINI_API_KEY.substring(0, 10)}...`);

// Note: If you get 404 errors, your API key might not have access to certain models.
// Try checking available models at: https://aistudio.google.com/app/apikey
// Common working models: gemini-1.5-flash, gemini-1.5-pro, gemini-pro

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * List available Gemini models (for debugging)
 */
async function listAvailableModels() {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Note: The SDK doesn't have a direct listModels method, but we can try common models
    console.log('ℹ️  Trying to find available models...');
    return null;
  } catch (error) {
    console.error('Error listing models:', error);
    return null;
  }
}

/**
 * Generate SEO content using Gemini API
 */
async function generateSEOContent(restaurantData, destinationName) {
  const restaurantName = restaurantData.name;
  const rating = restaurantData.google_rating;
  const reviewCount = restaurantData.review_count;
  const priceRange = restaurantData.price_range || '$$';
  const cuisines = Array.isArray(restaurantData.cuisines) 
    ? restaurantData.cuisines.join(', ') 
    : restaurantData.cuisines || '';
  
  // Extract key review details
  let reviewHighlights = '';
  if (restaurantData.reviews && Array.isArray(restaurantData.reviews)) {
    const reviewTexts = restaurantData.reviews
      .slice(0, 3)
      .map(r => r.text || r.text?.text || '')
      .filter(Boolean)
      .join(' ');
    reviewHighlights = reviewTexts.substring(0, 500);
  }

  // Build the prompt
  const prompt = `Role: You are a professional travel writer creating authentic, natural content for a restaurant listing website.

Goal: Analyze the provided JSON data for the restaurant "${restaurantName}" in ${destinationName}. Generate three separate, natural-sounding outputs:

1. A unique content description (100-150 words).
2. An SEO-rich Title (under 60 characters).
3. An SEO Meta Description (under 160 characters).

Writing Style & Guidelines:
- Write in a professional yet warm, natural tone - like a travel guide or food critic, not overly casual or formal
- Avoid overly casual phrases like "You absolutely have to check out", "It's got this", "Let's just say", "seriously", "super chill"
- Avoid overly formal phrases like "indulge" and "immerse" - use them very sparingly (maybe 1 in 20 descriptions)
- Write naturally: "This restaurant offers...", "Located in...", "Known for...", "The atmosphere is...", "What makes this place special...", "A favorite among...", "Here you'll find..."
- Use professional but accessible language: "enjoy", "experience", "discover", "savor", "dine", "sample", "appreciate", "features", "offers", "provides"
- Description: Write about the atmosphere, what makes it special, the ${rating}/5 rating, ${priceRange} pricing, and what diners say. Write like a professional travel writer describing a restaurant. Do NOT use the restaurant's name ("${restaurantName}") in the description.
- SEO Title: Include "${destinationName}", location keywords, cuisine type, and "${restaurantName}". Keep it natural and under 60 characters.
- Meta Description: Write a compelling, professional summary that includes the ${rating}-star rating. Make it sound natural and human. Include a subtle call-to-action.

Output the results clearly labeled using Markdown headings:
### SEO Title
[title here]

### SEO Meta Description
[description here]

### Unique Content Description
[description here]

Input Data (JSON):
${JSON.stringify({
  name: restaurantName,
  rating: rating,
  reviewCount: reviewCount,
  priceRange: priceRange,
  cuisines: cuisines,
  address: restaurantData.address || restaurantData.formatted_address,
  reviewHighlights: reviewHighlights,
  outdoorSeating: restaurantData.outdoor_seating,
  liveMusic: restaurantData.live_music,
  servesCocktails: restaurantData.serves_cocktails,
  goodForGroups: restaurantData.good_for_groups,
  reservable: restaurantData.reservable,
}, null, 2)}`;

  try {
    // Initialize Google Generative AI SDK
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Try different models in order of preference
    // Using SDK's getGenerativeModel which handles model discovery better
    const models = [
      'gemini-1.5-flash',      // Most commonly available
      'gemini-1.5-pro',        // Alternative
      'gemini-pro',            // Legacy but stable
      'gemini-2.0-flash-exp',  // Experimental
      'gemini-2.5-flash-lite', // Newer model
      'gemini-2.5-flash'       // Newer model
    ];
    
    let content = null;
    let lastError = null;
    
    for (const modelName of models) {
      try {
        console.log(`   🔄 Trying model: ${modelName}...`);
        
        // Use SDK's getGenerativeModel method
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        });

        const response = await result.response;
        content = response.text();
        
        console.log(`   ✓ Model ${modelName} responded successfully!`);
        console.log(`   📄 Response length: ${content.length} characters`);
        
        break; // Success, exit loop
      } catch (err) {
        const errorMsg = err.message || err.toString();
        
        // Check if it's a rate limit error (429)
        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Quota exceeded')) {
          // Extract retry delay if available
          const retryMatch = errorMsg.match(/retry in ([\d.]+)s/i) || errorMsg.match(/retryDelay.*?(\d+)/i);
          const retrySeconds = retryMatch ? parseFloat(retryMatch[1]) : 30;
          
          console.log(`   ⏳ Rate limit hit. Waiting ${Math.ceil(retrySeconds)} seconds before retrying...`);
          await new Promise(resolve => setTimeout(resolve, retrySeconds * 1000));
          
          // Retry this model once
          try {
            console.log(`   🔄 Retrying model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              }
            });
            const response = await result.response;
            content = response.text();
            console.log(`   ✓ Model ${modelName} succeeded on retry!`);
            console.log(`   📄 Response length: ${content.length} characters`);
            break; // Success, exit loop
          } catch (retryErr) {
            console.log(`   ✗ Retry failed: ${retryErr.message.substring(0, 100)}...`);
            lastError = retryErr;
            continue; // Try next model
          }
        } else {
          console.log(`   ✗ Model ${modelName} failed: ${errorMsg.substring(0, 100)}...`);
          lastError = err;
          continue; // Try next model
        }
      }
    }
    
    if (!content) {
      const errorMsg = lastError?.message || 'All Gemini models failed';
      console.error(`\n❌ All models failed. Last error: ${errorMsg}`);
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check your API key at: https://aistudio.google.com/app/apikey');
      console.error('   2. Ensure your API key has access to Gemini models');
      console.error('   3. Try creating a new API key if the current one doesn\'t work');
      console.error('   4. Check if your API key has the correct permissions enabled\n');
      throw lastError || new Error('All Gemini models failed');
    }
    
    // Parse the response
    console.log(`   🔍 Parsing response...`);
    const seoTitleMatch = content.match(/### SEO Title\s*\n([^\n]+)/i);
    const metaDescMatch = content.match(/### SEO Meta Description\s*\n([^\n]+)/i);
    const uniqueContentMatch = content.match(/### Unique Content Description\s*\n([\s\S]+?)(?=\n###|$)/i);

    const seoTitle = seoTitleMatch ? seoTitleMatch[1].trim() : null;
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;
    const uniqueContent = uniqueContentMatch ? uniqueContentMatch[1].trim() : null;

    console.log(`   📊 Parsing results:`);
    console.log(`      SEO Title: ${seoTitle ? '✓ Found (' + seoTitle.length + ' chars)' : '✗ Not found'}`);
    console.log(`      Meta Description: ${metaDescription ? '✓ Found (' + metaDescription.length + ' chars)' : '✗ Not found'}`);
    console.log(`      Unique Content: ${uniqueContent ? '✓ Found (' + uniqueContent.length + ' chars)' : '✗ Not found'}`);

    if (!seoTitle || !metaDescription || !uniqueContent) {
      console.warn('⚠️  Could not parse all three outputs from Gemini response');
      console.log('📄 Raw response (first 1000 chars):');
      console.log(content.substring(0, 1000));
      console.log('📄 Full response length:', content.length);
      console.log('\n🔍 Trying alternative parsing...');
      
      // Try alternative parsing patterns
      const altTitleMatch = content.match(/SEO Title[:\s]*\n?([^\n#]+)/i) || content.match(/Title[:\s]*\n?([^\n#]+)/i);
      const altMetaMatch = content.match(/Meta Description[:\s]*\n?([^\n#]+)/i) || content.match(/Description[:\s]*\n?([^\n#]+)/i);
      const altContentMatch = content.match(/Unique Content[:\s]*\n?([\s\S]+?)(?=\n\n|$)/i) || content.match(/Content[:\s]*\n?([\s\S]+?)(?=\n\n|$)/i);
      
      if (altTitleMatch || altMetaMatch || altContentMatch) {
        console.log('   ✓ Found alternative matches, using those...');
        return {
          seoTitle: (altTitleMatch ? altTitleMatch[1].trim() : seoTitle) || null,
          metaDescription: (altMetaMatch ? altMetaMatch[1].trim() : metaDescription) || null,
          uniqueContent: (altContentMatch ? altContentMatch[1].trim() : uniqueContent) || null
        };
      }
    }

    return {
      seoTitle,
      metaDescription,
      uniqueContent
    };
  } catch (error) {
    console.error('❌ Error calling Gemini API:', error.message);
    throw error;
  }
}

/**
 * Update restaurant with generated SEO content
 */
async function updateRestaurantSEOContent(restaurantId, content) {
  console.log(`   🔍 Updating restaurant ID ${restaurantId} with:`);
  console.log(`      seo_title: ${content.seoTitle ? content.seoTitle.substring(0, 50) + '...' : 'null'}`);
  console.log(`      meta_description: ${content.metaDescription ? content.metaDescription.substring(0, 50) + '...' : 'null'}`);
  console.log(`      unique_content: ${content.uniqueContent ? content.uniqueContent.substring(0, 50) + '...' : 'null'}`);
  
  const { data, error } = await supabase
    .from('restaurants')
    .update({
      seo_title: content.seoTitle,
      meta_description: content.metaDescription,
      unique_content: content.uniqueContent,
      updated_at: new Date().toISOString()
    })
    .eq('id', restaurantId)
    .select('id, seo_title, meta_description, unique_content');

  if (error) {
    console.error(`   ❌ Database update error:`, error);
    console.error(`      Code: ${error.code}`);
    console.error(`      Message: ${error.message}`);
    console.error(`      Details: ${error.details || 'N/A'}`);
    console.error(`      Hint: ${error.hint || 'N/A'}`);
    throw error;
  }

  if (!data || data.length === 0) {
    console.error(`   ❌ No rows updated for restaurant ID ${restaurantId}`);
    throw new Error(`No rows updated for restaurant ID ${restaurantId}`);
  }

  console.log(`   ✓ Database confirmed update:`);
  console.log(`      Updated seo_title: ${data[0].seo_title ? '✓' : '✗'}`);
  console.log(`      Updated meta_description: ${data[0].meta_description ? '✓' : '✗'}`);
  console.log(`      Updated unique_content: ${data[0].unique_content ? '✓' : '✗'}`);

  return data[0];
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const destinationId = args[0] && args[0] !== '' ? args[0] : null;
  const restaurantSlug = args[1] && args[1] !== '' ? args[1] : null;
  const restaurantIdsArg = args[2] && args[2] !== '' ? args[2] : null;

  // Parse restaurant IDs if provided
  let restaurantIds = null;
  if (restaurantIdsArg) {
    restaurantIds = restaurantIdsArg.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  }

  if (!destinationId && (!restaurantIds || restaurantIds.length === 0)) {
    console.error('❌ Please provide a destination ID or restaurant IDs');
    console.error('   Usage: node scripts/generate-restaurant-seo-content.js <destinationId> [restaurantSlug] [restaurantIds]');
    console.error('   Example: node scripts/generate-restaurant-seo-content.js jamaica "" "78,79"');
    process.exit(1);
  }

  try {
    // Get destination name
    let destinationName = destinationId || 'Unknown';
    if (destinationId) {
      const { destinations } = await import('../src/data/destinationsData.js');
      const destination = Array.isArray(destinations) 
        ? destinations.find(d => d.id === destinationId)
        : null;
      
      if (destination) {
        destinationName = destination.name || destinationId;
      }
    }

    // Fetch restaurants
    let query = supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true);

    if (restaurantIds && restaurantIds.length > 0) {
      // Target specific restaurant IDs (ignore destination and slug filters)
      query = query.in('id', restaurantIds);
      console.log(`🎯 Targeting specific restaurant IDs: ${restaurantIds.join(', ')}`);
    } else {
      // Use destination filter
      if (!destinationId) {
        console.error('❌ Please provide a destination ID when not using restaurant IDs');
        process.exit(1);
      }
      query = query.eq('destination_id', destinationId);
      
      // Only filter by slug if restaurantSlug is provided and not empty
      if (restaurantSlug && restaurantSlug.trim() !== '') {
        query = query.eq('slug', restaurantSlug);
      }
    }

    const { data: restaurants, error } = await query;

    if (error) {
      throw error;
    }

    if (!restaurants || restaurants.length === 0) {
      if (restaurantIds && restaurantIds.length > 0) {
        console.log(`ℹ️  No restaurants found with IDs: ${restaurantIds.join(', ')}`);
        console.log(`   Make sure the restaurant IDs exist in the database.`);
      } else {
        console.log(`ℹ️  No restaurants found for destination "${destinationId || 'N/A'}"`);
        if (restaurantSlug) {
          console.log(`   with slug "${restaurantSlug}"`);
        }
      }
      process.exit(0);
    }

    console.log(`\n🚀 Generating SEO content for ${restaurants.length} restaurant(s) in ${destinationName}...\n`);

    for (const restaurant of restaurants) {
      console.log(`📝 Processing: ${restaurant.name}...`);

      // Skip if already has content (optional - remove if you want to regenerate)
      if (restaurant.seo_title && restaurant.meta_description && restaurant.unique_content) {
        console.log(`   ⏭️  Already has SEO content, skipping...`);
        console.log(`      Title: ${restaurant.seo_title}`);
        continue;
      }
      
      // Show current state
      console.log(`   📊 Current state: title=${restaurant.seo_title ? '✓' : '✗'}, meta=${restaurant.meta_description ? '✓' : '✗'}, content=${restaurant.unique_content ? '✓' : '✗'}`);

      try {
        // Get destination name for this restaurant if not already set
        let restaurantDestinationName = destinationName;
        if (!destinationId && restaurant.destination_id) {
          const { destinations } = await import('../src/data/destinationsData.js');
          const destination = Array.isArray(destinations) 
            ? destinations.find(d => d.id === restaurant.destination_id)
            : null;
          if (destination) {
            restaurantDestinationName = destination.name || restaurant.destination_id;
          } else {
            restaurantDestinationName = restaurant.destination_id;
          }
        }
        
        // Generate content
        console.log(`   🤖 Calling Gemini API...`);
        const content = await generateSEOContent(restaurant, restaurantDestinationName);

        if (!content.seoTitle || !content.metaDescription || !content.uniqueContent) {
          console.log(`   ⚠️  Incomplete content generated, skipping update...`);
          console.log(`      SEO Title: ${content.seoTitle ? '✓' : '✗'}`);
          console.log(`      Meta Description: ${content.metaDescription ? '✓' : '✗'}`);
          console.log(`      Unique Content: ${content.uniqueContent ? '✓' : '✗'}`);
          continue;
        }

        console.log(`   💾 Saving to database (restaurant ID: ${restaurant.id})...`);
        // Update database
        const updated = await updateRestaurantSEOContent(restaurant.id, content);
        
        if (updated) {
          console.log(`   ✅ Successfully updated database!`);
          console.log(`      Title: ${content.seoTitle}`);
          console.log(`      Meta: ${content.metaDescription.substring(0, 60)}...`);
          console.log(`      Content: ${content.uniqueContent.substring(0, 60)}...`);
        } else {
          console.log(`   ⚠️  Update completed but no confirmation received`);
        }

        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`   ❌ Error processing ${restaurant.name}:`, error.message);
        if (error.code) {
          console.error(`      Error code: ${error.code}`);
        }
        if (error.details) {
          console.error(`      Details: ${error.details}`);
        }
        if (error.hint) {
          console.error(`      Hint: ${error.hint}`);
        }
        continue;
      }
    }

    console.log(`\n✅ Done!\n`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

