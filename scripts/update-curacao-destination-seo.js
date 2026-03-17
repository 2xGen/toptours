/**
 * Update Curaçao destination hero and meta SEO in v3_landing_destinations.
 *
 * Usage (from project root):
 *   node scripts/update-curacao-destination-seo.js
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

const CURACAO_SEO = {
  meta_title: 'Curaçao Tours & Activities: Snorkeling, Catamaran, Beach & More | TopTours.ai',
  meta_description:
    'Book snorkeling tours, catamaran cruises, beach trips, and water sports in Curaçao. Compare top-rated Caribbean experiences and reserve with free cancellation.',
  hero_title: 'Curaçao Tours & Activities: Top-Rated Experiences',
  hero_subtitle:
    'Book snorkeling, catamaran cruises, beach tours, and water sports. Compare top-rated Curaçao experiences and reserve with free cancellation.',
};

async function main() {
  const { data, error } = await supabase
    .from('v3_landing_destinations')
    .update(CURACAO_SEO)
    .eq('slug', 'curacao')
    .select('slug, meta_title, hero_title')
    .single();

  if (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }
  console.log('Curaçao destination SEO updated.');
  console.log('   meta_title:', data?.meta_title);
  console.log('   hero_title:', data?.hero_title);
}

main();
