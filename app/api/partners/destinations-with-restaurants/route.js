import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * Get only destinations that have restaurants
 * GET /api/partners/destinations-with-restaurants
 */
export async function GET(request) {
  try {
    const supabase = createSupabaseServiceRoleClient();

    // Get distinct destination_ids from restaurants table
    // Use a more efficient approach: get unique destination_ids directly
    // Note: restaurants.destination_id is TEXT, viator_destinations.id is TEXT
    const { data: restaurantDestinations, error: restError } = await supabase
      .from('restaurants')
      .select('destination_id')
      .eq('is_active', true)
      .not('destination_id', 'is', null)
      .limit(10000); // Limit to prevent timeout, but should be enough

    if (restError) {
      console.error('Error fetching restaurant destinations:', restError);
      return NextResponse.json(
        { error: 'Error fetching destinations with restaurants' },
        { status: 500 }
      );
    }

    if (!restaurantDestinations || restaurantDestinations.length === 0) {
      return NextResponse.json({ destinations: [], total: 0 });
    }

    // Get unique destination IDs (both are TEXT, so no conversion needed)
    const uniqueDestinationIds = [...new Set(
      restaurantDestinations.map(r => r.destination_id?.toString().trim())
    )].filter(Boolean);

    console.log(`Found ${uniqueDestinationIds.length} unique destination IDs with restaurants`);
    console.log('Sample destination IDs:', uniqueDestinationIds.slice(0, 10));

    if (uniqueDestinationIds.length === 0) {
      console.log('No unique destination IDs found');
      return NextResponse.json({ destinations: [], total: 0 });
    }

    // Fetch all matching destinations
    // restaurants.destination_id is stored as SLUG (e.g., "aruba"), not as numeric ID
    // So we need to match with viator_destinations.slug, not viator_destinations.id
    // Supabase .in() can handle up to 1000 items, so if we have more, we need to batch
    let allDestinations = [];
    const batchSize = 1000;
    
    for (let i = 0; i < uniqueDestinationIds.length; i += batchSize) {
      const batch = uniqueDestinationIds.slice(i, i + batchSize);
      
      console.log(`Fetching batch ${Math.floor(i / batchSize) + 1}: ${batch.length} destination slugs`);
      
      // Try matching by slug first (most likely case)
      const { data: destinations, error: destError } = await supabase
        .from('viator_destinations')
        .select('id, name, slug, country, region, type')
        .in('slug', batch);

      if (destError) {
        console.error('Error fetching destinations batch:', destError);
        console.error('Failed batch slugs (first 10):', batch.slice(0, 10));
        continue;
      }

      if (destinations && destinations.length > 0) {
        allDestinations.push(...destinations);
        console.log(`Batch ${Math.floor(i / batchSize) + 1}: Found ${destinations.length} matching destinations by slug`);
      } else {
        // If no matches by slug, try matching by id (in case some are stored as IDs)
        console.log(`Batch ${Math.floor(i / batchSize) + 1}: No matches by slug, trying by id...`);
        const { data: destinationsById, error: destErrorById } = await supabase
          .from('viator_destinations')
          .select('id, name, slug, country, region, type')
          .in('id', batch);
        
        if (!destErrorById && destinationsById && destinationsById.length > 0) {
          allDestinations.push(...destinationsById);
          console.log(`Batch ${Math.floor(i / batchSize) + 1}: Found ${destinationsById.length} matching destinations by id`);
        } else {
          console.log(`Batch ${Math.floor(i / batchSize) + 1}: No destinations matched by slug or id`);
          // Debug: check what the first value looks like
          if (batch.length > 0) {
            const { data: testDest, error: testError } = await supabase
              .from('viator_destinations')
              .select('id, name, slug')
              .eq('slug', batch[0])
              .limit(1);
            console.log(`Test query for slug "${batch[0]}":`, testDest, testError);
          }
        }
      }
    }

    console.log(`Total matched: ${allDestinations.length} destinations from ${uniqueDestinationIds.length} unique restaurant destination IDs`);

    // Sort all destinations alphabetically
    allDestinations.sort((a, b) => a.name.localeCompare(b.name));

    // Format destinations for frontend
    const formatted = allDestinations.map(item => ({
      id: item.id?.toString(),
      destination_id: item.id?.toString(),
      name: item.name,
      slug: item.slug,
      country: item.country,
      region: item.region,
      type: item.type,
    }));

    return NextResponse.json({ 
      destinations: formatted, 
      total: formatted.length 
    });
  } catch (error) {
    console.error('Error in destinations-with-restaurants API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

