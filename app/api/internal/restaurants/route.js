import { getRestaurantsForDestination, formatRestaurantForFrontend } from '@/lib/restaurants';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { destination } = await request.json();
    
    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    // Get restaurants for destination
    let restaurants = await getRestaurantsForDestination(destination);
    
    if (restaurants.length > 0) {
      restaurants = restaurants.map(r => formatRestaurantForFrontend(r));
    }

    return NextResponse.json({ restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

