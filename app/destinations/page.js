import DestinationsPageClient from './DestinationsPageClient';
import viatorDestinationsData from '@/data/viatorDestinations.json';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';

// Revalidate every 24 hours - listing page with mostly static data
export const revalidate = 604800; // 7 days - increased to reduce ISR writes during Google reindexing

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

export default function DestinationsPage() {
  // Use static imports - Next.js will tree-shake and optimize these
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
