# Dead Code Cleanup Summary

## Tables Removed (Confirmed by User)
- ✅ `plan_promotions`
- ✅ `restaurant_promotions` 
- ✅ `tour_promotions`
- ✅ `travel_plan_items`
- ✅ `travel_plans`
- ✅ `promotions` (empty)

## Code Cleanup Needed

### 1. `src/lib/promotionSystem.js`
**Functions to remove/comment:**
- `getRecentBoosts()` - references `restaurant_promotions`, `plan_promotions`
- `spendPointsOnRestaurant()` - references `restaurant_promotions`
- `updateRestaurantMetadata()` - references `restaurant_promotions`
- `getRestaurantPromotionScore()` - references `restaurant_promotions`
- `spendPointsOnPlan()` - references `travel_plans`, `plan_promotions`
- `getPlanPromotionScoresByDestination()` - references `travel_plans`
- `getPlanPromotionScore()` - references `travel_plans`
- All functions that query `tour_promotions` (old boost system)

**Functions to keep (still used):**
- `getPromotedToursByDestination()` - uses `promoted_tours` ✅
- `getPromotedRestaurantsByDestination()` - uses `promoted_restaurants` ✅
- `getTourPromotionScore()` - might still be used, check
- `getRestaurantPromotionScore()` - might still be used, check

### 2. `app/api/webhooks/stripe/route.js`
**Lines to update:**
- Line 317: Query `restaurant_promotions` for restaurant name → Get from `restaurants` table instead
- Line 376: Query `tour_promotions` for tour name → Get from tour cache/API instead

### 3. `app/api/internal/plan-details/route.js`
**Action:** Remove or return 404 (travel plans feature removed)

### 4. `pages/api/internal/user-plans.js`
**Action:** Remove or return empty array (travel plans feature removed)

### 5. `app/profile/page.js`
**Action:** Remove travel plans loading (lines 344-367)

### 6. `src/lib/travelPlans.js`
**Action:** Comment out entire file or remove (travel plans feature removed)

---

## Performance Impact

### Will This Make the Site Faster?

**YES, but minimal impact:**

1. **Reduced Code Size:**
   - Smaller bundle size (less JavaScript to load)
   - Faster compilation/build times
   - Less code to parse/execute

2. **Reduced Database Queries:**
   - No more queries to deleted tables
   - Fewer failed queries (which still take time)
   - Cleaner error logs

3. **Reduced Memory:**
   - Less code in memory
   - Fewer function definitions

**However:**
- Most of this code wasn't being called anyway (dead code)
- The main benefit is **cleaner codebase** and **preventing future errors**
- Actual performance gain will be **minimal** (< 1% improvement)

**Main Benefits:**
- ✅ Cleaner codebase
- ✅ No more errors from querying deleted tables
- ✅ Easier to maintain
- ✅ Smaller bundle size
- ⚠️ Minimal performance improvement (but still worth it!)

---

## Cleanup Steps

1. Remove dead functions from `promotionSystem.js`
2. Update webhook to get names from correct tables
3. Remove/disable travel plans API routes
4. Remove travel plans from profile page
5. Comment out or remove `travelPlans.js` file

