/** Fetch fromPrice via products/search (pricing not on single-product endpoint). */
import { config } from 'dotenv';
config({ path: '.env.local' });
const apiKey = process.env.VIATOR_API_KEY;

const DESTINATIONS = [
  { id: '28', name: 'aruba' },
  { id: '725', name: 'curacao' },
  { id: '462', name: 'prague' },
  { id: '5593', name: 'arusha' },
  { id: '905', name: 'reykjavik' },
  { id: '5590', name: 'zanzibar' },
  { id: '747', name: 'san-jose' },
  { id: '927', name: 'cusco' },
  { id: '825', name: 'marrakech' },
  { id: '335', name: 'kuala-lumpur' },
  { id: '351', name: 'hanoi' },
  { id: '904', name: 'dubrovnik' },
  { id: '722', name: 'cairo' },
  { id: '5011', name: 'interlaken' },
  { id: '611', name: 'banff' },
  { id: '5480', name: 'siem-reap' },
  { id: '936', name: 'galapagos-islands' },
  { id: '407', name: 'queenstown' },
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
