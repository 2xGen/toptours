'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import SmartTourFinder from '@/components/home/SmartTourFinder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
  ArrowRight,
  Star,
  UtensilsCrossed,
  MapPin,
  Car,
  Hotel,
  ExternalLink,
  X,
  TrendingUp,
  Info,
  Share2,
  Crown,
  Filter,
  SlidersHorizontal,
  XCircle,
  DollarSign,
  Search,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTourUrl } from '@/utils/tourHelpers';
import { motion } from 'framer-motion';
import RestaurantPromotionCard from '@/components/promotion/RestaurantPromotionCard';
import TourPromotionCard from '@/components/promotion/TourPromotionCard';
import { useRestaurantBookmarks } from '@/hooks/useRestaurantBookmarks';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Heart } from 'lucide-react';
import ShareModal from '@/components/sharing/ShareModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { extractRestaurantStructuredValues, calculateRestaurantPreferenceMatch } from '@/lib/restaurantMatching';
import RestaurantMatchModal from '@/components/restaurant/RestaurantMatchModal';

export default function RestaurantsListClient({ destination, restaurants, trendingTours = [], trendingRestaurants = [], restaurantPromotionScores = {}, premiumRestaurantIds = [], categoryGuides = [] }) {
  const { isBookmarked, toggle } = useRestaurantBookmarks();
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showStickyButton, setShowStickyButton] = React.useState(true);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [user, setUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [savingPreferencesToProfile, setSavingPreferencesToProfile] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  
  // Filter and sort state
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'name', 'price-low', 'price-high', 'best-match'
  const [maxPrice, setMaxPrice] = useState('all'); // 'all', '$', '$$', '$$$', '$$$$'
  const [searchTerm, setSearchTerm] = useState('');

  // Restaurant preferences (no account required) - stored in localStorage
  const [localRestaurantPreferences, setLocalRestaurantPreferences] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('topTours_restaurant_preferences');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      atmosphere: 'any', // 'any' | 'casual' | 'outdoor' | 'upscale'
      diningStyle: 50, // 0-100: 0 = walk-in, 100 = formal
      features: [], // ['outdoor_seating','live_music','dog_friendly','family_friendly','reservations']
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

  // Fetch user + profile (optional; only used for Save to Profile)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data?.user || null);
        if (data?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('trip_preferences')
            .eq('id', data.user.id)
            .single();
          if (!mounted) return;
          if (profile?.trip_preferences) setUserPreferences(profile.trip_preferences);
          // If user has restaurant prefs but localStorage is empty, hydrate local prefs
          try {
            const stored = localStorage.getItem('topTours_restaurant_preferences');
            if (!stored && profile?.trip_preferences?.restaurantPreferences) {
              setLocalRestaurantPreferences((prev) => ({
                ...(prev || {}),
                ...profile.trip_preferences.restaurantPreferences,
              }));
            }
          } catch {}
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  // Auto-sync local restaurant preferences -> profile once after sign-in
  useEffect(() => {
    if (!user || !localRestaurantPreferences) return;
    if (typeof window === 'undefined') return;

    const syncKey = `topTours_restaurant_prefs_synced_${user.id}`;
    let didSync = false;
    try {
      didSync = localStorage.getItem(syncKey) === '1';
    } catch {}
    if (didSync) return;

    const run = async () => {
      try {
        const hasProfileRestaurantPrefs =
          userPreferences?.restaurantPreferences &&
          typeof userPreferences.restaurantPreferences === 'object' &&
          Object.keys(userPreferences.restaurantPreferences).length > 0;

        if (hasProfileRestaurantPrefs) {
          try { localStorage.setItem(syncKey, '1'); } catch {}
          return;
        }

        const mergedTripPreferences = {
          ...(userPreferences || {}),
          restaurantPreferences: {
            ...(userPreferences?.restaurantPreferences || {}),
            ...localRestaurantPreferences,
          },
        };

        const { error } = await supabase
          .from('profiles')
          .upsert({ id: user.id, trip_preferences: mergedTripPreferences });
        if (error) throw error;

        setUserPreferences(mergedTripPreferences);
        try { localStorage.setItem(syncKey, '1'); } catch {}
      } catch (e) {
        console.warn('Restaurant preference auto-sync failed:', e?.message || e);
      }
    };

    run();
  }, [user, localRestaurantPreferences, userPreferences, supabase]);

  const handleSavePreferencesToProfile = useCallback(async () => {
    if (!localRestaurantPreferences) return;
    if (!user) {
      const redirect = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
      setShowPreferencesModal(false);
      router.push(`/auth?mode=signup&redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    setSavingPreferencesToProfile(true);
    try {
      const mergedTripPreferences = {
        ...(userPreferences || {}),
        restaurantPreferences: {
          ...(userPreferences?.restaurantPreferences || {}),
          ...localRestaurantPreferences,
        },
      };
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, trip_preferences: mergedTripPreferences });
      if (error) throw error;
      setUserPreferences(mergedTripPreferences);
      toast({ title: 'Preferences saved', description: 'Saved to your profile (syncs across devices).' });
      setShowPreferencesModal(false);
    } catch (e) {
      toast({
        title: 'Could not save preferences',
        description: e?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingPreferencesToProfile(false);
    }
  }, [localRestaurantPreferences, user, userPreferences, supabase, router, toast]);

  const restaurantMatchById = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(restaurants)) return map;

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

    restaurants.forEach((r) => {
      try {
        const values = extractRestaurantStructuredValues(r);
        if (values?.error) return;
        const match = calculateRestaurantPreferenceMatch(pseudoUserPreferences, values, r);
        if (match?.error) return;
        map.set(r.id, match);
      } catch {}
    });
    return map;
  }, [restaurants, localRestaurantPreferences]);

  // Check if any filters are active
  const hasActiveFilters = maxPrice && maxPrice !== 'all';

  // Clear all filters
  const clearFilters = () => {
    setMaxPrice('all');
    setSortBy('rating');
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const zanzibarRestaurant = restaurants.find((restaurant) => restaurant.slug === 'zanzibar-beach-restaurant-curacao');
  const heroTourText = `Pair dinner at ${zanzibarRestaurant?.shortName || zanzibarRestaurant?.name || destination.fullName} with these top-rated experiences in ${destination.fullName}.`;

  // Breadcrumb schema is injected server-side in `app/destinations/[id]/restaurants/page.jsx`

  const formatCategorySlug = (categoryName) =>
    categoryName
      .toLowerCase()
      .normalize('NFD').replace(/[  -]/g, '')
      .normalize('NFD').replace(/[  -]/g, '')
      .normalize('NFD').replace(/[  -]/g, '')
      .normalize('NFD').replace(/[  -]/g, '')
      .normalize('NFD').replace(/[  -]/g, '')
      .normalize('NFD').replace(/[  -]/g, '')
      .replace(/&/g, 'and')
      .replace(/'/g, '')
      .replace(/\./g, '')
      .replace(/\s+/g, '-');

  const curatedTourCategories = (Array.isArray(destination.tourCategories) ? destination.tourCategories : [])
    .map((category) => (typeof category === 'string' ? { name: category } : category))
    .filter((category) => category?.name)
    .slice(0, 6);

  // Price range mapping
  const priceRangeMap = {
    '$': 1,
    '$$': 2,
    '$$$': 3,
    '$$$$': 4,
  };

  // Reverse mapping for display
  const priceLevelToSymbol = {
    1: '$',
    2: '$$',
    3: '$$$',
    4: '$$$$',
  };

  // Price level labels
  const priceLevelLabels = {
    1: 'Budget',
    2: 'Moderate',
    3: 'Expensive',
    4: 'Very Expensive',
  };

  // Max price options
  const maxPriceOptions = [
    { value: 'all', label: 'No Max Budget' },
    { value: '$', label: '$ - Budget' },
    { value: '$$', label: '$$ - Moderate' },
    { value: '$$$', label: '$$$ - Expensive' },
    { value: '$$$$', label: '$$$$ - Very Expensive' },
  ];

  // Filter and sort restaurants
  const filteredAndSortedRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((restaurant) => {
        const name = (restaurant.name || '').toLowerCase();
        const cuisines = (restaurant.cuisines || []).join(' ').toLowerCase();
        const description = (restaurant.metaDescription || restaurant.tagline || restaurant.summary || '').toLowerCase();
        return name.includes(searchLower) || cuisines.includes(searchLower) || description.includes(searchLower);
      });
    }

    // Max price filter
    if (maxPrice && maxPrice !== 'all') {
      filtered = filtered.filter((restaurant) => {
        const priceRangeValue = restaurant.pricing?.priceRange;
        if (!priceRangeValue) return false;
        
        const priceLevel = priceRangeMap[priceRangeValue] || 0;
        const maxLevel = priceRangeMap[maxPrice] || 999;
        
        return priceLevel <= maxLevel;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        const ratingA = a.ratings?.googleRating || 0;
        const ratingB = b.ratings?.googleRating || 0;
        return ratingB - ratingA;
      } else if (sortBy === 'best-match') {
        const matchA = restaurantMatchById.get(a.id)?.matchScore ?? 0;
        const matchB = restaurantMatchById.get(b.id)?.matchScore ?? 0;
        return matchB - matchA;
      } else if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'price-low') {
        const priceA = priceRangeMap[a.pricing?.priceRange] || 999;
        const priceB = priceRangeMap[b.pricing?.priceRange] || 999;
        return priceA - priceB;
      } else if (sortBy === 'price-high') {
        const priceA = priceRangeMap[a.pricing?.priceRange] || 0;
        const priceB = priceRangeMap[b.pricing?.priceRange] || 0;
        return priceB - priceA;
      }
      return 0;
    });

    return filtered;
  }, [restaurants, sortBy, maxPrice, searchTerm, restaurantMatchById]);

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />

      <div className="min-h-screen pt-16 overflow-x-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Hero */}
        <section
          className="relative py-20 sm:py-24 md:py-28 overflow-hidden -mt-12 sm:-mt-16 ocean-gradient"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white">
              <div>
                <div className="inline-flex items-center gap-3 text-sm text-white/80 mb-4">
                  <span className="inline-flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-white/70" />
                    Dining Guide
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/40" aria-hidden="true" />
                  <span>{destination.fullName}</span>
                </div>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white flex-1">
                    Best Restaurants in {destination.fullName}
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
                  From waterfront seafood shacks to family-run cafés, these six spots capture the flavors and vibes of {destination.fullName}. Reserve a table, soak up the scenery, and plan the rest of your trip with our curated guides.
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
                    src={destination.imageUrl}
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
              <Link href={`/destinations/${destination.id}`} className="hover:text-gray-700">{destination.name}</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Best Restaurants</span>
            </nav>
          </div>
        </section>

        {/* Trending Now Section - Past 28 Days */}
        {((trendingTours && trendingTours.length > 0) || (trendingRestaurants && trendingRestaurants.length > 0)) && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Trending Now in {destination.fullName}</h2>
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700 border-orange-300">
                  Past 28 Days
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <p className="text-sm text-gray-600">
                  Tours and restaurants that are currently popular based on recent community boosts
              </p>
                <Link 
                  href="/how-it-works" 
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  title="Learn how promotions work"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Learn more</span>
                </Link>
              </div>

              {/* Trending Tours Subsection */}
              {trendingTours && trendingTours.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Trending Tours Now in {destination.fullName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTours.map((trending, index) => {
                  const tourId = trending.product_id;
                  const tourUrl = trending.tour_slug 
                    ? `/tours/${tourId}/${trending.tour_slug}` 
                    : getTourUrl(tourId, trending.tour_name);
                  
                  return (
                    <motion.div
                      key={tourId || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                          <Card className="bg-white border-0 shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <Link href={tourUrl}>
                              <div className="relative h-48 overflow-hidden">
                            {trending.tour_image_url ? (
                              <img
                                src={trending.tour_image_url}
                                alt={trending.tour_name || 'Tour'}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                onError={(e) => {
                                  e.target.src = destination.imageUrl || '/placeholder-tour.jpg';
                                }}
                              />
                            ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <MapPin className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute top-3 left-3">
                                  <Badge className="adventure-gradient text-white">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Trending
                                  </Badge>
                                </div>
                              </div>
                            </Link>

                            <CardContent className="p-4 flex-1 flex flex-col">
                              <Link href={tourUrl}>
                                <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
                                  {trending.tour_name || `Tour #${tourId}`}
                                </h3>
                              </Link>

                              {/* Promotion Score */}
                              {tourId && (
                              <div className="mb-3">
                                <TourPromotionCard 
                                  productId={tourId} 
                                  compact={true}
                                  initialScore={{
                                    product_id: tourId,
                                    total_score: trending.total_score || 0,
                                    monthly_score: trending.monthly_score || 0,
                                    weekly_score: trending.weekly_score || 0,
                                    past_28_days_score: trending.past_28_days_score || 0,
                                  }}
                                />
                              </div>
                            )}

                              <Button
                                asChild
                                className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 mt-auto"
                              >
                                <Link href={tourUrl}>
                                  View Details
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trending Restaurants Subsection */}
              {trendingRestaurants && trendingRestaurants.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Trending Restaurants Now in {destination.fullName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingRestaurants.map((trending, index) => {
                      if (!trending || !trending.restaurant_id) return null;
                      
                      const restaurantId = trending.restaurant_id;
                      const restaurantUrl = trending.restaurant_slug && trending.destination_id
                        ? `/destinations/${trending.destination_id}/restaurants/${trending.restaurant_slug}`
                        : `/destinations/${destination.id}/restaurants`;
                      
                      return (
                        <motion.div
                          key={restaurantId || index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <Card className="h-full border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-5 flex flex-col h-full">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                  <UtensilsCrossed className="w-5 h-5 text-white" />
                                </div>
                                <Badge className="adventure-gradient text-white text-xs">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Trending
                                </Badge>
                              </div>
                              
                              <Link href={restaurantUrl}>
                                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors flex items-center gap-1.5">
                                  {trending.restaurant_name || `Restaurant #${restaurantId}`}
                                  {(premiumRestaurantIds.includes(restaurantId) || premiumRestaurantIds.includes(Number(restaurantId))) && (
                                    <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" title="Featured Restaurant" />
                                  )}
                                </h3>
                              </Link>

                              {/* Promotion Score */}
                              {restaurantId && (
                                <div className="mb-3 flex-grow">
                                  <RestaurantPromotionCard 
                                    restaurantId={restaurantId} 
                                    compact={true}
                                    initialScore={restaurantPromotionScores[restaurantId] || {
                                      restaurant_id: restaurantId,
                                      total_score: trending.total_score || 0,
                                      monthly_score: trending.monthly_score || 0,
                                      weekly_score: trending.weekly_score || 0,
                                      past_28_days_score: trending.past_28_days_score || 0,
                                    }}
                                  />
                                </div>
                              )}

                              <Link
                                href={restaurantUrl}
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mt-auto"
                              >
                                View Details
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Restaurant sections */}
        <section className="py-8 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 sm:mb-10 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-2">
                View {filteredAndSortedRestaurants.length} of Top Restaurants in {destination.fullName}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Discover our curated selection of the best dining experiences in {destination.fullName}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Tip: switch to <span className="font-semibold text-gray-700">Best Match</span> to rank restaurants by your taste.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder={`Search restaurants in ${destination.fullName}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters and Sort */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Max Budget Filter */}
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Max Budget:</label>
                    <Select 
                      value={maxPrice} 
                      onValueChange={setMaxPrice}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="No Max Budget" />
                      </SelectTrigger>
                      <SelectContent>
                        {maxPriceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="gap-1 h-8 px-2 text-xs text-gray-600 hover:text-gray-900"
                      >
                        <XCircle className="w-3 h-3" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sort + Match to Your Taste */}
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:items-center">
                  <div className="w-full sm:w-auto sm:min-w-[180px]">
                    <label className="text-xs text-gray-600 mb-1.5 block sm:hidden">Sort by</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="best-match">Best Match (for you)</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreferencesModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all w-full sm:w-auto"
                    title="Set your dining preferences for match scores"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-900">Match to Your Taste</span>
                    <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                      AI driven
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {filteredAndSortedRestaurants.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border-2 border-amber-200 p-8 shadow-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <UtensilsCrossed className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No restaurants found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm ? `We couldn't find any restaurants matching "${searchTerm}" in ${destination.fullName}.` : `No restaurants match your current filters in ${destination.fullName}.`}
                      </p>
                      {(searchTerm || hasActiveFilters) && (
                        <Button
                          onClick={() => {
                            setSearchTerm('');
                            clearFilters();
                          }}
                          variant="outline"
                          className="mb-6"
                        >
                          Clear search and filters
                        </Button>
                      )}
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-amber-200 w-full">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Are you a restaurant owner or manager?
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Isn't your restaurant on TopTours.ai? Partner with us to get your restaurant listed and reach more travelers.
                      </p>
                      <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                        <Link href="/partners/restaurants">
                          Partner With Us
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <UtensilsCrossed className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 truncate">
                          {restaurant.cuisines ? restaurant.cuisines[0] : 'Restaurant'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setShowMatchModal(true);
                        }}
                        className="bg-white/95 hover:bg-white backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow border border-purple-200 hover:border-purple-400 transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                        title="Click to see why this matches your taste"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-xs font-bold text-gray-900">
                          {restaurantMatchById.get(restaurant.id)?.matchScore ?? 0}%
                        </span>
                        <span className="text-[10px] text-gray-600">Match</span>
                      </button>
                    </div>
                    
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex items-center gap-1.5">
                        {restaurant.name}
                        {(premiumRestaurantIds.includes(restaurant.id) || premiumRestaurantIds.includes(Number(restaurant.id))) && (
                          <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" title="Featured Restaurant" />
                        )}
                      </h3>
                      <button
                        type="button"
                        aria-label={isBookmarked(restaurant.id) ? 'Saved' : 'Save'}
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
                        className={`flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          isBookmarked(restaurant.id) ? 'text-red-600 bg-red-50' : 'text-gray-400 bg-gray-100 hover:text-red-500'
                        }`}
                        title={isBookmarked(restaurant.id) ? 'Saved' : 'Save'}
                      >
                        <Heart className="w-4 h-4" fill={isBookmarked(restaurant.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                      {restaurant.metaDescription 
                        || restaurant.tagline 
                        || restaurant.summary 
                        || restaurant.description
                        || (restaurant.cuisines?.length > 0 
                            ? `Discover ${restaurant.cuisines.join(' & ')} cuisine at ${restaurant.name}.`
                            : `Experience great dining at ${restaurant.name}.`)}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {restaurant.ratings?.googleRating && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full">
                          <Star className="w-3 h-3" />
                          {restaurant.ratings.googleRating.toFixed(1)}
                        </span>
                      )}
                      {restaurant.pricing?.priceRange && (
                        <span className="inline-flex items-center text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                          {restaurant.pricing.priceRange}
                        </span>
                      )}
                      {restaurant.cuisines && restaurant.cuisines.length > 1 && (
                        <span className="inline-flex items-center text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">
                          {restaurant.cuisines.slice(0, 2).join(' · ')}
                        </span>
                      )}
                    </div>

                    {/* Restaurant Promotion Card */}
                    {restaurant.id && (
                      <div className="mb-4">
                        <RestaurantPromotionCard
                          restaurantId={restaurant.id}
                          compact={true}
                          initialScore={restaurantPromotionScores[restaurant.id] || {
                            restaurant_id: restaurant.id,
                            total_score: 0,
                            monthly_score: 0,
                            weekly_score: 0,
                            past_28_days_score: 0,
                          }}
                        />
                      </div>
                    )}

                    <Link
                      href={`/destinations/${destination.id}/restaurants/${restaurant.slug}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mt-auto"
                    >
                      View Restaurant
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Plan your trip */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-4">
                Plan Your {destination.fullName} Trip
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Pair these restaurants with transportation tips and hotel deals to build a complete Curaçao itinerary.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Car className="w-8 h-8 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Transportation Tips</h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">{destination.gettingAround}</p>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Car Rental Deals in {destination.fullName}</h4>
                    <p className="text-gray-600 text-sm mb-3">Rent a car for maximum flexibility and explore at your own pace on Expedia USA.</p>
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
                    <Hotel className="w-8 h-8 text-purple-600" />
                    <h3 className="text-2xl font-bold text-gray-800">Where to Stay</h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Find the perfect accommodation for your {destination.fullName} adventure. From luxury resorts to cozy guesthouses near the best dining spots, we’ve got you covered.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Best Hotel Deals in {destination.fullName}</h4>
                    <p className="text-gray-600 text-sm mb-3">Discover top-rated hotels with exclusive rates and special offers on Expedia USA.</p>
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

        {/* Related guides replaced with tours */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900 mb-6">
              Popular Tours in {destination.fullName}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              {heroTourText}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {curatedTourCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/destinations/${destination.id}/guides/${formatCategorySlug(category.name)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  {category.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA block */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl shadow-2xl p-10 md:p-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Book Top Tours in {destination.fullName}?
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Pair these dining spots with unforgettable experiences. Browse curated tours, skip-the-line attractions, and sunset cruises tailored to {destination.fullName}.
              </p>
              <Button asChild className="bg-white text-blue-600 hover:bg-gray-100 gap-2 px-8 py-3 text-lg font-semibold">
                <Link href={`/destinations/${destination.id}/tours`}>
                  Discover {destination.fullName} Tours
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <FooterNext />

      <SmartTourFinder isOpen={isModalOpen} onClose={handleCloseModal} />

      {/* Breadcrumb schema is injected server-side in `app/destinations/[id]/restaurants/page.jsx` */}

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

      {/* Category Guides Section - Same style as destination detail page */}
      {categoryGuides && categoryGuides.length > 0 && (
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
                Popular Category Guides in {destination.fullName || destination.name}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                Explore detailed guides for popular tour categories in {destination.fullName || destination.name}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categoryGuides.slice(0, 6).map((guide, index) => {
                const categoryName = guide.category_name || guide.title || '';
                const categorySlug = guide.category_slug || '';
                
                return (
                  <motion.div
                    key={categorySlug || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link href={`/destinations/${destination.id}/guides/${categorySlug}`}>
                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full">
                        <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[120px]">
                          <BookOpen className="w-5 h-5 text-purple-600 mb-2" />
                          <h3 className="font-poppins font-semibold text-gray-800 text-sm md:text-base mb-1">
                            {categoryName}
                          </h3>
                          <p className="text-xs text-purple-600 font-medium">Read Guide</p>
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

      {/* Restaurant Match Modal */}
      <RestaurantMatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        restaurant={selectedRestaurant}
        matchData={selectedRestaurant ? restaurantMatchById.get(selectedRestaurant.id) : null}
        preferences={localRestaurantPreferences}
        onOpenPreferences={() => {
          setShowMatchModal(false);
          setShowPreferencesModal(true);
        }}
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
                <Sparkles className="w-5 h-5 text-purple-600" />
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
                <p className="mt-2 text-[11px] text-gray-500">
                  Tip: click again to clear a selection.
                </p>
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

              <div className="pt-4 mt-2 border-t flex flex-col gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant="ghost"
                    className="w-full text-gray-600 hover:text-gray-900"
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
                    title="Reset to defaults"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPreferencesModal(false)}
                  >
                    Done
                  </Button>
                  <Button
                    className="w-full min-w-0 h-auto py-2 sunset-gradient text-white whitespace-normal break-words leading-tight text-xs"
                    onClick={handleSavePreferencesToProfile}
                    disabled={savingPreferencesToProfile}
                  >
                    {savingPreferencesToProfile ? 'Saving…' : user ? 'Save to Profile' : 'Create account to save'}
                  </Button>
                </div>
                <p className="text-[11px] text-gray-500 text-center">
                  Your preferences are saved on this device automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={`Best Restaurants in ${destination.fullName} - TopTours.ai`}
      />
    </>
  );
}
