"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function RequireAuthModal({ isOpen, onClose, redirectUrl = null }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignIn = () => {
    const redirect = redirectUrl || window.location.pathname;
    router.push(`/auth?redirect=${encodeURIComponent(redirect)}`);
    onClose();
  };

  const handleSignUp = () => {
    const redirect = redirectUrl || window.location.pathname;
    router.push(`/auth?mode=signup&redirect=${encodeURIComponent(redirect)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
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
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center">
              <div className="mb-6">
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Registration Required
                </h3>
                <p className="text-gray-600">
                  Please sign in or create an account to view travel plans and access all features.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSignIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>

                <Button
                  onClick={handleSignUp}
                  variant="outline"
                  className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold h-12"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Free Account
                </Button>
              </div>

              {/* Info */}
              <p className="text-xs text-gray-500 mt-4">
                Free to join • No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

