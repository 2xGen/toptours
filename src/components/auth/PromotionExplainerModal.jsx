"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Zap, Target, Trophy, Coins, Gift, CreditCard, Check, Sparkles, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SUBSCRIPTION_PRICING, A_LA_CARTE_PACKAGES } from '@/lib/promotionSystem';

export default function PromotionExplainerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-4"
          >
            {/* Close Button - Fixed */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 text-gray-600 hover:text-gray-900 transition-colors bg-white/90 rounded-full p-1.5 sm:p-2 shadow-lg touch-manipulation"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="ocean-gradient p-4 sm:p-6 text-white relative">
                <div className="pr-8 sm:pr-12">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-semibold">The Promotion System</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                    How Promotion Points Work
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-white/90">
                    Every tour and restaurant has a promotion score. The higher the score, the more visible it becomes — appearing in "Trending Now" sections, climbing leaderboards, and getting featured across destination pages.
                  </p>
                </div>
              </div>

              {/* How Points Work Section */}
              <div className="p-4 sm:p-6 md:p-8 bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-orange-200 shadow-lg mb-4 sm:mb-6 md:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
                      <div className="text-center">
                        <Target className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">1. Get Daily Points</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Every account gets free points daily. Upgrade to Pro, Pro+, or Enterprise for more points.
                        </p>
                      </div>
                      <div className="text-center">
                        <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">2. Boost Tours & Restaurants</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Spend your subscription points on tours and restaurants that deserve more visibility. Minimum 10 points per boost.
                        </p>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">3. Watch Them Rise</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Boosted tours and restaurants appear in "Trending Now" sections, climb the leaderboard, and get featured across pages.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-4 sm:p-6 border border-orange-200">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-600" />
                        How Scores Are Calculated
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                          <strong className="text-gray-900">Total Score:</strong> All points ever received (all-time leaderboard)
                        </div>
                        <div>
                          <strong className="text-gray-900">Past 28 Days:</strong> Rolling window for "Trending Now" sections
                        </div>
                        <div>
                          <strong className="text-gray-900">This Month:</strong> Points received this calendar month
                        </div>
                        <div>
                          <strong className="text-gray-900">This Week:</strong> Points received this week
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Where Tours Get Promoted */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-blue-200 shadow-lg mb-4 sm:mb-6 md:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      Where Tours & Restaurants Get Promoted
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-white rounded-xl p-4 sm:p-6 border border-blue-200">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Star className="w-5 h-5 text-orange-600" />
                          "Trending Now" Sections
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Featured on destination detail pages</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Shown on tours listing pages</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Based on past 28 days score</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Top 3 tours and restaurants per destination</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-600" />
                          Global Leaderboard
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Ranked by total all-time points</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Filterable by region</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Multiple score types (all-time, monthly, weekly, 28-day)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Visible to all travelers</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Plans */}
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-purple-200 shadow-lg mb-4 sm:mb-6 md:mb-8">
                    <div className="text-center mb-4 sm:mb-6 md:mb-8">
                      <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4">
                        <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        <span className="text-xs sm:text-sm font-semibold text-purple-700">Choose Your Plan</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Daily Points That Reset Every 24 Hours
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                        All plans include daily points that reset every 24 hours. Use them or lose them — this keeps the competition fresh and rewards active users.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(SUBSCRIPTION_PRICING).map(([planKey, plan]) => {
                        const monthlyPrice = plan.monthlyPriceCents / 100;
                        const planEmojis = {
                          free: '🎯',
                          pro: '🚀',
                          pro_plus: '👑',
                          enterprise: '⚡',
                        };
                        const isMostPopular = planKey === 'pro_plus';
                        const isBestValue = planKey === 'enterprise';

                        return (
                          <div
                            key={planKey}
                            className={`relative rounded-xl border-2 transition-all ${
                              'border-gray-200 bg-white hover:border-orange-300'
                            } ${isMostPopular ? 'lg:border-orange-400' : ''} flex flex-col`}
                          >
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

                            <div className="p-5 flex-1 flex flex-col">
                              <div className="text-center mb-4">
                                <div className="text-4xl mb-2">{planEmojis[planKey]}</div>
                                <h4 className="text-xl font-bold text-gray-900 mb-1">{plan.planName}</h4>
                                <p className="text-xs text-gray-600">{plan.dailyPoints.toLocaleString()} points/day</p>
                              </div>

                              <div className="text-center mb-4 pb-4 border-b border-gray-200">
                                {monthlyPrice > 0 ? (
                                  <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-3xl font-extrabold text-gray-900">${monthlyPrice.toFixed(2)}</span>
                                    <span className="text-sm text-gray-600">/mo</span>
                                  </div>
                                ) : (
                                  <div className="text-3xl font-extrabold text-gray-900">Free</div>
                                )}
                              </div>

                              <ul className="space-y-2 mb-4 flex-1 text-sm">
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Instant Boost Packages */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-purple-200 shadow-lg">
                    <div className="text-center mb-4 sm:mb-6 md:mb-8">
                      <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <span className="text-xs sm:text-sm font-semibold text-blue-700">Instant Boosts</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Need More Points Right Now?
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                        One-time purchase packages that apply points immediately to a specific tour or restaurant. Perfect for tour operators, restaurant owners, or travelers who want to give a listing an extra boost.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                      {Object.entries(A_LA_CARTE_PACKAGES).map(([packageName, packageInfo]) => {
                        const priceDollars = (packageInfo.priceCents / 100).toFixed(2);
                        const savings = packageName === '5000_points' ? '30%' : packageName === '3000_points' ? '20%' : '';
                        return (
                          <div
                            key={packageName}
                            className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg"
                          >
                            <div className="text-center mb-4">
                              <div className="text-3xl font-extrabold text-gray-900 mb-2">
                                {packageInfo.points.toLocaleString()} points
                              </div>
                              {savings && (
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-2">
                                  Save {savings}
                                </span>
                              )}
                              <div className="text-2xl font-bold text-gray-900">${priceDollars}</div>
                              <div className="text-sm text-gray-600">
                                ${(packageInfo.pricePerPoint * 100).toFixed(3)}¢ per point
                              </div>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-700">
                              <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <span>Points apply immediately</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <span>Helps compete on leaderboard</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                <span>Affects all score types</span>
                              </li>
                            </ul>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 mb-2">What Instant Boosts Don't Do:</p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold mr-1">✗</span>
                          <span>Don't count toward your <strong>daily streak</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold mr-1">✗</span>
                          <span>Don't count toward the <strong>Top Promoters leaderboard</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-bold mr-1">✗</span>
                          <span>Don't add points to your <strong>wallet</strong> — they're applied directly to the tour or restaurant</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with CTA */}
            <div className="bg-white border-t border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 max-w-4xl mx-auto">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600 mb-1">
                    Ready to boost your favorite tours & restaurants?
                  </p>
                  <p className="text-xs text-gray-500">
                    Create an account to get started with 50 free points daily
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="px-6"
                  >
                    Close
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="px-6"
                  >
                    <Link href="/how-it-works" onClick={onClose}>
                      Full Guide
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="sunset-gradient text-white font-semibold shadow-lg hover:scale-105 transition-transform px-8"
                  >
                    <Link href="/auth" onClick={onClose}>
                      Create Account
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

