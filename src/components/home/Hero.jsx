"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Globe, UtensilsCrossed, Ticket, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedHeroBackground from './AnimatedHeroBackground';

const Hero = ({ onOpenOnboardingModal }) => {
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
                Tours & Restaurants That Match Your Style
              </span>
              <span className="block text-xl sm:text-2xl lg:text-3xl xl:text-4xl gradient-text whitespace-nowrap">
                Powered by AI-driven Best Match
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto text-center">
              Get personalized recommendations that match your travel style, budget, and group preferences with <strong className="text-white">AI-powered Best Match</strong>.
            </p>

            <div className="flex flex-wrap gap-4 mb-10 justify-center">
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
                onClick={onOpenOnboardingModal}
                className="bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/30 px-8 py-3 text-lg font-semibold"
              >
                Login / Sign Up Free
              </Button>
              <Button
                asChild
                className="sunset-gradient text-white hover:opacity-90 px-8 py-3 text-lg font-semibold shadow-lg"
              >
                <Link href="/match-your-style">
                  Match Your Style
                </Link>
              </Button>
            </div>

            <div className="flex flex-col items-center gap-3 text-white/80">
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span>AI-powered Best Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-200" />
                  <span>3,300+ destinations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-purple-200" />
                  <span>300,000+ tours</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-green-200" />
                  <span>3,500+ restaurants</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-cyan-200" />
                  <span>19,000+ travel guides</span>
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