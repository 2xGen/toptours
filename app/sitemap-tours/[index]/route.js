import { NextResponse } from 'next/server';
import { getToursForSitemapPage, getTourSitemapCount } from '@/lib/tourSitemap';
import { generateTourSlug } from '@/utils/tourHelpers';

/**
 * Individual tour sitemap (paginated)
 * /sitemap-tours/0, /sitemap-tours/1, etc.
 * 
 * Each sitemap contains up to 45,000 URLs
 */

const URLS_PER_SITEMAP = 45000;

export async function GET(request, { params }) {
  try {
    const { index } = await params;
    const pageIndex = parseInt(index, 10);
    
    if (isNaN(pageIndex) || pageIndex < 0) {
      return new NextResponse('Invalid sitemap index', { status: 400 });
    }
    
    const baseUrl = 'https://toptours.ai';
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Verify this page exists
    const totalTours = await getTourSitemapCount();
    const maxPage = Math.ceil(totalTours / URLS_PER_SITEMAP) - 1;
    
    if (pageIndex > maxPage) {
      return new NextResponse('Sitemap page not found', { status: 404 });
    }
    
    // Fetch tours for this page
    const tours = await getToursForSitemapPage(pageIndex, URLS_PER_SITEMAP);
    
    // Generate sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Tour Sitemap ${pageIndex} -->
  <!-- Tours ${(pageIndex * URLS_PER_SITEMAP + 1).toLocaleString()} - ${Math.min((pageIndex + 1) * URLS_PER_SITEMAP, totalTours).toLocaleString()} of ${totalTours.toLocaleString()} -->
`;

    tours.forEach((tour) => {
      const productId = tour.product_id;
      if (!productId) return;
      
      // Generate URL with slug if available
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
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating tour sitemap page:', error);
    
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
