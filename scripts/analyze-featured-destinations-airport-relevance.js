/**
 * Analyze featured destinations on /destinations and their airport transfer relevance.
 *
 * Reuses the same logic as DestinationsPageClient for "featured" destinations:
 * - destinationsData.js (curated) + generated full content with hasGuide + image.
 *
 * Airport relevance: inferred from viatorDestinationsClassified "type" (CITY, REGION,
 * NATIONAL_PARK, etc.). IATA codes come from viator_destinations DB (not in this script).
 *
 * Usage: node scripts/analyze-featured-destinations-airport-relevance.js
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

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

const regionToCategory = {
  Europe: 'Europe',
  'North America': 'North America',
  Caribbean: 'Caribbean',
  'Asia-Pacific': 'Asia-Pacific',
  Africa: 'Africa',
  'South America': 'South America',
  'Middle East': 'Middle East',
  Australia: 'Asia-Pacific',
  Oceania: 'Asia-Pacific',
  'Australia & Oceania': 'Asia-Pacific',
  'Central America': 'North America',
  Asia: 'Asia-Pacific',
  'Central Asia': 'Asia-Pacific',
};

// Load data
const { destinations } = await import('../src/data/destinationsData.js');
const generatedFullContent = JSON.parse(
  readFileSync(resolve(root, 'generated-destination-full-content.json'), 'utf8')
);
const seoContent = JSON.parse(
  readFileSync(resolve(root, 'generated-destination-seo-content.json'), 'utf8')
);
const classified = JSON.parse(
  readFileSync(resolve(root, 'src/data/viatorDestinationsClassified.json'), 'utf8')
);

function getDestinationSeoContent(slug) {
  return seoContent[slug] || null;
}

// Build classified index by slug (same as DestinationsPageClient)
const bySlug = new Map();
for (const cd of classified) {
  const slug = generateSlug(cd.destinationName || cd.name || '');
  if (!slug) continue;
  if (!bySlug.has(slug)) bySlug.set(slug, []);
  bySlug.get(slug).push(cd);
}

// Featured destinations: curated + generated with guides + image
const regularDestIds = new Set(destinations.map((d) => d.id));
const generatedWithGuides = Object.keys(generatedFullContent || {})
  .filter((slug) => {
    if (regularDestIds.has(slug)) return false;
    const content = generatedFullContent[slug];
    if (!content || !content.tourCategories) return false;
    const hasGuides = content.tourCategories.some(
      (cat) => typeof cat === 'object' && cat.hasGuide === true
    );
    if (!hasGuides) return false;
    const sec = getDestinationSeoContent(slug);
    const hasImage = !!(
      content.imageUrl ||
      sec?.imageUrl ||
      sec?.ogImage
    );
    return hasImage;
  })
  .map((slug) => {
    const content = generatedFullContent[slug];
    const sec = getDestinationSeoContent(slug);
    const cls = bySlug.get(slug)?.[0];
    return {
      id: slug,
      name: content.destinationName || slug,
      fullName: content.destinationName || slug,
      country: cls?.country || content.country || null,
      type: cls?.type || null,
    };
  });

const featured = [
  ...destinations.map((d) => ({
    id: d.id,
    name: d.name,
    fullName: d.fullName || d.name,
    country: d.country || null,
    type: bySlug.get(d.id)?.[0]?.type || null,
  })),
  ...generatedWithGuides,
];

// Airport relevance
// HIGH: CITY, REGION (cities/regions typically have or are near a major airport)
// MEDIUM: MULTI_CITY, ATTRACTION, etc. (often served by nearby airport)
// LOWER: NATIONAL_PARK, NATURE (travelers often fly to gateway city then transfer; still relevant but indirect)
const TYPE_RELEVANCE = {
  CITY: 'high',
  REGION: 'high',
  MULTI_CITY: 'medium',
  ATTRACTION: 'medium',
  NATIONAL_PARK: 'lower',
  NATURE: 'lower',
  NEIGHBORHOOD: 'medium',
  UNKNOWN: 'unknown',
};

function relevance(type) {
  if (!type) return 'unknown';
  return TYPE_RELEVANCE[type] ?? 'medium';
}

// Summary
const withType = featured.map((d) => ({
  ...d,
  airportRelevance: relevance(d.type),
}));

const byRelevance = { high: [], medium: [], lower: [], unknown: [] };
withType.forEach((d) => byRelevance[d.airportRelevance].push(d));

console.log('\n=== FEATURED DESTINATIONS ON /destinations ===\n');
console.log(`Total featured destinations: ${featured.length}`);
console.log(`  - From destinationsData.js (curated): ${destinations.length}`);
console.log(`  - From generated content (guides + image): ${generatedWithGuides.length}`);
console.log('');
console.log('=== AIRPORT TRANSFER RELEVANCE ===\n');
console.log(`  High (CITY / REGION):     ${byRelevance.high.length} – typically have or are near a major airport`);
console.log(`  Medium (e.g. MULTI_CITY): ${byRelevance.medium.length} – often served by nearby airport`);
console.log(`  Lower (e.g. NATIONAL_PARK): ${byRelevance.lower.length} – gateway city transfers more common`);
console.log(`  Unknown (no classified type): ${byRelevance.unknown.length}`);
console.log('');

const lowerOrUnknown = [...byRelevance.lower, ...byRelevance.unknown];
if (lowerOrUnknown.length > 0) {
  console.log('=== LOWER / UNKNOWN RELEVANCE (review for airport transfer pages) ===\n');
  lowerOrUnknown
    .sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''))
    .forEach((d) => {
      console.log(`  ${(d.fullName || d.name || d.id).padEnd(42)} type=${d.type || '—'}  id=${d.id}`);
    });
  console.log('');
}

console.log('=== ALL FEATURED DESTINATIONS (id, fullName, type, relevance) ===\n');
withType
  .sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''))
  .forEach((d) => {
    const name = (d.fullName || d.name || d.id).padEnd(40);
    const t = (d.type || '—').padEnd(14);
    console.log(`  ${name}  ${t}  ${d.airportRelevance}  ${d.id}`);
  });

console.log('\nDone.\n');
