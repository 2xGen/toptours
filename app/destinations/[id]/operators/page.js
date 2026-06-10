import { notFound } from 'next/navigation';
import { getDestinationById } from '@/data/destinationsData';
import { getOperatorsForDestination } from '@/lib/tourOperatorsCRM';
import { getViatorDestinationById, getViatorDestinationBySlug } from '@/lib/supabaseCache';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import OperatorsListClient from './OperatorsListClient';
import { requireFeaturedDestination } from '@/lib/requireFeaturedDestination';
import {
  isOperatorPagesEnabled,
  loadOperatorPageIndex,
  getOperatorPagePath,
  getViatorDestinationIdForSlug,
} from '@/lib/operatorPages';
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

function getOperatorsListingRobots(destinationId) {
  const indexed = isOperatorPagesEnabled(destinationId);
  return {
    index: indexed,
    follow: true,
    googleBot: {
      index: indexed,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

// Revalidate every 24 hours - page-level cache (not API JSON cache, so Viator compliant)
export const revalidate = 604800; // 7 days - increased to reduce ISR writes during Google reindexing

export async function generateMetadata({ params }) {
  const { id } = await params;
  requireFeaturedDestination(id);
  let destination = getDestinationById(id);

  if (!destination) {
    // Try to get from generated content (JSON files)
    const fullContent = getDestinationFullContent(id);
    const seoContent = getDestinationSeoContent(id);
    
    if (fullContent || seoContent) {
      const destinationName = fullContent?.destinationName || seoContent?.destinationName || id;
      const defaultOgImage = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png';
      const ogImage = seoContent?.ogImage || fullContent?.imageUrl || seoContent?.imageUrl || defaultOgImage;
      const description = `Discover trusted tour operators in ${destinationName}. Browse operators offering tours and activities with instant booking and free cancellation.`;

      return {
        title: `Tour Operators in ${destinationName} – Book Direct`,
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
        robots: getOperatorsListingRobots(id),
      };
    }
    
    // Try database lookups (for 3,382+ destinations not in static/JSON files)
    // Check if id is a Viator destination ID (numeric or starts with 'd')
    if (/^d?\d+$/.test(id)) {
      const viatorDestinationId = id.startsWith('d') ? id.replace(/^d/i, '') : id;
      try {
        const destInfo = await getViatorDestinationById(viatorDestinationId);
        if (destInfo && destInfo.name) {
          const defaultOgImage = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png';
          const description = `Discover trusted tour operators in ${destInfo.name}. Browse operators offering tours and activities with instant booking and free cancellation.`;
          
          return {
            title: `Tour Operators in ${destInfo.name} – Book Direct`,
            description,
            keywords: `tour operators ${destInfo.name}, ${destInfo.name} tour companies, ${destInfo.name} tour providers`,
            alternates: {
              canonical: `https://toptours.ai/destinations/${id}/operators`,
            },
            openGraph: {
              title: `Tour Operators in ${destInfo.name}`,
              description,
              url: `https://toptours.ai/destinations/${id}/operators`,
              images: [
                {
                  url: defaultOgImage,
                  width: 1200,
                  height: 630,
                  alt: `Tour Operators in ${destInfo.name}`,
                },
              ],
              type: 'website',
              siteName: 'TopTours.ai',
              locale: 'en_US',
            },
            twitter: {
              card: 'summary_large_image',
              title: `Tour Operators in ${destInfo.name}`,
              description,
              images: [defaultOgImage],
            },
            robots: getOperatorsListingRobots(id),
          };
        }
      } catch (error) {
        // Continue with fallback
      }
    }
    
    // Try slug lookup using database (same as destination page)
    try {
      const destInfo = await getViatorDestinationBySlug(id);
      if (destInfo && destInfo.name) {
        const defaultOgImage = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png';
        const description = `Discover trusted tour operators in ${destInfo.name}. Browse operators offering tours and activities with instant booking and free cancellation.`;
        
        return {
          title: `Tour Operators in ${destInfo.name} – Book Direct`,
          description,
          keywords: `tour operators ${destInfo.name}, ${destInfo.name} tour companies, ${destInfo.name} tour providers`,
          alternates: {
            canonical: `https://toptours.ai/destinations/${id}/operators`,
          },
          openGraph: {
            title: `Tour Operators in ${destInfo.name}`,
            description,
            url: `https://toptours.ai/destinations/${id}/operators`,
            images: [
              {
                url: defaultOgImage,
                width: 1200,
                height: 630,
                alt: `Tour Operators in ${destInfo.name}`,
              },
            ],
            type: 'website',
            siteName: 'TopTours.ai',
            locale: 'en_US',
          },
          twitter: {
            card: 'summary_large_image',
            title: `Tour Operators in ${destInfo.name}`,
            description,
            images: [defaultOgImage],
          },
          robots: getOperatorsListingRobots(id),
        };
      }
    } catch (error) {
      // Continue
    }
    
    // If all lookups fail, return generic metadata (noindex listing)
    return {
      title: 'Tour Operators – Book Direct',
      robots: getOperatorsListingRobots(id),
    };
  }

  const defaultOgImage = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png';
  const ogImage = destination.imageUrl || defaultOgImage;
  const operatorIndex = isOperatorPagesEnabled(id) ? loadOperatorPageIndex(id) : null;
  const operatorCount = operatorIndex?.operatorCount || 0;
  const description = operatorCount > 0
    ? `Compare ${operatorCount} tour operators in ${destination.fullName}. See combined ratings, tour catalogs, and book with live availability on TopTours.ai.`
    : `Discover trusted tour operators in ${destination.fullName}. Browse operators offering tours and activities with instant booking and free cancellation.`;

    return {
      title: `Tour Operators in ${destination.fullName} – Reviews & Tours`,
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
      robots: getOperatorsListingRobots(id),
    };
}

export default async function OperatorsListingPage({ params }) {
  const { id } = await params;
  requireFeaturedDestination(id);
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

  if (!viatorDestinationId) {
    viatorDestinationId = getViatorDestinationIdForSlug(id);
  }

  // Fetch operators for this destination (just the list, no tour matching)
  let operators = [];
  if (viatorDestinationId) {
    const result = await getOperatorsForDestination(viatorDestinationId);
    if (result.success) {
      operators = result.data || [];
    }
  }
    
  let operatorPages = [];
  if (isOperatorPagesEnabled(id)) {
    const index = loadOperatorPageIndex(id);
    operatorPages = (index?.operators || []).map((op) => ({
      slug: op.slug,
      operatorName: op.operatorName,
      tourCount: op.tourCount,
      totalReviews: op.totalReviews,
      averageRating: op.averageRating,
      href: getOperatorPagePath(id, op.slug),
    }));
  }

  return (
    <OperatorsListClient
      destination={destination}
      operators={operators}
      operatorPages={operatorPages}
      operatorPagesEnabled={isOperatorPagesEnabled(id)}
    />
  );
}

