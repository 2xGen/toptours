/**
 * Helper functions for tour management
 * Generates slugs, manages tour data, and provides utilities for tour pages
 */

/** Viator affiliate params for booking links (pid is required for referral tracking). No campaign param. */
const VIATOR_AFFILIATE = {
  mcid: '42383',
  pid: 'P00276441',
  medium: 'api',
  api_version: '2.0',
};

/** Same partner IDs as API links, but for plain marketing URLs (destination / things-to-do pages). */
const VIATOR_LINK_AFFILIATE = {
  mcid: '42383',
  pid: 'P00276441',
  medium: 'link',
};

/**
 * Normalize Viator host so links work reliably (avoid shop.live.rc.viator.com).
 * @param {string} url
 * @returns {string}
 */
function normalizeViatorHost(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  return trimmed.replace(/^https?:\/\/shop\.live\.rc\.viator\.com/i, 'https://www.viator.com');
}

/**
 * Append TopTours.ai Viator affiliate params to a Viator URL.
 * - Preserves existing query string
 * - Does NOT duplicate params if already present
 * - Normalizes Viator host to www.viator.com
 * @param {string} url
 * @returns {string} url with affiliate params, or empty string if not a viator.com URL
 */
export function withViatorAffiliateParams(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = normalizeViatorHost(url);
  if (!trimmed) return '';
  if (!trimmed.includes('viator.com')) return '';
  try {
    const u = new URL(trimmed);
    // Only set if missing to avoid duplicates
    for (const [k, v] of Object.entries(VIATOR_AFFILIATE)) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    // Fallback: naive append if URL parsing fails
    const joiner = trimmed.includes('?') ? '&' : '?';
    const params = new URLSearchParams(VIATOR_AFFILIATE).toString();
    return `${trimmed}${joiner}${params}`;
  }
}

/**
 * Append affiliate params for standard link placements (destination hub, outbound marketing).
 * Uses medium=link and does not add api_version (matches typical Viator partner links).
 * @param {string} url
 * @returns {string}
 */
export function withViatorAffiliateLinkParams(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = normalizeViatorHost(url);
  if (!trimmed) return '';
  if (!trimmed.includes('viator.com')) return '';
  try {
    const u = new URL(trimmed);
    for (const [k, v] of Object.entries(VIATOR_LINK_AFFILIATE)) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    const joiner = trimmed.includes('?') ? '&' : '?';
    const params = new URLSearchParams(VIATOR_LINK_AFFILIATE).toString();
    return `${trimmed}${joiner}${params}`;
  }
}

/**
 * Viator "things to do" URL path segment from a display name (e.g. "Agra" → "Agra", "New York" → "New-York").
 * Strips diacritics so "Curaçao" → "Curacao"-style segments match Viator where applicable.
 * @param {string} name
 * @returns {string}
 */
export function viatorDestinationPathSegmentFromName(name) {
  if (!name || typeof name !== 'string') return '';
  const ascii = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'’]/g, '')
    .trim();
  if (!ascii) return '';
  return ascii
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-');
}

/**
 * Extract numeric Viator destination ID for /d{ID}-ttd URLs (handles "4547", "d4547", "828", "d828").
 * @param {string|number} raw
 * @returns {string} numeric id or empty string
 */
export function normalizeViatorDestinationNumericId(raw) {
  if (raw == null || raw === '') return '';
  const s = String(raw).trim();
  const m = s.match(/^d?(\d+)$/i);
  return m ? m[1] : '';
}

/**
 * Build tracked Viator destination "things to do" URL: https://www.viator.com/{City}/d{ID}-ttd
 * @param {object} destination
 * @param {string|number} [destination.destinationId]
 * @param {string|number} [destination.viatorDestinationId]
 * @param {string} [destination.fullName]
 * @param {string} [destination.name]
 * @returns {string} full URL with pid/mcid/medium=link, or '' if we cannot build safely
 */
