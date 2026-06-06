/**
 * Pre-generate sitemap XML at build time so Google Search Console gets fast, reliable responses.
 * Standalone script (no Next.js path aliases) — runs via `npm run build`.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { getAllDestinations } from '../src/data/destinationsData.js';
import { travelGuides } from '../src/data/travelGuidesData.js';
import { isLowValueGuideTag } from '../src/lib/guideIndexing.js';
import { buildSitemapIndexXml, entriesToUrlsetXml, GENERATED_SITEMAP_DIR } from '../lib/sitemapXml.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env.local') });
dotenv.config({ path: path.join(ROOT, '.env') });
const TOURS_PER_SITEMAP = 10000;
const MAIN_CHUNK_SIZE = 50000;
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai').replace(/\/$/, '');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function readJson(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function generateSlug(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateTourSlug(title) {
  return generateSlug(title);
}

function toSitemapLastMod(value, fallbackIso) {
  if (value == null || value === '') return fallbackIso;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallbackIso;
  return d.toISOString();
}

function tagGuideContentMeetsSitemapThreshold(raw) {
  if (raw == null) return false;
  let c;
  try {
    c = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return false;
  }
  if (!c || typeof c !== 'object') return false;
  const chunks = [
    c.introduction,
    c.subtitle,
    c.seo?.description,
    Array.isArray(c.whyChoose) ? c.whyChoose.join(' ') : '',
    Array.isArray(c.faqs) ? c.faqs.map((f) => `${f?.question || ''} ${f?.answer || ''}`).join(' ') : '',
  ];
  const total = chunks.reduce((sum, t) => sum + String(t || '').trim().length, 0);
  return total >= 400;
}

function hasDestinationPage(slug, fullContentKeys) {
  return fullContentKeys.has(String(slug).toLowerCase());
}

function createSupabase() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function buildMainSitemapEntries(supabase) {
  const currentDate = new Date().toISOString();
  const viatorDestinationsClassifiedData = readJson('src/data/viatorDestinationsClassified.json') || [];
  const fullContentRaw = readJson('generated-destination-full-content.json') || {};
  const fullContentKeys = new Set(Object.keys(fullContentRaw).map((k) => k.toLowerCase()));

  const staticPages = [
    { url: BASE_URL, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/destinations`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/travel-guides`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.91 },
    { url: `${BASE_URL}/match-your-style`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/travel-insurance`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/disclosure`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const destinations = getAllDestinations();
  const destinationPages = destinations.map((d) => ({
    url: `${BASE_URL}/destinations/${d.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.92,
  }));

  const destinationsWithFullContent = [];
  const fullContentSlugs = [];
  if (Array.isArray(viatorDestinationsClassifiedData)) {
    const curatedSlugs = new Set(destinations.map((d) => d.id.toLowerCase()));
    for (const dest of viatorDestinationsClassifiedData) {
      if (!dest?.destinationName) continue;
      const slug = generateSlug(dest.destinationName || dest.name || '');
      if (curatedSlugs.has(slug)) continue;
      if (hasDestinationPage(slug, fullContentKeys)) {
        fullContentSlugs.push(slug);
        destinationsWithFullContent.push({
          url: `${BASE_URL}/destinations/${slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
    }
  }

  const allDestinationIds = [...destinations.map((d) => d.id), ...fullContentSlugs];
  const tourListingPages = destinations.map((d) => ({
    url: `${BASE_URL}/destinations/${d.id}/tours`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.88,
  }));

  const travelGuidePages = travelGuides.map((guide) => ({
    url: `${BASE_URL}/travel-guides/${guide.id}`,
    lastModified: toSitemapLastMod(guide.publishDate || guide.updatedAt, currentDate),
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  let babyEquipmentRentalPages = [];
  try {
    const { data } = await supabase.from('baby_equipment_rentals').select('destination_id, updated_at').eq('is_active', true);
    babyEquipmentRentalPages = (data || []).map((page) => ({
      url: `${BASE_URL}/destinations/${page.destination_id}/baby-equipment-rentals`,
      lastModified: toSitemapLastMod(page.updated_at, currentDate),
      changeFrequency: 'monthly',
      priority: 0.75,
    }));
  } catch (e) {
    console.warn('  baby equipment rentals skipped:', e?.message);
  }

  const categoryGuidePages = [];
  const airportTransferInDb = new Set();
  try {
    const { data: allGuides, error } = await supabase
      .from('category_guides')
      .select('destination_id, category_slug')
      .order('destination_id', { ascending: true });
    if (!error && Array.isArray(allGuides)) {
      allGuides.forEach((guide) => {
        if (!guide.destination_id || !guide.category_slug) return;
        if (isLowValueGuideTag({ slug: guide.category_slug, name: guide.category_slug })) return;
        if (guide.category_slug === 'airport-transfers') {
          airportTransferInDb.add(guide.destination_id.toLowerCase());
        }
        categoryGuidePages.push({
          url: `${BASE_URL}/destinations/${guide.destination_id}/guides/${guide.category_slug}`,
          lastModified: currentDate,
          changeFrequency: 'monthly',
          priority: 0.86,
        });
      });
    }
  } catch (e) {
    console.warn('  category guides skipped:', e?.message);
  }

  const tagGuidePages = [];
  try {
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    while (hasMore) {
      const { data: tagGuides, error } = await supabase
        .from('tag_guide_content')
        .select('destination_id, tag_slug, content, updated_at')
        .order('destination_id', { ascending: true })
        .range(from, from + pageSize - 1);
      if (error || !Array.isArray(tagGuides)) break;
      tagGuides.forEach((row) => {
        if (row.destination_id && row.tag_slug && tagGuideContentMeetsSitemapThreshold(row.content)) {
          if (isLowValueGuideTag({ slug: row.tag_slug, name: row.tag_slug })) return;
          tagGuidePages.push({
            url: `${BASE_URL}/destinations/${row.destination_id}/guides/${row.tag_slug}`,
            lastModified: toSitemapLastMod(row.updated_at, currentDate),
            changeFrequency: 'monthly',
            priority: 0.86,
          });
        }
      });
      hasMore = tagGuides.length === pageSize;
      from += pageSize;
    }
  } catch (e) {
    console.warn('  tag guides skipped:', e?.message);
  }

  const airportTransferPages = allDestinationIds
    .filter((id) => !airportTransferInDb.has(String(id).toLowerCase()))
    .map((id) => ({
      url: `${BASE_URL}/destinations/${id}/guides/airport-transfers`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const destinationMap = new Map(destinations.map((d) => [d.id, d]));
  const restaurantPages = [];
  try {
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    while (hasMore) {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('destination_id, slug, updated_at, is_active')
        .eq('is_active', true)
        .not('slug', 'is', null)
        .range(from, from + pageSize - 1);
      if (error || !Array.isArray(restaurants)) break;
      restaurants.forEach((row) => {
        if (!destinationMap.has(row.destination_id) || !row.slug) return;
        restaurantPages.push({
          url: `${BASE_URL}/destinations/${row.destination_id}/restaurants/${row.slug}`,
          lastModified: toSitemapLastMod(row.updated_at, currentDate),
          changeFrequency: 'weekly',
          priority: 0.74,
        });
      });
      hasMore = restaurants.length === pageSize;
      from += pageSize;
    }
  } catch (e) {
    console.warn('  restaurants skipped:', e?.message);
  }

  const explorePages = [];
  try {
    const [destRes, catRes, subRes, tourRes] = await Promise.all([
      supabase.from('v3_landing_destinations').select('slug').eq('is_active', true),
      supabase.from('v3_landing_categories').select('destination_slug, slug'),
      supabase.from('v3_landing_category_subcategories').select('destination_slug, category_slug, slug'),
      supabase.from('v3_landing_category_tours').select('destination_slug, category_slug, tour_slug').not('tour_slug', 'is', null),
    ]);
    (destRes.data || []).forEach((d) => {
      if (!d.slug) return;
      explorePages.push({ url: `${BASE_URL}/explore/${d.slug}`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.91 });
      explorePages.push({ url: `${BASE_URL}/explore/${d.slug}/tours`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.88 });
    });
    (catRes.data || []).forEach((c) => {
      if (c.destination_slug && c.slug) {
        explorePages.push({ url: `${BASE_URL}/explore/${c.destination_slug}/${c.slug}`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 });
      }
    });
    (subRes.data || []).forEach((s) => {
      if (s.destination_slug && s.category_slug && s.slug) {
        explorePages.push({ url: `${BASE_URL}/explore/${s.destination_slug}/${s.category_slug}/${s.slug}`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.74 });
      }
    });
    (tourRes.data || []).forEach((t) => {
      if (t.destination_slug && t.category_slug && t.tour_slug) {
        explorePages.push({ url: `${BASE_URL}/explore/${t.destination_slug}/${t.category_slug}/${t.tour_slug}`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.55 });
      }
    });
  } catch (e) {
    console.warn('  explore pages skipped:', e?.message);
  }

  return [
    ...staticPages,
    ...destinationPages,
    ...destinationsWithFullContent,
    ...tourListingPages,
    ...babyEquipmentRentalPages,
    ...travelGuidePages,
    ...categoryGuidePages,
    ...tagGuidePages,
    ...restaurantPages,
    ...airportTransferPages,
    ...explorePages,
  ];
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
    console.warn('  Supabase unavailable — writing empty manifest only:', err.message);
    fs.writeFileSync(
      path.join(GENERATED_SITEMAP_DIR, 'manifest.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), mainEntryCount: 0, mainChunks: 1, tourCount: 0, tourChunks: 0 }, null, 2)
    );
    fs.writeFileSync(
      path.join(GENERATED_SITEMAP_DIR, 'sitemap-index.xml'),
      buildSitemapIndexXml([`${BASE_URL}/sitemap/0.xml`], new Date().toISOString())
    );
    return;
  }

  let mainEntries = [];
  try {
    mainEntries = await buildMainSitemapEntries(supabase);
    fs.writeFileSync(path.join(GENERATED_SITEMAP_DIR, 'main-entries.json'), JSON.stringify(mainEntries));
    console.log(`  Main sitemap entries: ${mainEntries.length.toLocaleString('en-US')}`);
  } catch (err) {
    console.error('  Failed main sitemap:', err?.message || err);
  }

  const mainChunks = Math.max(1, Math.ceil(mainEntries.length / MAIN_CHUNK_SIZE));
  let tourChunks = 0;
  let totalTours = 0;

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

  const lastmod = new Date().toISOString();
  const indexLocs = [];
  for (let i = 0; i < mainChunks; i++) indexLocs.push(`${BASE_URL}/sitemap/${i}.xml`);
  for (let i = 0; i < tourChunks; i++) indexLocs.push(`${BASE_URL}/sitemap-tours/${i}`);

  fs.writeFileSync(path.join(GENERATED_SITEMAP_DIR, 'sitemap-index.xml'), buildSitemapIndexXml(indexLocs, lastmod));
  fs.writeFileSync(
    path.join(GENERATED_SITEMAP_DIR, 'manifest.json'),
    JSON.stringify({ generatedAt: lastmod, origin: BASE_URL, mainEntryCount: mainEntries.length, mainChunks, tourCount: totalTours, tourChunks }, null, 2)
  );

  console.log(`  Sitemap index: ${indexLocs.length} child sitemap(s) → public/generated-sitemaps/`);
}

main().catch((err) => {
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});
