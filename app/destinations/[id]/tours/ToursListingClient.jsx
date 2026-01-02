"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Star, 
  ExternalLink, 
  X, 
  Clock, 
  MapPin, 
  ArrowRight,
  Crown,
  Loader2,
  BookOpen,
  UtensilsCrossed,
  Home,
  Filter,
  Sun,
  Moon,
  Sunrise,
  MoveHorizontal,
  TrendingUp,
  Info,
  Share2,
  Building2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Link from 'next/link';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useRestaurantBookmarks } from '@/hooks/useRestaurantBookmarks';
import { Heart, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { toast, useToast } from '@/components/ui/use-toast';
import { getTourUrl, getTourProductId } from '@/utils/tourHelpers';
import { getGuidesByCountry } from '@/data/travelGuidesData';
import { getRestaurantsForDestination } from '../restaurants/restaurantsData';
import { getDestinationById, getDestinationsByCountry } from '@/data/destinationsData';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import { hasDestinationPage } from '@/data/destinationFullContent';
import ShareModal from '@/components/sharing/ShareModal';
import TourMatchModal from '@/components/tour/TourMatchModal';
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
import { extractRestaurantStructuredValues, calculateRestaurantPreferenceMatch } from '@/lib/restaurantMatching';
import RestaurantMatchModal from '@/components/restaurant/RestaurantMatchModal';

// Helper function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const DESTINATION_TAG_OPTIONS = {
  aruba: [
    {
      id: '11963',
      label: 'Sunset Cruises',
      description: 'Golden-hour sails & champagne toasts',
      searchTerm: 'Sunset Cruises',
    },
    {
      id: '12979',
      label: 'Catamaran Cruises',
      description: 'Spacious decks & open bars',
      searchTerm: 'Catamaran Cruises',
    },
    {
      id: '13211',
      label: 'Snorkeling',
      description: 'Turtle lagoons & reef hops',
      searchTerm: 'Snorkeling',
    },
    {
      id: '11941',
      label: 'Private Tours',
      description: 'Custom itineraries & VIP guides',
      searchTerm: 'Private Tours',
    },
    {
      id: '22046',
      label: 'Adventure Tours',
      description: 'ATVs, caves, and rugged coasts',
      searchTerm: 'Adventure Tours',
    },
    {
      id: '21911',
      label: 'Food & Drinks',
      description: 'Local bites & sunset cocktails',
      searchTerm: 'Food & Drinks',
    },
    {
      id: '11937',
      label: 'Airport Transfers',
      description: 'Seamless pickup & drop-off',
      searchTerm: 'Airport Transfers',
    },
    {
      id: '21912',
      label: 'Scuba & Diving',
      description: 'Shipwrecks & reef descents',
      searchTerm: 'Scuba & Diving',
    },
    {
      id: '12035',
      label: 'ATV & UTV Tours',
      description: 'Dusty trails & desert thrills',
      searchTerm: 'ATV & UTV Tours',
    },
  ],
};

const buildFallbackTagOptions = (destination, categoryGuides = []) => {
  const destinationName = destination.fullName || destination.name;
  
  // First try tourCategories from destination data
  const categories = (destination.tourCategories || []).slice(0, 6);
  if (categories.length > 0) {
    return categories
      .map((category, index) => {
        if (!category?.name) return null;
        const label = category.name;
        return {
          id: category.tagId || `category-${destination.id}-${index}`,
          label,
          description:
            category.description ||
            category.heroDescription ||
            `Plan trusted ${label.toLowerCase()} experiences in ${destinationName}.`,
          searchTerm: category.searchTerm || label,
        };
      })
      .filter(Boolean);
  }
  
  // Fallback: Use category guides if available
  if (categoryGuides && categoryGuides.length > 0) {
    return categoryGuides
      .slice(0, 6)
      .map((guide, index) => {
        const label = guide.title || guide.category_name || '';
        if (!label) return null;
        
        // Extract just the activity type from category name (remove destination prefix)
        let searchTerm = label;
        if (destinationName && label.toLowerCase().startsWith(destinationName.toLowerCase())) {
          searchTerm = label.replace(new RegExp(`^${destinationName}\\s+`, 'i'), '').trim();
        }
        
        return {
          id: guide.category_slug || guide.slug || `guide-${destination.id}-${index}`,
          label,
          description: guide.subtitle || `Plan trusted ${label.toLowerCase()} experiences in ${destinationName}.`,
          searchTerm: searchTerm,
        };
      })
      .filter(Boolean);
  }
  
  // No tags available
  return [];
};

const getTourCategoryIds = (tour) => {
  const ids = new Set();
  const addId = (value) => {
    if (value === undefined || value === null) return;
    ids.add(String(value));
  };

  const processCategory = (category) => {
    if (!category) return;
    addId(category.categoryId || category.id || category.code);
    const subCategories =
      category.subcategories ||
      category.subCategories ||
      category.children;
    if (Array.isArray(subCategories)) {
      subCategories.forEach(processCategory);
    }
  };

  if (Array.isArray(tour?.categories)) {
    tour.categories.forEach(processCategory);
  }

  if (Array.isArray(tour?.subcategories)) {
    tour.subcategories.forEach(processCategory);
  }

  if (Array.isArray(tour?.classifications)) {
    tour.classifications.forEach(processCategory);
  }

  if (Array.isArray(tour?.categoryIds)) {
    tour.categoryIds.forEach((id) => addId(id));
  }

  return ids;
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const normalized = timeStr.trim().toLowerCase();
  const cleaned = normalized.replace(/(\d{1,2}:\d{2}):\d{2}/, '$1');
  const match = cleaned.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3];
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const getTourStartTimes = (tourItem) => {
  const times = new Set();
  const addTime = (value) => {
    const minutes = parseTimeToMinutes(value);
    if (minutes !== null) {
      times.add(minutes);
    }
  };

  if (Array.isArray(tourItem?.tourGrades)) {
    tourItem.tourGrades.forEach((grade) => {
      if (Array.isArray(grade?.timings)) {
        grade.timings.forEach((timing) => addTime(timing?.startTime || timing?.time || timing?.timeOfDay));
      }
      if (Array.isArray(grade?.startTimes)) {
        grade.startTimes.forEach(addTime);
      }
      if (grade?.startTime) addTime(grade.startTime);
    });
  }

  if (Array.isArray(tourItem?.startTimes)) {
    tourItem.startTimes.forEach(addTime);
  } else if (tourItem?.startTime) {
    addTime(tourItem.startTime);
  }

  if (Array.isArray(tourItem?.timings)) {
    tourItem.timings.forEach((timing) => addTime(timing?.startTime || timing?.time));
  }

  if (Array.isArray(tourItem?.logistics?.start)) {
    tourItem.logistics.start.forEach((start) => addTime(start?.time || start?.startTime || start?.timeOfDay));
  }

  return Array.from(times);
};

const matchesTimeOfDay = (minutes, slot) => {
  if (minutes === null || minutes === undefined) return false;
  if (slot === 'morning') return minutes < 12 * 60;
  if (slot === 'afternoon') return minutes >= 12 * 60 && minutes < 17 * 60;
  if (slot === 'evening') return minutes >= 17 * 60;
  return false;
};

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

const matchesDurationBucket = (minutes, bucket) => {
  if (!minutes) return false;
  switch (bucket) {
    case 'upto1':
      return minutes <= 60;
    case '1to4':
      return minutes > 60 && minutes <= 240;
    case '4to24':
      return minutes > 240 && minutes <= 1440;
    default:
      return false;
  }
};

