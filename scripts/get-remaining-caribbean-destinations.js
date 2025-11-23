/**
 * Get remaining Caribbean destinations that don't have restaurants yet
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { destinations } from '../src/data/destinationsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Get all Caribbean destinations
  const caribbeanDests = destinations.filter(d => d.category === 'Caribbean');
  
  // Get destinations that have restaurants
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('destination_id')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  const destsWithRestaurants = new Set((restaurants || []).map(r => r.destination_id));
  
  // Find Caribbean destinations without restaurants
  const remaining = caribbeanDests.filter(d => !destsWithRestaurants.has(d.id));
  
  console.log(`\n🌴 Remaining Caribbean Destinations (${remaining.length}):\n`);
  remaining.forEach((dest, idx) => {
    console.log(`${idx + 1}. ${dest.fullName} (${dest.id})`);
  });
  
  console.log(`\n✅ Caribbean destinations with restaurants: ${caribbeanDests.length - remaining.length}`);
  console.log(`⏳ Remaining: ${remaining.length}\n`);
  
  return remaining.map(d => d.id);
}

main().catch(console.error);

