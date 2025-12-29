/**
 * Enhanced Tour Matching System v2
 * Multi-factor scoring with explainable components
 * 
 * Scoring Buckets:
 * 1. Preference Alignment (45%) - tags, flags, duration, itineraryType
 * 2. Quality Confidence (25%) - rating + review count
 * 3. Price Comfort Fit (15%) - price matching
 * 4. Convenience & Risk Reduction (10%) - flags (FREE_CANCELLATION, INSTANT_CONFIRMATION, PRIVATE_TOUR)
 * 5. Intent Keyword Boost (5%) - title/description keywords
 */

import { calculateTourProfile, getUserPreferenceScores, calculateMatchScore as calculateMatchScoreLegacy } from './tourMatching';

/**
 * Adjust tour profile based on actual tour data (price, flags, title)
 * This ensures the profile reflects reality, not just tags
 */
function adjustTourProfileFromTourData(tour, tourProfile) {
  const adjustedProfile = { ...tourProfile };
  const flags = (tour.flags || []).map(f => typeof f === 'string' ? f.toUpperCase() : String(f).toUpperCase());
  const title = (tour.title || '').toLowerCase();
  
  // Extract price from multiple possible locations (tour detail page might have different structure)
  let fromPrice = null;
  let rawPrice = null;
  
  if (tour.pricing?.summary?.fromPrice !== undefined && tour.pricing.summary.fromPrice !== null) {
    rawPrice = tour.pricing.summary.fromPrice;
  } else if (tour.pricing?.fromPrice !== undefined && tour.pricing.fromPrice !== null) {
    rawPrice = tour.pricing.fromPrice;
  } else if (tour.pricing?.amount !== undefined && tour.pricing.amount !== null) {
    rawPrice = tour.pricing.amount;
  } else if (tour.price !== undefined && tour.price !== null) {
    rawPrice = tour.price;
  } else if (tour.fromPrice !== undefined && tour.fromPrice !== null) {
    rawPrice = tour.fromPrice;
  }
  
  // Parse price - handle both numbers and formatted strings like "$2,132" or "2132.00"
  if (rawPrice !== null && rawPrice !== undefined) {
    if (typeof rawPrice === 'number') {
      fromPrice = rawPrice;
    } else if (typeof rawPrice === 'string') {
      // Remove currency symbols, commas, and whitespace, then parse
      const cleaned = rawPrice.replace(/[$,\s]/g, '');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed) && parsed > 0) {
        fromPrice = parsed;
      }
    }
  }

  // Adjust group_intimacy_score if it's a private tour
  const isPrivate = flags.includes('PRIVATE_TOUR') || 
                    title.includes('private') || 
                    title.includes('exclusive') ||
                    title.includes('charter') ||
                    title.includes('yacht');
  
  if (isPrivate) {
    // If PRIVATE_TOUR flag is present, automatically set to Private/Small (75)
    // This ensures the modal always shows "Private/Small" for private tours
    adjustedProfile.group_intimacy_score = 75; // Private/Small
    adjustedProfile.isAdjustedFromTourData = true; // Mark as adjusted
  }

  // Adjust price_comfort_score based on actual price
  if (fromPrice && typeof fromPrice === 'number' && fromPrice > 0) {
    // Map price to comfort level
    // $0-50 = 25 (budget), $50-150 = 50 (moderate), $150-300 = 75 (comfortable), $300+ = 85 (luxury)
    let priceComfortScore = 50; // Default moderate
    
    if (fromPrice >= 300) {
      priceComfortScore = 85; // Luxury - set directly (no blending) for very expensive tours
      adjustedProfile.price_comfort_score = 85;
      adjustedProfile.isAdjustedFromTourData = true; // Mark as adjusted
    } else if (fromPrice >= 150) {
      priceComfortScore = 75; // Comfortable
      // Blend 60% actual price + 40% tag-based score for moderate-high prices
      const currentPriceScore = adjustedProfile.price_comfort_score || 50;
      adjustedProfile.price_comfort_score = Math.round(
        priceComfortScore * 0.6 + currentPriceScore * 0.4
      );
    } else if (fromPrice >= 50) {
      priceComfortScore = 50; // Moderate
      // Blend 60% actual price + 40% tag-based score
      const currentPriceScore = adjustedProfile.price_comfort_score || 50;
      adjustedProfile.price_comfort_score = Math.round(
        priceComfortScore * 0.6 + currentPriceScore * 0.4
      );
    } else {
      priceComfortScore = 25; // Budget
      // Blend 60% actual price + 40% tag-based score
      const currentPriceScore = adjustedProfile.price_comfort_score || 50;
      adjustedProfile.price_comfort_score = Math.round(
        priceComfortScore * 0.6 + currentPriceScore * 0.4
      );
    }
  }

  return adjustedProfile;
}

