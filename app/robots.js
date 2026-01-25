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
        ],
      },
      // Optimize for Googlebot specifically
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

