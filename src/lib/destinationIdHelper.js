/**
 * Simple helper to normalize destination IDs to slugs
 * This ensures consistency across the codebase
 */

/**
 * Normalize destination ID to slug format
 * @param {string|number} destinationId - Can be slug ("abu-dhabi") or numeric ID (4474)
 * @returns {Promise<string>} - Always returns slug format
 */
export async function normalizeDestinationIdToSlug(destinationId) {
  if (!destinationId) return null;
  
  const idString = destinationId.toString().trim();
  
  // If it's already a slug (not purely numeric), return as-is (lowercase for consistency)
  if (!/^\d+$/.test(idString)) {
    return idString.toLowerCase();
  }
  
  // It's numeric - look up the slug from viator_destinations
  try {
    const { createSupabaseServiceRoleClient } = await import('./supabaseClient');
    const supabase = createSupabaseServiceRoleClient();
    
    const { data: destInfo } = await supabase
      .from('viator_destinations')
      .select('slug')
      .eq('id', idString)
      .maybeSingle();
    
    if (destInfo?.slug) {
      return destInfo.slug.toLowerCase();
    }
    
    // If not found, return null (invalid destination)
    return null;
  } catch (error) {
    console.warn(`Could not lookup slug for destination ID ${idString}:`, error);
    return null;
  }
}

