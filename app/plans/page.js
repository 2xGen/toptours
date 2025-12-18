import PlansListingClient from './PlansListingClient';
import { getPopularPlansByDestination } from '@/lib/travelPlans';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

// Force dynamic rendering to avoid build-time chunk issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;
// Force fresh build - remove after deployment works

/**
 * Generate metadata for plans listing page
 */
export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const destinationId = resolvedSearchParams.destination;
  const ogImage = 'https://toptours.ai/OG%20Images/create%20and%20find%20itineraries%20for%20all%20destinations%20in%20the%20world.jpg';
  const baseUrl = 'https://toptours.ai/plans';
  
  if (destinationId) {
    return {
      title: `Community Travel Plans for ${destinationId} | TopTours.ai™`,
      description: `Discover curated travel plans for ${destinationId} created by the TopTours.ai community. Find itineraries, favorite tours, and restaurant recommendations shared by fellow travelers.`,
      openGraph: {
        title: `Community Travel Plans for ${destinationId}`,
        description: `Discover curated travel plans for ${destinationId} created by the TopTours.ai community.`,
        url: `${baseUrl}?destination=${encodeURIComponent(destinationId)}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: 'Community Travel Plans',
          },
        ],
        type: 'website',
        siteName: 'TopTours.ai',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Community Travel Plans for ${destinationId}`,
        description: `Discover curated travel plans for ${destinationId} created by the TopTours.ai community.`,
        images: [ogImage],
      },
      alternates: {
        canonical: `${baseUrl}?destination=${encodeURIComponent(destinationId)}`,
      },
    };
  }
  
  return {
    title: 'Community Travel Plans | Share & Discover Travel Itineraries | TopTours.ai™',
    description: 'Discover and share community-created travel plans and itineraries. Find curated tours and restaurant recommendations for destinations worldwide. Create your own travel plan and share it with fellow travelers.',
    keywords: 'travel plans, travel itineraries, community travel, travel planning, tour recommendations, restaurant recommendations, travel guides',
    openGraph: {
      title: 'Community Travel Plans | Share & Discover Travel Itineraries',
      description: 'Discover and share community-created travel plans and itineraries. Find curated tours and restaurant recommendations for destinations worldwide.',
      url: baseUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 675,
          alt: 'Community Travel Plans on TopTours.ai',
        },
      ],
      type: 'website',
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Community Travel Plans | Share & Discover Travel Itineraries',
      description: 'Discover and share community-created travel plans and itineraries. Find curated tours and restaurant recommendations for destinations worldwide.',
      images: [ogImage],
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}

export default async function PlansPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const destinationId = resolvedSearchParams?.destination || null;

  // Fetch popular plans - all public plans if no destination, or filtered by destination
  let popularPlans = [];
  try {
    if (destinationId) {
      popularPlans = await getPopularPlansByDestination(destinationId, 20);
    } else {
      // Fetch all public plans when no destination
      const supabase = createSupabaseServiceRoleClient();
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('is_public', true)
        .order('total_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!error && data) {
        popularPlans = data;
      }
    }
  } catch (error) {
    console.error('Error fetching plans:', error);
    popularPlans = [];
  }

  // Generate Schema.org structured data for CollectionPage
  const ogImage = 'https://toptours.ai/OG%20Images/create%20and%20find%20itineraries%20for%20all%20destinations%20in%20the%20world.jpg';
  const baseUrl = 'https://toptours.ai/plans';
  const currentUrl = destinationId 
    ? `${baseUrl}?destination=${encodeURIComponent(destinationId)}`
    : baseUrl;

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': destinationId 
      ? `Community Travel Plans for ${destinationId}`
      : 'Community Travel Plans',
    'description': destinationId
      ? `Discover curated travel plans for ${destinationId} created by the TopTours.ai community.`
      : 'Discover and share community-created travel plans and itineraries. Find curated tours and restaurant recommendations for destinations worldwide.',
    'url': currentUrl,
    'image': ogImage,
    'publisher': {
      '@type': 'Organization',
      'name': 'TopTours.ai',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://toptours.ai/logo.png',
      },
    },
  };

  // Add ItemList schema if we have plans
  const itemListSchema = popularPlans.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': destinationId
      ? `Travel Plans for ${destinationId}`
      : 'Community Travel Plans',
    'description': destinationId
      ? `Curated travel plans and itineraries for ${destinationId}`
      : 'Community-created travel plans and itineraries',
    'numberOfItems': popularPlans.length,
    'itemListElement': popularPlans.slice(0, 10).map((plan, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Article',
        'headline': plan.title,
        'description': plan.description || `Travel plan for ${plan.destination_id || 'destination'}`,
        'url': `https://toptours.ai/plans/${plan.slug}`,
        'image': plan.cover_image_url || ogImage,
      },
    })),
  } : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://toptours.ai',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Travel Plans',
        'item': baseUrl,
      },
      ...(destinationId ? [{
        '@type': 'ListItem',
        'position': 3,
        'name': destinationId,
        'item': currentUrl,
      }] : []),
    ],
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PlansListingClient 
        destinationId={destinationId}
        initialPlans={popularPlans}
      />
    </>
  );
}

