"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  UtensilsCrossed,
  MapPin,
  Star,
  TrendingUp,
  Users,
  ArrowRight,
  Shield,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Link from 'next/link';

export default function PartnersPage() {
  const features = [
    {
      icon: Crown,
      title: 'Premium Visibility',
      description: 'Stand out with crown badges and featured placement'
    },
    {
      icon: Star,
      title: 'Aggregated Reviews',
      description: 'Show combined ratings across all your listings'
    },
    {
      icon: TrendingUp,
      title: 'Increased Bookings',
      description: 'Get more visibility and drive more traffic'
    },
    {
      icon: Shield,
      title: 'Trusted Badge',
      description: 'Build credibility with verified operator status'
    }
  ];

  const benefits = [
    'Increased visibility and discoverability',
    'Premium badges and featured placement',
    'Aggregated review statistics',
    'Direct links to all your listings',
    'Professional partner dashboard',
    'Priority customer support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <NavigationNext />
      
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
            <Crown className="w-10 h-10 md:w-12 md:h-12 text-amber-500" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Partner with TopTours.ai
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-6">
            Join tour operators and restaurants looking to grow their business with TopTours.ai
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Our mission is to connect travelers with the best experiences worldwide. 
            As a partner, you'll get premium visibility, aggregated reviews, and tools to showcase your offerings to a growing audience.
          </p>
        </motion.div>

        {/* About TopTours Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16 md:mb-20"
        >
          <Card className="shadow-xl border-2 border-purple-100">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-8 h-8 text-purple-600" />
                <h2 className="text-3xl font-bold text-gray-900">About TopTours.ai</h2>
              </div>
              
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                <p>
                  TopTours.ai is a fast-growing platform for discovering and booking tours, activities, 
                  and restaurant experiences. We connect travelers with verified operators and 
                  premium establishments across 3,500+ destinations worldwide.
                </p>
                <p>
                  Our platform combines AI-powered recommendations, comprehensive reviews, and seamless booking 
                  to help travelers find the perfect experiences. For partners, we offer premium visibility, 
                  aggregated statistics, and tools to showcase your offerings to a growing audience.
                </p>
                <p className="font-semibold text-gray-900">
                  Join us in making travel experiences more accessible, discoverable, and memorable for everyone.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">3,500+ Destinations</h3>
                    <p className="text-gray-600">
                      Reach travelers exploring destinations worldwide
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Growing Traveler Community</h3>
                    <p className="text-gray-600">
                      Connect with travelers actively searching for experiences
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Partner Programs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Choose Your Partner Program
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tour Operators */}
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200 group cursor-pointer">
              <Link href="/partners/tour-operators">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Tour Operators</h3>
                      <p className="text-gray-600">Increase visibility for your tours</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    Get premium visibility, aggregated reviews, and bundle your tours together for maximum exposure.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-purple-600 font-semibold group-hover:text-purple-700">
                      Learn More
                    </span>
                    <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Restaurants */}
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-amber-200 group cursor-pointer">
              <Link href="/partners/restaurants">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UtensilsCrossed className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Restaurants</h3>
                      <p className="text-gray-600">Premium visibility for your restaurant</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    Get premium visibility, enhanced search placement, and drive more traffic to your restaurant.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600 font-semibold group-hover:text-amber-700">
                      Learn More
                    </span>
                    <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Why Partner with Us?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Benefits List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <Card className="shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Partner Benefits
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Card className="shadow-xl border-2 border-purple-200 bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
            <CardContent className="p-12">
              <Crown className="w-16 h-16 mx-auto mb-6 text-amber-400" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Grow Your Business?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join partners already growing with TopTours.ai. 
                Get started in minutes and see the potential for growth as your listings gain visibility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8"
                >
                  <Link href="/partners/tour-operators">
                    Become a Tour Operator Partner
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white/30 font-semibold px-8"
                >
                  <Link href="/partners/restaurants">
                    Become a Restaurant Partner
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>
      
      <FooterNext />
    </div>
  );
}

