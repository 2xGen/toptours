import { getAllSitemapEntries, SITEMAP_CHUNK_SIZE } from '../lib/sitemapData.js';

/** Vercel / GSC: large DB-backed sitemap can exceed default 10s without this on Pro+. */
export const maxDuration = 120;

/**
 * Split main sitemap when >50k URLs (Google limit) to avoid "Temporary processing error" in GSC.
 * When we have multiple chunks, /sitemap.xml becomes a sitemap index listing /sitemap/0.xml, /sitemap/1.xml, ...
 */
export async function generateSitemaps() {
  const entries = await getAllSitemapEntries();
  const total = entries.length;
  const numChunks = Math.max(1, Math.ceil(total / SITEMAP_CHUNK_SIZE));
  return Array.from({ length: numChunks }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }) {
  const entries = await getAllSitemapEntries();
  const start = (id ?? 0) * SITEMAP_CHUNK_SIZE;
  const end = start + SITEMAP_CHUNK_SIZE;
  return entries.slice(start, end);
}
