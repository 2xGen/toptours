/**
 * Viator Reviews API Integration
 * 
 * Fetches and caches product reviews from Viator API
 * Complies with Viator requirements:
 * - Weekly cache refresh (triggered on page visit)
 * - Delete reviews that no longer exist in API
 * - Provider must be displayed (Viator/Tripadvisor)
 * - Reviews must be non-indexed
 */

import { createSupabaseServiceRoleClient } from './supabaseClient.js';

const CACHE_DURATION_DAYS = 7; // Weekly cache

/**
 * Hash review count for change detection
 */
function hashReviewCount(count) {
  return String(count || 0);
}

/**
 * Fetch reviews from Viator API
 */
export async function fetchProductReviews(productId, options = {}) {
  // Use the same API key as other Viator API calls (production)
  const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
  
  if (!apiKey) {
    throw new Error('VIATOR_API_KEY not configured');
  }

  const requestBody = {
    productCode: productId,
    count: options.count || 5,
    start: 1, // 1-based pagination
    provider: options.provider || 'ALL',
    sortBy: options.sortBy || 'MOST_RECENT_PER_LOCALE',
    reviewsForNonPrimaryLocale: options.reviewsForNonPrimaryLocale !== false,
    showMachineTranslated: options.showMachineTranslated !== false,
    ratings: options.ratings || [4, 5], // Only 4-5 star reviews for snippets
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Use production API (full access approved)
    const reviewsEndpoint = 'https://api.viator.com/partner/reviews/product';

    // Silent fetch - reduce console noise

    const response = await fetch(reviewsEndpoint, {
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
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Viator API took too long to respond');
    }
    throw error;
  }
}

/**
 * Get cached reviews (lazy loading - only cache when page is visited)
 */
export async function getCachedReviews(productId, currentReviewCount = null) {
  const supabase = createSupabaseServiceRoleClient();
  
  try {
    // Check if cache exists
    const { data: cached, error: fetchError } = await supabase
      .from('tour_reviews_cache')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected if no cache)
      throw fetchError;
    }

    // If cache exists and not expired
    if (cached && new Date(cached.expires_at) > new Date()) {
      // Check if review count changed (trigger refresh)
      if (currentReviewCount !== null) {
        const currentHash = hashReviewCount(currentReviewCount);
        if (cached.review_count_hash !== currentHash) {
          // Review count changed - refresh cache
          return await refreshReviewsCache(productId, currentReviewCount);
        }
      }
      
      // Return cached data
      return cached.reviews_data;
    }

    // Cache expired or doesn't exist - fetch from API (lazy loading on page visit)
    return await refreshReviewsCache(productId, currentReviewCount);
  } catch (error) {
    // On error, try to fetch from API as fallback (silent)
    try {
      return await refreshReviewsCache(productId, currentReviewCount);
    } catch (fetchError) {
      return null;
    }
  }
}

/**
 * Refresh reviews cache from API
 */
async function refreshReviewsCache(productId, currentReviewCount = null) {
  const supabase = createSupabaseServiceRoleClient();
  
  try {
    // Fetch from API
    const reviewsData = await fetchProductReviews(productId);
    
    // Extract summary data
    const totalReviews = reviewsData.totalReviewsSummary?.totalReviews || 0;
    const viatorSource = reviewsData.totalReviewsSummary?.sources?.find(s => s.provider === 'VIATOR');
    const tripadvisorSource = reviewsData.totalReviewsSummary?.sources?.find(s => s.provider === 'TRIPADVISOR');
    
    const viatorCount = viatorSource?.totalCount || 0;
    const tripadvisorCount = tripadvisorSource?.totalCount || 0;
    
    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_DURATION_DAYS);
    
    // Prepare cache data
    const cacheData = {
      product_id: productId,
      reviews_data: reviewsData,
      total_reviews_count: totalReviews,
      viator_count: viatorCount,
      tripadvisor_count: tripadvisorCount,
      cached_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      review_count_hash: hashReviewCount(currentReviewCount || totalReviews),
      updated_at: new Date().toISOString(),
    };

    // Upsert cache
    const { error: upsertError } = await supabase
      .from('tour_reviews_cache')
      .upsert(cacheData, {
        onConflict: 'product_id',
      });

    if (upsertError) {
      throw upsertError;
    }

    return reviewsData;
  } catch (error) {
    throw error;
  }
}

