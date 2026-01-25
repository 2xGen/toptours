import HomePageClient from './HomePageClient';

// Revalidate homepage every hour
export const revalidate = 86400; // 24 hours - increased to reduce ISR writes

export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai';
  
  return {
    title: 'TopTours.ai - AI-Powered Tour & Restaurant Discovery | 300,000+ Tours Worldwide',
    description: 'Tours & Restaurants That Match Your Style. Get personalized recommendations with AI-powered Best Match. Explore 300,000+ tours, 3,500+ restaurants, and 19,000+ travel guides across 3,300+ destinations worldwide. See match scores on every listing. Book tours, find restaurants, and discover travel experiences.',
    keywords: 'tours, activities, restaurants, travel planning, AI travel recommendations, destination guides, book tours online, travel experiences, vacation activities, personalized travel, best match tours, travel style matching, things to do, travel booking, tour booking, restaurant finder, travel guide, destination guide, travel recommendations, AI travel planner',
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: 'TopTours.ai - Tours & Restaurants That Match Your Style',
      description: 'Get personalized tour and restaurant recommendations with AI-powered Best Match. Explore 300,000+ tours, 3,500+ restaurants across 3,300+ destinations. See match scores on every listing.',
      url: baseUrl,
      siteName: 'TopTours.ai',
      images: [{
        url: `${baseUrl}/og-homepage.jpg`,
        width: 1200,
        height: 630,
        alt: 'TopTours.ai - AI-Powered Travel Planning Platform',
      }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'TopTours.ai - Tours & Restaurants That Match Your Style',
      description: 'AI-powered Best Match for personalized travel recommendations. 300,000+ tours, 3,500+ restaurants across 3,300+ destinations.',
      images: [`${baseUrl}/og-homepage.jpg`],
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
}

export default async function HomePage() {
  const baseUrl = 'https://toptours.ai';
  
  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TopTours.ai',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'AI-powered tour and restaurant discovery platform with personalized recommendations across 300,000+ tours worldwide.',
    sameAs: [
      'https://twitter.com/toptoursai',
      'https://facebook.com/toptoursai'
    ]
  };

  // WebSite Schema with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TopTours.ai',
    url: baseUrl,
    description: 'Tours & Restaurants That Match Your Style',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/results?query={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <HomePageClient />
    </>
  );
}
