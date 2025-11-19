"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Sparkles, Zap, Info, X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePromotion } from '@/hooks/usePromotion';
import { toast } from '@/components/ui/use-toast';
import confetti from 'canvas-confetti';
import { A_LA_CARTE_PACKAGES } from '@/lib/promotionSystem';
import { getTourUrl } from '@/utils/tourHelpers';

export default function TourPromotionCard({ productId, initialScore = null, compact = false, tourData = null, destinationId = null }) {
  // Only load account automatically if not in compact mode
  const { account, loading: accountLoading, spendPoints, refreshAccount } = usePromotion(compact);
  const [score, setScore] = useState(initialScore);
  const [pointsToSpend, setPointsToSpend] = useState('');
  const [isSpending, setIsSpending] = useState(false);
  const [loadingScore, setLoadingScore] = useState(!initialScore);
  const [showInfo, setShowInfo] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [accountLoaded, setAccountLoaded] = useState(false);
  const infoRef = useRef(null);
  const modalRef = useRef(null);

  // Load score if not provided (only if initialScore is not set)
  // Always load if in compact mode, or if not compact and no initialScore provided
  useEffect(() => {
    if (!initialScore && productId) {
      // Fetch score if not provided (works for both compact and non-compact modes)
      loadScore();
    }
  }, [productId, initialScore]);

  // Close info on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setShowInfo(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target) && showModal) {
        setShowModal(false);
      }
    };
    if (showInfo || showModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showInfo, showModal]);

  // Load account only when modal opens (for compact mode)
  useEffect(() => {
    if (showModal && compact && !accountLoaded && !accountLoading) {
      refreshAccount();
      setAccountLoaded(true);
    }
  }, [showModal, compact, accountLoaded, accountLoading, refreshAccount]);

  const loadScore = async () => {
    try {
      setLoadingScore(true);
      const response = await fetch(`/api/internal/promotion/tour-score?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setScore(data);
      }
    } catch (error) {
      console.error('Error loading tour score:', error);
    } finally {
      setLoadingScore(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleSpendPoints = async () => {
    if (!account) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to promote tours with your daily points.',
        variant: 'destructive',
      });
      setShowModal(false);
      return;
    }

    const points = parseInt(pointsToSpend);
    if (!points || points <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid number of points.',
        variant: 'destructive',
      });
      return;
    }

    // Minimum boost requirement: 10 points
    const MIN_BOOST_POINTS = 10;
    if (points < MIN_BOOST_POINTS) {
      toast({
        title: 'Minimum boost required',
        description: `You must boost with at least ${MIN_BOOST_POINTS} points.`,
        variant: 'destructive',
      });
      return;
    }

    if (points > account.daily_points_available) {
      toast({
        title: 'Insufficient points',
        description: `You only have ${account.daily_points_available} points available today.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSpending(true);
      // Add destination_id to tourData if provided
      const enhancedTourData = destinationId && tourData 
        ? { ...tourData, _destinationId: destinationId }
        : tourData;
      await spendPoints(productId, points, 'all', enhancedTourData);
      
      // Trigger confetti celebration!
      triggerConfetti();
      
      toast({
        title: '🎉 Points added!',
        description: `You've boosted this tour with ${points} points!`,
      });

      setPointsToSpend('');
      await loadScore(); // Refresh score
      if (compact) {
        setShowModal(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to spend points.',
        variant: 'destructive',
      });
    } finally {
      setIsSpending(false);
    }
  };

  const handleMaxPoints = () => {
    if (account) {
      setPointsToSpend(account.daily_points_available.toString());
    }
  };

  const handleALaCartePurchase = async (packageName) => {
    if (!account) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to purchase instant boost packages.',
        variant: 'destructive',
      });
      setShowModal(false);
      return;
    }

    try {
      // Get current page URL or construct tour URL for redirect after payment
      const returnUrl = typeof window !== 'undefined' 
        ? window.location.href 
        : tourData?.title 
          ? getTourUrl(productId, tourData.title)
          : `/tours/${productId}`;

      // Add destination_id to tourData if provided (same as regular boosts)
      const enhancedTourData = destinationId && tourData 
        ? { ...tourData, _destinationId: destinationId }
        : tourData;

      // Call API to create Stripe checkout session
      const response = await fetch('/api/internal/promotion/purchase-a-la-carte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          packageName,
          userId: account.user_id,
          tourData: enhancedTourData, // Use enhanced tourData with destinationId
          returnUrl, // Pass the URL to redirect back after payment
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create purchase session');
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error purchasing a la carte:', error);
      toast({
        title: 'Purchase failed',
        description: error.message || 'Failed to initiate purchase. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const totalScore = score?.total_score || 0;
  const hasAccount = account && !accountLoading;

  // Don't render if productId is missing
  if (!productId) {
    return null;
  }

  // Compact version for listing cards
  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-semibold text-gray-700">TopTours Score</span>
          {loadingScore ? (
            <div className="h-4 w-8 bg-gray-200 animate-pulse rounded" />
          ) : (
            <span className="text-sm font-bold text-orange-600">
              {totalScore.toLocaleString()}
            </span>
          )}
          <button
            onClick={handleOpenModal}
            className="text-xs text-orange-600 hover:text-orange-700 hover:underline font-medium ml-1"
          >
            boost this tour
          </button>
        </div>

        {/* Modal for promotion - Using portal to avoid overflow clipping */}
        {showModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div
              ref={modalRef}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">Boost This Tour</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Score</span>
                  <span className="text-xl font-bold text-orange-600">
                    {totalScore.toLocaleString()}
                  </span>
                </div>
              </div>

              {accountLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading...</p>
                </div>
              ) : hasAccount ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg px-4 py-3 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          {account.daily_points_available} points available
                        </span>
                      </div>
                      {account.tier === 'pro_booster' && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold">
                          PRO
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="10"
                        max={account.daily_points_available}
                        value={pointsToSpend}
                        onChange={(e) => setPointsToSpend(e.target.value)}
                        placeholder="Min 10 points"
                        className="flex-1 px-3 py-2.5 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm font-medium"
                      />
                      <Button
                        onClick={handleMaxPoints}
                        variant="outline"
                        size="sm"
                        className="px-3 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold"
                      >
                        Max
                      </Button>
                      <Button
                        onClick={handleSpendPoints}
                        disabled={isSpending || !pointsToSpend || parseInt(pointsToSpend) < 10}
                        className="sunset-gradient text-white font-bold px-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                      {isSpending ? (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 animate-spin" />
                          Adding...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Boost!
                        </span>
                      )}
                    </Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Minimum boost: 10 points
                    </p>
                  </div>

                  {/* A La Carte Purchase Options */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <h4 className="text-sm font-bold text-gray-900">Instant Boost Packages</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      One-time purchase — points apply immediately to this tour
                    </p>
                    <div className="space-y-2">
                      {Object.entries(A_LA_CARTE_PACKAGES).map(([packageName, packageInfo]) => {
                        const priceDollars = (packageInfo.priceCents / 100).toFixed(2);
                        const savings = packageName === '5000_points' ? '30%' : packageName === '3000_points' ? '20%' : '';
                        return (
                          <button
                            key={packageName}
                            onClick={() => handleALaCartePurchase(packageName)}
                            className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">
                                  {packageInfo.points.toLocaleString()} points
                                </span>
                                {savings && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                    Save {savings}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                ${priceDollars} • ${(packageInfo.pricePerPoint * 100).toFixed(3)}¢ per point
                              </p>
                            </div>
                            <CreditCard className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      💡 <strong>Tip:</strong> Subscriptions are 90% cheaper per point!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Sign in to boost this tour with your daily points
                  </p>
                  <a
                    href="/auth"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-yellow-600 transition-all shadow-md hover:shadow-lg"
                  >
                    <Zap className="w-4 h-4" />
                    Sign In to Promote
                  </a>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  // Full version for sidebar (with animations)
  return (
    <div className="space-y-4">
      {/* Promotion Score Card */}
      <div className="relative bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Score Display - Gamified Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-bold text-gray-800">Promotion Score</span>
            <div className="relative group">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="relative"
                aria-label="What is this?"
              >
                <Info className="w-4 h-4 text-gray-400 hover:text-orange-600 transition-colors" />
              </button>
              {/* Info Tooltip */}
              {showInfo && (
                <div
                  ref={infoRef}
                  className="absolute top-6 left-0 z-50 bg-white border-2 border-orange-300 rounded-lg shadow-2xl p-3 w-64"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-xs">How Promotion Works</h4>
                    <button
                      onClick={() => setShowInfo(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Points boost a tour's score, making it appear higher in search results and on the <a href="/toptours" className="text-orange-600 hover:underline font-semibold">leaderboard</a>.
                  </p>
                  <a 
                    href="/how-it-works" 
                    className="text-xs text-orange-600 hover:underline font-semibold"
                  >
                    Learn more →
                  </a>
                </div>
              )}
            </div>
          </div>
          {loadingScore ? (
            <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-lg" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                {totalScore.toLocaleString()}
              </div>
              {totalScore > 0 && (
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
              )}
            </div>
          )}
        </div>

        {/* Daily Points Section (only if signed in) */}
        {hasAccount ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg px-3 py-2 border border-orange-200">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-semibold text-gray-700">
                  {account.daily_points_available} points available
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  min="10"
                  max={account.daily_points_available}
                  value={pointsToSpend}
                  onChange={(e) => setPointsToSpend(e.target.value)}
                  placeholder="Min 10 points"
                  className="flex-1 px-3 py-2.5 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm font-medium transition-all"
                />
                <Button
                  onClick={handleMaxPoints}
                  variant="outline"
                  size="sm"
                  className="px-3 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold transition-all hover:scale-105"
                >
                  Max
                </Button>
                <Button
                  onClick={handleSpendPoints}
                  disabled={isSpending || !pointsToSpend || parseInt(pointsToSpend) < 10}
                  className="sunset-gradient text-white font-bold px-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                {isSpending ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Boost!
                  </span>
                )}
              </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Minimum boost: 10 points
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-gray-600 mb-2">
              Sign in to boost this tour with your daily points
            </p>
            <a 
              href="/auth" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-yellow-600 transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              <Zap className="w-4 h-4" />
              Sign In to Promote
            </a>
          </div>
        )}
      </div>

      {/* A La Carte Purchase Options - Separate Card (always visible) */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl p-4 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-5 h-5 text-purple-600" />
          <h4 className="text-sm font-bold text-gray-900">Instant Boost Packages</h4>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          One-time purchase — points apply immediately to this tour
        </p>
        <div className="space-y-2">
          {Object.entries(A_LA_CARTE_PACKAGES).map(([packageName, packageInfo]) => {
            const priceDollars = (packageInfo.priceCents / 100).toFixed(2);
            const savings = packageName === '5000_points' ? '30%' : packageName === '3000_points' ? '20%' : '';
            return (
              <button
                key={packageName}
                onClick={() => {
                  if (!hasAccount) {
                    // For non-signed-in users, redirect to auth first
                    window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
                    return;
                  }
                  handleALaCartePurchase(packageName);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {packageInfo.points.toLocaleString()} points
                    </span>
                    {savings && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Save {savings}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ${priceDollars} • ${(packageInfo.pricePerPoint * 100).toFixed(3)}¢ per point
                  </p>
                </div>
                <CreditCard className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          💡 <strong>Tip:</strong> Subscriptions are 90% cheaper per point!
        </p>
      </div>
    </div>
  );
}
