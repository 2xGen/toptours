import { notFound } from 'next/navigation';
import TourDetailClient from '../[productId]/TourDetailClient';
import { getTourEnrichment } from '@/lib/tourEnrichment';
import { destinations as siteDestinations } from '@/data/destinationsData';
import { slugToViatorId, viatorRefToSlug } from '@/data/viatorDestinationMap';
import { getTourOperatorPremiumSubscription, getOperatorPremiumTourIds, getOperatorAggregatedStats } from '@/lib/tourOperatorPremiumServer';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';
import { generateTourFAQs, generateFAQSchema } from '@/lib/faqGeneration';
import { buildEnhancedMetaDescription, buildEnhancedTitle } from '@/lib/metaDescription';
import { getCachedReviews } from '@/lib/viatorReviews';
import { fetchProductRecommendations, fetchRecommendedTours } from '@/lib/viatorRecommendations';
import { getPricingPerAgeBand } from '@/lib/viatorPricing';

/**
 * Generate metadata for tour detail page
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  // Extract productId from slug array (first element)
  const slug = resolvedParams.slug || [];
  const productId = Array.isArray(slug) ? slug[0] : slug;
  
  if (!productId) {
    return {
      title: 'Tour Not Found | TopTours.ai',
      description: 'The tour you are looking for could not be found.'
    };
  }

  try {
    // Fetch tour data directly from Viator API
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
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!productResponse.ok) {
      return {
        title: 'Tour Not Found | TopTours.ai',
        description: 'The tour you are looking for could not be found.'
      };
    }

    const tour = await productResponse.json();
    
    if (!tour || tour.error) {
      return {
        title: 'Tour Not Found | TopTours.ai',
        description: 'The tour you are looking for could not be found.'
      };
    }
    // Extract destination name from tour for metadata
    let destinationNameForMeta = null;
    if (Array.isArray(tour.destinations) && tour.destinations.length > 0) {
      const primary = tour.destinations.find(d => d.primary) || tour.destinations[0];
      destinationNameForMeta = primary.destinationName || primary.name || null;
    }
    
    // Get enrichment for enhanced meta description (optional, don't block on error)
    let enrichment = null;
    try {
      enrichment = await getTourEnrichment(productId);
    } catch (error) {
      // Non-critical, continue without enrichment
      console.warn('Could not fetch enrichment for metadata:', error);
    }
    
    // Build enhanced title and description
    const title = buildEnhancedTitle(tour, { destinationName: destinationNameForMeta }, enrichment);
    const description = buildEnhancedMetaDescription(tour, { destinationName: destinationNameForMeta }, enrichment);
    const image = tour.images?.[0]?.variants?.[3]?.url || tour.images?.[0]?.variants?.[0]?.url || '';

    // Generate canonical URL
    const tourTitle = tour.title || 'Tour';
    const tourSlug = tour.slug || (tourTitle ? tourTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '');
    const canonicalUrl = tourSlug ? `https://toptours.ai/tours/${productId}/${tourSlug}` : `https://toptours.ai/tours/${productId}`;

    return {
      title: title,
      description: description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: title,
        description: description,
        images: image ? [image] : [],
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
    console.error('Error generating metadata:', error);
    return {
      title: 'Tour | TopTours.ai',
      description: 'Discover amazing tours and experiences.'
    };
  }
}

const normalizeString = (value) => {
  if (!value) return '';
  return value
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getSlugFromRef = (ref) => {
  if (!ref) return null;
  const normalized = String(ref).replace(/^d/i, '');
  return viatorRefToSlug[normalized] || viatorRefToSlug[`d${normalized}`] || null;
};

const getDestinationSlugFromArray = (tour) => {
  if (!Array.isArray(tour?.destinations) || tour.destinations.length === 0) {
    return null;
  }
  const primary = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
  if (!primary) return null;

  // CRITICAL: If we have a hardcoded destination slug, use it
  if (typeof primary.id === 'string' && slugToViatorId[primary.id]) {
    return primary.id;
  }

  // CRITICAL: Try to get slug from ref/ID mapping (only for hardcoded destinations)
  const slugFromRef =
    getSlugFromRef(primary.destinationId) ||
    getSlugFromRef(primary.id) ||
    getSlugFromRef(primary.ref);
  
  // CRITICAL: Only use slugFromRef if it's NOT "new-york-city" for ID 60448
  // This prevents wrong matches from the hardcoded map
  if (slugFromRef) {
    const refId = primary.ref || primary.destinationId || primary.id;
    if (refId) {
      const normalizedRefId = String(refId).replace(/^d/i, '');
      // If destination ID is 60448 but slug is "new-york-city", it's WRONG - don't use it
      if (normalizedRefId === '60448' && slugFromRef === 'new-york-city') {
        console.error(`❌ CRITICAL: getDestinationSlugFromArray rejected wrong slug "new-york-city" for ID 60448`);
        // Don't return wrong slug - let it fall through to database lookup
      } else {
        return slugFromRef;
      }
    } else {
      return slugFromRef;
    }
  }

  // CRITICAL: Don't use name matching for database destinations (like 60448)
  // Name matching can incorrectly match to wrong destinations
  // Instead, return null and let the database lookup handle it
  const refId = primary.ref || primary.destinationId || primary.id;
  if (refId) {
    const normalizedRefId = String(refId).replace(/^d/i, '');
    // If we have a numeric ID that's not in the hardcoded map, it's a database destination
    // Don't use name matching - let database lookup handle it
    if (!isNaN(parseInt(normalizedRefId)) && !viatorRefToSlug[normalizedRefId] && !viatorRefToSlug[`d${normalizedRefId}`]) {
      console.log(`🔍 [getDestinationSlugFromArray] ID ${normalizedRefId} not in hardcoded map, skipping name matching (will use database lookup)`);
      return null; // Force database lookup
    }
  }

  // Only use name matching for destinations without IDs or if ID is in hardcoded map
  const name = normalizeString(primary.destinationName || primary.name);
  if (name) {
    const matched = siteDestinations.find((dest) => {
      const candidates = [
        dest.id,
        dest.name,
        dest.fullName,
        dest.country,
      ]
        .filter(Boolean)
        .map(normalizeString);
      return candidates.some((candidate) => candidate && (candidate === name || name.includes(candidate)));
    });
    if (matched) return matched.id;
  }
  return null;
};

const matchDestinationSlugByName = (tour) => {
  // CRITICAL: NEVER use name matching if we have a destination ID from Viator
  // Name matching is unreliable and can match to wrong destinations
  // If we have a destination ID, we MUST use database lookup
  if (Array.isArray(tour?.destinations) && tour.destinations.length > 0) {
    const primary = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
    const destinationId = primary?.ref || primary?.destinationId || primary?.id;
    if (destinationId) {
      const normalizedId = String(destinationId).replace(/^d/i, '');
      // If we have a numeric ID, it's a Viator destination - use database lookup, not name matching
      if (!isNaN(parseInt(normalizedId))) {
        console.log(`🔍 [matchDestinationSlugByName] Skipping name matching for destination ID ${normalizedId} - will use database lookup`);
        return null; // Force database lookup
      }
    }
  }

  // Only use name matching if we have NO destination ID from Viator
  const candidateStrings = [
    tour.destinationName,
    tour.title,
    tour.summary,
    tour.description?.summary,
    tour.description?.shortDescription,
  ];

  if (Array.isArray(tour?.destinations)) {
    tour.destinations.forEach((dest) => {
      candidateStrings.push(dest?.destinationName, dest?.name);
    });
  }

  const normalizedCandidates = candidateStrings.map(normalizeString).filter(Boolean);
  if (normalizedCandidates.length === 0) return null;

  for (const destination of siteDestinations) {
    const destinationCandidates = [
      destination.id,
      destination.name,
      destination.fullName,
      destination.country,
    ]
      .filter(Boolean)
      .map(normalizeString)
      .filter(Boolean);

    const hasMatch = destinationCandidates.some((candidate) =>
      normalizedCandidates.some(
        (needle) => needle === candidate || needle.includes(candidate) || candidate.includes(needle)
      )
    );
    if (hasMatch) {
      return destination.id;
    }
  }
  return null;
};

const resolveDestinationSlug = (tour) => {
  const slugFromArray = getDestinationSlugFromArray(tour);
  
  // CRITICAL: If getDestinationSlugFromArray returns null (database destination not in hardcoded map),
  // NEVER fall back to name matching - it's unreliable and causes wrong matches
  // Return null so database lookup code runs instead
  if (slugFromArray === null && Array.isArray(tour?.destinations) && tour.destinations.length > 0) {
    const primary = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
    const destinationId = primary?.ref || primary?.destinationId || primary?.id;
    if (destinationId) {
      const normalizedId = String(destinationId).replace(/^d/i, '');
      // If we have a numeric ID that's not in the hardcoded map, it's a database destination
      // Don't use name matching - force database lookup
      if (!isNaN(parseInt(normalizedId)) && !viatorRefToSlug[normalizedId] && !viatorRefToSlug[`d${normalizedId}`]) {
        console.log(`🔍 [resolveDestinationSlug] Destination ID ${normalizedId} not in hardcoded map - returning null to force database lookup`);
        return null; // Force database lookup - don't use unreliable name matching
      }
    }
  }
  
  // Only use name matching if we have NO destination ID from Viator
  return slugFromArray || matchDestinationSlugByName(tour);
};

/**
 * Tour detail page
 */
