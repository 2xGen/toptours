import { NextResponse } from 'next/server';
import { getAllSitemapEntries } from '../../lib/sitemapData.js';
import {
  entriesToUrlsetXml,
  readGeneratedFile,
  SITEMAP_STATIC_CACHE_HEADERS,
} from '../../lib/sitemapXml.js';

export const maxDuration = 120;
export const revalidate = 3600;

/**
 * Single urlset sitemap at /sitemap.xml (pre-generated at build time; runtime fallback).
 */
export async function GET() {
  const staticSitemap = readGeneratedFile('sitemap.xml');
  if (staticSitemap) {
    return new NextResponse(staticSitemap, { status: 200, headers: SITEMAP_STATIC_CACHE_HEADERS });
  }

  try {
    const entries = (await getAllSitemapEntries()) || [];
    const xml = entriesToUrlsetXml(entries, `TopTours.ai — ${entries.length} URLs`);
    return new NextResponse(xml, { status: 200, headers: SITEMAP_STATIC_CACHE_HEADERS });
  } catch (err) {
    console.error('Error generating sitemap:', err);
    return new NextResponse('Sitemap unavailable', { status: 503 });
  }
}
