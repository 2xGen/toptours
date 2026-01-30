'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Anchor, MapPin, Clock, Users, DollarSign, Calendar, 
  Camera, Shirt, Sun, Waves, Heart, Star, ArrowRight,
  BookOpen, ChevronRight, Home, GlassWater, Music, Sailboat, Ship, PartyPopper, HeartHandshake, X, ExternalLink, Search, UtensilsCrossed, Car, Building2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import DestinationStickyNav from '@/components/DestinationStickyNav';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { getTourUrl, getTourProductId } from '@/utils/tourHelpers';
import TourCard from '@/components/tour/TourCard';
import { 
  calculateTourProfile,
  getUserPreferenceScores,
  calculateMatchScore, 
  getDefaultPreferences 
} from '@/lib/tourMatching';
import { calculateEnhancedMatchScore } from '@/lib/tourMatchingEnhanced';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { destinations } from '../../../../../src/data/destinationsData';
import { travelGuides } from '../../../../../src/data/travelGuidesData';
import { getRestaurantsForDestination } from '../../restaurants/restaurantsData';

const AIRPORT_TRANSFERS_OG_IMAGE = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/airport%20transfers.png';
const DISCOVER_CARS_URL = 'https://www.discovercars.com/?a_aid=toptours&a_cid=65100b9c';

