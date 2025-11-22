import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

const CACHE_TTL_DAYS = 7;

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

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams || {};
    
    if (!id) {
      console.error('No destination ID provided in params:', resolvedParams);
      return NextResponse.json({ error: 'Destination ID required', params: resolvedParams }, { status: 400 });
    }
    
    console.log('Fetching tours for destination:', id);

    // Skip caching for now until SQL script is run
    // TODO: Enable caching after running scripts/supabase-add-destination-tours-cache-support.sql
    const ENABLE_CACHING = false; // Set to true after running SQL script
    
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

    console.log('Fetching tours from Viator API for:', destinationName, 'ID:', viatorDestinationId);
    
    // Build request body exactly like the working tours page (simplified - no productFiltering for now)
    // The tours page uses just searchTerm without productFiltering for basic searches
    const requestBody = {
      searchTerm: destinationName.trim(),
      searchTypes: [{
        searchType: 'PRODUCTS',
        pagination: {
          start: 1,
          count: 100 // Get up to 100 tours
        }
      }],
      currency: 'USD'
    };

    // Note: We're not using productFiltering.destination for now to match the simple search format
    // This matches how app/destinations/[id]/tours/page.js does it (lines 349-359)
    // If needed later, we can add: productFiltering: { destination: String(viatorDestinationId) }

    console.log('Viator API Request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.viator.com/partner/search/freetext', {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

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
    });

  } catch (error) {
    console.error('Error fetching destination tours:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

