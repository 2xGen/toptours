import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    
    const supabase = createSupabaseServiceRoleClient();
    
    // Fetch all destinations from viator_destinations table with proper pagination
    let allData = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    let totalFetched = 0;

    while (hasMore) {
      let query = supabase
        .from('viator_destinations')
        .select('id, name, slug, country, region, type', { count: 'exact' })
        .order('name', { ascending: true })
        .range(from, from + pageSize - 1);

      // If search term provided, filter results
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching Viator destinations:', error);
        break;
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        totalFetched += data.length;
        from += pageSize;
        
        // Continue if we got a full page and there might be more
        // Use count if available, otherwise check if we got less than pageSize
        if (count !== null && count !== undefined) {
          hasMore = totalFetched < count;
        } else {
          hasMore = data.length === pageSize;
        }
      } else {
        hasMore = false;
      }
    }

    // Format destinations for frontend
    const destinations = allData.map(item => ({
      id: item.id?.toString(),
      destination_id: item.id?.toString(),
      name: item.name,
      slug: item.slug,
      country: item.country,
      region: item.region,
      type: item.type,
    }));

    return Response.json({ destinations, total: destinations.length });
  } catch (error) {
    console.error('Error in get-viator-destinations API:', error);
    return Response.json({ destinations: [], total: 0 }, { status: 200 });
  }
}

