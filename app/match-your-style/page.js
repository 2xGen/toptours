import MatchYourStyleClient from './MatchYourStyleClient';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai';

export async function generateMetadata() {
  const canonical = `${baseUrl}/match-your-style`;
  const title = 'Get Tour Recommendations - AI or Personal Match | TopTours.ai';
  const description = 'Get personalized tour recommendations: instant AI match or free personal picks within 24 hours from our experts across 300k+ tours in 3,500 destinations.';
  const ogImage = 'https://toptours.ai/OG%20Images/TopTours%20Destinations.jpg';
  const ogTitle = 'Get Tour Recommendations – Free AI or Expert Picks in 24h | TopTours.ai';

  return {
    title,
    description,
    keywords: 'tour recommendations, personalized tours, AI tour match, personal travel concierge, free tour picks, hand-picked tours, travel recommendations, TopTours',
    alternates: {
      canonical: '/match-your-style',
    },
    openGraph: {
      title: ogTitle,
      description,
      url: canonical,
      siteName: 'TopTours.ai',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Get Tour Recommendations - TopTours.ai',
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

export default function MatchYourStylePage() {
  return <MatchYourStyleClient />;
}

