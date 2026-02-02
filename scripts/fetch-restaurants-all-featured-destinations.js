/**
 * Batch fetch restaurants from Google Places API for ALL featured destinations (~247).
 * Uses multiple search queries + pagination to get 100+ restaurants per destination (configurable).
 *
 * Usage:
 *   node scripts/fetch-restaurants-all-featured-destinations.js                    # all 247, 100 per destination
 *   node scripts/fetch-restaurants-all-featured-destinations.js --only-new         # only destinations with 0 restaurants
 *   node scripts/fetch-restaurants-all-featured-destinations.js --batch-65         # 65 destinations with per-destination caps (restaurant-caps-65-destinations.json)
 *   node scripts/fetch-restaurants-all-featured-destinations.js --batch-curated   # 182 curated destinations, max 150 each (restaurant-caps-180-destinations.json)
 *   node scripts/fetch-restaurants-all-featured-destinations.js --max-per-destination 200   # ~200 per dest (use more of 50k calls)
 *   node scripts/fetch-restaurants-all-featured-destinations.js --destination aruba --max-per-destination 200   # Aruba only, 200 restaurants
 *   node scripts/fetch-restaurants-all-featured-destinations.js --skip-existing   # only fetch Place Details for places not yet in DB (saves API calls on re-runs)
 *   node scripts/fetch-restaurants-all-featured-destinations.js --test             # one destination only
 *   node scripts/fetch-restaurants-all-featured-destinations.js --limit 5          # first 5 destinations
 *
 * Requires: .env.local with GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { destinations } from '../src/data/destinationsData.js';
import { searchRestaurantsMany, getPlaceDetails, formatRestaurantData } from '../src/lib/googlePlacesApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

/** Per-destination caps for the 65-destination batch (loaded when --batch-65). */
function loadBatch65Caps() {
  try {
    const raw = readFileSync(resolve(__dirname, 'restaurant-caps-65-destinations.json'), 'utf8');
    const caps = JSON.parse(raw);
    return caps && typeof caps === 'object' ? caps : {};
  } catch {
    return {};
  }
}

/** Per-destination caps for curated 182 destinations (loaded when --batch-curated). */
function loadBatchCuratedCaps() {
  try {
    const raw = readFileSync(resolve(__dirname, 'restaurant-caps-180-destinations.json'), 'utf8');
    const caps = JSON.parse(raw);
    return caps && typeof caps === 'object' ? caps : {};
  } catch {
    return {};
  }
}

