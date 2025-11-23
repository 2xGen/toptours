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
          url: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/restaurants%20page.png',
          width: 1200,
          height: 630,
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

