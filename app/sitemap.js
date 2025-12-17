import { getAllDestinations } from '../src/data/destinationsData.js';
import { travelGuides } from '../src/data/travelGuidesData.js';
import { getRestaurantCountsByDestination } from '../src/lib/restaurants.js';
import { createSupabaseServiceRoleClient } from '../src/lib/supabaseClient.js';

export default async function sitemap() {
  const baseUrl = 'https://toptours.ai';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/travel-guides`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclosure`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/restaurants`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tours`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Destination pages
  const destinations = getAllDestinations();
  const destinationPages = destinations.map((destination) => ({
    url: `${baseUrl}/destinations/${destination.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Restaurant listing pages per destination (fetch from database)
  const restaurantCounts = await getRestaurantCountsByDestination();
  const restaurantListingPages = destinations
    .filter((destination) => (restaurantCounts[destination.id] || 0) > 0)
    .map((destination) => ({
      url: `${baseUrl}/destinations/${destination.id}/restaurants`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.75,
    }));

  // Destination tour listing pages
  const tourListingPages = destinations.map((destination) => ({
    url: `${baseUrl}/destinations/${destination.id}/tours`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.78,
  }));

  // Destination operator listing pages
  const operatorListingPages = destinations.map((destination) => ({
    url: `${baseUrl}/destinations/${destination.id}/operators`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.72,
  }));

  // Individual restaurant pages (fetch from database)
  const supabase = createSupabaseServiceRoleClient();
  const allRestaurants = [];
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('destination_id, slug, updated_at')
      .eq('is_active', true)
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching restaurants for sitemap:', error);
      break;
    }

    if (data && data.length > 0) {
      allRestaurants.push(...data);
    }

    hasMore = data && data.length === pageSize;
    from += pageSize;
  }

  const restaurantDetailPages = allRestaurants.map((restaurant) => ({
    url: `${baseUrl}/destinations/${restaurant.destination_id}/restaurants/${restaurant.slug}`,
    lastModified: restaurant.updated_at || currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Travel guide pages
  const travelGuidePages = travelGuides.map((guide) => ({
    url: `${baseUrl}/travel-guides/${guide.id}`,
    lastModified: guide.publishDate || currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...destinationPages,
    ...tourListingPages,
    ...operatorListingPages,
    ...restaurantListingPages,
    ...restaurantDetailPages,
    ...travelGuidePages,
  ];
}

