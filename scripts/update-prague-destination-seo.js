/**
 * Update Prague destination hero and meta SEO in v3_landing_destinations.
 * Run this to improve the explore/prague landing copy without re-running the full import.
 *
 * Usage (from project root):
 *   node scripts/update-prague-destination-seo.js
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

const PRAGUE_SEO = {
  meta_title: 'Prague Tours & Excursions: Old Town Walks, Castle Tours, Day Trips & More | TopTours.ai',
  meta_description:
    'Book Prague walking tours, Old Town & Jewish Quarter tours, Prague Castle visits, river cruises, food and beer tastings, and day trips. Compare top-rated excursions and reserve with free cancellation.',
  hero_title: 'Prague Tours & Excursions: Top-Rated Activities',
  hero_subtitle:
    'Book Old Town & Jewish Quarter walks, Prague Castle tours, river cruises, beer tastings, and day trips. Compare top-rated Prague experiences and reserve with free cancellation.',
};

async function main() {
  const { data, error } = await supabase
    .from('v3_landing_destinations')
    .update(PRAGUE_SEO)
    .eq('slug', 'prague')
    .select('slug, meta_title, hero_title')
    .single();

  if (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
  console.log('✅ Prague destination SEO updated.');
  console.log('   meta_title:', data?.meta_title);
  console.log('   hero_title:', data?.hero_title);
}

main();

