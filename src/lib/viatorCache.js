/**
 * Viator API Caching Layer
 * Caches tour data in Supabase to reduce API calls
 */

import { createSupabaseServiceRoleClient } from './supabaseClient';

const CACHE_TTL_HOURS = 24; // Cache tour data for 24 hours
const SIMILAR_TOURS_CACHE_TTL_HOURS = 6; // Cache similar tours for 6 hours
const DESTINATION_CACHE_TTL_DAYS = 90; // Cache destination data for 90 days (destinations rarely change)

/**
 * Get cached tour data from Supabase
 */
export async function getCachedTour(productId) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('viator_cache')
      .select('*')
      .eq('product_id', productId)
      .eq('cache_type', 'tour') // Only get tour cache, not similar_tours or destination
      .single();

    if (error || !data) {
      return null;
    }

    // Check if cache is still valid
    const cachedAt = new Date(data.cached_at);
    const now = new Date();
    const hoursSinceCache = (now - cachedAt) / (1000 * 60 * 60);

    if (hoursSinceCache > CACHE_TTL_HOURS) {
      // Cache expired, delete it
      await supabase.from('viator_cache').delete().eq('product_id', productId).eq('cache_type', 'tour');
      return null;
    }

    return data.tour_data;
  } catch (error) {
    console.error('Error getting cached tour:', error.message || error);
    return null;
  }
}

/**
 * Cache tour data in Supabase
 */
export async function cacheTour(productId, tourData) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Check if tour already exists (with cache_type = 'tour')
    const { data: existing, error: checkError } = await supabase
      .from('viator_cache')
      .select('id')
      .eq('product_id', productId)
      .eq('cache_type', 'tour')
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid error if not found

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('viator_cache')
        .update({
          tour_data: tourData,
          cached_at: new Date().toISOString(),
        })
        .eq('product_id', productId)
        .eq('cache_type', 'tour');

      if (error) {
        const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
        console.error('Error updating cached tour:', errorMsg);
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('viator_cache')
        .insert({
          product_id: productId,
          cache_type: 'tour',
          tour_data: tourData,
          cached_at: new Date().toISOString(),
        });

      if (error) {
        // If duplicate key error, try updating instead
        if (error.message && error.message.includes('duplicate key') && error.message.includes('idx_viator_cache_product_id_unique')) {
          const { error: updateError } = await supabase
            .from('viator_cache')
            .update({
              tour_data: tourData,
              cached_at: new Date().toISOString(),
            })
            .eq('product_id', productId)
            .eq('cache_type', 'tour');

          if (updateError) {
            const errorMsg = updateError.message || updateError.details || updateError.hint || JSON.stringify(updateError);
            console.error('Error updating cached tour (after duplicate key):', errorMsg);
          }
        } else {
          const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
          console.error('Error inserting cached tour:', errorMsg);
        }
      }
    }
  } catch (error) {
    const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
    console.error('Error caching tour:', errorMsg);
  }
}

/**
 * Get cached similar tours
 */
export async function getCachedSimilarTours(cacheKey) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('viator_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .eq('cache_type', 'similar_tours')
      .single();

    if (error || !data) {
      return null;
    }

    // Check if cache is still valid
    const cachedAt = new Date(data.cached_at);
    const now = new Date();
    const hoursSinceCache = (now - cachedAt) / (1000 * 60 * 60);

    if (hoursSinceCache > SIMILAR_TOURS_CACHE_TTL_HOURS) {
      // Cache expired, delete it
      await supabase.from('viator_cache').delete().eq('cache_key', cacheKey);
      return null;
    }

    return data.tour_data;
  } catch (error) {
    console.error('Error getting cached similar tours:', error.message || error);
    return null;
  }
}

/**
 * Cache similar tours results
 */
