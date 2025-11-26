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
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Link from 'next/link';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Heart, Trophy } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { getTourUrl, getTourProductId } from '@/utils/tourHelpers';
import { getGuidesByCountry } from '@/data/travelGuidesData';
import { getRestaurantsForDestination } from '../restaurants/restaurantsData';
import { getDestinationById, getDestinationsByCountry } from '@/data/destinationsData';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import TourPromotionCard from '@/components/promotion/TourPromotionCard';
import RestaurantPromotionCard from '@/components/promotion/RestaurantPromotionCard';
import { hasDestinationPage } from '@/data/destinationFullContent';
import PromotionExplainerModal from '@/components/auth/PromotionExplainerModal';
import ShareModal from '@/components/sharing/ShareModal';

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

const buildFallbackTagOptions = (destination) => {
  const destinationName = destination.fullName || destination.name;
  const categories = (destination.tourCategories || []).slice(0, 6);
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
  trendingTours = [], // Tours with highest past_28_days_score for this destination
  trendingRestaurants = [], // Restaurants with highest past_28_days_score for this destination
  restaurantPromotionScores = {} // Map of restaurantId -> score object
}) {
  // CRITICAL: Use destination.destinationId if available (from classified data), otherwise fall back to prop
  const effectiveDestinationId = destination.destinationId || destination.viatorDestinationId || viatorDestinationId;
  
  // Debug: Log totalToursAvailable to see what we're receiving
  console.log('🔍 ToursListingClient - totalToursAvailable prop:', totalToursAvailable, 'type:', typeof totalToursAvailable);
  
  if (!effectiveDestinationId) {
    console.warn('⚠️ No Viator destination ID found for', destination.fullName || destination.name, '- tours may show incorrectly');
  } else {
    console.log('✅ Using Viator Destination ID for tours page:', effectiveDestinationId, 'for', destination.fullName || destination.name);
  }
  
  // Get guides and restaurants for internal linking
  const guides = getGuidesByCountry(destination.country) || [];
  const restaurants = getRestaurantsForDestination(destination.id);
  const hasRestaurants = restaurants.length > 0;
  
  // Check if destination has a guide (not a Viator destination without guide)
  const destinationWithGuide = getDestinationById(destination.id);
  const hasDestinationGuide = destinationWithGuide && !isViatorDestination;
  
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
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'reviews', 'price-low', 'price-high'
  const [showMoreDestinations, setShowMoreDestinations] = useState(12); // Show 12 initially (2 rows of 6)
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
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
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
  const [moreDynamicTours, setMoreDynamicTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Combine all tours for filtering (deduplicate by productId)
  // Priority: Search results > Filtered results > Initial tours
  const allTours = useMemo(() => {
    // If we have search results, use those (searched from all Viator tours)
    if (isSearching && searchResults.length > 0) {
      // Still include popular tours if they match the search
      const popularWithPricing = popularTours.map(tour => ({
        ...tour,
        isFeatured: true,
      }));
      
      // Combine search results with popular tours that match
      const combined = [...popularWithPricing, ...searchResults];
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
      // Still include popular tours if they match the filter
      const includeFeaturedPopular = !activeFilters.specialOffersOnly;
      const popularWithPricing = includeFeaturedPopular
        ? popularTours.map(tour => ({
            ...tour,
            isFeatured: true,
          }))
        : [];
      
      // Combine filtered API results with popular tours that match
      const combined = [...popularWithPricing, ...filteredToursFromAPI];
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
    
    // Default: use initial tours (popular + dynamic)
    const popularWithPricing = popularTours.map(tour => ({
      ...tour,
      isFeatured: true,
    }));

    // Combine all tours and deduplicate by productId/productCode
    const combined = [...popularWithPricing, ...dynamicTours, ...moreDynamicTours];
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
  }, [popularTours, dynamicTours, moreDynamicTours, filteredToursFromAPI, isFiltered, searchResults, isSearching]);

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
        // Debug: Log if we're filtering out the specific tour
        if (!hasFlag && (tour.productId === '324189P1' || tour.productCode === '324189P1')) {
          console.log('Filtering out tour 324189P1 in useMemo - flags:', tourFlags, 'requested:', activeFilters.flags);
        }
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

    // Sort: Featured first, then by selected sort option
    filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      
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
      }
      
      return 0;
    });

    return filtered;
  }, [allTours, searchTerm, activeFilters, sortBy, isFiltered]);

  // Separate featured and regular tours
  const featuredTours = filteredTours.filter(t => t.isFeatured);
  const regularTours = filteredTours.filter(t => !t.isFeatured);

  const destinationTagOptions = (() => {
    const customTags = DESTINATION_TAG_OPTIONS[destination.id];
    if (customTags && customTags.length) return customTags;
    return buildFallbackTagOptions(destination);
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
            count: 100,
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
          console.log('🔍 Special offers totalCount:', totalCount, 'Response:', data);
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
          
          // Fetch multiple pages to get more results
          // When filtering by flags, fetch more pages since flags might be sparse
          const toursPerPage = 20;
          const pagesNeeded = (hasFlagFilter || hasTagFilter || hasSpecialOffersFilter) ? 10 : 5; // 10 pages = 200 tours when filtering by flags/tags/specials
          
          const allToursPromises = [];
          for (let page = 1; page <= pagesNeeded; page++) {
            allToursPromises.push(
              fetch('/api/internal/viator-search', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ...requestBody,
                  page: page
                })
              }).then(async (res) => {
                if (res.ok) {
                  return res.json();
                } else if (res.status === 404) {
                  // Page doesn't exist, return empty results
                  console.log(`Page ${page} returned 404 - no more results`);
                  return { products: { results: [] } };
                } else {
                  // Other error, log and return empty
                  const errorText = await res.text();
                  console.error(`Page ${page} error (${res.status}):`, errorText);
                  return { products: { results: [] } };
                }
              }).catch(error => {
                console.error(`Page ${page} fetch error:`, error);
                return { products: { results: [] } };
              })
            );
          }
          
          const allResponses = await Promise.all(allToursPromises);
          const allFetchedTours = [];
          const seenIds = new Set();
          let totalCountFromAPI = 0;
          
          // Extract totalCount from the first response (all pages should have the same totalCount)
          if (allResponses.length > 0 && allResponses[0] && !allResponses[0].error) {
            totalCountFromAPI = allResponses[0].products?.totalCount || allResponses[0].totalCount || 0;
            console.log('🔍 Filtered totalCount from API:', totalCountFromAPI, 'Response structure:', {
              hasProducts: !!allResponses[0].products,
              productsTotalCount: allResponses[0].products?.totalCount,
              directTotalCount: allResponses[0].totalCount,
              firstResponse: allResponses[0]
            });
          }
          
          for (const data of allResponses) {
            if (data && !data.error) {
              const tours = data.products?.results || [];
              for (const tour of tours) {
                const tourId = tour.productId || tour.productCode;
                if (tourId && !seenIds.has(tourId)) {
                  seenIds.add(tourId);
                  // Always add the tour - we'll filter by flags in the useMemo
                  allFetchedTours.push(tour);
                }
              }
            }
          }
          
          // Filter out popular tours
          const popularProductIds = new Set(popularTours.map(t => t.productId));
          const filtered = allFetchedTours.filter(tour => {
            const tourId = tour.productId || tour.productCode;
            return !popularProductIds.has(tourId);
          });
          
          console.log(`Fetched ${filtered.length} tours, will filter by flags client-side. Total available: ${totalCountFromAPI}`);
          setFilteredToursFromAPI(filtered);
          setFilteredTotalCount(totalCountFromAPI);
          setFilteredCurrentPage(pagesNeeded); // Track how many pages we've loaded
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
      
      // Check if there are more tours (if we got fewer than 20, we're probably at the end)
      setFilteredHasMore(newTours.length >= 20);
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
          
          // Fetch multiple pages to get more results
          const toursPerPage = 20;
          const pagesNeeded = 5; // 5 pages = 100 tours
          
          const allToursPromises = [];
          for (let page = 1; page <= pagesNeeded; page++) {
            allToursPromises.push(
              fetch('/api/internal/viator-search', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  // When searching with a term, still include destination ID filter for accuracy
                  searchTerm: searchQuery,
                  page: page,
                  viatorDestinationId: effectiveDestinationId ? String(effectiveDestinationId) : null,
                  includeDestination: !!effectiveDestinationId // Use destination ID filter when available
                })
              }).then(res => res.ok ? res.json() : null)
            );
          }
          
          const allResponses = await Promise.all(allToursPromises);
          const allFetchedTours = [];
          const seenIds = new Set();
          
          for (const data of allResponses) {
            if (data && !data.error) {
              const tours = data.products?.results || [];
              for (const tour of tours) {
                const tourId = tour.productId || tour.productCode;
                if (tourId && !seenIds.has(tourId)) {
                  seenIds.add(tourId);
                  allFetchedTours.push(tour);
                }
              }
            }
          }
          
          // Filter out popular tours
          const popularProductIds = new Set(popularTours.map(t => t.productId));
          const filtered = allFetchedTours.filter(tour => {
            const tourId = tour.productId || tour.productCode;
            return !popularProductIds.has(tourId);
          });
          
          setSearchResults(filtered);
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

  const destinationName = destination.fullName || destination.name;
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
          {/* Trending Now Section - Past 28 Days (Combined Tours & Restaurants) */}
          {((trendingTours && trendingTours.length > 0) || (trendingRestaurants && trendingRestaurants.length > 0)) && (
            <section className="py-12 bg-white mb-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Trending Now in {destination.fullName || destination.name}</h2>
                  <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700 border-orange-300">
                    Past 28 Days
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <p className="text-sm text-gray-600">
                    Tours and restaurants that are currently popular based on recent community boosts
                  </p>
                  <button
                    onClick={() => setIsPromotionModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
                    title="Learn how promotions work"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Learn more</span>
                  </button>
                </div>

                {/* Trending Tours Subsection */}
                {trendingTours && trendingTours.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Trending Tours Now in {destination.fullName || destination.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trendingTours.slice(0, 3).map((trending, index) => {
                        if (!trending || !trending.product_id) return null;
                        
                        const tourId = trending.product_id;
                        let tourUrl = `/tours/${tourId}`;
                        try {
                          if (trending.tour_slug) {
                            tourUrl = `/tours/${tourId}/${trending.tour_slug}`;
                          } else if (trending.tour_name) {
                            tourUrl = getTourUrl(tourId, trending.tour_name);
                          }
                        } catch (error) {
                          console.error('Error generating tour URL:', error);
                        }
                        
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
                                      alt={trending.tour_name}
                                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                      <Search className="w-6 h-6 text-gray-400" />
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
                                    {trending.tour_name}
                                  </h3>
                                </Link>

                                {/* Promotion Score */}
                                {tourId && (
                                  <div className="mb-3">
                                    <TourPromotionCard 
                                      productId={tourId} 
                                      compact={true}
                                      initialScore={promotionScores[tourId] || {
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
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Trending Restaurants Now in {destination.fullName || destination.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trendingRestaurants.slice(0, 3).map((trending, index) => {
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
                            <Card className="bg-white border-0 shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                              <Link href={restaurantUrl}>
                                <div className="relative h-48 overflow-hidden">
                                  {trending.restaurant_image_url ? (
                                    <img
                                      src={trending.restaurant_image_url}
                                      alt={trending.restaurant_name || 'Restaurant'}
                                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                      onError={(e) => {
                                        e.target.src = destination.imageUrl || '/placeholder-restaurant.jpg';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                      <UtensilsCrossed className="w-6 h-6 text-gray-400" />
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
                                <Link href={restaurantUrl}>
                                  <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
                                    {trending.restaurant_name || `Restaurant #${restaurantId}`}
                                  </h3>
                                </Link>

                                {/* Promotion Score */}
                                {restaurantId && (
                                  <div className="mb-3">
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

                                <Button
                                  asChild
                                  className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 mt-auto"
                                >
                                  <Link href={restaurantUrl}>
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
              </div>
            </section>
          )}

          {/* Sort and Results Count - Same Line */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
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
              </select>
            </div>
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
                {featuredTours.map((tour, index) => (
                  <TourCard key={tour.productId || index} tour={tour} isFeatured={true} destination={destination} promotionScores={promotionScores} effectiveDestinationId={effectiveDestinationId} />
                ))}
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
                {regularTours.map((tour, index) => (
                  <TourCard key={tour.productId || tour.productCode || index} tour={tour} isFeatured={false} destination={destination} promotionScores={promotionScores} effectiveDestinationId={effectiveDestinationId} />
                ))}
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

      <FooterNext />
      
      <PromotionExplainerModal 
        isOpen={isPromotionModalOpen} 
        onClose={() => setIsPromotionModalOpen(false)}
      />

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
        title={`Top Tours & Activities in ${destinationName} - TopTours.ai`}
      />
    </>
  );
}

// Tour Card Component
function TourCard({ tour, isFeatured, destination, promotionScores = {}, effectiveDestinationId = null }) {
  const productId = tour.productId || tour.productCode;
  const tourUrl = tour.slug 
    ? `/tours/${productId}/${tour.slug}` 
    : getTourUrl(productId, tour.seo?.title || tour.title);
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();
  const isSaved = isBookmarked(productId);
  
  const image = tour.images?.[0]?.variants?.[3]?.url || 
                tour.images?.[0]?.variants?.[0]?.url || 
                destination?.imageUrl || '';
  const rating = tour.reviews?.combinedAverageRating || 0;
  const reviewCount = tour.reviews?.totalReviews || 0;
  const price = tour.pricing?.summary?.fromPrice || tour.price || 0;
  const originalPrice = tour.pricing?.summary?.fromPriceBeforeDiscount || null;
  const hasDiscount = originalPrice && originalPrice > price;
  const title = tour.seo?.title || tour.title || 'Tour';
  const description = tour.seo?.description || tour.content?.heroDescription || tour.description || '';
  
  // Get flags from tour
  // Flags can be in different locations: tour.flags, tour.specialFlags, etc.
  const flags = tour.flags || tour.specialFlags || [];
  const displayFlags = flags.filter((flag) => flag !== 'SPECIAL_OFFER');
  
  // Debug: Log flags to console (remove after testing)
  // Log even if no flags to see what's happening
  if (typeof window !== 'undefined') {
    const productId = tour.productId || tour.productCode;
    if (productId === '324189P1' || productId === 'd28-324189P1') {
      console.log('DEBUG Tour 324189P1:', {
        productId,
        title,
        flags,
        hasFlags: flags.length > 0,
        tourObjectFlags: tour.flags,
        fullTour: tour
      });
    }
    if (flags.length > 0) {
      console.log('Tour flags for', title, ':', flags, 'Product ID:', productId);
    }
  }
  
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
            {/* price badge stays on right; no save here to avoid overlap */}
            {hasDiscount && (
              <div className="absolute top-3 left-3 z-20">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-rose-600 text-white rounded-full shadow">
                  <span>💸</span> Special Offer
                </span>
              </div>
            )}
            {isFeatured && (
              <Badge className="absolute top-3 left-3 adventure-gradient text-white z-20">
                <Crown className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {price > 0 && (
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 z-20">
                <div className="flex flex-col items-end" suppressHydrationWarning>
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
        
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link href={tourUrl} className="flex-1">
              <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 hover:text-purple-600 transition-colors">
                {title}
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
                  <span className="font-medium text-gray-700 ml-1 text-sm" suppressHydrationWarning>
                    {typeof rating === 'number' ? rating.toFixed(1) : rating}
                  </span>
                  <span className="text-gray-500 text-xs ml-1" suppressHydrationWarning>
                    ({typeof reviewCount === 'number' ? reviewCount.toLocaleString('en-US') : reviewCount})
                  </span>
                </div>
              )}
            </div>
            {(() => {
              const durationMinutes = getTourDurationMinutes(tour);
              if (!durationMinutes) return null;
              return (
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatDurationLabel(durationMinutes)}</span>
                </div>
              );
            })()}
          </div>

          {/* Promotion Score - On its own line */}
          <div className="mb-3">
            <TourPromotionCard 
              productId={productId} 
              compact={true}
              tourData={tour} // Pass tour data so we don't need to fetch from Viator!
              destinationId={effectiveDestinationId || destination?.destinationId || destination?.id}
              initialScore={promotionScores[productId] || {
                product_id: productId,
                total_score: 0,
                monthly_score: 0,
                weekly_score: 0,
                past_28_days_score: 0,
              }}
            />
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
    </motion.div>
  );
}

