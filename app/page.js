import Home from '@/pages/Home'

export const metadata = {
  title: 'TopTours.ai - AI-Powered Travel Planning & Tour Booking',
  description: 'Discover and book the best tours, activities, and experiences worldwide with AI-powered recommendations. From city tours to adventure activities, find your perfect trip.',
  keywords: 'tours, activities, travel planning, AI travel, tour booking, travel experiences, city tours, adventure tours, travel recommendations',
  openGraph: {
    title: 'TopTours.ai - AI-Powered Travel Planning & Tour Booking',
    description: 'Discover and book the best tours, activities, and experiences worldwide with AI-powered recommendations.',
    url: 'https://toptours.ai',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TopTours.ai - AI-Powered Travel Planning',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TopTours.ai - AI-Powered Travel Planning & Tour Booking',
    description: 'Discover and book the best tours, activities, and experiences worldwide with AI-powered recommendations.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://toptours.ai',
  },
}

export default function HomePage() {
  return (
    <>
      {/* Enhanced Schema for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "TopTours.ai",
            "url": "https://toptours.ai",
            "description": "AI-powered travel planning and tour booking platform",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://toptours.ai/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "TopTours.ai",
              "logo": "https://toptours.ai/logo.png"
            }
          })
        }}
      />
      <Home />
    </>
  )
}
