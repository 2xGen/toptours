import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import TourDetailClient from './TourDetailClient';
import RecommendedToursSection from './RecommendedToursSection';
import SimilarToursSection from './SimilarToursSection';
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
import { fetchProductRecommendations, fetchRecommendedTours } from '@/lib/viatorRecommendations';
import { getPricingPerAgeBand } from '@/lib/viatorPricing';
import { trackTourForSitemap, trackToursForSitemap } from '@/lib/tourSitemap';

// Revalidate every hour for fresh data
export const revalidate = 3600;

/**
 * Generate metadata for tour detail page
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  // Extract productId from slug array (first element)
  const slugParam = resolvedParams.productId || resolvedParams.slug;
  const productId = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  
  if (!productId) {
    return {
      title: 'Tour Not Found | TopTours.ai',
      description: 'The tour you are looking for could not be found.'
    };
  }

  try {
    // Try to get cached tour data first
    let tour = await getCachedTour(productId);
    
    if (!tour) {
      // Cache miss - fetch from Viator API
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

      tour = await productResponse.json();
      
      if (!tour || tour.error) {
        return {
          title: 'Tour Not Found | TopTours.ai',
          description: 'The tour you are looking for could not be found.'
        };
      }

      // Cache the tour data for future requests
      await cacheTour(productId, tour);
    }
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

/**
 * Tour detail page
 */
