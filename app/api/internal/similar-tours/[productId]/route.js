import { NextResponse } from 'next/server';
import { getCachedTour, useSupabaseCache } from '@/lib/viatorCache';
import { fetchSimilarToursServer } from '../../../../tours/[productId]/fetchSimilarTours';

/**
 * GET /api/internal/similar-tours/[productId]
 * Fetch similar tours for a product (on demand - called when user clicks "Load similar tours").
 * Saves Viator API calls by not fetching similar tours on every tour detail page view.
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.productId;

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId', similarTours: [] }, { status: 400 });
    }

    let tour = null;
    if (useSupabaseCache()) tour = await getCachedTour(productId);
    if (!tour) {
      const apiKey = process.env.VIATOR_API_KEY;
      if (apiKey) {
        const res = await fetch(`https://api.viator.com/partner/products/${productId}?currency=USD`, {
          headers: { 'exp-api-key': apiKey, 'Accept': 'application/json;version=2.0', 'Accept-Language': 'en-US' },
        });
        if (res.ok) tour = await res.json();
      }
    }
    if (!tour || tour.error) {
      return NextResponse.json({ similarTours: [], error: 'Tour not found' }, { status: 200 });
    }

    const destinationData = (tour.destinations && tour.destinations.length > 0)
      ? (() => {
          const primary = tour.destinations.find(d => d.primary) || tour.destinations[0];
          return {
            destinationId: primary?.ref || primary?.destinationId || primary?.id,
            destinationName: primary?.destinationName || primary?.name,
            slug: primary?.slug,
          };
        })()
      : null;

    const { similarTours, error } = await fetchSimilarToursServer(productId, tour, destinationData);

    if (error) {
      return NextResponse.json(
        { similarTours: [], error: error?.message || 'Failed to load similar tours' },
        { status: 200 }
      );
    }

    return NextResponse.json({ similarTours: similarTours || [] });
  } catch (err) {
    console.error('[similar-tours] Error:', err?.message || err);
    return NextResponse.json(
      { similarTours: [], error: 'Failed to load similar tours' },
      { status: 500 }
    );
  }
}