export function getViatorDestinationHubUrl(destination) {
  if (!destination || typeof destination !== 'object') return '';
  const idRaw = destination.destinationId ?? destination.viatorDestinationId;
  const numeric = normalizeViatorDestinationNumericId(idRaw);
  if (!numeric) return '';
  const segment = viatorDestinationPathSegmentFromName(destination.fullName || destination.name || '');
  if (!segment) return '';
  const base = `https://www.viator.com/${segment}/d${numeric}-ttd`;
  return withViatorAffiliateLinkParams(base);
}

/**
 * Build a Viator URL for a product and append affiliate params.
 * Prefers an existing Viator productUrl (from API/DB) when provided.
 * @param {object} args
 * @param {string} [args.productUrl] - existing Viator URL to enrich
 * @param {string} [args.destinationSlug] - e.g. 'prague' (fallback only)
 * @param {string} args.productCode - Viator product code e.g. '2785DINNER'
 * @returns {string} Full Viator URL with affiliate params
 */
export function getViatorAffiliateTourUrl({ productUrl, destinationSlug, productCode }) {
  const enriched = withViatorAffiliateParams(productUrl);
  if (enriched) return enriched;
  if (!productCode) return '';
  // Match Prg365's proven-working booking URL format for Prague.
  if (destinationSlug === 'prague') {
    return withViatorAffiliateParams(`https://www.viator.com/Prague/d462-ttd/p-${String(productCode)}`);
  }
  // Tokyo: Viator uses /Tokyo/d334-ttd/p-{code}
  if (destinationSlug === 'tokyo') {
    return withViatorAffiliateParams(`https://www.viator.com/Tokyo/d334-ttd/p-${String(productCode)}`);
  }
  // Curaçao: Viator uses /Curacao/d725-ttd/p-{code}
  if (destinationSlug === 'curacao') {
    return withViatorAffiliateParams(`https://www.viator.com/Curacao/d725-ttd/p-${String(productCode)}`);
  }
  // Generic fallback (works for many products even without destination context)
  return withViatorAffiliateParams(`https://www.viator.com/tours/${String(productCode)}`);
}

// Define functions first, then export to avoid initialization order issues
function generateTourSlugInternal(title) {
  if (!title || typeof title !== 'string') return '';
  
  try {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/&/g, 'and')
      .replace(/'/g, '') // Remove apostrophes
      .replace(/\./g, '') // Remove periods
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  } catch (error) {
    console.error('Error generating tour slug:', error);
    return '';
  }
}

function getTourUrlInternal(productId, title) {
  if (!productId) return '#';
  try {
    const slug = generateTourSlugInternal(title || '');
    return `/tours/${String(productId)}${slug ? `/${slug}` : ''}`;
  } catch (error) {
    console.error('Error generating tour URL:', error);
    return `/tours/${String(productId)}`;
  }
}

/**
 * Generate a URL-friendly slug from a tour title
 * @param {string} title - Tour title
 * @returns {string} - URL-friendly slug
 */
export function generateTourSlug(title) {
  return generateTourSlugInternal(title);
}

/**
 * Generate tour URL path
 * @param {string} productId - Viator product ID
 * @param {string} title - Tour title
 * @returns {string} - Internal tour URL
 */
export function getTourUrl(productId, title) {
  return getTourUrlInternal(productId, title);
}

/**
 * Canonical path for a tour (one URL per tour for cache + SEO).
 * Use this for redirects, sitemaps, and internal links so all traffic hits the same path.
 * @param {string} productId - Viator product ID
 * @param {object} tour - Tour object (must have .title) or title string
 * @returns {string} - Path like /tours/123 or /tours/123/canonical-slug
 */
export function getTourCanonicalPath(productId, tour) {
  if (!productId) return '/tours';
  const title = typeof tour === 'string' ? tour : (tour?.title ?? '');
  const slug = generateTourSlugInternal(title || '');
  return slug ? `/tours/${String(productId)}/${slug}` : `/tours/${String(productId)}`;
}

