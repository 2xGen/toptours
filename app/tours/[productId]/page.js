import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import TourDetailClient from './TourDetailClient';
import { fetchSimilarToursServer } from './fetchSimilarTours';
import { loadTourData, loadDestinationData } from './TourDataLoader';
import { getTourEnrichment, generateTourEnrichment, cleanText } from '@/lib/tourEnrichment';
import { buildEnhancedMetaDescription, buildEnhancedTitle } from '@/lib/metaDescription';
import { getCachedTour, cacheTour, getCachedSimilarTours, cacheSimilarTours, generateSimilarToursCacheKey, extractCountryFromDestinationName } from '@/lib/viatorCache';
import { getTourPromotionScore } from '@/lib/promotionSystem';
import { getRestaurantCountsByDestination, getRestaurantsForDestination as getRestaurantsForDestinationFromDB, formatRestaurantForFrontend } from '@/lib/restaurants';
import { getRestaurantsForDestination as getRestaurantsForDestinationFromStatic } from '../../destinations/[id]/restaurants/restaurantsData';
import { destinations } from '@/data/destinationsData';
import { getDestinationNameById } from '@/lib/destinationIdLookup';
import { getViatorDestinationById } from '@/lib/supabaseCache';
import { getTourOperatorPremiumSubscription, getOperatorPremiumTourIds, getOperatorAggregatedStats } from '@/lib/tourOperatorPremiumServer';
import { generateTourSlug } from '@/utils/tourHelpers';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';
import { generateTourFAQs, generateFAQSchema } from '@/lib/faqGeneration';
import { getCachedReviews } from '@/lib/viatorReviews';
import { getPricingPerAgeBand } from '@/lib/viatorPricing';
import { trackTourForSitemap, trackToursForSitemap } from '@/lib/tourSitemap';

// Revalidate every 7 days - page-level cache (not API JSON cache, so Viator compliant)
// Increased from 24h to 7 days to reduce ISR writes during Google reindexing
export const revalidate = 604800; // 7 days

// Cache tour data fetching at Next.js level (24 hours - matches page cache)
const getCachedTourData = unstable_cache(
  async (productId) => {
    let tour = await getCachedTour(productId);
    
    if (!tour) {
      const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
      const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;
      
      const productResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'exp-api-key': apiKey,
          'Accept': 'application/json;version=2.0',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json'
        },
        next: { revalidate: 86400 } // 24 hours - Supabase cache handles longer-term, this reduces fetch calls
      });

      if (!productResponse.ok) {
        return null;
      }

      tour = await productResponse.json();
      if (!tour || tour.error) {
        return null;
      }
      await cacheTour(productId, tour);
    }
    
    return tour;
  },
  ['tour-data-productid'],
  { revalidate: 604800, tags: ['tours'] } // 7 days to match page cache
);

// Cache non-critical data loading (24 hours - matches page cache)
const getCachedTourExtras = unstable_cache(
  async (productId, tour) => {
    const [tourDataResult, destinationDataResult] = await Promise.allSettled([
      loadTourData(productId, tour),
      loadDestinationData(tour, productId)
    ]);

    const tourData = tourDataResult.status === 'fulfilled' ? tourDataResult.value : {
      pricing: null,
      promotionScore: { product_id: productId, total_score: 0, monthly_score: 0, weekly_score: 0, past_28_days_score: 0 },
      tourEnrichment: null,
      operatorPremiumData: null,
      operatorTours: [],
      reviews: null
    };

    const destData = destinationDataResult.status === 'fulfilled' 
      ? destinationDataResult.value 
      : { destinationData: null, restaurantCount: 0, restaurants: [], categoryGuides: [] };

    return { tourData, destData };
  },
  ['tour-extras-productid'],
  { revalidate: 604800, tags: ['tours'] } // 7 days to match page cache
);

