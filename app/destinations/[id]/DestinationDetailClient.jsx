"use client";
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { 
  Star, ExternalLink, Loader2, Brain, MapPin, Calendar, Clock, Car, Hotel, Search, BookOpen, ArrowRight, X, UtensilsCrossed, DollarSign, ChevronLeft, ChevronRight, ChevronDown, Info, Share2, Heart, Crown, Building2, Sparkles, TrendingUp, Baby, Plane, Waves
} from 'lucide-react';
import { useRestaurantBookmarks } from '@/hooks/useRestaurantBookmarks';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getRelatedDestinations, getDestinationsByIds, getDestinationsByCountry } from '../../../src/data/destinationsData.js';
import { getGuidesByCategory, getGuidesByIds, getGuidesByCountry } from '../../../src/data/travelGuidesData.js';
// Restaurants are now passed as props from the server component
import { getTourUrl, getTourProductId } from '@/utils/tourHelpers';
import { groupToursByCategory } from '@/lib/tourCategorization';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import TourCard from '@/components/tour/TourCard';
import { 
  calculateTourProfile, 
  getUserPreferenceScores, 
  calculateMatchScore, 
  getMatchDisplay,
  getDefaultPreferences 
} from '@/lib/tourMatching';
import { calculateEnhancedMatchScore } from '@/lib/tourMatchingEnhanced';
import { resolveUserPreferences } from '@/lib/preferenceResolution';
import { useBookmarks } from '@/hooks/useBookmarks';
import { extractRestaurantStructuredValues, calculateRestaurantPreferenceMatch } from '@/lib/restaurantMatching';

// OPTIMIZED: Lazy load modals - only load when opened
const ShareModal = lazy(() => import('@/components/sharing/ShareModal'));
const SmartTourFinder = lazy(() => import('@/components/home/SmartTourFinder'));
const TourMatchModal = lazy(() => import('@/components/tour/TourMatchModal'));
const RestaurantMatchModal = lazy(() => import('@/components/restaurant/RestaurantMatchModal'));

// Helper to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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

// Map category names for display (e.g., "Culinary Tours" -> "Food Tours")
function getDisplayCategoryName(categoryName) {
  const categoryMap = {
    'Culinary Tours': 'Food Tours',
  };
  return categoryMap[categoryName] || categoryName;
}

const DISCOVER_CARS_URL = 'https://www.discovercars.com/?a_aid=toptours&a_cid=65100b9c';

