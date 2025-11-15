import { notFound } from 'next/navigation';
import TourDetailClient from './TourDetailClient';
import { getTourEnrichment, generateTourEnrichment, cleanText } from '@/lib/tourEnrichment';

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
      notFound();
    }

    const tour = await productResponse.json();
    
    if (!tour || tour.error) {
      notFound();
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
      
      // Use Viator search API directly
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
        cache: 'no-store' // Don't cache search results
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

    return <TourDetailClient tour={tour} similarTours={similarTours} productId={productId} enrichment={tourEnrichment} />;
  } catch (error) {
    console.error('Error fetching tour:', error);
    notFound();
  }
}

