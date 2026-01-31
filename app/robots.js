// OPTIMIZED: Enhanced robots.txt for better SEO crawling
export default function robots() {
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
    sitemap: 'https://toptours.ai/sitemap.xml',
  };
}

