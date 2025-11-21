import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import TourDetailClient from './TourDetailClient';
import { getTourEnrichment, generateTourEnrichment, cleanText } from '@/lib/tourEnrichment';
import { getCachedTour, cacheTour, getCachedSimilarTours, cacheSimilarTours, generateSimilarToursCacheKey, getDestinationData } from '@/lib/viatorCache';
import { getTourPromotionScore } from '@/lib/promotionSystem';

/**
 * Generate metadata for tour detail page
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  // Extract productId from slug array (first element)
  const slug = resolvedParams.productId || resolvedParams.slug;
  const productId = Array.isArray(slug) ? slug[0] : slug;
  
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

    return {
      title: `${title} | TopTours.ai`,
      description: description.substring(0, 160),
      openGraph: {
        title: `${title} | TopTours.ai`,
        description: description.substring(0, 160),
        images: image ? [image] : [],
        type: 'website',
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
  const slug = resolvedParams.productId || resolvedParams.slug;
  const productId = Array.isArray(slug) ? slug[0] : slug;
  
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
        notFound();
      }

      tour = await productResponse.json();
      
      if (!tour || tour.error) {
        notFound();
      }

      // Cache the tour data for future requests
      await cacheTour(productId, tour);
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
          next: { revalidate: 21600 } // Revalidate every 6 hours
        });

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

    // Fetch destination data for country information (only if tour has destinationId and doesn't match our destinations)
    let destinationData = null;
    try {
      if (tour?.destinations && tour.destinations.length > 0) {
        const primaryDestination = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
        const destinationId = primaryDestination?.destinationId || primaryDestination?.id || primaryDestination?.ref;
        
        if (destinationId) {
          // Only fetch if we don't have a matching destination in our 182 destinations
          // This will be checked client-side, but we can fetch here for unmatched tours
          destinationData = await getDestinationData(destinationId);
        }
      }
    } catch (error) {
      console.error('Error fetching destination data:', error);
      // Non-critical, continue without destination data
    }

    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading tour...</p>
          </div>
        </div>
      }>
        <TourDetailClient tour={tour} similarTours={similarTours} productId={productId} enrichment={tourEnrichment} initialPromotionScore={promotionScore} destinationData={destinationData} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching tour:', error);
    notFound();
  }
}

