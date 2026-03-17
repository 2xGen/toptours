/**
 * Update Aruba destination hero and meta SEO in v3_landing_destinations.
 * Run this to improve the explore/aruba landing copy without re-running the full import.
 *
 * Usage (from project root):
 *   node scripts/update-aruba-destination-seo.js
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

const ARUBA_SEO = {
  meta_title: 'Aruba Tours & Excursions: Catamaran Cruises, ATV, Snorkeling & More | TopTours.ai',
  meta_description: 'Book catamaran cruises, ATV and jeep tours, snorkeling, sunset and dinner sails, and water sports in Aruba. Compare top-rated excursions and reserve with free cancellation.',
  hero_title: 'Aruba Tours & Excursions: Top-Rated Caribbean Activities',
  hero_subtitle: 'Book catamaran cruises, ATV and jeep tours, snorkeling, sunset sails, and water sports. Compare top-rated Aruba excursions and reserve with free cancellation.',
};

async function main() {
  const { data, error } = await supabase
    .from('v3_landing_destinations')
    .update(ARUBA_SEO)
    .eq('slug', 'aruba')
    .select('slug, meta_title, hero_title')
    .single();

  if (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
  console.log('✅ Aruba destination SEO updated.');
  console.log('   meta_title:', data?.meta_title);
  console.log('   hero_title:', data?.hero_title);
}

main();
