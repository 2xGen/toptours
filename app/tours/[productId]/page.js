import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import TourDetailClient from './TourDetailClient';
import { getTourEnrichment, generateTourEnrichment, cleanText } from '@/lib/tourEnrichment';
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
    const title = tour.title || 'Tour';
    const baseDescription = tour.description?.summary || tour.description?.shortDescription || `Book ${title} and discover amazing experiences.`;
    const description = tourEnrichment?.ai_summary ? cleanText(tourEnrichment.ai_summary).slice(0, 300) : baseDescription;
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
    const slug = generateTourSlug(title);
    const canonicalUrl = slug ? `https://www.toptours.ai/tours/${productId}/${slug}` : `https://www.toptours.ai/tours/${productId}`;

    return {
      title: `${title} | TopTours.ai`,
      description: description.substring(0, 160),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${title} | TopTours.ai`,
        description: description.substring(0, 160),
        images: image ? [image] : [],
        type: 'website',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | TopTours.ai`,
        description: description.substring(0, 160),
        images: image ? [image] : [],
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

    // Fetch similar tours by searching for tours in the same category/destination
    // Extract destination and category from tour title
    let similarTours = [];
    try {
      // Try to extract destination name from title (first word or common destination names)
      const destinationKeywords = ['Aruba', 'Curaçao', 'Jamaica', 'Punta Cana', 'Nassau', 'Barbados', 'St. Lucia', 'Amalfi', 'Italy', 'Rome', 'Florence', 'Venice'];
      let searchTerm = tour.title || '';
      
      // If we can identify a destination, search for tours in that destination
      for (const dest of destinationKeywords) {
        if (tour.title?.includes(dest)) {
          // Search for tours in this destination with similar keywords
          const categoryKeywords = ['Sunset', 'Cruise', 'ATV', 'Snorkel', 'Dive', 'Catamaran', 'Cultural', 'Beach', 'Boat', 'Tour', 'Aperitif'];
          for (const keyword of categoryKeywords) {
            if (tour.title?.includes(keyword)) {
              searchTerm = `${dest} ${keyword}`;
              break;
            }
          }
          if (searchTerm === tour.title) {
            searchTerm = dest; // Fallback to just destination
          }
          break;
        }
      }
      
      // Generate cache key for similar tours
      const cacheKey = generateSimilarToursCacheKey(productId, searchTerm);
      
      // Try to get cached similar tours first
      const cachedSimilarTours = await getCachedSimilarTours(cacheKey);
      
      if (cachedSimilarTours) {
        similarTours = cachedSimilarTours;
      } else {
        // Cache miss - fetch from Viator API
        const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
        
        // COMPLIANCE: 120-second timeout for all Viator API calls
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds

        const similarResponse = await fetch('https://api.viator.com/partner/search/freetext', {
          method: 'POST',
          headers: {
            'exp-api-key': apiKey,
            'Accept': 'application/json;version=2.0',
            'Accept-Language': 'en-US',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            searchTerm: searchTerm,
            searchTypes: [{
              searchType: 'PRODUCTS',
              pagination: {
                start: 1,
                count: 20
              }
            }],
            currency: 'USD'
          }),
          next: { revalidate: 3600 }, // Revalidate every hour (compliant with max 1 hour cache rule)
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (similarResponse.ok) {
          const similarData = await similarResponse.json();
          const allTours = similarData.products?.results || [];
          // Filter out current tour and get top 6 similar ones (sorted by rating)
          similarTours = allTours
            .filter(t => {
              const tId = t.productId || t.productCode;
              return tId && tId !== productId;
            })
            .sort((a, b) => {
              const ratingA = a.reviews?.combinedAverageRating || 0;
              const ratingB = b.reviews?.combinedAverageRating || 0;
              return ratingB - ratingA;
            })
            .slice(0, 6);
          
          // Cache the similar tours for future requests
          await cacheSimilarTours(cacheKey, similarTours);
        }
      }
    } catch (error) {
      console.error('Error fetching similar tours:', error);
    }

    let tourEnrichment = null;
    try {
      tourEnrichment = await getTourEnrichment(productId);
    } catch (error) {
      console.error('Error fetching tour enrichment:', error);
    }

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

    // Fetch promotion score server-side for fast display (returns 0 if not found)
    let promotionScore = null;
    try {
      promotionScore = await getTourPromotionScore(productId);
      // If tour doesn't exist in database, return 0 scores (fast, no API call needed)
      if (!promotionScore) {
        promotionScore = {
          product_id: productId,
          total_score: 0,
          monthly_score: 0,
          weekly_score: 0,
          past_28_days_score: 0,
        };
      }
    } catch (error) {
      console.error('Error fetching promotion score:', error);
      // Default to 0 if error
      promotionScore = {
        product_id: productId,
        total_score: 0,
        monthly_score: 0,
        weekly_score: 0,
        past_28_days_score: 0,
      };
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
      if (tour?.destinations && tour.destinations.length > 0) {
        const primaryDestination = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
        destinationId = primaryDestination?.ref || primaryDestination?.destinationId || primaryDestination?.id;
        destinationNameFromTour = primaryDestination?.destinationName || primaryDestination?.name;
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

        // 1) Preferred: Supabase (viator_destinations table)
        try {
          const supabaseDestination = await getViatorDestinationById(normalizedDestinationId);
          if (supabaseDestination) {
            const slug = supabaseDestination.slug || generateSlug(supabaseDestination.name) || normalizedDestinationId;
            destinationData = {
              country: supabaseDestination.country || supabaseDestination.region || null,
              region: supabaseDestination.region || null,
              destinationName: supabaseDestination.name || null,
              destinationId: supabaseDestination.id || normalizedDestinationId,
              slug,
              source: 'supabase',
            };
            destinationResolved = true;
            console.log(`✅ Destination resolved via Supabase for ID ${normalizedDestinationId}:`, destinationData);
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

    return (
      <>
        {redirectScript}
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
          enrichment={tourEnrichment} 
          initialPromotionScore={promotionScore} 
          destinationData={destinationData} 
          restaurantCount={restaurantCount}
          restaurants={restaurants}
          operatorPremiumData={operatorPremiumData}
          operatorTours={operatorTours}
          categoryGuides={categoryGuides}
        />
      </Suspense>
      </>
    );
  } catch (error) {
    console.error('Error fetching tour:', error);
    notFound();
  }
}

