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
          url: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/tours%20page.png',
          width: 1200,
          height: 630,
          alt: 'Best Tours & Activities by Destination',
        },
      ],
    },
  };
}

export default function ToursPage() {
  return <ToursPageClient />;
}

