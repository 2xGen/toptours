"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, Clock, ArrowRight, Heart, Crown, Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/components/ui/use-toast';
import { getTourUrl } from '@/utils/tourHelpers';
import TourMatchModal from '@/components/tour/TourMatchModal';

// Helper functions for tour duration
const getTourDurationMinutes = (tourItem) => {
  return tourItem?.itinerary?.duration?.fixedDurationInMinutes ||
    tourItem?.duration?.fixedDurationInMinutes ||
    tourItem?.duration?.variableDurationFromMinutes ||
    tourItem?.duration?.variableDurationToMinutes ||
    (typeof tourItem?.duration === 'number' ? tourItem.duration : null) ||
    tourItem?.logistics?.duration?.fixedDurationInMinutes ||
    tourItem?.productContent?.duration?.fixedDurationInMinutes ||
    tourItem?.productContent?.duration?.value ||
    null;
};

const formatDurationLabel = (minutes) => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export default function TourCard({ 
  tour, 
  isFeatured = false, 
  destination, 
  promotionScores = {}, 
  effectiveDestinationId = null, 
  premiumOperatorTourIds = [], 
  matchScore = null, 
  user = null, 
  userPreferences = null, 
  onOpenPreferences = null, 
  isPromoted = false 
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [showMatchModal, setShowMatchModal] = useState(false);
  const productId = tour.productId || tour.productCode || tour.product_id;
  const tourUrl = tour.slug 
    ? `/tours/${productId}/${tour.slug}` 
    : getTourUrl(productId, tour.seo?.title || tour.title || tour.tour_name);
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();
  const isSaved = isBookmarked(productId);
  
  const image = tour.images?.[0]?.variants?.[3]?.url || 
                tour.images?.[0]?.variants?.[0]?.url || 
                tour.tour_image_url ||
                destination?.imageUrl || '';
  const rating = tour.reviews?.combinedAverageRating || tour.rating || 0;
  const reviewCount = tour.reviews?.totalReviews || tour.review_count || 0;
  const price = tour.pricing?.summary?.fromPrice || tour.price || 0;
  const originalPrice = tour.pricing?.summary?.fromPriceBeforeDiscount || null;
  const hasDiscount = originalPrice && originalPrice > price;
  const title = tour.seo?.title || tour.title || tour.tour_name || 'Tour';
  // Check description in multiple locations - API responses vary
  const description = tour.description || tour.seo?.description || tour.content?.heroDescription || tour.content?.description || '';
  
  // Check if this tour has premium operator status
  const isPremiumOperator = premiumOperatorTourIds.includes(productId);
  
  // Get flags from tour
  const flags = tour.flags || tour.specialFlags || [];
  const displayFlags = flags.filter((flag) => flag !== 'SPECIAL_OFFER');
  
  // Map flag values to display info
  const getFlagInfo = (flagValue) => {
    const flagMap = {
      'FREE_CANCELLATION': { label: 'Free Cancellation', icon: '✓', color: 'bg-green-500' },
      'LIKELY_TO_SELL_OUT': { label: 'Likely to Sell Out', icon: '🔥', color: 'bg-orange-500' },
      'SKIP_THE_LINE': { label: 'Skip The Line', icon: '⚡', color: 'bg-blue-500' },
      'PRIVATE_TOUR': { label: 'Private Tour', icon: '👤', color: 'bg-purple-500' },
      'NEW_ON_VIATOR': { label: 'New', icon: '✨', color: 'bg-pink-500' },
      'SPECIAL_OFFER': { label: 'Special Offer', icon: '💰', color: 'bg-yellow-500' }
    };
    return flagMap[flagValue] || { label: flagValue, icon: '', color: 'bg-gray-500' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
    >
      <Card className="bg-white border-0 shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300">
        <Link href={tourUrl}>
          <div className="relative h-48 overflow-hidden">
            {image && (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            )}
            {/* Promoted Badge - Highest priority */}
            {isPromoted && (
              <Badge className="absolute top-3 left-3 ocean-gradient text-white z-20">
                <Sparkles className="w-3 h-3 mr-1" />
                Promoted
              </Badge>
            )}
            {isFeatured && !isPromoted && (
              <Badge className="absolute top-3 left-3 adventure-gradient text-white z-20">
                <Crown className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {isPremiumOperator && !isFeatured && !isPromoted && (
              <div className="absolute top-3 left-3 z-20">
                <Crown className="w-5 h-5 text-amber-500 drop-shadow-lg" title="Premium Operator" />
              </div>
            )}
            {/* Match Score Badge - Left side, always visible (below promoted badge if present) */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMatchModal(true);
              }}
              className={`absolute ${isPromoted ? 'top-12' : 'top-3'} left-3 z-30 bg-white/95 hover:bg-white backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg border border-purple-200 hover:border-purple-400 transition-all cursor-pointer flex items-center gap-1.5`}
              title={matchScore && matchScore.score !== undefined
                ? `Click to see why this is a ${matchScore.score}% match` 
                : "Click to see AI match analysis"}
            >
              <Sparkles className={`w-3.5 h-3.5 ${
                user && userPreferences && matchScore && matchScore.score >= 70
                  ? 'text-purple-600'
                  : user && userPreferences && matchScore
                  ? 'text-purple-500'
                  : 'text-gray-500'
              }`} />
              {matchScore && matchScore.score !== undefined ? (
                <>
                  <span className="text-xs font-bold text-gray-900">{matchScore.score}%</span>
                  <span className="text-[10px] text-gray-600">
                    {user && userPreferences ? 'for You' : 'Match'}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-600">AI Match</span>
              )}
            </button>
            
            {/* Price + Special Offer - Right side (stacked) */}
            {price > 0 && (
              <div className="absolute top-3 right-3 z-20">
                <div className="flex flex-col items-end gap-1" suppressHydrationWarning>
                  {hasDiscount && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide bg-rose-600 text-white rounded-full shadow">
                      <span>💸</span>
                      <span>Special Offer</span>
                    </span>
                  )}
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                    <div className="flex flex-col items-end">
                      {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">
                          ${typeof originalPrice === 'number' ? originalPrice.toLocaleString('en-US') : originalPrice}
                        </span>
                      )}
                      <span className="text-sm font-bold text-orange-600">
                        From ${typeof price === 'number' ? price.toLocaleString('en-US') : price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Flags Banner */}
            {displayFlags.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 z-10">
                <div className="flex flex-wrap gap-1.5">
                  {displayFlags.slice(0, 3).map((flag, index) => {
                    const flagInfo = getFlagInfo(flag);
                    return (
                      <span
                        key={index}
                        className={`${flagInfo.color} text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1`}
                      >
                        {flagInfo.icon && <span>{flagInfo.icon}</span>}
                        <span>{flagInfo.label}</span>
                      </span>
                    );
                  })}
                  {displayFlags.length > 3 && (
                    <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      +{displayFlags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>
        
        <CardContent className="p-4 flex flex-col flex-grow bg-white">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link href={tourUrl} className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 hover:text-purple-600 transition-colors flex items-center gap-2">
                {isPremiumOperator && (
                  <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" title="Premium Operator" />
                )}
                <span className="text-gray-900">{title}</span>
              </h3>
            </Link>
            <button
              type="button"
              aria-label={isSaved ? 'Saved' : 'Save'}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const result = await toggleBookmark(productId);
                if (result?.error === 'not_signed_in') {
                  toast({
                    title: 'Sign in required',
                    description: 'Create a free account to save tours to your favorites.',
                  });
                  return;
                }
                if (result?.ok) {
                  toast({
                    title: isSaved ? 'Removed from favorites' : 'Saved to favorites',
                    description: 'You can view your favorites in your profile.',
                  });
                }
              }}
              className={`ml-2 inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors shadow-sm ${
                isSaved ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-400 bg-white hover:text-red-500 hover:bg-red-50'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              <Heart className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
            {description}
          </p>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-900 ml-1 text-sm" suppressHydrationWarning>
                    {typeof rating === 'number' ? rating.toFixed(1) : rating}
                  </span>
                  <span className="text-gray-600 text-xs ml-1" suppressHydrationWarning>
                    ({typeof reviewCount === 'number' ? reviewCount.toLocaleString('en-US') : reviewCount})
                  </span>
                </div>
              )}
            </div>
            {(() => {
              const durationMinutes = getTourDurationMinutes(tour);
              if (!durationMinutes) return null;
              return (
                <div className="flex items-center text-gray-700 text-sm">
                  <Clock className="w-4 h-4 mr-1 text-gray-700" />
                  <span className="text-gray-700">{formatDurationLabel(durationMinutes)}</span>
                </div>
              );
            })()}
          </div>

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
      
      {/* Tour Match Modal */}
      <TourMatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        tour={tour}
        matchScore={matchScore}
        user={user}
        userPreferences={userPreferences}
        onOpenPreferences={onOpenPreferences ? () => {
          setShowMatchModal(false); // Close match modal
          onOpenPreferences(); // Open preferences modal
        } : undefined}
      />
    </motion.div>
  );
}

