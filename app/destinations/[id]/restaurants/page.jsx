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
import { getDestinationFeatures } from '@/lib/destinationFeatures';
import RestaurantsListClient from './RestaurantsListClient';

// Revalidate every hour for fresh data
// Revalidate every 24 hours - page-level cache (not API JSON cache, so Viator compliant)
export const revalidate = 604800; // 7 days - increased to reduce ISR writes during Google reindexing

// Shared function to fetch restaurants (used by both metadata and page)
async function getRestaurantsForPage(destinationId) {
  let restaurants = await getRestaurantsForDestinationFromDB(destinationId);
  if (restaurants.length > 0) {
    restaurants = restaurants.map(r => formatRestaurantForFrontend(r));
  } else {
    restaurants = getRestaurantsForDestinationFromStatic(destinationId);
  }
  return restaurants;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const destination = destinations.find((d) => d.id === id);

  if (!destination) {
    return {
      title: 'Best Restaurants | TopTours.ai',
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  // Get restaurant count for better description (use shared function)
  const restaurants = await getRestaurantsForPage(id);
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

  // Get destination ID for Viator (needed for tour queries)
  const destinationIdForScores = destination.destinationId || destination.viatorDestinationId;

  // Parallelize all independent data fetching operations
  const [
    promotedRestaurantDataResult,
    promotedTourDataResult,
    restaurantPromotionScoresResult,
    premiumRestaurantIdsResult,
    categoryGuidesResult,
    destinationFeaturesResult
  ] = await Promise.allSettled([
    // Promoted restaurant data
    getPromotedRestaurantsByDestination(id, 20).catch(() => []),
    
    // Promoted tour data (just IDs first)
    destinationIdForScores 
      ? getPromotedToursByDestination(destinationIdForScores, 6).catch(() => [])
      : Promise.resolve([]),
    
    // Restaurant promotion scores
    getRestaurantPromotionScoresByDestination(id).catch(() => ({})),
    
    // Premium restaurant IDs
    getPremiumRestaurantIds(id)
      .then(set => Array.from(set))
      .catch(() => []),
    
    // Category guides
    getAllCategoryGuidesForDestination(id).catch(() => []),
    
    // Destination features (lightweight checks for sticky nav)
    getDestinationFeatures(id).catch(() => ({ hasRestaurants: false, hasBabyEquipment: false, hasAirportTransfers: false }))
  ]);

  // Extract results
  const promotedRestaurantData = promotedRestaurantDataResult.status === 'fulfilled' ? promotedRestaurantDataResult.value : [];
  const promotedTourData = promotedTourDataResult.status === 'fulfilled' ? promotedTourDataResult.value : [];
  const restaurantPromotionScores = restaurantPromotionScoresResult.status === 'fulfilled' ? restaurantPromotionScoresResult.value : {};
  const premiumRestaurantIds = premiumRestaurantIdsResult.status === 'fulfilled' ? premiumRestaurantIdsResult.value : [];
  const categoryGuides = categoryGuidesResult.status === 'fulfilled' ? categoryGuidesResult.value : [];
  const destinationFeatures = destinationFeaturesResult.status === 'fulfilled' ? destinationFeaturesResult.value : { hasRestaurants: false, hasBabyEquipment: false, hasAirportTransfers: false };

  // Process promoted restaurants (using data fetched in parallel above)
  let promotedRestaurants = [];
  try {
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
    // Continue with empty promoted restaurants
  }
  
  // Fetch full promoted tour data (after we have the IDs)
  let promotedTours = [];
  try {
    if (promotedTourData.length > 0 && destinationIdForScores) {
      const { getCachedTour } = await import('@/lib/viatorCache');
      const apiKey = process.env.VIATOR_API_KEY;
      
      const fetchPromises = promotedTourData.map(async (promoted) => {
        const productId = promoted.product_id || promoted.productId || promoted.productCode;
        if (!productId) return null;
        
        try {
          let tour = await getCachedTour(productId);
          
          if (!tour && apiKey) {
            const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'exp-api-key': apiKey,
                'Accept': 'application/json;version=2.0',
                'Accept-Language': 'en-US',
                'Content-Type': 'application/json'
              },
              next: { revalidate: 86400 }, // Cache for 24 hours - we also use getCachedTour, this reduces fetch calls
            });
            
            if (response.ok) {
              tour = await response.json();
            } else {
              return null;
            }
          }
          
          if (!tour) return null;
          
          return {
            ...tour,
            productId: productId,
            productCode: productId,
            product_id: productId,
          };
        } catch (error) {
          return null;
        }
      });
      
      promotedTours = (await Promise.all(fetchPromises)).filter(Boolean);
    }
  } catch (error) {
    // Continue with empty promoted tours
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
      <RestaurantsListClient destination={destination} restaurants={restaurants} promotedTours={promotedTours} promotedRestaurants={promotedRestaurants} restaurantPromotionScores={restaurantPromotionScores} premiumRestaurantIds={premiumRestaurantIds} categoryGuides={categoryGuides} destinationFeatures={destinationFeatures} />
    </>
  );
}
