import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { getDestinationById } from '@/data/destinationsData';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const supabase = createSupabaseServiceRoleClient();
    
    // Fetch unique destinations that have category guides
    const { data, error } = await supabase
      .from('category_guides')
      .select('destination_id')
      .order('destination_id', { ascending: true });

    if (error) {
      console.error('Error fetching destinations with guides:', error);
      return res.status(500).json({ error: 'Failed to fetch destinations' });
    }

    // Get unique destination IDs (no counting - faster)
    const uniqueDestinationIds = new Set();
    (data || []).forEach(guide => {
      if (guide.destination_id) {
        uniqueDestinationIds.add(guide.destination_id);
      }
    });

    // Transform to array of destinations with destination info
    const destinations = Array.from(uniqueDestinationIds).map((destinationId) => {
      // Get destination info from destinationsData
      const destinationInfo = getDestinationById(destinationId);
      
      return {
        id: destinationId,
        destinationId: destinationId,
        name: destinationInfo?.name || destinationId,
        fullName: destinationInfo?.fullName || destinationInfo?.name || destinationId,
        imageUrl: destinationInfo?.imageUrl || null,
        category: destinationInfo?.category || null,
        country: destinationInfo?.country || null,
        url: `/destinations/${destinationId}/guides`, // Link to destination guides page
      };
    });

    // Sort alphabetically by name
    destinations.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return res.status(200).json({ destinations });
  } catch (error) {
    console.error('Error in all-category-guides API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
