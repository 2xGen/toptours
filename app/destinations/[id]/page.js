import { getDestinationById, destinations } from '@/data/destinationsData';
import DestinationDetailClient from './DestinationDetailClient';

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const destination = getDestinationById(params.id);
  
  if (!destination) {
    return {
      title: 'Destination Not Found | TopTours.ai',
    };
  }

  return {
    title: `${destination.fullName} Tours & Activities | TopTours.ai`,
    description: destination.seo?.description || destination.heroDescription,
    keywords: `${destination.fullName} tours, ${destination.fullName} activities, ${destination.fullName} experiences, things to do in ${destination.fullName}`,
    openGraph: {
      title: `${destination.fullName} Tours & Activities`,
      description: destination.seo?.description || destination.heroDescription,
      url: `https://toptours.ai/destinations/${destination.id}`,
      images: [
        {
          url: destination.imageUrl,
          width: 1200,
          height: 630,
          alt: destination.fullName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${destination.fullName} Tours & Activities`,
      description: destination.seo?.description || destination.heroDescription,
      images: [destination.imageUrl],
    },
    alternates: {
      canonical: `https://toptours.ai/destinations/${destination.id}`,
    },
  };
}

// Generate static pages for all destinations at build time
export async function generateStaticParams() {
  return destinations.map((destination) => ({
    id: destination.id,
  }));
}

export default function DestinationDetailPage({ params }) {
  const destination = getDestinationById(params.id);
  
  if (!destination) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Destination Not Found</h1>
          <p className="text-white/80 mb-6">Sorry, we couldn't find that destination.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* TouristDestination Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            "name": destination.fullName,
            "description": destination.seo?.description || destination.heroDescription,
            "image": destination.imageUrl,
            "url": `https://toptours.ai/destinations/${destination.id}`,
            "touristType": "Leisure travelers, Adventure seekers, Culture enthusiasts"
          })
        }}
      />
      
      {/* Article Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": `${destination.fullName} Tours & Activities Guide`,
            "description": destination.seo?.description || destination.heroDescription,
            "image": destination.imageUrl,
            "datePublished": "2025-10-07",
            "dateModified": "2025-10-07",
            "author": {
              "@type": "Organization",
              "name": "TopTours.ai"
            },
            "publisher": {
              "@type": "Organization",
              "name": "TopTours.ai",
              "logo": {
                "@type": "ImageObject",
                "url": "https://toptours.ai/logo.png"
              }
            }
          })
        }}
      />
      
      <DestinationDetailClient destination={destination} />
    </>
  );
}
