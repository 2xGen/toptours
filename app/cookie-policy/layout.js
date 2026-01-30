// Build-time static: served from CDN, no serverless function on request (near-zero compute).
export const dynamic = 'force-static';

export const metadata = {
  title: 'Cookie Policy | TopTours.ai',
  description: 'Learn about TopTours.ai Cookie Policy. Understand how we use cookies to improve your experience and how you can manage your cookie preferences.',
  keywords: 'cookie policy, TopTours.ai cookies, cookie settings, web cookies, privacy cookies',
  openGraph: {
    title: 'Cookie Policy | TopTours.ai',
    description: 'Learn how TopTours.ai uses cookies to improve your experience and how you can manage your preferences.',
    url: 'https://toptours.ai/cookie-policy',
    siteName: 'TopTours.ai',
    images: [
      {
        url: 'https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg',
        width: 1200,
        height: 630,
        alt: 'TopTours.ai Cookie Policy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | TopTours.ai',
    description: 'Learn about TopTours.ai cookie usage and how to manage your preferences.',
    images: ['https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg'],
  },
  alternates: {
    canonical: 'https://toptours.ai/cookie-policy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Static page - cache for 7 days (rarely changes)
export const revalidate = 604800; // 7 days

export default function CookiePolicyLayout({ children }) {
  return children;
}
