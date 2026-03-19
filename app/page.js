import HomePageClient from './HomePageClient';
import { absoluteUrl, getSiteOrigin } from '@/lib/siteUrl';

// Revalidate homepage every hour
export const revalidate = 604800; // 7 days - match other pages, reduce ISR writes

export async function generateMetadata() {
  const canonicalUrl = getSiteOrigin();
  const ogImage = absoluteUrl('/og-homepage.jpg');

  return {
    title: 'TopTours.ai - AI-Powered Tour & Excursion Discovery | 300,000+ Tours Worldwide',
    description: 'Tours & Excursions That Match Your Style. Get personalized recommendations with AI-powered Best Match. Explore 300,000+ tours and 38,000+ travel guides across 3,300+ destinations worldwide. See match scores on every listing. Book tours and discover travel experiences.',
    keywords: 'tours, activities, travel planning, AI travel recommendations, destination guides, book tours online, travel experiences, vacation activities, personalized travel, best match tours, travel style matching, things to do, travel booking, tour booking, travel guide, destination guide, travel recommendations, AI travel planner',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'TopTours.ai - Tours & Excursions That Match Your Style',
      description: 'Get personalized tour and excursion recommendations with AI-powered Best Match. Explore 300,000+ tours across 3,300+ destinations. See match scores on every listing.',
      url: canonicalUrl,
      siteName: 'TopTours.ai',
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'TopTours.ai - AI-Powered Travel Planning Platform',
      }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'TopTours.ai - Tours & Excursions That Match Your Style',
      description: 'AI-powered Best Match for personalized travel recommendations. 300,000+ tours across 3,300+ destinations.',
      images: [ogImage],
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
  // Organization + WebSite JSON-LD live in root layout (single source; avoids duplicate schemas on home)
  return <HomePageClient />;
}
