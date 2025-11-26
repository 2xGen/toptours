import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import { getCachedTour } from '@/lib/viatorCache';

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

    // Fetch tour from cache or Viator API
    const tour = await getCachedTour(productId);

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
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

