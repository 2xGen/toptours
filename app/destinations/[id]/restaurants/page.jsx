import { notFound } from 'next/navigation';
import { destinations } from '../../../../src/data/destinationsData';
import {
  getRestaurantsForDestination as getRestaurantsForDestinationFromDB,
  formatRestaurantForFrontend,
} from '@/lib/restaurants';
import { getRestaurantsForDestination as getRestaurantsForDestinationFromStatic } from './restaurantsData';
import { getTrendingToursByDestination, getRestaurantPromotionScoresByDestination, getTrendingRestaurantsByDestination } from '@/lib/promotionSystem';
import { getPremiumRestaurantIds } from '@/lib/restaurantPremiumServer';
import { getAllCategoryGuidesForDestination } from '../lib/categoryGuides';
import RestaurantsListClient from './RestaurantsListClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const destination = destinations.find((d) => d.id === id);

  if (!destination) {
    return {
      title: 'Best Restaurants | TopTours.ai',
    };
  }

  // Get restaurant count for better description
  let restaurants = await getRestaurantsForDestinationFromDB(id);
  if (restaurants.length > 0) {
    restaurants = restaurants.map(r => formatRestaurantForFrontend(r));
  } else {
    restaurants = getRestaurantsForDestinationFromStatic(id);
  }
  const restaurantCount = restaurants?.length || 0;

  const ogImage = destination.imageUrl || 'https://toptours.ai/favicon.ico';
  const description = `Discover ${restaurantCount > 0 ? `${restaurantCount} top-rated` : 'the best'} restaurants in ${destination.fullName}, from waterfront seafood to family-run cafés. Reserve a table, explore menus, and plan where to eat before your next trip.`;

  return {
    title: `Best Restaurants in ${destination.fullName} | TopTours.ai`,
    description,
    keywords: `restaurants ${destination.fullName}, dining ${destination.name}, best restaurants ${destination.fullName}, where to eat ${destination.fullName}, ${destination.fullName} restaurants`,
    alternates: {
      canonical: `https://toptours.ai/destinations/${destination.id}/restaurants`,
    },
    openGraph: {
      title: `Best Restaurants in ${destination.fullName}`,
      description,
      url: `https://toptours.ai/destinations/${destination.id}/restaurants`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Best Restaurants in ${destination.fullName}`,
        },
      ],
      type: 'website',
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best Restaurants in ${destination.fullName}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function RestaurantsIndexPage({ params }) {
  const { id } = await params;
  const destination = destinations.find((d) => d.id === id);

  if (!destination) {
    notFound();
  }

  // Try database first, fallback to static files
  let restaurants = await getRestaurantsForDestinationFromDB(id);
  if (restaurants.length > 0) {
    restaurants = restaurants.map(r => formatRestaurantForFrontend(r));
  } else {
    restaurants = getRestaurantsForDestinationFromStatic(id);
  }

  if (!restaurants || restaurants.length === 0) {
    notFound();
  }

  // Fetch trending tours (past 28 days) for this destination - limit to 3
  const trendingTours = await getTrendingToursByDestination(id, 3);

  // Fetch trending restaurants (past 28 days) for this destination - limit to 3
  const trendingRestaurants = await getTrendingRestaurantsByDestination(id, 3);

  // Fetch restaurant promotion scores for this destination
  const restaurantPromotionScores = await getRestaurantPromotionScoresByDestination(id);

  // Fetch premium restaurant IDs for this destination (batch query - efficient!)
  let premiumRestaurantIds = [];
  try {
    const premiumSet = await getPremiumRestaurantIds(id);
    premiumRestaurantIds = Array.from(premiumSet);
  } catch (error) {
    console.error('Error fetching premium restaurant IDs:', error);
  }

  // Fetch category guides for this destination
  let categoryGuides = [];
  try {
    categoryGuides = await getAllCategoryGuidesForDestination(id);
  } catch (error) {
    console.error('Error fetching category guides:', error);
  }

  // ItemList schema for restaurant listing page
  // Keep it simple - just list the restaurants. Detailed ratings/reviews belong on individual restaurant pages
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Restaurants in ${destination.fullName}`,
    description: `A curated list of top-rated restaurants in ${destination.fullName}`,
    numberOfItems: restaurants.length,
    itemListElement: restaurants.map((restaurant, index) => {
      // Build address object from available data
      let address = null;
      
      // Try to get address from schema data first (most complete)
      if (restaurant.schema?.address) {
        address = restaurant.schema.address;
      } 
      // Try to get from addressComponents (parsed from database)
      else if (restaurant.addressComponents) {
        address = {
          '@type': 'PostalAddress',
          ...(restaurant.addressComponents.street_number && restaurant.addressComponents.route && {
            streetAddress: `${restaurant.addressComponents.street_number} ${restaurant.addressComponents.route}`.trim(),
          }),
          ...(restaurant.addressComponents.locality && {
            addressLocality: restaurant.addressComponents.locality,
          }),
          ...(restaurant.addressComponents.administrative_area_level_1 && {
            addressRegion: restaurant.addressComponents.administrative_area_level_1,
          }),
          ...(restaurant.addressComponents.postal_code && {
            postalCode: restaurant.addressComponents.postal_code,
          }),
          ...(restaurant.addressComponents.country && {
            addressCountry: restaurant.addressComponents.country,
          }),
        };
        
        // Remove empty fields
        Object.keys(address).forEach(key => {
          if (address[key] === undefined || address[key] === null || address[key] === '') {
            delete address[key];
          }
        });
        
        // If no valid fields, set to null
        if (Object.keys(address).length <= 1) { // Only @type remains
          address = null;
        }
      }
      // Fallback to contact.address string - parse it if possible
      else if (restaurant.contact?.address) {
        const addressString = restaurant.contact.address;
        // Try to extract city and country from destination
        address = {
          '@type': 'PostalAddress',
          streetAddress: addressString,
          ...(destination.name && {
            addressLocality: destination.name,
          }),
          ...(destination.country && {
            addressCountry: destination.country,
          }),
        };
      }
      // Last resort: use destination location
      else {
        address = {
          '@type': 'PostalAddress',
          addressLocality: destination.name || destination.fullName,
          ...(destination.country && {
            addressCountry: destination.country,
          }),
        };
      }
      
      const restaurantItem = {
        '@type': 'Restaurant',
        '@id': `https://toptours.ai/destinations/${destination.id}/restaurants/${restaurant.slug}`,
        name: restaurant.name,
        url: `https://toptours.ai/destinations/${destination.id}/restaurants/${restaurant.slug}`,
      };
      
      // Only add address if we have valid address data
      if (address && Object.keys(address).length > 1) {
        restaurantItem.address = address;
      }
      
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: restaurantItem,
      };
    }),
  };

  // Breadcrumb schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://toptours.ai/',
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
        item: `https://toptours.ai/destinations/${destination.id}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `Best Restaurants in ${destination.fullName}`,
        item: `https://toptours.ai/destinations/${destination.id}/restaurants`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RestaurantsListClient destination={destination} restaurants={restaurants} trendingTours={trendingTours} trendingRestaurants={trendingRestaurants} restaurantPromotionScores={restaurantPromotionScores} premiumRestaurantIds={premiumRestaurantIds} categoryGuides={categoryGuides} />
    </>
  );
}
