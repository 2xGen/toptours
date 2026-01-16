/**
 * Viator Recommendations API Integration
 * 
 * Fetches product recommendations from Viator API
 * Uses the /partner/products/recommendations endpoint
 * Includes caching to reduce API calls
 */

import { createSupabaseServiceRoleClient } from './supabaseClient';

const RECOMMENDATIONS_CACHE_TTL_HOURS = 6; // Cache recommendations for 6 hours

/**
 * Get cached recommendations from Supabase
 */
async function getCachedRecommendations(productId) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('viator_cache')
      .select('*')
      .eq('product_id', productId)
      .eq('cache_type', 'recommendations')
      .single();

    if (error || !data) {
      return null;
    }

    // Check if cache is still valid
    const cachedAt = new Date(data.cached_at);
    const now = new Date();
    const hoursSinceCache = (now - cachedAt) / (1000 * 60 * 60);

    if (hoursSinceCache > RECOMMENDATIONS_CACHE_TTL_HOURS) {
      // Cache expired, delete it
      await supabase.from('viator_cache').delete().eq('product_id', productId).eq('cache_type', 'recommendations');
      return null;
    }

    return data.tour_data; // Store product codes in tour_data field
  } catch (error) {
    console.error('Error getting cached recommendations:', error.message || error);
    return null;
  }
}

/**
 * Cache recommendations in Supabase
 */
async function cacheRecommendations(productId, recommendedCodes) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RECOMMENDATIONS_CACHE_TTL_HOURS);

    await supabase.from('viator_cache').upsert({
      product_id: productId,
      cache_type: 'recommendations',
      tour_data: recommendedCodes, // Store product codes array
      cached_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    }, {
      onConflict: 'product_id,cache_type',
    });
  } catch (error) {
    console.error('Error caching recommendations:', error.message || error);
    // Non-critical - continue without caching
  }
}

/**
 * Fetch product recommendations from Viator API (with caching)
 */
export async function fetchProductRecommendations(productId, options = {}) {
  // Check cache first
  const cached = await getCachedRecommendations(productId);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  // Use the same API key as other Viator API calls (production)
  const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
  
  if (!apiKey) {
    throw new Error('VIATOR_API_KEY not configured');
  }

  const requestBody = {
    productCodes: [productId],
    recommendationTypes: options.recommendationTypes || ['IS_SIMILAR_TO'],
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Use production API (full access approved)
    const recommendationsEndpoint = 'https://api.viator.com/partner/products/recommendations';

    const response = await fetch(recommendationsEndpoint, {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Viator API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract recommended product codes
    let recommendedCodes = [];
    if (data && data.length > 0 && data[0].recommendations) {
      recommendedCodes = data[0].recommendations.IS_SIMILAR_TO || [];
    }

    // Cache the product codes
    if (recommendedCodes.length > 0) {
      await cacheRecommendations(productId, recommendedCodes);
    }
    
    return recommendedCodes;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Viator API took too long to respond');
    }
    throw error;
  }
}

/**
 * Fetch full tour data for recommended product codes
 * Uses the existing tour fetching mechanism (getCachedTour + cacheTour)
 * Fetches each tour individually using GET /partner/products/{productId}
 * Capped at maximum 6 tours
 */
export async function fetchRecommendedTours(recommendedProductCodes) {
  if (!recommendedProductCodes || recommendedProductCodes.length === 0) {
    return [];
  }

  // Cap at maximum 6 tours
  const limitedCodes = recommendedProductCodes.slice(0, 6);

  // Import the tour caching functions
  const { getCachedTour, cacheTour } = await import('./viatorCache');
  
  // Use the same API key as other Viator API calls (production)
  const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
  
  if (!apiKey) {
    throw new Error('VIATOR_API_KEY not configured');
  }

  try {
    const allTours = [];
    
    // Fetch each tour individually using GET /partner/products/{productId}
    for (const productCode of limitedCodes) {
      try {
        // First check cache
        let tour = await getCachedTour(productCode);
        
        if (!tour) {
          // Cache miss - fetch from API using GET endpoint (same as tour detail page)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          // Use production API (full access approved)
          const productEndpoint = `https://api.viator.com/partner/products/${productCode}?currency=USD`;
          
          const response = await fetch(productEndpoint, {
            method: 'GET',
            headers: {
              'exp-api-key': apiKey,
              'Accept': 'application/json;version=2.0',
              'Accept-Language': 'en-US',
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            tour = await response.json();
            
            if (tour && !tour.error) {
              // Cache it for future use
              await cacheTour(productCode, tour);
            }
          }
        }
        
        if (tour && !tour.error) {
          allTours.push(tour);
        }
      } catch (error) {
        // Continue with next tour
      }
    }

    return allTours;
  } catch (error) {
    return [];
  }
}
