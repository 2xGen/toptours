import AffiliatesPageClient from './AffiliatesPageClient';

export const metadata = {
  title: 'Tour Affiliate Program & Restaurant Affiliate Program | Earn 30% Commission | TopTours.ai',
  description: 'Join TopTours.ai affiliate program and earn up to 30% recurring commission by referring tour operators and restaurants. $50 payout threshold. Start earning today with our tour affiliate program and restaurant affiliate program.',
  keywords: 'tour affiliate program, restaurant affiliate program, travel affiliate program, tour operator affiliate, restaurant affiliate, affiliate marketing, commission program, travel industry affiliate, tour booking affiliate, restaurant booking affiliate',
  alternates: {
    canonical: 'https://toptours.ai/affiliates',
  },
  openGraph: {
    title: 'Tour Affiliate Program & Restaurant Affiliate Program | TopTours.ai',
    description: 'Earn up to 30% recurring commission by referring tour operators and restaurants. Join our affiliate program today.',
    url: 'https://toptours.ai/affiliates',
    images: [
      {
        url: 'https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg',
        width: 1200,
        height: 630,
        alt: 'TopTours.ai Affiliate Program',
      },
    ],
    type: 'website',
    siteName: 'TopTours.ai',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tour Affiliate Program & Restaurant Affiliate Program | TopTours.ai',
    description: 'Earn up to 30% recurring commission by referring tour operators and restaurants.',
    images: ['https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg'],
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

export default function AffiliatesPage() {
  return <AffiliatesPageClient />;
}
