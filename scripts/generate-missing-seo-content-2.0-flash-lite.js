/**
 * Generate SEO content for restaurants with NULL values in unique_content, meta_description, or seo_title
 * Uses Gemini 2.0 Flash-Lite (gemini-2.0-flash-lite) for cost-effective at-scale usage (~$0.075/1M input, $0.30/1M output)
 *
 * Usage:
 *   node scripts/generate-missing-seo-content-2.0-flash-lite.js              # all destinations
 *   node scripts/generate-missing-seo-content-2.0-flash-lite.js gouda       # Gouda only (test)
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
  console.error('   Get your API key from: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

console.log(`🔑 Using API key (first 10 chars): ${GEMINI_API_KEY.substring(0, 10)}...`);
console.log(`🤖 Model: Gemini 2.0 Flash-Lite (gemini-2.0-flash-lite)\n`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Generate SEO content using Gemini 2.0 Flash-Lite API
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
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Gemini 2.0 Flash-Lite first (cheapest), then fallback to 1.5 Flash if needed
    const models = [
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
    ];

    let content = null;
    let lastError = null;

    for (const modelName of models) {
      try {
        console.log(`   🔄 Trying model: ${modelName}...`);

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

        console.log(`   ✓ Model ${modelName} responded successfully!`);
        console.log(`   📄 Response length: ${content.length} characters`);

        break;
      } catch (err) {
        const errorMsg = err.message || err.toString();

        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Quota exceeded')) {
          const retryMatch = errorMsg.match(/retry in ([\d.]+)s/i) || errorMsg.match(/retryDelay.*?(\d+)/i);
          const retrySeconds = retryMatch ? parseFloat(retryMatch[1]) : 30;

          console.log(`   ⏳ Rate limit hit. Waiting ${Math.ceil(retrySeconds)} seconds before retrying...`);
          await new Promise(resolve => setTimeout(resolve, retrySeconds * 1000));

          try {
            console.log(`   🔄 Retrying model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent({
              contents: [{ parts: [{ text: prompt }] }],
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
            break;
          } catch (retryErr) {
            console.log(`   ✗ Retry failed: ${retryErr.message.substring(0, 100)}...`);
            lastError = retryErr;
            continue;
          }
        } else {
          console.log(`   ✗ Model ${modelName} failed: ${errorMsg.substring(0, 100)}...`);
          lastError = err;
          continue;
        }
      }
    }

    if (!content) {
      const errorMsg = lastError?.message || 'Gemini model failed';
      console.error(`\n❌ Model failed. Error: ${errorMsg}`);
      throw lastError || new Error('Gemini model failed');
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
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error(`No rows updated for restaurant ID ${restaurantId}`);
  }

  console.log(`   ✓ Database confirmed update`);
  return data[0];
}

/**
 * Main function
 */
async function main() {
  try {
    const destinationId = process.argv[2]?.trim() || null;
    if (destinationId) {
      console.log(`🎯 Filtering by destination: ${destinationId}\n`);
    }
    console.log('🔍 Fetching restaurants with missing SEO content...\n');

    const pageSize = 1000;
    let allRestaurants = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .or('unique_content.is.null,meta_description.is.null,seo_title.is.null')
        .order('updated_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      if (destinationId) {
        query = query.eq('destination_id', destinationId);
      }
      const { data: restaurants, error } = await query;

      if (error) throw error;

      if (!restaurants || restaurants.length === 0) {
        hasMore = false;
      } else {
        allRestaurants = allRestaurants.concat(restaurants);
        console.log(`   Fetched ${restaurants.length} restaurants (total so far: ${allRestaurants.length})...`);
        if (restaurants.length < pageSize) hasMore = false;
        else offset += pageSize;
      }
    }

    if (allRestaurants.length === 0) {
      console.log(destinationId
        ? `✅ No restaurants with missing SEO content found for destination "${destinationId}".`
        : '✅ No restaurants found with missing SEO content!');
      process.exit(0);
    }

    console.log(`\n📊 Found ${allRestaurants.length} restaurant(s) with missing SEO content${destinationId ? ` (${destinationId} only)` : ''}`);
    console.log(`   Processing (most recent first)...\n`);

    const { destinations } = await import('../src/data/destinationsData.js');
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const restaurant of allRestaurants) {
      console.log(`\n📝 Processing: ${restaurant.name} (ID: ${restaurant.id})...`);
      console.log(`   Destination: ${restaurant.destination_id}`);

      let destinationName = restaurant.destination_id || 'Unknown';
      if (restaurant.destination_id) {
        const dest = Array.isArray(destinations) ? destinations.find(d => d.id === restaurant.destination_id) : null;
        if (dest) destinationName = dest.fullName || dest.name || restaurant.destination_id;
      }

      try {
        console.log(`   🤖 Calling Gemini 2.0 Flash-Lite API...`);
        const content = await generateSEOContent(restaurant, destinationName);

        if (!content.seoTitle || !content.metaDescription || !content.uniqueContent) {
          console.log(`   ⚠️  Incomplete content generated, skipping...`);
          skipCount++;
          continue;
        }

        console.log(`   💾 Saving to database...`);
        const updated = await updateRestaurantSEOContent(restaurant.id, content);

        if (updated) {
          console.log(`   ✅ Successfully updated!`);
          successCount++;
        } else {
          skipCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n\n✅ Processing complete!`);
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total: ${allRestaurants.length}\n`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
