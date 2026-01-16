import { NextResponse } from 'next/server';
import { getToursForSitemap } from '@/lib/tourSitemap';
import { generateTourSlug } from '@/utils/tourHelpers';

/**
 * Generate sitemap for visited tours
 * Lightweight solution: Only includes tours that have been visited/rendered
 * Similar to tour_operators_crm approach but for sitemap generation
 */
export async function GET() {
  try {
    const baseUrl = 'https://toptours.ai';
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Fetch tours from tour_sitemap table (max 50k for sitemap limit)
    const tours = await getToursForSitemap(50000);
    
    // Generate sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Visited Tours Sitemap (${tours.length} tours) -->
  <!-- Generated from tour_sitemap table - only includes tours that have been visited/rendered -->
`;

    tours.forEach((tour) => {
      const productId = tour.product_id;
      if (!productId) return;
      
      // Generate URL with slug if available, otherwise just productId
      const slug = tour.tour_slug || (tour.tour_title ? generateTourSlug(tour.tour_title) : null);
      const url = slug 
        ? `${baseUrl}/tours/${productId}/${slug}`
        : `${baseUrl}/tours/${productId}`;
      
      sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${tour.last_visited_at ? new Date(tour.last_visited_at).toISOString().split('T')[0] : currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour, stale for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating tours sitemap:', error);
    
    // Return empty sitemap on error (better than failing)
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    
    return new NextResponse(emptySitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
