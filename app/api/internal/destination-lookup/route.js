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

      return NextResponse.json({
        id: hardcodedDest.id,
        name: hardcodedDest.name,
        fullName: hardcodedDest.fullName || hardcodedDest.name,
        destinationId: hardcodedDest.destinationId || viatorDest?.id || null,
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
    let dest = null;
    try {
      if (name) {
        dest = await getViatorDestinationByName(name);
      } else if (slug) {
        dest = await getViatorDestinationBySlug(slug);
      }
    } catch (error) {
      console.error('Error fetching Viator destination:', error);
    }

    if (dest) {
      const destId = dest.slug || dest.id;
      
      // Try to get full content for database destinations
      const fullContent = getDestinationFullContent(destId);
      const seoContent = getDestinationSeoContent(destId);
      
      return NextResponse.json({
        id: destId,
        name: dest.name,
        fullName: dest.name,
        destinationId: dest.id,
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

