import { notFound } from 'next/navigation';
import { getDestinationById } from '@/data/destinationsData';
import { getPopularToursForDestination } from '@/data/popularTours';
import ToursListingClient from './ToursListingClient';
import { slugToViatorId } from '@/data/viatorDestinationMap';
import { getPromotionScoresByDestination, getTrendingToursByDestination } from '@/lib/promotionSystem';
import { getDestinationNameById, findDestinationBySlug } from '@/lib/viatorCache';
import { getViatorDestinationById } from '@/lib/supabaseCache';
import { redirect } from 'next/navigation';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import { hasDestinationPage } from '@/data/destinationFullContent';

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
  let destination = getDestinationById(id);
  let seoContent = null;
  
  // If not in our 182 destinations, try to get from Viator API cache or SEO content
  if (!destination) {
    // First check if we have SEO content for this slug
    seoContent = getDestinationSeoContent(id);
    
    if (seoContent) {
      // Find destination in classified data to get country and region (same as destinations page)
      let country = null;
      let region = null;
      if (Array.isArray(viatorDestinationsClassifiedData)) {
        const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
          const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
          const searchName = seoContent.destinationName.toLowerCase().trim();
          return destName === searchName;
        });
        if (classifiedDest) {
          country = classifiedDest.country || null;
          region = classifiedDest.region || null;
          
          // If country is not set, try to get it from parent destination
          if (!country && classifiedDest.parentDestinationId) {
            const parentDest = viatorDestinationsClassifiedData.find(dest => 
              dest.destinationId === classifiedDest.parentDestinationId.toString() || 
              dest.destinationId === classifiedDest.parentDestinationId
            );
            if (parentDest && parentDest.country) {
              country = parentDest.country;
            }
            if (!region && parentDest && parentDest.region) {
              region = parentDest.region;
            }
          }
        }
      }
      
      // Fallback to SEO content country if not found in classified data
      if (!country && seoContent.country) {
        country = seoContent.country;
      }
      
      // Final fallback: try to extract country from hero description (e.g., "the Netherlands' architectural gem")
      if (!country && seoContent.heroDescription) {
        const heroDesc = seoContent.heroDescription;
        const countryMatch = heroDesc.match(/the\s+([A-Z][a-z]+(?:'s)?)/i);
        if (countryMatch) {
          const extractedCountry = countryMatch[1].replace(/'s$/, '');
          // Common country names that might appear
          const knownCountries = ['Netherlands', 'Italy', 'France', 'Spain', 'Greece', 'Germany', 'Portugal', 'Croatia'];
          if (knownCountries.includes(extractedCountry)) {
            country = extractedCountry;
          }
        }
      }
      
      // Use SEO content to create destination object
      destination = {
        id: id,
        name: seoContent.destinationName,
        fullName: seoContent.destinationName,
        imageUrl: seoContent.seo?.ogImage || 'https://toptours.ai/favicon.ico',
        seo: seoContent.seo,
        briefDescription: seoContent.briefDescription,
        heroDescription: seoContent.heroDescription,
        tourCategories: [],
        country: country, // Get from classified data (same as destinations page)
        region: region,
      };
    } else {
      // Check if id is a Viator destination ID (numeric or starts with 'd')
      const viatorId = id.startsWith('d') ? id : `d${id}`;
      const destinationInfo = await getDestinationNameById(viatorId);
      
      if (destinationInfo && destinationInfo.destinationName) {
        // Create a minimal destination object for metadata
        destination = {
          id: id,
          name: destinationInfo.destinationName,
          fullName: destinationInfo.destinationName,
          imageUrl: 'https://toptours.ai/favicon.ico',
          seo: {
            description: `Discover the best tours and activities in ${destinationInfo.destinationName}. Browse trusted operators and secure instant confirmations.`,
          },
          briefDescription: `Explore ${destinationInfo.destinationName} with curated tours and activities.`,
          tourCategories: [],
        };
      }
    }
  }
  
  if (!destination) {
    return {
      title: 'Tours Not Found | TopTours.ai',
    };
  }

  const destinationName = destination.fullName || destination.name;
  
  // Use SEO content if available, otherwise build from destination
  const seoTitle = destination.seo?.title || `Top Tours & Activities in ${destinationName}`;
  const seoDescription = destination.seo?.description || destination.briefDescription || buildSeoCopy(destination).description;
  // Use favicon for destinations without images
  const ogImage = destination.seo?.ogImage || destination.imageUrl || 'https://toptours.ai/favicon.ico';
  
  return {
    title: `${seoTitle} | TopTours.ai`,
    description: seoDescription,
    keywords: `${destinationName} tours, ${destinationName} activities, ${destinationName} excursions, things to do in ${destinationName}`,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `https://toptours.ai/destinations/${id}/tours`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${destinationName} Tours`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://toptours.ai/destinations/${id}/tours`,
    },
  };
}

