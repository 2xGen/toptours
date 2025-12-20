# Restaurant Cuisine Extraction - Cost & Time Analysis

## Problem
Most restaurants in the database have generic cuisines like `["Restaurant", "Food"]` instead of specific types like `["Seafood", "Caribbean"]` or `["Italian", "Pizza"]`. This breaks filtering for restaurant guides (especially "Best Seafood Restaurants").

## Solution
Use Gemini Flash Lite to analyze restaurant descriptions, reviews, and other text data to extract 2-3 specific cuisine types from a standardized list.

---

## Cost Analysis

### Gemini Flash Lite Pricing
- **Input:** $0.075 per 1M tokens
- **Output:** $0.30 per 1M output tokens

### Per Restaurant Estimate
- **Input tokens:** ~300-400 tokens (restaurant name, description, review summary)
- **Output tokens:** ~50-100 tokens (JSON array of 2-3 cuisine types)
- **Total tokens:** ~400-500 tokens per restaurant
- **Cost per restaurant:** ~$0.0001 (0.01 cents)

### Total Cost Estimates

| Restaurant Count | Estimated Cost |
|-----------------|----------------|
| 1,000 restaurants | $0.10 |
| 5,000 restaurants | $0.50 |
| 10,000 restaurants | $1.00 |
| 50,000 restaurants | $5.00 |
| 100,000 restaurants | $10.00 |

**Conclusion:** Extremely affordable! Processing 50k restaurants costs ~$5.

---

## Time Analysis

### Processing Speed
- **API call time:** ~200-500ms per restaurant (Gemini Flash Lite is fast)
- **Database update:** ~50ms per restaurant
- **Total per restaurant:** ~250-550ms
- **Rate limiting:** 100ms delay between requests (to be safe)
- **Total per restaurant:** ~350-650ms

### Time Estimates

| Restaurant Count | Estimated Time |
|-----------------|----------------|
| 100 restaurants | ~1-2 minutes |
| 1,000 restaurants | ~6-11 minutes |
| 5,000 restaurants | ~30-55 minutes |
| 10,000 restaurants | ~1-2 hours |
| 50,000 restaurants | ~5-9 hours |

**Processing Strategy:**
- Process in batches of 50-100 restaurants
- Can run overnight for full database
- Can process per destination for incremental updates

---

## Standardized Cuisine List

### 60+ Cuisine Types
- Seafood, Seafood Restaurant, Fish, Sushi, Japanese
- Italian, Pizza, Pasta
- Chinese, Thai, Indian, Korean, Vietnamese, Asian Fusion
- American, Steakhouse, BBQ, Burgers, Fast Food
- Mexican, Latin American, Caribbean, Cuban, Peruvian
- French, Mediterranean, Greek, Spanish, German, British
- Middle Eastern, Lebanese, Turkish
- Vegetarian, Vegan, Healthy, Organic
- Dessert, Ice Cream, Cafe, Coffee Shop, Bakery
- Bar, Pub, Wine Bar, Cocktail Bar, Brewery
- Breakfast, Brunch, Diner
- International, Fusion, Contemporary, Fine Dining, Casual Dining, Fast Casual

### Benefits
1. **Consistent filtering:** All guides use same cuisine types
2. **Better SEO:** Specific cuisines in content
3. **User experience:** More accurate restaurant matching
4. **Scalability:** Easy to add new cuisine types

---

## Implementation

### Script: `scripts/extract-restaurant-cuisines.js`

**Usage:**
```bash
# Process all restaurants (incremental, processes 50 at a time)
node scripts/extract-restaurant-cuisines.js

# Process specific destination
node scripts/extract-restaurant-cuisines.js aruba

# Process with limit (for testing)
node scripts/extract-restaurant-cuisines.js aruba 100
```

**Features:**
- ✅ Only processes restaurants with generic cuisines
- ✅ Skips restaurants that already have specific cuisines
- ✅ Batch processing (50 restaurants at a time)
- ✅ Rate limiting (100ms delay)
- ✅ Error handling and logging
- ✅ Cost tracking
- ✅ Progress reporting

---

## Quality Assurance

### Validation
1. **Standardization:** All cuisines mapped to standard list
2. **Minimum:** At least 1 cuisine per restaurant (fallback: "Restaurant")
3. **Maximum:** 3 cuisines per restaurant (most specific)
4. **Priority:** Specific cuisines over generic ones

### Examples

**Before:**
```json
{
  "name": "Barefoot Restaurant",
  "cuisines": ["Restaurant", "Food"]
}
```

**After:**
```json
{
  "name": "Barefoot Restaurant",
  "cuisines": ["Seafood", "Caribbean", "Fine Dining"]
}
```

**Before:**
```json
{
  "name": "Passions On The Beach",
  "cuisines": ["Restaurant", "Food"]
}
```

**After:**
```json
{
  "name": "Passions On The Beach",
  "cuisines": ["Seafood Restaurant", "Caribbean", "Fine Dining"]
}
```

---

## Next Steps

1. **Test on Aruba** (small batch):
   ```bash
   node scripts/extract-restaurant-cuisines.js aruba 50
   ```

2. **Verify results** in database

3. **Test restaurant guide filtering** (especially "Best Seafood Restaurants")

4. **Scale to all destinations**:
   ```bash
   node scripts/extract-restaurant-cuisines.js
   ```

5. **Monitor and refine** cuisine extraction based on results

---

## ROI

### Benefits
- ✅ Restaurant guides work correctly (especially seafood filter)
- ✅ Better user experience (accurate cuisine matching)
- ✅ Better SEO (specific cuisine keywords in content)
- ✅ Foundation for future cuisine-based features

### Cost
- **One-time:** ~$5-10 for 50k-100k restaurants
- **Ongoing:** ~$0.0001 per new restaurant

**Verdict:** Extremely high ROI for minimal cost!

