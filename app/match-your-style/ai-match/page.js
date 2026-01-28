import MatchYourStyleClient from '../MatchYourStyleClient';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai';

export async function generateMetadata() {
  const canonical = `${baseUrl}/match-your-style/ai-match`;
  const title = 'AI Match - Instant Tour Recommendations | TopTours.ai';
  const description = 'Get personalized tour and restaurant recommendations right now. Enter your destination and preferences—we’ll show you the best matches with 0–100% scores. Free.';
  const ogImage = 'https://toptours.ai/OG%20Images/TopTours%20Destinations.jpg';

  return {
    title,
    description,
    keywords: 'AI tour match, instant tour recommendations, personalized tours, tour match score, travel preferences, TopTours AI',
    alternates: {
      canonical: '/match-your-style/ai-match',
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'TopTours.ai',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'AI Match - TopTours.ai',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function AiMatchPage() {
  return <MatchYourStyleClient />;
}
