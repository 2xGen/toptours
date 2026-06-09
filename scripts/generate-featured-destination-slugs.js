/**
 * Regenerate src/data/featuredDestinationSlugs.json from curated + image-backed generated content.
 * Run on build: npm run generate-featured-destination-slugs
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllDestinations } from '../src/data/destinationsData.js';
import full from '../generated-destination-full-content.json' with { type: 'json' };
import seo from '../generated-destination-seo-content.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function hasImage(slug) {
  const c = full[slug];
  const s = seo[slug];
  return Boolean(c?.imageUrl || s?.imageUrl || s?.ogImage);
}

const set = new Set();
for (const d of getAllDestinations()) {
  if (d?.id) set.add(d.id.toLowerCase());
}
for (const slug of new Set([...Object.keys(full), ...Object.keys(seo)])) {
  if (hasImage(slug)) set.add(slug.toLowerCase());
}

const slugs = [...set].sort();
const outPath = path.join(root, 'src/data/featuredDestinationSlugs.json');
writeFileSync(outPath, `${JSON.stringify(slugs, null, 2)}\n`);
console.log(`Wrote ${slugs.length} featured destination slugs → src/data/featuredDestinationSlugs.json`);
