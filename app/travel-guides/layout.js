export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai';
  
  return {
    title: 'Travel Guides & Destination Tips | TopTours.ai',
    description: 'Discover smart travel insights, destination guides, and AI-powered tips to help you plan your perfect trip — from hidden gems to must-do tours around the world.',
    alternates: {
      canonical: `${baseUrl}/travel-guides`,
    },
    openGraph: {
      title: 'Travel Guides & Destination Tips | TopTours.ai',
      description: 'Discover smart travel insights, destination guides, and AI-powered tips to help you plan your perfect trip.',
      url: `${baseUrl}/travel-guides`,
      siteName: 'TopTours.ai',
      images: [
        {
          url: 'https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg',
          width: 1200,
          height: 675,
          alt: 'Travel Guides & Destination Tips',
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Travel Guides & Destination Tips | TopTours.ai',
      description: 'Discover smart travel insights, destination guides, and AI-powered tips to help you plan your perfect trip.',
      images: ['https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg'],
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

export default function TravelGuidesLayout({ children }) {
  return children;
}
