"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import TourCard from '@/components/tour/TourCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, ArrowLeft, UtensilsCrossed, Sparkles, Settings, Star, X, Loader2, BookOpen, Car, Calendar, ExternalLink, Clock, ChevronDown, Mail, Users, Check, Shield, Zap } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { calculateEnhancedMatchScore } from '@/lib/tourMatchingEnhanced';
import { calculateTourProfile, getUserPreferenceScores } from '@/lib/tourMatching';
import { resolveUserPreferences } from '@/lib/preferenceResolution';
import { extractRestaurantStructuredValues, calculateRestaurantPreferenceMatch } from '@/lib/restaurantMatching';
import RestaurantMatchModal from '@/components/restaurant/RestaurantMatchModal';
import { destinations, getDestinationById } from '@/data/destinationsData';
import { useToast } from '@/components/ui/use-toast';
import { useCallback } from 'react';
import { getTourProductId } from '@/utils/tourHelpers';

export default function MatchYourStyleClient() {
  const router = useRouter();
  const pathname = usePathname();
  const [destination, setDestination] = useState('');
  const [destinationData, setDestinationData] = useState(null);
  const [searchedDestinationId, setSearchedDestinationId] = useState(null); // Track which destination results are for
  const [searchType, setSearchType] = useState('tours'); // 'tours', 'restaurants', 'both'
  const [userPreferences, setUserPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [promotedTours, setPromotedTours] = useState([]); // Full tour data for promoted tours
  const [promotedRestaurants, setPromotedRestaurants] = useState([]); // Promoted restaurants
  const [promotedToursMatchScores, setPromotedToursMatchScores] = useState({}); // Match scores for promoted tours
  const [hasRestaurants, setHasRestaurants] = useState(false);
  const [checkingRestaurants, setCheckingRestaurants] = useState(false);
  const [showAllTours, setShowAllTours] = useState(false);
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [savingPreferencesToProfile, setSavingPreferencesToProfile] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [categoryGuides, setCategoryGuides] = useState([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantMatchModal, setShowRestaurantMatchModal] = useState(false);

  // Get Tour Recommendations: choice view ('choice' | 'ai' | 'personal') — synced to URL for shareable links
  const [viewMode, setViewMode] = useState('choice');
  useEffect(() => {
    if (!pathname) return;
    if (pathname.endsWith('/ai-match')) setViewMode('ai');
    else if (pathname.endsWith('/personal-match')) setViewMode('personal');
    else setViewMode('choice');
  }, [pathname]);
  // Personal Match form
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalTravelDates, setPersonalTravelDates] = useState(''); // notes e.g. "Flexible in April"
  const [personalTravelStartDate, setPersonalTravelStartDate] = useState('');
  const [personalTravelEndDate, setPersonalTravelEndDate] = useState('');
  const [personalName, setPersonalName] = useState('');
  const [personalDestination, setPersonalDestination] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [personalSubmitting, setPersonalSubmitting] = useState(false);
  const [personalSubmitted, setPersonalSubmitted] = useState(false);
  const [personalGroupSize, setPersonalGroupSize] = useState('');
  const [personalPrimaryGoal, setPersonalPrimaryGoal] = useState('');
  const [personalTermsAccepted, setPersonalTermsAccepted] = useState(false);

  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();
  
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
  
  // Restaurant preferences (separate from tour preferences)
  const [localRestaurantPreferences, setLocalRestaurantPreferences] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('topTours_restaurant_preferences');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading localStorage restaurant preferences:', e);
    }
    // Default restaurant preferences
    return {
      atmosphere: 'any',
      diningStyle: 50,
      features: [],
      priceRange: 'any',
      mealTime: 'any',
      groupSize: 'any',
    };
  });
  
  // Save restaurant preferences to localStorage
  useEffect(() => {
    if (localRestaurantPreferences && typeof window !== 'undefined') {
      try {
        localStorage.setItem('topTours_restaurant_preferences', JSON.stringify(localRestaurantPreferences));
      } catch (e) {
        console.error('Error saving localStorage restaurant preferences:', e);
      }
    }
  }, [localRestaurantPreferences]);
  
  const [preferencesTab, setPreferencesTab] = useState('tours'); // 'tours' or 'restaurants'
  
  // Save to localStorage when preferences change
  useEffect(() => {
    if (localPreferences && typeof window !== 'undefined') {
      try {
        localStorage.setItem('topTours_preferences', JSON.stringify(localPreferences));
        // Update userPreferences to use localPreferences for matching
        setUserPreferences(localPreferences);
      } catch (e) {
        console.error('Error saving localStorage preferences:', e);
      }
    }
  }, [localPreferences]);

  // Auto-open preferences modal if no preferences are set (first-time users)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if user has seen the preferences modal before
    const hasSeenModal = localStorage.getItem('topTours_preferences_modal_seen') === 'true';
    const hasPreferences = (userPreferences && Object.keys(userPreferences).length > 0) || 
                          (localPreferences && Object.keys(localPreferences).length > 0);
    
    // Auto-open if no preferences and haven't seen modal before
    if (!hasPreferences && !hasSeenModal) {
      // Small delay to let page render first
      const timer = setTimeout(() => {
        setShowPreferencesModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userPreferences, localPreferences]);

  // Load user preferences from profile
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('trip_preferences')
            .eq('id', user.id)
            .single();
          
          if (profile?.trip_preferences) {
            // Merge with local preferences (local takes precedence for immediate updates)
            const merged = { ...profile.trip_preferences, ...localPreferences };
            setUserPreferences(merged);
          } else if (localPreferences) {
            setUserPreferences(localPreferences);
          }
        } else if (localPreferences) {
          setUserPreferences(localPreferences);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        if (localPreferences) {
          setUserPreferences(localPreferences);
        }
      }
    };
    
    loadPreferences();
  }, [supabase, localPreferences]);
  
  const handleSavePreferencesToProfile = useCallback(async () => {
    if (!localPreferences) return;

    const { data: { user } } = await supabase.auth.getUser();

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
      // Mark modal as seen when preferences are saved
      if (typeof window !== 'undefined') {
        localStorage.setItem('topTours_preferences_modal_seen', 'true');
      }
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
  }, [localPreferences, userPreferences, supabase, router, toast]);

  // Load destinations from database
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        // Get all destinations from our database (viator_destinations table)
        const response = await fetch('/api/internal/get-viator-destinations');
        if (response.ok) {
          const data = await response.json();
          setDestinationOptions(data.destinations || []);
        } else {
          // Fallback to hardcoded destinations
          setDestinationOptions(destinations.map(d => ({
            id: d.id,
            name: d.name,
            fullName: d.fullName || d.name,
            slug: d.id
          })));
        }
      } catch (error) {
        console.error('Error loading destinations:', error);
        // Fallback to hardcoded destinations
        setDestinationOptions(destinations.map(d => ({
          id: d.id,
          name: d.name,
          fullName: d.fullName || d.name,
          slug: d.id
        })));
      }
    };
    
    loadDestinations();
  }, []);

  // Check if destination has restaurants (quick check)
  useEffect(() => {
    const checkRestaurants = async () => {
      if (!destinationData?.id) {
        setHasRestaurants(false);
        setCheckingRestaurants(false);
        return;
      }

      setCheckingRestaurants(true);
      try {
        // Quick check: just see if any restaurants exist for this destination
        const response = await fetch(`/api/internal/restaurant-exists?destinationId=${encodeURIComponent(destinationData.id)}`);
        if (response.ok) {
          const data = await response.json();
          setHasRestaurants(data.hasRestaurants || false);
        } else {
          setHasRestaurants(false);
        }
      } catch (error) {
        console.error('Error checking restaurants:', error);
        setHasRestaurants(false);
      } finally {
        setCheckingRestaurants(false);
      }
    };

    checkRestaurants();
  }, [destinationData]);

  // Fetch category guides when destination is selected
  useEffect(() => {
    const fetchGuides = async () => {
      if (!destinationData?.id) {
        setCategoryGuides([]);
        return;
      }

      setLoadingGuides(true);
      try {
        const response = await fetch(`/api/internal/category-guides?destinationId=${encodeURIComponent(destinationData.id)}`);
        if (response.ok) {
          const data = await response.json();
          setCategoryGuides(data.guides || []);
        } else {
          setCategoryGuides([]);
        }
      } catch (error) {
        console.error('Error fetching category guides:', error);
        setCategoryGuides([]);
      } finally {
        setLoadingGuides(false);
      }
    };

    fetchGuides();
  }, [destinationData]);
  
  // Calculate match scores for promoted tours
  useEffect(() => {
    if (!promotedTours || promotedTours.length === 0) {
      setPromotedToursMatchScores({});
      return;
    }
    
    const calculateScores = async () => {
      // Pass raw preferences - calculateEnhancedMatchScore converts them internally
      const rawPreferences = userPreferences || localPreferences || null;
      const scores = {};
      
      // Calculate scores for promoted tours (async)
      const promotedPromises = promotedTours
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
      
      setPromotedToursMatchScores(scores);
    };
    
    calculateScores();
  }, [promotedTours, userPreferences, localPreferences]);

  const handleDestinationSelect = async (dest) => {
    // dest can be either a string (name) or an object (full destination)
    const destName = typeof dest === 'string' ? dest : dest.name;
    const destId = typeof dest === 'object' ? (dest.id || dest.slug || dest.destination_id) : null;
    
    setDestination(destName);
    setShowDestinationDropdown(false);
    
    // Reset search type to tours when destination changes
    setSearchType('tours');
    
    // Clear previous results when destination changes
    setTours([]);
    setRestaurants([]);
    setSearchedDestinationId(null);
    setShowAllTours(false);
    setShowAllRestaurants(false);
    
    // CRITICAL: Check hardcoded destinations FIRST (same as /destinations/[id] page)
    // This ensures we get the correct destination with all content fields
    let hardcodedDest = null;
    if (destId) {
      // Try by ID/slug first
      hardcodedDest = getDestinationById(destId);
    }
    if (!hardcodedDest) {
      // Try by name
      hardcodedDest = destinations.find(d => 
        d.name.toLowerCase() === destName.toLowerCase() ||
        d.fullName?.toLowerCase() === destName.toLowerCase()
      );
    }
    
    if (hardcodedDest) {
      // Get Viator destination ID from API (client-safe)
      let viatorDestinationId = hardcodedDest.destinationId || null;
      
      // If no destinationId in hardcoded data, look it up via API
      if (!viatorDestinationId) {
        try {
          const response = await fetch(`/api/internal/destination-lookup?slug=${encodeURIComponent(hardcodedDest.id)}`);
          if (response.ok) {
            const destData = await response.json();
            viatorDestinationId = destData.destinationId || null;
          }
        } catch (error) {
          console.warn('Could not lookup Viator destination ID for', hardcodedDest.id, error);
        }
      }
      
      // Use hardcoded destination directly (same as destinations page)
      setDestinationData({
        id: hardcodedDest.id, // This is the slug (e.g., "bali") - matches restaurant destination_id
        name: hardcodedDest.name,
        fullName: hardcodedDest.fullName || hardcodedDest.name,
        destinationId: viatorDestinationId, // Numeric ID for Viator API (looked up from API)
        slug: hardcodedDest.id, // Explicit slug
        // Include full destination info from hardcoded data
        category: hardcodedDest.category,
        country: hardcodedDest.country,
        heroDescription: hardcodedDest.heroDescription,
        briefDescription: hardcodedDest.briefDescription,
        whyVisit: hardcodedDest.whyVisit,
        highlights: hardcodedDest.highlights,
        gettingAround: hardcodedDest.gettingAround,
        bestTimeToVisit: hardcodedDest.bestTimeToVisit,
        imageUrl: hardcodedDest.imageUrl,
      });
      return; // Don't call API if we found it in hardcoded destinations
    }
    
    // Fallback: Look up destination data via API (for destinations not in hardcoded list)
    try {
      const lookupParam = typeof dest === 'object' && dest.slug 
        ? `slug=${encodeURIComponent(dest.slug)}` 
        : `name=${encodeURIComponent(destName)}`;
      const response = await fetch(`/api/internal/destination-lookup?${lookupParam}`);
      if (response.ok) {
        const destData = await response.json();
        // Ensure id is the slug format (for restaurant matching)
        const destinationId = destData.slug || destData.id;
        setDestinationData({
          id: destinationId, // Use slug format for restaurant matching (e.g., "bali")
          name: destData.name,
          fullName: destData.fullName || destData.name,
          destinationId: destData.destinationId, // Numeric ID for Viator API
          slug: destData.slug || destData.id, // Explicit slug
          // Store full destination info
          category: destData.category,
          country: destData.country,
          heroDescription: destData.heroDescription,
          briefDescription: destData.briefDescription,
          whyVisit: destData.whyVisit,
          highlights: destData.highlights,
          gettingAround: destData.gettingAround,
          bestTimeToVisit: destData.bestTimeToVisit,
          imageUrl: destData.imageUrl,
        });
      }
    } catch (error) {
      console.error('Error looking up destination:', error);
    }
  };

  const handleSearch = async () => {
    if (!destinationData) return;

    setLoading(true);
    setTours([]);
    setRestaurants([]);
    setShowAllTours(false);
    setShowAllRestaurants(false);
    
    // Track which destination we're searching for
    const currentDestinationId = destinationData.id;
    setSearchedDestinationId(currentDestinationId);

    try {
      const destinationId = destinationData.destinationId;
      const destinationName = destinationData.name;

      // Fetch promoted tours and restaurants for this destination
      let promotedTourProductIds = new Set();
      let promotedRestaurantIds = new Set();
      let promotedToursWithData = []; // Full tour data for promoted tours
      
      try {
        if (destinationId) {
          // Fetch promoted tours via API route (server-side)
          const promotedToursResponse = await fetch(`/api/internal/promoted-tours-by-destination?destinationId=${encodeURIComponent(destinationId)}&limit=20`);
          if (promotedToursResponse.ok) {
            const promotedToursData = await promotedToursResponse.json();
            const promotedToursList = promotedToursData.promotedTours || [];
            promotedTourProductIds = new Set(promotedToursList.map(pt => pt.product_id || pt.productId || pt.productCode).filter(Boolean));
            
            // Fetch full tour data for promoted tours
            if (promotedToursList.length > 0) {
              const { getCachedTour, useSupabaseCache } = await import('@/lib/viatorCache');
              const fetchPromises = promotedToursList.map(async (promoted) => {
                const productId = promoted.product_id || promoted.productId || promoted.productCode;
                if (!productId) return null;
                
                try {
                  let tour = null;
                  if (useSupabaseCache()) tour = await getCachedTour(productId);
                  if (!tour) {
                    try {
                      const response = await fetch(`/api/internal/tour/${productId}`);
                      if (response.ok) {
                        const data = await response.json();
                        tour = data.tour || data;
                      } else {
                        console.warn(`Failed to fetch promoted tour ${productId}: ${response.status}`);
                        return null;
                      }
                    } catch (error) {
                      console.error(`Error fetching promoted tour ${productId} from API:`, error);
                      return null;
                    }
                  }
                  
                  // Return tour with product_id for matching
                  return {
                    ...tour,
                    productId: productId,
                    productCode: productId,
                    product_id: productId,
                  };
                } catch (error) {
                  console.error(`Error fetching promoted tour ${productId}:`, error);
                  return null;
                }
              });
              
              const fetchedTours = await Promise.all(fetchPromises);
              promotedToursWithData = fetchedTours.filter(t => t !== null);
              setPromotedTours(promotedToursWithData);
            }
          }
        }
        if (destinationData.id) {
          // Fetch promoted restaurants via API route (server-side)
          try {
            const promotedRestaurantsResponse = await fetch(`/api/internal/promoted-restaurants-by-destination?destinationId=${encodeURIComponent(destinationData.id)}&limit=20`);
            if (promotedRestaurantsResponse.ok) {
              const promotedRestaurantsData = await promotedRestaurantsResponse.json();
              console.log('[MatchYourStyle] Promoted restaurants API response:', promotedRestaurantsData);
              const promotedRestaurantsList = promotedRestaurantsData.promotedRestaurants || [];
              console.log('[MatchYourStyle] Promoted restaurants list:', promotedRestaurantsList);
              promotedRestaurantIds = new Set(promotedRestaurantsList.map(pr => String(pr.restaurant_id || pr.id)).filter(Boolean));
              console.log('[MatchYourStyle] Promoted restaurant IDs:', Array.from(promotedRestaurantIds));
              
              // Fetch full restaurant data for promoted restaurants
              if (promotedRestaurantsList.length > 0) {
                console.log(`[MatchYourStyle] Found ${promotedRestaurantsList.length} promoted restaurants, fetching full data...`);
                const fetchPromises = promotedRestaurantsList.map(async (promoted) => {
                  const restaurantId = promoted.restaurant_id || promoted.id;
                  if (!restaurantId) {
                    console.warn('[MatchYourStyle] Promoted restaurant missing ID:', promoted);
                    return null;
                  }
                  
                  try {
                    // Fetch full restaurant data from API
                    const response = await fetch(`/api/internal/restaurant/${restaurantId}`);
                    if (response.ok) {
                      const data = await response.json();
                      const restaurant = data.restaurant || data;
                      console.log(`[MatchYourStyle] Successfully fetched restaurant ${restaurantId}:`, restaurant.name);
                      return {
                        ...restaurant,
                        id: restaurantId,
                        isPromoted: true,
                      };
                    } else {
                      console.warn(`[MatchYourStyle] Failed to fetch promoted restaurant ${restaurantId}: ${response.status}`);
                      // Return basic data if full fetch fails
                      return {
                        id: restaurantId,
                        name: promoted.name || 'Restaurant',
                        slug: promoted.slug,
                        isPromoted: true,
                      };
                    }
                  } catch (error) {
                    console.error(`[MatchYourStyle] Error fetching promoted restaurant ${restaurantId}:`, error);
                    // Return basic data if fetch fails
                    return {
                      id: restaurantId,
                      name: promoted.name || 'Restaurant',
                      slug: promoted.slug,
                      isPromoted: true,
                    };
                  }
                });
                
                const fetchedRestaurants = await Promise.all(fetchPromises);
                const validRestaurants = fetchedRestaurants.filter(r => r !== null);
                console.log(`[MatchYourStyle] Setting ${validRestaurants.length} promoted restaurants`);
                setPromotedRestaurants(validRestaurants);
              } else {
                console.log('[MatchYourStyle] No promoted restaurants found in list');
                setPromotedRestaurants([]);
              }
            }
          } catch (error) {
            console.error('Error fetching promoted restaurants:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching promoted items:', error);
        // Continue without promoted items
      }

      // Search tours if needed
      if (searchType === 'tours' || searchType === 'both') {
        const toursResponse = await fetch('/api/internal/viator-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchTerm: '',
            page: 1,
            viatorDestinationId: destinationId ? String(destinationId) : null,
            includeDestination: !!destinationId
          })
        });

        if (toursResponse.ok) {
          const toursData = await toursResponse.json();
          let toursList = toursData.products?.results || [];
          
          // Limit to 50 as requested
          toursList = toursList.slice(0, 50);

          // Get current user for preference resolution
          const { data: { user } } = await supabase.auth.getUser();

          // Use unified preference resolution - ensures consistent match scores across all pages
          const effectivePreferences = resolveUserPreferences({ user: user || null, userPreferences, localPreferences });
          if (effectivePreferences && toursList.length > 0) {
            // Pass raw preferences - calculateEnhancedMatchScore will convert them internally
            // Step 1: Collect all tag IDs from tours
            const allTagIds = new Set();
            const tourTagMap = new Map(); // productId -> tagIds array
            
            for (const tour of toursList) {
              const productId = tour.productId || tour.productCode;
              if (!productId) continue;
              
              const tagIds = tour.tags || tour.tagIds || [];
              if (Array.isArray(tagIds) && tagIds.length > 0) {
                tagIds.forEach(id => allTagIds.add(id));
                tourTagMap.set(productId, tagIds);
              }
            }
            
            // Step 2: Fetch tag traits from database (batch)
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
              } catch (error) {
                console.error('Error fetching tag traits:', error);
              }
            }
            
            // Step 3: Calculate match scores for all tours
            const toursWithScores = await Promise.all(
              toursList.map(async (tour) => {
                try {
                  const productId = tour.productId || tour.productCode;
                  if (!productId) {
                    return { ...tour, matchScore: { score: 50, confidence: 'low' }, isPromoted: false };
                  }
                  
                  // Don't set isPromoted in main grid - badge only shows in "Promoted Tours" section above
                  // Tours in main grid are sorted by match score only
                  
                  // Get tag IDs for this tour
                  const tagIds = tourTagMap.get(productId) || [];
                  
                  // Convert tag IDs to tag objects using cached traits
                  const tourTags = tagIds
                    .map(tagId => tagTraitsMap.get(tagId))
                    .filter(Boolean); // Remove any missing traits
                  
                  // Calculate tour profile from tags
                  const tourProfile = await calculateTourProfile(tourTags, null, supabase);
                  
                  // Calculate enhanced match score (same as tours page)
                  // Pass raw preferences - calculateEnhancedMatchScore converts them internally
                  const matchResult = await calculateEnhancedMatchScore(tour, effectivePreferences, tourProfile);
                  
                  return {
                    ...tour,
                    matchScore: matchResult, // TourCard expects object with score property
                    isPromoted: false // No badge in main grid - only in "Promoted Tours" section
                  };
                } catch (error) {
                  console.error('Error calculating match score:', error);
                  return { 
                    ...tour, 
                    matchScore: { score: 50, confidence: 'low' }, // Default balanced score
                    isPromoted: false
                  };
                }
              })
            );

            // Sort by match score only (highest first)
            // Promoted tours will show with badge but sorted by match score
            toursWithScores.sort((a, b) => {
              return (b.matchScore?.score || 50) - (a.matchScore?.score || 50);
            });
            setTours(toursWithScores.slice(0, 15)); // Top 15
          } else {
            // No preferences, sort by rating only
            // Don't set isPromoted in main grid - badge only shows in "Promoted Tours" section above
            toursList.forEach(tour => {
              const productId = tour.productId || tour.productCode;
              tour.isPromoted = false; // No badge in main grid - only in "Promoted Tours" section
            });
            toursList.sort((a, b) => {
              // Sort by rating (highest first)
              const ratingA = a.reviews?.combinedAverageRating || 0;
              const ratingB = b.reviews?.combinedAverageRating || 0;
              return ratingB - ratingA;
            });
            setTours(toursList.slice(0, 15));
          }
        }
      }

      // Search restaurants if needed
      if (searchType === 'restaurants' || searchType === 'both') {
        try {
          const restaurantsResponse = await fetch('/api/internal/restaurants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              destination: destinationData.id
            })
          });

          if (restaurantsResponse.ok) {
            const restaurantsData = await restaurantsResponse.json();
            let restaurantsList = restaurantsData.restaurants || [];
            
            if (restaurantsList.length > 0) {
              // Limit to 50
              restaurantsList = restaurantsList.slice(0, 50);

              // Calculate match scores if preferences exist
              // Build effective preferences with restaurant preferences if available
              const effectivePreferences = userPreferences || localPreferences || {};
              const restaurantPrefs = localRestaurantPreferences || {};
              
              // Create a combined preferences object for restaurant matching
              const combinedPreferences = {
                ...effectivePreferences,
                restaurantPreferences: restaurantPrefs
              };
              
              if (combinedPreferences && Object.keys(combinedPreferences).length > 0 && restaurantsList.length > 0) {
                const restaurantsWithScores = restaurantsList.map((restaurant) => {
                  try {
                    // Check if this restaurant is promoted
                    const isPromoted = promotedRestaurantIds.has(String(restaurant.id));
                    
                    const restaurantValues = extractRestaurantStructuredValues(restaurant);
                    if (restaurantValues?.error) {
                      return { ...restaurant, matchScore: 0, isPromoted: isPromoted };
                    }
                    const match = calculateRestaurantPreferenceMatch(combinedPreferences, restaurantValues, restaurant);
                    const score = match?.matchScore || 0;
                    return {
                      ...restaurant,
                      matchScore: Math.round(score), // Restaurant cards use number directly
                      isPromoted: isPromoted
                    };
                  } catch (error) {
                    console.error('Error calculating restaurant match score:', error);
                    return { ...restaurant, matchScore: 0, isPromoted: false };
                  }
                });

                // Sort: Promoted first, then by match score (highest first)
                restaurantsWithScores.sort((a, b) => {
                  // Promoted listings always first
                  if (a.isPromoted && !b.isPromoted) return -1;
                  if (!a.isPromoted && b.isPromoted) return 1;
                  // Within each group, sort by match score
                  return (b.matchScore || 0) - (a.matchScore || 0);
                });
                const restaurantsToSet = restaurantsWithScores.slice(0, 15);
                setRestaurants(restaurantsToSet);
                // Set promoted restaurants
                const promotedRestaurantsList = restaurantsToSet.filter(r => promotedRestaurantIds.has(String(r.id)));
                setPromotedRestaurants(promotedRestaurantsList);
              } else {
                // No preferences, sort: Promoted first, then by rating
                restaurantsList.forEach(restaurant => {
                  restaurant.isPromoted = promotedRestaurantIds.has(String(restaurant.id));
                });
                restaurantsList.sort((a, b) => {
                  // Promoted listings always first
                  if (a.isPromoted && !b.isPromoted) return -1;
                  if (!a.isPromoted && b.isPromoted) return 1;
                  // Within each group, sort by rating
                  const ratingA = a.google_rating || a.rating || 0;
                  const ratingB = b.google_rating || b.rating || 0;
                  return ratingB - ratingA;
                });
                const restaurantsToSet = restaurantsList.slice(0, 15);
                setRestaurants(restaurantsToSet);
                // Set promoted restaurants
                const promotedRestaurantsList = restaurantsToSet.filter(r => promotedRestaurantIds.has(String(r.id)));
                setPromotedRestaurants(promotedRestaurantsList);
              }
            } else {
              // No restaurants found for this destination
              setRestaurants([]);
              setPromotedRestaurants([]);
            }
          } else {
            console.error('Failed to fetch restaurants:', restaurantsResponse.status);
            setRestaurants([]);
          }
        } catch (error) {
          console.error('Error fetching restaurants:', error);
          setRestaurants([]);
        }
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: 'Error searching',
        description: 'Failed to load tours and restaurants. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = useMemo(() => {
    if (!destination.trim()) return [];
    const searchLower = destination.toLowerCase();
    const filtered = destinationOptions
      .filter(dest => 
        dest.name?.toLowerCase().includes(searchLower) ||
        dest.fullName?.toLowerCase().includes(searchLower)
      );
    
    // Group by name (case-insensitive) and merge/prioritize
    const grouped = new Map();
    filtered.forEach(dest => {
      const nameKey = dest.name?.toLowerCase();
      if (!nameKey) return;
      
      if (!grouped.has(nameKey)) {
        grouped.set(nameKey, []);
      }
      grouped.get(nameKey).push(dest);
    });
    
    // For each group, prefer the one with a slug (more likely to have restaurants)
    // or merge data from multiple entries
    const unique = Array.from(grouped.values()).map(group => {
      if (group.length === 1) return group[0];
      
      // Prefer entry with slug (more likely to match restaurants)
      const withSlug = group.find(d => d.slug);
      if (withSlug) return withSlug;
      
      // Prefer entry with destination_id (numeric ID for Viator)
      const withDestId = group.find(d => d.destination_id || d.id);
      if (withDestId) return withDestId;
      
      // Otherwise, use first one
      return group[0];
    });
    
    return unique.slice(0, 8);
  }, [destination, destinationOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDestinationDropdown && !event.target.closest('.destination-selector-container')) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDestinationDropdown]);

  return (
    <>
      <NavigationNext />
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Hero Section */}
        <section className="pt-24 pb-16 ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(viewMode === 'ai' || viewMode === 'personal') && (
              <button
                type="button"
                onClick={() => router.push('/match-your-style')}
                className="mb-6 flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to options
              </button>
            )}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white mb-6">
                {viewMode === 'choice' && 'Get Tour Recommendations'}
                {viewMode === 'ai' && 'Match Your Style'}
                {viewMode === 'personal' && 'AI Precision. Human Expertise.'}
              </h1>
              <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 leading-relaxed">
                {viewMode === 'choice' && 'Get the best tours for your trip—instantly with AI, or hand-picked by our experts within 24 hours. Both free.'}
                {viewMode === 'ai' && 'Find tours and restaurants that match your travel style, budget, and preferences.'}
                {viewMode === 'personal' && 'Sometimes the best travel decisions need a second opinion. Tell us where you’re going, and our experts will hand-pick the top 3 tours for your dates using our proprietary AI match technology.'}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Choice: AI Match vs Personal Match */}
        {viewMode === 'choice' && (
          <section className="py-14 md:py-18 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.button
                  type="button"
                  onClick={() => router.push('/match-your-style/ai-match')}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  className="text-left p-8 md:p-10 rounded-2xl border-2 border-purple-200 bg-white shadow-lg shadow-purple-100/50 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-200/40 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm font-bold text-purple-600 uppercase tracking-wider">Instant · Free</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 font-poppins">AI Match</h2>
                  <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed">
                    Get personalized tour and restaurant picks right now. Enter your destination and preferences—we’ll show you the best matches with 0–100% scores.
                  </p>
                  <span className="inline-flex items-center gap-2 text-purple-600 font-bold text-base">
                    Start now <ArrowRight className="w-5 h-5" />
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => router.push('/match-your-style/personal-match')}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  className="text-left p-8 md:p-10 rounded-2xl border-2 border-emerald-200 bg-white shadow-lg shadow-emerald-100/50 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-200/40 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Within 24 hours · Free</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 font-poppins">Personal Match</h2>
                  <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed">
                    Our experts search 300,000+ tours in 3,500 destinations and hand-pick your top 3 using our AI match technology. One short form—personal report in your inbox.
                  </p>
                  <span className="inline-flex items-center gap-2 text-emerald-600 font-bold text-base">
                    Get my picks <ArrowRight className="w-5 h-5" />
                  </span>
                </motion.button>
              </div>
              {/* Our mission / why this is free */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-14 text-center max-w-3xl mx-auto"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">Our Mission</h3>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  At TopTours.ai™, we’re pioneering a new way to discover and book tours. We’ve built something unique: a platform where AI helps you find tours that actually fit your travel preferences. That’s why we offer both AI Match and Personal Match free—so every traveler can get a more personalized, transparent, and engaging experience.
                </p>
                <p className="text-base text-gray-600 leading-relaxed">
                  We partner with trusted tour operators worldwide so you have access to authentic, high-quality experiences. When you book, our partners support us—so we can keep improving recommendations, expanding to more destinations, and giving you the intelligence to find the tours that match you perfectly, without charging you.
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* Personal Match: How It Works + Form + Trust + Upsell + Footer */}
        {viewMode === 'personal' && (
          <>
            {/* How It Works */}
            <section className="py-14 bg-white border-b border-gray-100">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12 font-poppins">How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                      <span className="text-xl font-bold text-emerald-600">1</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Share your vision</h3>
                    <p className="text-base text-gray-600 leading-relaxed">Fill out a quick form with your destination, dates, and what kind of experience you’re looking for.</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                      <span className="text-xl font-bold text-emerald-600">2</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">We run the data</h3>
                    <p className="text-base text-gray-600 leading-relaxed">We scan 300,000+ tours and apply your Match Style preferences to find the highest-scoring options.</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                      <span className="text-xl font-bold text-emerald-600">3</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Get your report</h3>
                    <p className="text-base text-gray-600 leading-relaxed">Within 24 hours you’ll receive a personal email with 3 curated tours, match scores, and direct booking links.</p>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Request Form */}
            <section className="py-12 bg-gray-50">
              <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                {personalSubmitted ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Request received</h2>
                    <p className="text-gray-600 mb-6">
                      Our team will hand-pick your top 3 tours and email your Personal Match Report within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPersonalSubmitted(false);
                        setPersonalEmail(''); setPersonalTravelDates(''); setPersonalTravelStartDate(''); setPersonalTravelEndDate(''); setPersonalName(''); setPersonalDestination('');
                        setPersonalNotes(''); setPersonalGroupSize(''); setPersonalPrimaryGoal(''); setPersonalTermsAccepted(false);
                      }}
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      Submit another request
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2 font-poppins">Request your Personal Match Report</h2>
                    <p className="text-center text-gray-600 text-lg mb-2">It’s free, fast, and personalized just for you.</p>
                    <p className="text-center text-gray-500 text-base mb-8">We offer it free because we’re supported by our tour partners when you book—so we can keep helping more travelers find the right tours.</p>
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const hasDateRange = personalTravelStartDate && personalTravelEndDate;
                        const hasDatesNotes = personalTravelDates.trim();
                        if (!personalEmail.trim() || !personalDestination.trim() || !personalTermsAccepted || (!hasDateRange && !hasDatesNotes)) return;
                        setPersonalSubmitting(true);
                        try {
                          const res = await fetch('/api/internal/personal-match-submit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              email: personalEmail.trim(),
                              destination: personalDestination.trim(),
                              travelStartDate: personalTravelStartDate || undefined,
                              travelEndDate: personalTravelEndDate || undefined,
                              travelDatesNotes: personalTravelDates.trim() || undefined,
                              groupSize: personalGroupSize || undefined,
                              primaryGoal: personalPrimaryGoal || undefined,
                              name: personalName?.trim() || undefined,
                            }),
                          });
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok) {
                            throw new Error(data.error || 'Request failed');
                          }
                          setPersonalSubmitted(true);
                        } catch (err) {
                          toast({ title: 'Something went wrong', description: err?.message || 'Please try again.', variant: 'destructive' });
                        } finally {
                          setPersonalSubmitting(false);
                        }
                      }}
                      className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm"
                    >
                      <div>
                        <label htmlFor="personal-destination" className="block text-sm font-semibold text-gray-900 mb-1.5">
                          Destination <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="personal-destination"
                          type="text"
                          placeholder="e.g. Aruba, Rome, Bali"
                          value={personalDestination}
                          onChange={(e) => setPersonalDestination(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                          Travel dates <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Pick dates if you know them, or describe below (e.g. flexible in April).</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label htmlFor="personal-start-date" className="sr-only">Start date</label>
                            <Input
                              id="personal-start-date"
                              type="date"
                              value={personalTravelStartDate}
                              onChange={(e) => setPersonalTravelStartDate(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label htmlFor="personal-end-date" className="sr-only">End date</label>
                            <Input
                              id="personal-end-date"
                              type="date"
                              value={personalTravelEndDate}
                              onChange={(e) => setPersonalTravelEndDate(e.target.value)}
                              min={personalTravelStartDate || undefined}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <Input
                          id="personal-dates-notes"
                          type="text"
                          placeholder="Or describe: e.g. “Flexible in April” or “March 15–22”"
                          value={personalTravelDates}
                          onChange={(e) => setPersonalTravelDates(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="personal-group" className="block text-sm font-semibold text-gray-900 mb-1.5">
                          Group size
                        </label>
                        <select
                          id="personal-group"
                          value={personalGroupSize}
                          onChange={(e) => setPersonalGroupSize(e.target.value)}
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select...</option>
                          <option value="solo">Solo</option>
                          <option value="couple">Couple</option>
                          <option value="family">Family</option>
                          <option value="small">Small group (4–8)</option>
                          <option value="large">Large group (8+)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="personal-goal" className="block text-sm font-semibold text-gray-900 mb-1.5">
                          What is your primary goal for this trip?
                        </label>
                        <textarea
                          id="personal-goal"
                          placeholder='e.g. "Relaxing on the beach," "Finding hidden history," "High-adrenaline adventure"'
                          value={personalPrimaryGoal}
                          onChange={(e) => setPersonalPrimaryGoal(e.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="personal-email" className="block text-sm font-semibold text-gray-900 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="personal-email"
                          type="email"
                          placeholder="you@example.com"
                          value={personalEmail}
                          onChange={(e) => setPersonalEmail(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="personal-name" className="block text-sm font-semibold text-gray-900 mb-1.5">
                          Name (optional)
                        </label>
                        <Input
                          id="personal-name"
                          type="text"
                          placeholder="Your name"
                          value={personalName}
                          onChange={(e) => setPersonalName(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-start gap-3 pt-1">
                        <input
                          id="personal-terms"
                          type="checkbox"
                          checked={personalTermsAccepted}
                          onChange={(e) => setPersonalTermsAccepted(e.target.checked)}
                          className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="personal-terms" className="text-sm text-gray-700">
                          I agree to the{' '}
                          <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium underline" target="_blank" rel="noopener noreferrer">
                            Terms & Conditions
                          </Link>
                          . I understand that my information will be used only to find the best tour experience for me and will not be used for marketing.
                        </label>
                      </div>
                      <Button
                        type="submit"
                        disabled={personalSubmitting || !personalEmail.trim() || !personalDestination.trim() || !personalTermsAccepted || (!(personalTravelStartDate && personalTravelEndDate) && !personalTravelDates.trim())}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-6"
                      >
                        {personalSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
                            Sending…
                          </>
                        ) : (
                          'Request my Personal Match Report'
                        )}
                      </Button>
                    </motion.form>
                  </>
                )}
              </div>
            </section>

            {/* Trust: Why Us */}
            <section className="py-14 bg-white border-t border-gray-100">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10 font-poppins">Why use the TopTours Concierge?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center text-center p-5">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Zero stress</h3>
                    <p className="text-base text-gray-600 leading-relaxed">Skip the hours of scrolling through endless review pages. We do the heavy lifting.</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-5">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-validated</h3>
                    <p className="text-base text-gray-600 leading-relaxed">Every recommendation is backed by a 0–100% Match Score based on your travel style.</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted partners</h3>
                    <p className="text-base text-gray-600 leading-relaxed">We only recommend tours from verified, high-quality partners like Viator.</p>
                  </div>
                </div>
                <p className="text-center text-gray-500 text-base mt-8 max-w-2xl mx-auto">
                  Right now we only recommend tours. Restaurants, hotels, and itineraries are coming soon.
                </p>
              </div>
            </section>

            {/* Closing footer */}
            <section className="py-10 bg-white border-t border-gray-100">
              <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-gray-600 text-base leading-relaxed">
                  <span className="font-semibold text-gray-900">TopTours.ai™</span>
                  <br />
                  Helping you find the tours that actually match your style.
                </p>
              </div>
            </section>
          </>
        )}

        {/* AI Match: existing flow */}
        {viewMode === 'ai' && (
        <>
        {/* Main Content */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Destination Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  Destination
                </label>
                <div className="relative destination-selector-container">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search destinations..."
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setShowDestinationDropdown(true);
                    }}
                    onFocus={() => {
                      if (filteredDestinations.length > 0) {
                        setShowDestinationDropdown(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && filteredDestinations.length > 0) {
                        handleDestinationSelect(filteredDestinations[0].name);
                      }
                    }}
                    className="pl-10"
                  />
                  {showDestinationDropdown && filteredDestinations.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredDestinations.map((dest) => (
                        <button
                          key={dest.id || dest.slug || dest.destination_id}
                          type="button"
                          onClick={() => handleDestinationSelect(dest)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{dest.name}</span>
                          {dest.country && (
                            <span className="text-xs text-gray-400">({dest.country})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Search Type Selector - Only show after destination is selected */}
              {destinationData && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-600" />
                    What are you looking for?
                  </label>
                  {checkingRestaurants ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                        <p className="text-sm text-gray-600">Checking available options...</p>
                      </div>
                    </div>
                  ) : hasRestaurants ? (
                    <>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSearchType('tours')}
                          className={`flex-1 px-4 py-3.5 rounded-xl border-2 transition-all font-medium flex flex-col items-center justify-center gap-1 ${
                            searchType === 'tours'
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <span className="text-xl">🎯</span>
                          <span>Tours</span>
                        </button>
                        <button
                          onClick={() => setSearchType('restaurants')}
                          className={`flex-1 px-4 py-3.5 rounded-xl border-2 transition-all font-medium flex flex-col items-center justify-center gap-1 ${
                            searchType === 'restaurants'
                              ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          <span className="text-xl">🍽️</span>
                          <span>Restaurants</span>
                        </button>
                        <button
                          onClick={() => setSearchType('both')}
                          className={`flex-1 px-4 py-3.5 rounded-xl border-2 transition-all font-medium flex flex-col items-center justify-center gap-1 ${
                            searchType === 'both'
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 text-purple-700 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <span className="text-xl">✨</span>
                          <span>Both</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSearchType('tours')}
                          className="flex-1 px-4 py-3.5 rounded-xl border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 shadow-sm font-medium flex flex-col items-center justify-center gap-1"
                        >
                          <span className="text-xl">🎯</span>
                          <span>Tours</span>
                        </button>
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 flex items-center gap-2">
                          <UtensilsCrossed className="w-4 h-4" />
                          We don't have restaurants available for {destinationData.name} yet. Only tours are shown.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Preferences Display */}
              <div className={`rounded-xl border-2 transition-all ${
                (userPreferences || localPreferences) 
                  ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 border-purple-200 shadow-sm' 
                  : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-sm'
              }`}>
                {(userPreferences || localPreferences) ? (
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Your Preferences
                        </h3>
                      </div>
                      <Button
                        onClick={() => setShowPreferencesModal(true)}
                        variant="outline"
                        size="sm"
                        className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 flex items-center gap-1.5 font-semibold"
                      >
                        <Settings className="w-4 h-4" />
                        Edit Preferences
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                      <span>💡</span>
                      <span>Click "Edit Preferences" above to customize your travel style</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {((userPreferences || localPreferences)?.budgetComfort !== undefined) && (
                        <Badge className="px-3 py-1.5 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                          <span className="mr-1.5">💰</span>
                          Budget: {(userPreferences || localPreferences).budgetComfort < 33 ? 'Budget' : (userPreferences || localPreferences).budgetComfort < 66 ? 'Moderate' : 'Luxury'}
                        </Badge>
                      )}
                      {((userPreferences || localPreferences)?.groupPreference !== undefined) && (
                        <Badge className="px-3 py-1.5 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                          <span className="mr-1.5">👥</span>
                          Group: {(userPreferences || localPreferences).groupPreference < 33 ? 'Large groups' : (userPreferences || localPreferences).groupPreference < 66 ? 'Medium' : 'Private/Small'}
                        </Badge>
                      )}
                      {((userPreferences || localPreferences)?.adventureLevel !== undefined) && (
                        <Badge className="px-3 py-1.5 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                          <span className="mr-1.5">🔥</span>
                          Style: {(userPreferences || localPreferences).adventureLevel < 33 ? 'Relaxed' : (userPreferences || localPreferences).adventureLevel < 66 ? 'Balanced' : 'Adventure'}
                        </Badge>
                      )}
                      {((userPreferences || localPreferences)?.cultureVsBeach !== undefined) && (
                        <Badge className="px-3 py-1.5 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                          <span className="mr-1.5">🌊</span>
                          {(userPreferences || localPreferences).cultureVsBeach < 33 ? 'Relax' : (userPreferences || localPreferences).cultureVsBeach < 66 ? 'Balanced' : 'Explore'}
                        </Badge>
                      )}
                      {((userPreferences || localPreferences)?.structurePreference !== undefined) && (
                        <Badge className="px-3 py-1.5 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                          <span className="mr-1.5">📋</span>
                          {(userPreferences || localPreferences).structurePreference < 33 ? 'Independent' : (userPreferences || localPreferences).structurePreference < 66 ? 'Mixed' : 'Guided'}
                        </Badge>
                      )}
                      {((userPreferences || localPreferences)?.foodAndDrinkInterest !== undefined) && (
                        <Badge className="px-3 py-1.5 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                          <span className="mr-1.5">🍷</span>
                          Food: {(userPreferences || localPreferences).foodAndDrinkInterest < 33 ? 'Not Important' : (userPreferences || localPreferences).foodAndDrinkInterest < 66 ? 'Nice to Have' : 'Very Important'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          Set Your Preferences
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Get personalized tour and restaurant recommendations that match your travel style
                        </p>
                        <Button
                          onClick={() => setShowPreferencesModal(true)}
                          className="sunset-gradient text-white hover:opacity-90 transition-opacity"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Set Preferences
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={!destinationData || loading}
                className="w-full sunset-gradient text-white py-6 text-lg"
                size="lg"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center mb-4">
                  <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Finding the best matches for you...
                </h3>
                <p className="text-gray-600">
                  {searchType === 'tours' && 'Searching tours and calculating match scores'}
                  {searchType === 'restaurants' && 'Searching restaurants and calculating match scores'}
                  {searchType === 'both' && 'Searching tours and restaurants, calculating match scores'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Results Section - Only show if results match current destination */}
        {!loading && searchedDestinationId === destinationData?.id && (tours.length > 0 || restaurants.length > 0 || promotedTours.length > 0 || promotedRestaurants.length > 0) && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Promoted Listings Section */}
              {(promotedTours && promotedTours.length > 0) || (promotedRestaurants && promotedRestaurants.length > 0) ? (
                <div className="mb-12">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Promoted Listings in {destinationData?.name}</h2>
                      <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                        Partner
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Featured tours and restaurants from our partner operators.
                    </p>
                  </div>
                  
                  {/* Promoted Tours */}
                  {promotedTours && promotedTours.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Promoted Tours</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {promotedTours.slice(0, 6).map((tour, index) => {
                          const productId = getTourProductId(tour) || tour.product_id || tour.productId || tour.productCode;
                          if (!productId) return null;
                          
                          // Try multiple product ID formats to find match score
                          const matchScore = promotedToursMatchScores[productId] || 
                                            promotedToursMatchScores[tour.productId] || 
                                            promotedToursMatchScores[tour.productCode] || 
                                            promotedToursMatchScores[tour.product_id] ||
                                            null;
                          
                          return (
                            <TourCard
                              key={productId || index}
                              tour={tour}
                              destination={destinationData}
                              matchScore={matchScore}
                              user={null}
                              userPreferences={userPreferences || localPreferences}
                              onOpenPreferences={() => setShowPreferencesModal(true)}
                              isFeatured={false}
                              premiumOperatorTourIds={[]}
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
                          
                          const restaurantUrl = restaurant.slug && destinationData?.id
                            ? `/destinations/${destinationData.id}/restaurants/${restaurant.slug}`
                            : `/destinations/${destinationData?.id}/restaurants`;
                          
                          const description = restaurant.metaDescription 
                            || restaurant.tagline 
                            || restaurant.summary 
                            || restaurant.description
                            || (restaurant.cuisines?.length > 0 
                                ? `Discover ${restaurant.cuisines.join(' & ')} cuisine at ${restaurant.name}.`
                                : `Experience great dining at ${restaurant.name}.`);
                          
                          // Calculate match score for restaurant
                          let matchScore = 0;
                          if (localRestaurantPreferences && restaurant) {
                            try {
                              const structuredValues = extractRestaurantStructuredValues(restaurant);
                              if (structuredValues && !structuredValues.error) {
                                const matchData = calculateRestaurantPreferenceMatch(structuredValues, localRestaurantPreferences);
                                matchScore = matchData?.matchScore || 0;
                              }
                            } catch (e) {
                              console.error('Error calculating restaurant match:', e);
                            }
                          }
                          
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
              ) : null}
              
              {/* Tours Results */}
              {tours.length > 0 && (
                <div className="mb-12">
                  <div className="mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                        Best Matches for You in {destinationData?.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">Personalized tours based on your preferences</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(showAllTours ? tours : tours.slice(0, 3)).map((tour, displayIndex) => {
                      const productId = tour.productId || tour.productCode;
                      // Find original index in full array for "Best Match" badge
                      const originalIndex = tours.findIndex(t => (t.productId || t.productCode) === productId);
                      const isTopMatch = originalIndex < 3; // Top 3 are featured
                      return (
                        <div key={productId || displayIndex} className="relative">
                          {isTopMatch && (
                            <div className="absolute -top-3 -right-3 z-10">
                              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 shadow-lg flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                <span className="font-semibold">Best Match</span>
                              </Badge>
                            </div>
                          )}
                          <div className={isTopMatch ? 'ring-2 ring-purple-500 ring-offset-2 rounded-xl' : ''}>
                            <TourCard
                              tour={tour}
                              destination={destinationData}
                              matchScore={tour.matchScore || null}
                              userPreferences={userPreferences || localPreferences}
                              onOpenPreferences={() => setShowPreferencesModal(true)}
                              isFeatured={isTopMatch}
                              isPromoted={false}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {tours.length > 3 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button
                        onClick={() => setShowAllTours(!showAllTours)}
                        className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 w-full sm:w-auto"
                      >
                        {showAllTours ? (
                          <>
                            Show Less ({tours.length - 3} fewer)
                            <ChevronDown className="w-4 h-4 ml-2 rotate-180" />
                          </>
                        ) : (
                          <>
                            Show {tours.length - 3} More Tours
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                      <Link
                        href={`/destinations/${destinationData?.id}/tours`}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 justify-center w-full sm:w-auto"
                      >
                        View All Tours in {destinationData?.name}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                  {tours.length <= 3 && (
                    <div className="mt-6 text-center">
                      <Link
                        href={`/destinations/${destinationData?.id}/tours`}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 justify-center"
                      >
                        View All Tours in {destinationData?.name}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Restaurants Results */}
              {restaurants.length > 0 && (
                <div className="mb-12">
                  <div className="mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-orange-600" />
                        Best Matches for You in {destinationData?.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">Personalized restaurants based on your preferences</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(showAllRestaurants ? restaurants : restaurants.slice(0, 3)).map((restaurant, displayIndex) => {
                      // Find original index in full array for "Best Match" badge
                      const originalIndex = restaurants.findIndex(r => (r.id || r.slug) === (restaurant.id || restaurant.slug));
                      const isTopMatch = originalIndex < 3; // Top 3 are featured
                      return (
                        <motion.div
                          key={restaurant.id || displayIndex}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: displayIndex * 0.05 }}
                          viewport={{ once: true }}
                          className="relative"
                        >
                          {isTopMatch && (
                            <div className="absolute -top-3 -right-3 z-10">
                              <Badge className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 shadow-lg flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                <span className="font-semibold">Best Match</span>
                              </Badge>
                            </div>
                          )}
                          <Card className={`h-full border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                            isTopMatch 
                              ? 'border-orange-500 ring-2 ring-orange-500 ring-offset-2 bg-gradient-to-br from-orange-50/50 to-white' 
                              : 'border-gray-100 bg-white'
                          }`}>
                          <CardContent className="p-6 flex flex-col h-full">
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                                  <UtensilsCrossed className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 truncate">
                                  {restaurant.cuisines && Array.isArray(restaurant.cuisines) && restaurant.cuisines.length > 0
                                    ? restaurant.cuisines[0]
                                    : 'Restaurant'}
                                </span>
                              </div>
                              {restaurant.matchScore !== undefined && (
                                <Badge className={`text-xs flex-shrink-0 ${
                                  restaurant.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                                  restaurant.matchScore >= 60 ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {restaurant.matchScore}% Match
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <Link href={`/destinations/${destinationData?.id}/restaurants/${restaurant.slug || restaurant.id}`}>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-purple-600 transition-colors">
                                  {restaurant.name}
                                </h3>
                              </Link>
                            </div>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                              {restaurant.metaDescription || restaurant.tagline || restaurant.summary || restaurant.description || 
                               (restaurant.cuisines?.length > 0 
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
                            </div>

                            <Button
                              asChild
                              className="w-full sunset-gradient text-white mt-auto"
                            >
                              <Link href={`/destinations/${destinationData?.id}/restaurants/${restaurant.slug || restaurant.id}`}>
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
                  {restaurants.length > 3 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button
                        onClick={() => setShowAllRestaurants(!showAllRestaurants)}
                        className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 w-full sm:w-auto"
                      >
                        {showAllRestaurants ? (
                          <>
                            Show Less ({restaurants.length - 3} fewer)
                            <ChevronDown className="w-4 h-4 ml-2 rotate-180" />
                          </>
                        ) : (
                          <>
                            Show {restaurants.length - 3} More Restaurants
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                      <Link
                        href={`/destinations/${destinationData?.id}/restaurants`}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1 justify-center w-full sm:w-auto"
                      >
                        View All Restaurants in {destinationData?.name}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                  {restaurants.length <= 3 && (
                    <div className="mt-6 text-center">
                      <Link
                        href={`/destinations/${destinationData?.id}/restaurants`}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1 justify-center"
                      >
                        View All Restaurants in {destinationData?.name}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Destination Information Section - Only show if results match current destination */}
              {destinationData && searchedDestinationId === destinationData.id && (destinationData.whyVisit || destinationData.highlights || destinationData.bestTimeToVisit || destinationData.gettingAround) && (
                <section className="py-12 bg-gray-50 mt-12">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Why Visit Section */}
                    {destinationData.whyVisit && destinationData.whyVisit.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="mb-12"
                      >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-8 text-center">
                          Why Visit {destinationData.fullName || destinationData.name}?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {destinationData.whyVisit.map((reason, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: index * 0.1 }}
                              viewport={{ once: true }}
                            >
                              <Card className="bg-white border-0 shadow-lg h-full">
                                <CardContent className="p-6">
                                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <Star className="w-6 h-6 text-blue-600" />
                                  </div>
                                  <p className="text-gray-700 leading-relaxed">{reason}</p>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Getting Around & Must-See Attractions - Combined */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                      {/* Getting Around */}
                      {destinationData.gettingAround && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <Card className="bg-blue-50/50 border-0 shadow-sm h-full">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Car className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Getting Around</h3>
                                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{destinationData.gettingAround}</p>
                                  <div className="pt-2 border-t border-gray-100">
                                    <p className="text-gray-600 text-xs mb-2">Prefer renting a car? See options here.</p>
                                    <Link href={`/destinations/${destinationData.id}/car-rentals`} className="block">
                                      <Button variant="outline" size="sm" className="w-full text-xs">
                                        <Car className="w-3 h-3 mr-1.5" />
                                        Find Car Rental Deals
                                        <ArrowRight className="w-3 h-3 ml-1.5" />
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {/* Must-See Attractions */}
                      {destinationData.highlights && destinationData.highlights.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <Card className="bg-purple-50/50 border-0 shadow-sm h-full">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <MapPin className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Must-See Attractions</h3>
                                  <ul className="space-y-2">
                                    {destinationData.highlights.map((highlight, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <span className="text-purple-600 mt-1">•</span>
                                        <span className="text-gray-600 text-sm leading-relaxed">{highlight}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </div>

                    {/* Best Time to Visit */}
                    {destinationData.bestTimeToVisit && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="mb-12"
                      >
                        <div className="text-center mb-8 sm:mb-12">
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-gray-800 mb-4 sm:mb-6">
                            Best Time to Visit
                          </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                          <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                          >
                            {destinationData.bestTimeToVisit.weather && (
                              <div className="flex items-start mb-6">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                                  <Calendar className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Weather</h3>
                                  <p className="text-gray-600">{destinationData.bestTimeToVisit.weather}</p>
                                </div>
                              </div>
                            )}
                            
                            {destinationData.bestTimeToVisit.bestMonths && (
                              <div className="flex items-start mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                  <Clock className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Best Months</h3>
                                  <p className="text-gray-600">{destinationData.bestTimeToVisit.bestMonths}</p>
                                </div>
                              </div>
                            )}
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                          >
                            {destinationData.bestTimeToVisit.peakSeason && (
                              <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-6">
                                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Peak Season</h3>
                                  <p className="text-blue-700">{destinationData.bestTimeToVisit.peakSeason}</p>
                                </CardContent>
                              </Card>
                            )}
                            
                            {destinationData.bestTimeToVisit.offSeason && (
                              <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-6">
                                  <h3 className="text-lg font-semibold text-green-800 mb-2">Off Season</h3>
                                  <p className="text-green-700">{destinationData.bestTimeToVisit.offSeason}</p>
                                </CardContent>
                              </Card>
                            )}
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {/* Link to Full Destination Page */}
                    <div className="text-center">
                      <Button asChild variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                        <Link href={`/destinations/${destinationData.id}`}>
                          Explore More About {destinationData.fullName || destinationData.name}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </section>
              )}

              {/* Related Travel Guides Section - Only show if results match current destination */}
              {destinationData && searchedDestinationId === destinationData.id && categoryGuides.length > 0 && (
                <section className="py-12 bg-white mt-12">
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
                          Related Travel Guides for {destinationData.fullName || destinationData.name}
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
                          // Normalize slug to handle special characters (e.g., "banús" -> "banus")
                          const normalizedSlug = categorySlug
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/&/g, 'and')
                            .replace(/'/g, '')
                            .replace(/\./g, '')
                            .replace(/ /g, '-');
                          const guideUrl = `/destinations/${destinationData.id}/guides/${normalizedSlug}`;
                          
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
                                        ? `Discover the best ${categoryName.toLowerCase()} experiences in ${destinationData.fullName || destinationData.name}.`
                                        : `Explore ${categoryName.toLowerCase()} in ${destinationData.fullName || destinationData.name}.`
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
                          <Link href={`/destinations/${destinationData.id}`}>
                            View All {destinationData.fullName || destinationData.name} Guides
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </section>
              )}
            </div>
          </section>
        )}

        </>
        )}

      </div>

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
            
            {/* Tab Selector */}
            <div className="border-b px-4 pt-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreferencesTab('tours')}
                  className={`flex-1 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                    preferencesTab === 'tours'
                      ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tours
                </button>
                <button
                  type="button"
                  onClick={() => setPreferencesTab('restaurants')}
                  className={`flex-1 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                    preferencesTab === 'restaurants'
                      ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-500'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Restaurants
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Tour Preferences */}
              {preferencesTab === 'tours' && (
                <>
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
                </>
              )}

              {/* Restaurant Preferences */}
              {preferencesTab === 'restaurants' && (
                <>
                  {/* Price Range */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">💰 Price Range</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={localRestaurantPreferences?.priceRange || 'any'}
                      onChange={(e) =>
                        setLocalRestaurantPreferences((prev) => ({
                          ...prev,
                          priceRange: e.target.value,
                        }))
                      }
                    >
                      <option value="any">Any price range</option>
                      <option value="$">$ - Budget friendly</option>
                      <option value="$$">$$ - Moderate</option>
                      <option value="$$$">$$$ - Upscale</option>
                      <option value="$$$$">$$$$ - Fine dining</option>
                    </select>
                  </div>

                  {/* Meal Time */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">🕐 Preferred Meal Time</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={localRestaurantPreferences?.mealTime || 'any'}
                      onChange={(e) =>
                        setLocalRestaurantPreferences((prev) => ({
                          ...prev,
                          mealTime: e.target.value,
                        }))
                      }
                    >
                      <option value="any">Any time</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>

                  {/* Group Size */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">👥 Group Size</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={localRestaurantPreferences?.groupSize || 'any'}
                      onChange={(e) =>
                        setLocalRestaurantPreferences((prev) => ({
                          ...prev,
                          groupSize: e.target.value,
                        }))
                      }
                    >
                      <option value="any">Any group size</option>
                      <option value="solo">Solo dining</option>
                      <option value="couple">Couple / date night</option>
                      <option value="family">Family with children</option>
                      <option value="groups">Large groups</option>
                    </select>
                  </div>

                  {/* Atmosphere */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">🎭 Atmosphere</label>
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
                                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md'
                                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="text-lg mb-0.5">{option.label}</div>
                            <div className="text-[10px] font-semibold text-gray-700">{option.desc}</div>
                            {selected && (
                              <div className="absolute top-1 right-1">
                                <div className="w-3 h-3 rounded-full bg-orange-500 flex items-center justify-center">
                                  <span className="text-white text-[8px]">✓</span>
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dining Style */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">🍽️ Dining Style</label>
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
                                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md'
                                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="text-lg mb-0.5">{option.label}</div>
                            <div className="text-[10px] font-semibold text-gray-700">{option.desc}</div>
                            {selected && (
                              <div className="absolute top-1 right-1">
                                <div className="w-3 h-3 rounded-full bg-orange-500 flex items-center justify-center">
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
                    <label className="block text-xs font-medium text-gray-700 mb-2">✨ Features & Amenities</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'outdoor_seating', label: '🌳 Outdoor Seating' },
                        { value: 'live_music', label: '🎵 Live Music' },
                        { value: 'dog_friendly', label: '🐕 Dog Friendly' },
                        { value: 'family_friendly', label: '👨‍👩‍👧 Family Friendly' },
                        { value: 'reservations', label: '📅 Reservations' },
                      ].map((feature) => {
                        const isSelected = (localRestaurantPreferences?.features || []).includes(feature.value);
                        return (
                          <button
                            key={feature.value}
                            type="button"
                            onClick={() => {
                              const currentFeatures = localRestaurantPreferences?.features || [];
                              setLocalRestaurantPreferences((prev) => ({
                                ...(prev || {}),
                                features: isSelected
                                  ? currentFeatures.filter((f) => f !== feature.value)
                                  : [...currentFeatures, feature.value],
                              }));
                            }}
                            className={`relative p-2.5 rounded-lg border-2 transition-all duration-200 text-left ${
                              isSelected
                                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md'
                                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="text-xs font-semibold text-gray-700">{feature.label}</div>
                            {isSelected && (
                              <div className="absolute top-1 right-1">
                                <div className="w-3 h-3 rounded-full bg-orange-500 flex items-center justify-center">
                                  <span className="text-white text-[8px]">✓</span>
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
              
              <p className="text-xs text-gray-500 text-center pt-2">
                Match scores update instantly as you select preferences
              </p>

              <div className="pt-4 mt-2 border-t flex flex-col gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant="ghost"
                    className="w-full text-gray-600 hover:text-gray-900"
                    onClick={() => {
                      if (preferencesTab === 'tours') {
                        setLocalPreferences({
                          adventureLevel: 50,
                          cultureVsBeach: 50,
                          groupPreference: 50,
                          budgetComfort: 50,
                          structurePreference: 50,
                          foodAndDrinkInterest: 50,
                        });
                      } else {
                        setLocalRestaurantPreferences({
                          atmosphere: 'any',
                          diningStyle: 50,
                          features: [],
                          priceRange: 'any',
                          mealTime: 'any',
                          groupSize: 'any',
                        });
                      }
                    }}
                    title="Reset to defaults"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSavePreferencesToProfile}
                    disabled={savingPreferencesToProfile}
                  >
                    {savingPreferencesToProfile ? 'Saving...' : 'Save to Profile'}
                  </Button>
                  <Button
                    className="w-full sunset-gradient text-white"
                    onClick={() => {
                      // Mark modal as seen when user clicks Done
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('topTours_preferences_modal_seen', 'true');
                      }
                      setShowPreferencesModal(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Restaurant Match Modal */}
      <RestaurantMatchModal
        isOpen={showRestaurantMatchModal}
        onClose={() => setShowRestaurantMatchModal(false)}
        restaurant={selectedRestaurant}
        matchData={selectedRestaurant ? (() => {
          // Calculate match data on the fly
          try {
            if (!selectedRestaurant) return null;
            const structuredValues = extractRestaurantStructuredValues(selectedRestaurant);
            if (!structuredValues || structuredValues.error) return null;
            return calculateRestaurantPreferenceMatch(structuredValues, localRestaurantPreferences);
          } catch (e) {
            console.error('Error calculating match data for modal:', e);
            return null;
          }
        })() : null}
        preferences={localRestaurantPreferences}
        onOpenPreferences={() => {
          setShowRestaurantMatchModal(false);
          setShowPreferencesModal(true);
          setPreferencesTab('restaurants');
        }}
      />
    </>
  );
}

