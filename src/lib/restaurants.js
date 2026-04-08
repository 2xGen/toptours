/**
 * Restaurant data fetching from Supabase database
 */

import { createSupabaseServiceRoleClient } from './supabaseClient';

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalCountry(value) {
  const v = normalizeText(value);
  const aliases = {
    us: 'united states',
    usa: 'united states',
    'united states of america': 'united states',
    gb: 'united kingdom',
    uk: 'united kingdom',
    britain: 'united kingdom',
    'great britain': 'united kingdom',
    'czech republic': 'czechia',
  };
  return aliases[v] || v;
}

function inferCountryFromAddress(row) {
  const address = normalizeText(
    row?.formatted_address ||
      row?.formattedAddress ||
      row?.contact?.address ||
      row?.address ||
      '',
  );
  if (!address) return '';

  if (address.includes(' usa') || address.includes(' united states')) return 'united states';
  if (address.includes(' uk') || address.includes(' united kingdom')) return 'united kingdom';

  const parts = address
    .split(',')
    .map((p) => canonicalCountry(p.trim()))
    .filter(Boolean);
  const tail = parts.slice(-2);
  for (const chunk of tail) {
    if (chunk.length >= 3 && chunk.length <= 40) return chunk;
  }

  return '';
}

const COUNTRY_CALLING_CODES = {
  aw: '297', // Aruba
  cw: '599', // Curacao
  bq: '599', // Caribbean Netherlands
  sx: '1-721', // Sint Maarten
  us: '1',
  ca: '1',
  gb: '44',
  ie: '353',
  fr: '33',
  es: '34',
  it: '39',
  pt: '351',
  de: '49',
  nl: '31',
  be: '32',
  ch: '41',
  at: '43',
  gr: '30',
  tr: '90',
  hr: '385',
  cz: '420',
  hu: '36',
  pl: '48',
  dk: '45',
  se: '46',
  no: '47',
  fi: '358',
  is: '354',
  jp: '81',
  kr: '82',
  cn: '86',
  sg: '65',
  th: '66',
  my: '60',
  id: '62',
  vn: '84',
  ph: '63',
  in: '91',
  ae: '971',
  sa: '966',
  qa: '974',
  eg: '20',
  ma: '212',
  za: '27',
  au: '61',
  nz: '64',
  mx: '52',
  br: '55',
  ar: '54',
  cl: '56',
  co: '57',
  pe: '51',
  ec: '593',
  pa: '507',
  cr: '506',
  do: '1-809',
  jm: '1-876',
  bs: '1-242',
  bb: '1-246',
  lc: '1-758',
  gd: '1-473',
  tt: '1-868',
  ag: '1-268',
  kn: '1-869',
  vc: '1-784',
  bz: '501',
  mu: '230',
  pf: '689',
};

const COUNTRY_NAME_CALLING_CODES = {
  aruba: '297',
  curacao: '599',
  'sint maarten': '1-721',
  'united states': '1',
  canada: '1',
  jamaica: '1-876',
  bahamas: '1-242',
  barbados: '1-246',
  'st lucia': '1-758',
  grenada: '1-473',
  'trinidad and tobago': '1-868',
  'antigua and barbuda': '1-268',
  'st kitts and nevis': '1-869',
  belize: '501',
  mexico: '52',
  portugal: '351',
  spain: '34',
  italy: '39',
  france: '33',
  'united kingdom': '44',
  netherlands: '31',
  germany: '49',
  croatia: '385',
  czechia: '420',
  greece: '30',
  turkey: '90',
  japan: '81',
  'south korea': '82',
  china: '86',
  singapore: '65',
  indonesia: '62',
  thailand: '66',
  vietnam: '84',
  philippines: '63',
  india: '91',
  australia: '61',
  'new zealand': '64',
  colombia: '57',
  panama: '507',
  'costa rica': '506',
  chile: '56',
  argentina: '54',
  brazil: '55',
};

