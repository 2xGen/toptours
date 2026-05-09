import { NextResponse } from 'next/server';
import { getAllSitemapEntries, SITEMAP_CHUNK_SIZE } from '../../lib/sitemapData.js';
import { getSiteOrigin } from '@/lib/siteUrl';

export const maxDuration = 120;

/** Match app/sitemap.js so the index is CDN-friendly alongside child sitemaps. */
export const revalidate = 3600;

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Root sitemap index for URLs built in app/sitemap.js.
 * next.js issue: generateSitemaps() does not register /sitemap.xml (404); child /sitemap/N.xml still works.
 * https://github.com/vercel/next.js/issues/77304
 */
export async function GET() {
  try {
    const origin = getSiteOrigin().replace(/\/$/, '');
    const entries = await getAllSitemapEntries();
    const numChunks = Math.max(1, Math.ceil(entries.length / SITEMAP_CHUNK_SIZE));
    const lastmod = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    for (let i = 0; i < numChunks; i++) {
      const loc = `${origin}/sitemap/${i}.xml`;
      xml += `  <sitemap>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
  </sitemap>
`;
    }

    xml += `</sitemapindex>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.error('Error generating sitemap index:', err);
    return new NextResponse('Sitemap unavailable', { status: 503 });
  }
}
