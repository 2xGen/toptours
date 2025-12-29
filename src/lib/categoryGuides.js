import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

// Simple in-memory cache to avoid repeated DB calls during builds / SSR.
// Keyed by normalized destination slug.
const destinationGuidesCache = new Map();
const destinationGuidesInFlight = new Map();

/**
 * Get all category guides for a destination (database only)
 * Returns array of { category_slug, category_name, title, subtitle, hero_image }
 */
// Normalize destination ID: convert special characters to ASCII (e.g., "Curaçao" -> "curacao")
function normalizeDestinationId(destinationId) {
  if (!destinationId) return '';
  
  return String(destinationId)
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose characters (ç -> c + combining mark)
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/[^\w\s-]/g, '') // Remove any remaining special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export async function getAllCategoryGuidesForDestination(destinationId) {
  try {
    // Normalize destination ID to handle special characters (e.g., Curaçao -> curacao)
    const normalizedDestinationId = normalizeDestinationId(destinationId);
    if (!normalizedDestinationId) return [];

    if (destinationGuidesCache.has(normalizedDestinationId)) {
      return destinationGuidesCache.get(normalizedDestinationId);
    }

    if (destinationGuidesInFlight.has(normalizedDestinationId)) {
      return destinationGuidesInFlight.get(normalizedDestinationId);
    }

    const inFlightPromise = (async () => {
    // Check database for guides (all guides are now in the database)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return [];
    }

    try {
      const supabase = createSupabaseServiceRoleClient();
      
      // destination_id is stored as slug in database, so normalize once and query once
      const { data, error } = await supabase
        .from('category_guides')
        .select('category_slug, category_name, title, subtitle, hero_image')
        .eq('destination_id', normalizedDestinationId)
        .order('category_name', { ascending: true });

      if (error) {
        // Keep logs minimal in production/builds
        console.error(`[getAllCategoryGuidesForDestination] DB error for ${normalizedDestinationId}: ${error.message}`);
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (dbError) {
      // Database error - return empty array
      console.error(`[getAllCategoryGuidesForDestination] Database lookup failed for ${normalizedDestinationId}: ${dbError?.message || dbError}`);
      return [];
    }
    })();

    destinationGuidesInFlight.set(normalizedDestinationId, inFlightPromise);
    const result = await inFlightPromise;
    destinationGuidesCache.set(normalizedDestinationId, result);
    return result;
  } catch (error) {
    console.error(`[getAllCategoryGuidesForDestination] Unexpected error for ${destinationId}: ${error?.message || String(error)}`);
    return [];
  } finally {
    const normalizedDestinationId = normalizeDestinationId(destinationId);
    if (normalizedDestinationId) destinationGuidesInFlight.delete(normalizedDestinationId);
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
