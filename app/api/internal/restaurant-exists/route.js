import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { normalizeDestinationIdToSlug } from '@/lib/destinationIdHelper';

/**
 * Quick check if a destination has any restaurants
 * Returns true/false instead of fetching all counts
 * Also checks child destinations (e.g., if viewing "bali", also checks "ubud", "seminyak", etc.)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');

    if (!destinationId) {
      return NextResponse.json({ error: 'Destination ID is required' }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();
    
    // Normalize destination ID to slug format
    const slug = await normalizeDestinationIdToSlug(destinationId);
    if (!slug) {
      return NextResponse.json({ 
        destinationId,
        hasRestaurants: false 
      });
    }
    
    // Build array of destination slugs (including child destinations)
    const destinationSlugs = [slug];
    
    // Also include child destinations (e.g., if viewing "bali", also check "ubud", "seminyak", etc.)
    try {
      // Query viator_destinations to find child destinations
      const { data: currentDest } = await supabase
        .from('viator_destinations')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (currentDest?.id) {
        // Find all child destinations (where parent_destination_id matches current destination)
        const { data: childDests } = await supabase
          .from('viator_destinations')
          .select('slug')
          .eq('parent_destination_id', currentDest.id);
        
        if (childDests && childDests.length > 0) {
          childDests.forEach(child => {
            if (child.slug && !destinationSlugs.includes(child.slug)) {
              destinationSlugs.push(child.slug);
            }
          });
        }
      }
    } catch (error) {
      console.warn('Could not query child destinations:', error);
    }
    
    // Quick check: count restaurants for this destination (and child destinations)
    // Using count with head: true returns only the count, not the data
    const { count, error } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .in('destination_id', destinationSlugs) // Match slug or child destination slugs
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

