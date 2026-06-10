/** One-off: fetch Viator display fields for hub pick product codes. */
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';

config({ path: '.env.local' });

const apiKey = process.env.VIATOR_API_KEY;
if (!apiKey) {
  console.error('VIATOR_API_KEY missing');
  process.exit(1);
}

const CODES = [
  // Aruba
  '245508', '5493518P2', '13835P19', '324189P3', '6593P17', '37387P1',
  '459169P1', '392509P1', '5621222P1', '5566924P9', '459169P2', '444239P2',
  '5595462P1', '364486P1', '6593P11',
  // Prague
  '63851P6', '402036P7', '286699P2', '73335P5', '5577125P10', '20364P20',
  '428424P1', '72192P3', '40610P2', '107194P161', '404605P2', '366784P44',
  '169084P1', '7812P36', '423010P8',
  // Arusha
  '427486P16', '411336P2', '114963P10', '202273P3', '5608934P4', '305732P11',
  '259457P11', '142902P29', '392474P1', '150526P11', '392474P8', '480452P1',
  '5596000P1', '141010P1', '114963P4',
];

function bestImage(tour) {
  const variants = tour?.images?.[0]?.variants;
  if (Array.isArray(variants) && variants.length) {
    const sorted = [...variants].sort((a, b) => (b.width || 0) - (a.width || 0));
    return sorted.find((v) => v.width >= 400 && v.width <= 800)?.url || sorted[0]?.url || null;
  }
  return tour?.images?.[0]?.url || null;
}

function durationMinutes(tour) {
  return (
    tour?.itinerary?.duration?.fixedDurationInMinutes ||
    tour?.duration?.fixedDurationInMinutes ||
    tour?.duration?.variableDurationFromMinutes ||
    null
  );
}

async function fetchProduct(code) {
  const res = await fetch(`https://api.viator.com/partner/products/${code}?currency=USD`, {
    headers: {
      'exp-api-key': apiKey,
      Accept: 'application/json;version=2.0',
      'Accept-Language': 'en-US',
    },
  });
  if (!res.ok) return { code, error: res.status };
  const tour = await res.json();
  return {
    code,
    imageUrl: bestImage(tour),
    fromPrice: tour?.pricing?.summary?.fromPrice ?? null,
    rating: tour?.reviews?.combinedAverageRating ?? null,
    reviewCount: tour?.reviews?.totalReviews ?? null,
    durationMinutes: durationMinutes(tour),
    title: tour?.title || null,
  };
}

let results = {};
try {
  results = JSON.parse(readFileSync('scripts/hub-pick-display-data.json', 'utf8'));
} catch {
  /* fresh run */
}

for (const code of CODES) {
  const data = await fetchProduct(code);
  results[code] = data;
  console.log(code, data.fromPrice != null ? `$${data.fromPrice}` : 'no price', data.error || 'ok');
  await new Promise((r) => setTimeout(r, 200));
}

writeFileSync('scripts/hub-pick-display-data.json', JSON.stringify(results, null, 2));
console.log('Wrote scripts/hub-pick-display-data.json');
