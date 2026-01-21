# Tour Page API Calls - Final Count

## Server-Side API Calls (During Page Render)

### 1. **Product API** ✅
- **Endpoint**: `GET https://api.viator.com/partner/products/{productId}?currency=USD`
- **When**: Every page load (if not in cache)
- **Cache**: 24 hours (Next.js `unstable_cache` + Supabase)
- **Status**: **1 API call** (if cache miss)

### 2. **Pricing API** ✅
- **Endpoint**: `GET https://api.viator.com/partner/availability/schedules/{productId}`
- **When**: Every page load (via `loadTourData`)
- **Cache**: 24 hours (Next.js `unstable_cache`)
- **Status**: **1 API call** (if cache miss)

### 3. **Reviews API** ✅ (Conditional)
- **Endpoint**: `POST https://api.viator.com/partner/reviews/product`
- **When**: Only if:
  - Cache doesn't exist OR
  - Cache expired (7 days) OR
  - Review count changed
- **Cache**: 7 days (Supabase `tour_reviews_cache`)
- **Status**: **0-1 API call** (conditional - only if review count changed)

---

## Client-Side API Calls (After Page Loads - Lazy)

### 4. **Similar Tours API** ✅
- **Route**: `POST /api/tours/similar`
- **Viator Endpoint**: `POST https://api.viator.com/partner/search/freetext`
- **When**: Only if server didn't provide data AND user scrolls near section
- **Cache**: 24 hours (Supabase + HTTP cache)
- **Returns**: 12 tours with full data (no additional calls needed)
- **Status**: **1 API call** (if cache miss and user scrolls)

---

## Total API Calls Per Page Load

### Worst Case (All Cache Misses):
- Product API: **1 call**
- Pricing API: **1 call**
- Reviews API: **1 call** (if review count changed)
- Similar Tours API: **1 call** (if user scrolls)
- **Total: 3-4 API calls**

### Best Case (All Cached):
- Product API: **0 calls** (cached)
- Pricing API: **0 calls** (cached)
- Reviews API: **0 calls** (cached, review count unchanged)
- Similar Tours API: **0 calls** (cached OR user doesn't scroll)
- **Total: 0 API calls**

### Typical Case (With 24h Cache):
- Product API: **0 calls** (cached)
- Pricing API: **0 calls** (cached)
- Reviews API: **0 calls** (cached, review count unchanged)
- Similar Tours API: **0 calls** (cached OR server provided data)
- **Total: 0-1 API calls** (only if user scrolls and cache miss)

---

## Comparison to Before

### Before Optimization:
- Product API: 1 call
- Pricing API: 1 call
- Similar Tours API: 1 call
- Recommended Tours API: 1 call (recommendations)
- Recommended Tours Products: 6 calls (individual products)
- Reviews API: 0-1 call
- **Total: 10-11 API calls** (worst case)

### After Optimization:
- Product API: 1 call
- Pricing API: 1 call
- Similar Tours API: 1 call (returns 12 tours with full data)
- Reviews API: 0-1 call
- **Total: 3-4 API calls** (worst case)

**Reduction: ~70% fewer API calls** 🎉

---

## With 24h Cache (Real-World)

During Google crawl (100K+ pages):
- **Most pages**: 0 API calls (all cached)
- **Some pages**: 1-2 API calls (cache miss on Product or Pricing)
- **Rare**: 3-4 API calls (complete cache miss)

**Expected average**: ~0.5-1 API call per page during crawl

---

## Summary

✅ **Reviews API**: Yes, just 1 call (conditional - only if review count changed or cache expired)
✅ **Total API calls**: 3-4 calls (worst case), 0-1 calls (typical with cache)
✅ **70% reduction** from original implementation
