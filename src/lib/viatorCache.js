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
      await supabase.from('viator_cache').delete().eq('product_id', productId);
      return null;
    }

    return data.tour_data;
  } catch (error) {
    console.error('Error getting cached tour:', error);
    return null;
  }
}

/**
 * Cache tour data in Supabase
 */
export async function cacheTour(productId, tourData) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase
      .from('viator_cache')
      .upsert({
        product_id: productId,
        tour_data: tourData,
        cached_at: new Date().toISOString(),
      }, {
        onConflict: 'product_id',
      });

    if (error) {
      console.error('Error caching tour:', error);
    }
  } catch (error) {
    console.error('Error caching tour:', error);
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
    console.error('Error getting cached similar tours:', error);
    return null;
  }
}

/**
 * Cache similar tours results
 */
export async function cacheSimilarTours(cacheKey, toursData) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase
      .from('viator_cache')
      .upsert({
        cache_key: cacheKey,
        cache_type: 'similar_tours',
        tour_data: toursData,
        cached_at: new Date().toISOString(),
      }, {
        onConflict: 'cache_key,cache_type',
      });

    if (error) {
      console.error('Error caching similar tours:', error);
    }
  } catch (error) {
    console.error('Error caching similar tours:', error);
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
    console.error('Error getting cached destination:', error);
    return null;
  }
}

/**
 * Cache destination data in Supabase
 */
export async function cacheDestination(destinationId, destinationData) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase
      .from('viator_cache')
      .upsert({
        cache_key: destinationId,
        cache_type: 'destination',
        tour_data: destinationData, // Reusing tour_data field for destination data
        cached_at: new Date().toISOString(),
      }, {
        onConflict: 'cache_key,cache_type',
      });

    if (error) {
      console.error('Error caching destination:', error);
    }
  } catch (error) {
    console.error('Error caching destination:', error);
  }
}

/**
 * Fetch destination details from Viator API
 * Returns destination data including country information
 */
export async function fetchViatorDestination(destinationId) {
  try {
    // Clean destination ID (remove 'd' prefix if present)
    const cleanId = String(destinationId).replace(/^d/, '');
    
    const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
    const url = `https://api.viator.com/partner/destinations/${cleanId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 2160 } // Revalidate every 90 days (2160 hours)
    });

    if (!response.ok) {
      console.error(`Failed to fetch destination ${destinationId}: ${response.status}`);
      return null;
    }

    const destinationData = await response.json();
    return destinationData;
  } catch (error) {
    console.error(`Error fetching destination ${destinationId}:`, error);
    return null;
  }
}

/**
 * Get destination data (cached or from API)
 * Returns destination with country information
 */
export async function getDestinationData(destinationId) {
  if (!destinationId) return null;

  // Try cache first
  const cached = await getCachedDestination(destinationId);
  if (cached) {
    return cached;
  }

  // Cache miss - fetch from API
  const destinationData = await fetchViatorDestination(destinationId);
  if (destinationData) {
    // Cache it for future use
    await cacheDestination(destinationId, destinationData);
    return destinationData;
  }

  return null;
}

