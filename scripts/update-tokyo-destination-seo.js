/**
 * Update Tokyo destination hero and meta SEO in v3_landing_destinations.
 *
 * Usage (from project root):
 *   node scripts/update-tokyo-destination-seo.js
 *
 * Env: .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TOKYO_SEO = {
  meta_title: 'Tokyo Tours & Experiences: Walking, Food, Day Trips & More | TopTours.ai',
  meta_description:
    'Book Tokyo walking tours, food experiences, day trips to Mt. Fuji and Nikko, cultural activities, and photography tours. Compare top-rated Tokyo experiences and reserve with free cancellation.',
  hero_title: 'Tokyo Tours & Experiences: Top-Rated Activities',
  hero_subtitle:
    'Book walking tours in Asakusa and Shibuya, food tours, day trips, and cultural experiences. Compare top-rated Tokyo tours and reserve with free cancellation.',
};

async function main() {
  const { data, error } = await supabase
    .from('v3_landing_destinations')
    .update(TOKYO_SEO)
    .eq('slug', 'tokyo')
    .select('slug, meta_title, hero_title')
    .single();

  if (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
  console.log('✅ Tokyo destination SEO updated.');
  console.log('   meta_title:', data?.meta_title);
  console.log('   hero_title:', data?.hero_title);
}

main();
