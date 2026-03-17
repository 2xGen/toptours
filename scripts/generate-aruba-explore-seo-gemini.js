/**
 * Run all Gemini-enhanced SEO scripts for Aruba explore pages.
 *
 * Runs in order:
 *   1. Category pages (e.g. /explore/aruba/atv-and-jeep-tours-in-aruba)
 *   2. Subcategory pages (e.g. /explore/aruba/.../natural-pool-atv)
 *   3. Tour pages (e.g. /explore/aruba/.../natural-pool-and-cave-explorer)
 *
 * Prerequisites:
 *   - Aruba data imported: node scripts/import-aruba-explore.js "path/to/aruba-export.json"
 *   - Optional: node scripts/ingest-aruba-tours.js (for Viator descriptions used in tour SEO)
 *   - Run docs/seeds/add_category_page_seo_columns.sql if not already applied
 *
 * Usage (from project root):
 *   node scripts/generate-aruba-explore-seo-gemini.js
 *   node scripts/generate-aruba-explore-seo-gemini.js --dry-run
 *   node scripts/generate-aruba-explore-seo-gemini.js --overwrite
 *   node scripts/generate-aruba-explore-seo-gemini.js --limit 2
 *
 * Env: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VIATOR_API_KEY (for tour SEO)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const DEST = 'aruba';

// Forward these flags to all scripts (--limit needs its value as next arg)
const rest = process.argv.slice(2);
const forward = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === '--dry-run' || rest[i] === '--overwrite') forward.push(rest[i]);
  else if (rest[i] === '--limit' && rest[i + 1] != null) {
    forward.push('--limit', rest[i + 1]);
    i++;
  }
}

function run(scriptName, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const args = [
      path.join(__dirname, scriptName),
      '--destination', DEST,
      ...forward,
      ...extraArgs,
    ];
    const child = spawn(process.execPath, args, {
      stdio: 'inherit',
      cwd: root,
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code !== 0) reject(new Error(`${scriptName} exited with ${code}`));
      else resolve();
    });
  });
}

async function main() {
  console.log('🌴 Aruba explore SEO: running Gemini scripts for destination=aruba\n');

  console.log('📄 Step 1/3: Category pages (seo_meta_title, hero_description, about, faq_json, etc.)');
  await run('generate-explore-category-seo-gemini.js');

  console.log('\n📄 Step 2/3: Subcategory pages (description, about, faq_json, why_book, etc.)');
  await run('generate-explore-subcategory-seo-gemini.js');

  console.log('\n📄 Step 3/3: Tour pages (seo_meta_title, seo_about, who_is_this_for, faq_json, etc.)');
  await run('generate-explore-tour-seo-gemini.js');

  console.log('\n✅ Aruba explore SEO generation complete.');
}

main().catch((err) => {
  console.error('❌', err.message || err);
  process.exit(1);
});
