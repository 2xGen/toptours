import { destinations } from '@/data/destinationsData';
import { getRestaurantCountsByDestination } from '@/lib/restaurants';
import RestaurantsHubClient from './RestaurantsHubClient';

export async function generateMetadata() {
  return {
    title: 'Best Restaurants by Destination | TopTours.ai',
    description: 'Discover top-rated restaurants in popular travel destinations. Browse restaurants by location and find the perfect dining experience for your trip.',
    alternates: {
      canonical: '/restaurants',
    },
    openGraph: {
      title: 'Best Restaurants by Destination',
      description: 'Find the best restaurants in your favorite travel destinations.',
      images: [
        {
          url: 'https://toptours.ai/OG%20Images/Browse%20through%20more%20then%2050000%20restaurants%20globally.jpg',
          width: 1200,
          height: 675,
          alt: 'Best Restaurants by Destination',
        },
      ],
    },
  };
}

export default async function RestaurantsPage() {
  // Get restaurant counts per destination
  const restaurantCounts = await getRestaurantCountsByDestination();
  
  // Filter destinations that have restaurants
  const destinationsWithRestaurants = destinations
    .filter((dest) => restaurantCounts[dest.id] > 0)
    .map((dest) => ({
      ...dest,
      restaurantCount: restaurantCounts[dest.id] || 0,
    }))
    .sort((a, b) => b.restaurantCount - a.restaurantCount); // Sort by restaurant count

  // Calculate total number of restaurants
  const totalRestaurants = destinationsWithRestaurants.reduce(
    (sum, dest) => sum + (dest.restaurantCount || 0),
    0
  );

  return <RestaurantsHubClient destinations={destinationsWithRestaurants} totalRestaurants={totalRestaurants} />;
}

