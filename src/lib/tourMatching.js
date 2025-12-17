/**
 * Tour Matching System
 * Matches tours with user preferences based on tag-derived profiles
 */

import { createSupabaseServiceRoleClient } from './supabaseClient';

// Maximum number of tags to consider when calculating tour profile
const MAX_TAGS_FOR_PROFILE = 6;

// Dimension weights for match score calculation
const DIMENSION_WEIGHTS = {
  adventure_score: 1.5,
  relaxation_exploration_score: 1.2,
  group_intimacy_score: 1.0,
  price_comfort_score: 1.3,
  guidance_score: 0.8,
  food_drink_score: 0.7,
};

/**
 * Calculate tour profile from tags
 * @param {Array<Object>|Array<number>} tourTagsOrIds - Array of tag objects (with scores) OR array of tag IDs
 * @param {Map<number, Object>} tagTraitsMap - Map of tagId -> trait data (only used if tourTagsOrIds is array of IDs)
 * @param {Object} supabaseClient - Optional Supabase client (only used if fetching from DB)
 * @returns {Object} Tour profile with scores and metadata
 */
export async function calculateTourProfile(tourTagsOrIds, tagTraitsMap = null, supabaseClient = null) {
  // Check if we have tag objects with scores (preferred) or just tag IDs
  const hasTagObjects = tourTagsOrIds && tourTagsOrIds.length > 0 && typeof tourTagsOrIds[0] === 'object' && tourTagsOrIds[0].adventure_score !== undefined;
  
  if (hasTagObjects) {
    // Direct calculation from tag objects (faster, no DB call needed)
    return calculateTourProfileFromTagObjects(tourTagsOrIds);
  }
  
  // Fallback: treat as tag IDs and fetch from database
  const tourTagIds = tourTagsOrIds || [];
  if (tourTagIds.length === 0) {
    return getDefaultProfile();
  }

  // Fetch tag traits if not provided
  if (!tagTraitsMap) {
    tagTraitsMap = await fetchTagTraits(tourTagIds, supabaseClient);
  }

  // Get traits for tour tags
  const tagTraits = tourTagIds
    .map(tagId => {
      const trait = tagTraitsMap.get(Number(tagId));
      if (!trait) return null;
      return {
        tagId: Number(tagId),
        tagName: trait.tag_name_en,
        trait,
        weight: parseFloat(trait.tag_weight) || 1.0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.weight - a.weight) // Most defining first
    .slice(0, MAX_TAGS_FOR_PROFILE); // Cap at max tags

  if (tagTraits.length === 0) {
    return getDefaultProfile();
  }

  // Calculate weighted average
  const traits = {
    adventure_score: 0,
    relaxation_exploration_score: 0,
    group_intimacy_score: 0,
    price_comfort_score: 0,
    guidance_score: 0,
    food_drink_score: 0,
  };

  let totalWeight = 0;

  tagTraits.forEach(({ trait, weight }) => {
    totalWeight += weight;
    traits.adventure_score += (trait.adventure_score || 50) * weight;
    traits.relaxation_exploration_score += (trait.relaxation_exploration_score || 50) * weight;
    traits.group_intimacy_score += (trait.group_intimacy_score || 50) * weight;
    traits.price_comfort_score += (trait.price_comfort_score || 50) * weight;
    traits.guidance_score += (trait.guidance_score || 50) * weight;
    traits.food_drink_score += (trait.food_drink_score || 50) * weight;
  });

  // Normalize
  Object.keys(traits).forEach(key => {
    traits[key] = Math.round(traits[key] / totalWeight);
  });

  // Calculate confidence
  const confidence = calculateConfidence(tagTraits, traits);

  return {
    ...traits,
    confidence, // 'low' | 'medium' | 'high'
    contributing_tags: tagTraits.map(t => ({
      tagId: t.tagId,
      tagName: t.tagName,
    })),
    tag_count: tagTraits.length,
  };
}

/**
 * Calculate tour profile directly from tag objects (with scores already included)
 * @param {Array<Object>} tagObjects - Array of tag objects with scores
 * @returns {Object} Tour profile with scores and metadata
 */
function calculateTourProfileFromTagObjects(tagObjects) {
  if (!tagObjects || tagObjects.length === 0) {
    return getDefaultProfile();
  }

  // Sort by weight (most defining first) and cap at max tags
  const sortedTags = [...tagObjects]
    .map(tag => ({
      ...tag,
      weight: parseFloat(tag.tag_weight) || 1.0,
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_TAGS_FOR_PROFILE);

  // Calculate weighted average
  const traits = {
    adventure_score: 0,
    relaxation_exploration_score: 0,
    group_intimacy_score: 0,
    price_comfort_score: 0,
    guidance_score: 0,
    food_drink_score: 0,
  };

  let totalWeight = 0;

  sortedTags.forEach(tag => {
    const weight = tag.weight;
    totalWeight += weight;
    traits.adventure_score += (tag.adventure_score || 50) * weight;
    traits.relaxation_exploration_score += (tag.relaxation_exploration_score || 50) * weight;
    traits.group_intimacy_score += (tag.group_intimacy_score || 50) * weight;
    traits.price_comfort_score += (tag.price_comfort_score || 50) * weight;
    traits.guidance_score += (tag.guidance_score || 50) * weight;
    traits.food_drink_score += (tag.food_drink_score || 50) * weight;
  });

  // Normalize
  Object.keys(traits).forEach(key => {
    traits[key] = Math.round(traits[key] / totalWeight);
  });

  // Calculate confidence
  const confidence = calculateConfidenceFromTagObjects(sortedTags, traits);

  return {
    ...traits,
    confidence,
    contributing_tags: sortedTags.map(t => ({
      tagId: t.tag_id || t.tagId,
      tagName: t.tag_name_en || t.tagName,
    })),
    tag_count: sortedTags.length,
  };
}

/**
 * Calculate confidence from tag objects
 */
function calculateConfidenceFromTagObjects(tagObjects, traits) {
  if (tagObjects.length === 0) return 'low';
  if (tagObjects.length === 1) return 'low';
  if (tagObjects.length < 3) return 'medium';

  // Calculate variance for each dimension
  const variances = Object.keys(traits).map(dimension => {
    const scores = tagObjects.map(tag => tag[dimension] || 50);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    return variance;
  });

  const avgVariance = variances.reduce((a, b) => a + b, 0) / variances.length;

  // Low variance = consistent = high confidence
  if (tagObjects.length >= 4 && avgVariance < 200) return 'high';
  if (tagObjects.length >= 3 && avgVariance < 400) return 'medium';
  return 'low';
}

/**
 * Calculate confidence based on tag data quality
 */
function calculateConfidence(tagTraits, traits) {
  if (tagTraits.length === 0) return 'low';
  if (tagTraits.length === 1) return 'low';
  if (tagTraits.length < 3) return 'medium';

  // Calculate variance for each dimension
  const variances = Object.keys(traits).map(dimension => {
    const scores = tagTraits.map(t => t.trait[dimension] || 50);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    return variance;
  });

  const avgVariance = variances.reduce((a, b) => a + b, 0) / variances.length;

  // Low variance = consistent = high confidence
  if (tagTraits.length >= 4 && avgVariance < 200) return 'high';
  if (tagTraits.length >= 3 && avgVariance < 400) return 'medium';
  return 'low';
}

/**
 * Get default balanced profile
 */
function getDefaultProfile() {
  return {
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
}

/**
 * Fetch tag traits from database
 * @param {Array<number>} tagIds - Array of tag IDs
 * @param {Object} supabaseClient - Optional Supabase client (uses service role if not provided, but should be browser client in client components)
 */
async function fetchTagTraits(tagIds, supabaseClient = null) {
  // Use provided client, or create service role client (server-side only)
  let supabase;
  if (supabaseClient) {
    supabase = supabaseClient;
  } else {
    // Only use service role client on server
    if (typeof window === 'undefined') {
      supabase = createSupabaseServiceRoleClient();
    } else {
      // In browser, use browser client
      const { createSupabaseBrowserClient } = await import('./supabaseClient');
      supabase = createSupabaseBrowserClient();
    }
  }
  
  const map = new Map();

  // Fetch in batches (Supabase has limits)
  const batchSize = 1000;
  for (let i = 0; i < tagIds.length; i += batchSize) {
    const batch = tagIds.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('viator_tag_traits')
      .select('*')
      .in('tag_id', batch);

    if (error) {
      console.error('Error fetching tag traits:', error);
      continue;
    }

    (data || []).forEach(trait => {
      map.set(trait.tag_id, trait);
    });
  }

  return map;
}

/**
 * Map user preferences to scores (0-100)
 * @param {Object} userPreferences - User trip preferences from profile
 * @returns {Object} Preference scores
 */
export function getUserPreferenceScores(userPreferences) {
  const prefs = userPreferences || {};

  return {
    // Adventure: Already 0-100 in database
    adventure_score: prefs.adventureLevel || 50,

    // Relax vs Explore: Already 0-100 in database (stored as cultureVsBeach)
    relaxation_exploration_score: prefs.cultureVsBeach || 50,

    // Group size: Already 0-100 in database
    group_intimacy_score: prefs.groupPreference || 50,

    // Budget vs Comfort: Already 0-100 in database
    price_comfort_score: prefs.budgetComfort || 50,

    // Guided vs Independent: Already 0-100 in database (stored as structurePreference)
    guidance_score: prefs.structurePreference || 50,

    // Food & Drinks: Already 0-100 in database
    food_drink_score: prefs.foodAndDrinkInterest || 50,
  };
}

/**
 * Calculate match score between tour profile and user preferences
 * @param {Object} tourProfile - Tour profile from calculateTourProfile
 * @param {Object} userPreferences - User preference scores from getUserPreferenceScores
 * @returns {Object} Match result with score and metadata
 */
export function calculateMatchScore(tourProfile, userPreferences) {
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
    const userScore = userPreferences[dimension] || 50;

    // Similarity = inverse distance
    const distance = Math.abs(tourScore - userScore);
    const similarity = 100 - distance; // 0-100 scale

    // Weight by importance
    const weight = DIMENSION_WEIGHTS[dimension] || 1.0;

    totalMatch += similarity * weight;
    totalWeight += weight;
  });

  const matchScore = Math.round(totalMatch / totalWeight);

  return {
    score: matchScore,
    confidence: tourProfile.confidence || 'low',
    contributing_tags: tourProfile.contributing_tags || [],
    tag_count: tourProfile.tag_count || 0,
  };
}

/**
 * Get match display information for UI
 * @param {Object} matchResult - Result from calculateMatchScore
 * @returns {Object} Display information
 */
export function getMatchDisplay(matchResult) {
  const { score, confidence } = matchResult;

  let label = '';
  if (score >= 85) {
    label = 'Perfect Match';
  } else if (score >= 70) {
    label = 'Great Fit';
  } else if (score >= 55) {
    label = 'Good Option';
  } else {
    label = 'Consider';
  }

  let confidenceBadge = '';
  if (confidence === 'high') {
    confidenceBadge = 'High confidence';
  } else if (confidence === 'medium') {
    confidenceBadge = 'Moderate confidence';
  } else {
    confidenceBadge = 'Limited data';
  }

  return {
    score,
    label,
    confidenceBadge,
    display: `${score}% Match · ${label}`,
    fullDisplay: `${score}% Match · ${label} (${confidenceBadge})`,
  };
}

/**
 * Get default preferences for anonymous users
 */
export function getDefaultPreferences() {
  return {
    adventure_score: 50, // Balanced
    relaxation_exploration_score: 50, // Balanced
    group_intimacy_score: 50, // Either way
    price_comfort_score: 50, // Balanced
    guidance_score: 50, // Mixed
    food_drink_score: 50, // Nice to have
  };
}

