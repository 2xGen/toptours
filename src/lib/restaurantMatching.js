/**
 * Restaurant Matching System
 * Formula-based matching (no AI) - calculates match scores immediately from restaurant data
 */

/**
 * Extract structured values from restaurant data (formula-based, no AI)
 * Returns values similar to tour matching: adventureLevel, structureLevel, etc.
 * but adapted for restaurant context
 */
export const extractRestaurantStructuredValues = (restaurant) => {
  if (!restaurant || typeof restaurant !== 'object') {
    return {
      error: 'Missing restaurant data'
    };
  }

  // 1. Budget Level (0-100): Based on priceRange
  // $ = 0-25, $$ = 25-50, $$$ = 50-75, $$$$ = 75-100
  const priceRange = restaurant.pricing?.priceRange || '';
  let budgetLevel = 50; // Default to mid-range
  if (priceRange.includes('$$$$')) {
    budgetLevel = 90; // Luxury
  } else if (priceRange.includes('$$$') && !priceRange.includes('$$$$')) {
    budgetLevel = 70; // Upscale
  } else if (priceRange.includes('$$') && !priceRange.includes('$$$')) {
    budgetLevel = 40; // Moderate
  } else if (priceRange.includes('$') && !priceRange.includes('$$')) {
    budgetLevel = 15; // Budget
  }

  // 2. Food Importance (always high for restaurants, but vary based on type)
  // Fine dining, wine focus = higher, casual = medium-high
  let foodImportance = 85; // Default high (it's a restaurant)
  if (restaurant.servesWine || restaurant.servesCocktails) {
    foodImportance = 95; // Food & drinks are central
  }
  if (restaurant.servesCoffee && !restaurant.servesWine && !restaurant.servesCocktails) {
    foodImportance = 70; // More casual/cafe
  }

  // 3. Group Preference (0-100): Based on group-friendly features
  // 0 = big groups ok, 100 = prefer private/small groups
  let groupType = 50; // Default neutral
  if (restaurant.goodForGroups) {
    groupType = 20; // Big groups welcome
  }
  if (restaurant.goodForChildren) {
    groupType = 30; // Family-friendly (medium groups)
  }
  if (restaurant.reservable && !restaurant.goodForGroups) {
    groupType = 70; // More intimate/reserved
  }

  // 4. Structure Level (0-100): Based on reservation system and formality
  // 0 = casual/walk-in, 100 = formal/reservations required
  let structureLevel = 30; // Default casual
  if (restaurant.reservable) {
    structureLevel = 60; // Reservations available (more structured)
  }
  if (restaurant.pricing?.priceRangeLabel?.toLowerCase().includes('fine dining')) {
    structureLevel = 85; // Fine dining = very structured
  }
  if (!restaurant.reservable && restaurant.pricing?.priceRange === '$') {
    structureLevel = 10; // Very casual, walk-in only
  }

  // 5. Relaxation vs Exploration (0-100)
  // 0 = relaxation/casual, 100 = exploration/experience/cultural
  let relaxationVsExploration = 50; // Default neutral
  if (restaurant.outdoorSeating) {
    relaxationVsExploration = 30; // More relaxed
  }
  if (restaurant.liveMusic) {
    relaxationVsExploration = 40; // Entertainment but still relaxed
  }
  if (restaurant.pricing?.priceRangeLabel?.toLowerCase().includes('fine dining')) {
    relaxationVsExploration = 80; // Fine dining = cultural experience
  }
  if (restaurant.servesWine && !restaurant.outdoorSeating) {
    relaxationVsExploration = 70; // Wine-focused = more exploration/experience
  }

  // 6. Time of Day Preference (derived from opening hours)
  // This can be used to match with user's timeOfDayPreference
  // We'll calculate this separately in the matching function

  // 7. Adventure Level (0-100): Based on uniqueness and experience level
  // For restaurants: unique experiences, exotic cuisine, special features
  let adventureLevel = 40; // Default moderate
  if (restaurant.liveMusic) {
    adventureLevel = 60; // More exciting/unique
  }
  if (restaurant.outdoorSeating) {
    adventureLevel = 55; // More adventurous setting
  }
  if (restaurant.pricing?.priceRangeLabel?.toLowerCase().includes('fine dining')) {
    adventureLevel = 70; // Fine dining = adventurous experience
  }
  // If it's a very casual place ($), lower adventure
  if (restaurant.pricing?.priceRange === '$') {
    adventureLevel = 25; // Very casual = less adventurous
  }

  return {
    budgetLevel,
    foodImportance,
    groupType,
    structureLevel,
    relaxationVsExploration,
    adventureLevel,
  };
};

