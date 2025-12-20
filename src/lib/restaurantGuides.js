import { createSupabaseServiceRoleClient } from './supabaseClient';

/**
 * Get restaurant guide from database
 */
export async function getRestaurantGuide(destinationId, categorySlug) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('restaurant_guides')
      .select('*')
      .eq('destination_id', destinationId)
      .eq('category_slug', categorySlug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.warn(`Database error for ${destinationId}/${categorySlug}:`, error.message);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Error fetching restaurant guide:', error.message);
    return null;
  }
}

/**
 * Get all restaurant guides for a destination
 */
export async function getAllRestaurantGuidesForDestination(destinationId) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('restaurant_guides')
      .select('category_slug, category_name, title, subtitle, stats')
      .eq('destination_id', destinationId)
      .order('category_name');
    
    if (error) {
      console.warn('Error fetching restaurant guides:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching restaurant guides:', error.message);
    return [];
  }
}

/**
 * Get restaurants matching guide filter criteria
 */
export async function getRestaurantsForGuide(destinationId, filterCriteria) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    let query = supabase
      .from('restaurants')
      .select('*')
      .eq('destination_id', destinationId)
      .eq('is_active', true);
    
    // Apply filters from filterCriteria
    if (filterCriteria.cuisines && filterCriteria.cuisines.length > 0) {
      // For array contains, we need to check if any cuisine matches
      // Since cuisines is TEXT[], we use overlap operator
      query = query.overlaps('cuisines', filterCriteria.cuisines);
    }
    
    if (filterCriteria.minRating) {
      query = query.gte('google_rating', filterCriteria.minRating);
    }
    
    if (filterCriteria.minReviews) {
      query = query.gte('review_count', filterCriteria.minReviews);
    }
    
    if (filterCriteria.priceLevelMin !== undefined) {
      query = query.gte('price_level', filterCriteria.priceLevelMin);
    }
    
    if (filterCriteria.priceLevelMax !== undefined) {
      query = query.lte('price_level', filterCriteria.priceLevelMax);
    }
    
    if (filterCriteria.goodForChildren !== undefined) {
      query = query.eq('good_for_children', filterCriteria.goodForChildren);
    }
    
    if (filterCriteria.liveMusic !== undefined) {
      query = query.eq('live_music', filterCriteria.liveMusic);
    }
    
    if (filterCriteria.outdoorSeating !== undefined) {
      query = query.eq('outdoor_seating', filterCriteria.outdoorSeating);
    }
    
    if (filterCriteria.reservable !== undefined) {
      query = query.eq('reservable', filterCriteria.reservable);
    }
    
    if (filterCriteria.servesWine !== undefined) {
      query = query.eq('serves_wine', filterCriteria.servesWine);
    }
    
    if (filterCriteria.servesCocktails !== undefined) {
      query = query.eq('serves_cocktails', filterCriteria.servesCocktails);
    }
    
    // Sorting
    const sortBy = filterCriteria.sortBy || 'rating';
    const sortOrder = filterCriteria.sortOrder || 'desc';
    
    if (sortBy === 'rating') {
      query = query.order('google_rating', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'reviews') {
      query = query.order('review_count', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'price') {
      query = query.order('price_level', { ascending: sortOrder === 'asc' });
    } else {
      // Default: rating desc
      query = query.order('google_rating', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching restaurants for guide:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching restaurants for guide:', error);
    return [];
  }
}

