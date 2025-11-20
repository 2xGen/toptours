import { getDestinationById } from '@/data/destinationsData';
import DestinationDetailClient from './DestinationDetailClient';
import { getPromotionScoresByDestination, getTrendingToursByDestination, getHardcodedToursByDestination } from '@/lib/promotionSystem';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  const destination = getDestinationById(id);
  
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
      siteName: 'TopTours.ai',
      locale: 'en_US',
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

export default async function DestinationDetailPage({ params }) {
  const { id } = await params;
  const destination = getDestinationById(id);
  
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

  // Fetch promotion scores for this destination
  const promotionScores = await getPromotionScoresByDestination(destination.id);

  // Fetch trending tours (past 28 days) for this destination
  const trendingTours = await getTrendingToursByDestination(destination.id, 6);

  // Fetch hardcoded tours by category (lightweight - no API calls)
  const hardcodedTours = await getHardcodedToursByDestination(destination.id);

  // Merge hardcoded tour scores into promotionScores
  if (hardcodedTours && Object.keys(hardcodedTours).length > 0) {
    Object.values(hardcodedTours).forEach(categoryTours => {
      categoryTours.forEach(tour => {
        if (tour.productId && !promotionScores[tour.productId]) {
          promotionScores[tour.productId] = {
            product_id: tour.productId,
            total_score: tour.totalScore || 0,
            monthly_score: 0,
            weekly_score: 0,
            past_28_days_score: tour.lastMonthScore || 0,
          };
        }
      });
    });
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
      
      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://toptours.ai"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Destinations",
                "item": "https://toptours.ai/destinations"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": destination.fullName,
                "item": `https://toptours.ai/destinations/${destination.id}`
              }
            ]
          })
        }}
      />
      
      {/* Tour List Schema - Organized by Category */}
      {hardcodedTours && Object.keys(hardcodedTours).length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": `${destination.fullName} Tours & Activities`,
              "description": `Popular tours and activities in ${destination.fullName}`,
              "itemListElement": (() => {
                const items = [];
                let position = 1;
                Object.keys(hardcodedTours).forEach(categoryName => {
                  hardcodedTours[categoryName].forEach(tour => {
                    if (tour.productId && tour.title) {
                      items.push({
                        "@type": "ListItem",
                        "position": position++,
                        "item": {
                          "@type": "TouristAttraction",
                          "name": tour.title,
                          "description": `${tour.title} in ${destination.fullName}`,
                          "image": tour.image || destination.imageUrl,
                          "url": `https://toptours.ai/tours/${tour.productId}/${tour.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                        }
                      });
                    }
                  });
                });
                return items;
              })()
            })
          }}
        />
      )}
      
      <DestinationDetailClient 
        destination={destination} 
        promotionScores={promotionScores}
        trendingTours={trendingTours}
        hardcodedTours={hardcodedTours}
      />
    </>
  );
}
