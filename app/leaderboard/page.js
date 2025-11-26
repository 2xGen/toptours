import { getLeaderboardTours, getLeaderboardRestaurants, getRecentBoosts, updateTourMetadata, getTourPromotionScoresBatch, getTopPromoters } from '@/lib/promotionSystem';
import { getCachedTour, cacheTour } from '@/lib/viatorCache';
import { getViatorDestinationById } from '@/lib/supabaseCache';
import LeaderboardClient from './LeaderboardClient';

// Helper to generate slug from name
function generateSlug(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Metadata is now handled in layout.js for better SEO structure

export default async function LeaderboardPage({ searchParams }) {
  const params = await searchParams;
  const scoreType = params?.type || 'all'; // 'all', 'monthly', 'weekly', 'last_month'
  const region = params?.region || null;
  const section = params?.section || 'tours'; // 'tours' or 'restaurants'
  const limit = 20; // Fixed limit of 20 items
  const offset = 0;

  // Fetch leaderboard tours
  const tours = await getLeaderboardTours({
    scoreType,
    region,
    limit,
    offset,
  });

  // Fetch leaderboard restaurants
  const restaurants = await getLeaderboardRestaurants({
    scoreType,
    region,
    limit,
    offset,
  });

  // Fetch tour details server-side (using ONLY cached metadata from Supabase - no Viator API calls!)
  const toursWithDetails = tours.map((tour) => {
    // Use cached metadata from tour_promotions table - no API calls needed!
    const tourData = (tour.tour_name && tour.tour_image_url) ? {
      seo: { 
        title: tour.tour_name,
        slug: tour.tour_slug || null
      },
      title: tour.tour_name,
      slug: tour.tour_slug || null,
      images: tour.tour_image_url ? [{
        variants: [
          { url: tour.tour_image_url },
          { url: tour.tour_image_url },
          { url: tour.tour_image_url },
          { url: tour.tour_image_url }
        ]
      }] : null,
      destinations: tour.tour_region ? [{
        destinationName: tour.tour_region.replace('_', ' '),
        region: tour.tour_region
      }] : null,
    } : null;

    return {
      ...tour,
      tourData: tourData,
    };
  });

  // Fetch recent boosts server-side
  const recentBoosts = await getRecentBoosts(10);
  
  // Fetch top promoters (lightweight - just database queries)
  // Fetch all 20 at once for efficiency - UI will show 5 initially
  const topPromoters = await getTopPromoters(20);
  
  // Get promotion data for boosts to check for cached metadata
  // Separate tours and restaurants
  const boostProductIds = recentBoosts.map(b => b.product_id).filter(Boolean);
  const boostRestaurantIds = recentBoosts.map(b => b.restaurant_id).filter(Boolean);
  
  const boostScores = await getTourPromotionScoresBatch(boostProductIds);
  
  // Fetch restaurant promotion data if we have restaurant IDs
  let restaurantScores = {};
  if (boostRestaurantIds.length > 0) {
    const { createSupabaseServiceRoleClient } = await import('@/lib/supabaseClient');
    const supabase = createSupabaseServiceRoleClient();
    const { data: restaurantPromos, error: restaurantError } = await supabase
      .from('restaurant_promotions')
      .select('restaurant_id, restaurant_name, restaurant_image_url, restaurant_slug, destination_id, region')
      .in('restaurant_id', boostRestaurantIds);
    
    if (!restaurantError && restaurantPromos) {
      restaurantScores = restaurantPromos.reduce((acc, promo) => {
        acc[promo.restaurant_id] = promo;
        return acc;
      }, {});
    }
  }

  // Look up destination names and slugs for all unique destination IDs
  const allDestinationIds = new Set();
  recentBoosts.forEach(boost => {
    if (boost.destination_id) allDestinationIds.add(boost.destination_id);
  });
  restaurants.forEach(restaurant => {
    if (restaurant.destination_id) allDestinationIds.add(restaurant.destination_id);
  });
  tours.forEach(tour => {
    if (tour.destination_id) allDestinationIds.add(tour.destination_id);
  });

  // Fetch destination info from Supabase for all unique IDs
  const destinationLookup = {};
  for (const destId of allDestinationIds) {
    // Only lookup if it's numeric (Viator destination ID)
    if (/^\d+$/.test(destId)) {
      try {
        const destInfo = await getViatorDestinationById(destId);
        if (destInfo) {
          destinationLookup[destId] = {
            name: destInfo.name,
            slug: destInfo.slug || generateSlug(destInfo.name),
          };
        }
      } catch (error) {
        console.warn(`Failed to lookup destination ${destId}:`, error);
      }
    }
  }
  
  // Use ONLY cached metadata from Supabase - no Viator API calls!
  const boostsWithDetails = recentBoosts.map((boost) => {
    // Check if this is a restaurant promotion
    if (boost.restaurant_id) {
      const restaurantData = restaurantScores[boost.restaurant_id];
      const destId = restaurantData?.destination_id || boost.destination_id;
      const destInfo = destId ? destinationLookup[destId] : null;
      
      // Always return restaurantData object, even if metadata is missing
      // This ensures restaurants are displayed in Live Activity
      return {
        ...boost,
        restaurantData: {
          name: restaurantData?.restaurant_name || null,
          image: restaurantData?.restaurant_image_url || null,
          slug: restaurantData?.restaurant_slug || null,
          destination_id: destId,
          destination_slug: destInfo?.slug || destId, // Use name-based slug if available
          destination_name: destInfo?.name || null,
        },
        tourData: null, // Not a tour
      };
    }
    
    // Otherwise, it's a tour promotion
    const promotionData = boostScores[boost.product_id];
    
    // Use cached metadata from tour_promotions table
    const tourData = (promotionData && promotionData.tour_name && promotionData.tour_image_url) ? {
      seo: { 
        title: promotionData.tour_name,
        slug: promotionData.tour_slug || null
      },
      title: promotionData.tour_name,
      slug: promotionData.tour_slug || null,
      images: promotionData.tour_image_url ? [{
        variants: [
          { url: promotionData.tour_image_url },
          { url: promotionData.tour_image_url },
          { url: promotionData.tour_image_url },
          { url: promotionData.tour_image_url }
        ]
      }] : null,
      destinations: promotionData.tour_region ? [{
        destinationName: promotionData.tour_region.replace('_', ' '),
        region: promotionData.tour_region
      }] : null,
    } : null;

    return {
      ...boost,
      tourData: tourData,
      restaurantData: null, // Not a restaurant
    };
  });

  // Format restaurants with details (similar to tours)
  const restaurantsWithDetails = restaurants.map((restaurant) => {
    const destId = restaurant.destination_id;
    const destInfo = destId ? destinationLookup[destId] : null;
    
    return {
      ...restaurant,
      restaurantData: {
        name: restaurant.restaurant_name,
        image: restaurant.restaurant_image_url,
        slug: restaurant.restaurant_slug,
        destination_id: destId,
        destination_slug: destInfo?.slug || destId, // Use name-based slug if available
        destination_name: destInfo?.name || null,
      },
    };
  });

  return (
    <LeaderboardClient 
      initialTours={toursWithDetails} 
      initialRestaurants={restaurantsWithDetails}
      initialBoosts={boostsWithDetails}
      topPromoters={topPromoters}
      scoreType={scoreType} 
      region={region}
      section={section}
    />
  );
}

