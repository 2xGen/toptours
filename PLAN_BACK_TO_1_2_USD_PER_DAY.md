# Plan: Get Back to $1–2/day (Same Site, No UX/SEO Loss)

**Goal:** Reduce Vercel spend from ~$6/day (~$180/month) to ~$1–2/day (~$30–60/month) by fixing **why** every request costs money. The site stays the same for users and search engines; only caching and redirects change.

**Why it’s expensive now:** Almost every request runs a serverless function and hits the Edge because (1) tour pages have 0% cache hit (many URL shapes per tour), (2) some pages are forced dynamic (`headers()`, `force-dynamic`), and (3) middleware runs on almost every request.

---

## Step 1: Canonical tour URL + redirects (biggest impact)

**Problem:** The same tour is reachable as `/tours/123` and `/tours/123/sunset-cruise`. Next.js caches by full path, so you get two cache entries per tour and almost no reuse → **107K requests, 0% cache**, ~53 min CPU.

**Fix (same content, one URL per tour):**

1. **Pick one canonical shape:** e.g. always `/tours/{productId}/{slug}` when a slug exists (from tour title), otherwise `/tours/{productId}`.
2. **Redirect non-canonical to canonical (301):**
   - In `app/tours/[...slug]/page.js`: after loading the tour, compute the canonical path. If the current path is not canonical (e.g. wrong slug or missing slug), `redirect(canonicalPath, 301)` before rendering.
   - If you have a separate `app/tours/[productId]/page.js`, either remove it and let `[...slug]` handle `/tours/123` (slug = `["123"]`) and redirect to `/tours/123/canonical-slug`, or make `[productId]` immediately redirect to the canonical slugged URL (same effect).
3. **Use the same URL everywhere:** internal links (TourCard, SimilarToursList, sitemap, structured data) already use `/tours/{productId}/{slug}` or `/tours/{productId}`. Standardise on the **same** canonical helper (e.g. `getTourCanonicalPath(productId, tour)`) so links and sitemap match the redirect target.

**Result:** One URL per tour → high Full Route Cache hit rate for tour pages → large drop in Function Invocations, CPU, and Fast Origin Transfer. Site and SEO unchanged (canonical + 301 is best practice).

**Files to touch:** `app/tours/[...slug]/page.js`, possibly `app/tours/[productId]/page.js`, shared helper for canonical path; ensure TourCard, sitemap, and other tour links use that helper.

---

## Step 2: Remove `headers()` from operators and destination/tours pages

**Problem:** Using `headers()` (or `cookies()`) in a page forces the route to be **dynamic** → no cache, every request runs the function.

**Fix:** Replace `headers().get('host')` with a base URL from env, e.g.:

- `const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? \`https://${process.env.VERCEL_URL}\` : 'http://localhost:3000';`
- Set `NEXT_PUBLIC_SITE_URL=https://toptours.ai` (or your production domain) in Vercel env.

**Files:**

- `app/destinations/[id]/operators/page.js` (around 365–369) – replace the `headers()` block with the env-based `baseUrl`.
- `app/destinations/[id]/tours/page.js` (around 695–697) – same change.

**Result:** Operators page and destination/tours page can be cached (ISR). Fewer invocations and fewer internal `viator-search` calls. Site behaviour unchanged (same API calls, same data).

---

## Step 3: Move www → non-www redirect out of middleware (cut Edge cost)

**Problem:** Middleware runs on **every** non-static request → **11.42M Edge Requests**. The only thing it does is redirect `www` to non-www.

**Fix:** Do the www → non-www redirect in **Vercel** instead of middleware, then stop running middleware on every request.

