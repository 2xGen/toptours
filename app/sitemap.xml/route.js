import { NextResponse } from 'next/server';
import { getAllSitemapEntries, SITEMAP_CHUNK_SIZE } from '../../lib/sitemapData.js';
import { getSiteOrigin } from '@/lib/siteUrl';
import { getTourSitemapCount } from '@/lib/tourSitemap';
import {
  buildSitemapIndexXml,
  readGeneratedFile,
  readGeneratedManifest,
  SITEMAP_STATIC_CACHE_HEADERS,
} from '../../lib/sitemapXml.js';

export const maxDuration = 120;
export const revalidate = 3600;

const TOURS_PER_SITEMAP = 10000;

/**
 * Root sitemap index — serves pre-generated XML at build time; falls back to runtime generation.
 */
export async function GET() {
  const staticIndex = readGeneratedFile('sitemap-index.xml');
  if (staticIndex) {
    return new NextResponse(staticIndex, { status: 200, headers: SITEMAP_STATIC_CACHE_HEADERS });
  }

  try {
    const origin = getSiteOrigin().replace(/\/$/, '');
    const entries = (await getAllSitemapEntries()) || [];
    const mainChunks = Math.max(1, Math.ceil(entries.length / SITEMAP_CHUNK_SIZE));
    const lastmod = new Date().toISOString();
    const indexLocs = [];

    for (let i = 0; i < mainChunks; i++) {
      indexLocs.push(`${origin}/sitemap/${i}.xml`);
    }

    let tourChunks = 0;
    try {
      const totalTours = await getTourSitemapCount();
      tourChunks = totalTours > 0 ? Math.ceil(totalTours / TOURS_PER_SITEMAP) : 0;
      for (let i = 0; i < tourChunks; i++) {
        indexLocs.push(`${origin}/sitemap-tours/${i}`);
      }
    } catch (err) {
      console.warn('Tour sitemap count unavailable for index fallback:', err?.message);
    }

    const xml = buildSitemapIndexXml(indexLocs, lastmod);
    return new NextResponse(xml, { status: 200, headers: SITEMAP_STATIC_CACHE_HEADERS });
  } catch (err) {
    console.error('Error generating sitemap index:', err);
    return new NextResponse('Sitemap unavailable', { status: 503 });
  }
}
