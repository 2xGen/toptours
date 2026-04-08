import { absoluteUrl } from '@/lib/siteUrl';

// Same as terms / cookie / disclosure: pre-rendered HTML for crawlers, no ISR wakeups.
export const dynamic = 'force-static';
export const revalidate = false;

const pageUrl = absoluteUrl('/privacy');
const defaultOg = absoluteUrl('/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg');

export const metadata = {
  title: 'Privacy Policy | TopTours.ai',
  description: 'Read TopTours.ai Privacy Policy. Learn how we collect, use, and protect your personal information when you use our travel planning platform.',
  keywords: 'privacy policy, TopTours.ai privacy, data protection, user privacy, GDPR compliance',
  openGraph: {
    title: 'Privacy Policy | TopTours.ai',
    description: 'Learn how TopTours.ai collects, uses, and protects your personal information. Your privacy matters to us.',
    url: pageUrl,
    siteName: 'TopTours.ai',
    images: [
      {
        url: defaultOg,
        width: 1200,
        height: 630,
        alt: 'TopTours.ai Privacy Policy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | TopTours.ai',
    description: 'Learn how TopTours.ai protects your privacy and personal information.',
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

export default function PrivacyLayout({ children }) {
  return children;
}
