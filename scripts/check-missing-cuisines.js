import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Generic cuisine types to filter out
const GENERIC_CUISINES = ['Restaurant', 'Food', 'Dining'];

function hasGenericCuisine(cuisines) {
  if (!cuisines || !Array.isArray(cuisines)) return true;
  if (cuisines.length === 0) return true;
  
  const normalized = cuisines.map(c => c?.toLowerCase().trim()).filter(Boolean);
  return normalized.some(c => GENERIC_CUISINES.some(g => c === g.toLowerCase()));
}

async function checkMissingCuisines(destinationId = null) {
  console.log('🔍 Checking restaurants with missing or generic cuisine types...\n');
  
  let query = supabase
    .from('restaurants')
    .select('id, name, destination_id, cuisines')
    .eq('is_active', true);
  
  if (destinationId) {
    query = query.eq('destination_id', destinationId);
  }
  
  const { data: restaurants, error } = await query;
  
  if (error) {
    console.error('❌ Error fetching restaurants:', error);
    return;
  }
  
  if (!restaurants || restaurants.length === 0) {
    console.log('✅ No restaurants found');
    return;
  }
  
  const missingCuisines = restaurants.filter(r => hasGenericCuisine(r.cuisines));
  
  console.log(`📊 Total restaurants: ${restaurants.length}`);
  console.log(`⚠️  Restaurants with missing/generic cuisines: ${missingCuisines.length}\n`);
  
  if (missingCuisines.length > 0) {
    console.log('Restaurants needing cuisine extraction:');
    console.log('='.repeat(80));
    
    // Group by destination
    const byDestination = {};
    missingCuisines.forEach(r => {
      const dest = r.destination_id || 'unknown';
      if (!byDestination[dest]) {
        byDestination[dest] = [];
      }
      byDestination[dest].push(r);
    });
    
    // Show top 20 restaurants
    const top20 = missingCuisines.slice(0, 20);
    top20.forEach((r, index) => {
      const cuisines = Array.isArray(r.cuisines) ? r.cuisines.join(', ') : 'null/empty';
      console.log(`${index + 1}. [${r.destination_id}] ${r.name}`);
      console.log(`   Current cuisines: ${cuisines}`);
    });
    
    if (missingCuisines.length > 20) {
      console.log(`\n... and ${missingCuisines.length - 20} more restaurants`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n📈 Summary by destination:`);
    Object.entries(byDestination)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .forEach(([dest, restaurants]) => {
        console.log(`  ${dest}: ${restaurants.length} restaurants`);
      });
  } else {
    console.log('✅ All restaurants have valid cuisine types!');
  }
}

// Get destination ID from command line argument
const destinationId = process.argv[2] || null;

checkMissingCuisines(destinationId)
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

