/**
 * Ingest Central Park tours (NYC) — thin wrapper around the generic ingest script.
 *
 * Run (from project root):
 *   node scripts/ingest-central-park-tours.js
 *
 * Same as:
 *   node scripts/ingest-category-tours.js --destination=new-york-city --category=central-park-tours
 *
 * For other categories or all NYC, use scripts/ingest-category-tours.js directly.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generic = path.join(__dirname, 'ingest-category-tours.js');

const child = spawn(
  process.execPath,
  [generic, '--destination=new-york-city', '--category=central-park-tours'],
  { stdio: 'inherit', cwd: path.join(__dirname, '..') }
);

child.on('exit', (code) => process.exit(code ?? 0));
