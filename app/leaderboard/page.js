import { getLeaderboardTours, getLeaderboardRestaurants, getRecentBoosts, updateTourMetadata, getTourPromotionScoresBatch, getTopPromoters } from '@/lib/promotionSystem';
import { getCachedTour, cacheTour } from '@/lib/viatorCache';
import LeaderboardClient from './LeaderboardClient';

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
  const boostProductIds = recentBoosts.map(b => b.product_id).filter(Boolean);
  const boostScores = await getTourPromotionScoresBatch(boostProductIds);
  
  // Use ONLY cached metadata from Supabase - no Viator API calls!
  const boostsWithDetails = recentBoosts.map((boost) => {
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
    };
  });

  // Format restaurants with details (similar to tours)
  const restaurantsWithDetails = restaurants.map((restaurant) => {
    return {
      ...restaurant,
      restaurantData: {
        name: restaurant.restaurant_name,
        image: restaurant.restaurant_image_url,
        slug: restaurant.restaurant_slug,
        destination_id: restaurant.destination_id,
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

