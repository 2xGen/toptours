import { Suspense } from 'react';
import DestinationsPageClient from './DestinationsPageClient';
import { absoluteUrl } from '@/lib/siteUrl';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';

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
  const [viatorDestinationsClassifiedData, generatedFullContentData] = await Promise.all([
    import('@/data/viatorDestinationsClassified.json').then(m => m.default),
    import('../../generated-destination-full-content.json').then(m => m.default),
  ]);
  const rawClassified = Array.isArray(viatorDestinationsClassifiedData) ? viatorDestinationsClassifiedData : [];
  const generatedContent = generatedFullContentData && typeof generatedFullContentData === 'object' ? generatedFullContentData : {};

  // Send only fields actually used by DestinationsPageClient.
  const viatorDestinationsClassified = rawClassified
    .filter((dest) => {
      const type = (dest?.type || '').toUpperCase();
      return !type || type === 'CITY' || type === 'COUNTRY' || type === 'REGION';
    })
    .map((dest) => ({
      destinationId: dest.destinationId || dest.id || null,
      id: dest.id || dest.destinationId || null,
      destinationName: dest.destinationName || dest.name || '',
      name: dest.name || dest.destinationName || '',
      region: dest.region || null,
      country: dest.country || null,
      type: dest.type || null,
    }));

  // Build a compact featured list server-side so client doesn't import the huge generated JSON.
  const generatedDestinationsWithGuides = Object.entries(generatedContent)
    .filter(([slug, content]) => {
      const hasGuides = Array.isArray(content?.tourCategories)
        && content.tourCategories.some((cat) => typeof cat === 'object' && cat?.hasGuide === true);
      if (!hasGuides) return false;
      const seoContent = getDestinationSeoContent(slug);
      const hasImage = Boolean(content?.imageUrl || seoContent?.imageUrl || seoContent?.ogImage);
      return hasImage;
    })
    .map(([slug, content]) => {
      const seoContent = getDestinationSeoContent(slug);
      return {
        id: slug,
        destinationName: content?.destinationName || slug,
        region: content?.region || null,
        country: content?.country || null,
        briefDescription:
          seoContent?.briefDescription ||
          content?.briefDescription ||
          `Discover tours and activities in ${content?.destinationName || slug}`,
        heroDescription: seoContent?.heroDescription || content?.heroDescription || null,
        imageUrl: content?.imageUrl || seoContent?.imageUrl || seoContent?.ogImage || null,
        tourCategories: Array.isArray(content?.tourCategories) ? content.tourCategories : [],
        whyVisit: Array.isArray(content?.whyVisit) ? content.whyVisit : [],
        highlights: Array.isArray(content?.highlights) ? content.highlights : [],
        gettingAround: content?.gettingAround || '',
        bestTimeToVisit: content?.bestTimeToVisit || null,
        seo: content?.seo || seoContent?.seo || null,
      };
    });

  const totalAvailableDestinations = viatorDestinationsClassified.length;

  return (
    <Suspense fallback={null}>
      <DestinationsPageClient
        viatorDestinationsClassified={viatorDestinationsClassified}
        generatedDestinationsWithGuides={generatedDestinationsWithGuides}
        totalAvailableDestinations={totalAvailableDestinations}
      />
    </Suspense>
  );
}
