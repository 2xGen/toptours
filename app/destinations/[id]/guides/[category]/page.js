import { destinations } from '../../../../../src/data/destinationsData';
import CategoryGuideClient from './CategoryGuideClient';
import { notFound, redirect } from 'next/navigation';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';
import { getDestinationFeatures } from '@/lib/destinationFeatures';
import {
  getTagBySlug,
  getTagGuideContent,
  contentToGuideData,
} from '@/lib/tagGuideContent';
import {
  ARUSHA_KILICLIMB_GUIDE_SLUG,
  getKiliclimbPartnerGuideData,
} from '../partnerGuides/arushaKiliclimbTanzania';
import {
  ANGKOR_SUNRISE_GUIDE_SLUG,
  getAngkorSunriseGuideData,
} from '../partnerGuides/siemReapAngkorSunrise';
import {
  SIEM_REAP_AIRPORT_TRANSFERS_SLUG,
  getSiemReapAirportTransfersGuideData,
} from '../partnerGuides/siemReapAirportTransfers';
import {
  SIEM_REAP_ANGKOR_WAT_TOURS_SLUG,
  getSiemReapAngkorWatToursGuideData,
} from '../partnerGuides/siemReapAngkorWatTours';
import {
  SIEM_REAP_ADDITIONAL_FEES_SLUG,
  getSiemReapAdditionalFeesGuideData,
} from '../partnerGuides/siemReapAdditionalFees';
import {
  SIEM_REAP_BIKE_TOURS_SLUG,
  getSiemReapBikeToursGuideData,
} from '../partnerGuides/siemReapBikeTours';
import {
  SIEM_REAP_DAY_TRIPS_SLUG,
  getSiemReapDayTripsGuideData,
} from '../partnerGuides/siemReapDayTrips';
import {
  SIEM_REAP_BUS_TOURS_SLUG,
  getSiemReapBusToursGuideData,
} from '../partnerGuides/siemReapBusTours';
import {
  SIEM_REAP_HALF_DAY_TOURS_SLUG,
  getSiemReapHalfDayToursGuideData,
} from '../partnerGuides/siemReapHalfDayTours';
import {
  SIEM_REAP_FULL_DAY_TOURS_SLUG,
  getSiemReapFullDayToursGuideData,
} from '../partnerGuides/siemReapFullDayTours';
import {
  SIEM_REAP_MULTI_DAY_TOURS_SLUG,
  getSiemReapMultiDayToursGuideData,
} from '../partnerGuides/siemReapMultiDayTours';
import {
  SIEM_REAP_NATURE_WILDLIFE_TOURS_SLUG,
  getSiemReapNatureWildlifeToursGuideData,
} from '../partnerGuides/siemReapNatureWildlifeTours';
import {
  SIEM_REAP_NEW_PRODUCT_SLUG,
  getSiemReapNewProductGuideData,
} from '../partnerGuides/siemReapNewProduct';
import {
  SIEM_REAP_OVERNIGHT_TOURS_SLUG,
  getSiemReapOvernightToursGuideData,
} from '../partnerGuides/siemReapOvernightTours';
import {
  SIEM_REAP_PHOTOGRAPHY_TOURS_SLUG,
  getSiemReapPhotographyToursGuideData,
} from '../partnerGuides/siemReapPhotographyTours';
import {
  SIEM_REAP_SPRING_BREAK_SLUG,
  getSiemReapSpringBreakGuideData,
} from '../partnerGuides/siemReapSpringBreak';
import {
  SIEM_REAP_ATTRACTIONS_MUSEUMS_SLUG,
  getSiemReapAttractionsMuseumsGuideData,
} from '../partnerGuides/siemReapAttractionsMuseums';
import {
  SIEM_REAP_COUNTRYSIDE_VILLAGE_SLUG,
  getSiemReapCountrysideVillageGuideData,
} from '../partnerGuides/siemReapCountrysideVillage';
import {
  SIEM_REAP_FOOD_DRINK_SLUG,
  getSiemReapFoodDrinkGuideData,
} from '../partnerGuides/siemReapFoodDrink';
import {
  SIEM_REAP_KHMER_HISTORY_CULTURE_SLUG,
  getSiemReapKhmerHistoryCultureGuideData,
} from '../partnerGuides/siemReapKhmerHistoryCulture';
import {
  SIEM_REAP_MONUMENTS_MEMORIALS_SLUG,
  getSiemReapMonumentsMemorialsGuideData,
} from '../partnerGuides/siemReapMonumentsMemorials';
import {
  SIEM_REAP_NIGHTLIFE_SLUG,
  getSiemReapNightlifeGuideData,
} from '../partnerGuides/siemReapNightlife';
import {
  SIEM_REAP_STREET_FOOD_MARKET_SLUG,
  getSiemReapStreetFoodMarketGuideData,
} from '../partnerGuides/siemReapStreetFoodMarket';
import {
  SIEM_REAP_TEMPLE_ARCHITECTURE_SLUG,
  getSiemReapTempleArchitectureGuideData,
} from '../partnerGuides/siemReapTempleArchitecture';
import { isLowValueGuideTag, isHiddenGuide } from '@/lib/guideIndexing';
import { requireFeaturedDestination } from '@/lib/requireFeaturedDestination';
import { getTourUrl } from '@/utils/tourHelpers';

/** ISR: 30 days — keep in sync with src/lib/guideSectionCacheConfig.js (Next requires a numeric literal here). */
export const revalidate = 2592000;
const IS_DEV = process.env.NODE_ENV === 'development';

function devLog(...args) {
  if (IS_DEV) console.log(...args);
}

function devWarn(...args) {
  if (IS_DEV) console.warn(...args);
}