dotenv.config({ path: resolve(__dirname, '..', '.env.local') });
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GOOGLE_PLACES_API_KEY) {
  console.error('❌ Missing GOOGLE_PLACES_API_KEY in .env.local');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

// Google Places API is disabled — no API calls are made.
console.error('Google Places API is disabled. This script does not make any Google Places API calls.');
process.exit(1);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function generateSlug(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Same as generate-airport-transfers-content.js: curated + generated with guides + image */
function getFeaturedDestinations() {
  let generatedFullContent, seoContent, classified;
  try {
    generatedFullContent = JSON.parse(
      readFileSync(resolve(root, 'generated-destination-full-content.json'), 'utf8')
    );
  } catch (e) {
    generatedFullContent = {};
  }
  try {
    seoContent = JSON.parse(
      readFileSync(resolve(root, 'generated-destination-seo-content.json'), 'utf8')
    );
  } catch (e) {
    seoContent = {};
  }
  try {
    classified = JSON.parse(
      readFileSync(resolve(root, 'src/data/viatorDestinationsClassified.json'), 'utf8')
    );
  } catch (e) {
    classified = [];
  }

  const getSeo = (slug) => seoContent[slug] || null;
  const bySlug = new Map();
  for (const cd of classified) {
    const slug = generateSlug(cd.destinationName || cd.name || '');
    if (!slug) continue;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(cd);
  }

  const regularIds = new Set(destinations.map((d) => d.id));
  const generated = Object.keys(generatedFullContent || {})
    .filter((slug) => {
      if (regularIds.has(slug)) return false;
      const c = generatedFullContent[slug];
      if (!c || !c.tourCategories) return false;
      const hasGuides = c.tourCategories.some((cat) => typeof cat === 'object' && cat.hasGuide === true);
      if (!hasGuides) return false;
      const seo = getSeo(slug);
      return !!(c.imageUrl || seo?.imageUrl || seo?.ogImage);
    })
    .map((slug) => {
      const c = generatedFullContent[slug];
      const seo = getSeo(slug);
      const cls = bySlug.get(slug)?.[0];
      return {
        id: slug,
        name: c.destinationName || slug,
        fullName: c.destinationName || slug,
        country: cls?.country || c.country || null,
        category: cls?.region || c.region || null,
        imageUrl: c.imageUrl || seo?.imageUrl || seo?.ogImage || null,
      };
    });

  const curated = destinations.map((d) => ({
    id: d.id,
    name: d.name,
    fullName: d.fullName || d.name,
    country: d.country || null,
    category: d.category || null,
    imageUrl: d.imageUrl || null,
  }));

  return [...curated, ...generated];
}

/** Get set of destination_ids that have at least one restaurant in DB */
async function getDestinationIdsWithRestaurants() {
  const ids = new Set();
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;
  while (hasMore) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('destination_id')
      .eq('is_active', true)
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    if (data?.length) {
      data.forEach((r) => r.destination_id && ids.add(r.destination_id));
    }
    hasMore = data && data.length === pageSize;
    from += pageSize;
  }
  return ids;
}

/** Resolve slug conflict for same destination */
async function resolveSlugConflict(supabase, destinationId, formattedData) {
  const { data: slugConflict } = await supabase
    .from('restaurants')
    .select('id')
    .eq('destination_id', destinationId)
    .eq('slug', formattedData.slug)
    .single();

  if (!slugConflict) return formattedData.slug;

  const baseSlug = formattedData.slug.replace(`-${destinationId}`, '');
  let counter = 1;
  let newSlug = `${baseSlug}-${counter}-${destinationId}`;
  let check = await supabase
    .from('restaurants')
    .select('id')
    .eq('destination_id', destinationId)
    .eq('slug', newSlug)
    .single();

  while (check.data) {
    counter++;
    newSlug = `${baseSlug}-${counter}-${destinationId}`;
    check = await supabase
      .from('restaurants')
      .select('id')
      .eq('destination_id', destinationId)
      .eq('slug', newSlug)
      .single();
  }
  return newSlug;
}

/** Query variants per destination (API max 60 per query; more variants = more unique places). */
const QUERY_VARIANTS = (name) => [
  `restaurants in ${name}`,
  `best restaurants ${name}`,
  `top rated restaurants ${name}`,
  `dining in ${name}`,
  `where to eat ${name}`,
  `seafood ${name}`,
  `breakfast ${name}`,
  `lunch restaurants ${name}`,
  `dinner ${name}`,
  `beach restaurants ${name}`,
  `cafes ${name}`,
  `Italian restaurant ${name}`,
  `Mexican restaurant ${name}`,
  `Asian restaurant ${name}`,
  `pizza ${name}`,
  `sushi ${name}`,
  `brunch ${name}`,
  `eateries ${name}`,
];

/** Extra area-based queries for specific destinations (more unique results). */
const AREA_QUERIES_BY_DESTINATION = {
  aruba: ['restaurants Oranjestad', 'restaurants Noord', 'Eagle Beach restaurants', 'Palm Beach restaurants', 'restaurants Santa Cruz', 'restaurants San Nicolas'],
  'cabo-san-lucas': ['restaurants Cabo San Lucas', 'restaurants San Jose del Cabo', 'restaurants Corridor'],
  'punta-cana': ['restaurants Punta Cana', 'restaurants Bavaro', 'restaurants Cap Cana'],
  'barbados': ['restaurants Bridgetown', 'restaurants St Lawrence Gap', 'restaurants Holetown'],
  'jamaica': ['restaurants Montego Bay', 'restaurants Negril', 'restaurants Ocho Rios', 'restaurants Kingston'],
  'st-lucia': ['restaurants Castries', 'restaurants Soufriere', 'restaurants Rodney Bay'],
  'curacao': ['restaurants Willemstad', 'restaurants Jan Thiel', 'restaurants Westpunt'],
};

/** Country name → ISO (2-letter). Used to validate place country matches destination. */
const COUNTRY_NAME_TO_ISO = {
  Aruba: 'AW', Bahamas: 'BS', Barbados: 'BB', Belize: 'BZ', Brazil: 'BR', Canada: 'CA', 'Cayman Islands': 'KY',
  Colombia: 'CO', 'Costa Rica': 'CR', 'Curaçao': 'CW', Curacao: 'CW', 'Dominican Republic': 'DO', Egypt: 'EG',
  France: 'FR', Germany: 'DE', Greece: 'GR', Indonesia: 'ID', Israel: 'IL', Italy: 'IT', Jamaica: 'JM',
  Japan: 'JP', Mexico: 'MX', Morocco: 'MA', Netherlands: 'NL', 'New Zealand': 'NZ', Peru: 'PE',
  Portugal: 'PT', 'Puerto Rico': 'PR', 'South Africa': 'ZA', Spain: 'ES', Thailand: 'TH', 'Trinidad and Tobago': 'TT',
  'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 'United States': 'US', USA: 'US', 'Virgin Islands': 'VI',
};

/** Extract country ISO from Place Details (address_components). */
function getPlaceCountryIso(placeDetails) {
  const ac = placeDetails?.addressComponents;
  if (!ac) return null;
  const arr = Array.isArray(ac) ? ac : (typeof ac === 'string' ? (() => { try { return JSON.parse(ac); } catch { return null; } })() : null);
  if (!Array.isArray(arr)) return null;
  const country = arr.find((c) => c?.types?.includes?.('country'));
  const code = country?.shortText || country?.longText;
  if (!code) return null;
  return code.length === 2 ? code.toUpperCase() : (COUNTRY_NAME_TO_ISO[code] || null);
}

/** Expected country ISO for this destination (from destination.country). */
function getExpectedCountryIso(destination) {
  const name = destination?.country;
  if (!name) return null;
  return COUNTRY_NAME_TO_ISO[name] || null;
}

async function processDestination(destination, index, total, maxPerDestination, skipExisting) {
  const destinationId = destination.id;
  const name = destination.fullName || destination.name;
  const baseQueries = QUERY_VARIANTS(name);
  const areaQueries = AREA_QUERIES_BY_DESTINATION[destinationId] || [];
  const queries = [...baseQueries, ...areaQueries];
  const location = null; // optional: add lat,lng if we have coords later

  const expectedCountryIso = getExpectedCountryIso(destination);

  const places = await searchRestaurantsMany(queries, location, maxPerDestination);
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let wrongCountry = 0;
  let errors = 0;

  for (const place of places) {
    try {
      if (skipExisting) {
        const { data: existing } = await supabase
          .from('restaurants')
          .select('id')
          .eq('google_place_id', place.id)
          .maybeSingle();
        if (existing) {
          skipped++;
          continue;
        }
      }

      const placeDetails = await getPlaceDetails(place.id);

      // Skip places in a different country (e.g. API returns Amsterdam when querying Aruba)
      if (expectedCountryIso) {
        const placeCountryIso = getPlaceCountryIso(placeDetails);
        if (placeCountryIso && placeCountryIso !== expectedCountryIso) {
          wrongCountry++;
          continue;
        }
      }

      const formattedData = formatRestaurantData(placeDetails, destinationId);

      const { data: existing } = await supabase
        .from('restaurants')
        .select('id, slug')
        .eq('google_place_id', place.id)
        .single();

      if (!existing) {
        const finalSlug = await resolveSlugConflict(supabase, destinationId, formattedData);
        if (finalSlug !== formattedData.slug) formattedData.slug = finalSlug;
      }

      if (existing) {
        const { error } = await supabase
          .from('restaurants')
          .update({
            ...formattedData,
            data_updated_at: new Date().toISOString(),
          })
          .eq('google_place_id', place.id);
        if (error) throw error;
        updated++;
      } else {
        const { error } = await supabase
          .from('restaurants')
          .insert({ ...formattedData, is_active: true });
        if (error) throw error;
        created++;
      }

      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`    Error ${place.displayName?.text || place.id}: ${err.message}`);
      errors++;
    }
  }

  return { created, updated, skipped, wrongCountry, errors, totalPlaces: places.length };
}

