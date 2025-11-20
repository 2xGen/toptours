/**
 * Bulk Populate Hardcoded Destination Tours
 * 
 * This script:
 * 1. Reads destinations from destinationsData.js
 * 2. For each destination, gets 6 categories
 * 3. Calls Viator API for each category (free text search)
 * 4. Takes first 4 results per category
 * 5. Extracts: productId, title, image
 * 6. Stores in Supabase hardcoded_destination_tours table
 * 
 * Usage: npm run populate-hardcoded-tours
 * Or: node scripts/bulk-populate-hardcoded-tours.js
 */

import { destinations } from '../src/data/destinationsData.js';
import { slugToViatorId } from '../src/data/viatorDestinationMap.js';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    const envFile = readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.warn('⚠️  Could not load .env.local, using process.env directly');
  }
}

loadEnvFile();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Viator API configuration
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
if (!VIATOR_API_KEY) {
  console.error('❌ Missing VIATOR_API_KEY in .env.local');
  process.exit(1);
}

const VIATOR_API_BASE = 'https://api.viator.com/partner';

// Rate limiting: delay between API calls (ms)
const API_DELAY = 2000; // 2 seconds between calls

/**
 * Search Viator API for tours in a category
 */
async function searchViatorTours(destinationName, categoryName, viatorDestinationId, limit = 4) {
  const searchTerm = `${destinationName} ${categoryName}`;
  
  const requestBody = {
    searchTerm: searchTerm.trim(),
    searchTypes: [
      {
        searchType: 'PRODUCTS',
        pagination: {
          start: 1,
          count: limit
        }
      }
    ],
    currency: 'USD'
  };

  // Optionally add destination filtering (but don't require it - free text search works better)
  // Only add if viatorDestinationId is available and we want stricter filtering
  // For now, let's rely on the search term to find relevant tours
  // if (viatorDestinationId) {
  //   requestBody.productFiltering = {
  //     destination: String(viatorDestinationId)
  //   };
  // }

  try {
    const response = await fetch(`${VIATOR_API_BASE}/search/freetext`, {
      method: 'POST',
      headers: {
        'exp-api-key': VIATOR_API_KEY,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  ⚠️  API Error (${response.status}):`, errorText.substring(0, 200));
      return [];
    }

    const data = await response.json();
    
    // Debug: log response structure if no products
    if (!data.products || !data.products.results || data.products.results.length === 0) {
      console.log(`  🔍 Search term: "${searchTerm}"`);
      console.log(`  📊 Response structure:`, {
        hasProducts: !!data.products,
        totalCount: data.products?.totalCount || 0,
        resultsLength: data.products?.results?.length || 0,
        responseKeys: Object.keys(data)
      });
    }
    
    const products = data.products?.results || [];
    
    return products.slice(0, limit).map(tour => {
      // Extract image URL - variants is an array, not an object
      let imageUrl = null;
      if (tour.images && tour.images.length > 0 && tour.images[0].variants) {
        const variants = tour.images[0].variants;
        // Try different array indices (variants[3] is typically the best quality)
        imageUrl = variants[5]?.url || 
                   variants[4]?.url || 
                   variants[3]?.url || 
                   variants[2]?.url || 
                   variants[1]?.url || 
                   variants[0]?.url ||
                   tour.images[0]?.url;
      } else if (tour.images && tour.images.length > 0) {
        // Fallback if variants structure is different
        imageUrl = tour.images[0]?.url;
      }
      
      // Don't use placeholder - skip tours without images or log warning
      if (!imageUrl) {
        console.warn(`  ⚠️  No image found for tour: ${tour.productId || tour.productCode} - ${tour.title || 'Unknown'}`);
        // Still return the tour, but with null image - you can filter these out if needed
      }

      return {
        productId: tour.productId || tour.productCode,
        title: tour.title || tour.productTitle || 'Tour',
        imageUrl: imageUrl || null // Store null instead of placeholder
      };
    }).filter(tour => tour.imageUrl !== null); // Filter out tours without images
  } catch (error) {
    console.error(`  ❌ Error fetching tours for "${categoryName}":`, error.message);
    return [];
  }
}

/**
 * Store tours in Supabase
 */
async function storeToursInSupabase(destination, category, tours) {
  if (tours.length === 0) {
    return { success: false, error: 'No tours to store' };
  }

  // Prepare data for upsert
  const toursData = tours.map((tour, index) => ({
    destination: destination,
    category: category,
    product_id: tour.productId,
    position: index + 1, // 1-4
    title: tour.title,
    image_url: tour.imageUrl
  }));

  try {
    // Delete existing tours for this destination/category combination
    const { error: deleteError } = await supabase
      .from('hardcoded_destination_tours')
      .delete()
      .eq('destination', destination)
      .eq('category', category);

    if (deleteError) {
      console.error(`  ⚠️  Error deleting old tours:`, deleteError.message);
    }

    // Insert new tours
    const { data, error } = await supabase
      .from('hardcoded_destination_tours')
      .insert(toursData)
      .select();

    if (error) {
      console.error(`  ❌ Error storing tours:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, count: data.length };
  } catch (error) {
    console.error(`  ❌ Exception storing tours:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Process a single destination
 */
async function processDestination(destination, index, total) {
  const destinationId = destination.id;
  const destinationName = destination.name;
  const viatorDestinationId = slugToViatorId[destinationId];

  if (!viatorDestinationId) {
    console.log(`📍 ${destinationName} (${index + 1}/${total}) - ⚠️  No Viator ID found, skipping`);
    return { success: false, skipped: true };
  }

  console.log(`📍 ${destinationName} (${index + 1}/${total})`);
  
  const categories = destination.tourCategories || [];
  let totalToursStored = 0;
  let categoriesProcessed = 0;

  for (const categoryObj of categories) {
    const categoryName = typeof categoryObj === 'string' ? categoryObj : categoryObj.name;
    
    if (!categoryName) continue;

    try {
      // Search Viator API
      const tours = await searchViatorTours(
        destinationName,
        categoryName,
        viatorDestinationId,
        4
      );

      if (tours.length > 0) {
        // Store in Supabase
        const result = await storeToursInSupabase(destinationId, categoryName, tours);
        
        if (result.success) {
          console.log(`  ✅ ${categoryName}: ${tours.length} tours stored`);
          totalToursStored += tours.length;
          categoriesProcessed++;
        } else {
          console.log(`  ⚠️  ${categoryName}: Failed to store (${result.error})`);
        }
      } else {
        console.log(`  ⚠️  ${categoryName}: No tours found`);
      }

      // Rate limiting: delay between API calls
      if (categoriesProcessed < categories.length) {
        await new Promise(resolve => setTimeout(resolve, API_DELAY));
      }
    } catch (error) {
      console.error(`  ❌ ${categoryName}: Error -`, error.message);
    }
  }

  console.log(`  ✅ ${destinationName}: ${totalToursStored} tours stored across ${categoriesProcessed} categories\n`);
  
  return { success: true, toursStored: totalToursStored, categoriesProcessed };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting bulk import of hardcoded destination tours...\n');

  // Sort destinations alphabetically
  const sortedDestinations = [...destinations].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  const total = sortedDestinations.length;
  console.log(`📊 Found ${total} destinations to process\n`);

  let totalToursStored = 0;
  let destinationsProcessed = 0;
  let destinationsSkipped = 0;

  for (let i = 0; i < sortedDestinations.length; i++) {
    const destination = sortedDestinations[i];
    const result = await processDestination(destination, i, total);

    if (result.success) {
      destinationsProcessed++;
      totalToursStored += result.toursStored || 0;
    } else if (result.skipped) {
      destinationsSkipped++;
    }

    // Small delay between destinations
    if (i < sortedDestinations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Destinations processed: ${destinationsProcessed}`);
  console.log(`⚠️  Destinations skipped: ${destinationsSkipped}`);
  console.log(`📦 Total tours stored: ${totalToursStored}`);
  console.log(`⏱️  Estimated time: ${Math.round((total * 6 * API_DELAY) / 1000 / 60)} minutes`);
  console.log('='.repeat(60));
  console.log('\n✅ Bulk import complete!');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

