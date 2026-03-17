/**
 * Run ingest for ALL Curaçao explore categories.
 * Refreshes image_url, from_price, rating, review_count, and title (when placeholder) from Viator.
 *
 * Usage (from project root):
 *   node scripts/ingest-curacao-tours.js
 *
 * Env: .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      VIATOR_API_KEY, VIATOR_USE_LIVE_API=true
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generic = path.join(__dirname, 'ingest-category-tours.js');

const child = spawn(process.execPath, [generic, '--destination=curacao'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});

child.on('exit', (code) => process.exit(code ?? 0));
