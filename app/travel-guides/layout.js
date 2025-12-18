export const metadata = {
  title: 'Expert Travel Guides & Tips | TopTours.ai',
  description: 'Discover 27+ comprehensive travel guides covering destinations worldwide. Get expert tips, destination insights, and AI-powered recommendations for your next adventure. From Caribbean getaways to European escapes.',
  keywords: 'travel guides, travel tips, destination guides, trip planning, travel advice, vacation planning, travel blog, destination tips, smart travel, AI travel planning',
  openGraph: {
    title: 'Expert Travel Guides & Tips | TopTours.ai',
    description: 'Discover 27+ comprehensive travel guides with expert tips and AI-powered recommendations. Plan your perfect trip with insider knowledge and curated experiences.',
    url: 'https://toptours.ai/travel-guides',
    siteName: 'TopTours.ai',
    images: [
      {
        url: 'https://toptours.ai/OG%20Images/travel%20guides%20tips%20and%20insights.jpg',
        width: 1200,
        height: 675,
        alt: 'TopTours.ai Travel Guides - Tips and insights',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expert Travel Guides & Tips | TopTours.ai',
    description: 'Discover 27+ comprehensive travel guides with expert tips and AI-powered recommendations. Plan your perfect trip today!',
    images: ['https://toptours.ai/OG%20Images/travel%20guides%20tips%20and%20insights.jpg'],
  },
  alternates: {
    canonical: 'https://toptours.ai/travel-guides',
  },
};

export default function TravelGuidesLayout({ children }) {
  return (
    <>
      {/* Blog Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "TopTours.ai Travel Guides",
            "description": "Expert travel guides, tips, and destination insights",
            "url": "https://toptours.ai/travel-guides",
            "publisher": {
              "@type": "Organization",
              "name": "TopTours.ai",
              "logo": {
                "@type": "ImageObject",
                "url": "https://toptours.ai/logo.png"
              }
            }
          })
        }}
      />

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "TopTours.ai",
            "url": "https://toptours.ai",
            "logo": "https://toptours.ai/logo.png",
            "description": "AI-powered travel planning and tour recommendations",
            "sameAs": [
              "https://www.facebook.com/profile.php?id=61573639234569",
              "https://www.instagram.com/toptours.ai/?hl=en",
              "https://www.tiktok.com/@toptours.ai"
            ]
          })
        }}
      />

      {children}
    </>
  );
}

