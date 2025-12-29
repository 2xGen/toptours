import { getRestaurantCountsByDestination } from '@/lib/restaurants';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const counts = await getRestaurantCountsByDestination();
    return NextResponse.json({ counts });
  } catch (error) {
    console.error('Error fetching restaurant counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant counts' },
      { status: 500 }
    );
  }
}

