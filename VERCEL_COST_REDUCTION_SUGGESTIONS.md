# Vercel cost reduction – suggestions (Jan 30, 2025)

Your latest usage shows **~$57** before credits; budget at 100% ($50). Below are **concrete changes**, ordered by impact, so you can cut cost quickly.

---

## Where the money goes (from your data)

| Item | Usage | Charge | Note |
|------|--------|--------|------|
| **Fluid Active CPU** | 124 hours | **$16.29** | Serverless compute time |
| **Fluid Provisioned Memory** | 1.16K GB Hrs | **$12.32** | Memory while functions run |
| **Fast Origin Transfer** | 166 GB | **$10.69** | Data from origin → Edge (dynamic renders) |
| **Function Invocations** | 8M | **$5.04** | Every server-rendered request |
| **Edge Requests** | 8.74M / 10M | **$3.80** | Already near limit |
| **Image Optimization** | 90K | **$4.70** | Transformations |
| **ISR Reads** | 3.83M | $1.53 | Cache reads |
| **ISR Writes** | 349K | $1.40 | Cache writes |

**Heaviest routes (last 24h):**

- **`/tours/[...slug]`** – 93K requests, **3.52 GB** Fast Data Transfer (single biggest cost).
- **`/cookie-policy`, `/terms`, `/disclosure`** – 23K each, **58.6% bots**.
- **`/destinations`, `/destinations/[id]`, `/restaurants`, `/tours`, `/match-your-style`** – 17–21K each, **61–63% bots**.
- **One JS chunk** `7261-7741dbfff6271233.js` – **1.42 GB** transfer (one file).

**External APIs:** Supabase 2.9M, Viator 221K (31K from functions). Viator is called from server pages (operators, destination/tours) and from client (results, match-your-style).

---

## Already done (no action)

- **Middleware** – Matcher is a no-op path → middleware effectively never runs → no extra Edge cost.
- **Prefetch on hover** – Tour cards and some destination links use `PrefetchOnHoverLink` (no viewport prefetch) → fewer bot-driven prefetches.
- **Tour canonical redirect** – `[...slug]` and `[productId]` redirect to canonical URL; internal links use helpers.
- **Restaurant guides** – `revalidate = 86400`, no `force-dynamic`.
- **Results page** – No `force-dynamic` (client page).

---

## High impact – do first

### 1. Remove `headers()` from operators and destination/tours pages

**Problem:** Using `headers()` in a page forces that route to be **dynamic on every request**. No Full Route Cache → every view runs the function and (where applicable) calls viator-search.

**Where:**

- **`app/destinations/[id]/operators/page.js`** (around line 366) – uses `headers()` to get `host` and build `baseUrl` for `fetch(..., '/api/internal/viator-search')`.
- **`app/destinations/[id]/tours/page.js`** (around line 694) – same pattern.

**Change:** Use a fixed base URL from env instead of `headers()`:

- `baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? \`https://${process.env.VERCEL_URL}\` : 'https://toptours.ai';`
- Or simply: `baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://toptours.ai';`

**Set in Vercel:** `NEXT_PUBLIC_BASE_URL=https://toptours.ai` (or your production domain).

**Effect:** These pages can be cached (ISR). Fewer function invocations, fewer viator-search calls, less Fast Origin Transfer for these routes. This was called out in `VERCEL_COST_INVESTIGATION.md` and is still not applied.

---

### 2. Reduce prefetch on remaining high-traffic links

**Problem:** Many links still use `prefetch={true}`. When a bot (or user) loads a page, every link in view can trigger a prefetch → one page view can become 15–30+ requests. Your bot share is 58–63% on several routes.

**Where:**

- **`app/destinations/[id]/DestinationDetailClient.jsx`** – `prefetch={true}` on guide links (e.g. line 2048) and “other destination” links (e.g. 2428).
- **`app/destinations/DestinationsPageClient.jsx`** – `prefetch={true}` on destination and destination/tours links (618, 629, 697, 707, 938).
- **`app/destinations/[id]/guides/GuidesListingClient.jsx`** – `prefetch={true}` on destination/tours links (662, 726).
- **`src/components/NavigationNext.jsx`** – `prefetch={true}` on nav links (/, /tours, /destinations, etc.).

**Options:**

- **A)** Use `PrefetchOnHoverLink` (or equivalent) for **destination and tour** links, and keep `prefetch={true}` only for main nav (/, /tours, /destinations) if you want.
- **B)** Set `prefetch={false}` on all links that point to **dynamic routes** (destination detail, destination/tours, destination/guides, tour detail). Keep prefetch for truly static or low-cost routes.
- **C)** Set `prefetch={false}` site-wide for maximum savings.

**Effect:** Fewer Edge Requests and Function Invocations, especially from bots. Likely **$2–6/month** range (see existing investigation doc).

---

### 3. Canonical tour URL everywhere

**Status:** Redirect logic is in place: non-canonical tour URLs redirect to the canonical path. But if **internal links** still point to both `/tours/123` and `/tours/123/some-slug`, crawlers and users hit two URLs per tour → two cache entries, low hit rate.

**Check:** Ensure **all** internal links to a tour use the **same** canonical shape (e.g. always `getTourUrl(productId, title)` or `getTourCanonicalPath(...)`). Sitemaps, structured data, and in-app links should use one URL per tour.

