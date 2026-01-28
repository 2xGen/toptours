import MatchYourStyleClient from '../MatchYourStyleClient';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const canonical = `${baseUrl}/match-your-style/personal-match`;
  const title = 'Personal Match - Hand-Picked Tours in 24 Hours | TopTours.ai';
  const description = 'Our experts search 300,000+ tours in 3,500 destinations and hand-pick your top 3 using our AI match technology. Free, within 24 hours. One form—personal report in your inbox.';
  const ogImage = 'https://toptours.ai/OG%20Images/TopTours%20Destinations.jpg';
  const ogTitle = 'Personal Match – Expert-Picked Tours in 24h, Free | TopTours.ai';

  return {
    title,
    description,
    keywords: 'personal tour concierge, hand-picked tours, expert tour recommendations, free tour picks, travel concierge, TopTours Personal Match',
    alternates: {
      canonical: '/match-your-style/personal-match',
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
          alt: 'Personal Match - TopTours.ai',
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

export default function PersonalMatchPage() {
  return <MatchYourStyleClient />;
}
