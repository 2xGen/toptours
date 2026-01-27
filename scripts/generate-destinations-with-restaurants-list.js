/**
 * Generate static list of all destination IDs that have restaurants
 * This avoids DB lookups during metadata generation
 * 
 * Run: node scripts/generate-destinations-with-restaurants-list.js
 */

import { createClient } from '@supabase/supabase-js';
import { destinations } from '../src/data/destinationsData.js';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Finding all destinations with restaurants...\n');
  
  // Get all unique destination_ids from restaurants table (with pagination)
  const destinationIdsWithRestaurants = new Set();
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('destination_id')
      .eq('is_active', true)
      .range(from, from + pageSize - 1);
    
    if (error) {
      console.error('❌ Error fetching restaurants:', error);
      process.exit(1);
    }
    
    if (restaurants && restaurants.length > 0) {
      restaurants.forEach(r => {
        if (r.destination_id) {
          destinationIdsWithRestaurants.add(r.destination_id);
        }
      });
    }
    
    hasMore = restaurants && restaurants.length === pageSize;
    from += pageSize;
  }
  
  // Get all 182 curated destinations
  // User confirmed: ALL 182 curated destinations have restaurants
  const curatedDestinationIds = destinations.map(d => d.id);
  
  console.log(`📊 Results:`);
  console.log(`   Total destinations with restaurants in DB: ${destinationIdsWithRestaurants.size}`);
  console.log(`   Curated destinations (182): ${curatedDestinationIds.length}`);
  console.log(`   Including ALL 182 curated destinations in static list\n`);
  
  // Verify: Check how many of the 182 are actually in the DB
  const curatedInDB = curatedDestinationIds.filter(id => destinationIdsWithRestaurants.has(id));
  console.log(`   Curated destinations found in DB: ${curatedInDB.length}`);
  if (curatedInDB.length < 182) {
    console.log(`   Note: ${182 - curatedInDB.length} curated destinations may have restaurants in static files or will be added soon`);
  }
  console.log('');
  
  // Use ALL 182 curated destinations (as user confirmed)
  const curatedWithRestaurants = curatedDestinationIds;
  
  // Sort alphabetically for easy reading
  const sorted = curatedWithRestaurants.sort();
  
  // Generate JavaScript code for the Set
  const jsCode = `// Auto-generated list of all curated destinations (182) that have restaurants
// Generated: ${new Date().toISOString()}
// Total: ${curatedWithRestaurants.length} destinations
// 
// This avoids DB lookups during metadata generation for these destinations
// Update this file when new restaurants are added to curated destinations

export const DESTINATIONS_WITH_RESTAURANTS = new Set([
${sorted.map(id => `  '${id}',`).join('\n')}
]);
`;
  
  // Write to file
  const outputPath = resolve(__dirname, '../src/data/destinationsWithRestaurants.js');
  writeFileSync(outputPath, jsCode, 'utf8');
  
  console.log(`✅ Generated static list: ${outputPath}`);
  console.log(`   Contains ${curatedWithRestaurants.length} destination IDs\n`);
  
  // Show first 10 as preview
  console.log('📋 Preview (first 10):');
  sorted.slice(0, 10).forEach((id, idx) => {
    const dest = destinations.find(d => d.id === id);
    console.log(`   ${idx + 1}. ${dest?.fullName || id} (${id})`);
  });
  if (sorted.length > 10) {
    console.log(`   ... and ${sorted.length - 10} more\n`);
  }
}

main().catch(console.error);
