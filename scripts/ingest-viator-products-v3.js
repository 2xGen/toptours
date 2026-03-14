/**
 * Ingest full Viator product payloads into viator_products for v3 explore tours only.
 * Reads product_id from v3_landing_category_tours, calls POST /products/bulk in chunks of 500,
 * and upserts each product into viator_products (product_code, payload, updated_at).
 *
 * Run after applying docs/viator_products_schema.sql in Supabase.
 *
 * Usage:
 *   node scripts/ingest-viator-products-v3.js           # all v3 tour product IDs
 *   node scripts/ingest-viator-products-v3.js --dry-run # no DB writes
 *
 * Env: VIATOR_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env.local)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}
if (!VIATOR_API_KEY) {
  console.error('❌ Missing VIATOR_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const BULK_CHUNK = 500;

async function fetchBulkProducts(productCodes) {
  const base = process.env.VIATOR_API_BASE_URL || 'https://api.viator.com/partner';
  const res = await fetch(`${base}/products/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json;version=2.0',
      'Accept-Language': 'en-US',
      'exp-api-key': VIATOR_API_KEY,
    },
    body: JSON.stringify({ productCodes }),
  });
  if (!res.ok) {
    throw new Error(`Viator bulk failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('🔍 DRY RUN – no DB writes\n');

  console.log('📋 Loading product IDs from v3_landing_category_tours...');
  const { data: rows, error: selectError } = await supabase
    .from('v3_landing_category_tours')
    .select('product_id')
    .not('product_id', 'is', null);

  if (selectError) {
    console.error('❌ Supabase select error:', selectError.message);
    process.exit(1);
  }

  const productIds = [...new Set((rows || []).map((r) => r.product_id).filter(Boolean))];
  console.log(`   Found ${productIds.length} unique product ID(s)\n`);

  if (productIds.length === 0) {
    console.log('Nothing to ingest.');
    process.exit(0);
  }

  const chunks = [];
  for (let i = 0; i < productIds.length; i += BULK_CHUNK) {
    chunks.push(productIds.slice(i, i + BULK_CHUNK));
  }

  let totalUpserted = 0;
  let totalFailed = 0;

  for (let c = 0; c < chunks.length; c++) {
    const chunk = chunks[c];
    console.log(`[${c + 1}/${chunks.length}] Fetching bulk (${chunk.length} products)...`);

    let items;
    try {
      items = await fetchBulkProducts(chunk);
    } catch (e) {
      console.error('   ❌', e.message);
      totalFailed += chunk.length;
      continue;
    }

    const toUpsert = items
      .filter((item) => item && (item.productCode || item.product_code))
      .map((item) => ({
        product_code: item.productCode || item.product_code,
        payload: item,
        updated_at: new Date().toISOString(),
      }));

    if (dryRun) {
      console.log(`   [DRY RUN] Would upsert ${toUpsert.length} rows`);
      totalUpserted += toUpsert.length;
      continue;
    }

    for (const row of toUpsert) {
      const { error: upsertError } = await supabase
        .from('viator_products')
        .upsert(
          { product_code: row.product_code, payload: row.payload, updated_at: row.updated_at },
          { onConflict: 'product_code' }
        );
      if (upsertError) {
        console.error(`   ⚠ Upsert failed for ${row.product_code}:`, upsertError.message);
        totalFailed++;
      } else {
        totalUpserted++;
      }
    }

    console.log(`   ✓ Upserted ${toUpsert.length} products`);
    if (c < chunks.length - 1) await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n✅ Done. Upserted: ${totalUpserted}, Failed: ${totalFailed}${dryRun ? ' (dry run)' : ''}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
