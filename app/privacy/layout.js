export const metadata = {
  title: 'Privacy Policy | TopTours.ai',
  description: 'Read TopTours.ai Privacy Policy. Learn how we collect, use, and protect your personal information when you use our travel planning platform.',
  keywords: 'privacy policy, TopTours.ai privacy, data protection, user privacy, GDPR compliance',
  openGraph: {
    title: 'Privacy Policy | TopTours.ai',
    description: 'Learn how TopTours.ai collects, uses, and protects your personal information. Your privacy matters to us.',
    url: 'https://toptours.ai/privacy',
    siteName: 'TopTours.ai',
    images: [
      {
        url: 'https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg',
        width: 1200,
        height: 675,
        alt: 'TopTours.ai Privacy Policy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | TopTours.ai',
    description: 'Learn how TopTours.ai protects your privacy and personal information.',
    images: ['https://toptours.ai/OG%20Images/Discover%20Top%20Tours%20and%20Restaurants.jpg'],
  },
  alternates: {
    canonical: 'https://toptours.ai/privacy',
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

export default function PrivacyLayout({ children }) {
  return children;
}
