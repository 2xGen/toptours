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
        url: 'https://toptours.ai/OG%20Images/how%20top%20tours%20uses%20the%20community%20to%20rank%20tours%20and%20restaurants.jpg',
        width: 1200,
        height: 675,
        alt: 'How TopTours.ai™ uses the community to rank tours and restaurants',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How TopTours.ai™ Works | Community-Driven Tour Discovery',
    description: 'Discover how TopTours.ai™ revolutionizes tour discovery with AI-powered matching, community-driven promotion, and personalized recommendations.',
    images: ['https://toptours.ai/OG%20Images/how%20top%20tours%20uses%20the%20community%20to%20rank%20tours%20and%20restaurants.jpg'],
  },
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
