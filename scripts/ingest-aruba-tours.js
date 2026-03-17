/**
 * Run ingest for ALL Aruba explore categories.
 *
 * What this does:
 *   Refreshes tour data in the database (v3_landing_category_tours) from the Viator API:
 *   - image_url, from_price, rating, review_count for every tour in every Aruba category.
 *   So category pages, tour detail pages, and "Similar tours" show photos and prices
 *   without calling the Viator API on every page load.
 *
 * Run after importing Aruba data:
 *   node scripts/import-aruba-explore.js "path/to/aruba-export.json"
 *   node scripts/ingest-aruba-tours.js
 *
 * Usage (from project root):
 *   node scripts/ingest-aruba-tours.js
 *
 * Env: .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      VIATOR_API_KEY, VIATOR_USE_LIVE_API=true
 *
 * To ingest a single Aruba category:
 *   node scripts/ingest-category-tours.js --destination=aruba --category=atv-and-jeep-tours-in-aruba
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generic = path.join(__dirname, 'ingest-category-tours.js');

const child = spawn(process.execPath, [generic, '--destination=aruba'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});

child.on('exit', (code) => process.exit(code ?? 0));
