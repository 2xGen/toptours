/**
 * Single source of truth for sitemap URLs (featured destinations only).
 * Uses relative imports only (safe for standalone build scripts).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllDestinations } from '../src/data/destinationsData.js';
import { travelGuides } from '../src/data/travelGuidesData.js';
import { isLowValueGuideTag } from '../src/lib/guideIndexing.js';
import { isRestaurantLikelyInDestination } from './restaurantDestinationMatch.js';
import { fetchAllSupabaseRows } from './fetchSupabasePage.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function getFeaturedDestinationIds() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'src/data/featuredDestinationSlugs.json'), 'utf8')
  );
  return Array.isArray(raw) ? raw : [];
}

function defaultBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai').replace(/\/$/, '');
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

function dedupeEntriesByUrl(entries) {
  const seen = new Set();
  const result = [];
  for (const entry of entries) {
    const url = entry?.url;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    result.push(entry);
  }
  return result;
}

/**
 * @param {{ baseUrl?: string, supabase: import('@supabase/supabase-js').SupabaseClient }} options
 */
export async function buildSitemapEntries({ baseUrl = defaultBaseUrl(), supabase }) {
  const BASE_URL = String(baseUrl).replace(/\/$/, '');
  const currentDate = new Date().toISOString();
  const featuredIds = getFeaturedDestinationIds();
  const featuredSlugSet = new Set(featuredIds.map((id) => String(id).toLowerCase()));

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

  const destinations = getAllDestinations().filter((d) => featuredSlugSet.has(String(d.id).toLowerCase()));
  const destinationMap = new Map(destinations.map((d) => [d.id, d]));

  const destinationPages = featuredIds.map((slug) => ({
    url: `${BASE_URL}/destinations/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.92,
  }));

  const tourListingPages = featuredIds.map((slug) => ({
    url: `${BASE_URL}/destinations/${slug}/tours`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.91,
  }));

  const travelGuidePages = travelGuides.map((guide) => ({
    url: `${BASE_URL}/travel-guides/${guide.id}`,
    lastModified: toSitemapLastMod(guide.publishDate || guide.updatedAt, currentDate),
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  let babyEquipmentRentalPages = [];
  try {
    const rows = await fetchAllSupabaseRows(
      supabase,
      'baby_equipment_rentals',
      'destination_id, updated_at, is_active',
      { orderBy: { column: 'destination_id' } }
    );
    babyEquipmentRentalPages = rows
      .filter((page) => page.is_active !== false && featuredSlugSet.has(String(page.destination_id).toLowerCase()))
      .map((page) => ({
        url: `${BASE_URL}/destinations/${page.destination_id}/baby-equipment-rentals`,
        lastModified: toSitemapLastMod(page.updated_at, currentDate),
        changeFrequency: 'monthly',
        priority: 0.75,
      }));
  } catch (e) {
    console.warn('Failed to fetch baby equipment rentals for sitemap:', e?.message);
    try {
      const { data } = await supabase
        .from('baby_equipment_rentals')
        .select('destination_id, updated_at')
        .eq('is_active', true);
      babyEquipmentRentalPages = (data || [])
        .filter((page) => featuredSlugSet.has(String(page.destination_id).toLowerCase()))
        .map((page) => ({
          url: `${BASE_URL}/destinations/${page.destination_id}/baby-equipment-rentals`,
          lastModified: toSitemapLastMod(page.updated_at, currentDate),
          changeFrequency: 'monthly',
          priority: 0.75,
        }));
    } catch {
      // optional table
    }
  }

  const categoryGuidePages = [];
  const airportTransferInDb = new Set();
  try {
    const allGuides = await fetchAllSupabaseRows(
      supabase,
      'category_guides',
      'destination_id, category_slug',
      { orderBy: { column: 'destination_id' } }
    );
    for (const guide of allGuides) {
      if (!guide.destination_id || !guide.category_slug) continue;
      if (!featuredSlugSet.has(String(guide.destination_id).toLowerCase())) continue;
      if (isLowValueGuideTag({ slug: guide.category_slug, name: guide.category_slug })) continue;
      if (guide.category_slug === 'airport-transfers') {
        airportTransferInDb.add(String(guide.destination_id).toLowerCase());
      }
      categoryGuidePages.push({
        url: `${BASE_URL}/destinations/${guide.destination_id}/guides/${guide.category_slug}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.86,
      });
    }
  } catch (e) {
    console.warn('Failed to fetch category guides for sitemap:', e?.message);
  }

  const tagGuidePages = [];
  try {
    const tagRows = await fetchAllSupabaseRows(
      supabase,
      'tag_guide_content',
      'destination_id, tag_slug, tag_name_en, content',
      { orderBy: { column: 'destination_id' } }
    );
    for (const tag of tagRows) {
      if (!tag.destination_id || !tag.tag_slug) continue;
      if (!featuredSlugSet.has(String(tag.destination_id).toLowerCase())) continue;
      if (isLowValueGuideTag({ slug: tag.tag_slug, name: tag.tag_name_en })) continue;
      if (!tagGuideContentMeetsSitemapThreshold(tag.content)) continue;
      tagGuidePages.push({
        url: `${BASE_URL}/destinations/${tag.destination_id}/guides/${tag.tag_slug}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.84,
      });
    }
  } catch (e) {
    console.warn('Failed to fetch tag guides for sitemap:', e?.message);
  }

  const airportTransferPages = featuredIds
    .filter((id) => !airportTransferInDb.has(String(id).toLowerCase()))
    .map((id) => ({
      url: `${BASE_URL}/destinations/${id}/guides/airport-transfers`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const restaurantPages = [];
  try {
    const restaurantRows = await fetchAllSupabaseRows(
      supabase,
      'restaurants',
      'destination_id, slug, updated_at, is_active, country_iso_code, address_components, formatted_address',
      { orderBy: { column: 'destination_id' } }
    );
    for (const row of restaurantRows) {
      if (!row.is_active || !row.slug) continue;
      if (!featuredSlugSet.has(String(row.destination_id).toLowerCase())) continue;
      const destination = destinationMap.get(row.destination_id);
      if (!destination) continue;
      if (!isRestaurantLikelyInDestination(row, destination)) continue;
      restaurantPages.push({
        url: `${BASE_URL}/destinations/${row.destination_id}/restaurants/${row.slug}`,
        lastModified: toSitemapLastMod(row.updated_at, currentDate),
        changeFrequency: 'weekly',
        priority: 0.74,
      });
    }
  } catch (e) {
    console.warn('Failed to fetch restaurants for sitemap:', e?.message);
  }

  const operatorPages = [];
  try {
    const operatorDir = path.join(ROOT, 'src/data/operatorPages');
    if (fs.existsSync(operatorDir)) {
      for (const file of fs.readdirSync(operatorDir)) {
        if (!file.endsWith('.json')) continue;
        const destSlug = file.replace(/\.json$/, '');
        if (!featuredSlugSet.has(destSlug.toLowerCase())) continue;
        let index;
        try {
          index = JSON.parse(fs.readFileSync(path.join(operatorDir, file), 'utf8'));
        } catch {
          continue;
        }
        const lastMod = toSitemapLastMod(index.builtAt || index.patchedAt, currentDate);
        operatorPages.push({
          url: `${BASE_URL}/destinations/${destSlug}/operators`,
          lastModified: lastMod,
          changeFrequency: 'monthly',
          priority: 0.78,
        });
        for (const op of index.operators || []) {
          if (!op?.slug) continue;
          operatorPages.push({
            url: `${BASE_URL}/destinations/${destSlug}/operators/${op.slug}`,
            lastModified: lastMod,
            changeFrequency: 'monthly',
            priority: 0.74,
          });
        }
      }
    }
  } catch (e) {
    console.warn('Failed to read operator page indexes for sitemap:', e?.message);
  }

  return dedupeEntriesByUrl([
    ...staticPages,
    ...destinationPages,
    ...tourListingPages,
    ...babyEquipmentRentalPages,
    ...travelGuidePages,
    ...categoryGuidePages,
    ...tagGuidePages,
    ...restaurantPages,
    ...airportTransferPages,
    ...operatorPages,
  ]);
}
