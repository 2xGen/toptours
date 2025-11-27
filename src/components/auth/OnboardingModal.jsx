"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AnimatedExplainer from '@/components/auth/AnimatedExplainer';

export default function OnboardingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 pt-12 sm:pt-0">
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
            className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-4"
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
                    <span className="text-xs sm:text-sm font-semibold">Revolutionary Tour Discovery</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                    Discover Amazing Tours & Restaurants
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-white/90">
                    The first community-driven, AI-powered platform that helps you discover tours and restaurants that actually match your travel style.
                  </p>
                </div>
              </div>

              {/* Explainer Content */}
              <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="max-w-3xl mx-auto">
                  <div className="ocean-gradient rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10">
                      <AnimatedExplainer autoPlay={true} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with CTA */}
            <div className="bg-white border-t border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 max-w-3xl mx-auto">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600 mb-1">
                    Ready to get started?
                  </p>
                  <p className="text-xs text-gray-500">
                    Join thousands of travelers discovering amazing places
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="px-6"
                  >
                    Maybe Later
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="px-6"
                  >
                    <Link href="/how-it-works" onClick={onClose}>
                      Learn More
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="sunset-gradient text-white font-semibold shadow-lg hover:scale-105 transition-transform px-8"
                  >
                    <Link href="/auth" onClick={onClose}>
                      Create Free Account
                      <ArrowRight className="w-4 h-4 ml-2" />
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

