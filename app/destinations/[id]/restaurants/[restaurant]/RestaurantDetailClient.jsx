"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  UtensilsCrossed,
  Star,
  ArrowRight,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Calendar,
  Leaf,
  Info,
  X,
  Hotel,
} from 'lucide-react';

export default function RestaurantDetailClient({ destination, restaurant, otherRestaurants }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(true);

  if (!destination || !restaurant) {
    return null;
  }

  const cuisines = restaurant.cuisines || [];
  const hours = restaurant.hours || [];
  const menuHighlights = restaurant.menuHighlights || [];
  const practicalInfo = restaurant.practicalInfo || [];

  const jsonLd = {
    ...(restaurant.schema || {}),
  };

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
        name: destination.name,
        item: `https://toptours.ai/destinations/${destination.id}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: restaurant.shortName || restaurant.name,
        item: `https://toptours.ai/destinations/${destination.id}/restaurants/${restaurant.slug}`,
      },
    ],
  };

  const otherRestaurantsAvailable = otherRestaurants && otherRestaurants.length > 0;

  const headingCuisine = cuisines.length > 0 ? `${cuisines.join(' & ')} restaurant in ${destination.name}` : `Restaurant in ${destination.name}`;

  const formatCategorySlug = (categoryName) =>
    categoryName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, 'and')
      .replace(/'/g, '')
      .replace(/\./g, '')
      .replace(/\s+/g, '-');

  const curatedTourCategories = (Array.isArray(destination.tourCategories) ? destination.tourCategories : [])
    .map((category) => (typeof category === 'string' ? { name: category, hasGuide: false } : category))
    .filter((category) => category?.name)
    .slice(0, 6);

  return (
    <>
      <NavigationNext onOpenModal={() => setIsModalOpen(true)} />

      {isModalOpen && (
        <SmartTourFinder isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}

      <div className="min-h-screen pt-16 overflow-x-hidden">
        <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <div className="flex items-center gap-3 mb-4">
                  <UtensilsCrossed className="w-5 h-5 text-blue-200" />
                  <span className="text-white/90 text-sm font-medium uppercase tracking-wide">
                    {headingCuisine}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold text-white mb-4 md:mb-6">
                  {restaurant.name}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8">
                  {restaurant.tagline || restaurant.summary}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {restaurant.ratings?.googleRating && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                      <Star className="w-5 h-5" />
                      <span className="font-semibold">{restaurant.ratings.googleRating.toFixed(1)}</span>
                      {restaurant.ratings.reviewCount && (
                        <span className="text-white/80 text-sm">
                          ({restaurant.ratings.reviewCount.toLocaleString()} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {restaurant.pricing?.priceRange && (
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                      {restaurant.pricing.priceRange}
                    </div>
                  )}

                  {cuisines.length > 0 && (
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                      {cuisines.join(' · ')}
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={restaurant.heroImage || destination.imageUrl}
                    alt={restaurant.imageAlt || restaurant.name}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/destinations" className="text-gray-500 hover:text-gray-700">
                Destinations
              </Link>
              <span className="text-gray-400">/</span>
              <Link href={`/destinations/${destination.id}`} className="text-gray-500 hover:text-gray-700">
                {destination.name}
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{restaurant.shortName || restaurant.name}</span>
            </nav>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <Link href={`/destinations/${destination.id}`}>
                <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
                  <div className="relative p-6 md:p-8 flex items-center gap-6">
                    <div className="hidden md:block">
                      <div className="w-20 h-20 rounded-xl overflow-hidden ring-4 ring-white/30">
                        <img
                          src={destination.imageUrl}
                          alt={destination.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-blue-100 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Planning your {destination.name} trip?</span>
                      </div>
                      <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
                        Explore All {destination.name} Tours & Activities
                      </h3>
                      <p className="text-white/80">
                        Complete destination guide with {destination.tourCategories?.length || 6} activity categories
                      </p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto mb-12"
            >
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  {restaurant.summary}
                </p>
                {restaurant.story?.paragraphs?.map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed text-lg mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white shadow-xl">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Ready to Book Top Tours in {destination.name}?
                  </h2>
                  <p className="text-blue-100 mb-6 text-lg">
                    Browse {destination.tourCategories?.length || 6} curated tour categories with instant booking & best price guarantee.
                  </p>
                  <Link href={`/destinations/${destination.id}`}>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                      View All Tours & Prices
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-blue-100 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-blue-100">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Find the Restaurant</p>
                      <h3 className="text-xl font-semibold text-gray-900">Where to Find Them</h3>
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-2xl border border-blue-100 p-5 shadow-sm">
                    <p className="text-gray-800 text-base leading-relaxed mb-4">
                      {restaurant.contact?.address}
                    </p>
                    <div className="space-y-3 text-sm text-gray-700">
                      {restaurant.contact?.phone && (
                        <div className="flex items-center gap-2 font-medium">
                          <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
                            <Phone className="w-4 h-4" />
                          </div>
                          <span>{restaurant.contact.formattedPhone || restaurant.contact.phone}</span>
                        </div>
                      )}
                      {restaurant.contact?.email && (
                        <div className="flex items-center gap-2 font-medium">
                          <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
                            <Mail className="w-4 h-4" />
                          </div>
                          <span>{restaurant.contact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {menuHighlights.length > 0 && (
          <section className="py-12 sm:py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-8 sm:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4">
                  Menu Highlights You Shouldn’t Miss
                </h2>
                <p className="text-gray-600 text-lg">
                  From smoked meats to island-inspired desserts, here’s what diners rave about at this restaurant in {destination.name}.
                </p>
              </motion.div>

              <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                {menuHighlights.map((highlight) => (
                  <Card
                    key={highlight.section}
                    className="w-full md:w-72 lg:w-80 border border-blue-100 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {highlight.section}
                      </h3>
                      <ul className="space-y-3 text-gray-700">
                        {highlight.items?.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {(restaurant.reviewSummary || restaurant.ratings?.googleRating) && (
          <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-poppins font-bold text-gray-900">
                      Why Travelers Love {restaurant.shortName || restaurant.name}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Sourced from recent guest feedback and verified reviews.
                    </p>
                  </div>
                  {restaurant.ratings?.googleRating && (
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-full px-4 py-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      <span className="text-lg font-semibold text-blue-700">
                        {restaurant.ratings.googleRating.toFixed(1)} / 5.0
                      </span>
                      {restaurant.ratings.reviewCount && (
                        <span className="text-sm text-blue-600/80">
                          ({restaurant.ratings.reviewCount.toLocaleString()} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {restaurant.reviewSummary}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {(restaurant.sustainability || practicalInfo.length > 0) && (
          <section className="py-12 sm:py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                {restaurant.sustainability && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full bg-gradient-to-br from-green-50 to-white border border-green-100">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <Leaf className="w-6 h-6 text-green-600" />
                          <h3 className="text-xl font-semibold text-gray-900">
                            {restaurant.sustainability.title}
                          </h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {restaurant.sustainability.description}
                        </p>
                        {restaurant.sustainability.guideImage && (
                          <div className="mt-6 overflow-hidden rounded-2xl border border-green-100">
                            <img
                              src={restaurant.sustainability.guideImage}
                              alt={`${restaurant.sustainability.title} guide cover`}
                              className="w-full h-40 object-cover"
                            />
                          </div>
                        )}
                        {restaurant.sustainability.guideUrl && (
                          <div className="mt-6">
                            <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                              <Link href={restaurant.sustainability.guideUrl} target="_blank" rel="noopener noreferrer">
                                {restaurant.sustainability.guideCta || 'Read the guide'}
                              </Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {practicalInfo.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full border border-gray-100 shadow-lg">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <Info className="w-6 h-6 text-blue-600" />
                          <h3 className="text-xl font-semibold text-gray-900">
                            Helpful Tips Before You Go
                          </h3>
                        </div>
                        <div className="space-y-4">
                          {practicalInfo.map((tip) => (
                            <div key={tip.title} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-white text-blue-600 border-blue-200 text-xs uppercase tracking-wide">
                                  {tip.title}
                                </Badge>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{tip.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="py-12 sm:py-16 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl shadow-2xl p-10 md:p-14"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Make It a Full-Day Experience in {destination.name}
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-3xl mx-auto">
                Pair your reservation at {restaurant.shortName || restaurant.name} with unforgettable tours in {destination.name}. From sunset sails to culinary adventures, our AI curates the best ways to explore the island like a local.
              </p>
              <Link href={`/results?searchTerm=${encodeURIComponent(destination.name + ' tours')}`}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-10 py-6">
                  Discover {destination.name} Tours
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-3">
                Other Popular Restaurants in {destination.name}
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Build your own culinary trail—save these spots for future nights out in {destination.name}.
              </p>
            </motion.div>

            {otherRestaurantsAvailable ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {otherRestaurants.map((other) => (
                  <motion.div
                    key={other.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <UtensilsCrossed className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {other.name}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                          {other.tagline || other.summary?.slice(0, 120)}
                        </p>
                        <Link
                          href={`/destinations/${destination.id}/restaurants/${other.slug}`}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          View Restaurant
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={`/destinations/${destination.id}/restaurants`}
                    className="block h-full"
                  >
                    <Card className="h-full border border-blue-100 bg-white shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center p-6">
                      <UtensilsCrossed className="w-8 h-8 text-blue-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        View All Restaurants in {destination.name}
                      </h3>
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
            ) : (
              <div className="max-w-3xl mx-auto text-center bg-white border border-dashed border-gray-200 rounded-2xl p-10 shadow-sm">
                <p className="text-gray-700 text-lg">
                  We’re curating more standout restaurants in {destination.name}. Check back soon for fresh dining inspiration.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 adventure-gradient">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Explore {destination.name}?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Discover the best tours, activities, and restaurant picks with AI-powered recommendations tailored just for you.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold"
              >
                Start Planning Your {destination.name} Trip
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-4">
                Plan Your {destination.name} Trip
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                From transportation to stays, we help you build a complete itinerary around this must-visit restaurant in {destination.name}.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-7 h-7 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Transportation Tips</h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">{destination.gettingAround}</p>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Car Rental Deals in {destination.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Rent a car for maximum flexibility and explore at your own pace on Expedia USA.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => window.open('https://expedia.com/affiliate?siteid=1&landingPage=https%3A%2F%2Fwww.expedia.com%2F&camref=1110lee9j&creativeref=1100l68075&adref=PZXFUWFJMk', '_blank')}
                    >
                      Find Car Rental Deals
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Hotel className="w-7 h-7 text-purple-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Where to Stay</h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Find the perfect accommodation for your {destination.name} adventure. From luxury beachfront resorts to boutique hideaways, we highlight the best basecamps for food lovers.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Best Hotel Deals in {destination.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Discover top-rated hotels with exclusive rates and special offers on Expedia USA.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => window.open('https://expedia.com/affiliate?siteid=1&landingPage=https%3A%2F%2Fwww.expedia.com%2F&camref=1110lee9j&creativeref=1100l68075&adref=PZXFUWFJMk', '_blank')}
                    >
                      Find Hotel Deals
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {curatedTourCategories.length > 0 && (
          <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-8 sm:mb-12"
              >
                <div className="inline-flex items-center gap-2 bg-white border border-blue-200 rounded-full px-4 py-2 mb-4 shadow-sm">
                  <Badge className="bg-blue-100 text-blue-700 border border-blue-200">Guided Experiences</Badge>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-3">
                  Popular Tours in {destination.name}
                </h2>
                <p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto">
                  Pair dinner at {restaurant.shortName || restaurant.name} with these top-rated experiences in {destination.name}.
                </p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                {curatedTourCategories.map((category) => {
                  const categoryName = category.name;
                  const categorySlug = formatCategorySlug(categoryName);
                  return (
                    <motion.div
                      key={categorySlug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={`/destinations/${destination.id}/guides/${categorySlug}`}
                        className="block group"
                        title={`Explore ${categoryName} in ${destination.name}`}
                      >
                        <Card className="bg-white border border-blue-100 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                          <CardContent className="p-5 text-center">
                            <p className="text-gray-900 font-medium text-base leading-tight group-hover:text-blue-700">
                              {categoryName}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      </div>

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
            <Link href={`/destinations/${destination.id}`}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-4 py-4 md:px-6 md:py-6 rounded-full font-semibold text-sm md:text-base"
              >
                <span>Explore {destination.name}</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <FooterNext />
    </>
  );
}