function devError(...args) {
  if (IS_DEV) console.error(...args);
}

const TRAVEL_GUIDE_OG_IMAGE = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/travel%20guides.png';
const AIRPORT_TRANSFERS_OG_IMAGE = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/airport%20transfers.png';

function resolveGuideOgImage(guideData, destination, categorySlug) {
  const defaultOgImage =
    categorySlug === 'airport-transfers' ? AIRPORT_TRANSFERS_OG_IMAGE : TRAVEL_GUIDE_OG_IMAGE;
  return guideData?.heroImage || destination?.imageUrl || defaultOgImage;
}

function resolveGuideSchemaDates(guideData) {
  if (guideData?.schemaDatePublished) {
    return {
      datePublished: guideData.schemaDatePublished,
      dateModified: guideData.schemaDateModified || guideData.schemaDatePublished,
    };
  }
  if (
    guideData?.guideLayout === 'angkor-sunrise' ||
    guideData?.guideLayout === 'siem-reap-airport-transfers' ||
    guideData?.guideLayout === 'siem-reap-angkor-wat-tours' ||
    guideData?.guideLayout === 'siem-reap-additional-fees' ||
    guideData?.guideLayout === 'siem-reap-bike-tours' ||
    guideData?.guideLayout === 'siem-reap-day-trips' ||
    guideData?.guideLayout === 'siem-reap-bus-tours' ||
    guideData?.guideLayout === 'siem-reap-half-day-tours' ||
    guideData?.guideLayout === 'siem-reap-full-day-tours' ||
    guideData?.guideLayout === 'siem-reap-multi-day-tours' ||
    guideData?.guideLayout === 'siem-reap-nature-wildlife-tours' ||
    guideData?.guideLayout === 'siem-reap-new-product' ||
    guideData?.guideLayout === 'siem-reap-overnight-tours' ||
    guideData?.guideLayout === 'siem-reap-photography-tours' ||
    guideData?.guideLayout === 'siem-reap-spring-break' ||
    guideData?.guideLayout === 'siem-reap-attractions-museums' ||
    guideData?.guideLayout === 'siem-reap-countryside-village' ||
    guideData?.guideLayout === 'siem-reap-food-drink' ||
    guideData?.guideLayout === 'siem-reap-khmer-history-culture' ||
    guideData?.guideLayout === 'siem-reap-monuments-memorials' ||
    guideData?.guideLayout === 'siem-reap-nightlife' ||
    guideData?.guideLayout === 'siem-reap-street-food-market' ||
    guideData?.guideLayout === 'siem-reap-temple-architecture'
  ) {
    return { datePublished: '2026-06-10', dateModified: '2026-06-10' };
  }
  return { datePublished: '2025-12-31', dateModified: '2025-12-31' };
}

function buildGuideFeaturedToursItemList(guideData, destination, featuredTours) {
  if (!Array.isArray(featuredTours) || featuredTours.length === 0) return null;

  const destName = destination?.fullName || destination?.name || '';
  const categoryLabel = guideData?.categoryName || 'Tours';

  return {
    '@type': 'ItemList',
    name: `Best ${categoryLabel} in ${destName}`,
    description:
      guideData?.subtitle ||
      `Curated ${String(categoryLabel).toLowerCase()} in ${destName} with prices and booking links`,
    numberOfItems: featuredTours.length,
    itemListElement: featuredTours.map((tour, index) => {
      const productId = tour.productId || tour.id;
      const title = tour.title || 'Tour';
      const tourPath = productId ? getTourUrl(productId, title) : null;
      const tourUrl = tourPath ? `https://toptours.ai${tourPath}` : null;

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: title,
          description: tour.bestFor || tour.summary || `${title} in ${destName}`,
          ...(tour.imageUrl || tour.image ? { image: tour.imageUrl || tour.image } : {}),
          ...(tourUrl ? { url: tourUrl } : {}),
          ...(tour.rating != null
            ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: Number(tour.rating),
                  reviewCount: Number(tour.reviewCount || 0),
                  bestRating: 5,
                },
              }
            : {}),
          ...(tour.priceFrom != null
            ? {
                offers: {
                  '@type': 'Offer',
                  price: Number(tour.priceFrom),
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                },
              }
            : {}),
        },
      };
    }),
  };
}

// Function to fetch all guides for a destination from database
// NOTE: This function is no longer used - we use getAllCategoryGuidesForDestination instead
// Keeping it for backward compatibility but it's deprecated
async function getAllGuidesFromDatabase(destinationId) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return [];
    }
    
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('category_guides')
      .select('category_slug, category_name')
      .eq('destination_id', destinationId);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return [];
      }
      return [];
    }
    
    return (data || []).map(g => g.category_slug);
  } catch (error) {
    return [];
  }
}

// Function to fetch guide from database
// Normalize slug: convert special characters to ASCII (e.g., "banús" -> "banus")
function normalizeSlug(slug) {
  if (!slug) return '';
  return String(slug)
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose characters (ú -> u + combining mark)
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/[^\w\s-]/g, '') // Remove any remaining special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

