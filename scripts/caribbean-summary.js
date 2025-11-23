import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const caribbeanDestinations = [
  'aruba', 'jamaica', 'curacao', 'nassau', 'punta-cana',
  'st-lucia', 'barbados', 'santo-domingo', 'exuma', 'puerto-rico',
  'turks-and-caicos', 'grenada', 'st-martin', 'bonaire', 'cayman-islands',
  'antigua-and-barbuda', 'trinidad-and-tobago', 'british-virgin-islands',
  'st-kitts-and-nevis', 'martinique', 'guadeloupe'
];

async function getSummary() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('destination_id')
    .in('destination_id', caribbeanDestinations)
    .eq('is_active', true);

  if (error) {
    console.error('Error:', error);
    return;
  }

  const counts = {};
  data.forEach(r => {
    counts[r.destination_id] = (counts[r.destination_id] || 0) + 1;
  });

  console.log('🌴 Caribbean Restaurants Summary:\n');
  caribbeanDestinations.forEach(dest => {
    const count = counts[dest] || 0;
    console.log(`  ${dest.padEnd(25)} ${count.toString().padStart(3)} restaurants`);
  });

  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Total Caribbean Restaurants: ${total}`);
  console.log(`Destinations Completed: ${caribbeanDestinations.length}/21`);
}

getSummary();

