import { NextResponse } from 'next/server';
import { getCachedTour, useSupabaseCache } from '@/lib/viatorCache';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.productId;
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    let tour = null;
    if (useSupabaseCache()) tour = await getCachedTour(productId);
    if (!tour) {
      // Cache miss - fetch from Viator API
      const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
      const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;
      
      const productResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'exp-api-key': apiKey,
          'Accept': 'application/json;version=2.0',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json'
        }
      });

      if (!productResponse.ok) {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
      }

      tour = await productResponse.json();
    }

    // Extract destination information
    const destinationInfo = {
      productId,
      tourTitle: tour.title,
      allDestinations: tour.destinations || [],
      primaryDestination: null,
      extractedDestinationId: null,
      extractedDestinationName: null,
    };

    if (tour?.destinations && tour.destinations.length > 0) {
      const primaryDestination = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
      
      destinationInfo.primaryDestination = primaryDestination;
      destinationInfo.extractedDestinationId = primaryDestination?.ref || primaryDestination?.destinationId || primaryDestination?.id;
      destinationInfo.extractedDestinationName = primaryDestination?.destinationName || primaryDestination?.name;
    }

    return NextResponse.json(destinationInfo, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error fetching tour destination:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

