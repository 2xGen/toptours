import { notFound, redirect } from 'next/navigation';
import RestaurantDetailClient from './RestaurantDetailClient';
import { destinations } from '../../../../../src/data/destinationsData';
import {
  getRestaurantBySlug as getRestaurantBySlugFromDB,
  getRestaurantsForDestination as getRestaurantsForDestinationFromDB,
  formatRestaurantForFrontend,
  findRestaurantByName,
} from '@/lib/restaurants';
import {
  getRestaurantBySlug as getRestaurantBySlugFromStatic,
  getRestaurantsForDestination as getRestaurantsForDestinationFromStatic,
} from '../restaurantsData';
import { getRestaurantPromotionScore, getTrendingToursByDestination, getTrendingRestaurantsByDestination } from '@/lib/promotionSystem';
import { getRestaurantPremiumSubscription } from '@/lib/restaurantPremiumServer';

// Old restaurant slugs with their expected names for fuzzy matching
const OLD_RESTAURANT_REDIRECTS = {
  'aruba': {
    'atardi-beach-restaurant-aruba': 'Atardi Beach Restaurant',
    'passions-on-the-beach-aruba': 'Passions On The Beach',
    'flying-fishbone-aruba': 'Flying Fishbone',
    'zeerovers-aruba': 'Zeerover', // Note: old has 's', new might not
    'giannis-restaurant-aruba': 'Giannis Restaurant', // or Gianni's
    'wacky-wahoos-seafood-aruba': 'Wacky Wahoo\'s Seafood',
  },
  'curacao': {
    'kome-restaurant-curacao': 'Kome Restaurant',
    'brisa-do-mar-curacao': 'Brisa Do Mar',
    'de-visserij-piscadera-curacao': 'De Visserij Piscadera',
    'la-boheme-curacao': 'La Boheme',
    'gouverneur-de-rouville-curacao': 'Gouverneur De Rouville',
    'zanzibar-beach-restaurant-curacao': 'Zanzibar Beach Restaurant',
  },
  'jamaica': {
    'rockhouse-restaurant-negril': 'Rockhouse Restaurant',
    'broken-plate-restaurant-kingston': 'Broken Plate Restaurant',
    'devon-house-bakery-kingston': 'Devon House Bakery',
    'south-avenue-grill-kingston': 'South Avenue Grill',
    'miss-ts-kitchen-ocho-rios': 'Miss T\'s Kitchen',
    'little-ochie-alligator-pond': 'Little Ochie',
  },
  'punta-cana': {
    'playa-blanca-restaurant-punta-cana': 'Playa Blanca Restaurant',
    'sbg-punta-cana': 'SBG',
    'jellyfish-restaurant-punta-cana': 'Jellyfish Restaurant',
    'la-bruja-chupadora-bbq-punta-cana': 'La Bruja Chupadora BBQ',
    'pearl-beach-club-punta-cana': 'Pearl Beach Club',
    'capitan-cook-restaurant-punta-cana': 'Capitan Cook Restaurant',
  },
  'nassau': {
    'the-new-duff-nassau': 'The New Duff',
    'green-parrot-harbour-front-nassau': 'Green Parrot Harbour Front',
    'twin-brothers-nassau': 'Twin Brothers',
    'goldies-conch-house-nassau': 'Goldies Conch House',
    'poop-deck-nassau': 'Poop Deck',
    'acropolis-cafe-bakery-nassau': 'Acropolis Cafe Bakery',
  },
};

export async function generateMetadata({ params }) {
  const { id: destinationId, restaurant: restaurantSlug } = await params;
  const destination = destinations.find((d) => d.id === destinationId);
  
  // Try database first, fallback to static files
  let restaurant = await getRestaurantBySlugFromDB(destinationId, restaurantSlug);
  if (restaurant) {
    restaurant = formatRestaurantForFrontend(restaurant);
  } else {
    restaurant = getRestaurantBySlugFromStatic(destinationId, restaurantSlug);
  }

  if (!destination || !restaurant) {
    return {
      title: 'Restaurant Not Found',
    };
  }

  // Build OpenGraph description with rating if available
  const rating = restaurant.ratings?.googleRating;
  const reviewCount = restaurant.ratings?.reviewCount || 0;
  const ratingText = rating ? `${rating.toFixed(1)}-star rating` : '';
  const reviewText = reviewCount > 0 ? `${reviewCount.toLocaleString()} reviews` : '';
  const ratingInfo = ratingText && reviewText ? ` (${ratingText}, ${reviewText})` : ratingText ? ` (${ratingText})` : reviewText ? ` (${reviewText})` : '';
  
  const metaDescription = restaurant.metaDescription || restaurant.seo?.description ||
    `${restaurant.name} is a top-rated restaurant in ${destination.name}${ratingInfo}. Discover signature dishes, hours, and how to plan the perfect meal in ${destination.name}.`;

  return {
    title: restaurant.seoTitle || restaurant.seo?.title || `${restaurant.name} in ${destination.name}`,
    description: metaDescription,
    keywords: restaurant.seo?.keywords || [
      `${restaurant.name} ${destination.name}`,
      `restaurant in ${destination.name}`,
    ],
    openGraph: {
      title: restaurant.seoTitle || restaurant.seo?.title || `${restaurant.name} in ${destination.name}`,
      description: metaDescription,
      images: [
        {
          url: destination.imageUrl, // Always use destination image for OG (restaurant images temporarily unavailable)
          width: 1200,
          height: 630,
          alt: `${restaurant.name} in ${destination.name}`,
        }
      ],
      type: 'website',
      url: `https://toptours.ai/destinations/${destinationId}/restaurants/${restaurantSlug}`,
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: restaurant.seoTitle || restaurant.seo?.title || `${restaurant.name} in ${destination.name}`,
      description: metaDescription,
      images: [destination.imageUrl], // Always use destination image for Twitter (restaurant images temporarily unavailable)
    },
    alternates: {
      canonical: `https://toptours.ai/destinations/${destinationId}/restaurants/${restaurantSlug}`,
    },
  };
}

