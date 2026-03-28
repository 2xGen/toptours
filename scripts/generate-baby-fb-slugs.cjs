const fs = require('fs');
const path = require('path');

const batchPath = path.join(__dirname, 'seed-baby-equipment-rentals-batch.js');
const s = fs.readFileSync(batchPath, 'utf8');
const m = [...s.matchAll(/\{\s*id:\s*'([^']+)'/g)].map((x) => x[1]);
const extra = ['curacao', 'punta-cana', 'medellin', 'san-jose'].filter((x) => !m.includes(x));
const all = [...new Set([...m, ...extra])].sort();

const out = `/** Canonical list of baby-equipment destination slugs (reference + tooling). Regenerate: npm run generate-baby-fb-slugs */
export const BABY_FB_DESTINATION_SLUGS = ${JSON.stringify(all, null, 2)};

export const BABY_FB_DESTINATION_SLUG_SET = new Set(BABY_FB_DESTINATION_SLUGS);
`;

const dest = path.join(__dirname, '..', 'src', 'data', 'babyFbDestinationSlugs.js');
fs.writeFileSync(dest, out);
console.log('Wrote', dest, 'count', all.length);
