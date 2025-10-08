import { travelGuides } from '@/data/travelGuidesData';
import TravelGuideClient from './TravelGuideClient';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const guide = travelGuides.find(g => g.id === params.id);
  
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
  };
}

export default function TravelGuidePage({ params }) {
  return <TravelGuideClient slug={params.id} />;
}
