export const metadata = {
  title: 'Affiliate Disclosure | TopTours.ai',
  description: 'Transparency is important to us. Learn how TopTours.ai operates, how we\'re compensated through affiliate partnerships, and our commitment to unbiased recommendations.',
  keywords: 'affiliate disclosure, TopTours.ai disclosure, affiliate links, transparency, travel affiliate',
  openGraph: {
    title: 'Affiliate Disclosure | TopTours.ai',
    description: 'Learn how TopTours.ai operates and how we\'re compensated through affiliate partnerships. Full transparency about our business model.',
    url: 'https://toptours.ai/disclosure',
    siteName: 'TopTours.ai',
    images: [
      {
        url: 'https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg',
        width: 1200,
        height: 630,
        alt: 'TopTours.ai Affiliate Disclosure',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Affiliate Disclosure | TopTours.ai',
    description: 'Full transparency about how TopTours.ai operates and affiliate partnerships.',
    images: ['https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg'],
  },
  alternates: {
    canonical: 'https://toptours.ai/disclosure',
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

export default function DisclosureLayout({ children }) {
  return children;
}