export default function DestinationDetailClient({ destination, promotionScores = {}, trendingTours = [], trendingRestaurants = [], promotedTours = [], promotedRestaurants = [], hardcodedTours = {}, restaurants = [], restaurantPromotionScores = {}, premiumRestaurantIds = [], categoryGuides: categoryGuidesProp = [], hasBabyEquipmentRentals = false }) {
  
  // Ensure destination exists
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
  
  // Ensure destination has required arrays
  const safeDestination = {
    ...destination,
    tourCategories: Array.isArray(destination?.tourCategories) ? destination.tourCategories : [],
    whyVisit: Array.isArray(destination?.whyVisit) ? destination.whyVisit : [],
    highlights: Array.isArray(destination?.highlights) ? destination.highlights : [],
    gettingAround: destination?.gettingAround || '',
    bestTimeToVisit: destination?.bestTimeToVisit || null,
    parentCountryDestination: destination?.parentCountryDestination || null, // For small destinations that belong to a parent country
  };
  const destinationName = safeDestination.name || safeDestination.fullName || safeDestination.id;
  
  // Ensure arrays are safe
  const safeTrendingTours = Array.isArray(trendingTours) ? trendingTours : [];
  const safeTrendingRestaurants = Array.isArray(trendingRestaurants) ? trendingRestaurants : [];
  const safePromotedTours = Array.isArray(promotedTours) ? promotedTours : [];
  const safePromotedRestaurants = Array.isArray(promotedRestaurants) ? promotedRestaurants : [];
  const safeHardcodedTours = hardcodedTours && typeof hardcodedTours === 'object' ? hardcodedTours : {};


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tours, setTours] = useState({ all: [] });
  const [loading, setLoading] = useState({ all: false });
  const [totalToursCount, setTotalToursCount] = useState(null);
  const [visibleTours, setVisibleTours] = useState({});
  const [relatedDestinations, setRelatedDestinations] = useState([]);
  const [relatedGuides, setRelatedGuides] = useState([]);
  const [categoryGuides, setCategoryGuides] = useState([]);
  const [countryDestinations, setCountryDestinations] = useState([]);
  const [showMoreCountryDestinations, setShowMoreCountryDestinations] = useState(12);
  const [guideCarouselIndex, setGuideCarouselIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(true);
  const [showParentCountryModal, setShowParentCountryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Restaurant bookmarks
  const { isBookmarked, toggle: toggleBookmark } = useRestaurantBookmarks();
  // OPTIMIZED: Memoize supabase client to ensure stable reference (it's a singleton, but function call creates new reference)
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [matchScores, setMatchScores] = useState({});
  const [localPreferences, setLocalPreferences] = useState(() => {
    if (typeof window === 'undefined') return getDefaultPreferences();
    try {
      const stored = localStorage.getItem('tourPreferences');
      return stored ? JSON.parse(stored) : getDefaultPreferences();
    } catch {
      return getDefaultPreferences();
    }
  });
  const [savingPreferencesToProfile, setSavingPreferencesToProfile] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { isBookmarked: isTourBookmarked, toggle: toggleTourBookmark } = useBookmarks();
  
  // Restaurant match score state
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantMatchModal, setShowRestaurantMatchModal] = useState(false);
  const [showRestaurantPreferencesModal, setShowRestaurantPreferencesModal] = useState(false);
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
  
  // Accordion state for informational sections
  const [expandedSections, setExpandedSections] = useState({
    whyVisit: false,
    gettingAround: false,
    travelingWithBaby: false,
    mustSee: false,
    bestTime: false,
    tourCategories: false,
  });
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Sync local restaurant preferences to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !localRestaurantPreferences) return;
    try {
      localStorage.setItem('topTours_restaurant_preferences', JSON.stringify(localRestaurantPreferences));
    } catch {}
  }, [localRestaurantPreferences]);
  
  // Save preferences to profile
  const handleSavePreferencesToProfile = async () => {
    if (!user) {
      try {
        const redirect = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
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
      toast({
        title: 'Preferences saved',
        description: 'Saved to your profile (syncs across devices).',
      });
      setShowPreferencesModal(false);
    } catch (e) {
      console.error('Error saving preferences to profile:', e);
      toast({
        title: 'Could not save preferences',
        description: e?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingPreferencesToProfile(false);
    }
  };
  
  // Sync localPreferences to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('tourPreferences', JSON.stringify(localPreferences));
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [localPreferences]);
  
  // Restaurants are now passed as props (already formatted from database)
  // Ensure restaurants is always an array
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];
  const hasRestaurants = safeRestaurants.length > 0;
  
  // OPTIMIZED: Memoize promoted tours calculation to prevent recalculation on every render
  const promotedToursToDisplay = useMemo(() => {
    if (!safePromotedTours || safePromotedTours.length === 0) return [];
    
    // Check if promoted tours have full tour data (from server-side fetch)
    const hasFullTourData = safePromotedTours.some(t => 
      t.title || t.productContent || t.seo || t.productName
    );
    
    if (hasFullTourData) {
      // Use full tour data directly
      return safePromotedTours
        .filter(t => {
          const productId = t.product_id || t.productId || t.productCode;
          return productId && (t.title || t.productContent || t.seo || t.productName);
        })
        .slice(0, 6);
    } else if (tours.all && tours.all.length > 0) {
      // Fallback: Match promoted product IDs with actual tour data from tours.all
      const promotedProductIds = new Set(safePromotedTours.map(t => t.product_id || t.productId || t.productCode).filter(Boolean));
      return tours.all.filter(tour => {
        const tourId = getTourProductId(tour);
        return tourId && promotedProductIds.has(tourId);
      }).slice(0, 6);
    }
    
    return [];
  }, [safePromotedTours, tours.all]);
  
  // OPTIMIZED: Memoize promoted restaurants calculation
  const promotedRestaurantsToDisplay = useMemo(() => {
    if (!safePromotedRestaurants || safePromotedRestaurants.length === 0) return [];
    return safePromotedRestaurants.slice(0, 6);
  }, [safePromotedRestaurants]);
  
  // Calculate restaurant match scores (must be after safeRestaurants is declared)
  const restaurantMatchById = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(safeRestaurants)) return map;

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

    safeRestaurants.forEach((r) => {
      try {
        const values = extractRestaurantStructuredValues(r);
        if (values?.error) return;
        const match = calculateRestaurantPreferenceMatch(pseudoUserPreferences, values, r);
        if (match?.error) return;
        map.set(r.id, match);
      } catch {}
    });
    
    // Also calculate match scores for promoted restaurants
    if (Array.isArray(safePromotedRestaurants)) {
      safePromotedRestaurants.forEach((r) => {
        try {
          const values = extractRestaurantStructuredValues(r);
          if (values?.error) return;
          const match = calculateRestaurantPreferenceMatch(pseudoUserPreferences, values, r);
          if (match?.error) return;
          map.set(r.id, match);
        } catch {}
      });
    }
    
    return map;
  }, [safeRestaurants, safePromotedRestaurants, localRestaurantPreferences]);

  // Popular Pages: always show 6 cards. Main cards (Tours, Restaurants, Travel Guides, Car Rentals, Airport Transfers, Baby Equipment); fill remaining with category-guide substitutes.
  const popularPageCards = useMemo(() => {
    const destName = safeDestination.fullName || safeDestination.name;
    const destId = safeDestination.id;
    const cards = [];

    // 1. Tours (always)
    cards.push({
      type: 'tours',
      href: `/destinations/${destId}/tours`,
      icon: MapPin,
      iconGradient: 'from-blue-500 to-blue-600',
      title: 'Tours & Activities',
      description: `Discover ${totalToursCount ? `${totalToursCount.toLocaleString()}+` : '1,900+'} top-rated tours and activities in ${destName}. From cultural experiences to adventure tours, find the perfect activity for your trip.`,
      badge: totalToursCount ? `${totalToursCount.toLocaleString()}+ tours` : null,
      ctaText: 'Explore Tours',
      ctaColorClass: 'text-blue-600',
    });

    // 2. Restaurants (if hasRestaurants)
    if (hasRestaurants) {
      cards.push({
        type: 'restaurants',
        href: `/destinations/${destId}/restaurants`,
        icon: UtensilsCrossed,
        iconGradient: 'from-purple-500 to-pink-600',
        title: 'Restaurants',
        description: `Find ${safeRestaurants.length}+ top-rated restaurants in ${destName}. Discover local favorites, fine dining, and hidden gems with our curated restaurant guide.`,
        badge: `${safeRestaurants.length}+ restaurants`,
        ctaText: 'Find Restaurants',
        ctaColorClass: 'text-purple-600',
      });
    }

    // 3. Travel Guides (if any category guides)
    if (categoryGuidesProp.length > 0) {
      cards.push({
        type: 'travel-guides',
        href: '#guides',
        icon: BookOpen,
        iconGradient: 'from-indigo-500 to-blue-600',
        title: 'Travel Guides',
        description: `Comprehensive travel guides for ${destName}. Plan your perfect trip with detailed guides covering tours, dining, transportation, and local insights.`,
        badge: `${categoryGuidesProp.length}+ guides`,
        ctaText: 'Read Guides',
        ctaColorClass: 'text-indigo-600',
      });
    }

    // 4. Car Rentals (always)
    cards.push({
      type: 'car-rentals',
      href: `/destinations/${destId}/car-rentals`,
      icon: Car,
      iconGradient: 'from-green-500 to-emerald-600',
      title: 'Car Rentals',
      description: `Find the best car rental deals in ${destName}. Compare prices, book in advance, and explore at your own pace with flexible rental options.`,
      badge: null,
      ctaText: 'Find Car Rentals',
      ctaColorClass: 'text-green-600',
    });

    // 5. Airport Transfers (if guide exists)
    if (categoryGuidesProp.some((g) => (g.category_slug || '') === 'airport-transfers')) {
      cards.push({
        type: 'airport-transfers',
        href: `/destinations/${destId}/guides/airport-transfers`,
        icon: Plane,
        iconGradient: 'from-cyan-500 to-blue-600',
        title: 'Airport Transfers',
        description: `Compare shared and private airport transfer options to and from ${destName}. Book in advance for fixed pricing and a stress-free arrival.`,
        badge: null,
        ctaText: 'Book Transfers',
        ctaColorClass: 'text-cyan-600',
      });
    }

    // 6. Baby Equipment (if available)
    if (hasBabyEquipmentRentals) {
      cards.push({
        type: 'baby-equipment',
        href: '#baby-equipment',
        icon: Baby,
        iconGradient: 'from-pink-500 to-rose-600',
        title: 'Baby Equipment Rentals',
        description: `Make traveling with little ones easy! Rent baby equipment in ${destName} - strollers, car seats, cribs, and more delivered to your hotel.`,
        badge: null,
        ctaText: 'Browse Rentals',
        ctaColorClass: 'text-pink-600',
      });
    }

    // Fill to 6 with category-guide substitutes (exclude airport-transfers, already a main card)
    const substitutes = (categoryGuidesProp || [])
      .filter((g) => (g.category_slug || '') !== 'airport-transfers')
      .map((g) => {
        const slug = normalizeSlug(g.category_slug || '');
        const name = g.category_name || g.title || 'Guide';
        const sub = g.subtitle || `Explore ${name} in ${destName}.`;
        return {
          type: 'guide',
          href: `/destinations/${destId}/guides/${slug}`,
          icon: BookOpen,
          iconGradient: 'from-amber-500 to-orange-600',
          title: name,
          description: sub.length > 120 ? sub.slice(0, 117).trim() + '…' : sub,
          badge: null,
          ctaText: 'Read Guide',
          ctaColorClass: 'text-amber-600',
        };
      });

    let i = 0;
    while (cards.length < 6 && i < substitutes.length) {
      cards.push(substitutes[i]);
      i++;
    }

    return cards;
  }, [
    safeDestination.id,
    safeDestination.fullName,
    safeDestination.name,
    totalToursCount,
    hasRestaurants,
    safeRestaurants.length,
    categoryGuidesProp,
    hasBabyEquipmentRentals,
  ]);

  // Filter out invalid guides and ensure all required fields exist
  // Must be declared before useEffect that uses it
  const normalizedRelatedGuides = Array.isArray(relatedGuides) 
    ? relatedGuides.filter(guide => guide && guide.id && guide.title)
    : [];
  
  // Mark as client-side after mount to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication and fetch user preferences
  useEffect(() => {
    if (!isClient) return;
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
        } else {
          // Load from localStorage for anonymous users
          // Check both keys for backward compatibility
          try {
            let stored = localStorage.getItem('topTours_preferences');
            if (!stored) {
              stored = localStorage.getItem('tourPreferences');
            }
            if (stored) {
              setUserPreferences(JSON.parse(stored));
            }
          } catch (e) {
            // Ignore localStorage errors
          }
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setLoadingPreferences(false);
      }
    };
    
    fetchUserPreferences();
  }, [isClient, supabase]);
  
  // Calculate match scores for tours
  useEffect(() => {
    if (loadingPreferences) return;
    
    const calculateScores = async () => {
      // Use unified preference resolution - ensures consistent match scores across all pages
      const rawPreferences = resolveUserPreferences({ user, userPreferences, localPreferences: null });
      const scores = {};
      
      // Calculate scores for trending tours (async)
      const trendingPromises = safeTrendingTours.map(async (trending) => {
        if (!trending?.product_id) return null;
        try {
          // Use enhanced matching with full tour object (trending has all tour data)
          const tags = Array.isArray(trending.tags) ? trending.tags : [];
          const tourProfile = await calculateTourProfile(tags);
          const matchScore = await calculateEnhancedMatchScore(trending, rawPreferences, tourProfile);
          return { productId: trending.product_id, matchScore };
        } catch (e) {
          // Ignore errors for individual tours
          return null;
        }
      });
      
      const trendingResults = await Promise.all(trendingPromises);
      trendingResults.forEach(result => {
        if (result) {
          scores[result.productId] = result.matchScore;
        }
      });
      
      // Calculate scores for promoted tours (async)
      const promotedPromises = safePromotedTours
        .filter(t => {
          // Only calculate for tours with full data (title/productContent)
          return t.title || t.productContent || t.seo || t.productName;
        })
        .map(async (tour) => {
          const productId = getTourProductId(tour) || tour.product_id || tour.productId || tour.productCode;
          if (!productId || scores[productId]) return null;
          try {
            // Use enhanced matching with full tour object
            const tags = Array.isArray(tour.tags) ? tour.tags : [];
            const tourProfile = await calculateTourProfile(tags);
            const matchScore = await calculateEnhancedMatchScore(tour, rawPreferences, tourProfile);
            return { productId, matchScore };
          } catch (e) {
            // Ignore errors for individual tours
            return null;
          }
        });
      
      const promotedResults = await Promise.all(promotedPromises);
      promotedResults.forEach(result => {
        if (result) {
          scores[result.productId] = result.matchScore;
        }
      });
      
      // Calculate scores for all tours (async)
      if (tours.all && Array.isArray(tours.all)) {
        const tourPromises = tours.all.map(async (tour) => {
          const tourId = getTourProductId(tour);
          if (!tourId || scores[tourId]) return null;
          try {
            // Use enhanced matching with full tour object
            const tags = Array.isArray(tour.tags) ? tour.tags : [];
            const tourProfile = await calculateTourProfile(tags);
            const matchScore = await calculateEnhancedMatchScore(tour, rawPreferences, tourProfile);
            return { tourId, matchScore };
          } catch (e) {
            // Ignore errors for individual tours
            return null;
          }
        });
        
        const results = await Promise.all(tourPromises);
        results.forEach(result => {
          if (result) {
            scores[result.tourId] = result.matchScore;
          }
        });
      }
      
      setMatchScores(scores);
    };
    
    calculateScores();
  }, [safeTrendingTours, safePromotedTours, tours.all, userPreferences, loadingPreferences]);
  
  // Reset carousel index when guides change or become empty
  useEffect(() => {
    if (normalizedRelatedGuides.length === 0) {
      setGuideCarouselIndex(0);
    } else if (guideCarouselIndex >= normalizedRelatedGuides.length) {
      setGuideCarouselIndex(Math.max(0, normalizedRelatedGuides.length - 1));
    }
  }, [normalizedRelatedGuides.length, guideCarouselIndex]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    // Only run on client side (not during SSR)
    if (typeof window === 'undefined') return;
    
    // Scroll to top when component mounts (e.g., when navigating back)
    try {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (error) {
      console.error('Error scrolling to top:', error);
    }
    
    // Check if mobile - only after client-side mount
    const checkMobile = () => {
      try {
        if (typeof window !== 'undefined' && window.innerWidth !== undefined && window.innerWidth !== null) {
          const width = window.innerWidth;
          if (!isNaN(width) && width > 0) {
            setIsMobile(width < 768);
          }
        }
      } catch (error) {
        console.error('Error checking mobile:', error);
        // Default to desktop on error
        setIsMobile(false);
      }
    };
    
    // Only check mobile after a small delay to ensure window is ready
    const timeoutId = setTimeout(() => {
      checkMobile();
    }, 0);
    
    let resizeListener = null;
    try {
      resizeListener = () => checkMobile();
      window.addEventListener('resize', resizeListener);
    } catch (error) {
      console.error('Error adding resize listener:', error);
    }
    
    // Show parent country modal after 5 seconds (if destination has parent country)
    let timer = null;
    if (safeDestination.parentCountryDestination) {
      timer = setTimeout(() => {
        setShowParentCountryModal(true);
      }, 5000); // 5 seconds
    }
    
    // Initialize visible tours for each category (mobile only)
    const visible = {};
    if (Array.isArray(safeDestination.tourCategories)) {
      safeDestination.tourCategories.forEach(category => {
        const categoryName = typeof category === 'string' ? category : category?.name;
        if (categoryName) {
          visible[categoryName] = 4; // Start with 4 visible tours on mobile
        }
      });
    }
    setVisibleTours(visible);
    
    // Always fetch from API (compliance: no hardcoded data ingestion)
    // Use same approach as tours listing page
    fetchAllToursForDestination();

    // Load all related destinations from the same region
    const related = getRelatedDestinations(safeDestination.id);
    // Filter out duplicates by id to prevent React key errors
    const uniqueRelated = related.filter((dest, index, self) => 
      index === self.findIndex(d => d.id === dest.id)
    );
    setRelatedDestinations(uniqueRelated);

    // Load guides by country (for SEO internal linking)
    if (safeDestination.country) {
      const guidesByCountry = getGuidesByCountry(safeDestination.country);
      const guideIds = Array.isArray(safeDestination.relatedGuides) ? safeDestination.relatedGuides : [];
      const guidesByIds = guideIds.length > 0 ? getGuidesByIds(guideIds) : [];

      const combinedGuidesMap = new Map();
      guidesByCountry.forEach((guide) => combinedGuidesMap.set(guide.id, guide));
      guidesByIds.forEach((guide) => combinedGuidesMap.set(guide.id, guide));

      setRelatedGuides(Array.from(combinedGuidesMap.values()));
    }
    
    // Load guides by category/region (for bottom section)
    // Use prop if provided (for database destinations), otherwise use category lookup
    if (categoryGuidesProp && categoryGuidesProp.length > 0) {
      setCategoryGuides(categoryGuidesProp);
    } else if (safeDestination.category) {
      const guidesByCategory = getGuidesByCategory(safeDestination.category);
      setCategoryGuides(guidesByCategory); // Show all
    }
    
    // Load other destinations in the same country (for SEO internal linking)
    if (safeDestination.country) {
      // First get from curated destinations (182 destinations)
      const curatedDests = getDestinationsByCountry(safeDestination.country, safeDestination.id);
      
      // Also get from classified data (all destinations)
      const allCountryDests = [];
      const currentSlug = safeDestination.id;
      const currentName = (safeDestination.name || safeDestination.fullName || '').toLowerCase().trim();
      
      // Track seen IDs and names to prevent duplicates
      const seenIds = new Set();
      const seenNames = new Set();
      
      // Add curated destinations first
      curatedDests.forEach(dest => {
        const destId = dest.id || '';
        const destName = (dest.name || dest.fullName || '').toLowerCase().trim();
        if (destId && !seenIds.has(destId)) {
          seenIds.add(destId);
          seenNames.add(destName);
          allCountryDests.push(dest);
        }
      });
      
      try {
        if (Array.isArray(viatorDestinationsClassifiedData) && viatorDestinationsClassifiedData.length > 0) {
          const classifiedDests = viatorDestinationsClassifiedData
            .filter(dest => {
              if (!dest) return false;
              const destCountry = (dest.country || '').toLowerCase().trim();
              const targetCountry = (safeDestination.country || '').toLowerCase().trim();
              const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
              const destSlug = generateSlug(dest.destinationName || dest.name || '');
              
              // Must match country, be a city, not be the current destination
              return destCountry === targetCountry && 
                     dest.type === 'CITY' &&
                     destName !== currentName &&
                     destSlug !== currentSlug &&
                     destName.length > 0;
            })
            .map(dest => {
              if (!dest) return null;
              try {
                const slug = generateSlug(dest.destinationName || dest.name || '');
                const seoContent = getDestinationSeoContent(slug);
                
                return {
                  id: slug,
                  name: dest.destinationName || dest.name,
                  fullName: dest.destinationName || dest.name,
                  briefDescription: seoContent?.briefDescription || seoContent?.heroDescription || `Explore tours and activities in ${dest.destinationName || dest.name}`,
                  imageUrl: null,
                  country: dest.country
                };
              } catch (error) {
                console.error('Error processing classified destination:', error);
                return null;
              }
            })
            .filter(dest => dest !== null);
          
          // Add classified destinations, avoiding duplicates by both ID and name
          classifiedDests.forEach(dest => {
            if (!dest) return;
            const destId = dest.id || '';
            const destName = (dest.name || dest.fullName || '').toLowerCase().trim();
            
            // Check both ID and name to avoid duplicates
            if (destId && !seenIds.has(destId) && !seenNames.has(destName)) {
              seenIds.add(destId);
              seenNames.add(destName);
              allCountryDests.push(dest);
            }
          });
        }
      } catch (error) {
        console.error('Error processing viatorDestinationsClassifiedData:', error);
        // Continue without classified destinations - not critical
      }
      
      // Sort alphabetically
      const sortedDests = allCountryDests.sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      );
      
      setCountryDestinations(sortedDests);
    }
    
    // Cleanup
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      try {
        if (typeof window !== 'undefined' && resizeListener) {
          window.removeEventListener('resize', resizeListener);
        }
      } catch (error) {
        console.error('Error removing resize listener:', error);
      }
    };
  }, [safeDestination.parentCountryDestination]);

  // Fetch all tours for destination (single API call, cached for 7 days)
  const fetchAllToursForDestination = async () => {
    // Set loading state
    setLoading({ all: true });

    try {
      // Use the existing working viator-search endpoint instead
      const destinationName = safeDestination.fullName || safeDestination.name || safeDestination.destinationName || safeDestination.id;
      const viatorDestinationId = safeDestination.destinationId || safeDestination.viatorDestinationId;
      
      // CRITICAL: If we have a destination ID, use it for filtering instead of text search
      const requestBody = {
        searchTerm: '',
        page: 1,
        viatorDestinationId: viatorDestinationId ? String(viatorDestinationId) : null,
        includeDestination: !!viatorDestinationId
      };
      
      const response = await fetch('/api/internal/viator-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorData = {};
        let errorText = '';
        let readError = null;
        
        // Try to read response body
        try {
          // Clone the response before reading to avoid consuming it
          const clonedResponse = response.clone();
          errorText = await clonedResponse.text();
          
          // If we have text, try to parse it as JSON
          if (errorText && errorText.trim().length > 0) {
            try {
              errorData = JSON.parse(errorText);
            } catch (parseError) {
              // Not JSON, use as plain text error
              errorData = { 
                error: errorText.substring(0, 200), // Limit length
                raw: errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText
              };
            }
          } else {
            // Empty response body
            errorData = { 
              error: `HTTP ${response.status} ${response.statusText || 'Error'}`,
              message: 'The server returned an empty response. This might indicate a network issue or API problem.'
            };
          }
        } catch (e) {
          // Failed to read response body - store the error but continue
          readError = e;
          errorData = { 
            error: `HTTP ${response.status} ${response.statusText || 'Error'}`,
            message: 'Failed to read error response from server',
            details: e.message 
          };
        }
        
        // Build user-friendly error message
        const errorMessage = errorData.error || errorData.details || errorData.message || `HTTP ${response.status} ${response.statusText || 'Error'}`;
        
        // Log detailed error for debugging (format as string for better console viewer display)
        const errorDetails = [
          `Status: ${response.status} ${response.statusText || ''}`,
          errorMessage ? `Error: ${errorMessage}` : '',
          errorText && errorText.length > 0 ? `Response: ${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}` : readError ? `Response: (unable to read - ${readError.message})` : 'Response: (empty)',
          !viatorDestinationId ? 'Warning: No Viator destination ID found' : `Destination ID: ${viatorDestinationId}`,
          `URL: ${response.url || 'N/A'}`
        ].filter(Boolean).join(' | ');
        
        // If no destination ID, suggest that might be the issue
        if (!viatorDestinationId) {
          throw new Error(`Failed to fetch tours: ${errorMessage}. Note: No Viator destination ID found for this destination.`);
        }
        
        throw new Error(`Failed to fetch tours: ${errorMessage}`);
      }

      const data = await response.json();
      
      // The viator-search endpoint returns data.products.results, not data.tours
      const allTours = data.products?.results || data.tours || [];
      const totalCount = data.products?.totalCount || allTours.length || 0;
      
      // Store total count for button
      setTotalToursCount(totalCount);

      // Store all tours (no need to group by category anymore)
      if (allTours.length > 0) {
        // Sort by rating/reviews
        const sortedTours = allTours.sort((a, b) => {
          const ratingA = a.reviews?.combinedAverageRating || 0;
          const ratingB = b.reviews?.combinedAverageRating || 0;
          const reviewsA = a.reviews?.totalReviews || 0;
          const reviewsB = b.reviews?.totalReviews || 0;
          
          if (ratingA !== ratingB) {
            return ratingB - ratingA;
          }
          return reviewsB - reviewsA;
        });
        
        // Store as a flat array, take top 12
        setTours({ all: sortedTours.slice(0, 12) });
      } else {
        setTours({ all: [] });
        setTotalToursCount(0);
      }

      // Set loading to false
      setLoading({ all: false });
    } catch (error) {
      console.error('Error fetching tours:', error);
      
      // Extract error message
      const errorMessage = error.message || 'Failed to load tours';
      
      // Show user-friendly error message
      toast({
        title: 'Error Loading Tours',
        description: errorMessage.includes('No Viator destination ID') 
          ? 'This destination may not have tours available yet. Please try again later.'
          : errorMessage.length > 100 
            ? 'Failed to load tours. Please try again later.'
            : errorMessage,
        variant: 'destructive',
      });
      
      // Set empty tours state so UI shows "no tours found" message
      setTours({ all: [] });
      setTotalToursCount(0);
      
      // Set loading to false
      setLoading({ all: false });
    }
  };

  const fetchToursForCategory = async (destinationName, category) => {
    // This function is kept for backward compatibility but shouldn't be used
    // All tours are now fetched in one call via fetchAllToursForDestination
    // Deprecated - use fetchAllToursForDestination instead
    setLoading(prev => ({ ...prev, [category]: true }));
    try {
      const searchTerm = `${destinationName} ${category}`;
      const response = await fetch('/api/internal/viator-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: searchTerm,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Viator API returns products in data.products.results
      const products = Array.isArray(data.products?.results) ? data.products.results : 
                      Array.isArray(data.products) ? data.products : [];
      
      setTours(prev => ({
        ...prev,
        [category]: Array.isArray(products) ? products.slice(0, 6) : [] // Max 6 tours per category
      }));
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast({
        title: "Error",
        description: `Failed to load ${category} tours`,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
  };


  const loadMoreTours = (category) => {
    setVisibleTours(prev => ({
      ...prev,
      [category]: (prev[category] || 4) + 4
    }));
  };

  return (
    <>
      <NavigationNext onOpenModal={handleOpenModal} />
      
      <div className="min-h-screen pt-16 overflow-x-hidden" suppressHydrationWarning>
        {/* Hero Section */}
        <section className="relative pt-4 pb-12 sm:pt-6 sm:pb-16 md:pt-8 md:pb-20 overflow-hidden ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {safeDestination.imageUrl ? (
              // Hero with image - side by side layout (original style)
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold text-white flex-1">
                      <span className="flex items-center gap-3 flex-wrap">
                        <span>{safeDestination.fullName}</span>
                        {(safeDestination.category || safeDestination.region) && (
                          <span className="flex items-center text-base sm:text-lg font-medium text-white">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 text-white" />
                            {safeDestination.category || safeDestination.region}
                          </span>
                        )}
                      </span>
                    </h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 flex-shrink-0"
                      onClick={() => setShowShareModal(true)}
                      title="Share this destination"
                    >
                      <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                  </div>
                  <p className="text-lg sm:text-xl text-white/90 mb-6 md:mb-8">
                    {safeDestination.heroDescription}
                  </p>
                  
                  {/* Quick Stats Bar - Hub Style */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                          <Link
                      href={`/destinations/${safeDestination.id}/tours`}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all group"
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                        {totalToursCount ? `${totalToursCount.toLocaleString()}+` : '1,900+'}
                      </div>
                      <div className="text-xs sm:text-sm text-white/80">Tours</div>
                          </Link>
                    {hasRestaurants && (
                      <Link 
                        href={`/destinations/${safeDestination.id}/restaurants`}
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all group"
                      >
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                          {safeRestaurants.length}+
                  </div>
                        <div className="text-xs sm:text-sm text-white/80">Restaurants</div>
                      </Link>
                    )}
                    {categoryGuidesProp.length > 0 && (
                      <Link 
                        href={`#guides`}
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all group"
                      >
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                          {categoryGuidesProp.length}+
                        </div>
                        <div className="text-xs sm:text-sm text-white/80">Guides</div>
                      </Link>
                    )}
                  </div>
                  
                  {/* Multiple CTAs - Hub Style */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button
                      asChild
                      className="sunset-gradient text-white font-semibold px-6 py-3 hover:scale-105 transition-transform duration-200"
                    >
                      <Link href={`/destinations/${safeDestination.id}/tours`} prefetch={true}>
                        Explore Tours
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    {hasRestaurants && (
                      <Button
                        asChild
                        variant="outline"
                        className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold px-6 py-3"
                      >
                        <Link href={`/destinations/${safeDestination.id}/restaurants`} prefetch={true}>
                          Find Restaurants
                          <UtensilsCrossed className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    )}
                    {categoryGuidesProp.length > 0 && (
                      <Button
                        asChild
                        variant="outline"
                        className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold px-6 py-3"
                      >
                        <Link href={`#guides`}>
                          Read Guides
                          <BookOpen className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    )}
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
                      src={safeDestination.imageUrl}
                      alt={safeDestination.fullName}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                </motion.div>
              </div>
            ) : (
              // Hero without image - centered layout (matching /tours page style)
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold text-white">
                    <span className="flex items-center gap-3 flex-wrap justify-center">
                      <span>{safeDestination.fullName}</span>
                      {(safeDestination.category || safeDestination.region) && (
                        <span className="flex items-center text-base sm:text-lg font-medium text-white">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 text-white" />
                          {safeDestination.category || safeDestination.region}
                        </span>
                      )}
                    </span>
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 flex-shrink-0"
                    onClick={() => setShowShareModal(true)}
                    title="Share this destination"
                  >
                    <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </div>
                <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                  {safeDestination.heroDescription}
                </p>
                
                {/* Quick Stats Bar - Hub Style */}
                <div className="flex justify-center gap-4 mb-6 max-w-2xl mx-auto">
                  <Link 
                    href={`/destinations/${safeDestination.id}/tours`}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all group text-center w-[140px]"
                  >
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {totalToursCount ? `${totalToursCount.toLocaleString()}+` : '1,900+'}
                    </div>
                    <div className="text-xs sm:text-sm text-white/80">Tours</div>
                  </Link>
                  {hasRestaurants && (
                    <Link 
                      href={`/destinations/${safeDestination.id}/restaurants`}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all group text-center w-[140px]"
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                        {safeRestaurants.length}+
                      </div>
                      <div className="text-xs sm:text-sm text-white/80">Restaurants</div>
                    </Link>
                  )}
                  {categoryGuidesProp.length > 0 && (
                    <Link 
                      href={`#guides`}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all group text-center w-[140px]"
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                        {categoryGuidesProp.length}+
                      </div>
                      <div className="text-xs sm:text-sm text-white/80">Guides</div>
                    </Link>
                  )}
                </div>
                
                {/* Multiple CTAs - Hub Style */}
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    asChild
                    className="sunset-gradient text-white font-semibold px-6 py-3 hover:scale-105 transition-transform duration-200"
                  >
                    <Link href={`/destinations/${safeDestination.id}/tours`} prefetch={true}>
                      Explore Tours
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  {hasRestaurants && (
                    <Button
                      asChild
                      variant="outline"
                      className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold px-6 py-3"
                    >
                      <Link href={`/destinations/${safeDestination.id}/restaurants`} prefetch={true}>
                        Find Restaurants
                        <UtensilsCrossed className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                  {categoryGuidesProp.length > 0 && (
                    <Button
                      asChild
                      variant="outline"
                      className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold px-6 py-3"
                    >
                      <Link href={`#guides`}>
                        Read Guides
                        <BookOpen className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
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
              <span className="text-gray-900 font-medium" aria-current="page">{safeDestination.fullName || safeDestination.name}</span>
            </nav>
          </div>
        </section>

        {/* Sticky Navigation Hub - Quick Access */}
        <section className="sticky top-16 z-40 bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-6 py-4 overflow-x-auto hide-scrollbar">
              <Link 
                href={`/destinations/${safeDestination.id}/tours`}
                className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 pb-1"
              >
                <span>Tours</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {totalToursCount ? `${totalToursCount.toLocaleString()}+` : '1,900+'}
                </Badge>
              </Link>
              {hasRestaurants && (
                <Link 
                  href={`/destinations/${safeDestination.id}/restaurants`}
                  className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-purple-600 transition-colors border-b-2 border-transparent hover:border-purple-600 pb-1"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Restaurants</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {safeRestaurants.length}+
                  </Badge>
                </Link>
              )}
              {categoryGuidesProp.length > 0 && (
                <Link 
                  href={`#guides`}
                  className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-indigo-600 transition-colors border-b-2 border-transparent hover:border-indigo-600 pb-1"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Travel Guides</span>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                    {categoryGuidesProp.length}+
                  </Badge>
                </Link>
              )}
              {/* Car Rentals - Always available */}
              <Link 
                href={`/destinations/${safeDestination.id}/car-rentals`}
                className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-green-600 transition-colors border-b-2 border-transparent hover:border-green-600 pb-1"
              >
                <Car className="w-4 h-4" />
                <span>Car Rentals</span>
              </Link>
              {/* Airport Transfers - Check if guide exists */}
              {categoryGuidesProp.some(guide => guide.category_slug === 'airport-transfers') && (
                <Link 
                  href={`/destinations/${safeDestination.id}/guides/airport-transfers`}
                  className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-cyan-600 transition-colors border-b-2 border-transparent hover:border-cyan-600 pb-1"
                >
                  <Plane className="w-4 h-4" />
                  <span>Airport Transfers</span>
                </Link>
              )}
              {/* Baby Equipment Rentals - Only if available */}
              {hasBabyEquipmentRentals && (
                <Link 
                  href={`#baby-equipment`}
                  className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900 hover:text-pink-600 transition-colors border-b-2 border-transparent hover:border-pink-600 pb-1"
                >
                  <Baby className="w-4 h-4" />
                  <span>Baby Equipment Rentals</span>
                </Link>
              )}
            </nav>
            </div>
          </section>

        {/* Promoted Listings Section - Moved Higher for Hub Style */}
        {((safePromotedTours && safePromotedTours.length > 0) || (safePromotedRestaurants && safePromotedRestaurants.length > 0)) && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Promoted Listings in {safeDestination.fullName || safeDestination.name}</h2>
                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                  Partner
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Featured tours and restaurants from our partner operators.
              </p>

              {/* Promoted Tours */}
              {promotedToursToDisplay.length > 0 && (

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Promoted Tours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promotedToursToDisplay.map((tour, index) => {
                      const productId = getTourProductId(tour) || tour.product_id || tour.productId || tour.productCode;
                      if (!productId) return null;
                      
                      // Try multiple product ID formats to find match score
                      const matchScore = matchScores[productId] || 
                                        matchScores[tour.productId] || 
                                        matchScores[tour.productCode] || 
                                        matchScores[tour.product_id] ||
                                        null;
                      
                      return (
                        <motion.div
                          key={productId || index}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <TourCard
                            tour={tour}
                            destination={safeDestination}
                            matchScore={matchScore}
                            user={user}
                            userPreferences={userPreferences}
                            onOpenPreferences={() => setShowPreferencesModal(true)}
                            isFeatured={false}
                            premiumOperatorTourIds={[]}
                            isPromoted={true}
                            priority={index < 3} // OPTIMIZED: Priority loading for first 3 promoted tours
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Promoted Restaurants */}
              {promotedRestaurantsToDisplay.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Promoted Restaurants</h3>
                    <button
                      type="button"
                      onClick={() => setShowRestaurantPreferencesModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all"
                      title="Set your dining preferences for match scores"
                    >
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-900">Match to Your Taste</span>
                      <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                        AI driven
                      </span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promotedRestaurantsToDisplay.map((restaurant, index) => {
                        const restaurantId = restaurant.id;
                        if (!restaurantId) return null;
                        
                        const restaurantUrl = restaurant.slug && safeDestination.id
                          ? `/destinations/${safeDestination.id}/restaurants/${restaurant.slug}`
                          : `/destinations/${safeDestination.id}/restaurants`;
                        
                        const description = restaurant.metaDescription 
                          || restaurant.tagline 
                          || restaurant.summary 
                          || restaurant.description
                          || (restaurant.cuisines?.length > 0 
                              ? `Discover ${restaurant.cuisines.join(' & ')} cuisine at ${restaurant.name}.`
                              : `Experience great dining at ${restaurant.name}.`);
                        
                        // Get match score
                        const matchScore = restaurantMatchById.get(restaurantId)?.matchScore ?? 0;
                        
                        // Get cuisine for badge
                        const validCuisines = restaurant.cuisines && Array.isArray(restaurant.cuisines)
                          ? restaurant.cuisines.filter(c => c && 
                              c.toLowerCase() !== 'restaurant' && 
                              c.toLowerCase() !== 'food' &&
                              c.trim().length > 0)
                          : [];
                        const cuisineBadge = validCuisines.length > 0 ? validCuisines[0] : 'Restaurant';
                        
                        return (
                          <motion.div
                            key={restaurantId || index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            viewport={{ once: true }}
                          >
                            <Card className={`h-full border bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-purple-500 shadow-purple-200/50`}>
                              <CardContent className="p-6 flex flex-col h-full">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                      <UtensilsCrossed className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Badge className="ocean-gradient text-white text-xs flex-shrink-0">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Promoted
                                      </Badge>
                                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 truncate">
                                        {cuisineBadge}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedRestaurant(restaurant);
                                      setShowRestaurantMatchModal(true);
                                    }}
                                    className="bg-white/95 hover:bg-white backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow border border-purple-200 hover:border-purple-400 transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                                    title="Click to see why this matches your taste"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                    <span className="text-xs font-bold text-gray-900">
                                      {matchScore}%
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
                                </div>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                                  {description}
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
                                  className="mt-auto"
                                >
                                  <Button className="w-full ocean-gradient text-white hover:opacity-90">
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </Button>
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

        {/* Featured Tours Section - Moved Higher for Hub Style */}
        {(safeTrendingTours && safeTrendingTours.length > 0) && (
          <section className="py-12 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Featured Tours</h2>
                  <p className="text-gray-600">Top-rated experiences in {safeDestination.fullName || safeDestination.name}</p>
                </div>
                {totalToursCount !== null && totalToursCount > 0 && (
                  <Button asChild variant="outline" className="hidden sm:flex">
                    <Link href={`/destinations/${safeDestination.id}/tours`}>
                      View All {totalToursCount.toLocaleString()}+ Tours
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeTrendingTours.slice(0, 6).map((tour, index) => {
                  const productId = getTourProductId(tour) || tour.product_id || tour.productId || tour.productCode;
                  if (!productId) return null;
                  
                  const matchScore = matchScores[productId] || 
                                    matchScores[tour.productId] || 
                                    matchScores[tour.productCode] || 
                                    matchScores[tour.product_id] ||
                                    null;
                  
                  return (
                    <motion.div
                      key={productId || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <TourCard
                        tour={tour}
                        destination={safeDestination}
                        matchScore={matchScore}
                        user={user}
                        userPreferences={userPreferences}
                        onOpenPreferences={() => setShowPreferencesModal(true)}
                        isFeatured={true}
                        premiumOperatorTourIds={[]}
                        isPromoted={false}
                        priority={index < 3}
                      />
                    </motion.div>
                  );
                })}
              </div>
              
              {totalToursCount !== null && totalToursCount > 0 && (
                <div className="text-center mt-8">
                  <Button asChild size="lg" className="sunset-gradient text-white">
                    <Link href={`/destinations/${safeDestination.id}/tours`}>
                      {totalToursCount !== null && totalToursCount > 0 
                        ? `View All ${totalToursCount.toLocaleString()} Tours & Activities in ${safeDestination.fullName}`
                        : `View All Tours & Activities in ${safeDestination.fullName || safeDestination.name}`
                      }
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Popular Pages Section - Quick Browser for Navigation Items */}
        <section className="py-12 bg-gradient-to-br from-indigo-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-gray-900 mb-2">
                  Popular Pages for {safeDestination.fullName || safeDestination.name}
                </h2>
                <p className="text-gray-600">
                  Quick access to all the essential resources for planning your {safeDestination.fullName || safeDestination.name} trip.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularPageCards.map((card, index) => {
                  const Icon = card.icon;
                  const isExternal = card.href.startsWith('#');
                  return (
                    <Link
                      key={`${card.type}-${index}`}
                      href={card.href}
                      prefetch={!isExternal}
                    >
                      <Card className="h-full border bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${card.iconGradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {card.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {card.description}
                              </p>
                              {card.badge && (
                                <Badge
                                  variant="secondary"
                                  className={`mt-2 w-fit ${
                                    card.type === 'tours' ? 'bg-blue-100 text-blue-700' :
                                    card.type === 'restaurants' ? 'bg-purple-100 text-purple-700' :
                                    card.type === 'travel-guides' ? 'bg-indigo-100 text-indigo-700' :
                                    card.type === 'guide' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {card.badge}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className={`flex items-center ${card.ctaColorClass} text-sm font-medium mt-auto group`}>
                            {card.ctaText}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>


        {/* Why Visit Section - Collapsible Accordion */}
        {safeDestination.whyVisit && safeDestination.whyVisit.length > 0 && (
          <section className="py-6 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => toggleSection('whyVisit')}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                aria-expanded={expandedSections.whyVisit}
                aria-controls="why-visit-content"
              >
                <h2 className="text-xl sm:text-2xl font-poppins font-bold text-gray-800">
                  Why Visit {safeDestination.fullName}?
                </h2>
                {expandedSections.whyVisit ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 transition-transform" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 transition-transform" />
                )}
              </button>
              
              {/* Content - Always in HTML for SEO, hidden with CSS */}
              <div
                id="why-visit-content"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSections.whyVisit ? 'max-h-[5000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
                aria-hidden={!expandedSections.whyVisit}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {safeDestination.whyVisit.map((reason, index) => (
                    <Card key={index} className="bg-white border-0 shadow-lg h-full">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                          <Star className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-gray-700 leading-relaxed">{reason}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Getting Around – accordion with car rental banner inside */}
        {safeDestination.gettingAround && (
          <section id="getting-around" className="py-6 bg-gray-50 overflow-hidden scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => toggleSection('gettingAround')}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                aria-expanded={expandedSections.gettingAround}
                aria-controls="getting-around-content"
              >
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl sm:text-2xl font-poppins font-bold text-gray-800">
                    Getting Around {safeDestination.fullName || safeDestination.name}
                  </h2>
                </div>
                {expandedSections.gettingAround ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 transition-transform" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 transition-transform" />
                )}
              </button>
              <div
                id="getting-around-content"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSections.gettingAround ? 'max-h-[5000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
                aria-hidden={!expandedSections.gettingAround}
              >
                <div className="rounded-lg bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 p-4">
                  <Card className="bg-white border-2 border-blue-200 shadow-lg">
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                        <div className="flex-1 w-full md:w-auto">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Car className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Getting Around {safeDestination.fullName || safeDestination.name}</h3>
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                            Save up to 70% on car rentals in {safeDestination.fullName || safeDestination.name} when you compare and book in advance.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs sm:text-sm">Clear prices, no surprises</Badge>
                            <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-xs sm:text-sm">24/7 Support</Badge>
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs sm:text-sm">Free Cancellation</Badge>
                          </div>
                        </div>
                        <Button
                          size="lg"
                          className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 w-full md:w-auto md:px-8 px-4 py-4 sm:py-6 text-sm sm:text-base md:text-lg font-semibold shrink-0"
                          onClick={() => window.open(DISCOVER_CARS_URL, '_blank')}
                        >
                          <span className="hidden sm:inline">Find Car Rental Deals</span>
                          <span className="sm:hidden">Find Car Rentals</span>
                          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Traveling with a Baby? – accordion (baby equipment rentals) */}
        {hasBabyEquipmentRentals && (
          <section id="baby-equipment" className="py-6 bg-gray-50 overflow-hidden scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => toggleSection('travelingWithBaby')}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                aria-expanded={expandedSections.travelingWithBaby}
                aria-controls="traveling-with-baby-content"
              >
                <div className="flex items-center gap-3">
                  <Baby className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl sm:text-2xl font-poppins font-bold text-gray-800">
                    Traveling with a Baby?
                  </h2>
                </div>
                {expandedSections.travelingWithBaby ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 transition-transform" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 transition-transform" />
                )}
              </button>
              <div
                id="traveling-with-baby-content"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSections.travelingWithBaby ? 'max-h-[5000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
                aria-hidden={!expandedSections.travelingWithBaby}
              >
                <div className="rounded-lg bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
                  <Card className="bg-white border-2 border-purple-200 shadow-lg">
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                        <div className="flex-1 w-full md:w-auto">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Baby className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Traveling with a Baby?</h3>
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                            Make traveling with little ones easy! Rent baby equipment in {safeDestination.fullName} – strollers, car seats, cribs, and more delivered directly to your hotel or vacation rental. Save on baggage fees and travel light with BabyQuip.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs sm:text-sm">90,000+ 5-Star Reviews</Badge>
                            <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs sm:text-sm">Clean & Insured</Badge>
                          </div>
                        </div>
                        <Link href={`/destinations/${safeDestination.id}/baby-equipment-rentals`} className="w-full md:w-auto">
                          <Button
                            size="lg"
                            className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 w-full md:w-auto md:px-8 px-4 py-4 sm:py-6 text-sm sm:text-base md:text-lg font-semibold"
                          >
                            <span className="hidden sm:inline">Browse Baby Equipment Rentals</span>
                            <span className="sm:hidden">Browse Rentals</span>
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Must-See Attractions - Collapsible Accordion */}
        {safeDestination.highlights && safeDestination.highlights.length > 0 && (
          <section className="py-6 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => toggleSection('mustSee')}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                aria-expanded={expandedSections.mustSee}
                aria-controls="must-see-content"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl sm:text-2xl font-poppins font-bold text-gray-800">
                    Must-See Attractions in {safeDestination.fullName || safeDestination.name}
                  </h2>
                </div>
                {expandedSections.mustSee ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 transition-transform" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 transition-transform" />
                )}
              </button>
              
              <div
                id="must-see-content"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSections.mustSee ? 'max-h-[5000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
                aria-hidden={!expandedSections.mustSee}
              >
                <Card className="bg-purple-50/50 border-0 shadow-sm">
                  <CardContent className="p-4 sm:p-5">
                    <ul className="space-y-2">
                      {safeDestination.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span className="text-gray-600 text-sm leading-relaxed">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Best Time to Visit - Collapsible Accordion */}
        {safeDestination.bestTimeToVisit && (
          <section className="py-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => toggleSection('bestTime')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                aria-expanded={expandedSections.bestTime}
                aria-controls="best-time-content"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <h2 className="text-xl sm:text-2xl font-poppins font-bold text-gray-800">
                    Best Time to Visit {safeDestination.fullName || safeDestination.name}
                  </h2>
                </div>
                {expandedSections.bestTime ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 transition-transform" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 transition-transform" />
                )}
              </button>
              
              <div
                id="best-time-content"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSections.bestTime ? 'max-h-[5000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
                aria-hidden={!expandedSections.bestTime}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                  <div>
                    <div className="flex items-start mb-6">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                        <Calendar className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Weather</h3>
                        <p className="text-gray-600">{safeDestination.bestTimeToVisit.weather}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Best Months</h3>
                        <p className="text-gray-600">{safeDestination.bestTimeToVisit.bestMonths}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">Peak Season</h3>
                        <p className="text-blue-700">{safeDestination.bestTimeToVisit.peakSeason}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">Off Season</h3>
                        <p className="text-green-700">{safeDestination.bestTimeToVisit.offSeason}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Popular Tour Categories - Collapsible Accordion */}
        {categoryGuidesProp && categoryGuidesProp.length > 0 && (
          <section id="guides" className="py-6 bg-gray-50 overflow-hidden scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => toggleSection('tourCategories')}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                aria-expanded={expandedSections.tourCategories}
                aria-controls="tour-categories-content"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl sm:text-2xl font-poppins font-bold text-gray-800">
                    Popular Tour Categories in {safeDestination.fullName || safeDestination.name}
                  </h2>
                </div>
                {expandedSections.tourCategories ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 transition-transform" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 transition-transform" />
                )}
              </button>
              
              <div
                id="tour-categories-content"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSections.tourCategories ? 'max-h-[5000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
                aria-hidden={!expandedSections.tourCategories}
              >
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-4 sm:p-5">
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-4">
                        {categoryGuidesProp.length} travel guides available for {safeDestination.fullName || safeDestination.name}. Click any category to read our comprehensive guide.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categoryGuidesProp.map((guide) => {
                        const categoryName = guide.category_name || guide.title || '';
                        const categorySlug = guide.category_slug || '';
                        const normalizedSlug = normalizeSlug(categorySlug);
                        const guideUrl = `/destinations/${safeDestination.id}/guides/${normalizedSlug}`;
                        
                        return (
                          <Link key={guide.id || categorySlug} href={guideUrl} prefetch={true}>
                            <Badge variant="outline" className="px-3 py-1.5 text-sm hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer">
                              {categoryName}
                            </Badge>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Popular Tours & Activities */}
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
                Popular {safeDestination.fullName} Tours & Activities
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                Discover the best tours and activities in {safeDestination.fullName} with our AI-powered recommendations
              </p>
            </motion.div>

            {loading.all ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">Loading tours...</p>
              </div>
            ) : tours.all && tours.all.length > 0 ? (
              <>
                {/* Match to Your Style Button */}
                <div className="flex justify-center mb-6">
                  <Button
                    onClick={() => setShowPreferencesModal(true)}
                    variant="outline"
                    size="lg"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 px-6"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Match to Your Style
                    <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700 text-xs">
                      AI driven
                    </Badge>
                  </Button>
                </div>

                {/* Tour Grid - Using TourCard component */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {tours.all.slice(0, 12).map((tour, index) => {
                    const tourId = getTourProductId(tour);
                    if (!tourId) return null;
                    
                    return (
                      <TourCard
                        key={`${tourId}-${index}`}
                        tour={tour}
                        destination={safeDestination}
                        matchScore={matchScores[tourId]}
                        user={user}
                        userPreferences={userPreferences}
                        onOpenPreferences={() => setShowPreferencesModal(true)}
                        isFeatured={false}
                        premiumOperatorTourIds={[]}
                      />
                    );
                  })}
                </div>

                {/* View All Button */}
                <div className="text-center mt-8">
                  <Button
                    asChild
                    size="lg"
                    className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 px-8 py-6"
                  >
                    <Link href={`/destinations/${safeDestination.id}/tours`} prefetch={true}>
                      {totalToursCount !== null && totalToursCount > 0 
                        ? `View All ${totalToursCount} Tours & Activities in ${safeDestination.fullName}`
                        : `View All Tours & Activities in ${safeDestination.fullName}`
                      }
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Browse all available tours, filter by category, price, and more
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 mb-2">Tours are loading or no tours found at the moment.</p>
                <p className="text-sm text-gray-400 mb-6">Try browsing all tours to see what's available.</p>
                <Button
                  asChild
                  size="lg"
                  className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200"
                >
                  <Link href={`/destinations/${safeDestination.id}/tours`} prefetch={true}>
                    Browse All Tours & Activities
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* All Restaurants - Unified Section */}
        {hasRestaurants && (
          <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mb-8 sm:mb-12"
              >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-3">
                      Top Restaurants in {safeDestination.fullName}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-3xl sm:max-w-xl mx-auto sm:mx-0">
                      Reserve a table at our hand-picked local favorites and plan dinner around your tours in {safeDestination.fullName}.
                    </p>
                  </div>
                  <Link href={`/destinations/${safeDestination.id}/restaurants`} prefetch={true} className="self-center sm:self-end">
                    <Button variant="outline" className="gap-2">
                      View All {safeRestaurants.length} Restaurants
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Match to Your Taste Button */}
              {safeRestaurants && safeRestaurants.length > 0 && (
                <div className="flex justify-center mb-6">
                  <Button
                    onClick={() => setShowRestaurantPreferencesModal(true)}
                    variant="outline"
                    size="lg"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 px-6"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Match to Your Taste
                    <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700 text-xs">
                      AI driven
                    </Badge>
                  </Button>
                </div>
              )}

              {/* All Restaurants - Unified Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {safeRestaurants.map((restaurant, index) => {
                  if (!restaurant || !restaurant.id || !restaurant.slug) return null;

                  const restaurantUrl = `/destinations/${safeDestination.id}/restaurants/${restaurant.slug}`;
                  const description = restaurant.metaDescription 
                    || restaurant.tagline 
                    || restaurant.summary 
                    || restaurant.description
                    || (restaurant.cuisines?.length > 0 
                        ? `Discover ${restaurant.cuisines.filter(c => c).join(' & ')} cuisine at ${restaurant.name}.`
                        : `Experience great dining at ${restaurant.name}.`);

                  return (
                    <motion.article
                      key={restaurant.id}
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
                                  const validCuisines = restaurant.cuisines && Array.isArray(restaurant.cuisines)
                                    ? restaurant.cuisines.filter(c => c && 
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
                                  setSelectedRestaurant(restaurant);
                                  setShowRestaurantMatchModal(true);
                                }}
                                className="bg-white/95 hover:bg-white backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow border border-purple-200 hover:border-purple-400 transition-all cursor-pointer flex items-center gap-1.5"
                                title="Click to see why this matches your taste"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                <span className="text-xs font-bold text-gray-900">
                                  {restaurantMatchById.get(restaurant.id)?.matchScore ?? 0}%
                                </span>
                                <span className="text-[10px] text-gray-600">Match</span>
                              </button>
                              {/* Bookmark Button */}
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
                                    await toggleBookmark(restaurant.id);
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
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 flex items-center gap-1.5">
                            {restaurant.name || 'Restaurant'}
                            {(premiumRestaurantIds.includes(restaurant.id) || premiumRestaurantIds.includes(Number(restaurant.id))) && (
                              <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" title="Featured Restaurant" />
                            )}
                          </h3>

                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {description.length > 120 ? description.slice(0, 120) + '...' : description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {restaurant.ratings?.googleRating && !isNaN(restaurant.ratings.googleRating) && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full">
                                <Star className="w-3 h-3" />
                                {parseFloat(restaurant.ratings.googleRating).toFixed(1)}
                              </span>
                            )}
                            {restaurant.pricing?.priceRange && (
                              <span className="inline-flex items-center text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                                {String(restaurant.pricing.priceRange)}
                              </span>
                            )}
                            {(() => {
                              // Filter out generic cuisine types and show valid ones
                              const validCuisines = restaurant.cuisines && Array.isArray(restaurant.cuisines)
                                ? restaurant.cuisines.filter(c => c && 
                                    c.toLowerCase() !== 'restaurant' && 
                                    c.toLowerCase() !== 'food' &&
                                    c.trim().length > 0)
                                : [];
                              // Show cuisine badge if there's at least 1 valid cuisine
                              return validCuisines.length > 0 ? (
                                <span className="inline-flex items-center text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">
                                  {validCuisines.slice(0, 2).join(' · ')}
                                </span>
                              ) : null;
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
              </div>

              {/* View All Button */}
              <div className="text-center mt-10">
                <Button
                  asChild
                  size="lg"
                  className="sunset-gradient text-white font-semibold hover:scale-105 transition-transform duration-200 px-8 py-6"
                >
                  <Link href={`/destinations/${safeDestination.id}/restaurants`} prefetch={true}>
                    View All Restaurants in {safeDestination.fullName}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Tour Operators & Other Destinations */}
        <section className="py-12 bg-white border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tour Operators */}
            <div className="mb-6">
              <Link href={`/destinations/${safeDestination.id}/operators`}>
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 w-full">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                          Tour Operators in {safeDestination.fullName || safeDestination.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">
                          Browse trusted tour operators offering experiences in {safeDestination.fullName || safeDestination.name}.
                        </p>
                        <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs px-2 sm:px-3 py-1.5 h-auto">
                          View Operators
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Other Destinations in Same Country */}
            {countryDestinations.length > 0 && safeDestination.country && (
              <div className="mb-6">
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 w-full">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                          Top Tours in Other {safeDestination.country} Destinations
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">
                          Explore top-rated tours and activities in other amazing destinations across {safeDestination.country}.
                        </p>
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-3">
                          {countryDestinations.slice(0, showMoreCountryDestinations).map((otherDest, index) => (
                            <Link key={`${otherDest.id}-${index}`} href={`/destinations/${otherDest.id}/tours`} prefetch={true}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full sm:w-auto border-purple-300 text-purple-700 hover:bg-purple-50 text-xs px-2 sm:px-3 py-1.5 h-auto whitespace-nowrap justify-center"
                              >
                                {otherDest.name}
                              </Button>
                            </Link>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {countryDestinations.length > showMoreCountryDestinations && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowMoreCountryDestinations(countryDestinations.length)}
                              className="text-purple-700 hover:text-purple-800 hover:bg-purple-50 text-xs"
                            >
                              View All ({countryDestinations.length} destinations)
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                          {showMoreCountryDestinations > 12 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowMoreCountryDestinations(12)}
                              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-xs"
                            >
                              Show Less
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>

        {/* Related Travel Guides Carousel Section */}
        {normalizedRelatedGuides.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-2xl font-poppins font-bold text-gray-800 mb-6 text-center">
                {safeDestination.country} Travel Guides
              </h3>
              {isClient && isMobile && normalizedRelatedGuides.length > 0 ? (
                <div className="flex justify-center">
                  <div className="relative w-full max-w-sm">
                    <div className="flex items-center justify-center mb-6 space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newIndex = Math.max(0, guideCarouselIndex - 1);
                          setGuideCarouselIndex(newIndex);
                        }}
                        disabled={guideCarouselIndex === 0 || normalizedRelatedGuides.length === 0}
                        className="w-10 h-10 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        {Math.min(guideCarouselIndex + 1, normalizedRelatedGuides.length)} of {normalizedRelatedGuides.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const maxIndex = Math.max(0, normalizedRelatedGuides.length - 1);
                          const newIndex = Math.min(maxIndex, guideCarouselIndex + 1);
                          setGuideCarouselIndex(newIndex);
                        }}
                        disabled={guideCarouselIndex >= Math.max(0, normalizedRelatedGuides.length - 1) || normalizedRelatedGuides.length === 0}
                        className="w-10 h-10 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="overflow-hidden px-4">
                      <div 
                        className="flex transition-transform duration-300 ease-in-out gap-6"
                        style={{ 
                          transform: `translateX(calc(-${Math.min(guideCarouselIndex, Math.max(0, normalizedRelatedGuides.length - 1)) * 100}% - ${Math.min(guideCarouselIndex, Math.max(0, normalizedRelatedGuides.length - 1)) * 1.5}rem))`
                        }}
                      >
                        {normalizedRelatedGuides.map((guide, idx) => {
                          if (!guide || !guide.id || !guide.title) return null;
                          return (
                          <Link 
                            key={guide.id || idx}
                            href={`/travel-guides/${guide.id}`}
                            className="w-[calc(100%-2rem)] flex-shrink-0 group"
                          >
                            <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                              <div className="relative h-48 overflow-hidden bg-gray-200">
                                {guide.image ? (
                                  <img
                                    src={guide.image}
                                    alt={guide.title || 'Travel Guide'}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      if (e.target && e.target.nextElementSibling) {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 ${guide.image ? 'hidden' : ''}`}>
                                  <BookOpen className="w-12 h-12 text-gray-400" />
                                </div>
                                {guide.category && (
                                  <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                                    {guide.category}
                                  </Badge>
                                )}
                              </div>
                              <CardContent className="p-6 flex flex-col flex-grow">
                                <h4 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                  {guide.title || 'Travel Guide'}
                                </h4>
                                
                                {guide.excerpt && (
                                  <p className="text-gray-700 mb-4 line-clamp-3 flex-grow text-sm">
                                    {guide.excerpt}
                                  </p>
                                )}
                                
                                <Button 
                                  className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-10 text-sm font-semibold mt-auto"
                                >
                                  Read Guide
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : normalizedRelatedGuides.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center max-w-5xl mx-auto">
                        {normalizedRelatedGuides.map((guide, idx) => {
                          if (!guide || !guide.id || !guide.title) return null;
                          return (
                    <Link 
                      key={guide.id || idx}
                      href={`/travel-guides/${guide.id}`}
                      className="group w-full max-w-sm"
                    >
                      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                        <div className="relative h-48 overflow-hidden bg-gray-200">
                          {guide.image ? (
                            <img
                              src={guide.image}
                              alt={guide.title || 'Travel Guide'}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                if (e.target && e.target.nextElementSibling) {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 ${guide.image ? 'hidden' : ''}`}>
                            <BookOpen className="w-12 h-12 text-gray-400" />
                          </div>
                          {guide.category && (
                            <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                              {guide.category}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-6 flex flex-col flex-grow">
                          <h4 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {guide.title || 'Travel Guide'}
                          </h4>
                          
                          {guide.excerpt && (
                            <p className="text-gray-700 mb-4 line-clamp-3 flex-grow text-sm">
                              {guide.excerpt}
                            </p>
                          )}
                          
                          <Button 
                            className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 h-10 text-sm font-semibold mt-auto"
                          >
                            Read Guide
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                  })}
                </div>
              ) : null}
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
                Plan Your {safeDestination.fullName} Trip
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
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <Car className="w-8 h-8 text-blue-600 mr-3" />
                      <h3 className="text-2xl font-bold text-gray-800">Transportation Tips</h3>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">{safeDestination.gettingAround}</p>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Car Rental Deals in {safeDestination.fullName}</h4>
                      <p className="text-gray-600 text-sm mb-3">Rent a car for maximum flexibility and explore at your own pace on Expedia USA.</p>
                      <Link href={`/destinations/${safeDestination.id}/car-rentals`} className="block">
                        <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                        Find Car Rental Deals
                          <ArrowRight className="w-4 h-4" />
                      </Button>
                      </Link>
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
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <Hotel className="w-8 h-8 text-purple-600 mr-3" />
                      <h3 className="text-2xl font-bold text-gray-800">Where to Stay</h3>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Find the perfect accommodation for your {safeDestination.fullName} adventure. From luxury resorts to cozy hotels, we've got you covered.
                    </p>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Best Hotel Deals in {safeDestination.fullName}</h4>
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

        {/* FAQ Section - Scalable template-based approach */}
        {(safeDestination.bestTimeToVisit || safeDestination.gettingAround || safeDestination.whyVisit?.length > 0 || (safeDestination.highlights && safeDestination.highlights.length > 0) || (safeDestination.tourCategories && safeDestination.tourCategories.length > 0) || (categoryGuidesProp && categoryGuidesProp.length > 0)) && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Frequently Asked Questions About {safeDestination.fullName}
                </h2>
                <div className="space-y-4">
                  {safeDestination.bestTimeToVisit?.weather && (
                    <Card className="border-gray-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          What is the best time to visit {safeDestination.fullName}?
                        </h3>
                        <p className="text-gray-700">
                          {safeDestination.bestTimeToVisit.weather}
                          {safeDestination.bestTimeToVisit.season && ` The best season is typically ${safeDestination.bestTimeToVisit.season}.`}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {safeDestination.gettingAround && (
                    <Card className="border-gray-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          How do I get around {safeDestination.fullName}?
                        </h3>
                        <p className="text-gray-700">{safeDestination.gettingAround}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {safeDestination.whyVisit && safeDestination.whyVisit.length > 0 && (
                    <Card className="border-gray-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Why should I visit {safeDestination.fullName}?
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          {safeDestination.whyVisit.slice(0, 3).map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  
                  {safeDestination.tourCategories && safeDestination.tourCategories.length > 0 && (
                    <Card className="border-gray-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          What types of tours are available in {safeDestination.fullName}?
                        </h3>
                        <p className="text-gray-700 mb-3">
                          {safeDestination.fullName} offers a variety of tour experiences including:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {safeDestination.tourCategories.slice(0, 4).map((category, index) => {
                            const categoryName = typeof category === 'string' ? category : category.name;
                            return (
                              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                                {categoryName}
                              </Badge>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Popular Tours Question with Category Guides */}
                  {categoryGuidesProp && categoryGuidesProp.length > 0 && (
                    <Card className="border-gray-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          What are the most popular tours in {safeDestination.fullName}?
                        </h3>
                        <p className="text-gray-700 mb-4">
                          Discover the top-rated tour categories in {safeDestination.fullName} with our comprehensive guides:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categoryGuidesProp.slice(0, 6).map((guide) => {
                            const categoryName = guide.category_name || guide.title || '';
                            const categorySlug = guide.category_slug || '';
                            const normalizedSlug = normalizeSlug(categorySlug);
                            const guideUrl = `/destinations/${safeDestination.id}/guides/${normalizedSlug}`;
                            
                            return (
                              <Link
                                key={categorySlug}
                                href={guideUrl}
                                className="group"
                              >
                                <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white">
                                  <div className="flex items-center gap-2 mb-1">
                                    <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                      {guide.title || categoryName}
                                    </h4>
                                  </div>
                                  {guide.subtitle && (
                                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                      {guide.subtitle}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                        <div className="mt-4">
                          <Link href={`/destinations/${safeDestination.id}/tours`} prefetch={true}>
                            <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                              View All Tours in {safeDestination.fullName}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Must-See Attractions Question */}
                  {safeDestination.highlights && safeDestination.highlights.length > 0 && (
                    <Card className="border-gray-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          What are the must-see attractions in {safeDestination.fullName}?
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          {safeDestination.highlights.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 adventure-gradient">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Explore {safeDestination.fullName}?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Discover the best tours and activities in {safeDestination.fullName} with AI-powered recommendations tailored just for you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 px-8 py-6 text-lg font-semibold"
                >
                  <Link href={`/destinations/${safeDestination.id}/tours`} prefetch={true}>
                    View All Tours & Activities in {safeDestination.fullName}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Combined Internal Linking Section */}
        {(categoryGuides.length > 0 || relatedDestinations.length > 0) && (
          <section className="py-12 px-4" style={{ backgroundColor: '#764ba2' }}>
            <div className="max-w-7xl mx-auto">
              {/* Related Destinations */}
              {relatedDestinations.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    More {safeDestination.category} Destinations
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {relatedDestinations.map((dest, index) => (
                      <Link 
                        key={`${dest.id}-${index}`}
                        href={`/destinations/${dest.id}`}
                        className="text-white/80 hover:text-white transition-colors duration-200 hover:underline"
                      >
                        {dest.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Travel Guides by Region */}
              {categoryGuides.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 text-center">
                    {safeDestination.category} Travel Guides
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
                    {categoryGuides.map((guide, index) => {
                      const categorySlug = guide.category_slug || '';
                      // Normalize slug to handle special characters (e.g., "banús" -> "banus")
                      const normalizedSlug = normalizeSlug(categorySlug);
                      const guideUrl = normalizedSlug ? `/destinations/${safeDestination.id}/guides/${normalizedSlug}` : '#';
                      return (
                      <Link 
                          key={categorySlug || `guide-${index}`}
                          href={guideUrl}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-5 py-4 transition-all duration-200 hover:scale-105 w-full max-w-xs"
                      >
                        <div className="text-white hover:text-blue-200 font-medium line-clamp-2 h-12 flex items-center">
                            {guide.title || guide.category_name || ''}
                        </div>
                      </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
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
            <Link href={`/destinations/${safeDestination.id}/tours`} prefetch={true}>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-4 py-4 md:px-6 md:py-6 rounded-full font-semibold text-sm md:text-base"
              >
                <span>See {destinationName} Tours & Prices</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <FooterNext />
      
      {/* OPTIMIZED: Lazy load SmartTourFinder - only loads when opened */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <SmartTourFinder
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Parent Country Modal - Shows after 5 seconds for small destinations */}
      {showParentCountryModal && safeDestination.parentCountryDestination && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowParentCountryModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Explore More Tours</h3>
                  <p className="text-sm text-gray-500">Discover all destinations</p>
                </div>
              </div>
              <button
                onClick={() => setShowParentCountryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold text-gray-900">{safeDestination.fullName}</span> is part of{' '}
                <span className="font-semibold text-blue-600">{safeDestination.parentCountryDestination.fullName}</span>.
              </p>
              <p className="text-gray-600 mt-2 text-sm">
                View all tours and activities available across {safeDestination.parentCountryDestination.fullName} for the best selection.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1 sunset-gradient text-white hover:scale-105 transition-transform duration-200 font-semibold"
              >
                <Link href={`/destinations/${safeDestination.parentCountryDestination.id}/tours`} prefetch={true}>
                  View All Tours in {safeDestination.parentCountryDestination.fullName}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowParentCountryModal(false)}
                className="px-6 border-gray-300 hover:bg-gray-50"
              >
                Stay Here
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tour Details Modal */}
      {isTourModalOpen && selectedTour && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsTourModalOpen(false);
              setSelectedTour(null);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => {
                setIsTourModalOpen(false);
                setSelectedTour(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-2 shadow-lg"
            >
              ✕
            </button>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tour Details</h2>
              <p className="text-gray-600 mb-6">Complete tour information</p>
              
              {/* Tour Image */}
              {selectedTour.images?.[0]?.variants?.[3]?.url && (
                <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                  <img
                    src={selectedTour.images[0].variants[3].url}
                    alt={selectedTour.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Tour Title and Rating */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{selectedTour.title}</h3>
              
              {/* Badges */}
              {selectedTour.flags && selectedTour.flags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTour?.flags && Array.isArray(selectedTour.flags) && selectedTour.flags.map((flag, index) => {
                    let badgeClass = "text-xs font-medium px-3 py-1 rounded-full";
                    if (flag === "FREE_CANCELLATION") {
                      badgeClass += " bg-green-50 text-green-700 border border-green-200";
                    } else if (flag === "PRIVATE_TOUR") {
                      badgeClass += " bg-purple-50 text-purple-700 border border-purple-200";
                    } else if (flag === "LIKELY_TO_SELL_OUT") {
                      badgeClass += " bg-orange-50 text-orange-700 border border-orange-200";
                    } else {
                      badgeClass += " bg-blue-50 text-blue-700 border border-blue-200";
                    }
                    
                    return (
                      <span key={index} className={badgeClass}>
                        {flag.replace(/_/g, ' ')}
                      </span>
                    );
                  })}
                </div>
              )}
              
              {/* Rating */}
              {selectedTour.reviews && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold text-gray-900">
                      {selectedTour.reviews.combinedAverageRating?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-gray-600 ml-1 text-sm">
                      ({selectedTour.reviews.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              )}
              
              {/* Price */}
              <div className="text-2xl font-bold text-orange-600 mb-6">
                From ${selectedTour.pricing?.summary?.fromPrice || 'N/A'}
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedTour.description || 'No description available.'}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setIsTourModalOpen(false);
                    setSelectedTour(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    window.open(selectedTour.productUrl || `https://www.viator.com/tours/${selectedTour.productCode}`, '_blank');
                  }}
                  className="flex-1 sunset-gradient text-white"
                >
                  View All Details
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      
      {/* OPTIMIZED: Lazy load ShareModal - only loads when opened */}
      {isClient && showShareModal && (
        <Suspense fallback={null}>
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title={`Discover ${safeDestination.fullName} - Top Tours & Restaurants`}
          />
        </Suspense>
      )}
      
      {/* Match to Your Style Modal (Tour Preferences) */}
      {showPreferencesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPreferencesModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                      onClick={() => setLocalPreferences(prev => ({ ...prev, adventureLevel: option.value }))}
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
                      onClick={() => setLocalPreferences(prev => ({ ...prev, cultureVsBeach: option.value }))}
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
                      onClick={() => setLocalPreferences(prev => ({ ...prev, groupPreference: option.value }))}
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
                      onClick={() => setLocalPreferences(prev => ({ ...prev, budgetComfort: option.value }))}
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
                      onClick={() => setLocalPreferences(prev => ({ ...prev, structurePreference: option.value }))}
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
                      onClick={() => setLocalPreferences(prev => ({ ...prev, foodAndDrinkInterest: option.value }))}
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
                    onClick={async () => {
                      if (!user) {
                        router.push('/auth?redirect=' + encodeURIComponent(window.location.pathname));
                        return;
                      }
                      try {
                        const { error } = await supabase
                          .from('profiles')
                          .update({ trip_preferences: localPreferences })
                          .eq('id', user.id);
                        if (error) throw error;
                        toast({
                          title: 'Preferences saved',
                          description: 'Your tour preferences have been saved to your profile.',
                        });
                        setShowPreferencesModal(false);
                      } catch (error) {
                        toast({
                          title: 'Error',
                          description: error.message || 'Failed to save preferences.',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    {user ? 'Save to Profile' : 'Create account to save'}
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
      
      {/* OPTIMIZED: Lazy load RestaurantMatchModal - only loads when opened */}
      {showRestaurantMatchModal && (
        <Suspense fallback={null}>
          <RestaurantMatchModal
            isOpen={showRestaurantMatchModal}
            onClose={() => setShowRestaurantMatchModal(false)}
            restaurant={selectedRestaurant}
            matchData={selectedRestaurant ? restaurantMatchById.get(selectedRestaurant.id) : null}
            preferences={localRestaurantPreferences}
            onOpenPreferences={() => {
              setShowRestaurantMatchModal(false);
              setShowRestaurantPreferencesModal(true);
            }}
          />
        </Suspense>
      )}
      
      {/* Match to Your Taste Modal (no account required) */}
      {showRestaurantPreferencesModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4"
          onClick={() => setShowRestaurantPreferencesModal(false)}
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
                onClick={() => setShowRestaurantPreferencesModal(false)}
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
                    onClick={() => setShowRestaurantPreferencesModal(false)}
                  >
                    Done
                  </Button>
                  <Button
                    className="w-full min-w-0 h-auto py-2 sunset-gradient text-white whitespace-normal break-words leading-tight text-xs"
                    onClick={async () => {
                      if (!user) {
                        try {
                          const redirect = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
                          setShowRestaurantPreferencesModal(false);
                          router.push(`/auth?mode=signup&redirect=${encodeURIComponent(redirect)}`);
                        } catch {
                          router.push('/auth');
                        }
                        return;
                      }
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
                        setShowRestaurantPreferencesModal(false);
                      } catch (e) {
                        toast({
                          title: 'Could not save preferences',
                          description: e?.message || 'Please try again.',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    {user ? 'Save to Profile' : 'Create account to save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
