import MatchYourStyleClient from './MatchYourStyleClient';

export async function generateMetadata() {
  return {
    title: 'Match Your Style - Find Personalized Tours & Restaurants | TopTours.ai',
    description: 'Discover tours and restaurants that match your travel style, budget, and preferences. Get personalized recommendations based on your profile.',
    alternates: {
      canonical: '/match-your-style',
    },
    openGraph: {
      title: 'Match Your Style - Personalized Tours & Restaurants',
      description: 'Find tours and restaurants that match your travel style and preferences.',
      images: [
        {
          url: 'https://toptours.ai/OG%20Images/TopTours%20Destinations.jpg',
          width: 1200,
          height: 630,
          alt: 'Match Your Style',
        },
      ],
    },
  };
}

export default function MatchYourStylePage() {
  return <MatchYourStyleClient />;
}

