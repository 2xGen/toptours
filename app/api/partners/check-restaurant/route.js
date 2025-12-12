import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { getRestaurantsForDestination } from '@/lib/restaurants';

/**
 * Check if a restaurant exists for a destination
 * GET /api/partners/check-restaurant?destinationName=Aruba&restaurantName=Restaurant Name
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationName = searchParams.get('destinationName');
    const restaurantName = searchParams.get('restaurantName');

    if (!destinationName) {
      return NextResponse.json(
        { error: 'destinationName is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    // Search for destination by name (case-insensitive, partial match)
    const { data: destinations, error: destError } = await supabase
      .from('viator_destinations')
      .select('id, name, slug')
      .ilike('name', `%${destinationName}%`)
      .limit(10);

    if (destError) {
      console.error('Error searching destinations:', destError);
      return NextResponse.json(
        { error: 'Error searching destinations' },
        { status: 500 }
      );
    }

    // If no destinations found
    if (!destinations || destinations.length === 0) {
      return NextResponse.json({
        destinationFound: false,
        restaurants: [],
        message: 'Destination not found'
      });
    }

    // If multiple destinations found, use the first one (exact match preferred)
    // But log a warning
    if (destinations.length > 1) {
      console.log(`Multiple destinations found for "${destinationName}":`, destinations.map(d => d.name));
      // Try to find exact match first
      const exactMatch = destinations.find(d => 
        d.name.toLowerCase() === destinationName.toLowerCase()
      );
      if (exactMatch) {
        console.log(`Using exact match: ${exactMatch.name}`);
        const destination = exactMatch;
        const destinationSlug = destination.slug || destination.id.toString();
        const restaurants = await getRestaurantsForDestination(destinationSlug);
        return NextResponse.json({
          destinationFound: true,
          destination: {
            id: destination.id,
            name: destination.name,
            slug: destination.slug
          },
          restaurants: restaurants.map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug
          })),
          restaurantCount: restaurants.length
        });
      }
      // If no exact match, use first one
      console.log(`No exact match, using first result: ${destinations[0].name}`);
    }

    // Single destination found (or using first from multiple)
    const destination = destinations[0];
    // Use slug instead of ID - restaurants.destination_id is stored as slug (e.g., "chicago")
    const destinationSlug = destination.slug || destination.id.toString();

    console.log(`Fetching restaurants for destination: ${destination.name} (slug: ${destinationSlug})`);

    // Get restaurants for this destination using slug
    const restaurants = await getRestaurantsForDestination(destinationSlug);
    
    console.log(`Found ${restaurants.length} restaurants for ${destination.name}`);

    // If restaurant name provided, search for it
    if (restaurantName) {
      const searchTerm = restaurantName.toLowerCase().trim();
      const matchingRestaurant = restaurants.find(r => 
        r.name?.toLowerCase().includes(searchTerm) ||
        r.short_name?.toLowerCase().includes(searchTerm)
      );

      if (matchingRestaurant) {
        return NextResponse.json({
          destinationFound: true,
          destination: {
            id: destination.id,
            name: destination.name,
            slug: destination.slug
          },
          restaurantFound: true,
          restaurant: {
            id: matchingRestaurant.id,
            name: matchingRestaurant.name,
            slug: matchingRestaurant.slug,
            url: `/destinations/${destination.slug}/restaurants/${matchingRestaurant.slug}`
          },
          restaurants: restaurants.map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug
          }))
        });
      } else {
        // Destination found but restaurant not found
        return NextResponse.json({
          destinationFound: true,
          destination: {
            id: destination.id,
            name: destination.name,
            slug: destination.slug
          },
          restaurantFound: false,
          restaurants: restaurants.map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug
          })),
          message: 'Restaurant not found in this destination'
        });
      }
    }

    // No restaurant name provided, just return destination and restaurants list
    return NextResponse.json({
      destinationFound: true,
      destination: {
        id: destination.id,
        name: destination.name,
        slug: destination.slug
      },
      restaurants: restaurants.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug
      })),
      restaurantCount: restaurants.length
    });

  } catch (error) {
    console.error('Error checking restaurant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

