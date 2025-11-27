"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  Star, 
  Clock, 
  MapPin, 
  ExternalLink, 
  ArrowRight,
  ArrowLeft,
  Home,
  Calendar,
  UtensilsCrossed,
  Share2,
  TrendingUp,
  Users,
  Heart,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Link from 'next/link';
import { getTourUrl } from '@/utils/tourHelpers';
import { toast } from '@/components/ui/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { getTipById, getAllTips } from '@/data/planTips';
import ShareModal from '@/components/sharing/ShareModal';
import BoostShareModal from '@/components/promotion/BoostShareModal';
import PlanPromotionCard from '@/components/promotion/PlanPromotionCard';

export default function PlanDetailClient({ plan, promotionScore, destination, creatorProfile }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBoostShareModal, setShowBoostShareModal] = useState(false);
  const [lastBoostResult, setLastBoostResult] = useState(null);
  const [promotionScoreState, setPromotionScoreState] = useState(promotionScore);

  // Update promotion score when it changes (for PlanPromotionCard)
  useEffect(() => {
    setPromotionScoreState(promotionScore);
  }, [promotionScore]);

  // Group items by day
  const itemsByDay = useMemo(() => {
    const grouped = {};
    const unassigned = [];
    
    plan.items?.forEach((item) => {
      if (item.day_number) {
        if (!grouped[item.day_number]) {
          grouped[item.day_number] = [];
        }
        grouped[item.day_number].push(item);
      } else {
        unassigned.push(item);
      }
    });

    // Sort items within each day by order_index
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    });

    return { grouped, unassigned };
  }, [plan.items]);

  // Get max day number
  const maxDay = useMemo(() => {
    const days = Object.keys(itemsByDay.grouped).map(Number);
    return days.length > 0 ? Math.max(...days) : 0;
  }, [itemsByDay]);

  // Analyze tips to create dynamic content
  const tipsAnalysis = useMemo(() => {
    const allTips = [];
    const tipsByCategory = {
      reasons: [],
      timing: [],
      booking: [],
      dining: [],
      tips: [],
      transportation: [],
    };

    plan.items?.forEach(item => {
      const itemTips = item.selected_tips || (item.selected_tip ? [item.selected_tip] : []);
      itemTips.forEach(tipId => {
        const tip = getTipById(tipId);
        if (tip) {
          allTips.push(tip);
          // Categorize tips
          if (tip.label.includes('Must-see') || tip.label.includes('Hidden gem') || tip.label.includes('Top-rated') || tip.label.includes('Best value')) {
            tipsByCategory.reasons.push(tip);
          }
          if (tip.label.includes('morning') || tip.label.includes('afternoon') || tip.label.includes('evening') || tip.label.includes('Sunset')) {
            tipsByCategory.timing.push(tip);
          }
          if (tip.label.includes('Reserve') || tip.label.includes('Book') || tip.label.includes('Walk-in')) {
            tipsByCategory.booking.push(tip);
          }
          if (tip.label.includes('dinner') || tip.label.includes('lunch') || tip.label.includes('breakfast') || tip.label.includes('dining')) {
            tipsByCategory.dining.push(tip);
          }
        }
      });
    });

    // Get unique tips
    const uniqueTips = Array.from(new Map(allTips.map(tip => [tip.id, tip])).values());

    return {
      allTips: uniqueTips,
      byCategory: tipsByCategory,
      highlights: uniqueTips.filter(t => 
        t.label.includes('Must-see') || 
        t.label.includes('Hidden gem') || 
        t.label.includes('Top-rated') ||
        t.label.includes('Best value')
      ),
    };
  }, [plan.items]);

  // Check authentication and ownership
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsOwner(user?.id === plan.user_id);
    };
    checkAuth();
  }, [plan.user_id, supabase]);

  // Note: Boost functionality is now handled by PlanPromotionCard component

  // Copy plan to user's plans
  const handleCopyPlan = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to copy this plan.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create a new plan based on this one
      const { createTravelPlan, addPlanItems } = await import('@/lib/travelPlans');
      
      const newPlan = await createTravelPlan(user.id, {
        title: `${plan.title} (Copy)`,
        destination_id: plan.destination_id,
        description: plan.description,
        cover_image_url: plan.cover_image_url,
        is_public: false, // Copy is private by default
      });

      // Copy items
      const itemsToAdd = plan.items?.map(item => ({
        type: item.item_type,
        product_id: item.product_id,
        restaurant_id: item.restaurant_id,
        day_number: item.day_number,
        order_index: item.order_index,
        selected_tip: item.selected_tips?.[0] || item.selected_tip || null,
        selected_tips: item.selected_tips || (item.selected_tip ? [item.selected_tip] : []),
      })) || [];

      if (itemsToAdd.length > 0) {
        await addPlanItems(newPlan.id, itemsToAdd);
      }

      toast({
        title: 'Plan copied!',
        description: 'You can now edit your copy of this plan.',
      });

      // Navigate to edit page (or plan detail)
      router.push(`/plans/${newPlan.slug}`);
    } catch (error) {
      console.error('Error copying plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const planUrl = typeof window !== 'undefined' ? window.location.href : '';
  const planTitle = `${plan.title} - TopTours.ai`;

  return (
    <>
      <NavigationNext />
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Hero Section */}
        <section className="relative -mt-12 sm:-mt-16 pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 md:pb-20 overflow-hidden ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-200" />
                <span className="text-white font-medium">
                  {destination?.fullName || destination?.name || plan.destination_id}
                </span>
              </div>
              
              <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold text-white">
                  {plan.title}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 flex-shrink-0"
                  onClick={() => setShowShareModal(true)}
                  title="Share this plan"
                >
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </div>

              {plan.description && (
                <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-3xl mx-auto">
                  {plan.description}
                </p>
              )}

              <div className="flex items-center justify-center gap-6 text-white/80 text-sm mb-6">
                {creatorProfile && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>by {creatorProfile?.display_name || 'Community Member'}</span>
                  </div>
                )}
                {promotionScoreState && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{promotionScoreState.total_score || 0} points</span>
                  </div>
                )}
                {maxDay > 0 && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{maxDay} Day{maxDay > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {!isOwner && (
                  <Button
                    onClick={handleCopyPlan}
                    className="bg-white text-blue-600 hover:bg-gray-100 gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy to My Plans
                  </Button>
                )}
                {destination && (
                  <Button
                    asChild
                    className="bg-white text-blue-600 hover:bg-gray-100 gap-2 font-semibold"
                  >
                    <Link href={`/destinations/${destination.id}`} className="flex items-center">
                      Explore {destination.fullName || destination.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
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
              <Link href="/plans" className="text-gray-500 hover:text-gray-700">Plans</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{plan.title}</span>
            </nav>
          </div>
        </section>

        {/* Plan Content */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Days */}
                {Object.keys(itemsByDay.grouped).sort((a, b) => Number(a) - Number(b)).map((dayNum) => {
                  const dayItems = itemsByDay.grouped[dayNum];
                  return (
                    <motion.div
                      key={dayNum}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: Number(dayNum) * 0.1 }}
                      className="mb-12"
                    >
                      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">
                        Day {dayNum}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dayItems.map((item, index) => (
                          <PlanItemCard key={item.id} item={item} index={index} />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Unassigned Items */}
                {itemsByDay.unassigned.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                  >
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">
                      Additional Recommendations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {itemsByDay.unassigned.map((item, index) => (
                        <PlanItemCard key={item.id} item={item} index={index} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Sidebar - Destination Card with Promotion */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-6">
                  {/* Plan Promotion Card - Exact same as tour promotion card */}
                  <PlanPromotionCard 
                    planId={plan.id} 
                    initialScore={promotionScoreState}
                    planData={plan}
                  />

                  {/* Destination Card - Exact same as tour detail page */}
                  {destination && (
                    <Card className="bg-white border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                          alt={destination.fullName || destination.name}
                          src={destination.imageUrl || "https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/toptours%20destinations.png"}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = "https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/toptours%20destinations.png";
                          }}
                        />
                        {destination.category && (
                          <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                            {destination.category}
                          </Badge>
                        )}
                        {destination.country && (
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                            <span className="text-sm font-medium text-gray-800">{destination.country}</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6 flex flex-col">
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="font-semibold">{destination.fullName || destination.name}</span>
                        </div>
                        <p className="text-gray-700 mb-4 flex-grow">
                          {destination.briefDescription || `Discover more tours and activities in ${destination.fullName || destination.name}`}
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 bg-transparent transition-all duration-200 h-12 text-base font-semibold"
                        >
                          <Link href={`/destinations/${destination.id}`}>
                            Explore {destination.name}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Generic Explore All Destinations Card (for destinations without data) */}
                  {!destination && (
                    <Card className="bg-white border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className="relative h-32 overflow-hidden">
                        <img 
                          className="w-full h-full object-cover" 
                          alt={plan.destination_id || "Explore destinations"}
                          src="https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/toptours%20destinations.png"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
                          }}
                        />
                      </div>
                      <CardContent className="p-6 flex flex-col">
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="font-semibold">
                            {plan.destination_id || 'Explore Destinations'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4 flex-grow">
                          {plan.destination_id 
                            ? `Discover more tours and activities in ${plan.destination_id}`
                            : 'Discover incredible tours and activities in 3300+ destinations around the world'}
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 bg-transparent transition-all duration-200 h-12 text-base font-semibold"
                        >
                          <Link href={plan.destination_id ? `/destinations/${plan.destination_id}` : "/destinations"}>
                            {plan.destination_id 
                              ? `Explore ${plan.destination_id}`
                              : 'Explore All Destinations'}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <FooterNext />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={planUrl}
        title={planTitle}
      />

      {/* Boost Share Modal */}
      {lastBoostResult && (
        <BoostShareModal
          isOpen={showBoostShareModal}
          onClose={() => setShowBoostShareModal(false)}
          itemName={lastBoostResult.planTitle}
          points={lastBoostResult.points}
          itemUrl={lastBoostResult.planUrl}
          itemType="plan"
        />
      )}
    </>
  );
}

// Plan Item Card Component
function PlanItemCard({ item, index }) {
  // Support both old (selected_tip) and new (selected_tips) format
  const itemTips = item.selected_tips || (item.selected_tip ? [item.selected_tip] : []);
  const tips = itemTips.map(tipId => getTipById(tipId)).filter(Boolean);

  if (item.item_type === 'tour' && item.tourData) {
    const tour = item.tourData;
    const tourUrl = `/tours/${item.product_id}/${tour.slug || ''}`;
    const image = tour.images?.[0]?.variants?.[3]?.url || tour.images?.[0]?.variants?.[0]?.url || '';
    const rating = tour.reviews?.combinedAverageRating || 0;
    const reviewCount = tour.reviews?.totalReviews || 0;
    const price = tour.pricing?.summary?.fromPrice || tour.price || 0;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          {image && (
            <img
              src={image}
              alt={tour.title}
              className="w-full h-48 object-cover"
            />
          )}
          {tips.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end max-w-[60%]">
              {tips.slice(0, 2).map((tip) => {
                const TipIcon = tip.icon;
                return (
                  <Badge 
                    key={tip.id}
                    className="bg-white/90 text-gray-900 flex items-center gap-1 text-xs"
                  >
                    {TipIcon && <TipIcon className="w-3 h-3" />}
                    {tip.label}
                  </Badge>
                );
              })}
              {tips.length > 2 && (
                <Badge className="bg-white/90 text-gray-900 text-xs">
                  +{tips.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 text-gray-900">{tour.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
                {reviewCount > 0 && <span>({reviewCount.toLocaleString()})</span>}
              </div>
            )}
            {price > 0 && (
              <div className="flex items-center gap-1">
                <span>From ${price}</span>
              </div>
            )}
          </div>
          {tips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tips.map((tip) => {
                const TipIcon = tip.icon;
                return (
                  <Badge
                    key={tip.id}
                    variant="outline"
                    className="border-blue-300 text-blue-700 text-xs px-2 py-0.5 flex items-center gap-1"
                  >
                    {TipIcon && <TipIcon className="w-3 h-3" />}
                    {tip.label}
                  </Badge>
                );
              })}
            </div>
          )}
          <Button asChild className="w-full" variant="outline">
            <Link href={tourUrl}>
              View Tour Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (item.item_type === 'restaurant' && item.restaurantData) {
    const restaurant = item.restaurantData;
    const restaurantUrl = `/destinations/${restaurant.destination_id}/restaurants/${restaurant.slug}`;
    const image = restaurant.heroImage || restaurant.hero_image_url || '';
    const rating = restaurant.ratings?.googleRating || restaurant.google_rating || 0;
    const reviewCount = restaurant.ratings?.reviewCount || restaurant.review_count || 0;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          {image && (
            <img
              src={image}
              alt={restaurant.name}
              className="w-full h-48 object-cover"
            />
          )}
          {tips.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end max-w-[60%]">
              {tips.slice(0, 2).map((tip) => {
                const TipIcon = tip.icon;
                return (
                  <Badge 
                    key={tip.id}
                    className="bg-white/90 text-gray-900 flex items-center gap-1 text-xs"
                  >
                    {TipIcon && <TipIcon className="w-3 h-3" />}
                    {tip.label}
                  </Badge>
                );
              })}
              {tips.length > 2 && (
                <Badge className="bg-white/90 text-gray-900 text-xs">
                  +{tips.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <UtensilsCrossed className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-lg text-gray-900">{restaurant.name}</h3>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
              {reviewCount > 0 && <span>({reviewCount.toLocaleString()})</span>}
            </div>
          )}
          {tips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tips.map((tip) => {
                const TipIcon = tip.icon;
                return (
                  <Badge
                    key={tip.id}
                    variant="outline"
                    className="border-orange-300 text-orange-700 text-xs px-2 py-0.5 flex items-center gap-1"
                  >
                    {TipIcon && <TipIcon className="w-3 h-3" />}
                    {tip.label}
                  </Badge>
                );
              })}
            </div>
          )}
          <Button asChild className="w-full" variant="outline">
            <Link href={restaurantUrl}>
              View Restaurant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Fallback for items without data
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-gray-500">Loading {item.item_type}...</p>
      </CardContent>
    </Card>
  );
}

