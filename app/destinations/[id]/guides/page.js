import { notFound } from 'next/navigation';
import { getDestinationById } from '@/data/destinationsData';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import { getGuidesByIds } from '@/data/travelGuidesData';
import { getRelatedDestinations, getDestinationsByCountry } from '@/data/destinationsData';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';
import { getBabyEquipmentRentalsByDestination } from '@/lib/babyEquipmentRentals';
import { getDestinationFeatures } from '@/lib/destinationFeatures';
import { getViatorDestinationBySlug } from '@/lib/supabaseCache';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import GuidesListingClient from './GuidesListingClient';

function generateSlug(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function resolveDestinationImageUrl(destinationId, destination) {
  const fromDest = destination?.imageUrl?.trim?.();
  if (fromDest) return fromDest;
  const full = getDestinationFullContent(destinationId);
  const seo = getDestinationSeoContent(destinationId);
  return full?.imageUrl || seo?.imageUrl || seo?.ogImage || null;
}

const TRAVEL_GUIDE_OG_IMAGE = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/travel%20guides.png';

// Revalidate every 7 days
export const revalidate = 604800;

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id: destinationId } = await params;
  let destination = getDestinationById(destinationId);
  
  // If not in curated destinations, check generated content
  if (!destination) {
    const fullContent = getDestinationFullContent(destinationId);
    if (fullContent && fullContent.destinationName) {
      destination = {
        id: destinationId,
        name: fullContent.destinationName,
        fullName: fullContent.destinationName,
        imageUrl: fullContent.imageUrl || null,
      };
    } else {
      // Try database lookup
      try {
        const dbDestination = await getViatorDestinationBySlug(destinationId);
        if (dbDestination && dbDestination.name) {
          destination = {
            id: destinationId,
            name: dbDestination.name,
            fullName: dbDestination.name,
            imageUrl: null,
          };
        }
      } catch (error) {
        // Continue with fallback
      }
    }
  }
  
  if (!destination) {
    return {
      title: 'Travel Guides Not Found | TopTours.ai',
      robots: {
        index: false,
        follow: false,
        noindex: true,
        nofollow: true,
      },
    };
  }

  const destinationName = destination.fullName || destination.name;

  return {
    title: `${destinationName} Travel Guides - Complete Destination Guide | TopTours.ai`,
    description: `Explore comprehensive travel guides for ${destinationName}. Discover the best tours, activities, restaurants, and insider tips to plan your perfect trip.`,
    keywords: `${destinationName} travel guides, ${destinationName} guides, ${destinationName} travel tips, ${destinationName} vacation guide, ${destinationName} travel information, ${destinationName} travel planning`,
    openGraph: {
      title: `${destinationName} Travel Guides - Complete Destination Guide`,
      description: `Explore comprehensive travel guides for ${destinationName}. Discover the best tours, activities, restaurants, and insider tips.`,
      url: `https://toptours.ai/destinations/${destinationId}/guides`,
      images: [
        {
          url: TRAVEL_GUIDE_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${destinationName} Travel Guides`,
        },
      ],
      type: 'website',
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${destinationName} Travel Guides - Complete Destination Guide`,
      description: `Explore comprehensive travel guides for ${destinationName}. Discover the best tours, activities, and insider tips.`,
      images: [TRAVEL_GUIDE_OG_IMAGE],
    },
    alternates: {
      canonical: `https://toptours.ai/destinations/${destinationId}/guides`,
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

export default async function GuidesListingPage({ params }) {
  const { id: destinationId } = await params;
  
  // Get destination data
  let destination = getDestinationById(destinationId);
  
  if (!destination) {
    const fullContent = getDestinationFullContent(destinationId);
    if (fullContent && fullContent.destinationName) {
      destination = {
        id: destinationId,
        name: fullContent.destinationName,
        fullName: fullContent.destinationName,
        imageUrl: fullContent.imageUrl || null,
        country: fullContent.country || null,
        category: fullContent.region || null,
        tourCategories: fullContent.tourCategories || [],
        bestTimeToVisit: fullContent.bestTimeToVisit || null,
        gettingAround: fullContent.gettingAround || null,
        whyVisit: fullContent.whyVisit || [],
        highlights: fullContent.highlights || [],
        briefDescription: fullContent.briefDescription || null,
        heroDescription: fullContent.heroDescription || null,
        seo: fullContent.seo || null,
      };
    } else {
      // Try database lookup
      try {
        const dbDestination = await getViatorDestinationBySlug(destinationId);
        if (dbDestination && dbDestination.name) {
          destination = {
            id: destinationId,
            name: dbDestination.name,
            fullName: dbDestination.name,
            imageUrl: null,
            country: null,
            category: null,
            tourCategories: [],
            bestTimeToVisit: null,
            gettingAround: null,
            whyVisit: [],
            highlights: [],
            briefDescription: null,
            heroDescription: null,
            seo: null,
          };
        }
      } catch (error) {
        // Continue
      }
    }
  }
  
  if (!destination) {
    notFound();
  }
  
  // Parallel fetch: category guides + baby equipment for faster loading
  let allGuides = [];
  let hasBabyEquipmentRentals = false;
  try {
    const [guides, babyData] = await Promise.all([
      getAllCategoryGuidesForDestination(destinationId),
      getBabyEquipmentRentalsByDestination(destinationId),
    ]);
    allGuides = Array.isArray(guides) ? guides : [];
    hasBabyEquipmentRentals = !!babyData;
  } catch (error) {
    console.error('Error fetching category guides or baby equipment:', error);
    try {
      allGuides = await getAllCategoryGuidesForDestination(destinationId);
    } catch (e) {
      allGuides = [];
    }
  }

  // Get related travel guides (e.g. packing list, 3-day itinerary, Aruba vs X) from destinationsData.relatedGuides
  const staticDestination = getDestinationById(destinationId);
  const relatedGuideIds = staticDestination?.relatedGuides ?? destination?.relatedGuides ?? [];
  const relatedTravelGuides = Array.isArray(relatedGuideIds) && relatedGuideIds.length > 0
    ? getGuidesByIds(relatedGuideIds)
    : [];

  const relatedDestinations = getRelatedDestinations(destinationId);

  let countryDestinations = [];
  if (destination?.country && destination.id) {
    const curated = getDestinationsByCountry(destination.country, destination.id);
    const seenIds = new Set(curated.map((d) => d.id));
    const seenNames = new Set(curated.map((d) => (d.name || d.fullName || '').toLowerCase().trim()));
    const all = [...curated];
    const currentSlug = destination.id;
    const currentName = (destination.name || destination.fullName || '').toLowerCase().trim();

    try {
      if (Array.isArray(viatorDestinationsClassifiedData) && viatorDestinationsClassifiedData.length > 0) {
        const classified = viatorDestinationsClassifiedData
          .filter((dest) => {
            if (!dest) return false;
            const destCountry = (dest.country || '').toLowerCase().trim();
            const targetCountry = (destination.country || '').toLowerCase().trim();
            const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
            const destSlug = generateSlug(dest.destinationName || dest.name || '');
            return (
              destCountry === targetCountry &&
              dest.type === 'CITY' &&
              destName !== currentName &&
              destSlug !== currentSlug &&
              destName.length > 0
            );
          })
          .map((dest) => {
            if (!dest) return null;
            try {
              const slug = generateSlug(dest.destinationName || dest.name || '');
              const seoContent = getDestinationSeoContent(slug);
              return {
                id: slug,
                name: dest.destinationName || dest.name,
                fullName: dest.destinationName || dest.name,
                briefDescription:
                  seoContent?.briefDescription ||
                  seoContent?.heroDescription ||
                  `Explore tours and activities in ${dest.destinationName || dest.name}`,
                imageUrl: null,
                country: dest.country,
              };
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        classified.forEach((dest) => {
          const destId = dest.id || '';
          const destName = (dest.name || dest.fullName || '').toLowerCase().trim();
          if (destId && !seenIds.has(destId) && !seenNames.has(destName)) {
            seenIds.add(destId);
            seenNames.add(destName);
            all.push(dest);
          }
        });
      }
    } catch (e) {
      // ignore
    }
    countryDestinations = all.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  const resolvedImageUrl = resolveDestinationImageUrl(destinationId, destination);
  const destinationName = destination.fullName || destination.name;
  const pageUrl = `https://toptours.ai/destinations/${destinationId}/guides`;

  // Fetch destination features (lightweight checks for sticky nav)
  const features = await getDestinationFeatures(destinationId);
  const placeUrl = `https://toptours.ai/destinations/${destinationId}`;
  const guidesListId = `${pageUrl}#guides-list`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;

  // JSON-LD Schema for SEO: WebPage, Place, ItemList(s), BreadcrumbList
  const graph = [
    {
      '@type': 'WebPage',
      '@id': pageUrl,
      name: `${destinationName} Travel Guides - Complete Destination Guide`,
      description: `Explore comprehensive travel guides for ${destinationName}. Discover the best tours, activities, restaurants, and insider tips to plan your perfect trip.`,
      url: pageUrl,
      breadcrumb: { '@id': breadcrumbId },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: TRAVEL_GUIDE_OG_IMAGE,
        width: 1200,
        height: 630,
      },
      mainEntity: { '@id': guidesListId },
      about: { '@id': placeUrl },
      isPartOf: { '@type': 'WebSite', '@id': 'https://toptours.ai/#website', name: 'TopTours.ai', url: 'https://toptours.ai' },
      publisher: { '@type': 'Organization', name: 'TopTours.ai', logo: { '@type': 'ImageObject', url: 'https://toptours.ai/logo.png' } },
    },
    {
      '@type': 'Place',
      '@id': placeUrl,
      name: destinationName,
      url: placeUrl,
      ...(resolvedImageUrl ? { image: resolvedImageUrl } : {}),
      ...(destination.country ? { address: { '@type': 'PostalAddress', addressLocality: destinationName, addressCountry: destination.country } } : {}),
    },
    {
      '@type': 'ItemList',
      '@id': guidesListId,
      name: `Travel Guides for ${destinationName}`,
      description: `Complete collection of travel guides for ${destinationName}. Tours, activities, restaurants, and local tips.`,
      numberOfItems: allGuides.length,
      itemListElement: allGuides.map((guide, index) => {
        const articleUrl = `https://toptours.ai/destinations/${destinationId}/guides/${guide.category_slug}`;
        const img = guide.hero_image || resolvedImageUrl;
        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Article',
            '@id': articleUrl,
            name: guide.title || guide.category_name,
            description: guide.subtitle || `Discover ${guide.category_name} in ${destinationName}.`,
            url: articleUrl,
            ...(img ? { image: img } : {}),
          },
        };
      }),
    },
    ...(relatedTravelGuides.length > 0
      ? [
          {
            '@type': 'ItemList',
            '@id': `${pageUrl}#more-guides-list`,
            name: `More ${destinationName} Guides`,
            description: `Packing lists, itineraries, comparisons and planning guides for ${destinationName}.`,
            numberOfItems: relatedTravelGuides.length,
            itemListElement: relatedTravelGuides.map((guide, index) => {
              const articleUrl = `https://toptours.ai/travel-guides/${guide.id}`;
              return {
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'Article',
                  '@id': articleUrl,
                  name: guide.title,
                  description: guide.excerpt || guide.title,
                  url: articleUrl,
                  ...(guide.image ? { image: guide.image } : {}),
                },
              };
            }),
          },
        ]
      : []),
    {
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toptours.ai' },
        { '@type': 'ListItem', position: 2, name: 'Destinations', item: 'https://toptours.ai/destinations' },
        { '@type': 'ListItem', position: 3, name: destinationName, item: placeUrl },
        { '@type': 'ListItem', position: 4, name: 'Travel Guides', item: pageUrl },
      ],
    },
  ];

  const jsonLd = { '@context': 'https://schema.org', '@graph': graph };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuidesListingClient 
        destinationId={destinationId}
        destination={{
          id: destination.id,
          name: destination.name,
          fullName: destination.fullName || destination.name,
          imageUrl: resolvedImageUrl,
          country: destination.country || null,
          category: destination.category || null,
          tourCategories: destination.tourCategories || [],
          bestTimeToVisit: destination.bestTimeToVisit || null,
          gettingAround: destination.gettingAround || null,
          whyVisit: destination.whyVisit || [],
          highlights: destination.highlights || [],
          briefDescription: destination.briefDescription || null,
          heroDescription: destination.heroDescription || null,
          seo: destination.seo || null,
        }}
        guides={allGuides}
        relatedTravelGuides={relatedTravelGuides}
        hasBabyEquipmentRentals={hasBabyEquipmentRentals}
        destinationFeatures={features}
        relatedDestinations={relatedDestinations}
        countryDestinations={countryDestinations}
      />
    </>
  );
}
