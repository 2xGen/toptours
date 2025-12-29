# Additional Match Scoring Enhancements

## Current Implementation Status

✅ **Implemented:**
1. Preference Alignment (45%) - tags, flags, duration
2. Quality Confidence (25%) - rating + review count
3. Price Comfort Fit (15%) - price matching
4. Convenience & Risk Reduction (10%) - flags
5. Intent Keyword Boost (5%) - title/description keywords
6. PRIVATE_TOUR flag → Group Size (automatic Private/Small)
7. Price-based profile adjustment (Budget/Luxury)

## Potential Enhancements

### 1. Itinerary Type Matching (High Impact, Easy)

**Available Data:**
- `itineraryType`: "ACTIVITY", "TOUR", "EXPERIENCE", etc.

**Enhancement:**
- Match `itineraryType` with user's structure preference
- "ACTIVITY" (guided) vs "TOUR" (self-guided) preferences
- Could add 2-3 points to preference alignment

**Implementation:**
```javascript
// In calculatePreferenceAlignment
if (tour.itineraryType === 'ACTIVITY' && userPrefs.guidance_score >= 70) {
  adjustment += 2; // User wants guided experiences
}
```

**Impact:** Medium (helps differentiate similar tours)

---

### 2. Duration Preference Matching (Medium Impact, Easy)

**Current:** Basic duration adjustment
**Enhancement:** More granular duration preferences

**Available Data:**
- `duration.fixedDurationInMinutes`

**Enhancement:**
- Add user preference for tour length (half-day vs full-day)
- Currently we infer from adventure level, but could be explicit
- Could add 1-2 points

**Implementation:**
```javascript
// If user has explicit duration preference
if (userPreferences.tourDurationPreference) {
  const hours = durationMinutes / 60;
  if (userPreferences.tourDurationPreference === 'half-day' && hours <= 4) {
    adjustment += 2;
  } else if (userPreferences.tourDurationPreference === 'full-day' && hours >= 6) {
    adjustment += 2;
  }
}
```

**Impact:** Low-Medium (requires new user preference field)

---

### 3. Review Distribution Quality (Low Impact, Medium Effort)

**Current:** Uses total reviews and average rating
**Enhancement:** Analyze review distribution (5-star vs 4-star ratio)

**Available Data:**
- `reviews.reviewCountTotals` (if available)

**Enhancement:**
- Tours with 90%+ 5-star reviews = higher quality signal
- Tours with mixed reviews = lower confidence
- Could adjust quality confidence by ±2 points

**Impact:** Low (marginal improvement over current system)

---

### 4. Destination Price Normalization (High Impact, Medium Effort)

**Current:** Uses absolute price ($50-150 = moderate)
**Enhancement:** Normalize by destination (Aruba vs Bali have different price ranges)

**Implementation:**
- Calculate median price for destination
- Adjust price ranges based on destination median
- Example: $200 in Aruba might be "moderate" but $200 in Bali is "luxury"

**Impact:** High (more accurate for expensive destinations)

**Complexity:** Medium (requires destination price data)

---

### 5. Special Feature Flags (Medium Impact, Easy)

**Available Flags:**
- `FREE_CANCELLATION` ✅ (already used)
- `INSTANT_CONFIRMATION` ✅ (already used)
- `PRIVATE_TOUR` ✅ (already used)
- `MOBILE_TICKET` (not used)
- `SKIP_THE_LINE` (not used)
- `WHEELCHAIR_ACCESSIBLE` (not used)

**Enhancement:**
- `MOBILE_TICKET` → +1 point (convenience)
- `SKIP_THE_LINE` → +1 point (time-saver)
- `WHEELCHAIR_ACCESSIBLE` → +1 point (if user has accessibility needs)

**Impact:** Low-Medium (nice-to-have features)

---

### 6. Category/Theme Matching (Medium Impact, Medium Effort)

**Available Data:**
- Tour tags (already used)
- Could extract category from tags or title

**Enhancement:**
- If user frequently clicks on "water sports" tours → boost water sports
- If user frequently clicks on "cultural" tours → boost cultural
- Requires tracking user behavior

**Impact:** Medium (personalization based on behavior)

**Complexity:** High (requires user behavior tracking)

---

### 7. Time-of-Day Preference (Low Impact, Easy)

