import { NextResponse } from 'next/server';
import { getTourSitemapCount } from '@/lib/tourSitemap';
import { getSiteOrigin } from '@/lib/siteUrl';
import {
  buildSitemapIndexXml,
  readGeneratedManifest,
  SITEMAP_STATIC_CACHE_HEADERS,
} from '../../lib/sitemapXml.js';

const URLS_PER_SITEMAP = 10000;

export async function GET() {
  if (process.env.ENABLE_TOUR_SITEMAP !== 'true') {
    const emptyIndex = buildSitemapIndexXml([], new Date().toISOString());
    return new NextResponse(emptyIndex, { status: 200, headers: SITEMAP_STATIC_CACHE_HEADERS });
  }

  const manifest = readGeneratedManifest();
  if (manifest?.tourChunks > 0) {
    const origin = getSiteOrigin().replace(/\/$/, '');
    const lastmod = manifest.generatedAt || new Date().toISOString();
    const tourLocs = Array.from({ length: manifest.tourChunks }, (_, i) => `${origin}/sitemap-tours/${i}`);
    const xml = buildSitemapIndexXml(tourLocs, lastmod);
    return new NextResponse(xml, { status: 200, headers: SITEMAP_STATIC_CACHE_HEADERS });
  }

  try {
    const baseUrl = getSiteOrigin();
    const totalTours = await getTourSitemapCount();
    const numSitemaps = totalTours > 0 ? Math.ceil(totalTours / URLS_PER_SITEMAP) : 0;
    const lastmod = new Date().toISOString();

    if (numSitemaps === 0) {
      const emptyIndex = buildSitemapIndexXml([], lastmod);
      return new NextResponse(emptyIndex, {
        status: 200,
        headers: SITEMAP_STATIC_CACHE_HEADERS,
      });
    }

    const tourLocs = Array.from({ length: numSitemaps }, (_, i) => `${baseUrl}/sitemap-tours/${i}`);
    const sitemapIndex = buildSitemapIndexXml(tourLocs, lastmod);

    return new NextResponse(sitemapIndex, {
      status: 200,
      headers: SITEMAP_STATIC_CACHE_HEADERS,
    });
  } catch (error) {
    console.error('Error generating tours sitemap index:', error);
    const emptyIndex = buildSitemapIndexXml([], new Date().toISOString());
    return new NextResponse(emptyIndex, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