export default async function TourDetailPage({ params }) {
  const resolvedParams = await params;
  // Extract productId from slug array (first element) or direct productId param
  const slugParam = resolvedParams.productId || resolvedParams.slug;
  const productId = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  
  console.log(`🚀 [SERVER] TourDetailPage START for productId: ${productId}`);
  
  if (!productId) {
    notFound();
  }

  try {
    // Try to get cached tour data first
    let tour = await getCachedTour(productId);
    
    if (!tour) {
      // Cache miss - fetch from Viator API
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
        console.error(`❌ Tour ${productId} not found: ${productResponse.status}`);
        notFound();
      }

      tour = await productResponse.json();
      
      if (!tour || tour.error) {
        console.error(`❌ Tour ${productId} data error:`, tour?.error || 'No tour data');
        notFound();
      }

      // Cache the tour data for future requests
      await cacheTour(productId, tour);
    }

    // Parallelize independent data fetching operations after tour is loaded
    const [
      pricingResult,
      promotionScoreResult,
      tourEnrichmentResult,
      operatorPremiumDataResult,
      reviewsResult,
      recommendedProductCodesResult,
      pricingPerAgeBandResult
    ] = await Promise.allSettled([
      // Fetch pricing from search API (has pricing.summary.fromPrice)
      (async () => {
        try {
          const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
          const searchResponse = await fetch('https://api.viator.com/partner/search/freetext', {
            method: 'POST',
            headers: {
              'exp-api-key': apiKey,
              'Accept': 'application/json;version=2.0',
              'Accept-Language': 'en-US',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              searchTerm: productId,
              searchTypes: [
                {
                  searchType: 'PRODUCTS',
                  pagination: { start: 1, count: 1 }
                }
              ],
              currency: 'USD'
            }),
            next: { revalidate: 3600 } // Cache for 1 hour
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            const products = searchData?.products?.results || [];
            const foundProduct = products.find(p => 
              (p.productId || p.productCode) === productId
            );
            
            if (foundProduct?.pricing?.summary?.fromPrice) {
              return foundProduct.pricing.summary.fromPrice;
            }
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch pricing from search API:', error.message);
        }
        // Fallback: try to extract from tour object
        return tour?.pricing?.summary?.fromPrice || 
               tour?.pricing?.fromPrice || 
               tour?.pricingInfo?.fromPrice || 
               null;
      })(),
      
      // Fetch promotion score
      getTourPromotionScore(productId)
        .then(score => {
          // If tour doesn't exist in database, return 0 scores (fast, no API call needed)
          if (!score) {
            return {
              product_id: productId,
              total_score: 0,
              monthly_score: 0,
              weekly_score: 0,
              past_28_days_score: 0,
            };
          }
          return score;
        })
        .catch(() => ({
          product_id: productId,
          total_score: 0,
          monthly_score: 0,
          weekly_score: 0,
          past_28_days_score: 0,
        })),
      
      // Fetch tour enrichment
      getTourEnrichment(productId)
        .catch(() => null),
      
      // Fetch tour operator premium subscription data
      getTourOperatorPremiumSubscription(productId)
        .catch(() => null),
      
      // Fetch reviews (lazy loading on page visit) - now enabled for all tours
      (async () => {
        try {
          const currentReviewCount = tour.reviews?.totalReviews || 0;
          console.log(`🔍 [REVIEWS] Fetching reviews for tour ${productId} (count: ${currentReviewCount})...`);
          const reviewsData = await getCachedReviews(productId, currentReviewCount);
          console.log(`✅ [REVIEWS] Fetched ${reviewsData?.reviews?.length || 0} reviews for tour ${productId}`);
          return reviewsData;
        } catch (error) {
          console.error('❌ [REVIEWS] Error fetching reviews:', error);
          return null;
        }
      })(),
      
      // Fetch recommended product codes
      fetchProductRecommendations(productId)
        .catch(error => {
          console.error('❌ [RECOMMENDATIONS] Error fetching recommendations:', error);
          return [];
        }),
      
      // Fetch accurate pricing per age band from schedules API
      getPricingPerAgeBand(productId)
        .catch(error => {
          console.error('❌ [PRICING] Error fetching pricing per age band:', error);
          return null;
        })
    ]);

    // Extract results
    let pricing = pricingResult.status === 'fulfilled' ? pricingResult.value : null;
    let promotionScore = promotionScoreResult.status === 'fulfilled' ? promotionScoreResult.value : {
      product_id: productId,
      total_score: 0,
      monthly_score: 0,
      weekly_score: 0,
      past_28_days_score: 0,
    };
    let tourEnrichment = tourEnrichmentResult.status === 'fulfilled' ? tourEnrichmentResult.value : null;
    let operatorPremiumData = operatorPremiumDataResult.status === 'fulfilled' ? operatorPremiumDataResult.value : null;
    const reviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : null;
    const recommendedProductCodes = recommendedProductCodesResult.status === 'fulfilled' ? recommendedProductCodesResult.value : [];
    let pricingPerAgeBand = pricingPerAgeBandResult.status === 'fulfilled' ? pricingPerAgeBandResult.value : null;

    // Generate enrichment if not found
    if (!tourEnrichment || !tourEnrichment.ai_summary) {
      try {
        const generated = await generateTourEnrichment(productId, tour);
        if (!generated.error) {
          tourEnrichment = generated.data;
        }
      } catch (error) {
        console.error('Error generating tour enrichment server-side:', error);
      }
    }

    // Fetch operator tours and stats if premium data exists
    let operatorTours = [];
    if (operatorPremiumData) {
      try {
        operatorTours = await getOperatorPremiumTourIds(productId);
        const stats = await getOperatorAggregatedStats(operatorPremiumData.id);
        if (stats) {
          operatorPremiumData.aggregatedStats = stats;
        }
      } catch (error) {
        console.error('Error fetching operator tours/stats:', error);
      }
    }

    // Recommended tours are now fetched separately via Suspense for faster page load
    // (See RecommendedToursSection component)

    // Sync operator to CRM (lightweight, non-blocking)
    // Run sync regardless of cache status
    if (tour && productId) {
      try {
        console.log('🔄 [TOUR PAGE] Attempting CRM sync for:', productId);
        const crmModule = await import('@/lib/tourOperatorsCRM');
        // Sync operator to CRM (lightweight, non-blocking - fire and forget)
        if (crmModule.syncOperator) {
          // Don't await - let it run in background without blocking page render
          crmModule.syncOperator(tour, productId)
            .then((result) => {
              if (result && result.success) {
                console.log('✅ [TOUR PAGE] Operator synced:', result.operatorName);
              } else {
                console.warn('⚠️ [TOUR PAGE] Sync failed:', result?.error || 'Unknown error');
              }
            })
            .catch((err) => {
              // Silently handle errors - don't affect page rendering
              console.error('❌ [TOUR PAGE] CRM sync error (non-blocking):', err);
            });
        }
      } catch (err) {
        console.error('❌ [TOUR PAGE] CRM sync error:', err);
        console.error('❌ [TOUR PAGE] Error stack:', err.stack);
      }
    } else {
      console.warn('⚠️ [TOUR PAGE] Skipping CRM sync - missing tour or productId', { hasTour: !!tour, productId });
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

    // Similar tours are now fetched separately via Suspense for faster page load
    // (See SimilarToursSection component)


    // Get destination name and country for breadcrumbs/sidebar
    // The tour response only includes destination ID (ref), not the name
    // So we need to fetch it from Viator destinations API if not in our 182 destinations
    let destinationData = null;
    try {
      // Generate slug helper function
      const generateSlug = (name) => {
        if (!name) return null;
        return name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      };
      
      let destinationId = null;
      let destinationNameFromTour = null;
      
      // Try to extract destination from tour.destinations array
      // IMPORTANT: Prioritize primary destination, but also log all destinations for debugging
      if (tour?.destinations && tour.destinations.length > 0) {
        console.log(`🔍 Tour ${productId} has ${tour.destinations.length} destination(s):`, 
          tour.destinations.map(d => ({
            ref: d?.ref,
            destinationId: d?.destinationId,
            id: d?.id,
            name: d?.destinationName || d?.name,
            primary: d?.primary
          }))
        );
        
        // Find primary destination first
        const primaryDestination = tour.destinations.find((dest) => dest?.primary);
        // If no primary, use first destination
        const selectedDestination = primaryDestination || tour.destinations[0];
        
        // CRITICAL: Use ref first (this is what Viator API provides), then fallback to other fields
        // The 'ref' field is the most reliable source of destination ID from Viator API
        destinationId = selectedDestination?.ref || selectedDestination?.destinationId || selectedDestination?.id;
        destinationNameFromTour = selectedDestination?.destinationName || selectedDestination?.name;
        
        // CRITICAL VALIDATION: Log the exact values we're extracting
        console.log(`✅ Selected destination for tour ${productId}:`, {
          destinationId,
          destinationIdType: typeof destinationId,
          destinationName: destinationNameFromTour,
          isPrimary: !!primaryDestination,
          totalDestinations: tour.destinations.length,
          rawDestination: {
            ref: selectedDestination?.ref,
            destinationId: selectedDestination?.destinationId,
            id: selectedDestination?.id,
            destinationName: selectedDestination?.destinationName,
            name: selectedDestination?.name
          }
        });
        
        // CRITICAL: Validate that we have a destination ID
        if (!destinationId) {
          console.error(`❌ CRITICAL: No destination ID extracted from tour ${productId}!`, {
            destinations: tour.destinations,
            selectedDestination
          });
        }
      }
      
      // Fallback: Try to extract from other tour fields if destinations array is empty
      if (!destinationId && tour) {
        // Check if there's a destinationId in other fields
        destinationId = tour.destinationId || tour.destination?.id || tour.destination?.ref;
        destinationNameFromTour = tour.destinationName || tour.destination?.name;
      }
      
      console.log(`🔍 Server: Extracting destination data for tour ${productId}:`, {
        destinationId,
        destinationNameFromTour,
        hasDestinationsArray: !!(tour?.destinations && tour.destinations.length > 0),
        destinationsCount: tour?.destinations?.length || 0,
      });
      
      if (destinationId) {
        const destinationIdString = destinationId.toString();
        const normalizedDestinationId = destinationIdString.replace(/^d/i, '');
        let destinationResolved = false;

        // CRITICAL: Log what we're about to query
        console.log(`🔍 [DESTINATION LOOKUP] Starting lookup for tour ${productId}:`, {
          originalDestinationId: destinationId,
          destinationIdString,
          normalizedDestinationId,
          destinationNameFromTour
        });

        // 1) Preferred: Supabase (viator_destinations table)
        try {
          // Clear cache for this ID to ensure fresh lookup (prevents wrong cached data)
          const { clearMemoryCache } = await import('@/lib/supabaseCache');
          clearMemoryCache(`viator_destination_${normalizedDestinationId}`);
          
          console.log(`🔍 [DESTINATION LOOKUP] Querying database for ID: "${normalizedDestinationId}"`);
          
          // CRITICAL: Also do a direct database query to verify
          const { createSupabaseServiceRoleClient } = await import('@/lib/supabaseClient');
          const supabase = createSupabaseServiceRoleClient();
          const { data: directQueryResult, error: directQueryError } = await supabase
            .from('viator_destinations')
            .select('id, name, slug, country, region, type, parent_destination_id')
            .eq('id', normalizedDestinationId.toString())
            .maybeSingle();
          
          if (directQueryError) {
            console.error(`❌ [DESTINATION LOOKUP] Direct query error:`, directQueryError);
          } else if (directQueryResult) {
            console.log(`✅ [DESTINATION LOOKUP] Direct database query result:`, {
              id: directQueryResult.id,
              name: directQueryResult.name,
              slug: directQueryResult.slug,
              requestedId: normalizedDestinationId,
              matches: directQueryResult.id?.toString() === normalizedDestinationId.toString()
            });
            
            // CRITICAL: If direct query returns wrong destination, log error
            if (directQueryResult.name && directQueryResult.name.toLowerCase().includes('new york')) {
              console.error(`❌ CRITICAL: Direct database query returned "New York" for ID ${normalizedDestinationId}!`);
              console.error(`This means the database has wrong data or the ID is incorrect!`);
            }
          } else {
            console.warn(`⚠️ [DESTINATION LOOKUP] Direct query returned null for ID: ${normalizedDestinationId}`);
          }
          
          const supabaseDestination = await getViatorDestinationById(normalizedDestinationId);
          
          console.log(`🔍 [DESTINATION LOOKUP] Cache function returned:`, supabaseDestination ? {
            id: supabaseDestination.id,
            name: supabaseDestination.name,
            slug: supabaseDestination.slug,
            matchesRequested: supabaseDestination.id?.toString() === normalizedDestinationId,
            matchesDirectQuery: directQueryResult ? supabaseDestination.id === directQueryResult.id : 'N/A'
          } : 'null');
          if (supabaseDestination) {
            // CRITICAL: Verify the returned destination matches the requested ID
            const returnedId = supabaseDestination.id?.toString();
            const requestedId = normalizedDestinationId.toString();
            if (returnedId !== requestedId) {
              console.error(`❌ CRITICAL: getViatorDestinationById returned wrong ID! Requested: ${requestedId}, Got: ${returnedId} (${supabaseDestination.name})`);
              // Don't use wrong data - fall through to next lookup method
              destinationResolved = false;
            } else {
              // Check if this is a child destination (has parent_destination_id)
              // If so, try to get the parent destination for better context
              let finalDestination = supabaseDestination;
              let finalDestinationId = normalizedDestinationId;
              
              if (supabaseDestination.parent_destination_id) {
                try {
                  const { createSupabaseServiceRoleClient } = await import('@/lib/supabaseClient');
                  const supabase = createSupabaseServiceRoleClient();
                  const { data: parentDest } = await supabase
                    .from('viator_destinations')
                    .select('id, name, slug, country, region, type')
                    .eq('id', supabaseDestination.parent_destination_id.toString())
                    .maybeSingle();
                  
                  if (parentDest) {
                    // Use parent destination if it's a major destination (COUNTRY, REGION, or well-known CITY)
                    // This ensures "Bali" shows instead of "Ubud" or "Seminyak"
                    const isMajorDestination = parentDest.type === 'COUNTRY' || 
                                              parentDest.type === 'REGION' || 
                                              parentDest.type === 'CITY' ||
                                              parentDest.name?.toLowerCase() === 'bali';
                    
                    if (isMajorDestination) {
                      console.log(`✅ Using parent destination ${parentDest.name} instead of child ${supabaseDestination.name}`);
                      finalDestination = parentDest;
                      finalDestinationId = parentDest.id.toString();
                    }
                  }
                } catch (parentError) {
                  console.warn('Could not fetch parent destination:', parentError);
                }
              }
              
              const slug = finalDestination.slug || generateSlug(finalDestination.name) || finalDestinationId;
              destinationData = {
                country: finalDestination.country || finalDestination.region || null,
                region: finalDestination.region || null,
                destinationName: finalDestination.name || null,
                destinationId: finalDestinationId,
                slug,
                source: 'supabase',
              };
              destinationResolved = true;
              console.log(`✅ [DESTINATION LOOKUP] Destination resolved via Supabase for ID ${normalizedDestinationId}:`, {
                requestedId: normalizedDestinationId,
                returnedId: finalDestinationId,
                name: finalDestination.name,
                slug: destinationData.slug,
                matches: finalDestinationId === normalizedDestinationId
              });
              
              // CRITICAL VALIDATION: Double-check the destination name matches what we expect
              if (finalDestination.name && finalDestination.name.toLowerCase().includes('new york')) {
                console.error(`❌ CRITICAL ERROR: Destination lookup returned "New York" for ID ${normalizedDestinationId}! This is WRONG!`);
                console.error(`Expected: Nusa Penida or Bali region`);
                console.error(`Got: ${finalDestination.name}`);
                // Don't use wrong data - this will cause booking errors!
                destinationResolved = false;
                destinationData = null;
              }
            }
          } else {
            console.warn(`⚠️ Supabase destination not found for ID ${normalizedDestinationId}, trying destinations table...`);
            // Try to look up in destinations table by lookup_id or id
            try {
              const { createSupabaseServiceRoleClient } = require('@/lib/supabaseClient');
              const supabase = createSupabaseServiceRoleClient();
              
              // Try lookup_id first (most common case)
              let { data: destData, error: destError } = await supabase
                .from('destinations')
                .select('id, name, slug, country')
                .eq('lookup_id', normalizedDestinationId)
                .limit(1)
                .maybeSingle();
              
              // If not found by lookup_id, try by id
              if (destError || !destData) {
                const { data: destDataById, error: destErrorById } = await supabase
                  .from('destinations')
                  .select('id, name, slug, country')
                  .eq('id', normalizedDestinationId)
                  .limit(1)
                  .maybeSingle();
                
                if (!destErrorById && destDataById) {
                  destData = destDataById;
                  destError = null;
                }
              }
              
              if (!destError && destData && destData.slug) {
                destinationData = {
                  country: destData.country || null,
                  region: null,
                  destinationName: destData.name || null,
                  destinationId: normalizedDestinationId,
                  slug: destData.slug, // Use the slug from database (e.g., "ajmer")
                  source: 'supabase_destinations_table',
                };
                destinationResolved = true;
                console.log(`✅ Destination resolved via destinations table for ID ${normalizedDestinationId}:`, destinationData);
              } else {
                console.warn(`⚠️ Destinations table lookup found no slug for ID ${normalizedDestinationId}`);
              }
            } catch (destTableError) {
              console.error(`❌ Destinations table lookup failed:`, destTableError?.message || destTableError);
            }
          }
        } catch (err) {
          console.error('❌ Supabase destination lookup failed:', err?.message || err);
        }

        if (!destinationResolved) {
          // 2) Fallback: Lookup destination name from stored JSON file
          let destinationInfo = null;
          try {
            console.log(`🔍 CRITICAL LOOKUP: Finding destination name for ID: ${normalizedDestinationId}`);
            destinationInfo = await getDestinationNameById(normalizedDestinationId);
            
            if (destinationInfo?.destinationName) {
              console.log(`✅ SUCCESS: Found "${destinationInfo.destinationName}" for ID ${normalizedDestinationId}`);
            } else {
              console.error(`❌ FAILED: No destination name found for ID ${normalizedDestinationId}`);
            }
          } catch (lookupError) {
            console.error(`❌ LOOKUP ERROR for ID ${normalizedDestinationId}:`, lookupError.message || lookupError);
            console.error('Stack:', lookupError.stack);
          }
          
          // Use lookup result if available, otherwise fall back to tour data
          let destinationName = destinationInfo?.destinationName || destinationNameFromTour;
          
          // LAST RESORT: Try to extract from tour title if still no name (e.g., "...from Aberfeldy")
          if (!destinationName && tour?.title) {
            const titleMatch = tour.title.match(/from\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,)/i);
            if (titleMatch && titleMatch[1]) {
              destinationName = titleMatch[1].trim();
              console.log(`🔧 SERVER FALLBACK: Extracted destination name from tour title: "${destinationName}"`);
            }
          }
          
          // CRITICAL: Always set destinationData with at least the ID
          // This ensures breadcrumbs work even if name lookup fails
          const slug = destinationName ? generateSlug(destinationName) : normalizedDestinationId;
          const country = destinationName ? extractCountryFromDestinationName(destinationName) : null;
          
          destinationData = {
            country: country || destinationName || null,
            destinationName: destinationName || null, // Can be null, but ID is always present
            destinationId: normalizedDestinationId, // ALWAYS include ID
            slug: slug || normalizedDestinationId, // Use ID as slug fallback
            source: destinationInfo?.destinationName
              ? 'stored_json'
              : destinationNameFromTour
                ? 'tour_data'
                : destinationName
                  ? 'tour_title'
                  : 'id_only',
          };
          
          // Debug logging
          console.log(`✅ Destination data set for tour ${productId}:`, {
            destinationId: destinationData.destinationId,
            destinationName: destinationData.destinationName || 'NOT FOUND',
            slug: destinationData.slug,
            country: destinationData.country || 'NOT FOUND',
            source: destinationInfo?.destinationName ? 'stored JSON' : (destinationNameFromTour ? 'tour data' : (destinationName ? 'tour title' : 'ID only'))
          });
          
          if (!destinationName) {
            console.warn(`⚠️ WARNING: No destination name found for ID ${normalizedDestinationId}, but ID is available for breadcrumbs`);
          }
        }
      } else {
        console.error(`❌ CRITICAL: No destination ID available for tour ${productId} - breadcrumbs will be broken!`);
        console.error('Tour structure:', JSON.stringify({
          hasDestinations: !!(tour?.destinations),
          destinationsLength: tour?.destinations?.length || 0,
          firstDestination: tour?.destinations?.[0],
        }, null, 2));
        destinationData = null;
      }
    } catch (error) {
      // Non-critical - destination data is optional, page works fine without it
      console.error('❌ ERROR extracting destination data:', error.message || error);
      console.error('Stack:', error.stack);
      destinationData = null;
    }
    
    // Final check - ensure destinationData is logged before passing to client
    console.log(`📤 FINAL destinationData for tour ${productId}:`, destinationData ? JSON.stringify(destinationData, null, 2) : 'NULL');
    
    // CRITICAL FALLBACK: If destinationData is still null but we have tour data, try one more time
    if (!destinationData && tour) {
      console.warn(`⚠️ FALLBACK: destinationData is null, attempting emergency extraction...`);
      
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
        console.log(`✅ FALLBACK: Found emergency destination ID: ${emergencyDestinationId}`);
        
        // Try lookup one more time - first try Supabase destinations table
        try {
          // Try Supabase destinations table first (has slug)
          const { createSupabaseServiceRoleClient } = await import('@/lib/supabaseClient');
          const supabase = createSupabaseServiceRoleClient();
          const normalizedEmergencyId = emergencyDestinationId.toString().replace(/^d/i, '');
          const { data: destData, error: destError } = await supabase
            .from('destinations')
            .select('id, name, slug, country')
            .or(`lookup_id.eq.${normalizedEmergencyId},id.eq.${normalizedEmergencyId}`)
            .limit(1)
            .single();
          
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
            console.log(`✅ FALLBACK SUCCESS: Found in destinations table:`, destinationData);
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
            
            console.log(`✅ FALLBACK SUCCESS: Set destinationData from JSON:`, destinationData);
          }
        } catch (fallbackError) {
          console.error(`❌ FALLBACK ERROR:`, fallbackError);
          // Still set it with just the ID
          destinationData = {
            destinationId: emergencyDestinationId.toString(),
            destinationName: emergencyDestinationName || null,
            slug: emergencyDestinationName ? emergencyDestinationName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : emergencyDestinationId.toString(),
            country: null,
            source: emergencyDestinationName ? 'emergency_tour_data' : 'emergency_id_only',
          };
        }
      } else {
        console.error(`❌ FALLBACK FAILED: Could not extract any destination ID from tour object`);
      }
    }

    // Get category guides for this destination - AFTER all destination data resolution
    // The database stores guides with destination_id as slug (e.g., "ajmer", "nantes", "gujarat")
    // We can directly query category_guides table using the slug
    console.error(`🔍 [SERVER] ===== GUIDE FETCHING CODE REACHED for tour ${productId} =====`);
    console.log(`🔍 [SERVER] ===== GUIDE FETCHING CODE REACHED for tour ${productId} =====`);
    let categoryGuides = [];
    try {
      console.log(`🔍 [SERVER] Guide Fetching START for tour ${productId}`);
      console.log(`🔍 destinationData:`, destinationData ? JSON.stringify(destinationData, null, 2) : 'NULL');
      
      // Get slug from destinationData (preferred - already resolved)
      let destinationSlug = destinationData?.slug;
      let destinationId = destinationData?.destinationId;

      // If destinationData is null, extract ID from tour object
      if (!destinationId && tour?.destinations && tour.destinations.length > 0) {
        const primaryDest = tour.destinations.find((d) => d?.primary) || tour.destinations[0];
        destinationId = primaryDest?.ref || primaryDest?.destinationId || primaryDest?.id;
        console.log(`🔍 Extracted destinationId from tour object: ${destinationId}`);
      }
      
      console.log(`🔍 Current state - destinationSlug: "${destinationSlug}", destinationId: "${destinationId}"`);

      // If no slug but we have ID, query Supabase viator_destinations table to get slug (same as client does)
      if (!destinationSlug && destinationId) {
        try {
          // First try getViatorDestinationById (same function used elsewhere)
          const normalizedId = destinationId.toString().replace(/^d/i, '');
          console.log(`🔍 [SERVER] Calling getViatorDestinationById("${normalizedId}")...`);
          const viatorDest = await getViatorDestinationById(normalizedId);
          console.log(`🔍 [SERVER] getViatorDestinationById returned:`, viatorDest ? JSON.stringify(viatorDest, null, 2) : 'NULL');
          
          if (viatorDest && viatorDest.slug) {
            destinationSlug = viatorDest.slug;
            console.log(`✅ [SERVER] Guide Fetching: Found destination slug "${destinationSlug}" from viator_destinations for ID ${normalizedId}`);
          } else if (viatorDest && viatorDest.name) {
            // If no slug but we have name, generate slug from name
            destinationSlug = viatorDest.name
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            console.log(`✅ Guide Fetching: Generated slug "${destinationSlug}" from viator_destinations name "${viatorDest.name}"`);
          } else {
            // Fallback: try destinations table
            const { createSupabaseServiceRoleClient } = require('@/lib/supabaseClient');
            const supabase = createSupabaseServiceRoleClient();
            
            // Try lookup_id first
            let { data: destData, error: destError } = await supabase
              .from('destinations')
              .select('id, name, slug, country')
              .eq('lookup_id', normalizedId)
              .limit(1)
              .maybeSingle();
            
            // If not found, try by id
            if (destError || !destData) {
              const { data: destDataById, error: destErrorById } = await supabase
                .from('destinations')
                .select('id, name, slug, country')
                .eq('id', normalizedId)
                .limit(1)
                .maybeSingle();
              
              if (!destErrorById && destDataById) {
                destData = destDataById;
                destError = null;
              }
            }
            
            if (!destError && destData && destData.slug) {
              destinationSlug = destData.slug;
              console.log(`✅ Guide Fetching: Found destination slug "${destinationSlug}" from destinations table for ID ${normalizedId}`);
            } else if (!destError && destData && destData.name) {
              // If no slug but we have name, generate slug from name
              destinationSlug = destData.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              console.log(`✅ Guide Fetching: Generated slug "${destinationSlug}" from destinations table name "${destData.name}"`);
            }
          }
        } catch (supabaseError) {
          console.warn(`⚠️ Guide Fetching: Supabase query failed:`, supabaseError?.message || supabaseError);
        }
      }

      // If still no slug, try to get from destination name
      if (!destinationSlug && destinationData?.destinationName) {
        destinationSlug = destinationData.destinationName
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        console.log(`✅ Guide Fetching: Generated slug "${destinationSlug}" from destinationData.name`);
      }

      // If still no slug, try tour object (same logic as client)
      if (!destinationSlug && tour?.destinations && tour.destinations.length > 0) {
        const primaryDest = tour.destinations.find((d) => d?.primary) || tour.destinations[0];
        let destName = primaryDest?.destinationName || primaryDest?.name;
        
        // If still no name, try extracting from tour title (same as client does)
        if (!destName && tour?.title) {
          const titleMatch = tour.title.match(/from\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,)/i);
          if (titleMatch && titleMatch[1]) {
            destName = titleMatch[1].trim();
            console.log(`🔍 [SERVER] Extracted destination name "${destName}" from tour title`);
          }
        }
        
        if (destName) {
          destinationSlug = destName
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          console.log(`✅ [SERVER] Guide Fetching: Generated slug "${destinationSlug}" from tour object/title`);
        }
      }

      // Now query guides directly using the slug
      console.log(`🔍 [SERVER] Final state before query - destinationSlug: "${destinationSlug}"`);
      
      if (destinationSlug) {
        // Check if slug is numeric (like "51525") - if so, we already tried to get real slug above
        const isNumericSlug = /^\d+$/.test(destinationSlug);
        console.log(`🔍 [SERVER] Slug is numeric: ${isNumericSlug}`);
        
        if (!isNumericSlug) {
          // Query database directly using the slug
          console.log(`🔍 [SERVER] Querying getAllCategoryGuidesForDestination("${destinationSlug}")`);
          categoryGuides = await getAllCategoryGuidesForDestination(destinationSlug);
          console.log(`📚 [SERVER] Tour Page - Fetched ${categoryGuides.length} category guides for slug: "${destinationSlug}"`);
          
          // If no guides found, check if it's a hardcoded destination
          if (categoryGuides.length === 0) {
            const matchedDest = destinations.find(d => d.id === destinationSlug);
            if (matchedDest) {
              // Try with hardcoded destination ID
              categoryGuides = await getAllCategoryGuidesForDestination(matchedDest.id);
              console.log(`📚 [SERVER] Tour Page - Fetched ${categoryGuides.length} category guides using hardcoded destination ID: "${matchedDest.id}"`);
            }
          }
        } else {
          console.warn(`⚠️ [SERVER] Tour Page - Slug is still numeric "${destinationSlug}" after all lookups. Cannot query guides.`);
          console.warn(`⚠️ [SERVER] This means getViatorDestinationById did not return a slug for ID ${destinationId}`);
        }
      } else {
        console.warn(`⚠️ [SERVER] Tour Page - No destination slug available for fetching guides (productId: ${productId})`);
        console.warn(`⚠️ [SERVER] destinationData:`, JSON.stringify(destinationData, null, 2));
        console.warn(`⚠️ [SERVER] tour.destinations:`, JSON.stringify(tour?.destinations?.[0], null, 2));
      }
      
      console.log(`🔍 [SERVER] Guide Fetching END - categoryGuides.length: ${categoryGuides.length}`);
    } catch (error) {
      console.error('❌ [SERVER] Error fetching category guides:', error);
      console.error('❌ [SERVER] Error stack:', error.stack);
    }

    // Check if destination has restaurants
    let restaurantCount = 0;
    let restaurants = [];
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
      console.warn('Could not fetch restaurant data (non-critical):', error.message || error);
      restaurantCount = 0;
      restaurants = [];
    }

    // Generate FAQs for SEO and user value
    let faqs = [];
    let faqSchema = null;
    try {
      faqs = await generateTourFAQs(tour, destinationData, productId);
      if (faqs && faqs.length > 0) {
        faqSchema = generateFAQSchema(faqs);
      }
    } catch (error) {
      console.error('Error generating FAQs:', error);
      // Continue without FAQs - not critical
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

    // Track tour for sitemap (non-blocking, fire and forget)
    trackTourForSitemap(productId, tour, destinationData);
    
    // Track recommended/similar tours for sitemap
    if (recommendedTours && recommendedTours.length > 0) {
      trackToursForSitemap(recommendedTours, destinationData);
    }

    return (
      <>
        {redirectScript}
        {/* BreadcrumbList Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema)
          }}
        />
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
          similarTours={[]} 
          productId={productId} 
          pricing={pricing}
          pricingPerAgeBand={pricingPerAgeBand}
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
          recommendedTours={[]}
        />
      </Suspense>
      
      {/* Stream recommended and similar tours separately for faster page load */}
      <RecommendedToursSection 
        productId={productId}
        tour={tour}
        destinationData={destinationData}
      />
      <SimilarToursSection 
        productId={productId}
        tour={tour}
        destinationData={destinationData}
      />
      </>
    );
  } catch (error) {
    console.error('Error fetching tour:', error);
    notFound();
  }
}

