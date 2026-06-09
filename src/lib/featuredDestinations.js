/**
 * Featured destinations: curated hubs with a real hero image (manual upload).
 * All other Viator/generated slugs are removed from the public site.
 */
import featuredSlugs from '@/data/featuredDestinationSlugs.json';
import { getAllDestinations, getDestinationById } from '@/data/destinationsData';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';

function normalizeSlug(slug) {
  return String(slug || '').toLowerCase().trim();
}

const FEATURED_SLUG_SET = new Set(
  (Array.isArray(featuredSlugs) ? featuredSlugs : []).map(normalizeSlug)
);

export function getFeaturedDestinationSlugSet() {
  return FEATURED_SLUG_SET;
}

export function getFeaturedDestinationIds() {
  return Array.from(FEATURED_SLUG_SET);
}

export function isFeaturedDestination(slug) {
  if (!slug) return false;
  return FEATURED_SLUG_SET.has(normalizeSlug(slug));
}

export function getDestinationImageUrl(slug) {
  const curated = getDestinationById(slug);
  if (curated?.imageUrl) return curated.imageUrl;
  const full = getDestinationFullContent(slug);
  const seo = getDestinationSeoContent(slug);
  return full?.imageUrl || seo?.imageUrl || seo?.ogImage || null;
}

/**
 * Listing cards for /destinations (featured only).
 */
export function getFeaturedDestinationsForListing() {
  const seen = new Set();
  const results = [];

  for (const dest of getAllDestinations()) {
    if (!dest?.id || !isFeaturedDestination(dest.id)) continue;
    const id = normalizeSlug(dest.id);
    if (seen.has(id)) continue;
    seen.add(id);
    results.push({
      ...dest,
      isViator: false,
    });
  }

  for (const slug of getFeaturedDestinationIds()) {
    if (seen.has(slug)) continue;
    const full = getDestinationFullContent(slug);
    const seo = getDestinationSeoContent(slug);
    if (!full && !seo) continue;
    const imageUrl = getDestinationImageUrl(slug);
    if (!imageUrl) continue;
    seen.add(slug);
    results.push({
      id: slug,
      name: full?.destinationName || seo?.destinationName || slug,
      fullName: full?.destinationName || seo?.destinationName || slug,
      category: full?.region || seo?.region || null,
      region: full?.region || seo?.region || null,
      country: full?.country || seo?.country || null,
      briefDescription:
        seo?.briefDescription ||
        full?.briefDescription ||
        `Discover tours and activities in ${full?.destinationName || seo?.destinationName || slug}`,
      heroDescription: seo?.heroDescription || full?.heroDescription || null,
      imageUrl,
      tourCategories: Array.isArray(full?.tourCategories) ? full.tourCategories : [],
      whyVisit: Array.isArray(full?.whyVisit) ? full.whyVisit : [],
      highlights: Array.isArray(full?.highlights) ? full.highlights : [],
      gettingAround: full?.gettingAround || '',
      bestTimeToVisit: full?.bestTimeToVisit || null,
      seo: full?.seo || seo?.seo || null,
      isViator: false,
    });
  }

  return results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}
