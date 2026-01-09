import { notFound } from 'next/navigation';
import { destinations } from '../../../../src/data/destinationsData';
import {
  getRestaurantsForDestination as getRestaurantsForDestinationFromDB,
  formatRestaurantForFrontend,
} from '@/lib/restaurants';
import { getRestaurantsForDestination as getRestaurantsForDestinationFromStatic } from './restaurantsData';
import { getRestaurantPromotionScoresByDestination } from '@/lib/promotionSystem';
import { getPromotedToursByDestination, getPromotedRestaurantsByDestination } from '@/lib/promotionSystem';
import { getPremiumRestaurantIds } from '@/lib/restaurantPremiumServer';
import { getAllCategoryGuidesForDestination } from '../lib/categoryGuides';
import RestaurantsListClient from './RestaurantsListClient';

// Force dynamic rendering to ensure premium restaurant data is always fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const destination = destinations.find((d) => d.id === id);

  if (!destination) {
    return {
      title: 'Best Restaurants | TopTours.ai',
    };
  }

  // Get restaurant count for better description
  let restaurants = await getRestaurantsForDestinationFromDB(id);
  if (restaurants.length > 0) {
    restaurants = restaurants.map(r => formatRestaurantForFrontend(r));
  } else {
    restaurants = getRestaurantsForDestinationFromStatic(id);
  }
  const restaurantCount = restaurants?.length || 0;

  // Always use standardized OG image so dimensions are correct
  const ogImage = 'https://toptours.ai/OG%20Images/Browse%20Restaurants%20by%20Best%20Match.jpg';
  const description = `Discover ${restaurantCount > 0 ? `${restaurantCount} top-rated` : 'the best'} restaurants in ${destination.fullName}, from waterfront seafood to family-run cafés. Sort by Best Match to rank restaurants by your taste.`;

  return {
    title: `Best Restaurants in ${destination.fullName} | TopTours.ai`,
    description,
    keywords: `restaurants ${destination.fullName}, dining ${destination.name}, best restaurants ${destination.fullName}, where to eat ${destination.fullName}, ${destination.fullName} restaurants`,
    alternates: {
      canonical: `https://toptours.ai/destinations/${destination.id}/restaurants`,
    },
    openGraph: {
      title: `Best Restaurants in ${destination.fullName}`,
      description,
      url: `https://toptours.ai/destinations/${destination.id}/restaurants`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Best Restaurants in ${destination.fullName}`,
        },
      ],
      type: 'website',
      siteName: 'TopTours.ai',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best Restaurants in ${destination.fullName}`,
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

export default async function RestaurantsIndexPage({ params }) {
  const { id } = await params;
  const destination = destinations.find((d) => d.id === id);

  if (!destination) {
    notFound();
  }

  // Try database first, fallback to static files
  let restaurants = await getRestaurantsForDestinationFromDB(id);
  if (restaurants.length > 0) {
    restaurants = restaurants.map(r => formatRestaurantForFrontend(r));
  } else {
    restaurants = getRestaurantsForDestinationFromStatic(id);
  }

  if (!restaurants || restaurants.length === 0) {
    notFound();
  }

  // Fetch promoted restaurants for this destination
  let promotedRestaurants = [];
  try {
    const promotedRestaurantData = await getPromotedRestaurantsByDestination(id, 20);
    if (promotedRestaurantData.length > 0) {
      // Convert both to strings for consistent comparison
      const promotedRestaurantIds = new Set(
        promotedRestaurantData.map(pr => String(pr.id || pr.restaurant_id)).filter(Boolean)
      );
      promotedRestaurants = restaurants.filter(r => 
        r.id && promotedRestaurantIds.has(String(r.id))
      );
    }
  } catch (error) {
    console.error('Error fetching promoted restaurants:', error);
    // Continue with empty array - page will still work
  }
  
  // Fetch promoted tours for this destination (for cross-promotion on restaurant pages)
  // Fetch full tour data from Viator API (similar to destination detail page)
  let promotedTours = [];
  try {
    // Get destination ID for Viator (needed for tour queries)
    const destinationIdForScores = destination.destinationId || destination.viatorDestinationId;
    if (destinationIdForScores) {
      const promotedTourData = await getPromotedToursByDestination(destinationIdForScores, 6);
      
      if (promotedTourData.length > 0) {
        console.log(`✅ Restaurants Page - Found ${promotedTourData.length} promoted tour product ID(s) for ${id}`);
        
        // Fetch full tour data for each promoted tour
        const { getCachedTour } = await import('@/lib/viatorCache');
        const fetchPromises = promotedTourData.map(async (promoted) => {
          const productId = promoted.product_id || promoted.productId || promoted.productCode;
          if (!productId) return null;
          
          try {
            // Try to get cached tour first
            let tour = await getCachedTour(productId);
            
            // If not cached, fetch from Viator API
            if (!tour) {
              const apiKey = process.env.VIATOR_API_KEY;
              if (!apiKey) {
                console.warn(`No API key for fetching promoted tour ${productId}`);
                return null;
              }
              
              const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;
              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'exp-api-key': apiKey,
                  'Accept': 'application/json;version=2.0',
                  'Accept-Language': 'en-US',
                  'Content-Type': 'application/json'
                },
                cache: 'no-store'
              });
              
              if (response.ok) {
                tour = await response.json();
              } else {
                console.warn(`Failed to fetch promoted tour ${productId}: ${response.status}`);
                return null;
              }
            }
            
            // Return tour with product_id for matching
            return {
              ...tour,
              productId: productId,
              productCode: productId,
              product_id: productId,
            };
          } catch (error) {
            console.error(`Error fetching promoted tour ${productId}:`, error);
            return null;
          }
        });
        
        const fetchedTours = await Promise.all(fetchPromises);
        promotedTours = fetchedTours.filter(t => t !== null);
        
        if (promotedTours.length > 0) {
          console.log(`✅ Restaurants Page - Successfully fetched ${promotedTours.length} promoted tour(s) with full data`);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching promoted tours:', error);
    // Continue with empty array - page will still work
  }

  // Fetch restaurant promotion scores for this destination
  const restaurantPromotionScores = await getRestaurantPromotionScoresByDestination(id);

  // Fetch premium restaurant IDs for this destination (batch query - efficient!)
  let premiumRestaurantIds = [];
  try {
    const premiumSet = await getPremiumRestaurantIds(id);
    premiumRestaurantIds = Array.from(premiumSet);
  } catch (error) {
    console.error('Error fetching premium restaurant IDs:', error);
  }

  // Fetch category guides for this destination
  let categoryGuides = [];
  try {
    categoryGuides = await getAllCategoryGuidesForDestination(id);
  } catch (error) {
    console.error('Error fetching category guides:', error);
  }

  // ItemList schema for restaurant listing page
  // Keep it simple - just list the restaurants. Detailed ratings/reviews belong on individual restaurant pages
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Restaurants in ${destination.fullName}`,
    description: `A curated list of top-rated restaurants in ${destination.fullName}`,
    numberOfItems: restaurants.length,
    itemListElement: restaurants.map((restaurant, index) => {
      // Build address object from available data
      let address = null;
      
      // Try to get address from schema data first (most complete)
      if (restaurant.schema?.address) {
        address = restaurant.schema.address;
      } 
      // Try to get from addressComponents (parsed from database)
      else if (restaurant.addressComponents) {
        address = {
          '@type': 'PostalAddress',
          ...(restaurant.addressComponents.street_number && restaurant.addressComponents.route && {
            streetAddress: `${restaurant.addressComponents.street_number} ${restaurant.addressComponents.route}`.trim(),
          }),
          ...(restaurant.addressComponents.locality && {
            addressLocality: restaurant.addressComponents.locality,
          }),
          ...(restaurant.addressComponents.administrative_area_level_1 && {
            addressRegion: restaurant.addressComponents.administrative_area_level_1,
          }),
          ...(restaurant.addressComponents.postal_code && {
            postalCode: restaurant.addressComponents.postal_code,
          }),
          ...(restaurant.addressComponents.country && {
            addressCountry: restaurant.addressComponents.country,
          }),
        };
        
        // Remove empty fields
        Object.keys(address).forEach(key => {
          if (address[key] === undefined || address[key] === null || address[key] === '') {
            delete address[key];
          }
        });
        
        // If no valid fields, set to null
        if (Object.keys(address).length <= 1) { // Only @type remains
          address = null;
        }
      }
      // Fallback to contact.address string - parse it if possible
      else if (restaurant.contact?.address) {
        const addressString = restaurant.contact.address;
        // Try to extract city and country from destination
        address = {
          '@type': 'PostalAddress',
          streetAddress: addressString,
          ...(destination.name && {
            addressLocality: destination.name,
          }),
          ...(destination.country && {
            addressCountry: destination.country,
          }),
        };
      }
      // Last resort: use destination location
      else {
        address = {
          '@type': 'PostalAddress',
          addressLocality: destination.name || destination.fullName,
          ...(destination.country && {
            addressCountry: destination.country,
          }),
        };
      }
      
      const restaurantItem = {
        '@type': 'Restaurant',
        '@id': `https://toptours.ai/destinations/${destination.id}/restaurants/${restaurant.slug}`,
        name: restaurant.name,
        url: `https://toptours.ai/destinations/${destination.id}/restaurants/${restaurant.slug}`,
      };
      
      // Only add address if we have valid address data
      if (address && Object.keys(address).length > 1) {
        restaurantItem.address = address;
      }
      
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: restaurantItem,
      };
    }),
  };

  // Breadcrumb schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://toptours.ai/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Destinations',
        item: 'https://toptours.ai/destinations',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: destination.name,
        item: `https://toptours.ai/destinations/${destination.id}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `Best Restaurants in ${destination.fullName}`,
        item: `https://toptours.ai/destinations/${destination.id}/restaurants`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RestaurantsListClient destination={destination} restaurants={restaurants} promotedTours={promotedTours} promotedRestaurants={promotedRestaurants} restaurantPromotionScores={restaurantPromotionScores} premiumRestaurantIds={premiumRestaurantIds} categoryGuides={categoryGuides} />
    </>
  );
}
