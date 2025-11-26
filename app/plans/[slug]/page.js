import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import PlanDetailClient from './PlanDetailClient';
import { getPlanWithItems } from '@/lib/travelPlans';
import { getPlanPromotionScore } from '@/lib/promotionSystem';
import { getDestinationById } from '@/data/destinationsData';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { getViatorDestinationBySlug, getViatorDestinationById } from '@/lib/supabaseCache';

/**
 * Generate metadata for plan detail page
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  if (!slug) {
    return {
      title: 'Travel Plan Not Found | TopTours.ai',
      description: 'The travel plan you are looking for could not be found.'
    };
  }

  try {
    const plan = await getPlanWithItems(slug);
    
    if (!plan || !plan.is_public) {
      return {
        title: 'Travel Plan Not Found | TopTours.ai',
        description: 'The travel plan you are looking for could not be found.'
      };
    }

    const destination = plan.destination_id ? getDestinationById(plan.destination_id) : null;
    const destinationName = destination?.fullName || destination?.name || plan.destination_id || '';
    
    const title = `${plan.title} | TopTours.ai™`;
    const description = plan.description || `A ${destinationName ? destinationName + ' ' : ''}travel plan created by the TopTours.ai community. Discover amazing tours and restaurants.`;
    const image = plan.cover_image_url || (destination?.imageUrl) || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/community%20plans.png';
    const planUrl = `https://toptours.ai/plans/${slug}`;

    return {
      title,
      description: description.substring(0, 160),
      keywords: `travel plan, travel itinerary, ${destinationName ? destinationName + ' ' : ''}tours, ${destinationName ? destinationName + ' ' : ''}restaurants, community travel plan`,
      openGraph: {
        title,
        description: description.substring(0, 160),
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: plan.title,
          },
        ],
        type: 'article',
        url: planUrl,
        siteName: 'TopTours.ai',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: description.substring(0, 160),
        images: [image],
      },
      alternates: {
        canonical: planUrl,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Travel Plan | TopTours.ai',
      description: 'Discover amazing travel plans created by the TopTours.ai community.'
    };
  }
}

export default async function PlanDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  if (!slug) {
    notFound();
  }

  try {
    // Get current user ID if authenticated
    const headersList = await headers();
    const supabase = createSupabaseServiceRoleClient();
    let userId = null;
    
    // Try to get user from auth header (if available)
    const authHeader = headersList.get('authorization');
    if (authHeader) {
      // Extract user from session if needed
      // For now, we'll fetch the plan and let the client handle auth
    }

    // Fetch plan with items
    const plan = await getPlanWithItems(slug, userId);
    
    if (!plan) {
      notFound();
    }

    // Check if plan is public or belongs to user
    if (!plan.is_public && plan.user_id !== userId) {
      notFound();
    }

    // Get promotion score
    const promotionScore = await getPlanPromotionScore(plan.id);

    // Get destination data - use same logic as destination pages
    let destination = plan.destination_id ? getDestinationById(plan.destination_id) : null;
    
    // If not found in curated, try database lookup (same as destination pages)
    if (!destination && plan.destination_id) {
      // Try by slug first (most common)
      let dbDestination = await getViatorDestinationBySlug(plan.destination_id);
      
      // If not found by slug, try by ID (in case it's a numeric Viator ID)
      if (!dbDestination && /^\d+$/.test(plan.destination_id)) {
        dbDestination = await getViatorDestinationById(plan.destination_id);
      }
      
      if (dbDestination) {
        // Generate slug from name if slug is not available
        const generateSlug = (name) => {
          return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        };
        
        // Use slug if available, otherwise generate from name
        const destinationSlug = dbDestination.slug || generateSlug(dbDestination.name);
        
        // Create a destination object from database data (same format as destination pages)
        destination = {
          id: destinationSlug, // Use slug for URL, not numeric ID
          name: dbDestination.name,
          fullName: dbDestination.name,
          country: dbDestination.country,
          category: dbDestination.region,
          imageUrl: null, // Database destinations don't have images
          // Store the Viator destination ID for tour matching
          destinationId: dbDestination.id?.toString(),
        };
      }
    } else if (destination) {
      // For curated destinations, ensure destinationId is set (same as destination pages)
      if (!destination.destinationId) {
        const dbDestination = await getViatorDestinationBySlug(destination.id);
        if (dbDestination) {
          destination.destinationId = dbDestination.id?.toString();
        }
      }
    }

    // Get user profile for plan creator
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', plan.user_id)
      .single();

    // Generate Schema.org Article structured data for SEO
    const destinationName = destination?.fullName || destination?.name || plan.destination_id || '';
    const planImage = plan.cover_image_url || destination?.imageUrl || 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/community%20plans.png';
    const planUrl = `https://toptours.ai/plans/${slug}`;
    const planDescription = plan.description || `A ${destinationName ? destinationName + ' ' : ''}travel plan created by the TopTours.ai community. Discover amazing tours and restaurants.`;
    
    // Count items
    const toursCount = (plan.items || []).filter(item => item.item_type === 'tour').length;
    const restaurantsCount = (plan.items || []).filter(item => item.item_type === 'restaurant').length;
    
    // Get max day number for itinerary plans
    const maxDay = plan.plan_mode === 'itinerary' && plan.items?.length > 0
      ? Math.max(...plan.items.map(item => item.day_number || 0).filter(Boolean))
      : 0;
    
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': plan.title,
      'description': planDescription,
      'image': planImage,
      'articleBody': planDescription,
      'articleSection': 'Travel Plans',
      'author': {
        '@type': creatorProfile?.display_name ? 'Person' : 'Organization',
        'name': creatorProfile?.display_name || 'TopTours.ai Community',
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'TopTours.ai',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://toptours.ai/logo.png',
        },
      },
      'datePublished': plan.created_at || new Date().toISOString(),
      'dateModified': plan.updated_at || plan.created_at || new Date().toISOString(),
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': planUrl,
      },
      ...(destinationName ? {
        'about': {
          '@type': 'TouristDestination',
          'name': destinationName,
        },
      } : {}),
      ...(plan.plan_mode === 'itinerary' && maxDay > 0 ? {
        'timeRequired': `P${maxDay}D`,
      } : {}),
      ...(toursCount > 0 || restaurantsCount > 0 ? {
        'mentions': [
          ...(toursCount > 0 ? [{
            '@type': 'Tour',
            'name': `${toursCount} tour${toursCount !== 1 ? 's' : ''}`,
          }] : []),
          ...(restaurantsCount > 0 ? [{
            '@type': 'Restaurant',
            'name': `${restaurantsCount} restaurant${restaurantsCount !== 1 ? 's' : ''}`,
          }] : []),
        ],
      } : {}),
    };

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
          'item': 'https://toptours.ai/plans',
        },
        ...(destinationName ? [{
          '@type': 'ListItem',
          'position': 3,
          'name': destinationName,
          'item': `https://toptours.ai/plans?destination=${encodeURIComponent(plan.destination_id || destinationName)}`,
        }] : []),
        {
          '@type': 'ListItem',
          'position': destinationName ? 4 : 3,
          'name': plan.title,
          'item': planUrl,
        },
      ],
    };

    // Parse selected_tips from JSON string if needed, then fetch tour and restaurant data for items
    const parsedItems = (plan.items || []).map(item => {
      // Parse selected_tips from JSON string if it exists
      if (item.selected_tip && typeof item.selected_tip === 'string') {
        try {
          // Try to parse as JSON array
          const parsed = JSON.parse(item.selected_tip);
          if (Array.isArray(parsed)) {
            return {
              ...item,
              selected_tips: parsed,
            };
          }
        } catch {
          // If parsing fails, treat as single tip ID
          return {
            ...item,
            selected_tips: [item.selected_tip],
          };
        }
      }
      
      // If selected_tips is already an array or null, return as is
      if (!item.selected_tips && item.selected_tip) {
        return {
          ...item,
          selected_tips: [item.selected_tip],
        };
      }
      
      return item;
    });

    // Fetch tour and restaurant data for items
    const itemsWithData = await Promise.all(
      parsedItems.map(async (item) => {
        if (item.item_type === 'tour') {
          // Fetch tour data from cache or API
          try {
            const { getCachedTour } = await import('@/lib/viatorCache');
            const tour = await getCachedTour(item.product_id);
            return {
              ...item,
              tourData: tour || null,
            };
          } catch (error) {
            console.error(`Error fetching tour ${item.product_id}:`, error);
            return { ...item, tourData: null };
          }
        } else if (item.item_type === 'restaurant') {
          // Fetch restaurant data
          try {
            const { data: restaurant } = await supabase
              .from('restaurants')
              .select('*')
              .eq('id', item.restaurant_id)
              .eq('is_active', true)
              .single();
            
            if (restaurant) {
              const { formatRestaurantForFrontend } = await import('@/lib/restaurants');
              const formatted = formatRestaurantForFrontend(restaurant);
              return {
                ...item,
                restaurantData: formatted,
              };
            }
            return { ...item, restaurantData: null };
          } catch (error) {
            console.error(`Error fetching restaurant ${item.restaurant_id}:`, error);
            return { ...item, restaurantData: null };
          }
        }
        return item;
      })
    );

    return (
      <>
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <PlanDetailClient
          plan={{
            ...plan,
            items: itemsWithData,
          }}
          promotionScore={promotionScore}
          destination={destination}
          creatorProfile={creatorProfile}
        />
      </>
    );
  } catch (error) {
    console.error('Error in PlanDetailPage:', error);
    notFound();
  }
}