export default async function TourDetailPage({ params }) {
  const resolvedParams = await params;
  // Extract productId from slug array (first element)
  const slug = resolvedParams.slug || [];
  const productId = Array.isArray(slug) ? slug[0] : slug;
  
  if (!productId) {
    notFound();
  }

  try {
    // Fetch tour data directly from Viator API
    const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
    const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;
    
    console.log('Fetching tour from Viator API:', url);
    
    const productResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 } // Revalidate every hour
    });

    console.log('Viator API Response Status:', productResponse.status);

    if (!productResponse.ok) {
      const errorText = await productResponse.text();
      console.error('Viator API Error:', errorText);
      notFound();
    }

      const tour = await productResponse.json();
      
      if (!tour || tour.error) {
        console.error('Tour data error:', tour);
        notFound();
      }

      // Sync operator to CRM (lightweight, non-blocking - fire and forget)
      if (tour && productId) {
        // Don't await - let it run in background without blocking page render
        import('@/lib/tourOperatorsCRM')
          .then(({ syncOperator }) => syncOperator(tour, productId))
          .then((result) => {
            if (result && result.success) {
              console.log('✅ [TOUR PAGE SLUG] Operator synced:', result.operatorName);
            } else {
              console.warn('⚠️ [TOUR PAGE SLUG] Sync failed:', result?.error || 'Unknown error');
            }
          })
          .catch((err) => {
            // Silently handle errors - don't affect page rendering
            console.error('❌ [TOUR PAGE SLUG] CRM sync error (non-blocking):', err);
          });
      }

      // CRITICAL: Extract destination ID directly from Viator API response (100% accurate)
      // Then query our database to get the correct destination name and slug
      // NO MORE name matching or hardcoded map guessing - database is source of truth
      let primaryDestinationSlug = null;
      let viatorDestinationIdForTour = null;
      
      if (tour?.destinations && tour.destinations.length > 0) {
        const primaryDest = tour.destinations.find((d) => d?.primary) || tour.destinations[0];
        const destinationId = primaryDest?.ref || primaryDest?.destinationId || primaryDest?.id;
        
        if (destinationId) {
          const normalizedId = destinationId.toString().replace(/^d/i, '');
          viatorDestinationIdForTour = normalizedId;
          
          // Query database directly - this is 100% accurate
          try {
            const { getViatorDestinationById, clearMemoryCache } = await import('@/lib/supabaseCache');
            
            // Clear cache to ensure fresh lookup
            if (clearMemoryCache && typeof clearMemoryCache === 'function') {
              clearMemoryCache(`viator_destination_${normalizedId}`);
            }
            
            const dbDestination = await getViatorDestinationById(normalizedId);
            
            if (dbDestination) {
              // Use slug from database (most accurate)
              if (dbDestination.slug) {
                primaryDestinationSlug = dbDestination.slug;
                console.log(`✅ [SLUG PAGE] Got destination slug "${primaryDestinationSlug}" from database for ID ${normalizedId}`);
              } else if (dbDestination.name) {
                // Generate slug from name if no slug in database
                primaryDestinationSlug = dbDestination.name
                  .toLowerCase()
                  .trim()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '');
                console.log(`✅ [SLUG PAGE] Generated slug "${primaryDestinationSlug}" from database name "${dbDestination.name}" for ID ${normalizedId}`);
              }
            } else {
              console.warn(`⚠️ [SLUG PAGE] Database lookup returned null for destination ID ${normalizedId}`);
            }
          } catch (error) {
            console.error(`❌ [SLUG PAGE] Error querying database for destination ID ${normalizedId}:`, error);
          }
        }
      }
      
      // Fallback: Only use hardcoded map if we have a slug but no database result
      // This is for hardcoded destinations only (like "aruba", "bali", etc.)
      if (!primaryDestinationSlug && viatorDestinationIdForTour) {
        const hardcodedSlug = viatorRefToSlug[viatorDestinationIdForTour] || viatorRefToSlug[`d${viatorDestinationIdForTour}`];
        if (hardcodedSlug) {
          primaryDestinationSlug = hardcodedSlug;
          console.log(`✅ [SLUG PAGE] Using hardcoded slug "${primaryDestinationSlug}" for ID ${viatorDestinationIdForTour}`);
        }
      }

    // Try to fetch pricing from search API (search results include pricing)
    let pricing = null;
    try {
      const searchResponse = await fetch('https://api.viator.com/partner/search/freetext', {
        method: 'POST',
        headers: {
          'exp-api-key': apiKey,
          'Accept': 'application/json;version=2.0',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchTerm: productId, // Search by productId for more reliable results
          searchTypes: [{
            searchType: 'PRODUCTS',
            pagination: {
              start: 1,
              count: 1 // Only need 1 result since we're searching by productId
            }
          }],
          currency: 'USD'
        }),
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const products = searchData.products?.results || [];
        // Find the current product in search results to get pricing
        const currentProduct = products.find(p => {
          const pId = p.productId || p.productCode;
          return pId === productId;
        });
        if (currentProduct?.pricing?.summary?.fromPrice) {
          pricing = currentProduct.pricing.summary.fromPrice;
        }
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }

    const deriveDestinationName = () => {
      if (Array.isArray(tour?.destinations) && tour.destinations.length > 0) {
        const entry = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
        if (entry?.destinationName || entry?.name) {
          return entry.destinationName || entry.name;
        }
      }
      if (primaryDestinationSlug) {
        const matchedDestination = siteDestinations.find((dest) => dest.id === primaryDestinationSlug);
        if (matchedDestination) {
          return matchedDestination.fullName || matchedDestination.name;
        }
      }
      return tour.destinationName || '';
    };

    const buildSimilarToursList = (tours = []) =>
      tours
        .filter((t) => {
          const tId = t.productId || t.productCode;
          return tId && tId !== productId;
        })
        .sort((a, b) => {
          const ratingA = a.reviews?.combinedAverageRating || 0;
          const ratingB = b.reviews?.combinedAverageRating || 0;
          return ratingB - ratingA;
        })
        .slice(0, 9);

    const fetchToursForDestination = async (searchTerm, destinationId = null) => {
      if (!searchTerm) return [];

      // COMPLIANCE: Only fetch page 1 (max 50 products) - no automatic pagination
      // This is for "similar tours" display, which is user-initiated (user viewing a tour)
      const toursPerPage = 20; // Under 50 limit
      const start = 1; // Always start at 1, no pagination

      try {
        const response = await fetch('https://api.viator.com/partner/search/freetext', {
          method: 'POST',
          headers: {
            'exp-api-key': apiKey,
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en-US',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchTerm,
            productFiltering: destinationId
              ? {
                  destination: String(destinationId).replace(/^d/, ''), // Remove 'd' prefix if present (e.g., 'd4215' -> '4215')
                }
              : undefined,
            searchTypes: [
              {
                searchType: 'PRODUCTS',
                pagination: {
                  start,
                  count: toursPerPage,
                },
              },
            ],
            currency: 'USD',
          }),
          next: { revalidate: 3600 }, // Cache for 1 hour (compliant)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Similar tours error:`, response.status, errorText);
          return [];
        }

        const data = await response.json();
        return data.products?.results || [];
      } catch (error) {
        console.error('Error fetching similar tours:', error);
        return [];
      }
    };

    const destinationNameForSearch = deriveDestinationName() || tour.title || '';
    let similarTours = [];

    try {
      if (destinationNameForSearch) {
        const primaryResults = await fetchToursForDestination(
          destinationNameForSearch,
          viatorDestinationIdForTour
        );
        similarTours = buildSimilarToursList(primaryResults);
      }

      if (similarTours.length === 0 && viatorDestinationIdForTour) {
        const fallbackResults = await fetchToursForDestination(
          destinationNameForSearch || tour.title || productId,
          viatorDestinationIdForTour
        );
        similarTours = buildSimilarToursList(fallbackResults);
      }

      if (similarTours.length === 0 && destinationNameForSearch) {
        const finalResults = await fetchToursForDestination(destinationNameForSearch, null);
        similarTours = buildSimilarToursList(finalResults);
      }
    } catch (error) {
      console.error('Error fetching similar tours:', error);
      similarTours = [];
    }

    const enrichment = await getTourEnrichment(productId);

    // Get category guides for this destination - use slug (same as destination detail page)
    // For database destinations, the database stores destination_id as the slug (e.g., "ajmer")
    let categoryGuides = [];
    let destinationData = null;
    try {
      // Use primaryDestinationSlug that we got from database lookup above
      // This is 100% accurate because it comes directly from the database using Viator's destination ID
      let destinationSlug = primaryDestinationSlug;
      
      // If we still don't have a slug, it means database lookup failed
      // This should rarely happen, but log it for debugging
      if (!destinationSlug && viatorDestinationIdForTour) {
        console.warn(`⚠️ [SLUG PAGE] No destination slug found for ID ${viatorDestinationIdForTour} - database lookup may have failed`);
      }
      
      // Fallback database lookup (shouldn't be needed if above worked)
      let resolvedViatorDest = null;
      if (!destinationSlug && tour?.destinations && tour.destinations.length > 0) {
        const primaryDest = tour.destinations.find((d) => d?.primary) || tour.destinations[0];
        const destinationId = primaryDest?.ref || primaryDest?.destinationId || primaryDest?.id;
        
        if (destinationId) {
          // Import getViatorDestinationById to resolve slug from ID
          const { getViatorDestinationById, clearMemoryCache } = await import('@/lib/supabaseCache');
          const normalizedId = destinationId.toString().replace(/^d/i, '');
          
          // CRITICAL: Clear cache to ensure fresh lookup
          if (clearMemoryCache && typeof clearMemoryCache === 'function') {
            clearMemoryCache(`viator_destination_${normalizedId}`);
          } else {
            console.warn(`⚠️ [SLUG PAGE] clearMemoryCache not available, skipping cache clear`);
          }
          
          console.log(`🔍 [SLUG PAGE] Querying database for destination ID: "${normalizedId}" (original: ${destinationId})`);
          
          // CRITICAL: Also do direct database query to verify
          const { createSupabaseServiceRoleClient } = await import('@/lib/supabaseClient');
          const supabase = createSupabaseServiceRoleClient();
          const { data: directQueryResult, error: directQueryError } = await supabase
            .from('viator_destinations')
            .select('id, name, slug, country, region, type, parent_destination_id')
            .eq('id', normalizedId.toString())
            .maybeSingle();
          
          if (directQueryError) {
            console.error(`❌ [SLUG PAGE] Direct query error for ID ${normalizedId}:`, directQueryError);
          } else if (directQueryResult) {
            console.log(`✅ [SLUG PAGE] Direct database query for ID ${normalizedId}:`, {
              id: directQueryResult.id,
              name: directQueryResult.name,
              slug: directQueryResult.slug,
              matchesRequested: directQueryResult.id?.toString() === normalizedId.toString()
            });
            
            // CRITICAL VALIDATION: Reject wrong destinations
            if (directQueryResult.name && directQueryResult.name.toLowerCase().includes('new york')) {
              console.error(`❌ CRITICAL ERROR: Database returned "New York" for ID ${normalizedId}!`);
              console.error(`Expected: Nusa Penida or Bali region`);
              console.error(`This is a DATABASE DATA ERROR - ID ${normalizedId} should NOT point to New York!`);
              // Don't use wrong data - this will cause booking errors!
            } else {
              // Use direct query result (most reliable)
              resolvedViatorDest = directQueryResult;
            }
          } else {
            console.warn(`⚠️ [SLUG PAGE] Direct query returned null for ID: ${normalizedId}`);
          }
          
          // Also try cache function (but validate it)
          const cachedResult = await getViatorDestinationById(normalizedId);
          if (cachedResult) {
            console.log(`🔍 [SLUG PAGE] Cache function returned:`, {
              id: cachedResult.id,
              name: cachedResult.name,
              slug: cachedResult.slug,
              matchesDirectQuery: directQueryResult ? cachedResult.id === directQueryResult.id : 'N/A'
            });
            
            // Use cached result only if it matches direct query OR if direct query failed
            if (!directQueryResult || cachedResult.id === directQueryResult.id) {
              resolvedViatorDest = cachedResult;
            } else {
              console.error(`❌ [SLUG PAGE] Cache function returned different result than direct query!`);
              console.error(`Direct query: ${directQueryResult.id} (${directQueryResult.name})`);
              console.error(`Cache function: ${cachedResult.id} (${cachedResult.name})`);
              // Use direct query result (more reliable)
            }
          }
          
          if (resolvedViatorDest?.slug) {
            // CRITICAL: Validate slug is not "new-york-city" for ID 60448
            if (normalizedId === '60448' && resolvedViatorDest.slug === 'new-york-city') {
              console.error(`❌ CRITICAL: Slug "new-york-city" returned for ID 60448! This is WRONG!`);
              console.error(`Expected: "nusa-penida" or "bali"`);
              // Don't use wrong slug
              destinationSlug = null;
            } else {
              destinationSlug = resolvedViatorDest.slug;
              console.log(`✅ [SERVER] Resolved slug "${destinationSlug}" from ID ${normalizedId} for database destination`);
            }
          } else if (resolvedViatorDest?.name) {
            // Generate slug from name
            const generatedSlug = resolvedViatorDest.name
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            
            // CRITICAL: Validate generated slug
            if (normalizedId === '60448' && (generatedSlug === 'new-york-city' || resolvedViatorDest.name.toLowerCase().includes('new york'))) {
              console.error(`❌ CRITICAL: Generated slug "new-york-city" for ID 60448! This is WRONG!`);
              console.error(`Name: ${resolvedViatorDest.name}`);
              // Don't use wrong slug
              destinationSlug = null;
            } else {
              destinationSlug = generatedSlug;
              console.log(`✅ [SERVER] Generated slug "${destinationSlug}" from name "${resolvedViatorDest.name}"`);
            }
          }
        }
      }
      
      // Step 3: Fetch guides using the resolved slug
      if (destinationSlug) {
        categoryGuides = await getAllCategoryGuidesForDestination(destinationSlug);
        console.log(`📚 [SERVER] Slugged Tour Page - Fetched ${categoryGuides.length} category guides for slug: ${destinationSlug}`);
        
        // Also create destinationData object for the client component
        const destinationFromSlug = siteDestinations.find((d) => d.id === destinationSlug);
        if (destinationFromSlug) {
          destinationData = {
            slug: destinationSlug,
            destinationName: destinationFromSlug.fullName || destinationFromSlug.name,
            destinationId: destinationFromSlug.destinationId || null,
            country: destinationFromSlug.country || null,
          };
        } else {
          // If not in hardcoded destinations, get name from viator destination or tour
          let destName = null;
          // Prefer name from resolved viator destination (most accurate)
          if (resolvedViatorDest?.name) {
            destName = resolvedViatorDest.name;
          } else if (tour?.destinations && tour.destinations.length > 0) {
            const primaryDest = tour.destinations.find((d) => d?.primary) || tour.destinations[0];
            destName = primaryDest?.destinationName || primaryDest?.name;
          }
          
          destinationData = {
            slug: destinationSlug,
            destinationName: destName || null,
            destinationId: null,
            country: resolvedViatorDest?.country || null,
          };
        }
      } else {
        console.warn(`⚠️ [SERVER] No destination slug resolved for tour ${productId}`);
      }
    } catch (error) {
      console.error('Error fetching category guides:', error);
    }

    // Fetch tour operator premium subscription data
    let operatorPremiumData = null;
    let operatorTours = [];
    try {
      operatorPremiumData = await getTourOperatorPremiumSubscription(productId);
      if (operatorPremiumData) {
        // Get other tours from the same operator
        operatorTours = await getOperatorPremiumTourIds(productId);
        // Get aggregated stats
        const stats = await getOperatorAggregatedStats(operatorPremiumData.id);
        if (stats) {
          operatorPremiumData.aggregatedStats = stats;
        }
      }
    } catch (error) {
      console.error('Error fetching tour operator premium data:', error);
      // Continue without premium data - not critical
    }

    // Build JSON-LD for Product/Tour and Breadcrumbs
    const operatorName =
      tour?.supplier?.name ||
      tour?.supplierName ||
      tour?.operator?.name ||
      tour?.vendor?.name ||
      tour?.partner?.name ||
      '';

    const productName = operatorName ? `${operatorName} – ${tour.title || 'Tour'}` : (tour.title || 'Tour');

    const mainImage =
      tour.images?.[0]?.variants?.[3]?.url ||
      tour.images?.[0]?.variants?.[0]?.url ||
      '';

    const aggregateRatingCount = tour.reviews?.totalReviews || 0;
    const aggregateRatingValue = tour.reviews?.combinedAverageRating || null;

    const destinationFromSlug = primaryDestinationSlug
      ? siteDestinations.find((d) => d.id === primaryDestinationSlug)
      : null;
    const destinationDisplayName =
      destinationFromSlug?.fullName ||
      destinationFromSlug?.name ||
      tour?.destinations?.[0]?.destinationName ||
      tour?.destinations?.[0]?.name ||
      null;

    const canonicalUrl = `https://toptours.ai/tours/${productId}${tour.seo?.title ? `/${encodeURIComponent(tour.seo.title.toLowerCase().replace(/[^a-z0-9]+/g,'-'))}` : ''}`;

    const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productName,
      description:
        tour.description?.summary ||
        tour.description?.shortDescription ||
        tour.viatorUniqueContent?.shortDescription ||
        '',
      image: mainImage ? [mainImage] : undefined,
      sku: productId,
      brand: operatorName
        ? {
            '@type': 'Organization',
            name: operatorName,
          }
        : undefined,
      offers: pricing
        ? {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'USD',
            price: typeof pricing === 'number' ? pricing : String(pricing),
            availability: 'https://schema.org/InStock',
          }
        : undefined,
      aggregateRating:
        aggregateRatingValue && aggregateRatingCount
          ? {
              '@type': 'AggregateRating',
              ratingValue: aggregateRatingValue,
              reviewCount: aggregateRatingCount,
            }
          : undefined,
      sameAs: tour?.productUrl ? [tour.productUrl] : undefined,
    };

    const breadcrumbItems = [
      { position: 1, name: 'Home', item: 'https://toptours.ai' },
      { position: 2, name: 'Destinations', item: 'https://toptours.ai/destinations' },
    ];
    if (primaryDestinationSlug && destinationDisplayName) {
      breadcrumbItems.push({
        position: 3,
        name: destinationDisplayName,
        item: `https://toptours.ai/destinations/${primaryDestinationSlug}`,
      });
      breadcrumbItems.push({
        position: 4,
        name: 'Tours',
        item: `https://toptours.ai/destinations/${primaryDestinationSlug}/tours`,
      });
      breadcrumbItems.push({
        position: 5,
        name: tour.title || 'Tour',
        item: canonicalUrl,
      });
    } else {
      breadcrumbItems.push({
        position: 3,
        name: tour.title || 'Tour',
        item: canonicalUrl,
      });
    }

    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems.map((b) => ({
        '@type': 'ListItem',
        position: b.position,
        name: b.name,
        item: b.item,
      })),
    };

    // Generate FAQs for SEO and user value
    let faqs = [];
    let faqSchema = null;
    try {
      console.log(`🔍 [FAQ] Generating FAQs for tour ${productId}...`);
      console.log(`🔍 [FAQ] Destination data:`, destinationData);
      faqs = await generateTourFAQs(tour, destinationData, productId);
      console.log(`✅ [FAQ] Generated ${faqs?.length || 0} FAQs for tour ${productId}`);
      if (faqs && faqs.length > 0) {
        faqSchema = generateFAQSchema(faqs);
        console.log(`✅ [FAQ] FAQ schema generated`);
      } else {
        console.warn(`⚠️ [FAQ] No FAQs generated for tour ${productId}`);
      }
    } catch (error) {
      console.error('❌ [FAQ] Error generating FAQs:', error);
      console.error('❌ [FAQ] Error stack:', error.stack);
      // Continue without FAQs - not critical
    }

    // Fetch reviews (lazy loading on page visit)
    // Only enable for specific Viator test tours
    const viatorTestTourIds = ['446074P1', '103020P7'];
    const isViatorTestTour = viatorTestTourIds.includes(productId);
    
    let reviews = null;
    if (isViatorTestTour) {
      try {
        const currentReviewCount = tour.reviews?.totalReviews || 0;
        console.log(`🔍 [REVIEWS] Fetching reviews for tour ${productId} (count: ${currentReviewCount})...`);
        reviews = await getCachedReviews(productId, currentReviewCount);
        console.log(`✅ [REVIEWS] Fetched ${reviews?.reviews?.length || 0} reviews for tour ${productId}`);
      } catch (error) {
        console.error('❌ [REVIEWS] Error fetching reviews:', error);
        // Continue without reviews - not critical
      }
    }

    // Fetch recommended tours using recommendations API
    // Only enable for specific Viator test tours
    let recommendedTours = [];
    if (isViatorTestTour) {
      try {
        console.log(`🔍 [RECOMMENDATIONS] Fetching recommendations for tour ${productId}...`);
        const recommendedProductCodes = await fetchProductRecommendations(productId);
        
        if (recommendedProductCodes && recommendedProductCodes.length > 0) {
          console.log(`🔍 [RECOMMENDATIONS] Fetching full tour data for ${recommendedProductCodes.length} recommended tours...`);
          recommendedTours = await fetchRecommendedTours(recommendedProductCodes.slice(0, 6)); // Limit to 6 tours
          console.log(`✅ [RECOMMENDATIONS] Fetched ${recommendedTours.length} recommended tours`);
        }
      } catch (error) {
        console.error('❌ [RECOMMENDATIONS] Error fetching recommendations:', error);
        // Continue without recommendations - not critical
      }
    }

    // Fetch accurate pricing per age band from schedules API
    let pricingPerAgeBand = null;
    try {
      console.log(`🔍 [PRICING] Fetching pricing per age band for tour ${productId}...`);
      pricingPerAgeBand = await getPricingPerAgeBand(productId);
      if (pricingPerAgeBand && Object.keys(pricingPerAgeBand).length > 0) {
        console.log(`✅ [PRICING] Fetched pricing for age bands:`, Object.keys(pricingPerAgeBand));
      } else {
        console.log(`⚠️ [PRICING] No pricing data available for tour ${productId}`);
      }
    } catch (error) {
      console.error('❌ [PRICING] Error fetching pricing per age band:', error);
      // Continue without pricing - will use estimates
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        {/* FAQPage Schema for SEO */}
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
        <TourDetailClient
          tour={tour}
          similarTours={similarTours}
          productId={productId}
          pricing={pricing}
          pricingPerAgeBand={pricingPerAgeBand}
          enrichment={enrichment}
          operatorPremiumData={operatorPremiumData}
          operatorTours={operatorTours}
          destinationData={destinationData}
          categoryGuides={categoryGuides}
          faqs={faqs}
          reviews={reviews}
          recommendedTours={recommendedTours}
        />
      </>
    );
  } catch (error) {
    console.error('Error fetching tour:', error);
    notFound();
  }
}

