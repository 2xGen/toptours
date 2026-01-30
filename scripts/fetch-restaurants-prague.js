/**
 * Fetch restaurants for Prague only (max 150).
 * Uses legacy Places API — counts against Starter plan.
 *
 * Run: node scripts/fetch-restaurants-prague.js
 * Requires: .env.local with GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import {
  searchRestaurantsMany,
  getPlaceDetails,
  formatRestaurantData,
} from '../src/lib/googlePlacesApi.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
dotenv.config({ path: resolve(root, '.env.local') });
dotenv.config({ path: resolve(root, '.env') });

const DESTINATION_ID = 'prague';
const MAX_RESTAURANTS = 150;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resolveSlugConflict(destinationId, formattedData) {
  const { data: existing } = await supabase
    .from('restaurants')
    .select('id')
    .eq('destination_id', destinationId)
    .eq('slug', formattedData.slug)
    .maybeSingle();
  if (!existing) return formattedData.slug;
  const baseSlug = formattedData.slug.replace(`-${destinationId}`, '');
  let counter = 1;
  let newSlug = `${baseSlug}-${counter}-${destinationId}`;
  let check = await supabase
    .from('restaurants')
    .select('id')
    .eq('destination_id', destinationId)
    .eq('slug', newSlug)
    .maybeSingle();
  while (check.data) {
    counter++;
    newSlug = `${baseSlug}-${counter}-${destinationId}`;
    check = await supabase
      .from('restaurants')
      .select('id')
      .eq('destination_id', destinationId)
      .eq('slug', newSlug)
      .maybeSingle();
  }
  return newSlug;
}

const QUERIES = [
  'restaurants in Prague',
  'best restaurants Prague',
  'restaurants Prague city center',
  'traditional Czech restaurants Prague',
];

async function main() {
  console.log(`\n📍 Prague — max ${MAX_RESTAURANTS} restaurants\n`);

  const places = await searchRestaurantsMany(QUERIES, null, MAX_RESTAURANTS);
  console.log(`   Search returned ${places.length} unique places.\n`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    try {
      const placeDetails = await getPlaceDetails(place.id);
      const formattedData = formatRestaurantData(placeDetails, DESTINATION_ID);

      const { data: existing } = await supabase
        .from('restaurants')
        .select('id')
        .eq('google_place_id', place.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('restaurants')
          .update({
            ...formattedData,
            data_updated_at: new Date().toISOString(),
          })
          .eq('google_place_id', place.id);
        updated++;
      } else {
        const finalSlug = await resolveSlugConflict(DESTINATION_ID, formattedData);
        if (finalSlug !== formattedData.slug) formattedData.slug = finalSlug;
        await supabase.from('restaurants').insert({ ...formattedData, is_active: true });
        created++;
      }

      if ((i + 1) % 10 === 0) {
        console.log(`   [${i + 1}/${places.length}] created: ${created}, updated: ${updated}`);
      }

      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`   Error ${place.displayName?.text || place.id}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Summary');
  console.log('='.repeat(50));
  console.log(`Places from search: ${places.length}`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
