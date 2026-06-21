/**
 * Writes public/{INDEXNOW_KEY}.txt for IndexNow ownership verification.
 * Skips silently when INDEXNOW_KEY is not set.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getIndexNowKeyFromEnv, isValidIndexNowKey } from '../lib/indexNow.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

dotenv.config({ path: path.join(ROOT, '.env.local') });
dotenv.config({ path: path.join(ROOT, '.env') });

const key = getIndexNowKeyFromEnv();

if (!key) {
  console.log('  IndexNow: INDEXNOW_KEY not set — skipping key file');
  process.exit(0);
}

if (!isValidIndexNowKey(key)) {
  console.warn('  IndexNow: INDEXNOW_KEY has invalid format — skipping key file');
  process.exit(0);
}

const publicDir = path.join(ROOT, 'public');
fs.mkdirSync(publicDir, { recursive: true });

const keyFilePath = path.join(publicDir, `${key}.txt`);
fs.writeFileSync(keyFilePath, key, 'utf8');
console.log(`  IndexNow: wrote public/${key}.txt`);