**Effect:** Higher Full Route Cache hit rate for `/tours/[...slug]`, less CPU and Fast Origin Transfer.

---

## Medium impact

### 4. Bot-heavy static pages (/terms, /disclosure, /cookie-policy)

**Data:** 23K requests each, 58.6% bots. They are client components; the initial HTML may still be served by the server on each request.

**Options:**

- Ensure these routes are **statically generated** (no dynamic APIs in the tree) so they’re served from CDN/Edge without running a function.
- Or add a **long revalidate** if they are generated at build and never need fresh data.

**Effect:** Fewer function invocations and less origin transfer for these 69K requests.

---

### 5. Large JS chunk (1.42 GB transfer for one file)

**Data:** `/_next/static/chunks/7261-7741dbfff6271233.js` accounts for **1.42 GB** Fast Data Transfer. That suggests either a very large shared chunk or very high request volume to routes that load it.

**Suggestions:**

- Run a **bundle analyzer** (`@next/bundle-analyzer`) and see what’s in that chunk. Split or lazy-load heavy libraries (e.g. maps, rich editors, large UI libs).
- Lazy-load **below-the-fold** or route-specific components with `next/dynamic` so the chunk is only loaded when needed.
- If the chunk is shared by many pages, reducing its size or splitting it will reduce transfer for every page that uses it.

**Effect:** Direct reduction in Fast Origin Transfer (and possibly Edge bandwidth).

---

### 6. Image Optimization (90K, $4.70)

**Suggestions:**

- Confirm **all** `next/image` usage that doesn’t need resizing/format conversion uses `unoptimized` where acceptable (e.g. external CDN URLs already optimized).
- For images that must be optimized, ensure **consistent sizing** and avoid unnecessary variants to reduce transformation count.

**Effect:** Lower Image Optimization cost.

---

### 7. ISR write volume (349K writes, $1.40)

**Suggestion:** Review `revalidate` values. If some pages revalidate very often (e.g. 60–300s) but don’t need fresh data that often, increase to 3600 or 86400 to cut ISR writes.

**Effect:** Fewer ISR writes, small but direct cost saving.

---

## Lower priority / monitoring

- **Page-view API** – Already low volume; no urgent change.
- **Viator cache TTL** – If you must comply with 1h cache rule, align TTLs (see `VERCEL_COST_INVESTIGATION.md` Option A). For cost, the big levers are (1) and (2) above.
- **Ingestion model (Viator)** – Medium-term option to move tour/destination data to a sync job and serve from DB; would reduce real-time Viator calls and allow more static/ISR pages (see investigation doc Option B).

---

## Destination/tours – "0 tours" fix (when you're ready)

**Left in fridge for now.** When you want to make `/destinations/[id]/tours` cacheable and avoid wrong-host issues:

1. **In `app/destinations/[id]/tours/page.js`** (around line 694):
   - Remove `import { headers } from 'next/headers';` if it’s only used for baseUrl.
   - Replace the block that does:
     - `const headersList = await headers();`
     - `const host = headersList.get('host') || 'localhost:3000';`
     - `const protocol = ...`
     - `const baseUrl = \`${protocol}://${host}\`;`
   - With:
     - `const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? \`https://${process.env.VERCEL_URL}\` : 'https://toptours.ai');`

2. **In Vercel:** Project → Settings → Environment Variables. Add:
   - **Name:** `NEXT_PUBLIC_BASE_URL`
   - **Value:** `https://toptours.ai` (or your production domain)
   - **Environment:** Production (and Preview if you want previews to hit production API).

3. **Why this fixes "0 tours":**
   - Wrong host: In serverless, `headers().get('host')` can be wrong or missing; internal fetch to `/api/internal/viator-search` then fails → 0 tours. A fixed production URL fixes that.
   - Cache empty: The first request (or first after revalidate) runs the server and calls viator-search; the response is cached. Later requests get that cached HTML with tours. So "cached is null" only on the very first request for that URL; after that, cache has tours until revalidate.

4. **If you still see 0 tours after this:** Then the cause is not baseUrl (e.g. viator-search failing for that destination, or API error). Check Vercel function logs and the viator-search response for that destination.

---

## Implemented (Jan 2025)

- **Operators page (A1):** No server-side viator-search. CTA "Go to [destination] destination page" links to `/destinations/[id]` (destination detail), not /tours.
- **Terms, disclosure, cookie-policy:** Layouts have `export const dynamic = 'force-static';` so these routes are built at deploy and served from CDN → near-zero compute for those requests.

---

## Suggested order of work

1. **When ready:** Replace `headers()` with env `baseUrl` in **destination/tours** only (see "Destination/tours – 0 tours fix" above). Set `NEXT_PUBLIC_BASE_URL` in Vercel.
2. **This week:** Reduce prefetch on destination/tour/guide links (suggestion 2).
3. **Next:** Audit internal tour links and sitemaps for canonical URL (suggestion 3).
4. **Then:** Static/cache for terms/disclosure/cookie-policy (4), bundle analysis and chunk splitting (5), image and ISR tweaks (6–7).

After (1) and (2), recheck Vercel Usage (Function Invocations, Fluid CPU, Fast Origin Transfer, Edge Requests) after 3–7 days to confirm the drop. If you want, the next step can be implementing (1) and (2) in the repo with concrete diffs.
