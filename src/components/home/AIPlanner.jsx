"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Globe, Heart, ArrowLeft, MapPin, Search, BookOpen, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { destinations } from '@/data/destinationsData';

// Module-level cache for category guides
let allCategoryGuidesCache = {};
let guidesLoadingPromise = null;

// Load category guides dynamically
const loadCategoryGuides = async () => {
  // Return cached data if available
  if (Object.keys(allCategoryGuidesCache).length > 0) {
    return allCategoryGuidesCache;
  }
  
  // Return existing promise if already loading
  if (guidesLoadingPromise) {
    return guidesLoadingPromise;
  }
  
  // Create new loading promise
  guidesLoadingPromise = (async () => {
    try {
      // Use dynamic imports with proper paths
      const baseModule = await import('../../../app/destinations/[id]/guides/guidesData');
      const northAmericaModule = await import('../../../app/destinations/[id]/guides/guidesData-north-america');
      const africaModule = await import('../../../app/destinations/[id]/guides/guidesData-africa');
      const southAmericaModule = await import('../../../app/destinations/[id]/guides/guidesData-south-america');
      const asiaPacific1Module = await import('../../../app/destinations/[id]/guides/guidesData-asia-pacific-part1');
      const asiaPacific2Module = await import('../../../app/destinations/[id]/guides/guidesData-asia-pacific-part2');
      
      allCategoryGuidesCache = {
        ...(baseModule.categoryGuides || {}),
        ...(northAmericaModule.categoryGuidesNorthAmerica || {}),
        ...(africaModule.categoryGuidesAfrica || {}),
        ...(southAmericaModule.categoryGuidesSouthAmerica || {}),
        ...(asiaPacific1Module.categoryGuidesAsiaPacificPart1 || {}),
        ...(asiaPacific2Module.categoryGuidesAsiaPacificPart2 || {}),
      };
      
      return allCategoryGuidesCache;
    } catch (error) {
      console.error('Error loading category guides:', error);
      // Fallback: return empty object if imports fail
      allCategoryGuidesCache = {};
      return allCategoryGuidesCache;
    } finally {
      guidesLoadingPromise = null;
    }
  })();
  
  return guidesLoadingPromise;
};

const DESTINATION_LOOKUP = destinations.map((destination) => ({
  id: destination.id,
  name: destination.name,
  fullName: destination.fullName || destination.name,
  country: destination.country || destination.category || '',
}));

