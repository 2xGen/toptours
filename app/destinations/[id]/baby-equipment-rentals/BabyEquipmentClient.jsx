"use client";
/**
 * Baby Equipment Rentals Page - DATABASE-DRIVEN TEMPLATE
 * 
 * This component is fully dynamic and works for ANY destination that has data in the database.
 * Content is fetched from Supabase `baby_equipment_rentals` table per destination.
 * 
 * Database Structure:
 * - pageData.hero_title: Custom hero title (if null, auto-generates)
 * - pageData.hero_description: Custom hero description/tagline
 * - pageData.product_categories: Array of enabled categories for this destination (JSONB)
 *   Format: [{name, icon, description, enabled: true/false}, ...]
 *   If null, uses universal categories template
 * - pageData.faqs: Array of destination-specific FAQs (JSONB)
 *   Format: [{question, answer}, ...]
 * - pageData.intro_text: Optional intro paragraph
 * - pageData.rates_note: Pricing/disclaimer text
 * - pageData.pricing_info: Pricing ranges (JSONB) - optional
 * - pageData.seo_title, seo_description, seo_keywords: Custom SEO
 * 
 * Fallbacks:
 * - If pageData is null → page returns 404 (no page exists)
 * - If product_categories is null → uses universal categories
 * - If faqs is null → uses template FAQs
 * 
 * Template Updates: When you update this component, changes apply to ALL destinations
 * (just like restaurants pages). Update once, affects everywhere.
 * 
 * Props:
 * - destination: Object with destination data (required)
 * - categoryGuides: Array of category guides for related content (optional)
 * - pageData: Database page data from baby_equipment_rentals table (required if page exists)
 */