/**
 * Generate metadata for tour detail page
 * OPTIMIZED: Shares tour data with page component to avoid duplicate fetches
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  // Extract productId from slug array (first element)
  const slugParam = resolvedParams.productId || resolvedParams.slug;
  const productId = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  
  if (!productId) {
        return {
          title: 'Tour Not Found | TopTours.ai',
      description: 'The tour you are looking for could not be found.',
      robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
        };
      }

  try {
    // Use Next.js level caching for tour data (shared with page component)
    const tour = await getCachedTourData(productId);
      
    if (!tour) {
        return {
          title: 'Tour Not Found | TopTours.ai',
        description: 'The tour you are looking for could not be found.',
        robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
        };
      }

    // OPTIMIZED: Only fetch enrichment if needed for metadata (cached)
    const tourEnrichment = await getTourEnrichment(productId);
    
    // Extract destination name from tour for metadata
    let destinationNameForMeta = null;
    if (Array.isArray(tour.destinations) && tour.destinations.length > 0) {
      const primary = tour.destinations.find(d => d.primary) || tour.destinations[0];
      destinationNameForMeta = primary.destinationName || primary.name || null;
    }
    
    // Build enhanced title and description
    const title = buildEnhancedTitle(tour, { destinationName: destinationNameForMeta }, tourEnrichment);
    const description = buildEnhancedMetaDescription(tour, { destinationName: destinationNameForMeta }, tourEnrichment);
    
    // OPTIMIZED: Generate unique, dynamic keywords per tour (not one-size-fits-all)
    // Based on tour title, destination, operator name, category, and activity type for better SEO
    const generateUniqueKeywords = () => {
      const keywords = new Set();
      const tourTitle = tour.title || '';
      const destination = destinationNameForMeta || '';
      
      // Extract operator/supplier name (same logic as buildEnhancedTitle)
      const operatorName = tour.supplier?.name || tour.supplierName || tour.operator?.name || tour.vendor?.name || tour.partner?.name || '';
      
      // Extract key terms from tour title (remove common words)
      const titleWords = tourTitle
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && !['tour', 'tours', 'from', 'with', 'the', 'and', 'for'].includes(word))
        .slice(0, 3); // Top 3 meaningful words
      
      titleWords.forEach(word => keywords.add(word));
      
      // Add operator name keywords (for brand searches)
      if (operatorName) {
        const cleanOperatorName = operatorName.toLowerCase().trim();
        keywords.add(cleanOperatorName);
        if (destination) {
          keywords.add(`${cleanOperatorName} ${destination}`);
          keywords.add(`${destination} ${cleanOperatorName} tours`);
        }
        keywords.add(`${cleanOperatorName} tours`);
      }
      
      // Add destination-specific long-tail keywords
      if (destination) {
        keywords.add(`${destination} tours`);
        keywords.add(`book ${tourTitle.toLowerCase()} ${destination}`);
        keywords.add(`${destination} activities`);
        keywords.add(`things to do ${destination}`);
      }
      
      // Extract category/type from title (common tour types)
      const tourTypes = ['sunset', 'cruise', 'snorkel', 'dive', 'atv', 'hiking', 'walking', 'food', 'culinary', 'cultural', 'adventure', 'sightseeing', 'day trip', 'half day', 'full day'];
      tourTypes.forEach(type => {
        if (tourTitle.toLowerCase().includes(type)) {
          keywords.add(`${type} tour`);
          if (destination) {
            keywords.add(`${destination} ${type} tours`);
          }
        }
      });
      
      // Add booking-related long-tail keywords
      keywords.add('book tour online');
      keywords.add('tour booking');
      if (destination) {
        keywords.add(`best tours ${destination}`);
      }
      
      // Add review/rating keywords if available
      if (tour.reviews?.combinedAverageRating) {
        keywords.add('rated tour');
        keywords.add('top rated experience');
      }
      
      return Array.from(keywords).slice(0, 15).join(', '); // Limit to 15 keywords
    };
    
    const uniqueKeywords = generateUniqueKeywords();
    
    const imageVariants = tour.images?.[0]?.variants || [];
    const fallbackImage =
      tour.images?.[1]?.variants?.[3]?.url ||
      tour.images?.[1]?.variants?.[0]?.url ||
      tour.images?.[2]?.variants?.[3]?.url ||
      tour.images?.[2]?.variants?.[0]?.url ||
      tour.images?.[0]?.variants?.[3]?.url ||
      tour.images?.[0]?.variants?.[0]?.url ||
      '';
    const image = tourEnrichment?.custom_og_image_url || fallbackImage;

    // Generate canonical URL with slug for SEO (prevents duplicate content issues)
    const tourTitle = tour.title || 'Tour';
    const slug = generateTourSlug(tourTitle);
    const canonicalUrl = slug ? `https://toptours.ai/tours/${productId}/${slug}` : `https://toptours.ai/tours/${productId}`;

    return {
      title: title,
      description: description,
      keywords: uniqueKeywords, // Unique keywords per tour based on actual tour data
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: title,
        description: description,
        images: image ? [{
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        }] : [],
        type: 'website',
        url: canonicalUrl,
        siteName: 'TopTours.ai',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: image ? [image] : [],
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
  } catch (error) {
    // Only log errors in development to reduce I/O during crawls
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating metadata:', error);
    }
    return {
      title: 'Tour | TopTours.ai',
      description: 'Discover amazing tours and experiences.',
      robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    };
  }
}

/**
 * Tour detail page
 */