/**
 * Calculate enhanced match score with all Viator signals
 * @param {Object} tour - Full tour object from Viator API
 * @param {Object} userPreferences - User preference scores from getUserPreferenceScores
 * @param {Object} tourProfile - Optional pre-calculated tour profile (from tags)
 * @returns {Object} Enhanced match result with score, breakdown, and explanations
 */
export async function calculateEnhancedMatchScore(tour, userPreferences, tourProfile = null) {
  // Fallback to legacy system if tour object is incomplete
  if (!tour || (!tour.tags && !tourProfile)) {
    if (tourProfile) {
      const userPrefs = getUserPreferenceScores(userPreferences);
      return calculateMatchScoreLegacy(tourProfile, userPrefs);
    }
    return { score: 50, confidence: 'low', contributing_tags: [], tag_count: 0 };
  }
  // Get tour profile from tags (if not provided)
  if (!tourProfile) {
    const tags = tour.tags || [];
    tourProfile = await calculateTourProfile(tags);
  }

  // Adjust tour profile based on actual tour data (price, flags, title)
  // This ensures the profile reflects reality, not just tags
  tourProfile = adjustTourProfileFromTourData(tour, tourProfile);

  // Get user preference scores
  const userPrefs = getUserPreferenceScores(userPreferences);

  // Calculate each scoring bucket
  const preferenceAlignment = calculatePreferenceAlignment(tour, tourProfile, userPrefs);
  const qualityConfidence = calculateQualityConfidence(tour);
  const priceComfortFit = calculatePriceComfortFit(tour, userPrefs);
  const convenienceRiskReduction = calculateConvenienceRiskReduction(tour, userPrefs);
  const intentKeywordBoost = calculateIntentKeywordBoost(tour, userPrefs);

  // Weighted final score
  // Normalize all components to 0-100 scale, then apply weights
  // qualityConfidence: 0-25 scale → normalize to 0-100
  // priceComfortFit: 0-15 scale → normalize to 0-100
  // convenienceRiskReduction: 0-10 scale → normalize to 0-100
  // intentKeywordBoost: 0-5 scale → normalize to 0-100
  const normalizedQuality = (qualityConfidence.score / 25) * 100;
  const normalizedPrice = (priceComfortFit.score / 15) * 100;
  const normalizedConvenience = (convenienceRiskReduction.score / 10) * 100;
  const normalizedIntent = (intentKeywordBoost.score / 5) * 100;
  
  const finalScore = Math.round(
    preferenceAlignment.score * 0.45 +      // 45% (already 0-100 scale)
    normalizedQuality * 0.25 +              // 25% (normalized to 0-100)
    normalizedPrice * 0.15 +                 // 15% (normalized to 0-100)
    normalizedConvenience * 0.10 +           // 10% (normalized to 0-100)
    normalizedIntent * 0.05                  // 5% (normalized to 0-100)
  );

  // Cap at 100
  const cappedScore = Math.min(100, Math.max(0, finalScore));

  return {
    score: cappedScore,
    breakdown: {
      preferenceAlignment,
      qualityConfidence,
      priceComfortFit,
      convenienceRiskReduction,
      intentKeywordBoost,
    },
    explanations: generateExplanations({
      preferenceAlignment,
      qualityConfidence,
      priceComfortFit,
      convenienceRiskReduction,
      intentKeywordBoost,
    }),
    confidence: tourProfile.confidence || 'low',
    contributing_tags: tourProfile.contributing_tags || [],
    tag_count: tourProfile.tag_count || 0,
    // IMPORTANT: Store the ADJUSTED tour profile (not the original tag-based one)
    // This ensures the modal shows the correct characteristics (private, luxury, etc.)
    tourProfile: tourProfile, // This is the adjusted profile from adjustTourProfileFromTourData
  };
}

