/**
 * Shared sitemap XML helpers + static pre-generated file paths (build-time via scripts/generate-production-sitemaps.js).
 */
import fs from 'fs';
import path from 'path';

export const GENERATED_SITEMAP_DIR = path.join(process.cwd(), 'public', 'generated-sitemaps');

export function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function entriesToUrlsetXml(entries, comment = '') {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  if (comment) {
    xml += `  <!-- ${escapeXml(comment)} -->\n`;
  }
  for (const entry of entries) {
    const url = entry.url || entry.loc;
    if (!url) continue;
    const lastmod = entry.lastModified || entry.lastmod || new Date().toISOString();
    const changefreq = entry.changeFrequency || entry.changefreq || 'weekly';
    const priority = entry.priority ?? 0.5;
    xml += `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${escapeXml(typeof lastmod === 'string' ? lastmod : new Date(lastmod).toISOString())}</lastmod>
    <changefreq>${escapeXml(changefreq)}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  }
  xml += `</urlset>`;
  return xml;
}

export function buildSitemapIndexXml(sitemapLocs, lastmod = new Date().toISOString()) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  for (const loc of sitemapLocs) {
    xml += `  <sitemap>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
  </sitemap>
`;
  }
  xml += `</sitemapindex>`;
  return xml;
}

export function readGeneratedFile(relativeName) {
  const filePath = path.join(GENERATED_SITEMAP_DIR, relativeName);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

export function readGeneratedManifest() {
  const raw = readGeneratedFile('manifest.json');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function readCachedMainEntries() {
  const raw = readGeneratedFile('main-entries.json');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export const SITEMAP_STATIC_CACHE_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
};