async function main() {
  const args = process.argv.slice(2);
  const batch65 = args.includes('--batch-65');
  const batchCurated = args.includes('--batch-curated');
  const onlyNew = (batch65 || args.includes('--only-new')) && !batchCurated;
  const skipExisting = args.includes('--skip-existing');
  const test = args.includes('--test');
  const destIdx = args.findIndex((a) => a === '--destination');
  const singleDestinationId = destIdx >= 0 && args[destIdx + 1] ? args[destIdx + 1].toLowerCase().trim() : null;
  const limitIdx = args.findIndex((a) => a === '--limit');
  const limit = limitIdx >= 0 && args[limitIdx + 1] ? parseInt(args[limitIdx + 1], 10) : null;
  const maxIdx = args.findIndex((a) => a === '--max-per-destination');
  const maxPerDestination = maxIdx >= 0 && args[maxIdx + 1] ? parseInt(args[maxIdx + 1], 10) : 100;

  let capsByDestination = {};
  if (batch65) {
    capsByDestination = loadBatch65Caps();
    console.log(`📦 Batch-65: using per-destination caps from restaurant-caps-65-destinations.json (${Object.keys(capsByDestination).length} entries)\n`);
  } else if (batchCurated) {
    capsByDestination = loadBatchCuratedCaps();
    console.log(`📦 Batch-curated: using per-destination caps from restaurant-caps-180-destinations.json (${Object.keys(capsByDestination).length} entries)\n`);
  }

  const featured = getFeaturedDestinations();
  let toProcess = featured;

  if (batchCurated) {
    const curatedIds = new Set(Object.keys(capsByDestination));
    toProcess = featured.filter((d) => curatedIds.has(d.id));
    console.log(`📊 Curated destinations to process: ${toProcess.length} (max 150 restaurants each, adding to existing ~20)\n`);
  }

  if (onlyNew) {
    const withRestaurants = await getDestinationIdsWithRestaurants();
    toProcess = featured.filter((d) => !withRestaurants.has(d.id));
    console.log(`📊 Featured: ${featured.length} | Without restaurants: ${toProcess.length}\n`);
    const listOnly = args.includes('--list-only');
    if (listOnly) {
      toProcess.forEach((d, i) => console.log(`${i + 1}. ${d.fullName || d.name} (${d.id})`));
      console.log(`\nTotal: ${toProcess.length} destinations without restaurants.`);
      return;
    }
  } else {
    console.log(`📊 Featured destinations: ${featured.length}\n`);
  }

  if (singleDestinationId) {
    toProcess = featured.filter((d) => d.id === singleDestinationId);
    if (toProcess.length === 0) {
      console.error(`❌ Destination "${singleDestinationId}" not found in featured list. Check the id (e.g. aruba, new-york-city).`);
      process.exit(1);
    }
    console.log(`📍 Single destination: ${toProcess[0].fullName || toProcess[0].name} (${singleDestinationId})\n`);
  }

  if (!batch65 && !batchCurated) {
    console.log(`🍽️  Max restaurants per destination: ${maxPerDestination}`);
  }
  if (skipExisting) console.log(`⏭️  Skip existing: yes (no Place Details call for places already in DB)\n`);
  else console.log('');

  if (test) {
    toProcess = toProcess.slice(0, 1);
    console.log('🧪 TEST MODE: processing 1 destination only\n');
  }
  if (limit) {
    toProcess = toProcess.slice(0, limit);
    console.log(`📌 Limit: ${limit} destinations\n`);
  }

  if (toProcess.length === 0) {
    console.log('Nothing to process. Exiting.');
    return;
  }

  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalWrongCountry = 0;
  let totalErrors = 0;
  const batchStart = Date.now();

  for (let i = 0; i < toProcess.length; i++) {
    const dest = toProcess[i];
    const maxForDest = (batch65 || batchCurated) && capsByDestination[dest.id] != null ? capsByDestination[dest.id] : maxPerDestination;
    const destStart = Date.now();

    console.log('');
    console.log('─'.repeat(60));
    console.log(`[${i + 1}/${toProcess.length}] ${dest.fullName || dest.name} (${dest.id})  —  max: ${maxForDest}`);
    console.log('─'.repeat(60));

    try {
      const result = await processDestination(dest, i, toProcess.length, maxForDest, skipExisting);
      totalCreated += result.created;
      totalUpdated += result.updated;
      totalSkipped += result.skipped || 0;
      totalWrongCountry += result.wrongCountry || 0;
      totalErrors += result.errors;

      const destElapsed = ((Date.now() - destStart) / 1000).toFixed(1);
      const skipMsg = result.skipped ? ` | skipped (existing): ${result.skipped}` : '';
      const wrongMsg = result.wrongCountry ? ` | wrong country: ${result.wrongCountry}` : '';
      console.log(`    → created: ${result.created} | updated: ${result.updated} | places: ${result.totalPlaces}${skipMsg}${wrongMsg} | errors: ${result.errors} | ${destElapsed}s`);
      console.log(`    Running total: ${totalCreated} created, ${totalUpdated} updated (${totalCreated + totalUpdated} restaurants)`);

      if (i < toProcess.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`    ❌ Failed: ${err.message}`);
      totalErrors += 1;
    }
  }

  const totalElapsed = ((Date.now() - batchStart) / 1000 / 60).toFixed(1);
  console.log('');
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Destinations processed: ${toProcess.length}`);
  console.log(`Restaurants created:     ${totalCreated}`);
  console.log(`Restaurants updated:     ${totalUpdated}`);
  if (skipExisting && totalSkipped > 0) console.log(`Skipped (already in DB):  ${totalSkipped}`);
  if (totalWrongCountry > 0) console.log(`Skipped (wrong country):   ${totalWrongCountry}`);
  console.log(`Errors:                  ${totalErrors}`);
  console.log(`Total time:              ${totalElapsed} min`);
  console.log('');
  console.log('Next: run node scripts/generate-destinations-with-restaurants-list.js to update the static list.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
