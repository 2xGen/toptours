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
    const operatorName =
      tour?.supplier?.name ||
      tour?.supplierName ||
      tour?.operator?.name ||
      tour?.vendor?.name ||
      tour?.partner?.name ||
      '';
    const metaTitle = operatorName ? `${operatorName} – ${title}` : title;
    const description = tour.description?.summary || tour.description?.shortDescription || `Book ${title} and discover amazing experiences.`;
    const image = tour.images?.[0]?.variants?.[3]?.url || tour.images?.[0]?.variants?.[0]?.url || '';

    return {
      title: metaTitle,
      description: description.substring(0, 160),
      openGraph: {
        title: metaTitle,
        description: description.substring(0, 160),
        images: image ? [image] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
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

    const fetchToursForDestination = async (searchTerm, destinationId = null, pages = 2) => {
      if (!searchTerm) return [];

      const toursPerPage = 20;
      const fetchPromises = [];

      for (let page = 1; page <= pages; page++) {
        const start = (page - 1) * toursPerPage + 1;
        fetchPromises.push(
          fetch('https://api.viator.com/partner/search/freetext', {
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
                    destination: String(destinationId),
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
            cache: 'no-store',
          }).then(async (res) => {
            if (res.ok) {
              return res.json();
            }
            const errorText = await res.text();
            console.error(`Similar tours page ${page} error:`, res.status, errorText);
            return null;
          })
        );
      }

      const responses = await Promise.all(fetchPromises);
      const tours = [];
      const seenIds = new Set();

      responses.forEach((data) => {
        if (data && !data.error) {
          const results = data.products?.results || [];
          results.forEach((tourResult) => {
            const tId = tourResult.productId || tourResult.productCode;
            if (tId && !seenIds.has(tId)) {
              seenIds.add(tId);
              tours.push(tourResult);
            }
          });
        }
      });

      return tours;
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
        const finalResults = await fetchToursForDestination(destinationNameForSearch, null, 1);
        similarTours = buildSimilarToursList(finalResults);
      }
    } catch (error) {
      console.error('Error fetching similar tours:', error);
      similarTours = [];
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

