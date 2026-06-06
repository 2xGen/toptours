import { getAllSitemapEntries, SITEMAP_CHUNK_SIZE } from '../lib/sitemapData.js';
import { readCachedMainEntries } from '../lib/sitemapXml.js';

/** Vercel / GSC: large DB-backed sitemap can exceed default 10s without this on Pro+. */
export const maxDuration = 120;

/**
 * ISR fallback when pre-generated main-entries.json is missing (local dev without build step).
 */
export const revalidate = 3600;

/**
 * Split main sitemap when >50k URLs (Google limit).
 * Prefers build-time cache from public/generated-sitemaps/main-entries.json.
 */
export async function generateSitemaps() {
  const entries = readCachedMainEntries() || (await getAllSitemapEntries());
  const total = entries.length;
  const numChunks = Math.max(1, Math.ceil(total / SITEMAP_CHUNK_SIZE));
  return Array.from({ length: numChunks }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }) {
  const entries = readCachedMainEntries() || (await getAllSitemapEntries());
  const start = (id ?? 0) * SITEMAP_CHUNK_SIZE;
  const end = start + SITEMAP_CHUNK_SIZE;
  return entries.slice(start, end);
}
