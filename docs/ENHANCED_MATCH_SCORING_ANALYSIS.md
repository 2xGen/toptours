# Enhanced Match Scoring Analysis
## Based on Actual Viator API Response (Aruba - Destination ID 28)

## API Response Structure

From the test API call, here's what we get from Viator's `/products/search` endpoint:

```json
{
  "productCode": "194448P3",
  "title": "Private snorkel with 2 stops in Aruba - Eco-friendly!",
  "description": "On this completely private snorkel tour...",
  "reviews": {
    "combinedAverageRating": 5,
    "totalReviews": 240,
    "sources": [
      {
        "provider": "VIATOR",
        "totalCount": 34,
        "averageRating": 5
      },
      {
        "provider": "TRIPADVISOR",
        "totalCount": 206,
        "averageRating": 5
      }
    ]
  },
  "pricing": {
    "summary": {
      "fromPrice": 148.73,
      "fromPriceBeforeDiscount": 148.73
    },
    "currency": "USD"
  },
  "duration": {
    "fixedDurationInMinutes": 180
  },
  "tags": [367654, 11912, 21442, 21592, 21972],
  "flags": ["FREE_CANCELLATION", "PRIVATE_TOUR"],
  "confirmationType": "INSTANT"
}
```

---

## Current Match Scoring (Tag-Based Only)

**Current Formula:**
```javascript
const tagMatchScore = calculateMatchScore(tourProfile, userPreferences); // 0-100
// tourProfile is calculated from tags only
```

**Limitations:**
- Only uses `tags` array (5 tag IDs in example)
- Ignores rating, price, title, duration, flags
- May recommend low-rated or expensive tours if tags match

---

## Enhanced Match Scoring (Multi-Factor)

### Proposed Formula

```javascript
// Base match score from tags (current system - 60% weight)
const tagMatchScore = calculateMatchScore(tourProfile, userPreferences);

// Additional factors (40% total weight)
const ratingBoost = calculateRatingBoost(tour.reviews); // 0-20 points (20% weight)
const priceMatch = calculatePriceMatch(tour.pricing, userPreferences.budgetComfort); // 0-15 points (15% weight)
const titleRelevance = calculateTitleRelevance(tour.title, userPreferences); // 0-5 points (5% weight)

// Final score = weighted combination
const finalScore = Math.min(100, Math.round(
  tagMatchScore * 0.60 +      // Tags still primary (60%)
  ratingBoost * 0.20 +         // High ratings boost (20%)
  priceMatch * 0.15 +          // Price alignment (15%)
  titleRelevance * 0.05        // Title keywords (5%)
));
```

---

## Implementation Details

### 1. Rating Boost Function

**Available Data:**
- `reviews.combinedAverageRating`: 5.0 (0-5 scale)
- `reviews.totalReviews`: 240

**Formula:**
```javascript
function calculateRatingBoost(reviews) {
  if (!reviews?.combinedAverageRating) return 0;
  
  const rating = reviews.combinedAverageRating; // 0-5 scale
  const reviewCount = reviews.totalReviews || 0;
  
  // Convert 0-5 scale to 0-20 points
  // 4.0 = 10 points, 4.5 = 15 points, 5.0 = 20 points
  let boost = (rating - 4.0) * 20; // 4.0 = 0, 5.0 = 20
  
  // Cap at 20
  boost = Math.min(20, Math.max(0, boost));
  
  // Bonus for high review count (trust signal)
  // 100+ reviews = +2, 500+ reviews = +3, 1000+ reviews = +4
  if (reviewCount >= 1000) boost += 4;
  else if (reviewCount >= 500) boost += 3;
  else if (reviewCount >= 100) boost += 2;
  
  // Cap at 20 total
  return Math.min(20, boost);
}
```

**Example:**
- Rating 5.0, 240 reviews → 20 points (max boost)
- Rating 4.5, 50 reviews → 12 points
- Rating 4.0, 10 reviews → 0 points (no boost)

---

### 2. Price Match Function

**Available Data:**
- `pricing.summary.fromPrice`: 148.73 USD
- User preference: `budgetComfort` (25/50/75/85)

