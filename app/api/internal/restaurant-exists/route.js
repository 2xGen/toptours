import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * Quick check if a destination has any restaurants
 * Returns true/false instead of fetching all counts
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');

    if (!destinationId) {
      return NextResponse.json({ error: 'Destination ID is required' }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();
    
    // Quick check: count restaurants for this destination (fastest query)
    // Using count with head: true returns only the count, not the data
    const { count, error } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('destination_id', destinationId)
      .eq('is_active', true);

    // If error or count is 0, no restaurants exist
    const hasRestaurants = !error && count > 0;

    return NextResponse.json({ 
      destinationId,
      hasRestaurants 
    });
  } catch (error) {
    console.error('Error checking restaurant existence:', error);
    return NextResponse.json(
      { error: 'Failed to check restaurants' },
      { status: 500 }
    );
  }
}

