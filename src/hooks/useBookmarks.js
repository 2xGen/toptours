import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

// Simple in-memory cache to avoid N duplicate network calls per page
let cachedUserId = null;
let cachedBookmarks = null;
let cachedAt = 0;
let inflight = null;
const CACHE_TTL_MS = 30_000; // 30s

export function useBookmarks(lazy = false) {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState(cachedBookmarks || []);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data?.user || null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    // Use cache when available and fresh
    const now = Date.now();
    const canUseCache =
      cachedBookmarks &&
      cachedUserId === user.id &&
      now - cachedAt < CACHE_TTL_MS;

    if (canUseCache) {
      setBookmarks(cachedBookmarks);
      return;
    }

    // Share one inflight request across all hook instances
    if (!inflight) {
      setLoading(true);
      // Use window.fetch to avoid conflict with the hook's fetch function
      inflight = (typeof window !== 'undefined' ? window.fetch : globalThis.fetch)(`/api/internal/bookmarks?userId=${encodeURIComponent(user.id)}`)
        .then((res) => res.json())
        .then((json) => {
          cachedBookmarks = json.bookmarks || [];
          cachedUserId = user.id;
          cachedAt = Date.now();
          return cachedBookmarks;
        })
        .finally(() => {
          inflight = null;
          setLoading(false);
        });
    }
    const result = await inflight;
    setBookmarks(result);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (lazy && !hasFetched) return;
    
    // Use cache when available and fresh
    const now = Date.now();
    const canUseCache =
      cachedBookmarks &&
      cachedUserId === user.id &&
      now - cachedAt < CACHE_TTL_MS;

    if (canUseCache) {
      setBookmarks(cachedBookmarks);
      if (!hasFetched) setHasFetched(true);
      return;
    }

    // Share one inflight request across all hook instances
    if (!inflight) {
      setLoading(true);
      // Use window.fetch to avoid conflict with the hook's fetch function
      inflight = (typeof window !== 'undefined' ? window.fetch : globalThis.fetch)(`/api/internal/bookmarks?userId=${encodeURIComponent(user.id)}`)
        .then((res) => res.json())
        .then((json) => {
          cachedBookmarks = json.bookmarks || [];
          cachedUserId = user.id;
          cachedAt = Date.now();
          return cachedBookmarks;
        })
        .finally(() => {
          inflight = null;
          setLoading(false);
        });
    }
    
    inflight.then((result) => {
      setBookmarks(result);
      if (!hasFetched) setHasFetched(true);
    });
  }, [user, lazy, hasFetched]); // Only depend on user, lazy, and hasFetched

  // Expose manual fetch function for lazy loading
  // Can be called multiple times - it will use cache if available
  const fetch = useCallback(() => {
    if (!hasFetched) {
      setHasFetched(true);
    }
    fetchBookmarks();
  }, [fetchBookmarks, hasFetched]);

  const ids = useMemo(() => new Set(bookmarks.map((b) => b.product_id)), [bookmarks]);

  const isBookmarked = useCallback(
    (productId) => ids.has(productId),
    [ids]
  );

  const toggle = useCallback(
    async (productId) => {
      if (!user) return { error: 'not_signed_in' };
      // Use window.fetch to avoid conflict with the hook's fetch function
      const fetchApi = typeof window !== 'undefined' ? window.fetch : globalThis.fetch;
      if (ids.has(productId)) {
        await fetchApi(`/api/internal/bookmarks/${encodeURIComponent(productId)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      } else {
        await fetchApi('/api/internal/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId }),
        });
      }
      // Update cache and state optimistically
      const next = ids.has(productId)
        ? bookmarks.filter((b) => b.product_id !== productId)
        : [{ product_id: productId, created_at: new Date().toISOString() }, ...bookmarks];
      cachedBookmarks = next;
      cachedUserId = user.id;
      cachedAt = Date.now();
      setBookmarks(next);
      return { ok: true };
    },
    [user, ids, bookmarks]
  );

  return { user, bookmarks, isBookmarked, toggle, loading, fetch };
}


