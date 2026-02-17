"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ArrowRight, Heart, ExternalLink, Medal, Shield, Crown, Zap, Flame, Trophy, X, Save, Check, Sparkles, CheckCircle2, Loader2, Mail } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { SUBSCRIPTION_PRICING } from '@/lib/promotionSystem';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';

export default function ProfilePage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedTours, setSavedTours] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('saved'); // 'profile' | 'trip' | 'saved' | 'plan' | 'my-tours'
  const [planTier, setPlanTier] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(null);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null);
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [tourOperatorSubscriptions, setTourOperatorSubscriptions] = useState([]);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedSubscriptionForPromotion, setSelectedSubscriptionForPromotion] = useState(null);
  const [selectedToursToPromote, setSelectedToursToPromote] = useState([]);
  const [promotingTours, setPromotingTours] = useState(false);
  const [promotedBillingCycle, setPromotedBillingCycle] = useState('annual'); // 'annual' or 'monthly'

  // Check for tab query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'trip' || tab === 'profile' || tab === 'plan' || tab === 'my-tours') {
        setActiveTab(tab);
      }
    }
  }, []);
  const [tripPreferences, setTripPreferences] = useState({
    travelerType: 'not_set',
    adventureLevel: 50,
    cultureVsBeach: 50,
    groupPreference: 50,
    budgetComfort: 50,
    structurePreference: 50,
    foodAndDrinkInterest: 50,
    familyFriendlyImportance: 50,
    accessibilityImportance: 30,
    timeOfDayPreference: 'no_preference',
    maxPricePerPerson: '',
    mustHaveFlags: [],
    avoidTags: [],
  });

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        // Prefer getSession; fallback to getUser if needed
        const { data: sessionData } = await supabase.auth.getSession();
        let currentUser = sessionData?.session?.user || null;
        if (!currentUser) {
          const { data: userData } = await supabase.auth.getUser();
          currentUser = userData?.user || null;
        }
        if (!mounted) return;
        setUser(currentUser);
        if (currentUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, plan_tier, trip_preferences, daily_points_available')
            .eq('id', currentUser.id)
            .single();
          if (profile?.display_name) {
            setDisplayName(profile.display_name);
          } else {
            // Apply pending display name if present (saved during signup without session)
            try {
              const pending = localStorage.getItem('pendingDisplayName');
              if (pending && pending.trim()) {
                await supabase
                  .from('profiles')
                  .upsert({ id: currentUser.id, display_name: pending.trim() });
                setDisplayName(pending.trim());
                localStorage.removeItem('pendingDisplayName');
              }
            } catch {}
          }
          if (profile?.plan_tier) setPlanTier(profile.plan_tier);
          if (profile?.trip_preferences) {
            try {
              const prefs = profile.trip_preferences;
              setTripPreferences((prev) => ({
                ...prev,
                ...prefs,
              }));
            } catch {
              // ignore malformed JSON
            }
          }
          
          // Fetch user's tour operator subscriptions
          const { data: tourOperatorSubs } = await supabase
            .from('tour_operator_subscriptions')
            .select('*')
            .eq('user_id', currentUser.id)
            .in('status', ['active', 'pending_cancellation']);
          
          // Fetch promoted tours directly by user_id (same as restaurants - simple and reliable!)
          const { data: promotedTours } = await supabase
            .from('promoted_tours')
            .select('product_id, operator_subscription_id, status, promotion_plan, user_id')
            .eq('user_id', currentUser.id)
            .in('status', ['active', 'pending'])
            .order('requested_at', { ascending: false });
          
          if (tourOperatorSubs && tourOperatorSubs.length > 0) {
            // Fetch operator tours data for all subscriptions
            const subscriptionsWithPromoted = tourOperatorSubs.map((sub) => {
              // Find promoted tours for this subscription
              const subscriptionPromotedTours = promotedTours?.filter(pt => 
                pt.operator_subscription_id === sub.id
              ) || [];
              
              const promotedTourIds = subscriptionPromotedTours.map(pt => pt.product_id);
              
              return {
                ...sub,
                promotedTourIds: promotedTourIds,
                tourDataMap: {}, // Will be populated below
                verified_tour_ids: sub.verified_tour_ids || []
              };
            });
            
            // Fetch operator tours data for all subscriptions in one query
            const subscriptionIds = subscriptionsWithPromoted.map(s => s.id);
            const { data: operatorTours } = await supabase
              .from('operator_tours')
              .select('product_id, tour_title, tour_image_url, rating, review_count, operator_subscription_id')
              .in('operator_subscription_id', subscriptionIds)
              .eq('is_selected', true);
            
            // Build tour data maps for each subscription
            const subscriptionsWithTours = subscriptionsWithPromoted.map(sub => {
              const subscriptionTours = operatorTours?.filter(ot => 
                ot.operator_subscription_id === sub.id
              ) || [];
              
              const tourDataMap = {};
              subscriptionTours.forEach(tour => {
                tourDataMap[tour.product_id] = {
                  title: tour.tour_title || '',
                  imageUrl: tour.tour_image_url || null,
                  rating: tour.rating || 0,
                  reviewCount: tour.review_count || 0,
                };
              });
              
              return {
                ...sub,
                tourDataMap: tourDataMap,
                verified_tour_ids: subscriptionTours.map(t => t.product_id)
              };
            });
            
            setTourOperatorSubscriptions(subscriptionsWithTours);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  // If not signed in, redirect to /auth once loading completes
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, user, router]);

  // Load saved bookmarks -> tour and restaurant details
  useEffect(() => {
    const loadSaved = async () => {
      if (!user) return;
      setLoadingSaved(true);
      try {
        // Fetch tour bookmarks
        const toursRes = await fetch(`/api/internal/bookmarks?userId=${encodeURIComponent(user.id)}`);
        const toursJson = await toursRes.json();
        const tourBookmarks = toursJson.bookmarks || [];
        // Fetch product details in parallel (cap to 24 for speed)
        const tourItems = await Promise.all(
          tourBookmarks.slice(0, 24).map(async (b) => {
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
        const validTours = tourItems.filter(Boolean);
        setSavedTours(validTours);
      } finally {
        setLoadingSaved(false);
      }
    };
    if (user) loadSaved();
  }, [user]);


  // Travel plans feature removed - no longer loading plans
  // useEffect removed for travel plans loading

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          display_name: displayName, 
          trip_preferences: tripPreferences,
        });
      if (error) throw error;
      
      // Invalidate cache so fresh data is fetched next time
      try {
        const { invalidateProfileCache } = await import('@/lib/supabaseCache');
        invalidateProfileCache(user.id);
      } catch (cacheError) {
        console.warn('Could not invalidate cache:', cacheError);
      }
      
      // Show success toast based on active tab
      if (activeTab === 'trip') {
        toast({
          title: 'Travel preferences saved',
          description: 'Your travel preferences have been updated successfully.',
        });
      } else {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
      }
      setMessage('Profile updated.');
    } catch (err) {
      const errorMessage = err.message || 'Failed to save profile.';
      setMessage(errorMessage);
      toast({
        title: 'Failed to save',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationNext />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading your profile…</h1>
              <p className="text-sm text-gray-600">Please wait while we fetch your information</p>
            </div>
          </div>
        </main>
      <FooterNext />

    </div>
  );
}

  if (!user) {
    // We already redirected; render nothing to avoid flash
    return null;
  }

  // Helpers copied to match tours card exactly
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
    <div className="min-h-screen bg-gray-50">
      <NavigationNext />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Your TopTours.ai<span className="align-super text-xs">™</span> account
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">
            View saved tours, update your profile details, and explore upcoming promo tools for your listings — all in one place.
          </p>
          
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="bg-white rounded-xl shadow p-4 h-fit">
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('trip')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'trip' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                Tour Preferences
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'saved' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                Saved Tours
              </button>
              {tourOperatorSubscriptions.length > 0 && (
                <button
                  onClick={() => setActiveTab('my-tours')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'my-tours' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  <Crown className="w-4 h-4 text-amber-500" />
                  My Tours
                  <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                    {tourOperatorSubscriptions.length}
                  </span>
                </button>
              )}
            </nav>
            <div className="mt-6">
              <Button variant="outline" className="w-full" onClick={async () => { await supabase.auth.signOut(); router.replace('/'); }}>
                Sign Out
              </Button>
            </div>
          </aside>

          {/* Content */}
          <section className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <h1 className="text-2xl font-semibold mb-2">Profile Information</h1>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Display Name</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <Button onClick={handleSave} disabled={saving} className="sunset-gradient text-white">
                  {saving ? 'Saving…' : 'Save Profile'}
                </Button>
                {message && <p className="text-sm text-gray-700">{message}</p>}
              </div>
            )}

            {activeTab === 'trip' && (
              <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-semibold mb-1">Travel Preferences</h1>
                    <p className="text-sm text-gray-600 max-w-xl">
                      Tell us what kind of traveler you are so we can match you with tours that fit your style and preferences.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 self-start sm:self-auto">
                    <span>🧠</span>
                    Powers AI tour matching
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Core trip settings */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        👤 Traveler type
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        value={tripPreferences.travelerType}
                        onChange={(e) =>
                          setTripPreferences((prev) => ({ ...prev, travelerType: e.target.value }))
                        }
                      >
                        <option value="not_set">Not sure yet</option>
                        <option value="solo">Solo traveler</option>
                        <option value="couple">Couple</option>
                        <option value="family">Family</option>
                        <option value="friends">Friends</option>
                        <option value="multi-gen">Multi‑generation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        💸 Max budget per person (optional)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 150"
                        value={tripPreferences.maxPricePerPerson}
                        onChange={(e) =>
                          setTripPreferences((prev) => ({
                            ...prev,
                            maxPricePerPerson: e.target.value,
                          }))
                        }
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        We’ll gently penalize tours that are far above this amount.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        ☀️ Preferred time of day
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        value={tripPreferences.timeOfDayPreference}
                        onChange={(e) =>
                          setTripPreferences((prev) => ({
                            ...prev,
                            timeOfDayPreference: e.target.value,
                          }))
                        }
                      >
                        <option value="no_preference">No strong preference</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening / sunset</option>
                      </select>
                    </div>
                  </div>

                  {/* Three-option cards column */}
                  <div className="space-y-6">
                    {/* Adventure */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-3">
                        🔥 How adventurous are you as a traveler?
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 25, label: '😌 Relaxed', desc: 'Take it easy' },
                          { value: 50, label: '⚖️ Balanced', desc: 'Mix of both' },
                          { value: 75, label: '🔥 Adventurous', desc: 'Thrill seeker' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setTripPreferences((prev) => ({
                                ...prev,
                                adventureLevel: option.value,
                              }))
                            }
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                              tripPreferences.adventureLevel === option.value
                                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105'
                                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="text-2xl mb-1">{option.label.split(' ')[0]}</div>
                            <div className="text-xs font-semibold text-gray-700 mb-1">
                              {option.label.split(' ').slice(1).join(' ')}
                            </div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                            {tripPreferences.adventureLevel === option.value && (
                              <div className="absolute top-2 right-2">
                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Relaxation vs Exploration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-3">
                        🌊 Do you prefer relaxing or exploring when you travel?
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 25, label: '😌 Relax', desc: 'Unwind & recharge' },
                          { value: 50, label: '⚖️ Balanced', desc: 'Mix of both' },
                          { value: 75, label: '🔍 Explore', desc: 'Discover & learn' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setTripPreferences((prev) => ({
                                ...prev,
                                cultureVsBeach: option.value,
                              }))
                            }
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                              tripPreferences.cultureVsBeach === option.value
                                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105'
                                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="text-2xl mb-1">{option.label.split(' ')[0]}</div>
                            <div className="text-xs font-semibold text-gray-700 mb-1">
                              {option.label.split(' ').slice(1).join(' ')}
                            </div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                            {tripPreferences.cultureVsBeach === option.value && (
                              <div className="absolute top-2 right-2">
                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Group size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-3">
                        👥 Do you prefer big group tours or private/small group experiences?
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 25, label: '👥 Big groups', desc: 'Social & fun' },
                          { value: 50, label: '⚖️ Either way', desc: 'No preference' },
                          { value: 75, label: '🧑‍🤝‍🧑 Private / small', desc: 'Intimate experience' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setTripPreferences((prev) => ({
                                ...prev,
                                groupPreference: option.value,
                              }))
                            }
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                              tripPreferences.groupPreference === option.value
                                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105'
                                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="text-2xl mb-1">{option.label.split(' ')[0]}</div>
                            <div className="text-xs font-semibold text-gray-700 mb-1">
                              {option.label.split(' ').slice(1).join(' ')}
                            </div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                            {tripPreferences.groupPreference === option.value && (
                              <div className="absolute top-2 right-2">
                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget vs comfort */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-3">
                        💰 Are you more budget-conscious or comfort-focused?
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 25, label: '💰 Budget', desc: 'Save money' },
                          { value: 50, label: '⚖️ Balanced', desc: 'Good value' },
                          { value: 75, label: '✨ Comfort', desc: 'Quality first' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setTripPreferences((prev) => ({
                                ...prev,
                                budgetComfort: option.value,
                              }))
                            }
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                              tripPreferences.budgetComfort === option.value
                                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105'
                                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="text-2xl mb-1">{option.label.split(' ')[0]}</div>
                            <div className="text-xs font-semibold text-gray-700 mb-1">
                              {option.label.split(' ').slice(1).join(' ')}
                            </div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                            {tripPreferences.budgetComfort === option.value && (
                              <div className="absolute top-2 right-2">
                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Structure */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-3">
                        📋 Do you prefer guided tours or exploring on your own?
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 25, label: '🕰️ Independent', desc: 'Flexible & self-guided' },
                          { value: 50, label: '⚖️ Mixed', desc: 'Some guidance, some freedom' },
                          { value: 75, label: '📋 Guided', desc: 'Fully organized tours' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setTripPreferences((prev) => ({
                                ...prev,
                                structurePreference: option.value,
                              }))
                            }
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                              tripPreferences.structurePreference === option.value
                                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105'
                                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="text-2xl mb-1">{option.label.split(' ')[0]}</div>
                            <div className="text-xs font-semibold text-gray-700 mb-1">
                              {option.label.split(' ').slice(1).join(' ')}
                            </div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                            {tripPreferences.structurePreference === option.value && (
                              <div className="absolute top-2 right-2">
                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Food & drink */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-3">
                        🍷 How important are food & drinks in your travel experiences?
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 25, label: '🍽️ Not important', desc: 'Food is secondary' },
                          { value: 50, label: '⚖️ Nice to have', desc: 'Enjoy good meals' },
                          { value: 75, label: '🍷 Very important', desc: 'Foodie experiences' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setTripPreferences((prev) => ({
                                ...prev,
                                foodAndDrinkInterest: option.value,
                              }))
                            }
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                              tripPreferences.foodAndDrinkInterest === option.value
                                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105'
                                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="text-2xl mb-1">{option.label.split(' ')[0]}</div>
                            <div className="text-xs font-semibold text-gray-700 mb-1">
                              {option.label.split(' ').slice(1).join(' ')}
                            </div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                            {tripPreferences.foodAndDrinkInterest === option.value && (
                              <div className="absolute top-2 right-2">
                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <Button onClick={handleSave} disabled={saving} className="sunset-gradient text-white">
                    {saving ? 'Saving…' : 'Save Travel Preferences'}
                  </Button>
                  <p className="text-xs sm:text-sm text-gray-600">
                    These preferences help TopTours AI match you with tours that fit your travel style.
                  </p>
                </div>
              </div>
            )}

            {/* Restaurant preferences tab removed - tours only */}

            {activeTab === 'saved' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h1 className="text-2xl font-semibold">Saved Tours</h1>
                  {savedTours.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {savedTours.length} item{savedTours.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {loadingSaved ? (
                  <p className="text-gray-600">Loading your saved tours…</p>
                ) : savedTours.length === 0 ? (
                  <div className="text-gray-600 bg-white rounded-xl shadow p-6">
                    You haven't saved any tours yet. Browse destinations and tap the heart to save your favorites.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Render saved tours */}
                    {savedTours.map(({ productId, tour }) => {
                      const image =
                        tour?.images?.[0]?.variants?.[3]?.url ||
                        tour?.images?.[0]?.variants?.[0]?.url ||
                        '';
                      const rating = tour?.reviews?.combinedAverageRating || 0;
                      const reviewCount = tour?.reviews?.totalReviews || 0;
                      const price = tour?.pricing?.summary?.fromPrice || tour?.price || 0;
                      const originalPrice = tour?.pricing?.summary?.fromPriceBeforeDiscount || null;
                      const hasDiscount = originalPrice && originalPrice > price;
                      const title = tour?.seo?.title || tour?.title || 'Tour';
                      const description = tour?.seo?.description || tour?.content?.heroDescription || tour?.description || '';
                      const flags = tour?.flags || tour?.specialFlags || [];
                      const displayFlags = (flags || []).filter((f) => f !== 'SPECIAL_OFFER');
                      const viatorUrl =
                        tour?.productUrl ||
                        tour?.url ||
                        `https://www.viator.com/tours/${productId}`;
                      const slugTitle = (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      const tourUrl = `/tours/${productId}/${slugTitle}`;
                      return (
                        <Card key={productId} className="bg-white border-0 shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300">
                          <Link href={tourUrl} prefetch={false}>
                            <div className="relative h-48 overflow-hidden">
                              {image && (
                                <img
                                  src={image}
                                  alt={title}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                              )}
                              {hasDiscount && (
                                <div className="absolute top-3 left-3 z-20">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-rose-600 text-white rounded-full shadow">
                                    <span>💸</span> Special Offer
                                  </span>
                                </div>
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
                              <Link href={tourUrl} prefetch={false} className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 hover:text-purple-600 transition-colors">
                                  {title}
                                </h3>
                              </Link>
                              <button
                                type="button"
                                aria-label="Saved"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const { data } = await supabase.auth.getUser();
                                  if (!data?.user) {
                                    toast({
                                      title: 'Sign in required',
                                      description: 'Create a free account to save tours to your favorites.',
                                    });
                                    return;
                                  }
                                  try {
                                    await fetch(`/api/internal/bookmarks/${encodeURIComponent(productId)}`, {
                                      method: 'DELETE',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ userId: data.user.id }),
                                    });
                                    // Optimistically remove from list
                                    setSavedTours((prev) => prev.filter((t) => t.productId !== productId));
                                    toast({
                                      title: 'Removed from favorites',
                                      description: 'This tour was removed from your saved list.',
                                    });
                                  } catch {}
                                }}
                                className="ml-2 inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors text-red-600 bg-white"
                                title="Saved"
                              >
                                <Heart className="w-5 h-5" fill="currentColor" />
                              </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                              {description}
                            </p>

                            <div className="flex items-center justify-between mb-3">
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

                            <Button
                              asChild
                              className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 mt-auto"
                            >
                              <Link href={tourUrl} prefetch={false}>
                                View Details
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Link>
                            </Button>

                            <div className="mt-3">
                              <Button
                                asChild
                                variant="outline"
                                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                              >
                                <a
                                  href={viatorUrl}
                                  target="_blank"
                                  rel="sponsored noopener noreferrer"
                                >
                                  Book on Viator
                                  <ExternalLink className="w-4 h-4 ml-2" />
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}


            {activeTab === 'my-tours' && (
              <div className="bg-white rounded-xl shadow p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Crown className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold">My Tour Operator Subscriptions</h1>
                    <p className="text-sm text-gray-600">Manage your premium tour bundles</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {tourOperatorSubscriptions.map((subscription) => {
                    const planName = subscription.subscription_plan === '5-tours-annual' || subscription.subscription_plan === '5-tours-monthly' 
                      ? '5 Tours' 
                      : '15 Tours';
                    const billingCycle = subscription.subscription_plan.includes('annual') ? 'Yearly' : 'Monthly';
                    
                    return (
                      <div key={subscription.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{subscription.operator_name}</h3>
                              <Badge variant="outline" className={subscription.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                                {subscription.status === 'active' ? 'Active' : 'Pending Cancellation'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {planName} • {billingCycle} Plan
                              {subscription.promotedTourIds && subscription.promotedTourIds.length > 0 && (
                                <> • {subscription.promotedTourIds.length} promoted tour{subscription.promotedTourIds.length !== 1 ? 's' : ''}</>
                              )}
                              {subscription.current_period_end && (
                                <> • Renews {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                              )}
                            </p>
                            {subscription.total_tours_count > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                {subscription.total_tours_count} tour{subscription.total_tours_count !== 1 ? 's' : ''} linked
                                {subscription.average_rating > 0 && (
                                  <> • {subscription.average_rating.toFixed(1)} ⭐ ({subscription.total_reviews} reviews)</>
                                )}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={async () => {
                                // Open billing portal for subscription management
                                setLoadingPortal(true);
                                try {
                                  const res = await fetch('/api/internal/tour-operator-premium/portal', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      subscriptionId: subscription.id,
                                      userId: user.id,
                                    }),
                                  });
                                  const data = await res.json();
                                  if (data.url) {
                                    window.location.href = data.url;
                                  } else {
                                    throw new Error(data.error || 'Failed to open billing portal');
                                  }
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: error.message,
                                    variant: 'destructive',
                                  });
                                } finally {
                                  setLoadingPortal(false);
                                }
                              }}
                              disabled={loadingPortal}
                              variant="outline"
                              size="sm"
                            >
                              Billing
                            </Button>
                          </div>
                        </div>

                        {/* Upgrade to Promoted Section */}
                        {subscription.verified_tour_ids && subscription.verified_tour_ids.length > 0 && 
                         (!subscription.promotedTourIds || subscription.promotedTourIds.length < subscription.verified_tour_ids.length) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Upgrade to Promoted</h4>
                                <p className="text-xs text-gray-500">
                                  Promote tours for top placement
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                // Get tours that are not yet promoted
                                const nonPromotedTours = subscription.verified_tour_ids.filter(
                                  id => !subscription.promotedTourIds || !subscription.promotedTourIds.includes(id)
                                );
                                
                                if (nonPromotedTours.length === 0) {
                                  toast({
                                    title: 'All tours are already promoted',
                                    description: 'All your tours are already promoted.',
                                  });
                                  return;
                                }
                                
                                setSelectedSubscriptionForPromotion(subscription);
                                setSelectedToursToPromote(nonPromotedTours);
                                // Initialize billing cycle based on subscription plan (default to annual for savings)
                                setPromotedBillingCycle(subscription.subscription_plan.includes('annual') ? 'annual' : 'annual');
                                setShowPromoteModal(true);
                              }}
                              disabled={loadingPortal}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              size="sm"
                            >
                              <Sparkles className="w-4 h-4 mr-1" />
                              Promote Tours
                            </Button>
                          </div>
                        )}

                        {/* Linked Tours - Manage Section */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">Linked Tours</h4>
                            <Badge variant="secondary" className="text-xs">
                              {subscription.verified_tour_ids?.length || 0} / {subscription.subscription_plan === '5-tours-annual' || subscription.subscription_plan === '5-tours-monthly' ? '5' : '15'}
                            </Badge>
                          </div>
                          
                          {subscription.verified_tour_ids && subscription.verified_tour_ids.length > 0 ? (
                            <div className="space-y-3 mb-4">
                              {subscription.verified_tour_ids.map((productId) => {
                                const isPromoted = subscription.promotedTourIds && subscription.promotedTourIds.includes(productId);
                                const tourData = subscription.tourDataMap?.[productId] || {};
                                const tourTitle = tourData.title || productId;
                                
                                return (
                                  <div key={productId} className={`flex items-start gap-3 p-3 bg-white rounded-lg border-2 transition-all ${
                                    isPromoted ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                                  }`}>
                                    {tourData.imageUrl && (
                                      <img
                                        src={tourData.imageUrl}
                                        alt={tourTitle}
                                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <Link
                                          href={`/tours/${productId}`}
                                          className="font-medium text-gray-900 text-sm line-clamp-2 flex-1 hover:text-purple-600"
                                        >
                                          {tourTitle}
                                        </Link>
                                        {isPromoted && (
                                          <Badge className="bg-purple-600 text-white text-xs flex-shrink-0 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            Promoted
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                                        {tourData.rating > 0 && (
                                          <>
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span>{tourData.rating.toFixed(1)}</span>
                                          </>
                                        )}
                                        {tourData.reviewCount > 0 && (
                                          <span>({tourData.reviewCount} reviews)</span>
                                        )}
                                        {!isPromoted && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs ml-auto"
                                            onClick={() => {
                                              // Open promote modal for this specific tour
                                              setSelectedSubscriptionForPromotion(subscription);
                                              setSelectedToursToPromote([productId]);
                                              setPromotedBillingCycle(subscription.subscription_plan.includes('annual') ? 'annual' : 'annual');
                                              setShowPromoteModal(true);
                                            }}
                                          >
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Promote
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={async () => {
                                        if (!confirm(`Remove tour "${tourTitle}" from your subscription?`)) return;
                                        
                                        try {
                                          const res = await fetch('/api/internal/tour-operator-premium/remove-tour', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              subscriptionId: subscription.id,
                                              productId: productId,
                                              userId: user.id,
                                            }),
                                          });
                                          const data = await res.json();
                                          if (data.success) {
                                            toast({
                                              title: 'Tour removed',
                                              description: 'Tour has been removed from your subscription.',
                                            });
                                            // Refresh subscriptions
                                            window.location.reload();
                                          } else {
                                            throw new Error(data.error || 'Failed to remove tour');
                                          }
                                        } catch (error) {
                                          toast({
                                            title: 'Error',
                                            description: error.message,
                                            variant: 'destructive',
                                          });
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mb-4">No tours linked yet.</p>
                          )}
                          
                          {/* Add Tour Button */}
                          {(subscription.verified_tour_ids?.length || 0) < (subscription.subscription_plan === '5-tours-annual' || subscription.subscription_plan === '5-tours-monthly' ? 5 : 15) && (
                            <div className="mt-4">
                              <Input
                                type="text"
                                placeholder="Enter Viator or TopTours.ai tour URL"
                                className="mb-2"
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    const url = e.target.value.trim();
                                    if (!url) return;
                                    
                                    try {
                                      // Extract product ID from URL
                                      let productId = null;
                                      if (url.includes('viator.com')) {
                                        const match = url.match(/d\d+-([A-Z0-9]+)/);
                                        if (match) productId = match[1];
                                      } else if (url.includes('toptours.ai') || url.startsWith('/tours/')) {
                                        const match = url.match(/\/tours\/([A-Z0-9]+)/i);
                                        if (match) productId = match[1];
                                      }
                                      
                                      if (!productId) {
                                        toast({
                                          title: 'Invalid URL',
                                          description: 'Please enter a valid Viator or TopTours.ai tour URL.',
                                          variant: 'destructive',
                                        });
                                        return;
                                      }
                                      
                                      // Check if tour is already added
                                      if (subscription.verified_tour_ids?.includes(productId)) {
                                        toast({
                                          title: 'Tour already added',
                                          description: 'This tour is already in your subscription.',
                                          variant: 'default',
                                        });
                                        e.target.value = '';
                                        return;
                                      }
                                      
                                      // Add tour
                                      const res = await fetch('/api/internal/tour-operator-premium/add-tour', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          subscriptionId: subscription.id,
                                          productId: productId,
                                          userId: user.id,
                                        }),
                                      });
                                      const data = await res.json();
                                      if (data.success) {
                                        toast({
                                          title: 'Tour added',
                                          description: 'Tour has been added to your subscription.',
                                        });
                                        e.target.value = '';
                                        // Refresh subscriptions
                                        const { data: updatedSubs } = await supabase
                                          .from('tour_operator_subscriptions')
                                          .select('*')
                                          .eq('user_id', user.id)
                                          .in('status', ['active', 'pending_cancellation']);
                                        if (updatedSubs) {
                                          setTourOperatorSubscriptions(updatedSubs);
                                        }
                                      } else {
                                        throw new Error(data.error || 'Failed to add tour');
                                      }
                                    } catch (error) {
                                      toast({
                                        title: 'Error',
                                        description: error.message,
                                        variant: 'destructive',
                                      });
                                    }
                                  }
                                }}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Paste a Viator or TopTours.ai tour URL and press Enter to add it
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {tourOperatorSubscriptions.length === 0 && (
                  <div className="text-center py-12">
                    <Crown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No tour operator subscriptions yet</p>
                    <Link href="/partners/tour-operators">
                      <Button className="sunset-gradient text-white">
                        Subscribe to Premium
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <FooterNext />


      {/* Promote Tours Modal */}
      {showPromoteModal && selectedSubscriptionForPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
    </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Promote Tours for Top Placement</h2>
                    <p className="text-sm text-gray-600">Select which tours to promote</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPromoteModal(false);
                    setSelectedSubscriptionForPromotion(null);
                    setSelectedToursToPromote([]);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 border-2 border-purple-300 rounded-xl">
                <p className="text-sm text-gray-700 mb-4">
                  <strong className="text-purple-900">✨ Top placement guarantee:</strong> Promoted tours appear <strong>first on all pages</strong>, 
                  before any other results, regardless of filters or sorting.
                </p>
                
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Billing Cycle</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPromotedBillingCycle('annual')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      promotedBillingCycle === 'annual'
                        ? 'border-purple-600 bg-purple-100'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">Annual (12 months)</div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">$19.99</div>
                    <div className="text-sm text-gray-600 mb-1">per month</div>
                    <div className="text-xs text-gray-400">$239.88 paid upfront</div>
                    <Badge className="mt-2 bg-green-100 text-green-700 text-xs">Save $60/year</Badge>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPromotedBillingCycle('monthly')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      promotedBillingCycle === 'monthly'
                        ? 'border-purple-600 bg-purple-100'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">Monthly billing</div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">$24.99</div>
                    <div className="text-sm text-gray-600 mb-1">per month</div>
                    <div className="text-xs text-gray-400">Billed monthly</div>
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {selectedSubscriptionForPromotion.verified_tour_ids
                  .filter(id => !selectedSubscriptionForPromotion.promotedTourIds || !selectedSubscriptionForPromotion.promotedTourIds.includes(id))
                  .map((productId) => {
                    const isSelected = selectedToursToPromote.includes(productId);
                    return (
                      <label
                        key={productId}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedToursToPromote([...selectedToursToPromote, productId]);
                            } else {
                              setSelectedToursToPromote(selectedToursToPromote.filter(id => id !== productId));
                            }
                          }}
                          className="mt-1 w-5 h-5 text-purple-600 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {productId}
                            </span>
                            {isSelected && (
                              <Badge className="bg-purple-600 text-white text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            {promotedBillingCycle === 'annual' ? '$19.99/month' : '$24.99/month'} per tour
                          </div>
                        </div>
                      </label>
                    );
                  })}
              </div>

              {selectedToursToPromote.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedToursToPromote.length} tour{selectedToursToPromote.length !== 1 ? 's' : ''} selected
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      ${(selectedToursToPromote.length * (promotedBillingCycle === 'annual' ? 19.99 : 24.99)).toFixed(2)}/month
                    </span>
                  </div>
                  {promotedBillingCycle === 'annual' && (
                    <div className="text-xs text-gray-600">
                      ${(selectedToursToPromote.length * 239.88).toFixed(2)} paid upfront (12 months)
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPromoteModal(false);
                    setSelectedSubscriptionForPromotion(null);
                    setSelectedToursToPromote([]);
                  }}
                  disabled={promotingTours}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (selectedToursToPromote.length === 0) {
                      toast({
                        title: 'No tours selected',
                        description: 'Please select at least one tour to promote.',
                        variant: 'destructive',
                      });
                      return;
                    }

                    setPromotingTours(true);
                    try {
                      console.log('Sending upgrade request:', {
                        userId: user.id,
                        subscriptionId: selectedSubscriptionForPromotion.id,
                        promotedTourIds: selectedToursToPromote,
                        promotedBillingCycle: promotedBillingCycle,
                      });
                      
                      const res = await fetch('/api/partners/tour-operators/upgrade', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user.id,
                          subscriptionId: selectedSubscriptionForPromotion.id,
                          promotedTourIds: selectedToursToPromote,
                          promotedBillingCycle: promotedBillingCycle, // Use the state variable
                        }),
                      });
                      
                      if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ error: 'Network error' }));
                        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
                      }
                      
                      const data = await res.json();
                      console.log('Upgrade response:', data);
                      
                      if (data.success) {
                        toast({
                          title: 'Upgrade successful!',
                          description: `Promotion has been added to ${selectedToursToPromote.length} tour${selectedToursToPromote.length !== 1 ? 's' : ''}.`,
                        });
                        setShowPromoteModal(false);
                        setSelectedSubscriptionForPromotion(null);
                        setSelectedToursToPromote([]);
                        // Refresh subscriptions
                        setTimeout(() => {
                          window.location.reload();
                        }, 1000);
                      } else if (data.requiresCheckout && data.checkoutUrl) {
                        // Redirect to Stripe checkout
                        console.log('Redirecting to checkout:', data.checkoutUrl);
                        window.location.href = data.checkoutUrl;
                      } else {
                        console.error('Upgrade failed:', data);
                        throw new Error(data.error || data.message || 'Failed to upgrade');
                      }
                    } catch (error) {
                      console.error('Upgrade error:', error);
                      toast({
                        title: 'Upgrade failed',
                        description: error.message || 'An unexpected error occurred. Please try again.',
                        variant: 'destructive',
                      });
                    } finally {
                      setPromotingTours(false);
                    }
                  }}
                  disabled={promotingTours || selectedToursToPromote.length === 0}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {promotingTours ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Promote Selected Tours
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


