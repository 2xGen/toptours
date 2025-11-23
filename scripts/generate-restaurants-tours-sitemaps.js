import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { getAllDestinations } from '../src/data/destinationsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const baseUrl = 'https://toptours.ai';
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

/**
 * Get restaurant counts per destination
 */
async function getRestaurantCountsByDestination() {
  const counts = {};
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('destination_id')
      .eq('is_active', true)
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching restaurant counts:', error);
      break;
    }

    if (data && data.length > 0) {
      data.forEach((restaurant) => {
        counts[restaurant.destination_id] = (counts[restaurant.destination_id] || 0) + 1;
      });
    }

    hasMore = data && data.length === pageSize;
    from += pageSize;
  }

  return counts;
}

/**
 * Generate restaurants sitemap
 */
async function generateRestaurantsSitemap() {
  const allRestaurants = [];
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;

  console.log('📊 Fetching restaurants from database...');

  while (hasMore) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('destination_id, slug, updated_at')
      .eq('is_active', true)
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching restaurants:', error);
      break;
    }

    if (data && data.length > 0) {
      allRestaurants.push(...data);
    }

    hasMore = data && data.length === pageSize;
    from += pageSize;
  }

  console.log(`✅ Found ${allRestaurants.length} restaurants`);

  // Also get restaurant listing pages
  const restaurantCounts = await getRestaurantCountsByDestination();
  const destinations = getAllDestinations();
  const restaurantListingPages = destinations
    .filter((destination) => (restaurantCounts[destination.id] || 0) > 0)
    .map((destination) => ({
      url: `${baseUrl}/destinations/${destination.id}/restaurants`,
      lastModified: today,
    }));

  // Add restaurants hub page
  const restaurantsHub = {
    url: `${baseUrl}/restaurants`,
    lastModified: today,
  };

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Restaurants Hub Page -->
  <url>
    <loc>${restaurantsHub.url}</loc>
    <lastmod>${restaurantsHub.lastModified}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Restaurant Listing Pages -->
`;

  restaurantListingPages.forEach((page) => {
    sitemap += `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>
`;
  });

  sitemap += `  
  <!-- Restaurant Detail Pages -->
`;

  allRestaurants.forEach((restaurant) => {
    const lastMod = restaurant.updated_at 
      ? new Date(restaurant.updated_at).toISOString().split('T')[0]
      : today;
    
    sitemap += `  <url>
    <loc>${baseUrl}/destinations/${restaurant.destination_id}/restaurants/${restaurant.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  const outputPath = path.join(__dirname, '../public/sitemap-restaurants.xml');
  fs.writeFileSync(outputPath, sitemap);
  
  const totalUrls = 1 + restaurantListingPages.length + allRestaurants.length;
  console.log(`✅ Restaurants sitemap generated: ${totalUrls} URLs`);
  console.log(`   - Hub page: 1`);
  console.log(`   - Listing pages: ${restaurantListingPages.length}`);
  console.log(`   - Detail pages: ${allRestaurants.length}`);
  console.log(`   📄 Saved to: public/sitemap-restaurants.xml\n`);
}

/**
 * Generate tours sitemap (tour hubs and listing pages)
 */
async function generateToursSitemap() {
  const destinations = getAllDestinations();

  // Tours hub page
  const toursHub = {
    url: `${baseUrl}/tours`,
    lastModified: today,
  };

  // Tour listing pages per destination
  const tourListingPages = destinations.map((destination) => ({
    url: `${baseUrl}/destinations/${destination.id}/tours`,
    lastModified: today,
  }));

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Tours Hub Page -->
  <url>
    <loc>${toursHub.url}</loc>
    <lastmod>${toursHub.lastModified}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Tour Listing Pages -->
`;

  tourListingPages.forEach((page) => {
    sitemap += `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.78</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  const outputPath = path.join(__dirname, '../public/sitemap-tours.xml');
  fs.writeFileSync(outputPath, sitemap);
  
  const totalUrls = 1 + tourListingPages.length;
  console.log(`✅ Tours sitemap generated: ${totalUrls} URLs`);
  console.log(`   - Hub page: 1`);
  console.log(`   - Listing pages: ${tourListingPages.length}`);
  console.log(`   📄 Saved to: public/sitemap-tours.xml\n`);
}

// Main execution
async function main() {
  console.log('🚀 Generating restaurants and tours sitemaps...\n');
  
  await generateRestaurantsSitemap();
  await generateToursSitemap();
  
  console.log('✨ All sitemaps generated successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Review the generated files in public/');
  console.log('2. Commit and push to deploy');
  console.log('3. Submit to Google Search Console:');
  console.log('   - https://toptours.ai/sitemap-restaurants.xml');
  console.log('   - https://toptours.ai/sitemap-tours.xml');
}

main().catch(console.error);

