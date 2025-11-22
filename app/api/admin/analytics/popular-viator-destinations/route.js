import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { destinations } from '@/data/destinationsData';
import viatorDestinationsData from '@/data/viatorDestinations.json';

// Helper to generate slug from name (same as used in the app)
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const supabase = createSupabaseServiceRoleClient();

    // Get all page views for destination pages in the date range
    const { data: pageViewsData, error } = await supabase
      .from('page_views')
      .select('page_path, destination_id')
      .gte('created_at', dateFrom.toISOString())
      .like('page_path', '/destinations/%');

    if (error) {
      console.error('Error fetching page views:', error);
      return Response.json({ error: 'Failed to fetch page views' }, { status: 500 });
    }

    // Get list of featured destination IDs (182 destinations) - both ID and slug
    const featuredDestinationIds = new Set(
      destinations.map(d => d.id)
    );
    const featuredDestinationSlugs = new Set(
      destinations.map(d => d.id.toLowerCase())
    );

    // Try to load classified destinations if available (has region/country)
    let viatorDestinationsClassified = null;
    try {
      const classifiedModule = await import('@/data/viatorDestinationsClassified.json');
      viatorDestinationsClassified = classifiedModule.default || classifiedModule;
    } catch (e) {
      // File doesn't exist yet, that's okay
    }
    
    // Build a map of all Viator destinations by slug
    // Use classified data if available (has region/country), otherwise use regular data
    const viatorDestinations = Array.isArray(viatorDestinationsClassified) 
      ? viatorDestinationsClassified 
      : (Array.isArray(viatorDestinationsData) ? viatorDestinationsData : []);
    
    const viatorDestinationsBySlug = new Map();
    const viatorDestinationsById = new Map();
    
    viatorDestinations.forEach(dest => {
      const destName = dest.destinationName || dest.name || '';
      const slug = generateSlug(destName);
      const destId = dest.destinationId?.toString();
      
      if (slug) {
        viatorDestinationsBySlug.set(slug, dest);
      }
      if (destId) {
        viatorDestinationsById.set(destId, dest);
        // Also map numeric ID without 'd' prefix
        const numericId = destId.replace(/^d/i, '');
        if (numericId !== destId) {
          viatorDestinationsById.set(numericId, dest);
        }
      }
    });

    // Aggregate views by destination (extract destination ID from path)
    const destinationViews = {};
    
    if (pageViewsData) {
      pageViewsData.forEach(view => {
        // Extract destination ID from path like "/destinations/vanuatu/tours" or "/destinations/vanuatu"
        const pathMatch = view.page_path.match(/\/destinations\/([^\/]+)/);
        if (pathMatch) {
          const pathDestinationId = pathMatch[1];
          
          // Skip if it's a featured destination (check both ID and slug)
          if (featuredDestinationIds.has(pathDestinationId) || 
              featuredDestinationSlugs.has(pathDestinationId.toLowerCase())) {
            return;
          }
          
          // Check if this is a Viator destination (by slug or ID)
          const viatorDest = viatorDestinationsBySlug.get(pathDestinationId) || 
                           viatorDestinationsById.get(pathDestinationId) ||
                           viatorDestinationsById.get(pathDestinationId.replace(/^d/i, ''));
          
          // Only track if it's a known Viator destination
          if (viatorDest) {
            const destKey = viatorDest.destinationId?.toString() || pathDestinationId;
            
            if (!destinationViews[destKey]) {
              destinationViews[destKey] = {
                destinationId: pathDestinationId, // Keep the slug for URL
                viatorId: viatorDest.destinationId,
                viewCount: 0,
                paths: new Set(),
              };
            }
            destinationViews[destKey].viewCount += 1;
            destinationViews[destKey].paths.add(view.page_path);
          }
        }
      });
    }

    // Combine view data with destination info
    const popularDestinations = Object.values(destinationViews)
      .map(({ destinationId, viatorId, viewCount, paths }) => {
        const dest = viatorDestinationsById.get(viatorId?.toString()) || 
                    viatorDestinationsBySlug.get(destinationId);
        
        return {
          destinationId, // Slug for URL
          destinationName: dest?.destinationName || dest?.name || destinationId,
          viewCount,
          pageCount: paths.size,
          region: dest?.region || null,
          country: dest?.country || null,
          viatorId: viatorId || dest?.destinationId || null,
        };
      })
      .filter(dest => dest.viewCount > 0) // Only show destinations with views
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 50); // Top 50

    return Response.json({
      popularDestinations,
      dateRange: days,
      total: popularDestinations.length,
    });
  } catch (error) {
    console.error('Error fetching popular Viator destinations:', error);
    return Response.json({ error: 'Failed to fetch popular destinations' }, { status: 500 });
  }
}

