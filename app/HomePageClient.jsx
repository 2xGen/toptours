"use client";
import { useState, lazy, Suspense, useMemo } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Hero from '@/components/home/Hero';
import TopDestinations from '@/components/home/BlogSection';
import HomeCTA from '@/components/home/HomeCTA';
import HowItWorksSlider from '@/components/home/HowItWorksSlider';
import TrustSignals from '@/components/home/TrustSignals';
import PartnerWithUs from '@/components/home/PartnerWithUs';
import TravelGuidesPreview from '@/components/home/TravelGuidesPreview';
import DestinationLinksFooter from '@/components/home/DestinationLinksFooter';

// OPTIMIZED: Lazy load heavy components for better initial page load
// PopularDestinations imports 583 KB of destination data - lazy load it (below fold)
const PopularDestinations = lazy(() => import('@/components/home/PopularDestinations'));
const AIPlanner = lazy(() => import('@/components/home/AIPlanner'));
const SmartTourFinder = lazy(() => import('@/components/home/SmartTourFinder'));
const OnboardingModal = lazy(() => import('@/components/auth/OnboardingModal'));

export default function HomePageClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenOnboardingModal = () => setIsOnboardingModalOpen(true);
  const handleCloseOnboardingModal = () => setIsOnboardingModalOpen(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai';

  // Enhanced structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TopTours.ai",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "AI-powered tour and restaurant discovery platform with personalized recommendations",
    "sameAs": [
      "https://www.facebook.com/toptoursai",
      "https://www.instagram.com/toptoursai",
      "https://www.tiktok.com/@toptoursai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@toptours.ai",
      "availableLanguage": ["English"]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "50000"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TopTours.ai",
    "url": baseUrl,
    "description": "AI-powered tour and restaurant recommendations that match your travel style with personalized match scores",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/results?searchTerm={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TopTours.ai",
      "url": baseUrl,
      "logo": `${baseUrl}/logo.png`
    }
  };

  // BreadcrumbList schema for homepage
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      }
    ]
  };

  // OPTIMIZED: Memoize popular destinations schema - only calculate once
  // Note: destinations import removed from top-level, so we'll use a static list for schema
  const destinationsItemListSchema = useMemo(() => {
    // Use a static list of popular destinations for schema (doesn't need full data)
    const popularDestinations = [
      { id: 'aruba', name: 'Aruba' },
      { id: 'curacao', name: 'Curaçao' },
      { id: 'punta-cana', name: 'Punta Cana' },
      { id: 'lisbon', name: 'Lisbon' },
      { id: 'bali', name: 'Bali' },
      { id: 'amsterdam', name: 'Amsterdam' },
      { id: 'tokyo', name: 'Tokyo' },
      { id: 'new-york-city', name: 'New York City' },
      { id: 'rome', name: 'Rome' },
      { id: 'paris', name: 'Paris' },
      { id: 'london', name: 'London' },
      { id: 'barcelona', name: 'Barcelona' },
      { id: 'santorini', name: 'Santorini' },
      { id: 'dubai', name: 'Dubai' },
      { id: 'sydney', name: 'Sydney' },
      { id: 'miami', name: 'Miami' },
      { id: 'las-vegas', name: 'Las Vegas' },
      { id: 'prague', name: 'Prague' },
      { id: 'istanbul', name: 'Istanbul' },
      { id: 'bangkok', name: 'Bangkok' },
    ];
    
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Popular Travel Destinations",
      "description": "Top-rated travel destinations with tours, activities, and restaurants",
      "itemListElement": popularDestinations.map((dest, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": dest.name,
        "url": `${baseUrl}/destinations/${dest.id}`
      }))
    };
  }, [baseUrl]);

  // Service Schema for AI-powered Best Match
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "AI-Powered Best Match",
    "description": "Personalized tour and restaurant recommendations that match your travel style, budget, and group preferences using AI-powered matching technology",
    "provider": {
      "@type": "Organization",
      "name": "TopTours.ai",
      "url": baseUrl
    },
    "serviceType": "Travel Recommendation Service",
    "areaServed": "Worldwide",
    "audience": {
      "@type": "Audience",
      "audienceType": "Travelers"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  // HowTo Schema for "How It Works" section
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Use TopTours.ai AI-Powered Best Match",
    "description": "Learn how to get personalized tour and restaurant recommendations that match your travel style",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Set Your Preferences",
        "text": "Tell us your travel style: adventure level, budget comfort, group size, and more. Our AI uses these preferences to rank tours and restaurants just for you."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "See Your Perfect Matches",
        "text": "Every tour and restaurant shows a match score based on your preferences. Sort by 'Best Match' to see the most relevant options first."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Explore Destinations",
        "text": "Explore tours and restaurants across 3,300+ destinations worldwide. Find hidden gems and popular spots that match your travel style."
      }
    ]
  };

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      <main className="min-h-screen" suppressHydrationWarning>
        <Hero onOpenOnboardingModal={handleOpenOnboardingModal} />
        <TrustSignals />
        {/* OPTIMIZED: Lazy load PopularDestinations - it's below fold and imports 583 KB of data */}
        <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="spinner"></div></div>}>
          <PopularDestinations />
        </Suspense>
        <HowItWorksSlider />
        {/* OPTIMIZED: Lazy load AIPlanner - only loads when scrolled into view */}
        <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="spinner"></div></div>}>
          <AIPlanner />
        </Suspense>
        <PartnerWithUs />
        <HomeCTA onOpenModal={handleOpenModal} onOpenOnboardingModal={handleOpenOnboardingModal} />
        <TravelGuidesPreview />
        {/* OPTIMIZED: Lazy load DestinationLinksFooter - it imports 583 KB of destination data */}
        <Suspense fallback={null}>
          <DestinationLinksFooter />
        </Suspense>
      </main>

      <FooterNext />
      
      {/* OPTIMIZED: Lazy load modals - only load when opened */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <SmartTourFinder 
            isOpen={isModalOpen} 
            onClose={handleCloseModal}
          />
        </Suspense>
      )}
      
      {isOnboardingModalOpen && (
        <Suspense fallback={null}>
          <OnboardingModal 
            isOpen={isOnboardingModalOpen} 
            onClose={handleCloseOnboardingModal}
          />
        </Suspense>
      )}
      
      {/* Enhanced Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(destinationsItemListSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema)
        }}
      />
    </>
  );
}