- **Option A (recommended):** In Vercel: Project → Settings → Domains → set your apex domain as primary and add a redirect from `www` to apex (or use Vercel’s “Redirect” in Project Settings → Environment Variables / Redirects). Then **remove** the middleware file, or replace it with an empty middleware that returns `NextResponse.next()` and use a **matcher that matches nothing** (e.g. `matcher: []` or a path that never runs), so Edge is no longer invoked for normal traffic.
- **Option B:** Keep middleware but **narrow the matcher** so it only runs when the request might need a redirect. Because the redirect depends on `host`, you’d still need to run on every host. So the only way to avoid Edge on every request is to do the redirect outside middleware (Option A).

**Result:** Edge Request count drops sharply (no middleware = no Edge invocations for your app logic). Redirect still works via Vercel. Site and SEO unchanged.

**Files:** `middleware.js` (remove or neuter); Vercel project redirect for www → non-www.

---

## Step 4: ISR instead of `force-dynamic` where possible

**Problem:** `force-dynamic` forces every request to run the function; no cache.

**Fix:** Use ISR with a revalidate so repeated requests are served from cache.

| Route | File | Change |
|-------|------|--------|
| Results (search) | `app/results/page.js` | Replace `export const dynamic = 'force-dynamic'` with `export const revalidate = 3600` (1 hour). Same results for the same query for 1 hour. If you need fresher results, use 900 (15 min). |
| Restaurant guides | `app/destinations/[id]/restaurants/guides/[category]/page.js` | Replace `export const dynamic = 'force-dynamic'` with `export const revalidate = 86400` (24h) or 3600. Content is not user-specific. |

**Result:** Fewer function invocations and less origin transfer for these routes. Slightly stale content for the revalidate window; acceptable for most use cases and keeps the site the same in practice.

**Files:** `app/results/page.js`, `app/destinations/[id]/restaurants/guides/[category]/page.js`.

---

## Order of implementation (recommended)

| Order | Step | Why first |
|-------|------|-----------|
| 1 | **Canonical tour URL + redirects** | Biggest cost is tour pages (107K, 0% cache). One URL per tour → cache hits → largest drop in spend. |
| 2 | **Remove `headers()` (operators + destination/tours)** | Quick change, no UX change, unlocks caching on two more heavy routes. |
| 3 | **www redirect out of middleware** | Direct cut in Edge Request count (e.g. 11.42M → near zero for middleware). |
| 4 | **ISR for results + restaurant guides** | Extra savings; smaller than 1–3 but still meaningful. |

---

## What to expect after all steps

- **Function invocations:** Down a lot (tour cache hits, operators/tours cacheable, fewer dynamic runs on results/guides).
- **Edge Requests:** Down a lot (no or minimal middleware).
- **Fast Origin Transfer:** Down (fewer dynamic renders).
- **Fluid CPU / Memory:** Down (fewer function runs).

Together, that should move you back toward **~$1–2/day**, with the **same site** for users and the same content for SEO (canonicals + 301, no cloaking).

---

## What we’re not changing

- No removal of features or pages.
- No different content for bots vs users.
- No blocking of crawlers.
- Prefetch-on-hover/touch, sitemap tracking off, and enrichment dedup stay as they are (small savings already in place).

---

## Checklist (for implementation)

- [ ] **Step 1:** Canonical tour URL + 301 redirects in tour route(s); one canonical path helper; all tour links/sitemap use it.
- [ ] **Step 2:** Env-based `baseUrl` in `app/destinations/[id]/operators/page.js` and `app/destinations/[id]/tours/page.js`; set `NEXT_PUBLIC_SITE_URL` (or equivalent) in Vercel.
- [ ] **Step 3:** Configure www → non-www redirect in Vercel; remove or neuter `middleware.js` so it doesn’t run on every request.
- [ ] **Step 4:** Replace `force-dynamic` with `revalidate` in `app/results/page.js` and `app/destinations/[id]/restaurants/guides/[category]/page.js`.
- [ ] **Verify:** Deploy, then check Vercel dashboard (Edge Requests, Function Invocations, Fast Origin Transfer, CPU) after 3–7 days and compare to previous period.
