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
  
  // Use all unique destination_ids from DB (supports 182 curated + 247 featured after batch)
  const curatedDestinationIds = destinations.map(d => d.id);
  const sorted = Array.from(destinationIdsWithRestaurants).sort();
  
  console.log(`📊 Results:`);
  console.log(`   Destinations with restaurants in DB: ${destinationIdsWithRestaurants.size}`);
  console.log(`   Curated destinations (destinationsData.js): ${curatedDestinationIds.length}`);
  console.log(`   Curated found in DB: ${curatedDestinationIds.filter(id => destinationIdsWithRestaurants.has(id)).length}`);
  console.log('');
  
  // Generate JavaScript code for the Set
  const jsCode = `// Auto-generated list of destination IDs that have restaurants in DB
// Generated: ${new Date().toISOString()}
// Total: ${sorted.length} destinations
// 
// This avoids DB lookups during metadata generation. Re-run this script
// after adding restaurants (e.g. fetch-restaurants-all-featured-destinations.js).

export const DESTINATIONS_WITH_RESTAURANTS = new Set([
${sorted.map(id => `  '${id}',`).join('\n')}
]);
`;
  
  // Write to file
  const outputPath = resolve(__dirname, '../src/data/destinationsWithRestaurants.js');
  writeFileSync(outputPath, jsCode, 'utf8');
  
  console.log(`✅ Generated static list: ${outputPath}`);
  console.log(`   Contains ${sorted.length} destination IDs\n`);
  
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