export default async function TourDetailPage({ params }) {
  const resolvedParams = await params;
  // Extract productId from slug array (first element) or direct productId param
  const slugParam = resolvedParams.productId || resolvedParams.slug;
  const productId = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  
  if (!productId) {
    notFound();
  }

  try {
    // Use Next.js level caching for tour data
    const tour = await getCachedTourData(productId);
    
    if (!tour) {
        notFound();
      }

    // Use Next.js level caching for extras (pricing, reviews, etc.)
    const { tourData, destData } = await getCachedTourExtras(productId, tour);
    const { destinationData, restaurantCount, restaurants, categoryGuides } = destData;

    // Generate FAQs for SEO
    let faqs = [];
    let faqSchema = null;
    try {
      faqs = await generateTourFAQs(tour, tourData.tourEnrichment);
      if (faqs && faqs.length > 0) {
        faqSchema = generateFAQSchema(faqs);
      }
    } catch (error) {
      // Only log errors in development to reduce I/O during crawls
      if (process.env.NODE_ENV === 'development') {
        console.error('Error generating FAQs:', error);
      }
    }

    const {
      pricing,
      promotionScore,
      tourEnrichment,
      operatorPremiumData,
      operatorTours,
      reviews
    } = tourData;

    // Similar tours are fetched server-side via Suspense (for SEO - crawlers can see it)
    // This is just 1 API call and returns 12 tours with full data
    // Recommended tours removed to reduce API calls
    // similarTours will be fetched server-side via SimilarToursSection Suspense component

    // Sync operator to CRM (lightweight, non-blocking)
    // Run sync regardless of cache status
    if (tour && productId) {
      try {
        // Only log in development to reduce I/O during crawls
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 [TOUR PAGE] Attempting CRM sync for:', productId);
        }
        const crmModule = await import('@/lib/tourOperatorsCRM');
        // Sync operator to CRM (lightweight, non-blocking - fire and forget)
        if (crmModule.syncOperator) {
          // Don't await - let it run in background without blocking page render
          crmModule.syncOperator(tour, productId)
            .then((result) => {
              if (process.env.NODE_ENV === 'development') {
                if (result && result.success) {
                  console.log('✅ [TOUR PAGE] Operator synced:', result.operatorName);
                } else {
                  console.warn('⚠️ [TOUR PAGE] Sync failed:', result?.error || 'Unknown error');
                }
              }
            })
            .catch((err) => {
              // Only log errors in development
              if (process.env.NODE_ENV === 'development') {
                console.error('❌ [TOUR PAGE] CRM sync error (non-blocking):', err);
              }
            });
        }
      } catch (err) {
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [TOUR PAGE] CRM sync error:', err);
          console.error('❌ [TOUR PAGE] Error stack:', err.stack);
        }
      }
    }

    // Client-side redirect to canonical URL with slug
    // Modern crawlers (Google, Bing) execute JavaScript and will follow the redirect
    // Canonical tag in metadata also signals the preferred URL to search engines
    let redirectScript = null;
    if (tour && tour.title) {
      const slug = generateTourSlug(tour.title);
      if (slug) {
        const canonicalUrl = `/tours/${productId}/${slug}`;
        // Immediate redirect script (runs before React hydration)
        // Escape for JavaScript string (backslash escaping)
        const escapedUrl = canonicalUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
        redirectScript = (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var p="${escapedUrl}";if(window.location.pathname===p)return;window.location.replace(p);})();`,
            }}
          />
        );
      }
    }

    // Fetch similar tours server-side (for SEO - crawlers can see it)
    const { similarTours: fetchedSimilarTours } = await fetchSimilarToursServer(productId, tour, destinationData);
    const similarTours = fetchedSimilarTours || [];

    // NOTE: Destination data, restaurants, and categoryGuides are already loaded via loadDestinationData() above
    // The variables are already set from the parallel data loading above
    // OPTIMIZED: Removed duplicate lookup code - only run emergency fallback if destinationData is null
    
    // EMERGENCY FALLBACK: Only run if loadDestinationData() failed to provide destinationData
    if (!destinationData && tour) {
      // Only log in development to reduce I/O during crawls
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ FALLBACK: destinationData is null, attempting emergency extraction...`);
      }
      
      // Try to extract from any possible location in the tour object
      let emergencyDestinationId = null;
      let emergencyDestinationName = null;
      
      // Check destinations array
      if (tour.destinations && tour.destinations.length > 0) {
        const dest = tour.destinations[0];
        emergencyDestinationId = dest?.ref || dest?.destinationId || dest?.id;
        emergencyDestinationName = dest?.destinationName || dest?.name;
      }
      
      // Check top-level fields
      if (!emergencyDestinationId) {
        emergencyDestinationId = tour.destinationId || tour.destination?.id || tour.destination?.ref;
        emergencyDestinationName = tour.destinationName || tour.destination?.name;
      }
      
      if (emergencyDestinationId) {
        // Try lookup one more time - first try Supabase destinations table
        try {
          const { createSupabaseServiceRoleClient } = await import('@/lib/supabaseClient');
          const supabase = createSupabaseServiceRoleClient();
          const normalizedEmergencyId = emergencyDestinationId.toString().replace(/^d/i, '');
          const { data: destData, error: destError } = await supabase
            .from('destinations')
            .select('id, name, slug, country')
            .or(`lookup_id.eq.${normalizedEmergencyId},id.eq.${normalizedEmergencyId}`)
            .limit(1)
            .maybeSingle();
          
          if (!destError && destData) {
            const slug = destData.slug || destData.id;
            destinationData = {
              country: destData.country || null,
              region: null,
              destinationName: destData.name || emergencyDestinationName || null,
              destinationId: normalizedEmergencyId,
              slug,
              source: 'emergency_supabase_destinations',
            };
          } else {
            // Fallback to JSON lookup
            const emergencyLookup = await getDestinationNameById(emergencyDestinationId);
            const finalName = emergencyLookup?.destinationName || emergencyDestinationName;
            
            destinationData = {
              destinationId: emergencyDestinationId.toString(),
              destinationName: finalName || null,
              slug: finalName ? finalName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : emergencyDestinationId.toString(),
              country: null,
              source: finalName ? 'emergency_lookup' : 'emergency_id_only',
            };
          }
        } catch (fallbackError) {
          // Only log errors in development
          if (process.env.NODE_ENV === 'development') {
            console.error(`❌ FALLBACK ERROR:`, fallbackError);
          }
          // Still set it with just the ID
          destinationData = {
            destinationId: emergencyDestinationId.toString(),
            destinationName: emergencyDestinationName || null,
            slug: emergencyDestinationName ? emergencyDestinationName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : emergencyDestinationId.toString(),
            country: null,
            source: emergencyDestinationName ? 'emergency_tour_data' : 'emergency_id_only',
          };
        }
      }
    }

    // NOTE: categoryGuides, restaurants, and restaurantCount are already loaded via loadDestinationData() above
    // OLD CODE REMOVED - these variables are already set from loadDestinationData()
    // This was blocking page render - removed ~60 lines of duplicate code
    try {
      // Try to match destination from our destinationsData
      let matchedDestinationId = null;
      
      if (destinationData?.slug) {
        // Try to find matching destination by slug
        const matchedDest = destinations.find(d => d.id === destinationData.slug);
        if (matchedDest) {
          matchedDestinationId = matchedDest.id;
        }
      }
      
      // Also try to match by destination name or other fields
      if (!matchedDestinationId && tour?.destinations && tour.destinations.length > 0) {
        const primaryDestination = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
        const destinationName = primaryDestination?.destinationName || primaryDestination?.name || '';
        
        if (destinationName) {
          const matchedDest = destinations.find(d => {
            const comparable = [
              d.id,
              d.name,
              d.fullName,
            ]
              .filter(Boolean)
              .map((value) => value.toLowerCase());
            return comparable.some(val => destinationName.toLowerCase().includes(val) || val.includes(destinationName.toLowerCase()));
          });
          if (matchedDest) {
            matchedDestinationId = matchedDest.id;
          }
        }
      }

      if (matchedDestinationId) {
        // Try to fetch restaurants directly (don't rely on count which might have ID format issues)
        let fetchedRestaurants = await getRestaurantsForDestinationFromDB(matchedDestinationId);
        if (fetchedRestaurants.length > 0) {
          restaurants = fetchedRestaurants.map(r => formatRestaurantForFrontend(r)).slice(0, 8);
          restaurantCount = fetchedRestaurants.length;
        } else {
          // Fallback to static data
          restaurants = getRestaurantsForDestinationFromStatic(matchedDestinationId).slice(0, 8);
          if (restaurants.length > 0) {
            restaurantCount = restaurants.length;
          } else {
            // Last resort: check restaurant counts
            const restaurantCounts = await getRestaurantCountsByDestination();
            restaurantCount = restaurantCounts[matchedDestinationId] || 0;
          }
        }
      }
    } catch (error) {
      // Non-critical - restaurant count is optional
      // Only log in development to reduce I/O during crawls
      if (process.env.NODE_ENV === 'development') {
        console.warn('Could not fetch restaurant data (non-critical):', error.message || error);
      }
      restaurantCount = 0;
      restaurants = [];
    }

    // Generate breadcrumb schema for SEO
    const breadcrumbSchema = {
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
          "name": "Tours",
          "item": "https://toptours.ai/tours"
        }
      ]
    };

    // Add destination to breadcrumb if available
    if (destinationData?.slug || destinationData?.name) {
      const destinationName = destinationData.name || destinationData.slug || 'Destination';
      const destinationSlug = destinationData.slug || destinationData.id;
      breadcrumbSchema.itemListElement.push({
        "@type": "ListItem",
        "position": 2,
        "name": destinationName,
        "item": `https://toptours.ai/destinations/${destinationSlug}`
      });
      breadcrumbSchema.itemListElement.push({
        "@type": "ListItem",
        "position": 3,
        "name": tour?.title || 'Tour',
        "item": `https://toptours.ai/tours/${productId}`
      });
    } else {
      breadcrumbSchema.itemListElement.push({
        "@type": "ListItem",
        "position": 2,
        "name": tour?.title || 'Tour',
        "item": `https://toptours.ai/tours/${productId}`
      });
    }

    // Build Product schema - only include if at least offers OR aggregateRating is available
    const hasOffers = pricing && pricing > 0;
    const hasRating = tour.reviews?.combinedAverageRating && tour.reviews?.totalReviews;
    const tourSlug = generateTourSlug(tour.title);
    const canonicalUrl = tourSlug ? `https://toptours.ai/tours/${productId}/${tourSlug}` : `https://toptours.ai/tours/${productId}`;
    const mainImage = tour.images?.[0]?.variants?.[3]?.url || tour.images?.[0]?.variants?.[0]?.url;
    
    // Only create Product schema if valid (Google requires offers, review, or aggregateRating)
    const productSchema = (hasOffers || hasRating) ? {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": tour.title,
      "description": tour.description?.summary || tour.description?.shortDescription || '',
      "image": mainImage ? [mainImage] : undefined,
      "sku": productId,
      "offers": hasOffers ? {
        "@type": "Offer",
        "url": canonicalUrl,
        "priceCurrency": "USD",
        "price": pricing,
        "availability": "https://schema.org/InStock"
      } : undefined,
      "aggregateRating": hasRating ? {
        "@type": "AggregateRating",
        "ratingValue": tour.reviews.combinedAverageRating,
        "reviewCount": tour.reviews.totalReviews,
        "bestRating": "5",
        "worstRating": "1"
      } : undefined
    } : null;

    // OPTIMIZED: Review schema for aggregated reviews (rating/review count only, not individual review content)
    // This helps with rich snippets while respecting Viator's no-index requirement for review content
    // The review content section itself has data-nosnippet attribute to prevent indexing
    const reviewSchema = hasRating ? {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "Product",
        "name": tour.title,
        "sku": productId
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": tour.reviews.combinedAverageRating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Organization",
        "name": "TopTours.ai"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": tour.reviews.combinedAverageRating,
        "reviewCount": tour.reviews.totalReviews,
        "bestRating": "5",
        "worstRating": "1"
      }
    } : null;

    // Track tour for sitemap (non-blocking, fire and forget)
    trackTourForSitemap(productId, tour, destinationData);
    
    // Track recommended/similar tours for sitemap

    return (
      <>
        {redirectScript}
        {/* Product Schema for SEO - only if valid */}
        {productSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(productSchema)
            }}
          />
        )}
        {/* Review Schema for SEO - aggregated rating/review count only (not individual review content) */}
        {reviewSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(reviewSchema)
            }}
          />
        )}
        {/* BreadcrumbList Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema)
          }}
        />
        {/* HowTo Schema for AI Optimization - shows booking process */}
        {hasOffers && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": `How to Book ${tour.title}`,
                "description": `Learn how to book ${tour.title} on TopTours.ai`,
                "step": [
                  {
                    "@type": "HowToStep",
                    "name": "Search for Tours",
                    "text": "Visit TopTours.ai and search for tours in your destination",
                    "url": `https://toptours.ai/tours`
                  },
                  {
                    "@type": "HowToStep",
                    "name": "Select Your Tour",
                    "text": `Choose "${tour.title}" from the search results`,
                    "url": canonicalUrl
                  },
                  {
                    "@type": "HowToStep",
                    "name": "Review Tour Details",
                    "text": "Review the tour description, pricing, and reviews",
                    "url": canonicalUrl
                  },
                  {
                    "@type": "HowToStep",
                    "name": "Book Your Tour",
                    "text": "Click the booking button to complete your reservation",
                    "url": canonicalUrl
                  }
                ]
              })
            }}
          />
        )}
        {/* FAQPage Schema for SEO */}
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqSchema)
            }}
          />
        )}
        <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading tour...</p>
          </div>
        </div>
      }>
        <TourDetailClient 
          tour={tour} 
          similarTours={similarTours} 
          productId={productId} 
          pricing={pricing}
          enrichment={tourEnrichment} 
          initialPromotionScore={promotionScore} 
          destinationData={destinationData} 
          restaurantCount={restaurantCount}
          restaurants={restaurants}
          operatorPremiumData={operatorPremiumData}
          operatorTours={operatorTours}
          categoryGuides={categoryGuides}
          faqs={faqs}
          reviews={reviews}
        />
      </Suspense>
      </>
    );
  } catch (error) {
    // Only log errors in development to reduce I/O during crawls
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching tour:', error);
    }
    notFound();
  }
}

