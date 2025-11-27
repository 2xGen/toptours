"use client";

import { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';

export default function PWADownloadButton({ variant = 'link' }) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if mobile device - strict check based on user agent only
    const checkMobile = () => {
      const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(userAgentMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator.standalone === true);
    
    setIsStandalone(standalone);

    // Listen for beforeinstallprompt event (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleClick = async () => {
    if (isStandalone) {
      return;
    }

    if (deferredPrompt) {
      // Show the native browser install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      // Fallback: Show instructions for manual installation
      alert('To install TopTours.ai:\n\n1. Look for the install icon (⊕) in your browser\'s address bar\n2. Or go to Menu (⋮) > Install TopTours.ai\n3. Click "Install" in the popup');
    }
  };

  // Show on mobile devices OR on desktop if install prompt is available
  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  // On mobile, always show (if not standalone)
  // On desktop, only show if deferredPrompt is available (Chrome can install PWAs)
  if (!isMobile && !deferredPrompt) {
    return null;
  }

  return (
    <>
      {variant === 'link' ? (
        <button
          onClick={handleClick}
          className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
          title="Download TopTours.ai app"
        >
          <Smartphone className="w-4 h-4" />
          <span>Download App</span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors flex items-center gap-2 text-sm font-medium"
          title="Download TopTours.ai app"
        >
          <Download className="w-4 h-4" />
          <span>Download App</span>
        </button>
      )}
    </>
  );
}

