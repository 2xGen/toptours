/**
 * Viator API Caching Layer
 * Caches tour data in Supabase to reduce API calls
 */

import { createSupabaseServiceRoleClient } from './supabaseClient';

const CACHE_TTL_HOURS = 24; // Cache tour data for 24 hours
const SIMILAR_TOURS_CACHE_TTL_HOURS = 6; // Cache similar tours for 6 hours

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

