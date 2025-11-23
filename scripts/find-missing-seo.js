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

async function findMissingSEO() {
  // Find restaurants missing any SEO fields
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, destination_id, seo_title, meta_description, unique_content')
    .eq('is_active', true)
    .or('seo_title.is.null,meta_description.is.null,unique_content.is.null');

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('✅ All restaurants have SEO content!');
    return;
  }

  console.log(`\n⚠️  Found ${data.length} restaurant(s) missing SEO content:\n`);
  
  // Group by destination
  const byDestination = {};
  data.forEach(r => {
    if (!byDestination[r.destination_id]) {
      byDestination[r.destination_id] = [];
    }
    byDestination[r.destination_id].push(r);
  });

  Object.entries(byDestination).forEach(([dest, restaurants]) => {
    console.log(`\n📍 ${dest} (${restaurants.length} restaurant(s)):`);
    restaurants.forEach(r => {
      const missing = [];
      if (!r.seo_title) missing.push('title');
      if (!r.meta_description) missing.push('meta');
      if (!r.unique_content) missing.push('content');
      console.log(`  ID ${r.id.toString().padStart(3)}: ${r.name.padEnd(40)} Missing: ${missing.join(', ')}`);
    });
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Total: ${data.length} restaurant(s) need SEO content`);
  console.log(`\nRestaurant IDs: ${data.map(r => r.id).join(', ')}`);
}

findMissingSEO();

