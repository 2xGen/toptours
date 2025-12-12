/**
 * @deprecated This script is deprecated. All guides are now in the database.
 * Use scripts/generate-guides-sitemap.js instead, which generates a single
 * sitemap from the database for all guides.
 * 
 * This script is kept for reference but should not be used.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read destinations data
const destinationsPath = path.join(__dirname, '../src/data/destinationsData.js');
const destinationsContent = fs.readFileSync(destinationsPath, 'utf8');

// Extract destinations array using regex (since it's ESM)
const match = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
if (!match) {
  console.error('Could not find destinations array');
  process.exit(1);
}

// Parse destinations to get id and category
const destinationMatches = destinationsContent.matchAll(/{\s*id:\s*['"]([^'"]+)['"]\s*,\s*name:\s*['"]([^'"]+)['"]\s*,[\s\S]*?category:\s*['"]([^'"]+)['"]/g);
const destinations = Array.from(destinationMatches).map(m => ({
  id: m[1],
  name: m[2],
  category: m[3]
}));

// Read guide data files to get all category slugs per destination
const guidesPath = path.join(__dirname, '../app/destinations/[id]/guides');
const guidesFiles = ['guidesData.js', 'guidesData-north-america.js', 'guidesData-africa.js', 'guidesData-south-america.js', 'guidesData-asia-pacific-part1.js', 'guidesData-asia-pacific-part2.js', 'guidesData-middle-east.js'];

// Extract all guides
const allGuides = {};
guidesFiles.forEach(file => {
  const filePath = path.join(guidesPath, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Find destination IDs and their guide slugs
    const destMatches = content.matchAll(/(['"]?)([a-z-]+)\1:\s*{[\s\S]*?['"]([a-z-]+)['"]:\s*{/g);
    for (const match of destMatches) {
      const destId = match[2];
      if (!allGuides[destId]) {
        allGuides[destId] = [];
      }
    }
    
    // Better pattern to find guide slugs
    const guideMatches = content.matchAll(/['"]([a-z-]+)['"]:\s*{\s*title:/g);
    let currentDest = null;
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      // Find destination ID - this should come first to set currentDest before checking for guides
      const destMatch = line.match(/^\s*['"]?([a-z-]+)['"]?:\s*{/);
      if (destMatch) {
        const destId = destMatch[1];
        if (destinations.find(d => d.id === destId)) {
          // Found a destination, set it as current (this will overwrite previous destination)
          currentDest = destId;
          if (!allGuides[currentDest]) {
            allGuides[currentDest] = [];
          }
        }
      }
      
      // Find guide slugs within that destination - check after destination detection
      // Only add if we have a currentDest and the guide slug doesn't match the dest ID
      const guideMatch = line.match(/^\s*['"]([a-z-]+)['"]:\s*{\s*$/);
      if (guideMatch && currentDest && guideMatch[1] !== currentDest) {
        // Make sure the guide slug isn't actually a destination ID
        const guideSlug = guideMatch[1];
        const isDestination = destinations.find(d => d.id === guideSlug);
        if (!isDestination && !allGuides[currentDest].includes(guideSlug)) {
          allGuides[currentDest].push(guideSlug);
        }
      }
    });
  }
});

const baseUrl = 'https://toptours.ai';
const currentDate = new Date().toISOString();

function generateSitemapXML(destinations) {
  const guideUrls = [];
  
  destinations.forEach(destination => {
    const guides = allGuides[destination.id] || [];
    guides.forEach(guideSlug => {
      guideUrls.push(`  <url>
    <loc>${baseUrl}/destinations/${destination.id}/guides/${guideSlug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });
  });
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${guideUrls.join('\n')}
</urlset>`;

  return xml;
}

// Generate Caribbean sitemap
const caribbeanDestinations = destinations.filter(d => d.category === 'Caribbean');
const caribbeanXML = generateSitemapXML(caribbeanDestinations);
fs.writeFileSync(
  path.join(__dirname, '../public/sitemap-guides-caribbean.xml'),
  caribbeanXML
);
console.log(`✅ Generated sitemap-guides-caribbean.xml (${caribbeanDestinations.length} destinations)`);

// Generate Europe sitemap
const europeDestinations = destinations.filter(d => d.category === 'Europe');
const europeXML = generateSitemapXML(europeDestinations);
fs.writeFileSync(
  path.join(__dirname, '../public/sitemap-guides-europe.xml'),
  europeXML
);
console.log(`✅ Generated sitemap-guides-europe.xml (${europeDestinations.length} destinations)`);

// Generate North America sitemap
const northAmericaDestinations = destinations.filter(d => d.category === 'North America');
const northAmericaXML = generateSitemapXML(northAmericaDestinations);
fs.writeFileSync(
  path.join(__dirname, '../public/sitemap-guides-north-america.xml'),
  northAmericaXML
);
console.log(`✅ Generated sitemap-guides-north-america.xml (${northAmericaDestinations.length} destinations)`);

// Generate Africa sitemap
const africaDestinations = destinations.filter(d => d.category === 'Africa');
const africaXML = generateSitemapXML(africaDestinations);
fs.writeFileSync(
  path.join(__dirname, '../public/sitemap-guides-africa.xml'),
  africaXML
);
console.log(`✅ Generated sitemap-guides-africa.xml (${africaDestinations.length} destinations)`);

// Generate South America sitemap
const southAmericaDestinations = destinations.filter(d => d.category === 'South America');
const southAmericaXML = generateSitemapXML(southAmericaDestinations);
fs.writeFileSync(
  path.join(__dirname, '../public/sitemap-guides-south-america.xml'),
  southAmericaXML
);
console.log(`✅ Generated sitemap-guides-south-america.xml (${southAmericaDestinations.length} destinations)`);

// Generate Asia-Pacific sitemap
const asiaPacificDestinations = destinations.filter(d => d.category === 'Asia-Pacific');
const asiaPacificXML = generateSitemapXML(asiaPacificDestinations);
fs.writeFileSync(
  path.join(__dirname, '../public/sitemap-guides-asia-pacific.xml'),
  asiaPacificXML
);
console.log(`✅ Generated sitemap-guides-asia-pacific.xml (${asiaPacificDestinations.length} destinations)`);

// Generate Middle East sitemap
const middleEastDestinations = destinations.filter(d => d.category === 'Middle East');
const middleEastXML = generateSitemapXML(middleEastDestinations);
fs.writeFileSync(
  path.join(__dirname, '../public/sitemap-guides-middle-east.xml'),
  middleEastXML
);
console.log(`✅ Generated sitemap-guides-middle-east.xml (${middleEastDestinations.length} destinations)`);

console.log('\n✨ All regional guide sitemaps generated successfully!');
