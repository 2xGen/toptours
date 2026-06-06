import { NextResponse } from 'next/server';
import { getToursForSitemapPage, getTourSitemapCount } from '@/lib/tourSitemap';
import { generateTourSlug } from '@/utils/tourHelpers';
import { getSiteOrigin } from '@/lib/siteUrl';
import { entriesToUrlsetXml, readGeneratedFile, SITEMAP_STATIC_CACHE_HEADERS } from '../../lib/sitemapXml.js';

const URLS_PER_SITEMAP = 10000;

export async function GET(request, { params }) {
  try {
    const { index } = await params;
    const pageIndex = parseInt(index, 10);

    if (isNaN(pageIndex) || pageIndex < 0) {
      return new NextResponse('Invalid sitemap index', { status: 400 });
    }

    const staticXml = readGeneratedFile(`tours-${pageIndex}.xml`);
    if (staticXml) {
      return new NextResponse(staticXml, { status: 200, headers: SITEMAP_STATIC_CACHE_HEADERS });
    }

    const baseUrl = getSiteOrigin();
    const currentDate = new Date().toISOString().split('T')[0];

    const totalTours = await getTourSitemapCount();
    const maxPage = Math.ceil(totalTours / URLS_PER_SITEMAP) - 1;

    if (pageIndex > maxPage) {
      return new NextResponse('Sitemap page not found', { status: 404 });
    }

    const tours = await getToursForSitemapPage(pageIndex, URLS_PER_SITEMAP);
    const entries = tours
      .filter((tour) => tour.product_id)
      .map((tour) => {
        const productId = tour.product_id;
        const slug = tour.tour_slug || (tour.tour_title ? generateTourSlug(tour.tour_title) : null);
        const url = slug ? `${baseUrl}/tours/${productId}/${slug}` : `${baseUrl}/tours/${productId}`;
        return {
          url,
          lastModified: tour.last_visited_at
            ? new Date(tour.last_visited_at).toISOString().split('T')[0]
            : currentDate,
          changeFrequency: 'weekly',
          priority: 0.45,
        };
      });

    const start = pageIndex * URLS_PER_SITEMAP + 1;
    const end = Math.min((pageIndex + 1) * URLS_PER_SITEMAP, totalTours);
    const comment = `Tour sitemap ${pageIndex} — tours ${start.toLocaleString('en-US')}-${end.toLocaleString('en-US')} of ${totalTours.toLocaleString('en-US')}`;
    const sitemap = entriesToUrlsetXml(entries, comment);

    return new NextResponse(sitemap, {
      status: 200,
      headers: SITEMAP_STATIC_CACHE_HEADERS,
    });
  } catch (error) {
    console.error('Error generating tour sitemap page:', error);
    const emptySitemap = entriesToUrlsetXml([], 'Empty tour sitemap (generation error)');
    return new NextResponse(emptySitemap, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
