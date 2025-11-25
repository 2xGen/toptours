import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import { formatRestaurantForFrontend } from '@/lib/restaurants';

/**
 * GET /api/internal/restaurant/[restaurantId]
 * Fetch restaurant details by restaurant ID
 */
export async function GET(request, { params }) {
  try {
    const { restaurantId } = params;
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();
    
    // Fetch restaurant by ID
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
      }
      throw error;
    }

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Format restaurant for frontend
    const formattedRestaurant = formatRestaurantForFrontend(restaurant);

    return NextResponse.json(formattedRestaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

