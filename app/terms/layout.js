import { absoluteUrl } from '@/lib/siteUrl';

// Build-time static: served from CDN, no serverless function on request (near-zero compute).
export const dynamic = 'force-static';

const pageUrl = absoluteUrl('/terms');
const defaultOg = absoluteUrl('/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg');

export const metadata = {
  title: 'Terms of Service | TopTours.ai',
  description: 'Read TopTours.ai Terms of Service. Learn about our policies, user responsibilities, booking terms, and account management.',
  keywords: 'terms of service, TopTours.ai terms, user agreement, booking terms, travel platform terms',
  openGraph: {
    title: 'Terms of Service | TopTours.ai',
    description: 'Read TopTours.ai Terms of Service. Learn about our policies, user responsibilities, and booking terms.',
    url: pageUrl,
    siteName: 'TopTours.ai',
    images: [
      {
        url: defaultOg,
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

export default function TermsLayout({ children }) {
  return children;
}
