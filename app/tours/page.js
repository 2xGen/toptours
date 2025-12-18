import ToursPageClient from './ToursPageClient';

export async function generateMetadata() {
  return {
    title: 'Best Tours & Activities by Destination | TopTours.ai',
    description: 'Discover top-rated tours, excursions, and activities in popular travel destinations. Browse tours by location and find the perfect adventure for your trip.',
    alternates: {
      canonical: '/tours',
    },
    openGraph: {
      title: 'Best Tours & Activities by Destination',
      description: 'Find the best tours and activities in your favorite travel destinations.',
      images: [
        {
          url: 'https://toptours.ai/OG%20Images/Discover%20top%20tours%20across%203500%20destinations.jpg',
          width: 1200,
          height: 675,
          alt: 'Best Tours & Activities by Destination',
        },
      ],
    },
  };
}

export default function ToursPage() {
  return <ToursPageClient />;
}

