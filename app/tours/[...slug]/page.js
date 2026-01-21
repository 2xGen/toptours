import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import TourDetailClient from '../[productId]/TourDetailClient';
import { fetchSimilarToursServer } from '../[productId]/fetchSimilarTours';
import { loadTourData, loadDestinationData } from '../[productId]/TourDataLoader';
import { getCachedTour, cacheTour } from '@/lib/viatorCache';
import { generateTourFAQs, generateFAQSchema } from '@/lib/faqGeneration';
import { buildEnhancedMetaDescription, buildEnhancedTitle } from '@/lib/metaDescription';
import { getTourEnrichment } from '@/lib/tourEnrichment';
import { generateTourSlug } from '@/utils/tourHelpers';
import { trackTourForSitemap } from '@/lib/tourSitemap';

// Revalidate every 7 days - page-level cache (not API JSON cache, so Viator compliant)
// Increased from 24h to 7 days to reduce ISR writes during Google reindexing
export const revalidate = 604800; // 7 days

// Cache tour data fetching at Next.js level (24 hours - matches page cache)
const getCachedTourData = unstable_cache(
  async (productId) => {
    let tour = await getCachedTour(productId);
    
    if (!tour) {
      const apiKey = process.env.VIATOR_API_KEY;
      const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;
      
      const productResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'exp-api-key': apiKey,
          'Accept': 'application/json;version=2.0',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json'
        },
        next: { revalidate: 86400 } // 24 hours - Supabase cache handles longer-term, this reduces fetch calls
      });

      if (!productResponse.ok) {
        return null;
      }

      tour = await productResponse.json();
      if (!tour || tour.error) {
        return null;
      }
      await cacheTour(productId, tour);
    }
    
    return tour;
  },
  ['tour-data'],
  { revalidate: 604800, tags: ['tours'] } // 7 days to match page cache
);

// Cache non-critical data loading (24 hours - matches page cache)
const getCachedTourExtras = unstable_cache(
  async (productId, tour) => {
    const [tourDataResult, destinationDataResult] = await Promise.allSettled([
      loadTourData(productId, tour),
      loadDestinationData(tour, productId)
    ]);

    const tourData = tourDataResult.status === 'fulfilled' ? tourDataResult.value : {
      pricing: null,
      promotionScore: { product_id: productId, total_score: 0, monthly_score: 0, weekly_score: 0, past_28_days_score: 0 },
      tourEnrichment: null,
      operatorPremiumData: null,
      operatorTours: [],
      reviews: null
    };

    const destData = destinationDataResult.status === 'fulfilled' 
      ? destinationDataResult.value 
      : { destinationData: null, restaurantCount: 0, restaurants: [], categoryGuides: [] };

    return { tourData, destData };
  },
  ['tour-extras'],
  { revalidate: 604800, tags: ['tours'] } // 7 days to match page cache
);

/**
 * Generate metadata for tour detail page
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const productId = Array.isArray(slug) ? slug[0] : slug;
  
  if (!productId) {
    return {
      title: 'Tour Not Found | TopTours.ai',
      description: 'The tour you are looking for could not be found.',
      robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    };
  }

  try {
    // Use cached tour data (Next.js level caching)
    const tour = await getCachedTourData(productId);
    
    if (!tour) {
      return {
        title: 'Tour Not Found | TopTours.ai',
        description: 'The tour you are looking for could not be found.',
        robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
      };
    }

    // Extract destination name for metadata
    let destinationName = null;
    if (tour.destinations?.length > 0) {
      const primary = tour.destinations.find(d => d.primary) || tour.destinations[0];
      destinationName = primary.destinationName || primary.name || null;
    }
    
    // Get enrichment for enhanced meta description (optional)
    let enrichment = null;
    try {
      enrichment = await getTourEnrichment(productId);
    } catch (error) {
      // Non-critical
    }
    
    const title = buildEnhancedTitle(tour, { destinationName }, enrichment);
    const description = buildEnhancedMetaDescription(tour, { destinationName }, enrichment);
    const image = tour.images?.[0]?.variants?.[3]?.url || tour.images?.[0]?.variants?.[0]?.url || '';
    const tourSlug = generateTourSlug(tour.title);
    const canonicalUrl = tourSlug ? `https://toptours.ai/tours/${productId}/${tourSlug}` : `https://toptours.ai/tours/${productId}`;

    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        images: image ? [image] : [],
        type: 'website',
        url: canonicalUrl,
        siteName: 'TopTours.ai',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : [],
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
  } catch (error) {
    return {
      title: 'Tour Not Found | TopTours.ai',
      description: 'The tour you are looking for could not be found.',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    };
  }
}

/**
 * Tour detail page - optimized for fast loading
 */
