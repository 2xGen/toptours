"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star, TrendingUp, User, LogIn, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getMatchDisplay, calculateTourProfile, calculateMatchScore, getDefaultPreferences, getUserPreferenceScores } from '@/lib/tourMatching';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function TourMatchModal({ 
  isOpen, 
  onClose, 
  tour, 
  matchScore = null, 
  user = null, 
  userPreferences = null,
  onOpenPreferences = null // Callback to open preferences modal
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tagNames, setTagNames] = useState(new Map());
  const [loadingTagNames, setLoadingTagNames] = useState(false);
  const [tourProfile, setTourProfile] = useState(null);
  const [calculatedMatchScore, setCalculatedMatchScore] = useState(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate match score immediately (no async fetching - use what's passed)
  useEffect(() => {
    if (!isOpen || !tour) {
      setTourProfile(null);
      setCalculatedMatchScore(null);
      setLoadingTagNames(false);
      return;
    }

    // If matchScore is provided with tourProfile, use it
    if (matchScore && matchScore.tourProfile) {
      setTourProfile(matchScore.tourProfile);
      setCalculatedMatchScore(matchScore);
      setLoadingTagNames(false);
      return;
    }

    // Otherwise, calculate a default match score immediately (no async)
    const defaultProfile = {
      adventure_score: 50,
      relaxation_exploration_score: 50,
      group_intimacy_score: 50,
      price_comfort_score: 50,
      guidance_score: 50,
      food_drink_score: 50,
      confidence: 'low',
      contributing_tags: [],
      tag_count: 0,
    };
    
    setTourProfile(defaultProfile);
    
    const preferences = user && userPreferences 
      ? getUserPreferenceScores(userPreferences)
      : getDefaultPreferences();
    const calculatedMatch = calculateMatchScore(defaultProfile, preferences);
    setCalculatedMatchScore(calculatedMatch);
    setLoadingTagNames(false);
  }, [isOpen, tour, matchScore, user, userPreferences]);
  
  // Check if user has meaningful preferences (not just default/empty object)
  // Check if at least one preference is set to a non-default value (not 50, not 'not_set')
  // OR if preferences object exists with multiple keys (indicating it's been saved)
  const hasPreferences = user && userPreferences && 
    typeof userPreferences === 'object' && 
    Object.keys(userPreferences).length > 0 &&
    (
      // Check camelCase field names - at least one non-default value
      (userPreferences.adventureLevel !== undefined && userPreferences.adventureLevel !== 50) ||
      (userPreferences.cultureVsBeach !== undefined && userPreferences.cultureVsBeach !== 50) ||
      (userPreferences.groupPreference !== undefined && userPreferences.groupPreference !== 50) ||
      (userPreferences.budgetComfort !== undefined && userPreferences.budgetComfort !== 50) ||
      (userPreferences.structurePreference !== undefined && userPreferences.structurePreference !== 50) ||
      (userPreferences.foodAndDrinkInterest !== undefined && userPreferences.foodAndDrinkInterest !== 50) ||
      (userPreferences.travelerType !== undefined && userPreferences.travelerType !== 'not_set') ||
      // If preferences object has been saved (has multiple preference keys), consider it set
      // This handles the case where user has explicitly saved preferences (even if they're all 50)
      (Object.keys(userPreferences).length >= 5) // If 5+ keys, likely a saved preferences object
    );
  
  // Debug: Log preferences to help diagnose (always call this hook, but conditionally log)
  useEffect(() => {
    if (isOpen && user && userPreferences) {
      console.log('🔍 TourMatchModal - User preferences check:', {
        user: !!user,
        hasUserPreferences: !!userPreferences,
        userPreferences,
        hasPreferences,
        keys: Object.keys(userPreferences || {}),
        adventureLevel: userPreferences?.adventureLevel,
        cultureVsBeach: userPreferences?.cultureVsBeach,
        groupPreference: userPreferences?.groupPreference,
        budgetComfort: userPreferences?.budgetComfort,
        structurePreference: userPreferences?.structurePreference,
        foodAndDrinkInterest: userPreferences?.foodAndDrinkInterest,
        travelerType: userPreferences?.travelerType,
      });
    }
  }, [isOpen, user, userPreferences, hasPreferences]);
  
  // Early return AFTER all hooks
  if (!isOpen || !tour || !mounted) return null;

  const productId = tour.productId || tour.productCode;
  const title = tour.seo?.title || tour.title || 'Tour';
  const description = tour.seo?.description || tour.content?.heroDescription || tour.description || '';
  
  const handleSignIn = () => {
    router.push(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
    onClose();
  };

  const handleSetPreferences = () => {
    if (onOpenPreferences) {
      // Open the preferences modal from tours page
      onOpenPreferences();
      onClose(); // Close the match modal
    } else {
      // Fallback to profile page if callback not provided
      router.push('/profile?tab=trip');
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header - Fixed, always visible */}
            <div className="ocean-gradient text-white p-6 relative flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 text-white/90 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 rounded-full p-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold">
                    {hasPreferences ? 'Match for Your Travel Style' : 'AI Tour Match'}
                  </h3>
                  <p className="text-white/90 text-sm line-clamp-1 mt-1">{title}</p>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              {(() => {
                // Use provided matchScore or calculated one
                const displayMatchScore = matchScore || calculatedMatchScore;
                
                // Calculate fallback if needed
                let finalMatchScore = displayMatchScore;
                if (!displayMatchScore || displayMatchScore.score === undefined) {
                  const defaultProfile = {
                    adventure_score: 50,
                    relaxation_exploration_score: 50,
                    group_intimacy_score: 50,
                    price_comfort_score: 50,
                    guidance_score: 50,
                    food_drink_score: 50,
                    confidence: 'low',
                    contributing_tags: [],
                    tag_count: 0,
                  };
                  const preferences = user && userPreferences 
                    ? getUserPreferenceScores(userPreferences)
                    : getDefaultPreferences();
                  finalMatchScore = calculateMatchScore(defaultProfile, preferences);
                }
                
                return (
                <div className="space-y-6">
                  {/* Match Score */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full ocean-gradient text-white mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{finalMatchScore.score}%</div>
                        <div className="text-xs text-white/90">
                          {hasPreferences ? 'Match for You' : 'Match'}
                        </div>
                      </div>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {getMatchDisplay(finalMatchScore).label}
                    </h4>
                  </div>
                  
                  {/* Match Description */}
                  <div className="text-center">
                    <p className="text-gray-600">
                      {(() => {
                        const hasTags = tour.tags && tour.tags.length > 0 && tour.tags.some(tag => 
                          tag && typeof tag === 'object' && (
                            tag.adventure_score !== undefined ||
                            tag.relaxation_exploration_score !== undefined ||
                            tag.group_intimacy_score !== undefined ||
                            tag.price_comfort_score !== undefined ||
                            tag.guidance_score !== undefined ||
                            tag.food_drink_score !== undefined
                          )
                        );
                        
                        if (!hasTags) {
                          return hasPreferences
                            ? 'Match score based on a default balanced tour profile (no tag data available). This is an estimate - actual match may vary once tour tags are analyzed.'
                            : 'This score shows how well this tour matches your travel style based on adventure level, group size, budget, and other preferences.';
                        }
                        
                        return hasPreferences 
                          ? (finalMatchScore && finalMatchScore.confidence === 'high' 
                              ? 'High confidence match based on your travel preferences and tour tags.' 
                              : finalMatchScore && finalMatchScore.confidence === 'medium'
                              ? 'Good match based on your travel style and tour characteristics.'
                              : 'Estimated match based on available tour information.')
                          : 'This score shows how well this tour matches your travel style based on adventure level, group size, budget, and other preferences.';
                      })()}
                    </p>
                  </div>

                  {/* Tour Profile Summary */}
                  {tourProfile && (
                    <div className="border-t pt-4">
                      <h5 className="font-semibold text-gray-900 mb-4">Tour Characteristics:</h5>
                      <div className="space-y-4">
                        {/* Adventure Level */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            🔥 Adventure Level
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 25, label: '😌', desc: 'Relaxed' },
                              { value: 50, label: '⚖️', desc: 'Balanced' },
                              { value: 75, label: '🔥', desc: 'Adventurous' },
                            ].map((option) => {
                              const score = tourProfile.adventure_score || 50;
                              const distances = [25, 50, 75].map(v => Math.abs(score - v));
                              const isClosest = Math.abs(score - option.value) === Math.min(...distances);
                              return (
                                <div
                                  key={option.value}
                                  className={`relative p-3 rounded-lg border-2 text-center ${
                                    isClosest
                                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100'
                                      : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <div className="text-xl mb-1">{option.label}</div>
                                  <div className="text-xs font-semibold text-gray-700">{option.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Relaxation vs Exploration */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            🌊 Relaxation vs Exploration
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 25, label: '😌', desc: 'Relax' },
                              { value: 50, label: '⚖️', desc: 'Balanced' },
                              { value: 75, label: '🔍', desc: 'Explore' },
                            ].map((option) => {
                              const score = tourProfile.relaxation_exploration_score || 50;
                              const isClosest = Math.abs(score - option.value) <= Math.abs(score - 25) && 
                                               Math.abs(score - option.value) <= Math.abs(score - 50) && 
                                               Math.abs(score - option.value) <= Math.abs(score - 75);
                              return (
                                <div
                                  key={option.value}
                                  className={`relative p-3 rounded-lg border-2 text-center ${
                                    isClosest
                                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100'
                                      : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <div className="text-xl mb-1">{option.label}</div>
                                  <div className="text-xs font-semibold text-gray-700">{option.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Group Size */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            👥 Group Size
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 25, label: '👥', desc: 'Big Groups' },
                              { value: 50, label: '⚖️', desc: 'Either Way' },
                              { value: 75, label: '🧑‍🤝‍🧑', desc: 'Private/Small' },
                            ].map((option) => {
                              const score = tourProfile.group_intimacy_score || 50;
                              const isClosest = Math.abs(score - option.value) <= Math.abs(score - 25) && 
                                               Math.abs(score - option.value) <= Math.abs(score - 50) && 
                                               Math.abs(score - option.value) <= Math.abs(score - 75);
                              return (
                                <div
                                  key={option.value}
                                  className={`relative p-3 rounded-lg border-2 text-center ${
                                    isClosest
                                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100'
                                      : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <div className="text-xl mb-1">{option.label}</div>
                                  <div className="text-xs font-semibold text-gray-700">{option.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Budget vs Comfort */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            💰 Budget vs Comfort
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 25, label: '💰', desc: 'Budget' },
                              { value: 50, label: '⚖️', desc: 'Balanced' },
                              { value: 75, label: '✨', desc: 'Comfort' },
                            ].map((option) => {
                              const score = tourProfile.price_comfort_score || 50;
                              const isClosest = Math.abs(score - option.value) <= Math.abs(score - 25) && 
                                               Math.abs(score - option.value) <= Math.abs(score - 50) && 
                                               Math.abs(score - option.value) <= Math.abs(score - 75);
                              return (
                                <div
                                  key={option.value}
                                  className={`relative p-3 rounded-lg border-2 text-center ${
                                    isClosest
                                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100'
                                      : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <div className="text-xl mb-1">{option.label}</div>
                                  <div className="text-xs font-semibold text-gray-700">{option.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      {(() => {
                        const validTagsCount = Array.isArray(tour.tags) ? tour.tags.length : 0;
                        return (
                          <p className="text-xs text-gray-500 mt-4">
                            {loadingTagNames ? (
                              'Calculating tour profile...'
                            ) : validTagsCount > 0 ? (
                              `Profile calculated from ${validTagsCount} tour tag${validTagsCount !== 1 ? 's' : ''}.`
                            ) : (
                              'No tag data available.'
                            )}
                          </p>
                        );
                      })()}
                    </div>
                  )}
                  
                  
                  {/* General Match Info */}
                  <div className="border-t pt-4">
                    <h5 className="font-semibold text-gray-900 mb-3">How matching works:</h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      {hasPreferences ? (
                        <>
                          <p>✓ Analyzed against your travel style preferences</p>
                          <p>✓ Based on tour characteristics and features</p>
                          <p>✓ Personalized to your adventure level, budget, and group preferences</p>
                        </>
                      ) : (
                        <>
                          <p>✓ Compares tour characteristics with your preferences</p>
                          <p>✓ Based on adventure level, group size, budget, and more</p>
                          <p>✓ Set your preferences to get personalized matches</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* CTA for users without preferences (no account required) */}
                  {!hasPreferences && (
                    <div className="border-t pt-4">
                      <Button
                        onClick={handleSetPreferences}
                        className="w-full sunset-gradient text-white"
                      >
                        Set Your Preferences
                        <Settings className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Match scores are based on AI analysis of tour characteristics and your travel preferences.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Use portal to render outside the card container
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

