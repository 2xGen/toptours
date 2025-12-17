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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import ShareModal from '@/components/sharing/ShareModal';

export default function OperatorsListClient({ destination, operators = [], categoryGuides = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOperator, setExpandedOperator] = useState(null);
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
    datePublished: '2025-01-01',
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

        {/* Operators Listing Section */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Stats and Search */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {filteredOperators.length} {filteredOperators.length === 1 ? 'Operator' : 'Operators'}
                </h2>
                <p className="text-gray-600">
                  Browse tour operators offering experiences in {destination.fullName}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOperators.map((operator, index) => {
                  const tourCount = operator.tours?.length || operator.tourCount || 0;
                  const destinationCount = operator.destinationCount || 0;
                  const isExpanded = String(expandedOperator) === String(operator.id);
                  
                  // Debug log
                  if (index === 0) {
                    console.log('Operator data:', {
                      id: operator.id,
                      name: operator.operator_name,
                      tourCount: tourCount,
                      toursArray: operator.tours,
                      toursLength: operator.tours?.length,
                      tourProductIds: operator.tour_product_ids?.length
                    });
                  }

                  return (
                    <motion.div
                      key={operator.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Card className="h-full border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-6 flex flex-col h-full">
                          {/* Operator Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                {operator.operator_name}
                              </h3>
                              {operator.status === 'paid_subscribed' && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white mb-2">
                                  <span className="mr-1">👑</span> Premium Partner
                                </Badge>
                              )}
                            </div>
                            <Building2 className="w-8 h-8 text-gray-400 flex-shrink-0 ml-2" />
                          </div>

                          {/* Stats */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-semibold text-gray-900 mr-2">{tourCount}</span>
                              <span>{tourCount === 1 ? 'tour' : 'tours'} available</span>
                            </div>
                            {destinationCount > 0 && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{destinationCount} {destinationCount === 1 ? 'destination' : 'destinations'}</span>
                              </div>
                            )}
                          </div>

                          {/* CTA Button */}
                          <div className="mt-auto pt-4">
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newExpandedId = isExpanded ? null : String(operator.id);
                                console.log('Toggling operator:', { 
                                  operatorId: operator.id,
                                  operatorIdString: String(operator.id),
                                  currentExpanded: expandedOperator,
                                  newExpanded: newExpandedId,
                                  hasTours: operator.tours?.length > 0,
                                  tourCount: operator.tours?.length,
                                  tours: operator.tours
                                });
                                setExpandedOperator(newExpandedId);
                              }}
                              className="w-full sunset-gradient text-white"
                              variant="default"
                            >
                              {isExpanded ? 'Hide Tours' : `View ${tourCount} ${tourCount === 1 ? 'Tour' : 'Tours'}`}
                              <ArrowRight className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </Button>
                          </div>

                          {/* Expanded Tours List */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              {operator.tours && operator.tours.length > 0 ? (
                                <>
                                  <p className="text-sm font-semibold text-gray-700 mb-3">
                                    Tours by {operator.operator_name}:
                                  </p>
                                  <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {operator.tours.slice(0, 10).map((tour, idx) => {
                                  const tourUrl = tour.slug 
                                    ? `/tours/${tour.productId}/${tour.slug}`
                                    : `/tours/${tour.productId}`;
                                  const tourName = tour.name || `Tour #${tour.productId}`;
                                  
                                  return (
                                    <Link
                                      key={tour.productId}
                                      href={tourUrl}
                                      className="block p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
                                    >
                                      <div className="flex gap-3">
                                        {/* Tour Image */}
                                        {tour.image && (
                                          <div className="flex-shrink-0">
                                            <img
                                              src={tour.image}
                                              alt={tourName}
                                              className="w-16 h-16 rounded-lg object-cover"
                                              onError={(e) => {
                                                e.target.style.display = 'none';
                                              }}
                                            />
                                          </div>
                                        )}
                                        
                                        {/* Tour Info */}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-1">
                                            {tourName}
                                          </h4>
                                          
                                          {/* Rating and Reviews */}
                                          {(tour.rating || tour.reviewCount) && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                              {tour.rating && (
                                                <div className="flex items-center gap-1">
                                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                  <span className="font-medium">{tour.rating.toFixed(1)}</span>
                                                </div>
                                              )}
                                              {tour.reviewCount && (
                                                <span className="text-gray-500">
                                                  ({tour.reviewCount.toLocaleString()} {tour.reviewCount === 1 ? 'review' : 'reviews'})
                                                </span>
                                              )}
                                            </div>
                                          )}
                                          
                                          {/* Price */}
                                          {tour.price && (
                                            <div className="flex items-center gap-1 text-sm font-semibold text-orange-600">
                                              <DollarSign className="w-3 h-3" />
                                              <span>From ${tour.price}</span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {/* Arrow */}
                                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-600 flex-shrink-0 mt-1" />
                                      </div>
                                    </Link>
                                  );
                                })}
                                {operator.tours.length > 10 && (
                                  <p className="text-xs text-gray-500 text-center pt-2">
                                    +{operator.tours.length - 10} more tours
                                  </p>
                                )}
                              </div>
                                  <Link
                                    href={`/destinations/${destination.id}/tours?operator=${encodeURIComponent(operator.operator_name)}`}
                                    className="block mt-3 text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                                  >
                                    View all tours →
                                  </Link>
                                </>
                              ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                  No tours found for this operator in {destination.fullName}
                                </p>
                              )}
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