export default function ToursListingClient({
  isViatorDestination = false, 
  destination, 
  popularTours = [], 
  dynamicTours = [],
  viatorDestinationId,
  totalToursAvailable = 0,
  promotionScores = {}, // Map of productId -> score object
  promotedTours = [], // Promoted tour listings for this destination
  promotedRestaurants = [], // Promoted restaurant listings for this destination
  restaurantPromotionScores = {}, // Map of restaurantId -> score object
  premiumOperatorTourIds = [], // Array of product IDs with premium operator status
  premiumRestaurantIds = [], // Array of restaurant IDs with premium status
  hasRestaurants = false, // Whether destination has restaurants (from server)
  restaurants = [], // Restaurants from server (database + static)
  categoryGuides = [] // Category guides for internal linking (database + hardcoded)
}) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  
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
        setLoadingPreferences(false);
      }
    };
    
    fetchUserPreferences();
  }, [supabase]);

  // Keep production console clean (debug logging removed)
  const { toast } = useToast();
  const { isBookmarked: isRestaurantBookmarked, toggle: toggleRestaurantBookmark } = useRestaurantBookmarks();
  
  // CRITICAL: Use destination.destinationId if available (from classified data), otherwise fall back to prop
  const effectiveDestinationId = destination.destinationId || destination.viatorDestinationId || viatorDestinationId;
  
  // Keep production console clean (debug logging removed)
  
  // Keep production console clean (debug logging removed)
  
  // Get guides for internal linking
  const guides = getGuidesByCountry(destination.country) || [];
  // hasRestaurants is now passed from server component (checks both database and static data)
  
  // Check if destination has a guide (not a Viator destination without guide)
  const destinationWithGuide = getDestinationById(destination.id);
  const hasDestinationGuide = destinationWithGuide && !isViatorDestination;
  
  // Define destinationName at component level for use throughout
  const destinationName = destination.fullName || destination.name;
  
  // Get other destinations in the same country for internal linking (for all destinations)
  let otherDestinationsInCountry = [];
  if (destination.country) {
    // First try to get from destinationsData (182 destinations with guides)
    const destinationsFromData = getDestinationsByCountry(destination.country, destination.id);
    
    // Also check classified data for additional destinations (works for both with and without guides)
    if (Array.isArray(viatorDestinationsClassifiedData)) {
      const currentName = (destination.name || destination.fullName || '').toLowerCase().trim();
      const currentSlug = generateSlug(destination.name || destination.fullName || '');
      
      const classifiedDestinations = viatorDestinationsClassifiedData
        .filter(dest => {
          // Only include cities, not regions or countries
          if (dest.type && dest.type !== 'CITY') {
            return false;
          }
          
          const destCountry = (dest.country || '').toLowerCase().trim();
          const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
          const destSlug = generateSlug(dest.destinationName || dest.name || '');
          
          // Must match country and not be the current destination
          return destCountry === destination.country.toLowerCase().trim() && 
                 destName !== currentName && 
                 destSlug !== currentSlug &&
                 destName.length > 0; // Ensure name exists
        })
        .map(dest => ({
          id: generateSlug(dest.destinationName || dest.name || ''),
          name: dest.destinationName || dest.name || '',
          fullName: dest.destinationName || dest.name || '',
        }));
      
      // Combine and deduplicate by id
      const allDestinations = [...destinationsFromData, ...classifiedDestinations];
      const seen = new Set();
      const uniqueDestinations = allDestinations.filter(dest => {
        if (seen.has(dest.id)) {
          return false;
        }
        seen.add(dest.id);
        return true;
      });
      
      // Sort alphabetically by name
      otherDestinationsInCountry = uniqueDestinations.sort((a, b) => 
        (a.name || a.fullName || '').localeCompare(b.name || b.fullName || '')
      );
    } else {
      // Sort alphabetically
      otherDestinationsInCountry = destinationsFromData.sort((a, b) => 
        (a.name || a.fullName || '').localeCompare(b.name || b.fullName || '')
      );
    }
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'reviews', 'price-low', 'price-high', 'best-match'
  const [showMoreDestinations, setShowMoreDestinations] = useState(12); // Show 12 initially (2 rows of 6)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [savingPreferencesToProfile, setSavingPreferencesToProfile] = useState(false);
  
  // Restaurant match modal state
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantMatchModal, setShowRestaurantMatchModal] = useState(false);
  const [localRestaurantPreferences, setLocalRestaurantPreferences] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('topTours_restaurant_preferences');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading restaurant preferences:', e);
    }
    return {
      atmosphere: 'any',
      diningStyle: 50,
      features: [],
      priceRange: 'any',
      mealTime: 'any',
      groupSize: 'any',
    };
  });
  
  // User preferences for matching
  const [user, setUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [matchScores, setMatchScores] = useState({}); // Map of productId -> match score
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  
  // Lightweight localStorage preferences (works for everyone, no sign-in required)
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
      console.error('Error loading localStorage preferences:', e);
    }
    // Return null (not defaults) - this ensures consistency across all pages
    // calculateEnhancedMatchScore will use balanced defaults internally when null
    return null;
  });
  
  // Save to localStorage when preferences change
  useEffect(() => {
    if (localPreferences && typeof window !== 'undefined') {
      try {
        localStorage.setItem('topTours_preferences', JSON.stringify(localPreferences));
      } catch (e) {
        console.error('Error saving localStorage preferences:', e);
      }
    }
  }, [localPreferences]);

  // Auto-sync local preferences -> profile once after sign-in (keeps UX frictionless)
  useEffect(() => {
    if (!user || !localPreferences) return;
    if (typeof window === 'undefined') return;

    const syncKey = `topTours_prefs_synced_${user.id}`;
    let didSync = false;
    try {
      didSync = localStorage.getItem(syncKey) === '1';
    } catch {}
    if (didSync) return;

    const run = async () => {
      try {
        // Only sync if profile doesn't already have a saved preferences object
        const hasProfilePrefs =
          userPreferences &&
          typeof userPreferences === 'object' &&
          Object.keys(userPreferences).length >= 5;

        if (hasProfilePrefs) {
          try { localStorage.setItem(syncKey, '1'); } catch {}
          return;
        }

        const merged = { ...(userPreferences || {}), ...localPreferences };
        const { error } = await supabase
          .from('profiles')
          .upsert({ id: user.id, trip_preferences: merged });
        if (error) throw error;

        setUserPreferences(merged);
        try { localStorage.setItem(syncKey, '1'); } catch {}
      } catch (e) {
        // Non-blocking; user can still manually save
        console.warn('Preference auto-sync failed:', e?.message || e);
      }
    };

    run();
  }, [user, localPreferences, userPreferences, supabase]);

  const handleSavePreferencesToProfile = useCallback(async () => {
    if (!localPreferences) return;

    // If not signed in, send them to auth (prefs are already in localStorage)
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
  }, [localPreferences, user, userPreferences, supabase, router, toast]);
  const defaultFilterState = {
    category: '',
    priceFrom: '',
    priceTo: '',
    durationBucket: '',
    travelerType: '',
    flags: [], // Array of selected flags
    timeOfDay: [],
    tags: [],
    specialOffersOnly: false,
  };
  const [filters, setFilters] = useState(() => ({ ...defaultFilterState }));
  
  // Available tour flags with user-friendly labels
  const availableFlags = [
    { value: 'FREE_CANCELLATION', label: 'Free Cancellation', icon: '✓' },
    { value: 'LIKELY_TO_SELL_OUT', label: 'Likely to Sell Out', icon: '🔥' },
    { value: 'PRIVATE_TOUR', label: 'Private Tour', icon: '👤' },
    { value: 'NEW_ON_VIATOR', label: 'New on TopTours', icon: '✨' }
  ];

  const timeOfDayOptions = [
    { value: 'morning', label: 'Morning', description: 'Starts before 12pm', icon: <Sunrise className="w-4 h-4" /> },
    { value: 'afternoon', label: 'Afternoon', description: 'Starts after 12pm', icon: <Sun className="w-4 h-4" /> },
    { value: 'evening', label: 'Evening & night', description: 'Starts after 5pm', icon: <Moon className="w-4 h-4" /> },
  ];

  const durationOptions = [
    { value: 'upto1', label: 'Up to 1 hour' },
    { value: '1to4', label: '1 to 4 hours' },
    { value: '4to24', label: '4 hours to 1 day' },
  ];
  
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [filteredToursFromAPI, setFilteredToursFromAPI] = useState([]);
  const [filteredTotalCount, setFilteredTotalCount] = useState(0); // Total count when filters are applied
  const [filteredCurrentPage, setFilteredCurrentPage] = useState(1); // Current page for filtered results
  const [filteredHasMore, setFilteredHasMore] = useState(false); // Whether there are more filtered tours to load
  const [loadingMoreFiltered, setLoadingMoreFiltered] = useState(false); // Loading state for "Load More"
  const [showShareModal, setShowShareModal] = useState(false);
  const [showParentCountryModal, setShowParentCountryModal] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  const [loadingMoreSearch, setLoadingMoreSearch] = useState(false);
  const [moreDynamicTours, setMoreDynamicTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [regularToursCurrentPage, setRegularToursCurrentPage] = useState(1);
  const [regularToursHasMore, setRegularToursHasMore] = useState(false);
  const [loadingMoreRegular, setLoadingMoreRegular] = useState(false);

  // Calculate restaurant match scores for promoted restaurants
  const restaurantMatchById = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(promotedRestaurants)) return map;

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

    promotedRestaurants.forEach((r) => {
      try {
        const values = extractRestaurantStructuredValues(r);
        if (values?.error) return;
        const match = calculateRestaurantPreferenceMatch(pseudoUserPreferences, values, r);
        if (match?.error) return;
        map.set(r.id, match);
      } catch {}
    });
    return map;
  }, [promotedRestaurants, localRestaurantPreferences]);

  // Combine all tours for filtering (deduplicate by productId)
  // Priority: Search results > Filtered results > Initial tours
  const allTours = useMemo(() => {
    // If we have search results, use those (searched from all Viator tours)
    if (isSearching && searchResults.length > 0) {
      // Still include popular tours and promoted tours if they match the search
      const popularWithPricing = popularTours.map(tour => ({
        ...tour,
        isFeatured: true,
      }));
      
      // Combine search results with popular tours and promoted tours
      const combined = [...popularWithPricing, ...promotedTours, ...searchResults];
      const seenIds = new Set();
      const uniqueTours = [];
      
      for (const tour of combined) {
        const tourId = tour.productId || tour.productCode;
        if (tourId && !seenIds.has(tourId)) {
          seenIds.add(tourId);
          uniqueTours.push(tour);
        }
      }
      
      return uniqueTours;
    }
    
    // If we have filtered results from API, use those
    if (isFiltered && filteredToursFromAPI.length > 0) {
      // Still include popular tours and promoted tours if they match the filter
      const includeFeaturedPopular = !activeFilters.specialOffersOnly;
      const popularWithPricing = includeFeaturedPopular
        ? popularTours.map(tour => ({
            ...tour,
            isFeatured: true,
          }))
        : [];
      
      // Combine filtered API results with popular tours and promoted tours
      const combined = [...popularWithPricing, ...promotedTours, ...filteredToursFromAPI];
      const seenIds = new Set();
      const uniqueTours = [];
      
      for (const tour of combined) {
        const tourId = tour.productId || tour.productCode;
        if (tourId && !seenIds.has(tourId)) {
          seenIds.add(tourId);
          uniqueTours.push(tour);
        }
      }
      
      return uniqueTours;
    }
    
    // Default: use initial tours (popular + dynamic + promoted)
    const popularWithPricing = popularTours.map(tour => ({
      ...tour,
      isFeatured: true,
    }));

    // Combine all tours and deduplicate by productId/productCode
    // Include promoted tours so they get match scores calculated
    const combined = [...popularWithPricing, ...dynamicTours, ...moreDynamicTours, ...promotedTours];
    const seenIds = new Set();
    const uniqueTours = [];
    
    for (const tour of combined) {
      const tourId = tour.productId || tour.productCode;
      if (tourId && !seenIds.has(tourId)) {
        seenIds.add(tourId);
        uniqueTours.push(tour);
      } else if (!tourId) {
        // If no ID, still include it (shouldn't happen, but just in case)
        uniqueTours.push(tour);
      }
    }
    
    return uniqueTours;
  }, [popularTours, dynamicTours, moreDynamicTours, filteredToursFromAPI, isFiltered, searchResults, isSearching, promotedTours]);

  // Calculate match scores for tours (async, cached in state)
  useEffect(() => {
    if (loadingPreferences || allTours.length === 0) {
      // Still set default scores even if no tours or loading
      if (allTours.length === 0) {
        setMatchScores({});
      }
      return;
    }
    
    const calculateMatches = async () => {
      // Use unified preference resolution - ensures consistent match scores across all pages
      const rawPreferences = resolveUserPreferences({ user, userPreferences, localPreferences });
      
      // For default match calculation (used for initial scores), we need converted preferences
      const preferences = rawPreferences
        ? getUserPreferenceScores(rawPreferences)
        : getDefaultPreferences();
      
      // Keep production console clean (debug logging removed)
      
      // Initialize all tours with default scores first (so cards show something immediately)
      const defaultProfile = {
        adventure_score: 50,
        relaxation_exploration_score: 50,
        group_intimacy_score: 50,
        price_comfort_score: 50,
        guidance_score: 50,
        food_drink_score: 50,
        confidence: 'low',
        contributing_tags: [],
        tag_count: 0,
      };
      const defaultMatch = calculateMatchScore(defaultProfile, preferences);
      defaultMatch.tourProfile = defaultProfile;
      
      const initialScores = {};
      for (const tour of allTours) {
        const productId = getTourProductId(tour) || tour.product_id || tour.productId || tour.productCode;
        if (productId) {
          initialScores[productId] = { ...defaultMatch };
        }
      }
      setMatchScores(initialScores); // Show default scores immediately
      
      // Step 1: Collect ALL unique tag IDs from all tours (batch fetch)
      const allTagIds = new Set();
      const tourTagMap = new Map(); // productId -> tagIds array
      
      for (const tour of allTours) {
        const productId = getTourProductId(tour) || tour.product_id || tour.productId || tour.productCode;
        if (!productId) continue;
        
        const tagIds = tour.tags || tour.tagIds || [];
        if (Array.isArray(tagIds) && tagIds.length > 0) {
          tagIds.forEach(id => allTagIds.add(id));
          tourTagMap.set(productId, tagIds);
        }
      }
      
      // Step 2: Fetch ALL tag traits in ONE database call
      const tagTraitsMap = new Map();
      if (allTagIds.size > 0) {
        try {
          const uniqueTagIds = Array.from(allTagIds);
          const batchSize = 1000;
          
          for (let i = 0; i < uniqueTagIds.length; i += batchSize) {
            const batch = uniqueTagIds.slice(i, i + batchSize);
            const { data: tagTraits, error } = await supabase
              .from('viator_tag_traits')
              .select('*')
              .in('tag_id', batch);
            
            if (!error && tagTraits) {
              tagTraits.forEach(trait => {
                tagTraitsMap.set(trait.tag_id, {
                  tag_id: trait.tag_id,
                  tagId: trait.tag_id,
                  tag_name_en: trait.tag_name_en,
                  tagName: trait.tag_name_en,
                  adventure_score: trait.adventure_score,
                  relaxation_exploration_score: trait.relaxation_exploration_score,
                  group_intimacy_score: trait.group_intimacy_score,
                  price_comfort_score: trait.price_comfort_score,
                  guidance_score: trait.guidance_score,
                  food_drink_score: trait.food_drink_score,
                  tag_weight: trait.tag_weight,
                  is_generic: trait.is_generic,
                });
              });
            }
          }
          
          // Keep production console clean (debug logging removed)
        } catch (error) {
          console.error('Error fetching tag traits:', error);
        }
      }
      
      // Step 3: Calculate match scores for all tours (using cached tag traits)
      const scores = {};
      
      for (const tour of allTours) {
        const productId = getTourProductId(tour) || tour.product_id || tour.productId || tour.productCode;
        if (!productId) {
          // Still assign a default score even if no productId
          continue;
        }
        
        try {
          // Get tag IDs for this tour
          const tagIds = tourTagMap.get(productId) || [];
          
          // Convert tag IDs to tag objects using cached traits
          const tourTags = tagIds
            .map(tagId => tagTraitsMap.get(tagId))
            .filter(Boolean); // Remove any missing traits
          
          // Calculate tour profile from tags (synchronous now - no DB calls)
          const tourProfile = await calculateTourProfile(tourTags, null, supabase);
          
          // Calculate enhanced match score (uses full tour object with price, rating, flags, etc.)
          // Pass raw preferences - calculateEnhancedMatchScore converts them internally
          // If no preferences, pass null and it will default to balanced (50) for all dimensions
          const matchResult = await calculateEnhancedMatchScore(tour, rawPreferences || null, tourProfile);
          // matchResult.tourProfile is already set to the ADJUSTED profile (includes price/flag adjustments)
          // Don't overwrite it with the original tag-based profile!
          scores[productId] = matchResult;
          
          // Keep production console clean (debug logging removed)
        } catch (error) {
          console.error(`Error calculating match for tour ${productId}:`, error);
          // Default to balanced match score with default profile
          const defaultProfile = {
            adventure_score: 50,
            relaxation_exploration_score: 50,
            group_intimacy_score: 50,
            price_comfort_score: 50,
            guidance_score: 50,
            food_drink_score: 50,
            confidence: 'low',
            contributing_tags: [],
            tag_count: 0,
          };
          const defaultMatch = calculateMatchScore(defaultProfile, preferences);
          defaultMatch.tourProfile = defaultProfile;
          scores[productId] = defaultMatch;
        }
      }
      
      // Ensure ALL tours have a match score (even if they weren't in the loop)
      for (const tour of allTours) {
        const productId = getTourProductId(tour) || tour.product_id || tour.productId || tour.productCode;
        if (productId && !scores[productId]) {
          const defaultProfile = {
            adventure_score: 50,
            relaxation_exploration_score: 50,
            group_intimacy_score: 50,
            price_comfort_score: 50,
            guidance_score: 50,
            food_drink_score: 50,
            confidence: 'low',
            contributing_tags: [],
            tag_count: 0,
          };
          const defaultMatch = calculateMatchScore(defaultProfile, preferences);
          defaultMatch.tourProfile = defaultProfile;
          scores[productId] = defaultMatch;
        }
      }
      
      // Keep production console clean (debug logging removed)
      setMatchScores(scores);
    };
    
    calculateMatches();
  }, [allTours, user, userPreferences, loadingPreferences, localPreferences, supabase]);
  
  // Calculate min and max prices for slider
  const priceRange = useMemo(() => {
    const prices = allTours
      .map(tour => parseFloat(tour.pricing?.summary?.fromPrice || tour.price || 0))
      .filter(price => price > 0);
    
    if (prices.length === 0) return { min: 0, max: 1000 };
    
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return { min, max };
  }, [allTours]);

  // Filter tours (client-side filtering for category, etc. - search is handled via API)
  const filteredTours = useMemo(() => {
    let filtered = [...allTours];

    // Note: Search is now handled via API when user types, so we don't filter here
    // Only apply client-side filters for category, etc.

    // Flag filter - IMPORTANT: Always apply this as a safety check
    // Even if API filtering is applied, we verify client-side to ensure accuracy
    if (activeFilters.flags && activeFilters.flags.length > 0) {
      filtered = filtered.filter(tour => {
        const tourFlags = tour.flags || [];
        // Tour must have at least one of the requested flags
        const hasFlag = activeFilters.flags.some(flag => tourFlags.includes(flag));
        // Keep production console clean (debug logging removed)
        return hasFlag;
      });
    }

    // Category filter
    if (activeFilters.category) {
      filtered = filtered.filter(tour => {
        const category = tour.metadata?.category || tour.categories?.[0]?.categoryName || '';
        return category.toLowerCase().includes(activeFilters.category.toLowerCase());
      });
    }

    // Special offers filter (client-side)
    if (activeFilters.specialOffersOnly) {
      filtered = filtered.filter((tour) => (tour.flags || []).includes('SPECIAL_OFFER'));
    }

    // Time of day filter
    if (activeFilters.timeOfDay && activeFilters.timeOfDay.length > 0) {
      filtered = filtered.filter(tour => {
        const startTimes = getTourStartTimes(tour);
        if (!startTimes.length) return false;
        return startTimes.some(minutes => activeFilters.timeOfDay.some(slot => matchesTimeOfDay(minutes, slot)));
      });
    }

    // Duration filter
    if (activeFilters.durationBucket) {
      filtered = filtered.filter(tour => {
        const minutes = getTourDurationMinutes(tour);
        if (!minutes) return false;
        return matchesDurationBucket(minutes, activeFilters.durationBucket);
      });
    }

    // Price filter (only if not already filtered by API)
    if (!isFiltered && activeFilters.priceFrom) {
      filtered = filtered.filter(tour => {
        const price = parseFloat(tour.pricing?.summary?.fromPrice || tour.price || 0);
        return price >= parseFloat(activeFilters.priceFrom);
      });
    }

    if (!isFiltered && activeFilters.priceTo) {
      filtered = filtered.filter(tour => {
        const price = parseFloat(tour.pricing?.summary?.fromPrice || tour.price || 0);
        return price <= parseFloat(activeFilters.priceTo);
      });
    }

    // Get promoted product IDs for sorting
    const promotedProductIds = new Set(
      promotedTours.map(t => t.productId || t.productCode).filter(Boolean)
    );
    
    // Sort: Promoted first, then Featured, then by selected sort option
    filtered.sort((a, b) => {
      const productIdA = a.productId || a.productCode;
      const productIdB = b.productId || b.productCode;
      const isPromotedA = productIdA && promotedProductIds.has(productIdA);
      const isPromotedB = productIdB && promotedProductIds.has(productIdB);
      
      // Promoted listings always first
      if (isPromotedA && !isPromotedB) return -1;
      if (!isPromotedA && isPromotedB) return 1;
      
      // Within promoted group, maintain order (oldest subscription first = loyalty)
      // Within regular group, featured first
      if (!isPromotedA && !isPromotedB) {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
      }
      
      // Apply sorting based on sortBy state
      if (sortBy === 'rating') {
        const ratingA = a.reviews?.combinedAverageRating || 0;
        const ratingB = b.reviews?.combinedAverageRating || 0;
        return ratingB - ratingA;
      } else if (sortBy === 'reviews') {
        const reviewsA = a.reviews?.totalReviews || 0;
        const reviewsB = b.reviews?.totalReviews || 0;
        return reviewsB - reviewsA;
      } else if (sortBy === 'price-low') {
        const priceA = parseFloat(a.pricing?.summary?.fromPrice || a.price || 0);
        const priceB = parseFloat(b.pricing?.summary?.fromPrice || b.price || 0);
        return priceA - priceB;
      } else if (sortBy === 'price-high') {
        const priceA = parseFloat(a.pricing?.summary?.fromPrice || a.price || 0);
        const priceB = parseFloat(b.pricing?.summary?.fromPrice || b.price || 0);
        return priceB - priceA;
      } else if (sortBy === 'best-match') {
        // Sort by match score (higher = better)
        const productIdA = a.productId || a.productCode;
        const productIdB = b.productId || b.productCode;
        const matchA = matchScores[productIdA]?.score || 50;
        const matchB = matchScores[productIdB]?.score || 50;
        return matchB - matchA; // Higher score first
      }
      
      return 0;
    });

    return filtered;
  }, [allTours, searchTerm, activeFilters, sortBy, isFiltered, matchScores, promotedTours]);

  // Separate featured and regular tours
  const featuredTours = filteredTours.filter(t => t.isFeatured);
  const regularTours = filteredTours.filter(t => !t.isFeatured);

  const destinationTagOptions = (() => {
    const customTags = DESTINATION_TAG_OPTIONS[destination.id];
    if (customTags && customTags.length) return customTags;
    return buildFallbackTagOptions(destination, categoryGuides);
  })();

  const tagScrollRef = useRef(null);
  const [tagScrollState, setTagScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const updateTagScrollIndicators = useCallback(() => {
    const el = tagScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScrollLeft = scrollWidth - clientWidth;
    setTagScrollState({
      canScrollLeft: scrollLeft > 6,
      canScrollRight: scrollLeft < maxScrollLeft - 6,
    });
  }, []);

  // Show parent country modal after 5 seconds (if destination has parent country)
  useEffect(() => {
    if (destination.parentCountryDestination) {
      const timer = setTimeout(() => {
        setShowParentCountryModal(true);
      }, 5000); // 5 seconds
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [destination.parentCountryDestination]);

  useEffect(() => {
    const el = tagScrollRef.current;
    if (!el) return;
    updateTagScrollIndicators();
    el.addEventListener('scroll', updateTagScrollIndicators);
    return () => {
      el.removeEventListener('scroll', updateTagScrollIndicators);
    };
  }, [updateTagScrollIndicators, destination.id, destinationTagOptions.length]);

  const handleTagScroll = (direction) => {
    if (!tagScrollRef.current) return;
    const scrollAmount = direction === 'left' ? -200 : 200;
    tagScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(updateTagScrollIndicators, 250);
  };

  const handleApplyFilters = async () => {
    // Check if any filters are set (price or flags)
    const hasPriceFilter = filters.priceFrom || filters.priceTo;
    const hasFlagFilter = filters.flags && filters.flags.length > 0;
    const hasTagFilter = filters.tags && filters.tags.length > 0;
    const hasSpecialOffersFilter = filters.specialOffersOnly;
    
    if (hasSpecialOffersFilter) {
      setLoading(true);
      setIsFiltered(true);
      try {
        const response = await fetch('/api/internal/viator-products-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinationId: effectiveDestinationId ? String(effectiveDestinationId) : null,
            flags: ['SPECIAL_OFFER'],
            start: 1,
            count: 50, // COMPLIANCE: Max 50 products per API call
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Special offers fetch error:', errorText);
          setFilteredToursFromAPI([]);
          setFilteredTotalCount(0);
        } else {
          const data = await response.json();
          // /api/internal/viator-products-search returns: { products: [...], totalCount: number }
          const results = Array.isArray(data?.products) ? data.products : (data?.products?.results || []);
          const totalCount = data?.totalCount || data?.products?.totalCount || 0;
          // Keep production console clean (debug logging removed)
          setFilteredToursFromAPI(results);
          setFilteredTotalCount(totalCount);
          setFilteredCurrentPage(1);
          setFilteredHasMore(totalCount > results.length);
          setActiveFilters({ ...filters });
        }
      } catch (error) {
        console.error('Error fetching special offers:', error);
        setFilteredToursFromAPI([]);
        setFilteredTotalCount(0);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (hasPriceFilter || hasFlagFilter || hasTagFilter) {
        // Fetch filtered tours from API
        setLoading(true);
        setIsFiltered(true);
        
        try {
          const destinationName = destination.fullName || destination.name;
          const tagDefinitions = destinationTagOptions.filter((tag) =>
            (filters.tags || []).includes(tag.id)
          );
          const primaryTag = tagDefinitions.length > 0 ? tagDefinitions[0] : null;
          const primaryTagSearchTerm = primaryTag?.searchTerm || primaryTag?.label || '';

          const requestBody = {
            // When using categories/search: searchTerm should be JUST the category/search term (e.g., "snorkeling tours")
            // NOT including destination name - the destination ID filter handles that
            // This uses /search/freetext endpoint with destination filter
            searchTerm: hasTagFilter && primaryTagSearchTerm
              ? primaryTagSearchTerm.trim() // Just the category term, e.g., "Snorkeling Tours"
              : '', // No search term means use /products/search endpoint
            page: 1,
            viatorDestinationId: effectiveDestinationId ? String(effectiveDestinationId) : null,
            includeDestination: !!effectiveDestinationId, // Always use destination filter when available
          };
          
          // Add price filters
          if (filters.priceFrom) {
            requestBody.minPrice = parseInt(filters.priceFrom);
          }
          if (filters.priceTo) {
            requestBody.maxPrice = parseInt(filters.priceTo);
          }
          
          // Note: We don't send flag filters to the API because it doesn't filter correctly
          // Instead, we'll fetch all tours and filter client-side by flags
          // This ensures we get accurate results
          if (hasFlagFilter) {
            requestBody.flags = filters.flags.filter((flag) => flag !== 'SPECIAL_OFFER');
          }
          
          // COMPLIANCE: Only fetch page 1 on initial filter/tag click (max 50 products per Viator rules)
          // Additional pages will be fetched when user clicks "Load More" (user-driven pagination)
          // This ensures we comply with Viator's requirement: "Paginate through the search results
          // only when the customer wants to move to the next page with search results"
          const response = await fetch('/api/internal/viator-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...requestBody,
              page: 1
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data.error) {
            throw new Error(data.error);
          }

          const allFetchedTours = [];
          const seenIds = new Set();
          let totalCountFromAPI = 0;
          
          // Extract totalCount from the response
          totalCountFromAPI = data.products?.totalCount || data.totalCount || 0;
          
          // Process only page 1 results
          const tours = data.products?.results || [];
          for (const tour of tours) {
            const tourId = tour.productId || tour.productCode;
            if (tourId && !seenIds.has(tourId)) {
              seenIds.add(tourId);
              // Always add the tour - we'll filter by flags in the useMemo
              allFetchedTours.push(tour);
            }
          }
          
          // Filter out popular tours
          const popularProductIds = new Set(popularTours.map(t => t.productId));
          const filtered = allFetchedTours.filter(tour => {
            const tourId = tour.productId || tour.productCode;
            return !popularProductIds.has(tourId);
          });
          
          // Keep production console clean (debug logging removed)
          setFilteredToursFromAPI(filtered);
          setFilteredTotalCount(totalCountFromAPI);
          setFilteredCurrentPage(1); // Track that we've loaded page 1
          // Check if there are more tours to load (if totalCount is greater than what we fetched)
          const totalFetched = allFetchedTours.length;
          setFilteredHasMore(totalCountFromAPI > 0 && totalFetched < totalCountFromAPI);
          setActiveFilters({ ...filters });
      } catch (error) {
        console.error('Error fetching filtered tours:', error);
        setFilteredToursFromAPI([]);
        setFilteredTotalCount(0);
      } finally {
        setLoading(false);
      }
    } else {
      // No API filters, just apply client-side filters
      setActiveFilters({ ...filters });
      setIsFiltered(false);
      setFilteredToursFromAPI([]);
      setFilteredTotalCount(0);
    }
  };

  // Load more filtered tours (pagination for filtered results)
  const handleLoadMoreFiltered = async () => {
    if (loadingMoreFiltered || !isFiltered) return;

    setLoadingMoreFiltered(true);
    try {
      const destinationName = destination.fullName || destination.name;
      const tagDefinitions = destinationTagOptions.filter((tag) =>
        (activeFilters.tags || []).includes(tag.id)
      );
      const primaryTag = tagDefinitions.length > 0 ? tagDefinitions[0] : null;
      const primaryTagSearchTerm = primaryTag?.searchTerm || primaryTag?.label || '';

      const requestBody = {
        searchTerm: activeFilters.tags && primaryTagSearchTerm
          ? primaryTagSearchTerm.trim()
          : '',
        page: filteredCurrentPage + 1,
        viatorDestinationId: effectiveDestinationId ? String(effectiveDestinationId) : null,
        includeDestination: !!effectiveDestinationId,
      };

      // Add price filters
      if (activeFilters.priceFrom) {
        requestBody.minPrice = parseInt(activeFilters.priceFrom);
      }
      if (activeFilters.priceTo) {
        requestBody.maxPrice = parseInt(activeFilters.priceTo);
      }

      if (activeFilters.flags && activeFilters.flags.length > 0) {
        requestBody.flags = activeFilters.flags.filter((flag) => flag !== 'SPECIAL_OFFER');
      }

      const response = await fetch('/api/internal/viator-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const newTours = data.products?.results || [];
      const popularProductIds = new Set(popularTours.map(t => t.productId));
      const filteredNewTours = newTours.filter(tour => {
        const tourId = tour.productId || tour.productCode;
        return tourId && !popularProductIds.has(tourId);
      });

      // Add new tours to existing filtered tours
      setFilteredToursFromAPI(prev => {
        const seenIds = new Set(prev.map(t => t.productId || t.productCode));
        const uniqueNewTours = filteredNewTours.filter(t => {
          const id = t.productId || t.productCode;
          return id && !seenIds.has(id);
        });
        return [...prev, ...uniqueNewTours];
      });

      setFilteredCurrentPage(prev => prev + 1);
      
      // Check if there are more tours (if we got fewer than 48, we're probably at the end)
      setFilteredHasMore(newTours.length >= 48);
    } catch (error) {
      console.error('Error loading more filtered tours:', error);
      toast({
        title: "Error",
        description: "Failed to load more tours. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingMoreFiltered(false);
    }
  };

  // Calculate if there are more regular tours to load
  useEffect(() => {
    // Only show "Load More" for regular tours (not filtered, not searched)
    if (isFiltered || isSearching) {
      setRegularToursHasMore(false);
      return;
    }

    // Check if we have total count and if we're displaying less than total
    const totalDisplayed = featuredTours.length + regularTours.length;
    
    if (totalToursAvailable > 0) {
      // We have a total count from API - check if displayed < total
      const hasMore = totalDisplayed < totalToursAvailable;
      setRegularToursHasMore(hasMore);
    } else if (totalDisplayed > 0) {
      // If no total count but we have tours, assume there might be more if we got a full page (48)
      // This is a fallback for when totalCount isn't available
      setRegularToursHasMore(totalDisplayed >= 48);
    } else {
      setRegularToursHasMore(false);
    }
  }, [isFiltered, isSearching, totalToursAvailable, featuredTours.length, regularTours.length]);

  // Load more regular tours (user-driven pagination)
  const handleLoadMoreRegular = async () => {
    if (loadingMoreRegular || !regularToursHasMore || isFiltered || isSearching) return;

    setLoadingMoreRegular(true);
    try {
      const nextPage = regularToursCurrentPage + 1;
      const requestBody = {
        searchTerm: '',
        page: nextPage,
        viatorDestinationId: effectiveDestinationId ? String(effectiveDestinationId) : null,
        includeDestination: !!effectiveDestinationId,
      };

      const response = await fetch('/api/internal/viator-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const newTours = data.products?.results || [];
      const popularProductIds = new Set(popularTours.map(t => t.productId));
      const filteredNewTours = newTours.filter(tour => {
        const tourId = tour.productId || tour.productCode;
        return tourId && !popularProductIds.has(tourId);
      });

      // Add new tours to moreDynamicTours
      setMoreDynamicTours(prev => {
        const seenIds = new Set(prev.map(t => t.productId || t.productCode));
        const uniqueNewTours = filteredNewTours.filter(t => {
          const id = t.productId || t.productCode;
          return id && !seenIds.has(id);
        });
        return [...prev, ...uniqueNewTours];
      });

      setRegularToursCurrentPage(nextPage);
      const totalAfterLoad = featuredTours.length + regularTours.length + filteredNewTours.length;
      setRegularToursHasMore(newTours.length >= 48 && totalAfterLoad < totalToursAvailable);
    } catch (error) {
      console.error('Error loading more regular tours:', error);
      toast({
        title: "Error",
        description: "Failed to load more tours. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingMoreRegular(false);
    }
  };
  
  const handleFlagToggle = (flagValue) => {
    setFilters(prev => {
      const currentFlags = prev.flags || [];
      const newFlags = currentFlags.includes(flagValue)
        ? currentFlags.filter(f => f !== flagValue)
        : [...currentFlags, flagValue];
      return { ...prev, flags: newFlags };
    });
  };

  const handleTagToggle = (tagId) => {
    setFilters((prev) => {
      const currentTags = prev.tags || [];
      const isActive = currentTags.includes(tagId);
      const newTags = isActive ? [] : [tagId];
      return {
        ...prev,
        tags: newTags,
        specialOffersOnly: false,
      };
    });
  };

  const handleSpecialOffersToggle = () => {
    const enable = !filters.specialOffersOnly;
    setSearchTerm('');
    setIsSearching(false);
    setSearchResults([]);
      setFilteredToursFromAPI([]);
      setFilteredTotalCount(0);
      setFilteredCurrentPage(1);
      setFilteredHasMore(false);
      setActiveFilters({});
      if (enable) {
        setFilters({ ...defaultFilterState, specialOffersOnly: true });
        setIsFiltered(true);
      } else {
        setFilters({ ...defaultFilterState });
        setIsFiltered(false);
      }
  };

  const handleTimeOfDayToggle = (value) => {
    setFilters(prev => {
      const current = prev.timeOfDay || [];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, timeOfDay: newValues };
    });
  };

  const handleDurationSelect = (value) => {
    setFilters(prev => ({
      ...prev,
      durationBucket: prev.durationBucket === value ? '' : value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({ ...defaultFilterState });
    setActiveFilters({});
    setSearchTerm('');
    setSortBy('rating'); // Reset sort to default
    setIsFiltered(false);
    setFilteredToursFromAPI([]);
    setFilteredTotalCount(0);
    setFilteredCurrentPage(1);
    setFilteredHasMore(false);
    setIsSearching(false);
    setSearchResults([]);
  };

  // Search functionality - query Viator API when user types
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        // Search Viator API for tours matching the search term
        setLoading(true);
        setIsSearching(true);
        
        try {
          // Search term should be JUST what the user typed (e.g., "snorkeling")
          // NOT including destination name - the destination ID filter handles that
          // This uses /search/freetext endpoint with destination filter
          const searchQuery = searchTerm.trim();
          
          // COMPLIANCE: Only fetch page 1 on initial search (max 50 products per Viator rules)
          // Additional pages will be fetched when user clicks "Load More" (user-driven pagination)
          const response = await fetch('/api/internal/viator-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // When searching with a term, still include destination ID filter for accuracy
              searchTerm: searchQuery,
              page: 1,
              viatorDestinationId: effectiveDestinationId ? String(effectiveDestinationId) : null,
              includeDestination: !!effectiveDestinationId // Use destination ID filter when available
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data.error) {
            throw new Error(data.error);
          }

          const allFetchedTours = [];
          const seenIds = new Set();
          
          // Process only page 1 results
          const tours = data.products?.results || [];
          for (const tour of tours) {
            const tourId = tour.productId || tour.productCode;
            if (tourId && !seenIds.has(tourId)) {
              seenIds.add(tourId);
              allFetchedTours.push(tour);
            }
          }
          
          // Filter out popular tours
          const popularProductIds = new Set(popularTours.map(t => t.productId));
          const filtered = allFetchedTours.filter(tour => {
            const tourId = tour.productId || tour.productCode;
            return !popularProductIds.has(tourId);
          });
          
          setSearchResults(filtered);
          setSearchTotalCount(data.products?.totalCount || data.totalCount || 0);
          setSearchCurrentPage(1);
          setSearchHasMore((data.products?.totalCount || 0) > filtered.length);
        } catch (error) {
          console.error('Error searching tours:', error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      } else if (searchTerm.trim().length === 0) {
        // Clear search results when search is empty
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500); // Debounce: wait 500ms after user stops typing

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, destination.fullName, destination.name, popularTours]);

  const hasAutoTagFetchRun = useRef(false);
  useEffect(() => {
    if (!hasAutoTagFetchRun.current) {
      hasAutoTagFetchRun.current = true;
      return;
    }
    handleApplyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.tags, filters.specialOffersOnly]);


  const activeFilterEntries = Object.entries(activeFilters || {});
  const hasActiveFilters = activeFilterEntries.some(([_, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value && value !== '';
  }) || searchTerm;

  const activeFilterTypeCount = activeFilterEntries.reduce((count, [_, value]) => {
    if (Array.isArray(value)) {
      return count + (value.length > 0 ? 1 : 0);
    }
    return value && value !== '' ? count + 1 : count;
  }, 0);

  const heroCategories = (destination.tourCategories || [])
    .map((category) => category?.name)
    .filter(Boolean);
  const heroDescription =
    destination.seo?.description ||
    destination.heroDescription ||
    [
      destination.briefDescription,
      heroCategories.length
        ? `Plan ${heroCategories.slice(0, 3).join(', ')} and more local-only experiences with instant confirmation.`
        : 'Filter by style, price, and traveler type to build your perfect itinerary.',
    ]
      .filter(Boolean)
      .join(' ') ||
    `Discover the best tours and experiences in ${destinationName}.`;

  return (
    <>
      <NavigationNext />
      
      <div className="min-h-screen pt-16 overflow-x-hidden" suppressHydrationWarning>
        {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden ocean-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-blue-200 mr-2" />
              <span className="text-white font-medium">{destination.category || destination.region}</span>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold text-white">
                Top Tours & Activities in {destinationName}
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
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              {heroDescription}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="glass-effect rounded-2xl p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder={`Search tours in ${destinationName}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-white/90 border-0 text-gray-800 placeholder:text-gray-500"
                  />
                </div>
              </div>
              {/* Find tours in other destinations link */}
              <div className="mt-3 text-center">
                <Link 
                  href="/tours" 
                  className="text-white/80 hover:text-white text-sm transition-colors"
                >
                  Looking for tours in other destinations?
                </Link>
              </div>
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
            <Link href="/destinations" className="text-gray-500 hover:text-gray-700">Destinations</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/destinations/${destination.id}`} className="text-gray-500 hover:text-gray-700">
              {destination.fullName || destination.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Tours</span>
          </nav>
        </div>
      </section>

      {/* Promoted Listings Section - Above Filters */}
      {((promotedTours && promotedTours.length > 0) || (promotedRestaurants && promotedRestaurants.length > 0)) && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Promoted Listings in {destination.fullName || destination.name}</h2>
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                Partner
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Featured tours and restaurants from our partner operators.
            </p>

            {/* Promoted Tours */}
            {promotedTours && promotedTours.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Promoted Tours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promotedTours.slice(0, 6).map((tour, index) => {
                    const productId = getTourProductId(tour) || tour.product_id || tour.productId || tour.productCode;
                    if (!productId) return null;
                    
                    // Try multiple product ID formats to find match score
                    const matchScore = matchScores[productId] || 
                                      matchScores[tour.productId] || 
                                      matchScores[tour.productCode] || 
                                      matchScores[tour.product_id] ||
                                      null;
                    
                    return (
                      <TourCard
                        key={productId || index}
                        tour={tour}
                        destination={destination}
                        matchScore={matchScore}
                        user={user}
                        userPreferences={userPreferences}
                        onOpenPreferences={() => setShowPreferencesModal(true)}
                        isFeatured={false}
                        premiumOperatorTourIds={premiumOperatorTourIds}
                        isPromoted={true}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Promoted Restaurants */}
            {promotedRestaurants && promotedRestaurants.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Promoted Restaurants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promotedRestaurants.slice(0, 6).map((restaurant, index) => {
                      const restaurantId = restaurant.id;
                      if (!restaurantId) return null;
                      
                      const restaurantUrl = restaurant.slug && destination.id
                        ? `/destinations/${destination.id}/restaurants/${restaurant.slug}`
                        : `/destinations/${destination.id}/restaurants`;
                      
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
                                {validCuisines.length > 0 && (
                                  <span className="inline-flex items-center text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">
                                    {validCuisines.slice(0, 2).join(' · ')}
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
                  </div>
                </div>
            )}
          </div>
        </section>
      )}

      {/* Filters and Price Range Section */}
      <section className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Price Range Slider - Always Visible */}
            <div className="flex-1 max-w-md w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="relative dual-range-slider">
                {/* Dual Range Slider Container */}
                <div className="relative h-2 bg-gray-200 rounded-lg">
                  {/* Active Range Track */}
                  <div
                    className="absolute h-2 bg-purple-600 rounded-lg"
                    style={{
                      left: `${((parseInt(filters.priceFrom || priceRange.min) - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                      width: `${((parseInt(filters.priceTo || priceRange.max) - parseInt(filters.priceFrom || priceRange.min)) / (priceRange.max - priceRange.min)) * 100}%`
                    }}
                  />
                  
                  {/* Min Range Input - Higher z-index so it's clickable */}
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={filters.priceFrom || priceRange.min}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value);
                      const currentMax = parseInt(filters.priceTo || priceRange.max);
                      if (newMin <= currentMax) {
                        setFilters({ ...filters, priceFrom: e.target.value });
                      }
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20"
                    style={{ pointerEvents: 'auto' }}
                  />
                  
                  {/* Max Range Input */}
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={filters.priceTo || priceRange.max}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      const currentMin = parseInt(filters.priceFrom || priceRange.min);
                      if (newMax >= currentMin) {
                        setFilters({ ...filters, priceTo: e.target.value });
                      }
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                    style={{ pointerEvents: 'auto' }}
                  />
                </div>
                
                {/* Price Display */}
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${filters.priceFrom || priceRange.min}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      ${filters.priceTo || priceRange.max}
                    </span>
                    <span className="text-xs text-gray-500">+</span>
                  </div>
                </div>
              </div>
              {/* Only show Apply Filters button if price range has changed */}
              {(filters.priceFrom || filters.priceTo) && (
                <div className="flex gap-2 mt-3">
                  <Button 
                    onClick={handleApplyFilters} 
                    size="sm"
                    className="sunset-gradient text-white"
                  >
                    Apply Filters
                  </Button>
                  <Button 
                    onClick={() => {
                      setFilters({ ...filters, priceFrom: '', priceTo: '' });
                    }} 
                    size="sm"
                    variant="outline"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
            
            {/* Filters Button */}
            <div className="flex items-end">
              <Button
                onClick={() => setShowFilterModal(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterTypeCount > 0 && (
                  <span className="ml-1 bg-purple-600 text-white rounded-full px-2 py-0.5 text-xs">
                    {activeFilterTypeCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tag Filters */}
      {destinationTagOptions.length > 0 && (
        <section className="bg-white border-b py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-[0.3em]">
                  Popular Tags
                </p>
                <h3 className="text-lg font-bold text-gray-900">
                  Curated themes travelers love in {destination.fullName || destination.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Tap a tag to instantly filter the grid — mix and match to narrow things down.
                </p>
              </div>
              <div className="relative -mx-4 px-4">
                <div
                  ref={tagScrollRef}
                  className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-1 pl-16"
                  onScroll={updateTagScrollIndicators}
                >
                  {destinationTagOptions.map((tag) => {
                    const isSelected = (activeFilters.tags || []).includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.id)}
                        className={`px-4 py-2 rounded-full border transition-all text-left snap-start whitespace-nowrap ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-700'
                        }`}
                      >
                        <span className="block text-sm font-semibold whitespace-nowrap">
                          {tag.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {tagScrollState.canScrollLeft && (
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white via-white/80 to-transparent" />
                )}
                {tagScrollState.canScrollRight && (
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent" />
                )}
                <button
                  type="button"
                  onClick={() => handleTagScroll('left')}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow border border-gray-200 items-center justify-center text-gray-600 hover:text-purple-600 transition-opacity ${
                    tagScrollState.canScrollLeft ? 'hidden sm:flex' : 'hidden md:flex'
                  }`}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => handleTagScroll('right')}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow border border-gray-200 items-center justify-center text-gray-600 hover:text-purple-600 transition-opacity ${
                    tagScrollState.canScrollRight ? 'hidden sm:flex' : 'hidden md:flex'
                  }`}
                >
                  ›
                </button>
              </div>
              {destinationTagOptions.length > 3 && (
                <div className="flex items-center gap-1 text-xs text-purple-600 sm:hidden">
                  <MoveHorizontal className="w-4 h-4" />
                  Swipe sideways to see more categories
                </div>
              )}
              <div className="mt-4">
                <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-semibold text-rose-600 uppercase tracking-[0.3em]">
                      Exclusive offers
                    </p>
                    <p className="text-sm text-gray-700">
                      See tours currently marked as limited-time deals across {destination.fullName || destination.name}.
                    </p>
                  </div>
                  <Button
                    onClick={handleSpecialOffersToggle}
                    className={`px-6 py-2 rounded-full font-semibold ${
                      filters.specialOffersOnly
                        ? 'bg-white text-rose-600 border border-rose-200'
                        : 'sunset-gradient text-white'
                    }`}
                    variant={filters.specialOffersOnly ? 'outline' : 'default'}
                  >
                    {filters.specialOffersOnly ? 'Showing deals – tap to reset' : 'See deals & discounts'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowFilterModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Tour Flags/Specials Filter */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Specials & Features
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableFlags.map((flag) => {
                    const isSelected = filters.flags?.includes(flag.value);
                    return (
                      <button
                        key={flag.value}
                        type="button"
                        onClick={() => handleFlagToggle(flag.value)}
                        className={`px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <span className="mr-2 text-lg">{flag.icon}</span>
                        {flag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time of Day Filter */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Time of Day
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {timeOfDayOptions.map((option) => {
                    const isSelected = filters.timeOfDay?.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleTimeOfDayToggle(option.value)}
                        className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border transition-all text-left ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 text-purple-700 shadow'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          {option.icon}
                          {option.label}
                        </div>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Duration
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {durationOptions.map((option) => {
                    const isSelected = filters.durationBucket === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleDurationSelect(option.value)}
                        className={`px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 text-purple-700 shadow'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setFilters({ ...filters, priceFrom: '', priceTo: '', flags: [], timeOfDay: [], durationBucket: '' });
                  setActiveFilters({ ...activeFilters, priceFrom: '', priceTo: '', flags: [], timeOfDay: [], durationBucket: '' });
                  setIsFiltered(false);
                  setFilteredToursFromAPI([]);
                  setFilteredTotalCount(0);
                }}
                variant="outline"
                size="lg"
              >
                Clear All
              </Button>
              <Button
                onClick={() => {
                  handleApplyFilters();
                  setShowFilterModal(false);
                }}
                size="lg"
                className="sunset-gradient text-white"
                disabled={
                  !(
                    filters.priceFrom ||
                    filters.priceTo ||
                    (filters.flags && filters.flags.length > 0) ||
                    (filters.timeOfDay && filters.timeOfDay.length > 0) ||
                    filters.durationBucket
                  )
                }
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <section className="bg-white border-b py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {activeFilters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {activeFilters.category}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setActiveFilters({ ...activeFilters, category: '' })} />
                </Badge>
              )}
              {(activeFilters.priceFrom || activeFilters.priceTo) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ${activeFilters.priceFrom || '0'} - ${activeFilters.priceTo || '∞'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => {
                    setActiveFilters({ ...activeFilters, priceFrom: '', priceTo: '' });
                    setFilters({ ...filters, priceFrom: '', priceTo: '' });
                  }} />
                </Badge>
              )}
              {activeFilters.durationBucket && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {durationOptions.find(opt => opt.value === activeFilters.durationBucket)?.label || 'Duration'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => {
                    setActiveFilters({ ...activeFilters, durationBucket: '' });
                    setFilters({ ...filters, durationBucket: '' });
                  }} />
                </Badge>
              )}
              {activeFilters.tags && activeFilters.tags.length > 0 && activeFilters.tags.map((tagId) => {
                const tagInfo = destinationTagOptions.find((tag) => tag.id === tagId);
                return (
                  <Badge key={`tag-${tagId}`} variant="secondary" className="flex items-center gap-1">
                    {tagInfo?.label || `Tag ${tagId}`}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => {
                        const newTags = activeFilters.tags.filter((id) => id !== tagId);
                        setActiveFilters({ ...activeFilters, tags: newTags });
                        setFilters({ ...filters, tags: newTags });
                      }}
                    />
                  </Badge>
                );
              })}
              {activeFilters.specialOffersOnly && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  💸 Special Offers
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => {
                      setActiveFilters({ ...activeFilters, specialOffersOnly: false });
                      setFilters({ ...filters, specialOffersOnly: false });
                    }}
                  />
                </Badge>
              )}
              {activeFilters.flags && activeFilters.flags.length > 0 && activeFilters.flags.map((flag) => {
                const flagInfo = availableFlags.find(f => f.value === flag);
                return flagInfo ? (
                  <Badge key={flag} variant="secondary" className="flex items-center gap-1">
                    {flagInfo.icon} {flagInfo.label}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => {
                      const newFlags = activeFilters.flags.filter(f => f !== flag);
                      setActiveFilters({ ...activeFilters, flags: newFlags });
                      setFilters({ ...filters, flags: newFlags });
                    }} />
                  </Badge>
                ) : null;
              })}
              {activeFilters.timeOfDay && activeFilters.timeOfDay.length > 0 && activeFilters.timeOfDay.map(slot => {
                const option = timeOfDayOptions.find(opt => opt.value === slot);
                return (
                  <Badge key={`tod-${slot}`} variant="secondary" className="flex items-center gap-1">
                    {option?.label || slot}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => {
                      const newValues = activeFilters.timeOfDay.filter(value => value !== slot);
                      setActiveFilters({ ...activeFilters, timeOfDay: newValues });
                      setFilters({ ...filters, timeOfDay: newValues });
                    }} />
                  </Badge>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sort and Results Count - Same Line */}
          <div className="mb-6 flex flex-col gap-4">
            {/* Results Count */}
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <p className="text-gray-600">
                  {isSearching ? 'Searching all tours...' : 'Loading filtered tours...'}
                </p>
              </div>
            ) : (
              <p className="text-gray-600" suppressHydrationWarning>
                Showing <span className="font-semibold text-gray-800">{filteredTours.length}</span>
                {!isSearching && !isFiltered && totalToursAvailable > 0 && (
                  <span> of {totalToursAvailable.toLocaleString()}+</span>
                )}
                {' tours'}
                {isSearching && ' (searched from all available tours)'}
                {isFiltered && !isSearching && filteredTotalCount > 0 && (
                  <span> (filtered from {filteredTotalCount.toLocaleString()}+ available tours)</span>
                )}
                {isFiltered && !isSearching && filteredTotalCount === 0 && totalToursAvailable > 0 && (
                  <span> (filtered from {totalToursAvailable.toLocaleString()}+ available tours)</span>
                )}
                {isFiltered && !isSearching && filteredTotalCount === 0 && totalToursAvailable === 0 && ' (filtered from all available tours)'}
                {!isSearching && !isFiltered && hasActiveFilters && ' matching your criteria'}
                {!isSearching && !isFiltered && !hasActiveFilters && totalToursAvailable > 0 && (
                  <span className="text-gray-500 text-sm ml-2">(Use search or filters to see more)</span>
                )}
              </p>
            )}
            
            {/* Sort and Match to Your Style - Same Line */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="best-match">Best Match {user ? '(for you)' : ''} ⭐</option>
                </select>
              </div>
              
              {/* Match to Your Style - Button to open modal */}
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-gray-900">
                  Match to Your Style
                </span>
                <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                  AI driven
                </span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-500">
              Tip: switch to <span className="font-semibold text-gray-700">Best Match</span> to rank tours by your travel style.
            </p>
          </div>


          {/* Featured Tours Section */}
          {featuredTours.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">Featured Tours</h2>
                <Badge variant="secondary" className="ml-2">Curated by TopTours.ai</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTours.map((tour, index) => {
                  const productId = tour.productId || tour.productCode;
                  const promotedProductIds = new Set(promotedTours.map(t => t.productId || t.productCode).filter(Boolean));
                  return (
                    <TourCard 
                      key={productId || index} 
                      tour={tour} 
                      isFeatured={true} 
                      destination={destination} 
                      promotionScores={promotionScores} 
                      effectiveDestinationId={effectiveDestinationId} 
                      premiumOperatorTourIds={premiumOperatorTourIds}
                      matchScore={matchScores[productId]}
                      user={user}
                      userPreferences={userPreferences}
                      onOpenPreferences={() => setShowPreferencesModal(true)}
                      isPromoted={productId && promotedProductIds.has(productId)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* More Tours Section */}
          {regularTours.length > 0 && (
            <div>
              {featuredTours.length > 0 && (
                <h2 className="text-2xl font-bold text-gray-900 mb-6">More Tours</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularTours.map((tour, index) => {
                  const productId = tour.productId || tour.productCode;
                  const promotedProductIds = new Set(promotedTours.map(t => t.productId || t.productCode).filter(Boolean));
                  return (
                    <TourCard 
                      key={productId || index} 
                      tour={tour} 
                      isFeatured={false} 
                      destination={destination} 
                      promotionScores={promotionScores} 
                      effectiveDestinationId={effectiveDestinationId} 
                      premiumOperatorTourIds={premiumOperatorTourIds}
                      matchScore={matchScores[productId]}
                      user={user}
                      userPreferences={userPreferences}
                      onOpenPreferences={() => setShowPreferencesModal(true)}
                      isPromoted={productId && promotedProductIds.has(productId)}
                    />
                  );
                })}
              </div>
              
              {/* Load More Button for Filtered Results */}
              {isFiltered && filteredHasMore && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleLoadMoreFiltered}
                    disabled={loadingMoreFiltered}
                    className="sunset-gradient text-white px-8 py-6 text-lg"
                    size="lg"
                  >
                    {loadingMoreFiltered ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading more tours...
                      </>
                    ) : (
                      `Load More Tours (${filteredTours.length} of ${filteredTotalCount > 0 ? filteredTotalCount.toLocaleString() : 'many'}+)`
                    )}
                  </Button>
                </div>
              )}

              {/* Load More Button for Regular Tours (non-filtered, non-searched) */}
              {!isFiltered && !isSearching && regularToursHasMore && regularTours.length > 0 && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleLoadMoreRegular}
                    disabled={loadingMoreRegular}
                    className="sunset-gradient text-white px-8 py-6 text-lg"
                    size="lg"
                  >
                    {loadingMoreRegular ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading more tours...
                      </>
                    ) : (
                      `Load More Tours (${regularTours.length + featuredTours.length} of ${totalToursAvailable > 0 ? totalToursAvailable.toLocaleString() : 'many'}+)`
                    )}
                  </Button>
                </div>
              )}

              {/* Load More Button for Search Results */}
              {isSearching && searchHasMore && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleLoadMoreSearch}
                    disabled={loadingMoreSearch}
                    className="sunset-gradient text-white px-8 py-6 text-lg"
                    size="lg"
                  >
                    {loadingMoreSearch ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading more results...
                      </>
                    ) : (
                      `Load More Results (${searchResults.length} of ${searchTotalCount > 0 ? searchTotalCount.toLocaleString() : 'many'}+)`
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {filteredTours.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No tours found matching your criteria.</p>
              {hasActiveFilters && (
                <Button onClick={handleClearFilters} variant="outline" className="mt-4">
                  Clear Filters
                </Button>
              )}
            </div>
          )}

        </div>
      </section>

      {/* Top Restaurants Section */}
      {hasRestaurants && (() => {
        // Use restaurants from server if available, otherwise fallback to static data
        const restaurantsToDisplay = restaurants.length > 0 
          ? restaurants.slice(0, 8)
          : getRestaurantsForDestination(destination.id).slice(0, 8);
        if (restaurantsToDisplay.length === 0) return null;
        
        return (
          <section className="py-12 bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Top Restaurants in {destination.fullName || destination.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Discover the best dining experiences and hand-picked restaurants.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurantsToDisplay.map((restaurant, index) => {
                      const restaurantUrl = `/destinations/${destination.id}/restaurants/${restaurant.slug}`;
                      const description = restaurant.metaDescription 
                        || restaurant.tagline 
                        || restaurant.summary 
                        || restaurant.description
                        || (restaurant.cuisines?.length > 0 
                            ? `Discover ${restaurant.cuisines.join(' & ')} cuisine at ${restaurant.name} in ${destination.fullName || destination.name}.`
                            : `Experience great dining at ${restaurant.name} in ${destination.fullName || destination.name}.`);
                      
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
                      transition={{ duration: 0.4, delay: 0.8 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={`/destinations/${destination.id}/restaurants`}
                        className="block h-full"
                      >
                        <Card className="h-full border border-blue-100 bg-white shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center p-6">
                          <UtensilsCrossed className="w-8 h-8 text-blue-600 mb-3" />
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            View All Restaurants in {destination.fullName || destination.name}
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
              </div>
            </div>
          </section>
        );
      })()}

      {/* Internal Linking Section */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back to Destination Page - Only show if destination has a guide */}
          {hasDestinationGuide && (
            <div className="mb-6">
              <Link href={`/destinations/${destination.id}`}>
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {destination.fullName || destination.name} Guide
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
            </div>
          )}

          {/* Other Destinations in Country - Show for all destinations to increase internal linking */}
          {destination.country && otherDestinationsInCountry.length > 0 && (
            <div className="mb-6">
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                        Top Tours in Other {destination.country || destination.fullName || destination.name} Destinations
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">
                        Explore top-rated tours and activities in other amazing destinations across {destination.country || destination.fullName || destination.name}.
                      </p>
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-3">
                        {otherDestinationsInCountry.slice(0, showMoreDestinations).map((otherDest) => (
                          <Link key={otherDest.id} href={`/destinations/${otherDest.id}/tours`}>
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
                        {otherDestinationsInCountry.length > showMoreDestinations && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMoreDestinations(otherDestinationsInCountry.length)}
                            className="text-purple-700 hover:text-purple-800 hover:bg-purple-50 text-xs"
                          >
                            View All ({otherDestinationsInCountry.length} destinations)
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                        {showMoreDestinations > 12 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMoreDestinations(12)}
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

          {/* Tour Operators */}
          <div className="mb-6">
            <Link href={`/destinations/${destination.id}/operators`}>
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Tour Operators in {destination.fullName || destination.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Browse trusted tour operators offering experiences in {destination.fullName || destination.name}.
                      </p>
                      <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                        View Operators
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Top Restaurants */}
          {hasRestaurants && (
            <div className="mb-6">
              <Link href={`/destinations/${destination.id}/restaurants`}>
                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <UtensilsCrossed className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Top Restaurants in {destination.fullName || destination.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Discover the best dining experiences and hand-picked restaurants.
                        </p>
                        <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                          View Restaurants
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}

          {/* Travel Guides */}
          {guides.length > 0 && (
            <div>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {destination.country || destination.fullName || destination.name} Travel Guides
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Read comprehensive guides to plan your perfect trip.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {guides.slice(0, 3).map((guide) => (
                          <Link key={guide.id} href={`/travel-guides/${guide.id}`}>
                            <Badge variant="secondary" className="hover:bg-blue-100 cursor-pointer">
                              {guide.title}
                            </Badge>
                          </Link>
                        ))}
                        {guides.length > 3 && (
                          <Badge variant="secondary" className="bg-blue-100">
                            +{guides.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <Link href={hasDestinationGuide ? `/destinations/${destination.id}` : '/travel-guides'}>
                        <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                          {hasDestinationGuide ? 'View All Guides' : 'Browse All Travel Guides'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </section>
      </div>

      {/* Related Travel Guides Section - Same style as restaurant page */}
      {categoryGuides && Array.isArray(categoryGuides) && categoryGuides.length > 0 && (
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
                  Related Travel Guides for {destination.fullName || destination.name}
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
                  const guideUrl = `/destinations/${destination.id}/guides/${categorySlug}`;
                  
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
                                ? `Discover the best ${categoryName.toLowerCase()} experiences in ${destination.fullName || destination.name}.`
                                : `Explore ${categoryName.toLowerCase()} in ${destination.fullName || destination.name}.`
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
                    View All {destination.fullName || destination.name} Guides
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <FooterNext />
      

      {/* Match to Your Style Modal */}
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
                    onClick={handleSavePreferencesToProfile}
                    disabled={savingPreferencesToProfile || loadingPreferences}
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

      {/* Parent Country Modal - Shows after 5 seconds for small destinations */}
      {showParentCountryModal && destination.parentCountryDestination && (
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
                <span className="font-semibold text-gray-900">{destination.fullName || destination.name}</span> is part of{' '}
                <span className="font-semibold text-blue-600">{destination.parentCountryDestination.fullName}</span>.
              </p>
              <p className="text-gray-600 mt-2 text-sm">
                View all tours and activities available across {destination.parentCountryDestination.fullName} for the best selection.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1 sunset-gradient text-white hover:scale-105 transition-transform duration-200 font-semibold"
              >
                <Link href={`/destinations/${destination.parentCountryDestination.id}/tours`}>
                  View All Tours in {destination.parentCountryDestination.fullName}
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
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={`Top Tours and Activities in ${destinationName} - TopTours.ai`}
      />
      
      <RestaurantMatchModal
        isOpen={showRestaurantMatchModal}
        onClose={() => setShowRestaurantMatchModal(false)}
        restaurant={selectedRestaurant}
        matchData={selectedRestaurant ? restaurantMatchById.get(selectedRestaurant.id) : null}
        preferences={localRestaurantPreferences}
        onOpenPreferences={() => {
          setShowRestaurantMatchModal(false);
          // Note: You may want to add a restaurant preferences modal here
        }}
      />
    </>
  );
}


