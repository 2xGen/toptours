import { extractRestaurantStructuredValues, calculateRestaurantPreferenceMatch } from '@/lib/restaurantMatching';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { formatRestaurantForFrontend } from '@/lib/restaurants';

export async function POST(request, { params }) {
  try {
    const { restaurantId } = params;
    if (!restaurantId) {
      return Response.json({ error: 'Missing restaurant id' }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();
    const body = await request.json();
    const { userId, restaurant } = body;

    // Get user preferences if userId provided
    let userPreferences = null;
    if (userId) {
      const { getCachedUserProfile } = await import('@/lib/supabaseCache');
      const profile = await getCachedUserProfile(userId);

      if (!profile) {
        return Response.json({ error: 'User profile not found' }, { status: 404 });
      }

      userPreferences = profile.trip_preferences;
      if (!userPreferences || typeof userPreferences !== 'object') {
        return Response.json({ 
          error: 'No trip preferences found. Please set your preferences in your profile first.' 
        }, { status: 400 });
      }
    } else {
      return Response.json({ error: 'User authentication required' }, { status: 401 });
    }

    // Get restaurant data (from request body or fetch from database)
    let restaurantData = restaurant;
    
    if (!restaurantData) {
      // Fetch from Supabase database
      const { data: restaurantFromDb, error: dbError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId) // Use 'id' field, not 'restaurant_id'
        .eq('is_active', true)
        .single();

      if (dbError || !restaurantFromDb) {
        return Response.json({ error: 'Restaurant not found' }, { status: 404 });
      }
      
      // Format restaurant data to frontend format (converts snake_case to camelCase)
      restaurantData = formatRestaurantForFrontend(restaurantFromDb);
    } else {
      // If restaurant data is provided, ensure it's in the correct format
      // If it's already formatted (from frontend), use as-is
      // If it's raw DB format, format it
      if (restaurantData.outdoor_seating !== undefined) {
        // Looks like raw DB format, format it
        restaurantData = formatRestaurantForFrontend(restaurantData);
      }
    }

    if (!restaurantData || typeof restaurantData !== 'object') {
      return Response.json({ error: 'Invalid restaurant data' }, { status: 400 });
    }

    // Extract structured values from restaurant (formula-based, no AI)
    // This expects the frontend format (camelCase)
    const restaurantValues = extractRestaurantStructuredValues(restaurantData);

    if (restaurantValues.error) {
      return Response.json({ error: restaurantValues.error }, { status: 500 });
    }

    // Calculate match using formula-based algorithm
    const matchResult = calculateRestaurantPreferenceMatch(
      userPreferences,
      restaurantValues,
      restaurantData
    );

    if (matchResult.error) {
      return Response.json({ error: matchResult.error }, { status: 500 });
    }

    return Response.json({ match: matchResult });
  } catch (error) {
    console.error('Error generating restaurant match:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate restaurant match',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

