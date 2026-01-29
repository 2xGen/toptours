"use client";

import { useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Link that prefetches only on hover (desktop) or touch (mobile).
 * Uses prefetch={false} so viewport-based prefetch is disabled (bots don't hover/touch).
 * Humans get fast navigation: prefetch runs when they hover or touch the link.
 * No separate "human vs robot" check – interaction is the filter.
 */
export default function PrefetchOnHoverLink({ href, children, ...rest }) {
  const router = useRouter();
  const prefetchedRef = useRef(false);

  const pathname = typeof href === 'string' && href.startsWith('/') ? href : null;

  const doPrefetch = useCallback(() => {
    if (!pathname) return;
    try {
      router.prefetch(pathname);
      prefetchedRef.current = true;
    } catch (_) {
      // Prefetch is best-effort; ignore errors
    }
  }, [router, pathname]);

  const handleMouseEnter = useCallback(() => {
    doPrefetch();
  }, [doPrefetch]);

  const handleTouchStart = useCallback(() => {
    doPrefetch();
  }, [doPrefetch]);

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      {...rest}
    >
      {children}
    </Link>
  );
}