async function getGuideFromDatabase(destinationId, categorySlug) {
  try {
    // Only try database if we have the required env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null;
    }
    
    // Normalize both destination ID and category slug to handle special characters
    const normalizedDestinationId = normalizeSlug(destinationId);
    const normalizedCategorySlug = normalizeSlug(categorySlug);
    
    const supabase = createSupabaseServiceRoleClient();
    
    // Try exact match first (in case slug is stored with special characters)
    let { data, error } = await supabase
      .from('category_guides')
      .select('*')
      .eq('destination_id', normalizedDestinationId)
      .eq('category_slug', normalizedCategorySlug)
      .single();
    
    // If not found with normalized slug, try original slug (might be stored with special chars)
    if (error && error.code === 'PGRST116') {
      const { data: data2, error: error2 } = await supabase
        .from('category_guides')
        .select('*')
        .eq('destination_id', destinationId) // Try original destination ID too
        .eq('category_slug', categorySlug) // Try original category slug
        .single();
      
      if (!error2 && data2) {
        data = data2;
        error = null;
      } else {
        // Try with normalized destination but original category slug
        const { data: data3, error: error3 } = await supabase
          .from('category_guides')
          .select('*')
          .eq('destination_id', normalizedDestinationId)
          .eq('category_slug', categorySlug)
          .single();
        
        if (!error3 && data3) {
          data = data3;
          error = null;
        }
      }
    }
    
    if (error) {
      // PGRST116 means no rows found - this is expected for guides not in database
      if (error.code === 'PGRST116') {
        return null;
      }
      // Other errors - log but don't throw
      devWarn(`Database error for ${destinationId}/${categorySlug}:`, error.message);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Mark that this came from database
    devLog(`✅ [DATABASE] Found guide for ${destinationId}/${categorySlug} in database`);
    devLog(`📊 [DATABASE] Guide title: ${data.title || 'N/A'}`);
    
    // Convert database format to frontend format
    // Parse JSON strings if they're strings (Supabase returns JSONB as objects, but sometimes as strings)
    let stats = data.stats;
    if (typeof stats === 'string') {
      try {
        stats = JSON.parse(stats);
      } catch (e) {
        stats = {};
      }
    }
    
    let seo = data.seo;
    if (typeof seo === 'string') {
      try {
        seo = JSON.parse(seo);
      } catch (e) {
        seo = {};
      }
    }
    
    let whyChoose = data.why_choose;
    if (typeof whyChoose === 'string') {
      try {
        whyChoose = JSON.parse(whyChoose);
      } catch (e) {
        whyChoose = [];
      }
    }
    
    let tourTypes = data.tour_types;
    if (typeof tourTypes === 'string') {
      try {
        tourTypes = JSON.parse(tourTypes);
      } catch (e) {
        tourTypes = [];
      }
    }
    
    let whatToExpect = data.what_to_expect;
    if (typeof whatToExpect === 'string') {
      try {
        whatToExpect = JSON.parse(whatToExpect);
      } catch (e) {
        whatToExpect = {};
      }
    }
    
    let faqs = data.faqs;
    if (typeof faqs === 'string') {
      try {
        faqs = JSON.parse(faqs);
      } catch (e) {
        faqs = [];
      }
    }
    
    return {
      title: data.title,
      subtitle: data.subtitle,
      categoryName: data.category_name,
      heroImage: data.hero_image,
      stats: stats || {},
      introduction: data.introduction,
      seo: seo || {},
      whyChoose: whyChoose || [],
      tourTypes: tourTypes || [],
      whatToExpect: whatToExpect || {},
      expertTips: Array.isArray(data.expert_tips) ? data.expert_tips : [],
      faqs: faqs || [],
    };
  } catch (error) {
    // Silently fail - fallback to JSON files
    return null;
  }
}

// Resolve destination for metadata (same logic as page - so metadata matches when page would render)
async function resolveDestinationForMetadata(destinationId) {
  let destination = destinations.find(d => d.id === destinationId);
  if (destination) return destination;
  try {
    const fullContent = getDestinationFullContent(destinationId);
    if (fullContent && fullContent.destinationName) {
      return {
        id: destinationId,
        name: fullContent.destinationName,
        fullName: fullContent.destinationName,
        imageUrl: fullContent.imageUrl || null,
      };
    }
  } catch (_) {}
  if (/^d?\d+$/.test(destinationId)) {
    try {
      const { getViatorDestinationById } = await import('@/lib/supabaseCache');
      const viatorDestinationId = destinationId.startsWith('d') ? destinationId.replace(/^d/i, '') : destinationId;
      const destInfo = await getViatorDestinationById(viatorDestinationId);
      if (destInfo?.name) {
        return { id: destinationId, name: destInfo.name, fullName: destInfo.name, imageUrl: null };
      }
    } catch (_) {}
  }
  try {
    const { getViatorDestinationBySlug } = await import('@/lib/supabaseCache');
    const destInfo = await getViatorDestinationBySlug(destinationId);
    if (destInfo?.name) {
      return { id: destinationId, name: destInfo.name, fullName: destInfo.name, imageUrl: null };
    }
  } catch (_) {}
  return null;
}

