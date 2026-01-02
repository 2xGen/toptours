/**
 * Unified Preference Resolution Utility
 * Ensures all pages use the exact same logic for resolving user preferences
 * This guarantees consistent match scores across all pages
 */

/**
 * Resolve user preferences with consistent priority:
 * 1. userPreferences (from profile, if logged in and valid)
 * 2. localPreferences (from localStorage state, if valid)
 * 3. localStorage (direct read, if valid)
 * 4. null (will use balanced defaults in calculateEnhancedMatchScore)
 * 
 * @param {Object} options - Resolution options
 * @param {Object} options.user - Current user object (from auth)
 * @param {Object} options.userPreferences - Preferences from user profile
 * @param {Object} options.localPreferences - Preferences from localStorage state
 * @returns {Object|null} Resolved preferences or null
 */
export function resolveUserPreferences({ user, userPreferences, localPreferences }) {
  // Priority 1: User preferences from profile (if logged in and valid)
  if (user && userPreferences && typeof userPreferences === 'object' && Object.keys(userPreferences).length >= 5) {
    return userPreferences;
  }
  
  // Priority 2: Local preferences from state (if valid)
  if (localPreferences && typeof localPreferences === 'object' && Object.keys(localPreferences).length >= 5) {
    return localPreferences;
  }
  
  // Priority 3: Check localStorage directly (for initial load before state is set)
  if (typeof window !== 'undefined') {
    try {
      // Check both localStorage keys for backward compatibility
      let stored = localStorage.getItem('topTours_preferences');
      if (!stored) {
        stored = localStorage.getItem('tourPreferences');
      }
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length >= 5) {
          return parsed;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }
  
  // Priority 4: Return null (will use balanced defaults in calculateEnhancedMatchScore)
  return null;
}

