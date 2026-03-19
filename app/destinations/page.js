import { Suspense } from 'react';
import DestinationsPageClient from './DestinationsPageClient';
import { absoluteUrl } from '@/lib/siteUrl';

// Revalidate every 24 hours - listing page with mostly static data
export const revalidate = 604800; // 7 days - increased to reduce ISR writes during Google reindexing

export async function generateMetadata() {
  const pageUrl = absoluteUrl('/destinations');
  const ogImage = absoluteUrl('/OG%20Images/discover%20tours%20guides%20and%20restaurants%20in%20over%203500%20destinations.jpg');
  return {
    title: 'Best Travel Destinations 2026: 3,500+ Cities · Find Tours & Activities',
    description: 'Discover 3,500+ top-rated travel destinations worldwide. Book tours, find restaurants, and read travel guides. AI-powered recommendations help you find your perfect adventure. Instant booking, free cancellation.',
    keywords: 'best travel destinations, popular destinations, top destinations, where to travel, best places to visit, travel destinations 2026, world destinations, tour destinations, vacation destinations, travel guides, destination guides, AI travel recommendations',
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: 'Best Travel Destinations 2026: 3,500+ Cities Worldwide',
      description: 'Discover 3,500+ top-rated travel destinations worldwide. Book tours, find restaurants, and read travel guides.',
      url: pageUrl,
      siteName: 'TopTours.ai',
      type: 'website',
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Discover 3,500+ Travel Destinations Worldwide'
      }],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Best Travel Destinations 2026: 3,500+ Cities Worldwide',
      description: 'Discover 3,500+ top-rated travel destinations worldwide.',
      images: [ogImage],
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

export default async function DestinationsPage() {
  const [viatorDestinationsData, viatorDestinationsClassifiedData] = await Promise.all([
    import('@/data/viatorDestinations.json').then(m => m.default),
    import('@/data/viatorDestinationsClassified.json').then(m => m.default),
  ]);
  const viatorDestinations = Array.isArray(viatorDestinationsData) ? viatorDestinationsData : [];
  const viatorDestinationsClassified = Array.isArray(viatorDestinationsClassifiedData) ? viatorDestinationsClassifiedData : [];
  const totalAvailableDestinations = viatorDestinationsClassified.length;

  return (
    <Suspense fallback={null}>
      <DestinationsPageClient
        viatorDestinations={viatorDestinations}
        viatorDestinationsClassified={viatorDestinationsClassified}
        totalAvailableDestinations={totalAvailableDestinations}
      />
    </Suspense>
  );
}
