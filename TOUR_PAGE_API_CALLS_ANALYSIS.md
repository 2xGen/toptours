# Tour Page API Calls Analysis

## Overview
When a single tour page is opened (e.g., `/tours/63772P166`), here are ALL the API calls being made:

---

## 🔴 SERVER-SIDE API CALLS (During Page Render)

### 1. **Viator Product API** (CRITICAL - Always Called)
- **Endpoint**: `GET https://api.viator.com/partner/products/{productId}?currency=USD`
- **When**: Every page load (if not in cache)
- **Cache**: 
  - Next.js `unstable_cache`: 24 hours
  - Supabase `viator_cache` table: Permanent (until manually cleared)
  - Fetch cache: 1 hour
- **Cost Impact**: ⚠️ **HIGH** - This is called on EVERY uncached page load
- **Status**: ✅ Cached, but cache miss = expensive API call

### 2. **Viator Pricing API** (CRITICAL - Always Called)
- **Endpoint**: `GET https://api.viator.com/partner/availability/schedules/{productId}`
- **When**: Every page load (via `loadTourData`)
- **Cache**: 
  - Next.js `unstable_cache`: 24 hours
  - Fetch cache: 1 hour
- **Cost Impact**: ⚠️ **HIGH** - Called on every uncached page load
- **Status**: ✅ Cached, but cache miss = expensive API call

### 3. **Viator Reviews API** (CONDITIONAL - Only if reviews changed)
- **Endpoint**: `POST https://api.viator.com/partner/reviews/product`
- **When**: Only if review count changed since last cache
- **Cache**: Supabase `tour_reviews_cache` table: 7 days
- **Cost Impact**: ⚠️ **MEDIUM** - Only called when review count changes
- **Status**: ✅ Well cached (weekly refresh)

### 4. **Viator Similar Tours Search API** (CONDITIONAL - Server-side Suspense)
- **Endpoint**: `POST https://api.viator.com/partner/search/freetext`
- **When**: If not in cache (via `SimilarToursSection` Suspense component)
- **Cache**: Supabase `viator_cache` table: 6 hours
- **Cost Impact**: ⚠️ **HIGH** - Called on every uncached page load
- **Status**: ⚠️ **PROBLEM**: This runs server-side in Suspense, so it blocks page render if cache miss

### 5. **Viator Recommendations API** (CONDITIONAL - Server-side Suspense)
- **Endpoint**: `POST https://api.viator.com/partner/products/recommendations`
- **When**: If not in cache (via `RecommendedToursSection` Suspense component)
- **Cache**: Supabase `viator_cache` table: 6 hours
- **Cost Impact**: ⚠️ **HIGH** - Called on every uncached page load
- **Status**: ⚠️ **PROBLEM**: This runs server-side in Suspense, so it blocks page render if cache miss

### 6. **Supabase Database Queries** (Multiple - Low Cost)
- **Queries**:
  - `viator_cache` table (check for tour, recommendations, similar tours)
  - `tour_reviews_cache` table (check for reviews)
  - `tour_enrichment` table (check for AI-generated content)
  - `viator_destinations` table (destination lookup)
  - `restaurants` table (restaurant data)
  - `category_guides` table (travel guides)
  - `promotion_scores` table (promotion data)
- **Cost Impact**: ✅ **LOW** - Supabase queries are cheap
- **Status**: ✅ These are necessary and cheap

---

## 🟡 CLIENT-SIDE API CALLS (After Page Loads)

### 7. **Recommended Tours API Route** (CONDITIONAL - Client-side)
- **Route**: `POST /api/tours/recommendations`
- **When**: Client-side fetch in `TourDetailClient.jsx` (line 359)
- **Cache**: HTTP cache header: 1 hour (`s-maxage=3600`)
- **Cost Impact**: ⚠️ **MEDIUM** - This calls Viator API if cache miss
- **Status**: ⚠️ **DUPLICATE**: This is ALSO called server-side in Suspense!

### 8. **Similar Tours API Route** (CONDITIONAL - Client-side)
- **Route**: `POST /api/tours/similar`
- **When**: Client-side fetch in `TourDetailClient.jsx` (line 366)
- **Cache**: HTTP cache header: 1 hour (`s-maxage=3600`)
- **Cost Impact**: ⚠️ **MEDIUM** - This calls Viator API if cache miss
- **Status**: ⚠️ **DUPLICATE**: This is ALSO called server-side in Suspense!

