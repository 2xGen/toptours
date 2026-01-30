'use client';

import React, { useState } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  MapPin,
  ExternalLink,
  X,
  Search,
  Globe,
  Share2,
  Star,
  DollarSign,
  BookOpen,
  UtensilsCrossed,
  Car,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import ShareModal from '@/components/sharing/ShareModal';

export default function OperatorsListClient({ destination, operators = [], topTours = [], categoryGuides = [], restaurants = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Filter operators by search term
  const filteredOperators = operators.filter(op => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (op.operator_name || '').toLowerCase().includes(searchLower);
  });

  const defaultOgImage = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/Explore%20any%20destination%20with%20TopToursai.png';
  const heroImage = destination.imageUrl || defaultOgImage;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://toptours.ai/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Destinations',
        item: 'https://toptours.ai/destinations',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: destination.name || destination.fullName,
        item: `https://toptours.ai/destinations/${destination.id}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `Tour Operators in ${destination.fullName}`,
        item: `https://toptours.ai/destinations/${destination.id}/operators`,
      },
    ],
  };

  // ItemList schema for operators listing page
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Tour Operators in ${destination.fullName || destination.name}`,
    description: `A curated list of trusted tour operators offering tours and activities in ${destination.fullName || destination.name}`,
    numberOfItems: operators.length,
    itemListElement: operators.map((operator, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Organization',
        '@id': `https://toptours.ai/destinations/${destination.id}/operators#${encodeURIComponent(operator.operator_name)}`,
        name: operator.operator_name,
        url: `https://toptours.ai/destinations/${destination.id}/tours?operator=${encodeURIComponent(operator.operator_name)}`,
        ...(operator.tours && operator.tours.length > 0 && {
          offers: {
            '@type': 'AggregateOffer',
            offerCount: operator.tours.length,
            offers: operator.tours.slice(0, 5).map(tour => ({
              '@type': 'Offer',
              name: tour.name || `Tour by ${operator.operator_name}`,
              url: tour.slug 
                ? `https://toptours.ai/tours/${tour.productId}/${tour.slug}`
                : `https://toptours.ai/tours/${tour.productId}`,
              ...(tour.price && {
                price: tour.price,
                priceCurrency: 'USD',
              }),
              ...(tour.rating && {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: tour.rating,
                  ...(tour.reviewCount && { reviewCount: tour.reviewCount }),
                },
              }),
            })),
          },
        }),
      },
    })),
  };

  // Article schema for SEO
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Tour Operators in ${destination.fullName || destination.name} | TopTours.ai`,
    description: `Discover trusted tour operators offering tours and activities in ${destination.fullName || destination.name}. Browse operators, compare tours, and book instantly with free cancellation.`,
    image: heroImage,
    datePublished: '2025-12-31',
    dateModified: new Date().toISOString().split('T')[0],
    author: {
      '@type': 'Organization',
      name: 'TopTours.ai',
      url: 'https://toptours.ai',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TopTours.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://toptours.ai/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://toptours.ai/destinations/${destination.id}/operators`,
    },
    articleSection: 'Travel',
    keywords: `tour operators ${destination.fullName}, ${destination.fullName} tour companies, ${destination.fullName} tour providers`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      
      <NavigationNext onOpenModal={handleOpenModal} />
      <SmartTourFinder isOpen={isModalOpen} onClose={handleCloseModal} />

      <div className="min-h-screen pt-16 overflow-x-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Hero Section - Matching restaurants page style */}
        <section
          className="relative py-20 sm:py-24 md:py-28 overflow-hidden -mt-12 sm:-mt-16 ocean-gradient"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white">
              <div>
                <div className="inline-flex items-center gap-3 text-sm text-white/80 mb-4">
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-white/70" />
                    Tour Operators
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/40" aria-hidden="true" />
                  <span>{destination.fullName}</span>
                </div>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white flex-1">
                    Tour Operators in {destination.fullName}
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 flex-shrink-0"
                    onClick={() => setShowShareModal(true)}
                    title="Share this page"
                  >
                    <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </div>
                <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl">
                  Discover trusted tour operators offering experiences in {destination.fullName}. Browse operators, compare tours, and book instantly with free cancellation.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-white text-blue-600 hover:bg-gray-100 gap-2">
                    <Link href={`/destinations/${destination.id}`}>
                      Explore {destination.fullName}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild className="sunset-gradient text-white gap-2">
                    <Link href={`/destinations/${destination.id}/tours`}>
                      View Top Tours and Activities in {destination.fullName}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-white/20 opacity-40 blur-3xl -z-10" />
                <Card className="border-0 shadow-2xl overflow-hidden">
                  <img
                    src={heroImage}
                    alt={destination.fullName}
                    className="w-full h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/destinations" className="hover:text-gray-700">Destinations</Link>
              <span className="text-gray-400">/</span>
              <Link href={`/destinations/${destination.id}`} className="hover:text-gray-700">{destination.name || destination.fullName}</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Tour Operators</span>
            </nav>
          </div>
        </section>

        {/* CTA to destination page (no server-side tours fetch - saves cost) */}
        {topTours.length === 0 && (
          <section className="py-12 px-4 bg-white">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Explore {destination.fullName}
              </h2>
              <p className="text-gray-600 text-lg mb-6 max-w-xl mx-auto">
                See tours, restaurants, and travel guides for {destination.fullName} in one place.
              </p>
              <Button asChild className="sunset-gradient text-white">
                <Link href={`/destinations/${destination.id}`}>
                  Go to {destination.fullName} destination page
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* Why Visit Section */}
        {destination.whyVisit && destination.whyVisit.length > 0 && (
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
                  Why Visit {destination.fullName}?
                </h2>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
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

              {/* Getting Around & Must-See Attractions - Combined */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Getting Around - Compact */}
                {destination.gettingAround && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-blue-50/50 border-0 shadow-sm h-full">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Car className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Getting Around</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">{destination.gettingAround}</p>
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-gray-600 text-xs mb-2">Prefer renting a car? See options here.</p>
                              <Link href={`/destinations/${destination.id}/car-rentals`} className="block">
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                  <Car className="w-3 h-3 mr-1.5" />
                                  Find Car Rental Deals
                                  <ArrowRight className="w-3 h-3 ml-1.5" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Must-See Attractions - Compact List */}
                {destination.highlights && destination.highlights.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-purple-50/50 border-0 shadow-sm h-full">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Must-See Attractions</h3>
                            <ul className="space-y-2">
                              {destination.highlights.map((highlight, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-purple-600 mt-1">•</span>
                                  <span className="text-gray-600 text-sm leading-relaxed">{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Operators Listing Section */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Stats and Search */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {filteredOperators.length} {filteredOperators.length === 1 ? 'Tour Operator' : 'Tour Operators'} in {destination.fullName}
                </h2>
                <p className="text-gray-600 text-lg">
                  Browse trusted tour operators offering experiences in {destination.fullName}. Click any operator to view their tours.
                </p>
              </div>
              
              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search operators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Operators Grid */}
            {filteredOperators.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredOperators.map((operator, index) => {
                  // Show tour count from database
                  const tourCount = operator.tourCount || operator.tour_product_ids?.length || 0;
                  const destinationCount = operator.destinationCount || 0;

                  return (
                    <motion.div
                      key={operator.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <Card className="h-full border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-4 flex flex-col h-full">
                          {/* Operator Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
                                {operator.operator_name}
                              </h3>
                              {operator.status === 'paid_subscribed' && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs mt-1">
                                  <span className="mr-1">👑</span> Premium
                                </Badge>
                              )}
                            </div>
                            <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2 mt-0.5" />
                          </div>

                          {/* Tour Count */}
                          {tourCount > 0 && (
                            <div className="mt-auto pt-2 border-t border-gray-100">
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">{tourCount}</span> {tourCount === 1 ? 'tour' : 'tours'} on TopTours
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No operators found' : 'No operators available'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? `Try adjusting your search for "${searchTerm}"`
                    : `We're working on adding more operators for ${destination.fullName}`}
                </p>
                {searchTerm && (
                  <Button onClick={() => setSearchTerm('')} variant="outline">
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Restaurants Section - Exact match to destination page */}
        {restaurants.length > 0 && (
          <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mb-8 sm:mb-12"
              >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-3">
                      Top Restaurants in {destination.fullName}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-3xl sm:max-w-xl mx-auto sm:mx-0">
                      Reserve a table at our hand-picked local favorites and plan dinner around your tours in {destination.fullName}.
                    </p>
                  </div>
                  <Link href={`/destinations/${destination.id}/restaurants`} className="self-center sm:self-end">
                    <Button variant="outline" className="gap-2">
                      View All {restaurants.length} Restaurants
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Restaurants Grid - Exact match to destination page */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {restaurants.slice(0, 6).map((restaurant, index) => {
                  if (!restaurant || !restaurant.id || !restaurant.slug) return null;

                  const restaurantUrl = `/destinations/${destination.id}/restaurants/${restaurant.slug}`;
                  const description = restaurant.metaDescription 
                    || restaurant.tagline 
                    || restaurant.summary 
                    || restaurant.description
                    || (restaurant.cuisines?.length > 0 
                        ? `Discover ${restaurant.cuisines.filter(c => c).join(' & ')} cuisine at ${restaurant.name}.`
                        : `Experience great dining at ${restaurant.name}.`);

                  return (
                    <motion.article
                      key={restaurant.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
                      viewport={{ once: true }}
                      className="h-full"
                    >
                      <Card className="h-full border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <UtensilsCrossed className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                {(() => {
                                  const validCuisines = restaurant.cuisines && Array.isArray(restaurant.cuisines)
                                    ? restaurant.cuisines.filter(c => c && 
                                        c.toLowerCase() !== 'restaurant' && 
                                        c.toLowerCase() !== 'food' &&
                                        c.trim().length > 0)
                                    : [];
                                  return validCuisines.length > 0 ? validCuisines[0] : 'Restaurant';
                                })()}
                              </span>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 flex items-center gap-1.5">
                            {restaurant.name || 'Restaurant'}
                          </h3>

                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {description.length > 120 ? description.slice(0, 120) + '...' : description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {restaurant.ratings?.googleRating && !isNaN(restaurant.ratings.googleRating) && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full">
                                <Star className="w-3 h-3" />
                                {parseFloat(restaurant.ratings.googleRating).toFixed(1)}
                              </span>
                            )}
                            {restaurant.pricing?.priceRange && (
                              <span className="inline-flex items-center text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                                {String(restaurant.pricing.priceRange)}
                              </span>
                            )}
                            {(() => {
                              const validCuisines = restaurant.cuisines && Array.isArray(restaurant.cuisines)
                                ? restaurant.cuisines.filter(c => c && 
                                    c.toLowerCase() !== 'restaurant' && 
                                    c.toLowerCase() !== 'food' &&
                                    c.trim().length > 0)
                                : [];
                              return validCuisines.length > 0 ? (
                                <span className="inline-flex items-center text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">
                                  {validCuisines.slice(0, 2).join(' · ')}
                                </span>
                              ) : null;
                            })()}
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
                    </motion.article>
                  );
                })}
              </div>

              {/* View All Button */}
              <div className="text-center mt-10">
                <Button
                  asChild
                  size="lg"
                  className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 px-8 py-6"
                >
                  <Link href={`/destinations/${destination.id}/restaurants`}>
                    View All Restaurants in {destination.fullName}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Category Guides Section - Exact match to destination page */}
        {categoryGuides.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h3 className="text-2xl font-poppins font-bold text-gray-800 mb-2 text-center">
                  Related Travel Guides for {destination.fullName}
                </h3>
                <p className="text-center text-gray-600 mb-8">
                  Explore comprehensive guides to plan your perfect trip, including food tours, cultural experiences, and more.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {categoryGuides.map((guide, index) => {
                  if (!guide) return null;
                  
                  const categoryName = guide.category_name || guide.title || guide.category || '';
                  const categorySlug = guide.category_slug || '';
                  
                  // Normalize slug to handle special characters
                  const normalizeSlug = (slug) => {
                    return slug
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/&/g, 'and')
                      .replace(/'/g, '')
                      .replace(/\./g, '')
                      .replace(/ /g, '-');
                  };
                  
                  const normalizedSlug = normalizeSlug(categorySlug);
                  const guideUrl = `/destinations/${destination.id}/guides/${normalizedSlug}`;
                  
                  if (!categoryName && !categorySlug) return null;
                  
                  const isFoodRelated = categoryName.toLowerCase().includes('food') || 
                                        categoryName.toLowerCase().includes('culinary') ||
                                        categoryName.toLowerCase().includes('dining') ||
                                        categoryName.toLowerCase().includes('tapas') ||
                                        categoryName.toLowerCase().includes('tasting') ||
                                        categoryName.toLowerCase().includes('restaurant');
                  const Icon = isFoodRelated ? UtensilsCrossed : MapPin;
                  const iconColor = isFoodRelated ? 'text-orange-600' : 'text-blue-600';
                  
                  return (
                    <Link
                      key={categorySlug || index}
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
                                ? `Discover the best ${categoryName.toLowerCase()} experiences in ${destination.fullName}.`
                                : `Explore ${categoryName.toLowerCase()} in ${destination.fullName}.`
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
                  <Link href={`/destinations/${destination.id}`}>
                    View All {destination.fullName} Guides
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Related Links Section */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore More in {destination.fullName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href={`/destinations/${destination.id}/tours`}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Tours & Activities in {destination.fullName}</h3>
                <p className="text-gray-600 text-sm">Browse all available tours and activities in {destination.fullName}</p>
                <ArrowRight className="w-5 h-5 text-orange-600 mt-4" />
              </Link>
              <Link
                href={`/destinations/${destination.id}/restaurants`}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Restaurants in {destination.fullName}</h3>
                <p className="text-gray-600 text-sm">Discover top-rated restaurants in {destination.fullName}</p>
                <ArrowRight className="w-5 h-5 text-orange-600 mt-4" />
              </Link>
              <Link
                href={`/destinations/${destination.id}`}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{destination.fullName} Destination Guide</h3>
                <p className="text-gray-600 text-sm">Learn more about {destination.fullName} and plan your perfect trip</p>
                <ArrowRight className="w-5 h-5 text-orange-600 mt-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Sticky Button */}
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
              <Link href={`/destinations/${destination.id}/tours`}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-4 py-4 md:px-6 md:py-6 rounded-full font-semibold text-sm md:text-base"
                >
                  <span>See {destination.fullName} Tours</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={`https://toptours.ai/destinations/${destination.id}/operators`}
        title={`Tour Operators in ${destination.fullName}`}
      />

      <FooterNext />
    </>
  );
}

