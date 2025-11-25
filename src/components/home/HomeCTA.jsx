import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Users, Trophy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomeCTA = ({ onOpenModal }) => {
  return (
    <section className="py-20 ocean-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold text-white">Join the Community</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-6">
            Ready to Discover Your Perfect Tours & Restaurants?
          </h2>
          
          <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto font-medium">
            <strong className="text-white">Boost the places you love,</strong> get AI recommendations tailored to your style, and see what the community is trending right now.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-10">
            <div className="flex items-center gap-2 text-white/90">
              <Check className="w-5 h-5 text-yellow-300" />
              <span className="font-medium">50 points/day free</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Check className="w-5 h-5 text-yellow-300" />
              <span className="font-medium">Save unlimited tours & restaurants</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Check className="w-5 h-5 text-yellow-300" />
              <span className="font-medium">1 AI match per day</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Button
              asChild
              className="px-8 py-6 bg-white text-orange-600 font-bold text-lg shadow-xl hover:bg-gray-100 hover:scale-105 transition-all duration-200"
            >
              <Link href="/auth">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="px-8 py-6 border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-bold text-lg"
            >
              <Link href="/how-it-works">
                Learn How It Works
              <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <Users className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Community-Driven</h3>
              <p className="text-sm text-white/90">You control what's trending</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <Sparkles className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">AI-Powered</h3>
              <p className="text-sm text-white/90">Personalized recommendations</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <Trophy className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Rankings</h3>
              <p className="text-sm text-white/90">See what's trending now</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeCTA;