import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * Get all category guides for a destination (database only)
 * Returns array of { category_slug, category_name, title, subtitle, hero_image }
 * 
 * NOTE: This file is kept for backward compatibility with files in app/destinations/[id]/
 * All guides are now in the database, so this just queries the database.
 */
export async function getAllCategoryGuidesForDestination(destinationId) {
  try {
    // Check database for guides (all guides are now in the database)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn(`⚠️ [getAllCategoryGuidesForDestination] Missing Supabase env vars for ${destinationId}`);
      return [];
    }

    try {
      const supabase = createSupabaseServiceRoleClient();
      
      // Try exact match first (destination_id is stored as slug in database, e.g., "ajmer", "dingle")
      let { data, error } = await supabase
        .from('category_guides')
        .select('category_slug, category_name, title, subtitle, hero_image')
        .eq('destination_id', destinationId)
        .order('category_name', { ascending: true });

      // If no results, try lowercase (in case of case mismatch)
      if ((!data || data.length === 0) && error === null) {
        const { data: lowerData, error: lowerError } = await supabase
          .from('category_guides')
          .select('category_slug, category_name, title, subtitle, hero_image')
          .eq('destination_id', destinationId.toLowerCase())
          .order('category_name', { ascending: true });
        
        if (lowerData && lowerData.length > 0) {
          data = lowerData;
          error = lowerError;
        }
      }

      if (!error && data && data.length > 0) {
        // Found guides in database
        console.log(`✅ [getAllCategoryGuidesForDestination] Found ${data.length} guides in database for ${destinationId}`);
        return data;
      } else if (error) {
        console.warn(`⚠️ [getAllCategoryGuidesForDestination] Database error for ${destinationId}:`, error.message);
        return [];
      } else {
        console.log(`⚠️ [getAllCategoryGuidesForDestination] No guides found in database for ${destinationId}`);
        return [];
      }
    } catch (dbError) {
      // Database error - return empty array
      console.error(`❌ [getAllCategoryGuidesForDestination] Database lookup failed for ${destinationId}:`, dbError?.message);
      return [];
    }
  } catch (error) {
    console.error('Error loading category guides:', {
      destinationId,
      message: error?.message || String(error),
    });
    return [];
  }
}

/**
 * Get all category guide slugs for a destination (for checking if a guide exists)
 * Returns array of category slugs
 */
export async function getAllCategoryGuideSlugsForDestination(destinationId) {
  const guides = await getAllCategoryGuidesForDestination(destinationId);
  return guides.map(g => g.category_slug);
}

