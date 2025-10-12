import { destinations } from '../../src/data/destinationsData';
import { categoryGuides as categoryGuidesBase } from '../destinations/[id]/guides/guidesData';
import { categoryGuidesNorthAmerica } from '../destinations/[id]/guides/guidesData-north-america';

// Merge all regional guide files
const categoryGuides = {
  ...categoryGuidesBase,
  ...categoryGuidesNorthAmerica,
};

export async function GET() {
  const baseUrl = 'https://toptours.ai';
  const currentDate = new Date().toISOString();
  
  const guideUrls = [];
  
  // Filter Europe destinations
  const europeDestinations = destinations.filter(d => d.category === 'Europe');
  
  // Generate guide URLs for each Europe destination
  europeDestinations.forEach(destination => {
    const guides = categoryGuides[destination.id];
    if (guides) {
      Object.keys(guides).forEach(categorySlug => {
        guideUrls.push({
          url: `${baseUrl}/destinations/${destination.id}/guides/${categorySlug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }
  });
  
  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${guideUrls.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