function formatPhoneWithCountryCode(phone, countryIsoCode, inferredCountryName = '') {
  const raw = String(phone || '').trim();
  if (!raw) return null;
  if (raw.startsWith('+')) return raw;
  const iso = String(countryIsoCode || '').trim().toLowerCase();
  const code =
    COUNTRY_CALLING_CODES[iso] ||
    COUNTRY_NAME_CALLING_CODES[canonicalCountry(inferredCountryName)];
  if (!code) return raw;
  return `+${code} ${raw}`;
}

function safeParseJsonObject(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractRestaurantCountrySignals(row) {
  const result = {
    longName: '',
    shortName: '',
    isoCode: '',
    isoCountryName: '',
  };

  result.isoCode = normalizeText(row?.country_iso_code || row?.countryIsoCode || '');
  try {
    const isoRaw = String(row?.country_iso_code || row?.countryIsoCode || '').trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(isoRaw) && typeof Intl !== 'undefined' && Intl.DisplayNames) {
      const dn = new Intl.DisplayNames(['en'], { type: 'region' });
      result.isoCountryName = normalizeText(dn.of(isoRaw) || '');
    }
  } catch {
    // Ignore locale conversion failures.
  }

  const components = safeParseJsonObject(row?.address_components || row?.addressComponents);
  if (Array.isArray(components)) {
    const countryComp = components.find((comp) =>
      Array.isArray(comp?.types) && comp.types.includes('country')
    );
    if (countryComp) {
      result.longName = normalizeText(countryComp.long_name || '');
      result.shortName = normalizeText(countryComp.short_name || '');
    }
  }

  return result;
}

/**
 * Data-quality guard:
 * Reject records where Google country clearly conflicts with destination country.
 */
export function isRestaurantLikelyInDestination(row, destination) {
  if (!row || !destination) return true;
  const destinationCountry = canonicalCountry(destination.country || '');
  if (!destinationCountry) return true;

  const country = extractRestaurantCountrySignals(row);
  let observedCountry = canonicalCountry(
    country.longName || country.isoCountryName || country.shortName || country.isoCode,
  );
  if (!observedCountry) {
    observedCountry = canonicalCountry(inferCountryFromAddress(row));
  }
  if (!observedCountry) return false;

  if (observedCountry === destinationCountry) return true;
  if (observedCountry.includes(destinationCountry) || destinationCountry.includes(observedCountry)) return true;

  return false;
}

/**
 * Get all restaurants for a destination
 * Handles pagination for destinations with >1000 restaurants
 * @param {string} destinationId - Destination ID
 * @returns {Promise<Array>} Array of restaurants
 */
export async function getRestaurantsForDestination(destinationId) {
  const supabase = createSupabaseServiceRoleClient();
  const allRestaurants = [];
  const pageSize = 1000; // Supabase default limit
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('destination_id', destinationId)
      .eq('is_active', true)
      .order('google_rating', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching restaurants:', error);
      return allRestaurants; // Return partial results if error occurs
    }

    if (data && data.length > 0) {
      allRestaurants.push(...data);
    }

    // Check if there are more rows to fetch
    hasMore = data && data.length === pageSize;
    from += pageSize;
  }

  return allRestaurants;
}

/**
 * Get a limited number of restaurants for a destination (e.g. for tour detail "Top Restaurants" section).
 * Reduces Supabase read when full list is not needed.
 * @param {string} destinationId - Destination ID
 * @param {number} limit - Max number of restaurants to return (default 10)
 * @returns {Promise<Array>} Array of restaurants (raw DB rows)
 */
export async function getRestaurantsForDestinationWithLimit(destinationId, limit = 10) {
  if (!destinationId || limit < 1) return [];
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('destination_id', destinationId)
    .eq('is_active', true)
    .order('google_rating', { ascending: false })
    .range(0, Math.max(0, limit - 1));

  if (error) {
    console.error('Error fetching restaurants (limit):', error);
    return [];
  }
  return data || [];
}

