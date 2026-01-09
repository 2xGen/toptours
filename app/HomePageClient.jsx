"use client";
import { useState } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Hero from '@/components/home/Hero';
import AIPlanner from '@/components/home/AIPlanner';
import TopDestinations from '@/components/home/BlogSection';
import HomeCTA from '@/components/home/HomeCTA';
import HowItWorksSlider from '@/components/home/HowItWorksSlider';
import DestinationSearch from '@/components/home/DestinationSearch';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import OnboardingModal from '@/components/auth/OnboardingModal';
import TrustSignals from '@/components/home/TrustSignals';
import PartnerWithUs from '@/components/home/PartnerWithUs';
import PopularDestinations from '@/components/home/PopularDestinations';
import TravelGuidesPreview from '@/components/home/TravelGuidesPreview';
import DestinationLinksFooter from '@/components/home/DestinationLinksFooter';
import { destinations } from '@/data/destinationsData';

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

  // ItemList schema for popular destinations
  const popularDestinations = destinations.slice(0, 20); // Top 20 popular destinations
  
  const destinationsItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Popular Travel Destinations",
    "description": "Top-rated travel destinations with tours, activities, and restaurants",
    "itemListElement": popularDestinations.map((dest, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": dest.fullName || dest.name,
      "url": `${baseUrl}/destinations/${dest.id}`
    }))
  };

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
        <PopularDestinations />
        <HowItWorksSlider />
        <AIPlanner />
        <PartnerWithUs />
        <HomeCTA onOpenModal={handleOpenModal} onOpenOnboardingModal={handleOpenOnboardingModal} />
        <TravelGuidesPreview />
        <DestinationLinksFooter />
      </main>

      <FooterNext />
      
      <SmartTourFinder 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
      />
      
      <OnboardingModal 
        isOpen={isOnboardingModalOpen} 
        onClose={handleCloseOnboardingModal}
      />
      
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
