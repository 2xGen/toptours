import { unstable_cache } from 'next/cache';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { getTagGuidesForDestination } from '@/lib/tagGuideContent';
import { GUIDE_SECTION_REVALIDATE_SECONDS } from '@/lib/guideSectionCacheConfig';
import {
  getArushaKiliclimbListingMeta,
  ARUSHA_KILICLIMB_GUIDE_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/arushaKiliclimbTanzania.js';

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

async function loadAllCategoryGuidesForDestinationNormalized(normalizedDestinationId) {
  // Check database for guides (all guides are now in the database)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    if (normalizedDestinationId === 'arusha') {
      const meta = getArushaKiliclimbListingMeta();
      return [
        {
          category_slug: meta.category_slug,
          category_name: meta.category_name,
          title: meta.title,
          subtitle: meta.subtitle,
          hero_image: meta.hero_image,
        },
      ];
    }
    return [];
  }

  try {
    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from('category_guides')
      .select('category_slug, category_name, title, subtitle, hero_image')
      .eq('destination_id', normalizedDestinationId)
      .order('category_name', { ascending: true });

    if (error) {
      console.error(`[getAllCategoryGuidesForDestination] DB error for ${normalizedDestinationId}: ${error.message}`);
      return [];
    }

    const categoryGuides = Array.isArray(data) ? data : [];
    const tagGuides = await getTagGuidesForDestination(normalizedDestinationId).catch(() => []);
    let combined = [...categoryGuides, ...tagGuides];

    if (normalizedDestinationId === 'arusha') {
      const meta = getArushaKiliclimbListingMeta();
      const exists = combined.some(
        (g) => String(g.category_slug || '').toLowerCase() === ARUSHA_KILICLIMB_GUIDE_SLUG
      );
      if (!exists) {
        combined.push({
          category_slug: meta.category_slug,
          category_name: meta.category_name,
          title: meta.title,
          subtitle: meta.subtitle,
          hero_image: meta.hero_image,
        });
      }
    }

    return combined.sort((a, b) => (a.category_name || a.title || '').localeCompare(b.category_name || b.title || ''));
  } catch (dbError) {
    console.error(
      `[getAllCategoryGuidesForDestination] Database lookup failed for ${normalizedDestinationId}: ${dbError?.message || dbError}`
    );
    return [];
  }
}

export async function getAllCategoryGuidesForDestination(destinationId) {
  try {
    const normalizedDestinationId = normalizeDestinationId(destinationId);
    if (!normalizedDestinationId) return [];

    return unstable_cache(
      () => loadAllCategoryGuidesForDestinationNormalized(normalizedDestinationId),
      ['category-guides-list', normalizedDestinationId],
      { revalidate: GUIDE_SECTION_REVALIDATE_SECONDS }
    )();
  } catch (error) {
    console.error(`[getAllCategoryGuidesForDestination] Unexpected error for ${destinationId}: ${error?.message || String(error)}`);
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