/**
 * ① Preference Alignment (45%)
 * Tags, flags, duration, itineraryType
 */
function calculatePreferenceAlignment(tour, tourProfile, userPrefs) {
  const dimensions = [
    'adventure_score',
    'relaxation_exploration_score',
    'group_intimacy_score',
    'price_comfort_score',
    'guidance_score',
    'food_drink_score',
  ];

  let totalMatch = 0;
  let totalWeight = 0;

  dimensions.forEach(dimension => {
    const tourScore = tourProfile[dimension] || 50;
    const userScore = userPrefs[dimension] || 50;

    // Similarity = inverse distance
    const distance = Math.abs(tourScore - userScore);
    const similarity = 100 - distance; // 0-100 scale

    // Weight by importance
    const weight = getDimensionWeight(dimension);
    totalMatch += similarity * weight;
    totalWeight += weight;
  });

  // Apply flag-based adjustments
  const flagAdjustments = applyFlagAdjustments(tour, userPrefs);
  
  // Apply duration adjustments
  const durationAdjustment = applyDurationAdjustment(tour, userPrefs);
  
  // Apply itinerary type adjustments
  const itineraryAdjustment = applyItineraryTypeAdjustment(tour, userPrefs);
  
  // Apply special feature adjustments
  const featureAdjustment = applySpecialFeatureAdjustments(tour);
  
  // Apply family-friendly detection
  const familyAdjustment = applyFamilyFriendlyAdjustment(tour, userPrefs);

  // Base score from tags
  const baseScore = totalWeight > 0 ? totalMatch / totalWeight : 50;
  
  // Apply all adjustments
  const adjustedScore = Math.min(100, Math.max(0, 
    baseScore + flagAdjustments + durationAdjustment + 
    itineraryAdjustment + featureAdjustment + familyAdjustment
  ));

  return {
    score: Math.round(adjustedScore),
    baseScore: Math.round(baseScore),
    adjustments: {
      flags: flagAdjustments,
      duration: durationAdjustment,
      itinerary: itineraryAdjustment,
      features: featureAdjustment,
      family: familyAdjustment,
    },
  };
}

/**
 * Apply flag-based adjustments to preference alignment
 * PRIVATE_TOUR directly affects group_intimacy_score
 */
function applyFlagAdjustments(tour, userPrefs) {
  const flags = (tour.flags || []).map(f => typeof f === 'string' ? f.toUpperCase() : String(f).toUpperCase());
  const title = (tour.title || '').toLowerCase();
  let adjustment = 0;

  // PRIVATE_TOUR flag → directly boost group_intimacy_score if user prefers small groups
  // Also check title for "private", "exclusive", "charter" keywords as fallback
  const isPrivate = flags.includes('PRIVATE_TOUR') || 
                    title.includes('private') || 
                    title.includes('exclusive') ||
                    title.includes('charter') || // Yacht charters are typically private
                    title.includes('yacht'); // Yacht tours are typically private

  if (isPrivate) {
    const groupPref = userPrefs.group_intimacy_score || 50;
    // If user prefers small groups (70+), this is a strong match
    if (groupPref >= 70) {
      adjustment += 10; // Strong boost for private tours when user wants small groups
    } else if (groupPref >= 50) {
      adjustment += 5; // Moderate boost
    } else if (groupPref <= 30) {
      adjustment -= 5; // Penalty if user prefers large groups
    }
  }

  return adjustment;
}

