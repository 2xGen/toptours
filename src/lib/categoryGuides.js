import { unstable_cache } from 'next/cache';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { getTagGuidesForDestination } from '@/lib/tagGuideContent';
import { GUIDE_SECTION_REVALIDATE_SECONDS } from '@/lib/guideSectionCacheConfig';
import {
  getArushaKiliclimbListingMeta,
  ARUSHA_KILICLIMB_GUIDE_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/arushaKiliclimbTanzania.js';
import {
  getAngkorSunriseListingMeta,
  ANGKOR_SUNRISE_GUIDE_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapAngkorSunrise.js';
import {
  getSiemReapAirportTransfersListingMeta,
  SIEM_REAP_AIRPORT_TRANSFERS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapAirportTransfers.js';
import {
  getSiemReapAngkorWatToursListingMeta,
  SIEM_REAP_ANGKOR_WAT_TOURS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapAngkorWatTours.js';
import {
  getSiemReapAdditionalFeesListingMeta,
  SIEM_REAP_ADDITIONAL_FEES_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapAdditionalFees.js';
import {
  getSiemReapBikeToursListingMeta,
  SIEM_REAP_BIKE_TOURS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapBikeTours.js';
import {
  getSiemReapDayTripsListingMeta,
  SIEM_REAP_DAY_TRIPS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapDayTrips.js';
import {
  getSiemReapBusToursListingMeta,
  SIEM_REAP_BUS_TOURS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapBusTours.js';
import {
  getSiemReapHalfDayToursListingMeta,
  SIEM_REAP_HALF_DAY_TOURS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapHalfDayTours.js';

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
    if (normalizedDestinationId === 'siem-reap') {
      const meta = getAngkorSunriseListingMeta();
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

    if (normalizedDestinationId === 'siem-reap') {
      const angkorMeta = getAngkorSunriseListingMeta();
      const angkorExists = combined.some(
        (g) => String(g.category_slug || '').toLowerCase() === ANGKOR_SUNRISE_GUIDE_SLUG
      );
      if (!angkorExists) {
        combined.unshift({
          category_slug: angkorMeta.category_slug,
          category_name: angkorMeta.category_name,
          title: angkorMeta.title,
          subtitle: angkorMeta.subtitle,
          hero_image: angkorMeta.hero_image,
        });
      }

      const airportMeta = getSiemReapAirportTransfersListingMeta();
      const airportIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_AIRPORT_TRANSFERS_SLUG
      );
      if (airportIdx >= 0) {
        combined[airportIdx] = {
          ...combined[airportIdx],
          title: airportMeta.title,
          subtitle: airportMeta.subtitle,
          hero_image: airportMeta.hero_image || combined[airportIdx].hero_image,
        };
      }

      const angkorWatMeta = getSiemReapAngkorWatToursListingMeta();
      const angkorWatIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_ANGKOR_WAT_TOURS_SLUG
      );
      if (angkorWatIdx >= 0) {
        combined[angkorWatIdx] = {
          ...combined[angkorWatIdx],
          title: angkorWatMeta.title,
          subtitle: angkorWatMeta.subtitle,
          hero_image: angkorWatMeta.hero_image || combined[angkorWatIdx].hero_image,
          category_name: angkorWatMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: angkorWatMeta.category_slug,
          category_name: angkorWatMeta.category_name,
          title: angkorWatMeta.title,
          subtitle: angkorWatMeta.subtitle,
          hero_image: angkorWatMeta.hero_image,
        });
      }

      const feesMeta = getSiemReapAdditionalFeesListingMeta();
      const feesIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_ADDITIONAL_FEES_SLUG
      );
      if (feesIdx >= 0) {
        combined[feesIdx] = {
          ...combined[feesIdx],
          title: feesMeta.title,
          subtitle: feesMeta.subtitle,
          hero_image: feesMeta.hero_image || combined[feesIdx].hero_image,
          category_name: feesMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: feesMeta.category_slug,
          category_name: feesMeta.category_name,
          title: feesMeta.title,
          subtitle: feesMeta.subtitle,
          hero_image: feesMeta.hero_image,
        });
      }

      const bikeMeta = getSiemReapBikeToursListingMeta();
      const bikeIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_BIKE_TOURS_SLUG
      );
      if (bikeIdx >= 0) {
        combined[bikeIdx] = {
          ...combined[bikeIdx],
          title: bikeMeta.title,
          subtitle: bikeMeta.subtitle,
          hero_image: bikeMeta.hero_image || combined[bikeIdx].hero_image,
          category_name: bikeMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: bikeMeta.category_slug,
          category_name: bikeMeta.category_name,
          title: bikeMeta.title,
          subtitle: bikeMeta.subtitle,
          hero_image: bikeMeta.hero_image,
        });
      }

      const dayTripsMeta = getSiemReapDayTripsListingMeta();
      const dayTripsIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_DAY_TRIPS_SLUG
      );
      if (dayTripsIdx >= 0) {
        combined[dayTripsIdx] = {
          ...combined[dayTripsIdx],
          title: dayTripsMeta.title,
          subtitle: dayTripsMeta.subtitle,
          hero_image: dayTripsMeta.hero_image || combined[dayTripsIdx].hero_image,
          category_name: dayTripsMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: dayTripsMeta.category_slug,
          category_name: dayTripsMeta.category_name,
          title: dayTripsMeta.title,
          subtitle: dayTripsMeta.subtitle,
          hero_image: dayTripsMeta.hero_image,
        });
      }

      const busMeta = getSiemReapBusToursListingMeta();
      const busIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_BUS_TOURS_SLUG
      );
      if (busIdx >= 0) {
        combined[busIdx] = {
          ...combined[busIdx],
          title: busMeta.title,
          subtitle: busMeta.subtitle,
          hero_image: busMeta.hero_image || combined[busIdx].hero_image,
          category_name: busMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: busMeta.category_slug,
          category_name: busMeta.category_name,
          title: busMeta.title,
          subtitle: busMeta.subtitle,
          hero_image: busMeta.hero_image,
        });
      }

      const halfDayMeta = getSiemReapHalfDayToursListingMeta();
      const halfDayIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_HALF_DAY_TOURS_SLUG
      );
      if (halfDayIdx >= 0) {
        combined[halfDayIdx] = {
          ...combined[halfDayIdx],
          title: halfDayMeta.title,
          subtitle: halfDayMeta.subtitle,
          hero_image: halfDayMeta.hero_image || combined[halfDayIdx].hero_image,
          category_name: halfDayMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: halfDayMeta.category_slug,
          category_name: halfDayMeta.category_name,
          title: halfDayMeta.title,
          subtitle: halfDayMeta.subtitle,
          hero_image: halfDayMeta.hero_image,
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