/**
 * Get top restaurants for a destination ranked by rating + review volume.
 * We fetch a wider candidate set, then score in-memory to avoid thin high-rating/low-review outliers.
 * @param {string} destinationId
 * @param {number} limit
 * @returns {Promise<Array>} formatted restaurants
 */
export async function getTopRestaurantsForDestination(destinationId, limit = 24, destination = null) {
  if (!destinationId || limit < 1) return [];
  const supabase = createSupabaseServiceRoleClient();
  const fetchSize = Math.max(limit * 4, 60);

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('destination_id', destinationId)
    .eq('is_active', true)
    .order('google_rating', { ascending: false })
    .order('review_count', { ascending: false })
    .range(0, fetchSize - 1);

  if (error) {
    console.error('Error fetching top restaurants:', error);
    return [];
  }

  const ranked = (data || [])
    .filter((row) => isRestaurantLikelyInDestination(row, destination))
    .map((r) => ({
      row: r,
      rating: Number(r.google_rating) || 0,
      reviews: Number(r.review_count) || 0,
    }))
    .sort((a, b) => {
      const scoreA = a.rating * Math.log10(a.reviews + 10);
      const scoreB = b.rating * Math.log10(b.reviews + 10);
      if (scoreA !== scoreB) return scoreB - scoreA;
      if (a.rating !== b.rating) return b.rating - a.rating;
      return b.reviews - a.reviews;
    })
    .slice(0, limit)
    .map((item) => formatRestaurantForFrontend(item.row))
    .filter(Boolean);

  return ranked;
}

/**
 * Get restaurant counts per destination
 * Handles pagination for large datasets (>1000 rows)
 * @returns {Promise<Object>} Object with destination_id as key and count as value
 */
export async function getRestaurantCountsByDestination() {
  const supabase = createSupabaseServiceRoleClient();
  const counts = {};
  const pageSize = 1000; // Supabase default limit
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('destination_id')
      .eq('is_active', true)
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching restaurant counts:', error);
      return counts; // Return partial counts if error occurs
    }

    // Count restaurants per destination
    if (data && data.length > 0) {
      data.forEach((restaurant) => {
        const destId = restaurant.destination_id;
        counts[destId] = (counts[destId] || 0) + 1;
      });
    }

    // Check if there are more rows to fetch
    hasMore = data && data.length === pageSize;
    from += pageSize;
  }

  return counts;
}

/**
 * Get a restaurant by ID
 * @param {number} restaurantId - Restaurant ID
 * @returns {Promise<Object|null>} Restaurant object or null
 */
export async function getRestaurantById(restaurantId) {
  const supabase = createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching restaurant:', error);
    return null;
  }

  return formatRestaurantForFrontend(data);
}

/**
 * Get a restaurant by slug
 * @param {string} destinationId - Destination ID
 * @param {string} slug - Restaurant slug
 * @returns {Promise<Object|null>} Restaurant object or null
 */
export async function getRestaurantBySlug(destinationId, slug) {
  const supabase = createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('destination_id', destinationId)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching restaurant:', error);
    return null;
  }

  return data;
}

/**
 * Find restaurant by name (fuzzy matching) - used for redirects when slug doesn't match
 * @param {string} destinationId - Destination ID
 * @param {string} searchName - Restaurant name to search for
 * @returns {Promise<Object|null>} Restaurant object with slug, or null
 */
