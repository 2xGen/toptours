"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { getTourUrl } from '@/utils/tourHelpers';
import { useRestaurantBookmarks } from '@/hooks/useRestaurantBookmarks';
import ShareModal from '@/components/sharing/ShareModal';
import { useToast } from '@/components/ui/use-toast';
import { extractRestaurantStructuredValues, getRestaurantTimeOfDay, calculateRestaurantPreferenceMatch } from '@/lib/restaurantMatching';
import { useRouter } from 'next/navigation';
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
  Music,
  Coffee,
  Wine,
  Beer,
  Baby,
  Dog,
  Users,
  CreditCard,
  Car,
  Accessibility,
  CheckCircle2,
  XCircle,
  Heart,
  Share2,
  Crown,
  Sparkles,
} from 'lucide-react';
import { 
  PremiumHeroCTA, 
  PremiumMidCTA, 
  PremiumEndCTA, 
  PremiumStickyCTA,
  AnimatedPremiumBadge,
} from '@/components/restaurant/RestaurantPremiumCTAs';
import { PromoteRestaurantBanner } from '@/components/restaurant/PromoteRestaurantBanner';
import { isPremiumRestaurant, getPremiumConfig, COLOR_SCHEMES } from '@/lib/restaurantPremium';
import RestaurantMatchModal from '@/components/restaurant/RestaurantMatchModal';

/**
 * Get booking URL for restaurant
 * Premium restaurants with custom website use that, otherwise use BiteReserve link
 */
function getRestaurantBookingUrl(restaurant, premiumSubscription) {
  // Premium restaurants can have custom website link
  if (isPremiumRestaurant(premiumSubscription) && restaurant.contact?.website) {
    return restaurant.contact.website;
  }
  
  // Default: BiteReserve link
  if (restaurant.countryIsoCode && restaurant.bitereserveCode) {
    return `https://bitereserve.com/r/${restaurant.countryIsoCode}/${restaurant.bitereserveCode}`;
  }
  
  // Fallback to existing website or booking URL
  return restaurant.booking?.partnerUrl || restaurant.contact?.website || null;
}

