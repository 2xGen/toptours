import { getAllDestinations } from '../src/data/destinationsData.js';
import { travelGuides } from '../src/data/travelGuidesData.js';
import { createSupabaseServiceRoleClient } from '../src/lib/supabaseClient.js';
import { hasDestinationPage } from '../src/data/destinationFullContent.js';
import { getAllBabyEquipmentRentalsDestinations } from '../src/lib/babyEquipmentRentals.js';
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
  const viatorDestinationsClassifiedData = (await import('../src/data/viatorDestinationsClassified.json')).default;
  const baseUrl = 'https://toptours.ai';
  // OPTIMIZED: Use actual date for better SEO - search engines prefer real lastModified dates
  const currentDate = new Date().toISOString();
  // lastmod for newly added guide/car-rental/airport-transfer pages (26 Jan 2026)
  const addedPageDate = new Date('2026-01-26').toISOString();

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
      url: `${baseUrl}/tours`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // OPTIMIZED: Destination pages - high priority for SEO (these are key landing pages)
  const destinations = getAllDestinations();
  const destinationPages = destinations.map((destination) => ({
    url: `${baseUrl}/destinations/${destination.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly', // Destinations update weekly with new tours
    priority: 0.9, // Increased from 0.8 - destinations are high-value SEO pages
  }));

  // Add destinations with full content (but not in curated destinations list)
  // These should be in the main sitemap, not in "destinations-without-guides"
  const destinationsWithFullContent = [];
  const fullContentSlugs = [];
  if (Array.isArray(viatorDestinationsClassifiedData)) {
    const curatedSlugs = new Set(destinations.map(d => d.id.toLowerCase()));
    
    for (const dest of viatorDestinationsClassifiedData) {
      if (!dest || !dest.destinationName) continue;
      const slug = generateSlug(dest.destinationName || dest.name || '');
      
      // Skip if already in curated destinations
      if (curatedSlugs.has(slug)) continue;
      
      // Include if has full content page
      if (hasDestinationPage(slug)) {
        fullContentSlugs.push(slug);
        destinationsWithFullContent.push({
          url: `${baseUrl}/destinations/${slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  }

  // All destination IDs we have pages for (curated + full content) — used for guides, car rentals, airport transfers
  const allDestinationIds = [
    ...destinations.map((d) => d.id),
    ...fullContentSlugs,
  ];

  // OPTIMIZED: Destination tour listing pages - high priority for SEO
  const tourListingPages = destinations.map((destination) => ({
    url: `${baseUrl}/destinations/${destination.id}/tours`,
    lastModified: currentDate,
    changeFrequency: 'daily', // Tour listings change daily with new tours
    priority: 0.85, // Increased from 0.78 - tour listing pages are high-value for SEO
  }));

  // Destination operator listing pages
  const operatorListingPages = destinations.map((destination) => ({
    url: `${baseUrl}/destinations/${destination.id}/operators`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.72,
  }));

  // OPTIMIZED: Travel guide pages - high priority for SEO (content marketing)
  const travelGuidePages = travelGuides.map((guide) => ({
    url: `${baseUrl}/travel-guides/${guide.id}`,
    lastModified: guide.publishDate || guide.updatedAt || currentDate, // Use actual dates
    changeFrequency: 'monthly', // Travel guides update monthly
    priority: 0.85, // Increased from 0.8 - travel guides are high-value SEO content
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
  const airportTransferInDb = new Set();
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data: allGuides, error: guidesError } = await supabase
      .from('category_guides')
      .select('destination_id, category_slug')
      .order('destination_id', { ascending: true });
    
    if (!guidesError && Array.isArray(allGuides)) {
      allGuides.forEach((guide) => {
        if (guide.destination_id && guide.category_slug) {
          if (guide.category_slug === 'airport-transfers') {
            airportTransferInDb.add(guide.destination_id.toLowerCase());
          }
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

  // Destination guides listing pages: /destinations/[id]/guides (26 Jan 2026)
  const guidesListingPages = allDestinationIds.map((id) => ({
    url: `${baseUrl}/destinations/${id}/guides`,
    lastModified: addedPageDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Car rental pages: /destinations/[id]/car-rentals (26 Jan 2026)
  const carRentalPages = allDestinationIds.map((id) => ({
    url: `${baseUrl}/destinations/${id}/car-rentals`,
    lastModified: addedPageDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Airport transfer pages: /destinations/[id]/guides/airport-transfers (26 Jan 2026)
  // Include only for destinations not already in category_guides (default/on-the-fly pages)
  const airportTransferPages = allDestinationIds
    .filter((id) => !airportTransferInDb.has(String(id).toLowerCase()))
    .map((id) => ({
      url: `${baseUrl}/destinations/${id}/guides/airport-transfers`,
      lastModified: addedPageDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // Tour sitemap index reference (for 300k+ tours, we use sitemap indexing)
  // Individual tour pages are in separate sitemap files (sitemap-tours-1.xml, etc.)
  // This is referenced in robots.txt
  
  return [
    ...staticPages,
    ...destinationPages,
    ...destinationsWithFullContent, // Destinations with full content but not in curated list
    ...tourListingPages,
    ...operatorListingPages,
    ...babyEquipmentRentalPages, // Baby equipment rental pages
    ...travelGuidePages,
    ...guidesListingPages, // /destinations/[id]/guides (26 Jan 2026)
    ...carRentalPages, // /destinations/[id]/car-rentals (26 Jan 2026)
    ...categoryGuidePages, // Category guide pages (destination-specific guides)
    ...airportTransferPages, // /destinations/[id]/guides/airport-transfers not in DB (26 Jan 2026)
    // Note: Individual tour pages are in sitemap-tours-[index].xml files
    // See app/sitemap-tours-[index]/route.js for dynamic tour sitemap generation
  ];
}

