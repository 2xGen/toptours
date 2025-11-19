"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Zap, 
  Sparkles, 
  Brain, 
  Users, 
  TrendingUp, 
  CreditCard, 
  Star,
  Crown,
  Medal,
  Shield,
  ArrowRight,
  Check,
  Gift,
  Target,
  BarChart3,
  Globe,
  Flame
} from 'lucide-react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { Button } from '@/components/ui/button';
import { SUBSCRIPTION_PRICING, A_LA_CARTE_PACKAGES } from '@/lib/promotionSystem';

export default function HowItWorksClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationNext />
      
      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="pt-8 pb-16 ocean-gradient text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Revolutionary Tour Discovery</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How TopTours.ai<span className="text-xs align-super">™</span> Works
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              The first community-driven, AI-powered platform that helps you discover tours that actually match your travel style — and lets you boost the ones you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/destinations">
                <Button variant="outline" className="border-2 border-white bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-bold px-8 py-6 text-lg">
                  Explore Tours
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">How It Works</span>
            </nav>
          </div>
        </section>

        {/* What Makes Us Unique */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why TopTours.ai<span className="text-xs align-super">™</span> is Groundbreaking
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We combine the power of community with cutting-edge AI to create the most personalized tour discovery experience ever built.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Community-Driven */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-orange-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Community-Driven</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  <strong>You decide which tours deserve the spotlight.</strong> Every day, our growing community uses their points to boost tours they love. The most-boosted tours rise to the top, creating a real-time ranking based on actual community preference — not just algorithms.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Daily points reset every 24 hours — use them or lose them</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Build your streak by claiming points daily — your streak badge appears on the leaderboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Track your total points spent — compete for the top promoters leaderboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Trending tours appear in "Trending Now" sections on destination pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Global leaderboard shows the most-loved tours across all destinations</span>
                  </li>
                </ul>
              </div>

              {/* AI-Powered */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-8 h-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900">AI-Powered Matching</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  <strong>Get personalized tour recommendations that actually fit your style.</strong> Our AI analyzes your travel preferences — from adventure level to budget comfort — and matches you with tours that align perfectly with what you're looking for.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Fill out your travel preferences once — get matches forever</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>See a 0-100% match score with detailed breakdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Understand why a tour matches (or doesn't) with pros and cons</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How Points Work */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-orange-100 rounded-full px-4 py-2 mb-4">
                <Trophy className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-semibold text-orange-700">The Points System</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How Promotion Points Work
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Every tour has a promotion score. The higher the score, the more visible it becomes. You control which tours get boosted.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-orange-200 shadow-lg mb-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <Target className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">1. Get Daily Points</h3>
                  <p className="text-sm text-gray-600">
                    Every account gets free points daily. Upgrade to Pro, Pro+, or Enterprise for more points.
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">2. Boost Tours You Love</h3>
                  <p className="text-sm text-gray-600">
                    Spend your subscription points on tours that deserve more visibility. Minimum 10 points per boost.
                  </p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">3. Watch Them Rise</h3>
                  <p className="text-sm text-gray-600">
                    Boosted tours appear in "Trending Now" sections and climb the leaderboard.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-6 border border-orange-200">
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

              {/* Streak & Top Promoters Section */}
              <div className="bg-white rounded-2xl p-8 border-2 border-orange-200 shadow-lg mt-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Streak Feature */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Flame className="w-8 h-8 text-orange-600" />
                      <h3 className="text-xl font-bold text-gray-900">Daily Streak</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Build your streak by claiming your daily subscription points every 24 hours. Your streak increases each consecutive day you claim points.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>Claim daily points within 24 hours to maintain your streak</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>Your streak badge appears next to your name on the leaderboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>Missing a day resets your streak to 1 when you claim again</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-800 font-semibold">
                        ⚠️ Only available with subscription points — instant boosts don't count toward streaks
                      </p>
                    </div>
                  </div>

                  {/* Top Promoters Feature */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy className="w-8 h-8 text-purple-600" />
                      <h3 className="text-xl font-bold text-gray-900">Top Promoters</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Compete for the top promoters leaderboard by spending your subscription points. The more points you spend, the higher you rank.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Track your total points spent on your profile</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Top promoters are displayed on the Top Tours leaderboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Your subscription tier and streak are shown next to your name</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-800 font-semibold">
                        ⚠️ Only subscription points count — instant boosts don't contribute to your total
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Plans */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
                <Gift className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">Choose Your Plan</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Daily Points That Reset Every 24 Hours
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                All plans include daily points that reset every 24 hours. Use them or lose them — this keeps the competition fresh and rewards active users.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Object.entries(SUBSCRIPTION_PRICING).map(([planKey, plan]) => {
                const monthlyPrice = plan.monthlyPriceCents / 100;
                const monthlyPoints = plan.dailyPoints * 30;
                const proPrice = SUBSCRIPTION_PRICING.pro.monthlyPriceCents / 100;
                const proPoints = SUBSCRIPTION_PRICING.pro.dailyPoints;
                
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
                      'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                    } ${isMostPopular ? 'lg:border-orange-400 lg:shadow-md' : ''} flex flex-col`}
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
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.planName}</h3>
                        <p className="text-xs text-gray-600">{plan.dailyPoints.toLocaleString()} points/day</p>
                      </div>

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
                            Badge on <strong className="text-gray-900">/toptours</strong>
                          </span>
                        </li>
                        {planKey !== 'free' && (
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold mt-0.5">✓</span>
                            <span className="text-gray-700">Points reset daily</span>
                          </li>
                        )}
                      </ul>

                      {planKey !== 'free' && (
                        <Link href="/profile?tab=plan">
                          <Button className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm sunset-gradient text-white shadow-md hover:shadow-lg transition-all duration-200 mt-auto">
                            Subscribe
                          </Button>
                        </Link>
                      )}
                      {planKey === 'free' && (
                        <Link href="/auth">
                          <Button className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm bg-gray-700 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200 mt-auto">
                            Get Started Free
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* AI Tour Matching */}
        <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">AI-Powered Matching</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get Tours That Actually Match Your Style
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                No more scrolling through hundreds of tours that don't fit. Tell us what kind of traveler you are, and we'll show you tours that match.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    Set Your Travel Preferences
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Fill out your travel preferences once in your profile. Our AI learns:
                  </p>
                  <ul className="space-y-2 text-gray-700 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Adventure level:</strong> Relaxed, balanced, or adventurous?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Travel style:</strong> Relaxing vs exploring, guided vs independent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Budget comfort:</strong> Budget-conscious or comfort-focused?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Group preference:</strong> Big groups, small groups, or solo?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Food & drinks:</strong> How important are culinary experiences?</span>
                    </li>
                  </ul>
                  <Link href="/profile?tab=trip">
                    <Button className="sunset-gradient text-white font-bold">
                      Set Your Preferences
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Get Instant Match Scores
                  </h3>
                  <p className="text-gray-700 mb-4">
                    On any tour page, click "Analyze Match with My Preferences" to see:
                  </p>
                  <ul className="space-y-2 text-gray-700 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Match score (0-100%):</strong> How well the tour fits your style</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Detailed breakdown:</strong> See scores for each preference</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Pros & cons:</strong> Why it matches (or doesn't)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Ideal for:</strong> What type of traveler this tour suits</span>
                    </li>
                  </ul>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-gray-700">
                      <strong className="text-purple-700">Free users:</strong> 1 match per day • <strong className="text-purple-700">Pro/Pro+:</strong> 5 matches per day • <strong className="text-purple-700">Enterprise:</strong> 20 matches per day
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instant Boost Packages */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Instant Boosts</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Need More Points Right Now?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                One-time purchase packages that apply points immediately to a specific tour. Perfect for tour operators or travelers who want to give a tour an extra boost.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {Object.entries(A_LA_CARTE_PACKAGES).map(([packageName, packageInfo]) => {
                const priceDollars = (packageInfo.priceCents / 100).toFixed(2);
                const savings = packageName === '5000_points' ? '30%' : packageName === '3000_points' ? '20%' : '';
                return (
                  <div
                    key={packageName}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all"
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
                    <ul className="space-y-2 text-sm text-gray-700 mb-4">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Points apply immediately to the tour</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Helps compete on Top Tours Leaderboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Affects all score types</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold mr-1">✗</span>
                        <span className="text-gray-600">Doesn't count toward streak or promoters leaderboard</span>
                      </li>
                    </ul>
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <p className="text-xs text-gray-600 text-center">
                        💡 <strong>Tip:</strong> Subscriptions are 90% cheaper per point!
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* How to Purchase & What Instant Boosts Do/Don't Do */}
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 max-w-3xl mx-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                How to Purchase Instant Boosts
              </h3>
              <p className="text-gray-700 mb-3">
                Navigate to any tour listing page or tour card, click the <strong>"Boost"</strong> button, and purchase points directly. The points are applied immediately to that specific tour.
              </p>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">What Instant Boosts Do:</p>
                <ul className="space-y-1 text-sm text-gray-700 mb-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Give your favorite listing an <strong>instant boost</strong> on the Top Tours Leaderboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Help tours <strong>compete on the Top Tours Leaderboard</strong> immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Affect <strong>all score types</strong> (all-time, monthly, weekly, past 28 days)</span>
                  </li>
                </ul>
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
                    <span>Don't add points to your <strong>wallet</strong> — they're applied directly to the tour</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Top Tours Leaderboard */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-yellow-100 rounded-full px-4 py-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-700">Global Leaderboard</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                The TopTours Leaderboard
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See which tours are winning the community's hearts. Rankings update in real-time as travelers boost their favorites.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-yellow-200 shadow-lg mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-yellow-600" />
                    Score Types
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">∞</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">All Time:</strong> Total points ever received. Shows the most-loved tours of all time.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold text-sm">28</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">Past 28 Days:</strong> Rolling window. Powers "Trending Now" sections on destination pages.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold text-sm">M</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">This Month:</strong> Points received this calendar month. Resets on the 1st.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-600 font-bold text-sm">W</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">This Week:</strong> Points received this week. Resets on Mondays.
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-yellow-600" />
                    Regional Rankings
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Filter the leaderboard by region to see which tours are winning in:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Caribbean', 'Europe', 'North America', 'Asia', 'South America', 'Africa'].map((region) => (
                      <div key={region} className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                        <span className="text-sm font-semibold text-gray-900">{region}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm text-gray-700">
                      <strong className="text-yellow-700">Monthly Winners:</strong> Each month, we crown the top tours per region. Winners get featured badges and recognition.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link href="/toptours">
                <Button className="sunset-gradient text-white font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all">
                  View the Leaderboard
                  <Trophy className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                More Reasons to Join TopTours.ai<span className="text-xs align-super">™</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <Star className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Save Your Favorites</h3>
                <p className="text-sm text-gray-700">
                  Signed-in users can bookmark tours to their favorites list. Build your dream itinerary and compare tours side-by-side.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <Users className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Community-Driven</h3>
                <p className="text-sm text-gray-700">
                  Every boost matters. Your points help real tours get discovered by real travelers. No algorithms, just community preference.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <Brain className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">AI That Actually Helps</h3>
                <p className="text-sm text-gray-700">
                  Our AI doesn't just recommend — it explains why. See exactly how well a tour matches your preferences with detailed breakdowns.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 cta-gradient text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Discover Your Perfect Tours?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Be part of the TopTours.ai<span className="text-xs align-super">™</span> community and find tours that actually match your style. It's free to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/destinations">
                <Button variant="outline" className="border-2 border-white bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-bold px-8 py-6 text-lg">
                  Explore Tours
                </Button>
              </Link>
            </div>
            <p className="text-sm text-white/80 mt-6">
              ✓ Free account includes 50 points/day • ✓ Save/bookmark unlimited tours • ✓ 1 AI match per day
            </p>
          </div>
        </section>
      </main>

      <FooterNext />
    </div>
  );
}

