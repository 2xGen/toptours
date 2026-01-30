# Cost savings estimate — changes implemented

**Reference:** Vercel Cost Investigation (Jan 29, 2025) and conversation changes.  
**Vercel snapshot (for unit costs):** 10.81M function invocations ≈ $6.60; 134h CPU ≈ $17.64; 11.42M Edge requests ≈ $3.31; 4.17M ISR reads ≈ $1.67.

---

## 1. Summary table

| Change | What was saved | Unit | Est. volume (per month) | Est. savings (per month) |
|--------|----------------|------|--------------------------|---------------------------|
| Operators page: no Viator, static CTA | Viator API + compute | API calls + invocations | ~moderate | **$5–20** (Vercel + Viator) |
| Legal pages: force-static | Compute per request | Function invocations + CPU | ~high (bots) | **$3–15** |
| Promotion scores removed (dest/tours/restaurants) | Supabase reads | DB reads | ~all dest/tour/restaurant pages | **$2–8** (Supabase) |
| Tour reviews: on demand | 1 Viator call per tour view | Viator API | ~tour page views (no click) | **$20–80** (Viator) |
| Tour promotion score removed | 1 Supabase read per tour | DB read | ~tour page views | **$1–5** (Supabase) |
| Tour similar tours: on demand | 1 Viator freetext per tour view | Viator API | ~tour page views (no click) | **$20–80** (Viator) |
| Tour restaurants removed | Restaurant count + list fetch | Supabase + static | ~tour page views | **$2–10** (Supabase) |
| **Total (conservative range)** | | | | **~$53–218 / month** |

*Viator and Supabase savings depend on your actual pricing and traffic; ranges are illustrative.*

---

## 2. Per-change detail

### 2.1 Operators page (`/destinations/[id]/operators`)

- **Before:** `headers()` made the route fully dynamic; every request ran server + internal Viator fetch for “top tours” (+ promotion scores if present).
- **After:** Single CTA “Browse all tours in [destination]” linking to `/destinations/[id]`; no Viator call, no dynamic server run (page can be cached).
- **Saved per request:** 1+ Viator API call(s), 1 function invocation, CPU time, origin transfer.
- **Volume:** Depends on operators page traffic (often moderate; bots and deep links).
- **Estimate:** **$5–20/month** (fewer invocations + less Viator usage).

---

### 2.2 Legal pages (terms, disclosure, cookie-policy)

- **Before:** “use client” + revalidate still triggered server-side render for initial HTML on many requests.
- **After:** `export const dynamic = 'force-static'` → built at deploy, served from CDN.
- **Saved per request:** 1 function invocation, CPU, origin transfer for every legal page view.
- **Volume:** Legal pages are hit often by bots and crawlers (high request count).
- **Estimate:** **$3–15/month** (from Vercel usage: ~\$0.61 per 1M invocations + CPU/transfer).

---

### 2.3 Promotion scores removed (destination/tours/restaurants)

- **Before:** `getPromotionScoresByDestination` and `getRestaurantPromotionScoresByDestination` on destination data load, destination tours page, destination restaurants page.
- **After:** No promotion-score fetch; components receive empty `promotionScores` / `restaurantPromotionScores`.
- **Saved per page load:** Multiple Supabase reads per destination/tours/restaurants request.
- **Volume:** Every destination hub, destination tours, destination restaurants view.
- **Estimate:** **$2–8/month** (Supabase read cost; exact $ depends on plan and read volume).

---

### 2.4 Tour detail: reviews on demand

- **Before:** Reviews fetched server-side on every tour page load (or from cache).
- **After:** Reviews only when user clicks “Load reviews” → client calls `/api/internal/tour-reviews/[productId]`.
- **Saved per tour page view (when user does not click):** 1 Viator reviews API call.
- **Volume:** 300k+ tour URLs; assume most views do not click “Load reviews” (e.g. 80–95%).
- **Estimate:** **$20–80/month** (Viator pricing × avoided calls; typically largest external API saving).

