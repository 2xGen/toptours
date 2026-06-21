/**
 * Submits sitemap URLs to IndexNow after production sitemap generation.
 * Reads public/generated-sitemaps/main-entries.json (priority URLs by default).
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GENERATED_SITEMAP_DIR } from '../lib/sitemapXml.js';
import {
  filterSitemapEntriesForIndexNow,
  getIndexNowKeyFromEnv,
  isValidIndexNowKey,
  shouldSubmitIndexNowAtBuild,
  submitUrlsToIndexNow,
} from '../lib/indexNow.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

dotenv.config({ path: path.join(ROOT, '.env.local') });
dotenv.config({ path: path.join(ROOT, '.env') });

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai').replace(/\/$/, '');
const SUBMIT_MODE = String(process.env.INDEXNOW_SUBMIT_MODE || 'priority').toLowerCase() === 'all' ? 'all' : 'priority';

async function main() {
  const key = getIndexNowKeyFromEnv();
  if (!key) {
    console.log('  IndexNow: INDEXNOW_KEY not set — skipping submit');
    return;
  }

  if (!isValidIndexNowKey(key)) {
    console.warn('  IndexNow: INDEXNOW_KEY has invalid format — skipping submit');
    return;
  }

  if (!shouldSubmitIndexNowAtBuild()) {
    console.log('  IndexNow: skipping submit (not a production deploy; set INDEXNOW_SUBMIT=true to override)');
    return;
  }

  const entriesPath = path.join(GENERATED_SITEMAP_DIR, 'main-entries.json');
  if (!fs.existsSync(entriesPath)) {
    console.warn('  IndexNow: main-entries.json not found — run generate-production-sitemaps first');
    return;
  }

  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
  } catch (err) {
    console.warn('  IndexNow: failed to read main-entries.json:', err?.message || err);
    return;
  }

  const urls = filterSitemapEntriesForIndexNow(entries, SUBMIT_MODE);
  if (urls.length === 0) {
    console.log(`  IndexNow: no URLs to submit (mode=${SUBMIT_MODE})`);
    return;
  }

  console.log(`  IndexNow: submitting ${urls.length.toLocaleString('en-US')} URL(s) (mode=${SUBMIT_MODE})…`);

  try {
    const result = await submitUrlsToIndexNow({ urls, origin: BASE_URL, key });
    const statuses = result.responses.map((r) => r.status).join(', ');
    console.log(
      `  IndexNow: submitted ${result.submitted.toLocaleString('en-US')} URL(s) in ${result.batches} batch(es) — HTTP ${statuses}`
    );
  } catch (err) {
    console.warn('  IndexNow: submit failed (build continues):', err?.message || err);
  }
}

main();
