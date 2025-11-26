import { notFound } from 'next/navigation';
import { getDestinationById } from '@/data/destinationsData';
import { getPopularToursForDestination } from '@/data/popularTours';
import ToursListingClient from './ToursListingClient';
import { slugToViatorId } from '@/data/viatorDestinationMap';
import { getPromotionScoresByDestination, getTrendingToursByDestination, getTrendingRestaurantsByDestination, getRestaurantPromotionScoresByDestination, getHardcodedToursByDestination } from '@/lib/promotionSystem';
import { getDestinationNameById, findDestinationBySlug } from '@/lib/viatorCache';
import { getViatorDestinationById, getViatorDestinationBySlug } from '@/lib/supabaseCache';
import { redirect } from 'next/navigation';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import { hasDestinationPage } from '@/data/destinationFullContent';
import { headers } from 'next/headers';

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
  // CRITICAL: Use database as source of truth - query by slug to get correct destination ID
  // This ensures we use the correct ID from the database (id field = Viator destination ID)
  if (!isViatorDestination) {
    // Curated destination - query database by slug to get the correct destination ID
    const dbDestination = await getViatorDestinationBySlug(id);
    if (dbDestination && dbDestination.id) {
      viatorDestinationId = dbDestination.id.toString();
      console.log(`🔍 Tours Page - Curated destination "${id}": Using database ID = ${viatorDestinationId} (name: ${dbDestination.name})`);
    } else {
      // Fallback to hardcoded map if database lookup fails
      viatorDestinationId = slugToViatorId[id] || null;
      console.log(`⚠️ Tours Page - Curated destination "${id}": Database lookup failed, using fallback slugToViatorId = ${viatorDestinationId}`);
    }
    // CRITICAL: Add destinationId to destination object for 182 destinations
    // This ensures consistency with destination detail page
    if (viatorDestinationId && !destination.destinationId) {
      destination.destinationId = viatorDestinationId;
    }
  } else {
    // For Viator destinations, get from destination object or classified data
    viatorDestinationId = destination.destinationId || viatorDestinationId;
    
    // If still not set, try classified data lookup
    if (!viatorDestinationId && Array.isArray(viatorDestinationsClassifiedData)) {
      const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
        const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
        const searchName = (destination.fullName || destination.name || '').toLowerCase().trim();
        return destName === searchName || generateSlug(destName) === id;
      });
      if (classifiedDest?.destinationId) {
        viatorDestinationId = classifiedDest.destinationId;
        console.log(`🔍 Tours Page - Viator destination "${id}": Using classified data ID = ${viatorDestinationId}`);
        // Also update destination object
        if (!destination.destinationId) {
          destination.destinationId = viatorDestinationId;
        }
      }
    }
  }
  
  // CRITICAL: Ensure destination.destinationId is set to the final viatorDestinationId
  // This ensures consistency between server-side and client-side API calls
  if (viatorDestinationId && !destination.destinationId) {
    destination.destinationId = viatorDestinationId;
  } else if (destination.destinationId && !viatorDestinationId) {
    // If destination has ID but viatorDestinationId doesn't, use destination's ID
    viatorDestinationId = destination.destinationId;
  }

  // Fetch dynamic tours - EXACT SAME FUNCTION as destination detail page
  // 100% IDENTICAL - same endpoint, same parameters, same logic
  let dynamicTours = [];
  let totalToursAvailable = 0;
  try {
    // EXACT same variable names and logic as DestinationDetailClient.jsx line 400-401
    const destinationName = destination.fullName || destination.name || destination.destinationName || destination.id;
    const viatorDestinationId = destination.destinationId || destination.viatorDestinationId;
    
    // Get base URL for server-side fetch (must await headers in Next.js 15)
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    // Use /products/search endpoint (standard approach) when we have destination ID and no search term
    // This is 100% accurate for all 3300+ destinations
    let requestBody = {
      searchTerm: '', // No search term - use /products/search endpoint
      page: 1,
      viatorDestinationId: viatorDestinationId ? String(viatorDestinationId) : null,
      includeDestination: !!viatorDestinationId // Use /products/search when destination ID is available
    };
    
    // EXACT same fetch call as DestinationDetailClient.jsx line 423-429
    let response = await fetch(`${baseUrl}/api/internal/viator-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData = {};
      try {
        const text = await response.text();
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: text || 'Unknown error', raw: text };
        }
      } catch (e) {
        errorData = { error: 'Failed to parse error response', details: e.message };
      }
      
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      
      const errorMessage = errorData.error || errorData.details || errorData.message || `HTTP ${response.status}`;
      throw new Error(`Failed to fetch tours: ${response.status} - ${errorMessage}`);
    }

    // EXACT same data extraction as DestinationDetailClient.jsx line 454-458
    const data = await response.json();
    const allTours = data.products?.results || data.tours || [];
    totalToursAvailable = data.products?.totalCount || allTours.length || 0; // Fix: assign to outer variable, don't declare new one
    
    // Now fetch additional pages (detail page only fetches page 1, we fetch a few more for initial load)
    // Client-side can fetch more via pagination/filters if needed
    // Use the same requestBody that worked (either with or without destination filter)
    const pagesNeeded = 3; // Reduced from 10 to 3 (60 tours initial load) - client can fetch more via filters
    const allToursPromises = [Promise.resolve(data)]; // Start with first page we already fetched
    
    for (let page = 2; page <= pagesNeeded; page++) {
      const pageRequestBody = {
        ...requestBody, // Use the requestBody that worked (may have includeDestination: false if fallback was used)
        page: page
      };
      
      allToursPromises.push(
        fetch(`${baseUrl}/api/internal/viator-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pageRequestBody),
          cache: 'no-store',
        }).then(async (res) => {
          if (res.ok) {
            return res.json();
          } else {
            const errorText = await res.text();
            console.error(`Page ${page} error:`, res.status, errorText);
            return { products: { results: [] } };
          }
        }).catch(error => {
          console.error(`Page ${page} fetch error:`, error);
          return { products: { results: [] } };
        })
      );
    }
    
    const allResponses = await Promise.all(allToursPromises);
    const allToursList = [];
    const seenTourIds = new Set();
    
    // Process all responses and collect tours
    // totalToursAvailable is already set from the first successful response (either destination filter or text search fallback)
    for (const responseData of allResponses) {
      if (responseData && !responseData.error) {
        const tours = responseData.products?.results || [];
        for (const tour of tours) {
          const tourId = tour.productId || tour.productCode;
          if (tourId && !seenTourIds.has(tourId)) {
            seenTourIds.add(tourId);
            allToursList.push(tour);
          }
        }
      }
    }
    
    // Filter out tours that are already in popularTours
    const popularProductIds = new Set(popularTours.map(t => t.productId));
    dynamicTours = allToursList.filter(tour => {
      const tourId = tour.productId || tour.productCode;
      return !popularProductIds.has(tourId);
    });
    
    console.log(`Fetched ${dynamicTours.length} dynamic tours for ${destinationName} (from ${allToursList.length} total, filtered out ${popularTours.length} popular tours, ${totalToursAvailable} total available)`);
  } catch (error) {
    console.error('Error fetching dynamic tours:', error);
  }

  // Fetch all promotion scores for this destination
  // CRITICAL: Use the SAME destination ID that we use for fetching tours
  // This ensures promotions match the tours being displayed
  // destination.destinationId is set from database lookup (getViatorDestinationBySlug)
  // This ensures consistency between tours and promotions
  let destinationIdForScores;
  
  // Use the destinationId from destination object (set from database lookup above)
  // This is the same ID we use for fetching tours, ensuring consistency
  if (destination.destinationId) {
    // Use the database-derived destination ID (numeric Viator ID)
    destinationIdForScores = destination.destinationId;
    console.log(`✅ Tours Page - Using destination.destinationId ${destinationIdForScores} for promotions (same as tours)`);
  } else if (viatorDestinationId) {
    // Fallback to viatorDestinationId if destination.destinationId not set
    destinationIdForScores = viatorDestinationId;
    console.log(`⚠️ Tours Page - Using viatorDestinationId ${destinationIdForScores} for promotions (destination.destinationId not set)`);
  } else {
    // Last resort: use slug, promotion function will look up numeric ID
    destinationIdForScores = id;
    console.log(`⚠️ Tours Page - Using slug ${destinationIdForScores} for promotions (no destination ID available)`);
  }
  
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
  // These will be displayed in a "Trending Now" section - limit to top 3
  const trendingTours = destinationIdForScores ? await getTrendingToursByDestination(destinationIdForScores, 3) : [];

  // Fetch trending restaurants (past 28 days) for this destination - limit to top 3
  const trendingRestaurants = destination.id ? await getTrendingRestaurantsByDestination(destination.id, 3) : [];

  // Fetch restaurant promotion scores for this destination
  const restaurantPromotionScores = destination.id ? await getRestaurantPromotionScoresByDestination(destination.id) : {};

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
        trendingRestaurants={trendingRestaurants}
        restaurantPromotionScores={restaurantPromotionScores}
        isViatorDestination={isViatorDestination}
      />
    </>
  );
}

