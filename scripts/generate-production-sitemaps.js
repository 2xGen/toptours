/**
 * Pre-generate sitemap XML at build time so Google Search Console gets fast, reliable responses.
 * Standalone script (no Next.js path aliases) — runs via `npm run build`.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { buildSitemapEntries } from '../lib/buildSitemapEntries.js';
import { entriesToUrlsetXml, GENERATED_SITEMAP_DIR } from '../lib/sitemapXml.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env.local') });
dotenv.config({ path: path.join(ROOT, '.env') });

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai').replace(/\/$/, '');
const TOURS_PER_SITEMAP = 10000;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function generateTourSlug(title) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function createSupabase() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getTourSitemapCount(supabase) {
  const { count, error } = await supabase.from('tour_sitemap').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

async function getToursForSitemapPage(supabase, page, pageSize) {
  const startOffset = page * pageSize;
  const endOffset = startOffset + pageSize;
  const batchSize = 1000;
  const batches = [];
  for (let offset = startOffset; offset < endOffset; offset += batchSize) {
    batches.push({ offset, size: Math.min(batchSize, endOffset - offset) });
  }

  let allTours = [];
  for (let i = 0; i < batches.length; i += 5) {
    const chunk = batches.slice(i, i + 5);
    const results = await Promise.all(
      chunk.map(async ({ offset, size }) => {
        const { data, error } = await supabase
          .from('tour_sitemap')
          .select('product_id, tour_title, tour_slug, last_visited_at')
          .order('visit_count', { ascending: false })
          .range(offset, offset + size - 1);
        if (error) return [];
        return data || [];
      })
    );
    results.forEach((data) => {
      allTours = allTours.concat(data);
    });
    if (results.some((data) => data.length === 0)) break;
  }
  return allTours;
}

function toursToUrlsetXml(tours, pageIndex, totalTours) {
  const currentDate = new Date().toISOString().split('T')[0];
  const entries = tours
    .filter((t) => t.product_id)
    .map((tour) => {
      const slug = tour.tour_slug || (tour.tour_title ? generateTourSlug(tour.tour_title) : null);
      const url = slug ? `${BASE_URL}/tours/${tour.product_id}/${slug}` : `${BASE_URL}/tours/${tour.product_id}`;
      return {
        url,
        lastModified: tour.last_visited_at ? new Date(tour.last_visited_at).toISOString().split('T')[0] : currentDate,
        changeFrequency: 'weekly',
        priority: 0.45,
      };
    });
  const start = pageIndex * TOURS_PER_SITEMAP + 1;
  const end = Math.min((pageIndex + 1) * TOURS_PER_SITEMAP, totalTours);
  return entriesToUrlsetXml(entries, `Tour sitemap ${pageIndex} — ${start}-${end} of ${totalTours}`);
}

async function main() {
  fs.mkdirSync(GENERATED_SITEMAP_DIR, { recursive: true });
  console.log('Generating production sitemaps…');

  let supabase;
  try {
    supabase = createSupabase();
  } catch (err) {
    console.warn('  Supabase unavailable — writing empty sitemap:', err.message);
    fs.writeFileSync(
      path.join(GENERATED_SITEMAP_DIR, 'manifest.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), mainEntryCount: 0, tourCount: 0, tourChunks: 0 }, null, 2)
    );
    fs.writeFileSync(
      path.join(GENERATED_SITEMAP_DIR, 'sitemap.xml'),
      entriesToUrlsetXml([], 'TopTours.ai sitemap (empty — Supabase unavailable at build)')
    );
    return;
  }

  let mainEntries = [];
  try {
    mainEntries = await buildSitemapEntries({ baseUrl: BASE_URL, supabase });
    fs.writeFileSync(path.join(GENERATED_SITEMAP_DIR, 'main-entries.json'), JSON.stringify(mainEntries));
    fs.writeFileSync(
      path.join(GENERATED_SITEMAP_DIR, 'sitemap.xml'),
      entriesToUrlsetXml(mainEntries, `TopTours.ai — ${mainEntries.length} URLs`)
    );
    console.log(`  Main sitemap (/sitemap.xml): ${mainEntries.length.toLocaleString('en-US')} URLs`);
  } catch (err) {
    console.error('  Failed main sitemap:', err?.message || err);
  }

  let tourChunks = 0;
  let totalTours = 0;

  const includeTourSitemap = process.env.ENABLE_TOUR_SITEMAP === 'true';
  if (includeTourSitemap) {
    try {
      totalTours = await getTourSitemapCount(supabase);
      tourChunks = totalTours > 0 ? Math.ceil(totalTours / TOURS_PER_SITEMAP) : 0;
      console.log(`  Tour sitemap entries: ${totalTours.toLocaleString('en-US')} (${tourChunks} file(s))`);
      for (let i = 0; i < tourChunks; i++) {
        const tours = await getToursForSitemapPage(supabase, i, TOURS_PER_SITEMAP);
        fs.writeFileSync(path.join(GENERATED_SITEMAP_DIR, `tours-${i}.xml`), toursToUrlsetXml(tours, i, totalTours));
        console.log(`    wrote tours-${i}.xml (${tours.length.toLocaleString('en-US')} URLs)`);
      }
    } catch (err) {
      console.error('  Failed tour sitemaps:', err?.message || err);
    }
  } else {
    console.log('  Tour sitemap: skipped (ENABLE_TOUR_SITEMAP is not true)');
  }

  const lastmod = new Date().toISOString();
  fs.writeFileSync(
    path.join(GENERATED_SITEMAP_DIR, 'manifest.json'),
    JSON.stringify(
      {
        generatedAt: lastmod,
        origin: BASE_URL,
        mainEntryCount: mainEntries.length,
        sitemapUrl: `${BASE_URL}/sitemap.xml`,
        tourCount: totalTours,
        tourChunks,
      },
      null,
      2
    )
  );

  // Remove legacy sitemap index (was pointing at missing /sitemap/0.xml)
  const legacyIndex = path.join(GENERATED_SITEMAP_DIR, 'sitemap-index.xml');
  if (fs.existsSync(legacyIndex)) fs.unlinkSync(legacyIndex);

  console.log(`  Wrote public/generated-sitemaps/sitemap.xml`);
}

main().catch((err) => {
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});
