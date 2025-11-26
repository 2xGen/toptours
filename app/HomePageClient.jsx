"use client";
import { useState } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Hero from '@/components/home/Hero';
import AIPlanner from '@/components/home/AIPlanner';
import FeaturedTours from '@/components/home/FeaturedTours';
import TopDestinations from '@/components/home/BlogSection';
import HomeCTA from '@/components/home/HomeCTA';
import HowItWorksSlider from '@/components/home/HowItWorksSlider';
import DestinationSearch from '@/components/home/DestinationSearch';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import OnboardingModal from '@/components/auth/OnboardingModal';

export default function HomePageClient({ topTours = [], topPromoters = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenOnboardingModal = () => setIsOnboardingModalOpen(true);
  const handleCloseOnboardingModal = () => setIsOnboardingModalOpen(false);

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      <main className="min-h-screen" suppressHydrationWarning>
        <Hero onOpenOnboardingModal={handleOpenOnboardingModal} />
        <DestinationSearch />
        <HowItWorksSlider />
        <FeaturedTours onOpenModal={handleOpenModal} topTours={topTours} topPromoters={topPromoters} />
        <AIPlanner />
        <TopDestinations />
        <HomeCTA onOpenModal={handleOpenModal} onOpenOnboardingModal={handleOpenOnboardingModal} />
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
      
      {/* Schema Markup */}
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
              "target": "https://toptours.ai/results?searchTerm={search_term_string}",
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
    </>
  );
}

