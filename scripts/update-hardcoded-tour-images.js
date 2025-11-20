/**
 * Update Image URLs for Hardcoded Tours
 * 
 * This script:
 * 1. Fetches all tours from hardcoded_destination_tours table
 * 2. For each tour, calls Viator API to get the image
 * 3. Updates only the image_url field in the database
 * 
 * Much faster than re-importing everything!
 * 
 * Usage: npm run update-tour-images
 * Or: node scripts/update-hardcoded-tour-images.js
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ (for native fetch support)');
  console.error('Current Node.js version:', process.version);
  process.exit(1);
}

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
const API_DELAY = 1500; // 1.5 seconds between calls

/**
 * Get tour image from Viator API
 */
async function getTourImage(productId) {
  try {
    const response = await fetch(`${VIATOR_API_BASE}/products/${productId}?currency=USD`, {
      method: 'GET',
      headers: {
        'exp-api-key': VIATOR_API_KEY,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`  ⚠️  Tour ${productId} not found in Viator`);
        return null;
      }
      const errorText = await response.text();
      console.error(`  ⚠️  API Error (${response.status}):`, errorText.substring(0, 200));
      return null;
    }

    const tour = await response.json();
    
    // Extract image URL - variants is an array
    let imageUrl = null;
    if (tour.images && tour.images.length > 0) {
      const firstImage = tour.images[0];
      
      // Check if variants array exists
      if (firstImage.variants && Array.isArray(firstImage.variants)) {
        const variants = firstImage.variants;
        // Try different array indices (variants[3] is typically the best quality for cards)
        // Try higher indices first (better quality), then fall back
        for (let i = Math.min(5, variants.length - 1); i >= 0; i--) {
          if (variants[i]?.url) {
            imageUrl = variants[i].url;
            break;
          }
        }
      } else if (firstImage.url) {
        // Fallback to direct URL if no variants
        imageUrl = firstImage.url;
      }
    }

    return imageUrl;
  } catch (error) {
    console.error(`  ❌ Error fetching image for ${productId}:`, error.message);
    return null;
  }
}

/**
 * Update image URL for a single tour
 */
