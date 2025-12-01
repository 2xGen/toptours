'use client';

import React from 'react';
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

export default function RestaurantsListClient({ destination, restaurants, trendingTours = [], trendingRestaurants = [], restaurantPromotionScores = {} }) {
  const { isBookmarked, toggle } = useRestaurantBookmarks();
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showStickyButton, setShowStickyButton] = React.useState(true);
  const [showShareModal, setShowShareModal] = React.useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const zanzibarRestaurant = restaurants.find((restaurant) => restaurant.slug === 'zanzibar-beach-restaurant-curacao');
  const heroTourText = `Pair dinner at ${zanzibarRestaurant?.shortName || zanzibarRestaurant?.name || destination.fullName} with these top-rated experiences in ${destination.fullName}.`;

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
        name: `Best Restaurants in ${destination.fullName}`,
        item: `https://toptours.ai/destinations/${destination.id}/restaurants`,
      },
    ],
  };

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
                                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
                                  {trending.restaurant_name || `Restaurant #${restaurantId}`}
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
                View {restaurants.length} of Top Restaurants in {destination.fullName}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Discover our curated selection of the best dining experiences in {destination.fullName}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        {restaurant.cuisines ? restaurant.cuisines[0] : 'Restaurant'}
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {restaurant.name}
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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

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
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={`Best Restaurants in ${destination.fullName} - TopTours.ai`}
      />
    </>
  );
}
