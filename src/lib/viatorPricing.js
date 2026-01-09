/**
 * Viator Pricing API Integration
 * 
 * Fetches accurate pricing per age band from /availability/schedules endpoint
 * Extracts lowest price per age band across all seasons/dates
 */

import { createSupabaseServiceRoleClient } from './supabaseClient';

const CACHE_TTL_HOURS = 24; // Cache pricing for 24 hours

/**
 * Extract lowest price per age band from schedules response
 */
function extractPricingPerAgeBand(schedulesData) {
  const pricingByAgeBand = {};
  
  if (!schedulesData?.bookableItems || !Array.isArray(schedulesData.bookableItems)) {
    return pricingByAgeBand;
  }
  
  // Iterate through all bookable items and seasons
  schedulesData.bookableItems.forEach(item => {
    if (!item.seasons || !Array.isArray(item.seasons)) return;
    
    item.seasons.forEach(season => {
      if (!season.pricingRecords || !Array.isArray(season.pricingRecords)) return;
      
      season.pricingRecords.forEach(record => {
        if (!record.pricingDetails || !Array.isArray(record.pricingDetails)) return;
        
        record.pricingDetails.forEach(detail => {
          const ageBand = detail.ageBand;
          if (!ageBand) return;
          
          // Get the price (use recommendedRetailPrice as it's what customers see)
          // Try multiple price fields to find the correct one
          const price = detail.price?.original?.recommendedRetailPrice || 
                       detail.price?.original?.retailPrice ||
                       detail.price?.original?.partnerTotalPrice || 
                       detail.price?.original?.price ||
                       detail.price?.recommendedRetailPrice ||
                       detail.price?.retailPrice ||
                       detail.price?.price ||
                       0;
          
          // Track the lowest price for each age band
          if (!pricingByAgeBand[ageBand] || price < pricingByAgeBand[ageBand]) {
            pricingByAgeBand[ageBand] = price;
          }
        });
      });
    });
  });
  
  return pricingByAgeBand;
}

/**
 * Get cached pricing data from Supabase
 * Stores pricing in the tour cache's tour_data JSONB field under 'pricingPerAgeBand'
 */
async function getCachedPricing(productId) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('viator_cache')
      .select('*')
      .eq('product_id', productId)
      .eq('cache_type', 'tour')
      .maybeSingle(); // Use maybeSingle() to avoid error if not found

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine
      console.warn(`Error getting cached pricing: ${error.message}`);
      return null;
    }
    
    if (!data || !data.tour_data) {
      return null;
    }

    // Check if cache is still valid
    const cachedAt = new Date(data.cached_at);
    const now = new Date();
    const hoursSinceCache = (now - cachedAt) / (1000 * 60 * 60);

    if (hoursSinceCache > CACHE_TTL_HOURS) {
      return null;
    }

    // Extract pricing from tour_data JSONB
    return data.tour_data.pricingPerAgeBand || null;
  } catch (error) {
    console.error('Error getting cached pricing:', error.message || error);
    return null;
  }
}

/**
 * Cache pricing data in Supabase
 * Stores pricing in the tour cache's tour_data JSONB field under 'pricingPerAgeBand'
 */
async function cachePricing(productId, pricingData) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Get existing tour cache
    const { data: existing, error: checkError } = await supabase
      .from('viator_cache')
      .select('*')
      .eq('product_id', productId)
      .eq('cache_type', 'tour')
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine
      console.warn(`Error checking for existing cache: ${checkError.message}`);
    }

    if (existing && existing.tour_data) {
      // Update existing tour cache with pricing data
      const updatedTourData = {
        ...existing.tour_data,
        pricingPerAgeBand: pricingData
      };
      
      const { error } = await supabase
        .from('viator_cache')
        .update({
          tour_data: updatedTourData,
          cached_at: new Date().toISOString(),
        })
        .eq('product_id', productId)
        .eq('cache_type', 'tour');

      if (error) {
        console.warn(`Error updating cached pricing for ${productId}:`, error.message || error);
        // Don't throw - pricing caching is optional
      } else {
        console.log(`✅ [PRICING] Cached pricing for ${productId}:`, Object.keys(pricingData));
      }
    } else {
      // No tour cache exists yet - pricing will be added when tour is cached
      // Just log a warning, pricing will be fetched again when tour is cached
      console.log(`ℹ️ [PRICING] No tour cache found for ${productId}, pricing will be cached when tour is fetched`);
      // Don't throw error - pricing will be cached later when tour cache is created
    }
  } catch (error) {
    // Only log error, don't throw - pricing is optional
    console.warn(`⚠️ [PRICING] Error caching pricing for ${productId} (non-critical):`, error.message || error);
  }
}

/**
 * Fetch pricing per age band from Viator schedules API
 */
export async function getPricingPerAgeBand(productId) {
  try {
    // Try cache first
    const cached = await getCachedPricing(productId);
    if (cached) {
      return cached;
    }
    
    // Fetch from API
    const apiBaseUrl = process.env.VIATOR_API_BASE_URL || 'https://api.viator.com';
    const apiKey = process.env.VIATOR_API_KEY;
    
    if (!apiKey) {
      console.warn('VIATOR_API_KEY not configured, cannot fetch pricing');
      return null;
    }
    
    const url = `${apiBaseUrl}/partner/availability/schedules/${productId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch pricing for ${productId}: ${response.status}`);
      return null;
    }
    
    const schedulesData = await response.json();
    
    // Extract pricing per age band
    const pricingByAgeBand = extractPricingPerAgeBand(schedulesData);
    
    // Cache the pricing data
    if (Object.keys(pricingByAgeBand).length > 0) {
      await cachePricing(productId, pricingByAgeBand);
    }
    
    return pricingByAgeBand;
  } catch (error) {
    console.error(`Error fetching pricing for ${productId}:`, error.message || error);
    return null;
  }
}