---

### 2.5 Tour detail: promotion score removed

- **Before:** `getTourPromotionScore(productId)` in TourDataLoader on every tour page.
- **After:** No call; default empty score object passed.
- **Saved per tour page load:** 1 Supabase read.
- **Volume:** Same as tour page views (high).
- **Estimate:** **$1–5/month** (Supabase).

---

### 2.6 Tour detail: similar tours on demand

- **Before:** 1 Viator freetext (similar tours) call per tour page load (or cache hit).
- **After:** Similar tours only when user clicks “Load similar tours” → client calls `/api/internal/similar-tours/[productId]`.
- **Saved per tour page view (when user does not click):** 1 Viator freetext API call.
- **Volume:** Same as tour pages; most users don’t click (e.g. 80–95%).
- **Estimate:** **$20–80/month** (Viator; same order as reviews).

---

### 2.7 Tour detail: no restaurants

- **Before:** Restaurant count + `getRestaurantsForDestinationWithLimit` (or full list) + static fallback per tour page.
- **After:** No restaurant fetch; optional “Restaurants in [destination]” link only when `destinationFeatures.hasRestaurants`.
- **Saved per tour page load:** Multiple Supabase reads (count + list) and/or static data work.
- **Volume:** Every tour page view.
- **Estimate:** **$2–10/month** (Supabase + less compute).

---

## 3. Total estimated savings

| Category | Low (conservative) | High (if traffic/API cost is high) |
|----------|--------------------|-------------------------------------|
| **Vercel** (invocations, CPU, transfer) | ~\$10–35 | ~\$35–50 |
| **Viator** (reviews + similar tours) | ~\$40–160 | ~\$100–200 |
| **Supabase** (promotion scores + tour score + restaurants) | ~\$5–23 | ~\$15–40 |
| **Total per month** | **~\$55–218** | **~\$150–290** |

- **Conservative total:** **~\$53–218/month** (round to **~\$50–220/month**).
- **Annualized (low):** **~\$600–2,600/year**.
- **Annualized (high):** **~\$1,800–3,500/year**.

Actual savings depend on:

- Real traffic to operators, legal, destination, and tour pages.
- Viator pricing per call (reviews + freetext).
- Supabase plan and per-read cost.
- Cache hit rates and how much tour traffic is crawlers vs users.

---

## 4. What was not changed (no cost impact)

- **Tour pricing (getFromPrice):** Still 1 Viator schedules call per tour page (kept for “from $X”).
- **Tour enrichment / operator premium / category guides / destination features:** Still fetched (kept for UX).
- **Restaurant listing page:** Promoted tours Viator calls still in place.
- **Explore [destination] in sticky nav:** UI only.
- **Guest Reviews / Viator note styling:** UI only.

---

## 5. File reference

- Operators: `app/destinations/[id]/operators/page.js`, `OperatorsListClient.jsx`
- Legal: `app/terms/layout.js`, `app/disclosure/layout.js`, `app/cookie-policy/layout.js`
- Promotion scores: `DestinationDataLoader.js`, `app/destinations/[id]/tours/page.js`, `app/destinations/[id]/restaurants/page.jsx`
- Tour reviews: `TourDataLoader.js`, `app/api/internal/tour-reviews/[productId]/route.js`, `TourDetailClient.jsx`
- Tour promotion score: `TourDataLoader.js`, `app/tours/[productId]/page.js`
- Tour similar tours: `app/tours/[productId]/page.js`, `app/api/internal/similar-tours/[productId]/route.js`, `TourDetailClient.jsx`
- Tour restaurants: `TourDataLoader.js`, `TourDetailClient.jsx`
- Savings doc: `TOUR_DETAIL_PAGE_API_SAVINGS.md`, `VERCEL_COST_INVESTIGATION.md`
