"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { destinations } from '@/data/destinationsData';

const PopularDestinations = () => {
  // Get destinations by region from actual data
  const getDestinationsByRegion = () => {
    const regions = ['Caribbean', 'Europe', 'Asia-Pacific', 'North America', 'South America', 'Middle East', 'Africa'];
    const result = {};
    
    regions.forEach(region => {
      const regionDests = destinations
        .filter(dest => dest.category === region);
      
      if (regionDests.length > 0) {
        result[region] = regionDests;
      }
    });
    
    return result;
  };

  const destinationsByRegion = getDestinationsByRegion();

  // Helper to truncate destination name if too long
  const truncateDestinationName = (name) => {
    if (!name) return '';
    if (name.length > 20) {
      return name.substring(0, 20) + '...';
    }
    return name;
  };

  return (
    <>
      {/* Popular Destinations by Region Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-900 mb-4">
              Popular Destinations by Region
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover top-rated tours and restaurants in the world's most popular destinations
            </p>
          </motion.div>

          {Object.entries(destinationsByRegion).map(([region, regionDestinations], regionIndex) => {
            const RegionCarousel = () => {
              const [currentIndex, setCurrentIndex] = useState(0);
              const [touchStart, setTouchStart] = useState(null);
              const [touchEnd, setTouchEnd] = useState(null);
              
              // Responsive cards per view
              const getCardsPerView = () => {
                if (typeof window !== 'undefined') {
                  if (window.innerWidth >= 1024) return 3; // lg
                  if (window.innerWidth >= 640) return 2; // sm
                  return 1; // mobile
                }
                return 3; // default
              };

              const [cardsPerView, setCardsPerView] = useState(3);
              
              useEffect(() => {
                const updateCardsPerView = () => {
                  setCardsPerView(getCardsPerView());
                };
                
                updateCardsPerView();
                window.addEventListener('resize', updateCardsPerView);
                return () => window.removeEventListener('resize', updateCardsPerView);
              }, []);

              const maxIndex = Math.max(0, regionDestinations.length - cardsPerView);

              const goToPrevious = () => {
                setCurrentIndex((prev) => Math.max(0, prev - 1));
              };

              const goToNext = () => {
                setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
              };

              // Swipe handlers for mobile
              const minSwipeDistance = 50;

              const onTouchStart = (e) => {
                setTouchEnd(null);
                setTouchStart(e.targetTouches[0].clientX);
              };

              const onTouchMove = (e) => {
                setTouchEnd(e.targetTouches[0].clientX);
              };

              const onTouchEnd = () => {
                if (!touchStart || !touchEnd) return;
                const distance = touchStart - touchEnd;
                const isLeftSwipe = distance > minSwipeDistance;
                const isRightSwipe = distance < -minSwipeDistance;

                if (isLeftSwipe && currentIndex < maxIndex) {
                  goToNext();
                }
                if (isRightSwipe && currentIndex > 0) {
                  goToPrevious();
                }
              };

              return (
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{region}</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
                  </div>

                  <div className="relative">
                    {/* Desktop/Tablet Navigation Buttons */}
                    {cardsPerView > 1 && regionDestinations.length > cardsPerView && (
                      <>
                        <button
                          onClick={goToPrevious}
                          disabled={currentIndex === 0}
                          className={`absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all ${
                            currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:shadow-xl'
                          } hidden sm:flex`}
                          aria-label="Previous destinations"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={goToNext}
                          disabled={currentIndex >= maxIndex}
                          className={`absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all ${
                            currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:shadow-xl'
                          } hidden sm:flex`}
                          aria-label="Next destinations"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                      </>
                    )}

                    {/* Carousel Container */}
                    <div 
                      className="overflow-hidden px-4 sm:px-12 lg:px-14"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                    >
                      <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                          gap: cardsPerView === 1 ? '0rem' : cardsPerView === 2 ? '1.5rem' : '2rem',
                          transform: cardsPerView === 1 
                            ? `translateX(-${currentIndex * 100}%)`
                            : `translateX(calc(-${currentIndex * (100 / cardsPerView)}% - ${currentIndex * (cardsPerView === 2 ? 0.75 : 2)}rem))`,
                        }}
                      >
                        {regionDestinations.map((destination, index) => (
                          <motion.div
                            key={`${region}-${destination.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                            className="flex-shrink-0 cursor-pointer mb-6"
                            style={{
                              width: cardsPerView === 1 
                                ? '100%' 
                                : cardsPerView === 2 
                                  ? 'calc(50% - 0.75rem)' 
                                  : 'calc(33.333% - 1.33rem)',
                              minWidth: cardsPerView === 1 ? '100%' : undefined,
                            }}
                            onClick={() => window.location.href = `/destinations/${destination.id}`}
                          >
                            <Card className="bg-white border-0 shadow-xl overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-300 rounded-lg">
                              {destination.imageUrl && (
                                <div className="relative h-48 overflow-hidden">
                                  <Image
                                    src={destination.imageUrl}
                                    alt={destination.fullName || destination.name}
                                    fill
                                    className="object-cover transition-transform duration-300 hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    loading="lazy"
                                  />
                                  {destination.category && (
                                    <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                                      {destination.category}
                                    </Badge>
                                  )}
                                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                                    <span className="text-sm font-medium text-gray-800">
                                      {destination.country || destination.fullName || destination.name}
                                    </span>
                                  </div>
                                </div>
                              )}
                              <CardContent className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center text-gray-600 mb-2">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span className="font-semibold">{destination.name}</span>
                                </div>
                                <p className="text-gray-700 mb-4 flex-grow">
                                  {destination.briefDescription}
                                </p>
                                
                                <div className="mt-auto pt-4 space-y-3">
                                  <Button
                                    asChild
                                    className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Link href={`/destinations/${destination.id}`}>
                                      Explore {truncateDestinationName(destination.name)}
                                      <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                  </Button>
                                  <Button
                                    asChild
                                    variant="secondary"
                                    className="w-full bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 hover:scale-105 transition-transform duration-200 h-12 text-base font-semibold"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Link href={`/destinations/${destination.id}/tours`}>
                                      View Top Tours in {truncateDestinationName(destination.name)}
                                      <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Navigation Buttons - Below cards */}
                    {cardsPerView === 1 && regionDestinations.length > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-3 sm:hidden px-2">
                        <button
                          onClick={goToPrevious}
                          disabled={currentIndex === 0}
                          className={`flex items-center justify-center bg-white rounded-full p-3 shadow-lg border border-gray-200 active:bg-gray-100 transition-all min-w-[48px] flex-shrink-0 ${
                            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
                          }`}
                          aria-label="Previous destinations"
                        >
                          <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        
                        {/* Dots Indicator - Show max 5 dots, centered around current */}
                        <div className="flex justify-center gap-1.5 flex-shrink min-w-0">
                          {(() => {
                            const maxDots = 5;
                            const total = regionDestinations.length;
                            let startIndex = Math.max(0, currentIndex - Math.floor(maxDots / 2));
                            let endIndex = Math.min(total, startIndex + maxDots);
                            
                            // Adjust if we're near the end
                            if (endIndex - startIndex < maxDots) {
                              startIndex = Math.max(0, endIndex - maxDots);
                            }
                            
                            const dotsToShow = [];
                            for (let i = startIndex; i < endIndex; i++) {
                              dotsToShow.push(i);
                            }
                            
                            return (
                              <>
                                {startIndex > 0 && (
                                  <span className="text-xs text-gray-400 px-0.5">...</span>
                                )}
                                {dotsToShow.map((index) => (
                                  <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-2 rounded-full transition-all flex-shrink-0 ${
                                      index === currentIndex 
                                        ? 'w-8 bg-purple-600' 
                                        : 'w-2 bg-gray-300'
                                    }`}
                                    aria-label={`Go to destination ${index + 1}`}
                                  />
                                ))}
                                {endIndex < total && (
                                  <span className="text-xs text-gray-400 px-0.5">...</span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        
                        <button
                          onClick={goToNext}
                          disabled={currentIndex >= maxIndex}
                          className={`flex items-center justify-center bg-white rounded-full p-3 shadow-lg border border-gray-200 active:bg-gray-100 transition-all min-w-[48px] flex-shrink-0 ${
                            currentIndex >= maxIndex ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
                          }`}
                          aria-label="Next destinations"
                        >
                          <ChevronRight className="w-6 h-6 text-gray-700" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            };

            return (
              <motion.div
                key={region}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: regionIndex * 0.1 }}
                viewport={{ once: true }}
                className="mb-20"
              >
                <RegionCarousel />
              </motion.div>
            );
          })}
        </div>
      </section>

    </>
  );
};

export default PopularDestinations;
