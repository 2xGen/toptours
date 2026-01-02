import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllDestinations } from '../src/data/destinationsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateSitemap = () => {
  const destinations = getAllDestinations();
  const baseUrl = 'https://toptours.ai';
  const today = '2025-12-31'; // December 31, 2025
  
  // Travel guide slugs from the travel-guides directory
  const travelGuides = [
    'ai-travel-itinerary-planning',
    'ai-travel-planning-guide',
    'amsterdam-3-day-itinerary',
    '3-day-aruba-itinerary',
    '3-day-curacao-itinerary',
    'beach-vacation-packing-list',
    'aruba-packing-list',
    'aruba-vs-punta-cana',
    'aruba-vs-jamaica',
    'best-time-to-visit-aruba',
    'best-caribbean-islands',
    'best-things-to-do-in-new-york',
    'best-time-for-african-safari',
    'best-time-to-visit-brazil',
    'best-time-to-visit-curacao',
    'best-time-to-visit-caribbean',
    'best-time-to-visit-southeast-asia',
    'best-tours-peru-machu-picchu',
    'best-tours-south-africa',
    'egypt-cultural-tours',
    'family-tours-caribbean',
    'how-to-choose-a-tour',
    'japan-cherry-blossom-travel',
    'los-angeles-tours',
    'miami-water-tours',
    'multi-destination-trip-planning',
    'new-zealand-adventure-tours',
    'paris-travel-guide',
    'patagonia-travel-guide',
    'private-vs-group-tours',
    'rome-weekend-guide',
    'save-money-on-tours-activities',
    'travel-mistakes-to-avoid',
    'when-to-book-tours'
  ];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/destinations</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/travel-guides</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Destination Pages -->`;

  // Add all destination pages
  destinations.forEach(destination => {
    sitemap += `
  <url>
    <loc>${baseUrl}/destinations/${destination.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // Add all travel guide pages
  sitemap += `
  
  <!-- Travel Guide Pages -->`;
  
  travelGuides.forEach(guide => {
    sitemap += `
  <url>
    <loc>${baseUrl}/travel-guides/${guide}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  // Write sitemap to dist folder
  const distPath = path.join(__dirname, '../dist');
  const sitemapPath = path.join(distPath, 'sitemap.xml');
  
  fs.writeFileSync(sitemapPath, sitemap);
  
  const totalUrls = destinations.length + travelGuides.length + 3; // 3 main pages
  
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📁 Location: /dist/sitemap.xml`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log(`📊 Total URLs: ${totalUrls} (${destinations.length} destinations + ${travelGuides.length} travel guides + 3 main pages)`);
  console.log(`📅 Last Modified: ${today}`);
};

// Run the generation
generateSitemap(); 