// Build-time static: served from CDN, no serverless function on request (near-zero compute).
export const dynamic = 'force-static';

export const metadata = {
  title: 'Terms of Service | TopTours.ai',
  description: 'Read TopTours.ai Terms of Service. Learn about our policies, user responsibilities, booking terms, and account management.',
  keywords: 'terms of service, TopTours.ai terms, user agreement, booking terms, travel platform terms',
  openGraph: {
    title: 'Terms of Service | TopTours.ai',
    description: 'Read TopTours.ai Terms of Service. Learn about our policies, user responsibilities, and booking terms.',
    url: 'https://toptours.ai/terms',
    siteName: 'TopTours.ai',
    images: [
      {
        url: 'https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg',
        width: 1200,
        height: 630,
        alt: 'TopTours.ai Terms of Service',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | TopTours.ai',
    description: 'Read TopTours.ai Terms of Service and user agreement.',
    images: ['https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg'],
  },
  alternates: {
    canonical: 'https://toptours.ai/terms',
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

export default function TermsLayout({ children }) {
  return children;
}
