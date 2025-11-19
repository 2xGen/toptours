"use client";

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

// Generate or retrieve session ID (persists for browser session)
function getSessionId() {
  if (typeof window === 'undefined') return null;
  
  let sessionId = sessionStorage.getItem('page_view_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('page_view_session_id', sessionId);
  }
  return sessionId;
}

// Get user ID if logged in
async function getUserId() {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    return null;
  }
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPathname = useRef(pathname);
  const sessionIdRef = useRef(getSessionId());

  useEffect(() => {
    // Only track if pathname actually changed
    if (pathname === previousPathname.current) {
      return;
    }

    previousPathname.current = pathname;

    // Build full path with query params if they exist
    const fullPath = searchParams?.toString() 
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    // Extract product ID and destination ID from path if applicable
    let productId = null;
    let destinationId = null;

    // Extract product ID from /tours/[productId]
    const tourMatch = pathname.match(/^\/tours\/([^\/]+)/);
    if (tourMatch) {
      productId = tourMatch[1];
    }

    // Extract destination ID from /destinations/[id] or /destinations/[id]/tours
    const destinationMatch = pathname.match(/^\/destinations\/([^\/]+)/);
    if (destinationMatch) {
      destinationId = destinationMatch[1];
    }

    // Track page view (non-blocking)
    const trackPageView = async () => {
      try {
        const userId = await getUserId();
        
        await fetch('/api/internal/page-views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pagePath: fullPath,
            productId,
            destinationId,
            sessionId: sessionIdRef.current,
            userId,
            referrer: document.referrer || null,
            userAgent: navigator.userAgent || null,
          }),
          // Don't block - fire and forget
          keepalive: true,
        });
      } catch (error) {
        // Silently fail - analytics shouldn't break the site
        console.debug('Page view tracking failed:', error);
      }
    };

    // Small delay to ensure page is loaded
    const timeoutId = setTimeout(trackPageView, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}