/**
 * Generate a URL-friendly slug from a destination name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Tours listing page for a destination
 */
export default async function ToursListingPage({ params }) {
  const { id } = await params;
  let destination = getDestinationById(id);
  let isViatorDestination = false;
  let viatorDestinationId = null;
  
  // If not in our 182 destinations, try to get from Viator API cache
  if (!destination) {
    let destinationInfo = null;
    let lookupId = id;
    
    // Check if id is a Viator destination ID (numeric or starts with 'd')
    if (/^d?\d+$/.test(id)) {
      // It's a numeric ID - look up the destination name and redirect to slug
      lookupId = id.startsWith('d') ? id : `d${id}`;
      viatorDestinationId = id.startsWith('d') ? id.replace(/^d/i, '') : id;
      
      // Try Supabase lookup first (most reliable)
      let destInfo = null;
      try {
        destInfo = await getViatorDestinationById(viatorDestinationId);
        if (destInfo && destInfo.name) {
          const slug = destInfo.slug || generateSlug(destInfo.name);
          redirect(`/destinations/${slug}/tours`);
        }
      } catch (error) {
        console.warn(`Supabase lookup failed for ${viatorDestinationId}, trying fallback:`, error);
      }
      
      // Fallback to JSON file lookup
      if (!destInfo) {
        destinationInfo = await getDestinationNameById(lookupId);
        
        if (destinationInfo && destinationInfo.destinationName) {
          // Generate slug and redirect to SEO-friendly URL
          const slug = generateSlug(destinationInfo.destinationName);
          redirect(`/destinations/${slug}/tours`);
        }
      } else {
        // Use Supabase data
        destinationInfo = {
          destinationName: destInfo.name,
          destinationId: destInfo.id,
        };
      }
    } else {
      // It's a slug - find the destination by slug
      destinationInfo = await findDestinationBySlug(id);
      
      if (destinationInfo) {
        viatorDestinationId = destinationInfo.destinationId;
      }
    }
    
    if (destinationInfo && destinationInfo.destinationName) {
      // Check if we have SEO content for this destination
      const seoContent = getDestinationSeoContent(id);
      
      // Find destination in classified data to get country and region (same as destinations page)
      let country = null;
      let region = null;
      if (Array.isArray(viatorDestinationsClassifiedData)) {
        const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
          const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
          const searchName = destinationInfo.destinationName.toLowerCase().trim();
          return destName === searchName;
        });
        if (classifiedDest) {
          country = classifiedDest.country || null;
          region = classifiedDest.region || null;
          
          // If country is not set, try to get it from parent destination
          if (!country && classifiedDest.parentDestinationId) {
            const parentDest = viatorDestinationsClassifiedData.find(dest => 
              dest.destinationId === classifiedDest.parentDestinationId.toString() || 
              dest.destinationId === classifiedDest.parentDestinationId
            );
            if (parentDest && parentDest.country) {
              country = parentDest.country;
            }
            if (!region && parentDest && parentDest.region) {
              region = parentDest.region;
            }
          }
        }
      }
      
      // Fallback to SEO content country if not found in classified data
      if (!country && seoContent?.country) {
        country = seoContent.country;
      }
      
      // Final fallback: try to extract country from hero description (e.g., "the Netherlands' architectural gem")
      if (!country && seoContent?.heroDescription) {
        const heroDesc = seoContent.heroDescription;
        const countryMatch = heroDesc.match(/the\s+([A-Z][a-z]+(?:'s)?)/i);
        if (countryMatch) {
          const extractedCountry = countryMatch[1].replace(/'s$/, '');
          // Common country names that might appear
          const knownCountries = ['Netherlands', 'Italy', 'France', 'Spain', 'Greece', 'Germany', 'Portugal', 'Croatia'];
          if (knownCountries.includes(extractedCountry)) {
            country = extractedCountry;
          }
        }
      }
      
      // CRITICAL: Get destinationId from classified data (100% available as user confirmed)
      const classifiedDest = Array.isArray(viatorDestinationsClassifiedData) 
        ? viatorDestinationsClassifiedData.find(dest => {
            const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
            const searchName = destinationInfo.destinationName.toLowerCase().trim();
            return destName === searchName || generateSlug(destName) === id;
          })
        : null;
      
      // Use destinationId from classified data if not already set
      if (!viatorDestinationId && classifiedDest?.destinationId) {
        viatorDestinationId = classifiedDest.destinationId;
      }
      
      // Check if this is a small destination with a parent country (especially Caribbean)
      let parentCountryDestination = null;
      if (classifiedDest && classifiedDest.parentDestinationId && (region || '').toLowerCase() === 'caribbean') {
        // Find the parent country destination
        const parentDest = viatorDestinationsClassifiedData.find(dest => 
          (dest.destinationId === classifiedDest.parentDestinationId.toString() || 
           dest.destinationId === classifiedDest.parentDestinationId) &&
          dest.type === 'COUNTRY'
        );
        
        if (parentDest) {
          const parentSlug = generateSlug(parentDest.destinationName || parentDest.name || '');
          parentCountryDestination = {
            id: parentSlug,
            name: parentDest.destinationName || parentDest.name,
            fullName: parentDest.destinationName || parentDest.name,
            destinationId: parentDest.destinationId
          };
        }
      }
      
      // Create a minimal destination object for dynamic destinations
      destination = {
        id: id, // Use the slug as id (already in URL)
        name: destinationInfo.destinationName,
        fullName: destinationInfo.destinationName,
        destinationId: viatorDestinationId || classifiedDest?.destinationId || null, // CRITICAL: Include Viator destination ID
        imageUrl: seoContent?.seo?.ogImage || 'https://toptours.ai/favicon.ico',
        seo: seoContent?.seo || {
          description: `Discover the best tours and activities in ${destinationInfo.destinationName}. Browse trusted operators and secure instant confirmations.`,
        },
        briefDescription: seoContent?.briefDescription || `Explore ${destinationInfo.destinationName} with curated tours and activities.`,
        heroDescription: seoContent?.heroDescription || null,
        tourCategories: [],
        country: country, // Get from classified data (same as destinations page)
        region: region,
        parentCountryDestination: parentCountryDestination, // For small destinations that belong to a parent country
      };
      isViatorDestination = true;
    }
  }
  
  if (!destination) {
    notFound();
  }

  // Get hardcoded popular tours for this destination (only for our 182 destinations)
  const popularTours = isViatorDestination ? [] : getPopularToursForDestination(id);
  
  // Get Viator destination ID
  if (!isViatorDestination) {
    viatorDestinationId = slugToViatorId[id] || null;
  } else {
    // For Viator destinations, get from destination object or classified data
    viatorDestinationId = destination.destinationId || viatorDestinationId;
  }
  
  // CRITICAL: Ensure we have destinationId from classified data if not already set
  if (!viatorDestinationId && Array.isArray(viatorDestinationsClassifiedData)) {
    const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
      const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
      const searchName = (destination.fullName || destination.name || '').toLowerCase().trim();
      return destName === searchName || generateSlug(destName) === id;
    });
    if (classifiedDest?.destinationId) {
      viatorDestinationId = classifiedDest.destinationId;
      // Also update destination object
      if (!destination.destinationId) {
        destination.destinationId = viatorDestinationId;
      }
    }
  }

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
            // Use destination name as searchTerm (for API compatibility)
            // The destination ID filter ensures accurate results
            searchTerm: destinationName.trim(),
            searchTypes: [{
              searchType: 'PRODUCTS',
              pagination: {
                start: start,
                count: toursPerPage
              }
            }],
            currency: 'USD',
            productFiltering: viatorDestinationId ? {
              destination: String(viatorDestinationId)
            } : undefined
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

  // Fetch all promotion scores for this destination
  // Use Viator destination ID (numeric) for querying, fall back to slug for curated destinations
  const destinationIdForScores = viatorDestinationId || destination.destinationId || destination.id;
  let promotionScores = destinationIdForScores ? await getPromotionScoresByDestination(destinationIdForScores) : {};

  // CRITICAL: Also fetch scores by product IDs as a fallback
  // This ensures we find scores even if destination_id format doesn't match (slug vs numeric ID)
  const allProductIds = [
    ...popularTours.map(t => t.productId).filter(Boolean),
    ...dynamicTours.map(t => t.productId || t.productCode).filter(Boolean),
  ];
  
  if (allProductIds.length > 0) {
    const { getTourPromotionScoresBatch } = await import('@/lib/promotionSystem');
    const scoresByProductId = await getTourPromotionScoresBatch(allProductIds);
    
    // Merge: destination-based scores take priority, but product-based scores fill in gaps
    promotionScores = {
      ...scoresByProductId,
      ...promotionScores, // Destination-based scores override (more specific)
    };
  }

  // Fetch trending tours (past 28 days) for this destination
  // These will be displayed in a "Trending Now" section
  const trendingTours = destinationIdForScores ? await getTrendingToursByDestination(destinationIdForScores, 6) : [];

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
                "item": hasDestinationPage(id) ? `https://toptours.ai/destinations/${id}` : `https://toptours.ai/destinations/${id}/tours`
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
        isViatorDestination={isViatorDestination}
      />
    </>
  );
}

