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
import { getRestaurantsForDestination as getRestaurantsForDestinationFromDB, formatRestaurantForFrontend } from '@/lib/restaurants';

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

// Revalidate every 24 hours - page-level cache (not API JSON cache, so Viator compliant)
export const revalidate = 86400; // 24 hours

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

    // Get country and region from classified data (matching destination page)
    let country = null;
    let region = null;
    try {
      if (Array.isArray(viatorDestinationsClassifiedData)) {
        const classifiedDest = viatorDestinationsClassifiedData.find(dest => {
          const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
          const searchName = (fullContent?.destinationName || seoContent?.destinationName || id).toLowerCase().trim();
          return destName === searchName || generateSlug(destName) === id;
        });
        if (classifiedDest) {
          country = classifiedDest.country || null;
          region = classifiedDest.region || null;
        }
      }
    } catch (error) {
      console.error('Error processing viatorDestinationsClassifiedData:', error);
    }

    // Create destination object with all fields (matching destination page)
    const destinationName = fullContent?.destinationName || seoContent?.destinationName || id;
    destination = {
      id: id,
      name: destinationName,
      fullName: destinationName,
      imageUrl: seoContent?.ogImage || fullContent?.imageUrl || seoContent?.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png',
      destinationId: viatorDestinationId,
      briefDescription: fullContent?.briefDescription || seoContent?.briefDescription || null,
      heroDescription: fullContent?.heroDescription || seoContent?.heroDescription || null,
      whyVisit: fullContent?.whyVisit || [],
      highlights: fullContent?.highlights || [],
      gettingAround: fullContent?.gettingAround || '',
      bestTimeToVisit: fullContent?.bestTimeToVisit || null,
      country: country,
      category: region || null,
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

  // Fetch operators for this destination (just the list, no tour matching)
  let operators = [];
  if (viatorDestinationId) {
    const result = await getOperatorsForDestination(viatorDestinationId);
    if (result.success) {
      operators = result.data || [];
    }
  }
    
  // Fetch top 12 tours for this destination (one API call, same as destination page)
  // This makes the page SEO-friendly and shows popular tours
  let topTours = [];
  if (viatorDestinationId) {
    try {
      const headersList = await headers();
      const host = headersList.get('host') || 'localhost:3000';
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;
      
      // Fetch first page (top 12 tours) - compliant with Viator API rules
      const toursResponse = await fetch(`${baseUrl}/api/internal/viator-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: '',
          page: 1,
          viatorDestinationId: String(viatorDestinationId),
          includeDestination: true,
        }),
        next: { revalidate: 3600 }, // Cache for 1 hour - our API route has cache headers
      });

      if (toursResponse.ok) {
        const toursData = await toursResponse.json();
        const allTours = toursData?.products?.results || [];
        // Take top 12 tours (sorted by rating/reviews by Viator API)
        topTours = allTours.slice(0, 12);
        }
    } catch (error) {
      console.error('Error fetching top tours for operators page:', error);
      // Continue without tours - page will still work
    }
  }

  // Fetch category guides for this destination (limit to 6 for internal linking)
  let categoryGuides = [];
  try {
    const allGuides = await getAllCategoryGuidesForDestination(id);
    categoryGuides = allGuides.slice(0, 6);
  } catch (error) {
    console.error('Error fetching category guides:', error);
  }

  // Fetch restaurants for this destination (for internal linking)
  let restaurants = [];
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const dbRestaurants = await getRestaurantsForDestinationFromDB(id);
      restaurants = (dbRestaurants || [])
        .map(restaurant => {
          try {
            return formatRestaurantForFrontend(restaurant);
          } catch (err) {
            console.error('Error formatting restaurant:', err, restaurant?.id);
            return null;
          }
        })
        .filter(restaurant => restaurant !== null && restaurant !== undefined)
        .slice(0, 6); // Limit to 6 for display
    }
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    // Continue without restaurants - page will still work
  }

  return (
    <OperatorsListClient
      destination={destination}
      operators={operators}
      topTours={topTours}
      categoryGuides={categoryGuides}
      restaurants={restaurants}
    />
  );
}

