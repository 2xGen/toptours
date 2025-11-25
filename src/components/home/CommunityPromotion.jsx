"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Zap, Eye, Trophy, Users, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CommunityPromotion = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Featured in "Trending Now"',
      description: 'Boosted tours and restaurants appear prominently in "Trending Now" sections on destination pages — the first thing travelers see.',
      color: 'orange',
      gradient: 'from-orange-50 to-yellow-50',
      border: 'border-orange-200',
      iconBg: 'bg-orange-500'
    },
    {
      icon: Eye,
      title: 'Massive Visibility',
      description: 'Get featured across destination pages, tour listing pages, and restaurant pages. Thousands of travelers see your promoted listings daily.',
      color: 'blue',
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-500'
    },
    {
      icon: Trophy,
      title: 'Climb the Leaderboard',
      description: 'Compete for top rankings on the global leaderboard. Higher scores mean more visibility and more bookings.',
      color: 'yellow',
      gradient: 'from-yellow-50 to-orange-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-500'
    },
    {
      icon: Users,
      title: 'Community-Driven',
      description: 'Real travelers boost what they love. Your listings rise based on actual community preference, not algorithms.',
      color: 'purple',
      gradient: 'from-purple-50 to-pink-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 rounded-full px-4 py-2 mb-4">
            <Zap className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">The Promotion System</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Promoting Your Tours & Restaurants Matters
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            <strong>Visibility = Bookings.</strong> When you boost a tour or restaurant, it gets featured across multiple high-traffic pages, giving it massive exposure to travelers actively planning their trips.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`bg-gradient-to-br ${benefit.gradient} border-2 ${benefit.border} shadow-lg hover:shadow-xl transition-all h-full`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-full ${benefit.iconBg} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="sunset-gradient rounded-2xl p-8 text-white shadow-xl"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Boost Your Listings?
            </h3>
            <p className="text-lg text-white/90 mb-6">
              Get daily points with a free account, or upgrade to Pro/Pro+/Enterprise for more points. Boost tours and restaurants to get featured in "Trending Now" sections and climb the leaderboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/how-it-works">
                  Learn How It Works
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-bold px-8 py-6 text-lg"
              >
                <Link href="/auth">
                  Get Started Free
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>50 points/day free</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Featured in Trending Now</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Real-time rankings</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityPromotion;