export async function findRestaurantByName(destinationId, searchName) {
  const supabase = createSupabaseServiceRoleClient();
  
  // Normalize search name: lowercase, remove extra spaces, remove common suffixes
  const normalize = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s+aruba$/i, '')
      .replace(/\s+curacao$/i, '')
      .replace(/\s+jamaica$/i, '')
      .replace(/\s+punta-cana$/i, '')
      .replace(/\s+nassau$/i, '')
      .replace(/\s+restaurant$/i, '')
      .replace(/\s+aruba$/i, '');
  };

  const normalizedSearch = normalize(searchName);
  
  // Get all restaurants for this destination
  const allRestaurants = await getRestaurantsForDestination(destinationId);
  
  // Try to find by name matching
  for (const restaurant of allRestaurants) {
    const restaurantName = restaurant.name || '';
    const normalizedRestaurant = normalize(restaurantName);
    
    // Exact match after normalization
    if (normalizedRestaurant === normalizedSearch) {
      return {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      };
    }
    
    // Check if search name contains restaurant name or vice versa (for partial matches)
    if (normalizedSearch.includes(normalizedRestaurant) || normalizedRestaurant.includes(normalizedSearch)) {
      // Make sure it's a significant match (at least 5 characters)
      const minLength = Math.min(normalizedSearch.length, normalizedRestaurant.length);
      if (minLength >= 5) {
        return {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
        };
      }
    }
  }
  
  return null;
}

/**
 * Safely parse JSON string with error handling
 */
function safeJsonParse(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    console.warn('Failed to parse JSON:', e.message, value?.substring(0, 50));
    return fallback;
  }
}

/**
 * Safely parse array from JSON string or array
 */
function safeArrayParse(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      console.warn('Failed to parse array JSON:', e.message);
      return fallback;
    }
  }
  return fallback;
}

/**
 * Convert database restaurant to frontend format
 * @param {Object} dbRestaurant - Restaurant from database
 * @returns {Object} Formatted restaurant for frontend
 */
