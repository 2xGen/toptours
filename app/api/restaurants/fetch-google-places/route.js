import { NextResponse } from 'next/server';
import { searchRestaurants, getPlaceDetails, formatRestaurantData } from '@/lib/googlePlacesApi';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * API endpoint to fetch restaurant data from Google Places API
 * POST /api/restaurants/fetch-google-places
 * Body: { destinationId: string, query: string, location?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { destinationId, query, location, placeIds } = body;

    if (!destinationId) {
      return NextResponse.json(
        { error: 'destinationId is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();
    const results = [];

    // If placeIds are provided, fetch details for those specific places
    if (placeIds && Array.isArray(placeIds) && placeIds.length > 0) {
      for (const placeId of placeIds) {
        try {
          const placeDetails = await getPlaceDetails(placeId);
          const formattedData = formatRestaurantData(placeDetails, destinationId);
          
          // Check if restaurant already exists
          const { data: existing } = await supabase
            .from('restaurants')
            .select('id')
            .eq('google_place_id', placeId)
            .single();

          if (existing) {
            // Update existing restaurant
            const { data, error } = await supabase
              .from('restaurants')
              .update({
                ...formattedData,
                data_updated_at: new Date().toISOString(),
              })
              .eq('google_place_id', placeId)
              .select()
              .single();

            if (error) throw error;
            results.push({ action: 'updated', data });
          } else {
            // Insert new restaurant
            const { data, error } = await supabase
              .from('restaurants')
              .insert({
                ...formattedData,
                is_active: true,
              })
              .select()
              .single();

            if (error) throw error;
            results.push({ action: 'created', data });
          }

          // Add delay to respect rate limits (1 request per second)
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error processing place ${placeId}:`, error);
          results.push({ action: 'error', placeId, error: error.message });
        }
      }
    } else if (query) {
      // Search for restaurants using query
      const places = await searchRestaurants(query, location);

      for (const place of places) {
        try {
          // Get full details for each place
          const placeDetails = await getPlaceDetails(place.id);
          const formattedData = formatRestaurantData(placeDetails, destinationId);
          
          // Check if restaurant already exists
          const { data: existing } = await supabase
            .from('restaurants')
            .select('id')
            .eq('google_place_id', place.id)
            .single();

          if (existing) {
            // Update existing restaurant
            const { data, error } = await supabase
              .from('restaurants')
              .update({
                ...formattedData,
                data_updated_at: new Date().toISOString(),
              })
              .eq('google_place_id', place.id)
              .select()
              .single();

            if (error) throw error;
            results.push({ action: 'updated', data });
          } else {
            // Insert new restaurant
            const { data, error } = await supabase
              .from('restaurants')
              .insert({
                ...formattedData,
                is_active: true,
              })
              .select()
              .single();

            if (error) throw error;
            results.push({ action: 'created', data });
          }

          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error processing place ${place.id}:`, error);
          results.push({ action: 'error', placeId: place.id, error: error.message });
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Either query or placeIds must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

