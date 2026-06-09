import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { isFeaturedDestination } from '@/lib/featuredDestinations';

const CACHE_TTL_DAYS = 7;
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const ipWindowStore = new Map();

// Helper to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function passRateLimit(ip) {
  const now = Date.now();
  const existing = ipWindowStore.get(ip);
  if (!existing || now - existing.startedAt > WINDOW_MS) {
    ipWindowStore.set(ip, { count: 1, startedAt: now });
    return true;
  }
  existing.count += 1;
  return existing.count <= MAX_REQUESTS_PER_WINDOW;
}

function isSameOriginRequest(request) {
  const host = request.headers.get('host');
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  try {
    if (origin && new URL(origin).host === host) return true;
  } catch {}
  try {
    if (referer && new URL(referer).host === host) return true;
  } catch {}
  return false;
}

export async function GET(request, { params }) {
  try {
    const internalApiKey = process.env.INTERNAL_API_KEY;
    const requestInternalApiKey = request.headers.get('x-internal-api-key');
    const hasValidInternalApiKey = Boolean(
      internalApiKey && requestInternalApiKey && requestInternalApiKey === internalApiKey
    );
    const sameOrigin = isSameOriginRequest(request);
    if (internalApiKey && !hasValidInternalApiKey && !sameOrigin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ip = getClientIp(request);
    if (!sameOrigin && !hasValidInternalApiKey && !passRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams || {};
    
    if (!id) {
      console.error('No destination ID provided in params:', resolvedParams);
      return NextResponse.json({ error: 'Destination ID required', params: resolvedParams }, { status: 400 });
    }

    if (!isFeaturedDestination(id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching tours for destination:', id);
    }

    // viator_cache table was removed; do not use Supabase for destination tours cache
    const ENABLE_CACHING = false;
    
    let cachedData = null;
    if (ENABLE_CACHING) {
      try {
        const supabase = createSupabaseServiceRoleClient();
        const { data, error: cacheError } = await supabase
          .from('viator_cache')
          .select('*')
          .eq('cache_key', `destination_tours_${id}`)
          .eq('cache_type', 'destination_tours')
          .single();

        if (!cacheError && data) {
          cachedData = data;
        } else if (cacheError && cacheError.code !== 'PGRST116') {
          // PGRST116 is "not found" which is fine, log other errors
          console.warn('Cache check error (non-fatal):', cacheError.message);
        }
      } catch (cacheErr) {
        console.warn('Cache check failed (non-fatal):', cacheErr.message);
        // Continue without cache
      }
    }

    if (cachedData) {
      // Check if cache is still valid (7 days)
      const cachedAt = new Date(cachedData.cached_at);
      const daysSinceCache = (new Date() - cachedAt) / (1000 * 60 * 60 * 24);
      
      if (daysSinceCache < CACHE_TTL_DAYS) {
        // Cache is valid, return cached data
        // The table uses 'tour_data' column (JSONB)
        const tourData = cachedData.tour_data;
        const tours = Array.isArray(tourData) ? tourData : (typeof tourData === 'string' ? JSON.parse(tourData) : []);
        return NextResponse.json({
          tours: tours,
          cached: true,
          cachedAt: cachedData.cached_at
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      } else if (ENABLE_CACHING) {
        // Cache expired, delete it (ignore errors)
        try {
          const supabase = createSupabaseServiceRoleClient();
          await supabase
            .from('viator_cache')
            .delete()
            .eq('cache_key', `destination_tours_${id}`);
        } catch (deleteErr) {
          console.warn('Failed to delete expired cache (non-fatal):', deleteErr.message);
        }
      }
    }

    // Cache miss or expired - fetch from Viator API
    // Get destination name and ID from the full content or SEO content
    const { getDestinationFullContent } = await import('@/data/destinationFullContent');
    const { getDestinationSeoContent } = await import('@/data/destinationSeoContent');
    const { getDestinationById } = await import('@/data/destinationsData');
    const viatorDestinationsClassifiedData = (await import('@/data/viatorDestinationsClassified.json')).default;
    
    let destination = getDestinationById(id);
    let destinationName = destination?.fullName || destination?.name;
    let viatorDestinationId = null;
    
    if (!destinationName) {
      const fullContent = getDestinationFullContent(id);
      const seoContent = getDestinationSeoContent(id);
      destinationName = fullContent?.destinationName || seoContent?.destinationName || id;
      
      // Get Viator destination ID from full content or classified data
      if (fullContent?.destinationId) {
        viatorDestinationId = fullContent.destinationId;
      } else if (seoContent?.destinationId) {
        viatorDestinationId = seoContent.destinationId;
      } else if (Array.isArray(viatorDestinationsClassifiedData)) {
        // Find in classified data
        const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
          const destName = (dest.destinationName || '').toLowerCase().trim();
          const searchName = (fullContent?.destinationName || seoContent?.destinationName || id).toLowerCase().trim();
          return destName === searchName || generateSlug(destName) === id;
        });
        if (classifiedDest) {
          viatorDestinationId = classifiedDest.destinationId;
        }
      }
    } else {
      // For destinations with guides, try to get Viator ID from slug mapping
      const { slugToViatorId } = await import('@/data/viatorDestinationMap');
      viatorDestinationId = slugToViatorId[id] || null;
    }

    // Fetch all tours from Viator API
    const apiKey = process.env.VIATOR_API_KEY;
    if (!apiKey) {
      console.error('Viator API key not configured');
      return NextResponse.json({ error: 'Viator API key not configured' }, { status: 500 });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching tours from Viator API for:', destinationName, 'ID:', viatorDestinationId);
    }
    
    // Build request body exactly like the working tours page (simplified - no productFiltering for now)
    // The tours page uses just searchTerm without productFiltering for basic searches
    const requestBody = {
      searchTerm: destinationName.trim(),
      searchTypes: [{
        searchType: 'PRODUCTS',
        pagination: {
          start: 1,
          count: 50 // COMPLIANCE: Max 50 products per API call
        }
      }],
      currency: 'USD'
    };

    // Note: We're not using productFiltering.destination for now to match the simple search format
    // This matches how app/destinations/[id]/tours/page.js does it (lines 349-359)
    // If needed later, we can add: productFiltering: { destination: String(viatorDestinationId) }

    if (process.env.NODE_ENV === 'development') {
      console.log('Viator API Request:', JSON.stringify(requestBody, null, 2));
    }

    // Keep runtime bounded to reduce function CPU/memory spend.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds

    const response = await fetch('https://api.viator.com/partner/search/freetext', {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorText = '';
      let errorJson = null;
      try {
        errorText = await response.text();
        // Try to parse as JSON
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          // Not JSON, use as text
        }
      } catch (e) {
        errorText = 'Failed to read error response';
      }
      
      const errorDetails = errorJson || { message: errorText };
      console.error('Viator API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        errorJson: errorJson,
        destinationName: destinationName,
        viatorDestinationId: viatorDestinationId,
        requestBody: requestBody
      });
      
      return NextResponse.json({ 
        error: 'Failed to fetch tours from Viator API',
        details: errorText,
        errorJson: errorJson,
        status: response.status,
        destinationName: destinationName,
        viatorDestinationId: viatorDestinationId
      }, { status: 400 });
    }

    const data = await response.json();
    const tours = data.products?.results || [];

    // Cache the results for 7 days (only if caching is enabled)
    if (ENABLE_CACHING && tours.length > 0) {
      try {
        const supabase = createSupabaseServiceRoleClient();
        await supabase
          .from('viator_cache')
          .upsert({
            cache_key: `destination_tours_${id}`,
            cache_type: 'destination_tours',
            tour_data: tours, // Store as JSONB array
            cached_at: new Date().toISOString(),
          }, {
            onConflict: 'cache_key,cache_type'
          });
      } catch (cacheErr) {
        console.warn('Failed to cache tours (non-fatal):', cacheErr.message);
        // Continue without caching - tours will still be returned
      }
    }

    return NextResponse.json({
      tours,
      cached: false,
      cachedAt: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error('Error fetching destination tours:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request timeout',
        details: 'Viator API request exceeded 20 second timeout'
      }, { status: 504 });
    }
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

