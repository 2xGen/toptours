/**
 * Build + SEO-patch operator indexes for one or more destinations.
 * Usage: node scripts/build-operator-page-rollout.mjs curacao prague arusha
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const slugs = process.argv.slice(2).length
  ? process.argv.slice(2).map((s) => s.toLowerCase())
  : ['curacao', 'prague', 'arusha'];

function runNode(script, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(ROOT, script), ...args], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${script} ${args.join(' ')} exited ${code}`))));
  });
}

for (const slug of slugs) {
  console.log(`\n========== ${slug} ==========\n`);
  await runNode('scripts/build-operator-page-index.mjs', [slug]);
  await runNode('scripts/patch-operator-page-seo.mjs', [slug]);
}

console.log('\nRollout build complete:', slugs.join(', '));
