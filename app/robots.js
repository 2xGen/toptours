import { getSiteOrigin } from '@/lib/siteUrl';

/**
 * Legal URLs (/terms, /cookie-policy, /disclosure) are disallowed for userAgent * to cut
 * abusive/scraper crawl volume; Googlebot has a separate rule without those paths so GSC
 * can still index them when you want transparency in Google. Humans always reach them via footer links.
 */
export default function robots() {
  const origin = getSiteOrigin();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/test-openai/',
          '/ai-test/',
          '/admin-matthijs/',
          '/api/internal/',
          '/api/admin/',
          '/terms',
          '/cookie-policy',
          '/disclosure',
        ],
      },
      // Googlebot: allow legal pages (for index/transparency), same API/admin blocks
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin-matthijs/',
          '/api/internal/',
          '/api/admin/',
        ],
      },
    ],
    // Keep robots sitemap discovery focused on indexable URL sets only.
    sitemap: [`${origin}/sitemap.xml`],
  };
}

