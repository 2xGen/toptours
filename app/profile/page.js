"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ArrowRight, Heart, ExternalLink, Medal, Shield, Crown, Zap, Flame, Trophy } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('saved'); // 'profile' | 'trip' | 'saved' | 'plan'
  const [planTier, setPlanTier] = useState('free');
  const [streakDays, setStreakDays] = useState(0);
  const [dailyPointsAvailable, setDailyPointsAvailable] = useState(0);
  const [totalPointsSpent, setTotalPointsSpent] = useState(0);
  const [loadingStreak, setLoadingStreak] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(null);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null);
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Check for tab query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'trip' || tab === 'profile' || tab === 'plan') {
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
          // Initialize daily_points_available if not set (for new users)
          if (profile && (profile.daily_points_available === null || profile.daily_points_available === undefined)) {
            await supabase
              .from('profiles')
              .update({ daily_points_available: 50 })
              .eq('id', currentUser.id);
            setDailyPointsAvailable(50);
          } else if (profile?.daily_points_available !== undefined) {
            setDailyPointsAvailable(profile.daily_points_available);
          }
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

  // Load saved bookmarks -> tour details
  useEffect(() => {
    const loadSaved = async () => {
      if (!user) return;
      setLoadingSaved(true);
      try {
        const res = await fetch(`/api/internal/bookmarks?userId=${encodeURIComponent(user.id)}`);
        const json = await res.json();
        const bookmarks = json.bookmarks || [];
        // Fetch product details in parallel (cap to 24 for speed)
        const items = await Promise.all(
          bookmarks.slice(0, 24).map(async (b) => {
            try {
              const r = await fetch(`/api/internal/viator-product/${encodeURIComponent(b.product_id)}`);
              if (!r.ok) return null;
              const data = await r.json();
              return { productId: b.product_id, tour: data };
            } catch {
              return null;
            }
          })
        );
        setSavedTours(items.filter(Boolean));
      } finally {
        setLoadingSaved(false);
      }
    };
    if (user) loadSaved();
  }, [user]);

  // Load promotion account data (streak, total points spent, subscription) from promotion_accounts
  // Daily points are now in profiles table for simplicity and reliability
  useEffect(() => {
    const loadPromotionAccount = async () => {
      if (!user) return;
      setLoadingStreak(true);
      try {
        // Load from promotion_accounts (streak, total points, subscription info)
        const { data: account, error } = await supabase
          .from('promotion_accounts')
          .select('streak_days, total_points_spent_all_time, subscription_status, subscription_plan, subscription_start_date, subscription_end_date, stripe_subscription_id')
          .eq('user_id', user.id)
          .single();
        
        // If account doesn't exist, create it (lazy initialization for streak/subscription tracking)
        if (error && error.code === 'PGRST116') {
          const { data: newAccount, error: createError } = await supabase
            .from('promotion_accounts')
            .insert({
              user_id: user.id,
              tier: 'explorer',
              last_daily_reset: new Date().toISOString(),
              subscription_status: null,
              subscription_plan: 'free',
            })
            .select('streak_days, total_points_spent_all_time, subscription_status, subscription_plan, subscription_start_date, subscription_end_date, stripe_subscription_id')
            .single();
          
          if (!createError && newAccount) {
            setStreakDays(newAccount.streak_days || 0);
            setTotalPointsSpent(newAccount.total_points_spent_all_time || 0);
            setSubscriptionStatus(newAccount.subscription_status);
            setSubscriptionPlan(newAccount.subscription_plan);
            setSubscriptionStartDate(newAccount.subscription_start_date);
            setSubscriptionEndDate(newAccount.subscription_end_date);
            setStripeSubscriptionId(newAccount.stripe_subscription_id);
          }
        } else if (!error && account) {
          setStreakDays(account.streak_days || 0);
          setTotalPointsSpent(account.total_points_spent_all_time || 0);
          setSubscriptionStatus(account.subscription_status);
          setSubscriptionPlan(account.subscription_plan);
          setSubscriptionStartDate(account.subscription_start_date);
          setSubscriptionEndDate(account.subscription_end_date);
          setStripeSubscriptionId(account.stripe_subscription_id);
        }
        
        // Daily points are loaded from profiles (already done in the init useEffect above)
      } catch (err) {
        console.error('Error loading promotion account:', err);
      } finally {
        setLoadingStreak(false);
      }
    };
    if (user) {
      loadPromotionAccount();
    }
  }, [user, supabase]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, display_name: displayName, trip_preferences: tripPreferences });
      if (error) throw error;
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err.message || 'Failed to save profile.');
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
          
          {/* Promotion Stats - Always Visible */}
          <div className="mt-6 space-y-3 max-w-3xl">
            {/* Streak Section */}
            <div className="flex items-start gap-3 px-4 py-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">Current Streak:</span>
                  {loadingStreak ? (
                    <span className="text-sm text-gray-500">Loading...</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
                      <Flame className="w-3.5 h-3.5" />
                      {streakDays} {streakDays === 1 ? 'day' : 'days'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Claim daily points every 24 hours to keep your streak alive. 
                  <button 
                    onClick={() => {
                      const details = document.getElementById('streak-details');
                      if (details) {
                        details.classList.toggle('hidden');
                      }
                    }}
                    className="ml-1 text-orange-600 hover:text-orange-700 font-medium underline"
                  >
                    How it works
                  </button>
                </p>
                <div id="streak-details" className="hidden mt-2 pt-2 border-t border-orange-200">
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li>• Your streak increases by 1 each day you claim points consecutively</li>
                    <li>• Missing a day resets your streak to 1 when you claim again</li>
                    <li>• Your streak badge appears on the <Link href="/leaderboard" className="text-orange-600 hover:underline font-semibold">Leaderboard</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Points Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">Points Available</span>
                </div>
                {loadingStreak ? (
                  <span className="text-sm text-gray-500">Loading...</span>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{dailyPointsAvailable.toLocaleString()}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">Reset every 24 hours</p>
              </div>

              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-gray-700">Total Points Spent</span>
                </div>
                {loadingStreak ? (
                  <span className="text-sm text-gray-500">Loading...</span>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{totalPointsSpent.toLocaleString()}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">All-time total</p>
              </div>
            </div>
          </div>
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
                Trip Preferences
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'saved' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                Saved Tours
              </button>
              <button
                onClick={() => setActiveTab('plan')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'plan' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                Plan & Billing
              </button>
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

            {activeTab === 'saved' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h1 className="text-2xl font-semibold">Saved Tours</h1>
                  {savedTours.length > 0 && (
                    <span className="text-sm text-gray-500">{savedTours.length} item{savedTours.length > 1 ? 's' : ''}</span>
                  )}
                </div>
                {loadingSaved ? (
                  <p className="text-gray-600">Loading your saved tours…</p>
                ) : savedTours.length === 0 ? (
                  <div className="text-gray-600 bg-white rounded-xl shadow p-6">
                    You haven’t saved any tours yet. Browse destinations and tap the heart to save your favorites.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <Link href={tourUrl}>
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
                              <Link href={tourUrl} className="flex-1">
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
                              <Link href={tourUrl}>
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

            {activeTab === 'plan' && (
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
                  <p className="text-sm text-gray-600">
                    Boost your favorite tours and unlock AI-powered tour matching. All plans include daily points that reset every 24 hours.
                  </p>
                </div>

                {/* Current Subscription Info */}
                {(subscriptionStatus === 'active' || subscriptionStatus === 'pending_cancellation') && subscriptionPlan && subscriptionPlan !== 'free' && (
                  <Card className={`bg-gradient-to-r from-blue-50 to-purple-50 border-2 ${subscriptionStatus === 'pending_cancellation' ? 'border-orange-300' : 'border-blue-200'}`}>
                    <CardContent className="p-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900">Current Subscription</h3>
                          {subscriptionStatus === 'pending_cancellation' && (
                            <Badge className="bg-orange-500 text-white hover:bg-orange-600">
                              Cancelling
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-700">
                            <span className="font-semibold">Plan:</span> {subscriptionPlan === 'pro' ? 'Pro' : subscriptionPlan === 'pro_plus' ? 'Pro+' : subscriptionPlan === 'enterprise' ? 'Enterprise' : subscriptionPlan}
                          </p>
                          {subscriptionStartDate && (
                            <p className="text-gray-700">
                              <span className="font-semibold">Started:</span> {new Date(subscriptionStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          )}
                          {subscriptionEndDate && (
                            <p className="text-gray-700">
                              <span className="font-semibold">{subscriptionStatus === 'pending_cancellation' ? 'Expires:' : 'Renews:'}</span> {new Date(subscriptionEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(SUBSCRIPTION_PRICING).map(([planKey, plan]) => {
                    const isCurrentPlan = planTier === planKey;
                    const monthlyPrice = plan.monthlyPriceCents / 100;
                    const monthlyPoints = plan.dailyPoints * 30;
                    const proPrice = SUBSCRIPTION_PRICING.pro.monthlyPriceCents / 100;
                    const proPoints = SUBSCRIPTION_PRICING.pro.dailyPoints;
                    
                    // Calculate comparison to Pro plan
                    const pointsMultiplier = plan.dailyPoints / proPoints;
                    const priceMultiplier = monthlyPrice > 0 ? monthlyPrice / proPrice : 0;
                    const valueVsPro = monthlyPrice > 0 && planKey !== 'pro' 
                      ? pointsMultiplier > priceMultiplier 
                        ? `${Math.round((pointsMultiplier / priceMultiplier - 1) * 100)}% more points per $`
                        : null
                      : null;
                    
                    const isMostPopular = planKey === 'pro_plus';
                    const isBestValue = planKey === 'enterprise';
                    
                    const planEmojis = {
                      free: '🎯',
                      pro: '🚀',
                      pro_plus: '👑',
                      enterprise: '⚡',
                    };

                    return (
                      <div
                        key={planKey}
                        className={`relative rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                          isCurrentPlan
                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105'
                            : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                        } ${isMostPopular ? 'lg:border-orange-400 lg:shadow-md' : ''} flex flex-col`}
                      >
                        {/* Badge */}
                        {isMostPopular && (
                          <div className="absolute -top-2 left-4 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold rounded-full">
                            ⭐ Most Popular
                          </div>
                        )}
                        {isBestValue && (
                          <div className="absolute -top-2 left-4 px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                            💎 Best Value
                          </div>
                        )}
                        {isCurrentPlan && !isMostPopular && !isBestValue && (
                          <div className="absolute -top-2 left-4 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                            ✓ Current
                          </div>
                        )}

                        <div className="p-5 flex-1 flex flex-col">
                          {/* Header */}
                          <div className="text-center mb-4">
                            <div className="text-4xl mb-2">{planEmojis[planKey]}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.planName}</h3>
                            <p className="text-xs text-gray-600">{plan.dailyPoints.toLocaleString()} points/day</p>
                          </div>

                          {/* Pricing */}
                          <div className="text-center mb-4 pb-4 border-b border-gray-200">
                            {monthlyPrice > 0 ? (
                              <>
                                <div className="flex items-baseline justify-center gap-1 mb-2">
                                  <span className="text-3xl font-extrabold text-gray-900">${monthlyPrice.toFixed(2)}</span>
                                  <span className="text-sm text-gray-600">/mo</span>
                                </div>
                                {valueVsPro && planKey !== 'pro' && (
                                  <div className="text-xs text-green-700 font-semibold">
                                    {valueVsPro} vs Pro
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-3xl font-extrabold text-gray-900">Free</div>
                            )}
                          </div>

                          {/* Features */}
                          <ul className="space-y-2.5 mb-4 flex-1 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-orange-600 font-bold mt-0.5">✓</span>
                              <span className="text-gray-700">
                                <strong className="text-gray-900">{plan.dailyPoints.toLocaleString()} points/day</strong>
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-600 font-bold mt-0.5">✓</span>
                              <span className="text-gray-700">
                                <strong className="text-gray-900">{plan.aiMatchesPerDay} AI matches/day</strong>
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600 font-bold mt-0.5">✓</span>
                              <span className="text-gray-700">
                                Badge on <strong className="text-gray-900">/leaderboard</strong>
                              </span>
                            </li>
                            {planKey !== 'free' && (
                              <li className="flex items-start gap-2">
                                <span className="text-green-600 font-bold mt-0.5">✓</span>
                                <span className="text-gray-700">Points reset daily</span>
                              </li>
                            )}
                          </ul>

                          {/* CTA Button */}
                          {!isCurrentPlan && planKey !== 'free' && (
                            <button
                              onClick={async () => {
                                if (!user?.id) {
                                  toast({
                                    title: 'Authentication required',
                                    description: 'Please log in to subscribe',
                                    variant: 'destructive',
                                  });
                                  router.push('/auth');
                                  return;
                                }

                                try {
                                  const response = await fetch('/api/internal/promotion/subscribe', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      plan: planKey,
                                      userId: user.id,
                                    }),
                                  });

                                  const data = await response.json();

                                  if (!response.ok) {
                                    throw new Error(data.error || 'Failed to create subscription');
                                  }

                                  // Redirect to Stripe checkout
                                  if (data.checkoutUrl) {
                                    window.location.href = data.checkoutUrl;
                                  } else {
                                    throw new Error('No checkout URL received');
                                  }
                                } catch (error) {
                                  console.error('Error subscribing:', error);
                                  toast({
                                    title: 'Subscription failed',
                                    description: error.message || 'Failed to initiate subscription. Please try again.',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                              className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm sunset-gradient text-white shadow-md hover:shadow-lg transition-all duration-200 mt-auto"
                            >
                              Subscribe
                            </button>
                          )}
                          {isCurrentPlan && (
                            <div className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-center bg-gray-100 text-gray-600 border-2 border-gray-300">
                              Current Plan
                            </div>
                          )}
                          {planKey === 'free' && !isCurrentPlan && (
                            <div className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-center bg-gray-100 text-gray-600 border-2 border-gray-300">
                              Free Forever
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cancel Subscription Button - Only show if user has active subscription */}
                {subscriptionStatus === 'active' && subscriptionPlan && subscriptionPlan !== 'free' && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={() => setShowCancelModal(true)}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                )}

                {/* Cancel Subscription Modal */}
                {showCancelModal && (
                  <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowCancelModal(false)}
                  >
                    <div 
                      className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Subscription?</h3>
                        <p className="text-gray-600 mb-4">
                          We'd hate to see you go! 😢
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          Your subscription perks will remain active until{' '}
                          <span className="font-semibold text-gray-900">
                            {subscriptionEndDate 
                              ? new Date(subscriptionEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                              : 'the end of your billing period'}
                          </span>.
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          After that date, you'll be automatically moved to the free plan and will lose access to your subscription benefits:
                        </p>
                        <ul className="text-sm text-gray-600 text-left max-w-sm mx-auto space-y-1 mb-4">
                          <li>• Daily points will reset to 50 (free tier)</li>
                          <li>• AI matches will reset to 1 per day</li>
                          <li>• Subscription badge will be removed</li>
                        </ul>
                        <p className="text-xs text-gray-500">
                          This happens automatically when your subscription period ends.
                        </p>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={() => setShowCancelModal(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Do Not Cancel
                        </Button>
                        <Button
                          onClick={async () => {
                            setShowCancelModal(false);
                            setCancelling(true);
                            try {
                              const response = await fetch('/api/internal/promotion/cancel-subscription', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  userId: user.id,
                                }),
                              });

                              const data = await response.json();

                              if (!response.ok) {
                                throw new Error(data.error || 'Failed to cancel subscription');
                              }

                              toast({
                                title: 'Subscription cancelled',
                                description: 'Your subscription will remain active until the end of your billing period.',
                              });

                              // Reload subscription data to show updated status
                              const { data: account } = await supabase
                                .from('promotion_accounts')
                                .select('subscription_status, subscription_plan, subscription_start_date, subscription_end_date, stripe_subscription_id')
                                .eq('user_id', user.id)
                                .single();
                              
                              if (account) {
                                setSubscriptionStatus(account.subscription_status);
                                setSubscriptionPlan(account.subscription_plan);
                                setSubscriptionStartDate(account.subscription_start_date);
                                setSubscriptionEndDate(account.subscription_end_date);
                                setStripeSubscriptionId(account.stripe_subscription_id);
                              }
                              
                              // Also refresh from profiles to get updated plan_tier
                              const { data: profile } = await supabase
                                .from('profiles')
                                .select('plan_tier')
                                .eq('id', user.id)
                                .single();
                              
                              if (profile?.plan_tier) {
                                setPlanTier(profile.plan_tier);
                              }
                            } catch (error) {
                              console.error('Error cancelling subscription:', error);
                              toast({
                                title: 'Cancellation failed',
                                description: error.message || 'Failed to cancel subscription. Please try again.',
                                variant: 'destructive',
                              });
                            } finally {
                              setCancelling(false);
                            }
                          }}
                          disabled={cancelling}
                          variant="destructive"
                          className="flex-1"
                        >
                          {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <FooterNext />
    </div>
  );
}


