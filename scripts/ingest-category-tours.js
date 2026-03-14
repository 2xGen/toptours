/**
 * Generic ingest: refresh image_url, from_price, rating, review_count in v3_landing_category_tours
 * from Viator bulk APIs. One script for all destinations and categories.
 *
 * Usage (from project root):
 *   node scripts/ingest-category-tours.js
 *   node scripts/ingest-category-tours.js --destination=new-york-city
 *   node scripts/ingest-category-tours.js --destination=new-york-city --category=broadway-shows
 *   node scripts/ingest-category-tours.js --destination=new-york-city --category=central-park-tours
 *
 * - No args: all (destination_slug, category_slug) pairs in v3_landing_category_tours
 * - --destination only: all categories for that destination
 * - --destination + --category: single category (fastest for one-off)
 *
 * Required env in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   VIATOR_API_KEY, VIATOR_API_BASE_URL (optional), VIATOR_USE_LIVE_API=true
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fetchProductsBulk } from '../src/lib/viatorBulk.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BULK_PAGE_SIZE = 500; // Viator limit per request

function parseArgs() {
  const args = process.argv.slice(2);
  let destination = null;
  let category = null;
  for (const a of args) {
    if (a.startsWith('--destination=')) destination = a.slice('--destination='.length).trim() || null;
    else if (a.startsWith('--category=')) category = a.slice('--category='.length).trim() || null;
  }
  return { destination, category };
}

/** Call Viator bulk in chunks of BULK_PAGE_SIZE; return merged summaries. */
async function fetchProductsBulkBatched(productCodes) {
  if (!productCodes || productCodes.length === 0) return [];
  const out = [];
  for (let i = 0; i < productCodes.length; i += BULK_PAGE_SIZE) {
    const chunk = productCodes.slice(i, i + BULK_PAGE_SIZE);
    const summaries = await fetchProductsBulk(chunk);
    out.push(...(summaries || []));
  }
  return out;
}

/** Fetch distinct (destination_slug, category_slug) from v3_landing_category_tours. */
async function getDestinationCategoryPairs(destination, category) {
  let q = supabase
    .from('v3_landing_category_tours')
    .select('destination_slug, category_slug');
  if (destination) q = q.eq('destination_slug', destination);
  if (category) q = q.eq('category_slug', category);
  const { data, error } = await q;
  if (error) throw new Error(error.message || 'Failed to read v3_landing_category_tours');
  const seen = new Set();
  const pairs = [];
  for (const row of data || []) {
    const key = `${row.destination_slug}\t${row.category_slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push({ destination_slug: row.destination_slug, category_slug: row.category_slug });
  }
  return pairs;
}

/** Ingest one (destination_slug, category_slug): fetch rows, call Viator bulk, update rows. */
async function ingestOne(supabaseClient, destinationSlug, categorySlug) {
  const { data: rows, error } = await supabaseClient
    .from('v3_landing_category_tours')
    .select('id, product_id, title')
    .eq('destination_slug', destinationSlug)
    .eq('category_slug', categorySlug)
    .order('position', { ascending: true });

  if (error) {
    console.error(`❌ Supabase error [${destinationSlug}/${categorySlug}]:`, error.message || error);
    return { updated: 0, total: 0 };
  }

  if (!rows || rows.length === 0) {
    console.log(`ℹ️ No rows for ${destinationSlug} / ${categorySlug}`);
    return { updated: 0, total: 0 };
  }

  const productCodes = Array.from(new Set(rows.map((r) => r.product_id))).filter(Boolean);
  const summaries = await fetchProductsBulkBatched(productCodes);
  if (!summaries || summaries.length === 0) {
    console.warn(`⚠️ No Viator summaries for ${destinationSlug}/${categorySlug}. Check VIATOR_* env.`);
    return { updated: 0, total: rows.length };
  }

  const byCode = new Map(summaries.map((s) => [s.productCode, s]));
  let updatedCount = 0;

  for (const row of rows) {
    const s = byCode.get(row.product_id);
    if (!s) continue;
    const update = {
      image_url: s.imageUrl || null,
      from_price: s.fromPriceDisplay || null,
      rating: typeof s.rating === 'number' && s.rating > 0 ? s.rating : null,
      review_count: typeof s.reviewCount === 'number' && s.reviewCount > 0 ? s.reviewCount : null,
    };
    const { error: upErr } = await supabaseClient
      .from('v3_landing_category_tours')
      .update(update)
      .eq('id', row.id);
    if (!upErr) updatedCount += 1;
  }

  return { updated: updatedCount, total: rows.length };
}

async function main() {
  const { destination, category } = parseArgs();

  const label = category
    ? `${destination || '*'}/${category}`
    : destination
      ? `destination=${destination}`
      : 'all destinations/categories';

  console.log(`🔄 Ingesting v3_landing_category_tours from Viator [${label}]…`);

  const pairs = await getDestinationCategoryPairs(destination, category);
  if (pairs.length === 0) {
    console.log('ℹ️ No (destination, category) pairs found.');
    process.exit(0);
  }

  console.log(`✅ Found ${pairs.length} category/categories to process.\n`);

  let totalUpdated = 0;
  let totalRows = 0;

  for (const { destination_slug, category_slug } of pairs) {
    const { updated, total } = await ingestOne(supabase, destination_slug, category_slug);
    totalUpdated += updated;
    totalRows += total;
    console.log(`  ${destination_slug}/${category_slug}: ${updated}/${total} rows updated.`);
  }

  console.log(`\n✅ Done. Total: ${totalUpdated}/${totalRows} rows updated.`);
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
