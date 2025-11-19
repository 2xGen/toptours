export const metadata = {
  title: 'How It Works - AI Travel Planning Made Simple | TopTours.ai™',
  description: 'Discover how TopTours.ai™ makes travel planning effortless. Our AI analyzes your preferences, searches thousands of tours, and creates personalized recommendations in seconds. Start planning smarter today.',
  keywords: 'how it works, AI travel planning, smart trip planning, personalized travel, tour recommendations, AI itinerary, travel planning process',
  openGraph: {
    title: 'How It Works - AI Travel Planning Made Simple | TopTours.ai™',
    description: 'Discover how TopTours.ai™ makes travel planning effortless with AI-powered recommendations and smart itineraries.',
    url: 'https://toptours.ai/how-it-works',
    siteName: 'TopTours.ai™',
    images: [
      {
        url: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/How%20to%20Plan%20a%20Trip%20with%20AI.png',
        width: 1200,
        height: 630,
        alt: 'How TopTours.ai™ Works - AI Travel Planning',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works - AI Travel Planning Made Simple | TopTours.ai™',
    description: 'Discover how TopTours.ai™ makes travel planning effortless with AI-powered recommendations.',
    images: ['https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/How%20to%20Plan%20a%20Trip%20with%20AI.png'],
  },
  alternates: {
    canonical: 'https://toptours.ai/how-it-works',
  },
};

export default function HowItWorksLayout({ children }) {
  return (
    <>
      {/* Structured Data - HowTo Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Plan Your Trip with TopTours.ai™",
            "description": "Learn how to use TopTours.ai™'s AI-powered platform to plan your perfect trip",
            "totalTime": "PT5M",
            "step": [
              {
                "@type": "HowToStep",
                "position": 1,
                "name": "Tell Us Your Dream Destination",
                "text": "Enter where you want to go and what you want to experience"
              },
              {
                "@type": "HowToStep",
                "position": 2,
                "name": "AI Analyzes Your Preferences",
                "text": "Our AI processes your interests and finds the perfect matches"
              },
              {
                "@type": "HowToStep",
                "position": 3,
                "name": "Get Personalized Recommendations",
                "text": "Receive curated tour and activity suggestions tailored to you"
              },
              {
                "@type": "HowToStep",
                "position": 4,
                "name": "Book Your Perfect Adventure",
                "text": "Review options, compare prices, and book with confidence"
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
            "name": "TopTours.ai™",
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

