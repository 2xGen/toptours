import { NextResponse } from 'next/server';
import { getPromotedRestaurantsByDestination } from '@/lib/promotionSystem';

/**
 * GET /api/internal/promoted-restaurants-by-destination
 * Fetches promoted restaurants for a given destination
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
    
    const promotedRestaurants = await getPromotedRestaurantsByDestination(destinationId, limit);
    
    return NextResponse.json({
      promotedRestaurants
    });
  } catch (error) {
    console.error('Error fetching promoted restaurants by destination:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promoted restaurants' },
      { status: 500 }
    );
  }
}