### 9. **Tour Enrichment API Route** (CONDITIONAL - Client-side)
- **Route**: `GET /api/internal/tour-enrichment/{productId}`
- **When**: Client-side fetch in `TourDetailClient.jsx` (line 568)
- **Cost Impact**: ✅ **LOW** - Just reads from Supabase
- **Status**: ✅ This is fine (just database lookup)

### 10. **Tour Match API Route** (CONDITIONAL - Client-side, 2x)
- **Route**: `GET /api/internal/tour-match/{productId}`
- **When**: Client-side fetch in `TourDetailClient.jsx` (lines 1726, 1875)
- **Cost Impact**: ✅ **LOW** - Just reads from Supabase
- **Status**: ⚠️ **DUPLICATE**: Called twice for same productId

---

## 🚨 CRITICAL ISSUES IDENTIFIED

### Issue #1: **DUPLICATE API CALLS**
- **Similar Tours**: Called BOTH server-side (Suspense) AND client-side
- **Recommended Tours**: Called BOTH server-side (Suspense) AND client-side
- **Impact**: **2x API calls** for the same data = **2x cost**

### Issue #2: **NO CACHE HIT FOR GOOGLEBOT**
- When Google crawls 100K+ pages, most are cache misses
- Each cache miss = **5 Viator API calls**:
  1. Product API
  2. Pricing API (schedules)
  3. Similar Tours API (search/freetext)
  4. Recommendations API
  5. Reviews API (if review count changed)
- **Impact**: 100K pages × 5 API calls = **500K API calls** = **$5/day**

### Issue #3: **SUSPENSE BLOCKS RENDER**
- `SimilarToursSection` and `RecommendedToursSection` use Suspense
- If cache miss, they block page render while fetching from Viator API
- **Impact**: Slow page loads + expensive API calls

### Issue #4: **CLIENT-SIDE DUPLICATE CALLS**
- Tour Match API called **twice** for same productId
- **Impact**: Unnecessary database queries

---

## 💰 COST BREAKDOWN (Per Page Load - Cache Miss)

### Viator API Calls (Most Expensive):
1. Product API: **1 call**
2. Pricing API: **1 call**
3. Similar Tours API: **1 call** (server-side Suspense)
4. Recommendations API: **1 call** (server-side Suspense)
5. Reviews API: **0-1 call** (only if review count changed)
6. Similar Tours API: **1 call** (client-side - DUPLICATE!)
7. Recommendations API: **1 call** (client-side - DUPLICATE!)

**Total Viator API Calls per cache miss: 6-7 calls**

### Supabase Queries (Cheap):
- Multiple database lookups: **~10-15 queries** (cheap, not the issue)

---

## ✅ RECOMMENDED FIXES

### Fix #1: Remove Client-Side Duplicate Calls
- Remove client-side `/api/tours/recommendations` and `/api/tours/similar` calls
- Use server-side Suspense data only
- **Savings**: **2 API calls per page** = **~40% reduction**

### Fix #2: Make Similar/Recommended Tours Truly Optional
- Don't block page render with Suspense
- Load them client-side AFTER page loads (lazy load)
- **Savings**: Faster page loads + fewer API calls during Google crawl

### Fix #3: Increase Cache Times for Googlebot
- Similar Tours: 6 hours → **24 hours**
- Recommendations: 6 hours → **24 hours**
- **Savings**: Fewer cache misses during Google crawl

### Fix #4: Remove Duplicate Tour Match Calls
- Cache the result client-side to avoid calling twice
- **Savings**: 1 database query per page

### Fix #5: Pre-warm Cache for Popular Tours
- Pre-fetch and cache top 10K tours
- **Savings**: Googlebot hits cache instead of API

---

## 📊 EXPECTED SAVINGS

**Current**: ~6-7 Viator API calls per cache miss
**After Fixes**: ~2-3 Viator API calls per cache miss

**Reduction**: **~60-70% fewer API calls**

**Monthly Cost Impact**:
- Current: ~$150/month (100K pages × 6 calls × $0.00025 per call)
- After: ~$45-60/month
- **Savings: ~$90-105/month**

---

## 🎯 PRIORITY FIXES

1. **HIGH PRIORITY**: Remove duplicate client-side API calls (#1)
2. **HIGH PRIORITY**: Make similar/recommended tours lazy load (#2)
3. **MEDIUM PRIORITY**: Increase cache times (#3)
4. **LOW PRIORITY**: Remove duplicate tour match calls (#4)
5. **LOW PRIORITY**: Pre-warm cache (#5)
