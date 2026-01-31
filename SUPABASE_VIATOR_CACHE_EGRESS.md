# Supabase viator_cache – Egress & Disk Analysis

## What’s going on

- **Disk:** TopTours project grew from 12GB → 18GB (auto-scaled).
- **Egress:** 360 GB used vs 250 GB included (~110 GB overage).
- **Likely cause:** `viator_cache` table used for tour (and similar_tours) caching. Every tour page view (including Googlebot) triggers a **Supabase read** of one row (`getCachedTour(productId)`), which returns `tour_data` (JSONB, often 15–50 KB per tour). That read is **egress** (Supabase → Vercel).

## How the cache is used

| Cache type        | Table          | Used when                         | Egress per hit   |
|-------------------|----------------|-----------------------------------|------------------|
| **Tour**          | `viator_cache` | Every tour detail page (and APIs) | ~15–50 KB/request |
| **Similar tours** | `viator_cache` | “Load similar tours” / server SSR| ~5–20 KB/request |
| **Destination tours** | `viator_cache` | `/api/destinations/[id]/tours`   | **Disabled** (`ENABLE_CACHING = false`) |

- **Tour cache:** `getCachedTour(productId)` → `SELECT * FROM viator_cache WHERE product_id = ? AND cache_type = 'tour'`. Used by:
  - Tour detail pages (`app/tours/[productId]/page.js`, `[...slug]/page.js`)
  - Internal tour API, similar-tours API, destination data loader, match-your-style, etc.
- If you have on the order of **hundreds of thousands of tour rows** (e.g. pre-filled or grown over time), then:
  - **Disk:** Many rows × (e.g. 20–40 KB `tour_data`) + indexes explains multiple GB.
  - **Egress:** Number of tour (and related) requests × size per row. Large bot traffic (e.g. Google) can easily push you into hundreds of GB.

## Why “cache doesn’t seem to work” on Vercel

- Next.js `unstable_cache` is **per-instance** and serverless instances are short-lived, so cache hits may be rare.
- So for many requests you get:
  1. **Supabase read** (getCachedTour) → **egress**
  2. Cache miss or expired → then **Viator API** call
- So you can pay both Supabase egress and Viator calls; the Supabase cache doesn’t help much if Vercel-level cache isn’t hitting.

## 7-day revalidate and bots

- Page revalidate is 7 days; viator_cache TTL for tours is 24 hours.
- Bots often don’t re-hit the same URL within 7 days. So:
  - First hit: Supabase read (egress) + maybe Viator + cache write.
  - Next hit after 7+ days: cache may be expired or cold; again Supabase read (egress) + Viator.
- So **every bot visit can still cause a Supabase read** (and egress); the 7-day revalidate doesn’t remove that.

## Recommendations

### 1. Supabase tour/similar_tours cache is OFF by default (implemented)

- **Code:** `viatorCache.js` uses Supabase for tour/similar_tours **only when** `VIATOR_USE_SUPABASE_CACHE=true`. Default (unset) = **off**.
- **Effect:**
  - `getCachedTour()` returns `null` → no Supabase read → **no egress** for tour cache.
  - `cacheTour()` no-ops → no Supabase writes.
  - Same for `getCachedSimilarTours()` / `cacheSimilarTours()`.
  - Tour data is served from Next.js `unstable_cache` and Viator API. Supabase egress from viator_cache drops to zero unless you set `VIATOR_USE_SUPABASE_CACHE=true`.

### 2. Optionally free disk and stop historical egress from old cache

- A single `DELETE FROM viator_cache WHERE ...` can **time out** on large tables (upstream timeout in Supabase SQL Editor).
- Use **batched deletes** instead: see **`scripts/supabase-delete-viator-cache-tours-batched.sql`**.
  - Run the `WITH batch AS (... LIMIT 2000) DELETE ...` statement in Supabase SQL Editor.
  - Run it **repeatedly** until it reports 0 rows deleted (or "DELETE 0").
  - If 2000 still times out, change `LIMIT 2000` to `LIMIT 1000`.
- This frees disk and ensures no future reads from those rows. Only run if you’re sure you don’t need that cached data (e.g. after enabling `VIATOR_USE_SUPABASE_CACHE=false`).

### 3. Destination tours cache

- `/api/destinations/[id]/tours` already has **caching disabled** (`ENABLE_CACHING = false`). No change needed there.

### 4. Keep an eye on other Supabase usage

- Egress also comes from: Auth, Storage, Realtime, other tables (e.g. `viator_tag_traits`, `profiles`). The biggest lever identified so far is **viator_cache** for tours; disabling it should significantly cut egress.

## Env flag (implemented in code)

- **`VIATOR_USE_SUPABASE_CACHE`**
  - **Default (unset or not `'true'`):** Supabase tour/similar_tours cache is **off**. No reads, no writes → no egress from viator_cache for tours.
  - Set to **`true`** (string) to re-enable: `getCachedTour`/`cacheTour` and `getCachedSimilarTours`/`cacheSimilarTours` use Supabase again.
- No env change needed to get the savings; redeploy with current code and egress from tour cache stops.

## Summary

| Action | Effect |
|--------|--------|
| **Default (current code)** | Supabase tour/similar_tours cache is off → no egress from viator_cache for tours. |
| Set `VIATOR_USE_SUPABASE_CACHE=true` | Re-enables Supabase cache (only if you want it). |
| Run batched delete from `scripts/supabase-delete-viator-cache-tours-batched.sql` (optional) | Frees disk; run repeatedly until 0 rows. |

The “300k tours” cache is very likely the main driver of both **disk** and **egress**. Turning it off via the env flag (and optionally deleting tour/similar_tours rows) is the most direct way to get control of Supabase usage.
