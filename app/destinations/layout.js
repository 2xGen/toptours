export const metadata = {
  title: 'Discover Top Travel Destinations Worldwide | TopTours.ai',
  description: 'Explore 175+ amazing travel destinations across the globe with AI-powered tour recommendations. From Caribbean beaches to European cities, find your perfect adventure with expert guides and curated activities.',
  keywords: 'travel destinations, vacation spots, places to visit, travel guide, tours, activities, Caribbean destinations, Europe travel, Asia travel, adventure travel',
  openGraph: {
    title: 'Discover Top Travel Destinations Worldwide | TopTours.ai',
    description: 'Explore 175+ amazing travel destinations across the globe with AI-powered tour recommendations. From Caribbean beaches to European cities, find your perfect adventure.',
    url: 'https://toptours.ai/destinations',
    siteName: 'TopTours.ai',
    images: [
      {
        url: 'https://toptours.ai/OG%20Images/discover%20tours%20guides%20and%20restaurants%20in%20over%203500%20destinations.jpg',
        width: 1200,
        height: 630,
        alt: 'Discover tours, guides and restaurants in over 3,500 destinations',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Top Travel Destinations Worldwide | TopTours.ai',
    description: 'Explore 175+ amazing travel destinations with AI-powered tour recommendations. Find your perfect adventure today!',
    images: ['https://toptours.ai/OG%20Images/discover%20tours%20guides%20and%20restaurants%20in%20over%203500%20destinations.jpg'],
  },
  alternates: {
    canonical: 'https://toptours.ai/destinations',
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

export default function DestinationsLayout({ children }) {
  return (
    <>
      {/* Structured Data - ItemList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Travel Destinations",
            "description": "Explore amazing travel destinations worldwide with AI-powered recommendations",
            "url": "https://toptours.ai/destinations",
            "numberOfItems": 175,
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "TouristDestination",
                  "name": "Aruba",
                  "url": "https://toptours.ai/destinations/aruba",
                  "description": "White-sand beaches, turquoise waters, and endless adventure"
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "TouristDestination",
                  "name": "Paris",
                  "url": "https://toptours.ai/destinations/paris",
                  "description": "The City of Light - romance, culture, and world-class attractions"
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "TouristDestination",
                  "name": "Rome",
                  "url": "https://toptours.ai/destinations/rome",
                  "description": "Ancient history meets modern Italian culture"
                }
              }
            ]
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

