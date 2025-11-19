"use client";

import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

/**
 * Simple component to display tour promotion score
 * Lightweight - just fetches and displays the score
 */
export default function TourPromotionScore({ productId, showLabel = false }) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    // Fetch score (with caching via API)
    fetch(`/api/internal/promotion/tour-score?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setScore(data?.total_score || 0);
      })
      .catch(() => {
        setScore(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

  if (loading || score === null) {
    return null; // Don't show anything while loading
  }

  if (score === 0) {
    return null; // Don't show if no score
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-600">
      <Trophy className="w-3.5 h-3.5 text-orange-500" />
      <span className="font-semibold text-orange-600">{score.toLocaleString()}</span>
      {showLabel && <span className="text-gray-500">points</span>}
    </div>
  );
}