export async function generateStaticParams() {
  const params = [];

  for (const destination of destinations) {
    // Try database first, fallback to static files
    let restaurants = await getRestaurantsForDestinationFromDB(destination.id);
    if (restaurants.length === 0) {
      restaurants = getRestaurantsForDestinationFromStatic(destination.id);
    }
    
    restaurants.forEach((restaurant) => {
      const slug = restaurant.slug || (restaurant.id ? `${restaurant.id}-${destination.id}` : null);
      if (slug) {
        params.push({
          id: destination.id,
          restaurant: slug,
        });
      }
    });
  }

  return params;
}

export default async function RestaurantPage({ params }) {
  const { id: destinationId, restaurant: restaurantSlug } = await params;

  const destination = destinations.find((d) => d.id === destinationId);
  
  // Try database first, fallback to static files
  let restaurant = await getRestaurantBySlugFromDB(destinationId, restaurantSlug);
  if (restaurant) {
    restaurant = formatRestaurantForFrontend(restaurant);
  } else {
    restaurant = getRestaurantBySlugFromStatic(destinationId, restaurantSlug);
  }

  // If restaurant not found in database OR static files, check if it's an old restaurant
  if (!restaurant && destination) {
    const oldRestaurants = OLD_RESTAURANT_REDIRECTS[destinationId] || {};
    const expectedName = oldRestaurants[restaurantSlug];
    
    if (expectedName) {
      // Try to find by name matching (fuzzy match)
      const foundByName = await findRestaurantByName(destinationId, expectedName);
      
      if (foundByName && foundByName.slug) {
        // Found by name! Redirect to the correct new slug
        redirect(`/destinations/${destinationId}/restaurants/${foundByName.slug}`);
      } else {
        // Not found by name either - redirect to destination restaurant hub
        redirect(`/destinations/${destinationId}/restaurants`);
      }
    }
  }

  if (!destination || !restaurant) {
    notFound();
  }

  // Get other restaurants
  let otherRestaurants = await getRestaurantsForDestinationFromDB(destinationId);
  if (otherRestaurants.length > 0) {
    otherRestaurants = otherRestaurants
      .map(r => formatRestaurantForFrontend(r))
      .filter((item) => item.slug !== restaurant.slug);
  } else {
    otherRestaurants = getRestaurantsForDestinationFromStatic(destinationId).filter(
      (item) => item.slug !== restaurant.slug,
    );
  }

  // Get initial promotion score
  let initialPromotionScore = null;
  if (restaurant.id) {
    try {
      initialPromotionScore = await getRestaurantPromotionScore(restaurant.id);
    } catch (error) {
      console.error('Error fetching restaurant promotion score:', error);
    }
  }

  // Get trending tours for this destination - limit to 3
  let trendingTours = [];
  try {
    trendingTours = await getTrendingToursByDestination(destinationId, 3);
  } catch (error) {
    console.error('Error fetching trending tours:', error);
  }

  // Get trending restaurants for this destination (excluding current restaurant) - limit to 3
  let trendingRestaurants = [];
  try {
    const allTrending = await getTrendingRestaurantsByDestination(destinationId, 10);
    // Filter out current restaurant and format for frontend
    trendingRestaurants = allTrending
      .filter(tr => tr.restaurant_id !== restaurant.id)
      .slice(0, 3)
      .map(tr => {
        // Find matching restaurant from otherRestaurants or create minimal object
        const matchingRestaurant = otherRestaurants.find(r => r.id === tr.restaurant_id);
        if (matchingRestaurant) {
          return {
            ...tr,
            name: matchingRestaurant.name,
            slug: matchingRestaurant.slug,
            heroImage: matchingRestaurant.heroImage,
            ratings: matchingRestaurant.ratings,
          };
        }
        return {
          ...tr,
          name: tr.restaurant_name || 'Restaurant',
          slug: tr.restaurant_slug || null,
          heroImage: tr.restaurant_image_url || null,
        };
      });
  } catch (error) {
    console.error('Error fetching trending restaurants:', error);
  }

  // Get premium subscription status for this restaurant
  let premiumSubscription = null;
  if (restaurant.id) {
    try {
      premiumSubscription = await getRestaurantPremiumSubscription(restaurant.id, destinationId);
    } catch (error) {
      console.error('Error fetching restaurant premium subscription:', error);
    }
  }

  return (
    <RestaurantDetailClient
      destination={destination}
      restaurant={restaurant}
      otherRestaurants={otherRestaurants}
      initialPromotionScore={initialPromotionScore}
      trendingTours={trendingTours}
      trendingRestaurants={trendingRestaurants}
      premiumSubscription={premiumSubscription}
    />
  );
}
