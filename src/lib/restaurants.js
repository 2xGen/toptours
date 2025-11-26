/**
 * Restaurant data fetching from Supabase database
 */

import { createSupabaseServiceRoleClient } from './supabaseClient';

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
      heroImage: dbRestaurant.hero_image_url || null,
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
        formattedPhone: dbRestaurant.formatted_phone || dbRestaurant.phone || null,
        address: dbRestaurant.address || dbRestaurant.formatted_address || '',
        neighborhood: dbRestaurant.neighborhood || null,
        website: dbRestaurant.website || null,
        googleMapsUrl: dbRestaurant.google_maps_url || null,
      },
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