/**
 * Calculate time of day match based on opening hours
 * Returns: 'breakfast', 'lunch', 'dinner', or 'any'
 */
export const getRestaurantTimeOfDay = (restaurant) => {
  // Try multiple field names (frontend format uses 'hours', schema uses 'openingHoursSpecification')
  const openingHours = restaurant.hours || restaurant.openingHours || restaurant.openingHoursSpecification || [];
  
  if (!openingHours || openingHours.length === 0) {
    return 'any';
  }

  // Parse opening hours to determine primary meal times
  let hasBreakfast = false;
  let hasLunch = false;
  let hasDinner = false;

  openingHours.forEach((hour) => {
    // Handle different formats: { time: "8:00 AM – 10:00 PM" } or { opens: "08:00", closes: "22:00" }
    const timeStr = hour.time || hour.label || '';
    const opens = hour.opens || '';
    const closes = hour.closes || '';
    
    // Extract time from string format like "8:00 AM – 10:00 PM" or "08:00-22:00"
    let openTime = '';
    let closeTime = '';
    
    if (timeStr) {
      const parts = timeStr.split(/[–-]/).map(s => s.trim());
      openTime = parts[0] || '';
      closeTime = parts[1] || '';
    } else if (opens) {
      openTime = opens;
      closeTime = closes;
    }
    
    // Convert to 24-hour format for easier parsing
    const parseTime = (timeStr) => {
      if (!timeStr) return null;
      // Handle "8:00 AM" format
      const amPmMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
      if (amPmMatch) {
        let hours = parseInt(amPmMatch[1]);
        const minutes = parseInt(amPmMatch[2] || '0');
        const period = amPmMatch[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 100 + minutes; // Return as HHMM number
      }
      // Handle "08:00" or "8:00" format
      const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})/);
      if (timeMatch) {
        return parseInt(timeMatch[1]) * 100 + parseInt(timeMatch[2]);
      }
      return null;
    };
    
    const openHour = parseTime(openTime);
    const closeHour = parseTime(closeTime);
    
    // Breakfast: typically opens 6am-10am (600-1000)
    if (openHour !== null && openHour >= 600 && openHour <= 1000) {
      hasBreakfast = true;
    }
    
    // Lunch: typically opens 11am-2pm (1100-1400)
    if (openHour !== null && openHour >= 1100 && openHour <= 1400) {
      hasLunch = true;
    }
    
    // Dinner: typically closes after 6pm (1800) or opens after 5pm (1700)
    if ((closeHour !== null && closeHour >= 1800) || (openHour !== null && openHour >= 1700)) {
      hasDinner = true;
    }
  });

  // Determine primary focus
  if (hasBreakfast && !hasLunch && !hasDinner) return 'breakfast';
  if (hasLunch && !hasDinner) return 'lunch';
  if (hasDinner) return 'dinner';
  if (hasBreakfast && hasLunch && hasDinner) return 'any';
  if (hasLunch && hasDinner) return 'dinner'; // Prioritize dinner if both
  
  return 'any';
};

/**
 * Calculate match score between user preferences and restaurant
 * Similar to calculatePreferenceMatch for tours
 * Uses restaurantPreferences if available, otherwise falls back to trip_preferences
 */
