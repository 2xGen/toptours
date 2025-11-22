import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load destinations data
const viatorDestinationsPath = path.join(__dirname, '../src/data/viatorDestinationsClassified.json');
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');

// Read classified destinations
const viatorDestinations = JSON.parse(fs.readFileSync(viatorDestinationsPath, 'utf8'));

// Read destinations with guides to exclude them
const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
const destinationsWithGuides = eval(`[${destinationsMatch[1]}]`);

// Get destination names with guides (to exclude them)
const guideDestinationNames = new Set();
const guideDestinationIds = new Set();

destinationsWithGuides.forEach(dest => {
  guideDestinationIds.add(dest.id);
  guideDestinationNames.add((dest.name || '').toLowerCase().trim());
  guideDestinationNames.add((dest.fullName || dest.name || '').toLowerCase().trim());
});

// Function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Filter destinations without guides
const destinationsWithoutGuides = viatorDestinations.filter(dest => {
  const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
  const baseName = destName.split(',')[0].trim(); // Remove country suffix
  
  // Check if this destination matches any guide destination
  if (guideDestinationNames.has(destName)) return false;
  if (guideDestinationNames.has(baseName)) return false;
  
  // Also check if slug matches any guide destination ID
  const slug = generateSlug(destName);
  if (guideDestinationIds.has(slug)) return false;
  
  return true;
});

// Generate sitemap
const generateSitemap = () => {
  const baseUrl = 'https://toptours.ai';
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Destinations Without Guides (${destinationsWithoutGuides.length} destinations) -->`;

  // Add all destinations without guides
  destinationsWithoutGuides.forEach(destination => {
    const destName = destination.destinationName || destination.name || '';
    const slug = generateSlug(destName);
    
    // URL structure: /destinations/{slug}/tours (since they don't have detail pages)
    sitemap += `
  <url>
    <loc>${baseUrl}/destinations/${slug}/tours</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  // Write sitemap to public folder (so it's accessible at /sitemap-destinations-without-guides.xml)
  const publicPath = path.join(__dirname, '../public');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }
  
  const sitemapPath = path.join(publicPath, 'sitemap-destinations-without-guides.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  
  console.log(`\n✅ Sitemap generated successfully!`);
  console.log(`📁 Location: public/sitemap-destinations-without-guides.xml`);
  console.log(`🌐 URL: ${baseUrl}/sitemap-destinations-without-guides.xml`);
  console.log(`📊 Total URLs: ${destinationsWithoutGuides.length} destinations`);
  console.log(`📅 Last Modified: ${today}`);
  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Submit this sitemap to Google Search Console:`);
  console.log(`      ${baseUrl}/sitemap-destinations-without-guides.xml`);
  console.log(`   2. The sitemap will be accessible at the URL above after deployment\n`);
};

// Run the generation
console.log(`\n🚀 GENERATING SITEMAP FOR DESTINATIONS WITHOUT GUIDES\n`);
console.log(`📊 Analysis:`);
console.log(`   Total destinations: ${viatorDestinations.length}`);
console.log(`   Destinations with guides: ${destinationsWithGuides.length}`);
console.log(`   Destinations without guides: ${destinationsWithoutGuides.length}\n`);

generateSitemap();

