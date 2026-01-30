import { NextResponse } from 'next/server';
import { getCachedReviews } from '@/lib/viatorReviews';

/**
 * GET /api/internal/tour-reviews/[productId]
 * Fetch review snippets for a tour (on demand - called when user clicks "Load reviews").
 * Saves Viator API calls by not fetching reviews on every tour detail page view.
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.productId;

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    const reviews = await getCachedReviews(productId, null);
    if (!reviews) {
      return NextResponse.json({ reviews: [], totalReviewsSummary: null }, { status: 200 });
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('[tour-reviews] Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to load reviews', reviews: [] },
      { status: 500 }
    );
  }
}
