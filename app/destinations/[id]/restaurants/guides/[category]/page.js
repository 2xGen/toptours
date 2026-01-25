import { notFound } from 'next/navigation';
import { destinations } from '../../../../../../src/data/destinationsData';
import { getRestaurantGuide, getRestaurantsForGuide } from '@/lib/restaurantGuides';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';
import { getTrendingToursByDestination } from '@/lib/promotionSystem';
import RestaurantGuideClient from './RestaurantGuideClient';
import { formatRestaurantForFrontend } from '@/lib/restaurants';

// Force dynamic rendering since we're querying the database
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { id, category } = resolvedParams;
  
  const destination = destinations.find((d) => d.id === id);
  if (!destination) {
    return {
      title: 'Restaurant Guide Not Found | TopTours.ai',
      robots: {
        index: false,
        follow: false,
        noindex: true,
        nofollow: true,
      },
    };
  }
  
  const guide = await getRestaurantGuide(id, category);
  if (!guide) {
    return {
      title: `${category} in ${destination.fullName} | TopTours.ai`,
      robots: {
        index: true,
        follow: true,
      },
    };
  }
  
  const seo = guide.seo || {};
  const title = seo.title || guide.title || `${guide.category_name} in ${destination.fullName}`;
  const description = seo.description || guide.subtitle || `Discover the best ${guide.category_name.toLowerCase()} in ${destination.fullName}`;
  
  // Always use standardized OG image
  const ogImage = 'https://toptours.ai/OG%20Images/The%20best%20restaurants%20globally.jpg';
  
  return {
    title,
    description,
    keywords: seo.keywords || `${guide.category_name.toLowerCase()} ${destination.fullName}, restaurants ${destination.fullName}, dining ${destination.name}`,
    alternates: {
      canonical: `https://toptours.ai/destinations/${id}/restaurants/guides/${category}`,
    },
    openGraph: {
      title,
      description,
      url: `https://toptours.ai/destinations/${id}/restaurants/guides/${category}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
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

export default async function RestaurantGuidePage({ params }) {
  const resolvedParams = await params;
  const { id, category } = resolvedParams;
  
  const destination = destinations.find((d) => d.id === id);
  if (!destination) {
    notFound();
  }
  
  // Fetch guide from database
  const guide = await getRestaurantGuide(id, category);
  if (!guide) {
    notFound();
  }
  
  // Parse JSON fields if they're strings
  let stats = guide.stats;
  if (typeof stats === 'string') {
    try {
      stats = JSON.parse(stats);
    } catch (e) {
      stats = {};
    }
  }
  
  let seo = guide.seo;
  if (typeof seo === 'string') {
    try {
      seo = JSON.parse(seo);
    } catch (e) {
      seo = {};
    }
  }
  
  let whyChoose = guide.why_choose;
  if (typeof whyChoose === 'string') {
    try {
      whyChoose = JSON.parse(whyChoose);
    } catch (e) {
      whyChoose = [];
    }
  }
  
  let whatToExpect = guide.what_to_expect;
  if (typeof whatToExpect === 'string') {
    try {
      whatToExpect = JSON.parse(whatToExpect);
    } catch (e) {
      whatToExpect = {};
    }
  }
  
  let faqs = guide.faqs;
  if (typeof faqs === 'string') {
    try {
      faqs = JSON.parse(faqs);
    } catch (e) {
      faqs = [];
    }
  }
  
  let filterCriteria = guide.filter_criteria;
  if (typeof filterCriteria === 'string') {
    try {
      filterCriteria = JSON.parse(filterCriteria);
    } catch (e) {
      filterCriteria = {};
    }
  }
  
  // Fetch restaurants matching filter criteria
  const restaurants = await getRestaurantsForGuide(id, filterCriteria);
  const formattedRestaurants = restaurants.map(r => formatRestaurantForFrontend(r));
  
  // Fetch category guides for internal linking
  const categoryGuides = await getAllCategoryGuidesForDestination(id);
  
  // Fetch trending tours for CTA
  const trendingTours = await getTrendingToursByDestination(id, 6);
  
  // Format guide data for client component
  const guideData = {
    title: guide.title,
    subtitle: guide.subtitle,
    categoryName: guide.category_name,
    heroImage: guide.hero_image || destination.imageUrl,
    stats: stats,
    introduction: guide.introduction,
    seo: seo,
    whyChoose: whyChoose || [],
    whatToExpect: whatToExpect || {},
    expertTips: guide.expert_tips || [],
    faqs: faqs || []
  };
  
  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guideData.title,
    description: seo.description || guideData.subtitle,
    image: guideData.heroImage || destination.imageUrl || 'https://toptours.ai/OG%20Images/The%20best%20restaurants%20globally.jpg',
    datePublished: guide.created_at || new Date().toISOString(),
    dateModified: guide.updated_at || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'TopTours.ai',
      url: 'https://toptours.ai'
    },
    publisher: {
      '@type': 'Organization',
      name: 'TopTours.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://toptours.ai/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://toptours.ai/destinations/${id}/restaurants/guides/${category}`
    },
    about: {
      '@type': 'TouristDestination',
      name: destination.fullName || destination.name,
      description: `Restaurant guide for ${destination.fullName || destination.name}`
    }
  };

  // FAQPage schema
  const faqSchema = guideData.faqs && guideData.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guideData.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : null;

  // ItemList schema for restaurants
  const restaurantListSchema = formattedRestaurants.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${guideData.categoryName} in ${destination.fullName || destination.name}`,
    description: `List of top ${guideData.categoryName.toLowerCase()} in ${destination.fullName || destination.name}`,
    itemListElement: formattedRestaurants.slice(0, 10).map((restaurant, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Restaurant',
        name: restaurant.name,
        url: `https://toptours.ai/destinations/${id}/restaurants/${restaurant.slug}`,
        image: restaurant.heroImage,
        address: {
          '@type': 'PostalAddress',
          addressLocality: destination.fullName || destination.name,
          addressCountry: destination.country || ''
        },
        aggregateRating: restaurant.ratings?.googleRating ? {
          '@type': 'AggregateRating',
          ratingValue: restaurant.ratings.googleRating,
          reviewCount: restaurant.ratings.reviewCount || 0,
          bestRating: 5,
          worstRating: 1
        } : undefined,
        priceRange: restaurant.pricing?.priceRange || undefined,
        servesCuisine: restaurant.cuisines?.join(', ') || undefined
      }
    }))
  } : null;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {restaurantListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantListSchema) }}
        />
      )}

      <RestaurantGuideClient
        destinationId={id}
        destination={destination}
        guideData={guideData}
        restaurants={formattedRestaurants}
        categoryGuides={categoryGuides}
        trendingTours={trendingTours}
      />
    </>
  );
}