/**
 * Extract product ID from tour object
 * @param {object} tour - Tour object from Viator API
 * @returns {string} - Product ID
 */
export function getTourProductId(tour) {
  return tour.productId || tour.productCode || tour.id || null;
}

/**
 * Get tour category from destination and search term
 * @param {string} destination - Destination name
 * @param {string} searchTerm - Search term used
 * @returns {string} - Category name
 */
export function extractCategoryFromSearch(destination, searchTerm) {
  if (!searchTerm || !destination) return null;
  
  const categoryKeywords = {
    'sunset cruise': 'Sunset Cruises',
    'sunset sail': 'Sunset Cruises',
    'atv tour': 'ATV Tours',
    'atv adventure': 'ATV Tours',
    'snorkeling': 'Snorkeling Tours',
    'snorkel': 'Snorkeling Tours',
    'diving': 'Diving Tours',
    'dive': 'Diving Tours',
    'catamaran': 'Catamaran Sailing',
    'sailing': 'Catamaran Sailing',
    'jeep tour': 'Jeep Off-Road Tours',
    'off-road': 'Jeep Off-Road Tours',
    'cultural': 'Cultural Tours',
    'heritage': 'Cultural Heritage Tours',
    'walking tour': 'Willemstad Walking Tours',
    'hiking': 'Piton Hiking Tours',
    'rainforest': 'Rainforest Tours',
    'mud bath': 'Volcanic Mud Bath Tours',
    'surfing': 'Surfing Tours',
    'rum': 'Rum Distillery Tours',
    'historical': 'Historical Tours'
  };
  
  const lowerSearch = searchTerm.toLowerCase();
  const lowerDest = destination.toLowerCase();
  const searchWithoutDest = lowerSearch.replace(lowerDest, '').trim();
  
  for (const [keyword, category] of Object.entries(categoryKeywords)) {
    if (searchWithoutDest.includes(keyword) || lowerSearch.includes(keyword)) {
      return category;
    }
  }
  
  return null;
}

/**
 * Get similar tours for a given tour
 * This will be used to show related tours on the detail page
 * @param {string} productId - Current tour product ID
 * @param {string} destination - Destination name
 * @param {string} category - Tour category
 * @param {array} allTours - Array of all available tours
 * @param {number} limit - Maximum number of similar tours to return
 * @returns {array} - Array of similar tours
 */
export function getSimilarTours(productId, destination, category, allTours = [], limit = 6) {
  if (!allTours || allTours.length === 0) return [];
  
  // Filter out the current tour
  const otherTours = allTours.filter(tour => {
    const tourId = getTourProductId(tour);
    return tourId !== productId;
  });
  
  // If we have a category, prioritize tours in the same category
  if (category) {
    const categoryTours = otherTours.filter(tour => {
      const tourTitle = (tour.title || '').toLowerCase();
      const categoryLower = category.toLowerCase();
      return tourTitle.includes(categoryLower.split(' ')[0]); // Match first word of category
    });
    
    // Sort by rating (highest first), then by review count
    const sorted = categoryTours.sort((a, b) => {
      const ratingA = a.reviews?.combinedAverageRating || 0;
      const ratingB = b.reviews?.combinedAverageRating || 0;
      const reviewsA = a.reviews?.totalReviews || 0;
      const reviewsB = b.reviews?.totalReviews || 0;
      
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      return reviewsB - reviewsA;
    });
    
    return sorted.slice(0, limit);
  }
  
  // If no category, return highest rated tours from the same destination
  const sorted = otherTours.sort((a, b) => {
    const ratingA = a.reviews?.combinedAverageRating || 0;
    const ratingB = b.reviews?.combinedAverageRating || 0;
    const reviewsA = a.reviews?.totalReviews || 0;
    const reviewsB = b.reviews?.totalReviews || 0;
    
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }
    return reviewsB - reviewsA;
  });
  
  return sorted.slice(0, limit);
}