import { useState, useEffect } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { motion } from 'framer-motion';
import { 
  ExternalLink, ArrowRight, Car, Hotel, Shield, Star, CheckCircle, 
  Package, Baby, ShoppingCart, Heart, Sparkles, BookOpen, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// BabyQuip affiliate link
const BABYQUIP_AFFILIATE_LINK = 'https://www.babyquip.com?a=ae23028';

// Normalize slug: convert special characters to ASCII (e.g., "banús" -> "banus")
function normalizeSlug(slug) {
  if (!slug) return '';
  return String(slug)
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose characters (ú -> u + combining mark)
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/[^\w\s-]/g, '') // Remove any remaining special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Universal product categories (fallback if database doesn't have categories)
const UNIVERSAL_PRODUCT_CATEGORIES = [
  {
    name: 'Strollers & Wagons',
    icon: '🛴',
    description: 'Lightweight strollers, jogging strollers, and wagons perfect for exploring your destination with ease and comfort.',
  },
  {
    name: 'Car Seats',
    icon: '🚗',
    description: 'Safe and certified car seats for infants and toddlers, delivered directly to your rental location or hotel.',
  },
  {
    name: 'Cribs & Sleep',
    icon: '🛏️',
    description: 'Full-size cribs, pack n plays, bassinets, and sleep essentials to ensure your little one gets a good night\'s rest.',
  },
  {
    name: 'High Chairs & Mealtime',
    icon: '🍽️',
    description: 'High chairs, booster seats, and feeding accessories to make dining with your family comfortable and convenient.',
  },
  {
    name: 'Beach & Outdoor Gear',
    icon: '🏖️',
    description: 'Beach tents, sand toys, outdoor play equipment, and seasonal gear for family fun in the sun.',
  },
  {
    name: 'Health & Safety Gear',
    icon: '🏥',
    description: 'Baby gates, outlet covers, monitors, and safety essentials to keep your child safe and secure.',
  },
  {
    name: 'Activity & Entertainment',
    icon: '🎮',
    description: 'Bouncers, swings, play mats, and entertainment items to keep your little one happy and engaged.',
  },
  {
    name: 'Monitor Gear',
    icon: '📱',
    description: 'Audio and video baby monitors to stay connected with your baby while relaxing during your vacation.',
  },
  {
    name: 'Diapering & Bathing',
    icon: '🛁',
    description: 'Changing pads, bath tubs, and diapering essentials to make daily routines stress-free on the go.',
  },
  {
    name: 'Toys, Books & Games',
    icon: '🧸',
    description: 'Age-appropriate toys, books, and games to keep your child entertained during travel and downtime.',
  },
];

export default function BabyEquipmentClient({ destination, categoryGuides = [], pageData = null }) {
  const [showStickyButton, setShowStickyButton] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!destination) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Destination Not Found</h1>
          <p className="text-white/80 mb-6">Sorry, we couldn't find that destination.</p>
        </div>
      </div>
    );
  }

  const destinationName = destination.fullName || destination.name || destination.id;
  const safeCategoryGuides = Array.isArray(categoryGuides) ? categoryGuides : [];

  // Use database pageData if available, otherwise fall back to template defaults
  const heroTitle = pageData?.hero_title || `Baby Equipment Rentals in ${destinationName}`;
  const heroDescription = pageData?.hero_description || pageData?.hero_tagline || `Skip the hassle of packing bulky gear. Rent everything you need for your little one's comfort in ${destinationName}—from strollers and car seats to cribs and high chairs. Delivered directly to your hotel or vacation rental.`;
  
  // Use database product categories if available (filter enabled ones), otherwise use universal
  const productCategories = pageData?.product_categories 
    ? pageData.product_categories.filter(cat => cat.enabled !== false)
    : UNIVERSAL_PRODUCT_CATEGORIES;
  
  // Use database FAQs if available, otherwise use empty array (will use template FAQs)
  const dbFaqs = pageData?.faqs && Array.isArray(pageData.faqs) ? pageData.faqs : [];
  
  // Use database intro text and rates note if available
  const introText = pageData?.intro_text || null;
  const ratesNote = pageData?.rates_note || null;
  const pricingInfo = pageData?.pricing_info || null;

  return (
    <>
      <NavigationNext />
      
      <div className="min-h-screen pt-16 overflow-x-hidden" suppressHydrationWarning>
        {/* Hero Section - Matching destination page style */}
        <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {destination.imageUrl ? (
              // Hero with image - side by side layout
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-center mb-4">
                    <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-white font-medium">{destination.category || 'Baby Gear Rentals'}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-4 md:mb-6">
                    {heroTitle}
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed">
                    {heroDescription}
                  </p>
                  <Button
                    asChild
                    className="sunset-gradient text-white font-semibold px-6 py-3 hover:scale-105 transition-transform duration-200"
                    onClick={() => window.open(BABYQUIP_AFFILIATE_LINK, '_blank')}
                  >
                    <a href={BABYQUIP_AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                      Browse Available Equipment
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={destination.imageUrl}
                      alt={destinationName}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                </motion.div>
              </div>
            ) : (
              // Hero without image - centered layout
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-blue-200 mr-2" />
                  <span className="text-white font-medium">{destination.category || 'Baby Gear Rentals'}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-4 md:mb-6">
                  {heroTitle}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                  {heroDescription}
                </p>
                <Button
                  asChild
                  className="sunset-gradient text-white font-semibold px-6 py-3 hover:scale-105 transition-transform duration-200"
                  onClick={() => window.open(BABYQUIP_AFFILIATE_LINK, '_blank')}
                >
                  <a href={BABYQUIP_AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                    Browse Available Equipment
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm" aria-label="Breadcrumb">
              <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/destinations" className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Destinations</Link>
              <span className="text-gray-400">/</span>
              <Link href={`/destinations/${destination.id}`} className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">{destinationName}</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium" aria-current="page">Baby Equipment Rentals</span>
            </nav>
          </div>
        </section>

      {/* Popular Baby Equipment Rentals Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
              {pageData?.hero_title?.replace('Baby Equipment Rentals in ', '') || destinationName} Baby Equipment Rentals
            </h2>
            {introText && (
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto mb-4 font-medium">
                {introText}
              </p>
            )}
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Discover the best baby equipment rentals in {destinationName} with trusted local providers
            </p>
            {ratesNote && (
              <p className="text-sm text-gray-500 max-w-3xl mx-auto mt-2 italic">
                {ratesNote}
              </p>
            )}
          </motion.div>

          {/* Product Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {productCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl flex-shrink-0">{category.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {category.description}
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                          onClick={() => window.open(BABYQUIP_AFFILIATE_LINK, '_blank')}
                        >
                          <a href={BABYQUIP_AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                            Rent on BabyQuip
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main CTA Button */}
        </div>
      </section>

      {/* Trust Signals Section - Below Rentable Items */}
      <section className="py-12 bg-white border-t border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-6">
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 text-yellow-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">90,000+</div>
              <div className="text-sm text-gray-600">5-Star Reviews</div>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">385,000+</div>
              <div className="text-sm text-gray-600">Reservations</div>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 text-blue-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">Clean</div>
              <div className="text-sm text-gray-600">& Insured</div>
            </div>
            <div className="flex flex-col items-center">
              <Package className="w-8 h-8 text-purple-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900">2,000+</div>
              <div className="text-sm text-gray-600">Locations</div>
            </div>
          </div>
          
          {/* About BabyQuip */}
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm text-gray-600">
              These rentals are provided by <strong className="text-gray-900">BabyQuip</strong>, a trusted service with over 90,000 5-star reviews from traveling families worldwide. All equipment is clean, safe, insured, and delivered directly to your accommodation.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, stress-free gear delivery that lets you focus on your vacation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Browse & Book</h3>
              <p className="text-gray-600">
                Explore our wide selection of clean, safe gear rentals from trusted, local providers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Skip the Hassle</h3>
              <p className="text-gray-600">
                No lugging bulky gear or paying hefty airline baggage fees - just pack light and go.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Arrive Happy</h3>
              <p className="text-gray-600">
                Your gear will be delivered and set up when you need it, where you need it.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Find Tours Banner */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-purple-50 border-t border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="bg-white border-2 border-blue-200 shadow-lg">
              <CardContent className="p-8 sm:p-12">
                <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900 mb-4">
                  Find Tours in {destinationName}
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Discover the best tours and activities in {destinationName} with our AI-powered recommendations. Find the perfect adventure for your trip.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 px-8 py-6"
                >
                  <Link href={`/destinations/${destination.id}/tours`}>
                    Browse All Tours & Activities in {destinationName}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Related Travel Guides Section */}
      {safeCategoryGuides.length > 0 && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Related Travel Guides for {destinationName}
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Explore comprehensive guides to plan your perfect trip, including food tours, cultural experiences, and more.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {safeCategoryGuides.slice(0, 6).map((guide) => {
                  const categoryName = guide.category_name || guide.title || '';
                  const categorySlug = guide.category_slug || '';
                  const normalizedSlug = normalizeSlug(categorySlug);
                  const guideUrl = `/destinations/${destination.id}/guides/${normalizedSlug}`;
                  
                  return (
                    <Link
                      key={categorySlug}
                      href={guideUrl}
                      className="group"
                    >
                      <Card className="border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {guide.title || categoryName}
                            </h3>
                          </div>
                          {guide.subtitle && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                              {guide.subtitle}
                            </p>
                          )}
                          <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:underline">
                            Read Guide
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {safeCategoryGuides.length > 6 && (
                <div className="text-center">
                  <Link href={`/destinations/${destination.id}/tours`}>
                    <Button variant="outline" size="lg" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                      View All {destinationName} Guides
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Plan Your Trip Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-6">
              Plan Your {destinationName} Trip
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Transportation Tips */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border-gray-200 shadow-md h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Car className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Transportation Tips</h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {destination.gettingAround || `Getting around ${destinationName} is easy. Rent a car for maximum flexibility, or use taxis and public transport. Many hotels and vacation rentals offer convenient pickup and drop-off services.`}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Car Rental Deals in {destinationName}</h4>
                    <p className="text-gray-600 text-sm mb-3">Rent a car for maximum flexibility and explore at your own pace on Expedia USA.</p>
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => window.open(`https://expedia.com/affiliate?siteid=1&landingPage=https%3A%2F%2Fwww.expedia.com%2F&camref=1110lee9j&creativeref=1100l68075&adref=PZXFUWFJMk`, '_blank')}>
                      Find Car Rental Deals
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Where to Stay */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border-gray-200 shadow-md h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Hotel className="w-6 h-6 text-purple-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Where to Stay</h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Find the perfect accommodation for your {destinationName} adventure. From luxury resorts to cozy hotels and family-friendly vacation rentals, we've got you covered. Many properties offer baby-friendly amenities and are perfectly located for easy baby gear delivery.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Best Hotel Deals in {destinationName}</h4>
                    <p className="text-gray-600 text-sm mb-3">Discover top-rated hotels with exclusive rates and special offers on Trivago USA.</p>
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => window.open(`https://tidd.ly/4snW11u`, '_blank')}>
                      Find Hotel Deals
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-poppins">
              Frequently Asked Questions{dbFaqs.length > 0 ? ` About ${destinationName}` : ''}
            </h2>
            <div className="space-y-4">
              {/* Use database FAQs if available, otherwise use template FAQs */}
              {dbFaqs.length > 0 ? (
                // Database FAQs
                dbFaqs.map((faq, index) => (
                  <Card key={index} className="border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-700 whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Template FAQs (fallback)
                <>
                  <Card className="border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Why rent baby equipment instead of bringing it?
                      </h3>
                      <p className="text-gray-700">
                        Packing bulky items like strollers and car seats can be stressful and expensive. Airlines charge hefty fees for oversized luggage, and maneuvering through airports with heavy gear adds unnecessary hassle. Renting means everything arrives at your accommodation, ready to use. This lets you pack lighter, save money on baggage fees, and focus on enjoying your vacation with your family.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        How does delivery work?
                      </h3>
                      <p className="text-gray-700">
                        Your local provider will contact you before your trip to coordinate delivery. They'll try to have everything set up before you arrive, but if that doesn't work with your schedule, they'll deliver during your selected time window. For airport pickups, simply share your flight details and they'll meet you there. Most providers offer flexible scheduling to accommodate your travel plans.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Is the equipment safe and clean?
                      </h3>
                      <p className="text-gray-700">
                        Yes! All BabyQuip equipment is thoroughly cleaned and sanitized before each rental. Quality Providers undergo mandatory background checks and extensive training on safety protocols. All equipment is monitored for recalls and expirations, and every rental comes with A-rated liability insurance for your peace of mind.
                      </p>
                    </CardContent>
                  </Card>

                  {destination.gettingAround && (
                    <Card className="border-gray-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Do I need a car seat?
                        </h3>
                        <p className="text-gray-700">
                          {destination.gettingAround.toLowerCase().includes('car') || destination.gettingAround.toLowerCase().includes('rent') ? (
                            `If you're planning to rent a car or use taxis in ${destinationName}, a car seat is essential for your child's safety. ${destination.gettingAround} All car seats available through BabyQuip meet current safety standards and are properly installed by qualified providers.`
                          ) : (
                            `Whether you need a car seat depends on how you plan to get around. If you're renting a car, using taxis, or ride-sharing services, a properly installed car seat is required by law and crucial for safety. If you're primarily using public transportation or walking, you may not need one.`
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        What if my travel plans change?
                      </h3>
                      <p className="text-gray-700">
                        Travel plans change, and BabyQuip understands. With Cancel for Any Reason Protection, you can reserve gear with confidence. Check BabyQuip's cancellation policy for details on flexibility and refunds. Most reservations can be adjusted or canceled with adequate notice.
                      </p>
                    </CardContent>
                  </Card>

                  {(destination.bestTimeToVisit?.weather || destination.whyVisit?.length > 0) && (
                    <Card className="border-gray-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          What should I rent?
                        </h3>
                        <p className="text-gray-700">
                          Full-size cribs are the most popular rental because good sleep is essential for everyone's vacation. {(() => {
                            const hasBeach = destination.bestTimeToVisit?.weather?.toLowerCase().includes('beach') || 
                                            destination.whyVisit?.some(r => r.toLowerCase().includes('beach')) ||
                                            destination.highlights?.some(h => h.toLowerCase().includes('beach'));
                            return hasBeach ? 'For beach destinations, families often also rent beach tents, sand toys, and outdoor play equipment. ' : '';
                          })()}Strollers are great for exploring, and if you're driving, a car seat is a must. Think about what would make your trip more comfortable—high chairs make restaurant meals easier, and playpens give you a safe space for your little one.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 adventure-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
              Ready to Pack Light?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Browse available equipment and have everything delivered to your {destinationName} accommodation. Join over 385,000 families who've made traveling easier with BabyQuip.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 transition-transform duration-200 px-8 py-6 text-lg font-semibold hover:scale-105"
                onClick={() => window.open(BABYQUIP_AFFILIATE_LINK, '_blank')}
              >
                <a href={BABYQUIP_AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                  Browse Baby Equipment Rentals in {destinationName}
                  <ShoppingCart className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Link 
                href={`/destinations/${destination.id}`}
                className="inline-flex items-center justify-center rounded-md h-11 px-8 bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-300 transition-transform duration-200 py-6 text-lg font-semibold hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Explore More {destinationName} Guides
                <ArrowRight className="ml-2 h-5 w-5 text-gray-900" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      </div>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
          <Button
            asChild
            className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 px-6 py-6 text-base font-semibold shadow-2xl"
            onClick={() => window.open(BABYQUIP_AFFILIATE_LINK, '_blank')}
          >
            <a href={BABYQUIP_AFFILIATE_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
              Browse Equipment Rentals
              <ExternalLink className="w-5 h-5" />
            </a>
          </Button>
        </div>
      )}

      <FooterNext />
    </>
  );
}
