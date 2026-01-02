"use client";

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

// Global cache for promotion account to avoid duplicate calls
// NOTE: promotion_accounts table has been removed - always return null
let cachedAccount = null;
let cachedAccountUserId = null;
let cachedAccountAt = Date.now(); // Initialize to current time so cache check works
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
    // NOTE: promotion_accounts table has been removed (old boost system)
    // ALWAYS return null immediately - NEVER make API calls
    
    // Immediately set account to null and stop loading
    setAccount(null);
    setLoading(false);
    
    // Update cache to prevent any future calls
    cachedAccount = null;
    cachedAccountUserId = null;
    cachedAccountAt = Date.now();
    
    // Return null immediately (no async operation, no API call)
    return null;
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

