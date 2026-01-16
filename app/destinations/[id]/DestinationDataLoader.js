import { getPromotionScoresByDestination, getTrendingToursByDestination, getTrendingRestaurantsByDestination, getRestaurantPromotionScoresByDestination, getPromotedToursByDestination, getPromotedRestaurantsByDestination } from '@/lib/promotionSystem';
import { getRestaurantsForDestination, formatRestaurantForFrontend } from '@/lib/restaurants';
import { getPremiumRestaurantIds } from '@/lib/restaurantPremiumServer';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';
import { getHardcodedToursByDestination } from '@/lib/promotionSystem';
import { getBabyEquipmentRentalsByDestination } from '@/lib/babyEquipmentRentals';

/**
 * Fetches all destination data in parallel for better performance
 * This function parallelizes independent queries to reduce total load time
 */
export async function fetchDestinationData(destination, destinationIdForScores) {
  // Parallelize all independent data fetching operations
  const [
    promotionScores,
    trendingTours,
    trendingRestaurants,
    promotedTourData,
    promotedRestaurantData,
    restaurantPromotionScores,
    premiumRestaurantIds,
    hardcodedTours,
    categoryGuides,
    restaurants,
    hasBabyEquipmentRentals
  ] = await Promise.allSettled([
    // Promotion scores
    getPromotionScoresByDestination(destinationIdForScores).catch(() => ({})),
    
    // Trending tours
    getTrendingToursByDestination(destinationIdForScores, 3).catch(() => []),
    
    // Trending restaurants
    getTrendingRestaurantsByDestination(destination.id, 3).catch(() => []),
    
    // Promoted tour data (just IDs first)
    getPromotedToursByDestination(destinationIdForScores, 6).catch(() => []),
    
    // Promoted restaurant data
    getPromotedRestaurantsByDestination(destination.id, 6).catch(() => []),
    
    // Restaurant promotion scores
    getRestaurantPromotionScoresByDestination(destination.id).catch(() => ({})),
    
    // Premium restaurant IDs
    getPremiumRestaurantIds(destination.id).then(set => Array.from(set)).catch(() => []),
    
    // Hardcoded tours (lightweight - no API calls)
    getHardcodedToursByDestination(destination.id).catch(() => ({})),
    
    // Category guides
    getAllCategoryGuidesForDestination(destination.id).catch(() => []),
    
    // Restaurants (only if env vars are available)
    (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? getRestaurantsForDestination(destination.id)
          .then(dbRestaurants => (dbRestaurants || [])
            .map(restaurant => {
              try {
                return formatRestaurantForFrontend(restaurant);
              } catch (err) {
                return null;
              }
            })
            .filter(Boolean)
          )
          .catch(() => [])
      : Promise.resolve([])
    ),
    
    // Baby equipment rentals check
    getBabyEquipmentRentalsByDestination(destination.id)
      .then(data => !!data)
      .catch(() => false)
  ]);

  // Extract values from Promise.allSettled results
  const result = {
    promotionScores: promotionScores.status === 'fulfilled' ? promotionScores.value : {},
    trendingTours: trendingTours.status === 'fulfilled' ? trendingTours.value : [],
    trendingRestaurants: trendingRestaurants.status === 'fulfilled' ? trendingRestaurants.value : [],
    promotedTourData: promotedTourData.status === 'fulfilled' ? promotedTourData.value : [],
    promotedRestaurantData: promotedRestaurantData.status === 'fulfilled' ? promotedRestaurantData.value : [],
    restaurantPromotionScores: restaurantPromotionScores.status === 'fulfilled' ? restaurantPromotionScores.value : {},
    premiumRestaurantIds: premiumRestaurantIds.status === 'fulfilled' ? premiumRestaurantIds.value : [],
    hardcodedTours: hardcodedTours.status === 'fulfilled' ? hardcodedTours.value : {},
    categoryGuides: categoryGuides.status === 'fulfilled' ? categoryGuides.value : [],
    restaurants: restaurants.status === 'fulfilled' ? restaurants.value : [],
    hasBabyEquipmentRentals: hasBabyEquipmentRentals.status === 'fulfilled' ? hasBabyEquipmentRentals.value : false,
  };

  // Enrich tourCategories with hasGuide property
  if (destination.tourCategories && Array.isArray(destination.tourCategories) && result.categoryGuides.length > 0) {
    const guideSlugs = new Set(result.categoryGuides.map(g => g.category_slug));
    destination.tourCategories = destination.tourCategories.map(category => {
      const categoryName = typeof category === 'string' ? category : category.name;
      const categorySlug = categoryName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, 'and')
        .replace(/'/g, '')
        .replace(/\./g, '')
        .replace(/ /g, '-');
      
      const hasGuide = guideSlugs.has(categorySlug);
      
      if (typeof category === 'string') {
        return { name: category, hasGuide };
      } else {
        return { ...category, hasGuide };
      }
    });
  }

  // Merge hardcoded tour scores into promotionScores
  if (result.hardcodedTours && Object.keys(result.hardcodedTours).length > 0) {
    Object.values(result.hardcodedTours).forEach(categoryTours => {
      categoryTours.forEach(tour => {
        if (tour.productId && !result.promotionScores[tour.productId]) {
          result.promotionScores[tour.productId] = {
            product_id: tour.productId,
            total_score: tour.totalScore || 0,
            monthly_score: 0,
            weekly_score: 0,
            past_28_days_score: tour.lastMonthScore || 0,
          };
        }
      });
    });
  }

  // Fetch full promoted tour data (this needs to happen after we have the IDs)
  let promotedTours = [];
  if (result.promotedTourData.length > 0) {
    try {
      const { getCachedTour } = await import('@/lib/viatorCache');
      const apiKey = process.env.VIATOR_API_KEY;
      
      const fetchPromises = result.promotedTourData.map(async (promoted) => {
        const productId = promoted.product_id || promoted.productId || promoted.productCode;
        if (!productId) return null;
        
        try {
          // Try to get cached tour first
          let tour = await getCachedTour(productId);
          
          // If not cached, fetch from Viator API
          if (!tour && apiKey) {
            const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'exp-api-key': apiKey,
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en-US',
                'Content-Type': 'application/json'
              },
              cache: 'no-store'
            });
            
            if (response.ok) {
              tour = await response.json();
            } else {
              return null;
            }
          }
          
          if (!tour) return null;
          
          // Return tour with product_id for matching
          return {
            ...tour,
            productId: productId,
            productCode: productId,
            product_id: productId,
          };
        } catch (error) {
          return null;
        }
      });
      
      const fetchedTours = await Promise.all(fetchPromises);
      promotedTours = fetchedTours.filter(t => t !== null);
      
    } catch (error) {
      // Silently continue - promoted tours are optional
    }
  }

  // Match promoted restaurants with full restaurant data
  let promotedRestaurants = [];
  if (result.promotedRestaurantData.length > 0 && result.restaurants.length > 0) {
    const promotedRestaurantIds = new Set(
      result.promotedRestaurantData.map(pr => String(pr.id || pr.restaurant_id)).filter(Boolean)
    );
    promotedRestaurants = result.restaurants.filter(r => 
      r.id && promotedRestaurantIds.has(String(r.id))
    );
  }

  return {
    ...result,
    promotedTours,
    promotedRestaurants,
  };
}
