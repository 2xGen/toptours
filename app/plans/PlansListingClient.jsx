"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  TrendingUp,
  Users,
  ArrowRight,
  Plus,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { getDestinationById } from '@/data/destinationsData';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import PlanPromotionCard from '@/components/promotion/PlanPromotionCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import RequireAuthModal from '@/components/auth/RequireAuthModal';

export default function PlansListingClient({ destinationId, initialPlans = [] }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState(initialPlans);
  const [userPlans, setUserPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUserPlans, setLoadingUserPlans] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedPlanType, setSelectedPlanType] = useState('all');
  const [planPromotionScores, setPlanPromotionScores] = useState({});
  const [planDetails, setPlanDetails] = useState({}); // { planId: { creatorName, days, toursCount, restaurantsCount } }
  const [allPlans, setAllPlans] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([]);
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectUrl, setAuthRedirectUrl] = useState(null);

  const destination = destinationId ? getDestinationById(destinationId) : null;
  
  const handleRequireAuth = (redirectUrl = null) => {
    setAuthRedirectUrl(redirectUrl);
    setShowAuthModal(true);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Fetch user's saved plans if logged in
      if (user) {
        setLoadingUserPlans(true);
        try {
          const response = await fetch(`/api/internal/user-plans?userId=${encodeURIComponent(user.id)}`);
          if (response.ok) {
            const data = await response.json();
            setUserPlans(data.plans || []);
          }
        } catch (error) {
          console.error('Error fetching user plans:', error);
        } finally {
          setLoadingUserPlans(false);
        }
      }
    };
    checkAuth();
  }, [supabase]);

  // Fetch promotion scores and plan details for all plans
  useEffect(() => {
    const fetchPlanData = async () => {
      const allPlanIds = [...userPlans, ...plans].map(p => p.id).filter(Boolean);
      if (allPlanIds.length === 0) return;

      try {
        const scores = {};
        const details = {};
        
        await Promise.all(
          allPlanIds.map(async (planId) => {
            try {
              // Fetch promotion score
              const scoreResponse = await fetch(`/api/internal/promotion/plan-score?planId=${planId}`);
              if (scoreResponse.ok) {
                const scoreData = await scoreResponse.json();
                scores[planId] = scoreData;
              }
              
              // Fetch plan details (creator, items)
              const detailsResponse = await fetch(`/api/internal/plan-details?planId=${planId}`);
              if (detailsResponse.ok) {
                const detailsData = await detailsResponse.json();
                details[planId] = detailsData;
              }
            } catch (error) {
              console.error(`Error fetching data for plan ${planId}:`, error);
            }
          })
        );
        
        setPlanPromotionScores(scores);
        setPlanDetails(details);
      } catch (error) {
        console.error('Error fetching plan data:', error);
      }
    };

    if (userPlans.length > 0 || plans.length > 0) {
      fetchPlanData();
    }
  }, [userPlans, plans]);

  // Helper function to get destination info (curated or database) - async
  const getDestinationInfo = async (destinationId) => {
    if (!destinationId) return null;
    
    // Try curated destinations first (synchronous)
    let destination = getDestinationById(destinationId);
    
    // If not found in curated, fetch from API (which uses server-side functions)
    if (!destination) {
      try {
        const response = await fetch(`/api/internal/destination-info?destinationId=${encodeURIComponent(destinationId)}`);
        if (response.ok) {
          const data = await response.json();
          destination = data.destination;
        }
      } catch (error) {
        console.error('Error fetching destination info:', error);
      }
    }
    
    return destination;
  };

  // Combine popular plans and user's saved plans with destination info
  useEffect(() => {
    const fetchPlansWithDestinations = async () => {
      // Remove duplicates (user plans might overlap with popular plans)
      const planIds = new Set();
      const combined = [];
      const regions = new Set();
      
      // Add user plans first (so they appear at the top)
      for (const plan of userPlans) {
        if (!planIds.has(plan.id)) {
          planIds.add(plan.id);
          const dest = await getDestinationInfo(plan.destination_id);
          const region = dest?.category || dest?.region;
          
          // Normalize region names to match destination page categories
          let normalizedRegion = region;
          if (normalizedRegion) {
            // Map common region names to match destination page categories
            const regionMap = {
              'North America': 'North America',
              'Central America': 'North America', // Central America is often grouped with North America
              'South America': 'South America',
              'Europe': 'Europe',
              'Asia': 'Asia-Pacific',
              'Asia-Pacific': 'Asia-Pacific',
              'Africa': 'Africa',
              'Middle East': 'Middle East',
              'Caribbean': 'Caribbean',
              'Oceania': 'Asia-Pacific',
            };
            normalizedRegion = regionMap[normalizedRegion] || normalizedRegion;
            regions.add(normalizedRegion);
          }
          
          combined.push({ 
            ...plan, 
            isUserPlan: true,
            region: normalizedRegion || null,
            destination: dest // Store full destination object
          });
        }
      }
      
      // Add popular plans
      for (const plan of plans) {
        if (!planIds.has(plan.id)) {
          planIds.add(plan.id);
          const dest = await getDestinationInfo(plan.destination_id);
          const region = dest?.category || dest?.region;
          
          // Normalize region names to match destination page categories
          let normalizedRegion = region;
          if (normalizedRegion) {
            // Map common region names to match destination page categories
            const regionMap = {
              'North America': 'North America',
              'Central America': 'North America', // Central America is often grouped with North America
              'South America': 'South America',
              'Europe': 'Europe',
              'Asia': 'Asia-Pacific',
              'Asia-Pacific': 'Asia-Pacific',
              'Africa': 'Africa',
              'Middle East': 'Middle East',
              'Caribbean': 'Caribbean',
              'Oceania': 'Asia-Pacific',
            };
            normalizedRegion = regionMap[normalizedRegion] || normalizedRegion;
            regions.add(normalizedRegion);
          }
          
          combined.push({ 
            ...plan, 
            isUserPlan: false,
            region: normalizedRegion || null,
            destination: dest // Store full destination object
          });
        }
      }
      
      setAllPlans(combined);
      setAvailableRegions(Array.from(regions).sort());
      
      // Also fetch plan details after destinations are loaded
      const scores = { ...planPromotionScores };
      const details = { ...planDetails };
      
      await Promise.all(
        combined.map(async (plan) => {
          const planId = plan.id;
          
          // Only fetch if we don't already have the data
          if (!scores[planId] || !details[planId]) {
            try {
              // Fetch promotion score
              if (!scores[planId]) {
                const scoreResponse = await fetch(`/api/internal/promotion/plan-score?planId=${planId}`);
                if (scoreResponse.ok) {
                  const scoreData = await scoreResponse.json();
                  scores[planId] = scoreData;
                }
              }
              
              // Fetch plan details (creator, items)
              if (!details[planId]) {
                const detailsResponse = await fetch(`/api/internal/plan-details?planId=${planId}`);
                if (detailsResponse.ok) {
                  const detailsData = await detailsResponse.json();
                  details[planId] = detailsData;
                  // Debug logging
                  console.log(`Plan ${planId} details:`, detailsData, 'creatorName:', detailsData.creatorName);
                } else {
                  console.error(`Failed to fetch details for plan ${planId}:`, detailsResponse.status);
                }
              }
            } catch (error) {
              console.error(`Error fetching data for plan ${planId}:`, error);
            }
          }
        })
      );
      
      setPlanPromotionScores(scores);
      setPlanDetails(details);
    };
    
    if (userPlans.length > 0 || plans.length > 0) {
      fetchPlansWithDestinations();
    } else {
      setAllPlans([]);
      setAvailableRegions([]);
    }
  }, [plans, userPlans]);

  const filteredPlans = allPlans.filter(plan => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = plan.title?.toLowerCase().includes(search) ||
                           plan.description?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    
    // Region filter
    if (selectedRegion && selectedRegion !== 'all') {
      if (plan.region !== selectedRegion) return false;
    }
    
    // Plan type filter
    if (selectedPlanType && selectedPlanType !== 'all') {
      if (plan.plan_mode !== selectedPlanType) return false;
    }
    
    return true;
  });

  return (
    <>
      <NavigationNext />
      
      <div className="min-h-screen pt-16 overflow-x-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 md:py-28 overflow-hidden -mt-12 sm:-mt-16 ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-4 md:mb-6 text-white">
                Community Travel Plans
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Discover amazing travel plans created by the TopTours.ai™ community. Get inspired, copy plans, and create your own!
              </p>
              
              {destination && (
                <div className="flex items-center justify-center gap-2 mb-6 text-white/80">
                  <MapPin className="w-5 h-5" />
                  <span>Plans for {destination.fullName || destination.name}</span>
                </div>
              )}

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="glass-effect rounded-2xl p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search plans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 bg-white/90 border-0 text-gray-800 placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {user && (
                  <Button
                    onClick={() => router.push('/plans/create')}
                    className="bg-white text-blue-600 hover:bg-gray-100 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your Plan
                  </Button>
                )}
                {!user && (
                  <Button
                    onClick={() => router.push('/auth')}
                    className="bg-white text-blue-600 hover:bg-gray-100 gap-2"
                  >
                    Sign In to Create
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        {(availableRegions.length > 0 || true) && (
          <section className="bg-white border-b py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4">
                <Select value={selectedPlanType} onValueChange={setSelectedPlanType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All plan types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plan Types</SelectItem>
                    <SelectItem value="favorites">📦 Collections</SelectItem>
                    <SelectItem value="itinerary">📅 Itineraries</SelectItem>
                  </SelectContent>
                </Select>
                {availableRegions.length > 0 && (
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {availableRegions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Plans Grid */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Travel Plans Section - Show all plans together */}
            {filteredPlans.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlans.map((plan, index) => (
                    <PlanCard 
                      key={plan.id} 
                      plan={plan} 
                      index={index}
                      promotionScore={planPromotionScores[plan.id]}
                      planDetails={planDetails[plan.id]}
                      user={user}
                      onRequireAuth={handleRequireAuth}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredPlans.length === 0 && (!user || userPlans.length === 0) && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-bold mb-2 text-gray-900">No plans found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'Try a different search term.' : 'Be the first to create a plan for this destination!'}
                  </p>
                  {user && (
                    <Button
                      onClick={() => router.push(`/plans/create${destinationId ? `?destination=${destinationId}` : ''}`)}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>

      <FooterNext />

      {/* Require Auth Modal */}
      <RequireAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl={authRedirectUrl}
      />
    </>
  );
}

// Plan Card Component
function PlanCard({ plan, index, promotionScore = null, planDetails = null, user = null, onRequireAuth = null }) {
  const router = useRouter();
  // Use destination from plan if available, otherwise try to get it
  const destination = plan.destination || (plan.destination_id ? getDestinationById(plan.destination_id) : null);
  // planDetails is already the details object for this specific plan (passed as planDetails={planDetails[plan.id]})
  const details = planDetails || {};
  
  const handleViewPlan = (e) => {
    e.preventDefault();
    if (!user) {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        router.push('/auth?redirect=' + encodeURIComponent(`/plans/${plan.slug}`));
      }
    } else {
      router.push(`/plans/${plan.slug}`);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Plan Type Badge */}
          {plan.plan_mode && (
            <div className="mb-2">
              <Badge 
                variant="outline" 
                className={
                  plan.plan_mode === 'itinerary' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }
              >
                {plan.plan_mode === 'itinerary' ? '📅 Itinerary' : '📦 Collection'}
              </Badge>
            </div>
          )}

          <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">{plan.title}</h3>
          
          {plan.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{plan.description}</p>
          )}

          {/* Plan Stats */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-3">
            {plan.destination_id && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="font-medium">
                  {destination?.name || destination?.fullName || plan.destination_id}
                </span>
              </div>
            )}
            {details?.creatorName && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>by {details.creatorName}</span>
              </div>
            )}
            {details?.days !== undefined && details.days > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{details.days} {details.days === 1 ? 'day' : 'days'}</span>
              </div>
            )}
            {(details?.toursCount > 0 || details?.restaurantsCount > 0) && (
              <div className="flex items-center gap-1">
                <span>
                  {details.toursCount > 0 && `${details.toursCount} tour${details.toursCount !== 1 ? 's' : ''}`}
                  {details.toursCount > 0 && details.restaurantsCount > 0 && ' + '}
                  {details.restaurantsCount > 0 && `${details.restaurantsCount} restaurant${details.restaurantsCount !== 1 ? 's' : ''}`}
                </span>
              </div>
            )}
          </div>

          {/* Promotion Score */}
          {plan.id && (
            <div className="mb-3">
              <PlanPromotionCard 
                planId={plan.id} 
                compact={true}
                initialScore={promotionScore || {
                  planId: plan.id,
                  total_score: plan.total_score || 0,
                  monthly_score: 0,
                  weekly_score: 0,
                  past_28_days_score: 0,
                }}
                planData={plan}
              />
            </div>
          )}

          {plan.region && (
            <div className="text-xs text-gray-400 mb-4">
              {plan.region}
            </div>
          )}

          <Button onClick={handleViewPlan} className="w-full" variant="outline">
            View Plan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

