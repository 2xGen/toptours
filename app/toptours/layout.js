export const metadata = {
  title: 'Top Tours Leaderboard | TopTours.ai™',
  description: 'Join our growing community competing to promote the best tours. Discover the most promoted tours, see who\'s leading the competition, and find your next adventure. Every boost counts. Every point matters.',
  keywords: 'top tours, tour leaderboard, promoted tours, trending tours, tour competition, travel leaderboard, best tours, popular tours',
  authors: [{ name: 'TopTours.ai' }],
  creator: 'TopTours.ai',
  publisher: 'TopTours.ai',
  openGraph: {
    title: 'Top Tours Leaderboard | TopTours.ai™',
    description: 'Join our growing community competing to promote the best tours. Discover the most promoted tours and see who\'s leading the competition.',
    url: 'https://toptours.ai/toptours',
    siteName: 'TopTours.ai™',
    images: [
      {
        url: 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/how%20it%20works.png',
        width: 1200,
        height: 630,
        alt: 'Top Tours Leaderboard - TopTours.ai™',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top Tours Leaderboard | TopTours.ai™',
    description: 'Join our growing community competing to promote the best tours. Discover the most promoted tours and see who\'s leading the competition.',
    images: ['https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/how%20it%20works.png'],
  },
  alternates: {
    canonical: 'https://toptours.ai/toptours',
  },
};

export default function TopToursLayout({ children }) {
  return (
    <>
      {/* Structured Data - WebPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Top Tours Leaderboard | TopTours.ai™",
            "description": "Join our growing community competing to promote the best tours. Discover the most promoted tours, see who's leading the competition, and find your next adventure.",
            "url": "https://toptours.ai/toptours",
            "inLanguage": "en-US",
            "isPartOf": {
              "@type": "WebSite",
              "name": "TopTours.ai™",
              "url": "https://toptours.ai"
            },
            "about": {
              "@type": "Thing",
              "name": "Tour Leaderboard",
              "description": "Community-driven ranking of the most promoted tours and activities"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://toptours.ai"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Top Tours",
                  "item": "https://toptours.ai/toptours"
                }
              ]
            }
          })
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://toptours.ai"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Top Tours",
                "item": "https://toptours.ai/toptours"
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
          })
        }}
      />

      {children}
    </>
  );
}

