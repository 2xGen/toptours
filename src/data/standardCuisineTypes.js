/**
 * Standardized Cuisine Types
 * Used for restaurant classification and filtering
 * Simplified to 12 core cuisine categories for better filtering and SEO
 */

export const STANDARD_CUISINE_TYPES = [
  'Seafood',
  'Italian',
  'Asian',
  'American',
  'Caribbean & Latin',
  'Mediterranean',
  'European',
  'Steakhouse & Grill',
  'Vegetarian & Vegan',
  'Cafés & Casual Eats',
  'Fusion',
  'International' // Fallback if nothing matches
];

/**
 * Map common variations to standard types
 */
export const CUISINE_MAPPING = {
  // Seafood variations
  'seafood': 'Seafood',
  'seafood_restaurant': 'Seafood',
  'fish': 'Seafood',
  'sushi': 'Asian',
  'japanese': 'Asian',
  'raw_bar': 'Seafood',
  
  // Italian variations
  'italian': 'Italian',
  'pizza': 'Italian',
  'pasta': 'Italian',
  
  // Asian variations
  'asian': 'Asian',
  'chinese': 'Asian',
  'thai': 'Asian',
  'indian': 'Asian',
  'korean': 'Asian',
  'vietnamese': 'Asian',
  'asian_fusion': 'Fusion',
  'japanese': 'Asian',
  
  // American variations
  'american': 'American',
  'bbq': 'Steakhouse & Grill',
  'barbecue': 'Steakhouse & Grill',
  'burgers': 'American',
  'fast_food': 'Cafés & Casual Eats',
  'diner': 'Cafés & Casual Eats',
  
  // Caribbean & Latin variations
  'caribbean': 'Caribbean & Latin',
  'latin_american': 'Caribbean & Latin',
  'mexican': 'Caribbean & Latin',
  'cuban': 'Caribbean & Latin',
  'peruvian': 'Caribbean & Latin',
  'brazilian': 'Caribbean & Latin',
  
  // Mediterranean variations
  'mediterranean': 'Mediterranean',
  'greek': 'Mediterranean',
  'middle_eastern': 'Mediterranean',
  'lebanese': 'Mediterranean',
  'turkish': 'Mediterranean',
  
  // European variations
  'european': 'European',
  'french': 'European',
  'spanish': 'European',
  'german': 'European',
  'british': 'European',
  
  // Steakhouse variations
  'steakhouse': 'Steakhouse & Grill',
  'steak_house': 'Steakhouse & Grill',
  'grill': 'Steakhouse & Grill',
  
  // Vegetarian variations
  'vegetarian': 'Vegetarian & Vegan',
  'vegan': 'Vegetarian & Vegan',
  'healthy': 'Vegetarian & Vegan',
  'organic': 'Vegetarian & Vegan',
  
  // Cafés variations
  'cafe': 'Cafés & Casual Eats',
  'coffee_shop': 'Cafés & Casual Eats',
  'bakery': 'Cafés & Casual Eats',
  'breakfast': 'Cafés & Casual Eats',
  'brunch': 'Cafés & Casual Eats',
  'dessert': 'Cafés & Casual Eats',
  'ice_cream': 'Cafés & Casual Eats',
  
  // Fusion
  'fusion': 'Fusion',
  'contemporary': 'Fusion',
  
  // Fallback
  'international': 'International',
  'restaurant': 'International',
  'food': 'International'
};

/**
 * Get standardized cuisine types from a list
 * Returns 1-2 cuisines (primary + optional secondary)
 * Falls back to "International" if nothing matches
 */
export function standardizeCuisines(cuisineList) {
  if (!Array.isArray(cuisineList)) return ['International'];
  
  const standardized = new Set();
  
  for (const cuisine of cuisineList) {
    const normalized = cuisine.toLowerCase().trim().replace(/[^a-z0-9\s&]/g, '');
    
    // Check direct mapping first
    if (CUISINE_MAPPING[normalized]) {
      standardized.add(CUISINE_MAPPING[normalized]);
      continue;
    }
    
    // Check if it matches a standard type (case-insensitive)
    const match = STANDARD_CUISINE_TYPES.find(
      std => std.toLowerCase() === normalized
    );
    if (match) {
      standardized.add(match);
      continue;
    }
    
    // Check partial matches (e.g., "Italian Restaurant" -> "Italian")
    for (const stdType of STANDARD_CUISINE_TYPES) {
      const stdLower = stdType.toLowerCase();
      if (normalized.includes(stdLower) || stdLower.includes(normalized)) {
        standardized.add(stdType);
        break;
      }
    }
    
    // Check keyword matches in mapping
    for (const [key, value] of Object.entries(CUISINE_MAPPING)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        standardized.add(value);
        break;
      }
    }
  }
  
  const result = Array.from(standardized);
  
  // Remove "International" if we have other cuisines
  if (result.length > 1 && result.includes('International')) {
    const filtered = result.filter(c => c !== 'International');
    return filtered.length > 0 ? filtered.slice(0, 2) : ['International'];
  }
  
  // Fallback to International if nothing matched
  return result.length > 0 ? result.slice(0, 2) : ['International'];
}

