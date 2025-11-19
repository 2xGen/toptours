import HowItWorksClient from './HowItWorksClient';

export const metadata = {
  title: 'How TopTours.ai™ Works | Community-Driven Tour Discovery',
  description: 'Discover how TopTours.ai™ revolutionizes tour discovery with AI-powered matching, community-driven promotion, and personalized recommendations. Join thousands of travelers finding their perfect tours.',
  openGraph: {
    title: 'How TopTours.ai™ Works | Community-Driven Tour Discovery',
    description: 'Discover how TopTours.ai™ revolutionizes tour discovery with AI-powered matching, community-driven promotion, and personalized recommendations.',
    url: 'https://toptours.ai/how-it-works',
    siteName: 'TopTours.ai™',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/how%20it%20works.png',
        width: 1200,
        height: 630,
        alt: 'How TopTours.ai™ Works - Community-Driven Tour Discovery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How TopTours.ai™ Works | Community-Driven Tour Discovery',
    description: 'Discover how TopTours.ai™ revolutionizes tour discovery with AI-powered matching, community-driven promotion, and personalized recommendations.',
    images: ['https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/how%20it%20works.png'],
  },
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