**Available Data:**
- Tour might have time slots (morning, afternoon, evening)

**Enhancement:**
- Match with user's time preference (if available)
- Morning person vs night owl
- Could add 1-2 points

**Impact:** Low (requires tour time data + user preference)

---

### 8. Family-Friendly Detection (Medium Impact, Easy)

**Enhancement:**
- Detect "family-friendly" from title/description keywords
- Match with user's group type (family vs couple vs solo)
- Could add 2-3 points

**Keywords:**
- "family", "kids", "children", "all ages"

**Impact:** Medium (helps families find suitable tours)

---

### 9. Eco-Friendly/Local Boost (Low Impact, Easy)

**Current:** Basic keyword matching
**Enhancement:**
- More sophisticated detection
- Could add 1-2 points for values-aligned travelers

**Impact:** Low (nice-to-have)

---

### 10. Operator Reputation (Medium Impact, Medium Effort)

**Available Data:**
- Operator name (from tour data)
- Could track operator ratings across all their tours

**Enhancement:**
- Calculate average operator rating
- Tours from highly-rated operators get +1-2 points
- Requires operator data aggregation

**Impact:** Medium (trust signal)

**Complexity:** Medium (requires operator data)

---

## Recommended Priority

### Quick Wins (Implement Now)
1. ✅ **Itinerary Type Matching** - Easy, adds 2-3 points
2. ✅ **Special Feature Flags** - Easy, adds 1-2 points
3. ✅ **Family-Friendly Detection** - Easy, adds 2-3 points

### Medium Priority (Consider Later)
4. **Destination Price Normalization** - High impact but requires data
5. **Category/Theme Matching** - Requires behavior tracking

### Low Priority (Nice-to-Have)
6. **Review Distribution** - Marginal improvement
7. **Time-of-Day Preference** - Requires more data
8. **Operator Reputation** - Requires aggregation

---

## Implementation Example

### Itinerary Type + Special Features

```javascript
function calculatePreferenceAlignment(tour, tourProfile, userPrefs) {
  // ... existing code ...
  
  // Itinerary Type Adjustment
  let itineraryAdjustment = 0;
  if (tour.itineraryType === 'ACTIVITY' && userPrefs.guidance_score >= 70) {
    itineraryAdjustment += 2; // User wants guided activities
  } else if (tour.itineraryType === 'TOUR' && userPrefs.guidance_score <= 30) {
    itineraryAdjustment += 2; // User prefers self-guided
  }
  
  // Special Feature Flags
  const flags = (tour.flags || []).map(f => typeof f === 'string' ? f.toUpperCase() : String(f).toUpperCase());
  let featureAdjustment = 0;
  
  if (flags.includes('MOBILE_TICKET')) {
    featureAdjustment += 1; // Convenience
  }
  if (flags.includes('SKIP_THE_LINE')) {
    featureAdjustment += 1; // Time-saver
  }
  if (flags.includes('WHEELCHAIR_ACCESSIBLE')) {
    // Could check if user has accessibility needs (if tracked)
    featureAdjustment += 1;
  }
  
  // Family-Friendly Detection
  const title = (tour.title || '').toLowerCase();
  const description = (tour.description || '').toLowerCase();
  const combinedText = `${title} ${description}`;
  
  const isFamilyFriendly = combinedText.includes('family') ||
                           combinedText.includes('kids') ||
                           combinedText.includes('children') ||
                           combinedText.includes('all ages');
  
  let familyAdjustment = 0;
  if (isFamilyFriendly) {
    // If user's group preference suggests family (could infer from group size preference)
    const groupPref = userPrefs.group_intimacy_score || 50;
    // Families often prefer moderate group sizes (40-60 range)
    if (groupPref >= 40 && groupPref <= 60) {
      familyAdjustment += 2;
    }
  }
  
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
```

---

## Summary

**Best Next Steps:**
1. ✅ **Itinerary Type Matching** (+2-3 points) - Easy win
2. ✅ **Special Feature Flags** (+1-2 points) - Easy win
3. ✅ **Family-Friendly Detection** (+2-3 points) - Easy win

**Total Potential Improvement:** +5-8 points to preference alignment (45% weight = +2-4 points to final score)

**Estimated Development Time:** 1-2 hours

**Impact:** Medium (helps differentiate similar tours, especially for families and guided vs self-guided preferences)

