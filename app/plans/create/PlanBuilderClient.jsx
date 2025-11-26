"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  X,
  Plus,
  Calendar,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Trash2,
  GripVertical,
  UtensilsCrossed,
  BookOpen,
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { toast } from '@/components/ui/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { getSuggestedTipsForItem, getAllTips, PLAN_TIPS } from '@/data/planTips';
import { getDestinationById, destinations } from '@/data/destinationsData';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import Link from 'next/link';
import { getPlanPromotionScore } from '@/lib/promotionSystem';
import { Search } from 'lucide-react';
import ShareModal from '@/components/sharing/ShareModal';

// Use classified destinations (has region/country data) - same as destinations page
const viatorDestinationsClassified = Array.isArray(viatorDestinationsClassifiedData) ? viatorDestinationsClassifiedData : [];

// Helper to generate slug (same as destinations page)
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function PlanBuilderClient({ destinationId, initialPlan = null }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  
  // Plan data
  const [title, setTitle] = useState(initialPlan?.title || '');
  const [description, setDescription] = useState(initialPlan?.description || '');
  // Plans are public by default - shared with the community
  const [isPublic, setIsPublic] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedPlanUrl, setSavedPlanUrl] = useState('');
  
  // Items
  const [planItems, setPlanItems] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // UI state
  const [showTourSelector, setShowTourSelector] = useState(false);
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [planMode, setPlanMode] = useState('favorites'); // 'favorites' or 'itinerary'
  const [visibleDays, setVisibleDays] = useState(new Set([1])); // Track which days should be visible
  const [activeDayForAdd, setActiveDayForAdd] = useState(null); // Track which day is showing the add menu
  const [showAddMenuForDay, setShowAddMenuForDay] = useState(null); // Track which day's add menu is open
  
  // Saved items - using same approach as profile page
  const [savedTours, setSavedTours] = useState([]);
  const [savedRestaurants, setSavedRestaurants] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  
  // Plan promotion score (for existing plans)
  const [planPromotionScore, setPlanPromotionScore] = useState(null);
  
  // Destination search - use same logic as destinations page
  const [destinationSearch, setDestinationSearch] = useState('');
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const destinationSearchRef = useRef(null);
  
  // Load saved bookmarks -> tour and restaurant details (exact same as profile page)
  useEffect(() => {
    const loadSaved = async () => {
      if (!user) return;
      setLoadingSaved(true);
      try {
        // Fetch tour bookmarks
        const toursRes = await fetch(`/api/internal/bookmarks?userId=${encodeURIComponent(user.id)}`);
        const toursJson = await toursRes.json();
        const tourBookmarks = toursJson.bookmarks || [];
        // Fetch product details in parallel
        const tourItems = await Promise.all(
          tourBookmarks.map(async (b) => {
            try {
              const r = await fetch(`/api/internal/viator-product/${encodeURIComponent(b.product_id)}`);
              if (!r.ok) return null;
              const data = await r.json();
              return { productId: b.product_id, tour: data, type: 'tour' };
            } catch {
              return null;
            }
          })
        );
        setSavedTours(tourItems.filter(Boolean));

        // Fetch restaurant bookmarks
        const restaurantsRes = await fetch(`/api/internal/restaurant-bookmarks?userId=${encodeURIComponent(user.id)}`);
        const restaurantsJson = await restaurantsRes.json();
        const restaurantBookmarks = restaurantsJson.bookmarks || [];
        // Fetch restaurant details in parallel
        const restaurantItems = await Promise.all(
          restaurantBookmarks.map(async (b) => {
            try {
              const r = await fetch(`/api/internal/restaurant/${encodeURIComponent(b.restaurant_id)}`);
              if (!r.ok) return null;
              const data = await r.json();
              return { restaurantId: b.restaurant_id, restaurant: data, type: 'restaurant' };
            } catch {
              return null;
            }
          })
        );
        setSavedRestaurants(restaurantItems.filter(Boolean));
      } finally {
        setLoadingSaved(false);
      }
    };
    if (user) loadSaved();
  }, [user]);

  // Load destination data when destinationId changes
  useEffect(() => {
    const loadDestination = async () => {
      if (!destinationId) {
        setSelectedDestination(null);
        return;
      }
      
      // Try curated destinations first
      let dest = getDestinationById(destinationId);
      
      // If not found, try to find in Viator destinations
      if (!dest) {
        const searchLower = destinationId.toLowerCase().trim();
        const classifiedData = Array.isArray(viatorDestinationsClassified) ? viatorDestinationsClassified : [];
        
        // Find by slug or name
        const viatorDest = classifiedData.find(d => {
          const destName = (d.destinationName || d.name || '').toLowerCase().trim();
          const destSlug = generateSlug(destName);
          return destSlug === searchLower || destName === searchLower;
        });
        
        if (viatorDest) {
          dest = {
            id: generateSlug(viatorDest.destinationName || viatorDest.name),
            name: viatorDest.destinationName || viatorDest.name,
            fullName: viatorDest.destinationName || viatorDest.name,
            country: viatorDest.country,
            category: viatorDest.region,
            imageUrl: null,
            destinationId: viatorDest.destinationId?.toString() || viatorDest.id?.toString(),
            isViator: true,
          };
        }
      }
      
      setSelectedDestination(dest);
    };
    
    loadDestination();
  }, [destinationId]);
  
  const destination = selectedDestination;
  
  // Filter destinations based on search - use EXACT same logic as destinations page
  const filteredDestinations = useMemo(() => {
    const searchLower = destinationSearch.toLowerCase().trim();
    
    // Start with curated destinations
    const regularDests = (Array.isArray(destinations) ? destinations : []).map(dest => ({
      ...dest,
      isViator: false,
    }));
    
    // If no search, show first 10 curated
    if (!searchLower) {
      return regularDests.slice(0, 10);
    }
    
    // Filter curated destinations by search
    const curatedMatches = regularDests.filter(dest => 
      dest.name.toLowerCase().includes(searchLower) ||
      (dest.fullName && dest.fullName.toLowerCase().includes(searchLower)) ||
      (dest.country && dest.country.toLowerCase().includes(searchLower))
    );
    
    // Get all Viator destinations (same as destinations page)
    const classifiedData = Array.isArray(viatorDestinationsClassified) ? viatorDestinationsClassified : [];
    
    // Create normalized names from curated destinations for deduplication
    const curatedBaseNames = new Set();
    const curatedFullNames = new Set();
    
    regularDests.forEach(dest => {
      const name = (dest.name || '').toLowerCase().trim();
      const fullName = (dest.fullName || dest.name || '').toLowerCase().trim();
      curatedBaseNames.add(name);
      curatedFullNames.add(fullName);
      const baseName = fullName.split(',')[0].trim();
      if (baseName && baseName !== fullName) {
        curatedBaseNames.add(baseName);
      }
    });
    
    // Helper to check if a Viator destination matches any curated destination
    const matchesCurated = (viatorName) => {
      const normalized = viatorName.toLowerCase().trim();
      const baseName = normalized.split(',')[0].trim();
      if (curatedBaseNames.has(normalized) || curatedFullNames.has(normalized)) {
        return true;
      }
      if (curatedBaseNames.has(baseName) || curatedFullNames.has(baseName)) {
        return true;
      }
      return false;
    };
    
    // Filter and map Viator destinations (same logic as destinations page)
    const seenViatorNames = new Set();
    const viatorDests = classifiedData
      .filter(classifiedDest => {
        const destName = classifiedDest.destinationName || classifiedDest.name || '';
        if (!destName) return false;
        
        const normalized = destName.toLowerCase().trim();
        
        // Skip if it matches a curated destination
        if (matchesCurated(destName)) {
          return false;
        }
        
        // Skip if we've already seen this exact name with the same country
        const country = (classifiedDest.country || '').toLowerCase();
        const nameCountryKey = `${normalized}|${country}`;
        if (seenViatorNames.has(nameCountryKey)) {
          return false;
        }
        
        // Filter by search term
        if (searchLower && !normalized.includes(searchLower) && 
            !(classifiedDest.country || '').toLowerCase().includes(searchLower) &&
            !(classifiedDest.region || '').toLowerCase().includes(searchLower)) {
          return false;
        }
        
        seenViatorNames.add(nameCountryKey);
        return true;
      })
      .map(classifiedDest => {
        const destName = classifiedDest.destinationName || classifiedDest.name || '';
        const slug = generateSlug(destName);
        const region = classifiedDest.region || null;
        const country = classifiedDest.country || null;
        
        return {
          id: slug, // Use slug as ID (same as destinations page)
          name: destName,
          fullName: destName,
          country: country,
          region: region,
          category: region,
          imageUrl: null,
          isViator: true,
          viatorId: classifiedDest.destinationId || classifiedDest.id, // Store original Viator ID
        };
      });
    
    // Combine curated and Viator destinations, remove duplicates more aggressively
    const curatedIds = new Set(curatedMatches.map(d => d.id));
    const curatedNames = new Set(curatedMatches.map(d => (d.name || '').toLowerCase().trim()));
    
    // Filter out Viator destinations that match curated by ID or name
    const uniqueViatorDests = viatorDests.filter(d => {
      const destId = d.id;
      const destName = (d.name || '').toLowerCase().trim();
      // Exclude if ID matches or name matches (case-insensitive)
      return !curatedIds.has(destId) && !curatedNames.has(destName);
    });
    
    // Additional deduplication: remove duplicates within Viator destinations
    const seenViatorKeys = new Set();
    const deduplicatedViatorDests = uniqueViatorDests.filter(d => {
      const key = `${(d.name || '').toLowerCase().trim()}-${(d.country || '').toLowerCase().trim()}`;
      if (seenViatorKeys.has(key)) {
        return false;
      }
      seenViatorKeys.add(key);
      return true;
    });
    
    return [...curatedMatches, ...deduplicatedViatorDests].slice(0, 20);
  }, [destinationSearch]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (destinationSearchRef.current && !destinationSearchRef.current.contains(event.target)) {
        setShowDestinationDropdown(false);
      }
    };
    if (showDestinationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDestinationDropdown]);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to create a plan.',
          variant: 'destructive',
        });
        router.push('/auth');
      }
    };
    checkAuth();
  }, [supabase, router]);

  // Load initial plan items and promotion score
  useEffect(() => {
    if (initialPlan?.items) {
      setPlanItems(initialPlan.items.map(item => {
        // Parse selected_tips from JSON or use selected_tip
        let selected_tips = [];
        try {
          if (item.selected_tip && item.selected_tip.startsWith('[')) {
            selected_tips = JSON.parse(item.selected_tip);
          } else if (item.selected_tips && Array.isArray(item.selected_tips)) {
            selected_tips = item.selected_tips;
          } else if (item.selected_tip) {
            selected_tips = [item.selected_tip];
          }
        } catch {
          if (item.selected_tip) {
            selected_tips = [item.selected_tip];
          }
        }
        
        return {
          id: item.id || `temp-${Date.now()}-${Math.random()}`,
          type: item.item_type,
          product_id: item.product_id,
          restaurant_id: item.restaurant_id,
          day_number: item.day_number,
          order_index: item.order_index || 0,
          selected_tip: selected_tips[0] || null, // Keep for backward compatibility
          selected_tips,
          data: null, // Will be loaded
        };
      }));
    }
    
    // Load promotion score for existing plans
    if (initialPlan?.id) {
      getPlanPromotionScore(initialPlan.id).then(score => {
        setPlanPromotionScore(score);
      }).catch(console.error);
    }
  }, [initialPlan]);

  // Group items by day
  const itemsByDay = useMemo(() => {
    const grouped = {};
    const unassigned = [];
    
    planItems.forEach((item) => {
      if (item.day_number) {
        if (!grouped[item.day_number]) {
          grouped[item.day_number] = [];
        }
        grouped[item.day_number].push(item);
      } else {
        unassigned.push(item);
      }
    });

    // Sort by order_index
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    });
    unassigned.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    return { grouped, unassigned };
  }, [planItems]);

  const maxDay = useMemo(() => {
    const days = Object.keys(itemsByDay.grouped).map(Number);
    return days.length > 0 ? Math.max(...days) : 0;
  }, [itemsByDay]);

  // Auto-generate title
  useEffect(() => {
    if (!title && destination && maxDay > 0) {
      setTitle(`${maxDay} Day${maxDay > 1 ? 's' : ''} in ${destination.fullName || destination.name}`);
    } else if (!title && destination && planItems.length > 0) {
      setTitle(`My ${destination.fullName || destination.name} Plan`);
    }
  }, [title, destination, maxDay, planItems.length]);

  // Update visible days when items are assigned to new days
  useEffect(() => {
    const daysWithItems = new Set(Object.keys(itemsByDay.grouped).map(Number));
    // Always include Day 1, and any days that have items
    setVisibleDays(prev => {
      const newSet = new Set(prev);
      daysWithItems.forEach(day => newSet.add(day));
      if (newSet.size === 0) newSet.add(1); // Ensure Day 1 is always visible
      return newSet;
    });
  }, [itemsByDay.grouped]);

  // Add tour to plan
  const handleAddTour = async (productId) => {
    try {
      // Check if tour is already added
      const isAlreadyAdded = planItems.some(item => item.product_id === productId);
      if (isAlreadyAdded) {
        toast({
          title: 'Already added',
          description: 'This tour is already in your plan.',
          variant: 'default',
        });
        return;
      }

      // Use cached tour data if available, otherwise fetch
      let tour = null;
      const cachedTour = availableTours.find(t => t.product_id === productId);
      if (cachedTour?.tour) {
        tour = cachedTour.tour;
      } else {
        // Fallback: fetch from API if not in cache
        const response = await fetch(`/api/internal/tour/${encodeURIComponent(productId)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tour');
        }
        tour = await response.json();
      }
      
      if (!tour) {
        toast({
          title: 'Error',
          description: 'Could not load tour data.',
          variant: 'destructive',
        });
        return;
      }

      // Auto-assign to the active day if in itinerary mode, otherwise null for favorites mode
      const assignedDay = planMode === 'itinerary' 
        ? (activeDayForAdd || selectedDay || 1) 
        : (planMode === 'favorites' ? null : selectedDay);

      const newItem = {
        id: `temp-${Date.now()}-${Math.random()}`,
        type: 'tour',
        product_id: productId,
        restaurant_id: null,
        day_number: assignedDay,
        order_index: planItems.length,
        selected_tip: null,
        data: tour,
      };

      setPlanItems([...planItems, newItem]);
      setShowTourSelector(false);
      setSelectedDay(null);
      setActiveDayForAdd(null);
      setShowAddMenuForDay(null);
      
      // Auto-expand the day if in itinerary mode
      if (planMode === 'itinerary' && assignedDay) {
        setExpandedDays(new Set([...expandedDays, assignedDay]));
      }
      
      toast({
        title: 'Tour added',
        description: 'Tour added to your plan.',
      });
    } catch (error) {
      console.error('Error adding tour:', error);
      toast({
        title: 'Error',
        description: 'Failed to add tour.',
        variant: 'destructive',
      });
    }
  };

  // Add restaurant to plan
  const handleAddRestaurant = async (restaurantId) => {
    try {
      // Check if restaurant is already added
      const isAlreadyAdded = planItems.some(item => item.restaurant_id === restaurantId);
      if (isAlreadyAdded) {
        toast({
          title: 'Already added',
          description: 'This restaurant is already in your plan.',
          variant: 'default',
        });
        return;
      }

      // Use cached restaurant data if available, otherwise fetch
      let restaurant = null;
      const cachedRestaurant = availableRestaurants.find(r => r.restaurant_id === restaurantId);
      if (cachedRestaurant?.restaurant) {
        restaurant = cachedRestaurant.restaurant;
      } else {
        // Fallback: fetch from API if not in cache
        const response = await fetch(`/api/internal/restaurant/${encodeURIComponent(restaurantId)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch restaurant');
        }
        restaurant = await response.json();
      }
      
      if (!restaurant) {
        toast({
          title: 'Error',
          description: 'Could not load restaurant data.',
          variant: 'destructive',
        });
        return;
      }

      // Auto-assign to the active day if in itinerary mode, otherwise null for favorites mode
      const assignedDay = planMode === 'itinerary' 
        ? (activeDayForAdd || selectedDay || 1) 
        : (planMode === 'favorites' ? null : selectedDay);

      const newItem = {
        id: `temp-${Date.now()}-${Math.random()}`,
        type: 'restaurant',
        product_id: null,
        restaurant_id: restaurantId,
        day_number: assignedDay,
        order_index: planItems.length,
        selected_tip: null,
        data: restaurant,
      };

      setPlanItems([...planItems, newItem]);
      setShowRestaurantSelector(false);
      setSelectedDay(null);
      setActiveDayForAdd(null);
      setShowAddMenuForDay(null);
      
      // Auto-expand the day if in itinerary mode
      if (planMode === 'itinerary' && assignedDay) {
        setExpandedDays(new Set([...expandedDays, assignedDay]));
      }
      
      toast({
        title: 'Restaurant added',
        description: 'Restaurant added to your plan.',
      });
    } catch (error) {
      console.error('Error adding restaurant:', error);
      toast({
        title: 'Error',
        description: 'Failed to add restaurant.',
        variant: 'destructive',
      });
    }
  };

  // Remove item
  const handleRemoveItem = (itemId) => {
    setPlanItems(planItems.filter(item => item.id !== itemId));
  };

  // Update item day
  const handleUpdateItemDay = (itemId, dayNumber) => {
    setPlanItems(planItems.map(item => {
      if (item.id === itemId) {
        return { ...item, day_number: dayNumber || null };
      }
      return item;
    }));
  };

  // Update item tips (add or remove)
  const handleUpdateItemTip = (itemId, tipId, action = 'toggle') => {
    setPlanItems(planItems.map(item => {
      if (item.id === itemId) {
        const currentTips = item.selected_tips || (item.selected_tip ? [item.selected_tip] : []);
        let newTips;
        
        if (action === 'add') {
          // Add tip if not already present and under limit
          if (!currentTips.includes(tipId) && currentTips.length < 3) {
            newTips = [...currentTips, tipId];
          } else {
            newTips = currentTips;
          }
        } else if (action === 'remove') {
          // Remove tip
          newTips = currentTips.filter(t => t !== tipId);
        } else {
          // Toggle: add if not present, remove if present
          if (currentTips.includes(tipId)) {
            newTips = currentTips.filter(t => t !== tipId);
          } else if (currentTips.length < 3) {
            newTips = [...currentTips, tipId];
          } else {
            newTips = currentTips;
          }
        }
        
        return { ...item, selected_tips: newTips, selected_tip: newTips[0] || null }; // Keep selected_tip for backward compatibility
      }
      return item;
    }));
  };

  // Save plan
  const handleSave = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save your plan.',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your plan.',
        variant: 'destructive',
      });
      return;
    }

    if (!destinationId) {
      toast({
        title: 'Destination required',
        description: 'Please select a destination for this plan.',
        variant: 'destructive',
      });
      return;
    }

    if (planItems.length === 0) {
      toast({
        title: 'Plan is empty',
        description: 'Please add at least one tour or restaurant to your plan.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const itemsToSave = planItems.map((item, index) => ({
        type: item.type,
        product_id: item.product_id,
        restaurant_id: item.restaurant_id,
        day_number: item.day_number,
        order_index: item.order_index !== undefined ? item.order_index : index,
        selected_tip: item.selected_tips?.[0] || item.selected_tip || null, // Keep for backward compatibility
        selected_tips: item.selected_tips || (item.selected_tip ? [item.selected_tip] : []),
      }));

      const coverImage = planItems.find(item => item.data?.images?.[0]?.variants?.[3]?.url || item.data?.heroImage)?.data?.images?.[0]?.variants?.[3]?.url || planItems.find(item => item.data?.heroImage)?.data?.heroImage || null;

      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: initialPlan ? 'update' : 'create',
          userId: user.id,
          planId: initialPlan?.id,
          title: title.trim(),
          destination_id: destinationId,
          description: description.trim() || null,
          cover_image_url: coverImage,
          is_public: isPublic,
          plan_mode: planMode, // 'favorites' or 'itinerary'
          items: itemsToSave,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Plan saved!',
        description: 'Your plan has been saved successfully.',
      });

      // Store the plan URL and show share modal
      const planUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/plans/${data.plan.slug}`
        : `/plans/${data.plan.slug}`;
      
      setSavedPlanUrl(planUrl);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Get available tours (from saved tours with full data)
  const availableTours = useMemo(() => {
    return savedTours.map(({ productId, tour }) => ({
      product_id: productId,
      tour_title: tour?.seo?.title || tour?.title || 'Tour',
      tour: tour, // Include full tour data
    }));
  }, [savedTours]);

  // Get available restaurants (from saved restaurants with full data)
  const availableRestaurants = useMemo(() => {
    return savedRestaurants.map(({ restaurantId, restaurant }) => ({
      restaurant_id: restaurantId,
      restaurant_name: restaurant?.name || 'Restaurant',
      restaurant: restaurant, // Include full restaurant data
    }));
  }, [savedRestaurants]);

  return (
    <>
      <NavigationNext />
      
      <div className="min-h-screen pt-16 overflow-x-hidden bg-gradient-to-b from-gray-50 via-white to-white">
        {/* Hero Header */}
        <section className="relative py-20 sm:py-24 md:py-28 overflow-hidden -mt-12 sm:-mt-16 ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                {initialPlan ? 'Edit Your Plan' : 'Create Your Travel Plan'}
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-6">
                Share your favorite tours and restaurants, or create a day-by-day itinerary
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Plan Mode Selection - Prominent Cards */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Plan Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 h-full ${
                      planMode === 'favorites' 
                        ? 'ring-2 ring-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50' 
                        : 'hover:shadow-md border-2 hover:border-blue-300'
                    }`}
                    onClick={() => {
                      setPlanMode('favorites');
                      setPlanItems(planItems.map(item => ({ ...item, day_number: null })));
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          planMode === 'favorites' ? 'bg-blue-600' : 'bg-gray-200'
                        }`}>
                          <Eye className={`w-6 h-6 ${planMode === 'favorites' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">Create a Collection</h3>
                          <p className="text-sm text-gray-600">
                            Create a collection of your favorite tours and restaurants to share with others
                          </p>
                        </div>
                        {planMode === 'favorites' && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 h-full ${
                      planMode === 'itinerary' 
                        ? 'ring-2 ring-orange-500 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50' 
                        : 'hover:shadow-md border-2 hover:border-orange-300'
                    }`}
                    onClick={() => {
                      setPlanMode('itinerary');
                      const unassignedItems = planItems.filter(item => !item.day_number);
                      if (unassignedItems.length > 0) {
                        setPlanItems(planItems.map(item => 
                          !item.day_number ? { ...item, day_number: 1 } : item
                        ));
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          planMode === 'itinerary' ? 'bg-orange-600' : 'bg-gray-200'
                        }`}>
                          <Calendar className={`w-6 h-6 ${planMode === 'itinerary' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">Create Itinerary</h3>
                          <p className="text-sm text-gray-600">
                            Build a day-by-day itinerary with organized activities and dining
                          </p>
                        </div>
                        {planMode === 'itinerary' && (
                          <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Plan Details Card */}
            <Card className="mb-8 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Plan Title
                    </label>
                    <Input
                      placeholder={planMode === 'favorites' ? 'e.g., My Aruba Favorites' : 'e.g., 3 Days in Aruba'}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xl font-bold border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <Textarea
                      placeholder="Tell others about your plan..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="resize-none border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Destination Selection - Required */}
            <Card className={`mb-8 border-2 bg-gradient-to-br from-blue-50 to-purple-50 ${
              !destinationId ? 'border-red-300 bg-red-50/50' : 'border-blue-200'
            }`}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-1 text-gray-900 flex items-center gap-2">
                  Select Destination
                  <span className="text-red-500 text-sm font-normal">(Required)</span>
                </h3>
                {!destinationId && (
                  <p className="text-sm text-red-600 mb-4">Please select a destination to continue.</p>
                )}
                {destination ? (
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-blue-300">
                    <div className="flex items-center gap-3">
                      {destination.imageUrl && (
                        <img
                          src={destination.imageUrl}
                          alt={destination.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{destination.fullName || destination.name}</div>
                        <div className="text-sm text-gray-500">{destination.country || destination.category}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        router.push(`/plans/create`);
                        setDestinationSearch('');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="relative" ref={destinationSearchRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Search destinations (e.g., Aruba, Bali, Paris)... *"
                        value={destinationSearch}
                        onChange={(e) => {
                          setDestinationSearch(e.target.value);
                          setShowDestinationDropdown(true);
                        }}
                        onFocus={() => setShowDestinationDropdown(true)}
                        className={`pl-10 pr-4 py-3 text-lg border-2 rounded-lg ${
                          !destinationId ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        required
                      />
                    </div>
                    
                    {showDestinationDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        {filteredDestinations.length > 0 ? (
                          filteredDestinations.map((dest, index) => {
                            const destId = dest.id;
                            const destName = dest.name || dest.fullName || '';
                            const destCountry = dest.country || dest.region || '';
                            // Use a unique key combining id, name, and index to avoid duplicates
                            const uniqueKey = `${destId || destName}-${dest.isViator ? 'viator' : 'curated'}-${index}`;
                            
                            return (
                              <button
                                key={uniqueKey}
                                onClick={(e) => {
                                  e.preventDefault();
                                  // Update URL without full page reload
                                  const newUrl = `/plans/create?destination=${destId}`;
                                  window.history.pushState({}, '', newUrl);
                                  
                                  // Update destination immediately
                                  let dest = getDestinationById(destId);
                                  if (!dest) {
                                    // If not in curated, create from Viator data
                                    dest = {
                                      id: destId,
                                      name: destName,
                                      fullName: destName,
                                      country: destCountry,
                                      category: dest.region || dest.category,
                                      imageUrl: dest.imageUrl || null,
                                      isViator: dest.isViator || false,
                                      viatorId: dest.viatorId,
                                    };
                                  }
                                  setSelectedDestination(dest);
                                  
                                  // Clear search and close dropdown
                                  setDestinationSearch(destName); // Show selected destination name
                                  setShowDestinationDropdown(false);
                                }}
                                className="w-full text-left p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center gap-3">
                                  {dest.imageUrl && (
                                    <img
                                      src={dest.imageUrl}
                                      alt={destName}
                                      className="w-10 h-10 object-cover rounded-lg"
                                    />
                                  )}
                                  {!dest.imageUrl && (
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                      <MapPin className="w-5 h-5 text-blue-600" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{destName}</div>
                                    <div className="text-sm text-gray-500">{destCountry || dest.category}</div>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-gray-500">No destinations found</div>
                        )}
                      </div>
                    )}
                    
                    {showDestinationDropdown && destinationSearch.trim() && filteredDestinations.length === 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4">
                        <p className="text-sm text-gray-500">No destinations found. Try a different search term.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Sidebar - Saved Items */}
              <div className="lg:col-span-1">
                <Card className="sticky top-32 shadow-lg border-2">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-blue-600" />
                      Add from Saved
                      <div className="relative group">
                        <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                        <div className="absolute left-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <p className="mb-1 font-semibold">How to save tours and restaurants:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-300">
                            <li>Click the <strong>save button</strong> at the top of tour or restaurant pages</li>
                            <li>Or click the <strong>heart icon</strong> ❤️ on any tour or restaurant card</li>
                          </ul>
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                      <Button
                        onClick={() => {
                          setShowTourSelector(!showTourSelector);
                          setShowRestaurantSelector(false);
                        }}
                        variant={showTourSelector ? 'default' : 'outline'}
                        className={`w-full justify-start h-auto py-3 ${
                          showTourSelector ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
                        }`}
                      >
                        <BookOpen className="w-5 h-5 mr-2" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Tours</div>
                          <div className="text-xs opacity-75">{availableTours.length} saved</div>
                        </div>
                      </Button>
                      
                      <Button
                        onClick={() => {
                          setShowRestaurantSelector(!showRestaurantSelector);
                          setShowTourSelector(false);
                        }}
                        variant={showRestaurantSelector ? 'default' : 'outline'}
                        className={`w-full justify-start h-auto py-3 ${
                          showRestaurantSelector ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''
                        }`}
                      >
                        <UtensilsCrossed className="w-5 h-5 mr-2" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Restaurants</div>
                          <div className="text-xs opacity-75">{availableRestaurants.length} saved</div>
                        </div>
                      </Button>
                    </div>

                    {showTourSelector && (
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {loadingSaved ? (
                          <p className="text-sm text-gray-500">Loading...</p>
                        ) : availableTours.length === 0 ? (
                          <p className="text-sm text-gray-500">No saved tours. Save tours to add them to your plan.</p>
                        ) : (
                          availableTours.map((bookmark) => {
                            const isAlreadyAdded = planItems.some(item => item.product_id === bookmark.product_id);
                            return (
                              <Button
                                key={bookmark.product_id}
                                onClick={() => handleAddTour(bookmark.product_id)}
                                variant="ghost"
                                disabled={isAlreadyAdded}
                                className={`w-full justify-start text-left h-auto p-2 ${
                                  isAlreadyAdded 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <div className={`text-sm ${isAlreadyAdded ? 'text-gray-400' : ''}`}>
                                  <div className="font-medium">{bookmark.tour_title || 'Tour'}</div>
                                  <div className={`text-xs ${isAlreadyAdded ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {isAlreadyAdded ? 'Already added' : 'Click to add'}
                                  </div>
                                </div>
                              </Button>
                            );
                          })
                        )}
                      </div>
                    )}

                    {showRestaurantSelector && (
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {loadingSaved ? (
                          <p className="text-sm text-gray-500">Loading...</p>
                        ) : availableRestaurants.length === 0 ? (
                          <p className="text-sm text-gray-500">No saved restaurants. Save restaurants to add them to your plan.</p>
                        ) : (
                          availableRestaurants.map((bookmark) => {
                            const isAlreadyAdded = planItems.some(item => item.restaurant_id === bookmark.restaurant_id);
                            return (
                              <Button
                                key={bookmark.restaurant_id}
                                onClick={() => handleAddRestaurant(bookmark.restaurant_id)}
                                variant="ghost"
                                disabled={isAlreadyAdded}
                                className={`w-full justify-start text-left h-auto p-2 ${
                                  isAlreadyAdded 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <div className={`text-sm ${isAlreadyAdded ? 'text-gray-400' : ''}`}>
                                  <div className="font-medium">{bookmark.restaurant_name || 'Restaurant'}</div>
                                  <div className={`text-xs ${isAlreadyAdded ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {isAlreadyAdded ? 'Already added' : 'Click to add'}
                                  </div>
                                </div>
                              </Button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Middle - Plan Canvas */}
              <div className="lg:col-span-2">
                {/* Save Button - Fixed at top */}
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          <strong>Sharing with the Community:</strong> Your plan will be publicly shared so others can discover and upvote it. Your username will be displayed as the creator. Plans cannot be edited after publishing, but you can remove them anytime from your{' '}
                          <Link href="/profile" className="text-blue-600 hover:underline font-semibold">profile page</Link>.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={saving || !title.trim() || planItems.length === 0 || !destinationId}
                      className="sunset-gradient text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : initialPlan ? 'Update Plan' : 'Save and Share Plan with the Community'}
                    </Button>
                  </div>
                </div>
                {planMode === 'favorites' ? (
                  /* Favorites Mode - Simple List */
                  <>
                    {planItems.length === 0 ? (
                      <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white">
                        <CardContent className="p-12 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <Eye className="w-8 h-8 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-bold mb-2 text-gray-900">Create a Collection</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Add tours and restaurants from your saved items to create a shareable collection.
                          </p>
                          <Button
                            onClick={() => setShowTourSelector(true)}
                            className="sunset-gradient text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Item
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {planItems.map((item) => (
                          <PlanItemEditor
                            key={item.id}
                            item={item}
                            onRemove={handleRemoveItem}
                            onUpdateDay={handleUpdateItemDay}
                            onUpdateTip={handleUpdateItemTip}
                            maxDay={maxDay}
                            showDaySelector={false}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* Itinerary Mode - Days */
                  <>
                    {/* Days - Show all visible days (including empty ones) */}
                    {Array.from(visibleDays).sort((a, b) => Number(a) - Number(b)).map((dayNum) => {
                      const dayItems = itemsByDay.grouped[dayNum] || [];
                      const isExpanded = expandedDays.has(Number(dayNum));
                      
                      return (
                        <Card key={dayNum} className="mb-4 shadow-md border-2 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div 
                              className="flex items-center justify-between mb-4 cursor-pointer"
                              onClick={() => {
                                const newExpanded = new Set(expandedDays);
                                if (!isExpanded) {
                                  newExpanded.add(Number(dayNum));
                                  setExpandedDays(newExpanded);
                                  // Auto-show add menu when expanding
                                  if (showAddMenuForDay !== Number(dayNum)) {
                                    setShowAddMenuForDay(Number(dayNum));
                                    setActiveDayForAdd(Number(dayNum));
                                  }
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold text-lg">
                                  {dayNum}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Day {dayNum}</h3>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newExpanded = new Set(expandedDays);
                                  if (isExpanded) {
                                    newExpanded.delete(Number(dayNum));
                                    setShowAddMenuForDay(null);
                                  } else {
                                    newExpanded.add(Number(dayNum));
                                    // Auto-show add menu when expanding
                                    if (showAddMenuForDay !== Number(dayNum)) {
                                      setShowAddMenuForDay(Number(dayNum));
                                      setActiveDayForAdd(Number(dayNum));
                                    }
                                  }
                                  setExpandedDays(newExpanded);
                                }}
                                className="hover:bg-gray-100"
                              >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </Button>
                            </div>
                            
                            {isExpanded && (
                              <div className="space-y-3">
                                {dayItems.map((item) => (
                                  <PlanItemEditor
                                    key={item.id}
                                    item={item}
                                    onRemove={handleRemoveItem}
                                    onUpdateDay={handleUpdateItemDay}
                                    onUpdateTip={handleUpdateItemTip}
                                    maxDay={maxDay}
                                    showDaySelector={false}
                                  />
                                ))}
                                
                                {/* Add Menu for this day */}
                                {showAddMenuForDay === Number(dayNum) ? (
                                  <Card className="border-2 border-orange-200 bg-orange-50/50">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-sm text-gray-900">Add to Day {dayNum}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setShowAddMenuForDay(null);
                                            setShowTourSelector(false);
                                            setShowRestaurantSelector(false);
                                          }}
                                          className="h-6 w-6 p-0"
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                      <div className="flex gap-2 mb-3">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setActiveDayForAdd(Number(dayNum));
                                            setShowTourSelector(true);
                                            setShowRestaurantSelector(false);
                                          }}
                                          className="flex-1 border-blue-300 hover:bg-blue-50"
                                        >
                                          <BookOpen className="w-4 h-4 mr-2" />
                                          Add Tour
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setActiveDayForAdd(Number(dayNum));
                                            setShowRestaurantSelector(true);
                                            setShowTourSelector(false);
                                          }}
                                          className="flex-1 border-orange-300 hover:bg-orange-50"
                                        >
                                          <UtensilsCrossed className="w-4 h-4 mr-2" />
                                          Add Restaurant
                                        </Button>
                                      </div>
                                      
                                      {/* Tour Selector */}
                                      {showTourSelector && activeDayForAdd === Number(dayNum) && (
                                        <div className="max-h-64 overflow-y-auto space-y-2 border-t pt-3 mt-3">
                                          {loadingSaved ? (
                                            <p className="text-sm text-gray-500">Loading...</p>
                                          ) : availableTours.length === 0 ? (
                                            <p className="text-sm text-gray-500">No saved tours.</p>
                                          ) : (
                                            availableTours.map((bookmark) => {
                                              const isAlreadyAdded = planItems.some(item => item.product_id === bookmark.product_id);
                                              return (
                                                <Button
                                                  key={bookmark.product_id}
                                                  onClick={() => handleAddTour(bookmark.product_id)}
                                                  variant="ghost"
                                                  disabled={isAlreadyAdded}
                                                  className={`w-full justify-start text-left h-auto p-2 ${
                                                    isAlreadyAdded 
                                                      ? 'opacity-50 cursor-not-allowed' 
                                                      : 'hover:bg-gray-100'
                                                  }`}
                                                >
                                                  <div className={`text-sm ${isAlreadyAdded ? 'text-gray-400' : ''}`}>
                                                    <div className="font-medium">{bookmark.tour_title || 'Tour'}</div>
                                                    <div className={`text-xs ${isAlreadyAdded ? 'text-gray-400' : 'text-gray-500'}`}>
                                                      {isAlreadyAdded ? 'Already added' : 'Click to add'}
                                                    </div>
                                                  </div>
                                                </Button>
                                              );
                                            })
                                          )}
                                        </div>
                                      )}
                                      
                                      {/* Restaurant Selector */}
                                      {showRestaurantSelector && activeDayForAdd === Number(dayNum) && (
                                        <div className="max-h-64 overflow-y-auto space-y-2 border-t pt-3 mt-3">
                                          {loadingSaved ? (
                                            <p className="text-sm text-gray-500">Loading...</p>
                                          ) : availableRestaurants.length === 0 ? (
                                            <p className="text-sm text-gray-500">No saved restaurants.</p>
                                          ) : (
                                            availableRestaurants.map((bookmark) => {
                                              const isAlreadyAdded = planItems.some(item => item.restaurant_id === bookmark.restaurant_id);
                                              return (
                                                <Button
                                                  key={bookmark.restaurant_id}
                                                  onClick={() => handleAddRestaurant(bookmark.restaurant_id)}
                                                  variant="ghost"
                                                  disabled={isAlreadyAdded}
                                                  className={`w-full justify-start text-left h-auto p-2 ${
                                                    isAlreadyAdded 
                                                      ? 'opacity-50 cursor-not-allowed' 
                                                      : 'hover:bg-gray-100'
                                                  }`}
                                                >
                                                  <div className={`text-sm ${isAlreadyAdded ? 'text-gray-400' : ''}`}>
                                                    <div className="font-medium">{bookmark.restaurant_name || 'Restaurant'}</div>
                                                    <div className={`text-xs ${isAlreadyAdded ? 'text-gray-400' : 'text-gray-500'}`}>
                                                      {isAlreadyAdded ? 'Already added' : 'Click to add'}
                                                    </div>
                                                  </div>
                                                </Button>
                                              );
                                            })
                                          )}
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ) : (
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setShowAddMenuForDay(Number(dayNum));
                                      setActiveDayForAdd(Number(dayNum));
                                      setExpandedDays(new Set([...expandedDays, Number(dayNum)]));
                                    }}
                                    className="w-full border-dashed border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50/50"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Tour or Restaurant
                                  </Button>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* Add Day Button */}
                    <Card className="mb-4 border-dashed border-2 border-orange-300 hover:border-orange-500 transition-all bg-gradient-to-br from-orange-50/50 to-yellow-50/50">
                      <CardContent className="p-6">
                        <Button
                          onClick={() => {
                            const nextDay = Math.max(maxDay, 1) + 1;
                            // Add the new day to visible days and expand it
                            setVisibleDays(new Set([...visibleDays, nextDay]));
                            setExpandedDays(new Set([...expandedDays, nextDay]));
                          }}
                          variant="ghost"
                          className="w-full h-auto py-6 flex flex-col items-center gap-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50/50"
                        >
                          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <Plus className="w-6 h-6" />
                          </div>
                          <span className="font-semibold text-lg">Add Day {Math.max(maxDay, 1) + 1}</span>
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Unassigned Items */}
                    {itemsByDay.unassigned.length > 0 && (
                      <Card className="mb-4 border-orange-200 bg-orange-50">
                        <CardContent className="p-4">
                          <h3 className="text-lg font-bold mb-4 text-gray-900">Unassigned Items</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Assign these items to a day or they'll be shown as favorites.
                          </p>
                          <div className="space-y-3">
                            {itemsByDay.unassigned.map((item) => (
                              <PlanItemEditor
                                key={item.id}
                                item={item}
                                onRemove={handleRemoveItem}
                                onUpdateDay={handleUpdateItemDay}
                                onUpdateTip={handleUpdateItemTip}
                                maxDay={maxDay}
                                showDaySelector={false}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Empty State for Itinerary */}
                    {planItems.length === 0 && (
                      <Card className="border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
                        <CardContent className="p-12 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-orange-600" />
                          </div>
                          <h3 className="text-xl font-bold mb-2 text-gray-900">Start Your Itinerary</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Add tours and restaurants from your saved items to create your day-by-day itinerary.
                          </p>
                          <Button
                            onClick={() => setShowTourSelector(true)}
                            className="sunset-gradient text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Item
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

              </div>
            </div>
          </div>
        </section>
      </div>

      <FooterNext />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          // Navigate to plan page after closing modal
          if (savedPlanUrl) {
            router.push(savedPlanUrl.replace(window.location.origin, ''));
          }
        }}
        title={title || 'this plan'}
        url={savedPlanUrl}
      />
    </>
  );
}

// Plan Item Editor Component
function PlanItemEditor({ item, onRemove, onUpdateDay, onUpdateTip, maxDay, showDaySelector = true }) {
  const [showTipsMenu, setShowTipsMenu] = useState(false);
  const tipsMenuRef = useRef(null);
  const suggestedTips = getSuggestedTipsForItem(item.type);

  const itemName = item.data?.title || item.data?.name || (item.type === 'tour' ? 'Tour' : 'Restaurant');
  const itemImage = item.data?.images?.[0]?.variants?.[3]?.url || item.data?.heroImage || '';

  // Get current tip count
  const currentTipCount = (item.selected_tips || (item.selected_tip ? [item.selected_tip] : [])).length;

  // Close tips menu automatically when 3 tips are selected
  useEffect(() => {
    if (currentTipCount >= 3 && showTipsMenu) {
      setShowTipsMenu(false);
    }
  }, [currentTipCount, showTipsMenu]);

  // Close tips menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tipsMenuRef.current && !tipsMenuRef.current.contains(event.target)) {
        setShowTipsMenu(false);
      }
    };

    if (showTipsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTipsMenu]);

  return (
    <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {itemImage && (
            <img
              src={itemImage}
              alt={itemName}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{itemName}</h4>
                <div className="flex items-center gap-2">
                  {item.type === 'tour' ? (
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Tour
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                      <UtensilsCrossed className="w-3 h-3 mr-1" />
                      Restaurant
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Tips Section - Multiple Tips (up to 3) */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {(item.selected_tips || (item.selected_tip ? [item.selected_tip] : [])).map((tipId) => {
                  const tipObj = getAllTips().find(t => t.id === tipId);
                  if (!tipObj) return null;
                  const TipIcon = tipObj.icon;
                  return (
                    <Badge 
                      key={tipId}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-3 py-1.5 flex items-center gap-2"
                    >
                      {TipIcon && <TipIcon className="w-3.5 h-3.5" />}
                      <span className="font-medium">{tipObj.label}</span>
                      <button
                        onClick={() => onUpdateTip(item.id, tipId, 'remove')}
                        className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
              
              {(item.selected_tips || (item.selected_tip ? [item.selected_tip] : [])).length < 3 && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTipsMenu(!showTipsMenu)}
                    className="text-xs border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                  >
                    <Plus className="w-3 h-3 mr-1.5" />
                    Add Tip {((item.selected_tips || (item.selected_tip ? [item.selected_tip] : [])).length > 0) && `(${3 - (item.selected_tips || (item.selected_tip ? [item.selected_tip] : [])).length} remaining)`}
                  </Button>
                  
                  {showTipsMenu && (
                    <div 
                      ref={tipsMenuRef}
                      className="absolute top-full left-0 mt-2 z-50 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-3 min-w-[280px] max-w-md"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900">Select a Tip</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTipsMenu(false)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {suggestedTips
                          .filter(tipOption => !(item.selected_tips || (item.selected_tip ? [item.selected_tip] : [])).includes(tipOption.id))
                          .map((tipOption) => {
                            const Icon = tipOption.icon;
                            return (
                              <button
                                key={tipOption.id}
                                onClick={() => {
                                  onUpdateTip(item.id, tipOption.id, 'add');
                                  // Menu will close automatically via useEffect when 3 tips are reached
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-left text-xs rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                              >
                                {Icon && <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                                <span className="font-medium text-gray-700">{tipOption.label}</span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

