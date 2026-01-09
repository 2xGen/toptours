import ToursPageClient from './ToursPageClient';

export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai';
  
  return {
    title: 'Best Tours & Activities by Destination | TopTours.ai',
    description: 'Discover top-rated tours, excursions, and activities in popular travel destinations. Browse tours by location and find the perfect adventure for your trip.',
    alternates: {
      canonical: `${baseUrl}/tours`,
    },
    openGraph: {
      title: 'Best Tours & Activities by Destination',
      description: 'Find the best tours and activities in your favorite travel destinations.',
      url: `${baseUrl}/tours`,
      siteName: 'TopTours.ai',
      images: [
        {
          url: 'https://toptours.ai/OG%20Images/Discover%20top%20tours%20across%203500%20destinations.jpg',
          width: 1200,
          height: 675,
          alt: 'Best Tours & Activities by Destination',
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Best Tours & Activities by Destination',
      description: 'Find the best tours and activities in your favorite travel destinations.',
      images: ['https://toptours.ai/OG%20Images/Discover%20top%20tours%20across%203500%20destinations.jpg'],
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
}

export default function ToursPage() {
  return <ToursPageClient />;
}

