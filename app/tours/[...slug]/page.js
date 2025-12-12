import { notFound } from 'next/navigation';
import TourDetailClient from '../[productId]/TourDetailClient';
import { getTourEnrichment } from '@/lib/tourEnrichment';
import { destinations as siteDestinations } from '@/data/destinationsData';
import { slugToViatorId, viatorRefToSlug } from '@/data/viatorDestinationMap';
import { getTourOperatorPremiumSubscription, getOperatorPremiumTourIds, getOperatorAggregatedStats } from '@/lib/tourOperatorPremiumServer';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';

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

    // Get category guides for this destination - use slug (same as destination detail page)
    // For database destinations, the database stores destination_id as the slug (e.g., "ajmer")
    let categoryGuides = [];
    let destinationData = null;
    try {
      // Step 1: Try to get slug from primaryDestinationSlug (works for hardcoded destinations)
      let destinationSlug = primaryDestinationSlug;
      
      // Step 2: If no slug, resolve from tour destination ID (for database destinations like Ajmer)
      let resolvedViatorDest = null;
      if (!destinationSlug && tour?.destinations && tour.destinations.length > 0) {
        const primaryDest = tour.destinations.find((d) => d?.primary) || tour.destinations[0];
        const destinationId = primaryDest?.ref || primaryDest?.destinationId || primaryDest?.id;
        
        if (destinationId) {
          // Import getViatorDestinationById to resolve slug from ID
          const { getViatorDestinationById } = await import('@/lib/supabaseCache');
          const normalizedId = destinationId.toString().replace(/^d/i, '');
          resolvedViatorDest = await getViatorDestinationById(normalizedId);
          
          if (resolvedViatorDest?.slug) {
            destinationSlug = resolvedViatorDest.slug;
            console.log(`✅ [SERVER] Resolved slug "${destinationSlug}" from ID ${normalizedId} for database destination`);
          } else if (resolvedViatorDest?.name) {
            // Generate slug from name
            destinationSlug = resolvedViatorDest.name
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            console.log(`✅ [SERVER] Generated slug "${destinationSlug}" from name "${resolvedViatorDest.name}"`);
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
        <TourDetailClient
          tour={tour}
          similarTours={similarTours}
          productId={productId}
          pricing={pricing}
          enrichment={enrichment}
          operatorPremiumData={operatorPremiumData}
          operatorTours={operatorTours}
          destinationData={destinationData}
          categoryGuides={categoryGuides}
        />
      </>
    );
  } catch (error) {
    console.error('Error fetching tour:', error);
    notFound();
  }
}

