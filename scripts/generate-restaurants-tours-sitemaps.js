import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllDestinations } from '../src/data/destinationsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://toptours.ai';
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

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

/**
 * Generate operators sitemap (operator listing pages per destination)
 */
async function generateOperatorsSitemap() {
  const destinations = getAllDestinations();

  const operatorListingPages = destinations.map((destination) => ({
    url: `${baseUrl}/destinations/${destination.id}/operators`,
    lastModified: today,
  }));

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Operator Listing Pages -->
`;

  operatorListingPages.forEach((page) => {
    sitemap += `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.72</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  const outputPath = path.join(__dirname, '../public/sitemap-operators.xml');
  fs.writeFileSync(outputPath, sitemap);

  console.log(`✅ Operators sitemap generated: ${operatorListingPages.length} URLs`);
  console.log(`   📄 Saved to: public/sitemap-operators.xml\n`);
}

// Main execution
async function main() {
  console.log('🚀 Generating tours and operators sitemaps...\n');
  await generateToursSitemap();
  await generateOperatorsSitemap();
  console.log('✨ All sitemaps generated successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Review the generated files in public/');
  console.log('2. Commit and push to deploy');
  console.log('3. Submit to Google Search Console:');
  console.log('   - https://toptours.ai/sitemap-tours.xml');
  console.log('   - https://toptours.ai/sitemap-operators.xml');
}

main().catch(console.error);