/**
 * Validate and clean up reviews (delete reviews that no longer exist in API)
 * This should be called after fetching fresh reviews
 */
export async function validateAndCleanupReviews(productId, freshReviewsData) {
  const supabase = createSupabaseServiceRoleClient();
  
  try {
    // Get current cache
    const { data: cached } = await supabase
      .from('tour_reviews_cache')
      .select('reviews_data')
      .eq('product_id', productId)
      .single();

    if (!cached || !cached.reviews_data?.reviews) {
      return; // No cache to validate
    }

    // Get review IDs from fresh API response
    const freshReviewIds = new Set(
      (freshReviewsData.reviews || []).map(r => r.reviewReference)
    );

    // Get review IDs from cache
    const cachedReviewIds = new Set(
      (cached.reviews_data.reviews || []).map(r => r.reviewReference)
    );

    // Find reviews that no longer exist
    const deletedReviewIds = Array.from(cachedReviewIds).filter(
      id => !freshReviewIds.has(id)
    );

    if (deletedReviewIds.length > 0) {
      console.log(`🧹 Found ${deletedReviewIds.length} deleted reviews for ${productId}`);
      // Cache will be updated with fresh data (which excludes deleted reviews)
      // No additional cleanup needed as cache is replaced on refresh
    }
  } catch (error) {
    console.error('Error validating reviews:', error);
    // Non-critical error - continue
  }
}

/**
 * Format review snippet (50 characters max)
 * Ensures snippet is long enough to get attention but encourages clicking
 */
export function formatReviewSnippet(text, maxLength = 50) {
  if (!text) return '';
  
  // Remove extra whitespace
  const cleanText = text.trim().replace(/\s+/g, ' ');
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // Try to cut at word boundary (prefer sentence end, then space)
  const snippet = cleanText.substring(0, maxLength);
  const lastPeriod = snippet.lastIndexOf('.');
  const lastSpace = snippet.lastIndexOf(' ');
  
  // Prefer cutting at period if it's not too short
  if (lastPeriod > maxLength * 0.6) {
    return cleanText.substring(0, lastPeriod + 1);
  }
  
  // Otherwise cut at word boundary
  if (lastSpace > maxLength * 0.6) {
    return cleanText.substring(0, lastSpace);
  }
  
  // Fallback: cut at maxLength
  return snippet;
}

/**
 * Format review date
 */
export function formatReviewDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  } catch (error) {
    return dateString;
  }
}

/**
 * Get Viator booking URL with review anchor
 */
export function getViatorBookingUrl(tour, reviewReference = null) {
  // Try to get productUrl from tour object
  let baseUrl = tour?.productUrl || tour?.url || '';
  
  if (!baseUrl && tour?.productId) {
    // Fallback: construct URL from product ID and destination
    const productId = tour.productId;
    const destination = tour.destinations?.[0]?.destinationName || '';
    const slug = tour.seo?.title || tour.title || '';
    
    if (destination) {
      const destinationSlug = destination.toLowerCase().replace(/\s+/g, '-');
      const tourSlug = slug.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      baseUrl = `https://www.viator.com/tours/${destinationSlug}/${tourSlug}/d${productId}`;
    } else {
      baseUrl = `https://www.viator.com/tours/${productId}`;
    }
  }
  
  // Add review anchor if provided
  if (reviewReference) {
    return `${baseUrl}?reviews=true#${reviewReference}`;
  }
  
  // Link to reviews section
  return `${baseUrl}?reviews=true`;
}