**Formula:**
```javascript
function calculatePriceMatch(pricing, userBudgetComfort) {
  if (!pricing?.summary?.fromPrice) return 0;
  
  const price = pricing.summary.fromPrice;
  
  // Map user budget preference to price ranges
  // 25 = Budget ($0-50), 50 = Moderate ($50-150), 75 = Comfortable ($150-300), 85 = Luxury ($300+)
  const budgetRanges = {
    25: { min: 0, max: 50, ideal: 25 },
    50: { min: 25, max: 150, ideal: 75 },
    75: { min: 100, max: 300, ideal: 200 },
    85: { min: 250, max: 10000, ideal: 500 }
  };
  
  const range = budgetRanges[userBudgetComfort] || budgetRanges[50];
  
  // Calculate match score (0-15 points)
  let match = 0;
  
  if (price >= range.min && price <= range.max) {
    // Within range - calculate distance from ideal
    const distanceFromIdeal = Math.abs(price - range.ideal);
    const rangeSize = range.max - range.min;
    const matchPercent = 1 - (distanceFromIdeal / rangeSize);
    match = Math.round(matchPercent * 15);
  } else if (price < range.min) {
    // Below range - partial credit (cheaper is usually okay)
    match = Math.round((price / range.min) * 10);
  } else {
    // Above range - minimal credit (too expensive)
    match = Math.round((range.max / price) * 5);
  }
  
  return Math.min(15, Math.max(0, match));
}
```

**Example:**
- Price: $148.73
- User budget: 50 (Moderate $50-150)
  - Within range, ideal is $75
  - Distance from ideal: $73.73
  - Match: ~12 points
- User budget: 25 (Budget $0-50)
  - Above range
  - Match: ~3 points (too expensive)

---

### 3. Title Relevance Function

**Available Data:**
- `title`: "Private snorkel with 2 stops in Aruba - Eco-friendly!"

**Formula:**
```javascript
function calculateTitleRelevance(title, userPreferences) {
  if (!title) return 0;
  
  const titleLower = title.toLowerCase();
  let relevance = 0;
  
  // Adventure keywords
  const adventureKeywords = ['adventure', 'extreme', 'thrilling', 'exciting', 'action'];
  const relaxedKeywords = ['relaxing', 'leisurely', 'peaceful', 'calm', 'gentle'];
  
  // Group size keywords
  const privateKeywords = ['private', 'exclusive', 'personalized'];
  const groupKeywords = ['group', 'shared', 'small group'];
  
  // Match adventure level
  if (userPreferences.adventureLevel >= 70) {
    // High adventure - look for adventure keywords
    if (adventureKeywords.some(kw => titleLower.includes(kw))) {
      relevance += 3;
    }
  } else if (userPreferences.adventureLevel <= 30) {
    // Low adventure - look for relaxed keywords
    if (relaxedKeywords.some(kw => titleLower.includes(kw))) {
      relevance += 3;
    }
  }
  
  // Match group preference
  if (userPreferences.groupPreference >= 70) {
    // Prefers small groups - look for private keywords
    if (privateKeywords.some(kw => titleLower.includes(kw))) {
      relevance += 2;
    }
  } else if (userPreferences.groupPreference <= 30) {
    // Prefers groups - look for group keywords
    if (groupKeywords.some(kw => titleLower.includes(kw))) {
      relevance += 2;
    }
  }
  
  return Math.min(5, relevance);
}
```

**Example:**
- Title: "Private snorkel with 2 stops in Aruba - Eco-friendly!"
- User: adventureLevel=60, groupPreference=80 (prefers small groups)
  - "private" keyword matches → +2 points
  - Total: 2 points

---

### 4. Duration Matching (Optional Enhancement)

**Available Data:**
- `duration.fixedDurationInMinutes`: 180 (3 hours)

**Formula:**
```javascript
function calculateDurationMatch(duration, userPreferences) {
  if (!duration?.fixedDurationInMinutes) return 0;
  
  const minutes = duration.fixedDurationInMinutes;
  const hours = minutes / 60;
  
  // Map to preferences (if user has time preference)
  // Half-day (2-4 hours) vs Full-day (6+ hours) vs Multi-day
  // This is optional - can be added later if needed
  
  return 0; // Placeholder
}
```

---

### 5. Flags Matching (Optional Enhancement)

**Available Data:**
- `flags`: ["FREE_CANCELLATION", "PRIVATE_TOUR"]
- `confirmationType`: "INSTANT"

