export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/test-openai/', '/ai-test/'],
      },
    ],
    sitemap: 'https://toptours.ai/sitemap.xml',
  };
}

