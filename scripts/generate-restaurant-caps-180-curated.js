/**
 * Generate restaurant-caps-180-destinations.json for the curated destinations (destinationsData.js).
 * Max 150 restaurants per destination (total). Excludes Aruba and Curaçao (already done separately).
 * Run: node scripts/generate-restaurant-caps-180-curated.js
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { destinations } from '../src/data/destinationsData.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Non-round caps around 150 (148, 152, 147, etc.). Deterministic per id. */
const CAPS_POOL = [147, 148, 149, 151, 152, 153, 146, 154, 145, 155];
function capForIndex(i) {
  return CAPS_POOL[i % CAPS_POOL.length];
}

/** Exclude these: already have many restaurants from separate runs. */
const EXCLUDE_IDS = new Set(['aruba', 'curacao']);

const caps = {};
const list = [];
let idx = 0;
for (const d of destinations) {
  const id = d.id;
  if (EXCLUDE_IDS.has(id)) continue;
  if (!caps[id]) {
    const cap = capForIndex(idx++);
    caps[id] = cap;
    list.push({ id, name: d.fullName || d.name, maxRestaurants: cap });
  }
}

const outPath = resolve(__dirname, 'restaurant-caps-180-destinations.json');
writeFileSync(outPath, JSON.stringify(caps, null, 2), 'utf8');
console.log(`✅ Wrote ${list.length} destinations to ${outPath} (non-round caps 145–155; excludes aruba, curacao)\n`);
console.log('List (id, name, max restaurants):');
list.forEach((row, i) => console.log(`${i + 1}. ${row.id} — ${row.name} — ${row.maxRestaurants}`));
