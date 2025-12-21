'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Anchor, MapPin, Clock, Users, DollarSign, Calendar, 
  Camera, Shirt, Sun, Waves, Heart, Star, ArrowRight,
  BookOpen, ChevronRight, Home, GlassWater, Music, Sailboat, Ship, PartyPopper, HeartHandshake, UtensilsCrossed
} from 'lucide-react';
import Link from 'next/link';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { getTourUrl } from '@/utils/tourHelpers';
import { destinations } from '../../../../../../src/data/destinationsData';

export default function RestaurantGuideClient({ 
  destinationId, 
  destination: destinationProp, 
  guideData, 
  restaurants = [], 
  categoryGuides = [],
  trendingTours = []
}) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  // Use destination from props if provided, otherwise try to find in destinationsData.js
  let destination = destinationProp || destinations.find(d => d.id === destinationId);
  
  if (!destination) {
    return <div>Destination not found</div>;
  }

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Icon mapping
  const iconMap = {
    Sun, Waves, Heart, Users, Camera, GlassWater, Music, Star, 
    Clock, MapPin, DollarSign, Calendar, Anchor, Shirt, BookOpen,
    Sailboat, Ship, PartyPopper, HeartHandshake, UtensilsCrossed
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true }
  };

  // Format category slug for tour guides
  const formatCategorySlug = (categoryName) =>
    categoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

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
        {/* Hero Section - Matching category guide style */}
        <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(guideData.heroImage || destination.imageUrl) ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-center mb-4">
                    <MapPin className="w-5 h-5 text-blue-300 mr-2" />
                    <span className="text-white font-medium">{destination.name} Restaurant Guide</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-4 md:mb-6 text-white">
                    {guideData.title}
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8">
                    {guideData.subtitle}
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Star className="w-5 h-5 text-white" />
                      <span className="text-white">{guideData.stats?.restaurantsAvailable || 0}+ restaurants</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Star className="w-5 h-5 text-white" />
                      <span className="text-white">{guideData.stats?.avgRating || '4.5'}+ avg rating</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <DollarSign className="w-5 h-5 text-white" />
                      <span className="text-white">{guideData.stats?.priceFrom || '$'} - {guideData.stats?.priceTo || '$$$'}</span>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <div className="flex justify-center lg:justify-start">
                    <Button
                      asChild
                      className="sunset-gradient text-white font-semibold px-6 py-3 hover:scale-105 transition-transform duration-200"
                    >
                      <Link href={`/destinations/${destinationId}/restaurants`}>
                        View All Restaurants in {destination.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="hidden lg:block"
                >
                  <img 
                    src={guideData.heroImage || destination.imageUrl} 
                    alt={guideData.title}
                    className="rounded-2xl shadow-2xl w-full h-auto"
                  />
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-blue-300 mr-2" />
                  <span className="text-white font-medium">{destination.name} Restaurant Guide</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-4 md:mb-6 text-white">
                  {guideData.title}
                </h1>
                {/* SEO: H1 contains primary keyword */}
                <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8">
                  {guideData.subtitle}
                </p>
                
                {/* Quick Stats - Centered */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                    <span className="text-white">{guideData.stats?.restaurantsAvailable || 0}+ restaurants</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                    <span className="text-white">{guideData.stats?.avgRating || '4.5'}+ avg rating</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                    <span className="text-white">{guideData.stats?.priceFrom || '$'} - {guideData.stats?.priceTo || '$$$'}</span>
                  </div>
                </div>
                
                {/* CTA Button - Centered */}
                <div className="flex justify-center">
                  <Button
                    asChild
                    className="sunset-gradient text-white font-semibold px-6 py-3 hover:scale-105 transition-transform duration-200"
                  >
                    <Link href={`/destinations/${destinationId}/restaurants`}>
                      View All Restaurants in {destination.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
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
              <Link href={`/destinations/${destinationId}/restaurants`} className="text-gray-500 hover:text-gray-700">Restaurants</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{guideData.categoryName}</span>
            </nav>
          </div>
        </section>

        {/* Introduction Section */}
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
                      <div className="hidden md:block">
                        <div className="w-20 h-20 rounded-xl overflow-hidden ring-4 ring-white/30">
                          <img 
                            src={destination.imageUrl} 
                            alt={destination.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
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
                      <p className="text-white/80">Complete destination guide with tours, restaurants, and travel tips</p>
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

            {/* Featured Restaurants Section */}
            {restaurants && restaurants.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4">
                    Best {guideData.categoryName} in {destination.name}
                  </h2>
                  {/* SEO: H2 includes primary keyword + location */}
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Discover our top picks for {guideData.categoryName.toLowerCase()} in {destination.name}
                  </p>
                </div>

                {/* Restaurant Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurants.slice(0, 12).map((restaurant, index) => {
                    const restaurantUrl = `/destinations/${destinationId}/restaurants/${restaurant.slug}`;
                    
                    return (
                      <Card key={restaurant.id || index} className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                        <Link href={restaurantUrl}>
                          <div className="relative h-48 bg-gray-200 flex-shrink-0 cursor-pointer">
                            {restaurant.heroImage ? (
                              <img
                                src={restaurant.heroImage}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <UtensilsCrossed className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </Link>

                        <CardContent className="p-4 flex-1 flex flex-col">
                          <Link href={restaurantUrl}>
                            <h4 className="font-semibold text-base text-gray-800 mb-2 line-clamp-2 hover:text-purple-600 transition-colors cursor-pointer">
                              {restaurant.name}
                            </h4>
                          </Link>

                          {/* Rating and Price */}
                          <div className="flex items-center gap-3 mb-3">
                            {restaurant.ratings?.googleRating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-semibold text-gray-700">
                                  {restaurant.ratings.googleRating.toFixed(1)}
                                </span>
                                {restaurant.ratings.reviewCount > 0 && (
                                  <span className="text-xs text-gray-500">
                                    ({restaurant.ratings.reviewCount.toLocaleString()})
                                  </span>
                                )}
                              </div>
                            )}
                            {restaurant.pricing?.priceRange && (
                              <span className="text-sm text-gray-600">
                                {restaurant.pricing.priceRange}
                              </span>
                            )}
                          </div>

                          {/* Cuisines */}
                          {(() => {
                            // Filter out generic cuisine types
                            const validCuisines = restaurant.cuisines && Array.isArray(restaurant.cuisines)
                              ? restaurant.cuisines.filter(c => c && 
                                  c.toLowerCase() !== 'restaurant' && 
                                  c.toLowerCase() !== 'food' &&
                                  c.trim().length > 0)
                              : [];
                            
                            if (validCuisines.length > 0) {
                              return (
                                <div className="mb-3">
                                  <div className="flex flex-wrap gap-1">
                                    {validCuisines.slice(0, 2).map((cuisine, i) => (
                                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                        {cuisine}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {/* View Details Button */}
                          <Button
                            asChild
                            size="sm"
                            className="w-full sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 mt-auto text-xs"
                          >
                            <Link href={restaurantUrl}>
                              View Details
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* View All Restaurants CTA */}
                {restaurants.length > 12 && (
                  <div className="text-center mt-8">
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                    >
                      <Link href={`/destinations/${destinationId}/restaurants`}>
                        View All {restaurants.length} Restaurants
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </section>

        {/* Tour Category Guides Section - Internal Linking */}
        {categoryGuides && Object.keys(categoryGuides).length > 0 && (
          <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4">
                    Top Tours & Activities in {destination.name}
                  </h2>
                  {/* SEO: H2 for internal linking section */}
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    After dining, discover the best tours and experiences in {destination.name}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(categoryGuides).slice(0, 6).map(([slug, guide], index) => {
                    const guideUrl = `/destinations/${destinationId}/guides/${slug}`;
                    
                    return (
                      <motion.div
                        key={slug}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Link href={guideUrl}>
                          <Card className="bg-white border-0 shadow-lg h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                            <CardContent className="p-6">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                              </div>
                              <h3 className="font-bold text-lg text-gray-900 mb-2">
                                {guide.categoryName || guide.title || slug}
                              </h3>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {guide.subtitle || 'Discover the best tours and activities'}
                              </p>
                              <div className="flex items-center text-blue-600 font-semibold text-sm">
                                View Guide
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* View All Tours CTA */}
                <div className="text-center mt-8">
                  <Button
                    asChild
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href={`/destinations/${destinationId}/tours`}>
                      View All Tours & Activities
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Why Choose Section */}
        {guideData.whyChoose && guideData.whyChoose.length > 0 && (
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
                  Why Choose {guideData.categoryName} in {destination.name}?
                </h2>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {guideData.whyChoose.map((item, index) => {
                  const IconComponent = iconMap[item.icon];
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="bg-white border-0 shadow-lg h-full">
                        <CardContent className="p-6">
                          {IconComponent && (
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                              <IconComponent className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-700 leading-relaxed">{item.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* What to Expect */}
        {guideData.whatToExpect && (
          <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                  {guideData.whatToExpect.title || `What to Expect at ${guideData.categoryName} in ${destination.name}`}
                </h2>
                {/* SEO: H2 includes primary keyword + location */}
                <Card>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(guideData.whatToExpect.items || []).map((item, index) => {
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
        )}

        {/* Tips Section */}
        {guideData.expertTips && guideData.expertTips.length > 0 && (
          <section className="py-12 sm:py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-8 text-center">
                  Expert Tips for the Best Dining Experience
                </h2>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {guideData.expertTips.map((tip, index) => (
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
        )}

        {/* FAQs */}
        {guideData.faqs && guideData.faqs.length > 0 && (
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
        )}

        {/* Top Tours CTA Section */}
        {trendingTours && trendingTours.length > 0 && (
          <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4">
                    Top Tours in {destination.name}
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Complete your {destination.name} experience with these top-rated tours and activities
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {trendingTours.slice(0, 6).map((tour, index) => {
                    const tourId = tour.productId || tour.product_id;
                    const tourUrl = getTourUrl(tourId, tour.title);
                    
                    return (
                      <motion.div
                        key={tourId || index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Card className="bg-white border-0 shadow-lg h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <Link href={tourUrl}>
                            <div className="relative h-40 bg-gray-200 flex-shrink-0 cursor-pointer">
                              {tour.image ? (
                                <img
                                  src={tour.image}
                                  alt={tour.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <Camera className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </Link>

                          <CardContent className="p-4">
                            <Link href={tourUrl}>
                              <h4 className="font-semibold text-base text-gray-800 mb-2 line-clamp-2 hover:text-purple-600 transition-colors cursor-pointer">
                                {tour.title}
                              </h4>
                            </Link>

                            {/* Rating */}
                            {tour.rating && (
                              <div className="flex items-center gap-1 mb-3">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-semibold text-gray-700">
                                  {tour.rating.toFixed(1)}
                                </span>
                                {tour.reviewCount > 0 && (
                                  <span className="text-xs text-gray-500">
                                    ({tour.reviewCount.toLocaleString()})
                                  </span>
                                )}
                              </div>
                            )}

                            {/* View Details Button */}
                            <Button
                              asChild
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                            >
                              <Link href={tourUrl}>
                                View Tour Details
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* View All Tours CTA */}
                <div className="text-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xl px-10 py-7"
                  >
                    <Link href={`/destinations/${destinationId}/tours`}>
                      Browse All Tours & Activities
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white overflow-hidden shadow-2xl">
                <CardContent className="p-12 text-center relative">
                  <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      Discover More {destination.name} Restaurants
                    </h2>
                    <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                      Explore all {guideData.stats?.restaurantsAvailable || 0}+ {guideData.categoryName.toLowerCase()} in {destination.name} - find your perfect dining experience!
                    </p>
                    <Link href={`/destinations/${destinationId}/restaurants`}>
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-10 py-7">
                        Browse All Restaurants
                        <ArrowRight className="ml-2 w-6 h-6" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>

      <FooterNext />
    </>
  );
}

