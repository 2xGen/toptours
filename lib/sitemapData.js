/**
 * Shared sitemap entry builder for app/sitemap.js.
 * Used so we can split into multiple sitemaps when >50k URLs (Google limit).
 */
import { getAllDestinations } from '../src/data/destinationsData.js';
import { travelGuides } from '../src/data/travelGuidesData.js';
import { createSupabaseServiceRoleClient } from '../src/lib/supabaseClient.js';
import { hasDestinationPage } from '../src/data/destinationFullContent.js';
import { getAllBabyEquipmentRentalsDestinations } from '../src/lib/babyEquipmentRentals.js';

const BASE_URL = 'https://toptours.ai';

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Returns all sitemap entries for the main sitemap (excludes tour product pages; those are in sitemap-tours).
 * @returns {Promise<Array<{ url: string, lastModified: string, changeFrequency?: string, priority?: number }>>}
 */
export async function getAllSitemapEntries() {
  const viatorDestinationsClassifiedData = (await import('../src/data/viatorDestinationsClassified.json')).default;
  const currentDate = new Date().toISOString();
  const addedPageDate = new Date('2026-01-26').toISOString();

  const staticPages = [
    { url: BASE_URL, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/destinations`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/travel-guides`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/how-it-works`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/disclosure`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/tours`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
  ];

  const destinations = getAllDestinations();
  const destinationPages = destinations.map((d) => ({
    url: `${BASE_URL}/destinations/${d.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
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
          priority: 0.8,
        });
      }
    }
  }

  const allDestinationIds = [...destinations.map((d) => d.id), ...fullContentSlugs];

  const tourListingPages = destinations.map((d) => ({
    url: `${BASE_URL}/destinations/${d.id}/tours`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  const operatorListingPages = destinations.map((d) => ({
    url: `${BASE_URL}/destinations/${d.id}/operators`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.72,
  }));

  const travelGuidePages = travelGuides.map((guide) => ({
    url: `${BASE_URL}/travel-guides/${guide.id}`,
    lastModified: guide.publishDate || guide.updatedAt || currentDate,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const babyEquipmentRentalDestinations = await getAllBabyEquipmentRentalsDestinations();
  const babyEquipmentRentalPages = babyEquipmentRentalDestinations.map((page) => ({
    url: `${BASE_URL}/destinations/${page.destination_id}/baby-equipment-rentals`,
    lastModified: page.updated_at || currentDate,
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
          if (guide.category_slug === 'airport-transfers') {
            airportTransferInDb.add(guide.destination_id.toLowerCase());
          }
          categoryGuidePages.push({
            url: `${BASE_URL}/destinations/${guide.destination_id}/guides/${guide.category_slug}`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
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
        .select('destination_id, tag_slug')
        .order('destination_id', { ascending: true })
        .range(from, from + pageSize - 1);
      if (tagError || !Array.isArray(tagGuides)) break;
      tagGuides.forEach((row) => {
        if (row.destination_id && row.tag_slug) {
          tagGuidePages.push({
            url: `${BASE_URL}/destinations/${row.destination_id}/guides/${row.tag_slug}`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        }
      });
      hasMore = tagGuides.length === pageSize;
      from += pageSize;
    }
  } catch (e) {
    console.warn('Failed to fetch tag_guide_content for sitemap:', e?.message);
  }

  const guidesListingPages = allDestinationIds.map((id) => ({
    url: `${BASE_URL}/destinations/${id}/guides`,
    lastModified: addedPageDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const carRentalPages = allDestinationIds.map((id) => ({
    url: `${BASE_URL}/destinations/${id}/car-rentals`,
    lastModified: addedPageDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const airportTransferPages = allDestinationIds
    .filter((id) => !airportTransferInDb.has(String(id).toLowerCase()))
    .map((id) => ({
      url: `${BASE_URL}/destinations/${id}/guides/airport-transfers`,
      lastModified: addedPageDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [
    ...staticPages,
    ...destinationPages,
    ...destinationsWithFullContent,
    ...tourListingPages,
    ...operatorListingPages,
    ...babyEquipmentRentalPages,
    ...travelGuidePages,
    ...guidesListingPages,
    ...carRentalPages,
    ...categoryGuidePages,
    ...tagGuidePages,
    ...airportTransferPages,
  ];
}

export const SITEMAP_CHUNK_SIZE = 50000; // Google limit per sitemap
