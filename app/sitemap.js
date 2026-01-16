import { getAllDestinations } from '../src/data/destinationsData.js';
import { travelGuides } from '../src/data/travelGuidesData.js';
import { getRestaurantCountsByDestination } from '../src/lib/restaurants.js';
import { createSupabaseServiceRoleClient } from '../src/lib/supabaseClient.js';
import { hasDestinationPage } from '../src/data/destinationFullContent.js';
import { getAllBabyEquipmentRentalsDestinations } from '../src/lib/babyEquipmentRentals.js';
import { getAllCategoryGuidesForDestination } from '../src/lib/categoryGuides.js';
import viatorDestinationsClassifiedData from '../src/data/viatorDestinationsClassified.json';

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

  // Add destinations with full content (but not in curated destinations list)
  // These should be in the main sitemap, not in "destinations-without-guides"
  const destinationsWithFullContent = [];
  if (Array.isArray(viatorDestinationsClassifiedData)) {
    const curatedSlugs = new Set(destinations.map(d => d.id.toLowerCase()));
    
    for (const dest of viatorDestinationsClassifiedData) {
      if (!dest || !dest.destinationName) continue;
      const slug = generateSlug(dest.destinationName || dest.name || '');
      
      // Skip if already in curated destinations
      if (curatedSlugs.has(slug)) continue;
      
      // Include if has full content page
      if (hasDestinationPage(slug)) {
        destinationsWithFullContent.push({
          url: `${baseUrl}/destinations/${slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  }

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

  // Baby equipment rental pages (fetch from database)
  const babyEquipmentRentalDestinations = await getAllBabyEquipmentRentalsDestinations();
  const babyEquipmentRentalPages = babyEquipmentRentalDestinations.map((page) => ({
    url: `${baseUrl}/destinations/${page.destination_id}/baby-equipment-rentals`,
    lastModified: page.updated_at || currentDate,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  // Category guide pages (fetch from database - batch fetch all guides at once)
  const categoryGuidePages = [];
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data: allGuides, error: guidesError } = await supabase
      .from('category_guides')
      .select('destination_id, category_slug')
      .order('destination_id', { ascending: true });
    
    if (!guidesError && Array.isArray(allGuides)) {
      allGuides.forEach((guide) => {
        if (guide.destination_id && guide.category_slug) {
          categoryGuidePages.push({
            url: `${baseUrl}/destinations/${guide.destination_id}/guides/${guide.category_slug}`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        }
      });
    }
  } catch (error) {
    // Silently fail - category guides are optional for sitemap
    console.warn('Failed to fetch category guides for sitemap:', error.message);
  }

  // Tour sitemap index reference (for 300k+ tours, we use sitemap indexing)
  // Individual tour pages are in separate sitemap files (sitemap-tours-1.xml, etc.)
  // This is referenced in robots.txt
  
  return [
    ...staticPages,
    ...destinationPages,
    ...destinationsWithFullContent, // Destinations with full content but not in curated list
    ...tourListingPages,
    ...operatorListingPages,
    ...restaurantListingPages,
    ...restaurantDetailPages,
    ...babyEquipmentRentalPages, // Baby equipment rental pages
    ...travelGuidePages,
    ...categoryGuidePages, // Category guide pages (destination-specific guides)
    // Note: Individual tour pages are in sitemap-tours-[index].xml files
    // See app/sitemap-tours-[index]/route.js for dynamic tour sitemap generation
  ];
}

