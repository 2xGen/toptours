/**
 * Add blurb + FAQ fields to an existing operator index (no Viator API).
 * Tour highlights still require: node scripts/build-operator-page-index.mjs aruba
 *
 * Usage: node scripts/patch-operator-page-seo.mjs aruba
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  buildOperatorBlurb,
  buildOperatorFaqs,
} from '../src/lib/operatorPageSeo.js';

const destinationSlug = (process.argv[2] || 'aruba').toLowerCase();
const indexPath = join('src/data/operatorPages', `${destinationSlug}.json`);
const overridesPath = join('src/data/operatorPages/overrides', `${destinationSlug}.json`);

if (!existsSync(indexPath)) {
  console.error('Index not found:', indexPath);
  process.exit(1);
}

const index = JSON.parse(readFileSync(indexPath, 'utf8'));
let overrides = {};
if (existsSync(overridesPath)) {
  const raw = JSON.parse(readFileSync(overridesPath, 'utf8'));
  const { _comment, ...rest } = raw;
  overrides = rest;
}

const destName = index.destinationName || destinationSlug;
let patched = 0;

index.operators = (index.operators || []).map((op) => {
  const manual = overrides[op.slug] || {};
  const ctx = {
    operatorName: op.operatorName,
    destinationName: destName,
    tours: op.tours || [],
    tourCount: op.tourCount,
    totalReviews: op.totalReviews,
    averageRating: op.averageRating,
  };
  const nextBlurb = manual.blurb || buildOperatorBlurb(ctx);
  const nextFaqs = manual.faqs?.length ? manual.faqs : buildOperatorFaqs(ctx);
  const next = { ...op, blurb: nextBlurb, faqs: nextFaqs };
  if (op.blurb !== nextBlurb || !op.faqs?.length) patched++;
  return next;
});

index.patchedAt = new Date().toISOString();
writeFileSync(indexPath, JSON.stringify(index, null, 2));
console.log(`Patched SEO fields on ${patched} operators in ${indexPath}`);
