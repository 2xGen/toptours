import { notFound } from 'next/navigation';
import TourDetailClient from '../[productId]/TourDetailClient';
import { getTourEnrichment } from '@/lib/tourEnrichment';
import { destinations as siteDestinations } from '@/data/destinationsData';
import { slugToViatorId, viatorRefToSlug } from '@/data/viatorDestinationMap';

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
    const title = tour.title || 'Tour';
    const description = tour.description?.summary || tour.description?.shortDescription || `Book ${title} and discover amazing experiences.`;
    const image = tour.images?.[0]?.variants?.[3]?.url || tour.images?.[0]?.variants?.[0]?.url || '';

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

  if (typeof primary.id === 'string' && slugToViatorId[primary.id]) {
    return primary.id;
  }

  const slugFromRef =
    getSlugFromRef(primary.destinationId) ||
    getSlugFromRef(primary.id) ||
    getSlugFromRef(primary.ref);
  if (slugFromRef) {
    return slugFromRef;
  }

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
  return getDestinationSlugFromArray(tour) || matchDestinationSlugByName(tour);
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

      const primaryDestinationSlug = resolveDestinationSlug(tour);
      const viatorDestinationIdForTour = primaryDestinationSlug ? slugToViatorId[primaryDestinationSlug] : null;

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
          searchTerm: tour.title || productId,
          searchTypes: [{
            searchType: 'PRODUCTS',
            pagination: {
              start: 1,
              count: 10
            }
          }],
          currency: 'USD'
        }),
        cache: 'no-store'
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
          productFiltering: viatorDestinationIdForTour
            ? {
                destination: String(viatorDestinationIdForTour),
              }
            : undefined,
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

    const enrichment = await getTourEnrichment(productId);

    return (
      <TourDetailClient
        tour={tour}
        similarTours={similarTours}
        productId={productId}
        pricing={pricing}
        enrichment={enrichment}
      />
    );
  } catch (error) {
    console.error('Error fetching tour:', error);
    notFound();
  }
}

