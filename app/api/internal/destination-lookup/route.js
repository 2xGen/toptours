import { getViatorDestinationByName, getViatorDestinationBySlug } from '@/lib/supabaseCache';
import { destinations, getDestinationById } from '@/data/destinationsData';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const slug = searchParams.get('slug');
    
    if (!name && !slug) {
      return NextResponse.json(
        { error: 'Name or slug is required' },
        { status: 400 }
      );
    }

    // Check hardcoded destinations first (for restaurant matching)
    const hardcodedDest = destinations.find(d => {
      if (name) {
        return d.name.toLowerCase() === name.toLowerCase() ||
               d.fullName?.toLowerCase() === name.toLowerCase();
      }
      if (slug) {
        return d.id === slug;
      }
      return false;
    });
    
    if (hardcodedDest) {
      // Try to get Viator destination ID if available
      let viatorDest = null;
      try {
        if (name) {
          viatorDest = await getViatorDestinationByName(name);
        } else if (slug) {
          viatorDest = await getViatorDestinationBySlug(slug);
        }
      } catch (error) {
        console.error('Error fetching Viator destination:', error);
      }

      // For hardcoded destinations, id is already the slug (e.g., "bali")
      // This matches how restaurants are stored (destination_id = "bali")
      return NextResponse.json({
        id: hardcodedDest.id, // This is the slug (e.g., "bali") - matches restaurant destination_id
        name: hardcodedDest.name,
        fullName: hardcodedDest.fullName || hardcodedDest.name,
        destinationId: hardcodedDest.destinationId || viatorDest?.id || null, // Numeric ID for Viator API
        slug: hardcodedDest.id, // Explicitly include slug (same as id for hardcoded)
        isHardcoded: true,
        // Include full destination info
        category: hardcodedDest.category,
        country: hardcodedDest.country,
        heroDescription: hardcodedDest.heroDescription,
        briefDescription: hardcodedDest.briefDescription,
        whyVisit: hardcodedDest.whyVisit,
        highlights: hardcodedDest.highlights,
        gettingAround: hardcodedDest.gettingAround,
        bestTimeToVisit: hardcodedDest.bestTimeToVisit,
        imageUrl: hardcodedDest.imageUrl,
      });
    }

    // Try database lookup
    // First try by slug (preferred for restaurant matching)
    let dest = null;
    try {
      if (slug) {
        dest = await getViatorDestinationBySlug(slug);
      } else if (name) {
        // Try to find by slug first (convert name to slug)
        const nameSlug = name.toLowerCase().trim().replace(/\s+/g, '-');
        dest = await getViatorDestinationBySlug(nameSlug);
        // If not found by slug, try by name
        if (!dest) {
          dest = await getViatorDestinationByName(name);
        }
      }
    } catch (error) {
      console.error('Error fetching Viator destination:', error);
    }

    if (dest) {
      // Prefer slug as the ID (for restaurant matching)
      const destId = dest.slug || dest.id;
      
      // Try to get full content for database destinations
      const fullContent = getDestinationFullContent(destId);
      const seoContent = getDestinationSeoContent(destId);
      
      return NextResponse.json({
        id: destId, // Use slug as ID for restaurant matching
        name: dest.name,
        fullName: dest.name,
        destinationId: dest.id, // Keep numeric ID for Viator API
        slug: dest.slug, // Include slug explicitly
        isHardcoded: false,
        category: dest.region || null,
        country: dest.country || null,
        // Include full content if available
        heroDescription: fullContent?.heroDescription || seoContent?.heroDescription || null,
        briefDescription: fullContent?.briefDescription || seoContent?.briefDescription || null,
        whyVisit: fullContent?.whyVisit || null,
        highlights: fullContent?.highlights || null,
        gettingAround: fullContent?.gettingAround || null,
        bestTimeToVisit: fullContent?.bestTimeToVisit || null,
        imageUrl: fullContent?.imageUrl || seoContent?.imageUrl || seoContent?.ogImage || null,
      });
    }

    return NextResponse.json(
      { error: 'Destination not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error in destination lookup:', error);
    return NextResponse.json(
      { error: 'Failed to lookup destination' },
      { status: 500 }
    );
  }
}

