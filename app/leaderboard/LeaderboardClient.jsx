"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Calendar, Globe, ArrowLeft, ArrowRight, Star, Clock, Zap, User, ChevronLeft, ChevronRight, Flame, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import TourPromotionCard from '@/components/promotion/TourPromotionCard';
import { getTourUrl } from '@/utils/tourHelpers';

export default function LeaderboardClient({ initialTours = [], initialRestaurants = [], initialBoosts = [], topPromoters = [], scoreType = 'all', region = null, section = 'tours' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedType, setSelectedType] = useState(scoreType);
  const [selectedRegion, setSelectedRegion] = useState(region);
  const [selectedSection, setSelectedSection] = useState(section);
  const [toursWithDetails, setToursWithDetails] = useState(initialTours);
  const [restaurantsWithDetails, setRestaurantsWithDetails] = useState(initialRestaurants);
  const [recentBoosts, setRecentBoosts] = useState(initialBoosts);
  const [topPromotersList, setTopPromotersList] = useState(topPromoters);
  const [showAllPromoters, setShowAllPromoters] = useState(false);
  const [boostCarouselIndex, setBoostCarouselIndex] = useState(0);

  const scoreTypeOptions = [
    { value: 'all', label: 'All Time', icon: Trophy },
    { value: 'monthly', label: 'This Month', icon: Calendar },
    { value: 'weekly', label: 'This Week', icon: TrendingUp },
    { value: 'last_month', label: 'Last Month(s)', icon: Calendar },
  ];

  const regionOptions = [
    { value: null, label: 'All Regions' },
    { value: 'caribbean', label: 'Caribbean' },
    { value: 'europe', label: 'Europe' },
    { value: 'north_america', label: 'North America' },
    { value: 'asia', label: 'Asia' },
    { value: 'south_america', label: 'South America' },
  ];

  // Update tours when initialTours changes (from server-side fetch)
  useEffect(() => {
    setToursWithDetails(initialTours);
  }, [initialTours]);

  // Update restaurants when initialRestaurants changes (from server-side fetch)
  useEffect(() => {
    setRestaurantsWithDetails(initialRestaurants);
  }, [initialRestaurants]);

  // Update boosts when initialBoosts changes (from server-side fetch)
  useEffect(() => {
    setRecentBoosts(initialBoosts);
  }, [initialBoosts]);

  // Update top promoters when prop changes
  useEffect(() => {
    setTopPromotersList(topPromoters);
  }, [topPromoters]);

  const updateURL = (params) => {
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    // Use window.history.replaceState to update URL without scrolling
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    const params = new URLSearchParams();
    params.set('type', type);
    params.set('section', selectedSection);
    if (selectedRegion) params.set('region', selectedRegion);
    updateURL(params);
  };

  const handleRegionChange = (reg) => {
    setSelectedRegion(reg);
    const params = new URLSearchParams();
    params.set('type', selectedType);
    params.set('section', selectedSection);
    if (reg) params.set('region', reg);
    updateURL(params);
  };

  const handleSectionChange = (sec) => {
    setSelectedSection(sec);
    const params = new URLSearchParams();
    params.set('type', selectedType);
    params.set('section', sec);
    if (selectedRegion) params.set('region', selectedRegion);
    updateURL(params);
  };

  const getScoreLabel = (tour) => {
    switch (selectedType) {
      case 'monthly':
        return tour.monthly_score || 0;
      case 'weekly':
        return tour.weekly_score || 0;
      case 'last_month':
        return tour.past_28_days_score || 0; // Using past_28_days for "last month(s)"
      default:
        return tour.total_score || 0;
    }
  };

  const getTourImage = (tourData) => {
    if (!tourData) return null;
    return tourData.images?.[0]?.variants?.[3]?.url || 
           tourData.images?.[0]?.variants?.[0]?.url || 
           null;
  };

  const getTourTitle = (tourData, productId) => {
    if (!tourData) return `Tour #${productId}`;
    
    // Try multiple possible title fields
    const title = tourData.seo?.title || 
                  tourData.title || 
                  tourData.productContent?.title ||
                  tourData.productContent?.productName ||
                  tourData.productContent?.name ||
                  tourData.name ||
                  `Tour #${productId}`;
    return title;
  };

  const getTourRating = (tourData) => {
    if (!tourData) return null;
    return tourData.reviews?.averageRating || 
           tourData.reviewSummary?.averageRating || 
           null;
  };

  const getTourReviewCount = (tourData) => {
    if (!tourData) return null;
    return tourData.reviews?.totalReviews || 
           tourData.reviewSummary?.totalReviews || 
           null;
  };

  const getTourDuration = (tourData) => {
    if (!tourData) return null;
    const duration = tourData.duration?.fixedDurationInMinutes || 
                     tourData.itinerary?.duration?.fixedDurationInMinutes ||
                     null;
    if (!duration) return null;
    
    if (duration < 60) return `${duration}m`;
    if (duration < 1440) return `${Math.floor(duration / 60)}h`;
    return `${Math.floor(duration / 1440)}d`;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationNext />
      
      <div className="min-h-screen" suppressHydrationWarning>
        {/* Hero Section */}
        <section className="pt-24 pb-16 ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Trophy className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Top Tours & Restaurants Leaderboard</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white mb-6">
                The Competition is On!
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                Join our growing community competing to promote the best tours and restaurants. Every boost counts. Every point matters. <span className="font-bold">Will you make it to the top?</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-bold px-8 py-6 text-lg shadow-xl hover:scale-105 transition-transform border border-white/30">
                  <Link href="/profile?tab=plan">
                    <Zap className="w-5 h-5 mr-2" />
                    Start Competing
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-bold px-8 py-6 text-lg">
                  <Link href="/how-it-works">
                    How It Works
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Leaderboard</span>
            </nav>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        {/* Recent Boosts Section */}
        {recentBoosts.length > 0 && (
          <section className="mb-16 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-orange-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Live Activity</h2>
                <p className="text-sm text-gray-600">See who's boosting right now</p>
              </div>
            </div>
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${boostCarouselIndex * 100}%)` }}
                >
                  {recentBoosts.map((boost, index) => {
                    // Check if this is a restaurant promotion
                    const isRestaurant = !!boost.restaurant_id;
                    const restaurantData = boost.restaurantData;
                    const tourData = boost.tourData;
                    
                    // Get image, title, and URL based on type
                    let image, title, itemUrl, itemType;
                    if (isRestaurant) {
                      // Handle restaurant promotions - even if restaurantData is null
                      image = restaurantData?.image || null;
                      title = restaurantData?.name || `Restaurant #${boost.restaurant_id}`;
                      const destSlug = restaurantData?.destination_slug || restaurantData?.destination_id || boost.destination_id;
                      itemUrl = restaurantData?.slug && destSlug
                        ? `/destinations/${destSlug}/restaurants/${restaurantData.slug}`
                        : destSlug
                        ? `/destinations/${destSlug}/restaurants`
                        : '/restaurants';
                      itemType = 'restaurant';
                    } else {
                      image = getTourImage(tourData);
                      title = getTourTitle(tourData, boost.product_id);
                      itemUrl = tourData?.slug 
                        ? `/tours/${boost.product_id}/${tourData.slug}`
                        : (tourData ? getTourUrl(boost.product_id, title) : `/tours/${boost.product_id}`);
                      itemType = 'tour';
                    }
                    
                    const displayName = boost.profiles?.display_name?.trim();
                    const userName = displayName && displayName.length > 0 
                      ? displayName 
                      : (boost.user_email || 'Anonymous');
                    const timeAgo = getTimeAgo(new Date(boost.created_at));
                    const pointsSpent = boost.points_spent || 0;
                    const tier = boost.tier || 'explorer';
                    const streakDays = boost.streak_days || 0;
                    
                    // Tier badge config
                    const tierConfig = {
                      explorer: { label: 'Free', color: 'bg-gray-100 text-gray-700', icon: Star },
                      pro_booster: { label: 'Pro', color: 'bg-blue-100 text-blue-700', icon: Zap },
                      pro_plus: { label: 'Pro+', color: 'bg-purple-100 text-purple-700', icon: Zap },
                      enterprise: { label: 'Enterprise', color: 'bg-yellow-100 text-yellow-700', icon: Crown },
                    };
                    const tierInfo = tierConfig[tier] || tierConfig.explorer;
                    const TierIcon = tierInfo.icon;

                    return (
                      <div
                        key={boost.id}
                        className="w-full flex-shrink-0 px-2"
                      >
                        <Card className="hover:shadow-lg transition-all bg-white">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                              {/* Thumbnail */}
                              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = isRestaurant 
                                        ? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
                                        : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                                    {isRestaurant ? (
                                      <Star className="w-8 h-8 text-orange-300" />
                                    ) : (
                                      <Trophy className="w-8 h-8 text-orange-300" />
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 w-full relative">
                                {/* Title with Type Badge - Full width on mobile */}
                                <div className="flex items-center gap-2 mb-2 pr-0 sm:pr-24 flex-wrap">
                                  {/* Restaurant or Tour Badge */}
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                                    isRestaurant 
                                      ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                                  }`}>
                                    {isRestaurant ? (
                                      <>
                                        <Star className="w-3 h-3" />
                                        Restaurant
                                      </>
                                    ) : (
                                      <>
                                        <Trophy className="w-3 h-3" />
                                        Tour
                                      </>
                                    )}
                                  </span>
                                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-base sm:text-sm flex-1 min-w-0">
                                    {title}
                                  </h3>
                                </div>
                                
                                {/* User Info - Better styled */}
                                <div className="space-y-2 pr-0 sm:pr-24">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                      <User className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-900">{userName}</span>
                                    </div>
                                    
                                    {/* Tier Badge */}
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${tierInfo.color}`}>
                                      <TierIcon className="w-3 h-3" />
                                      {tierInfo.label}
                                    </span>
                                    
                                    {/* Streak Badge */}
                                    {streakDays > 0 && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                        <Flame className="w-3 h-3" />
                                        {streakDays} day{streakDays !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    {pointsSpent > 0 && (
                                      <>
                                        <span className="font-semibold text-orange-600">{pointsSpent} points</span>
                                        <span>•</span>
                                      </>
                                    )}
                                    <span>{timeAgo}</span>
                                  </div>
                                </div>
                                
                                {/* View Button - Full width on mobile, absolute on desktop */}
                                <Link href={itemUrl} className="block mt-3 sm:mt-0 sm:absolute sm:top-0 sm:right-0">
                                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                    {isRestaurant ? 'View Restaurant' : 'View Tour'}
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Arrows */}
              {recentBoosts.length > 1 && (
                <>
                  <button
                    onClick={() => setBoostCarouselIndex((prev) => Math.max(0, prev - 1))}
                    disabled={boostCarouselIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
                    aria-label="Previous boost"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setBoostCarouselIndex((prev) => Math.min(recentBoosts.length - 1, prev + 1))}
                    disabled={boostCarouselIndex === recentBoosts.length - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
                    aria-label="Next boost"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}

              {/* Carousel Indicators */}
              {recentBoosts.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {recentBoosts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setBoostCarouselIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === boostCarouselIndex
                          ? 'w-8 bg-orange-600'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to boost ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Top Promoters Section */}
        {topPromotersList && topPromotersList.length > 0 && (
          <section className="mb-16 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-6 h-6 text-orange-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Top Promoters</h2>
                <p className="text-sm text-gray-600">The champions leading the competition</p>
              </div>
            </div>
            <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(showAllPromoters ? topPromotersList : topPromotersList.slice(0, 5)).map((promoter, index) => {
                const tier = promoter.tier || 'explorer';
                const streakDays = promoter.streak_days || 0;
                
                // Tier badge config (same as Recent Boosts)
                const tierConfig = {
                  explorer: { label: 'Free', color: 'bg-gray-100 text-gray-700', icon: Star },
                  pro_booster: { label: 'Pro', color: 'bg-blue-100 text-blue-700', icon: Zap },
                  pro_plus: { label: 'Pro+', color: 'bg-purple-100 text-purple-700', icon: Zap },
                  enterprise: { label: 'Enterprise', color: 'bg-yellow-100 text-yellow-700', icon: Crown },
                };
                const tierInfo = tierConfig[tier] || tierConfig.explorer;
                const TierIcon = tierInfo.icon;
                
                return (
                  <div
                    key={promoter.user_id}
                    className={`flex flex-col gap-2 p-4 rounded-lg border transition-all ${
                      index === 0 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300 shadow-md' 
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:border-orange-300'
                        : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className={`w-6 h-6 flex-shrink-0 ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-orange-500' :
                        'text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-gray-900">
                          {promoter.display_name || 'Anonymous'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Tier Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tierInfo.color}`}>
                        <TierIcon className="w-3 h-3" />
                        {tierInfo.label}
                      </span>
                      
                      {/* Streak Badge */}
                      {streakDays > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <Flame className="w-3 h-3" />
                          {streakDays}
                        </span>
                      )}
                    </div>
                    
                    {/* Points */}
                    <p className="text-xs font-semibold text-gray-600">
                      {promoter.total_points_spent.toLocaleString()} points
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Show More/Less Button */}
            {topPromotersList.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllPromoters(!showAllPromoters)}
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 mx-auto"
                >
                  {showAllPromoters ? (
                    <>
                      Show Less
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      View Top 20
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
            </div>
          </section>
        )}

        {/* Section Selector (Tours vs Restaurants) */}
        <section className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">View Leaderboard</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSectionChange('tours')}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 transition-all font-medium ${
                selectedSection === 'tours'
                  ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Tours</span>
            </button>
            <button
              onClick={() => handleSectionChange('restaurants')}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 transition-all font-medium ${
                selectedSection === 'restaurants'
                  ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
              }`}
            >
              <Star className="w-5 h-5" />
              <span className="font-semibold">Restaurants</span>
            </button>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-16 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Score Type Selector */}
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Time Period
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {scoreTypeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleTypeChange(option.value)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                          selectedType === option.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Region Selector */}
              <div className="md:w-48">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Region
                </label>
                <select
                  value={selectedRegion || ''}
                  onChange={(e) => handleRegionChange(e.target.value || null)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                {regionOptions.map((option) => (
                  <option key={option.value || 'all'} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-orange-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedSection === 'restaurants' ? 'Restaurants' : 'Tours'} Leaderboard
                </h2>
                <p className="text-gray-600">Rankings based on community promotion</p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
              <Link href="/profile?tab=plan">
                <Zap className="w-4 h-4 mr-2" />
                Join Competition
              </Link>
            </Button>
          </div>
          {selectedSection === 'restaurants' ? (
            restaurantsWithDetails.length === 0 ? (
              <div className="p-12 text-center">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">No restaurants found yet.</p>
                <p className="text-gray-500 mb-6">Be the first to promote a restaurant and claim the #1 spot!</p>
                <Button asChild className="sunset-gradient text-white">
                  <Link href="/restaurants">
                    Find Restaurants to Promote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {restaurantsWithDetails.map((restaurant, index) => {
                  const score = getScoreLabel(restaurant);
                  const rank = index + 1;
                  const restaurantData = restaurant.restaurantData;
                  const image = restaurantData?.image || null;
                  const name = restaurantData?.name || `Restaurant #${restaurant.restaurant_id}`;
                  const destSlug = restaurantData?.destination_slug || restaurantData?.destination_id || restaurant.destination_id;
                  const restaurantUrl = restaurantData?.slug && destSlug
                    ? `/destinations/${destSlug}/restaurants/${restaurantData.slug}`
                    : `/destinations/${destSlug}/restaurants`;

                  return (
                    <motion.div
                      key={restaurant.restaurant_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 h-full">
                        <CardContent className="p-0 h-full">
                          <div className="flex flex-col md:flex-row h-full">
                            {/* Rank Badge */}
                            <div className="flex-shrink-0 flex items-center justify-center md:justify-start p-4 md:p-6 bg-gray-50 md:bg-transparent">
                              {rank <= 3 ? (
                                <Trophy className={`w-12 h-12 ${
                                  rank === 1 ? 'text-yellow-500' :
                                  rank === 2 ? 'text-gray-400' :
                                  'text-orange-500'
                                }`} />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-md">
                                  <span className="text-xl font-bold text-gray-700">{rank}</span>
                                </div>
                              )}
                            </div>

                            {/* Image */}
                            <div className="flex-shrink-0 w-full md:w-48 h-48 md:h-48">
                              {image ? (
                                <img
                                  src={image}
                                  alt={name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                                  <Star className="w-16 h-16 text-orange-300" />
                                </div>
                              )}
                            </div>

                            {/* Restaurant Info */}
                            <div className="flex-1 p-5 md:p-6 flex flex-col">
                              <div className="flex-1">
                                <Link
                                  href={restaurantUrl}
                                  className="text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors mb-2 block line-clamp-2"
                                >
                                  {name}
                                </Link>

                                {restaurant.region && (
                                  <Badge variant="outline" className="mb-3 w-fit">
                                    <Globe className="w-3 h-3 mr-1" />
                                    {restaurant.region.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Badge>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-3 mt-auto">
                                <Button
                                  asChild
                                  className="flex-1 sunset-gradient text-white hover:scale-105 transition-transform duration-200"
                                >
                                  <Link href={restaurantUrl}>
                                    View Restaurant
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </Link>
                                </Button>
                              </div>
                            </div>

                            {/* Score Badge */}
                            <div className="flex-shrink-0 p-5 md:p-6 flex items-center justify-center md:justify-end bg-gray-50 md:bg-transparent">
                              <div className={`rounded-lg px-4 py-3 border-2 shadow-md ${
                                rank === 1 
                                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                                  : rank === 2
                                  ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
                                  : rank === 3
                                  ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300'
                                  : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200'
                              }`}>
                                <div className="flex flex-col items-center">
                                  <Trophy className={`w-6 h-6 mb-1 ${
                                    rank === 1 ? 'text-yellow-500' :
                                    rank === 2 ? 'text-gray-400' :
                                    rank === 3 ? 'text-orange-500' :
                                    'text-orange-600'
                                  }`} />
                                  <div className={`text-2xl font-bold ${
                                    rank === 1 ? 'text-yellow-600' :
                                    rank === 2 ? 'text-gray-700' :
                                    rank === 3 ? 'text-orange-600' :
                                    'text-orange-600'
                                  }`}>
                                    {score.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">points</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )
          ) : (
            toursWithDetails.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">No tours found yet.</p>
                <p className="text-gray-500 mb-6">Be the first to promote a tour and claim the #1 spot!</p>
                <Button asChild className="sunset-gradient text-white">
                  <Link href="/destinations">
                    Find Tours to Promote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {toursWithDetails.map((tour, index) => {
              const score = getScoreLabel(tour);
              const rank = index + 1;
              const tourData = tour.tourData;
              const image = getTourImage(tourData);
              const title = getTourTitle(tourData, tour.product_id);
              const rating = getTourRating(tourData);
              const reviewCount = getTourReviewCount(tourData);
              const duration = getTourDuration(tourData);
              // Use slug from cached data if available, otherwise generate from title
              const tourUrl = tourData?.slug 
                ? `/tours/${tour.product_id}/${tourData.slug}`
                : (tourData ? getTourUrl(tour.product_id, title) : `/tours/${tour.product_id}`);

              return (
                <motion.div
                  key={tour.product_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 h-full">
                    <CardContent className="p-0 h-full">
                      <div className="flex flex-col md:flex-row h-full">
                        {/* Rank Badge */}
                        <div className="flex-shrink-0 flex items-center justify-center md:justify-start p-4 md:p-6 bg-gray-50 md:bg-transparent">
                          {rank <= 3 ? (
                            <Trophy className={`w-12 h-12 ${
                              rank === 1 ? 'text-yellow-500' :
                              rank === 2 ? 'text-gray-400' :
                              'text-orange-500'
                            }`} />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-md">
                              <span className="text-xl font-bold text-gray-700">{rank}</span>
                            </div>
                          )}
                        </div>

                        {/* Image */}
                        <div className="flex-shrink-0 w-full md:w-48 h-48 md:h-48">
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                              <Trophy className="w-16 h-16 text-orange-300" />
                            </div>
                          )}
                        </div>

                        {/* Tour Info */}
                        <div className="flex-1 p-5 md:p-6 flex flex-col">
                          <div className="flex-1">
                            <Link
                              href={tourUrl}
                              className="text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors mb-2 block line-clamp-2"
                            >
                              {title}
                            </Link>

                            {/* Rating and Duration */}
                            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                              {rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="font-medium">{rating.toFixed(1)}</span>
                                  {reviewCount && (
                                    <span className="text-gray-500">
                                      ({reviewCount.toLocaleString()})
                                    </span>
                                  )}
                                </div>
                              )}
                              {duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{duration}</span>
                                </div>
                              )}
                            </div>

                            {tour.region && (
                              <Badge variant="outline" className="mb-3 w-fit">
                                <Globe className="w-3 h-3 mr-1" />
                                {tour.region.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            )}

                            {/* Promotion Card */}
                            <div className="mb-4">
                              <TourPromotionCard productId={tour.product_id} compact={true} />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 mt-auto">
                            <Button
                              asChild
                              className="flex-1 sunset-gradient text-white hover:scale-105 transition-transform duration-200"
                            >
                              <Link href={tourUrl}>
                                View Tour
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Link>
                            </Button>
                          </div>
                        </div>

                        {/* Score Badge */}
                        <div className="flex-shrink-0 p-5 md:p-6 flex items-center justify-center md:justify-end bg-gray-50 md:bg-transparent">
                          <div className={`rounded-lg px-4 py-3 border-2 shadow-md ${
                            rank === 1 
                              ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                              : rank === 2
                              ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
                              : rank === 3
                              ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300'
                              : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200'
                          }`}>
                            <div className="flex flex-col items-center">
                              <Trophy className={`w-6 h-6 mb-1 ${
                                rank === 1 ? 'text-yellow-500' :
                                rank === 2 ? 'text-gray-400' :
                                rank === 3 ? 'text-orange-500' :
                                'text-orange-600'
                              }`} />
                              <div className={`text-2xl font-bold ${
                                rank === 1 ? 'text-yellow-600' :
                                rank === 2 ? 'text-gray-700' :
                                rank === 3 ? 'text-orange-600' :
                                'text-orange-600'
                              }`}>
                                {score.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">points</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
                })}
              </div>
            )
          )}
        </section>
        </div>
      </div>

      <FooterNext />
    </div>
  );
}
