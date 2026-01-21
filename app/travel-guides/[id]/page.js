import { travelGuides } from '@/data/travelGuidesData';
import TravelGuideClient from './TravelGuideClient';

// Revalidate every 24 hours - travel guides are mostly static content
export const revalidate = 604800; // 7 days - increased to reduce ISR writes during Google reindexing

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const guide = travelGuides.find(g => g.id === resolvedParams.id);
  
  if (!guide) {
    return {
      title: 'Travel Guide Not Found | TopTours.ai',
    };
  }

  return {
    title: `${guide.title} | TopTours.ai`,
    description: guide.excerpt,
    keywords: guide.tags.join(', '),
    openGraph: {
      title: guide.title,
      description: guide.excerpt,
      url: `https://toptours.ai/travel-guides/${guide.id}`,
      images: [
        {
          url: guide.image,
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
      type: 'article',
      publishedTime: guide.publishDate,
      authors: [guide.author],
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.excerpt,
      images: [guide.image],
    },
    alternates: {
      canonical: `https://toptours.ai/travel-guides/${guide.id}`,
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

export default async function TravelGuidePage({ params }) {
  const resolvedParams = await params;
  return <TravelGuideClient slug={resolvedParams.id} />;
}
