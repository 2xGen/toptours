# Performance & SEO Analysis - Brainstorm Only

## 🔍 Dead Code & Unused APIs

### 1. Dead API Routes (Can Be Removed)
- ✅ `app/api/internal/plan-details/route.js` - Returns 404, travel plans removed
- ✅ `pages/api/internal/user-plans.js` - Returns empty array, travel plans removed
- ⚠️ `app/api/internal/promoted-tours/route.js` - **Check if still used** (profile page now queries DB directly)
- ⚠️ `app/api/internal/promotion/account/route.js` - Stub that returns null (kept for backward compatibility)

### 2. Old Promotion System APIs (Likely Unused)
**Location:** `pages/api/internal/promotion/`
- `spend.js` - Old boost point spending
- `spend-plan.js` - Old plan boost spending
- `restaurant-spend.js` - Old restaurant boost spending
- `restaurant-score.js` - Old restaurant boost score
- `tour-score.js` - Old tour boost score
- `plan-score.js` - Old plan boost score
- `recent-boosts.js` - Old boost history
- `leaderboard.js` - Old boost leaderboard
- `purchase-a-la-carte.js` - Might still be used? Check
- `subscribe.js` - Old promotion account subscription
- `cancel-subscription.js` - Old promotion account cancellation
- `sync-profile-plan.js` - Old plan sync
- `manual-update-subscription.js` - Old manual update

**Action:** Check if any of these are still called from frontend. If not, remove them.

### 3. Dead Code References (30 files still reference deleted tables)
**Tables removed but still referenced:**
- `promotion_accounts` - Still referenced in webhook, promotionSystem.js
- `tour_promotions` - Still referenced in webhook (try/catch blocks)
- `restaurant_promotions` - Still referenced in webhook (try/catch blocks)
- `plan_promotions` - Still referenced in promotionSystem.js
- `travel_plans` - Still referenced in promotionSystem.js
- `travel_plan_items` - Still referenced in promotionSystem.js

**Impact:** These are mostly in try/catch blocks or commented out, but still add to bundle size.

---

## ⚡ Performance Issues

### 1. Console Statements (824 instances across 64 files)
**Problem:** Production code has 824 console.log/error/warn statements
- Adds to bundle size
- Slows down execution
- Clutters browser console

**Solution:** 
- Use environment check: `if (process.env.NODE_ENV === 'development') console.log(...)`
- Or use a logging library that strips in production
- Or add build step to remove console statements

**Estimated Impact:** ~5-10KB bundle size reduction, slight performance improvement

### 2. Large Inline Script in Layout.js
**Problem:** ~100 lines of chunk error handling script in `app/layout.js`
- Adds to initial HTML size
- Executes on every page load
- Could be moved to external file or lazy loaded

**Solution:**
- Move to external file and load async
- Or only load on error (lazy load)
- Or simplify the error handling

**Estimated Impact:** ~2-3KB HTML size reduction

### 3. Multiple Database Queries on Page Load
**Found Issues:**
- Profile page: Multiple sequential queries (could be parallelized)
- Destination pages: Multiple API calls for promoted tours/restaurants
- Match-your-style: Fetches promoted tours/restaurants separately

**Solution:**
- Batch queries where possible
- Use Promise.all() for parallel queries
- Cache results more aggressively

**Estimated Impact:** 200-500ms faster page loads

### 4. Unnecessary Re-renders
**Potential Issues:**
- Many `useEffect` hooks without proper dependencies
- State updates causing cascading re-renders
- Large components that re-render entirely

**Solution:**
- Use React.memo() for expensive components
- Optimize useEffect dependencies
- Split large components into smaller ones

**Estimated Impact:** Smoother UI, less CPU usage

### 5. Image Optimization
**Current:** `images: { unoptimized: true }` in next.config.js
**Problem:** Images not optimized by Next.js
**Solution:** Enable Next.js image optimization (if hosting supports it)
**Estimated Impact:** 30-50% smaller image sizes, faster loads

### 6. Bundle Size
**Large Dependencies:**
- `framer-motion` - Animation library (could be lazy loaded)
- `@radix-ui/*` - Multiple UI components (tree-shaking should help)
- `react-helmet` - Might not be needed (Next.js has metadata API)

**Solution:**
- Lazy load animation libraries
- Check if react-helmet is still needed
- Audit bundle size with `next build --analyze`

**Estimated Impact:** 50-100KB bundle size reduction

---

## 🔍 SEO Improvements

### 1. Missing Metadata
**Pages that might need better metadata:**
- `/match-your-style` - No structured data for search results
- `/results` - No structured data
- `/tours/[productId]` - Check if has full Article schema
- `/destinations/[id]/restaurants/[restaurant]` - Check if has full schema

**Solution:**
- Add Article schema to tour pages
- Add LocalBusiness schema to restaurant pages
- Add BreadcrumbList schema to all pages