export default async function TourDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const productId = Array.isArray(slug) ? slug[0] : slug;
  
  if (!productId) {
    notFound();
  }

  try {
    // Use Next.js level caching for tour data
    const tour = await getCachedTourData(productId);
    
    if (!tour) {
      notFound();
    }

    // Use Next.js level caching for extras (pricing, reviews, etc.)
    const { tourData, destData } = await getCachedTourExtras(productId, tour);
    const { destinationData, restaurantCount, restaurants, categoryGuides } = destData;

    // Generate FAQs (quick, doesn't make API calls)
    let faqs = [];
    try {
      faqs = await generateTourFAQs(tour, tourData.tourEnrichment);
    } catch (error) {
      console.error('Error generating FAQs:', error);
    }

    const {
      pricing,
      promotionScore,
      tourEnrichment,
      operatorPremiumData,
      operatorTours,
      reviews
    } = tourData;

    // Fetch similar tours server-side (for SEO - crawlers can see it)
    const { similarTours: fetchedSimilarTours } = await fetchSimilarToursServer(productId, tour, destinationData);
    const similarTours = fetchedSimilarTours || [];

    // CRM sync (non-blocking)
    if (tour && productId) {
      import('@/lib/tourOperatorsCRM')
        .then(({ syncOperator }) => syncOperator(tour, productId))
        .catch(() => {});
    }

    // Track tour for sitemap (non-blocking)
    trackTourForSitemap(productId, tour, destinationData);

    // Generate structured data
    const tourSlug = generateTourSlug(tour.title);
    const canonicalUrl = tourSlug ? `https://toptours.ai/tours/${productId}/${tourSlug}` : `https://toptours.ai/tours/${productId}`;
    const mainImage = tour.images?.[0]?.variants?.[3]?.url || tour.images?.[0]?.variants?.[0]?.url;
    
    // Build Product schema - only include if at least offers OR aggregateRating is available
    const hasOffers = pricing && pricing > 0;
    const hasRating = tour.reviews?.combinedAverageRating && tour.reviews?.totalReviews;
    
    // Only create Product schema if valid (Google requires offers, review, or aggregateRating)
    const productJsonLd = (hasOffers || hasRating) ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: tour.title,
      description: tour.description?.summary || tour.description?.shortDescription || '',
      image: mainImage ? [mainImage] : undefined,
      sku: productId,
      offers: hasOffers ? {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'USD',
        price: pricing,
            availability: 'https://schema.org/InStock',
      } : undefined,
      aggregateRating: hasRating ? {
              '@type': 'AggregateRating',
        ratingValue: tour.reviews.combinedAverageRating,
        reviewCount: tour.reviews.totalReviews,
      } : undefined,
    } : null;

    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toptours.ai' },
        { '@type': 'ListItem', position: 2, name: 'Tours', item: 'https://toptours.ai/tours' },
        { '@type': 'ListItem', position: 3, name: tour.title, item: canonicalUrl },
      ],
    };

    const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;

    return (
      <>
        {productJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
        
        <TourDetailClient
          tour={tour}
          similarTours={similarTours}
          productId={productId}
          pricing={pricing}
          enrichment={tourEnrichment}
          initialPromotionScore={promotionScore}
          destinationData={destinationData}
          restaurantCount={restaurantCount}
          restaurants={restaurants}
          operatorPremiumData={operatorPremiumData}
          operatorTours={operatorTours}
          categoryGuides={categoryGuides}
          faqs={faqs}
          reviews={reviews}
        />
      </>
    );
  } catch (error) {
    console.error('Error fetching tour:', error);
    notFound();
  }
}
