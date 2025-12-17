import { notFound } from 'next/navigation';
import { getDestinationById } from '@/data/destinationsData';
import { getOperatorsForDestination } from '@/lib/tourOperatorsCRM';
import { getViatorDestinationById, getViatorDestinationBySlug } from '@/lib/supabaseCache';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import { getAllCategoryGuidesForDestination } from '../lib/categoryGuides';
import { headers } from 'next/headers';
import OperatorsListClient from './OperatorsListClient';

// Helper to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const destination = getDestinationById(id);

  if (!destination) {
    // Try to get from generated content
    const fullContent = getDestinationFullContent(id);
    const seoContent = getDestinationSeoContent(id);
    
    if (!fullContent && !seoContent) {
      return {
        title: 'Tour Operators | TopTours.ai',
      };
    }

    const destinationName = fullContent?.destinationName || seoContent?.destinationName || id;
    const defaultOgImage = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png';
    const ogImage = seoContent?.ogImage || fullContent?.imageUrl || seoContent?.imageUrl || defaultOgImage;
    const description = `Discover trusted tour operators in ${destinationName}. Browse operators offering tours and activities with instant booking and free cancellation.`;

    return {
      title: `Tour Operators in ${destinationName} | TopTours.ai`,
      description,
      keywords: `tour operators ${destinationName}, ${destinationName} tour companies, ${destinationName} tour providers`,
      alternates: {
        canonical: `https://toptours.ai/destinations/${id}/operators`,
      },
      openGraph: {
        title: `Tour Operators in ${destinationName}`,
        description,
        url: `https://toptours.ai/destinations/${id}/operators`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `Tour Operators in ${destinationName}`,
          },
        ],
        type: 'website',
        siteName: 'TopTours.ai',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Tour Operators in ${destinationName}`,
        description,
        images: [ogImage],
      },
    };
  }

  const defaultOgImage = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png';
  const ogImage = destination.imageUrl || defaultOgImage;
  const description = `Discover trusted tour operators in ${destination.fullName}. Browse operators offering tours and activities with instant booking and free cancellation.`;

  return {
    title: `Tour Operators in ${destination.fullName} | TopTours.ai`,
    description,
    keywords: `tour operators ${destination.fullName}, ${destination.fullName} tour companies, ${destination.fullName} tour providers`,
    alternates: {
      canonical: `https://toptours.ai/destinations/${destination.id}/operators`,
    },
    openGraph: {
      title: `Tour Operators in ${destination.fullName}`,
      description,
      url: `https://toptours.ai/destinations/${destination.id}/operators`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Tour Operators in ${destination.fullName}`,
        },
      ],
      type: 'website',
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Tour Operators in ${destination.fullName}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function OperatorsListingPage({ params }) {
  const { id } = await params;
  let destination = getDestinationById(id);
  let viatorDestinationId = null;

  // If not in curated destinations, check generated content
  if (!destination) {
    const fullContent = getDestinationFullContent(id);
    const seoContent = getDestinationSeoContent(id);
    
    if (!fullContent && !seoContent) {
      notFound();
    }

    // Get Viator destination ID
    if (fullContent?.destinationId) {
      viatorDestinationId = fullContent.destinationId;
    } else if (seoContent?.destinationId) {
      viatorDestinationId = seoContent.destinationId;
    } else {
      // Try to find in classified data
      const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
        const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
        const searchName = (fullContent?.destinationName || seoContent?.destinationName || id).toLowerCase().trim();
        return destName === searchName || generateSlug(destName) === id;
      });
      if (classifiedDest) {
        viatorDestinationId = classifiedDest.destinationId;
      }
    }

    // Try to get from Supabase if we have a numeric ID
    if (!viatorDestinationId && /^\d+$/.test(id)) {
      try {
        const destInfo = await getViatorDestinationById(id);
        if (destInfo) {
          viatorDestinationId = destInfo.id;
        }
      } catch (error) {
        console.warn(`Failed to lookup destination ${id}:`, error);
      }
    }

    // Create destination object
    const destinationName = fullContent?.destinationName || seoContent?.destinationName || id;
    destination = {
      id: id,
      name: destinationName,
      fullName: destinationName,
      imageUrl: seoContent?.ogImage || fullContent?.imageUrl || seoContent?.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png',
      destinationId: viatorDestinationId,
    };
  } else {
    // For curated destinations, get Viator ID from classified data or destination object
    viatorDestinationId = destination.destinationId || null;
    
    if (!viatorDestinationId) {
      const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
        const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
        const searchName = (destination.name || destination.fullName || '').toLowerCase().trim();
        return destName === searchName || generateSlug(destName) === destination.id;
      });
      if (classifiedDest) {
        viatorDestinationId = classifiedDest.destinationId;
      }
    }
  }

  if (!destination) {
    notFound();
  }

  // Fetch operators for this destination
  let operators = [];
  let allToursForDestination = [];
  
  if (viatorDestinationId) {
    // Step 1: Fetch operators
    const result = await getOperatorsForDestination(viatorDestinationId);
    if (result.success) {
      operators = result.data || [];
    }
    
    // Step 2: Fetch all tours for this destination (one API call)
    // Same approach as /destinations/[id]/tours page
    try {
      const headersList = await headers();
      const host = headersList.get('host') || 'localhost:3000';
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;
      
      // Fetch first page to get totalCount
      const firstPageResponse = await fetch(`${baseUrl}/api/internal/viator-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: '', // No search term - use /products/search endpoint
          page: 1,
          viatorDestinationId: String(viatorDestinationId),
          includeDestination: true, // Use /products/search when destination ID is available
        }),
        cache: 'no-store',
      });

      let totalCount = 0;
      let firstPageTours = [];
      
      if (firstPageResponse.ok) {
        const firstPageData = await firstPageResponse.json();
        firstPageTours = firstPageData?.products?.results || [];
        totalCount = firstPageData?.products?.totalCount || firstPageData?.totalCount || 0;
        console.log(`📊 Destination ${viatorDestinationId} has ${totalCount} total tours`);
      }

      // Calculate how many pages we need to fetch
      // We want to fetch enough to cover all tours, but cap at 25 pages (500 tours) to avoid too many API calls
      const toursPerPage = 20;
      const maxPages = 25; // Cap at 500 tours
      const pagesNeeded = totalCount > 0 
        ? Math.min(Math.ceil(totalCount / toursPerPage), maxPages)
        : 15; // Default to 15 pages (300 tours) if totalCount not available
      
      console.log(`📄 Fetching ${pagesNeeded} pages (up to ${pagesNeeded * toursPerPage} tours)`);
      
      // Fetch remaining pages (we already have page 1)
      const allToursPromises = [Promise.resolve({ products: { results: firstPageTours, totalCount } })];
      
      for (let page = 2; page <= pagesNeeded; page++) {
        allToursPromises.push(
          fetch(`${baseUrl}/api/internal/viator-search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              searchTerm: '',
              page: page,
              viatorDestinationId: String(viatorDestinationId),
              includeDestination: true,
            }),
            cache: 'no-store',
          }).then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              return { products: { results: data?.products?.results || [] } };
            } else if (res.status === 404) {
              // Page doesn't exist, return empty results
              return { products: { results: [] } };
            } else {
              console.error(`Error fetching tours page ${page}:`, res.status);
              return { products: { results: [] } };
            }
          }).catch(error => {
            console.error(`Error fetching tours page ${page}:`, error);
            return { products: { results: [] } };
          })
        );
      }
      
      const allPagesResults = await Promise.all(allToursPromises);
      
      // Flatten all tours and deduplicate by productId
      const seenTourIds = new Set();
      allToursForDestination = [];
      
      for (const pageResult of allPagesResults) {
        const tours = pageResult?.products?.results || [];
        for (const tour of tours) {
          const productId = tour.productCode || tour.productId || tour.id;
          if (productId && !seenTourIds.has(String(productId))) {
            seenTourIds.add(String(productId));
            allToursForDestination.push(tour);
          }
        }
      }
      
      console.log(`✅ Fetched ${allToursForDestination.length} unique tours for destination ${viatorDestinationId}`);
      
      // Step 3: Match tours with operators
      // Create a map of productId -> tour data for fast lookup
      const tourMap = new Map();
      allToursForDestination.forEach(tour => {
        // Try multiple possible productId fields
        const productId = tour.productCode || tour.productId || tour.id;
        if (productId) {
          const productIdString = String(productId);
          tourMap.set(productIdString, {
            productId: productIdString,
            name: tour.title || tour.productName || tour.name || null,
            slug: tour.seo?.slug || tour.slug || null,
            image: tour.images?.[0]?.variants?.[3]?.url || 
                   tour.images?.[0]?.variants?.[0]?.url || 
                   tour.imageUrl || null,
            rating: tour.reviews?.combinedAverageRating || 
                   tour.reviews?.averageRating || 
                   tour.reviewSummary?.averageRating || null,
            reviewCount: tour.reviews?.totalReviews || 
                        tour.reviews?.totalCount || 
                        tour.reviewSummary?.totalReviews || null,
            price: tour.pricing?.summary?.fromPrice || null,
          });
        }
      });
      
      console.log(`🗺️ Created tour map with ${tourMap.size} tours`);
      
      // Step 4: Enrich operators with matched tours
      operators = operators.map(op => {
        const matchedTours = [];
        const unmatchedIds = [];
        
        (op.tour_product_ids || []).forEach(productId => {
          const productIdString = String(productId);
          const tourData = tourMap.get(productIdString);
          
          if (tourData) {
            matchedTours.push(tourData);
          } else {
            unmatchedIds.push(productIdString);
          }
        });
        
        if (unmatchedIds.length > 0 && matchedTours.length > 0) {
          // Only log if we found some tours but not all (to avoid spam)
          console.log(`⚠️ Operator "${op.operator_name}": Found ${matchedTours.length}/${op.tour_product_ids?.length || 0} tours. Missing: ${unmatchedIds.slice(0, 3).join(', ')}${unmatchedIds.length > 3 ? '...' : ''}`);
        }
        
        return {
          ...op,
          tours: matchedTours, // Only include tours we found in API
        };
      });
      
      console.log(`✅ Enriched ${operators.length} operators with tour data`);
    } catch (error) {
      console.error('Error fetching tours for destination:', error);
      // If API call fails, operators will still be shown but without tour details
    }
  }

  // Fetch category guides for this destination
  let categoryGuides = [];
  try {
    categoryGuides = await getAllCategoryGuidesForDestination(id);
  } catch (error) {
    console.error('Error fetching category guides:', error);
  }

  return (
    <OperatorsListClient
      destination={destination}
      operators={operators}
      categoryGuides={categoryGuides}
    />
  );
}

