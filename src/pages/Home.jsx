import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Hero from '@/components/home/Hero';
import AIPlanner from '@/components/home/AIPlanner';
import FeaturedTours from '@/components/home/FeaturedTours';
import TopDestinations from '@/components/home/BlogSection';
import HomeCTA from '@/components/home/HomeCTA';
import SmartTourFinder from '@/components/home/SmartTourFinder';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TopTours.ai",
    "url": "https://toptours.ai",
    "description": "AI-powered travel platform that provides personalized tour and activity recommendations worldwide.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://toptours.ai/results?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TopTours.ai",
      "url": "https://toptours.ai"
    }
  };

  return (
    <>
      <Helmet>
        <title>TopTours.ai - AI-Powered Travel Planning & Tour Recommendations</title>
        <meta name="description" content="Discover amazing tours and activities worldwide with AI-powered recommendations. Smart travel planning made simple and personalized just for you. Book tours with confidence." />
        <meta name="keywords" content="AI travel planning, tour recommendations, travel booking, smart travel, personalized tours, travel technology, tour activities, travel platform" />
        <link rel="canonical" href="https://toptours.ai" />
        
        {/* Open Graph */}
        <meta property="og:title" content="TopTours.ai - AI-Powered Travel Planning & Tour Recommendations" />
        <meta property="og:description" content="Discover amazing tours and activities worldwide with AI-powered recommendations. Smart travel planning made simple and personalized just for you." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://toptours.ai" />
        <meta property="og:image" content="https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations//TopTours-Featured_image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="TopTours.ai" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:alt" content="TopTours.ai - AI-Powered Travel Planning Platform" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TopTours.ai - AI-Powered Travel Planning & Tour Recommendations" />
        <meta name="twitter:description" content="Discover amazing tours and activities worldwide with AI-powered recommendations." />
        <meta name="twitter:image" content="https://toptours.ai/og-image.jpg" />
        <meta name="twitter:image:alt" content="TopTours.ai - AI-Powered Travel Planning Platform" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
    <div className="min-h-screen">
        <Navigation onOpenModal={handleOpenModal} />
      <main>
          <Hero onOpenModal={handleOpenModal} />
        <AIPlanner />
          <FeaturedTours onOpenModal={handleOpenModal} />
        <TopDestinations />
          <HomeCTA onOpenModal={handleOpenModal} />
      </main>
        
        {/* Shared SmartTourFinder Modal */}
        <SmartTourFinder 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
        />
        
      <Footer />
    </div>
    </>
  );
};

export default Home;