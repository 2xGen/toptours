/**
 * Move restaurants that are wrongly under Aruba (destination_id = 'aruba')
 * but are actually in Amsterdam/Netherlands to destination_id = 'amsterdam'.
 *
 * Does NOT delete; only updates destination_id, slug, and country_iso_code.
 *
 * Usage: node scripts/move-aruba-restaurants-to-amsterdam.js
 * Dry run (no DB writes): node scripts/move-aruba-restaurants-to-amsterdam.js --dry-run
 */

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '..', '.env.local') });
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const NEW_DESTINATION_ID = 'amsterdam';
const NEW_COUNTRY_ISO = 'NL';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) console.log('🔍 DRY RUN – no changes will be written\n');

  // Fetch all Aruba restaurants, then filter to those actually in Amsterdam/Netherlands
  const { data: allAruba, error: fetchError } = await supabase
    .from('restaurants')
    .select('id, destination_id, slug, name, formatted_address, address, country_iso_code')
    .eq('destination_id', 'aruba');

  if (fetchError) {
    console.error('❌ Fetch error:', fetchError.message);
    process.exit(1);
  }

  const rows = (allAruba || []).filter((r) => {
    const addr = (r.formatted_address || r.address || '').toLowerCase();
    const isNL = r.country_iso_code === 'NL';
    const hasAmsterdam = addr.includes('amsterdam');
    const hasNetherlands = addr.includes('netherlands');
    return isNL || hasAmsterdam || hasNetherlands;
  });

  if (rows.length === 0) {
    console.log('✅ No Aruba restaurants found that match Amsterdam/Netherlands. Nothing to move.');
    return;
  }

  console.log(`📋 Found ${rows.length} restaurant(s) under Aruba that are in Amsterdam/Netherlands:\n`);
  rows.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.name} | ${r.slug} | ${(r.formatted_address || r.address || '').slice(0, 60)}...`);
  });
  console.log('');

  if (dryRun) {
    console.log('Dry run: would update destination_id to "amsterdam", slug to *-amsterdam, country_iso_code to NL.');
    return;
  }

  let updated = 0;
  let slugConflicts = 0;

  for (const row of rows) {
    const baseSlug = row.slug.replace(/-aruba$/, '');
    let newSlug = `${baseSlug}-${NEW_DESTINATION_ID}`;

    const { data: existingSlug } = await supabase
      .from('restaurants')
      .select('id')
      .eq('destination_id', NEW_DESTINATION_ID)
      .eq('slug', newSlug)
      .maybeSingle();

    if (existingSlug) {
      let n = 1;
      while (true) {
        newSlug = `${baseSlug}-${n}-${NEW_DESTINATION_ID}`;
        const { data: conflict } = await supabase
          .from('restaurants')
          .select('id')
          .eq('destination_id', NEW_DESTINATION_ID)
          .eq('slug', newSlug)
          .maybeSingle();
        if (!conflict) break;
        n++;
      }
      slugConflicts++;
    }

    const { error: updateError } = await supabase
      .from('restaurants')
      .update({
        destination_id: NEW_DESTINATION_ID,
        slug: newSlug,
        country_iso_code: NEW_COUNTRY_ISO,
        data_updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    if (updateError) {
      console.error(`   ❌ ${row.name} (id ${row.id}): ${updateError.message}`);
    } else {
      updated++;
      console.log(`   ✓ ${row.name} → ${newSlug}`);
    }
  }

  console.log(`\n✅ Moved ${updated}/${rows.length} restaurants to Amsterdam.`);
  if (slugConflicts) console.log(`   (${slugConflicts} slug(s) adjusted due to existing Amsterdam slugs.)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
