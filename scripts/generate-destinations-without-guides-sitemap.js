import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import data
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const viatorDestinationsClassifiedData = require('../src/data/viatorDestinationsClassified.json');
const { destinations } = require('../src/data/destinationsData.js');
const fullContentDataRaw = require('../generated-destination-full-content.json');
const seoContentDataRaw = require('../generated-destination-seo-content.json');

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

// Check if destination has a page
function hasDestinationPage(slug) {
  const fullContentData = fullContentDataRaw || {};
  const seoContentData = seoContentDataRaw || {};
  
  // Check if full content exists
  const content = fullContentData[slug];
  if (content && content.whyVisit && content.highlights) {
    return true;
  }
  
  // Check if SEO content exists
  return !!seoContentData[slug];
}

// Get all destination IDs that have guides
const destinationsWithGuides = new Set(
  destinations.map(d => d.id.toLowerCase())
);

// Filter destinations without guides
// Include ALL destination types (CITY, REGION, COUNTRY, etc.) to match the 3,200 total
const destinationsWithoutGuides = viatorDestinationsClassifiedData.filter(dest => {
  const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
  const slug = generateSlug(destName);
  
  // Include all destination types (not just CITY)
  // Exclude destinations that have guides
  return !destinationsWithGuides.has(slug) &&
         destName.length > 0;
});

console.log(`📊 Total destinations without guides: ${destinationsWithoutGuides.length}`);

// Generate sitemap entries
const sitemapEntries = [];
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

destinationsWithoutGuides.forEach(dest => {
  const destName = dest.destinationName || dest.name;
  const slug = generateSlug(destName);
  
  // Always include tours page
  sitemapEntries.push({
    loc: `https://toptours.ai/destinations/${slug}/tours`,
    lastmod: today,
    changefreq: 'weekly',
    priority: '0.7'
  });
  
  // Include destination page if it exists
  if (hasDestinationPage(slug)) {
    sitemapEntries.push({
      loc: `https://toptours.ai/destinations/${slug}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.8'
    });
  }
});

console.log(`✅ Generated ${sitemapEntries.length} sitemap entries`);
console.log(`   - ${sitemapEntries.filter(e => e.loc.includes('/tours')).length} tours pages`);
console.log(`   - ${sitemapEntries.filter(e => !e.loc.includes('/tours')).length} destination pages`);

// Generate XML
const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Destinations Without Guides (${destinationsWithoutGuides.length} destinations, ${sitemapEntries.length} pages) -->
  <!-- Generated: ${new Date().toISOString()} -->
`;

const xmlEntries = sitemapEntries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n');

const xmlFooter = `</urlset>`;

const sitemapXml = xmlHeader + xmlEntries + '\n' + xmlFooter;

// Write to file
const outputPath = path.join(__dirname, '../public/sitemap-destinations-without-guides.xml');
fs.writeFileSync(outputPath, sitemapXml, 'utf8');

console.log(`\n✅ Sitemap generated successfully!`);
console.log(`📁 Output: ${outputPath}`);
console.log(`📊 Total URLs: ${sitemapEntries.length}`);
console.log(`\n📋 Next Steps:`);
console.log(`   1. Submit to Google Search Console: https://toptours.ai/sitemap-destinations-without-guides.xml`);
console.log(`   2. Add to robots.txt if needed`);

