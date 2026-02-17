"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTourUrl } from '@/utils/tourHelpers';

const FeaturedTours = ({ onOpenModal }) => {
  return (
    <section className="py-20 adventure-gradient" style={{ background: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">
            Discover Amazing Tours & Excursions
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Explore 300,000+ tours across 3,300+ destinations. Use AI-powered Best Match to find experiences that fit your travel style.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-3 text-center py-12">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-semibold text-white">AI-Powered Discovery</span>
            </div>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Use our AI-powered Best Match feature to find tours that perfectly match your travel style. Set your preferences and see personalized recommendations instantly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                asChild
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-6 text-lg shadow-lg"
              >
                <Link href="/destinations">
                  Explore Destinations
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-bold px-8 py-6 text-lg"
              >
                <Link href="/tours">
                  Browse All Tours
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTours;