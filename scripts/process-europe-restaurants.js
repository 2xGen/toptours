/**
 * Batch process restaurants for all Europe destinations
 * Fetches restaurants and generates SEO content
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { destinations } from '../src/data/destinationsData.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

// Get all Europe destinations
const europeDestinations = destinations
  .filter(d => d.category === 'Europe')
  .map(d => ({
    id: d.id,
    name: d.name,
    fullName: d.fullName,
    country: d.country,
    coordinates: d.coordinates || null, // Some destinations might have coordinates
  }));

async function fetchRestaurantsForDestination(dest) {
  console.log(`\n📍 Processing: ${dest.fullName} (${dest.id})...`);
  
  // Try to get coordinates from destination data or use a search query
  const query = `restaurants in ${dest.fullName}`;
  let coords = dest.coordinates;
  
  // If no coordinates, we'll use the destination name in the search
  if (!coords) {
    // For major cities, we can try common coordinates, but it's better to let Google Places API handle it
    coords = null;
  }
  
  try {
    // Fetch restaurants
    const fetchCmd = coords 
      ? `node scripts/fetch-restaurants-from-google-places.js "${dest.id}" "${query}" "${coords}"`
      : `node scripts/fetch-restaurants-from-google-places.js "${dest.id}" "${query}"`;
    
    console.log(`   🔍 Fetching restaurants...`);
    const { stdout: fetchOutput, stderr: fetchError } = await execAsync(fetchCmd);
    
    if (fetchError && !fetchError.includes('Already exists')) {
      console.error(`   ❌ Error fetching: ${fetchError.substring(0, 200)}`);
      return false;
    }
    
    console.log(`   ✅ Restaurants fetched`);
    
    // Generate SEO content
    console.log(`   📝 Generating SEO content...`);
    const seoCmd = `node scripts/generate-restaurant-seo-content.js "${dest.id}"`;
    const { stdout: seoOutput, stderr: seoError } = await execAsync(seoCmd);
    
    if (seoError && !seoError.includes('Already has SEO content')) {
      console.error(`   ⚠️  SEO generation had issues: ${seoError.substring(0, 200)}`);
      // Continue anyway - some restaurants might have succeeded
    } else {
      console.log(`   ✅ SEO content generated`);
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error processing ${dest.fullName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🌍 Processing Europe Destinations`);
  console.log(`   Total: ${europeDestinations.length} destinations`);
  console.log(`${'='.repeat(60)}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < europeDestinations.length; i++) {
    const dest = europeDestinations[i];
    const success = await fetchRestaurantsForDestination(dest);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Rate limiting between destinations
    if (i < europeDestinations.length - 1) {
      console.log(`\n⏳ Waiting 3 seconds before next destination...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 Europe Processing Complete!`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);

