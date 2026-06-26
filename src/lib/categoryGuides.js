import { unstable_cache } from 'next/cache';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { getTagGuidesForDestination } from '@/lib/tagGuideContent';
import { GUIDE_SECTION_REVALIDATE_SECONDS } from '@/lib/guideSectionCacheConfig';
import { isHiddenGuide } from '@/lib/guideIndexing';
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
import {
  getSiemReapFullDayToursListingMeta,
  SIEM_REAP_FULL_DAY_TOURS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapFullDayTours.js';
import {
  getSiemReapMultiDayToursListingMeta,
  SIEM_REAP_MULTI_DAY_TOURS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapMultiDayTours.js';
import {
  getSiemReapNatureWildlifeToursListingMeta,
  SIEM_REAP_NATURE_WILDLIFE_TOURS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapNatureWildlifeTours.js';
import {
  getSiemReapNewProductListingMeta,
  SIEM_REAP_NEW_PRODUCT_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapNewProduct.js';
import {
  getSiemReapOvernightToursListingMeta,
  SIEM_REAP_OVERNIGHT_TOURS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapOvernightTours.js';
import {
  getSiemReapPhotographyToursListingMeta,
  SIEM_REAP_PHOTOGRAPHY_TOURS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapPhotographyTours.js';
import {
  getSiemReapSpringBreakListingMeta,
  SIEM_REAP_SPRING_BREAK_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapSpringBreak.js';
import {
  getSiemReapAttractionsMuseumsListingMeta,
  SIEM_REAP_ATTRACTIONS_MUSEUMS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapAttractionsMuseums.js';
import {
  getSiemReapCountrysideVillageListingMeta,
  SIEM_REAP_COUNTRYSIDE_VILLAGE_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapCountrysideVillage.js';
import {
  getSiemReapFoodDrinkListingMeta,
  SIEM_REAP_FOOD_DRINK_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapFoodDrink.js';
import {
  getSiemReapKhmerHistoryCultureListingMeta,
  SIEM_REAP_KHMER_HISTORY_CULTURE_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapKhmerHistoryCulture.js';
import {
  getSiemReapMonumentsMemorialsListingMeta,
  SIEM_REAP_MONUMENTS_MEMORIALS_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapMonumentsMemorials.js';
import {
  getSiemReapNightlifeListingMeta,
  SIEM_REAP_NIGHTLIFE_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapNightlife.js';
import {
  getSiemReapStreetFoodMarketListingMeta,
  SIEM_REAP_STREET_FOOD_MARKET_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapStreetFoodMarket.js';
import {
  getSiemReapTempleArchitectureListingMeta,
  SIEM_REAP_TEMPLE_ARCHITECTURE_SLUG,
} from '../../app/destinations/[id]/guides/partnerGuides/siemReapTempleArchitecture.js';

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

      const fullDayMeta = getSiemReapFullDayToursListingMeta();
      const fullDayIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_FULL_DAY_TOURS_SLUG
      );
      if (fullDayIdx >= 0) {
        combined[fullDayIdx] = {
          ...combined[fullDayIdx],
          title: fullDayMeta.title,
          subtitle: fullDayMeta.subtitle,
          hero_image: fullDayMeta.hero_image || combined[fullDayIdx].hero_image,
          category_name: fullDayMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: fullDayMeta.category_slug,
          category_name: fullDayMeta.category_name,
          title: fullDayMeta.title,
          subtitle: fullDayMeta.subtitle,
          hero_image: fullDayMeta.hero_image,
        });
      }

      const multiDayMeta = getSiemReapMultiDayToursListingMeta();
      const multiDayIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_MULTI_DAY_TOURS_SLUG
      );
      if (multiDayIdx >= 0) {
        combined[multiDayIdx] = {
          ...combined[multiDayIdx],
          title: multiDayMeta.title,
          subtitle: multiDayMeta.subtitle,
          hero_image: multiDayMeta.hero_image || combined[multiDayIdx].hero_image,
          category_name: multiDayMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: multiDayMeta.category_slug,
          category_name: multiDayMeta.category_name,
          title: multiDayMeta.title,
          subtitle: multiDayMeta.subtitle,
          hero_image: multiDayMeta.hero_image,
        });
      }

      const natureWildlifeMeta = getSiemReapNatureWildlifeToursListingMeta();
      const natureWildlifeIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_NATURE_WILDLIFE_TOURS_SLUG
      );
      if (natureWildlifeIdx >= 0) {
        combined[natureWildlifeIdx] = {
          ...combined[natureWildlifeIdx],
          title: natureWildlifeMeta.title,
          subtitle: natureWildlifeMeta.subtitle,
          hero_image: natureWildlifeMeta.hero_image || combined[natureWildlifeIdx].hero_image,
          category_name: natureWildlifeMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: natureWildlifeMeta.category_slug,
          category_name: natureWildlifeMeta.category_name,
          title: natureWildlifeMeta.title,
          subtitle: natureWildlifeMeta.subtitle,
          hero_image: natureWildlifeMeta.hero_image,
        });
      }

      const newProductMeta = getSiemReapNewProductListingMeta();
      const newProductIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_NEW_PRODUCT_SLUG
      );
      if (newProductIdx >= 0) {
        combined[newProductIdx] = {
          ...combined[newProductIdx],
          title: newProductMeta.title,
          subtitle: newProductMeta.subtitle,
          hero_image: newProductMeta.hero_image || combined[newProductIdx].hero_image,
          category_name: newProductMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: newProductMeta.category_slug,
          category_name: newProductMeta.category_name,
          title: newProductMeta.title,
          subtitle: newProductMeta.subtitle,
          hero_image: newProductMeta.hero_image,
        });
      }

      const overnightMeta = getSiemReapOvernightToursListingMeta();
      const overnightIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_OVERNIGHT_TOURS_SLUG
      );
      if (overnightIdx >= 0) {
        combined[overnightIdx] = {
          ...combined[overnightIdx],
          title: overnightMeta.title,
          subtitle: overnightMeta.subtitle,
          hero_image: overnightMeta.hero_image || combined[overnightIdx].hero_image,
          category_name: overnightMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: overnightMeta.category_slug,
          category_name: overnightMeta.category_name,
          title: overnightMeta.title,
          subtitle: overnightMeta.subtitle,
          hero_image: overnightMeta.hero_image,
        });
      }

      const photographyMeta = getSiemReapPhotographyToursListingMeta();
      const photographyIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_PHOTOGRAPHY_TOURS_SLUG
      );
      if (photographyIdx >= 0) {
        combined[photographyIdx] = {
          ...combined[photographyIdx],
          title: photographyMeta.title,
          subtitle: photographyMeta.subtitle,
          hero_image: photographyMeta.hero_image || combined[photographyIdx].hero_image,
          category_name: photographyMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: photographyMeta.category_slug,
          category_name: photographyMeta.category_name,
          title: photographyMeta.title,
          subtitle: photographyMeta.subtitle,
          hero_image: photographyMeta.hero_image,
        });
      }

      const springBreakMeta = getSiemReapSpringBreakListingMeta();
      const springBreakIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_SPRING_BREAK_SLUG
      );
      if (springBreakIdx >= 0) {
        combined[springBreakIdx] = {
          ...combined[springBreakIdx],
          title: springBreakMeta.title,
          subtitle: springBreakMeta.subtitle,
          hero_image: springBreakMeta.hero_image || combined[springBreakIdx].hero_image,
          category_name: springBreakMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: springBreakMeta.category_slug,
          category_name: springBreakMeta.category_name,
          title: springBreakMeta.title,
          subtitle: springBreakMeta.subtitle,
          hero_image: springBreakMeta.hero_image,
        });
      }

      const attractionsMuseumsMeta = getSiemReapAttractionsMuseumsListingMeta();
      const attractionsMuseumsIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_ATTRACTIONS_MUSEUMS_SLUG
      );
      if (attractionsMuseumsIdx >= 0) {
        combined[attractionsMuseumsIdx] = {
          ...combined[attractionsMuseumsIdx],
          title: attractionsMuseumsMeta.title,
          subtitle: attractionsMuseumsMeta.subtitle,
          hero_image: attractionsMuseumsMeta.hero_image || combined[attractionsMuseumsIdx].hero_image,
          category_name: attractionsMuseumsMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: attractionsMuseumsMeta.category_slug,
          category_name: attractionsMuseumsMeta.category_name,
          title: attractionsMuseumsMeta.title,
          subtitle: attractionsMuseumsMeta.subtitle,
          hero_image: attractionsMuseumsMeta.hero_image,
        });
      }

      const countrysideVillageMeta = getSiemReapCountrysideVillageListingMeta();
      const countrysideVillageIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_COUNTRYSIDE_VILLAGE_SLUG
      );
      if (countrysideVillageIdx >= 0) {
        combined[countrysideVillageIdx] = {
          ...combined[countrysideVillageIdx],
          title: countrysideVillageMeta.title,
          subtitle: countrysideVillageMeta.subtitle,
          hero_image: countrysideVillageMeta.hero_image || combined[countrysideVillageIdx].hero_image,
          category_name: countrysideVillageMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: countrysideVillageMeta.category_slug,
          category_name: countrysideVillageMeta.category_name,
          title: countrysideVillageMeta.title,
          subtitle: countrysideVillageMeta.subtitle,
          hero_image: countrysideVillageMeta.hero_image,
        });
      }

      const foodDrinkMeta = getSiemReapFoodDrinkListingMeta();
      const foodDrinkIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_FOOD_DRINK_SLUG
      );
      if (foodDrinkIdx >= 0) {
        combined[foodDrinkIdx] = {
          ...combined[foodDrinkIdx],
          title: foodDrinkMeta.title,
          subtitle: foodDrinkMeta.subtitle,
          hero_image: foodDrinkMeta.hero_image || combined[foodDrinkIdx].hero_image,
          category_name: foodDrinkMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: foodDrinkMeta.category_slug,
          category_name: foodDrinkMeta.category_name,
          title: foodDrinkMeta.title,
          subtitle: foodDrinkMeta.subtitle,
          hero_image: foodDrinkMeta.hero_image,
        });
      }

      const khmerHistoryCultureMeta = getSiemReapKhmerHistoryCultureListingMeta();
      const khmerHistoryCultureIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_KHMER_HISTORY_CULTURE_SLUG
      );
      if (khmerHistoryCultureIdx >= 0) {
        combined[khmerHistoryCultureIdx] = {
          ...combined[khmerHistoryCultureIdx],
          title: khmerHistoryCultureMeta.title,
          subtitle: khmerHistoryCultureMeta.subtitle,
          hero_image: khmerHistoryCultureMeta.hero_image || combined[khmerHistoryCultureIdx].hero_image,
          category_name: khmerHistoryCultureMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: khmerHistoryCultureMeta.category_slug,
          category_name: khmerHistoryCultureMeta.category_name,
          title: khmerHistoryCultureMeta.title,
          subtitle: khmerHistoryCultureMeta.subtitle,
          hero_image: khmerHistoryCultureMeta.hero_image,
        });
      }

      const monumentsMemorialsMeta = getSiemReapMonumentsMemorialsListingMeta();
      const monumentsMemorialsIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_MONUMENTS_MEMORIALS_SLUG
      );
      if (monumentsMemorialsIdx >= 0) {
        combined[monumentsMemorialsIdx] = {
          ...combined[monumentsMemorialsIdx],
          title: monumentsMemorialsMeta.title,
          subtitle: monumentsMemorialsMeta.subtitle,
          hero_image: monumentsMemorialsMeta.hero_image || combined[monumentsMemorialsIdx].hero_image,
          category_name: monumentsMemorialsMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: monumentsMemorialsMeta.category_slug,
          category_name: monumentsMemorialsMeta.category_name,
          title: monumentsMemorialsMeta.title,
          subtitle: monumentsMemorialsMeta.subtitle,
          hero_image: monumentsMemorialsMeta.hero_image,
        });
      }

      const nightlifeMeta = getSiemReapNightlifeListingMeta();
      const nightlifeIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_NIGHTLIFE_SLUG
      );
      if (nightlifeIdx >= 0) {
        combined[nightlifeIdx] = {
          ...combined[nightlifeIdx],
          title: nightlifeMeta.title,
          subtitle: nightlifeMeta.subtitle,
          hero_image: nightlifeMeta.hero_image || combined[nightlifeIdx].hero_image,
          category_name: nightlifeMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: nightlifeMeta.category_slug,
          category_name: nightlifeMeta.category_name,
          title: nightlifeMeta.title,
          subtitle: nightlifeMeta.subtitle,
          hero_image: nightlifeMeta.hero_image,
        });
      }

      const streetFoodMarketMeta = getSiemReapStreetFoodMarketListingMeta();
      const streetFoodMarketIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_STREET_FOOD_MARKET_SLUG
      );
      if (streetFoodMarketIdx >= 0) {
        combined[streetFoodMarketIdx] = {
          ...combined[streetFoodMarketIdx],
          title: streetFoodMarketMeta.title,
          subtitle: streetFoodMarketMeta.subtitle,
          hero_image: streetFoodMarketMeta.hero_image || combined[streetFoodMarketIdx].hero_image,
          category_name: streetFoodMarketMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: streetFoodMarketMeta.category_slug,
          category_name: streetFoodMarketMeta.category_name,
          title: streetFoodMarketMeta.title,
          subtitle: streetFoodMarketMeta.subtitle,
          hero_image: streetFoodMarketMeta.hero_image,
        });
      }

      const templeArchitectureMeta = getSiemReapTempleArchitectureListingMeta();
      const templeArchitectureIdx = combined.findIndex(
        (g) => String(g.category_slug || '').toLowerCase() === SIEM_REAP_TEMPLE_ARCHITECTURE_SLUG
      );
      if (templeArchitectureIdx >= 0) {
        combined[templeArchitectureIdx] = {
          ...combined[templeArchitectureIdx],
          title: templeArchitectureMeta.title,
          subtitle: templeArchitectureMeta.subtitle,
          hero_image: templeArchitectureMeta.hero_image || combined[templeArchitectureIdx].hero_image,
          category_name: templeArchitectureMeta.category_name,
        };
      } else {
        combined.unshift({
          category_slug: templeArchitectureMeta.category_slug,
          category_name: templeArchitectureMeta.category_name,
          title: templeArchitectureMeta.title,
          subtitle: templeArchitectureMeta.subtitle,
          hero_image: templeArchitectureMeta.hero_image,
        });
      }
    }

    return combined
      .filter(
        (g) =>
          !isHiddenGuide({
            destinationId: normalizedDestinationId,
            categorySlug: g.category_slug,
          })
      )
      .sort((a, b) => (a.category_name || a.title || '').localeCompare(b.category_name || b.title || ''));
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
