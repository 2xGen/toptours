import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import { getCachedTour, cacheTour } from '@/lib/viatorCache';

/**
 * GET /api/internal/tour/[productId]
 * Fetch tour details by product ID
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.productId;
    
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    // Try to get cached tour data first
    let tour = await getCachedTour(productId);
    
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
        },
        cache: 'no-store'
      });

      if (!productResponse.ok) {
        if (productResponse.status === 404) {
          return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
        }
        return NextResponse.json(
          { error: `Viator API error: ${productResponse.status}` },
          { status: productResponse.status }
        );
      }

      tour = await productResponse.json();
      
      if (!tour || tour.error) {
        return NextResponse.json({ error: 'Tour not found or invalid tour data' }, { status: 404 });
      }

      // Cache the tour data for future requests
      await cacheTour(productId, tour);
    }

    return NextResponse.json(tour);
  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