// Helper function to convert category name to slug
const categoryNameToSlug = (categoryName) => {
  return categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const AIPlanner = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [query, setQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const filteredDestinations = useMemo(() => {
    if (!query.trim()) return [];
    const term = query.toLowerCase();
    return DESTINATION_LOOKUP.filter((destination) =>
      destination.name.toLowerCase().includes(term) ||
      destination.fullName.toLowerCase().includes(term) ||
      destination.country.toLowerCase().includes(term)
    ).slice(0, 6);
  }, [query]);

  const showSuggestions = isInputFocused && filteredDestinations.length > 0;
  const hasValidDestination = filteredDestinations.length > 0;

  const [categoryGuidesLoaded, setCategoryGuidesLoaded] = useState(false);
  const [isLoadingGuides, setIsLoadingGuides] = useState(false);

  // Pre-load category guides when component mounts (in background)
  useEffect(() => {
    if (!categoryGuidesLoaded && !isLoadingGuides) {
      setIsLoadingGuides(true);
      loadCategoryGuides().then(() => {
        setCategoryGuidesLoaded(true);
        setIsLoadingGuides(false);
      });
    }
  }, [categoryGuidesLoaded, isLoadingGuides]);

  // Also load when destination is selected (in case pre-load didn't finish)
  useEffect(() => {
    if (selectedDestination && !categoryGuidesLoaded && !isLoadingGuides) {
      setIsLoadingGuides(true);
      loadCategoryGuides().then(() => {
        setCategoryGuidesLoaded(true);
        setIsLoadingGuides(false);
      });
    }
  }, [selectedDestination, categoryGuidesLoaded, isLoadingGuides]);

  // Get category guides for selected destination
  const destinationCategoryGuides = useMemo(() => {
    if (!selectedDestination || !categoryGuidesLoaded) return [];
    
    const destination = destinations.find(d => d.id === selectedDestination.id);
    if (!destination) return [];

    const guides = [];
    
    // Get category guides that exist for this destination
    const destinationCategoryGuidesData = allCategoryGuidesCache[destination.id];
    if (!destinationCategoryGuidesData) return [];

    // Get all available category guides (up to 6)
    // First try to get from tourCategories, then get any remaining from all available guides
    const processedSlugs = new Set();
    
    // First, get guides from tourCategories
    if (destination.tourCategories) {
      destination.tourCategories.forEach((category) => {
        const categoryName = typeof category === 'string' ? category : category.name;
        const hasGuide = typeof category === 'object' ? category.hasGuide : true;
        
        if (hasGuide && guides.length < 6) {
          const categorySlug = categoryNameToSlug(categoryName);
          const guideData = destinationCategoryGuidesData[categorySlug];
          
          if (guideData && !processedSlugs.has(categorySlug)) {
            guides.push({
              id: categorySlug,
              title: guideData.title || categoryName,
              subtitle: guideData.subtitle || '',
              categoryName: guideData.categoryName || categoryName,
              heroImage: guideData.heroImage,
              destinationId: destination.id,
            });
            processedSlugs.add(categorySlug);
          }
        }
      });
    }

    // If we don't have 6 yet, get more from all available guides
    if (guides.length < 6) {
      Object.keys(destinationCategoryGuidesData).forEach((categorySlug) => {
        if (guides.length >= 6) return;
        
        if (!processedSlugs.has(categorySlug)) {
          const guideData = destinationCategoryGuidesData[categorySlug];
          if (guideData) {
            guides.push({
              id: categorySlug,
              title: guideData.title || guideData.categoryName || categorySlug,
              subtitle: guideData.subtitle || '',
              categoryName: guideData.categoryName || categorySlug,
              heroImage: guideData.heroImage,
              destinationId: destination.id,
            });
            processedSlugs.add(categorySlug);
          }
        }
      });
    }

    return guides.slice(0, 6);
  }, [selectedDestination, categoryGuidesLoaded]);

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    setQuery('');
    setIsInputFocused(false);
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(1);
      setSelectedDestination(null);
      setQuery('');
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    
    if (!hasValidDestination) return;

    if (filteredDestinations.length > 0) {
      handleDestinationSelect(filteredDestinations[0]);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex justify-center items-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-orange-500" />
            <span className="text-orange-600 font-semibold text-lg">EXPERT INSIGHTS</span>
            <FileText className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
            Discover Well-Researched Destination Guides
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Skip the endless research. Our team has created comprehensive, expert-curated guides for 170+ destinations worldwide. 
            Get insider tips, compare tour options, and find exactly what you're looking for—all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <span className="font-medium">170+ Destinations</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="font-medium">Expert-Curated Content</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Comprehensive Guides</span>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="light-glass-effect border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="!p-8">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Step {currentStep} of 2</span>
                  <span className="text-sm text-gray-600">{Math.round((currentStep / 2) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-orange-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 2) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-poppins text-gray-800 mb-2">
                        Choose Your Destination 🎯
                      </h3>
                      <p className="text-gray-600">
                        Select a destination to explore our expert-curated activity guides
                      </p>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder='Try "Aruba", "Lisbon", "Tokyo", "Bali"…'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setTimeout(() => setIsInputFocused(false), 120)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSearch();
                        }}
                        className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-lg"
                      />
                    </div>

                    {showSuggestions && (
                      <div className="border border-gray-200 rounded-2xl divide-y bg-white shadow-xl">
                        {filteredDestinations.map((destination) => (
                          <div
                            key={destination.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                          >
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleDestinationSelect(destination);
                              }}
                              className="flex items-center gap-3 text-left flex-1"
                            >
                              <div className="rounded-full bg-orange-50 text-orange-600 w-9 h-9 flex items-center justify-center">
                                <MapPin className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {destination.fullName}
                                </p>
                                {destination.country && (
                                  <p className="text-sm text-gray-500">{destination.country}</p>
                                )}
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button 
                      onClick={handleSearch}
                      disabled={!hasValidDestination}
                      className="w-full px-10 py-4 sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                ) : currentStep === 2 && selectedDestination ? (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-poppins text-gray-800 mb-2">
                        Expert Guides for {selectedDestination.fullName} 📚
                      </h3>
                      <p className="text-gray-600">
                        Comprehensive, well-researched guides to help you plan the perfect trip
                      </p>
                    </div>

                    {isLoadingGuides || !categoryGuidesLoaded ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                        <p className="text-gray-600">
                          Loading guides for {selectedDestination.fullName}...
                        </p>
                      </div>
                    ) : destinationCategoryGuides.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {destinationCategoryGuides.map((guide) => (
                          <Link
                            key={guide.id}
                            href={`/destinations/${guide.destinationId}/guides/${guide.id}`}
                            className="group"
                          >
                            <Card className="h-full hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-orange-300">
                              <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                                      {guide.title}
                                    </h4>
                                    {guide.subtitle && (
                                      <p className="text-sm text-gray-600 line-clamp-3">
                                        {guide.subtitle}
                                      </p>
                                    )}
                                  </div>
                                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                          No guides available for {selectedDestination.fullName} yet.
                        </p>
                        <Link href={`/destinations/${selectedDestination.id}`}>
                          <Button variant="outline" className="gap-2">
                            Explore {selectedDestination.fullName}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="border-gray-300 hover:border-orange-500"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      
                      {destinationCategoryGuides.length > 0 && (
                        <Link href={`/destinations/${selectedDestination.id}`}>
                          <Button className="px-10 py-4 sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 shadow-lg">
                            Explore {selectedDestination.fullName}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AIPlanner;