export const calculateRestaurantPreferenceMatch = (userPreferences, restaurantValues, restaurant) => {
  if (!userPreferences || !restaurantValues) {
    return { error: 'Missing preferences or restaurant values' };
  }

  // Use restaurant-specific preferences if available, otherwise use tour preferences
  const restaurantPrefs = userPreferences.restaurantPreferences || {};
  const useRestaurantPrefs = restaurantPrefs && Object.keys(restaurantPrefs).length > 0;

  // Calculate match percentage for each dimension
  const calculateMatch = (userValue, restaurantValue) => {
    // Closer values = higher match
    // 0 difference = 100% match, 50 difference = 0% match
    const diff = Math.abs(userValue - restaurantValue);
    return Math.max(0, 100 - (diff * 2)); // Linear scale: 0 diff = 100%, 50 diff = 0%
  };

  // Adjust budget matching if using restaurant preferences with price range
  let budgetMatchValue = restaurantValues.budgetLevel || 50;
  if (useRestaurantPrefs && restaurantPrefs.priceRange && restaurantPrefs.priceRange !== 'any') {
    // Convert price range preference to budget level
    const priceToBudget = {
      '$': 15,
      '$$': 40,
      '$$$': 70,
      '$$$$': 90,
    };
    budgetMatchValue = priceToBudget[restaurantPrefs.priceRange] || 50;
  }

  // Adjust structure matching if using restaurant preferences with dining style
  let structureMatchValue = restaurantValues.structureLevel || 50;
  if (useRestaurantPrefs && restaurantPrefs.diningStyle !== undefined) {
    structureMatchValue = restaurantPrefs.diningStyle;
  }

  const matches = {
    adventure: calculateMatch(userPreferences.adventureLevel || 50, restaurantValues.adventureLevel || 50),
    structure: calculateMatch(
      useRestaurantPrefs && restaurantPrefs.diningStyle !== undefined 
        ? restaurantPrefs.diningStyle 
        : (userPreferences.structurePreference || 50),
      structureMatchValue
    ),
    food: calculateMatch(userPreferences.foodAndDrinkInterest || 50, restaurantValues.foodImportance || 50),
    group: calculateMatch(userPreferences.groupPreference || 50, restaurantValues.groupType || 50),
    budget: calculateMatch(
      useRestaurantPrefs && restaurantPrefs.priceRange && restaurantPrefs.priceRange !== 'any'
        ? budgetMatchValue
        : (userPreferences.budgetComfort || 50),
      budgetMatchValue
    ),
    relaxExplore: calculateMatch(userPreferences.cultureVsBeach || 50, restaurantValues.relaxationVsExploration || 50),
  };

  // Time of day matching (bonus points)
  const timeOfDay = getRestaurantTimeOfDay(restaurant);
  const userTimePreference = useRestaurantPrefs 
    ? (restaurantPrefs.mealTime || 'any')
    : (userPreferences.timeOfDayPreference === 'morning' ? 'breakfast' : 
       userPreferences.timeOfDayPreference === 'afternoon' ? 'lunch' : 
       userPreferences.timeOfDayPreference === 'evening' ? 'dinner' : 'any');
  let timeMatch = 50; // Default neutral
  if (userTimePreference === 'any' || timeOfDay === 'any') {
    timeMatch = 75; // Good match if either is flexible
  } else if (userTimePreference === timeOfDay) {
    timeMatch = 100; // Perfect match
  } else {
    timeMatch = 30; // Mismatch
  }

  // Price range matching (if restaurant preferences are set)
  let priceMatch = 50; // Default neutral
  if (useRestaurantPrefs && restaurantPrefs.priceRange && restaurantPrefs.priceRange !== 'any') {
    const restaurantPrice = restaurant.pricing?.priceRange || '';
    if (restaurantPrice.includes(restaurantPrefs.priceRange)) {
      priceMatch = 100; // Perfect match
    } else {
      // Check if it's close (e.g., $$ matches $$ or $)
      const priceLevels = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
      const userLevel = priceLevels[restaurantPrefs.priceRange] || 2;
      const restaurantLevel = restaurantPrice.includes('$$$$') ? 4 :
                              restaurantPrice.includes('$$$') ? 3 :
                              restaurantPrice.includes('$$') ? 2 : 1;
      const diff = Math.abs(userLevel - restaurantLevel);
      priceMatch = diff === 0 ? 100 : diff === 1 ? 70 : diff === 2 ? 40 : 20;
    }
  }

  // Features matching (bonus points for matching features)
  let featuresMatch = 50; // Default neutral
  if (useRestaurantPrefs && restaurantPrefs.features && restaurantPrefs.features.length > 0) {
    const restaurantFeatures = [];
    if (restaurant.outdoorSeating) restaurantFeatures.push('outdoor_seating');
    if (restaurant.liveMusic) restaurantFeatures.push('live_music');
    if (restaurant.allowsDogs) restaurantFeatures.push('dog_friendly');
    if (restaurant.goodForChildren) restaurantFeatures.push('family_friendly');
    if (restaurant.reservable) restaurantFeatures.push('reservations');

    const matchingFeatures = restaurantPrefs.features.filter(f => restaurantFeatures.includes(f));
    if (matchingFeatures.length > 0) {
      featuresMatch = Math.min(100, 50 + (matchingFeatures.length * 15)); // +15 per matching feature
    } else {
      featuresMatch = 30; // Lower score if no features match
    }
  }

  // Group size matching
  let groupSizeMatch = 50; // Default neutral
  if (useRestaurantPrefs && restaurantPrefs.groupSize && restaurantPrefs.groupSize !== 'any') {
    if (restaurantPrefs.groupSize === 'family' && restaurant.goodForChildren) {
      groupSizeMatch = 100;
    } else if (restaurantPrefs.groupSize === 'groups' && restaurant.goodForGroups) {
      groupSizeMatch = 100;
    } else if (restaurantPrefs.groupSize === 'couple' && !restaurant.goodForGroups && restaurant.reservable) {
      groupSizeMatch = 90; // More intimate
    } else if (restaurantPrefs.groupSize === 'solo' && !restaurant.goodForGroups) {
      groupSizeMatch = 85; // Solo-friendly
    } else {
      groupSizeMatch = 40; // Mismatch
    }
  }

  // Calculate weighted average
  // If using restaurant preferences, use fixed weights optimized for restaurant matching
  // Otherwise, give more weight to preferences that are far from 50 (strong preferences)
  let normalizedWeights;
  
  if (useRestaurantPrefs) {
    // Fixed weights for restaurant preferences (already normalized)
    normalizedWeights = {
      adventure: 0.1,
      structure: 0.1,
      food: 0.05,
      group: 0.05,
      budget: 0, // Replaced by price
      relaxExplore: 0, // Less relevant
      time: 0.15,
      price: 0.25,
      features: 0.15,
      groupSize: 0.15,
    };
  } else {
    // Dynamic weights based on preference strength (for tour preferences)
    const weights = {
      adventure: Math.abs((userPreferences.adventureLevel || 50) - 50) / 50, // 0-1
      structure: Math.abs((userPreferences.structurePreference || 50) - 50) / 50,
      food: Math.abs((userPreferences.foodAndDrinkInterest || 50) - 50) / 50,
      group: Math.abs((userPreferences.groupPreference || 50) - 50) / 50,
      budget: Math.abs((userPreferences.budgetComfort || 50) - 50) / 50,
      relaxExplore: Math.abs((userPreferences.cultureVsBeach || 50) - 50) / 50,
      time: 0.3, // Time of day gets fixed weight (less important than main preferences)
      price: 0,
      features: 0,
      groupSize: 0,
    };

    // Normalize weights (sum to 1)
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    normalizedWeights = totalWeight > 0 
      ? Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, v / totalWeight]))
      : Object.fromEntries(Object.keys(weights).map(k => [k, 1 / Object.keys(weights).length]));
  }

  // Calculate weighted average
  const overallScore = useRestaurantPrefs
    ? Math.round(
        matches.adventure * normalizedWeights.adventure +
        matches.structure * normalizedWeights.structure +
        matches.food * normalizedWeights.food +
        matches.group * normalizedWeights.group +
        matches.relaxExplore * normalizedWeights.relaxExplore +
        timeMatch * normalizedWeights.time +
        priceMatch * normalizedWeights.price +
        featuresMatch * normalizedWeights.features +
        groupSizeMatch * normalizedWeights.groupSize
      )
    : Math.round(
        matches.adventure * normalizedWeights.adventure +
        matches.structure * normalizedWeights.structure +
        matches.food * normalizedWeights.food +
        matches.group * normalizedWeights.group +
        matches.budget * normalizedWeights.budget +
        matches.relaxExplore * normalizedWeights.relaxExplore +
        timeMatch * normalizedWeights.time
      );

  // Optional: Atmosphere matching (Casual / Outdoor / Upscale)
  // This is intentionally lightweight & deterministic (no AI).
  let atmosphereMatch = null;
  if (useRestaurantPrefs && restaurantPrefs.atmosphere && restaurantPrefs.atmosphere !== 'any') {
    const pref = restaurantPrefs.atmosphere;
    const hasOutdoor = !!restaurant.outdoorSeating;
    const price = restaurant.pricing?.priceRange || '';
    const priceLabel = (restaurant.pricing?.priceRangeLabel || '').toLowerCase();
    const isUpscale =
      price.includes('$$$') ||
      price.includes('$$$$') ||
      priceLabel.includes('fine') ||
      priceLabel.includes('upscale') ||
      !!restaurant.reservable;
    const isCasual = !isUpscale;

    if (pref === 'outdoor') {
      atmosphereMatch = hasOutdoor ? 100 : 30;
    } else if (pref === 'upscale') {
      atmosphereMatch = isUpscale ? 100 : 40;
    } else if (pref === 'casual') {
      atmosphereMatch = isCasual ? 100 : 50;
    } else {
      atmosphereMatch = 75;
    }
  }

  // Generate match summary
  const getMatchLabel = (score) => {
    if (score >= 80) return 'Excellent match';
    if (score >= 65) return 'Strong match';
    if (score >= 50) return 'Good match';
    if (score >= 35) return 'Partial match';
    return 'Poor match';
  };

  // Generate pros and cons
  const pros = [];
  const cons = [];

  // Build matches object with all relevant scores FIRST (before using it)
  // When using restaurant preferences, prioritize restaurant-specific metrics
  const allMatches = {
    timeOfDay: timeMatch,
  };

  if (useRestaurantPrefs) {
    // Restaurant-specific matches (prioritize these)
    allMatches.priceRange = priceMatch;
    allMatches.features = featuresMatch;
    allMatches.groupSize = groupSizeMatch;
    allMatches.diningStyle = matches.structure; // Map structure to diningStyle for clarity
    allMatches.food = matches.food; // Food & drink is still relevant
    if (atmosphereMatch !== null) allMatches.atmosphere = atmosphereMatch;
  } else {
    // Fallback to tour preferences - include all matches (but still use restaurant-friendly labels)
    allMatches.structure = matches.structure; // Will be labeled as "Dining Style" in UI
    allMatches.food = matches.food;
    allMatches.group = matches.group; // Will be labeled as "Group Size" in UI
    allMatches.budget = matches.budget; // Will be labeled as "Price Range" in UI
    // Only include adventure and relaxExplore if they're significantly different from default
    if (Math.abs(matches.adventure - 50) > 10) {
      allMatches.adventure = matches.adventure;
    }
    if (Math.abs(matches.relaxExplore - 50) > 10) {
      allMatches.relaxExplore = matches.relaxExplore;
    }
  }

  // Only include restaurant-relevant matches in pros/cons
  const restaurantRelevantMatches = { ...matches };
  if (useRestaurantPrefs) {
    // When using restaurant preferences, exclude tour-oriented metrics from pros/cons
    delete restaurantRelevantMatches.adventure;
    delete restaurantRelevantMatches.relaxExplore;
    if (restaurantRelevantMatches.budget && allMatches.priceRange) {
      delete restaurantRelevantMatches.budget; // Use priceRange instead
    }
    if (restaurantRelevantMatches.group && allMatches.groupSize) {
      delete restaurantRelevantMatches.group; // Use groupSize instead
    }
  }

  Object.entries(restaurantRelevantMatches).forEach(([key, score]) => {
    const labels = {
      structure: 'Dining style',
      food: 'Food & drink focus',
      group: 'Group size',
      budget: 'Price range',
    };

    if (labels[key] && score >= 75) {
      pros.push(`${labels[key]} matches well (${score}%)`);
    } else if (labels[key] && score < 50) {
      cons.push(`${labels[key]} differs (${score}% match)`);
    }
  });

  // Add restaurant-specific matches to pros/cons
  if (useRestaurantPrefs) {
    if (priceMatch >= 75) {
      pros.push(`Price range matches your preference`);
    } else if (priceMatch < 50) {
      cons.push(`Price range may differ from your preference`);
    }

    if (featuresMatch >= 75) {
      const matchingFeatures = (restaurantPrefs.features || []).filter(f => {
        if (f === 'outdoor_seating' && restaurant.outdoorSeating) return true;
        if (f === 'live_music' && restaurant.liveMusic) return true;
        if (f === 'dog_friendly' && restaurant.allowsDogs) return true;
        if (f === 'family_friendly' && restaurant.goodForChildren) return true;
        if (f === 'reservations' && restaurant.reservable) return true;
        return false;
      });
      if (matchingFeatures.length > 0) {
        pros.push(`Has ${matchingFeatures.length} of your preferred feature${matchingFeatures.length > 1 ? 's' : ''}`);
      }
    }

    if (groupSizeMatch >= 75) {
      pros.push(`Group size preference matches`);
    } else if (groupSizeMatch < 50) {
      cons.push(`May not be ideal for your group size preference`);
    }
  }

  // Add time of day to pros/cons
  if (timeMatch >= 75) {
    pros.push(`Meal timing aligns (${timeOfDay})`);
  } else if (timeMatch < 50) {
    cons.push(`Meal timing may not align (restaurant focuses on ${timeOfDay})`);
  }

  // Add atmosphere to pros/cons (if set)
  if (atmosphereMatch !== null) {
    if (atmosphereMatch >= 75) {
      pros.push('Atmosphere matches what you prefer');
    } else if (atmosphereMatch < 50) {
      cons.push('Atmosphere may not match what you prefer');
    }
  }

  // If atmosphere preference is set, blend it into overall score as a small adjustment.
  // Keeps existing weights stable while still making the preference meaningful.
  const finalScore =
    atmosphereMatch !== null ? Math.max(0, Math.min(100, Math.round(overallScore * 0.9 + atmosphereMatch * 0.1))) : overallScore;

  return {
    matchScore: finalScore,
    fitSummary: `${getMatchLabel(finalScore)}: ${finalScore}% compatibility with your dining preferences.`,
    matches: allMatches,
    pros: pros.length > 0 ? pros : ['Overall good compatibility'],
    cons: cons.length > 0 ? cons : [],
    idealFor: finalScore >= 70 ? 'Your dining style' : 'Consider if other factors align',
    timeOfDay: timeOfDay,
  };
};

