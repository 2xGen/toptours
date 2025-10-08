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
        url: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/TopToursAI%20travel%20guides.png',
        width: 1200,
        height: 630,
        alt: 'TopTours.ai Travel Guides - Expert Tips & Insights',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expert Travel Guides & Tips | TopTours.ai',
    description: 'Discover 27+ comprehensive travel guides with expert tips and AI-powered recommendations. Plan your perfect trip today!',
    images: ['https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/TopToursAI%20travel%20guides.png'],
  },
  alternates: {
    canonical: 'https://toptours.ai/travel-guides',
  },
};

export default function TravelGuidesLayout({ children }) {
  return (
    <>
      {/* Structured Data - ItemList Schema for Travel Guides */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Travel Guides",
            "description": "Comprehensive travel guides and expert tips for destinations worldwide",
            "url": "https://toptours.ai/travel-guides",
            "numberOfItems": 27,
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "Article",
                  "name": "How to Plan a Trip with AI: The Future of Smart Travel",
                  "url": "https://toptours.ai/travel-guides/ai-travel-planning-guide",
                  "description": "Discover how AI trip planners revolutionize travel planning with personalized recommendations"
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "Article",
                  "name": "Aruba Travel Tips: Your Complete Guide to the Happy Island",
                  "url": "https://toptours.ai/travel-guides/aruba-travel-tips",
                  "description": "Everything you need to know for an unforgettable Aruba vacation"
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "Article",
                  "name": "Paris Travel Guide: Top Sights and Tours",
                  "url": "https://toptours.ai/travel-guides/paris-travel-guide",
                  "description": "Discover the best of Paris with our comprehensive travel guide"
                }
              }
            ]
          })
        }}
      />

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