// Generate metadata for SEO (must match page: index when page renders content, noindex only when 404)
export async function generateMetadata({ params }) {
  try {
    const { id: destinationId, category: categorySlug } = await params;
    requireFeaturedDestination(destinationId);

    if (isHiddenGuide({ destinationId, categorySlug })) {
      notFound();
    }

    let guideData = await getGuideFromDatabase(destinationId, categorySlug);
    let destination = await resolveDestinationForMetadata(destinationId);
    
    // If we have guide data but no destination, create minimal destination (last resort)
    if (guideData && !destination) {
      const destinationName = destinationId.charAt(0).toUpperCase() + destinationId.slice(1).replace(/-/g, ' ');
      destination = {
        id: destinationId,
        name: destinationName,
        fullName: destinationName,
        imageUrl: guideData.heroImage || null,
      };
    }
    
    // Same as page: build default airport-transfers guide when not in DB so metadata matches rendered page
    if (!guideData && categorySlug === 'airport-transfers' && destination) {
      const destinationName = destination.fullName || destination.name || 'Destination';
      guideData = {
        title: `${destinationName} Airport Transfers`,
        subtitle: `Find reliable airport transfer services to and from ${destinationName}. Compare shared and private transfers, book in advance, and start your trip stress-free.`,
        categoryName: 'Airport Transfers',
        heroImage: destination?.imageUrl || null,
        seo: {
          title: `${destinationName} Airport Transfer: Shared & Private Transfers`,
          description: `Book reliable airport transfers to and from ${destinationName}. Compare shared and private transfer options, prices, and durations.`,
          keywords: `airport transfer, airport shuttle, airport taxi, private transfer, shared transfer, ${destinationName} airport`,
        },
      };
    }

    // Static partner guide: Kiliclimb Africa Safaris (Arusha) — metadata matches rendered page when not in DB
    const normDestMeta = normalizeSlug(destinationId);
    const normCatMeta = normalizeSlug(categorySlug);
    if (!guideData && normDestMeta === 'arusha' && normCatMeta === ARUSHA_KILICLIMB_GUIDE_SLUG) {
      guideData = getKiliclimbPartnerGuideData();
    }

    if (!guideData && normDestMeta === 'siem-reap' && normCatMeta === ANGKOR_SUNRISE_GUIDE_SLUG) {
      guideData = getAngkorSunriseGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_AIRPORT_TRANSFERS_SLUG) {
      guideData = getSiemReapAirportTransfersGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_ANGKOR_WAT_TOURS_SLUG) {
      guideData = getSiemReapAngkorWatToursGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_ADDITIONAL_FEES_SLUG) {
      guideData = getSiemReapAdditionalFeesGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_BIKE_TOURS_SLUG) {
      guideData = getSiemReapBikeToursGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_DAY_TRIPS_SLUG) {
      guideData = getSiemReapDayTripsGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_BUS_TOURS_SLUG) {
      guideData = getSiemReapBusToursGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_HALF_DAY_TOURS_SLUG) {
      guideData = getSiemReapHalfDayToursGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_FULL_DAY_TOURS_SLUG) {
      guideData = getSiemReapFullDayToursGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_MULTI_DAY_TOURS_SLUG) {
      guideData = getSiemReapMultiDayToursGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_NATURE_WILDLIFE_TOURS_SLUG) {
      guideData = getSiemReapNatureWildlifeToursGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_NEW_PRODUCT_SLUG) {
      guideData = getSiemReapNewProductGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_OVERNIGHT_TOURS_SLUG) {
      guideData = getSiemReapOvernightToursGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_PHOTOGRAPHY_TOURS_SLUG) {
      guideData = getSiemReapPhotographyToursGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_SPRING_BREAK_SLUG) {
      guideData = getSiemReapSpringBreakGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_ATTRACTIONS_MUSEUMS_SLUG) {
      guideData = getSiemReapAttractionsMuseumsGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_COUNTRYSIDE_VILLAGE_SLUG) {
      guideData = getSiemReapCountrysideVillageGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_FOOD_DRINK_SLUG) {
      guideData = getSiemReapFoodDrinkGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_KHMER_HISTORY_CULTURE_SLUG) {
      guideData = getSiemReapKhmerHistoryCultureGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_MONUMENTS_MEMORIALS_SLUG) {
      guideData = getSiemReapMonumentsMemorialsGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_NIGHTLIFE_SLUG) {
      guideData = getSiemReapNightlifeGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_STREET_FOOD_MARKET_SLUG) {
      guideData = getSiemReapStreetFoodMarketGuideData();
    }

    if (normDestMeta === 'siem-reap' && normCatMeta === SIEM_REAP_TEMPLE_ARCHITECTURE_SLUG) {
      guideData = getSiemReapTempleArchitectureGuideData();
    }
    
    // Same as page: tag-based guides — real cache vs placeholder ("Generate with AI" shell).
    // SEO: noindex placeholders until tag_guide_content has generated unique body copy (otherwise thin / doorway-style).
    let isPlaceholderInMetadata = false;
    if (!guideData && destination && categorySlug !== 'airport-transfers') {
      const normalizedDestId = normalizeSlug(destinationId);
      const content = await getTagGuideContent(normalizedDestId, categorySlug);
      if (content) {
        guideData = contentToGuideData(
          content,
          destination?.fullName || destination?.name || destinationId,
          destination?.imageUrl
        );
      } else {
        const tag = await getTagBySlug(categorySlug);
        if (tag) {
          const destName = destination.fullName || destination.name || destinationId;
          guideData = {
            title: `${tag.tag_name_en} in ${destName}`,
            subtitle: `Discover ${tag.tag_name_en.toLowerCase()} in ${destName}. Generate this guide with AI to get tips, what to expect, and FAQs.`,
            categoryName: tag.tag_name_en,
            seo: {
              title: `${tag.tag_name_en} in ${destName}`,
              description: `Guide to ${tag.tag_name_en.toLowerCase()} in ${destName}. Generate the full guide with AI.`,
              keywords: '',
            },
          };
          isPlaceholderInMetadata = true;
        }
      }
    }
    
    // noindex: true 404s, and tag placeholders with no AI-generated content yet (users still see the page; Google should wait).
    if (!destination || !guideData || isPlaceholderInMetadata) {
      return {
        title: 'Guide Not Found',
        robots: {
          index: false,
          follow: false,
          noindex: true,
          nofollow: true,
        },
      };
    }

    // Prefer guide heroImage (e.g. SAI editorial guides) over generic category fallbacks
    const ogImage = resolveGuideOgImage(guideData, destination, categorySlug);
    const seo = guideData.seo || {};
    const destName = destination.fullName || destination.name || '';
    const categoryName = guideData.categoryName || guideData.title || 'Tours';
    const bookingTitle = destName && categoryName ? `Best ${destName} ${categoryName}` : null;

    // Curated editorial guides (those with a guideLayout) carry unique top-pick + section
    // content, so they should stay indexable even when their slug (e.g. full-day-tours,
    // multi-day-tours) matches a thin-tag hint meant for AI-template tag guides.
    const noindexThinGuide =
      !guideData?.guideLayout &&
      isLowValueGuideTag({
        slug: categorySlug,
        name: guideData?.categoryName,
        title: guideData?.title,
      });

    return {
      title: seo.title || guideData.title || bookingTitle || 'Guide',
      description: seo.description || guideData.subtitle,
      keywords: seo.keywords || '',
      openGraph: {
        title: seo.title || guideData.title || bookingTitle || 'Guide',
        description: seo.description || guideData.subtitle,
        url: `https://toptours.ai/destinations/${destinationId}/guides/${categorySlug}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${guideData.title} - ${destination.fullName || destination.name}`,
          },
        ],
        type: 'article',
        siteName: 'TopTours.ai',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.title || guideData.title || bookingTitle || 'Guide',
        description: seo.description || guideData.subtitle,
        images: [ogImage],
      },
      alternates: {
        canonical: `https://toptours.ai/destinations/${destinationId}/guides/${categorySlug}`,
      },
      robots: noindexThinGuide
        ? {
            index: false,
            follow: true,
            googleBot: {
              index: false,
              follow: true,
              'max-video-preview': -1,
              'max-image-preview': 'large',
              'max-snippet': -1,
            },
          }
        : {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              'max-video-preview': -1,
              'max-image-preview': 'large',
              'max-snippet': -1,
            },
          },
    };
  } catch (error) {
    devError('Error in generateMetadata:', error);
    return {
      title: 'Guide Not Found',
      robots: {
        index: false,
        follow: false,
        noindex: true,
        nofollow: true,
      },
    };
  }
}

