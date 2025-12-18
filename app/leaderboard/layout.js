export const metadata = {
  title: 'Leaderboard | TopTours.ai™',
  description: 'Join our growing community competing to promote the best tours and restaurants. Discover the most promoted tours and restaurants, see who\'s leading the competition, and find your next adventure. Every boost counts. Every point matters.',
  keywords: 'top tours, tour leaderboard, restaurant leaderboard, promoted tours, trending tours, tour competition, travel leaderboard, best tours, popular tours, restaurant promotion',
  authors: [{ name: 'TopTours.ai' }],
  creator: 'TopTours.ai',
  publisher: 'TopTours.ai',
  openGraph: {
    title: 'Leaderboard | TopTours.ai™',
    description: 'Join our growing community competing to promote the best tours and restaurants. Discover the most promoted tours and restaurants and see who\'s leading the competition.',
    url: 'https://toptours.ai/leaderboard',
    siteName: 'TopTours.ai™',
    images: [
      {
        url: 'https://toptours.ai/OG%20Images/best%20tours%20and%20restaurants%20voted%20by%20the%20community.jpg',
        width: 1200,
        height: 675,
        alt: 'Best tours and restaurants voted by the community',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leaderboard | TopTours.ai™',
    description: 'Join our growing community competing to promote the best tours and restaurants. Discover the most promoted tours and restaurants and see who\'s leading the competition.',
    images: ['https://toptours.ai/OG%20Images/best%20tours%20and%20restaurants%20voted%20by%20the%20community.jpg'],
  },
  alternates: {
    canonical: 'https://toptours.ai/leaderboard',
  },
};

export default function LeaderboardLayout({ children }) {
  return (
    <>
      {/* Structured Data - WebPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Leaderboard | TopTours.ai™",
            "description": "Join our growing community competing to promote the best tours and restaurants. Discover the most promoted tours and restaurants, see who's leading the competition, and find your next adventure.",
            "url": "https://toptours.ai/leaderboard",
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
                  "name": "Leaderboard",
                  "item": "https://toptours.ai/leaderboard"
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

