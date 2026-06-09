/**
 * Runtime sitemap entry builder (fallback when pre-generated XML is missing).
 */
import { createSupabaseServiceRoleClient } from '../src/lib/supabaseClient.js';
import { getSiteOrigin } from '../src/lib/siteUrl.js';
import { buildSitemapEntries } from './buildSitemapEntries.js';

let sitemapEntriesInflight = null;

async function buildAllSitemapEntriesOnce() {
  const supabase = createSupabaseServiceRoleClient();
  return buildSitemapEntries({ baseUrl: getSiteOrigin(), supabase });
}

export function getAllSitemapEntries() {
  if (!sitemapEntriesInflight) {
    sitemapEntriesInflight = buildAllSitemapEntriesOnce().finally(() => {
      sitemapEntriesInflight = null;
    });
  }
  return sitemapEntriesInflight;
}

/** Google allows 50,000 URLs per sitemap file. */
export const SITEMAP_CHUNK_SIZE = 50000;
