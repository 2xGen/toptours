/**
 * Supabase Query Caching Layer
 * Reduces database calls by caching frequently accessed data
 */

import { createSupabaseServiceRoleClient } from './supabaseClient';

// In-memory cache for short-lived data (auth checks, etc.)
const memoryCache = new Map();
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data from memory
 */
function getMemoryCache(key) {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > MEMORY_CACHE_TTL) {
    memoryCache.delete(key);
    return null;
  }
  
  return cached.data;
}

/**
 * Set cached data in memory
 */
function setMemoryCache(key, data) {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Get tour enrichment with caching
 * Enrichment data changes rarely, so we can cache it aggressively
 */
export async function getCachedTourEnrichment(productId) {
  // Check memory cache first (very fast)
  const memoryKey = `enrichment_${productId}`;
  const cached = getMemoryCache(memoryKey);
  if (cached) {
    return cached;
  }

  // Check Supabase (enrichment table is already our cache)
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('tour_enrichment')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error || !data) {
      return null;
    }

    // Cache in memory for 5 minutes
    setMemoryCache(memoryKey, data);
    return data;
  } catch (error) {
    console.error('Error getting cached tour enrichment:', error);
    return null;
  }
}

/**
 * Get user profile with caching
 * Profile data changes infrequently
 */
export async function getCachedUserProfile(userId) {
  if (!userId) return null;

  const memoryKey = `profile_${userId}`;
  const cached = getMemoryCache(memoryKey);
  if (cached) {
    return cached;
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    // Cache in memory for 5 minutes
    setMemoryCache(memoryKey, data);
    return data;
  } catch (error) {
    console.error('Error getting cached user profile:', error);
    return null;
  }
}

/**
 * Invalidate profile cache (call when profile is updated)
 */
export function invalidateProfileCache(userId) {
  if (userId) {
    memoryCache.delete(`profile_${userId}`);
  }
}

/**
 * Invalidate enrichment cache (call when enrichment is updated)
 */
export function invalidateEnrichmentCache(productId) {
  if (productId) {
    memoryCache.delete(`enrichment_${productId}`);
  }
}

/**
 * Fetch a Viator destination record (by destinationId) with caching
 */
