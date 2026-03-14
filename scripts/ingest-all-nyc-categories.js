/**
 * Run ingest for ALL New York City explore categories.
 *
 * What this does:
 *   Refreshes tour data in the database (v3_landing_category_tours) from the Viator API:
 *   - image_url, from_price, rating, review_count for every tour in every NYC category.
 *   So category pages, landing "Popular now", and "View all tours" show photos and prices
 *   without calling the Viator API on every page load (faster, cheaper, better UX).
 *
 * Usage (from project root):
 *   node scripts/ingest-all-nyc-categories.js
 *
 * Env: .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      VIATOR_API_KEY, VIATOR_USE_LIVE_API=true
 *
 * To ingest a single category: node scripts/ingest-category-tours.js --destination=new-york-city --category=brooklyn-tours
 * To ingest all destinations (not just NYC): node scripts/ingest-category-tours.js
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generic = path.join(__dirname, 'ingest-category-tours.js');

const child = spawn(process.execPath, [generic, '--destination=new-york-city'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});

child.on('exit', (code) => process.exit(code ?? 0));
