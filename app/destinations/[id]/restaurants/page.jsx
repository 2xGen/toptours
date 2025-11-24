import { notFound } from 'next/navigation';
import { destinations } from '../../../../src/data/destinationsData';
import {
  getRestaurantsForDestination as getRestaurantsForDestinationFromDB,
  formatRestaurantForFrontend,
} from '@/lib/restaurants';
import { getRestaurantsForDestination as getRestaurantsForDestinationFromStatic } from './restaurantsData';
import { getTrendingToursByDestination } from '@/lib/promotionSystem';
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

  // Fetch trending tours (past 28 days) for this destination
  const trendingTours = await getTrendingToursByDestination(id, 6);

  // Enhanced ItemList schema
  // Note: ItemList items should only contain basic properties (name, url, position)
  // Restaurant-specific data like ratings should be on the individual restaurant pages, not in the list
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Restaurants in ${destination.fullName}`,
    description: `A curated list of top-rated restaurants in ${destination.fullName}`,
    numberOfItems: restaurants.length,
    itemListElement: restaurants.map((restaurant, index) => {
      const item = {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Restaurant',
          '@id': `https://toptours.ai/destinations/${destination.id}/restaurants/${restaurant.slug}`,
          name: restaurant.name,
          url: `https://toptours.ai/destinations/${destination.id}/restaurants/${restaurant.slug}`,
        },
      };
      
      // Only include aggregateRating if reviewCount is positive (Google requirement)
      const reviewCount = restaurant.ratings?.reviewCount || restaurant.reviewCount || 0;
      const rating = restaurant.ratings?.googleRating;
      
      if (rating && reviewCount > 0) {
        item.item.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: rating,
          reviewCount: reviewCount,
        };
      }
      
      return item;
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
      <RestaurantsListClient destination={destination} restaurants={restaurants} trendingTours={trendingTours} />
    </>
  );
}
