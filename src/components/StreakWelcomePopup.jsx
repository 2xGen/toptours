"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePromotion } from '@/hooks/usePromotion';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import confetti from 'canvas-confetti';
import Link from 'next/link';

const STORAGE_KEY_LAST_VISIT = 'toptours_last_visit';
const STORAGE_KEY_POPUP_DISMISSED = 'toptours_streak_popup_dismissed';
const HOURS_BETWEEN_POPUPS = 24;

export default function StreakWelcomePopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [userName, setUserName] = useState('');
  const [hasUser, setHasUser] = useState(false);
  const { account, loading, refreshAccount } = usePromotion(true); // Lazy load
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Only show popup if user is logged in
    const checkAndShowPopup = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return; // No user, don't show popup
        }

        // Get user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserName(profile.display_name || 'Traveler');
        }

        setHasUser(true);
        
        // Load account to get streak info
        if (refreshAccount) {
          refreshAccount();
        }

        // Check if 24 hours have passed since last visit
        const lastVisit = localStorage.getItem(STORAGE_KEY_LAST_VISIT);
        const popupDismissed = localStorage.getItem(STORAGE_KEY_POPUP_DISMISSED);
        
        const now = new Date().getTime();
        
        if (lastVisit) {
          const hoursSinceLastVisit = (now - parseInt(lastVisit)) / (1000 * 60 * 60);
          
          // Show popup if:
          // 1. 24+ hours have passed since last visit
          // 2. Popup hasn't been dismissed today (or was dismissed more than 24h ago)
          if (hoursSinceLastVisit >= HOURS_BETWEEN_POPUPS) {
            const dismissedTime = popupDismissed ? parseInt(popupDismissed) : 0;
            const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);
            
            if (hoursSinceDismissed >= HOURS_BETWEEN_POPUPS || !popupDismissed) {
              // Will show popup once account is loaded (handled in second useEffect)
            }
          }
        } else {
          // First visit - don't show popup, just set last visit
          localStorage.setItem(STORAGE_KEY_LAST_VISIT, now.toString());
        }

        // Update last visit time
        localStorage.setItem(STORAGE_KEY_LAST_VISIT, now.toString());
      } catch (error) {
        console.error('Error checking streak popup:', error);
      }
    };

    // Wait a bit for auth to initialize
    const timer = setTimeout(checkAndShowPopup, 1000);
    
    return () => clearTimeout(timer);
  }, [account, loading, supabase]);

  // Show popup when account is loaded and we have streak data
  useEffect(() => {
    if (!loading && account && account.streak_days > 0) {
      const lastVisit = localStorage.getItem(STORAGE_KEY_LAST_VISIT);
      const popupDismissed = localStorage.getItem(STORAGE_KEY_POPUP_DISMISSED);
      const now = new Date().getTime();
      
      if (lastVisit) {
        const hoursSinceLastVisit = (now - parseInt(lastVisit)) / (1000 * 60 * 60);
        if (hoursSinceLastVisit >= HOURS_BETWEEN_POPUPS) {
          const dismissedTime = popupDismissed ? parseInt(popupDismissed) : 0;
          const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);
          
          if (hoursSinceDismissed >= HOURS_BETWEEN_POPUPS || !popupDismissed) {
            setShowPopup(true);
            triggerConfetti();
          }
        }
      }
    }
  }, [account, loading]);

  const triggerConfetti = () => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleDismiss = () => {
    setShowPopup(false);
    localStorage.setItem(STORAGE_KEY_POPUP_DISMISSED, new Date().getTime().toString());
  };

  const handleClose = (e) => {
    e.stopPropagation();
    handleDismiss();
  };

  if (!showPopup || !account) {
    return null;
  }

  const streakDays = account.streak_days || 0;
  const pointsEarned = account.daily_points_available || 0;
  const totalPoints = account.total_points_available || pointsEarned;

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={handleDismiss}
          >
            <Card 
              className="bg-white shadow-2xl max-w-md w-full relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <CardContent className="p-8 pt-12">
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 mb-4"
                  >
                    <Flame className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-gray-900 mb-2"
                  >
                    Welcome back{userName ? `, ${userName}` : ''}! 👋
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600"
                  >
                    Your new streak is
                  </motion.p>
                </div>

                {/* Streak Display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="text-center mb-6"
                >
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-full border-2 border-orange-200">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <span className="text-3xl font-bold text-orange-600">
                      {streakDays} Day{streakDays !== 1 ? 's' : ''} Streak!
                    </span>
                  </div>
                </motion.div>

                {/* Points Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 mb-6 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Points earned today:
                    </span>
                    <span className="font-bold text-purple-600">{pointsEarned}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Total points available:</span>
                    <span className="font-bold text-blue-600">{totalPoints}</span>
                  </div>
                </motion.div>

                {/* Learn More Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Link href="/how-it-works" onClick={handleDismiss}>
                    <Button className="w-full sunset-gradient text-white hover:opacity-90 transition-opacity">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

