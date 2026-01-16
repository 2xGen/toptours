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
import { getRestaurantPromotionScore } from '@/lib/promotionSystem';
import { getRestaurantPremiumSubscription } from '@/lib/restaurantPremiumServer';
import { getAllCategoryGuidesForDestination } from '../../lib/categoryGuides';

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

// Revalidate every hour for fresh data
export const revalidate = 3600;

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

  // Always use standardized OG image so dimensions are correct
  const ogImage = 'https://toptours.ai/OG%20Images/The%20best%20restaurants%20globally.jpg';

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
          url: ogImage,
          width: 1200,
          height: 675,
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
      images: [ogImage],
    },
    alternates: {
      canonical: `https://toptours.ai/destinations/${destinationId}/restaurants/${restaurantSlug}`,
    },
    robots: {
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

  // Parallelize independent data fetching operations
  const restaurantId = restaurant.id;
  const isNumericId = restaurantId && /^\d+$/.test(String(restaurantId));

  const [
    otherRestaurantsResult,
    initialPromotionScoreResult,
    premiumSubscriptionResult,
    categoryGuidesResult
  ] = await Promise.allSettled([
    // Other restaurants (database first, fallback to static)
    getRestaurantsForDestinationFromDB(destinationId)
      .then(restaurants => {
        if (restaurants.length > 0) {
          return restaurants
            .map(r => formatRestaurantForFrontend(r))
            .filter((item) => item.slug !== restaurant.slug);
        } else {
          return getRestaurantsForDestinationFromStatic(destinationId).filter(
            (item) => item.slug !== restaurant.slug,
          );
        }
      })
      .catch(() => getRestaurantsForDestinationFromStatic(destinationId).filter(
        (item) => item.slug !== restaurant.slug,
      )),
    
    // Initial promotion score (only if numeric ID)
    isNumericId 
      ? getRestaurantPromotionScore(Number(restaurantId)).catch(() => null)
      : Promise.resolve(null),
    
    // Premium subscription (only if numeric ID)
    isNumericId 
      ? getRestaurantPremiumSubscription(Number(restaurantId), destinationId).catch(() => null)
      : Promise.resolve(null),
    
    // Category guides
    getAllCategoryGuidesForDestination(destinationId).catch(() => [])
  ]);

  // Extract results
  const otherRestaurants = otherRestaurantsResult.status === 'fulfilled' ? otherRestaurantsResult.value : [];
  const initialPromotionScore = initialPromotionScoreResult.status === 'fulfilled' ? initialPromotionScoreResult.value : null;
  const premiumSubscription = premiumSubscriptionResult.status === 'fulfilled' ? premiumSubscriptionResult.value : null;
  const categoryGuides = categoryGuidesResult.status === 'fulfilled' ? categoryGuidesResult.value : [];

  // Generate breadcrumb schema for SEO
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://toptours.ai"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Destinations",
        "item": "https://toptours.ai/destinations"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": destination.fullName || destination.name,
        "item": `https://toptours.ai/destinations/${destination.id}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Restaurants",
        "item": `https://toptours.ai/destinations/${destination.id}/restaurants`
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": restaurant.name || restaurant.title || 'Restaurant',
        "item": `https://toptours.ai/destinations/${destination.id}/restaurants/${restaurant.slug}`
      }
    ]
  };

  return (
    <>
      {/* BreadcrumbList Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <RestaurantDetailClient
        destination={destination}
        restaurant={restaurant}
        otherRestaurants={otherRestaurants}
        initialPromotionScore={initialPromotionScore}
        premiumSubscription={premiumSubscription}
        categoryGuides={categoryGuides}
      />
    </>
  );
}
