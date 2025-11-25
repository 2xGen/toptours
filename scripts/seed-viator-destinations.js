/**
 * Seed Supabase with the full list of Viator destinations (id, name, slug, country, region).
 *
 * Usage:
 *   node scripts/seed-viator-destinations.js
 *
 * Requirements:
 *   - .env.local (or environment) must define:
 *       NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *       SUPABASE_SERVICE_ROLE_KEY
 *   - viatorDestinationsClassified.json must exist (already in repo)
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'viatorDestinationsClassified.json');

if (!fs.existsSync(DATA_PATH)) {
  console.error(`❌ Could not find ${DATA_PATH}. Make sure the JSON file exists.`);
  process.exit(1);
}

function slugifyName(name) {
  if (!name) return null;
  return name
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function seedDestinations() {
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  if (!Array.isArray(raw) || raw.length === 0) {
    console.error('❌ viatorDestinationsClassified.json is empty or invalid.');
    process.exit(1);
  }

  console.log(`📦 Preparing ${raw.length} destinations for upsert...`);

  const slugCounts = new Map();

  const records = raw.map((dest) => {
    const id = dest.destinationId?.toString();
    if (!id) return null;

    const name = dest.destinationName?.trim() || null;
    let slug = slugifyName(name) || `destination-${id}`;

    const count = slugCounts.get(slug) || 0;
    slugCounts.set(slug, count + 1);
    if (count > 0) {
      slug = `${slug}-${id}`;
    }

    return {
      id,
      name,
      slug,
      country: dest.country || null,
      region: dest.region || null,
      type: dest.type || null,
      parent_destination_id: dest.parentDestinationId ? dest.parentDestinationId.toString() : null,
      lookup_id: dest.lookupId || null,
      default_currency_code: dest.defaultCurrencyCode || null,
      time_zone: dest.timeZone || null,
      destination_url: dest.destinationUrl || null,
      country_calling_code: dest.countryCallingCode || null,
      iata_codes: dest.iataCodes || null,
      languages: dest.languages || null,
      raw: dest,
    };
  }).filter(Boolean);

  console.log(`🚀 Upserting ${records.length} destinations into Supabase...`);

  const chunkSize = 500;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('viator_destinations')
      .upsert(chunk, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Supabase error on chunk ${i / chunkSize + 1}:`, error.message);
      process.exit(1);
    }
    console.log(`✅ Upserted ${Math.min(i + chunkSize, records.length)} / ${records.length}`);
  }

  console.log('🎉 All destinations upserted successfully!');
}

seedDestinations().catch((error) => {
  console.error('❌ Unexpected error while seeding destinations:', error);
  process.exit(1);
});