export function formatRestaurantForFrontend(dbRestaurant) {
  if (!dbRestaurant) return null;

  try {
    // Safely parse cuisines and opening_hours (they might be JSON strings)
    const cuisines = safeArrayParse(dbRestaurant.cuisines, []);
    const hours = safeArrayParse(dbRestaurant.opening_hours, []);
    
    // Safely parse summary for tagline (handle potential null/undefined)
    const summary = dbRestaurant.summary || '';
    const tagline = dbRestaurant.tagline || (summary ? summary.substring(0, 100) : '') || '';

    return {
      id: dbRestaurant.id?.toString() || String(dbRestaurant.id || ''),
      slug: dbRestaurant.slug || '',
      name: dbRestaurant.name || 'Restaurant',
      shortName: dbRestaurant.short_name || dbRestaurant.name || 'Restaurant',
      destinationId: dbRestaurant.destination_id || '',
      // Restaurant photos are not used on the site — never use hero_image_url
heroImage: null,
      imageAlt: dbRestaurant.image_alt || dbRestaurant.name || 'Restaurant',
      tagline: tagline,
      description: dbRestaurant.description || summary || '',
      summary: summary || dbRestaurant.description || '',
      seo: {
        title: dbRestaurant.seo_title || `${dbRestaurant.name || 'Restaurant'} in ${dbRestaurant.destination_id || ''}`,
        description: dbRestaurant.meta_description || dbRestaurant.seo_description || summary || dbRestaurant.description || '',
        keywords: safeArrayParse(dbRestaurant.seo_keywords, []),
      },
      contact: {
        email: dbRestaurant.email || null,
        phone: dbRestaurant.phone || null,
        formattedPhone:
          formatPhoneWithCountryCode(
            dbRestaurant.formatted_phone || dbRestaurant.phone || null,
            dbRestaurant.country_iso_code || null,
            inferCountryFromAddress(dbRestaurant)
          ) || null,
        address: dbRestaurant.address || dbRestaurant.formatted_address || '',
        neighborhood: dbRestaurant.neighborhood || null,
        website: dbRestaurant.website || null,
        googleMapsUrl: dbRestaurant.google_maps_url || null,
      },
      // BiteReserve fields
      countryIsoCode: dbRestaurant.country_iso_code || null,
      bitereserveCode: dbRestaurant.bitereserve_code || null,
      pricing: {
        priceRangeLabel: dbRestaurant.price_range_label || null,
        priceRange: dbRestaurant.price_range || null,
      },
      cuisines: cuisines,
      hours: hours,
      booking: {
        partner: dbRestaurant.booking_partner || null,
        note: dbRestaurant.booking_note || null,
        partnerUrl: dbRestaurant.booking_url || null,
        isActive: dbRestaurant.booking_is_active || false,
      },
      ratings: {
        googleRating: dbRestaurant.google_rating ? parseFloat(dbRestaurant.google_rating) : null,
        reviewCount: dbRestaurant.review_count || 0,
        source: dbRestaurant.rating_source || 'Google Reviews',
        updated: dbRestaurant.data_updated_at ? new Date(dbRestaurant.data_updated_at).toISOString().split('T')[0] : null,
      },
      highlights: safeArrayParse(dbRestaurant.highlights, []),
      menuHighlights: safeArrayParse(dbRestaurant.menu_highlights, []),
      reviewSummary: dbRestaurant.review_summary || null,
      story: dbRestaurant.story || dbRestaurant.unique_content || null,
      uniqueContent: dbRestaurant.unique_content || null,
      seoTitle: dbRestaurant.seo_title || null,
      metaDescription: dbRestaurant.meta_description || null,
      sustainability: dbRestaurant.sustainability || null,
      practicalInfo: safeArrayParse(dbRestaurant.practical_info, []),
      
      // Business attributes
      outdoorSeating: dbRestaurant.outdoor_seating ?? null,
      liveMusic: dbRestaurant.live_music ?? null,
      servesCocktails: dbRestaurant.serves_cocktails ?? null,
      servesDessert: dbRestaurant.serves_dessert ?? null,
      servesCoffee: dbRestaurant.serves_coffee ?? null,
      goodForChildren: dbRestaurant.good_for_children ?? null,
      allowsDogs: dbRestaurant.allows_dogs ?? null,
      restroom: dbRestaurant.restroom ?? null,
      goodForGroups: dbRestaurant.good_for_groups ?? null,
      reservable: dbRestaurant.reservable ?? null,
      dineIn: dbRestaurant.dine_in ?? null,
      takeout: dbRestaurant.takeout ?? null,
      delivery: dbRestaurant.delivery ?? null,
      
      // Options (parse JSON strings if needed with error handling)
      paymentOptions: safeJsonParse(dbRestaurant.payment_options, null),
      parkingOptions: safeJsonParse(dbRestaurant.parking_options, null),
      accessibilityOptions: safeJsonParse(dbRestaurant.accessibility_options, null),
      
      // Additional SEO fields
      addressComponents: safeJsonParse(dbRestaurant.address_components, null),
      businessStatus: dbRestaurant.business_status || null,
      openNow: dbRestaurant.open_now ?? null,
      servesBeer: dbRestaurant.serves_beer ?? null,
      servesWine: dbRestaurant.serves_wine ?? null,
      servesBrunch: dbRestaurant.serves_brunch ?? null,
      servesDinner: dbRestaurant.serves_dinner ?? null,
      googleMapsUri: dbRestaurant.google_maps_uri || null,
      reviewsUri: dbRestaurant.reviews_uri || null,
      photosUri: dbRestaurant.photos_uri || null,
      
      // Reviews (parse JSON string if needed with error handling)
      reviews: safeJsonParse(dbRestaurant.reviews, null),
      
      // Schema data
      schema: safeJsonParse(dbRestaurant.schema_data, null),
    };
  } catch (error) {
    console.error('Error formatting restaurant:', error, dbRestaurant?.id);
    // Return a minimal safe object to prevent crashes
    return {
      id: dbRestaurant.id?.toString() || 'unknown',
      slug: dbRestaurant.slug || '',
      name: dbRestaurant.name || 'Restaurant',
      shortName: dbRestaurant.short_name || dbRestaurant.name || 'Restaurant',
      destinationId: dbRestaurant.destination_id || '',
      heroImage: null,
      imageAlt: dbRestaurant.name || 'Restaurant',
      tagline: '',
      description: '',
      summary: '',
      cuisines: [],
      hours: [],
      ratings: { googleRating: null, reviewCount: 0 },
      pricing: { priceRange: null },
      contact: { address: '' },
    };
  }
}

