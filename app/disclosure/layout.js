import { absoluteUrl } from '@/lib/siteUrl';

// Build-time static: served from CDN, no serverless function on request (near-zero compute).
export const dynamic = 'force-static';

const pageUrl = absoluteUrl('/disclosure');
const defaultOg = absoluteUrl('/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg');

export const metadata = {
  title: 'Affiliate Disclosure | TopTours.ai',
  description:
    'How TopTours.ai earns commissions: tour bookings (Viator), travel insurance (SafetyWing ambassador links), and other partners—at no extra cost to you.',
  keywords:
    'affiliate disclosure, TopTours.ai disclosure, affiliate links, Viator, SafetyWing, travel insurance affiliate, transparency',
  openGraph: {
    title: 'Affiliate Disclosure | TopTours.ai',
    description:
      'Tours (Viator), travel insurance (SafetyWing), and how affiliate compensation works—full transparency.',
    url: pageUrl,
    siteName: 'TopTours.ai',
    images: [
      {
        url: defaultOg,
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
    description: 'Tours, travel insurance (SafetyWing), and affiliate transparency.',
    images: [defaultOg],
  },
  alternates: {
    canonical: pageUrl,
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

// Fully static until next deploy (no periodic ISR) — legal HTML is CDN-served for bots.
export const revalidate = false;

export default function DisclosureLayout({ children }) {
  return children;
}
