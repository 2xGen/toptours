/** Build staticDisplay.js from API metadata + search prices. */
import { readFileSync, writeFileSync } from 'fs';

const meta = JSON.parse(readFileSync('scripts/hub-pick-display-data.json', 'utf8'));
const priceLines = readFileSync('scripts/hub-pick-prices.txt', 'utf8').split('\n');
const searchPrices = {};
for (const line of priceLines) {
  const m = line.match(/^(\S+)\t\$([\d.]+)\t/);
  if (m) searchPrices[m[1]] = Number(m[2]);
}

/** Editorial from-price anchors (live checkout may vary). */
const PRICE_OVERRIDES = {
  '245508': 112,
  '37387P1': 108,
  '364486P1': 135.14,
  '6593P11': 172,
  '63851P6': 87.51,
  '402036P7': 137.16,
  '286699P2': 173.02,
  '20364P20': 70.2,
  '428424P1': 35,
  '72192P3': 108,
  '40610P2': 139.32,
  '107194P161': 6.47,
  '404605P2': 17,
  '366784P44': 11.76,
  '169084P1': 175.99,
  '7812P36': 99.35,
  '423010P8': 52.92,
  '73335P5': 58.32,
  '5577125P10': 150.12,
  // Arusha
  '427486P16': 100,
  '411336P2': 2188,
  '114963P10': 1799,
  '202273P3': 54,
  '5608934P4': 130,
  '305732P11': 265,
  '259457P11': 250,
  '142902P29': 250,
  '392474P1': 75,
  '150526P11': 1250,
  '392474P8': 1300,
  '480452P1': 385,
  '5596000P1': 18.5,
  '141010P1': 35,
  '114963P4': 49,
};

const display = {};
for (const [code, row] of Object.entries(meta)) {
  if (row.error) continue;
  const fromPrice = PRICE_OVERRIDES[code] ?? searchPrices[code] ?? row.fromPrice ?? null;
  display[code] = {
    imageUrl: row.imageUrl || null,
    fromPrice,
    rating: row.rating != null ? Math.round(row.rating * 10) / 10 : null,
    reviewCount: row.reviewCount ?? null,
    durationMinutes: row.durationMinutes ?? null,
  };
}

const out = `/** Static card display for curated hub picks — zero API calls on page load. */
/** Regenerate: node scripts/fetch-hub-pick-display.mjs && node scripts/fetch-hub-pick-prices.mjs && node scripts/build-static-display.mjs */

export const HUB_PICK_DISPLAY = ${JSON.stringify(display, null, 2)};

export function getHubPickDisplay(productCode) {
  if (!productCode) return null;
  return HUB_PICK_DISPLAY[String(productCode)] || null;
}
`;

writeFileSync('src/data/destinationHubPicks/staticDisplay.js', out);
console.log('Wrote staticDisplay.js with', Object.keys(display).length, 'tours');
