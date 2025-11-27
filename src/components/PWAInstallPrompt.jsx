"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if mobile device
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     (window.innerWidth <= 768);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator.standalone) ||
                       document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if already dismissed (localStorage)
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setDismissed(true);
      }
    }

    // Android: Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a delay (better UX) - only on mobile
      setTimeout(() => {
        const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       (window.innerWidth <= 768);
        if (!standalone && !dismissed && mobile) {
          setShowPrompt(true);
        }
      }, 3000); // Show after 3 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS: Show prompt after delay if not standalone - only on mobile
    if (iOS && !standalone && !dismissed) {
      setTimeout(() => {
        const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       (window.innerWidth <= 768);
        if (mobile) {
          setShowPrompt(true);
        }
      }, 5000); // Show after 5 seconds on iOS
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('resize', checkMobile);
    };
  }, [dismissed]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android: Show native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    }
    // For iOS, we just show instructions (handled in the component)
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed, dismissed, not mobile, or not showing
  if (isStandalone || dismissed || !showPrompt || !isMobile) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <div 
          className="fixed inset-0 z-[9999] p-4 sm:p-6 pointer-events-auto"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="max-w-md mx-auto pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="ocean-gradient p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Install TopTours.ai™</h3>
                    <p className="text-white/90 text-sm">Get faster access & offline support</p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                {isIOS ? (
                  // iOS Instructions
                  <div className="space-y-4">
                    <p className="text-gray-700 text-sm">
                      Add TopTours.ai to your home screen for quick access and a better experience!
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                          1
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 font-medium">Tap the Share button</p>
                          <p className="text-xs text-gray-600 mt-1">Look for the <Share2 className="w-3 h-3 inline" /> icon at the bottom of your Safari browser</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                          2
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 font-medium">Select "Add to Home Screen"</p>
                          <p className="text-xs text-gray-600 mt-1">Scroll down and tap the <Plus className="w-3 h-3 inline" /> "Add to Home Screen" option</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                          3
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 font-medium">Tap "Add"</p>
                          <p className="text-xs text-gray-600 mt-1">Confirm to add TopTours.ai to your home screen</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleDismiss}
                      className="w-full sunset-gradient text-white font-semibold"
                    >
                      Got it!
                    </Button>
                  </div>
                ) : (
                  // Android: Show install button
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Download className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium mb-1">Install TopTours.ai App</p>
                        <p className="text-sm text-gray-600">
                          Get faster access, offline support, and a better mobile experience. It's free and takes just a few seconds!
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleInstallClick}
                        className="flex-1 sunset-gradient text-white font-semibold"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Install App
                      </Button>
                      <Button
                        onClick={handleDismiss}
                        variant="outline"
                        className="border-gray-300"
                      >
                        Maybe Later
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