// Note: We're using dynamic rendering, so we don't generate static params
// All guides (both from database and JSON) are handled dynamically
// This allows us to serve guides from the database without rebuilding

export default async function CategoryGuidePage({ params }) {
  try {
    const { id: destinationId, category: categorySlug } = await params;
    requireFeaturedDestination(destinationId);

    if (isHiddenGuide({ destinationId, categorySlug })) {
      notFound();
    }

    // Check if category slug needs normalization (has special characters)
    // Normalize the slug and compare - if different, redirect to normalized version
    const normalizedCategorySlug = normalizeSlug(categorySlug);
    const originalLower = categorySlug.toLowerCase().trim();
    
    // If normalization changed the slug (e.g., "banús" -> "banus"), redirect
    // This handles URLs with special characters like "ban%C3%BAs" (URL-encoded "banús")
    // Only redirect if the normalized version is actually different
    if (normalizedCategorySlug && normalizedCategorySlug !== originalLower) {
      // Redirect to normalized version
      // Note: redirect() throws NEXT_REDIRECT error which is expected - Next.js catches it
      redirect(`/destinations/${destinationId}/guides/${normalizedCategorySlug}`);
    }

    // Legacy angkor-wat slug → curated shore excursions guide
    if (
      normalizeSlug(destinationId) === 'siem-reap' &&
      normalizedCategorySlug === 'angkor-wat'
    ) {
      redirect('/destinations/siem-reap/guides/shore-excursions');
    }
    
    // STEP 1: Get guide data from database (all guides are now in the database)
    let guideData = await getGuideFromDatabase(destinationId, categorySlug);
    let guideSource = 'database';
    
    if (!guideData) {
      devLog(`⚠️ [SERVER] No guide found in database for ${destinationId}/${categorySlug}`);
    } else {
      devLog(`✅ [SERVER] Found guide in database for ${destinationId}/${categorySlug}`);
    }
    
    // STEP 2: Try to get destination (destinationsData.js first, then generated content)
    let destination = destinations.find(d => d.id === destinationId);
    
    if (!destination) {
      try {
        const fullContent = getDestinationFullContent(destinationId);
        if (fullContent && fullContent.destinationName) {
          // Use FULL destination data from generated content - this has all the data we need!
          destination = {
            id: destinationId,
            name: fullContent.destinationName,
            fullName: fullContent.destinationName,
            imageUrl: fullContent.imageUrl || null,
            country: fullContent.country || null,
            category: fullContent.region || null,
            tourCategories: fullContent.tourCategories || [],
            bestTimeToVisit: fullContent.bestTimeToVisit || null,
            gettingAround: fullContent.gettingAround || null,
            whyVisit: fullContent.whyVisit || [],
            highlights: fullContent.highlights || [],
            briefDescription: fullContent.briefDescription || null,
            heroDescription: fullContent.heroDescription || null,
            seo: fullContent.seo || null,
          };
          devLog(`✅ Found full destination data from generated content: ${destinationId} -> ${destination.name}`);
        }
      } catch (error) {
        devWarn(`Error getting destination full content for ${destinationId}:`, error.message);
      }
    }
    
    // STEP 3: If still no destination but we have guide data, create minimal destination
    // This should rarely happen if generated content exists
    if (!destination && guideData) {
      // Extract destination name from guide's category name
      let destinationName = 'Destination';
      if (guideData.categoryName) {
        const parts = guideData.categoryName.split(' ');
        // Usually first word is destination (e.g., "Malaga Food & Tapas" -> "Malaga")
        destinationName = parts[0];
      } else {
        // Fallback: capitalize slug
        destinationName = destinationId.charAt(0).toUpperCase() + destinationId.slice(1).replace(/-/g, ' ');
      }
      
      destination = {
        id: destinationId,
        name: destinationName,
        fullName: destinationName,
        imageUrl: guideData.heroImage || null,
        country: null,
        category: null,
        tourCategories: [], // Empty array to prevent errors
        bestTimeToVisit: null, // Will be handled with optional chaining in component
        gettingAround: null,
        whyVisit: [],
        highlights: [],
      };
      devLog(`⚠️ Created minimal destination for ${destinationId}: ${destinationName} (no generated content found)`);
    }

    // Featured static partner guide: Kiliclimb Africa Safaris (Arusha) — before tag placeholders
    const normDestPage = normalizeSlug(destinationId);
    const normCatPage = normalizeSlug(categorySlug);
    if (normDestPage === 'arusha' && normCatPage === ARUSHA_KILICLIMB_GUIDE_SLUG) {
      const staticGuide = getKiliclimbPartnerGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_partner';
      } else {
        guideData = {
          ...guideData,
          partnerShowcaseTours: staticGuide.partnerShowcaseTours,
          toursSearchQuery: staticGuide.toursSearchQuery ?? guideData.toursSearchQuery,
          // Prefer static display label so UI strings don’t repeat “partner” from legacy DB copy
          categoryName: staticGuide.categoryName || guideData.categoryName,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === ANGKOR_SUNRISE_GUIDE_SLUG) {
      const staticGuide = getAngkorSunriseGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...staticGuide,
          ...guideData,
          partnerShowcaseTours: staticGuide.partnerShowcaseTours,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          showcaseConfig: staticGuide.showcaseConfig,
          guideLayout: staticGuide.guideLayout,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_ANGKOR_WAT_TOURS_SLUG) {
      const staticGuide = getSiemReapAngkorWatToursGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_AIRPORT_TRANSFERS_SLUG) {
      const staticGuide = getSiemReapAirportTransfersGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_ADDITIONAL_FEES_SLUG) {
      const staticGuide = getSiemReapAdditionalFeesGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          quickAnswer: staticGuide.quickAnswer,
          angkorPass: staticGuide.angkorPass,
          tipping: staticGuide.tipping,
          otherCosts: staticGuide.otherCosts,
          entryCosts: staticGuide.entryCosts,
          avoidSurprises: staticGuide.avoidSurprises,
          dayExample: staticGuide.dayExample,
          featuredTourSections: staticGuide.featuredTourSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_BIKE_TOURS_SLUG) {
      const staticGuide = getSiemReapBikeToursGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_DAY_TRIPS_SLUG) {
      const staticGuide = getSiemReapDayTripsGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_BUS_TOURS_SLUG) {
      const staticGuide = getSiemReapBusToursGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_HALF_DAY_TOURS_SLUG) {
      const staticGuide = getSiemReapHalfDayToursGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_FULL_DAY_TOURS_SLUG) {
      const staticGuide = getSiemReapFullDayToursGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_MULTI_DAY_TOURS_SLUG) {
      const staticGuide = getSiemReapMultiDayToursGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_NATURE_WILDLIFE_TOURS_SLUG) {
      const staticGuide = getSiemReapNatureWildlifeToursGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_NEW_PRODUCT_SLUG) {
      const staticGuide = getSiemReapNewProductGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_OVERNIGHT_TOURS_SLUG) {
      const staticGuide = getSiemReapOvernightToursGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_PHOTOGRAPHY_TOURS_SLUG) {
      const staticGuide = getSiemReapPhotographyToursGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_SPRING_BREAK_SLUG) {
      const staticGuide = getSiemReapSpringBreakGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_ATTRACTIONS_MUSEUMS_SLUG) {
      const staticGuide = getSiemReapAttractionsMuseumsGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_COUNTRYSIDE_VILLAGE_SLUG) {
      const staticGuide = getSiemReapCountrysideVillageGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_FOOD_DRINK_SLUG) {
      const staticGuide = getSiemReapFoodDrinkGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_KHMER_HISTORY_CULTURE_SLUG) {
      const staticGuide = getSiemReapKhmerHistoryCultureGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_MONUMENTS_MEMORIALS_SLUG) {
      const staticGuide = getSiemReapMonumentsMemorialsGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_NIGHTLIFE_SLUG) {
      const staticGuide = getSiemReapNightlifeGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_STREET_FOOD_MARKET_SLUG) {
      const staticGuide = getSiemReapStreetFoodMarketGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    if (normDestPage === 'siem-reap' && normCatPage === SIEM_REAP_TEMPLE_ARCHITECTURE_SLUG) {
      const staticGuide = getSiemReapTempleArchitectureGuideData();
      if (!guideData) {
        guideData = staticGuide;
        guideSource = 'static_editorial';
      } else {
        guideData = {
          ...guideData,
          ...staticGuide,
          topPick: staticGuide.topPick,
          transferSections: staticGuide.transferSections,
          relatedGuideLinks: staticGuide.relatedGuideLinks,
          guideLayout: staticGuide.guideLayout,
          hideWhatToExpect: staticGuide.hideWhatToExpect,
          hideExpertTips: staticGuide.hideExpertTips,
          faqs: staticGuide.faqs,
          seo: staticGuide.seo,
          stats: staticGuide.stats,
          heroTagline: staticGuide.heroTagline,
          heroImage: staticGuide.heroImage,
          introParagraphs: staticGuide.introParagraphs,
          comparisonSection: staticGuide.comparisonSection,
          tipsSection: staticGuide.tipsSection,
          topPickHeading: staticGuide.topPickHeading,
          schemaDatePublished: staticGuide.schemaDatePublished,
          schemaDateModified: staticGuide.schemaDateModified,
          curatedToursForSchema: staticGuide.curatedToursForSchema,
        };
      }
    }

    // Tag guide: prefer cached tag guide content first
    let resolvedTagId = null;
    let tagGuidePlaceholder = null;
    if (!guideData && destination && categorySlug !== 'airport-transfers') {
      const tagNameFromSlug = (slug) => {
        if (!slug) return 'Guide';
        return String(slug)
          .replace(/[_]/g, ' ')
          .split('-')
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      };

      const normalizedDestId = normalizeSlug(destinationId);
      const content = await getTagGuideContent(normalizedDestId, categorySlug);
      if (content) {
        guideData = contentToGuideData(
          content,
          destination?.fullName || destination?.name || destinationId,
          destination?.imageUrl
        );
        guideSource = 'tag_guide';
      } else {
        const tag = await getTagBySlug(categorySlug);
        const destName = destination?.fullName || destination?.name || destinationId;
        const tagNameEn = tag?.tag_name_en || tagNameFromSlug(categorySlug);

        if (tag?.tag_id) resolvedTagId = tag.tag_id;

        guideData = {
          title: `${tagNameEn} in ${destName}`,
          subtitle: `Discover ${tagNameEn.toLowerCase()} in ${destName}. Generate this guide with AI to get tips, what to expect, and FAQs.`,
          categoryName: tagNameEn,
          isPlaceholder: true,
          introduction: '',
          seo: {
            title: `${tagNameEn} in ${destName}`,
            description: `Guide to ${tagNameEn.toLowerCase()} in ${destName}. Generate the full guide with AI.`,
            keywords: '',
          },
          whyChoose: [],
          faqs: [],
          tourTypes: [],
          whatToExpect: {},
          expertTips: [],
          stats: {},
        };
        tagGuidePlaceholder = { tagName: tagNameEn, tagSlug: categorySlug };
      }
    }
    
    // Special case: airport-transfers - create default guide if not in database
    if (!guideData && categorySlug === 'airport-transfers') {
      const destinationName = destination?.fullName || destination?.name || 'Destination';
      guideData = {
        title: `${destinationName} Airport Transfers`,
        subtitle: `Find reliable airport transfer services to and from ${destinationName}. Compare shared and private transfers, book in advance, and start your trip stress-free.`,
        categoryName: 'Airport Transfers',
        heroImage: destination?.imageUrl || null,
        stats: {},
        introduction: `Planning your arrival or departure? Book your airport transfer in advance for a smooth start to your ${destinationName} adventure.`,
        seo: {
          title: `${destinationName} Airport Transfer: Shared & Private Transfers`,
          description: `Book reliable airport transfers to and from ${destinationName}. Compare shared and private transfer options, prices, and durations.`,
          keywords: `airport transfer, airport shuttle, airport taxi, private transfer, shared transfer, ${destinationName} airport`
        },
        whyChoose: [
          'Pre-booked transfers for peace of mind',
          'Compare shared and private options',
          'Fixed prices, no surprises',
          'Meet and greet service available'
        ],
        tourTypes: [],
        whatToExpect: {
          items: [
            {
              icon: 'Clock',
              title: 'Duration',
              description: 'Transfer times typically range from 30-60 minutes depending on traffic and distance'
            },
            {
              icon: 'Users',
              title: 'Group Size',
              description: 'Choose between private transfers (1-8 people) or shared transfers (multiple passengers)'
            },
            {
              icon: 'DollarSign',
              title: 'Pricing',
              description: 'Fixed prices with no hidden fees. Shared transfers are more economical, private transfers offer exclusivity'
            },
            {
              icon: 'MapPin',
              title: 'Pickup Location',
              description: 'Meet at the airport terminal or hotel lobby. Some services offer meet-and-greet at arrivals'
            }
          ]
        },
        expertTips: [
          'Book in advance for better prices and availability',
          'Private transfers offer more flexibility and comfort',
          'Shared transfers are more budget-friendly',
          'Check if your hotel offers transfer services'
        ],
        faqs: [
          {
            question: `How do I get from the airport to ${destinationName}?`,
            answer: `You can book a private or shared transfer in advance, take a taxi, or use public transportation. Pre-booking a transfer ensures a smooth arrival with fixed pricing.`
          },
          {
            question: 'What is the difference between shared and private transfers?',
            answer: 'Shared transfers are more economical and may include stops at multiple hotels. Private transfers offer direct service to your destination with more flexibility and comfort.'
          },
          {
            question: 'How long does an airport transfer take?',
            answer: 'Transfer times vary by destination and traffic. Most transfers take 30-60 minutes, but this can vary. Check the specific transfer details when booking.'
          }
        ]
      };
      guideSource = 'default';
      devLog(`✅ [SERVER] Created default airport transfers guide for ${destinationId}`);
    }
    
    // SEO: 404 placeholder guides (no real content) so they don't inflate "Excluded by noindex" in GSC
    // But for actual users we want the "Generate with AI" UI to be reachable.
    if (guideData?.isPlaceholder === true && process.env.GUIDE_PLACEHOLDER_404 === 'true') {
      notFound();
    }
    
    // Final check
    if (!destination || !guideData) {
      devError(`❌ Cannot render page: destination=${!!destination}, guideData=${!!guideData}`);
      notFound();
    }
    
    devLog(`✅ Rendering guide: ${destination.name} - ${guideData.title}`);
    devLog(`📊 GUIDE SOURCE: ${guideSource.toUpperCase()} ${guideSource === 'database' ? '✅ (from database - migrated)' : '⚠️ (from hardcoded JSON - not migrated)'}`);
    devLog('Guide data structure:', {
      hasTitle: !!guideData.title,
      hasSubtitle: !!guideData.subtitle,
      hasSeo: !!guideData.seo,
      hasStats: !!guideData.stats,
      hasWhyChoose: Array.isArray(guideData.whyChoose),
      hasTourTypes: Array.isArray(guideData.tourTypes),
      hasFaqs: Array.isArray(guideData.faqs),
    });

  // Get all available guides for this destination using the same function as destination detail page
  // This handles both database guides (for 3200+ destinations) and hardcoded guides (for 182 destinations)
  let allAvailableGuides = [];
  try {
    allAvailableGuides = await getAllCategoryGuidesForDestination(destinationId);
  } catch (error) {
    devError('Error fetching category guides for guide page:', error);
    // Fallback to empty array
    allAvailableGuides = [];
  }
  
  // Also create slugs array for backward compatibility
  const lightweightAllAvailableGuides = (allAvailableGuides || []).map((guide) => ({
    category_slug: guide.category_slug || null,
    category_name: guide.category_name || null,
    title: guide.title || null,
    subtitle: guide.subtitle || null,
    hero_image: guide.hero_image || null,
  }));
  const allAvailableGuideSlugs = lightweightAllAvailableGuides.map(g => g.category_slug).filter(Boolean);

  // Viator destination ID for "Load tours" (product search by destination and optionally tag)
  const { getViatorDestinationBySlugCached } = await import('@/lib/supabaseCache');
  const viatorDest = await getViatorDestinationBySlugCached(destinationId);
  const viatorDestinationId = viatorDest?.id ?? null;

  // Fetch destination features (lightweight checks for sticky nav)
  const features = await getDestinationFeatures(destinationId);

  // No server-side Viator fetch on guide pages (saves cost; ~21K guide URLs).
  // Client shows a CTA linking to /destinations/[id]/tours (no search params = higher chance of results).
  const categoryTours = [];
  const promotionScores = {};

  // OG + schema images: editorial guides use heroImage (e.g. SAI airport taxi photo)
  const schemaImage = resolveGuideOgImage(guideData, destination, categorySlug);
  const schemaDates = resolveGuideSchemaDates(guideData);
  const pageUrl = `https://toptours.ai/destinations/${destinationId}/guides/${categorySlug}`;

  const schemaFeaturedTours =
    Array.isArray(guideData.curatedToursForSchema) && guideData.curatedToursForSchema.length > 0
      ? guideData.curatedToursForSchema
      : categoryTours;
  const featuredToursItemList = buildGuideFeaturedToursItemList(
    guideData,
    destination,
    schemaFeaturedTours
  );

  // JSON-LD Schema for SEO: WebPage, Article, FAQPage (only when we have FAQs), BreadcrumbList, TouristAttraction, ItemList(s)
  // Google requires FAQPage mainEntity to be a non-empty array; omit FAQPage when there are no FAQs to avoid GSC errors
  const faqMainEntity = (guideData.faqs || [])
    .filter(faq => faq && (faq.question || faq.name) && (faq.answer || faq.text))
    .map(faq => ({
      '@type': 'Question',
      name: typeof (faq.question ?? faq.name) === 'string' ? (faq.question ?? faq.name) : '',
      acceptedAnswer: {
        '@type': 'Answer',
        text: typeof (faq.answer ?? faq.text) === 'string' ? (faq.answer ?? faq.text) : '',
      },
    }))
    .filter(q => q.name && q.acceptedAnswer?.text);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: guideData.title,
        description: guideData.subtitle || guideData.seo?.description,
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: schemaImage,
          width: 1200,
          height: 630,
        },
        isPartOf: { '@type': 'WebSite', '@id': 'https://toptours.ai/#website', name: 'TopTours.ai', url: 'https://toptours.ai' },
        publisher: { '@type': 'Organization', name: 'TopTours.ai', logo: { '@type': 'ImageObject', url: 'https://toptours.ai/logo.png' } },
      },
      {
        '@type': 'Article',
        headline: guideData.title,
        description: guideData.subtitle,
        image: schemaImage,
        author: {
          '@type': 'Organization',
          name: 'TopTours AI',
        },
        publisher: {
          '@type': 'Organization',
          name: 'TopTours AI',
          logo: {
            '@type': 'ImageObject',
            url: 'https://toptours.ai/logo.png',
          },
        },
        datePublished: schemaDates.datePublished,
        dateModified: schemaDates.dateModified,
      },
      // Only include FAQPage when mainEntity has at least one valid Question (required for valid FAQ rich results)
      ...(faqMainEntity.length > 0 ? [{
        '@type': 'FAQPage',
        mainEntity: faqMainEntity,
      }] : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://toptours.ai',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Destinations',
            item: 'https://toptours.ai/destinations',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: destination.name,
            item: `https://toptours.ai/destinations/${destinationId}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: guideData.title,
            item: `https://toptours.ai/destinations/${destinationId}/guides/${categorySlug}`,
          },
        ],
      },
      {
        '@type': 'TouristAttraction',
        name: `${guideData.categoryName} in ${destination.name}`,
        description: guideData.subtitle,
        image: schemaImage,
        ...(destination.category ? { address: { '@type': 'PostalAddress', addressCountry: destination.category } } : {}),
      },
      ...(featuredToursItemList ? [featuredToursItemList] : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryGuideClient 
        destinationId={destinationId} 
        categorySlug={categorySlug}
        guideData={guideData}
        categoryTours={categoryTours}
        promotionScores={promotionScores}
        availableGuideSlugs={allAvailableGuideSlugs}
        allAvailableGuides={lightweightAllAvailableGuides}
        destinationFeatures={features}
        viatorDestinationId={viatorDestinationId}
        tagId={resolvedTagId}
        tagGuidePlaceholder={tagGuidePlaceholder}
        destination={{
          id: destination.id,
          name: destination.name,
          fullName: destination.fullName || destination.name,
          imageUrl: destination.imageUrl || null,
          category: destination.category || null,
          gettingAround: destination.gettingAround || null,
        }}
      />
    </>
  );
  } catch (error) {
    devError('Error in CategoryGuidePage:', error);
    notFound();
  }
}


