/**
 * Get destinations by region that don't have restaurants yet
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
  // Get all destinations grouped by category
  const byCategory = {};
  destinations.forEach(dest => {
    const cat = dest.category || 'Other';
    if (!byCategory[cat]) {
      byCategory[cat] = [];
    }
    byCategory[cat].push(dest);
  });
  
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
  
  console.log('\n📊 Destinations Needing Restaurants by Region:\n');
  
  const categories = ['Europe', 'North America', 'South America', 'Asia-Pacific', 'Africa', 'Middle East', 'Caribbean'];
  
  for (const category of categories) {
    if (!byCategory[category]) continue;
    
    const categoryDests = byCategory[category];
    const remaining = categoryDests.filter(d => !destsWithRestaurants.has(d.id));
    
    if (remaining.length > 0) {
      console.log(`\n🌍 ${category} (${remaining.length} remaining):`);
      remaining.slice(0, 10).forEach((dest, idx) => {
        console.log(`   ${idx + 1}. ${dest.fullName} (${dest.id})`);
      });
      if (remaining.length > 10) {
        console.log(`   ... and ${remaining.length - 10} more`);
      }
    } else {
      console.log(`\n✅ ${category}: Complete!`);
    }
  }
  
  // Summary
  const totalRemaining = destinations.filter(d => !destsWithRestaurants.has(d.id)).length;
  const totalWithRestaurants = destsWithRestaurants.size;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📈 Summary:`);
  console.log(`   ✅ Destinations with restaurants: ${totalWithRestaurants}`);
  console.log(`   ⏳ Destinations needing restaurants: ${totalRemaining}`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);

