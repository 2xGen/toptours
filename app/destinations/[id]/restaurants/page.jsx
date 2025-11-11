import { notFound } from 'next/navigation';
import { destinations } from '../../../../src/data/destinationsData';
import { getRestaurantsForDestination } from './restaurantsData';
import RestaurantsListClient from './RestaurantsListClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const destination = destinations.find((d) => d.id === id);

  if (!destination) {
    return {
      title: 'Best Restaurants | TopTours.ai',
    };
  }

  return {
    title: `Best Restaurants in ${destination.fullName} | TopTours.ai`,
    description: `Discover the top restaurants in ${destination.fullName}, from waterfront seafood to family-run cafés. Plan where to eat before your next trip to ${destination.fullName}.`,
    alternates: {
      canonical: `/destinations/${destination.id}/restaurants`,
    },
    openGraph: {
      title: `Top Restaurants in ${destination.fullName}`,
      description: `Where to eat in ${destination.fullName}: hand-picked restaurants, menus, and insider tips.`,
      images: [destination.imageUrl],
    },
  };
}

export default async function RestaurantsIndexPage({ params }) {
  const { id } = await params;
  const destination = destinations.find((d) => d.id === id);

  if (!destination) {
    notFound();
  }

  const restaurants = getRestaurantsForDestination(id);

  if (!restaurants || restaurants.length === 0) {
    notFound();
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: restaurants.map((restaurant, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://toptours.ai/destinations/${destination.id}/restaurants/${restaurant.slug}`,
      name: restaurant.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <RestaurantsListClient destination={destination} restaurants={restaurants} />
    </>
  );
}
