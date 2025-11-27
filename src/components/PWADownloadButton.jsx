"use client";

import { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';
import PWAInstallModal from './PWAInstallModal';

export default function PWADownloadButton({ variant = 'link' }) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if mobile device - strict check based on user agent only
    // This prevents false positives on desktop browsers with narrow windows
    const checkMobile = () => {
      const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Only show on actual mobile devices (user agent match)
      // Don't rely on window width as desktop browsers can be resized
      setIsMobile(userAgentMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator.standalone === true);
    
    setIsStandalone(standalone);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleClick = () => {
    if (isStandalone) {
      return;
    }
    setShowModal(true);
  };

  // Only show on mobile devices
  if (!isMobile || isStandalone) {
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
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
          title="Download TopTours.ai app"
        >
          <Download className="w-4 h-4" />
        </button>
      )}
      <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