export async function cacheSimilarTours(cacheKey, toursData) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Check if similar tours cache already exists
    const { data: existing } = await supabase
      .from('viator_cache')
      .select('id')
      .eq('cache_key', cacheKey)
      .eq('cache_type', 'similar_tours')
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('viator_cache')
        .update({
          tour_data: toursData,
          cached_at: new Date().toISOString(),
        })
        .eq('cache_key', cacheKey)
        .eq('cache_type', 'similar_tours');

      if (error) {
        const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
        console.error('Error updating cached similar tours:', errorMsg);
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('viator_cache')
        .insert({
          cache_key: cacheKey,
          cache_type: 'similar_tours',
          tour_data: toursData,
          cached_at: new Date().toISOString(),
        });

      if (error) {
        const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
        console.error('Error inserting cached similar tours:', errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
    console.error('Error caching similar tours:', errorMsg);
  }
}

/**
 * Generate cache key for similar tours search
 */
export function generateSimilarToursCacheKey(productId, searchTerm) {
  return `similar_${productId}_${searchTerm?.toLowerCase().replace(/\s+/g, '_') || 'default'}`;
}

/**
 * Get cached destination data from Supabase
 */
export async function getCachedDestination(destinationId) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('viator_cache')
      .select('*')
      .eq('cache_key', destinationId)
      .eq('cache_type', 'destination')
      .single();

    if (error || !data) {
      return null;
    }

    // Check if cache is still valid (90 days)
    const cachedAt = new Date(data.cached_at);
    const now = new Date();
    const daysSinceCache = (now - cachedAt) / (1000 * 60 * 60 * 24);

    if (daysSinceCache > DESTINATION_CACHE_TTL_DAYS) {
      // Cache expired, delete it
      await supabase.from('viator_cache').delete().eq('cache_key', destinationId).eq('cache_type', 'destination');
      return null;
    }

    return data.tour_data; // Reusing tour_data field for destination data
  } catch (error) {
    console.error('Error getting cached destination:', error.message || error);
    return null;
  }
}

/**
 * Cache destination data in Supabase
 */
export async function cacheDestination(destinationId, destinationData) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Check if destination cache already exists
    const { data: existing } = await supabase
      .from('viator_cache')
      .select('id')
      .eq('cache_key', destinationId)
      .eq('cache_type', 'destination')
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('viator_cache')
        .update({
          tour_data: destinationData,
          cached_at: new Date().toISOString(),
        })
        .eq('cache_key', destinationId)
        .eq('cache_type', 'destination');

      if (error) {
        const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
        console.error('Error updating cached destination:', errorMsg);
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('viator_cache')
        .insert({
          cache_key: destinationId,
          cache_type: 'destination',
          tour_data: destinationData,
          cached_at: new Date().toISOString(),
        });

      if (error) {
        const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
        console.error('Error inserting cached destination:', errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
    console.error('Error caching destination:', errorMsg);
  }
}

/**
 * Get cached destinations list (entire list from Viator API)
 */
async function getCachedDestinationsList() {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('viator_cache')
      .select('*')
      .eq('cache_key', 'destinations_list')
      .eq('cache_type', 'destination')
      .single();

    if (error || !data) {
      return null;
    }

    // Check if cache is still valid (90 days)
    const cachedAt = new Date(data.cached_at);
    const now = new Date();
    const daysSinceCache = (now - cachedAt) / (1000 * 60 * 60 * 24);

    if (daysSinceCache > DESTINATION_CACHE_TTL_DAYS) {
      // Cache expired, delete it
      await supabase.from('viator_cache').delete().eq('cache_key', 'destinations_list').eq('cache_type', 'destination');
      return null;
    }

    return data.tour_data; // Contains the destinations array
  } catch (error) {
    console.error('Error getting cached destinations list:', error.message || error);
    return null;
  }
}

/**
 * Cache the entire destinations list
 */