/**
 * Apply duration-based adjustments
 * Half-day (2-4 hours) vs full-day (6+ hours) vs multi-day
 */
function applyDurationAdjustment(tour, userPrefs) {
  const durationMinutes = tour.duration?.fixedDurationInMinutes;
  if (!durationMinutes) return 0;

  const hours = durationMinutes / 60;
  const adventureLevel = userPrefs.adventure_score || 50;
  const relaxationLevel = userPrefs.relaxation_exploration_score || 50;

  let adjustment = 0;

  // Half-day (2-4 hours) - good for relaxed travelers
  if (hours >= 2 && hours <= 4) {
    if (relaxationLevel >= 70) {
      adjustment += 3; // Relaxed travelers like shorter tours
    }
  }
  // Full-day (6-8 hours) - good for adventurous travelers
  else if (hours >= 6 && hours <= 8) {
    if (adventureLevel >= 70) {
      adjustment += 3; // Adventurous travelers like longer tours
    }
  }
  // Multi-day - very adventurous
  else if (hours > 8) {
    if (adventureLevel >= 80) {
      adjustment += 5; // Very adventurous travelers love multi-day
    } else if (adventureLevel <= 30) {
      adjustment -= 3; // Relaxed travelers might find it too long
    }
  }

  return adjustment;
}

/**
 * Apply itinerary type adjustments
 * ACTIVITY (guided) vs TOUR (self-guided) preferences
 */
function applyItineraryTypeAdjustment(tour, userPrefs) {
  const itineraryType = (tour.itineraryType || '').toUpperCase();
  const guidanceScore = userPrefs.guidance_score || 50;
  let adjustment = 0;

  // ACTIVITY = guided experience (higher guidance)
  if (itineraryType === 'ACTIVITY') {
    if (guidanceScore >= 70) {
      adjustment += 2; // User wants guided experiences
    } else if (guidanceScore <= 30) {
      adjustment -= 1; // User prefers self-guided
    }
  }
  // TOUR = more self-guided (lower guidance)
  else if (itineraryType === 'TOUR') {
    if (guidanceScore <= 30) {
      adjustment += 2; // User prefers self-guided
    } else if (guidanceScore >= 70) {
      adjustment -= 1; // User wants more guidance
    }
  }

  return adjustment;
}

/**
 * Apply special feature flag adjustments
 * MOBILE_TICKET, SKIP_THE_LINE, WHEELCHAIR_ACCESSIBLE
 */
function applySpecialFeatureAdjustments(tour) {
  const flags = (tour.flags || []).map(f => typeof f === 'string' ? f.toUpperCase() : String(f).toUpperCase());
  let adjustment = 0;

  // MOBILE_TICKET - convenience (+1 point)
  if (flags.includes('MOBILE_TICKET')) {
    adjustment += 1;
  }

  // SKIP_THE_LINE - time-saver (+1 point)
  if (flags.includes('SKIP_THE_LINE')) {
    adjustment += 1;
  }

  // WHEELCHAIR_ACCESSIBLE - accessibility (+1 point)
  if (flags.includes('WHEELCHAIR_ACCESSIBLE')) {
    adjustment += 1;
  }

  return adjustment;
}

/**
 * Apply family-friendly detection
 * Detects family-friendly tours and matches with group preferences
 */
function applyFamilyFriendlyAdjustment(tour, userPrefs) {
  const title = (tour.title || '').toLowerCase();
  const description = (tour.description || '').toLowerCase();
  const combinedText = `${title} ${description}`;

  const familyKeywords = ['family', 'kids', 'children', 'all ages', 'family-friendly', 'suitable for families'];
  const isFamilyFriendly = familyKeywords.some(keyword => combinedText.includes(keyword));

  if (!isFamilyFriendly) return 0;

  // Families often prefer moderate group sizes (40-60 range)
  const groupPref = userPrefs.group_intimacy_score || 50;
  
  // If group preference is in the moderate range (40-60), likely family
  if (groupPref >= 40 && groupPref <= 60) {
    return 2; // Family-friendly tour matches family traveler
  }
  
  // If user explicitly prefers large groups (25-35), might be family with kids
  if (groupPref >= 25 && groupPref <= 35) {
    return 1; // Slight boost
  }

  return 0;
}