**Potential Use:**
- `INSTANT_CONFIRMATION` → +1 point (convenience)
- `FREE_CANCELLATION` → +1 point (flexibility)
- `PRIVATE_TOUR` → Already handled by tags, but can double-check

---

## Example Calculation

**Tour Data:**
- Title: "Private snorkel with 2 stops in Aruba - Eco-friendly!"
- Rating: 5.0 (240 reviews)
- Price: $148.73
- Tags: [367654, 11912, 21442, 21592, 21972]
- Duration: 180 minutes (3 hours)
- Flags: ["FREE_CANCELLATION", "PRIVATE_TOUR"]

**User Preferences:**
- adventureLevel: 60
- budgetComfort: 50 (Moderate)
- groupPreference: 80 (Prefers small groups)

**Calculation:**
1. **Tag Match Score:** 75 (from existing system)
2. **Rating Boost:** 20 points (5.0 rating, 240 reviews)
3. **Price Match:** 12 points ($148.73 within $50-150 range, close to ideal $75)
4. **Title Relevance:** 2 points ("private" keyword matches group preference)

**Final Score:**
```
75 * 0.60 + 20 * 0.20 + 12 * 0.15 + 2 * 0.05
= 45 + 4 + 1.8 + 0.1
= 50.9 → 51%
```

**Wait, that's lower than the tag score!** This is because:
- The tag score (75) is already high
- The rating boost (20) is maxed out
- Price match (12) is good but not perfect
- Title relevance (2) is minimal

**Better Example (High Match):**
- Tag Match: 90
- Rating Boost: 20
- Price Match: 15 (perfect match)
- Title Relevance: 5

**Final Score:**
```
90 * 0.60 + 20 * 0.20 + 15 * 0.15 + 5 * 0.05
= 54 + 4 + 2.25 + 0.25
= 60.5 → 61%
```

**Actually, wait - the formula needs adjustment!** The rating boost and price match should be **additive bonuses**, not replacements. Let me revise:

---

## Revised Formula (Additive Bonuses)

```javascript
// Base match score from tags (0-100)
const tagMatchScore = calculateMatchScore(tourProfile, userPreferences);

// Additional bonuses (additive, capped at 100)
const ratingBoost = calculateRatingBoost(tour.reviews); // 0-20 points
const priceMatch = calculatePriceMatch(tour.pricing, userPreferences.budgetComfort); // 0-15 points
const titleRelevance = calculateTitleRelevance(tour.title, userPreferences); // 0-5 points

// Final score = base + bonuses (capped at 100)
const finalScore = Math.min(100, Math.round(
  tagMatchScore + 
  ratingBoost + 
  priceMatch + 
  titleRelevance
));
```

**Example:**
- Tag Match: 75
- Rating Boost: +20
- Price Match: +12
- Title Relevance: +2

**Final Score:** 75 + 20 + 12 + 2 = **109 → 100%** (capped)

This makes more sense! High-rated, well-priced tours get boosted above tag-only scores.

---

## Implementation Priority

1. ✅ **Rating Boost** (highest impact, easiest to implement)
2. ✅ **Price Match** (high impact, straightforward)
3. ✅ **Title Relevance** (low impact, but easy to add)
4. ⚠️ **Duration Match** (optional, can add later)
5. ⚠️ **Flags Match** (optional, minimal impact)

---

## Testing Strategy

1. **A/B Test:**
   - 50% users get tag-only scores
   - 50% users get enhanced scores
   - Compare click-through rates

2. **User Feedback:**
   - "Was this recommendation helpful?" (thumbs up/down)
   - Track which factors correlate with satisfaction

3. **Tuning:**
   - Adjust rating boost formula based on data
   - Refine price ranges based on user behavior
   - Add/remove title keywords based on effectiveness

---

## Conclusion

**Enhanced match scoring will:**
- ✅ Improve accuracy (incorporates rating, price, title)
- ✅ Boost high-quality tours (5-star ratings get bonus)
- ✅ Better price alignment (matches user budget)
- ✅ No additional API calls (data already in response)
- ✅ Fast calculation (pure math, no AI needed)

**Estimated Development Time:** 2-3 days
**Estimated Impact:** High (better recommendations = more bookings)

