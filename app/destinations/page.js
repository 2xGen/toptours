import { Suspense } from 'react';
import DestinationsPageClient from './DestinationsPageClient';
import { absoluteUrl } from '@/lib/siteUrl';
import { getFeaturedDestinationsForListing, getFeaturedDestinationIds } from '@/lib/featuredDestinations';

export const revalidate = 604800;

export async function generateMetadata() {
  const featuredCount = getFeaturedDestinationIds().length;
  const pageUrl = absoluteUrl('/destinations');
  const ogImage = absoluteUrl('/OG%20Images/TopTours%20Destinations.jpg');
  return {
    title: `Best Travel Destinations 2026: ${featuredCount} Curated Cities · Tours & Guides`,
    description: `Explore ${featuredCount} hand-picked travel destinations worldwide. Book tours, find restaurants, and read travel guides. AI-powered recommendations for your perfect trip.`,
    keywords: 'best travel destinations, popular destinations, top destinations, where to travel, best places to visit, travel destinations 2026, tour destinations, vacation destinations, travel guides, destination guides',
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `Best Travel Destinations 2026: ${featuredCount} Curated Cities`,
      description: `Explore ${featuredCount} hand-picked travel destinations with tours, guides, and restaurants.`,
      url: pageUrl,
      siteName: 'TopTours.ai',
      type: 'website',
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'TopTours.ai Curated Travel Destinations',
      }],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best Travel Destinations 2026: ${featuredCount} Curated Cities`,
      description: `Explore ${featuredCount} hand-picked travel destinations worldwide.`,
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
  const featuredDestinations = getFeaturedDestinationsForListing();

  return (
    <Suspense fallback={null}>
      <DestinationsPageClient featuredDestinations={featuredDestinations} />
    </Suspense>
  );
}