/**
 * ② Quality Confidence (25%)
 * Rating + review count (log-scaled)
 */
function calculateQualityConfidence(tour) {
  const reviews = tour.reviews || {};
  const rating = reviews.combinedAverageRating || 0;
  const reviewCount = reviews.totalReviews || 0;

  // Rating component (0-15 points)
  // 4.0 = 0, 4.5 = 7.5, 5.0 = 15
  let ratingScore = 0;
  if (rating >= 4.0) {
    ratingScore = ((rating - 4.0) / 1.0) * 15; // 4.0-5.0 maps to 0-15
  }

  // Review count component (0-10 points, log-scaled)
  // 10 reviews = 2, 100 = 5, 1000 = 8, 5000+ = 10
  let reviewCountScore = 0;
  if (reviewCount > 0) {
    const logCount = Math.log10(reviewCount + 1);
    // Log scale: 1-2 = 2 points, 2-3 = 5 points, 3-4 = 8 points, 4+ = 10 points
    if (logCount >= 4) {
      reviewCountScore = 10;
    } else if (logCount >= 3) {
      reviewCountScore = 5 + (logCount - 3) * 3; // 5-8 points
    } else if (logCount >= 2) {
      reviewCountScore = 2 + (logCount - 2) * 3; // 2-5 points
    } else {
      reviewCountScore = logCount * 2; // 0-2 points
    }
  }

  // Bonus for TripAdvisor reviews (trust signal)
  const hasTripAdvisor = (reviews.sources || []).some(s => 
    s.provider === 'TRIPADVISOR' && s.totalCount > 0
  );
  const tripAdvisorBonus = hasTripAdvisor ? 2 : 0;

  const totalScore = Math.min(25, Math.round(
    ratingScore + reviewCountScore + tripAdvisorBonus
  ));

  return {
    score: totalScore,
    ratingScore: Math.round(ratingScore),
    reviewCountScore: Math.round(reviewCountScore),
    tripAdvisorBonus,
    rating,
    reviewCount,
  };
}

/**
 * ③ Price Comfort Fit (15%)
 * Price matching (not just cheap vs expensive, but fit vs mismatch)
 */
function calculatePriceComfortFit(tour, userPrefs) {
  const pricing = tour.pricing?.summary;
  const fromPrice = pricing?.fromPrice;
  if (!fromPrice) return { score: 7.5, reason: 'No price data', fromPrice: null, budgetComfort: userPrefs.price_comfort_score || 50 };

  const budgetComfort = userPrefs.price_comfort_score || 50;

  // Map user budget preference to price ranges (USD)
  // 25 = Budget ($0-50), 50 = Moderate ($50-150), 75 = Comfortable ($150-300), 85 = Luxury ($300+)
  const budgetRanges = {
    25: { min: 0, max: 50, ideal: 25 },
    50: { min: 25, max: 150, ideal: 75 },
    75: { min: 100, max: 300, ideal: 200 },
    85: { min: 250, max: 10000, ideal: 500 },
  };

  // Find closest budget range
  const rangeKeys = Object.keys(budgetRanges).map(Number);
  const closestKey = rangeKeys.reduce((prev, curr) => {
    return Math.abs(curr - budgetComfort) < Math.abs(prev - budgetComfort) ? curr : prev;
  });
  const range = budgetRanges[closestKey];

  // Calculate match score (0-15 points)
  let matchScore = 0;

  if (fromPrice >= range.min && fromPrice <= range.max) {
    // Within range - calculate distance from ideal
    const distanceFromIdeal = Math.abs(fromPrice - range.ideal);
    const rangeSize = range.max - range.min;
    const matchPercent = 1 - (distanceFromIdeal / rangeSize);
    matchScore = matchPercent * 15;
  } else if (fromPrice < range.min) {
    // Below range - partial credit (cheaper is usually okay)
    matchScore = (fromPrice / range.min) * 10;
  } else {
    // Above range - significant penalty (too expensive)
    // For $2000 tour with budget of $50-150 range, this should be very low
    const overshootRatio = fromPrice / range.max;
    if (overshootRatio > 5) {
      // Way too expensive (5x+ over budget) - minimal score
      matchScore = Math.max(0, 2 - (overshootRatio - 5) * 0.5);
    } else if (overshootRatio > 2) {
      // Very expensive (2-5x over budget) - low score
      matchScore = (range.max / fromPrice) * 3;
    } else {
      // Slightly expensive (1-2x over budget) - moderate score
      matchScore = (range.max / fromPrice) * 8;
    }
  }

  return {
    score: Math.round(Math.min(15, Math.max(0, matchScore))),
    fromPrice,
    budgetComfort,
    range: { min: range.min, max: range.max, ideal: range.ideal },
    overshootRatio: fromPrice > range.max ? (fromPrice / range.max).toFixed(2) : null,
  };
}

