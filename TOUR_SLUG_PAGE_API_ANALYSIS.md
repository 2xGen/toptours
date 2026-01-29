# `/tours/[...slug]` – API and data-fetch analysis

**Context:** ~60 human visitors site-wide, ~300K indexable tours, so most traffic is bots. This page is the main cost driver (107K requests, 53 min CPU in your 24h sample). This doc traces every API/backend call on request and flags duplicates and bot-safe optimizations.

---

## 1. Request flow (server-side only)

For each request to `/tours/[...slug]` (e.g. `/tours/123/sunset-cruise`):

1. **generateMetadata({ params })** runs (Next.js can run this in the same request as the page or in a separate pass).
2. **TourDetailPage** (default export) runs.

Client-side: **TourDetailClient** runs in the browser. Bots that don’t execute JS won’t run it; Googlebot does run JS, so some client effects may run for Google.

---

## 2. All server-side calls (in order)

### 2.1 generateMetadata

| # | Call | Source | What it hits | Notes |
|---|------|--------|--------------|--------|
| 1 | `getCachedTourData(productId)` | `app/tours/[...slug]/page.js` | **Supabase** `viator_cache` or **Viator** `GET /partner/products/{productId}` | Same function as in page (see below). |
| 2 | `getTourEnrichment(productId)` | same | **Supabase** `tour_enrichment` (or supabaseCache) | Used only for meta title/description. |

### 2.2 TourDetailPage (default export)

| # | Call | Source | What it hits | Notes |
|---|------|--------|--------------|--------|
| 3 | `getCachedTourData(productId)` | page.js | Same as #1 | **Duplicate of #1** unless Next dedupes `unstable_cache` across metadata + page. |
| 4 | `getCachedTourExtras(productId, tour)` | page.js | Runs **loadTourData** + **loadDestinationData** (see below). | |
| 5 | `generateTourFAQs(tour, tourData.tourEnrichment)` | page.js | In-memory only | No API. |
| 6 | `fetchSimilarToursServer(productId, tour, destinationData)` | page.js | **Supabase** similar_tours cache or **Viator** `POST /partner/search/freetext` | If cache miss = 1 Viator call. |
| 7 | `syncOperator(tour, productId)` | tourOperatorsCRM (fire-and-forget) | **Supabase** (CRM) | Non-blocking. |

### 2.3 Inside getCachedTourExtras → loadTourData(productId, tour)

| # | Call | What it hits | Notes |
|---|------|--------------|--------|
| 8 | `getFromPrice(productId)` | **Viator** `GET /partner/availability/schedules/{productId}` | **External.** |
| 9 | `getTourPromotionScore(productId)` | **Supabase** `tour_promotions` | |
| 10 | `getTourEnrichment(productId)` | **Supabase** `tour_enrichment` | **Duplicate of #2** (metadata already fetched enrichment). |
| 11 | `getTourOperatorPremiumSubscription(productId)` | **Supabase** | |
| 12 | `getCachedReviews(productId, currentReviewCount)` | **Supabase** `tour_reviews_cache` or **Viator** `POST /partner/reviews/product` | If cache miss/expired = 1 Viator call. |
| 13 | `getOperatorPremiumTourIds(productId)` (if premium) | **Supabase** | |
| 14 | `getOperatorAggregatedStats(...)` (if premium) | **Supabase** | |

### 2.4 Inside getCachedTourExtras → loadDestinationData(tour, productId)

| # | Call | What it hits | Notes |
|---|------|--------------|--------|
| 15 | `getDestinationNameById(destinationId)` | **Supabase** / lookup | |
| 16 | `getRestaurantCountsByDestination(destinationId)` | **Supabase** | |
| 17 | `getRestaurantsForDestinationFromDB(destinationId)` or FromStatic | **Supabase** or static data | |
| 18 | `getAllCategoryGuidesForDestination(destinationId)` | **Supabase** / DB | |
| 19 | `getViatorDestinationById(destinationId)` | **Supabase** (supabaseCache) | |

### 2.5 getCachedTourData (used in metadata + page)

| What it does | Hits |
|--------------|------|
| `getCachedTour(productId)` | **Supabase** `viator_cache` |
| If miss: `fetch(https://api.viator.com/partner/products/{productId})` | **Viator** |
| Then `cacheTour(productId, tour)` | **Supabase** write |

---

## 3. Summary: Viator (external) calls per request

| Call | When | Cache |
|------|------|--------|
| **GET /partner/products/{productId}** | getCachedTourData (Supabase miss) | Supabase + unstable_cache 7d |
| **GET /partner/availability/schedules/{productId}** | getFromPrice (every request inside loadTourData) | next.revalidate 3600 only – no Supabase cache for pricing |
| **POST /partner/reviews/product** | getCachedReviews (cache miss/expired) | Supabase tour_reviews_cache (7d) |
| **POST /partner/search/freetext** | fetchSimilarToursServer (cache miss) | Supabase similar_tours (24h) |

So in the **worst case** (all caches cold): **4 Viator calls per tour page**.  
**getFromPrice** is inside `getCachedTourExtras` (unstable_cache 7d per productId). So it runs only on the **first request per productId** (or after 7d revalidate). With 300K tours and 107K requests spread over many productIds, many requests are “first” for that productId → Viator schedules is still called often. Caching pricing in Supabase would reduce Viator calls further (shared across edge nodes and after eviction).

