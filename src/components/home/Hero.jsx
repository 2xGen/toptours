"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Globe, ArrowRight, Users, UtensilsCrossed, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedHeroBackground from './AnimatedHeroBackground';

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-24 pb-20">
      <div className="absolute inset-0 ocean-gradient" />
      <AnimatedHeroBackground />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold">Revolutionary Tour & Restaurant Discovery</span>
            </div>
            <h1 className="font-poppins font-bold leading-tight mb-6">
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mb-2">
                Discover Top Tours & Restaurants
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl gradient-text whitespace-nowrap">
                Powered by Community + AI
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto text-center">
              <strong className="text-white">Boost the places you love, shape what's trending,</strong> and get AI recommendations tailored to your travel style. See what the community is loving right now.
            </p>

            <div className="flex flex-wrap gap-4 mb-10 justify-center">
              <Button
                asChild
                className="sunset-gradient text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200 px-8 py-3 text-lg"
              >
                <Link href="/how-it-works">
                  How It Works
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="bg-white/90 text-purple-700 border border-purple-100 hover:bg-white px-8 py-3 text-lg font-semibold"
              >
                <Link href="/destinations">
                  Explore Destinations
                </Link>
              </Button>
              <Button
                asChild
                className="bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/30 px-8 py-3 text-lg font-semibold"
              >
                <Link href="/auth">
                  Login / Sign Up Free
                </Link>
              </Button>
            </div>

            <div className="flex flex-col items-center gap-3 text-white/80">
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-300" />
                  <span>Community-driven rankings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span>AI-powered matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-200" />
                  <span>3300+ destinations</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-green-200" />
                  <span>3500+ restaurants</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-200" />
                  <span>10,000+ tours</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;