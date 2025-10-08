export const metadata = {
  title: 'About Us - AI-Powered Travel Planning | TopTours.ai',
  description: 'Learn how TopTours.ai uses artificial intelligence to revolutionize travel planning. Discover our mission to make personalized trip planning accessible to everyone with smart recommendations and curated experiences.',
  keywords: 'about TopTours.ai, AI travel planning, smart travel, personalized recommendations, travel technology, AI trip planner, our mission, travel innovation',
  openGraph: {
    title: 'About Us - AI-Powered Travel Planning | TopTours.ai',
    description: 'Learn how TopTours.ai uses artificial intelligence to revolutionize travel planning. Making personalized trip planning accessible to everyone.',
    url: 'https://toptours.ai/about',
    siteName: 'TopTours.ai',
    images: [
      {
        url: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/TopToursAI%20About%20Us%20Page.png',
        width: 1200,
        height: 630,
        alt: 'TopTours.ai - AI-Powered Travel Planning',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - AI-Powered Travel Planning | TopTours.ai',
    description: 'Learn how TopTours.ai uses AI to revolutionize travel planning. Making personalized trip planning accessible to everyone.',
    images: ['https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/TopToursAI%20About%20Us%20Page.png'],
  },
  alternates: {
    canonical: 'https://toptours.ai/about',
  },
};

export default function AboutLayout({ children }) {
  return (
    <>
      {/* Structured Data - AboutPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About TopTours.ai",
            "description": "Learn about TopTours.ai and our mission to revolutionize travel planning with AI",
            "url": "https://toptours.ai/about",
            "mainEntity": {
              "@type": "Organization",
              "name": "TopTours.ai",
              "url": "https://toptours.ai",
              "logo": "https://toptours.ai/logo.png",
              "description": "AI-powered travel planning platform offering personalized tour recommendations and smart itineraries for travelers worldwide",
              "foundingDate": "2024",
              "sameAs": [
                "https://www.facebook.com/profile.php?id=61573639234569",
                "https://www.instagram.com/toptours.ai/?hl=en",
                "https://www.tiktok.com/@toptours.ai"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "Worldwide"
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

