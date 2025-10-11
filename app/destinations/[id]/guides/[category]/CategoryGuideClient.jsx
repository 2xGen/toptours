'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Anchor, MapPin, Clock, Users, DollarSign, Calendar, 
  Camera, Shirt, Sun, Waves, Heart, Star, ArrowRight,
  BookOpen, ChevronRight, Home, GlassWater, Music, Sailboat, Ship, PartyPopper, HeartHandshake, X
} from 'lucide-react';
import Link from 'next/link';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { destinations } from '../../../../../src/data/destinationsData';
import { travelGuides } from '../../../../../src/data/travelGuidesData';
import { categoryGuides } from '../guidesData';

export default function CategoryGuideClient({ destinationId, categorySlug, guideData }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showStickyButton, setShowStickyButton] = React.useState(true);
  
  const destination = destinations.find(d => d.id === destinationId);
  
  
  if (!destination) {
    return <div>Destination not found</div>;
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
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
      {/* Hero Section - Matching destination page style */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-blue-300 mr-2" />
                <span className="text-white font-medium">{destination.name} Guide</span>
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
                  <span className="text-white">{guideData.stats.toursAvailable}+ tours</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                  <span className="text-white">From ${guideData.stats.priceFrom}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-white">{guideData.stats.duration}</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={guideData.heroImage || destination.imageUrl}
                  alt={guideData.title}
                  className="w-full h-64 sm:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </motion.div>
          </div>
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
                    <p className="text-white/80">Complete destination guide with {destination.tourCategories.length} activity categories</p>
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
          {/* Primary CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white shadow-xl">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Ready to Book Your {destination.name} {guideData.categoryName}?</h3>
                <p className="text-blue-100 mb-6 text-lg">
                  Browse {guideData.stats.toursAvailable}+ available tours with instant booking & best price guarantee
                </p>
                <Link href={`/results?searchTerm=${destination.name} ${guideData.categoryName}`}>
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

      {/* Why Choose Section */}
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
              const IconComponent = iconMap[reason.icon];
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
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{reason.title}</h3>
                          <p className="text-gray-600">{reason.description}</p>
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

      {/* Types of Tours */}
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
              const IconComponent = iconMap[type.icon];
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
                        {IconComponent && <IconComponent className="w-8 h-8 text-blue-600" />}
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
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link href={`/results?searchTerm=${destination.name} ${guideData.categoryName}`}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Compare All Tour Options
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

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
                {(guideData.whatToExpect?.items || guideData.whatToExpect || []).map((item, index) => {
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

      {/* Final CTA - Blue */}
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
                  Don't Miss the Perfect {destination.name} Experience
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                  Book your {guideData.categoryName.toLowerCase()} today - {guideData.stats.toursAvailable}+ tours with instant confirmation & best price guarantee!
                </p>
                <Link href={`/results?searchTerm=${destination.name} ${guideData.categoryName}`}>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-10 py-7">
                    Browse All Tours & Prices
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </section>

      {/* Why Visit Section - Reused from Destination Page */}
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
              Why Visit {destination.name}?
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {destination.whyVisit && Array.isArray(destination.whyVisit) && destination.whyVisit.map((reason, index) => (
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

      {/* Best Time to Visit */}
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
                  <p className="text-gray-600">{destination.bestTimeToVisit.weather}</p>
                </div>
              </div>
              
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Best Months</h3>
                  <p className="text-gray-600">{destination.bestTimeToVisit.bestMonths}</p>
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
                  <p className="text-blue-700">{destination.bestTimeToVisit.peakSeason}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Off Season</h3>
                  <p className="text-green-700">{destination.bestTimeToVisit.offSeason}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Other Popular Tours in This Destination */}
      {(() => {
        // Filter categories that have existing guides and exclude current category
        const availableCategories = destination.tourCategories
          .map(cat => typeof cat === 'string' ? cat : cat.name)
          .filter(catName => catName !== guideData.categoryName)
          .filter(catName => {
            const slug = catName.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
              .replace(/&/g, 'and')
              .replace(/ /g, '-');
            return categoryGuides[destinationId] && categoryGuides[destinationId][slug];
          })
          .slice(0, 5);
        
        // Only show section if there are available guides
        return availableCategories.length > 0 ? (
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
                  Other Popular Tours in {destination.name}
                </h2>
              </motion.div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
                {availableCategories.map((category, index) => {
                  const categorySlug = category.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
                    .replace(/&/g, 'and')
                    .replace(/ /g, '-');
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link href={`/destinations/${destinationId}/guides/${categorySlug}`}>
                        <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full bg-white border-0 shadow-lg group">
                          <CardContent className="p-6">
                            <h3 className="font-bold text-base text-gray-900 text-center group-hover:text-blue-600 transition-colors">
                              {category}
                            </h3>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null;
      })()}

      {/* Transportation & Where to Stay */}
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
              Plan Your {destination.name} Trip
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              {/* Transportation */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Transportation Tips</h3>
                  <p className="text-gray-700 mb-6">{destination.gettingAround}</p>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Car Rental Deals in {destination.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">Rent a car for maximum flexibility and explore at your own pace on Expedia USA.</p>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => window.open('https://expedia.com/affiliate?siteid=1&landingPage=https%3A%2F%2Fwww.expedia.com%2F&camref=1110lee9j&creativeref=1100l68075&adref=PZXFUWFJMk', '_blank')}
                    >
                      Find Car Rental Deals
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Where to Stay */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Where to Stay</h3>
                  <p className="text-gray-700 mb-6">
                    Find the perfect accommodation for your {destination.name} adventure. From luxury resorts to cozy hotels, we've got you covered.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Best Hotel Deals in {destination.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">Discover top-rated hotels with exclusive rates and special offers on Expedia USA.</p>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => window.open('https://expedia.com/affiliate?siteid=1&landingPage=https%3A%2F%2Fwww.expedia.com%2F&camref=1110lee9j&creativeref=1100l68075&adref=PZXFUWFJMk', '_blank')}
                    >
                      Find Hotel Deals
                    </Button>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </section>

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
          <Link href={`/results?searchTerm=${destination.name} ${guideData.categoryName}`}>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-4 py-4 md:px-6 md:py-6 rounded-full font-semibold text-sm md:text-base"
            >
              <span className="hidden sm:inline">See {destination.name} {guideData.categoryName} Options</span>
              <span className="sm:hidden">View Tours</span>
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

