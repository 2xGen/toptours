import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';

/**
 * GET /api/admin/lookup-destination?name=Aruba
 * Lookup destination by name and return country/region
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Missing name parameter' }, { status: 400 });
    }

    // First try the classified destinations JSON (has region/country)
    const destinations = Array.isArray(viatorDestinationsClassifiedData) ? viatorDestinationsClassifiedData : [];
    const searchName = name.trim().toLowerCase();
    
    // Try exact match first
    let destination = destinations.find(d => 
      (d.destinationName || d.name || '').toLowerCase() === searchName
    );

    // Try partial match if no exact match
    if (!destination) {
      destination = destinations.find(d => {
        const destName = (d.destinationName || d.name || '').toLowerCase();
        return destName.includes(searchName) || searchName.includes(destName.split(',')[0].trim());
      });
    }

    if (destination) {
      return NextResponse.json({
        destination_id: destination.destinationId || destination.id,
        destination_name: destination.destinationName || destination.name,
        country: destination.country || null,
        region: destination.region || null,
      });
    }

    // Fallback: Try Supabase viator_destinations table
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('viator_destinations')
      .select('id, name, slug, country, region')
      .ilike('name', `%${name.trim()}%`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error querying viator_destinations:', error);
    }

    if (data) {
      return NextResponse.json({
        destination_id: data.id,
        destination_name: data.name,
        country: data.country || null,
        region: data.region || null,
      });
    }

    // Not found
    return NextResponse.json({
      destination_id: null,
      destination_name: name.trim(),
      country: null,
      region: null,
    });
  } catch (error) {
    console.error('Error in lookup-destination API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to lookup destination' },
      { status: 500 }
    );
  }
}
