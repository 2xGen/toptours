import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import TourDetailClient from '../[productId]/TourDetailClient';
import { loadTourData, loadDestinationData } from '../[productId]/TourDataLoader';
import { getCachedTour, cacheTour } from '@/lib/viatorCache';
import { generateTourFAQs, generateFAQSchema } from '@/lib/faqGeneration';
import { buildEnhancedMetaDescription, buildEnhancedTitle } from '@/lib/metaDescription';
import { getTourEnrichment } from '@/lib/tourEnrichment';
import { generateTourSlug } from '@/utils/tourHelpers';
import { trackTourForSitemap } from '@/lib/tourSitemap';

// Revalidate every hour for fresh data
export const revalidate = 3600;

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
      description: 'The tour you are looking for could not be found.'
    };
  }

  try {
    // Try to get cached tour data first
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
        next: { revalidate: 3600 }
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
      await cacheTour(productId, tour);
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
      robots: { index: true, follow: true },
    };
  } catch (error) {
    return {
      title: 'Tour Not Found | TopTours.ai',
      description: 'The tour you are looking for could not be found.'
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
    // Try to get cached tour data first (fast)
    let tour = await getCachedTour(productId);
    
    if (!tour) {
      // Cache miss - fetch from Viator API
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
        next: { revalidate: 3600 }
      });

      if (!productResponse.ok) {
        notFound();
      }

      tour = await productResponse.json();
      if (!tour || tour.error) {
        notFound();
      }
      await cacheTour(productId, tour);
    }

    // Load non-critical data in parallel
    const [tourDataResult, destinationDataResult] = await Promise.allSettled([
      loadTourData(productId, tour),
      loadDestinationData(tour, productId)
    ]);

    // Extract tour data with defaults
    const tourData = tourDataResult.status === 'fulfilled' ? tourDataResult.value : {
      pricing: null,
      promotionScore: { product_id: productId, total_score: 0, monthly_score: 0, weekly_score: 0, past_28_days_score: 0 },
      tourEnrichment: null,
      operatorPremiumData: null,
      operatorTours: [],
      reviews: null
    };

    // Extract destination data with defaults
    const { destinationData, restaurantCount, restaurants, categoryGuides } = destinationDataResult.status === 'fulfilled' 
      ? destinationDataResult.value 
      : { destinationData: null, restaurantCount: 0, restaurants: [], categoryGuides: [] };

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

    // Recommended and similar tours are fetched client-side for faster initial render
    const recommendedTours = [];
    const similarTours = [];

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
    
    const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: tour.title,
      description: tour.description?.summary || tour.description?.shortDescription || '',
      image: mainImage ? [mainImage] : undefined,
      sku: productId,
      offers: pricing ? {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'USD',
        price: pricing,
        availability: 'https://schema.org/InStock',
      } : undefined,
      aggregateRating: tour.reviews?.combinedAverageRating && tour.reviews?.totalReviews ? {
        '@type': 'AggregateRating',
        ratingValue: tour.reviews.combinedAverageRating,
        reviewCount: tour.reviews.totalReviews,
      } : undefined,
    };

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
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
          recommendedTours={recommendedTours}
        />
      </>
    );
  } catch (error) {
    console.error('Error fetching tour:', error);
    notFound();
  }
}
