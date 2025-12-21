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

async function checkRestaurantCuisines(destinationId, restaurantNames) {
  console.log(`🔍 Checking cuisine data for restaurants in ${destinationId}...\n`);
  
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisines')
    .eq('destination_id', destinationId)
    .eq('is_active', true)
    .in('name', restaurantNames);
  
  if (error) {
    console.error('❌ Error fetching restaurants:', error);
    return;
  }
  
  if (!restaurants || restaurants.length === 0) {
    console.log('❌ No restaurants found');
    return;
  }
  
  console.log(`Found ${restaurants.length} restaurants:\n`);
  restaurants.forEach(r => {
    const cuisines = Array.isArray(r.cuisines) ? r.cuisines : [];
    const validCuisines = cuisines.filter(c => c && 
      c.toLowerCase() !== 'restaurant' && 
      c.toLowerCase() !== 'food' &&
      c.trim().length > 0);
    
    console.log(`${r.name}:`);
    console.log(`  Raw cuisines: ${JSON.stringify(cuisines)}`);
    console.log(`  Valid cuisines: ${JSON.stringify(validCuisines)}`);
    console.log(`  Should show: ${validCuisines.length > 0 ? validCuisines[0] : 'Restaurant (fallback)'}`);
    console.log(`  Secondary badge: ${validCuisines.length > 1 ? validCuisines.slice(0, 2).join(' · ') : 'None (only 1 cuisine)'}`);
    console.log('');
  });
}

// Check specific restaurants mentioned by user
const restaurantNames = [
  'Arcadia',
  'Boy\'N\'Cow',
  'Uma Garden Seminyak',
  'Soul on the Beach'
];

checkRestaurantCuisines('bali', restaurantNames)
  .then(() => {
    console.log('✅ Check complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

