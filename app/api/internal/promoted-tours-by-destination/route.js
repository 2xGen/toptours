import { NextResponse } from 'next/server';
import { getPromotedToursByDestination } from '@/lib/promotionSystem';

/**
 * GET /api/internal/promoted-tours-by-destination
 * Fetches promoted tours for a given destination
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    
    if (!destinationId) {
      return NextResponse.json(
        { error: 'destinationId is required' },
        { status: 400 }
      );
    }
    
    const promotedTours = await getPromotedToursByDestination(destinationId, limit);
    
    return NextResponse.json({
      promotedTours
    });
  } catch (error) {
    console.error('Error fetching promoted tours by destination:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promoted tours' },
      { status: 500 }
    );
  }
}

