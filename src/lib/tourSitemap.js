import { createSupabaseServiceRoleClient } from './supabaseClient';
import { generateTourSlug } from '@/utils/tourHelpers';

/**
 * Track a tour visit for sitemap inclusion
 * Lightweight: Only tracks tours that have been visited/rendered
 * Similar to tour_operators_crm but specifically for sitemap generation
 */
export async function trackTourForSitemap(productId, tourData = null, destinationData = null) {
  try {
    if (!productId) return;
    
    // Don't block on this - fire and forget
    // This is non-critical tracking for sitemap generation
    (async () => {
      try {
        const supabase = createSupabaseServiceRoleClient();
        
        // Extract tour info
        const tourTitle = tourData?.title || null;
        const tourSlug = tourTitle ? generateTourSlug(tourTitle) : null;
        
        // Extract destination info
        let destinationId = null;
        let destinationSlug = null;
        
        if (destinationData) {
          destinationId = destinationData.destinationId || destinationData.id || null;
          destinationSlug = destinationData.slug || destinationData.id || null;
        } else if (tourData?.destinations && tourData.destinations.length > 0) {
          const primary = tourData.destinations.find(d => d.primary) || tourData.destinations[0];
          destinationId = primary?.ref || primary?.destinationId || primary?.id || null;
          destinationSlug = null; // Would need lookup to get slug
        }
        
        // Use the upsert function to track or update
        const { error } = await supabase.rpc('upsert_tour_sitemap', {
          p_product_id: productId,
          p_tour_title: tourTitle,
          p_tour_slug: tourSlug,
          p_destination_id: destinationId ? String(destinationId).replace(/^d/i, '') : null,
          p_destination_slug: destinationSlug,
        });
        
        if (error) {
          // Silently fail - this is non-critical
          console.warn(`[tourSitemap] Failed to track tour ${productId}:`, error.message);
        }
      } catch (error) {
        // Silently fail - this is non-critical
        console.warn(`[tourSitemap] Error tracking tour ${productId}:`, error.message);
      }
    })();
  } catch (error) {
    // Silently fail - this is non-critical
    console.warn(`[tourSitemap] Unexpected error:`, error.message);
  }
}

/**
 * Track multiple tours for sitemap (batch tracking)
 * Useful for tracking tours displayed on listing pages
 */
export async function trackToursForSitemap(tours, destinationData = null) {
  try {
    if (!tours || !Array.isArray(tours) || tours.length === 0) return;
    
    // Don't block on this - fire and forget
    (async () => {
      try {
        const supabase = createSupabaseServiceRoleClient();
        
        // Extract destination info once
        const destinationId = destinationData?.destinationId || destinationData?.id || null;
        const destinationSlug = destinationData?.slug || destinationData?.id || null;
        
        // Batch process tours (limit to 100 at a time to avoid overwhelming the database)
        const batchSize = 100;
        for (let i = 0; i < tours.length; i += batchSize) {
          const batch = tours.slice(i, i + batchSize);
          
          // Process each tour in the batch
          const promises = batch.map(async (tour) => {
            const productId = tour.productId || tour.productCode || tour.product_id;
            if (!productId) return;
            
            const tourTitle = tour.title || null;
            const tourSlug = tourTitle ? generateTourSlug(tourTitle) : null;
            
            // Use tour's destination if available, otherwise use page destination
            let tourDestinationId = destinationId;
            let tourDestinationSlug = destinationSlug;
            
            if (tour.destinations && tour.destinations.length > 0) {
              const primary = tour.destinations.find(d => d.primary) || tour.destinations[0];
              const destId = primary?.ref || primary?.destinationId || primary?.id;
              if (destId) {
                tourDestinationId = String(destId).replace(/^d/i, '');
              }
            }
            
            try {
              await supabase.rpc('upsert_tour_sitemap', {
                p_product_id: productId,
                p_tour_title: tourTitle,
                p_tour_slug: tourSlug,
                p_destination_id: tourDestinationId,
                p_destination_slug: tourDestinationSlug,
              });
            } catch (error) {
              // Silently fail for individual tours
            }
          });
          
          // Wait for batch to complete before moving to next batch
          await Promise.allSettled(promises);
        }
      } catch (error) {
        console.warn(`[tourSitemap] Error batch tracking tours:`, error.message);
      }
    })();
  } catch (error) {
    // Silently fail - this is non-critical
    console.warn(`[tourSitemap] Unexpected error in batch tracking:`, error.message);
  }
}

/**
 * Get total count of tours in sitemap table
 */
export async function getTourSitemapCount() {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const { count, error } = await supabase
      .from('tour_sitemap')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('[tourSitemap] Error getting count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('[tourSitemap] Unexpected error getting count:', error);
    return 0;
  }
}

/**
 * Get tours for a specific sitemap page (paginated)
 * Google allows max 50,000 URLs per sitemap
 * Using smaller page size (10k) to prevent Vercel timeout
 * 
 * @param {number} page - Page number (0-indexed)
 * @param {number} pageSize - URLs per sitemap file (default 10000)
 */
export async function getToursForSitemapPage(page = 0, pageSize = 10000) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const SUPABASE_BATCH_SIZE = 1000;
    
    // Calculate offset for this sitemap page
    const startOffset = page * pageSize;
    const endOffset = startOffset + pageSize;
    
    // Fetch in batches of 1000 (Supabase limit)
    // Run batches in parallel (5 at a time) for speed
    const batches = [];
    for (let offset = startOffset; offset < endOffset; offset += SUPABASE_BATCH_SIZE) {
      batches.push({ offset, size: Math.min(SUPABASE_BATCH_SIZE, endOffset - offset) });
    }
    
    // Process in parallel chunks of 5 to avoid overwhelming the database
    const PARALLEL_LIMIT = 5;
    let allTours = [];
    
    for (let i = 0; i < batches.length; i += PARALLEL_LIMIT) {
      const chunk = batches.slice(i, i + PARALLEL_LIMIT);
      
      const results = await Promise.all(
        chunk.map(async ({ offset, size }) => {
          const { data, error } = await supabase
            .from('tour_sitemap')
            .select('product_id, tour_title, tour_slug, last_visited_at')
            .order('visit_count', { ascending: false })
            .range(offset, offset + size - 1);
          
          if (error) {
            console.error('[tourSitemap] Error fetching batch:', error);
            return [];
          }
          
          return data || [];
        })
      );
      
      results.forEach(data => {
        allTours = allTours.concat(data);
      });
      
      // If any batch returned less than expected, we've hit the end
      if (results.some(data => data.length === 0)) {
        break;
      }
    }
    
    return allTours;
  } catch (error) {
    console.error('[tourSitemap] Unexpected error fetching tours:', error);
    return [];
  }
}

/**
 * Get all tours for sitemap generation (legacy - uses pagination internally)
 * Returns tours sorted by visit count and last visited date
 * @deprecated Use getToursForSitemapPage for paginated access
 */
export async function getToursForSitemap(limit = 50000) {
  return getToursForSitemapPage(0, limit);
}
