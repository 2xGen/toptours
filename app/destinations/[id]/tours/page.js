import { notFound } from 'next/navigation';
import { getDestinationById } from '@/data/destinationsData';
import { getPopularToursForDestination } from '@/data/popularTours';
import ToursListingClient from './ToursListingClient';
import { slugToViatorId } from '@/data/viatorDestinationMap';
import { getPromotionScoresByDestination, getTrendingToursByDestination } from '@/lib/promotionSystem';

// Force dynamic rendering for API calls
export const dynamic = 'force-dynamic';

/**
 * Generate metadata for SEO
 */
const buildSeoCopy = (destination) => {
  const destinationName = destination.fullName || destination.name;
  const categoryNames = (destination.tourCategories || [])
    .map((category) => category?.name)
    .filter(Boolean);
  const topCategories = categoryNames.slice(0, 4);

  const description =
    destination.seo?.description ||
    [
      destination.briefDescription,
      topCategories.length
        ? `Top experiences include ${topCategories.join(', ')} and more local-only adventures.`
        : '',
      `Browse trusted operators, filter by style, and secure instant confirmations for your ${destinationName} plans.`,
    ]
      .filter(Boolean)
      .join(' ');

  const keywordSet = new Set([
    `${destinationName} tours`,
    `${destinationName} activities`,
    `Top things to do in ${destinationName}`,
    `${destinationName} excursions`,
  ]);
  topCategories.forEach((category) => {
    keywordSet.add(`${destinationName} ${category.toLowerCase()} tours`);
  });

  return {
    title: `Top Tours & Activities in ${destinationName}`,
    description: description || `Discover curated tours and activities in ${destinationName}.`,
    keywords: Array.from(keywordSet).join(', '),
  };
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const destination = getDestinationById(id);
  
  if (!destination) {
    return {
      title: 'Tours Not Found | TopTours.ai',
    };
  }

  const destinationName = destination.fullName || destination.name;
  const seoCopy = buildSeoCopy(destination);
  
  return {
    title: `${seoCopy.title} | TopTours.ai`,
    description: seoCopy.description,
    keywords: seoCopy.keywords,
    openGraph: {
      title: seoCopy.title,
      description: seoCopy.description,
      url: `https://toptours.ai/destinations/${id}/tours`,
      images: [
        {
          url: destination.imageUrl,
          width: 1200,
          height: 630,
          alt: `${destinationName} Tours`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoCopy.title,
      description: seoCopy.description,
      images: [destination.imageUrl],
    },
    alternates: {
      canonical: `https://toptours.ai/destinations/${id}/tours`,
    },
  };
}

/**
 * Tours listing page for a destination
 */
export default async function ToursListingPage({ params }) {
  const { id } = await params;
  const destination = getDestinationById(id);
  
  if (!destination) {
    notFound();
  }

  // Get hardcoded popular tours for this destination
  const popularTours = getPopularToursForDestination(id);
  
  // Get Viator destination ID
  const viatorDestinationId = slugToViatorId[id] || null;

  // Fetch dynamic tours from Viator API using freetext search
  let dynamicTours = [];
  let totalToursAvailable = 0; // Total tours available from Viator
  try {
    const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
    const destinationName = destination.fullName || destination.name;
    
    // Use freetext search with destination name
    // IMPORTANT: We only make 3 API calls (3 pages × 20 tours = 60 tours max)
    // The total count (e.g., 1,980) comes from Viator's response metadata, NOT from making 1,980 API calls
    const toursPerPage = 20;
    const pagesNeeded = 3; // 3 pages = 60 tours, we'll take 51
    
    const allToursPromises = [];
    for (let page = 1; page <= pagesNeeded; page++) {
      const start = (page - 1) * toursPerPage + 1;
      allToursPromises.push(
        fetch('https://api.viator.com/partner/search/freetext', {
          method: 'POST',
          headers: {
            'exp-api-key': apiKey,
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en-US',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            searchTerm: destinationName.trim(),
            searchTypes: [{
              searchType: 'PRODUCTS',
              pagination: {
                start: start,
                count: toursPerPage
              }
            }],
            currency: 'USD'
          }),
          next: { revalidate: 3600 } // Cache for 1 hour
        }).then(async (res) => {
          if (res.ok) {
            return res.json();
          } else {
            const errorText = await res.text();
            console.error(`Page ${page} error:`, res.status, errorText);
            return null;
          }
        })
      );
    }
    
    const allResponses = await Promise.all(allToursPromises);
    const allTours = [];
    const seenTourIds = new Set(); // Track seen tours to avoid duplicates
    
    for (let i = 0; i < allResponses.length; i++) {
      const data = allResponses[i];
      if (data && !data.error) {
        // Get total count from first response - this is metadata from Viator, not from fetching all tours
        // Viator tells us "there are 1,980 total tours" in the response, we don't fetch them all
        if (i === 0 && data.products?.totalCount) {
          totalToursAvailable = data.products.totalCount;
        }
        
        const tours = data.products?.results || [];
        for (const tour of tours) {
          const tourId = tour.productId || tour.productCode;
          if (tourId && !seenTourIds.has(tourId)) {
            seenTourIds.add(tourId);
            allTours.push(tour);
          }
        }
      }
    }
    
    // Filter out tours that are already in popularTours
    const popularProductIds = new Set(popularTours.map(t => t.productId));
    dynamicTours = allTours.filter(tour => {
      const tourId = tour.productId || tour.productCode;
      return !popularProductIds.has(tourId);
    }).slice(0, 51); // Limit to 51 tours after filtering
    
    console.log(`Fetched ${dynamicTours.length} dynamic tours for ${destinationName} (from ${allTours.length} total, filtered out ${popularTours.length} popular tours, ${totalToursAvailable} total available)`);
  } catch (error) {
    console.error('Error fetching dynamic tours:', error);
  }

  // Fetch all promotion scores for this destination (one query - most efficient!)
  // This returns only tours with points, all others default to 0
  const promotionScores = await getPromotionScoresByDestination(destination.id);

  // Fetch trending tours (past 28 days) for this destination
  // These will be displayed in a "Trending Now" section
  const trendingTours = await getTrendingToursByDestination(destination.id, 6);

  // Generate JSON-LD schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Tours & Activities in ${destination.fullName || destination.name}`,
    description: `Discover the best tours and activities in ${destination.fullName || destination.name}`,
    itemListElement: [
      ...popularTours.map((tour, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'TouristAttraction',
          name: tour.seo?.title || tour.content?.heroDescription,
          description: tour.seo?.description,
          url: `https://toptours.ai/tours/${tour.productId}/${tour.slug}`
        }
      }))
    ]
  };

  return (
    <>
      {/* TouristDestination Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            "name": destination.fullName || destination.name,
            "description": destination.seo?.description || destination.briefDescription,
            "image": destination.imageUrl,
            "url": `https://toptours.ai/destinations/${id}/tours`,
            "touristType": "Leisure travelers, Adventure seekers, Culture enthusiasts"
          })
        }}
      />
      
      {/* ItemList Schema for Tours */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
                "name": destination.fullName || destination.name,
                "item": `https://toptours.ai/destinations/${id}`
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "Tours",
                "item": `https://toptours.ai/destinations/${id}/tours`
              }
            ]
          })
        }}
      />
      
      <ToursListingClient 
        destination={destination}
        popularTours={popularTours}
        dynamicTours={dynamicTours}
        viatorDestinationId={viatorDestinationId}
        totalToursAvailable={totalToursAvailable}
        promotionScores={promotionScores}
        trendingTours={trendingTours}
      />
    </>
  );
}

