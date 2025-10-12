const fs = require('fs');
const path = require('path');

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
const guidesFiles = ['guidesData.js', 'guidesData-north-america.js'];

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
      // Find destination ID
      const destMatch = line.match(/^\s*['"]?([a-z-]+)['"]?:\s*{/);
      if (destMatch && destinations.find(d => d.id === destMatch[1])) {
        currentDest = destMatch[1];
        if (!allGuides[currentDest]) {
          allGuides[currentDest] = [];
        }
      }
      // Find guide slugs within that destination
      const guideMatch = line.match(/^\s*['"]([a-z-]+)['"]:\s*{\s*$/);
      if (guideMatch && currentDest && guideMatch[1] !== currentDest) {
        if (!allGuides[currentDest].includes(guideMatch[1])) {
          allGuides[currentDest].push(guideMatch[1]);
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

console.log('\n✨ All regional guide sitemaps generated successfully!');

