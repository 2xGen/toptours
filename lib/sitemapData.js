/**
 * Shared sitemap entry builder for app/sitemap.js.
 * Used so we can split into multiple sitemaps when >50k URLs (Google limit).
 */
import { getAllDestinations } from '../src/data/destinationsData.js';
import { travelGuides } from '../src/data/travelGuidesData.js';
import { createSupabaseServiceRoleClient } from '../src/lib/supabaseClient.js';
import { hasDestinationPage } from '../src/data/destinationFullContent.js';
import { getAllBabyEquipmentRentalsDestinations } from '../src/lib/babyEquipmentRentals.js';
import { getSiteOrigin } from '../src/lib/siteUrl.js';
import { isLowValueGuideTag } from '../src/lib/guideIndexing.js';
import { isRestaurantLikelyInDestination } from '../src/lib/restaurants.js';

/** Tag guides with almost no cached body text tend to be "Crawled – not indexed"; keep them out of sitemap (still link-discoverable). */
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

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toSitemapLastMod(value, fallbackIso) {
  if (value == null || value === '') return fallbackIso;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallbackIso;
  return d.toISOString();
}

/**
 * Returns all sitemap entries for the main sitemap (excludes tour product pages; those are in sitemap-tours).
 * Too large for Next.js unstable_cache (2MB limit); rely on CDN Cache-Control + maxDuration on sitemap routes instead.
 * @returns {Promise<Array<{ url: string, lastModified: string, changeFrequency?: string, priority?: number }>>}
 */
