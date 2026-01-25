/**
 * TourDataLoader - Fetches non-critical tour data in parallel
 * This allows the page to render immediately with basic tour info
 * while streaming in additional data
 */

import { getTourPromotionScore } from '@/lib/promotionSystem';
import { getTourEnrichment, generateTourEnrichment } from '@/lib/tourEnrichment';
import { getTourOperatorPremiumSubscription, getOperatorPremiumTourIds, getOperatorAggregatedStats } from '@/lib/tourOperatorPremiumServer';
import { getCachedReviews } from '@/lib/viatorReviews';
import { getFromPrice } from '@/lib/viatorPricing';
import { getDestinationNameById } from '@/lib/destinationIdLookup';
import { getViatorDestinationById } from '@/lib/supabaseCache';
import { getRestaurantCountsByDestination, getRestaurantsForDestination as getRestaurantsForDestinationFromDB, formatRestaurantForFrontend } from '@/lib/restaurants';
import { getRestaurantsForDestination as getRestaurantsForDestinationFromStatic } from '../../destinations/[id]/restaurants/restaurantsData';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';

/**
 * Load all non-critical tour data in parallel
 */
export async function loadTourData(productId, tour) {
  // Fetch data in parallel
  const [
    pricingResult,
    promotionScoreResult,
    tourEnrichmentResult,
    operatorPremiumDataResult,
    reviewsResult
  ] = await Promise.allSettled([
    // Fetch pricing from schedules API (product endpoint doesn't include pricing)
    getFromPrice(productId),
    getTourPromotionScore(productId)
      .then(score => {
        if (!score) {
          return {
            product_id: productId,
            total_score: 0,
            monthly_score: 0,
            weekly_score: 0,
            past_28_days_score: 0,
          };
        }
        return score;
      })
      .catch(() => ({
        product_id: productId,
        total_score: 0,
        monthly_score: 0,
        weekly_score: 0,
        past_28_days_score: 0,
      })),
    getTourEnrichment(productId).catch(() => null),
    getTourOperatorPremiumSubscription(productId).catch(() => null),
    (async () => {
      try {
        const currentReviewCount = tour.reviews?.totalReviews || 0;
        return await getCachedReviews(productId, currentReviewCount);
      } catch (error) {
        return null;
      }
    })()
  ]);

  // Extract results
  const pricing = pricingResult.status === 'fulfilled' ? pricingResult.value : null;
  const promotionScore = promotionScoreResult.status === 'fulfilled' ? promotionScoreResult.value : {
    product_id: productId,
    total_score: 0,
    monthly_score: 0,
    weekly_score: 0,
    past_28_days_score: 0,
  };
  let tourEnrichment = tourEnrichmentResult.status === 'fulfilled' ? tourEnrichmentResult.value : null;
  let operatorPremiumData = operatorPremiumDataResult.status === 'fulfilled' ? operatorPremiumDataResult.value : null;
  const reviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : null;

  // OPTIMIZED: Don't auto-generate enrichment on every page load (expensive AI calls)
  // Enrichment is only generated when user explicitly clicks "Generate Insight" button
  // This prevents expensive AI API calls during crawls
  // tourEnrichment will be null if not cached, which is fine - the UI handles it gracefully

  // Fetch operator tours and stats if premium data exists
  let operatorTours = [];
  if (operatorPremiumData) {
    try {
      operatorTours = await getOperatorPremiumTourIds(productId);
      const stats = await getOperatorAggregatedStats(operatorPremiumData.id);
      if (stats) {
        operatorPremiumData.aggregatedStats = stats;
      }
    } catch (error) {
      // Silently continue - operator data is optional
    }
  }

  return {
    pricing,
    promotionScore,
    tourEnrichment,
    operatorPremiumData,
    operatorTours,
    reviews
  };
}

/**
 * Load destination and related data
 */
export async function loadDestinationData(tour, productId) {
  try {
    let destinationId = null;
    let destinationNameFromTour = null;
    
    if (tour?.destinations && tour.destinations.length > 0) {
      const primary = tour.destinations.find(d => d.primary) || tour.destinations[0];
      destinationId = primary?.ref || primary?.destinationId || primary?.id;
      destinationNameFromTour = primary?.destinationName || primary?.name;
    }

    if (!destinationId) {
      return { destinationData: null, restaurantCount: 0, restaurants: [], categoryGuides: [] };
    }

    // Parallelize destination-related data fetching
    const [
      destinationNameResult,
      restaurantCountResult,
      restaurantsResult,
      categoryGuidesResult
    ] = await Promise.allSettled([
      getDestinationNameById(destinationId).catch(() => null),
      getRestaurantCountsByDestination(destinationId).catch(() => ({ count: 0 })),
      (async () => {
        try {
          const dbRestaurants = await getRestaurantsForDestinationFromDB(destinationId);
          if (dbRestaurants && dbRestaurants.length > 0) {
            return dbRestaurants.map(formatRestaurantForFrontend);
          }
          const staticRestaurants = await getRestaurantsForDestinationFromStatic(destinationId);
          return staticRestaurants || [];
        } catch (error) {
          // Silently return empty - restaurants are optional
          return [];
        }
      })(),
      getAllCategoryGuidesForDestination(destinationId).catch(() => [])
    ]);

    // getDestinationNameById returns { destinationName: "..." } or null
    const destinationNameObj = destinationNameResult.status === 'fulfilled' ? destinationNameResult.value : null;
    const destinationName = destinationNameObj?.destinationName || destinationNameFromTour;
    
    const restaurantCount = restaurantCountResult.status === 'fulfilled'
      ? restaurantCountResult.value?.count || 0
      : 0;
    
    const restaurants = restaurantsResult.status === 'fulfilled'
      ? restaurantsResult.value
      : [];
    
    const categoryGuides = categoryGuidesResult.status === 'fulfilled'
      ? categoryGuidesResult.value
      : [];

    // Get destination data
    let destinationData = null;
    if (destinationName) {
      try {
        const viatorDestination = await getViatorDestinationById(destinationId);
        if (viatorDestination) {
          destinationData = {
            id: destinationId,
            name: destinationName,
            slug: viatorDestination.slug || destinationId,
            destinationName: destinationName
          };
        } else {
          destinationData = {
            id: destinationId,
            name: destinationName,
            slug: destinationId,
            destinationName: destinationName
          };
        }
      } catch (error) {
        // Silently continue - will use fallback
        destinationData = {
          id: destinationId,
          name: destinationName,
          slug: destinationId,
          destinationName: destinationName
        };
      }
    }

    return {
      destinationData,
      restaurantCount,
      restaurants,
      categoryGuides
    };
  } catch (error) {
    // Silently return defaults - destination data is optional
    return { destinationData: null, restaurantCount: 0, restaurants: [], categoryGuides: [] };
  }
}
