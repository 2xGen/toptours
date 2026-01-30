import { resolveDestinationById } from '@/lib/destinationResolver';
import { getRestaurantCountsByDestination } from '@/lib/restaurants';
import RestaurantsPageClient from './RestaurantsPageClient';

export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai';
  
  return {
    title: 'Best Restaurants by Destination | TopTours.ai',
    description: 'Discover top-rated restaurants in popular travel destinations. Browse restaurants by location and find the perfect dining experience for your trip.',
    alternates: {
      canonical: `${baseUrl}/restaurants`,
    },
    openGraph: {
      title: 'Best Restaurants by Destination',
      description: 'Find the best restaurants in your favorite travel destinations.',
      url: `${baseUrl}/restaurants`,
      siteName: 'TopTours.ai',
      images: [
        {
          url: 'https://toptours.ai/OG%20Images/Browse%20through%20more%20then%2050000%20restaurants%20globally.jpg',
          width: 1200,
          height: 630,
          alt: 'Best Restaurants by Destination',
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Best Restaurants by Destination',
      description: 'Find the best restaurants in your favorite travel destinations.',
      images: ['https://toptours.ai/OG%20Images/Browse%20through%20more%20then%2050000%20restaurants%20globally.jpg'],
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

export default async function RestaurantsPage() {
  // Get restaurant counts per destination (includes curated + generated destinations with DB data)
  const restaurantCounts = await getRestaurantCountsByDestination();

  // Build list from all destination ids that have restaurants; resolve display info from curated or fullContent
  const destinationsWithRestaurants = Object.entries(restaurantCounts)
    .filter(([, count]) => count > 0)
    .map(([destId, count]) => {
      const dest = resolveDestinationById(destId);
      return dest ? { ...dest, restaurantCount: count } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (b.restaurantCount || 0) - (a.restaurantCount || 0));

  const totalRestaurants = destinationsWithRestaurants.reduce(
    (sum, dest) => sum + (dest.restaurantCount || 0),
    0
  );

  return <RestaurantsPageClient destinations={destinationsWithRestaurants} totalRestaurants={totalRestaurants} />;
}

