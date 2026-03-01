"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Zap, Shield, Globe, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const WhyChoose = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Matching',
      description: 'Our advanced AI analyzes your preferences and matches you with tours that fit your style perfectly.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Personalized Recommendations',
      description: 'Get match scores (0-100%) for every listing, so you know exactly what suits you before you book.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Find and book tours in seconds. No endless scrolling through irrelevant options.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Trusted & Secure',
      description: 'Free cancellation on most tours, instant confirmation, and secure booking through trusted partners.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      title: 'Worldwide Coverage',
      description: 'Access to 300,000+ tours and 38,000+ travel guides across 3,300+ destinations.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Heart,
      title: 'Save Your Favorites',
      description: 'Create a free account to save unlimited tours and get personalized recommendations.',
      color: 'from-pink-500 to-rose-500'
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose TopTours.ai?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We make travel planning effortless with AI-powered recommendations that match your unique style and preferences.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-300">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