async function updateTourImage(tourId, productId, imageUrl) {
  if (!imageUrl) {
    return { success: false, error: 'No image URL provided' };
  }

  try {
    const { error } = await supabase
      .from('hardcoded_destination_tours')
      .update({ 
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', tourId);

    if (error) {
      console.error(`  ❌ Error updating image for ${productId}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error(`  ❌ Exception updating image for ${productId}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all tours with pagination (Supabase limit is 1000 rows per query)
 */
async function fetchAllTours() {
  const allTours = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  console.log('📥 Fetching all tours from database (with pagination)...\n');

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data: tours, error: fetchError } = await supabase
      .from('hardcoded_destination_tours')
      .select('id, product_id, title, image_url, destination, category')
      .order('destination')
      .order('category')
      .order('position')
      .range(from, to);

    if (fetchError) {
      console.error(`❌ Error fetching tours (page ${page + 1}):`, fetchError);
      throw fetchError;
    }

    if (!tours || tours.length === 0) {
      hasMore = false;
    } else {
      allTours.push(...tours);
      console.log(`   ✓ Fetched page ${page + 1}: ${tours.length} tours (total: ${allTours.length})`);
      
      // If we got less than pageSize, we've reached the end
      if (tours.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }

  return allTours;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting image URL update for hardcoded tours...\n');

  // Fetch all tours from database (with pagination)
  let tours;
  try {
    tours = await fetchAllTours();
  } catch (error) {
    console.error('❌ Error fetching tours from database:', error);
    process.exit(1);
  }

  if (!tours || tours.length === 0) {
    console.log('⚠️  No tours found in database. Run populate-hardcoded-tours first.');
    process.exit(0);
  }

  console.log(`\n📊 Found ${tours.length} total tours in database\n`);

  // Filter tours that need images (null or placeholder)
  const toursNeedingImages = tours.filter(tour => {
    if (!tour.image_url) return true;
    const url = tour.image_url.toLowerCase();
    return url.includes('placeholder') || 
           url.includes('via.placeholder') ||
           url === 'https://via.placeholder.com/400x300?text=tour+image';
  });

  console.log(`🖼️  ${toursNeedingImages.length} tours need image updates (out of ${tours.length} total)\n`);
  
  if (toursNeedingImages.length > 0) {
    console.log(`📋 Sample of tours needing updates:`);
    toursNeedingImages.slice(0, 5).forEach(tour => {
      console.log(`   - ${tour.destination} / ${tour.category}: ${tour.title.substring(0, 40)}...`);
    });
    if (toursNeedingImages.length > 5) {
      console.log(`   ... and ${toursNeedingImages.length - 5} more\n`);
    } else {
      console.log('');
    }
  }

  if (toursNeedingImages.length === 0) {
    console.log('✅ All tours already have images!');
    process.exit(0);
  }

  // Group tours by product_id to reuse images
  const toursByProductId = {};
  toursNeedingImages.forEach(tour => {
    if (!toursByProductId[tour.product_id]) {
      toursByProductId[tour.product_id] = [];
    }
    toursByProductId[tour.product_id].push(tour);
  });

  const uniqueProductIds = Object.keys(toursByProductId);
  console.log(`🔄 Found ${uniqueProductIds.length} unique product IDs (${toursNeedingImages.length} total tours)`);
  console.log(`   This will save ${toursNeedingImages.length - uniqueProductIds.length} API calls!\n`);

  let updated = 0;
  let failed = 0;
  let skipped = 0;
  let apiCallsSaved = 0;

  // Process unique product IDs
  for (let i = 0; i < uniqueProductIds.length; i++) {
    const productId = uniqueProductIds[i];
    const toursWithThisProduct = toursByProductId[productId];
    const progress = `[${i + 1}/${uniqueProductIds.length}]`;
    
    console.log(`${progress} Product ${productId} (${toursWithThisProduct.length} tour${toursWithThisProduct.length > 1 ? 's' : ''}):`);
    console.log(`   ${toursWithThisProduct[0].destination} - ${toursWithThisProduct[0].category}: ${toursWithThisProduct[0].title.substring(0, 50)}...`);

    // Get image from Viator API (only once per product_id)
    const imageUrl = await getTourImage(productId);

    if (imageUrl) {
      // Update all tours with this product_id
      let successCount = 0;
      for (const tour of toursWithThisProduct) {
        const result = await updateTourImage(tour.id, tour.product_id, imageUrl);
        if (result.success) {
          successCount++;
          updated++;
        } else {
          console.log(`  ❌ Failed to update tour ${tour.id}: ${result.error}`);
          failed++;
        }
      }
      if (successCount > 0) {
        console.log(`  ✅ Image updated for ${successCount} tour${successCount > 1 ? 's' : ''}`);
        if (toursWithThisProduct.length > 1) {
          apiCallsSaved += toursWithThisProduct.length - 1;
        }
      }
    } else {
      console.log(`  ⚠️  No image found, skipping ${toursWithThisProduct.length} tour${toursWithThisProduct.length > 1 ? 's' : ''}`);
      skipped += toursWithThisProduct.length;
    }

    // Rate limiting: delay between API calls
    if (i < uniqueProductIds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, API_DELAY));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Images updated: ${updated}`);
  console.log(`⚠️  Skipped (no image): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🚀 API calls saved: ${apiCallsSaved} (by reusing images for duplicate product IDs)`);
  console.log(`⏱️  Actual API calls made: ${uniqueProductIds.length}`);
  console.log(`⏱️  Estimated time: ${Math.round((uniqueProductIds.length * API_DELAY) / 1000 / 60)} minutes`);
  console.log('='.repeat(60));
  console.log('\n✅ Image update complete!');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