/**
 * ④ Convenience & Risk Reduction (10%)
 * FREE_CANCELLATION, INSTANT_CONFIRMATION, PRIVATE_TOUR
 */
function calculateConvenienceRiskReduction(tour, userPrefs) {
  const flags = (tour.flags || []).map(f => f.toUpperCase());
  const confirmationType = (tour.confirmationType || '').toUpperCase();
  
  let score = 0;

  // FREE_CANCELLATION (3 points) - reduces risk, especially for first-time travelers
  if (flags.includes('FREE_CANCELLATION')) {
    score += 3;
  }

  // INSTANT_CONFIRMATION (3 points) - convenience, especially for families
  if (confirmationType === 'INSTANT' || flags.includes('INSTANT_CONFIRMATION')) {
    score += 3;
  }

  // PRIVATE_TOUR (4 points) - already counted in preference alignment, but also convenience
  // Only add if not already heavily weighted in preference alignment
  if (flags.includes('PRIVATE_TOUR')) {
    const groupPref = userPrefs.group_intimacy_score || 50;
    // Add bonus if user prefers private, but don't double-count
    if (groupPref >= 70) {
      score += 2; // Additional convenience bonus
    }
  }

  return {
    score: Math.min(10, score),
    flags: {
      freeCancellation: flags.includes('FREE_CANCELLATION'),
      instantConfirmation: confirmationType === 'INSTANT' || flags.includes('INSTANT_CONFIRMATION'),
      privateTour: flags.includes('PRIVATE_TOUR'),
    },
  };
}

/**
 * ⑤ Intent Keyword Boost (5%)
 * Lightweight keyword matching in title and description
 */
