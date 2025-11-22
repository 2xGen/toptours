import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Fetch all destinations with pagination (Supabase limit is 1000 per query)
    let allData = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('viator_cache')
        .select('cache_key, tour_data, cached_at')
        .eq('cache_type', 'destination')
        .neq('cache_key', 'destinations_list')
        .order('cached_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Error fetching Viator destinations:', error);
        break;
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        page++;
        // If we got less than pageSize, we've reached the end
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    // Extract destination data from cache
    const destinations = allData
      .map(item => {
        const destData = item.tour_data;
        // Handle both destinationName and name fields
        const destinationName = destData?.destinationName || destData?.name;
        if (destData && destinationName) {
          return {
            destinationId: item.cache_key,
            destinationName: destinationName,
            type: destData.type || null,
            parentDestinationId: destData.parentDestinationId || null,
          };
        }
        return null;
      })
      .filter(Boolean);

    return Response.json({ destinations });
  } catch (error) {
    console.error('Error in get-viator-destinations API:', error);
    return Response.json({ destinations: [] }, { status: 200 });
  }
}