---

## 4. Duplicate / redundant calls

| Issue | Where | Impact |
|-------|--------|--------|
| **getCachedTourData(productId)** | Called in **generateMetadata** and again in **TourDetailPage**. Next.js may dedupe `unstable_cache` within the same request; if not, tour is fetched twice (Supabase read or Viator + cacheTour). | Possible 2x Supabase read or 2x Viator + 2x cacheTour. |
| **getTourEnrichment(productId)** | Called in **generateMetadata** (for meta title/description) and again in **loadTourData** (inside getCachedTourExtras). No shared request-level cache. | **2x Supabase** read per request for `tour_enrichment`. |
| **Pricing (getFromPrice)** | Viator `/availability/schedules/{productId}` on every request through loadTourData. Only Next.js fetch cache (1h), no Supabase. For 300K tours and bot traffic, cache hit rate per productId can be low → many Viator calls. | **High** for bot traffic (many unique productIds, cold cache). |

---

## 5. Client-side (TourDetailClient)

- **On load:** `supabase.auth.getUser()`, then optional `profiles` read for preferences. Only runs if JS runs (e.g. Googlebot).
- **On click only:** `/api/internal/tour-enrichment/${productId}` (POST), `/api/internal/tour-match/${productId}` (POST). Bots don’t click, so these are not driven by bot traffic.

---

## 6. Recommendations (SEO-safe, reduce cost)

### 6.1 Dedupe enrichment (easy, high value)

- **Problem:** getTourEnrichment is called in generateMetadata and again in loadTourData.
- **Fix:** Fetch enrichment once in the page, then pass it into metadata. Next.js App Router allows passing data from page to metadata by using the same data source in both and relying on a single call, or by moving metadata into the page and exporting a generated metadata object. Simpler approach: **remove getTourEnrichment from generateMetadata** and build meta title/description from **tour only** (title, destination from tour.destinations, etc.). Enrichment in metadata is “nice to have” for meta description; tour data is enough for SEO.  
- **Alternative:** Call getTourEnrichment once in the page, then pass the result into a custom layout or a shared context used by metadata (if your setup allows).  
- **Result:** One Supabase read for enrichment per request instead of two.

### 6.2 Cache pricing (getFromPrice) in Supabase

- **Problem:** getFromPrice calls Viator on every request (subject to Next.js 1h fetch cache). With 300K tours and bots, many productIds are cold → high Viator schedules volume.
- **Fix:** Cache pricing in Supabase (e.g. by productId, TTL e.g. 1h to match Viator rules). In loadTourData, read from Supabase first; only call Viator on cache miss, then write back. Same pattern as viator_cache for product.
- **Result:** Far fewer Viator `/availability/schedules/{productId}` calls; bot requests mostly hit Supabase.

### 6.3 Ensure getCachedTourData is deduped between metadata and page

- **Check:** In Next.js 14, calling `getCachedTourData(productId)` in both generateMetadata and the page may dedupe if they run in the same request (same unstable_cache key + args). Verify in logs or by adding a temporary counter.
- **If not deduped:** Refactor so tour is fetched once (e.g. in page only) and reuse the result for metadata (e.g. generateMetadata that reads from a shared cache key, or generate metadata inside the page and export it). That way you only call getCachedTourData once per request.

### 6.4 Optional: “lite” path for likely bots (advanced)

- **Idea:** Detect probable crawlers (e.g. via User-Agent) and serve a lighter server path: e.g. skip loadDestinationData (restaurants, category guides) and/or skip getFromPrice, and use tour’s basic pricing from product payload if available. Google still gets full HTML and core content (tour, similar tours, FAQs, schema).
- **Risk:** Some bots may not send a standard UA; you must not block or break Googlebot. A conservative approach is to only skip non-essential extras (restaurants, category guides) for known crawler UAs, and keep product + similar tours + FAQs + schema.
- **Result:** Fewer Supabase and Viator calls per bot request.

### 6.5 Keep similar tours and reviews cached

- fetchSimilarToursServer and getCachedReviews already use Supabase. Ensure cache TTLs and keys are tuned so that repeated bot hits to the same productId hit cache (reduces Viator search and reviews calls).

---

## 7. Per-request call count (current vs after fixes)

| Source | Viator (worst) | Viator (best) | Supabase (approx.) |
|--------|----------------|---------------|---------------------|
| **Current** | Up to 4 | 1 (pricing) | ~15–20 reads + writes |
| **After dedupe enrichment** | Same | Same | −1 read |
| **After pricing in Supabase** | Up to 3 | 0 | +1 read/write on miss |
| **After getCachedTourData dedupe** | Same | Same | −1 read (or −1 Viator if product was fetched twice) |

Biggest wins: **cache pricing in Supabase** (removes the “always possible” Viator call per request for schedules) and **dedupe getTourEnrichment** (removes redundant Supabase read). Together with canonical URLs and high cache hit rate, this should significantly reduce cost for bot-heavy traffic while keeping full SEO.
