"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  Star, 
  Clock, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Shield,
  ArrowRight,
  X,
  ArrowLeft,
  Home,
  BookOpen,
  UtensilsCrossed,
  Bookmark,
  Info,
  Share2,
  Crown,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Link from 'next/link';
import { getTourUrl, getTourProductId, generateTourSlug } from '@/utils/tourHelpers';
import { destinations } from '@/data/destinationsData';
import { viatorRefToSlug } from '@/data/viatorDestinationMap';
import { getGuidesByCountry } from '@/data/travelGuidesData';
import { getRestaurantsForDestination } from '../../destinations/[id]/restaurants/restaurantsData';
import { toast } from '@/components/ui/use-toast';
import { useBookmarks } from '@/hooks/useBookmarks';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import ShareModal from '@/components/sharing/ShareModal';
import { PromoteTourOperatorBanner } from '@/components/tour/PromoteTourOperatorBanner';
import ReviewSnippets from '@/components/tours/ReviewSnippets';
import PriceCalculator from '@/components/tours/PriceCalculator';
import { 
  calculateTourProfile, 
  getUserPreferenceScores, 
  calculateMatchScore, 
  getDefaultPreferences 
} from '@/lib/tourMatching';
import { calculateEnhancedMatchScore } from '@/lib/tourMatchingEnhanced';
import { resolveUserPreferences } from '@/lib/preferenceResolution';

