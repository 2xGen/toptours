"use client";

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

/**
 * Hook for managing promotion system (daily points, spending, etc.)
 * @param {boolean} lazy - If true, don't load account automatically (load on demand)
 */
export function usePromotion(lazy = false) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(!lazy);
  const [error, setError] = useState(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!lazy) {
      loadAccount();
    }
  }, [lazy]);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAccount(null);
        setLoading(false);
        return;
      }

      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) {
        setAccount(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/internal/promotion/account', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load promotion account');
      }

      const data = await response.json();
      setAccount(data);
    } catch (err) {
      console.error('Error loading promotion account:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

