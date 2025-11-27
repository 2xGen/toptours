"use client";

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

// Global cache for promotion account to avoid duplicate calls
let cachedAccount = null;
let cachedAccountUserId = null;
let cachedAccountAt = 0;
let accountInflight = null;
const ACCOUNT_CACHE_TTL_MS = 60_000; // 60s cache

/**
 * Hook for managing promotion system (daily points, spending, etc.)
 * @param {boolean} lazy - If true, don't load account automatically (load on demand)
 */
export function usePromotion(lazy = false) {
  const [account, setAccount] = useState(cachedAccount);
  const [loading, setLoading] = useState(!lazy);
  const [error, setError] = useState(null);
  const supabase = createSupabaseBrowserClient();

  const loadAccount = async () => {
    // Prevent multiple simultaneous calls
    if (accountInflight) {
      try {
        const result = await accountInflight;
        setAccount(result);
        return;
      } catch {
        // Ignore errors from inflight request
        return;
      }
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAccount(null);
        setLoading(false);
        return;
      }

      // Check cache first
      const now = Date.now();
      const canUseCache =
        cachedAccount &&
        cachedAccountUserId === user.id &&
        now - cachedAccountAt < ACCOUNT_CACHE_TTL_MS;

      if (canUseCache) {
        setAccount(cachedAccount);
        setLoading(false);
        return;
      }

      // Share one inflight request across all hook instances
      setLoading(true);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) {
        setAccount(null);
        setLoading(false);
        return;
      }

      accountInflight = fetch('/api/internal/promotion/account', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(async (response) => {
          if (!response.ok) {
            return null;
          }
          try {
            return await response.json();
          } catch {
            return null;
          }
        })
        .catch(() => {
          return null;
        })
        .then((data) => {
          cachedAccount = data;
          cachedAccountUserId = user.id;
          cachedAccountAt = Date.now();
          return data;
        })
        .finally(() => {
          accountInflight = null;
          setLoading(false);
        });

      const result = await accountInflight;
      setAccount(result);
      
      // Update cache even if result is null
      if (result === null) {
        cachedAccount = null;
        cachedAccountUserId = user.id;
        cachedAccountAt = Date.now();
      }
    } catch {
      // Silently handle all errors - don't log to console
      setAccount(null);
      setLoading(false);
      accountInflight = null;
    }
  };

  useEffect(() => {
    if (!lazy) {
      loadAccount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spendPoints = async (productId, points, scoreType = 'all', tourData = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be signed in to promote tours');
      }

      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/internal/promotion/spend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          points: parseInt(points),
          scoreType,
          tourData, // Pass tour data if available (no API call needed!)
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to spend points');
      }

      const result = await response.json();
      
      // Update local account state
      if (account) {
        setAccount({
          ...account,
          daily_points_available: result.remainingPoints,
        });
      }

      return result;
    } catch (err) {
      console.error('Error spending points:', err);
      throw err;
    }
  };

  return {
    account,
    loading,
    error,
    spendPoints,
    refreshAccount: loadAccount,
  };
}