function calculateIntentKeywordBoost(tour, userPrefs) {
  const title = (tour.title || '').toLowerCase();
  const description = (tour.description || '').toLowerCase();
  const combinedText = `${title} ${description}`;

  let score = 0;

  // Adventure keywords
  const adventureKeywords = ['adventure', 'extreme', 'thrilling', 'exciting', 'action', 'adrenaline'];
  const relaxedKeywords = ['relaxing', 'leisurely', 'peaceful', 'calm', 'gentle', 'tranquil'];

  // Group size keywords
  const privateKeywords = ['private', 'exclusive', 'personalized', 'intimate'];
  const groupKeywords = ['group', 'shared', 'small group'];

  // Budget/luxury keywords
  const luxuryKeywords = ['luxury', 'premium', 'vip', 'exclusive', 'deluxe'];
  const budgetKeywords = ['affordable', 'budget', 'value', 'cheap'];

  // Eco/local keywords
  const ecoKeywords = ['eco', 'sustainable', 'green', 'environmental'];
  const localKeywords = ['local', 'authentic', 'cultural', 'traditional'];

  // Match adventure level
  const adventureLevel = userPrefs.adventure_score || 50;
  if (adventureLevel >= 70) {
    // High adventure - look for adventure keywords
    if (adventureKeywords.some(kw => combinedText.includes(kw))) {
      score += 2;
    }
  } else if (adventureLevel <= 30) {
    // Low adventure - look for relaxed keywords
    if (relaxedKeywords.some(kw => combinedText.includes(kw))) {
      score += 2;
    }
  }

  // Match group preference (only if not already covered by PRIVATE_TOUR flag)
  const groupPref = userPrefs.group_intimacy_score || 50;
  if (groupPref >= 70 && privateKeywords.some(kw => combinedText.includes(kw))) {
    score += 1.5;
  } else if (groupPref <= 30 && groupKeywords.some(kw => combinedText.includes(kw))) {
    score += 1.5;
  }

  // Match budget preference
  const budgetComfort = userPrefs.price_comfort_score || 50;
  if (budgetComfort >= 75 && luxuryKeywords.some(kw => combinedText.includes(kw))) {
    score += 1;
  } else if (budgetComfort <= 25 && budgetKeywords.some(kw => combinedText.includes(kw))) {
    score += 1;
  }

  // Eco/local bonus (small boost for values-aligned travelers)
  if (ecoKeywords.some(kw => combinedText.includes(kw)) || 
      localKeywords.some(kw => combinedText.includes(kw))) {
    score += 0.5;
  }

  return {
    score: Math.min(5, Math.round(score)),
    matchedKeywords: extractMatchedKeywords(combinedText, {
      adventureKeywords,
      relaxedKeywords,
      privateKeywords,
      groupKeywords,
      luxuryKeywords,
      budgetKeywords,
      ecoKeywords,
      localKeywords,
    }),
  };
}

/**
 * Extract matched keywords for explanation
 */
function extractMatchedKeywords(text, keywordSets) {
  const matched = [];
  Object.entries(keywordSets).forEach(([setName, keywords]) => {
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        matched.push(keyword);
      }
    });
  });
  return [...new Set(matched)]; // Remove duplicates
}

/**
 * Generate human-readable explanations
 */
function generateExplanations(breakdown) {
  const explanations = [];

  // Preference alignment
  if (breakdown.preferenceAlignment.score >= 40) {
    explanations.push('Strong match with your travel preferences');
  }

  // Quality confidence
  if (breakdown.qualityConfidence.rating >= 4.5) {
    explanations.push(`Highly rated (${breakdown.qualityConfidence.rating.toFixed(1)} stars)`);
  }
  if (breakdown.qualityConfidence.reviewCount >= 100) {
    explanations.push(`${breakdown.qualityConfidence.reviewCount}+ verified reviews`);
  }

  // Price fit
  if (breakdown.priceComfortFit.score >= 12) {
    explanations.push('Price aligns with your budget');
  }

  // Convenience
  if (breakdown.convenienceRiskReduction.flags.freeCancellation) {
    explanations.push('Free cancellation available');
  }
  if (breakdown.convenienceRiskReduction.flags.instantConfirmation) {
    explanations.push('Instant confirmation');
  }
  if (breakdown.convenienceRiskReduction.flags.privateTour) {
    explanations.push('Private experience');
  }

  // Keywords
  if (breakdown.intentKeywordBoost.matchedKeywords.length > 0) {
    const keywords = breakdown.intentKeywordBoost.matchedKeywords.slice(0, 2).join(', ');
    explanations.push(`Matches keywords: ${keywords}`);
  }

  return explanations;
}

/**
 * Get dimension weight (same as original system)
 */
function getDimensionWeight(dimension) {
  const weights = {
    adventure_score: 1.5,
    relaxation_exploration_score: 1.2,
    group_intimacy_score: 1.0,
    price_comfort_score: 1.3,
    guidance_score: 0.8,
    food_drink_score: 0.7,
  };
  return weights[dimension] || 1.0;
}