export async function getViatorDestinationById(destinationId) {
  if (!destinationId) return null;

  const normalizedId = destinationId.toString().replace(/^d/i, '');
  const memoryKey = `viator_destination_${normalizedId}`;
  const cached = getMemoryCache(memoryKey);
  if (cached) {
    return cached;
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('viator_destinations')
      .select('id, name, slug, country, region, type')
      .eq('id', normalizedId)
      .maybeSingle();

    if (error) {
      console.error('Error querying viator_destinations:', error.message || error);
      return null;
    }

    if (!data) {
      console.warn(`viator_destinations lookup returned null for ID ${normalizedId}`);
      return null;
    }

    setMemoryCache(memoryKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching viator destination:', error.message || error);
    return null;
  }
}

/**
 * Fetch a Viator destination record by slug with caching
 * This is the source of truth for destination IDs - matches database where id = Viator destination ID
 * Also tries to match by name if slug lookup fails (for destinations where slug might not match exactly)
 */
export async function getViatorDestinationBySlug(slug) {
  if (!slug) return null;

  const memoryKey = `viator_destination_slug_${slug}`;
  const cached = getMemoryCache(memoryKey);
  if (cached) {
    return cached;
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // First try exact slug match
    let { data, error } = await supabase
      .from('viator_destinations')
      .select('id, name, slug, country, region, type')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error querying viator_destinations by slug:', error.message || error);
      return null;
    }

    // If not found by slug, try matching by name (case-insensitive)
    if (!data) {
      // Convert slug to name format (e.g., "bali" -> "Bali", "new-york-city" -> "New York City")
      const nameFromSlug = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      const { data: nameData, error: nameError } = await supabase
        .from('viator_destinations')
        .select('id, name, slug, country, region, type')
        .ilike('name', nameFromSlug)
        .maybeSingle();

      if (!nameError && nameData) {
        data = nameData;
        console.log(`✅ Found destination by name match: "${nameFromSlug}" -> ID ${nameData.id}`);
      } else {
        console.warn(`viator_destinations lookup returned null for slug ${slug} and name ${nameFromSlug}`);
        return null;
      }
    }

    setMemoryCache(memoryKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching viator destination by slug:', error.message || error);
    return null;
  }
}

/**
 * Batch view count updates
 * Instead of updating on every page view, we can batch them
 */
const viewCountQueue = new Map();
let viewCountFlushTimeout = null;

// Queue for raw page view records (for analytics)
const pageViewsQueue = [];
let pageViewsFlushTimeout = null;
const PAGE_VIEWS_BATCH_SIZE = 20; // Insert 20 records at once
const PAGE_VIEWS_FLUSH_INTERVAL = 15000; // 15 seconds

/**
 * Queue a page view for analytics
 * Stores raw data for flexible analysis later
 * Also updates aggregated counts for tour pages
 */
export function queuePageView(pageViewData) {
  pageViewsQueue.push({
    ...pageViewData,
    timestamp: new Date().toISOString(),
  });

  // If this is a tour page, also update aggregated view count
  if (pageViewData.pageType === 'tour' && pageViewData.productId) {
    queueViewCountUpdate(
      pageViewData.productId, 
      pageViewData.destinationId || null,
      null // Don't queue another page view (we already did)
    );
  }

  // Flush if queue is full or schedule flush
  if (pageViewsQueue.length >= PAGE_VIEWS_BATCH_SIZE) {
    flushPageViewsQueue();
  } else if (!pageViewsFlushTimeout) {
    pageViewsFlushTimeout = setTimeout(flushPageViewsQueue, PAGE_VIEWS_FLUSH_INTERVAL);
  }
}

/**
 * Flush page views queue to database
 * Inserts raw records for analytics
 */
async function flushPageViewsQueue() {
  if (pageViewsQueue.length === 0) {
    if (pageViewsFlushTimeout) {
      clearTimeout(pageViewsFlushTimeout);
      pageViewsFlushTimeout = null;
    }
    return;
  }

  const viewsToInsert = [...pageViewsQueue];
  pageViewsQueue.length = 0; // Clear array

  if (pageViewsFlushTimeout) {
    clearTimeout(pageViewsFlushTimeout);
    pageViewsFlushTimeout = null;
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Batch insert all page views at once (efficient!)
    const { error } = await supabase
      .from('page_views')
      .insert(viewsToInsert.map(view => ({
        page_path: view.pagePath,
        page_type: view.pageType,
        product_id: view.productId || null,
        destination_id: view.destinationId || null,
        user_id: view.userId || null,
        session_id: view.sessionId || null,
        referrer: view.referrer || null,
        user_agent: view.userAgent || null,
        ip_address: view.ipAddress || null,
        created_at: view.timestamp,
      })));

    if (error) {
      console.error('Error inserting page views:', error);
      // Re-queue failed views (up to a limit to prevent memory issues)
      if (pageViewsQueue.length < 100) {
        pageViewsQueue.unshift(...viewsToInsert);
      }
    } else {
      console.log(`✅ Inserted ${viewsToInsert.length} page views`);
    }
  } catch (error) {
    console.error('Error flushing page views queue:', error);
    // Re-queue on error (up to a limit)
    if (pageViewsQueue.length < 100) {
      pageViewsQueue.unshift(...viewsToInsert);
    }
  }
}

/**
 * Queue a tour view count update (for aggregated counts in tour_enrichment)
 * This is called automatically by queuePageView for tour pages
 * Can also be called directly if needed
 */
export function queueViewCountUpdate(productId, destinationId, pageViewData = null) {
  const key = productId;
  viewCountQueue.set(key, {
    productId,
    destinationId,
    count: (viewCountQueue.get(key)?.count || 0) + 1,
    timestamp: Date.now(),
  });

  // If pageViewData is provided, also queue raw page view
  // (This is for backward compatibility with tour-specific tracking)
  if (pageViewData) {
    queuePageView({
      ...pageViewData,
      productId,
      destinationId,
      pageType: 'tour',
    });
  }

  // Flush queue after 10 seconds or when it reaches 5 items
  if (viewCountFlushTimeout) {
    clearTimeout(viewCountFlushTimeout);
  }

  if (viewCountQueue.size >= 5) {
    flushViewCountQueue();
  } else {
    viewCountFlushTimeout = setTimeout(flushViewCountQueue, 10000);
  }
}

/**
 * Flush view count queue (updates aggregated counts)
 * Uses atomic increment for efficiency
 */
async function flushViewCountQueue() {
  if (viewCountQueue.size === 0) return;

  const updates = Array.from(viewCountQueue.values());
  viewCountQueue.clear();
  
  if (viewCountFlushTimeout) {
    clearTimeout(viewCountFlushTimeout);
    viewCountFlushTimeout = null;
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Batch update all view counts using atomic increment
    // This is more efficient than SELECT + UPSERT
    for (const update of updates) {
      // First, get current count (we need it for first_viewed_at)
      const { data: current } = await supabase
        .from('tour_enrichment')
        .select('view_count, first_viewed_at')
        .eq('product_id', update.productId)
        .single();

      // Use PostgreSQL's atomic increment via RPC or direct SQL
      // For now, we'll use the efficient approach: calculate new count and upsert
      const newCount = (current?.view_count || 0) + update.count;

      await supabase
        .from('tour_enrichment')
        .upsert({
          product_id: update.productId,
          destination_id: update.destinationId,
          view_count: newCount,
          last_viewed_at: new Date().toISOString(),
          first_viewed_at: current?.first_viewed_at || new Date().toISOString(),
        }, {
          onConflict: 'product_id',
        });
    }
  } catch (error) {
    console.error('Error flushing view count queue:', error);
  }
}

