/**
 * Refresh from_price for all v3 explore tours using Viator POST /availability/schedules/bulk.
 * Updates v3_landing_category_tours.from_price so the explore tour detail page (100% DB) can show price.
 *
 * Usage:
 *   node scripts/refresh-explore-tour-prices-v3.js
 *   node scripts/refresh-explore-tour-prices-v3.js --dry-run
 *
 * Env: VIATOR_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
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

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !VIATOR_API_KEY) {
  console.error('❌ Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VIATOR_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const BULK_CHUNK = 500;

async function fetchPricesFromSchedules(productCodes) {
  const base = process.env.VIATOR_API_BASE_URL || 'https://api.viator.com/partner';
  const res = await fetch(`${base}/availability/schedules/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json;version=2.0',
      'Accept-Language': 'en-US',
      'exp-api-key': VIATOR_API_KEY,
    },
    body: JSON.stringify({ productCodes }),
  });
  if (!res.ok) return new Map();
  const data = await res.json();
  const list = data?.availabilitySchedules || [];
  const map = new Map();
  for (const schedule of list) {
    const code = schedule.productCode;
    if (!code) continue;
    let minPrice = null;
    for (const item of schedule.bookableItems || []) {
      for (const season of item.seasons || []) {
        for (const record of season.pricingRecords || []) {
          for (const detail of record.pricingDetails || []) {
            const rrp = detail.price?.original?.recommendedRetailPrice;
            if (typeof rrp === 'number' && rrp > 0) {
              if (minPrice === null || rrp < minPrice) minPrice = rrp;
            }
          }
        }
      }
    }
    if (minPrice !== null) map.set(code, minPrice);
  }
  return map;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('🔍 DRY RUN – no DB updates\n');

  const { data: rows, error } = await supabase
    .from('v3_landing_category_tours')
    .select('product_id, destination_slug, category_slug, tour_slug');
  if (error || !rows?.length) {
    console.log(error ? error.message : 'No tours found.');
    process.exit(0);
  }

  const productIds = [...new Set(rows.map((r) => r.product_id).filter(Boolean))];
  const chunks = [];
  for (let i = 0; i < productIds.length; i += BULK_CHUNK) {
    chunks.push(productIds.slice(i, i + BULK_CHUNK));
  }

  let updated = 0;
  for (let c = 0; c < chunks.length; c++) {
    const chunk = chunks[c];
    const priceMap = await fetchPricesFromSchedules(chunk);
    for (const row of rows) {
      if (!row.product_id || !row.tour_slug) continue;
      const price = priceMap.get(row.product_id);
      if (typeof price !== 'number') continue;
      const fromPrice = `Price from $${Math.round(price)}`;
      if (dryRun) {
        console.log(`   [DRY RUN] ${row.tour_slug} -> ${fromPrice}`);
        updated++;
        continue;
      }
      const { error: upErr } = await supabase
        .from('v3_landing_category_tours')
        .update({ from_price: fromPrice })
        .eq('destination_slug', row.destination_slug)
        .eq('category_slug', row.category_slug)
        .eq('tour_slug', row.tour_slug);
      if (!upErr) updated++;
    }
    if (c < chunks.length - 1) await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n✅ Updated from_price for ${updated} tour(s)${dryRun ? ' (dry run)' : ''}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
