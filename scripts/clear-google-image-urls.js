#!/usr/bin/env node
/**
 * One-time: clear hero_image_url for all restaurants.
 * We do not use restaurant photos on the site — no restaurant image URL or upload.
 * Clears Google URLs (to stop billing) and any other stored URLs.
 *
 * Run: node scripts/clear-google-image-urls.js
 * Optional: node scripts/clear-google-image-urls.js --dry-run  (report only, no updates)
 * Optional: node scripts/clear-google-image-urls.js --google-only  (clear only Google URLs)
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const DRY_RUN = process.argv.includes('--dry-run');
const GOOGLE_ONLY = process.argv.includes('--google-only');

function isGoogleImageUrl(url) {
  return url && url.includes('googleapis.com');
}

async function main() {
  console.log('🔍 Finding restaurants with hero_image_url set...\n');

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, destination_id, hero_image_url');

  if (error) {
    console.error('❌ Failed to fetch restaurants:', error.message);
    process.exit(1);
  }

  const withUrl = restaurants.filter(r => r.hero_image_url);
  const toClear = GOOGLE_ONLY ? withUrl.filter(r => isGoogleImageUrl(r.hero_image_url)) : withUrl;
  const count = toClear.length;

  if (count === 0) {
    console.log(GOOGLE_ONLY
      ? '✅ No restaurants use Google image URLs. Nothing to clear.'
      : '✅ No restaurants have hero_image_url set. Nothing to clear.');
    return;
  }

  console.log(`📊 Will clear hero_image_url for ${count} restaurants (out of ${restaurants.length} total).`);
  if (GOOGLE_ONLY) {
    console.log('   (--google-only: only clearing Google URLs)\n');
  } else {
    console.log('   We do not use restaurant images on the site.\n');
  }

  if (DRY_RUN) {
    console.log('--dry-run: no changes made. Run without --dry-run to clear.');
    console.log('Sample IDs:', toClear.slice(0, 5).map(r => r.id).join(', '));
    return;
  }

  const ids = toClear.map(r => r.id);
  const BATCH = 100;
  let updated = 0;

  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({ hero_image_url: null })
      .in('id', batch);

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      process.exit(1);
    }
    updated += batch.length;
    console.log(`   Cleared ${updated}/${count}...`);
  }

  console.log('\n✅ Done. Cleared hero_image_url for', updated, 'restaurants.');
}

main();