export default function RestaurantDetailClient({ destination, restaurant, otherRestaurants, initialPromotionScore = null, premiumSubscription = null, categoryGuides = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();
  const { isBookmarked, toggle } = useRestaurantBookmarks();
  const { toast } = useToast();
  const router = useRouter();
  
  // Get booking URL (BiteReserve for all, or custom for premium)
  const bookingUrl = useMemo(() => getRestaurantBookingUrl(restaurant, premiumSubscription), [restaurant, premiumSubscription]);
  const isPremium = isPremiumRestaurant(premiumSubscription);
  const [isGeneratingMatch, setIsGeneratingMatch] = useState(false);
  const [matchError, setMatchError] = useState(null);
  const [showMatchResultsModal, setShowMatchResultsModal] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchModalMessage, setMatchModalMessage] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantMatchModal, setShowRestaurantMatchModal] = useState(false);
  const [localRestaurantPreferences, setLocalRestaurantPreferences] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('topTours_restaurant_preferences');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      atmosphere: 'any',
      diningStyle: 50,
      features: [],
      priceRange: 'any',
      mealTime: 'any',
      groupSize: 'any',
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !localRestaurantPreferences) return;
    try {
      localStorage.setItem('topTours_restaurant_preferences', JSON.stringify(localRestaurantPreferences));
    } catch {}
  }, [localRestaurantPreferences]);

  const calculateLocalMatch = () => {
    const prefs = localRestaurantPreferences || {
      atmosphere: 'any',
      diningStyle: 50,
      features: [],
      priceRange: 'any',
      mealTime: 'any',
      groupSize: 'any',
    };

    const pseudoUserPreferences = {
      adventureLevel: 50,
      cultureVsBeach: 50,
      groupPreference:
        prefs.groupSize === 'solo' || prefs.groupSize === 'couple'
          ? 70
          : prefs.groupSize === 'groups' || prefs.groupSize === 'family'
          ? 30
          : 50,
      budgetComfort:
        prefs.priceRange === '$' ? 25 : prefs.priceRange === '$$' ? 40 : prefs.priceRange === '$$$' ? 70 : prefs.priceRange === '$$$$' ? 85 : 50,
      structurePreference: typeof prefs.diningStyle === 'number' ? prefs.diningStyle : 50,
      foodAndDrinkInterest: 75,
      timeOfDayPreference: 'no_preference',
      restaurantPreferences: prefs,
    };

    const values = extractRestaurantStructuredValues(restaurant);
    if (values?.error) return { error: values.error };
    return calculateRestaurantPreferenceMatch(pseudoUserPreferences, values, restaurant);
  };

  // Check authentication status
  useEffect(() => {
    let isMounted = true;
    let subscription = null;

    (async () => {
      // Get current session
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setUser(data?.session?.user || null);
      setAuthLoading(false);

      // Listen for auth changes
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        setUser(session?.user || null);
      });
      subscription = authSubscription;
    })();

    return () => {
      isMounted = false;
      subscription?.unsubscribe?.();
    };
  }, [supabase]);


  if (!destination || !restaurant) {
    return null;
  }

  // Extract restaurant structured values (formula-based, no AI needed)
  const restaurantValues = extractRestaurantStructuredValues(restaurant);
  
  // Get meal time availability
  const mealTimeAvailability = getRestaurantTimeOfDay(restaurant);
  
  // Derive atmosphere from features
  const getAtmosphere = () => {
    if (restaurant.pricing?.priceRangeLabel?.toLowerCase().includes('fine dining') || 
        restaurant.pricing?.priceRange === '$$$$') {
      return { value: 75, label: 'Upscale', description: 'Refined and elegant dining experience' };
    }
    if (restaurant.outdoorSeating) {
      return { value: 25, label: 'Outdoor', description: 'Al fresco dining with outdoor seating' };
    }
    return { value: 15, label: 'Casual', description: 'Relaxed and laid-back atmosphere' };
  };
  const atmosphere = getAtmosphere();

  const cuisines = restaurant.cuisines || [];
  const hours = restaurant.hours || [];
  const menuHighlights = restaurant.menuHighlights || [];
  const practicalInfo = restaurant.practicalInfo || [];
  
  // Parse opening hours if it's a string
  let openingHours = [];
  try {
    if (typeof hours === 'string') {
      openingHours = JSON.parse(hours);
    } else if (Array.isArray(hours)) {
      openingHours = hours;
    }
  } catch (e) {
    console.error('Error parsing opening hours:', e);
    openingHours = [];
  }
  
  // Business attributes
  const businessAttributes = [];
  if (restaurant.outdoorSeating) businessAttributes.push({ icon: UtensilsCrossed, label: 'Outdoor Seating', color: 'green' });
  if (restaurant.liveMusic) businessAttributes.push({ icon: Music, label: 'Live Music', color: 'purple' });
  if (restaurant.servesCocktails) businessAttributes.push({ icon: Wine, label: 'Cocktails', color: 'pink' });
  if (restaurant.servesBeer) businessAttributes.push({ icon: Beer, label: 'Beer', color: 'amber' });
  if (restaurant.servesWine) businessAttributes.push({ icon: Wine, label: 'Wine', color: 'red' });
  if (restaurant.servesCoffee) businessAttributes.push({ icon: Coffee, label: 'Coffee', color: 'brown' });
  if (restaurant.goodForChildren) businessAttributes.push({ icon: Baby, label: 'Family Friendly', color: 'blue' });
  if (restaurant.allowsDogs) businessAttributes.push({ icon: Dog, label: 'Dog Friendly', color: 'orange' });
  if (restaurant.goodForGroups) businessAttributes.push({ icon: Users, label: 'Groups Welcome', color: 'indigo' });
  if (restaurant.reservable) businessAttributes.push({ icon: BookOpen, label: 'Reservations', color: 'teal' });
  
  // Payment options
  const paymentMethods = [];
  if (restaurant.paymentOptions) {
    if (restaurant.paymentOptions.acceptsCreditCards) paymentMethods.push('Credit Cards');
    if (restaurant.paymentOptions.acceptsDebitCards) paymentMethods.push('Debit Cards');
    if (restaurant.paymentOptions.acceptsNfc) paymentMethods.push('NFC/Contactless');
    if (restaurant.paymentOptions.acceptsCashOnly) paymentMethods.push('Cash Only');
  }
  
  // Parking options
  const parkingInfo = [];
  if (restaurant.parkingOptions) {
    if (restaurant.parkingOptions.freeParkingLot) parkingInfo.push('Free Parking Lot');
    if (restaurant.parkingOptions.freeStreetParking) parkingInfo.push('Free Street Parking');
    if (restaurant.parkingOptions.paidParkingLot) parkingInfo.push('Paid Parking Lot');
    if (restaurant.parkingOptions.paidStreetParking) parkingInfo.push('Paid Street Parking');
    if (restaurant.parkingOptions.valetParking) parkingInfo.push('Valet Parking');
  }
  
  // Accessibility options
  const accessibilityFeatures = [];
  if (restaurant.accessibilityOptions) {
    if (restaurant.accessibilityOptions.wheelchairAccessibleEntrance) accessibilityFeatures.push('Wheelchair Accessible Entrance');
    if (restaurant.accessibilityOptions.wheelchairAccessibleRestroom) accessibilityFeatures.push('Wheelchair Accessible Restroom');
    if (restaurant.accessibilityOptions.wheelchairAccessibleSeating) accessibilityFeatures.push('Wheelchair Accessible Seating');
    if (restaurant.accessibilityOptions.wheelchairAccessibleParking) accessibilityFeatures.push('Wheelchair Accessible Parking');
  }

  // Generate Schema.org structured data for SEO
  const jsonLd = restaurant.schema || {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.metaDescription || restaurant.description || restaurant.summary || restaurant.tagline || '',
    image: restaurant.heroImage || destination.imageUrl,
    url: `https://toptours.ai/destinations/${destination.id}/restaurants/${restaurant.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.contact?.address || '',
      addressLocality: destination.name,
      addressCountry: destination.country || '',
    },
    telephone: restaurant.contact?.phone || restaurant.contact?.formattedPhone || undefined,
    email: restaurant.contact?.email || undefined,
    servesCuisine: cuisines.length > 0 ? cuisines : undefined,
    priceRange: restaurant.pricing?.priceRange || undefined,
    // AggregateRating is required for rich results - always include if rating exists
    aggregateRating: restaurant.ratings?.googleRating ? {
      '@type': 'AggregateRating',
      ratingValue: parseFloat(restaurant.ratings.googleRating),
      reviewCount: restaurant.ratings.reviewCount || 0,
      bestRating: 5,
      worstRating: 1,
      ratingExplanation: `Based on ${restaurant.ratings.reviewCount || 0} ${restaurant.ratings.source || 'Google'} reviews`,
    } : undefined,
    openingHoursSpecification: openingHours && openingHours.length > 0 ? openingHours.map((hour) => {
      const timeParts = hour.time?.split('–') || hour.time?.split('-') || [];
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hour.days || hour.label || 'Monday',
        opens: timeParts[0]?.trim() || '',
        closes: timeParts[1]?.trim() || timeParts[0]?.trim() || '',
      };
    }).filter(h => h.opens && h.closes) : undefined,
    // Additional restaurant properties
    ...(restaurant.contact?.website && {
      sameAs: [restaurant.contact.website],
    }),
    ...(restaurant.pricing?.priceRangeLabel && {
      priceRange: restaurant.pricing.priceRangeLabel,
    }),
  };
  
  // Remove undefined fields to keep JSON-LD clean
  Object.keys(jsonLd).forEach(key => {
    if (jsonLd[key] === undefined || jsonLd[key] === null || jsonLd[key] === '') {
      delete jsonLd[key];
    }
  });
  
  // Clean nested objects
  if (jsonLd.address) {
    Object.keys(jsonLd.address).forEach(key => {
      if (jsonLd.address[key] === undefined || jsonLd.address[key] === null || jsonLd.address[key] === '') {
        delete jsonLd.address[key];
      }
    });
  }

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
        name: 'Restaurants',
        item: `https://toptours.ai/destinations/${destination.id}/restaurants`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: restaurant.shortName || restaurant.name,
        item: `https://toptours.ai/destinations/${destination.id}/restaurants/${restaurant.slug}`,
      },
    ],
  };

  const otherRestaurantsAvailable = otherRestaurants && otherRestaurants.length > 0;

  // Calculate match scores for other restaurants
  const otherRestaurantsMatchById = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(otherRestaurants)) return map;

    const prefs = localRestaurantPreferences || {
      atmosphere: 'any',
      diningStyle: 50,
      features: [],
      priceRange: 'any',
      mealTime: 'any',
      groupSize: 'any',
    };

    // Build a compatible "userPreferences" object expected by the matcher
    const pseudoUserPreferences = {
      adventureLevel: 50,
      cultureVsBeach: 50,
      groupPreference:
        prefs.groupSize === 'solo' || prefs.groupSize === 'couple'
          ? 70
          : prefs.groupSize === 'groups' || prefs.groupSize === 'family'
          ? 30
          : 50,
      budgetComfort:
        prefs.priceRange === '$' ? 25 : prefs.priceRange === '$$' ? 40 : prefs.priceRange === '$$$' ? 70 : prefs.priceRange === '$$$$' ? 85 : 50,
      structurePreference: typeof prefs.diningStyle === 'number' ? prefs.diningStyle : 50,
      foodAndDrinkInterest: 75,
      timeOfDayPreference: 'no_preference',
      restaurantPreferences: prefs,
    };

    otherRestaurants.forEach((r) => {
      try {
        const values = extractRestaurantStructuredValues(r);
        if (values?.error) return;
        const match = calculateRestaurantPreferenceMatch(pseudoUserPreferences, values, r);
        if (match?.error) return;
        map.set(r.id, match);
      } catch {}
    });
    return map;
  }, [otherRestaurants, localRestaurantPreferences]);

  const headingCuisine = cuisines.length > 0 ? `${cuisines.join(' & ')} restaurant in ${destination.name}` : `Restaurant in ${destination.name}`;

  const formatCategorySlug = (categoryName) =>
    categoryName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, 'and')
      .replace(/'/g, '')
      .replace(/\./g, '')
      .replace(/\s+/g, '-');

  // Use category guides from database if available, otherwise fallback to tour categories
  const allCategoryGuides = categoryGuides && categoryGuides.length > 0
    ? categoryGuides.map(guide => ({
        name: guide.category_name,
        slug: guide.category_slug,
        title: guide.title || guide.category_name,
        subtitle: guide.subtitle || '',
        heroImage: guide.hero_image,
        hasGuide: true,
      }))
    : (Array.isArray(destination.tourCategories) ? destination.tourCategories : [])
    .map((category) => (typeof category === 'string' ? { name: category, hasGuide: false } : category))
    .filter((category) => category?.name)
    .slice(0, 6);

  return (
    <>
      <NavigationNext onOpenModal={() => setIsModalOpen(true)} />

      {isModalOpen && (
        <SmartTourFinder isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}

      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Hero Section - Centered text, no image */}
        <section className="relative -mt-12 sm:-mt-16 pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 md:pb-20 overflow-hidden ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Restaurant Name */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold text-white mb-4 md:mb-6 flex items-center justify-center gap-3">
                {restaurant.name}
                {isPremiumRestaurant(premiumSubscription) && (
                  <AnimatedPremiumBadge subscription={premiumSubscription} />
                )}
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-3xl mx-auto">
                {restaurant.metaDescription || restaurant.tagline || restaurant.summary}
              </p>

              {/* Restaurant Info - styled as subtle text, not buttons */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-8 text-white/80 text-sm sm:text-base">
                {cuisines.length > 0 && (
                  <span className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4" />
                    {cuisines.join(' · ')}
                  </span>
                )}
                
                {cuisines.length > 0 && restaurant.pricing?.priceRange && (
                  <span className="text-white/40">•</span>
                )}
                
                {restaurant.pricing?.priceRange && (
                  <span>{restaurant.pricing.priceRange}</span>
                )}
                
                {(cuisines.length > 0 || restaurant.pricing?.priceRange) && restaurant.ratings?.googleRating && (
                  <span className="text-white/40">•</span>
                )}
                
                {restaurant.ratings?.googleRating && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-white">{restaurant.ratings.googleRating.toFixed(1)}</span>
                    {restaurant.ratings.reviewCount && (
                      <span className="text-white/70">
                        ({restaurant.ratings.reviewCount.toLocaleString()})
                      </span>
                    )}
                  </span>
                )}
                
                <span className="text-white/40">•</span>
                
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {destination.name}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  aria-label={isBookmarked(restaurant.id) ? 'Saved' : 'Save to favorites'}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const { data } = await supabase.auth.getUser();
                    if (!data?.user) {
                      toast({
                        title: 'Sign in required',
                        description: 'Create a free account to save restaurants to your favorites.',
                      });
                      return;
                    }
                    try {
                      const wasBookmarked = isBookmarked(restaurant.id);
                      await toggle(restaurant.id);
                      toast({
                        title: wasBookmarked ? 'Removed from favorites' : 'Saved to favorites',
                        description: 'You can view your favorites in your profile.',
                      });
                    } catch (_) {}
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    isBookmarked(restaurant.id) 
                      ? 'bg-red-500/20 border-red-400/50 text-white hover:bg-red-500/30' 
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  }`}
                  title={isBookmarked(restaurant.id) ? 'Saved' : 'Save to favorites'}
                >
                  <Heart className="w-4 h-4" fill={isBookmarked(restaurant.id) ? 'currentColor' : 'none'} />
                  <span className="text-sm font-medium">{isBookmarked(restaurant.id) ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all"
                  aria-label="Share this restaurant"
                  title="Share this restaurant"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>

                <Button
                  asChild
                  className="bg-white text-blue-600 hover:bg-white/90 gap-2 font-medium"
                >
                  <Link href={`/destinations/${destination.id}`}>
                    <MapPin className="w-4 h-4" />
                    Explore {destination.name}
                  </Link>
                </Button>
              </div>

              {/* Hero CTA - Show for all restaurants with booking URL */}
              {bookingUrl && (
                <div className="mt-4 w-full max-w-md mx-auto">
                  {isPremium ? (
                    <PremiumHeroCTA 
                      subscription={premiumSubscription} 
                      restaurant={restaurant}
                      user={user}
                      onAuthRequired={() => {}}
                      fullWidth
                      bookingUrl={bookingUrl}
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full"
                    >
                      <Button
                        onClick={() => {
                          if (bookingUrl) {
                            window.open(bookingUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 py-4 text-lg"
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        Reserve Your Table
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
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
              <Link href={`/destinations/${destination.id}/restaurants`} className="text-gray-500 hover:text-gray-700">
                Restaurants
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

            {/* About Section - SEO Rich Content */}
            {(restaurant.uniqueContent || restaurant.story) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">
                  About {restaurant.name}
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  {(() => {
                    const content = restaurant.uniqueContent || restaurant.story || '';
                    const contentStr = typeof content === 'string' ? content : String(content || '');
                    return contentStr.includes('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: contentStr }} />
                  ) : (
                      <p className="text-lg mb-4 whitespace-pre-line">{contentStr}</p>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {/* Restaurant Characteristics (Extracted Values) */}
            {restaurantValues && !restaurantValues.error && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-sm p-6 md:p-8 border border-purple-200 max-w-4xl mx-auto mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white shadow-inner flex items-center justify-center text-purple-600 text-xl font-bold">
                    📊
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-purple-500">Restaurant Analysis</p>
                    <h2 className="text-2xl font-bold text-gray-900">Restaurant Characteristics</h2>
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    Formula-Based Analysis
                  </Badge>
                </div>
                <p className="text-gray-600 text-base mb-6">
                  This restaurant has been analyzed using our formula-based system to help you understand its key features and match it with your dining preferences.
                </p>

                <div className="space-y-3">
                  {/* Price Range */}
                  {restaurantValues.budgetLevel !== undefined && (
                    (() => {
                      const value = restaurantValues.budgetLevel;
                      const priceRangeSymbol = restaurant.pricing?.priceRange || 
                        (value <= 25 ? '$' : value <= 50 ? '$$' : value <= 75 ? '$$$' : '$$$$');
                      
                      // Convert to descriptive text
                      const getPriceRangeLabel = (symbol) => {
                        if (symbol.includes('$$$$')) return 'Luxury';
                        if (symbol.includes('$$$') && !symbol.includes('$$$$')) return 'Upscale';
                        if (symbol.includes('$$') && !symbol.includes('$$$')) return 'Moderate';
                        if (symbol.includes('$') && !symbol.includes('$$')) return 'Budget-friendly';
                        return 'Moderate';
                      };
                      
                      const priceRangeLabel = getPriceRangeLabel(priceRangeSymbol);
                      
                      return (
                        <div key="priceRange" className="group relative">
                          <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-lg">💰</span>
                              <span className="text-sm font-medium text-gray-700">Price Range</span>
                              <button
                                type="button"
                                className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
                                aria-label="Learn more about Price Range"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
                                {priceRangeLabel}
                              </span>
                            </div>
                          </div>
                          <div className="absolute left-0 top-full mt-2 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                            <p className="font-semibold mb-1">Price Range ({priceRangeLabel})</p>
                            <p className="text-gray-300 leading-relaxed">
                              {value <= 25 ? 'Budget-friendly dining ($) - Affordable options for everyday dining' : 
                               value <= 50 ? 'Moderate pricing ($$) - Mid-range restaurants with good value' : 
                               value <= 75 ? 'Upscale dining ($$$) - Fine dining with premium prices' : 
                               'Luxury fine dining ($$$$) - High-end restaurants with exceptional service and cuisine'}
                            </p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {/* Meal Time Availability */}
                  {mealTimeAvailability && mealTimeAvailability !== 'any' && (
                    <div key="mealTime" className="group relative">
                      <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">🕐</span>
                          <span className="text-sm font-medium text-gray-700">Meal Time</span>
                          <button
                            type="button"
                            className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
                            aria-label="Learn more about Meal Time"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right capitalize">
                            {mealTimeAvailability}
                          </span>
                        </div>
                      </div>
                      <div className="absolute left-0 top-full mt-2 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                        <p className="font-semibold mb-1">Meal Time ({mealTimeAvailability})</p>
                        <p className="text-gray-300 leading-relaxed">
                          This restaurant primarily serves {mealTimeAvailability}. Based on opening hours.
                        </p>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  )}

                  {/* Group Size Preference */}
                  {restaurantValues.groupType !== undefined && (
                    (() => {
                      const value = restaurantValues.groupType;
                      const groupLabel = value <= 30 ? 'Groups Welcome' : value <= 50 ? 'Flexible' : 'Intimate/Solo';
                      return (
                        <div key="groupSize" className="group relative">
                          <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-lg">👥</span>
                              <span className="text-sm font-medium text-gray-700">Group Size</span>
                              <button
                                type="button"
                                className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
                                aria-label="Learn more about Group Size"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    value <= 30 ? 'bg-green-500' : value <= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${100 - value}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
                                  {groupLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute left-0 top-full mt-2 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                            <p className="font-semibold mb-1">Group Size ({groupLabel})</p>
                            <p className="text-gray-300 leading-relaxed">
                              {value <= 30 ? 'Welcomes large groups and families. Great for group dining.' : 
                               value <= 50 ? 'Flexible group sizes. Can accommodate various party sizes.' : 
                               'Better suited for couples or solo dining. More intimate setting.'}
                            </p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {/* Atmosphere */}
                  {atmosphere && (
                    <div key="atmosphere" className="group relative">
                      <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">🎭</span>
                          <span className="text-sm font-medium text-gray-700">Atmosphere</span>
                          <button
                            type="button"
                            className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
                            aria-label="Learn more about Atmosphere"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                atmosphere.value <= 25 ? 'bg-green-500' : atmosphere.value <= 50 ? 'bg-yellow-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${atmosphere.value}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
                              {atmosphere.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute left-0 top-full mt-2 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                        <p className="font-semibold mb-1">Atmosphere ({atmosphere.label})</p>
                        <p className="text-gray-300 leading-relaxed">{atmosphere.description}</p>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  )}

                  {/* Dining Style */}
                  {restaurantValues.structureLevel !== undefined && (
                    (() => {
                      const value = restaurantValues.structureLevel;
                      const styleLabel = value <= 30 ? 'Casual' : value <= 60 ? 'Flexible' : 'Formal';
                      return (
                        <div key="diningStyle" className="group relative">
                          <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-lg">🍽️</span>
                              <span className="text-sm font-medium text-gray-700">Dining Style</span>
                              <button
                                type="button"
                                className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
                                aria-label="Learn more about Dining Style"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    value <= 30 ? 'bg-green-500' : value <= 60 ? 'bg-yellow-500' : 'bg-purple-500'
                                  }`}
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
                                  {styleLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute left-0 top-full mt-2 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                            <p className="font-semibold mb-1">Dining Style ({styleLabel})</p>
                            <p className="text-gray-300 leading-relaxed">
                              {value <= 30 ? 'Walk-in friendly. No reservations needed. Casual dining experience.' : 
                               value <= 60 ? 'Flexible options. Reservations available but not required.' : 
                               'Formal dining. Reservations preferred or required. Fine dining experience.'}
                            </p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {/* Available Features */}
                  {businessAttributes.length > 0 && (
                    <div key="features" className="group relative">
                      <div className="flex items-start justify-between p-3 bg-white/60 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">✨</span>
                          <span className="text-sm font-medium text-gray-700">Features & Amenities</span>
                          <button
                            type="button"
                            className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
                            aria-label="Learn more about Features"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {businessAttributes.slice(0, 4).map((attr, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {attr.label}
                            </Badge>
                          ))}
                          {businessAttributes.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{businessAttributes.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="absolute left-0 top-full mt-2 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                        <p className="font-semibold mb-1">Features & Amenities</p>
                        <p className="text-gray-300 leading-relaxed mb-2">
                          This restaurant offers: {businessAttributes.map(a => a.label).join(', ')}
                        </p>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-purple-200">
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-xs text-gray-500 text-center">
                      Set your dining preferences to see how well this restaurant matches your taste.
                    </p>
                    <Button
                      onClick={async () => {
                        try {
                          setIsGeneratingMatch(true);
                          setMatchError(null);
                          const localMatch = calculateLocalMatch();
                          if (localMatch?.error) {
                            throw new Error(localMatch.error);
                          }
                          setMatchData(localMatch);
                          setShowMatchResultsModal(true);
                        } catch (err) {
                          console.error('Error calculating restaurant match:', err);
                          setMatchError(err.message || 'Failed to calculate match. Please try again.');
                        } finally {
                          setIsGeneratingMatch(false);
                        }
                      }}
                      disabled={isGeneratingMatch}
                      className="sunset-gradient text-white font-semibold px-6 py-3"
                    >
                      {isGeneratingMatch ? (
                        <span className="flex items-center gap-2">
                          <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-white" />
                          </span>
                          Calculating match…
                        </span>
                      ) : (
                        'See Match with My Preferences'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreferencesModal(true)}
                      className="w-full sm:w-auto"
                    >
                      Set Preferences
                    </Button>
                    {matchError && <p className="text-sm text-red-600">{matchError}</p>}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Mid-Page CTA - Show for all restaurants with booking URL, or Promote Banner for non-premium without URL */}
            {bookingUrl ? (
              isPremium ? (
                <PremiumMidCTA 
                  subscription={premiumSubscription} 
                  restaurant={restaurant}
                  user={user}
                  onAuthRequired={() => {}}
                  bookingUrl={bookingUrl}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="my-8"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 md:p-8 shadow-sm">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Ready to Reserve?
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Book your table through BiteReserve
                      </p>
                      <Button
                        onClick={() => {
                          if (bookingUrl) {
                            window.open(bookingUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        Reserve Your Table
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            ) : (
              <PromoteRestaurantBanner 
                restaurant={restaurant} 
                destination={destination}
                user={user}
              />
            )}

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
                  <Link href={`/destinations/${destination.id}/tours`}>
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
                      {restaurant.reviewsUri && (
                        <a
                          href={restaurant.reviewsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-xs text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                        >
                          Read all reviews
                          <ExternalLink className="w-3 h-3" />
                        </a>
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
                    <div className="space-y-3 text-sm text-gray-700 mb-4">
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
                      {restaurant.contact?.website && (
                        <div className="flex items-center gap-2 font-medium">
                          <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                          <a href={restaurant.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Visit {restaurant.name}'s Website
                          </a>
                        </div>
                      )}
                    </div>
                    {(restaurant.googleMapsUri || restaurant.contact?.googleMapsUrl) && (
                      <a
                        href={restaurant.googleMapsUri || restaurant.contact?.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <MapPin className="w-4 h-4" />
                        View on Google Maps
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    
                    {/* Google Places API Attribution */}
                    <p className="text-xs text-gray-500 mt-4">
                      Restaurant data powered by Google Places API
                    </p>
                  </div>
                  
                  {/* Opening Hours with Open Now Status */}
                  {openingHours && openingHours.length > 0 && (
                    <div className="mt-6 bg-white/70 rounded-2xl border border-blue-100 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">Opening Hours</h4>
                        </div>
                        {restaurant.openNow !== null && (
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            restaurant.openNow 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {restaurant.openNow ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Open Now</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                <span>Closed Now</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {openingHours.map((hour, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 font-medium">{hour.days || hour.label}</span>
                            <span className="text-gray-600">{hour.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

        {/* Individual Reviews */}
        {restaurant.reviews && Array.isArray(restaurant.reviews) && restaurant.reviews.length > 0 && (
          <section className="py-12 sm:py-16 bg-white overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-8">
                  Recent Reviews
                </h2>
                <div className="space-y-6">
                  {restaurant.reviews.slice(0, 5).map((review, index) => {
                    // Handle both simplified structure (from DB) and full Google API structure
                    // Simplified: { text, rating, publishTime, author }
                    // Full: { text: { text }, rating, authorAttribution: { displayName, photoUri }, relativePublishTimeDescription }
                    const reviewText = review.text || (review.text?.text) || '';
                    const fullAuthorName = review.author || (review.authorAttribution?.displayName) || 'Anonymous';
                    const rating = review.rating || null;
                    const publishTimeRaw = review.relativePublishTimeDescription || review.publishTime || null;
                    const photoUri = review.authorAttribution?.photoUri || null;
                    
                    // Format author name: "FirstName L."
                    const formatAuthorName = (name) => {
                      if (!name || name === 'Anonymous') return 'Anonymous';
                      const parts = name.trim().split(' ');
                      if (parts.length === 1) return parts[0];
                      const firstName = parts[0];
                      const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || '';
                      return `${firstName} ${lastInitial}.`;
                    };
                    
                    // Format date from ISO string
                    const formatDate = (dateString) => {
                      if (!dateString) return null;
                      try {
                        // Handle ISO date string
                        if (dateString.includes('T') && dateString.includes('Z')) {
                          const date = new Date(dateString);
                          return date.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          });
                        }
                        // If it's already a relative time description, return as is
                        return dateString;
                      } catch (e) {
                        return dateString;
                      }
                    };
                    
                    const authorName = formatAuthorName(fullAuthorName);
                    const publishTime = formatDate(publishTimeRaw);
                    
                    // Skip if no text
                    if (!reviewText || reviewText.trim() === '') return null;
                    
                    return (
                      <motion.div
                        key={review.name || `review-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          {photoUri && (
                            <img
                              src={photoUri}
                              alt={authorName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {authorName}
                              </h3>
                              {rating && (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < rating
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            {publishTime && (
                              <p className="text-sm text-gray-500 mb-3">
                                {publishTime}
                              </p>
                            )}
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {reviewText}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }).filter(Boolean)}
                </div>
                {restaurant.reviews.length > 5 && (
                  <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">
                      Showing 5 of {restaurant.reviews.length} reviews
                    </p>
                    {restaurant.reviewsUri && (
                      <Button
                        asChild
                        variant="outline"
                        className="border-2 border-gray-300 hover:border-gray-400"
                      >
                        <a
                          href={restaurant.reviewsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          Read All Reviews on Google
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* Business Attributes & Features */}
        {businessAttributes.length > 0 && (
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
                  What to Expect
                </h2>
                <p className="text-gray-600 text-lg">
                  Features and amenities that make {restaurant.shortName || restaurant.name} special
                </p>
              </motion.div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {businessAttributes.map((attr, idx) => {
                  const Icon = attr.icon;
                  const colorClasses = {
                    green: 'bg-green-50 text-green-700 border-green-200',
                    purple: 'bg-purple-50 text-purple-700 border-purple-200',
                    pink: 'bg-pink-50 text-pink-700 border-pink-200',
                    amber: 'bg-amber-50 text-amber-700 border-amber-200',
                    red: 'bg-red-50 text-red-700 border-red-200',
                    brown: 'bg-amber-50 text-amber-800 border-amber-200',
                    blue: 'bg-blue-50 text-blue-700 border-blue-200',
                    orange: 'bg-orange-50 text-orange-700 border-orange-200',
                    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    teal: 'bg-teal-50 text-teal-700 border-teal-200',
                  };
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Card className={`h-full border-2 ${colorClasses[attr.color] || 'bg-gray-50 text-gray-700 border-gray-200'} hover:shadow-lg transition-all`}>
                        <CardContent className="p-4 text-center">
                          <Icon className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm font-semibold">{attr.label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Practical Information: Payment, Parking, Accessibility */}
        {(paymentMethods.length > 0 || parkingInfo.length > 0 || accessibilityFeatures.length > 0) && (
          <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-8 sm:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4">
                  Practical Information
                </h2>
                <p className="text-gray-600 text-lg">
                  Everything you need to know before you visit
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paymentMethods.length > 0 && (
                  <Card className="bg-white border border-gray-200 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Payment Options</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {paymentMethods.map((method, idx) => (
                          <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {parkingInfo.length > 0 && (
                  <Card className="bg-white border border-gray-200 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Car className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Parking</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {parkingInfo.map((info, idx) => (
                          <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {info}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {accessibilityFeatures.length > 0 && (
                  <Card className="bg-white border border-gray-200 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Accessibility className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Accessibility</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {accessibilityFeatures.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
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
                              <Link href={restaurant.sustainability.guideUrl}>
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
              <Link href={`/destinations/${destination.id}/tours`}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-10 py-6">
                  Discover {destination.name} Tours
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* End CTA - Above Other Restaurants (only for premium) */}
        {isPremium && bookingUrl && (
          <PremiumEndCTA 
            subscription={premiumSubscription} 
            restaurant={restaurant}
            user={user}
            onAuthRequired={() => {}}
            bookingUrl={bookingUrl}
          />
        )}

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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {otherRestaurants.slice(0, 17).map((other, index) => {
                  if (!other || !other.id || !other.slug) return null;

                  const restaurantUrl = `/destinations/${destination.id}/restaurants/${other.slug}`;
                  const description = other.metaDescription 
                    || other.tagline 
                    || other.summary 
                    || other.description
                    || (other.cuisines?.length > 0 
                        ? `Discover ${other.cuisines.filter(c => c).join(' & ')} cuisine at ${other.name}.`
                        : `Experience great dining at ${other.name}.`);
                  
                  return (
                    <motion.article
                      key={other.id}
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
                                  // Filter out generic cuisine types
                                  const validCuisines = other.cuisines && Array.isArray(other.cuisines)
                                    ? other.cuisines.filter(c => c && 
                                        c.toLowerCase() !== 'restaurant' && 
                                        c.toLowerCase() !== 'food' &&
                                        c.trim().length > 0)
                                    : [];
                                  return validCuisines.length > 0 ? validCuisines[0] : 'Restaurant';
                                })()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Match Score Badge */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedRestaurant(other);
                                  setShowRestaurantMatchModal(true);
                                }}
                                className="bg-white/95 hover:bg-white backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow border border-purple-200 hover:border-purple-400 transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                                title="Click to see why this matches your taste"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                <span className="text-xs font-bold text-gray-900">
                                  {otherRestaurantsMatchById.get(other.id)?.matchScore ?? 0}%
                                </span>
                                <span className="text-[10px] text-gray-600">Match</span>
                              </button>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 flex items-center gap-1.5">
                            {other.name || 'Restaurant'}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                            {description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            {other.ratings?.googleRating && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {other.ratings.googleRating.toFixed(1)}
                              </span>
                            )}
                            {other.pricing?.priceRange && (
                              <span className="inline-flex items-center text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                                {other.pricing.priceRange}
                              </span>
                            )}
                            {(() => {
                              // Filter out generic cuisine types
                              const validCuisines = other.cuisines && Array.isArray(other.cuisines)
                                ? other.cuisines.filter(c => c && 
                                    c.toLowerCase() !== 'restaurant' && 
                                    c.toLowerCase() !== 'food' &&
                                    c.trim().length > 0)
                                : [];
                              // Show cuisine badge if there's at least 1 valid cuisine
                              if (validCuisines.length > 0) {
                                return (
                                  <span className="inline-flex items-center text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">
                                    {validCuisines.slice(0, 2).join(' · ')}
                                  </span>
                                );
                              }
                              return null;
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
            <Link href={`/destinations/${destination.id}`}>
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
                      Discover top-rated hotels with exclusive rates and special offers on Trivago USA.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => window.open('https://tidd.ly/4snW11u', '_blank')}
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

        {/* Related Guides Section - All Category Guides */}
        {allCategoryGuides.length > 0 && (
          <section className="py-12 sm:py-16 bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
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
                  {allCategoryGuides.map((guide) => {
                      const categoryName = guide.name;
                      const categorySlug = guide.slug || formatCategorySlug(categoryName);
                      const hasGuide = guide.hasGuide !== false;
                      
                      if (!hasGuide) return null;
                      
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
                          href={`/destinations/${destination.id}/guides/${categorySlug}`}
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
                    <Link href={`/destinations/${destination.id}`}>
                      View All {destination.name} Guides
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

      </div>

      {/* Sticky Button - Show for all restaurants with booking URL */}
      {bookingUrl ? (
        isPremium ? (
          <PremiumStickyCTA 
            subscription={premiumSubscription} 
            restaurant={restaurant}
            user={user}
            onAuthRequired={() => {}}
            bookingUrl={bookingUrl}
          />
        ) : showStickyButton && (
          <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 transition-opacity duration-300">
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => setShowStickyButton(false)}
                className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-xl border-2 border-gray-300 transition-all duration-200 hover:scale-110"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-900 stroke-2" />
              </button>
              <Button
                onClick={() => {
                  if (bookingUrl) {
                    window.open(bookingUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-6 py-4 rounded-full"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Reserve Table
              </Button>
            </div>
          </div>
        )
      ) : showStickyButton && (
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

      {/* Match Results Modal */}
      {showMatchResultsModal && matchData && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowMatchResultsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-orange-500">Preference Match</p>
                  <h2 className="text-2xl font-bold text-gray-900">How Well Does This Restaurant Match Your Preferences?</h2>
                </div>
              </div>
              <button
                onClick={() => setShowMatchResultsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Match Score Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg ${
                  matchData.matchScore >= 75 ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' :
                  matchData.matchScore >= 55 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                  'bg-gradient-to-br from-red-400 to-red-600 text-white'
                }`}>
                  {matchData.matchScore}%
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow text-xs font-semibold text-gray-700">
                  Match
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className="text-gray-700 text-lg leading-relaxed mb-4 text-center font-medium">
              {matchData.fitSummary}
            </p>

            {/* Ideal For */}
            {matchData.idealFor && (
              <div className="text-center mb-6">
                <span className="inline-block bg-orange-50 px-4 py-2 rounded-full text-sm font-semibold text-orange-700 border border-orange-200">
                  Ideal for: {matchData.idealFor}
                </span>
              </div>
            )}

            {/* Match Breakdown */}
            {matchData.matches && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Match Breakdown:</h3>
                <div className="space-y-3">
                  {[
                    // Restaurant-specific characteristics (prioritize these)
                    ...(matchData.matches.priceRange !== undefined ? [{ key: 'priceRange', label: '💰 Price Range', icon: '💰' }] : []),
                    ...(matchData.matches.diningStyle !== undefined ? [{ key: 'diningStyle', label: '🍽️ Dining Style', icon: '🍽️' }] : []),
                    ...(matchData.matches.structure !== undefined && matchData.matches.diningStyle === undefined ? [{ key: 'structure', label: '🍽️ Dining Style', icon: '🍽️' }] : []), // Fallback to structure if diningStyle not available
                    ...(matchData.matches.timeOfDay !== undefined ? [{ key: 'timeOfDay', label: '🕐 Meal Time', icon: '🕐' }] : []),
                    ...(matchData.matches.groupSize !== undefined ? [{ key: 'groupSize', label: '👥 Group Size', icon: '👥' }] : []),
                    ...(matchData.matches.group !== undefined && matchData.matches.groupSize === undefined ? [{ key: 'group', label: '👥 Group Size', icon: '👥' }] : []), // Fallback
                    ...(matchData.matches.features !== undefined ? [{ key: 'features', label: '✨ Features & Amenities', icon: '✨' }] : []),
                    ...(matchData.matches.atmosphere !== undefined ? [{ key: 'atmosphere', label: '🎭 Atmosphere', icon: '🎭' }] : []),
                    // Food & drink is still relevant for restaurants
                    ...(matchData.matches.food !== undefined ? [{ key: 'food', label: '🍷 Food & Drink Focus', icon: '🍷' }] : []),
                    // Fallback to budget only if priceRange doesn't exist
                    ...(matchData.matches.budget !== undefined && matchData.matches.priceRange === undefined ? [{ key: 'budget', label: '💰 Price Range', icon: '💰' }] : []),
                  ]
                  .filter(({ key }) => {
                    // Remove duplicates and tour-oriented metrics
                    // If priceRange exists, don't show budget
                    if (key === 'budget' && matchData.matches.priceRange !== undefined) return false;
                    // If groupSize exists, don't show group
                    if (key === 'group' && matchData.matches.groupSize !== undefined) return false;
                    // If diningStyle exists, don't show structure
                    if (key === 'structure' && matchData.matches.diningStyle !== undefined) return false;
                    // Hide tour-oriented metrics that aren't relevant for restaurants
                    if (key === 'adventure' || key === 'relaxExplore') return false;
                    return true;
                  })
                  .map(({ key, label, icon }) => {
                    const score = matchData.matches[key];
                    if (score === undefined || score === null) return null;
                    const isGood = score >= 75;
                    const isOk = score >= 50;
                    return (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <span className="text-sm font-medium text-gray-700">{label.replace(/^[^\s]+\s/, '')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isGood ? 'bg-green-500' : isOk ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold min-w-[3rem] text-right ${
                            isGood ? 'text-green-600' : isOk ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {score}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pros */}
            {matchData.pros && matchData.pros.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">✓ What makes this a good fit:</h3>
                <div className="space-y-2">
                  {matchData.pros.map((pro, index) => (
                    <div key={`pro-${index}`} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cons */}
            {matchData.cons && matchData.cons.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">⚠️ Things to consider:</h3>
                <div className="space-y-2">
                  {matchData.cons.map((con, index) => (
                    <div key={`con-${index}`} className="flex items-start gap-2 text-gray-700">
                      <span className="text-orange-500 mt-1">⚠</span>
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={async () => {
                  const wasBookmarked = isBookmarked(restaurant.id);
                  await toggle(restaurant.id);
                  toast({
                    title: wasBookmarked ? 'Removed from favorites' : 'Saved to favorites',
                    description: 'You can view your favorites in your profile.',
                  });
                }}
                variant="outline"
                className="flex-1 border-2 border-orange-200 hover:bg-orange-50"
              >
                <Heart className={`w-4 h-4 mr-2 ${isBookmarked(restaurant.id) ? 'text-red-600 fill-red-600' : 'text-gray-600'}`} />
                {isBookmarked(restaurant.id) ? 'Saved to Favorites' : 'Save to Favorites'}
              </Button>
              {bookingUrl && (
                <Button
                  asChild
                  className="sunset-gradient text-white font-semibold px-6 py-3 flex-1"
                >
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reserve Your Table
                    <ExternalLink className="w-5 h-5 ml-2 inline" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Match Requirements Modal */}
      {showMatchModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowMatchModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Setup Required</h3>
                <p className="text-sm text-gray-600">To use restaurant matching</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              {matchModalMessage}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {matchModalMessage.includes('sign in') ? (
                <Button
                  onClick={() => router.push('/auth')}
                  className="sunset-gradient text-white flex-1"
                >
                  Sign In / Sign Up
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/profile?tab=restaurant')}
                  className="sunset-gradient text-white flex-1"
                >
                  Go to Restaurant Preferences
                </Button>
              )}
              <Button
                onClick={() => setShowMatchModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}


      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <FooterNext />
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={restaurant?.name || 'this restaurant'}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      {/* Match to Your Taste Modal (no account required) */}
      {showPreferencesModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4"
          onClick={() => setShowPreferencesModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="text-purple-600">✨</span>
                <h2 className="text-lg font-bold text-gray-900">Match to Your Taste</h2>
              </div>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Atmosphere */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  What kind of atmosphere do you prefer?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'casual', label: '😌', desc: 'Casual' },
                    { value: 'outdoor', label: '🌳', desc: 'Outdoor' },
                    { value: 'upscale', label: '✨', desc: 'Upscale' },
                  ].map((option) => {
                    const selected = (localRestaurantPreferences?.atmosphere || 'any') === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setLocalRestaurantPreferences((prev) => ({
                            ...(prev || {}),
                            atmosphere: selected ? 'any' : option.value,
                          }))
                        }
                        className={`relative p-2.5 rounded-lg border-2 transition-all duration-200 ${
                          selected
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-lg mb-0.5">{option.label}</div>
                        <div className="text-[10px] font-semibold text-gray-700">{option.desc}</div>
                        {selected && (
                          <div className="absolute top-1 right-1">
                            <div className="w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center">
                              <span className="text-white text-[8px]">✓</span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dining style */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  🍽️ Do you prefer casual walk-ins or formal reservations?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 25, label: '🚶', desc: 'Casual' },
                    { value: 50, label: '⚖️', desc: 'Flexible' },
                    { value: 75, label: '📋', desc: 'Formal' },
                  ].map((option) => {
                    const selected = (localRestaurantPreferences?.diningStyle || 50) === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setLocalRestaurantPreferences((prev) => ({
                            ...(prev || {}),
                            diningStyle: option.value,
                          }))
                        }
                        className={`relative p-2.5 rounded-lg border-2 transition-all duration-200 ${
                          selected
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-lg mb-0.5">{option.label}</div>
                        <div className="text-[10px] font-semibold text-gray-700">{option.desc}</div>
                        {selected && (
                          <div className="absolute top-1 right-1">
                            <div className="w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center">
                              <span className="text-white text-[8px]">✓</span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  ✨ Features & Amenities (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'outdoor_seating', label: '🌳 Outdoor Seating', desc: 'Al fresco dining' },
                    { value: 'live_music', label: '🎵 Live Music', desc: 'Entertainment' },
                    { value: 'dog_friendly', label: '🐕 Dog Friendly', desc: 'Bring your pup' },
                    { value: 'family_friendly', label: '👨‍👩‍👧 Family Friendly', desc: 'Kids welcome' },
                    { value: 'reservations', label: '📅 Reservations', desc: 'Book ahead' },
                  ].map((feature) => {
                    const current = localRestaurantPreferences?.features || [];
                    const selected = current.includes(feature.value);
                    return (
                      <button
                        key={feature.value}
                        type="button"
                        onClick={() =>
                          setLocalRestaurantPreferences((prev) => {
                            const prevFeatures = prev?.features || [];
                            const next = selected
                              ? prevFeatures.filter((f) => f !== feature.value)
                              : [...prevFeatures, feature.value];
                            return { ...(prev || {}), features: next };
                          })
                        }
                        className={`relative p-2.5 rounded-lg border-2 transition-all duration-200 text-left ${
                          selected
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-800">{feature.label}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{feature.desc}</div>
                        {selected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                              <span className="text-white text-[10px]">✓</span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center pt-2">
                Match scores update instantly as you select preferences
              </p>

              <div className="pt-4 mt-2 border-t flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1 text-gray-600 hover:text-gray-900"
                  onClick={() =>
                    setLocalRestaurantPreferences({
                      atmosphere: 'any',
                      diningStyle: 50,
                      features: [],
                      priceRange: 'any',
                      mealTime: 'any',
                      groupSize: 'any',
                    })
                  }
                >
                  Reset
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPreferencesModal(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Match Modal */}
      {showRestaurantMatchModal && selectedRestaurant && (
        <RestaurantMatchModal
          isOpen={showRestaurantMatchModal}
          onClose={() => {
            setShowRestaurantMatchModal(false);
            setSelectedRestaurant(null);
          }}
          restaurant={selectedRestaurant}
          matchData={otherRestaurantsMatchById.get(selectedRestaurant.id)}
          preferences={localRestaurantPreferences}
          onOpenPreferences={() => {
            setShowRestaurantMatchModal(false);
            setShowPreferencesModal(true);
          }}
        />
      )}
    </>
  );
}
