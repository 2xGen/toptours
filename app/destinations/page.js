import DestinationsPageClient from './DestinationsPageClient';

// Revalidate every hour for fresh data
export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'Discover 3,300+ Travel Destinations | TopTours.ai',
    description: 'Explore thousands of destinations worldwide with curated tours, activities, and travel guides. Find your next adventure with AI-powered recommendations.',
    keywords: 'travel destinations, world destinations, tour destinations, vacation destinations, travel guides, destination guides',
    alternates: {
      canonical: 'https://toptours.ai/destinations',
    },
    openGraph: {
      title: 'Discover 3,300+ Travel Destinations | TopTours.ai',
      description: 'Explore thousands of destinations worldwide with curated tours, activities, and travel guides.',
      url: 'https://toptours.ai/destinations',
      siteName: 'TopTours.ai',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function DestinationsPage() {
  // Dynamically import large JSON files only on server
  const [
    viatorDestinationsData,
    viatorDestinationsClassifiedData
  ] = await Promise.all([
    import('@/data/viatorDestinations.json').then(m => m.default).catch(() => []),
    import('@/data/viatorDestinationsClassified.json').then(m => m.default).catch(() => [])
  ]);

  const viatorDestinations = Array.isArray(viatorDestinationsData) ? viatorDestinationsData : [];
  const viatorDestinationsClassified = Array.isArray(viatorDestinationsClassifiedData) ? viatorDestinationsClassifiedData : [];
  const totalAvailableDestinations = viatorDestinationsClassified.length;

  return (
    <DestinationsPageClient
      viatorDestinations={viatorDestinations}
      viatorDestinationsClassified={viatorDestinationsClassified}
      totalAvailableDestinations={totalAvailableDestinations}
    />
  );
}
