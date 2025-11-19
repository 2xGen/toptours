import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

// Simple in-memory cache to avoid N duplicate network calls per page
let cachedUserId = null;
let cachedBookmarks = null;
let cachedAt = 0;
let inflight = null;
const CACHE_TTL_MS = 30_000; // 30s

export function useBookmarks() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState(cachedBookmarks || []);
  const [loading, setLoading] = useState(false);

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
      inflight = fetch(`/api/internal/bookmarks?userId=${encodeURIComponent(user.id)}`)
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
    fetchBookmarks();
  }, [fetchBookmarks]);

  const ids = useMemo(() => new Set(bookmarks.map((b) => b.product_id)), [bookmarks]);

  const isBookmarked = useCallback(
    (productId) => ids.has(productId),
    [ids]
  );

  const toggle = useCallback(
    async (productId) => {
      if (!user) return { error: 'not_signed_in' };
      if (ids.has(productId)) {
        await fetch(`/api/internal/bookmarks/${encodeURIComponent(productId)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      } else {
        await fetch('/api/internal/bookmarks', {
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

  return { user, bookmarks, isBookmarked, toggle, loading };
}