// Sticky Price Bar Component - Smart: Shows match score if available, otherwise shows rating/reviews
function StickyPriceBar({ tour, pricing, viatorUrl, matchScore, travelers: externalTravelers = undefined, setTravelers: externalSetTravelers = undefined }) {
  const pricingInfo = tour?.pricingInfo;
  const ageBands = pricingInfo?.ageBands || [];
  const pricingType = pricingInfo?.type || 'PER_PERSON';
  const isGroupPricing = pricingType === 'UNIT';

  // Filter valid age bands (exclude TRAVELER and weird ranges)
  // Always allow ADULT bands (they often have wide ranges like 18-100)
  const validAgeBands = ageBands.filter(band => {
    if (band.ageBand === 'TRAVELER') return false;
    
    // Always allow ADULT age bands (they often have wide ranges like 18-100 or 16-100)
    if (band.ageBand === 'ADULT') return true;
    
    const endAge = band.endAge || 99;
    const startAge = band.startAge || 0;
    
    // Filter out bands with unrealistic ranges (but allow up to 100 for other bands too)
    return (endAge - startAge) <= 50 && endAge <= 100;
  });

  // Get base price - use pricing prop from server (from search API)
  const fromPrice = pricing || 
                    tour?.pricing?.summary?.fromPrice || 
                    tour?.pricingInfo?.fromPrice || 
                    tour?.pricing?.fromPrice || 
                    tour?.price || 
                    0;

  // Get rating and review data for Option 3 (Value-focused)
  const rating = tour?.reviews?.combinedAverageRating || tour?.reviews?.averageRating || 0;
  const reviewCount = tour?.reviews?.totalReviews || tour?.reviews?.totalCount || 0;
  const hasRating = rating > 0 && reviewCount > 0;

  // Get match score for Option 2 (Personalized)
  // matchScore can have: score, matchScore, matchPercentage, or percentage
  const matchPercentage = matchScore?.matchScore || matchScore?.score || matchScore?.matchPercentage || matchScore?.percentage || null;
  const hasMatchScore = matchPercentage !== null && matchPercentage > 0;

  // Use shared travelers state if provided, otherwise use local state
  const [localTravelers, setLocalTravelers] = useState(() => {
    if (isGroupPricing) return {};
    const initial = {};
    validAgeBands.forEach((band) => {
      initial[band.ageBand] = band.ageBand === 'ADULT' ? 1 : 0;
    });
    return initial;
  });

  // Use external travelers if provided (for synchronization), otherwise use local
  const travelers = externalTravelers !== undefined ? externalTravelers : localTravelers;
  const setTravelers = externalSetTravelers || setLocalTravelers;

  // Calculate total travelers
  const totalTravelers = useMemo(() => {
    const total = Object.values(travelers || {}).reduce((sum, count) => sum + (count || 0), 0);
    return total;
  }, [travelers]);

  // Calculate estimated total
  const estimatedTotal = useMemo(() => {
    if (isGroupPricing) return fromPrice;
    if (totalTravelers === 0) return 0;
    return fromPrice * totalTravelers;
  }, [fromPrice, totalTravelers, isGroupPricing]);

  // Update travelers
  const updateTravelers = (ageBand, delta) => {
    setTravelers((prev) => {
      const current = prev[ageBand] || 0;
      const band = validAgeBands.find((b) => b.ageBand === ageBand);
      if (!band) return prev;
      const newCount = Math.max(
        band.minTravelersPerBooking || 0,
        Math.min(band.maxTravelersPerBooking || 9, current + delta)
      );
      return { ...prev, [ageBand]: newCount };
    });
  };

  // Get age range text
  const getAgeRangeText = (band) => {
    const startAge = band.startAge || 0;
    const endAge = band.endAge || 99;
    if (endAge >= 100) return `${startAge}+ years`;
    if (band.ageBand === 'ADULT' && startAge >= 16 && endAge >= 99) return '16+ years';
    return `${startAge}-${endAge} years`;
  };

  const getAgeBandLabel = (ageBand) => {
    const labels = { INFANT: 'Infant', CHILD: 'Child', ADULT: 'Adult' };
    return labels[ageBand] || ageBand;
  };

  // Only show if we have price
  if (!fromPrice || fromPrice === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl"
    >
      <div className="container mx-auto px-4 py-3 max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Rating + Match Score + Price (hidden on mobile, show on tablet+) */}
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            {/* Rating/Reviews (show if available) */}
            {hasRating && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-xs font-semibold text-yellow-700">
                  {rating.toFixed(1)}★
                </span>
                <span className="text-xs text-gray-600">
                  {reviewCount > 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount.toLocaleString()}
                </span>
              </div>
            )}
            
            {/* AI Match Score (show if available) */}
            {hasMatchScore && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-xs font-semibold text-purple-700">
                  {Math.round(matchPercentage)}% Match
                </span>
              </div>
            )}

            {/* Base Price */}
            <div className="flex-shrink-0">
              <div className="text-sm md:text-base font-bold text-gray-900 whitespace-nowrap">
                From ${fromPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-600">
                {isGroupPricing ? 'group' : 'per person'}
              </div>
            </div>

            {/* Travelers Selector - Ultra compact, only show Adult by default */}
            {!isGroupPricing && validAgeBands.length > 0 && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Only show Adult age band in sticky bar to save space */}
                {(() => {
                  // Always use ADULT band - don't fallback to first band (could be INFANT)
                  const adultBand = validAgeBands.find(b => b.ageBand === 'ADULT');
                  if (!adultBand) return null;
                  
                  // Get count from travelers object - ensure we're reading from the correct state
                  // The travelers object should have keys like 'ADULT', 'CHILD', 'INFANT', etc.
                  const count = travelers && typeof travelers === 'object' ? (travelers[adultBand.ageBand] || 0) : 0;
                  const min = adultBand.minTravelersPerBooking || 0;
                  const max = adultBand.maxTravelersPerBooking || 9;

                  return (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50">
                      <button
                        onClick={() => updateTravelers(adultBand.ageBand, -1)}
                        disabled={count <= min}
                        className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-xs leading-none"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-semibold text-gray-900 text-xs">{count}</span>
                      <button
                        onClick={() => updateTravelers(adultBand.ageBand, 1)}
                        disabled={count >= max}
                        className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-xs leading-none"
                      >
                        +
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Mobile: Show dynamic price (estimated total) when travelers > 0, or base price if group pricing */}
          <div className="md:hidden flex items-center gap-3 flex-shrink-0">
            {isGroupPricing ? (
              // Group pricing: show fixed price
              <div className="flex-shrink-0">
                <div className="text-base font-bold text-gray-900 whitespace-nowrap">
                  From ${fromPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-600">group</div>
              </div>
            ) : (
              // Per person pricing: show dynamic estimated total if travelers > 0, otherwise base price
              <>
                {totalTravelers > 0 && estimatedTotal > 0 ? (
                  <div className="flex-shrink-0">
                    <div className="text-base font-bold text-gray-900 whitespace-nowrap">
                      ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-600">
                      {totalTravelers} {totalTravelers === 1 ? 'person' : 'people'}
                    </div>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <div className="text-base font-bold text-gray-900 whitespace-nowrap">
                      From ${fromPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-600">per person</div>
                  </div>
                )}
                
                {/* Travelers Selector - Mobile only, compact */}
                {validAgeBands.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {(() => {
                      const adultBand = validAgeBands.find(b => b.ageBand === 'ADULT') || validAgeBands[0];
                      if (!adultBand) return null;
                      
                      const count = travelers && typeof travelers === 'object' ? (travelers[adultBand.ageBand] || 0) : 0;
                      const min = adultBand.minTravelersPerBooking || 0;
                      const max = adultBand.maxTravelersPerBooking || 9;

                      return (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50">
                          <button
                            onClick={() => updateTravelers(adultBand.ageBand, -1)}
                            disabled={count <= min}
                            className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-xs leading-none"
                          >
                            −
                          </button>
                          <span className="w-5 text-center font-semibold text-gray-900 text-xs">{count}</span>
                          <button
                            onClick={() => updateTravelers(adultBand.ageBand, 1)}
                            disabled={count >= max}
                            className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-xs leading-none"
                          >
                            +
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Estimated Total & CTA */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* Estimated Total */}
            {!isGroupPricing && totalTravelers > 0 && estimatedTotal > 0 && (
              <div className="text-right hidden lg:block flex-shrink-0">
                <div className="text-xs text-gray-600">Est. Total:</div>
                <div className="text-sm md:text-base font-bold text-gray-900">
                  ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            )}

            {/* CTA Button - Smaller on mobile to fit travelers selector, full width on desktop */}
            <Button
              asChild
              size="lg"
              className="bg-[#00AA6C] hover:bg-[#008855] text-white font-semibold px-4 md:px-10 py-2.5 md:py-3 whitespace-nowrap text-sm md:text-lg flex-shrink-0 md:min-w-[280px]"
            >
              <a
                href={viatorUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full"
              >
                Check Availability
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TourDetailClient({ tour, similarTours: initialSimilarTours = [], productId, pricing = null, enrichment = null, initialPromotionScore = null, destinationData = null, restaurantCount = 0, restaurants = [], operatorPremiumData = null, operatorTours = [], categoryGuides = [], faqs = [], reviews = null, recommendedTours: initialRecommendedTours = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Client-side state for recommended and similar tours (fetched lazily)
  const [recommendedTours, setRecommendedTours] = useState(initialRecommendedTours);
  const [similarTours, setSimilarTours] = useState(initialSimilarTours);
  const [loadingRelatedTours, setLoadingRelatedTours] = useState(initialRecommendedTours.length === 0 && initialSimilarTours.length === 0);

  // Fetch recommended and similar tours client-side (lazy loading for faster initial render)
  useEffect(() => {
    if (initialRecommendedTours.length > 0 && initialSimilarTours.length > 0) {
      // Already have data from server, no need to fetch
      return;
    }
    
    const fetchRelatedTours = async () => {
      try {
        setLoadingRelatedTours(true);
        
        // Fetch both in parallel
        const [recommendedResponse, similarResponse] = await Promise.allSettled([
          // Fetch recommended tours
          fetch('/api/tours/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
          }).then(res => res.ok ? res.json() : { tours: [] }),
          
          // Fetch similar tours
          fetch('/api/tours/similar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              productId,
              searchTerm: destinationData?.destinationName || tour?.title || ''
            })
          }).then(res => res.ok ? res.json() : { tours: [] })
        ]);
        
        if (recommendedResponse.status === 'fulfilled' && recommendedResponse.value?.tours) {
          setRecommendedTours(recommendedResponse.value.tours);
        }
        
        if (similarResponse.status === 'fulfilled' && similarResponse.value?.tours) {
          setSimilarTours(similarResponse.value.tours);
        }
      } catch (error) {
        console.error('Error fetching related tours:', error);
      } finally {
        setLoadingRelatedTours(false);
      }
    };
    
    // Delay fetch to prioritize main content render
    const timeoutId = setTimeout(fetchRelatedTours, 500);
    return () => clearTimeout(timeoutId);
  }, [productId, tour?.title, destinationData?.destinationName, initialRecommendedTours.length, initialSimilarTours.length]);
  
  // Debug logging removed for production - uncomment for debugging
  // useEffect(() => { console.log('TourDetailClient props:', { categoryGuides, destinationData, faqs, reviews, recommendedTours }); }, [categoryGuides, destinationData, faqs, reviews, recommendedTours]);
  
  // Client-side redirect fallback: if we're on /tours/[productId] without slug, redirect to slugged version
  useEffect(() => {
    if (tour && tour.title && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      // Check if we're on /tours/[productId] without a slug (exact match)
      const productIdPattern = new RegExp(`^/tours/${productId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
      if (productIdPattern.test(currentPath)) {
        const slug = generateTourSlug(tour.title);
        if (slug) {
          const canonicalUrl = `/tours/${productId}/${slug}`;
          // Use replace to avoid adding to browser history (301-like behavior)
          window.location.replace(canonicalUrl);
        }
      }
    }
  }, [tour, productId]);
  const [destination, setDestination] = useState(null);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [savingPreferencesToProfile, setSavingPreferencesToProfile] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [isGeneratingMatch, setIsGeneratingMatch] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchModalMessage, setMatchModalMessage] = useState('');
  const [tourValuesExtracted, setTourValuesExtracted] = useState(false);
  const [showMatchResultsModal, setShowMatchResultsModal] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const [clientDestinationLookup, setClientDestinationLookup] = useState(null);
  const [user, setUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [tourProfile, setTourProfile] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [insightError, setInsightError] = useState('');

  // Local, lightweight preferences (same structure as tours listing page)
  // IMPORTANT: Don't initialize with defaults - use null so all pages behave the same
  // When null, calculateEnhancedMatchScore will use balanced defaults internally
  const [localPreferences, setLocalPreferences] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      // Check both localStorage keys for backward compatibility
      let stored = localStorage.getItem('topTours_preferences');
      if (!stored) {
        stored = localStorage.getItem('tourPreferences');
      }
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only use if it has valid preferences (at least 5 keys)
        if (parsed && Object.keys(parsed).length >= 5) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading localStorage preferences on tour detail page:', e);
    }
    // Return null (not defaults) - this ensures consistency with other pages
    return null;
  });
  const getSlugFromRef = (value) => {
    if (!value) return null;
    const normalized = String(value).replace(/^d/i, '');
    return viatorRefToSlug[normalized] || null;
  };

  const primaryDestinationSlug = (() => {
    if (tour?.destinations && tour.destinations.length > 0) {
      const entry = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
      if (!entry) return null;

      if (typeof entry.id === 'string' && destinations.some((dest) => dest.id === entry.id)) {
        return entry.id;
      }

      const slugFromRef =
        getSlugFromRef(entry.destinationId) ||
        getSlugFromRef(entry.id) ||
        getSlugFromRef(entry.ref);

      if (slugFromRef) return slugFromRef;

      const candidateName = (entry.destinationName || entry.name || '').toLowerCase();
      if (candidateName) {
        const matchedByName = destinations.find((dest) => {
          const comparable = [
            dest.id,
            dest.name,
            dest.fullName,
            dest.country,
          ]
            .filter(Boolean)
            .map((value) => value.toLowerCase());
          return comparable.includes(candidateName);
        });
        if (matchedByName) return matchedByName.id;
      }
    }
    return null;
  })();

  const derivedDestinationName = useMemo(() => {
    if (destination?.fullName || destination?.name) {
      return destination.fullName || destination.name;
    }
    if (Array.isArray(tour?.destinations) && tour.destinations.length > 0) {
      const entry = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
      return entry?.destinationName || entry?.name || '';
    }
    return '';
  }, [destination, tour]);

  // Persist local preferences to localStorage
  useEffect(() => {
    if (!localPreferences || typeof window === 'undefined') return;
    try {
      localStorage.setItem('topTours_preferences', JSON.stringify(localPreferences));
    } catch (e) {
      console.error('Error saving localStorage preferences on tour detail page:', e);
    }
  }, [localPreferences]);

  const similarSectionTitle = derivedDestinationName
    ? `Other Tours in ${derivedDestinationName}`
    : 'Other Tours You Might Like';

  const destinationTourUrl = useMemo(() => {
    if (primaryDestinationSlug) {
      return `/destinations/${primaryDestinationSlug}/tours`;
    }
    if (Array.isArray(tour?.destinations) && tour.destinations.length > 0) {
      const entry = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
      if (entry?.destinationId) {
        return `/destinations/${entry.destinationId}/tours`;
      }
      if (entry?.id) {
        return `/destinations/${entry.id}/tours`;
      }
    }
    return null;
  }, [primaryDestinationSlug, tour]);

  // Fallback: try to resolve slug by destination name if URL above is still null
  const fallbackDestinationSlugByName = useMemo(() => {
    if (!derivedDestinationName) return null;
    const match = destinations.find((d) => {
      const name = (d.fullName || d.name || '').toLowerCase();
      return name === derivedDestinationName.toLowerCase();
    });
    return match?.id || null;
  }, [derivedDestinationName]);

  const finalDestinationTourUrl = useMemo(() => {
    if (destinationTourUrl) return destinationTourUrl;
    if (fallbackDestinationSlugByName) {
      return `/destinations/${fallbackDestinationSlugByName}/tours`;
    }
    return null;
  }, [destinationTourUrl, fallbackDestinationSlugByName]);

  const handleGenerateInsight = useCallback(async () => {
    if (!productId || isGeneratingInsight) return;

    try {
      setIsGeneratingInsight(true);
      setInsightError('');

      const response = await fetch(`/api/internal/tour-enrichment/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let message = 'Failed to generate insight';
        try {
          const errorData = await response.json();
          message = errorData?.error || message;
        } catch {
          // ignore JSON parse errors, fall back to generic message
        }
        throw new Error(message);
      }

      const data = await response.json();
      const newInsight =
        data?.enrichment?.ai_summary && typeof data.enrichment.ai_summary === 'string'
          ? data.enrichment.ai_summary
          : '';

      if (newInsight) {
        setEditorialInsight(newInsight);
      } else {
        setInsightError('AI did not return a usable insight.');
      }
    } catch (error) {
      console.error('Error generating AI insight:', error);
      setInsightError(error?.message || 'Could not generate insight. Please try again later.');
    } finally {
      setIsGeneratingInsight(false);
    }
  }, [productId, isGeneratingInsight]);

  // Helper function to generate slug from name
  const generateSlugFromName = (name) => {
    if (!name) return null;
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // CLIENT-SIDE FALLBACK: If destinationData is null, try to extract it from tour
  const fallbackDestinationData = useMemo(() => {
    if (destinationData) return null; // Server provided it, no need for fallback
    if (destination) return null; // We have a curated destination, no need for fallback
    
    // Try to extract from tour object
    if (tour?.destinations && tour.destinations.length > 0) {
      const primaryDest = tour.destinations.find((d) => d?.primary) || tour.destinations[0];
      const destId = primaryDest?.ref || primaryDest?.destinationId || primaryDest?.id;
      let destName = primaryDest?.destinationName || primaryDest?.name;
      
      // If no name from tour data, try to extract from tour title (e.g., "...from Aberfeldy")
      if (!destName && tour?.title) {
        const titleMatch = tour.title.match(/from\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,)/i);
        if (titleMatch && titleMatch[1]) {
          destName = titleMatch[1].trim();
          console.log('🔧 CLIENT FALLBACK: Extracted destination name from tour title:', destName);
        }
      }
      
      if (destId) {
        return {
          destinationId: destId.toString(),
          destinationName: destName || null,
          slug: destName ? destName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : destId.toString(),
          country: null,
        };
      }
    }
    
    return null;
  }, [destinationData, destination, tour]);
  
  // Use fallback if server didn't provide destinationData
  const effectiveDestinationData = destinationData || fallbackDestinationData;

  const primaryDestinationId = useMemo(() => {
    // Priority 1: Use server-provided destinationData (most reliable)
    if (effectiveDestinationData?.destinationId) {
      return effectiveDestinationData.destinationId;
    }
    
    // Priority 2: Extract from tour destinations array (prioritize primary)
    if (Array.isArray(tour?.destinations) && tour.destinations.length > 0) {
      const primary = tour.destinations.find((d) => d?.primary);
      const selected = primary || tour.destinations[0];
      const destId = selected?.ref || selected?.destinationId || selected?.id || null;
      return destId;
    }
    
    return null;
  }, [effectiveDestinationData?.destinationId, tour, productId]);

  const normalizedPrimaryDestinationId = useMemo(() => {
    if (!primaryDestinationId) return null;
    return primaryDestinationId.toString().replace(/^d/i, '');
  }, [primaryDestinationId]);

  const clientDestinationLookupId = clientDestinationLookup?.id || null;
  const hasClientDestinationLookup = !!clientDestinationLookup;

  useEffect(() => {
    if (!supabase || !normalizedPrimaryDestinationId) {
      if (!effectiveDestinationData?.destinationName && hasClientDestinationLookup) {
        setClientDestinationLookup(null);
      }
      return;
    }

    if (effectiveDestinationData?.destinationName) {
      if (hasClientDestinationLookup) {
        setClientDestinationLookup(null);
      }
      return;
    }

    if (clientDestinationLookupId === normalizedPrimaryDestinationId) {
      return;
    }

    let isMounted = true;

    const fetchDestinationName = async () => {
      try {
        const { data, error } = await supabase
          .from('viator_destinations')
          .select('id, name, slug, country, region')
          .eq('id', normalizedPrimaryDestinationId.toString()) // Ensure string comparison
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          setClientDestinationLookup(null);
          return;
        }

        if (data) {
          // Verify the returned data matches the requested ID
          if (data.id !== normalizedPrimaryDestinationId.toString() && data.id !== normalizedPrimaryDestinationId) {
            setClientDestinationLookup(null);
            return;
          }
        }

        setClientDestinationLookup(data || null);
      } catch (err) {
        if (!isMounted) return;
        setClientDestinationLookup(null);
      }
    };

    fetchDestinationName();

    return () => {
      isMounted = false;
    };
  }, [supabase, normalizedPrimaryDestinationId, effectiveDestinationData?.destinationName, clientDestinationLookupId, hasClientDestinationLookup]);

  const destinationNameFromClientLookup = clientDestinationLookup?.name || null;
  const destinationSlugFromClientLookup = useMemo(() => {
    if (clientDestinationLookup?.slug) {
      return clientDestinationLookup.slug;
    }
    if (clientDestinationLookup?.name) {
      return generateSlugFromName(clientDestinationLookup.name);
    }
    return null;
  }, [clientDestinationLookup]);

  // Get destination name and ID for unmatched destinations (for display in breadcrumbs and sidebar)
  const unmatchedDestinationName = useMemo(() => {
    if (destination) return null; // Only for unmatched destinations
    
    // First try effectiveDestinationData (server data or client fallback)
    if (effectiveDestinationData?.destinationName) {
      return effectiveDestinationData.destinationName;
    }
    
    if (destinationNameFromClientLookup) {
      return destinationNameFromClientLookup;
    }
    
    // Fallback: extract from tour data directly
    if (tour?.destinations && tour.destinations.length > 0) {
      const primaryDestination = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
      let destName = primaryDestination?.destinationName || primaryDestination?.name;
      
      // If still no name, try to extract from tour title
      if (!destName && tour?.title) {
        const titleMatch = tour.title.match(/from\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,)/i);
        if (titleMatch && titleMatch[1]) {
          destName = titleMatch[1].trim();
        }
      }
      
      if (destName) {
        return destName;
      }
    }
    
    return null;
  }, [destination, effectiveDestinationData, tour, destinationNameFromClientLookup]);

  const subtleDestinationName = useMemo(() => {
    if (effectiveDestinationData?.destinationName) {
      return effectiveDestinationData.destinationName;
    }
    if (destinationNameFromClientLookup) {
      return destinationNameFromClientLookup;
    }
    if (destination?.fullName || destination?.name) {
      return destination.fullName || destination.name;
    }
    if (unmatchedDestinationName) {
      return unmatchedDestinationName;
    }
    return null;
  }, [effectiveDestinationData, destinationNameFromClientLookup, destination, unmatchedDestinationName]);

  // Get Viator destination slug/ID for unmatched destinations (for linking to tours page)
  // Prefer slug from effectiveDestinationData if available, otherwise use ID
  const unmatchedDestinationSlug = useMemo(() => {
    if (destination) return null; // Only for unmatched destinations
    
    // Use slug from effectiveDestinationData if available (SEO-friendly, most reliable)
    if (effectiveDestinationData?.slug) {
      return effectiveDestinationData.slug;
    }

    if (destinationSlugFromClientLookup) {
      return destinationSlugFromClientLookup;
    }
    
    // Generate slug from destination name if we have it
    const destName = effectiveDestinationData?.destinationName || destinationNameFromClientLookup || unmatchedDestinationName;
    if (destName) {
      return generateSlugFromName(destName);
    }
    
    // Fall back to destinationId from effectiveDestinationData
    if (effectiveDestinationData?.destinationId) {
      return effectiveDestinationData.destinationId;
    }
    
    // Last resort: extract from tour data and generate slug
    if (tour?.destinations && tour.destinations.length > 0) {
      const primaryDestination = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
      const tourDestName = primaryDestination?.destinationName || primaryDestination?.name;
      if (tourDestName) {
        return generateSlugFromName(tourDestName);
      }
      // If no name, try to use ID/ref
      return primaryDestination?.ref || primaryDestination?.destinationId || primaryDestination?.id || null;
    }
    
    return null;
  }, [destination, effectiveDestinationData, tour, unmatchedDestinationName, destinationSlugFromClientLookup, destinationNameFromClientLookup]);

  const subtleDestinationSlug = useMemo(() => {
    // Prioritize client lookup (most up-to-date, from Supabase with name)
    if (destinationSlugFromClientLookup) {
      return destinationSlugFromClientLookup;
    }
    // Then use unmatchedDestinationSlug (which may have generated slug from name)
    if (unmatchedDestinationSlug) {
      // Prefer name-based slugs over numeric IDs
      const isNumericId = /^\d+$/.test(unmatchedDestinationSlug);
      if (!isNumericId) {
        return unmatchedDestinationSlug;
      }
      // If it's numeric but we have a name, generate slug from name instead
      const destName = destinationNameFromClientLookup || unmatchedDestinationName;
      if (destName) {
        return generateSlugFromName(destName);
      }
    }
    // Check server slug, but prefer name-based slugs
    if (effectiveDestinationData?.slug) {
      const isNumericId = /^\d+$/.test(effectiveDestinationData.slug);
      if (!isNumericId) {
        return effectiveDestinationData.slug;
      }
      // If server slug is numeric but we have a name, use name-based slug
      const destName = effectiveDestinationData?.destinationName;
      if (destName) {
        return generateSlugFromName(destName);
      }
    }
    // Last resort: use unmatchedDestinationSlug even if numeric (better than nothing)
    if (unmatchedDestinationSlug) {
      return unmatchedDestinationSlug;
    }
    // Final fallback: server slug or destination ID
    return effectiveDestinationData?.slug || effectiveDestinationData?.destinationId || null;
  }, [effectiveDestinationData, destinationSlugFromClientLookup, unmatchedDestinationSlug, destinationNameFromClientLookup, unmatchedDestinationName]);

  // Debug logging removed for production - enable in development if needed

  // Fetch user and preferences for matching
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);
        
        if (authUser) {
          // Fetch user preferences
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('trip_preferences')
            .eq('id', authUser.id)
            .single();
          
          if (!error && profile?.trip_preferences) {
            setUserPreferences(profile.trip_preferences);
          }
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchUserPreferences();
  }, [supabase]);

  // Calculate tour profile from tags
  useEffect(() => {
    const calculateProfile = async () => {
      if (!tour || !tour.tags || tour.tags.length === 0) {
        setTourProfile(null);
        setMatchScore(null);
        return;
      }

      try {
        setLoadingProfile(true);
        const profile = await calculateTourProfile(tour.tags);

        // Use unified preference resolution - ensures consistent match scores across all pages
        // This uses the exact same logic as all other pages
        const preferences = resolveUserPreferences({ user, userPreferences, localPreferences });
        
        // Ensure tour object has pricing in the expected format for enhanced matching
        // The enhanced matching function expects tour.pricing.summary.fromPrice
        const tourForMatching = { ...tour };
        
        // Normalize pricing - ensure we have a numeric price value
        const getNumericPrice = (priceValue) => {
          if (typeof priceValue === 'number') return priceValue;
          if (typeof priceValue === 'string') {
            const cleaned = priceValue.replace(/[$,\s]/g, '');
            const parsed = parseFloat(cleaned);
            return !isNaN(parsed) && parsed > 0 ? parsed : null;
          }
          return null;
        };
        
        // Try to find and normalize the price
        // Also check the pricing prop passed from server
        let normalizedPrice = null;
        if (pricing && typeof pricing === 'number' && pricing > 0) {
          normalizedPrice = pricing;
        } else if (tour.pricing?.summary?.fromPrice !== undefined && tour.pricing.summary.fromPrice !== null) {
          normalizedPrice = getNumericPrice(tour.pricing.summary.fromPrice);
        } else if (tour.pricing?.fromPrice !== undefined && tour.pricing.fromPrice !== null) {
          normalizedPrice = getNumericPrice(tour.pricing.fromPrice);
        } else if (tour.price !== undefined && tour.price !== null) {
          normalizedPrice = getNumericPrice(tour.price);
        }
        
        // Set normalized price in the expected location
        if (normalizedPrice !== null) {
          if (!tourForMatching.pricing) {
            tourForMatching.pricing = {};
          }
          if (!tourForMatching.pricing.summary) {
            tourForMatching.pricing.summary = {};
          }
          tourForMatching.pricing.summary.fromPrice = normalizedPrice;
        }
        
        const match = await calculateEnhancedMatchScore(tourForMatching, preferences, profile);
        
        // Use the adjusted profile from enhanced matching (includes price/flag adjustments)
        setTourProfile(match.tourProfile || profile);
        setMatchScore(match);
      } catch (error) {
        console.error('Error calculating tour profile:', error);
        setTourProfile(null);
        setMatchScore(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    calculateProfile();
  }, [tour, user, userPreferences, localPreferences]); // Added localPreferences so it recalculates when preferences change

  // Explicit "Save to profile" handler (same behavior as tours listing page)
  const handleSavePreferencesToProfile = useCallback(async () => {
    if (!localPreferences) return;

    // If not signed in, send them to auth (prefs are already in localStorage)
    if (!user) {
      try {
        const redirect =
          typeof window !== 'undefined'
            ? window.location.pathname + window.location.search
            : '/';
        setShowPreferencesModal(false);
        router.push(`/auth?mode=signup&redirect=${encodeURIComponent(redirect)}`);
      } catch {
        router.push('/auth');
      }
      return;
    }

    setSavingPreferencesToProfile(true);
    try {
      const mergedPreferences = {
        ...(userPreferences || {}),
        ...localPreferences,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          trip_preferences: mergedPreferences,
        });

      if (error) throw error;

      setUserPreferences(mergedPreferences);
      // Also update localPreferences so the match score recalculates immediately
      setLocalPreferences(mergedPreferences);
      // Save to localStorage for consistency
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('topTours_preferences', JSON.stringify(mergedPreferences));
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      toast({
        title: 'Preferences saved',
        description: 'Saved to your profile (syncs across devices).',
      });
      setShowPreferencesModal(false);
    } catch (e) {
      console.error('Error saving preferences to profile (tour detail):', e);
      toast({
        title: 'Could not save preferences',
        description: e?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingPreferencesToProfile(false);
    }
  }, [localPreferences, user, userPreferences, supabase, router, toast]);


  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Remove browser extension attributes that cause hydration errors
    const removeExtensionAttributes = () => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        if (el.hasAttribute('bis_skin_checked')) {
          el.removeAttribute('bis_skin_checked');
        }
        if (el.hasAttribute('bis_register')) {
          el.removeAttribute('bis_register');
        }
      });
    };

    // Remove immediately and then repeatedly to catch extension injections
    removeExtensionAttributes();
    const immediateTimer = setTimeout(removeExtensionAttributes, 0);
    const delayedTimer = setTimeout(removeExtensionAttributes, 100);
    const observerTimer = setTimeout(removeExtensionAttributes, 500);
    
    // Use MutationObserver to watch for new attribute additions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          if (target && target instanceof Element) {
            if (target.hasAttribute('bis_skin_checked') || target.hasAttribute('bis_register')) {
              target.removeAttribute('bis_skin_checked');
              target.removeAttribute('bis_register');
            }
          }
        }
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && node instanceof Element) {
              const el = node;
              if (el.hasAttribute('bis_skin_checked')) {
                el.removeAttribute('bis_skin_checked');
              }
              if (el.hasAttribute('bis_register')) {
                el.removeAttribute('bis_register');
              }
              // Also check children
              el.querySelectorAll('*').forEach((child) => {
                child.removeAttribute('bis_skin_checked');
                child.removeAttribute('bis_register');
              });
            }
          });
        }
      });
    });

    // Observe the entire document
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['bis_skin_checked', 'bis_register'],
      childList: true,
      subtree: true,
    });
    
    // Detect scroll for sticky button
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(immediateTimer);
      clearTimeout(delayedTimer);
      clearTimeout(observerTimer);
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Tour view tracking is now handled by PageViewTracker component in layout.js
  // This ensures consistent tracking across all pages and avoids duplicate tracking
  // The PageViewTracker automatically detects tour pages and updates aggregated counts

  useEffect(() => {
    // First priority: Use effectiveDestinationData from server or client fallback (most reliable)
    // This is especially important for the 3200+ destinations that aren't in the curated 182
    if (effectiveDestinationData?.slug) {
      const matchedByServerSlug = destinations.find((dest) => dest.id === effectiveDestinationData.slug);
      if (matchedByServerSlug) {
        setDestination(matchedByServerSlug);
        return;
      }
    }
    
    // Also try matching by destination name from effectiveDestinationData
    if (effectiveDestinationData?.destinationName) {
      const destNameLower = effectiveDestinationData.destinationName.toLowerCase();
      const matchedByServerName = destinations.find((dest) => {
        const destId = (dest.id || '').toLowerCase();
        const destFullName = (dest.fullName || dest.name || '').toLowerCase();
        const destName = (dest.name || '').toLowerCase();
        return (
          destId === destNameLower ||
          destFullName === destNameLower ||
          destFullName.includes(destNameLower) ||
          destNameLower.includes(destFullName) ||
          destName === destNameLower ||
          destId === effectiveDestinationData.slug?.toLowerCase()
        );
      });
      if (matchedByServerName) {
        setDestination(matchedByServerName);
        return;
      }
    }

    // Second priority: Try primaryDestinationSlug (from viatorRefToSlug mapping)
    if (primaryDestinationSlug) {
      const matchedBySlug = destinations.find((dest) => dest.id === primaryDestinationSlug);
      if (matchedBySlug) {
        setDestination(matchedBySlug);
        return;
      }
    }

    // Third priority: Match by destination name from tour data
    if (tour?.destinations && tour.destinations.length > 0) {
      const primaryDest = tour.destinations.find((d) => d.primary) || tour.destinations[0];
      const destName = (primaryDest.destinationName || primaryDest.name || '').toLowerCase();

      if (destName) {
        const matchedDest = destinations.find((dest) => {
          const destId = (dest.id || dest.name?.toLowerCase().replace(/\s/g, '-') || '').toLowerCase();
          const destFullName = (dest.fullName || dest.name || '').toLowerCase();
          const destNameOnly = (dest.name || '').toLowerCase();
          return (
            dest.id === primaryDestinationSlug ||
            destFullName === destName ||
            destFullName.includes(destName) ||
            destName.includes(destFullName) ||
            destId === destName.replace(/\s/g, '-') ||
            destNameOnly === destName
          );
        });

        if (matchedDest) {
          setDestination(matchedDest);
          return;
        }
      }
    }

    // Last resort: Try to extract from tour title
    if (tour?.title) {
      const titleLower = tour.title.toLowerCase();
      const matchedDest = destinations.find((dest) => {
        const destName = (dest.name || dest.fullName || '').toLowerCase();
        return destName && titleLower.includes(destName);
      });
      if (matchedDest) {
        setDestination(matchedDest);
      }
    }
  }, [tour, primaryDestinationSlug, effectiveDestinationData]);

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationNext />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Tour not found</p>
        </div>
        <FooterNext />
      </div>
    );
  }

  // Shared travelers state for all price calculators (sidebar, middle, sticky bar)
  const pricingInfo = tour?.pricingInfo;
  const ageBands = pricingInfo?.ageBands || [];
  const pricingType = pricingInfo?.type || 'PER_PERSON';
  const isGroupPricing = pricingType === 'UNIT';

  // Filter valid age bands (exclude TRAVELER and weird ranges)
  const validAgeBands = useMemo(() => {
    return ageBands.filter(band => {
      if (band.ageBand === 'TRAVELER') return false;
      const endAge = band.endAge || 99;
      const startAge = band.startAge || 0;
      return (endAge - startAge) <= 50 && endAge < 100;
    });
  }, [ageBands]);

  // Initialize shared travelers state
  const [sharedTravelers, setSharedTravelers] = useState(() => {
    if (isGroupPricing) return {};
    const initial = {};
    validAgeBands.forEach((band) => {
      initial[band.ageBand] = band.ageBand === 'ADULT' ? 1 : 0; // Default: 1 adult
    });
    return initial;
  });

  // Helper: pick an image variant that is large enough for hero, but not oversized
  const selectBestImageVariant = (variants, targetWidth = 800) => {
    if (!Array.isArray(variants) || variants.length === 0) return '';

    let best = null;
    let bestWidth = Infinity;
    let fallback = null;
    let fallbackWidth = 0;

    for (const variant of variants) {
      const width = variant?.width;
      if (!variant?.url || !width) continue;

      // Prefer the smallest variant that is >= targetWidth
      if (width >= targetWidth && width < bestWidth) {
        best = variant;
        bestWidth = width;
      }

      // Track the largest variant as a fallback
      if (width > fallbackWidth) {
        fallback = variant;
        fallbackWidth = width;
      }
    }

    return (best || fallback || variants[variants.length - 1] || variants[0])?.url || '';
  };

  // Extract data from Viator API response - use a reasonably sized hero image
  const getHighQualityImage = () => {
    if (!tour.images || !tour.images[0] || !tour.images[0].variants) return '';
    const variants = tour.images[0].variants;
    return selectBestImageVariant(variants, 800);
  };
  
  const tourImage = getHighQualityImage();
  
  // Get all images for gallery and lightbox (including hero) - use useMemo for performance
  const allImages = useMemo(() => {
    if (!tour?.images || tour.images.length === 0) {
      return [];
    }

    const images = tour.images.map((img, idx) => {
      if (!img.variants || !Array.isArray(img.variants)) {
        return null;
      }
      // Get the best variant for our desired width
      const url = selectBestImageVariant(img.variants, 800);
      if (!url) {
        return null;
      }
      return {
        url,
        caption: img.caption || '',
        alt: img.caption || tour.title || 'Tour image'
      };
    }).filter(Boolean);
    
    return images;
  }, [tour]);
  
  // Get additional images for gallery (exclude the first one which is used as hero)
  const additionalImages = allImages.slice(1, 7); // Show up to 6 additional images in gallery
  
  // Lightbox functions
  const openLightbox = useCallback((index) => {
    console.log('Opening lightbox at index:', index, 'Total images:', allImages.length);
    if (allImages.length === 0) {
      console.warn('Cannot open lightbox: no images available');
      return;
    }
    const validIndex = Math.max(0, Math.min(index, allImages.length - 1));
    setLightboxIndex(validIndex);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }, [allImages.length]);
  
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  }, []);
  
  const nextImage = useCallback(() => {
    if (allImages.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);
  
  const prevImage = useCallback(() => {
    if (allImages.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);
  
  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, prevImage, nextImage]);
  // Extract rating and review count
  // Based on actual API: reviews.combinedAverageRating and reviews.totalReviews
  const rating = tour.reviews?.combinedAverageRating || 
                 tour.reviews?.averageRating || 
                 0;
  const reviewCount = tour.reviews?.totalReviews || 
                      tour.reviews?.totalCount || 
                      0;

  // Build rating breakdown (per-star counts) using multiple possible API shapes
  const { ratingBreakdown, ratingBreakdownTotal } = useMemo(() => {
    const candidateArrays = [];

    if (Array.isArray(tour?.reviews?.reviewCountTotals) && tour.reviews.reviewCountTotals.length > 0) {
      candidateArrays.push(tour.reviews.reviewCountTotals);
    }

    if (Array.isArray(tour?.reviews?.sources)) {
      tour.reviews.sources.forEach((source) => {
        if (Array.isArray(source?.reviewCounts) && source.reviewCounts.length > 0) {
          candidateArrays.push(source.reviewCounts);
        }
      });
    }

    candidateArrays.push(
      tour?.reviews?.ratingCounts,
      tour?.reviews?.ratingsCount,
      tour?.reviews?.breakdown,
      tour?.reviews?.distribution,
      tour?.reviews?.ratingDistribution?.buckets,
      tour?.reviews?.ratingsDistribution
    );

    const normalized = [];

    for (const arr of candidateArrays) {
      if (Array.isArray(arr) && arr.length > 0) {
        const entries = arr
          .map((item, index) => {
            const ratingValue = Number(
              item?.rating ??
              item?.stars ??
              item?.starRating ??
              item?.label ??
              (typeof item === 'number' && index + 1)
            );
            const countValue = Number(
              item?.count ??
              item?.total ??
              item?.value ??
              item?.quantity ??
              item?.number ??
              (typeof item === 'number' ? item : undefined)
            );

            if (!ratingValue || !countValue) return null;
            return { rating: ratingValue, count: countValue };
          })
          .filter(Boolean);

          if (entries.length > 0) {
            normalized.push(...entries);
            break;
          }
      }
    }

    if (!normalized.length) {
      return { ratingBreakdown: [], ratingBreakdownTotal: 0 };
    }

    let totalForPercent = reviewCount > 0
      ? reviewCount
      : normalized.reduce((sum, item) => sum + (item.count || 0), 0);

    if (!totalForPercent) {
      totalForPercent = normalized.reduce((sum, item) => sum + (item.count || 0), 0);
    }

    if (!totalForPercent) {
      return { ratingBreakdown: [], ratingBreakdownTotal: 0 };
    }

    const combined = normalized.reduce((acc, item) => {
      const existing = acc.find(entry => entry.rating === item.rating);
      if (existing) {
        existing.count += item.count;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);

    const processed = combined
      .filter(item => item.count > 0)
      .sort((a, b) => b.rating - a.rating)
      .map(item => ({
        rating: item.rating,
        count: item.count,
        percentage: Math.max(0, Math.round((item.count / totalForPercent) * 100))
      }));

    return { ratingBreakdown: processed, ratingBreakdownTotal: totalForPercent };
  }, [tour, reviewCount]);
  
  // Extract price from multiple possible locations
  // Get price - prioritize pricing prop from server (from search API)
  const getPrice = () => {
    // First try the pricing prop passed from server (from search API)
    if (pricing && pricing > 0) {
      return pricing;
    }
    // Try pricing.summary.fromPrice (search API format)
    if (tour.pricing?.summary?.fromPrice) {
      return tour.pricing.summary.fromPrice;
    }
    // Try pricing.fromPrice
    if (tour.pricing?.fromPrice) {
      return tour.pricing.fromPrice;
    }
    // Try pricingInfo.fromPrice
    if (tour.pricingInfo?.fromPrice) {
      return tour.pricingInfo.fromPrice;
    }
    // Try pricing.amount
    if (tour.pricing?.amount) {
      return tour.pricing.amount;
    }
    // Try price object
    if (tour.price?.fromPrice) {
      return tour.price.fromPrice;
    }
    if (tour.price?.amount) {
      return tour.price.amount;
    }
    if (typeof tour.price === 'number') {
      return tour.price;
    }
    // Try bookingInfo
    if (tour.bookingInfo?.price) {
      return tour.bookingInfo.price;
    }
    // Try pricingMatrix (if available)
    if (tour.pricingMatrix && Array.isArray(tour.pricingMatrix) && tour.pricingMatrix.length > 0) {
      const adultPrice = tour.pricingMatrix.find(p => p.ageBand === 'ADULT')?.price;
      if (adultPrice) return adultPrice;
      return tour.pricingMatrix[0]?.price || 0;
    }
    return 0;
  };
  
  const price = getPrice();
  
  // Extract duration - check multiple possible locations
  // Based on actual API: itinerary.duration.fixedDurationInMinutes
  const duration = tour.itinerary?.duration?.fixedDurationInMinutes ||
                   tour.duration?.fixedDurationInMinutes || 
                   tour.duration?.variableDurationFromMinutes || 
                   tour.duration?.duration ||
                   null;
  const viatorUrl = tour.productUrl || 
                    tour.url || 
                    `https://www.viator.com/tours/${productId}`;
  
  // Extract highlights - could be in different formats
  // Priority: viatorUniqueContent.highlights > tour.highlights > other sources
  // Ensure it's always an array
  const getHighlights = () => {
    // First try viatorUniqueContent.highlights (better formatted)
    if (Array.isArray(tour.viatorUniqueContent?.highlights) && tour.viatorUniqueContent.highlights.length > 0) {
      // Clean up highlights - remove extra whitespace and newlines
      return tour.viatorUniqueContent.highlights
        .map(h => typeof h === 'string' ? h.trim().replace(/\n/g, ' ') : h)
        .filter(h => h && h.length > 0);
    }
    
    // Fallback to other sources
    const data = tour.highlights || 
                 tour.highlightsList || 
                 tour.productContent?.highlights ||
                 tour.productContent?.highlightsList ||
                 [];
    // If it's not an array, try to convert it
    if (Array.isArray(data)) {
      // Clean up highlights - remove extra whitespace
      return data
        .map(h => typeof h === 'string' ? h.trim().replace(/\n/g, ' ') : h)
        .filter(h => h && h.length > 0);
    }
    if (typeof data === 'string') return [data.trim()];
    if (typeof data === 'object' && data !== null) {
      // If it's an object, try to extract values
      const values = Object.values(data).flat();
      return Array.isArray(values) ? values.map(v => typeof v === 'string' ? v.trim() : v).filter(Boolean) : [];
    }
    return [];
  };
  
  const highlights = getHighlights();
  
  // Extract inclusions/exclusions - check multiple possible locations
  // Based on actual API: inclusions is an array of objects with description field
  // Handle "OTHER" category by using otherDescription field
  const getInclusions = () => {
    // Helper function to extract text from an inclusion/exclusion item
    const extractItemText = (item) => {
      if (!item || typeof item !== 'object') return '';
      
      // Check if object is empty
      if (Object.keys(item).length === 0) return '';
      
      // If category is "OTHER", use otherDescription
      if (item.category === 'OTHER' && item.otherDescription) {
        return item.otherDescription;
      }
      
      // Otherwise, try description, otherDescription, typeDescription, or categoryDescription
      return item.description || 
             item.otherDescription || 
             item.typeDescription || 
             item.categoryDescription || 
             '';
    };
    
    // First try direct inclusions array (actual API structure)
    if (Array.isArray(tour.inclusions)) {
      return tour.inclusions
        .map(extractItemText)
        .filter(Boolean); // Filter out empty strings and empty objects
    }
    
    // Fallback to other possible locations
    const data = tour.inclusions?.includedItems || 
                 tour.inclusions?.included || 
                 tour.inclusions?.includes ||
                 tour.productContent?.inclusions?.included || 
                 tour.productContent?.inclusions?.includedItems ||
                 [];
    // If it's not an array, try to convert it
    if (Array.isArray(data)) {
      return data
        .map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            return extractItemText(item);
          }
          return '';
        })
        .filter(Boolean);
    }
    if (typeof data === 'string') return [data];
    if (typeof data === 'object' && data !== null) {
      const values = Object.values(data).flat();
      return Array.isArray(values) ? values.map(extractItemText).filter(Boolean) : [];
    }
    return [];
  };
  
  const getExclusions = () => {
    // Helper function to extract text from an inclusion/exclusion item
    const extractItemText = (item) => {
      if (!item || typeof item !== 'object') return '';
      
      // Check if object is empty
      if (Object.keys(item).length === 0) return '';
      
      // If category is "OTHER", use otherDescription
      if (item.category === 'OTHER' && item.otherDescription) {
        return item.otherDescription;
      }
      
      // Otherwise, try description, otherDescription, typeDescription, or categoryDescription
      return item.description || 
             item.otherDescription || 
             item.typeDescription || 
             item.categoryDescription || 
             '';
    };
    
    // Exclusions might not be in the API response, but check anyway
    const data = tour.exclusions ||
                 tour.inclusions?.excludedItems || 
                 tour.inclusions?.excluded || 
                 tour.inclusions?.excludes ||
                 tour.productContent?.inclusions?.excluded || 
                 tour.productContent?.inclusions?.excludedItems ||
                 [];
    // If it's not an array, try to convert it
    if (Array.isArray(data)) {
      return data
        .map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            return extractItemText(item);
          }
          return '';
        })
        .filter(Boolean);
    }
    if (typeof data === 'string') return [data];
    if (typeof data === 'object' && data !== null) {
      const values = Object.values(data).flat();
      return Array.isArray(values) ? values.map(extractItemText).filter(Boolean) : [];
    }
    return [];
  };
  
  const inclusions = getInclusions();
  const exclusions = getExclusions();
  
  // Extract description - check multiple possible locations
  // Priority: viatorUniqueContent.longDescription > viatorUniqueContent.shortDescription > other sources
  // Based on actual API structure: viatorUniqueContent has better formatted content
  const description = tour.viatorUniqueContent?.longDescription ||
                     tour.viatorUniqueContent?.shortDescription ||
                     tour.description || 
                     tour.description?.summary || 
                     tour.description?.shortDescription || 
                     tour.description?.description || 
                     tour.description?.longDescription ||
                     tour.description?.fullDescription ||
                     tour.productContent?.description?.summary ||
                     tour.productContent?.description?.shortDescription ||
                     tour.productContent?.description ||
                     tour.productContent?.summary ||
                     tour.summary ||
                     tour.overview ||
                     '';
  
  // Extract insider tips if available
  const insiderTips = tour.viatorUniqueContent?.insiderTips || '';

  // Short TopTours editorial insight (2–3 sentences) from enrichment, if available.
  // Start from server-provided enrichment, but allow client-side generation via API.
  const [editorialInsight, setEditorialInsight] = useState(
    () =>
      (enrichment?.ai_summary && typeof enrichment.ai_summary === 'string'
        ? enrichment.ai_summary
        : '') || ''
  );

  useEffect(() => {
    setEditorialInsight(
      (enrichment?.ai_summary && typeof enrichment.ai_summary === 'string'
        ? enrichment.ai_summary
        : '') || ''
    );
  }, [enrichment?.ai_summary]);
  
  const flags = tour.flags || [];
  const supplierName = tour?.supplier?.name ||
                       tour?.supplierName ||
                       tour?.operator?.name ||
                       tour?.vendor?.name ||
                       tour?.partner?.name ||
                       '';

  // Check if tour values are already extracted
  useEffect(() => {
    if (enrichment?.structured_values) {
      setTourValuesExtracted(true);
    }
  }, [enrichment]);

  const handleExtractTourValues = async () => {
    if (!productId || isGeneratingMatch) return;
    
    try {
      setIsGeneratingMatch(true);
      setMatchError('');

      // Call API to extract structured values (one-time)
      const response = await fetch(`/api/internal/tour-match/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          extractOnly: true, // Just extract values, don't match yet
          tour: pricing ? {
            ...tour,
            pricing: {
              ...tour.pricing,
              summary: {
                ...tour.pricing?.summary,
                fromPrice: tour.pricing?.summary?.fromPrice || pricing?.fromPrice || pricing?.summary?.fromPrice,
                fromPriceBeforeDiscount: tour.pricing?.summary?.fromPriceBeforeDiscount || pricing?.fromPriceBeforeDiscount || pricing?.summary?.fromPriceBeforeDiscount,
              }
            }
          } : tour
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to extract tour values';
        const status = response.status;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorMessage;
          console.error('API Error Response:', { status, error: errorData });
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
            console.error('API Error Text:', { status, error: errorText });
          } catch (textError) {
            console.error('API Error (could not parse):', { status, error: textError });
          }
        }
        throw new Error(`[${status}] ${errorMessage}`);
      }

      const data = await response.json();
      
      if (data.valuesExtracted) {
        setTourValuesExtracted(true);
        toast({
          title: 'Tour analyzed',
          description: 'Tour characteristics have been extracted successfully.',
        });
        router.refresh();
      } else {
        throw new Error('Failed to extract values');
      }
    } catch (error) {
      console.error('Error extracting tour values:', error);
      setMatchError(error.message || 'Unable to extract tour values');
      toast({
        title: 'Extraction failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingMatch(false);
    }
  };

  const handleGenerateMatch = async () => {
    if (!productId || isGeneratingMatch) return;
    
    try {
      setIsGeneratingMatch(true);
      setMatchError('');

      // Check if user is signed in
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setIsGeneratingMatch(false);
        setMatchModalMessage('Please sign in to use AI tour matching. Create a free account to get personalized match scores based on your trip preferences.');
        setShowMatchModal(true);
        return;
      }

      // Check if user has trip preferences set
      // First try direct query (bypass cache to get fresh data)
      let profile = null;
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('trip_preferences')
          .eq('id', user.id)
          .single();
        if (profileError) throw profileError;
        profile = data;
      } catch (error) {
        // Fallback to cached version
        try {
          const { getCachedUserProfile } = await import('@/lib/supabaseCache');
          profile = await getCachedUserProfile(user.id);
        } catch (cacheError) {
          console.error('Error fetching profile:', cacheError);
        }
      }

      if (!profile || !profile.trip_preferences) {
        setIsGeneratingMatch(false);
        setMatchModalMessage('Please set your trip preferences in your profile first. Go to your profile and fill in your travel style, budget, and preferences to get personalized match scores.');
        setShowMatchModal(true);
        return;
      }
      
      const userPreferences = profile.trip_preferences;
      if (!userPreferences || typeof userPreferences !== 'object') {
        setIsGeneratingMatch(false);
        setMatchModalMessage('Please set your trip preferences in your profile first. Go to your profile and fill in your travel style, budget, and preferences to get personalized match scores.');
        setShowMatchModal(true);
        return;
      }
      
      // Check if preferences have meaningful values (at least one key preference should be set)
      // Exclude restaurantPreferences from this check as it's separate
      const { restaurantPreferences, ...tourPreferences } = userPreferences;
      const hasTourPreferences = tourPreferences && Object.keys(tourPreferences).length > 0;
      
      // Check if at least one meaningful preference is set (not just default/empty values)
      const meaningfulPreferences = [
        'adventureLevel', 'structurePreference', 'foodAndDrinkInterest', 
        'groupPreference', 'budgetComfort', 'cultureVsBeach', 'travelerType'
      ];
      const hasMeaningfulPreferences = meaningfulPreferences.some(key => {
        const value = tourPreferences[key];
        return value !== undefined && value !== null && value !== '' && value !== 'not_set' && value !== 'no_preference';
      });
      
      if (!hasTourPreferences || !hasMeaningfulPreferences) {
        setIsGeneratingMatch(false);
        setMatchModalMessage('Please set your trip preferences in your profile first. Go to your profile and fill in your travel style, budget, and preferences to get personalized match scores.');
        setShowMatchModal(true);
        return;
      }

      // Merge pricing prop into tour object if available
      const tourWithPricing = pricing ? {
        ...tour,
        pricing: {
          ...tour.pricing,
          summary: {
            ...tour.pricing?.summary,
            fromPrice: tour.pricing?.summary?.fromPrice || pricing?.fromPrice || pricing?.summary?.fromPrice,
            fromPriceBeforeDiscount: tour.pricing?.summary?.fromPriceBeforeDiscount || pricing?.fromPriceBeforeDiscount || pricing?.summary?.fromPriceBeforeDiscount,
          }
        }
      } : tour;

      // Call the match API
      const response = await fetch(`/api/internal/tour-match/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          tour: tourWithPricing
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Failed to generate match score');
      }

      const data = await response.json();
      const match = data?.match;

      if (match && match.matchScore !== undefined) {
        setMatchData(match);
        setShowMatchResultsModal(true); // Open modal with results
      } else {
        throw new Error('No match data returned');
      }
    } catch (error) {
      console.error('Error generating match:', error);
      setMatchError(error.message || 'Failed to generate match score');
      toast({
        title: 'Match analysis failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingMatch(false);
    }
  };

  // Helper function to check if a meeting point description is too vague
  const isMeetingPointVague = (description) => {
    if (!description || typeof description !== 'string') return true;
    
    const fullText = description.toLowerCase().trim();
    
    // Filter out descriptions that mention "barcode from reservation" as they're not helpful for meeting point
    // Even if they have location info, the barcode mention makes them confusing
    if (fullText.includes('barcode from reservation') || 
        (fullText.includes('barcode from') && fullText.includes('reservation'))) {
      return true;
    }
    
    // Split by "Special Instructions" if present, and only check the meeting point part
    const parts = description.split(/special instructions?:/i);
    const meetingPointText = parts[0].trim();
    
    if (!meetingPointText) return true;
    
    const text = meetingPointText.toLowerCase().trim();
    
    // Filter out very short single-word or two-word descriptions (like "Hotels", "Hotel", "Hotels Hotel")
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount <= 2 && text.length < 30) {
      // Check if it's just a generic word
      const genericWords = ['hotels', 'hotel', 'location', 'address', 'venue', 'meeting point', 'pickup point'];
      if (genericWords.some(word => text === word || text.startsWith(word + ' ') || text.endsWith(' ' + word))) {
        return true;
      }
    }
    
    // Very vague phrases to filter out
    const vaguePhrases = [
      'center of all playgrounds',
      'center of playgrounds',
      'meeting at the center',
      'we will be meeting at the center',
      'will be meeting at the center',
      'meeting point will be',
      'will be provided',
      'contact us for',
      'to be confirmed',
      'tbd',
      'tba',
      'location to be announced'
    ];
    
    // Check if description contains vague phrases
    const containsVaguePhrase = vaguePhrases.some(phrase => text.includes(phrase));
    
    // If it contains vague phrases and is short, filter it
    if (containsVaguePhrase && text.length < 100) {
      return true;
    }
    
    // Check for very short, generic descriptions
    if (text.length < 50) {
      // Check if it has specific location indicators
      const hasSpecificInfo = /(address|street|avenue|road|boulevard|way|drive|lane|place|gps|coordinates|landmark|restaurant|hotel|marina|park|plaza|square|station|airport|port|dock|pier|beach|#\d+|\d+\s+\w+\s+(street|avenue|road|boulevard|way|drive)|varadero|bucutiweg)/i.test(meetingPointText);
      
      // If it's short and doesn't have specific info, filter it
      // But allow if it's just "hotel" if it's part of a longer address
      if (!hasSpecificInfo && wordCount <= 3) {
        return true;
      }
    }
    
    // Check for descriptions that are too generic and short
    const genericPatterns = [
      /^we will be meeting$/i,
      /^meeting point$/i,
      /^location will be$/i,
      /^address will be$/i,
      /^hotels?$/i,
      /^hotel$/i
    ];
    
    if (genericPatterns.some(pattern => pattern.test(text) && text.length < 60)) {
      return true;
    }
    
    // Filter out descriptions that are unclear or confusing even if they have some location info
    // If it mentions barcode, GPS confusion, or unclear directions, filter it
    if (text.includes('barcode') || 
        (text.includes('gps') && text.includes('easier to locate') && text.length < 150) ||
        (text.includes('same property') && !text.includes('restaurant') && !text.includes('hotel'))) {
      // Only filter if it doesn't have very clear, specific location info
      const hasVerySpecificInfo = /(^\d+\s+\w+|#[0-9]+|street|avenue|road|boulevard)/i.test(meetingPointText);
      if (!hasVerySpecificInfo || text.length < 80) {
        return true;
      }
    }
    
    return false;
  };

  // Helper function to check if special instructions are just cancellation policy
  const isSpecialInstructionsCancellationOnly = (instructions) => {
    if (!instructions || typeof instructions !== 'string') return false;
    
    const text = instructions.toLowerCase().trim();
    
    // Check if it's just cancellation policy text
    const cancellationPatterns = [
      /^cancel\s+(at\s+least|at\s+minimum)/i,
      /^cancellation\s+(policy|required|minimum)/i,
      /^cancel\s+\d+\s+hours?/i,
      /^cancel\s+\d+\s+days?/i,
      /^(full|partial)\s+refund/i
    ];
    
    return cancellationPatterns.some(pattern => pattern.test(text));
  };

  // Filter meeting points to remove vague ones
  const getValidMeetingPoints = () => {
    if (!tour.logistics?.start || !Array.isArray(tour.logistics.start)) return [];
    
    return tour.logistics.start.filter(start => {
      if (!start.description) return false;
      return !isMeetingPointVague(start.description);
    });
  };

  const validMeetingPoints = getValidMeetingPoints();

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  const { user: bookmarksUser, isBookmarked, toggle } = useBookmarks();

  return (
    <div className="min-h-screen pt-16" style={{ overflowX: 'hidden' }} suppressHydrationWarning>
      <NavigationNext />
      
      {/* Hero Section - Matching Destination Page Style */}
      <section className="relative pt-8 pb-12 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20 overflow-hidden ocean-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-blue-200 mr-2" />
                <span className="text-white font-medium">{destination?.category || 'Tour'}</span>
              </div>
              <div className="flex items-start gap-3 mb-4 md:mb-6">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold text-white flex-1">
                  {tour.title}
                </h1>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-shrink-0 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors mt-2"
                  aria-label="Share this tour"
                  title="Share this tour"
                >
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {rating > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                    <span className="text-white/80">({reviewCount.toLocaleString('en-US')} reviews)</span>
                  </div>
                )}
                
                {duration && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                    <Clock className="w-5 h-5" />
                    <span>{formatDuration(duration)}</span>
                  </div>
                )}
                
                {price > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-xl font-bold text-white">
                    From ${price.toLocaleString('en-US')}
                  </div>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    const res = await toggle(productId);
                    if (res?.error === 'not_signed_in') {
                      toast({
                        title: 'Sign in required',
                        description: 'Create a free account to save tours to your favorites.',
                      });
                      return;
                    }
                    toast({
                      title: isBookmarked?.(productId) ? 'Removed from favorites' : 'Saved to favorites',
                      description: 'You can view your favorites in your profile.',
                    });
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors ${
                    isBookmarked?.(productId)
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked?.(productId) ? 'text-yellow-600' : 'text-white'}`} />
                  <span>{isBookmarked?.(productId) ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              {flags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {flags.map((flag, index) => {
                    return (
                      <Badge key={index} variant="outline" className="bg-white/20 text-white border-white/30 text-sm">
                        {flag.replace(/_/g, ' ')}
                      </Badge>
                    );
                  })}
                </div>
              )}


              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg"
                >
                  <a
                    href={viatorUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                  >
                    View Reviews & Availability
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Opens Viator, our trusted affiliate partner
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {tourImage && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative cursor-pointer group"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Hero image clicked, opening lightbox at index 0, Total images:', allImages.length);
                  openLightbox(0);
                }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={tourImage}
                    alt={tour.title}
                    className="w-full h-64 sm:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    fetchPriority="high"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/50 transition-colors"></div>
                  {allImages.length > 1 && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-800">
                      {allImages.length} photos
                    </div>
                  )}
                </div>
              </motion.div>
            )}
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
            {destination && (
              <>
                <span className="text-gray-400">/</span>
                <Link href={`/destinations/${destination.id}`} className="text-gray-500 hover:text-gray-700">
                  {destination.fullName || destination.name}
                </Link>
                <span className="text-gray-400">/</span>
                <Link href={`/destinations/${destination.id}/tours`} className="text-gray-500 hover:text-gray-700">Tours</Link>
              </>
            )}
            {!destination && (effectiveDestinationData?.destinationName || unmatchedDestinationName || effectiveDestinationData?.destinationId) && (
              <>
                <span className="text-gray-400">/</span>
                {(subtleDestinationSlug || unmatchedDestinationSlug || effectiveDestinationData?.destinationId) ? (
                  <>
                    <Link href={`/destinations/${subtleDestinationSlug || unmatchedDestinationSlug || effectiveDestinationData?.destinationId}`} className="text-gray-500 hover:text-gray-700">
                      {effectiveDestinationData?.destinationName || unmatchedDestinationName || `Destination ${effectiveDestinationData?.destinationId}`}
                    </Link>
                    <span className="text-gray-400">/</span>
                    <Link href={`/destinations/${subtleDestinationSlug || unmatchedDestinationSlug || effectiveDestinationData?.destinationId}/tours`} className="text-gray-500 hover:text-gray-700">Tours</Link>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500">{effectiveDestinationData?.destinationName || unmatchedDestinationName || `Destination ${effectiveDestinationData?.destinationId}`}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500">Tours</span>
                  </>
                )}
              </>
            )}
            {!destination && !effectiveDestinationData?.destinationName && !unmatchedDestinationName && !effectiveDestinationData?.destinationId && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-500">Tours</span>
              </>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium line-clamp-1">{tour.title}</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 bg-white" style={{ overflowX: 'hidden' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-start lg:relative">
            {/* Main Content Column - 2/3 width */}
            <article className="flex-1 lg:flex-[2] space-y-8 w-full min-w-0">
              {/* Description */}
              {description ? (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Tour</h2>
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    <p className="text-lg">{description}</p>
                  </div>
                </motion.section>
              ) : null}

              {/* Price Calculator - Below About This Tour (Mobile only) */}
              <div className="lg:hidden">
                <PriceCalculator 
                  tour={tour} 
                  viatorBookingUrl={viatorUrl} 
                  pricing={pricing}
                  travelers={sharedTravelers}
                  setTravelers={setSharedTravelers}
                />
              </div>

              {/* Image Gallery */}
              {additionalImages.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Photo Gallery</h2>
                  <div className={`grid gap-4 ${
                    additionalImages.length === 1 ? 'grid-cols-1' :
                    additionalImages.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                    additionalImages.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                    'grid-cols-2 md:grid-cols-3'
                  }`}>
                    {additionalImages.map((img, index) => {
                      // Calculate the correct index in allImages (hero is index 0, so gallery starts at 1)
                      const imageIndexInAll = index + 1;
                      
                      return (
                        <div
                          key={index}
                          className="relative rounded-lg overflow-hidden aspect-video bg-gray-200 group cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Gallery image clicked:', imageIndexInAll, 'Total images:', allImages.length);
                            openLightbox(imageIndexInAll);
                          }}
                        >
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        {img.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white text-sm line-clamp-2">{img.caption}</p>
                          </div>
                        )}
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {!description && (
                // Debug: Show raw JSON structure if description is missing
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Debug: Tour Data Structure</h2>
                  <details className="text-sm">
                    <summary className="cursor-pointer font-semibold text-gray-700 mb-2">Click to view raw JSON structure</summary>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
                      {JSON.stringify(tour, null, 2)}
                    </pre>
                  </details>
                </motion.section>
              )}

              {/* Highlights */}
              {highlights.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Highlights</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {highlights.map((highlight, index) => {
                      // Handle both string and object formats
                      const highlightText = typeof highlight === 'string' ? highlight.trim() : highlight.text || highlight.name || '';
                      if (!highlightText || highlightText.length === 0) return null;
                      
                      return (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700">{highlightText}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Price Calculator - In Middle of Content (Desktop & Mobile) */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.12 }}
              >
                <PriceCalculator 
                  tour={tour} 
                  viatorBookingUrl={viatorUrl} 
                  pricing={pricing}
                  travelers={sharedTravelers}
                  setTravelers={setSharedTravelers}
                />
              </motion.section>

              {/* Insider Tips */}
              {insiderTips && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 md:p-8 border border-blue-100"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>💡</span>
                    Insider Tips
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">{insiderTips}</p>
                </motion.section>
              )}


              {/* TopTours Insights - Tour Characteristics */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.18 }}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-sm p-6 md:p-8 border border-purple-200"
                >
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs uppercase tracking-[0.4em] text-purple-500">TopTours Insights</p>
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                          AI Generated
                        </Badge>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {tour?.seo?.title || tour?.title || 'Tour'}
                      </h2>
                    </div>
                    
                    {matchScore && typeof matchScore.score === 'number' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-purple-200 shadow-sm">
                        <Sparkles
                          className={`w-4 h-4 ${
                            user && userPreferences && matchScore.score >= 70
                              ? 'text-purple-600'
                              : user && userPreferences
                              ? 'text-purple-500'
                              : 'text-gray-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-gray-900">
                          {matchScore.score}%
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {user && userPreferences ? 'Match for You' : 'Match'}
                        </span>
                      </div>
                    )}
                  </div>

                  {editorialInsight ? (
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                      {editorialInsight}
                    </p>
                  ) : (
                    <div className="space-y-2 text-gray-700 text-sm md:text-base leading-relaxed">
                      <p>
                        Let TopTours AI read the full tour details and generate a short insight
                        about who this experience is best for and what stands out.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="inline-flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                        onClick={handleGenerateInsight}
                        disabled={isGeneratingInsight}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {isGeneratingInsight ? 'Analyzing with AI…' : 'Generate TopTours Insight'}
                        </span>
                      </Button>
                      {insightError && (
                        <p className="text-xs text-red-500">
                          {insightError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {loadingProfile ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <p className="text-gray-600 mt-2">Calculating tour characteristics...</p>
                  </div>
                ) : (matchScore?.tourProfile || tourProfile) ? (
                  <div className="space-y-6">
                    {/* Tour Characteristics */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-4">Tour Characteristics:</h5>
                      <div className="space-y-4">
                        {/* Adventure Level */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            🔥 Adventure Level
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 25, label: '😌', desc: 'Relaxed' },
                              { value: 50, label: '⚖️', desc: 'Balanced' },
                              { value: 75, label: '🔥', desc: 'Adventurous' },
                            ].map((option) => {
                              // Use adjusted profile from matchScore if available, otherwise fallback to tourProfile
                              const profile = matchScore?.tourProfile || tourProfile;
                              const score = profile.adventure_score || 50;
                              const distances = [25, 50, 75].map(v => Math.abs(score - v));
                              const isClosest = Math.abs(score - option.value) === Math.min(...distances);
                              return (
                                <div
                                  key={option.value}
                                  className={`relative p-3 rounded-lg border-2 text-center ${
                                    isClosest
                                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100'
                                      : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <div className="text-xl mb-1">{option.label}</div>
                                  <div className="text-xs font-semibold text-gray-700">{option.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Relaxation vs Exploration */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            🌊 Relaxation vs Exploration
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 25, label: '😌', desc: 'Relax' },
                              { value: 50, label: '⚖️', desc: 'Balanced' },
                              { value: 75, label: '🔍', desc: 'Explore' },
                            ].map((option) => {
                              const profile = matchScore?.tourProfile || tourProfile;
                              const score = profile.relaxation_exploration_score || 50;
                              const distances = [25, 50, 75].map(v => Math.abs(score - v));
                              const isClosest = Math.abs(score - option.value) === Math.min(...distances);
                              return (
                                <div
                                  key={option.value}
                                  className={`relative p-3 rounded-lg border-2 text-center ${
                                    isClosest
                                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100'
                                      : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <div className="text-xl mb-1">{option.label}</div>
                                  <div className="text-xs font-semibold text-gray-700">{option.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Group Size */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            👥 Group Size
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 25, label: '👥', desc: 'Big Groups' },
                              { value: 50, label: '⚖️', desc: 'Either Way' },
                              { value: 75, label: '🧑‍🤝‍🧑', desc: 'Private/Small' },
                            ].map((option) => {
                              const profile = matchScore?.tourProfile || tourProfile;
                              const score = profile.group_intimacy_score || 50;
                              const distances = [25, 50, 75].map(v => Math.abs(score - v));
                              const isClosest = Math.abs(score - option.value) === Math.min(...distances);
                              return (
                                <div
                                  key={option.value}
                                  className={`relative p-3 rounded-lg border-2 text-center ${
                                    isClosest
                                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100'
                                      : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <div className="text-xl mb-1">{option.label}</div>
                                  <div className="text-xs font-semibold text-gray-700">{option.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Budget vs Comfort */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            💰 Budget vs Comfort
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 25, label: '💰', desc: 'Budget' },
                              { value: 50, label: '⚖️', desc: 'Balanced' },
                              { value: 75, label: '✨', desc: 'Comfort' },
                            ].map((option) => {
                              const profile = matchScore?.tourProfile || tourProfile;
                              const score = profile.price_comfort_score || 50;
                              const distances = [25, 50, 75].map(v => Math.abs(score - v));
                              const isClosest = Math.abs(score - option.value) === Math.min(...distances);
                              return (
                                <div
                                  key={option.value}
                                  className={`relative p-3 rounded-lg border-2 text-center ${
                                    isClosest
                                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100'
                                      : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <div className="text-xl mb-1">{option.label}</div>
                                  <div className="text-xs font-semibold text-gray-700">{option.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        {(() => {
                          const profile = matchScore?.tourProfile || tourProfile;
                          const tagCount = profile?.tag_count || 0;
                          const isAdjusted = profile?.isAdjustedFromTourData;
                          if (tagCount > 0) {
                            return `Profile calculated from ${tagCount} tour tag${tagCount !== 1 ? 's' : ''}${isAdjusted ? ' and tour data (price, flags).' : '.'}`;
                          }
                          return 'No tag data available.';
                        })()}
                      </p>
                    </div>

                    {/* CTA Row: Viator + Match to Your Style */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      {/* Left: Viator CTA (same label as primary hero button) */}
                      {viatorUrl && (
                        <Button
                          asChild
                          size="sm"
                          className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 shadow-md px-4 py-2"
                        >
                          <a
                            href={viatorUrl}
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                          >
                            View Reviews &amp; Availability
                            <ExternalLink className="w-4 h-4 ml-1 inline-block" />
                          </a>
                        </Button>
                      )}

                      {/* Right: Open preferences modal (same UX as tours listing page) */}
                      <Button
                        variant="outline"
                        className="inline-flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 ml-auto"
                        onClick={() => setShowPreferencesModal(true)}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-semibold">Match to Your Style</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      {tour?.tags && tour.tags.length === 0
                        ? 'No tour tag data available for analysis.'
                        : 'Unable to calculate tour characteristics.'}
                    </p>
                  </div>
              )}
              </motion.section>


              {/* What's Included */}
              {inclusions.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h2>
                  <div className="space-y-3">
                    {inclusions.map((item, index) => {
                      // Handle both string and object formats
                      const itemText = typeof item === 'string' ? item : item.text || item.name || '';
                      if (!itemText) return null;
                      
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{itemText}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* What's Not Included */}
              {exclusions.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Not Included</h2>
                  <div className="space-y-3">
                    {exclusions.map((item, index) => {
                      // Handle both string and object formats
                      const itemText = typeof item === 'string' ? item : item.text || item.name || '';
                      if (!itemText) return null;
                      
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{itemText}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Additional Information */}
              {tour.additionalInfo && Array.isArray(tour.additionalInfo) && tour.additionalInfo.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Information</h2>
                  <div className="space-y-3">
                    {tour.additionalInfo.map((info, index) => {
                      if (!info.description) return null;
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{info.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Logistics / Meeting Point */}
              {validMeetingPoints.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Meeting Point</h2>
                  <div className="space-y-4">
                    {validMeetingPoints.map((start, index) => {
                      if (!start.description) return null;
                      return (
                        <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                          <p className="text-gray-700 whitespace-pre-line">{start.description}</p>
                        </div>
                      );
                    })}
                  </div>
                  {tour.logistics?.redemption?.specialInstructions && 
                   !isMeetingPointVague(tour.logistics.redemption.specialInstructions) &&
                   !isSpecialInstructionsCancellationOnly(tour.logistics.redemption.specialInstructions) && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Special Instructions</h3>
                      <p className="text-gray-700 whitespace-pre-line">{tour.logistics.redemption.specialInstructions}</p>
                    </div>
                  )}
                </motion.section>
              )}

              {/* Cancellation Policy */}
              {tour.cancellationPolicy && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancellation Policy</h2>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-700">{tour.cancellationPolicy.description}</p>
                    {tour.cancellationPolicy.cancelIfBadWeather && (
                      <p className="text-sm text-gray-600 mt-2">✓ Free cancellation due to bad weather</p>
                    )}
                  </div>
                </motion.section>
              )}

              {/* Supplier */}
              {supplierName && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.65 }}
                  className={`bg-white rounded-lg shadow-sm p-6 md:p-8 border ${operatorPremiumData ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' : 'border-purple-100'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs uppercase tracking-[0.4em] text-purple-500">Tour Operator</p>
                        {operatorPremiumData && (
                          <Crown className="w-4 h-4 text-amber-500" title="Premium Operator" />
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {operatorPremiumData ? 'Premium TopTours Partner' : supplierName}
                        {operatorPremiumData && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </h2>
                      <p className="text-gray-600 mt-2">
                        {operatorPremiumData 
                          ? 'Premium TopTours Partner. Official supplier for this experience. Bookings are handled directly through Viator with verified partners.'
                          : 'Official supplier for this experience. Bookings are handled directly through Viator with verified partners.'}
                      </p>
                      {operatorPremiumData && operatorPremiumData.aggregatedStats && (
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="font-semibold text-gray-900">
                              {operatorPremiumData.aggregatedStats.average_rating?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="text-gray-600 ml-1">
                              ({operatorPremiumData.aggregatedStats.total_reviews?.toLocaleString() || 0} reviews across {operatorPremiumData.aggregatedStats.total_tours_count || 0} tours)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${operatorPremiumData ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-purple-50 border border-purple-100 text-purple-700'}`}>
                      <Shield className={`w-6 h-6 ${operatorPremiumData ? 'text-amber-600' : 'text-purple-600'}`} />
                      <div className="text-sm">
                        <p className="font-semibold">{operatorPremiumData ? 'Premium TopTours Partner' : 'Viator Certified'}</p>
                        <p className={`text-xs ${operatorPremiumData ? 'text-amber-600/80' : 'text-purple-600/80'}`}>
                          {operatorPremiumData ? 'Verified premium operator' : 'Trusted local operator'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Promote Tour Operator Banner - Only show if not premium */}
              {!operatorPremiumData && (
                <PromoteTourOperatorBanner 
                  tour={tour} 
                  destination={destination}
                />
              )}

              {/* Rating Breakdown (Before Reviews) */}
              {ratingBreakdown.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.65 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Guest Ratings</h2>
                      <p className="text-sm text-gray-600">
                        Total review count and overall rating based on Viator and Tripadvisor reviews
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on {(ratingBreakdownTotal || reviewCount).toLocaleString('en-US')} verified reviews
                      </p>
                    </div>
                    {rating > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-3xl font-bold text-purple-700">
                          <Star className="w-6 h-6 text-yellow-400 fill-current" />
                          {rating.toFixed(1)}
                        </div>
                        <p className="text-xs text-purple-700/80 mt-1">Average rating</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {ratingBreakdown.map((item) => (
                      <div key={`rating-${item.rating}`} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          {item.rating}★
                        </div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <div className="w-24 text-right text-sm text-gray-600">
                          {item.count.toLocaleString('en-US')} • {item.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>

                </motion.section>
              )}

              {/* Review Snippets Section (After Ratings, Before FAQs) */}
              {reviews && reviews.reviews && reviews.reviews.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mt-8"
                >
                  <ReviewSnippets 
                    reviews={reviews}
                    tour={tour}
                    productId={productId}
                    viatorBookingUrl={viatorUrl}
                  />
                </motion.section>
              )}

              {/* Frequently Asked Questions */}
              {faqs && faqs.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
                    <p className="text-gray-600 text-sm">
                      Common questions about {tour.title || 'this tour'}
                      {derivedDestinationName ? ` in ${derivedDestinationName}` : ''}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <details
                        key={index}
                        className="group border border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 transition-colors"
                      >
                        <summary className="px-5 py-4 cursor-pointer bg-gray-50 hover:bg-purple-50 transition-colors flex items-center justify-between">
                          <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                        </summary>
                        <div className="px-5 py-4 bg-white border-t border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                </motion.section>
              )}

          {/* (moved) View all tours button now sits under the similar tours grid */}

              {/* Book CTA after Ratings */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: ratingBreakdown.length > 0 ? 0.85 : 0.7 }}
                className="bg-gradient-to-br from-purple-600/90 to-pink-500/90 rounded-2xl shadow-lg p-6 sm:p-8 text-white"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1">
                    <p className="uppercase text-xs tracking-[0.3em] text-white/80 mb-2">Ready to Go?</p>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                      Book {tour.title || 'this tour'}
                    </h3>
                    <p className="text-white/90 text-base leading-relaxed">
                      Secure your spot instantly through Viator and receive flexible cancellation options plus verified customer support.
                    </p>
                  </div>
                  <div className="flex-shrink-0 relative">
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-8 py-6 text-lg shadow-md shadow-purple-900/30"
                    >
                      <a
                        href={viatorUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                      >
                        View Reviews & Availability
                        <ExternalLink className="w-5 h-5 ml-2" />
                      </a>
                    </Button>
                    <div className="absolute top-2 right-2 group">
                      <Info className="w-3.5 h-3.5 text-purple-700/70 cursor-help bg-white/80 rounded-full p-0.5" />
                      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        Opens Viator, our trusted affiliate partner
                        <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                    <p className="text-xs text-white/80 mt-2 text-center">
                      Trusted partner • Instant confirmation
                    </p>
                  </div>
                </div>
              </motion.section>
            </article>

            {/* Sidebar - 1/3 width, sticky on desktop - follows page scroll */}
            <aside className="w-full lg:w-auto lg:flex-1 lg:max-w-sm lg:min-w-[320px] lg:sticky lg:top-24 lg:self-start lg:z-10 lg:h-fit">
              <div className="space-y-6">
                {/* Price Calculator - Replaces Booking Card */}
                <PriceCalculator 
                  tour={tour} 
                  viatorBookingUrl={viatorUrl} 
                  pricing={pricing}
                  travelers={sharedTravelers}
                  setTravelers={setSharedTravelers}
                />

                {/* Other Tours from This Operator */}
                {operatorPremiumData && operatorTours && operatorTours.length > 0 && (
                  <Card className="bg-white border-2 border-amber-200 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Other Tours from {operatorPremiumData.operator_name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Explore more premium experiences from this operator
                      </p>
                      <div className="space-y-3">
                        {operatorTours.slice(0, 5).map((operatorTour, idx) => (
                          <Link
                            key={operatorTour.productId || idx}
                            href={operatorTour.url || `/tours/${operatorTour.productId}`}
                            className="block group"
                          >
                            <div className="flex gap-3 p-3 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200">
                              {operatorTour.imageUrl && (
                                <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                                      <img
                                        src={operatorTour.imageUrl}
                                        alt={operatorTour.title || 'Tour'}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                          e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&q=80";
                                        }}
                                      />
                                      <div className="absolute top-1 right-1">
                                        <Crown className="w-3 h-3 text-amber-500" />
                                      </div>
                                    </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-amber-700 line-clamp-2 mb-1">
                                  {operatorTour.title || 'Tour'}
                                </h4>
                                {operatorTour.rating > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    <span>{operatorTour.rating.toFixed(1)}</span>
                                    {operatorTour.reviewCount > 0 && (
                                      <span className="text-gray-500">
                                        ({operatorTour.reviewCount.toLocaleString()})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {operatorPremiumData.aggregatedStats && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Total Reviews</span>
                            <span className="font-semibold text-gray-900">
                              {operatorPremiumData.aggregatedStats.total_reviews?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-600">Average Rating</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span className="font-semibold text-gray-900">
                                {operatorPremiumData.aggregatedStats.average_rating?.toFixed(1) || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Destination Link */}
                {destination && (
                  <Card className="bg-white border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        alt={destination.fullName || destination.name}
                        src={destination.imageUrl}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1595872018818-97555653a011";
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
                        className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent transition-all duration-200 h-12 text-base font-semibold"
                      >
                        <Link href={`/destinations/${destination.id}`}>
                          Explore {destination.name}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Generic Explore All Destinations Card (for unmatched destinations) */}
                {!destination && (
                  <Card className="bg-white border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        className="w-full h-full object-cover" 
                        alt={unmatchedDestinationName || "Explore destinations"}
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
                          {unmatchedDestinationName || 'Explore Destinations'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4 flex-grow">
                        {unmatchedDestinationName 
                          ? `Discover more tours and activities in ${unmatchedDestinationName}`
                          : 'Discover incredible tours and activities in 3300+ destinations around the world'}
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent transition-all duration-200 h-12 text-base font-semibold"
                      >
                        <Link href={subtleDestinationSlug || unmatchedDestinationSlug ? `/destinations/${subtleDestinationSlug || unmatchedDestinationSlug}` : "/destinations"}>
                          {unmatchedDestinationName 
                            ? `Explore ${unmatchedDestinationName}`
                            : 'Explore All Destinations'}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </aside>
          </div>

          {/* Other Tours from Premium Operator Section */}
          {operatorPremiumData && operatorTours && operatorTours.length > 0 && (
            <motion.section
              id="operator-tours"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-16"
            >
              <div className="mb-6 flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Other Tours from {operatorPremiumData.operator_name}
                </h2>
                <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium Partner
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-6">
                Explore more premium experiences from this verified TopTours partner
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {operatorTours.map((operatorTour, index) => {
                  const operatorTourUrl = operatorTour.url || `/tours/${operatorTour.productId}`;
                  
                  return (
                    <Card key={operatorTour.productId || index} className="bg-white border-2 border-amber-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                      <div 
                        className="relative h-48 bg-gray-200 flex-shrink-0 cursor-pointer" 
                        onClick={() => router.push(operatorTourUrl)}
                      >
                        {operatorTour.imageUrl ? (
                          <>
                            <img
                              src={operatorTour.imageUrl}
                              alt={operatorTour.title || 'Tour'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
                              }}
                            />
                            <div className="absolute top-3 left-3">
                              <Crown className="w-5 h-5 text-amber-500 drop-shadow-lg" title="Premium Operator" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <MapPin className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 
                          className="font-semibold text-gray-800 mb-2 line-clamp-2 flex-1 cursor-pointer hover:text-amber-700 transition-colors"
                          onClick={() => router.push(operatorTourUrl)}
                        >
                          {operatorTour.title || 'Tour'}
                        </h3>
                        
                        {operatorTour.rating > 0 && (
                          <div className="flex items-center mb-2">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="font-medium text-gray-700 ml-1 text-sm">
                              {operatorTour.rating.toFixed(1)}
                            </span>
                            {operatorTour.reviewCount > 0 && (
                              <span className="text-gray-500 text-xs ml-1">
                                ({operatorTour.reviewCount.toLocaleString('en-US')})
                              </span>
                            )}
                          </div>
                        )}

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full mt-auto border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          <Link href={operatorTourUrl}>
                            View Details
                            <Crown className="w-3 h-3 ml-2 text-amber-500" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {operatorPremiumData.aggregatedStats && (
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="mb-3 pb-3 border-b border-amber-200">
                    <p className="text-sm font-semibold text-gray-900">{operatorPremiumData.operator_name}</p>
                    <p className="text-xs text-gray-600 mt-1">Premium TopTours Partner</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Reviews Across All Tours</span>
                    <span className="font-semibold text-gray-900">
                      {operatorPremiumData.aggregatedStats.total_reviews?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-gray-900">
                        {operatorPremiumData.aggregatedStats.average_rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {/* Recommended Tours Section */}
          {(loadingRelatedTours || (recommendedTours && recommendedTours.length > 0)) && (
            <motion.section
              id="recommended-tours"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-16"
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  Similar tours to {tour.title || 'this tour'}
                </h2>
              </div>
              
              {/* Loading skeleton */}
              {loadingRelatedTours && recommendedTours.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-6 bg-gray-200 rounded w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {recommendedTours.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedTours.map((recommendedTour, index) => {
                  const recommendedTourId = recommendedTour.productId || recommendedTour.productCode;
                  const recommendedTourUrl = getTourUrl(recommendedTourId, recommendedTour.title);
                  const recommendedImage = recommendedTour.images?.[0]?.variants?.[5]?.url || 
                                          recommendedTour.images?.[0]?.variants?.[4]?.url || 
                                          recommendedTour.images?.[0]?.variants?.[3]?.url || 
                                          recommendedTour.images?.[0]?.variants?.[0]?.url || '';
                  const recommendedRating = recommendedTour.reviews?.combinedAverageRating || 0;
                  const recommendedReviewCount = recommendedTour.reviews?.totalReviews || 0;
                  // Try multiple pricing fields (product endpoint may not have pricing.summary.fromPrice)
                  const recommendedPrice = recommendedTour.pricing?.summary?.fromPrice || 
                                          recommendedTour.pricingInfo?.fromPrice || 
                                          recommendedTour.pricing?.fromPrice || 
                                          recommendedTour.price || 
                                          null;

                  return (
                    <Card key={recommendedTourId || index} className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                      <div 
                        className="relative h-48 bg-gray-200 flex-shrink-0 cursor-pointer" 
                        onClick={() => router.push(recommendedTourUrl)}
                      >
                        {recommendedImage ? (
                          <img
                            src={recommendedImage}
                            alt={recommendedTour.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <MapPin className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 
                          className="font-semibold text-gray-800 mb-2 line-clamp-2 flex-1 cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={() => router.push(recommendedTourUrl)}
                        >
                          {recommendedTour.title}
                        </h3>
                        
                        {recommendedRating > 0 && (
                          <div className="flex items-center mb-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium text-gray-700 ml-1 text-sm">
                              {recommendedRating.toFixed(1)}
                            </span>
                            <span className="text-gray-500 text-xs ml-1">
                              ({recommendedReviewCount.toLocaleString('en-US')})
                            </span>
                          </div>
                        )}

                        {recommendedPrice && recommendedPrice > 0 && (
                          <div className="text-lg font-bold text-orange-600 mb-3">
                            From ${recommendedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full mt-auto border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Link href={recommendedTourUrl}>
                            View Details
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              )}
            </motion.section>
          )}

          {/* Similar Tours Section */}
          {(loadingRelatedTours || (similarTours && similarTours.length > 0)) && (
            <motion.section
              id="similar-tours"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-16"
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{similarSectionTitle}</h2>
              </div>
              
              {/* Loading skeleton */}
              {loadingRelatedTours && similarTours.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-6 bg-gray-200 rounded w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {similarTours.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarTours.map((similarTour, index) => {
                  const similarTourId = getTourProductId(similarTour);
                  const similarTourUrl = getTourUrl(similarTourId, similarTour.title);
                  const similarImage = similarTour.images?.[0]?.variants?.[5]?.url || 
                                      similarTour.images?.[0]?.variants?.[4]?.url || 
                                      similarTour.images?.[0]?.variants?.[3]?.url || 
                                      similarTour.images?.[0]?.variants?.[0]?.url || '';
                  const similarRating = similarTour.reviews?.combinedAverageRating || 0;
                  const similarReviewCount = similarTour.reviews?.totalReviews || 0;
                  const similarPrice = similarTour.pricing?.summary?.fromPrice || 0;

                  return (
                    <Card key={similarTourId || index} className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                      <div 
                        className="relative h-48 bg-gray-200 flex-shrink-0 cursor-pointer" 
                        onClick={() => router.push(similarTourUrl)}
                      >
                        {similarImage ? (
                          <img
                            src={similarImage}
                            alt={similarTour.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <MapPin className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 
                          className="font-semibold text-gray-800 mb-2 line-clamp-2 flex-1 cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={() => router.push(similarTourUrl)}
                        >
                          {similarTour.title}
                        </h3>
                        
                        {similarRating > 0 && (
                          <div className="flex items-center mb-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium text-gray-700 ml-1 text-sm">
                              {similarRating.toFixed(1)}
                            </span>
                            <span className="text-gray-500 text-xs ml-1">
                              ({similarReviewCount.toLocaleString('en-US')})
                            </span>
                          </div>
                        )}

                        <div className="text-lg font-bold text-orange-600 mb-3">
                          From ${similarPrice}
                        </div>

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full mt-auto border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Link href={similarTourUrl}>
                            View Details
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              )}

              {finalDestinationTourUrl && (
                <div className="mt-10 text-center">
                  <Button
                    asChild
                    variant="outline"
                    className="px-6 py-3 border rounded-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Link href={finalDestinationTourUrl}>
                      View all tours in {derivedDestinationName || 'this destination'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}

            </motion.section>
          )}
        </div>
      </section>

      {/* Internal Linking Section */}
      {(destination || effectiveDestinationData || unmatchedDestinationSlug) && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Get guides and restaurants for this destination */}
              {(() => {
                // Use destination if available (hardcoded), otherwise use effectiveDestinationData
                // IMPORTANT: Always use slug for links, never the numeric ID
                const destName = effectiveDestinationData?.destinationName || unmatchedDestinationName || subtleDestinationName || destination?.name || destination?.fullName || '';
                const destSlugFromServer = effectiveDestinationData?.slug || subtleDestinationSlug || unmatchedDestinationSlug;
                // If slug is numeric (like "51525"), generate slug from name instead
                const isNumericSlug = destSlugFromServer && /^\d+$/.test(destSlugFromServer);
                const finalSlug = isNumericSlug && destName 
                  ? generateSlugFromName(destName)
                  : (destSlugFromServer || effectiveDestinationData?.destinationId);
                
                const destForDisplay = destination || {
                  id: finalSlug || effectiveDestinationData?.destinationId,
                  name: destName,
                  fullName: destName,
                  country: effectiveDestinationData?.country || null,
                };
                
                const destinationGuides = destForDisplay.country ? getGuidesByCountry(destForDisplay.country) : [];
                // Use primaryDestinationSlug (from 182 destinations) or slug from effectiveDestinationData
                const destinationIdForRestaurants = primaryDestinationSlug || destForDisplay.id || effectiveDestinationData?.slug || effectiveDestinationData?.destinationId;
                const staticRestaurants = destinationIdForRestaurants ? getRestaurantsForDestination(destinationIdForRestaurants) : [];
                // Use restaurants from server if available, otherwise use static restaurants
                const restaurantsToDisplay = (restaurants && restaurants.length > 0) ? restaurants : staticRestaurants;
                const hasRestaurants = restaurantsToDisplay.length > 0;
                const hasGuides = destinationGuides && destinationGuides.length > 0;

                return (
                  <>
                    {/* Destination Page Link */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                    >
                      <Link href={`/destinations/${destForDisplay.id}`}>
                        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Home className="w-6 h-6 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                  {destForDisplay.fullName || destForDisplay.name} Destination Guide
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                  Explore the complete destination guide with travel tips, best time to visit, and more.
                                </p>
                                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                                  View Destination Guide
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>

                    {/* Tours Page Link */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    >
                      <Link href={`/destinations/${destForDisplay.id}/tours`}>
                        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-6 h-6 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                  All Tours & Activities in {destForDisplay.fullName || destForDisplay.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                  Browse all available tours and activities with filters and search.
                                </p>
                                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                                  View All Tours
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>

                    {/* Top Restaurants */}
                    {hasRestaurants && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Top Restaurants in {destForDisplay.fullName || destForDisplay.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-6">
                            Discover the best dining experiences and hand-picked restaurants.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {restaurantsToDisplay.slice(0, 8).map((restaurant, index) => {
                            const restaurantUrl = `/destinations/${destinationIdForRestaurants || destination.id}/restaurants/${restaurant.slug}`;
                            const description = restaurant.metaDescription 
                              || restaurant.tagline 
                              || restaurant.summary 
                              || restaurant.description
                              || (restaurant.cuisines?.length > 0 
                                  ? `Discover ${restaurant.cuisines.join(' & ')} cuisine at ${restaurant.name} in ${destForDisplay.fullName || destForDisplay.name}.`
                                  : `Experience great dining at ${restaurant.name} in ${destForDisplay.fullName || destForDisplay.name}.`);
                            
                            return (
                              <motion.div
                                key={restaurant.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                viewport={{ once: true }}
                              >
                                <Card className="h-full border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-shadow">
                                  <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                                        <UtensilsCrossed className="w-5 h-5 text-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-bold text-gray-900 line-clamp-1">
                                          {restaurant.name}
                                        </h4>
                                        {restaurant.cuisines?.length > 0 && (
                                          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                            {restaurant.cuisines[0]}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                                      {description.length > 120 ? description.slice(0, 120) + '...' : description}
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
                              </motion.div>
                            );
                          })}
                          {/* View All Restaurants Card */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.7 }}
                            viewport={{ once: true }}
                          >
                            <Link
                              href={`/destinations/${destForDisplay.id}/restaurants`}
                              className="block h-full"
                            >
                              <Card className="h-full border border-blue-100 bg-white shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center p-6">
                                <UtensilsCrossed className="w-8 h-8 text-blue-600 mb-3" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                  View All Restaurants in {destForDisplay.fullName || destForDisplay.name}
                                </h4>
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
                      </motion.div>
                    )}


                    {/* Travel Guides */}
                    {hasGuides && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                  {destForDisplay.fullName || destForDisplay.name} Travel Guides
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                  Read comprehensive guides to plan your perfect trip.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {destinationGuides.slice(0, 3).map((guide) => (
                                    <Link key={guide.id} href={`/travel-guides/${guide.id}`}>
                                      <Badge variant="secondary" className="bg-white hover:bg-blue-100 cursor-pointer">
                                        {guide.title}
                                      </Badge>
                                    </Link>
                                  ))}
                                  {destinationGuides.length > 3 && (
                                    <Badge variant="secondary" className="bg-white">
                                      +{destinationGuides.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Full-Width Price Bar - Smart: Match Score or Rating/Reviews */}
      {showStickyButton && (
        <StickyPriceBar 
          tour={tour} 
          pricing={pricing} 
          viatorUrl={viatorUrl} 
          matchScore={matchScore}
          travelers={sharedTravelers}
          setTravelers={setSharedTravelers}
        />
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && allImages.length > 0 && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Top Bar - Close Button, Book Button, and Image Counter */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            {/* Image Counter - Left side */}
            {allImages.length > 1 && (
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
                <p className="text-white text-sm font-medium">
                  {lightboxIndex + 1} / {allImages.length}
                </p>
              </div>
            )}
            
            {/* View Reviews & Availability Button - Centered */}
            <div onClick={(e) => e.stopPropagation()} className="absolute left-1/2 -translate-x-1/2">
              <div className="relative">
                <Button
                  asChild
                  size="lg"
                  className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 shadow-2xl px-6 py-3 text-base font-semibold"
                >
                  <a
                    href={viatorUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Reviews & Availability
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <div className="absolute -top-1 -right-1 group">
                  <Info className="w-3.5 h-3.5 text-white/70 cursor-help bg-orange-500 rounded-full p-0.5" />
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Opens Viator, our trusted affiliate partner
                    <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Close Button - Right side */}
            <button
              onClick={closeLightbox}
              className="text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full hover:bg-black/70 ml-auto"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-full hover:bg-black/70"
                aria-label="Previous image"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-full hover:bg-black/70"
                aria-label="Next image"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </>
          )}
          
          {/* Image Container with Caption Below */}
          <div 
            className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center p-4 pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-w-full w-full flex flex-col items-center justify-center flex-1 overflow-auto">
              {/* Image */}
              <div className="flex-shrink-0 mb-4">
                <motion.img
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  src={allImages[lightboxIndex]?.url}
                  alt={allImages[lightboxIndex]?.alt || tour.title}
                  className="max-w-full max-h-[calc(100vh-20rem)] object-contain rounded-lg"
                />
              </div>
              
              {/* Image Caption - Below the image */}
              {allImages[lightboxIndex]?.caption && (
                <div className="w-full max-w-4xl bg-black/70 backdrop-blur-sm rounded-lg px-6 py-3 mb-4 flex-shrink-0">
                  <p className="text-white text-center text-sm md:text-base">{allImages[lightboxIndex].caption}</p>
                </div>
              )}
              
            </div>
          </div>
          
          {/* Thumbnail Navigation - Lazy load thumbnails for performance */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-4xl w-full px-4 z-10">
              <div className="flex gap-2 justify-center overflow-x-auto pb-2 hide-scrollbar">
                {allImages.map((img, index) => {
                  // Only load thumbnails for current image and adjacent ones (performance optimization)
                  const shouldLoad = Math.abs(index - lightboxIndex) <= 2;
                  
                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(index);
                      }}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === lightboxIndex 
                          ? 'border-white scale-110' 
                          : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      {shouldLoad ? (
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800/50 flex items-center justify-center">
                          <span className="text-white/50 text-xs">{index + 1}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
                  <h2 className="text-2xl font-bold text-gray-900">How Well Does This Tour Match Your Preferences?</h2>
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
                    { key: 'adventure', label: '🔥 Adventure level', icon: '🔥' },
                    { key: 'structure', label: '📋 Structure preference', icon: '📋' },
                    { key: 'food', label: '🍷 Food & drink interest', icon: '🍷' },
                    { key: 'group', label: '👥 Group size preference', icon: '👥' },
                    { key: 'budget', label: '💰 Budget vs comfort', icon: '💰' },
                    { key: 'relaxExplore', label: '🌊 Relaxation vs exploration', icon: '🌊' },
                  ].map(({ key, label, icon }) => {
                    const score = matchData.matches[key] || 0;
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
                asChild
                className="sunset-gradient text-white font-semibold px-6 py-3 flex-1"
              >
                <a
                  href={viatorUrl}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                >
                  Book this tour
                  <ExternalLink className="w-5 h-5 ml-2 inline" />
                </a>
              </Button>
              <Button
                onClick={async () => {
                  await toggle(productId);
                  toast({
                    title: isBookmarked?.(productId) ? 'Removed from favorites' : 'Saved to favorites',
                    description: isBookmarked?.(productId) ? 'This tour has been removed from your saved tours.' : 'This tour has been saved to your favorites.',
                  });
                }}
                variant="outline"
                className="flex-1 border-2 border-orange-200 hover:bg-orange-50"
              >
                <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked?.(productId) ? 'text-yellow-600 fill-yellow-600' : 'text-gray-600'}`} />
                {isBookmarked?.(productId) ? 'Saved to Favorites' : 'Save to Favorites'}
              </Button>
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
                <p className="text-sm text-gray-600">To use AI tour matching</p>
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
                  onClick={() => router.push('/profile?tab=trip')}
                  className="sunset-gradient text-white flex-1"
                >
                  Go to Preferences
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

      {/* Related Travel Guides Section - Same style as restaurant page */}
      {categoryGuides && Array.isArray(categoryGuides) && categoryGuides.length > 0 && (() => {
        // Use the same logic as Internal Linking Section for consistency
        const destForDisplay = destination || {
          id: effectiveDestinationData?.slug || effectiveDestinationData?.destinationId || unmatchedDestinationSlug || subtleDestinationSlug,
          name: effectiveDestinationData?.destinationName || unmatchedDestinationName || subtleDestinationName || '',
          fullName: effectiveDestinationData?.destinationName || unmatchedDestinationName || subtleDestinationName || '',
        };
        
        const destSlug = destForDisplay.id;
        const destName = destForDisplay.fullName || destForDisplay.name || 'this destination';
        
        if (!destSlug) {
          console.warn('⚠️ Related Travel Guides: No destination slug available', {
            effectiveDestinationData,
            destination,
            unmatchedDestinationSlug,
            subtleDestinationSlug,
            categoryGuidesLength: categoryGuides.length
          });
          return null;
        }
        
        console.log('✅ Related Travel Guides: Displaying guides', {
          destSlug,
          destName,
          categoryGuidesCount: categoryGuides.length
        });
        
        return (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-gray-900">
                    Related Travel Guides for {destName}
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Explore comprehensive guides to plan your perfect trip, including food tours, cultural experiences, and more.
                </p>
                
                {/* All category guides in a grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {categoryGuides.slice(0, 6).map((guide) => {
                    const categoryName = guide.category_name || guide.title || '';
                    const categorySlug = guide.category_slug || '';
                    const guideUrl = `/destinations/${destSlug}/guides/${categorySlug}`;
                    
                    if (!categorySlug) return null;
                    
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
                        href={guideUrl}
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
                                  ? `Discover the best ${categoryName.toLowerCase()} experiences in ${destName}.`
                                  : `Explore ${categoryName.toLowerCase()} in ${destName}.`
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
                    <Link href={`/destinations/${destSlug}`}>
                      View All {destName} Guides
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        );
      })()}

      {/* Subtle destination ID / name display at bottom of page */}
      {(effectiveDestinationData?.destinationId || tour?.destinations?.[0]?.ref) && (
        <div className="py-4 text-center bg-white border-t">
          <div className="text-xs text-gray-600 font-mono space-y-1">
            <div>
              Dest ID: {effectiveDestinationData?.destinationId || tour?.destinations?.[0]?.ref || 'N/A'}
              {subtleDestinationName && ` (${subtleDestinationName})`}
            </div>
            {subtleDestinationSlug && (
              <div>Slug: {subtleDestinationSlug}</div>
            )}
            {effectiveDestinationData?.source && (
              <div className="text-[10px] uppercase tracking-wide text-gray-400">
                Source: {effectiveDestinationData.source}
              </div>
            )}
          </div>
        </div>
      )}

      <FooterNext />
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={tour?.title || 'this tour'}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      {/* Match to Your Style Modal (same UX as /tours listing page) */}
      {showPreferencesModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreferencesModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900">Match to Your Style</h2>
              </div>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Adventure Level */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">🔥 Adventure Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 25, label: '😌', desc: 'Relaxed' },
                    { value: 50, label: '⚖️', desc: 'Balanced' },
                    { value: 75, label: '🔥', desc: 'Adventurous' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setLocalPreferences((prev) => ({ ...(prev || {}), adventureLevel: option.value }))
                      }
                      className={`relative p-2.5 rounded-lg border-2 transition-all duration-200 ${
                        (localPreferences?.adventureLevel || 50) === option.value
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{option.label}</div>
                      <div className="text-[10px] font-semibold text-gray-700">{option.desc}</div>
                      {(localPreferences?.adventureLevel || 50) === option.value && (
                        <div className="absolute top-1 right-1">
                          <div className="w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-white text-[8px]">✓</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Relaxation vs Exploration */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">🌊 Relaxation vs Exploration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 25, label: '😌', desc: 'Relax' },
                    { value: 50, label: '⚖️', desc: 'Balanced' },
                    { value: 75, label: '🔍', desc: 'Explore' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setLocalPreferences((prev) => ({ ...(prev || {}), cultureVsBeach: option.value }))
                      }
                      className={`relative p-2.5 rounded-lg border-2 transition-all duration-200 ${
                        (localPreferences?.cultureVsBeach || 50) === option.value
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{option.label}</div>
                      <div className="text-[10px] font-semibold text-gray-700">{option.desc}</div>
                      {(localPreferences?.cultureVsBeach || 50) === option.value && (
                        <div className="absolute top-1 right-1">
                          <div className="w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-white text-[8px]">✓</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Size */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">👥 Group Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 25, label: '👥', desc: 'Big Groups' },
                    { value: 50, label: '⚖️', desc: 'Either Way' },
                    { value: 75, label: '🧑‍🤝‍🧑', desc: 'Private/Small' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setLocalPreferences((prev) => ({ ...(prev || {}), groupPreference: option.value }))
                      }
                      className={`relative p-2.5 rounded-lg border-2 transition-all duration-200 ${
                        (localPreferences?.groupPreference || 50) === option.value
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{option.label}</div>
                      <div className="text-[10px] font-semibold text-gray-700">{option.desc}</div>
                      {(localPreferences?.groupPreference || 50) === option.value && (
                        <div className="absolute top-1 right-1">
                          <div className="w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-white text-[8px]">✓</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget vs Comfort */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">💰 Budget vs Comfort</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 25, label: '💰', desc: 'Budget' },
                    { value: 50, label: '⚖️', desc: 'Balanced' },
                    { value: 75, label: '✨', desc: 'Comfort' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setLocalPreferences((prev) => ({ ...(prev || {}), budgetComfort: option.value }))
                      }
                      className={`relative p-2.5 rounded-lg border-2 transition-all duration-200 ${
                        (localPreferences?.budgetComfort || 50) === option.value
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{option.label}</div>
                      <div className="text-[10px] font-semibold text-gray-700">{option.desc}</div>
                      {(localPreferences?.budgetComfort || 50) === option.value && (
                        <div className="absolute top-1 right-1">
                          <div className="w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-white text-[8px]">✓</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guided vs Independent */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">📋 Guided vs Independent</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 25, label: '🕰️', desc: 'Independent' },
                    { value: 50, label: '⚖️', desc: 'Mixed' },
                    { value: 75, label: '📋', desc: 'Guided' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setLocalPreferences((prev) => ({
                          ...(prev || {}),
                          structurePreference: option.value,
                        }))
                      }
                      className={`relative p-2.5 rounded-lg border-2 transition-all duration-200 ${
                        (localPreferences?.structurePreference || 50) === option.value
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{option.label}</div>
                      <div className="text-[10px] font-semibold text-gray-700">{option.desc}</div>
                      {(localPreferences?.structurePreference || 50) === option.value && (
                        <div className="absolute top-1 right-1">
                          <div className="w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-white text-[8px]">✓</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food & Drink */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">🍷 Food & Drink Interest</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 25, label: '🍽️', desc: 'Not Important' },
                    { value: 50, label: '⚖️', desc: 'Nice to Have' },
                    { value: 75, label: '🍷', desc: 'Very Important' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setLocalPreferences((prev) => ({
                          ...(prev || {}),
                          foodAndDrinkInterest: option.value,
                        }))
                      }
                      className={`relative p-2.5 rounded-lg border-2 transition-all duration-200 ${
                        (localPreferences?.foodAndDrinkInterest || 50) === option.value
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{option.label}</div>
                      <div className="text-[10px] font-semibold text-gray-700">{option.desc}</div>
                      {(localPreferences?.foodAndDrinkInterest || 50) === option.value && (
                        <div className="absolute top-1 right-1">
                          <div className="w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-white text-[8px]">✓</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
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
                      setLocalPreferences({
                        adventureLevel: 50,
                        cultureVsBeach: 50,
                        groupPreference: 50,
                        budgetComfort: 50,
                        structurePreference: 50,
                        foodAndDrinkInterest: 50,
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
                    disabled={savingPreferencesToProfile || loadingProfile}
                  >
                    {savingPreferencesToProfile
                      ? 'Saving…'
                      : user
                      ? 'Save to Profile'
                      : 'Create account to save'}
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
    </div>
  );
}
