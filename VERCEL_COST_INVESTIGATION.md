# Vercel Cost Investigation – Internal Report (Jan 29, 2025)

**Scope:** Why spend increased from ~$2/day (until Jan 12) to ~$6/day and why "Edge Requests" appeared as a new cost (~3 days ago). No code changes in this doc; findings and recommendations only.

---

## 1. Cost snapshot (your data)

| Product | Usage | Charge |
|--------|--------|--------|
| Edge Requests | 11.42M / 10M | $3.31 |
| Edge Requests – Additional CPU | 43 min | $0.26 |
| **Vercel Functions** | | |
| Fluid Active CPU | 134 hours | $17.64 |
| Fast Origin Transfer | 218 GB | $13.86 |
| Fluid Provisioned Memory | 1.11K GB Hrs | $11.82 |
| Function Invocations | 10.81M | $6.60 |
| **Content / caching** | | |
| Image Optimization Transformation | 90.18K | $4.71 |
| ISR Reads | 4.17M | $1.67 |
| ISR Writes | 303.83K | $1.22 |
| **Total (before credits)** | | **$62.59** |

Main cost drivers: **Function invocations + CPU**, **Fast Origin Transfer**, **Edge Requests**. (Image Optimization is intentionally disabled and ignored for this report.)

---

## 2. Root causes

### 2.1 Routes with 0% cache hit (biggest impact)

From your “Edge Requests” / “Compute” breakdown:

- **`/tours/[...slug]`** – **107K** requests, **0%** cache, **53 min** CPU  
  - Single largest consumer of compute.
- **`/destinations/[id]/guides/[category]`** – **14K**, **0%** cache, **7 min** CPU  
- **`/destinations/[id]/tours`** – **11K**, **0%** cache, **6 min** CPU  
- **`/destinations/[id]`** – **12K**, **0%** cache, **6 min** CPU  
- **`/tours/[productId]`** – **7.1K**, **0%** cache, **4 min** CPU  

These routes have `revalidate = 604800` and use `unstable_cache` / Supabase where applicable, but **Full Route Cache (ISR) hit rate is 0%**. So every request runs the serverless function and produces origin transfer.

**Why 0% cache on `/tours/[...slug]` in particular**

1. **URL fragmentation**  
   - Same tour can be reached as:
     - `/tours/{productId}` (e.g. `/tours/123`)
     - `/tours/{productId}/{slug}` (e.g. `/tours/123/sunset-cruise`)
   - In App Router, **each distinct path is a separate cache entry**. So:
     - `/tours/123` and `/tours/123/sunset-cruise` are two different cached pages.
     - Internal links use different patterns (e.g. `tours/${productId}/${slug}` vs `tours/${productId}`), so the same tour is requested under multiple URLs.
   - With 107K requests spread over many productIds and slug variants, most requests are “first request” for that exact URL → **0% hit rate** even though data is cached in Supabase/`unstable_cache`.

2. **No `generateStaticParams` for `[...slug]`**  
   - Nothing is pre-rendered at build; every URL is **on-demand**. First request = full render + cache fill; if the same URL is rarely requested again, you still pay for the first render and see low hit rate.

3. **Traffic mix**  
   - If a large share is crawlers or external links with varying slugs/query params, you get more unique URLs and fewer repeats → low cache hit.

**Conclusion:** The main cost spike is not “caching is broken” but **too many unique URLs per tour** and **on-demand-only** rendering, so the Full Route Cache is almost never reused.

---

### 2.2 `headers()` forcing dynamic (operators page)

**File:** `app/destinations/[id]/operators/page.js` (around 365–369)

