import { absoluteUrl } from '@/lib/siteUrl';

export async function generateMetadata() {
  const pageUrl = absoluteUrl('/travel-guides');
  const ogImage = absoluteUrl('/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg');

  return {
    title: 'Travel Guides & Destination Tips | TopTours.ai',
    description: 'Discover smart travel insights, destination guides, and AI-powered tips to help you plan your perfect trip — from hidden gems to must-do tours around the world.',
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: 'Travel Guides & Destination Tips | TopTours.ai',
      description: 'Discover smart travel insights, destination guides, and AI-powered tips to help you plan your perfect trip.',
      url: pageUrl,
      siteName: 'TopTours.ai',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
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
      images: [ogImage],
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
