"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Download, Share2, Plus, Smartphone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PWAInstallModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (typeof window === 'undefined') return;
    
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator.standalone === true);
    
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event fired', e);
    };

    // Check if event already fired (sometimes it fires before we attach listener)
    // We'll also check periodically if it's available
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check if we can install (for cases where event already fired)
    // On some browsers, the prompt might be available but event already fired
    const checkInstallability = () => {
      // If we're in Chrome and not standalone, installation should be possible
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      if (isChrome && !standalone && !iOS) {
        // Installation should be available, even if event hasn't fired yet
        // The button will work when clicked
      }
    };

    checkInstallability();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isStandalone) {
      return;
    }

    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        // Trigger the native install prompt
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setInstallSuccess(true);
          setDeferredPrompt(null);
          // Close modal after 2 seconds
          setTimeout(() => {
            setInstallSuccess(false);
            setIsInstalling(false);
            onClose();
          }, 2000);
        } else {
          setIsInstalling(false);
        }
      } catch (error) {
        console.error('Install error:', error);
        setIsInstalling(false);
        // If prompt fails, show instructions instead
        alert('To install: Click the install icon in your browser\'s address bar, or go to Menu > Install TopTours.ai');
      }
    } else {
      // Fallback: Show instructions for manual installation
      alert('To install TopTours.ai:\n\n1. Look for the install icon (⊕) in your browser\'s address bar\n2. Or go to Menu (⋮) > Install TopTours.ai\n3. Click "Install" in the popup');
    }
  };

  if (!isOpen || isStandalone || typeof window === 'undefined') {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            style={{ position: 'relative', zIndex: 1 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                  <img 
                    src="/favicon-96x96.png" 
                    alt="TopTours.ai" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = '/favicon.ico';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Install TopTours.ai™
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Get faster access & offline support
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-6">
              {installSuccess ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Installation Started!</h3>
                  <p className="text-gray-600">Follow the prompts to complete installation.</p>
                </div>
              ) : isIOS ? (
                // iOS Instructions
                <div className="space-y-6">
                  <p className="text-gray-700">
                    Add TopTours.ai to your home screen for quick access and a better experience!
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium mb-1">Tap the Share button</p>
                        <p className="text-xs text-gray-600">
                          Look for the <Share2 className="w-3 h-3 inline" /> icon at the bottom of your Safari browser
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium mb-1">Select "Add to Home Screen"</p>
                        <p className="text-xs text-gray-600">
                          Scroll down and tap the <Plus className="w-3 h-3 inline" /> "Add to Home Screen" option
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium mb-1">Tap "Add"</p>
                        <p className="text-xs text-gray-600">
                          Confirm to add TopTours.ai to your home screen
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={onClose}
                    className="w-full sunset-gradient text-white font-semibold"
                  >
                    Got it!
                  </Button>
                </div>
              ) : (
                // Android/Desktop
                <div className="space-y-6">
                  <p className="text-gray-700">
                    Get faster access, offline support, and a better mobile experience. It's free and takes just a few seconds!
                  </p>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Benefits:
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Faster loading times</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Offline access to saved tours</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Home screen quick access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>App-like experience</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleInstallClick}
                      disabled={isInstalling}
                      className="flex-1 sunset-gradient text-white font-semibold disabled:opacity-50"
                    >
                      {isInstalling ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Install App
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Maybe Later
                    </Button>
                  </div>
                  {!deferredPrompt && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      If the install button doesn't work, look for the install icon (⊕) in your browser's address bar
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
