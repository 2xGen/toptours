import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * Get all category guides for a destination (database only)
 * Returns array of { category_slug, category_name, title, subtitle, hero_image }
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
      console.log(`🔍 [getAllCategoryGuidesForDestination] Querying category_guides WHERE destination_id = "${destinationId}"`);
      let { data, error } = await supabase
        .from('category_guides')
        .select('category_slug, category_name, title, subtitle, hero_image')
        .eq('destination_id', destinationId)
        .order('category_name', { ascending: true });

      console.log(`🔍 [getAllCategoryGuidesForDestination] Query result: ${data?.length || 0} guides, error: ${error ? error.message : 'none'}`);
      if (error) {
        console.error(`❌ [getAllCategoryGuidesForDestination] Full error:`, JSON.stringify(error, null, 2));
      }

      // If no results, try lowercase (in case of case mismatch)
      if ((!data || data.length === 0) && error === null) {
        const lowerDestinationId = destinationId.toLowerCase();
        console.log(`🔍 [getAllCategoryGuidesForDestination] Trying lowercase: destination_id = "${lowerDestinationId}"`);
        const { data: lowerData, error: lowerError } = await supabase
          .from('category_guides')
          .select('category_slug, category_name, title, subtitle, hero_image')
          .eq('destination_id', lowerDestinationId)
          .order('category_name', { ascending: true });
        
        console.log(`🔍 [getAllCategoryGuidesForDestination] Lowercase query result: ${lowerData?.length || 0} guides, error: ${lowerError ? lowerError.message : 'none'}`);
        
        if (lowerData && lowerData.length > 0) {
          data = lowerData;
          error = lowerError;
        }
      }

      if (!error && data && data.length > 0) {
        // Found guides in database
        console.log(`✅ [getAllCategoryGuidesForDestination] Found ${data.length} guides in database for ${destinationId}`);
        console.log(`📊 [getAllCategoryGuidesForDestination] Sample guide: ${data[0]?.category_slug || 'N/A'}`);
        return data;
      } else if (error) {
        console.warn(`⚠️ [getAllCategoryGuidesForDestination] Database error for ${destinationId}:`, error.message);
        console.warn(`⚠️ [getAllCategoryGuidesForDestination] Full error object:`, JSON.stringify(error, null, 2));
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
