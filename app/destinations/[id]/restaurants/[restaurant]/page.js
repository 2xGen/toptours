import { notFound } from 'next/navigation';
import RestaurantDetailClient from './RestaurantDetailClient';
import { destinations } from '../../../../../src/data/destinationsData';
import {
  getRestaurantBySlug,
  getRestaurantsForDestination,
} from '../restaurantsData';

export async function generateMetadata({ params }) {
  const { id: destinationId, restaurant: restaurantSlug } = await params;
  const destination = destinations.find((d) => d.id === destinationId);
  const restaurant = getRestaurantBySlug(destinationId, restaurantSlug);

  if (!destination || !restaurant) {
    return {
      title: 'Restaurant Not Found',
    };
  }

  return {
    title: restaurant.seo?.title || `${restaurant.name} in ${destination.name}`,
    description:
      restaurant.seo?.description ||
      `${restaurant.name} is a top-rated restaurant in ${destination.name}. Discover signature dishes, hours, and how to plan the perfect meal in ${destination.name}.`,
    keywords: restaurant.seo?.keywords || [
      `${restaurant.name} ${destination.name}`,
      `restaurant in ${destination.name}`,
    ],
    openGraph: {
      title: restaurant.seo?.title || restaurant.name,
      description:
        restaurant.seo?.description ||
        `${restaurant.name} is a highly rated restaurant in ${destination.name}.`,
      images: [restaurant.heroImage || destination.imageUrl],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: restaurant.seo?.title || restaurant.name,
      description:
        restaurant.seo?.description ||
        `${restaurant.name} is a highly rated restaurant in ${destination.name}.`,
      images: [restaurant.heroImage || destination.imageUrl],
    },
    alternates: {
      canonical: `/destinations/${destinationId}/restaurants/${restaurantSlug}`,
    },
  };
}

export async function generateStaticParams() {
  const params = [];

  destinations.forEach((destination) => {
    const restaurants = getRestaurantsForDestination(destination.id);
    restaurants.forEach((restaurant) => {
      params.push({
        id: destination.id,
        restaurant: restaurant.slug,
      });
    });
  });

  return params;
}

export default async function RestaurantPage({ params }) {
  const { id: destinationId, restaurant: restaurantSlug } = await params;

  const destination = destinations.find((d) => d.id === destinationId);
  const restaurant = getRestaurantBySlug(destinationId, restaurantSlug);

  if (!destination || !restaurant) {
    notFound();
  }

  const otherRestaurants = getRestaurantsForDestination(destinationId).filter(
    (item) => item.slug !== restaurant.slug,
  );

  return (
    <RestaurantDetailClient
      destination={destination}
      restaurant={restaurant}
      otherRestaurants={otherRestaurants}
    />
  );
}
