"use client";
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import Home from '@/pages-backup/Home';
import HowItWorks from '@/pages-backup/HowItWorks';
import Destinations from '@/pages-backup/Destinations';
import TravelTips from '@/pages-backup/TravelTips';
import BlogPost from '@/pages-backup/BlogPost';
import About from '@/pages-backup/About';
import Disclosure from '@/pages-backup/Disclosure';
import TermsOfService from '@/pages-backup/TermsOfService';
import Contact from '@/pages-backup/Contact';
// import BlogPage from '@/pages-backup/Blog';
import Results from '@/pages-backup/Results';
import AdminData from '@/pages-backup/AdminData';
import DestinationDetail from '@/pages-backup/DestinationDetail';
import NotFound from '@/pages-backup/NotFound';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preFilledDestination, setPreFilledDestination] = useState('');

  const handleOpenModal = (destination = '') => {
    setPreFilledDestination(destination);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <Router>
      <ScrollToTop />
      <Helmet>
        <title>TopTours.ai - AI-Powered Travel Planning Platform</title>
        <meta name="description" content="Discover and book the best tours and activities worldwide with AI-powered recommendations. Smart travel planning made easy with personalized tour suggestions." />
        <meta name="keywords" content="TopTours.ai, AI travel planning, tour booking, travel recommendations, smart travel, personalized tours, travel technology" />
        <meta name="author" content="TopTours.ai" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNmOTczMWIiLz4KPHBhdGggZD0iTTEyIDZMMTMuMDkgMTAuMjZMMTggMTFMMTMuMDkgMTEuNzRMMTIgMTZMMTAuOTEgMTEuNzRMMTYgMTFMMTAuOTEgMTAuMjZMMTIgNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" />
        
        {/* Open Graph - Global */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TopTours.ai" />
        <meta property="og:image" content="https://toptours.ai/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card - Global */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@toptours_ai" />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#1d4bf8" />
        <meta name="msapplication-TileColor" content="#1d4bf8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TopTours.ai" />
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "TopTours.ai",
            "url": "https://toptours.ai",
            "logo": "https://toptours.ai/logo.png",
            "description": "AI-powered travel platform that provides personalized tour and activity recommendations worldwide.",
            "foundingDate": "2024",
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "email@toptours.ai",
              "contactType": "customer service"
            },
            "sameAs": [
              "https://www.facebook.com/profile.php?id=61573639234569",
              "https://www.instagram.com/toptours.ai/",
              "https://www.tiktok.com/@toptours.ai"
            ]
          })}
        </script>
      </Helmet>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks onOpenModal={handleOpenModal} />} />
          <Route path="/destinations" element={<Destinations onOpenModal={handleOpenModal} />} />
          <Route path="/travel-guides" element={<TravelTips onOpenModal={handleOpenModal} />} />
          <Route path="/travel-guides/:slug" element={<BlogPost onOpenModal={handleOpenModal} />} />
          <Route path="/destinations/:destinationId" element={<DestinationDetail onOpenModal={handleOpenModal} />} />
          <Route path="/:destinationId" element={<DestinationDetail onOpenModal={handleOpenModal} />} />
          <Route path="/about" element={<About onOpenModal={handleOpenModal} />} />
          <Route path="/disclosure" element={<Disclosure />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact onOpenModal={handleOpenModal} />} />
          {/* <Route path="/blog" element={<BlogPage onOpenModal={handleOpenModal} />} /> */}
          <Route path="/results" element={<Results />} />
          <Route path="/matthijs/data" element={<AdminData />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Shared SmartTourFinder Modal */}
        <SmartTourFinder 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          preFilledDestination={preFilledDestination}
        />
        
        <Toaster />
      </div>
    </Router>
  );
}

export default App;