### 2. Sitemap
**Current:** `app/sitemap.js` exists
**Check:**
- Does it include all destination pages?
- Does it include all tour pages?
- Does it include all restaurant pages?
- Does it include travel guides?
- Is it auto-generated or manual?

**Solution:**
- Ensure all pages are in sitemap
- Add lastmod dates
- Add priority/change frequency

### 3. Structured Data
**Missing:**
- BreadcrumbList schema (helps with navigation in search)
- FAQPage schema on more pages (only some travel guides have it)
- Review/Rating schema for tours (if available)
- LocalBusiness schema for restaurants (full details)

**Solution:**
- Add BreadcrumbList to all pages
- Add Review schema where ratings exist
- Add LocalBusiness schema to restaurant pages

### 4. Page Speed
**Core Web Vitals:**
- LCP (Largest Contentful Paint) - Check if images are optimized
- FID (First Input Delay) - Check if JavaScript is blocking
- CLS (Cumulative Layout Shift) - Check if layout is stable

**Solution:**
- Optimize images (already mentioned)
- Defer non-critical JavaScript
- Preload critical resources
- Use font-display: swap for fonts

### 5. Mobile Optimization
**Check:**
- Are all pages mobile-friendly?
- Is touch interaction smooth?
- Are buttons large enough?
- Is text readable without zooming?

**Solution:**
- Test with Google Mobile-Friendly Test
- Ensure viewport meta tag is correct
- Test on real devices

---

## 📊 Database Query Optimization

### 1. N+1 Query Problems
**Potential Issues:**
- Fetching promoted tours one by one
- Fetching restaurant details one by one
- Fetching user preferences multiple times

**Solution:**
- Batch queries using `.in()` instead of multiple `.eq()`
- Use joins where possible
- Cache frequently accessed data

### 2. Missing Indexes
**Check:**
- Are there indexes on frequently queried columns?
- `promoted_tours.destination_id` - Has index?
- `promoted_restaurants.destination_id` - Has index?
- `tour_operator_subscriptions.user_id` - Has index?
- `restaurant_subscriptions.user_id` - Has index?

**Solution:**
- Add indexes on foreign keys
- Add indexes on frequently filtered columns
- Monitor slow queries in Supabase

### 3. Query Caching
**Current:** Memory cache exists for some data
**Improvements:**
- Extend cache TTL for rarely changing data
- Cache destination metadata (rarely changes)
- Cache tour enrichment data (changes infrequently)

---

## 🗑️ Code Cleanup Opportunities

### 1. Unused Imports
**Check:**
- Are all imports actually used?
- Are there unused utility functions?
- Are there unused components?

**Solution:**
- Run ESLint with unused import detection
- Remove unused code
- Use tree-shaking effectively

### 2. Duplicate Code
**Potential:**
- Similar query patterns repeated
- Similar API route structures
- Similar component logic

**Solution:**
- Extract common patterns to utilities
- Create reusable API route helpers
- Create reusable React hooks

### 3. Old File Structure
**Mixed:**
- Both `app/api` and `pages/api` exist
- Some routes in App Router, some in Pages Router

**Solution:**
- Migrate all routes to App Router (if possible)
- Consolidate API structure
- Remove Pages Router if not needed

---

## 🚀 Quick Wins (High Impact, Low Effort)

1. **Remove console statements** - 5-10KB bundle reduction
2. **Enable image optimization** - 30-50% smaller images
3. **Add database indexes** - Faster queries
4. **Remove dead API routes** - Cleaner codebase
5. **Add BreadcrumbList schema** - Better SEO
6. **Batch database queries** - Faster page loads
7. **Lazy load animations** - Smaller initial bundle
8. **Remove unused imports** - Smaller bundle

---

## 📈 Monitoring & Measurement

### Before Making Changes:
1. Measure current page load times
2. Measure current bundle sizes
3. Measure current database query counts
4. Run Lighthouse audit
5. Check Core Web Vitals

### After Making Changes:
1. Compare metrics
2. Monitor for regressions
3. A/B test if possible
4. Monitor user feedback

---

## ⚠️ Things That Are Probably Fine

1. **Caching strategy** - Already well implemented
2. **Static generation** - Already using SSG where appropriate
3. **API structure** - Generally well organized
4. **Component structure** - Generally good
5. **Error handling** - Generally good

---

## 🎯 Priority Recommendations

### High Priority (Do First):
1. Remove console statements in production
2. Add database indexes on foreign keys
3. Remove dead API routes
4. Enable image optimization
5. Add BreadcrumbList schema

### Medium Priority:
1. Batch database queries
2. Lazy load heavy dependencies
3. Optimize useEffect dependencies
4. Add missing structured data
5. Clean up unused imports

### Low Priority (Nice to Have):
1. Migrate all routes to App Router
2. Extract duplicate code
3. Simplify error handling script
4. Add more FAQ schemas
5. Optimize font loading

---

## 📝 Notes

- Most code is already well-optimized
- Main issues are dead code and console statements
- SEO is already quite good
- Performance is likely acceptable, but can be improved
- Focus on quick wins first, then measure impact

