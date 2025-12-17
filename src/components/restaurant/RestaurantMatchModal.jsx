"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

function getLabel(score) {
  if (score >= 80) return 'Excellent Match';
  if (score >= 65) return 'Strong Match';
  if (score >= 50) return 'Good Fit';
  if (score >= 35) return 'Okay Fit';
  return 'Low Fit';
}

export default function RestaurantMatchModal({
  isOpen,
  onClose,
  restaurant,
  matchData,
  preferences,
  onOpenPreferences,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !restaurant || !mounted) return null;

  const score = typeof matchData?.matchScore === 'number' ? matchData.matchScore : 0;
  const title = restaurant.shortName || restaurant.name || 'Restaurant';

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="ocean-gradient text-white p-6 relative flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 text-white/90 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold">Restaurant Match</h3>
                  <p className="text-white/90 text-sm line-clamp-1 mt-1">{title}</p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full ocean-gradient text-white mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{score}%</div>
                      <div className="text-xs text-white/90">Match</div>
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{getLabel(score)}</h4>
                  <p className="text-gray-600">
                    {matchData?.fitSummary ||
                      'This score compares the restaurant’s vibe and features with your dining preferences.'}
                  </p>
                </div>

                {/* Quick preferences summary */}
                {preferences && (
                  <div className="border-t pt-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Your Preferences:</h5>
                    <div className="flex flex-wrap gap-2">
                      {preferences.atmosphere && preferences.atmosphere !== 'any' && (
                        <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                          {preferences.atmosphere === 'outdoor'
                            ? '🌳 Outdoor'
                            : preferences.atmosphere === 'upscale'
                            ? '✨ Upscale'
                            : '😌 Casual'}
                        </span>
                      )}
                      {typeof preferences.diningStyle === 'number' && (
                        <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                          {preferences.diningStyle >= 65 ? '📋 Formal' : preferences.diningStyle <= 35 ? '🚶 Walk-in' : '⚖️ Flexible'}
                        </span>
                      )}
                      {(preferences.features || []).slice(0, 4).map((f) => (
                        <span key={f} className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">
                          {f === 'outdoor_seating'
                            ? '🌳 Outdoor Seating'
                            : f === 'live_music'
                            ? '🎵 Live Music'
                            : f === 'dog_friendly'
                            ? '🐕 Dog Friendly'
                            : f === 'family_friendly'
                            ? '👨‍👩‍👧 Family Friendly'
                            : f === 'reservations'
                            ? '📅 Reservations'
                            : f}
                        </span>
                      ))}
                      {(preferences.features || []).length > 4 && (
                        <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">
                          +{(preferences.features || []).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Pros / Cons */}
                {(matchData?.pros?.length || matchData?.cons?.length) && (
                  <div className="border-t pt-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Why this score:</h5>
                    <div className="space-y-3">
                      {Array.isArray(matchData?.pros) && matchData.pros.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-sm font-semibold text-green-800 mb-2">Matches well</p>
                          <ul className="text-sm text-green-700 space-y-1">
                            {matchData.pros.slice(0, 5).map((p, idx) => (
                              <li key={idx}>✓ {p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(matchData?.cons) && matchData.cons.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <p className="text-sm font-semibold text-amber-800 mb-2">Potential mismatches</p>
                          <ul className="text-sm text-amber-700 space-y-1">
                            {matchData.cons.slice(0, 5).map((c, idx) => (
                              <li key={idx}>• {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Button
                    onClick={() => {
                      if (onOpenPreferences) onOpenPreferences();
                      onClose();
                    }}
                    className="w-full sunset-gradient text-white"
                  >
                    Set Your Preferences
                    <Settings className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t p-4 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Match scores are based on restaurant features and your preferences.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof window !== 'undefined' ? createPortal(content, document.body) : null;
}