export async function getAllSitemapEntries() {
  const BASE_URL = getSiteOrigin();
  const viatorDestinationsClassifiedData = (await import('../src/data/viatorDestinationsClassified.json')).default;
  // ISO time at sitemap generation (always reflects latest deploy/crawl hint; no stale fixed date).
  const currentDate = new Date().toISOString();

  // List only canonical URLs (no 301 targets): /tours → /destinations, /how-it-works → /match-your-style (see next.config.js)
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
      if (!dest || !dest.destinationName) continue;
      const slug = generateSlug(dest.destinationName || dest.name || '');
      if (curatedSlugs.has(slug)) continue;
      if (hasDestinationPage(slug)) {
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

  const operatorListingPages = destinations.map((d) => ({
    url: `${BASE_URL}/destinations/${d.id}/operators`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.72,
  }));

  const travelGuidePages = travelGuides.map((guide) => ({
    url: `${BASE_URL}/travel-guides/${guide.id}`,
    lastModified: toSitemapLastMod(guide.publishDate || guide.updatedAt, currentDate),
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  let babyEquipmentRentalDestinations = [];
  try {
    babyEquipmentRentalDestinations = await getAllBabyEquipmentRentalsDestinations();
  } catch (e) {
    console.warn('Failed to fetch baby equipment rentals for sitemap:', e?.message);
  }
  const babyEquipmentRentalPages = babyEquipmentRentalDestinations.map((page) => ({
    url: `${BASE_URL}/destinations/${page.destination_id}/baby-equipment-rentals`,
    lastModified: toSitemapLastMod(page.updated_at, currentDate),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  const categoryGuidePages = [];
  const airportTransferInDb = new Set();
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data: allGuides, error: guidesError } = await supabase
      .from('category_guides')
      .select('destination_id, category_slug')
      .order('destination_id', { ascending: true });
    if (!guidesError && Array.isArray(allGuides)) {
      allGuides.forEach((guide) => {
        if (guide.destination_id && guide.category_slug) {
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
        }
      });
    }
  } catch (e) {
    console.warn('Failed to fetch category guides for sitemap:', e?.message);
  }

  const tagGuidePages = [];
  try {
    const supabase = createSupabaseServiceRoleClient();
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    while (hasMore) {
      const { data: tagGuides, error: tagError } = await supabase
        .from('tag_guide_content')
        .select('destination_id, tag_slug, content, updated_at')
        .order('destination_id', { ascending: true })
        .range(from, from + pageSize - 1);
      if (tagError || !Array.isArray(tagGuides)) break;
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
    console.warn('Failed to fetch tag_guide_content for sitemap:', e?.message);
  }

  const carRentalPages = allDestinationIds.map((id) => ({
    url: `${BASE_URL}/destinations/${id}/car-rentals`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const airportTransferPages = allDestinationIds
    .filter((id) => !airportTransferInDb.has(String(id).toLowerCase()))
    .map((id) => ({
      url: `${BASE_URL}/destinations/${id}/guides/airport-transfers`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // Restaurant detail pages (re-enabled): include only active rows that pass destination-country quality checks.
  const destinationMap = new Map(
    destinations.map((d) => [d.id, d])
  );
  const restaurantPages = [];
  try {
    const supabase = createSupabaseServiceRoleClient();
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    while (hasMore) {
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('destination_id, slug, updated_at, is_active, country_iso_code, address_components, formatted_address')
        .eq('is_active', true)
        .not('slug', 'is', null)
        .range(from, from + pageSize - 1);
      if (restaurantsError || !Array.isArray(restaurants)) break;
      restaurants.forEach((row) => {
        const destination = destinationMap.get(row.destination_id);
        if (!destination || !row.slug) return;
        if (!isRestaurantLikelyInDestination(row, destination)) return;
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
    console.warn('Failed to fetch restaurants for sitemap:', e?.message);
  }

  // v3 explore: destination landing, tours list, category, subcategory, tour detail
  const explorePages = [];
  try {
    const supabase = createSupabaseServiceRoleClient();
    const [destRes, catRes, subRes, tourRes] = await Promise.all([
      supabase.from('v3_landing_destinations').select('slug').eq('is_active', true),
      supabase.from('v3_landing_categories').select('destination_slug, slug'),
      supabase.from('v3_landing_category_subcategories').select('destination_slug, category_slug, slug'),
      supabase.from('v3_landing_category_tours').select('destination_slug, category_slug, tour_slug').not('tour_slug', 'is', null),
    ]);
    const destinations = destRes.data || [];
    const categories = catRes.data || [];
    const subcategories = subRes.data || [];
    const tours = tourRes.data || [];
    destinations.forEach((d) => {
      if (d.slug) {
        explorePages.push({ url: `${BASE_URL}/explore/${d.slug}`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.91 });
        explorePages.push({ url: `${BASE_URL}/explore/${d.slug}/tours`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.88 });
      }
    });
    categories.forEach((c) => {
      if (c.destination_slug && c.slug) {
        explorePages.push({
          url: `${BASE_URL}/explore/${c.destination_slug}/${c.slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });
    subcategories.forEach((s) => {
      if (s.destination_slug && s.category_slug && s.slug) {
        explorePages.push({
          url: `${BASE_URL}/explore/${s.destination_slug}/${s.category_slug}/${s.slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.74,
        });
      }
    });
    tours.forEach((t) => {
      if (t.destination_slug && t.category_slug && t.tour_slug) {
        explorePages.push({
          url: `${BASE_URL}/explore/${t.destination_slug}/${t.category_slug}/${t.tour_slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.55,
        });
      }
    });
  } catch (e) {
    console.warn('Failed to fetch v3 explore pages for sitemap:', e?.message);
  }

  return [
    ...staticPages,
    ...destinationPages,
    ...destinationsWithFullContent,
    ...tourListingPages,
    ...operatorListingPages,
    ...babyEquipmentRentalPages,
    ...travelGuidePages,
    ...carRentalPages,
    ...categoryGuidePages,
    ...tagGuidePages,
    ...restaurantPages,
    ...airportTransferPages,
    ...explorePages,
  ];
}

export const SITEMAP_CHUNK_SIZE = 50000; // Google limit per sitemap
