import { NextResponse } from 'next/server';
import { getTourSitemapCount } from '@/lib/tourSitemap';

/**
 * Sitemap INDEX for tours
 * Lists all tour sitemap files (sitemap-tours-0, sitemap-tours-1, etc.)
 * 
 * With 140k+ tours and 45k per sitemap = 4 sitemap files
 */

const URLS_PER_SITEMAP = 45000; // Keep under Google's 50k limit

export async function GET() {
  try {
    const baseUrl = 'https://toptours.ai';
    const totalTours = await getTourSitemapCount();
    const numSitemaps = Math.ceil(totalTours / URLS_PER_SITEMAP);
    
    // Generate sitemap index XML
    let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Tour Sitemap Index -->
  <!-- Total Tours: ${totalTours.toLocaleString()} -->
  <!-- Sitemaps: ${numSitemaps} (${URLS_PER_SITEMAP.toLocaleString()} URLs each) -->
`;

    for (let i = 0; i < numSitemaps; i++) {
      sitemapIndex += `
  <sitemap>
    <loc>${baseUrl}/sitemap-tours/${i}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`;
    }

    sitemapIndex += `
</sitemapindex>`;

    return new NextResponse(sitemapIndex, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating tours sitemap index:', error);
    
    // Return empty index on error
    const emptyIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</sitemapindex>`;
    
    return new NextResponse(emptyIndex, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