export default function CategoryGuideClient({ destinationId, categorySlug, guideData, categoryTours = [], promotionScores = {}, availableGuideSlugs = [], allAvailableGuides = [], destination: destinationProp, destinationFeatures = { hasRestaurants: false, hasBabyEquipment: false, hasAirportTransfers: false } }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showStickyButton, setShowStickyButton] = React.useState(true);
  const supabase = createSupabaseBrowserClient();

  // Hero image: prefer guide/destination; for airport-transfers with no image, use dedicated OG image
  const heroImageUrl = guideData?.heroImage || destinationProp?.imageUrl
    || (categorySlug === 'airport-transfers' ? AIRPORT_TRANSFERS_OG_IMAGE : null);
  
  // Calculate stats from actual tours for hero display
  const heroStats = React.useMemo(() => {
    const tourCount = categoryTours?.length || 0;
    const prices = categoryTours
      .map(t => parseFloat(t.pricing?.summary?.fromPrice || t.pricing?.fromPrice || t.price || 0))
      .filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    return { tourCount, minPrice };
  }, [categoryTours]);
  
  // User preferences for matching
  const [user, setUser] = React.useState(null);
  const [userPreferences, setUserPreferences] = React.useState(null);
  const [matchScores, setMatchScores] = React.useState({}); // Map of productId -> match score
  const [loadingPreferences, setLoadingPreferences] = React.useState(true);
  const [showPreferencesModal, setShowPreferencesModal] = React.useState(false);
  
  // Lightweight localStorage preferences (works for everyone, no sign-in required)
  const [localPreferences, setLocalPreferences] = React.useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('topTours_preferences');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading localStorage preferences:', e);
    }
    // Default balanced preferences
    return {
      adventureLevel: 50,
      cultureVsBeach: 50,
      groupPreference: 50,
      budgetComfort: 50,
      structurePreference: 50,
      foodAndDrinkInterest: 50,
    };
  });
  
  // Save to localStorage when preferences change
  React.useEffect(() => {
    if (localPreferences && typeof window !== 'undefined') {
      try {
        localStorage.setItem('topTours_preferences', JSON.stringify(localPreferences));
      } catch (e) {
        console.error('Error saving localStorage preferences:', e);
      }
    }
  }, [localPreferences]);
  
  // Fetch user and preferences for matching
  React.useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);
        
        if (authUser) {
          // Fetch user preferences
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('trip_preferences')
            .eq('id', authUser.id)
            .single();
          
          if (!error && profile?.trip_preferences) {
            setUserPreferences(profile.trip_preferences);
          }
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setLoadingPreferences(false);
      }
    };
    
    fetchUserPreferences();
  }, [supabase]);
  
  // Calculate match scores for tours
  React.useEffect(() => {
    if (loadingPreferences || categoryTours.length === 0) {
      if (categoryTours.length === 0) {
        setMatchScores({});
      }
      return;
    }
    
    const calculateMatches = async () => {
      // Get raw preferences (before processing) for enhanced matching
      // Pass raw preferences - calculateEnhancedMatchScore converts them internally
      // If no preferences, pass null and it will default to balanced (50) for all dimensions
      const rawPreferences = user && userPreferences && Object.keys(userPreferences).length >= 5
        ? userPreferences
        : localPreferences
        ? localPreferences
        : null;
      
      // Use profile preferences if logged in and set, otherwise use localStorage preferences
      const preferences = getUserPreferenceScores(rawPreferences);
      
      // Calculate default match for tours without tags (use legacy for fallback)
      const defaultProfile = await calculateTourProfile([]);
      const defaultScores = preferences;
      const defaultMatch = calculateMatchScore(defaultProfile, defaultScores);
      defaultMatch.tourProfile = defaultProfile;
      
      const scores = {};
      
      // Calculate match scores for each tour
      for (const tour of categoryTours) {
        const productId = tour.productId || tour.productCode;
        if (!productId) continue;
        
        try {
          // Tags can be in different locations in Viator API response
          const tags = Array.isArray(tour.tags) ? tour.tags : 
                      Array.isArray(tour.productTags) ? tour.productTags :
                      Array.isArray(tour.tagIds) ? tour.tagIds : [];
          const tourProfile = await calculateTourProfile(tags);
          // Use enhanced matching with full tour object (needs raw preferences)
          const matchResult = await calculateEnhancedMatchScore(tour, rawPreferences, tourProfile);
          // matchResult.tourProfile is already set to the adjusted profile
          scores[productId] = matchResult;
        } catch (error) {
          // Fallback to default match if calculation fails
          scores[productId] = { ...defaultMatch };
        }
      }
      
      setMatchScores(scores);
    };
    
    calculateMatches();
  }, [categoryTours, user, userPreferences, localPreferences, loadingPreferences]);
  
  // Use destination from props if provided, otherwise try to find in destinationsData.js
  // The server component should ALWAYS pass destination, so this is just a safety fallback
  let destination = destinationProp || destinations.find(d => d.id === destinationId);
  
  // Debug logging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('CategoryGuideClient - destination:', {
      hasDestination: !!destination,
      hasDestinationProp: !!destinationProp,
      destinationPropKeys: destinationProp ? Object.keys(destinationProp) : [],
      destinationId,
      destinationName: destination?.name,
    });
  }
  
  // If no destination, create a minimal one from guide data as absolute last resort
  if (!destination) {
    console.error('CategoryGuideClient - No destination found for:', destinationId);
    console.error('This should not happen - server component should always pass destination');
    
    // Create minimal destination from guide data if available
    if (guideData && guideData.categoryName) {
      const destinationName = guideData.categoryName.split(' ')[0] || destinationId;
      destination = {
        id: destinationId,
        name: destinationName,
        fullName: destinationName,
        imageUrl: guideData.heroImage || null,
        country: null,
        category: null,
        tourCategories: [],
        bestTimeToVisit: null,
        gettingAround: null,
        whyVisit: [],
        highlights: [],
      };
      console.warn('Using minimal destination created from guide data');
    } else {
      return <div>Destination not found</div>;
    }
  }

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Icon mapping
  const iconMap = {
    Sun, Waves, Heart, Users, Camera, GlassWater, Music, Star, 
    Clock, MapPin, DollarSign, Calendar, Anchor, Shirt, BookOpen,
    Sailboat, Ship, PartyPopper, HeartHandshake
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true }
  };

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <div className="p-6">
              <SmartTourFinder />
            </div>
          </div>
        </div>
      )}
      
      <div className="min-h-screen pt-16 overflow-x-hidden">
      {/* Hero Section - Enhanced Compact Layout */}
      <section className="relative py-10 sm:py-12 md:py-16 overflow-hidden ocean-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {heroImageUrl ? (
            // Hero with image - side by side layout
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center mb-3">
                  <MapPin className="w-4 h-4 text-blue-300 mr-2" />
                  <span className="text-white/90 text-sm font-medium">{destination.name}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold mb-3 text-white leading-tight">
                  {guideData.title}
                </h1>
                <p className="text-base sm:text-lg text-white/90 mb-4 leading-relaxed">
                  {guideData.subtitle}
                </p>
                
                {/* Quick Stats - Compact */}
                {heroStats.tourCount > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
                      <Star className="w-4 h-4 text-white" />
                      <span className="text-white font-medium">{heroStats.tourCount}+ tours</span>
                    </div>
                    {heroStats.minPrice > 0 && (
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
                        <DollarSign className="w-4 h-4 text-white" />
                        <span className="text-white font-medium">From ${Math.round(heroStats.minPrice)}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl w-full h-64 sm:h-80">
                  <Image
                    src={heroImageUrl}
                    alt={`${guideData.categoryName || guideData.title} in ${destination.name} - ${guideData.subtitle || 'Book tours and activities'}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          ) : (
            // Hero without image - centered compact layout
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-center mb-3">
                <MapPin className="w-4 h-4 text-blue-300 mr-2" />
                <span className="text-white/90 text-sm font-medium">{destination.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold mb-3 text-white leading-tight">
                {guideData.title}
              </h1>
              <p className="text-base sm:text-lg text-white/90 mb-4 leading-relaxed">
                {guideData.subtitle}
              </p>
              
              {/* Quick Stats - Centered Compact */}
              {heroStats.tourCount > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
                    <Star className="w-4 h-4 text-white" />
                    <span className="text-white font-medium">{heroStats.tourCount}+ tours</span>
                  </div>
                  {heroStats.minPrice > 0 && (
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
                      <DollarSign className="w-4 h-4 text-white" />
                      <span className="text-white font-medium">From ${Math.round(heroStats.minPrice)}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/destinations" className="text-gray-500 hover:text-gray-700">Destinations</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/destinations/${destinationId}`} className="text-gray-500 hover:text-gray-700">{destination.name}</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{guideData.categoryName}</span>
          </nav>
        </div>
      </section>

      {/* Destination Sticky Navigation - Tours link is destination-specific */}
      <DestinationStickyNav
        destinationId={destinationId}
        destinationName={destination.fullName || destination.name}
        toursLinkText={`View all tours in ${destination.fullName || destination.name}`}
        hasRestaurants={destinationFeatures.hasRestaurants}
        hasAirportTransfers={destinationFeatures.hasAirportTransfers}
        hasBabyEquipment={destinationFeatures.hasBabyEquipment}
      />

      {/* Introduction Section with Background */}
      <section className="py-12 sm:py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Link Back to Destination */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Link href={`/destinations/${destinationId}`}>
              <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
                <div className="relative p-6 md:p-8 flex items-center gap-6">
                  {destination?.imageUrl && destination.imageUrl.trim() !== '' && (
                    <div className="hidden md:block relative w-20 h-20 rounded-xl overflow-hidden ring-4 ring-white/30 flex-shrink-0">
                      <Image
                        src={destination.imageUrl}
                        alt={destination.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-blue-100 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Planning your {destination.name} trip?</span>
                    </div>
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
                      Explore All {destination.name} Tours & Activities
                    </h3>
                    <p className="text-white/80">Complete destination guide with {destination.tourCategories?.length || 6} activity categories</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Introduction */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                {guideData.introduction}
              </p>
            </div>
          </motion.div>

          {/* CTA to destination tours (no server-side Viator on guide pages - saves cost) */}
          {(!categoryTours || categoryTours.length === 0) && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white">
                <CardContent className="p-8 sm:p-10 text-center relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden />
                  <div className="relative">
                    {guideData.categoryName && (
                      <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium text-white/95 mb-5">
                        {guideData.categoryName}
                      </span>
                    )}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold mb-4 tracking-tight">
                      Browse {guideData.categoryName ? `${guideData.categoryName.toLowerCase()} and all tours` : 'all tours'} in {destination.fullName || destination.name}
                    </h2>
                    <p className="text-blue-100/95 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                      See tours and activities for {destination.fullName || destination.name} with instant booking and best price guarantee.
                    </p>
                    <Link href={`/destinations/${destinationId}/tours`}>
                      <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-base sm:text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                        View all tours in {destination.fullName || destination.name}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Why Choose Section - Only show if there's content */}
      {guideData.whyChoose && Array.isArray(guideData.whyChoose) && guideData.whyChoose.length > 0 && (
      <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
              Why Choose {guideData.categoryName} in {destination.name}?
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {guideData.whyChoose.map((reason, index) => {
              // Handle both string format and object format
              const isString = typeof reason === 'string';
              const reasonTitle = isString ? reason : reason.title;
              const reasonDescription = isString ? null : reason.description;
              const reasonIcon = isString ? 'Star' : reason.icon;
              const IconComponent = iconMap[reasonIcon];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          {IconComponent && <IconComponent className="w-6 h-6 text-blue-600" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{reasonTitle}</h3>
                          {reasonDescription && <p className="text-gray-600">{reasonDescription}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Types of Tours - Only show if there's content */}
      {guideData.tourTypes && Array.isArray(guideData.tourTypes) && guideData.tourTypes.length > 0 && (
      <section className="py-12 sm:py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
              Types of {guideData.categoryName} in {destination.name}
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {guideData.tourTypes.map((type, index) => {
              const IconComponent = iconMap[type.icon] || Star;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white border-0 shadow-lg h-full hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-4">
                        <IconComponent className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{type.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{type.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {type.features.map((feature, idx) => (
                          <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Mid-page CTA */}
          {guideData.tourTypes && guideData.tourTypes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link href={`/destinations/${destinationId}/tours`}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                View All Tours & Activities
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
          )}
        </div>
      </section>
      )}

      {/* What to Expect */}
      <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {guideData.whatToExpect?.title || `What to Expect on Your ${destination.name} ${guideData.categoryName}`}
          </h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  // Safely get items array - handle both object.items and direct array
                  let items = [];
                  if (guideData.whatToExpect) {
                    if (Array.isArray(guideData.whatToExpect)) {
                      items = guideData.whatToExpect;
                    } else if (Array.isArray(guideData.whatToExpect.items)) {
                      items = guideData.whatToExpect.items;
                    }
                  }
                  return items;
                })().map((item, index) => {
                  const IconComponent = iconMap[item.icon];
                  return (
                    <div key={index} className="flex items-start gap-3">
                      {IconComponent && <IconComponent className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12 sm:py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-8 text-center">
            Expert Tips for the Best Experience
          </h2>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(guideData.expertTips || guideData.tips || []).map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <span className="text-amber-600 font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-gray-700">{typeof tip === 'string' ? tip : tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        </div>
      </section>

      {/* FAQs - Matching travel-guides style */}
      <section className="py-12 sm:py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6 max-w-4xl mx-auto">
              {guideData.faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start">
                    <span className="text-blue-600 mr-3">Q:</span>
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 ml-8 leading-relaxed">
                    <span className="font-semibold text-green-600">A:</span> {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 border-none text-white overflow-hidden shadow-2xl">
            <CardContent className="p-10 sm:p-14 text-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" aria-hidden />
              <div className="relative">
                {guideData.categoryName && (
                  <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-3">
                    {guideData.categoryName}
                  </p>
                )}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold mb-4">
                  Don't miss the perfect {guideData.categoryName ? `${guideData.categoryName.toLowerCase()} experience in` : 'experience in'} {destination.fullName || destination.name}
                </h2>
                <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                  Instant confirmation & best price guarantee when you book through TopTours.ai.
                </p>
                <Link href={`/destinations/${destinationId}/tours`}>
                  <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-lg px-10 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    View all tours in {destination.fullName || destination.name}
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </section>

      {/* Related Travel Guides Section - Same style as restaurant page */}
      {(() => {
        // Use allAvailableGuides (from database + hardcoded) and exclude current category
        const availableGuides = (allAvailableGuides || [])
          .filter(guide => guide.category_slug !== categorySlug)
          .slice(0, 6);
        
        // Only show section if there are available guides
        return availableGuides.length > 0 ? (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900">
                    Related Travel Guides for {destination.name}
                </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Explore comprehensive guides to plan your perfect trip, including food tours, cultural experiences, and more.
                </p>
                
                {/* All category guides in a grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {availableGuides.map((guide) => {
                    const categoryName = guide.category_name || guide.title || '';
                    const categorySlug = guide.category_slug || '';
                    const guideUrl = `/destinations/${destinationId}/guides/${categorySlug}`;
                    
                    // Determine icon based on category name
                    const isFoodRelated = categoryName.toLowerCase().includes('food') || 
                                        categoryName.toLowerCase().includes('culinary') || 
                                        categoryName.toLowerCase().includes('tapas') || 
                                        categoryName.toLowerCase().includes('tasting') ||
                                        categoryName.toLowerCase().includes('restaurant');
                    const Icon = isFoodRelated ? UtensilsCrossed : MapPin;
                    const iconColor = isFoodRelated ? 'text-orange-600' : 'text-blue-600';
                    
                  return (
                      <Link
                        key={categorySlug}
                        href={guideUrl}
                        className="group"
                      >
                        <Card className="h-full border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                              <Icon className={`w-5 h-5 ${iconColor}`} />
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {guide.title || categoryName}
                            </h3>
                            </div>
                            {guide.subtitle && (
                              <p className="text-sm text-gray-600 mb-3">
                                {guide.subtitle}
                              </p>
                            )}
                            {!guide.subtitle && (
                              <p className="text-sm text-gray-600 mb-3">
                                {isFoodRelated 
                                  ? `Discover the best ${categoryName.toLowerCase()} experiences in ${destination.name}.`
                                  : `Explore ${categoryName.toLowerCase()} in ${destination.name}.`
                                }
                              </p>
                            )}
                            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                              Read Guide
                              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                  );
                })}
              </div>
                
                <div className="text-center">
                  <Button asChild variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <Link href={`/destinations/${destinationId}`}>
                      View All {destination.name} Guides
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        ) : null;
      })()}

      {/* Getting Around – car rental banner */}
      {destination.gettingAround && (
        <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white border-2 border-blue-200 shadow-lg">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                    <div className="flex-1 w-full md:w-auto">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Car className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Getting Around {destination.name}</h3>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                        Save up to 70% on car rentals in {destination.name} when you compare and book in advance.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs sm:text-sm">Clear prices, no surprises</Badge>
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-xs sm:text-sm">24/7 Support</Badge>
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs sm:text-sm">Free Cancellation</Badge>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 w-full md:w-auto md:px-8 px-4 py-4 sm:py-6 text-sm sm:text-base md:text-lg font-semibold shrink-0"
                      onClick={() => window.open(DISCOVER_CARS_URL, '_blank')}
                    >
                      <span className="hidden sm:inline">Find Car Rental Deals</span>
                      <span className="sm:hidden">Find Car Rentals</span>
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA to Explore Destination */}
      <section className="py-16 adventure-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Explore {destination.name}?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Discover the best tours and activities in {destination.name} with AI-powered recommendations tailored just for you.
            </p>
            <Link href={`/destinations/${destinationId}`}>
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold"
              >
                Start Planning Your {destination.name} Trip
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Top Restaurants Section */}
      {(() => {
        const restaurants = getRestaurantsForDestination(destinationId);
        const hasRestaurants = restaurants && restaurants.length > 0;
        
        if (!hasRestaurants) return null;
        
        const restaurantsToDisplay = restaurants.slice(0, 8);
        
        return (
          <section className="py-12 bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Top Restaurants in {destination.fullName || destination.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Discover the best dining experiences and hand-picked restaurants.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurantsToDisplay.map((restaurant, index) => {
                      const restaurantUrl = `/destinations/${destinationId}/restaurants/${restaurant.slug}`;
                      const description = restaurant.metaDescription 
                        || restaurant.tagline 
                        || restaurant.summary 
                        || restaurant.description
                        || (restaurant.cuisines?.length > 0 
                            ? `Discover ${restaurant.cuisines.join(' & ')} cuisine at ${restaurant.name} in ${destination.fullName || destination.name}.`
                            : `Experience great dining at ${restaurant.name} in ${destination.fullName || destination.name}.`);
                      
                      return (
                        <motion.div
                          key={restaurant.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <Card className="h-full border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6 flex flex-col h-full">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                                  <UtensilsCrossed className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-lg font-bold text-gray-900 line-clamp-1">
                                    {restaurant.name}
                                  </h4>
                                  {restaurant.cuisines?.length > 0 && (
                                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                      {restaurant.cuisines[0]}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                                {description.length > 120 ? description.slice(0, 120) + '...' : description}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {restaurant.ratings?.googleRating && (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full">
                                    <Star className="w-3 h-3" />
                                    {restaurant.ratings.googleRating.toFixed(1)}
                                  </span>
                                )}
                                {restaurant.pricing?.priceRange && (
                                  <span className="inline-flex items-center text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                                    {restaurant.pricing.priceRange}
                                  </span>
                                )}
                              </div>
                              <Link
                                href={restaurantUrl}
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mt-auto"
                              >
                                View Restaurant
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                    {/* View All Restaurants Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={`/destinations/${destinationId}/restaurants`}
                        className="block h-full"
                      >
                        <Card className="h-full border border-blue-100 bg-white shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center p-6">
                          <UtensilsCrossed className="w-8 h-8 text-blue-600 mb-3" />
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            View All Restaurants in {destination.fullName || destination.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Explore every curated dining spot we recommend across the island.
                          </p>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                            Browse the list
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </Card>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Other Featured Destinations in the Region - Purple Background */}
      <section className="py-12 px-4" style={{ backgroundColor: '#764ba2' }}>
        <div className="max-w-7xl mx-auto">
          {/* Regional Destinations */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-6">
              More {destination.category} Destinations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {destinations
                .filter(d => d.category === destination.category && d.id !== destinationId)
                .slice(0, 20)
                .map((dest) => (
                  <Link 
                    key={dest.id}
                    href={`/destinations/${dest.id}`}
                    className="text-white/80 hover:text-white transition-colors duration-200 hover:underline"
                  >
                    {dest.name}
                  </Link>
                ))}
            </div>
          </div>

          {/* Regional Travel Guides - Dynamically loaded */}
          {(() => {
            // Filter travel guides by destination category
            const categoryGuides = travelGuides.filter(guide => 
              guide.category === destination.category || 
              (guide.relatedDestinations && guide.relatedDestinations.includes(destinationId))
            );
            
            return categoryGuides.length > 0 ? (
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 text-center">
                  {destination.category} Travel Guides
                </h3>
                <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
                  {categoryGuides.map((guide) => (
                    <Link 
                      key={guide.id}
                      href={`/travel-guides/${guide.id}`}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-5 py-4 transition-all duration-200 hover:scale-105 w-full max-w-xs"
                    >
                      <div className="text-white hover:text-blue-200 font-medium line-clamp-2 h-12 flex items-center">
                        {guide.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      </section>
    </div>
    
    {/* Sticky Floating Button */}
    {showStickyButton && (
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 transition-opacity duration-300">
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => setShowStickyButton(false)}
            className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-xl border-2 border-gray-300 transition-all duration-200 hover:scale-110"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-900 stroke-2" />
          </button>
          <Link href={`/destinations/${destinationId}/tours`}>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-4 py-4 md:px-6 md:py-6 rounded-full font-semibold text-sm md:text-base"
            >
              <span>View All Tours In {destination.name}</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    )}
    
    <FooterNext />
    </>
  );
}