```js
const headersList = await headers();
const host = headersList.get('host') || 'localhost:3000';
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const baseUrl = `${protocol}://${host}`;
// ...
const toursResponse = await fetch(`${baseUrl}/api/internal/viator-search`, { ... });
```

- In Next.js App Router, **using `headers()` (or `cookies()`) in a page/layout opts that segment out of static/ISR** → the route is **fully dynamic**.
- So **every** request to `/destinations/[id]/operators` runs the server and triggers the internal `viator-search` call. No Full Route Cache.
- Your data: operators-related traffic is in the “Compute” list; even if volume is moderate, this pattern is unnecessary and easy to fix (use env-based URL instead of `headers()`).

**Impact:** Unnecessary function invocations + origin transfer for all operators page views.

---

### 2.3 `force-dynamic` on high-traffic or heavy routes

These are explicitly dynamic; every request runs the function:

| Route | Your data (approx.) | Note |
|-------|----------------------|------|
| `app/results/page.js` | Results/search | `export const dynamic = 'force-dynamic'` – search results always dynamic. |
| `app/destinations/[id]/restaurants/guides/[category]/page.js` | Restaurant guides | `export const dynamic = 'force-dynamic'` – DB-driven, could be ISR with revalidate. |
| `app/match-your-style/ai-match/page.js` | AI match | `force-dynamic` – form page, likely acceptable. |
| `app/match-your-style/personal-match/page.js` | Personal match | Same. |

For **results** and **restaurant guides**, consider whether they can be ISR with a revalidate (e.g. 1h–24h) instead of `force-dynamic` to reduce invocations and origin transfer.

---

### 2.4 Edge Requests (new line item ~3 days ago)

- **11.42M Edge Requests** (over 10M included) → **$3.31**.
- Your **middleware** (`middleware.js`) runs on the **Edge** and its matcher is:
  - **Included:** all paths **except** `_next/static`, `_next/image`, `favicon.ico`, and static image extensions.
- So **every** non-static request (HTML pages, API, etc.) hits the Edge once → that’s one “Edge Request” per request.
- Likely explanations for “new” Edge cost:
  1. **Vercel started itemizing Edge separately** (same traffic, new line item).
  2. **Traffic growth** (more requests → more Edge invocations).
  3. **No change in middleware** – it was always running; you’re now paying for it explicitly.

So Edge cost is tied to **total request volume** and **middleware running on almost every request**.

---

### 2.5 Image Optimization

**Ignored for this report.** Image optimization was previously enabled but disabled (`unoptimized: true`) because it increased costs.
No further action on this line item.


---

### 2.6 Internal API usage (viator-search, page-views)

- **`/api/internal/viator-search`** – **4.1K** invocations, **0%** cache.  
  - Used by server components (e.g. operators, destination tours) via `fetch(..., { next: { revalidate: 86400 } })`.  
  - **POST** route; response is not cached at HTTP/CDN level. So every call from the server runs the function.  
  - When the **calling page** is dynamic (e.g. operators because of `headers()`), that page runs on every request and re-calls viator-search → more invocations and origin transfer.

- **`/api/internal/page-views`** – **186** invocations (from your compute list).  
  - Called from **PageViewTracker** (client) on navigation.  
  - Volume is modest but adds to function count; consider batching or sampling if you need to reduce further.

---

### 2.7 Fast Origin Transfer (218 GB)

- This is **data transferred from your serverless (origin) to the Edge**.
- Every time a **dynamic** page is rendered, the full HTML (and any server-rendered payload) is sent from the function to the edge.
- So **high origin transfer** is a direct consequence of:
  - **High function invocations** (many dynamic pages).
  - **0% cache hit** on the heaviest routes (tours, destinations, guides).
  - **Large HTML payloads** (e.g. tour/destination pages with a lot of content).

Reducing **dynamic renders** (better cache hit, fewer `force-dynamic` / `headers()` pages) will reduce both **Function Invocations / CPU** and **Fast Origin Transfer**.

---

## 3. Summary: why cost went up

1. **Full Route Cache rarely used** on the biggest routes because:
   - **Many unique URLs per tour** (`/tours/123` vs `/tours/123/slug`) and no canonical URL strategy.
   - **On-demand only** for `/tours/[...slug]` (no `generateStaticParams`).
2. **Operators page** is forced dynamic by `headers()`, so every view runs the function and calls viator-search.
3. **Explicit `force-dynamic`** on results and restaurant guides increases invocations and origin transfer.
4. **Edge Requests** are now billed separately; middleware runs on almost every request, so total requests ≈ Edge count.

---

## 4. Recommendations (no code in this doc – implementation separate)

### High impact (do first)

1. **Canonical URL for tour pages**
   - Pick **one** URL shape per tour (e.g. always `/tours/{productId}` or always `/tours/{productId}/{canonical-slug}`).
   - **Redirect** all other variants (e.g. wrong slug, missing slug) to that canonical URL (301).
   - Use the **same** canonical URL in internal links, sitemaps, and structured data.
   - Effect: Fewer unique paths → same tour requested under one URL → much higher Full Route Cache hit rate for `/tours/[...slug]` and lower function + origin cost.

2. **Remove `headers()` from operators page**
   - Replace `headers().get('host')` + protocol with a **fixed base URL** from env (e.g. `process.env.VERCEL_URL` or `NEXT_PUBLIC_VERCEL_URL` / `NEXT_PUBLIC_SITE_URL`).
   - Effect: Operators page can be cached (ISR); fewer invocations and fewer viator-search calls.

### Medium impact

3. **Narrow middleware**
   - Run middleware only where needed (e.g. **www → non-www** redirect). Exclude more static or high-volume paths if they don’t need redirects.
   - Effect: Fewer Edge invocations; some requests won’t count as “Edge Requests.”

4. **ISR instead of force-dynamic where possible**
   - **Results page:** If acceptable for product, use `revalidate = 3600` (or similar) instead of `force-dynamic` so repeated searches can be served from cache.
   - **Restaurant guides** (`destinations/[id]/restaurants/guides/[category]`): If content is not user-specific, use `revalidate = 86400` (or 3600) instead of `force-dynamic` so pages can be cached.

5. **Pre-render popular tour URLs (optional)**
   - Add **`generateStaticParams`** for `/tours/[...slug]` for a **subset** of productIds (e.g. top 1K–5K from sitemap or analytics) so their first view is a cache fill at build time, not on-demand.
   - Effect: Fewer cold on-demand renders for popular tours; better cache hit for those URLs.

### Lower impact / monitoring

6. **Page view tracking**
   - If you need to cut cost further: batch or sample client-side page-view calls to `/api/internal/page-views` (e.g. 1 request per N navigations or per session).

7. **Monitor after changes**
   - After canonical URL + operators fix: watch **Function Invocations**, **Fluid Active CPU**, **Fast Origin Transfer**, and **Edge Requests** in Vercel for 3–7 days to confirm the drop.

---

## 5. Expected direction of savings

- **Canonical tour URL + redirects:** Large reduction in invocations and CPU for `/tours/[...slug]` (your single biggest cost) and corresponding drop in Fast Origin Transfer.
- **Operators page no longer dynamic:** Fewer invocations and viator-search calls for every operators page view.
- **Middleware narrowed:** Direct reduction in Edge Request count.
- **ISR for results/restaurant guides:** Fewer invocations and origin transfer for those routes.

Implementing the high-impact items first should move you back toward the previous ~$2/day range, with Edge and Functions both lower. This document is for investigation and planning only; no code has been changed.

---

## 6. Viator API compliance and efficiency

Viator allows **two models** (cannot be used at the same time):

1. **Ingestion model** – `/products/modified-since` (and availability) at least hourly; **do not** call `/products/{product-code}` in real-time; serve product pages only from ingested data.
2. **Real-time search model** – `/products/search` and `/search/freetext` for search; `/products/{product-code}` **only** for the single product the customer selected from search. **Results can be cached for maximum 1 hour.**

You are using the **real-time search model**. Below: compliance gaps, then options for a more efficient approach.

### 6.1 Current usage vs Viator rules

| Area | Viator rule | Your current | Compliant? |
|------|-------------|--------------|------------|
| **Single product** `/products/{product-code}` | Cache max **1 hour** | `viatorCache.js` CACHE_TTL_HOURS = **24**; Next.js `unstable_cache` revalidate **7 days** | **No** – exceeds 1h |
| **Search** `/products/search` | Results cache max **1 hour** | API response `s-maxage=1800` (30 min) ✓; server-side fetch `next: { revalidate: 86400 }` (24h) in many pages | **No** – server reuses search result 24h |
| **Similar tours** `/search/freetext` | Results cache max **1 hour** | `viatorCache.js` SIMILAR_TOURS_CACHE_TTL_HOURS = **24**; fetch `next: { revalidate: 86400 }` | **No** – exceeds 1h |
| **Pagination** | Max 50 per request; next page only when user asks | `perPage = 48`, `start` from request | **Yes** |
| **Don’t pull all on init** | Don’t request all products from each destination when user initiates search | First page only (e.g. 48) per destination/search | **Yes** |

So the main compliance issue is **cache TTL**: product, search, and similar-tours data are cached longer than 1 hour. Aligning with the 1h max reduces risk of errors or service impact.

### 6.2 Option A: Stay on real-time model, align cache to 1 hour

- **Single product:** In `src/lib/viatorCache.js`, set `CACHE_TTL_HOURS = 1`. For Next.js, set `revalidate` for tour data to **3600** (1h) where it represents Viator-sourced data (or keep longer for **page** revalidate but ensure the **data** layer – Supabase + any fetch cache – respects 1h).
- **Search:** Keep API `s-maxage=1800` or reduce to `s-maxage=3600`; change all server-side fetches to viator-search from `next: { revalidate: 86400 }` to **`next: { revalidate: 3600 }`** (1h).
- **Similar tours:** In `viatorCache.js` set `SIMILAR_TOURS_CACHE_TTL_HOURS = 1`; in `fetchSimilarTours.js` use `next: { revalidate: 3600 }`.

**Trade-off:** More cache misses and more Viator (and your) API/function invocations, but **compliant** and no change of model.

### 6.3 Option B: Move to ingestion model (most efficient for cost and API use)

Under the **ingestion model**:

- You run a **background job** (e.g. every 15–20 min, or hourly) that calls:
  - `/products/modified-since` (with **cursor**, not only modified-since) to ingest product content.
  - Optionally `/availability/schedules/modified-since` for availability/pricing if you need it.
- You store results in **Supabase** (or your own DB).
- **Tour detail pages** (`/tours/[...slug]`, `/tours/[productId]`): serve **only** from ingested data – **no** real-time `/products/{product-code}`.
- **Search / destination listing:** Build search and “tours for destination” from **ingested** data (your DB). Only call `/products/search` or `/search/freetext` when the user **explicitly** runs a search (e.g. query or filters), and cache that response max 1 hour.
- **Pagination:** Still only request the next page when the user moves to the next page (max 50 per call) if you do call the search endpoint.

**Benefits:**

- **Far fewer real-time Viator calls** – no per–tour-page product call, no search call per destination page load (if served from ingested data).
- **Lower Vercel cost** – fewer server-side Viator calls and fewer viator-search invocations; tour pages can be fully static/ISR from your DB.
- **Fully compliant** with the ingestion column of Viator’s table (no real-time `/products/{product-code}`; search only when user searches, cache 1h).

**Costs:**

- Implement and run the ingestion pipeline (cursor-based sync, error handling, backfill).
- Product data is at most ~15–20 min (or 1h) old; availability can be same or separate job. For many affiliates this is acceptable.

**Does the site become more static? Would it decrease website costs?**

- **Ingestion = scheduled job, not on page load.** Option B means a **background job** (cron every 15–20 min or hourly) that calls Viator `/products/modified-since` with cursor and writes to Supabase. You do **not** ingest on each page load – that would be real-time per request and would increase cost. Ingestion is batch sync on a schedule; then all page views read only from your DB.

- **Yes, the site becomes more static (cacheable).** Tour detail pages would read **only** from Supabase (ingested data). No Viator call during the request. So each request is fast (DB read only), and Next.js can cache the rendered HTML (ISR / Full Route Cache). Same for destination/tours listing if you serve from ingested data: no viator-search call per page load, so those pages too become cacheable. Result: many requests are served from cache (no or minimal function run), fewer requests hit a “heavy” path (external API + big JSON).

- **Yes, it would decrease website costs.** (1) **Fewer heavy invocations** – no Viator fetch per tour or destination page, so less CPU and duration per request. (2) **Higher cache hit rate** – with canonical URLs and DB-only reads, the same URL is served from cache repeatedly, so function invocations for tour/destination routes drop. (3) **Less Fast Origin Transfer** – fewer dynamic renders, so less HTML sent from origin to edge. So Option B (hourly or 15–20 min ingestion, pages read from DB only) makes the site more static and reduces Vercel cost; “on page load” ingestion would do the opposite and is not what Option B describes.

### 6.4 Recommendation

- **Short term:** Apply **Option A** so cache TTLs match Viator’s 1h rule and you stay compliant without changing architecture.
- **Medium term:** Evaluate **Option B** (ingestion) to cut Viator usage and Vercel cost; your existing Supabase + `viator_cache`–style tables are a good base for storing ingested products and wiring tour pages to DB-only reads.

---

## 7. Tour sitemap tracking and page-view tracker (advice only)

### 7.1 Tour sitemap tracking (add-to-DB on page load)

**What it does:** On every tour detail page load (`/tours/[productId]`, `/tours/[...slug]`) the server calls `trackTourForSitemap(productId, tour, destinationData)`. On every destination detail, destination/tours, and guides/[category] page load it calls `trackToursForSitemap(tours, destination)` (batches of up to 100 Supabase RPCs per page). Both fire-and-forget async; they call Supabase `upsert_tour_sitemap` to add/update entries in the `tour_sitemap` table. The sitemap XML (`/sitemap-tours/[index]`) is generated by **reading** from that table (280k+ entries).

**Does it add function invocations?** **No.** The tracking runs **inside** the same serverless function that is already rendering the page. It does **not** create extra HTTP requests or extra function invocations. The same request that renders the tour/destination/guides page also runs the tracking.

**What it does cost:**  
- **Extra CPU/duration** per invocation for those routes (async Supabase RPCs – 1 per tour page, many per destination/tours/guide page in batches of 100). More work per request → higher Fluid Active CPU and possibly memory.  
- **Supabase write load** (upsert on every relevant page view).

**If you deactivate it:**  
- You do **not** reduce the **number** of function invocations (same number of page requests).  
- You **do** reduce CPU/duration per invocation for tour, destination, tours, and guides pages, and you reduce Supabase writes.  
- The sitemap **generation** (reading from `tour_sitemap`) still works with the **existing** ~280k rows; you just stop adding new ones. 280k tours is more than enough for Google; freezing the list is reasonable.

**Status:** Tour sitemap tracking has been **turned off** (calls to `trackTourForSitemap` and `trackToursForSitemap` removed from tour detail, destination, destination/tours, and guides/[category] pages). Sitemap generation still reads from the existing ~280k rows in `tour_sitemap`.

**Cost estimate (savings from turning off):**  
- **Vercel:** Tracking added ~1 Supabase RPC per tour page and up to ~100 RPCs per destination/tours/guide page (batches). That’s extra CPU/duration per request on your heaviest routes. From your 24h data those routes used ~76 min CPU total (~147K requests). Assuming tracking was ~5–12% of work per request, you save on the order of **4–9 min CPU per day** → at Vercel’s Fluid pricing (~$17.64 per 134 hours) that’s about **$0.01–0.02/day** or **~$0.30–0.60/month** from CPU. No change in function **count** (same page requests).  
- **Supabase:** You eliminate **~150K+ upserts per day** (one per tour page view, plus batch upserts on destination/tours/guides). Exact $ savings depend on your plan (free tier write limits vs paid).  
- **Overall:** Roughly **$0.50–1.50/month** combined (Vercel CPU + possible Supabase savings). Small but non‑zero; main benefit is less load on heaviest routes and no ongoing sitemap DB writes.

### 7.2 Page-view tracker

**What it does:** The client component `PageViewTracker` runs on every client-side navigation (pathname change). It sends one **POST** request to `/api/internal/page-views` per navigation (with path, productId, destinationId, sessionId, etc.). So each "page view" in the SPA = one API route invocation.

**Does it take a lot of functions?** **No.** In your compute breakdown you had **186** invocations for `/api/internal/page-views` in the measured window. Total function invocations were **10.81M**. So page-view tracker is on the order of **0.002%** of invocations – negligible.

**Advice:** Page-view tracker is **not** a meaningful cost driver. Leave it as is unless you want to trim every possible call (e.g. batch or sample); no need to change it for cost reasons.

---

## 8. Link prefetch and bot traffic (advice only)

**What you added (~Jan 12):** Next.js `<Link prefetch={true}>` (and/or similar “pre page load”) so that when a user clicks or navigates, the next page opens faster. In the codebase, **prefetch={true}** is used on many links: navigation (/, /tours, /destinations, /auth), destination links, **tour cards** (TourCard, SimilarToursList, RecommendedToursList), and destination-detail links (tours, restaurants, guides).

**How Next.js prefetch works:** In the App Router, prefetch is triggered when a `<Link>` **enters the viewport** (on initial load or scroll). So every link that is visible on the page can trigger a prefetch request. For dynamic routes (e.g. `/tours/[...slug]`), prefetch behavior depends on config; with a `loading.js` present (you have one for tours), Next.js may still request RSC payloads for those routes when links are in view.

**Did this increase costs?** **Very likely, yes.**  
- **Humans:** One page load, then prefetch runs for links in view (e.g. nav + a few cards). When they click, the next page is fast. Limited extra requests per visit.  
- **Bots (e.g. Googlebot):** They execute JS and “see” the full page. So when a bot loads **one** tour page, every `<Link>` in view (nav, 12 similar tours, destination links, etc.) can trigger a **prefetch**. That means **one bot visit to a tour page can generate 15–30+ prefetch requests** (each potentially hitting your server / edge). With ~300K indexable tour pages and crawlers hitting them, that multiplies request volume: e.g. 1M crawler “page views” could become 15M–30M+ requests if most links prefetch. So the **pre page load / prefetch** change is a strong candidate for the cost spike around Jan 12, especially with bot-heavy traffic.

**Recommendation (advice only, no code change):**  
- **Option A:** Set **prefetch={false}** on links that point to **high-cost dynamic routes** (e.g. tour detail links in SimilarToursList, RecommendedToursList, TourCard). Keep prefetch for low-cost or static routes (e.g. nav to /, /tours, /destinations) if you want. That keeps UX for real users (they still get fast nav for main nav) while cutting the huge multiplier from bots prefetching every tour link on every page.  
- **Option B:** Keep prefetch only on **hover** (e.g. custom Link wrapper that calls `router.prefetch()` on `onMouseEnter`). Then prefetch runs when a human hovers, not when a bot simply loads the page and “sees” all links. Bots typically don’t hover, so they wouldn’t trigger prefetch.  
- **Option C:** Disable prefetch site-wide (`prefetch={false}` on all Links) and rely on normal navigation. Saves the most cost; navigation is still fast, just without preloading.

You should not block bots; the idea is to avoid **triggering extra requests** (prefetch) for every link they see, while keeping fast navigation for real users where it matters (e.g. nav, or hover-based prefetch).

**Status:** Prefetch-on-hover/touch has been **implemented**. Tour and destination links use `PrefetchOnHoverLink` (prefetch only on `onMouseEnter` / `onTouchStart`; `prefetch={false}` so viewport-based prefetch is disabled). Bots don’t hover or touch, so they no longer trigger prefetch; humans still get fast navigation.

---

## 9. Cost savings from implemented changes (estimate)

Baseline (from your snapshot): **~$62.59** total, with **11.42M Edge Requests** and **10.81M Function Invocations**.

| Change | What it does | Estimated savings (per month) |
|--------|----------------|-------------------------------|
| **Tour sitemap tracking off** | No more `trackTourForSitemap` / `trackToursForSitemap` on tour/destination/guides pages. | **$0.50–1.50** (Vercel CPU + Supabase writes). |
| **getTourEnrichment dedup** | `getTourEnrichmentCached` with React `cache()` → one enrichment read per tour request instead of two. | **$0.20–0.60** (fewer Supabase reads + slightly less CPU on tour pages). |
| **Prefetch on hover/touch only** | Tour/destination links use `PrefetchOnHoverLink`. No viewport-based prefetch → bots no longer trigger 15–30+ prefetches per page. | **$2–6** (fewer Edge Requests + fewer Function Invocations; depends on how much of current volume was prefetch-driven). |

**Total estimated savings (all three):** about **$3–8/month**.

- The **prefetch** change has the largest range because it depends on traffic mix (share of bot vs human and how many requests were prefetches). If a big share of your 11.42M Edge / 10.81M invocations was bot-driven prefetch, savings will be toward the high end; if not, toward the low end.
- You’ll see the real impact in the next billing period: compare Edge Requests and Function Invocations (and their line items) before vs after.

**Reality check:** You went from **~$2/day** to **~$6/day** (~\$60 → ~\$180/month). Saving **\$3–8/month** from the above is only a small trim. To get back toward **~\$2/day** you need the **high-impact** changes from Section 4:

| Action | Why it matters |
|--------|----------------|
| **Canonical tour URL + redirects** | Your **single biggest cost** is `/tours/[...slug]` (107K requests, **0% cache**). Same tour requested as `/tours/123` and `/tours/123/some-slug` = two cache entries, so cache is almost never reused. One canonical URL per tour → same URL for every request to that tour → high cache hit rate → large drop in function invocations and origin transfer. |
| **Remove `headers()` from operators page** | That page is forced dynamic on every request and re-calls viator-search. One env-based URL → page can be cached (ISR). |
| **Narrow middleware** | Middleware runs on almost every request → 11.42M Edge Requests. Exclude paths that don’t need it → direct cut in Edge count. |
| **ISR instead of force-dynamic** (results, restaurant guides) | Fewer invocations and origin transfer on those routes. |

**Bottom line:** The changes in Section 9 are worthwhile but small. Getting back to ~\$2/day requires implementing the high-impact items above, with **canonical URLs** having the largest effect.