async function cacheDestinationsList(destinationsList) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Check if destinations list cache already exists
    const { data: existing } = await supabase
      .from('viator_cache')
      .select('id')
      .eq('cache_key', 'destinations_list')
      .eq('cache_type', 'destination')
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('viator_cache')
        .update({
          tour_data: destinationsList,
          cached_at: new Date().toISOString(),
        })
        .eq('cache_key', 'destinations_list')
        .eq('cache_type', 'destination');

      if (error) {
        const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
        console.error('Error updating cached destinations list:', errorMsg);
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('viator_cache')
        .insert({
          cache_key: 'destinations_list',
          cache_type: 'destination',
          tour_data: destinationsList,
          cached_at: new Date().toISOString(),
        });

      if (error) {
        const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
        console.error('Error inserting cached destinations list:', errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = error.message || error.details || error.hint || JSON.stringify(error);
    console.error('Error caching destinations list:', errorMsg);
  }
}

/**
 * Fetch destinations list from Viator API
 */
async function fetchDestinationsListFromViator() {
  try {
    const apiKey = process.env.VIATOR_API_KEY;
    if (!apiKey) {
      console.error('VIATOR_API_KEY not configured');
      return null;
    }

    const response = await fetch('https://api.viator.com/partner/destinations', {
      method: 'GET',
      headers: {
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'exp-api-key': apiKey,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch destinations list: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.destinations || [];
  } catch (error) {
    console.error('Error fetching destinations list from Viator:', error.message || error);
    return null;
  }
}

/**
 * Find destination by slug (searches cached destinations by name)
 * Returns { destinationId: string, destinationName: string } or null
 */
export async function findDestinationBySlug(slug) {
  try {
    // Get the destinations list (from cache or API)
    let destinationsList = await getCachedDestinationsList();
    
    if (!destinationsList) {
      // Fetch from API
      destinationsList = await fetchDestinationsListFromViator();
      if (destinationsList) {
        // Cache the list
        await cacheDestinationsList(destinationsList);
      }
    }

    if (!destinationsList || !Array.isArray(destinationsList)) {
      return null;
    }

    // Convert slug back to a searchable name (replace hyphens with spaces)
    const searchName = slug.replace(/-/g, ' ').toLowerCase();
    
    // Search for destination by name (fuzzy match)
    const destination = destinationsList.find((dest) => {
      const destName = (dest.destinationName || dest.name || '').toLowerCase();
      // Check if the slug matches the destination name
      const destSlug = destName
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      return destSlug === slug || destName.includes(searchName) || searchName.includes(destName.split(',')[0].trim());
    });

    if (destination) {
      const destinationId = destination.destinationId?.toString() || destination.id?.toString() || '';
      const destinationName = destination.destinationName || destination.name || '';
      
      if (destinationId && destinationName) {
        // Cache this specific destination for faster future lookups
        await cacheDestination(destinationId, { destinationName });
        return { destinationId, destinationName };
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding destination by slug:', error.message || error);
    return null;
  }
}

/**
 * Get destination name by ID from Viator API (with caching)
 * Returns { destinationName: string } or null
 */
export async function getDestinationNameById(destinationId) {
  try {
    // Normalize destination ID (remove 'd' prefix if present, handle both "739" and "d739")
    const normalizedId = destinationId.toString().replace(/^d/i, '');
    const idWithD = `d${normalizedId}`;
    const idWithoutD = normalizedId;

    // First, check if we have this specific destination cached
    const cachedDestination = await getCachedDestination(destinationId);
    if (cachedDestination && cachedDestination.destinationName) {
      return cachedDestination;
    }

    // Try to load from our stored JSON file first (faster than API, includes all 3,382 destinations)
    try {
      const viatorDestinationsModule = await import('@/data/viatorDestinations.json');
      const viatorDestinations = viatorDestinationsModule.default || viatorDestinationsModule;
      if (Array.isArray(viatorDestinations)) {
        const destination = viatorDestinations.find((dest) => {
          const destId = dest.destinationId?.toString() || '';
          return (
            destId === normalizedId ||
            destId === idWithD ||
            destId === idWithoutD
          );
        });

        if (destination && destination.destinationName) {
          // Cache this specific destination for faster future lookups
          await cacheDestination(destinationId, { destinationName: destination.destinationName });
          return { destinationName: destination.destinationName };
        }
      }
    } catch (jsonError) {
      // JSON file not available, fall back to API
      // This is expected during build time, so we silently continue
    }

    // Fallback: Get the destinations list (from cache or API)
    let destinationsList = await getCachedDestinationsList();
    
    if (!destinationsList) {
      // Fetch from API
      destinationsList = await fetchDestinationsListFromViator();
      if (destinationsList) {
        // Cache the list
        await cacheDestinationsList(destinationsList);
      }
    }

    if (!destinationsList || !Array.isArray(destinationsList)) {
      return null;
    }

    // Search for the destination in the list
    // Try matching by id, destinationId, ref, or any field that might contain the ID
    const destination = destinationsList.find((dest) => {
      const destId = dest.id?.toString() || '';
      const destRef = dest.ref?.toString() || '';
      const destDestinationId = dest.destinationId?.toString() || '';
      
      return (
        destId === normalizedId ||
        destId === idWithD ||
        destId === idWithoutD ||
        destRef === normalizedId ||
        destRef === idWithD ||
        destRef === idWithoutD ||
        destDestinationId === normalizedId ||
        destDestinationId === idWithD ||
        destDestinationId === idWithoutD
      );
    });

    if (destination) {
      const destinationName = destination.destinationName || destination.name || '';
      if (destinationName) {
        // Cache this specific destination for faster future lookups
        await cacheDestination(destinationId, { destinationName });
        return { destinationName };
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting destination name by ID:', error.message || error);
    return null;
  }
}

/**
 * Extract country from destination name
 * Simple parsing: "Dubai, UAE" -> "UAE", "Paris, France" -> "France"
 */
export function extractCountryFromDestinationName(destinationName) {
  if (!destinationName) return null;
  
  // Try to extract country from patterns like:
  // "Dubai, UAE" -> "UAE"
  // "Paris, France" -> "France"
  // "New York, NY, USA" -> "USA"
  // "Tokyo, Japan" -> "Japan"
  
  // Pattern 1: Last comma-separated part (most common)
  const commaMatch = destinationName.match(/,\s*([^,]+)$/);
  if (commaMatch && commaMatch[1]) {
    const country = commaMatch[1].trim();
    // Accept common country codes and full country names
    if (country.length >= 2) {
      return country;
    }
  }
  
  return null;
}

