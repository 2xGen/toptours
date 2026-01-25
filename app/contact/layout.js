export const metadata = {
  title: 'Contact Us | TopTours.ai',
  description: 'Get in touch with TopTours.ai through your preferred platform. Connect with us on Facebook, Instagram, TikTok, or via email.',
  keywords: 'contact TopTours.ai, customer support, travel help, get in touch',
  openGraph: {
    title: 'Contact Us | TopTours.ai',
    description: 'Get in touch with TopTours.ai through your preferred platform. We\'re here to help!',
    url: 'https://toptours.ai/contact',
    siteName: 'TopTours.ai',
    images: [
      {
        url: 'https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact TopTours.ai',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | TopTours.ai',
    description: 'Get in touch with TopTours.ai through your preferred platform.',
    images: ['https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg'],
  },
  alternates: {
    canonical: 'https://toptours.ai/contact',
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

export default function ContactLayout({ children }) {
  return children;
}
