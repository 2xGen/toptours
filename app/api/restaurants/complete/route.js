import { NextResponse } from 'next/server';
import { getPlaceDetails, formatRestaurantData } from '@/lib/googlePlacesApi';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * API endpoint to complete/fetch full restaurant details from Google Places API
 * POST /api/restaurants/complete
 * Body: { restaurantId: number, googlePlaceId?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { restaurantId, googlePlaceId } = body;

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    // Fetch restaurant from database
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (fetchError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Use provided googlePlaceId or the one from the restaurant record
    const placeId = googlePlaceId || restaurant.google_place_id;

    if (!placeId) {
      return NextResponse.json(
        { error: 'Google Place ID is required to complete restaurant details' },
        { status: 400 }
      );
    }

    // Fetch complete details from Google Places API
    const placeDetails = await getPlaceDetails(placeId);
    
    // Format the data
    const formattedData = formatRestaurantData(placeDetails, restaurant.destination_id);

    // Update restaurant with complete details
    // Preserve existing fields that shouldn't be overwritten
    const updateData = {
      ...formattedData,
      destination_id: restaurant.destination_id, // Preserve destination_id
      is_active: restaurant.is_active !== undefined ? restaurant.is_active : true, // Preserve is_active
      data_updated_at: new Date().toISOString(),
    };

    const { data: updatedRestaurant, error: updateError } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', restaurantId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating restaurant:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error('Error completing restaurant details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete restaurant details' },
      { status: 500 }
    );
  }
}
