'use client';

import React, { useState, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Clock, Calendar, Star, ArrowRight,
  BookOpen, UtensilsCrossed, X, Compass, Car, Baby, Building2
} from 'lucide-react';
import Link from 'next/link';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import DestinationStickyNav from '@/components/DestinationStickyNav';

const DISCOVER_CARS_URL = 'https://www.discovercars.com/?a_aid=toptours&a_cid=65100b9c';

const SmartTourFinder = dynamic(
  () => import('@/components/home/SmartTourFinder'),
  { ssr: false, loading: () => <div className="flex justify-center py-12"><span className="text-gray-500">Loading…</span></div> }
);

export default function GuidesListingClient({ destinationId, destination, guides = [], relatedTravelGuides = [], hasBabyEquipmentRentals = false, relatedDestinations = [], countryDestinations = [], destinationFeatures = { hasRestaurants: false, hasBabyEquipment: false, hasAirportTransfers: false } }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMoreCountryDestinations, setShowMoreCountryDestinations] = useState(12);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const destinationName = destination.fullName || destination.name;
  const hasImage = destination?.imageUrl?.trim?.();

  // Determine icon based on category name
  const getGuideIcon = (categoryName) => {
    const name = (categoryName || '').toLowerCase();
    if (name.includes('food') || name.includes('culinary') || name.includes('tapas') || name.includes('tasting') || name.includes('restaurant')) {
      return UtensilsCrossed;
    }
    return BookOpen;
  };

  const getIconColor = (categoryName) => {
    const name = (categoryName || '').toLowerCase();
    if (name.includes('food') || name.includes('culinary') || name.includes('tapas') || name.includes('tasting') || name.includes('restaurant')) {
      return 'text-orange-600';
    }
    return 'text-blue-600';
  };

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <SmartTourFinder />
            </div>
          </div>
        </div>
      )}
      
      <div className="min-h-screen pt-16 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative pt-4 pb-12 sm:pt-6 sm:pb-16 md:pt-8 md:pb-20 overflow-hidden ocean-gradient">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.15),transparent)] pointer-events-none" aria-hidden="true" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {hasImage ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="order-2 lg:order-1"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium">
                      <Compass className="w-3.5 h-3.5" />
                      Travel Guides
                    </span>
                    {(destination.category || destination.country) && (
                      <span className="inline-flex items-center gap-1.5 text-white/80 text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        {destination.category || destination.country}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-white mb-4 leading-tight">
                    {destinationName} Travel Guides
                  </h1>
                  <p className="text-base sm:text-lg text-white/90 mb-6 leading-relaxed">
                    {destination.heroDescription || destination.briefDescription || `Discover comprehensive travel guides to help you plan the perfect trip to ${destinationName}.`}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="sunset-gradient text-white font-semibold px-5 py-2.5 hover:scale-[1.02] transition-transform shadow-lg">
                      <Link href={`/destinations/${destinationId}/tours`}>
                        Explore Tours
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold px-5 py-2.5">
                      <Link href={`/destinations/${destinationId}`}>
                        Destination Hub
                        <MapPin className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative order-1 lg:order-2"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 h-56 sm:h-72 w-full">
                    <Image
                      src={destination.imageUrl}
                      alt={`${destinationName} – travel guides`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" aria-hidden="true" />
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium mb-4">
                  <Compass className="w-3.5 h-3.5" />
                  Travel Guides
                  {(destination.category || destination.country) && (
                    <>
                      <span className="text-white/60">·</span>
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{destination.category || destination.country}</span>
                    </>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-white mb-4 leading-tight">
                  {destinationName} Travel Guides
                </h1>
                <p className="text-base sm:text-lg text-white/90 mb-6 leading-relaxed max-w-2xl mx-auto">
                  {destination.heroDescription || destination.briefDescription || `Discover comprehensive travel guides to help you plan the perfect trip to ${destinationName}.`}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild className="sunset-gradient text-white font-semibold px-5 py-2.5 hover:scale-[1.02] transition-transform shadow-lg">
                    <Link href={`/destinations/${destinationId}/tours`}>
                      Explore Tours
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold px-5 py-2.5">
                    <Link href={`/destinations/${destinationId}`}>
                      Destination Hub
                      <MapPin className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-800 transition-colors">Home</Link>
              <span className="text-gray-300">/</span>
              <Link href="/destinations" className="hover:text-gray-800 transition-colors">Destinations</Link>
              <span className="text-gray-300">/</span>
              <Link href={`/destinations/${destinationId}`} className="hover:text-gray-800 transition-colors">{destinationName}</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">Travel Guides</span>
            </nav>
          </div>
        </section>

        {/* Destination Sticky Navigation */}
        <DestinationStickyNav
          destinationId={destinationId}
          destinationName={destinationName}
          hasRestaurants={destinationFeatures.hasRestaurants}
          hasAirportTransfers={destinationFeatures.hasAirportTransfers}
          hasBabyEquipment={destinationFeatures.hasBabyEquipment}
        />

        {/* Introduction + Guides */}
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto mb-14 text-center"
            >
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                {destination.briefDescription || destination.heroDescription || `Welcome to our collection of travel guides for ${destinationName}. These guides will help you discover the best tours, activities, restaurants, and insider tips for your trip.`}
              </p>
            </motion.div>

            {/* All Travel Guides Grid */}
            {guides && guides.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-poppins font-bold text-gray-900">
                      Category Guides
                    </h2>
                    <p className="text-gray-500 text-sm sm:text-base">
                      {guides.length} guide{guides.length !== 1 ? 's' : ''} · tours, activities & local tips
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {guides.map((guide, index) => {
                    const categoryName = guide.category_name || guide.title || '';
                    const categorySlug = guide.category_slug || '';
                    const guideUrl = `/destinations/${destinationId}/guides/${categorySlug}`;
                    const Icon = getGuideIcon(categoryName);
                    const iconColor = getIconColor(categoryName);
                    const introduction = guide.introduction || guide.subtitle || `Discover the best ${categoryName.toLowerCase()} experiences in ${destinationName}.`;
                    
                    return (
                      <motion.div
                        key={categorySlug || index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
                        viewport={{ once: true }}
                      >
                        <Link href={guideUrl} className="group block h-full">
                          <Card className="h-full overflow-hidden border border-gray-200/80 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200/60 transition-all duration-300 hover:-translate-y-0.5">
                            <CardContent className="p-5 sm:p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100 ${iconColor}`}>
                                  <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {guide.title || categoryName}
                                </h3>
                              </div>
                              {guide.subtitle && (
                                <p className="text-sm text-gray-600 font-medium mb-2 line-clamp-1">
                                  {guide.subtitle}
                                </p>
                              )}
                              <p className="text-gray-600 leading-relaxed text-sm sm:text-base line-clamp-4 mb-4">
                                {introduction.length > 220 ? introduction.slice(0, 220).trim() + '…' : introduction}
                              </p>
                              <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm group-hover:gap-2.5 transition-all">
                                Read guide
                                <ArrowRight className="w-4 h-4 shrink-0" />
                              </span>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Destination travel guides (packing lists, itineraries, vs guides, etc.) */}
            {relatedTravelGuides && relatedTravelGuides.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-poppins font-bold text-gray-900">
                      Planning Guides
                    </h2>
                    <p className="text-gray-500 text-sm sm:text-base">
                      Packing lists, itineraries, comparisons & planning tips
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {relatedTravelGuides.map((guide, index) => {
                    const guideUrl = `/travel-guides/${guide.id}`;
                    const excerpt = guide.excerpt || '';
                    const img = guide.image;
                    return (
                      <motion.div
                        key={guide.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
                        viewport={{ once: true }}
                      >
                        <Link href={guideUrl} className="group block h-full">
                          <Card className="h-full overflow-hidden border border-gray-200/80 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:border-amber-200/60 transition-all duration-300 hover:-translate-y-0.5">
                            {img && (
                              <div className="relative h-40 sm:h-44 overflow-hidden">
                                <img
                                  src={img}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />
                                <div className="absolute bottom-3 left-4 right-4">
                                  <h3 className="text-white font-semibold text-sm drop-shadow-sm line-clamp-2">
                                    {guide.title}
                                  </h3>
                                </div>
                              </div>
                            )}
                            <CardContent className={`p-5 sm:p-6 ${!img ? 'pt-6' : ''}`}>
                              {!img && (
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition-colors mb-3">
                                  {guide.title}
                                </h3>
                              )}
                              <p className="text-gray-600 leading-relaxed text-sm sm:text-base line-clamp-4 mb-4">
                                {excerpt.length > 220 ? excerpt.slice(0, 220).trim() + '…' : excerpt}
                              </p>
                              <span className="inline-flex items-center gap-1.5 text-amber-600 font-semibold text-sm group-hover:gap-2.5 transition-all">
                                Read guide
                                <ArrowRight className="w-4 h-4 shrink-0" />
                              </span>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Link Back to Destination */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href={`/destinations/${destinationId}`} className="block group">
                <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-[1px] shadow-xl shadow-blue-500/20">
                  <div className="relative flex items-center gap-4 sm:gap-6 p-5 sm:p-6 md:p-8 rounded-2xl bg-blue-600">
                    {destination?.imageUrl?.trim() && (
                      <div className="hidden sm:block shrink-0">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden ring-2 ring-white/30 shadow-lg">
                          <Image
                            src={destination.imageUrl}
                            alt=""
                            fill
                            sizes="80px"
                            loading="lazy"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-blue-100 text-sm font-medium mb-1">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>Back to {destinationName}</span>
                      </div>
                      <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-0.5">
                        Explore Tours, Restaurants & More
                      </h3>
                      <p className="text-white/80 text-sm sm:text-base">Full destination hub</p>
                    </div>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Why Visit */}
        {destination.whyVisit && Array.isArray(destination.whyVisit) && destination.whyVisit.length > 0 && (
          <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-8 sm:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
                  Why Visit {destinationName}?
                </h2>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {destination.whyVisit.map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-white border-0 shadow-lg h-full">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                          <Star className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-gray-700 leading-relaxed">{reason}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Best Time to Visit */}
        {destination.bestTimeToVisit && (
          <section className="py-12 sm:py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-8 sm:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
                  Best Time to Visit
                </h2>
              </motion.div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-start mb-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Weather</h3>
                      <p className="text-gray-600">{destination.bestTimeToVisit?.weather || 'Check local weather forecasts for the best time to visit.'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Best Months</h3>
                      <p className="text-gray-600">{destination.bestTimeToVisit?.bestMonths || 'Spring and fall offer the best weather for most destinations.'}</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">Peak Season</h3>
                      <p className="text-blue-700">{destination.bestTimeToVisit?.peakSeason || 'Summer months are typically the peak season with higher prices and crowds.'}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Off Season</h3>
                      <p className="text-green-700">{destination.bestTimeToVisit?.offSeason || 'Winter months offer lower prices and fewer crowds, though weather may be less ideal.'}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* Getting Around – car rental banner (same style as baby equipment) */}
        {destination.gettingAround && (
          <section id="getting-around" className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 overflow-hidden scroll-mt-20">
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
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Getting Around {destinationName}</h3>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                          Save up to 70% on car rentals in {destinationName} when you compare and book in advance.
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

        {/* Traveling with Kids – baby equipment banner (matches destination page) */}
        {hasBabyEquipmentRentals && (
          <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border-2 border-purple-200 shadow-lg">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                      <div className="flex-1 w-full md:w-auto">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <Baby className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Traveling with Kids?</h3>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                          Make traveling with little ones easy! Rent baby equipment in {destinationName} – strollers, car seats, cribs, and more delivered directly to your hotel or vacation rental. Save on baggage fees and travel light with BabyQuip.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs sm:text-sm">90,000+ 5-Star Reviews</Badge>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs sm:text-sm">Clean & Insured</Badge>
                        </div>
                      </div>
                      <Link href={`/destinations/${destinationId}/baby-equipment-rentals`} className="w-full md:w-auto">
                        <Button
                          size="lg"
                          className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 w-full md:w-auto md:px-8 px-4 py-4 sm:py-6 text-sm sm:text-base md:text-lg font-semibold"
                        >
                          <span className="hidden sm:inline">Browse Baby Equipment Rentals</span>
                          <span className="sm:hidden">Browse Rentals</span>
                          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* Tour Operators & Top Tours in Other X Destinations - matches destination page */}
        <section className="py-12 bg-white border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Link href={`/destinations/${destinationId}/operators`}>
                <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 w-full">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                          Tour Operators in {destinationName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">
                          Browse trusted tour operators offering experiences in {destinationName}.
                        </p>
                        <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs px-2 sm:px-3 py-1.5 h-auto">
                          View Operators
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {countryDestinations.length > 0 && destination.country && (
              <div className="mb-6">
                <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 w-full">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                          Top Tours in Other {destination.country} Destinations
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">
                          Explore top-rated tours and activities in other amazing destinations across {destination.country}.
                        </p>
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-3">
                          {countryDestinations.slice(0, showMoreCountryDestinations).map((otherDest, index) => (
                            <Link key={`${otherDest.id}-${index}`} href={`/destinations/${otherDest.id}/tours`} prefetch={true}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-50 text-xs px-2 sm:px-3 py-1.5 h-auto whitespace-nowrap justify-center"
                              >
                                {otherDest.name}
                              </Button>
                            </Link>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {countryDestinations.length > showMoreCountryDestinations && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowMoreCountryDestinations(countryDestinations.length)}
                              className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 text-xs"
                            >
                              View All ({countryDestinations.length} destinations)
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                          {showMoreCountryDestinations > 12 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowMoreCountryDestinations(12)}
                              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-xs"
                            >
                              Show Less
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>

        {/* Ready to Explore CTA + More X Destinations - matches destination page */}
        <section className="py-16 adventure-gradient">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Explore {destinationName}?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Discover the best tours and activities in {destinationName} with AI-powered recommendations tailored just for you.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <Button
                  asChild
                  size="lg"
                  className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 px-8 py-6 text-lg font-semibold"
                >
                  <Link href={`/destinations/${destinationId}/tours`} prefetch={true}>
                    View All Tours & Activities in {destinationName}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* More X Destinations - neutral background (no purple) */}
        {relatedDestinations.length > 0 && destination.category && (
          <section className="py-12 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                More {destination.category} Destinations
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {relatedDestinations.map((dest, index) => (
                  <Link
                    key={`${dest.id}-${index}`}
                    href={`/destinations/${dest.id}`}
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200 hover:underline"
                  >
                    {dest.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
      
      <FooterNext />
    </>
  );
}
