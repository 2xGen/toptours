# Match to Your Style — usage and cost

**Where it appears:** "Match to Your Style" / "AI driven" on `/destinations/[id]/tours`, tour detail pages, category guides, restaurant listing/detail.

---

## 1. What function is used?

- **Main:** `calculateEnhancedMatchScore(tour, userPreferences, tourProfile)` from `@/lib/tourMatchingEnhanced.js`
- **Supporting:** `calculateTourProfile(tourTagsOrIds, tagTraitsMap, supabase)` from `@/lib/tourMatching.js`

Matching is **multi-factor scoring in JavaScript** (preference alignment, quality, price, convenience, keywords). **No OpenAI or other paid third‑party API** is used for the score itself.

---

## 2. What actually costs (Supabase)

The only external usage is **Supabase**:

| Page | When it runs | Supabase usage |
|------|----------------|----------------|
| **Destination tours** (`/destinations/[id]/tours`) | On client after page load, when `allTours` is set | **1 batched read** from `viator_tag_traits` per page load (all unique tag IDs on that page, in batches of 1000) |
| **Tour detail** (`/tours/[productId]`) | On client when tour has `tour.tags` | **1 read** from `viator_tag_traits` per page load (tag traits for that tour’s tag IDs) |
| **Category guide** (`/destinations/[id]/guides/[category]`) | On client for tours in that guide | Same pattern: tag traits fetched, then scores in JS |
| **Restaurant listing/detail** | When match scores are shown for tours/restaurants | Same idea: tag/trait data + JS scoring where applicable |

So **cost = Supabase read volume** (no separate “AI” or “match” API bill). Exact $ depends on your Supabase plan and how many reads you do per month.

---

## 3. Crawler impact

- Matching runs **in the browser** in `useEffect` after the page and data (e.g. `allTours`) are ready.
- **If the crawler runs JavaScript** (e.g. Googlebot), it will:
  - Load the page → run the same client code → trigger the Supabase `viator_tag_traits` read(s) and the match loop.
- So **every crawler visit** to:
  - A destination tours page ≈ **1 read** (batched tag traits).
  - A tour detail page (with tags) ≈ **1 read** (that tour’s tag traits).
- High crawler traffic to these URLs = a lot of Supabase reads, even though no user is “using” Match to Your Style.

---

## 4. Rough usage pattern

- **Destination tours:** 1 batched `viator_tag_traits` query per page view (user or crawler).
- **Tour detail:** 1 `viator_tag_traits` query per page view when the tour has tags.
- **Per tour on listing:** Score is computed in JS from the already-fetched tag traits (no extra Supabase call per tour).

So cost scales with **number of page views** (including crawlers), not with “number of tours scored” once tag traits are loaded.

---

## 5. Options to reduce usage / cost

1. **Skip match when there are no user preferences**  
   On destination tours, only run the match loop (and thus the tag-trait fetch) if the user (or localStorage) has preferences. If no preferences, show a neutral “Match to Your Style” CTA and do **not** call Supabase for tag traits. Crawlers usually have no localStorage, so they’d get no trait fetch.

2. **Skip or delay on tour detail**  
   On tour detail, only fetch tag traits / compute match when the user has preferences or when they open “Match to Your Style”. Avoid running `calculateTourProfile(tour.tags)` on every load (including crawlers).

3. **Bot detection**  
   Optionally treat requests with a bot user‑agent (or from a known crawler list) as “no preferences” and skip tag-trait fetch and match loop. Reduces crawler-driven reads.

4. **Cache tag traits more aggressively**  
   E.g. cache `viator_tag_traits` in memory or at the edge (e.g. short TTL) so repeated visits (same tag set) don’t hit Supabase every time. Reduces reads per unique “tag set” over time.

5. **Keep current behavior, monitor Supabase**  
   If Supabase usage and cost are acceptable, you can leave as-is and just watch the “Database” usage in the Supabase dashboard.

---

## 6. File reference

- **Matching logic:** `src/lib/tourMatchingEnhanced.js`, `src/lib/tourMatching.js`
- **Destination tours (where scores are computed per tour):** `app/destinations/[id]/tours/ToursListingClient.jsx` (useEffect that fetches tag traits then calls `calculateEnhancedMatchScore` per tour)
- **Tour detail:** `app/tours/[productId]/TourDetailClient.jsx` (useEffect that calls `calculateTourProfile(tour.tags)` then `calculateEnhancedMatchScore`)
- **Category guide:** `app/destinations/[id]/guides/[category]/CategoryGuideClient.jsx`
- **Supabase table:** `viator_tag_traits` (read via `.in('tag_id', batch)`)

Implementing (1) and (2) gives the biggest reduction in Supabase reads and crawler impact while keeping “Match to Your Style” for real users who have preferences or click through.
