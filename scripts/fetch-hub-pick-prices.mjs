/** Fetch fromPrice via products/search (pricing not on single-product endpoint). */
import { config } from 'dotenv';
config({ path: '.env.local' });
const apiKey = process.env.VIATOR_API_KEY;

const DESTINATIONS = [
  { id: '28', name: 'aruba' },
  { id: '725', name: 'curacao' },
  { id: '462', name: 'prague' },
  { id: '5593', name: 'arusha' },
];

async function searchDestination(destId) {
  const res = await fetch('https://api.viator.com/partner/products/search', {
    method: 'POST',
    headers: {
      'exp-api-key': apiKey,
      Accept: 'application/json;version=2.0',
      'Accept-Language': 'en-US',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filtering: { destination: String(destId) },
      sorting: { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
      pagination: { start: 1, count: 50 },
      currency: 'USD',
    }),
  });
  const data = await res.json();
  return { totalCount: data.totalCount, products: data.products || [] };
}

for (const dest of DESTINATIONS) {
  const { totalCount, products } = await searchDestination(dest.id);
  console.log(`\n=== ${dest.name} (${totalCount} tours) ===`);
  for (const p of products) {
    const code = p.productCode || p.productId;
    const price = p.pricing?.summary?.fromPrice;
    if (price != null) {
      console.log(`${code}\t$${price}\t${(p.title || '').slice(0, 60)}`);
    }
  }
}
