# NYC-first strategy & traffic/revenue brainstorm

**Context:** GSC traffic is lower than hoped after SEO changes (~3 weeks ago) and making the site tour-only. Restaurant removal and reindexing explain part of the drop; you want to improve traffic and unit economics. This doc brainstorms the NYC-first, handpicked-tours approach and ties it to the existing SEO plan.

---

## 1. GSC snapshot (past 90 days)

| Period | Clicks/day (approx) | Impressions/day (approx) | Avg position |
|--------|----------------------|---------------------------|---------------|
| Dec 11–16 | 38–54 | 7k–11k | ~25 |
| Dec 17 – Jan 2 | 17–40 | 4k–6.5k | ~18–27 |
| **Jan 3–6** | **52–64** | **5k–6.7k** | **~15–17** (best) |
| Jan 7 – Jan 18 | 24–37 | 5k–5.8k | ~20–26 |
| Jan 19 – Feb 3 | 28–77 | 8k–21k | 25–30 (impressions up, position worse) |
| Feb 4 – Feb 27 | 25–47 | 9k–19k | 16–30 |
| **Mar 1–10** | **15–29** | **5.3k–7k** | **22–28** (downward) |

**Takeaways:**

- **Best short spike:** Jan 3–6 and Feb 11–26: position 15–18, CTR ~0.3–0.5%.
- **Current trend:** March is down on clicks, impressions, and position vs Feb.
- **Likely drivers:** Restaurant 301s (lost “restaurant” SERP real estate), reindexing after title/SEO changes, possible seasonality, and thin tour-detail pages (many “crawled – currently not indexed”).

So: recovery should come from **stronger, fewer URLs** (depth over breadth) and **clear priority** (e.g. NYC).

---

## 2. Unit economics (reality check)

| Item | Approx |
|------|--------|
| Vercel hosting | ~$2–3/day → **~$60–90/month** |
| Viator revenue | **~$150/month** |
| **Net** | **~$60–90/month** (before your time) |

So the site is barely profitable; improving traffic and conversion per visit matters as much as cutting cost.

**Ways to improve:**

- **Traffic:** Better rankings and CTR on a smaller set of high-intent pages (NYC-first, handpicked tours).
- **Conversion:** Stronger CTAs, clearer value prop, and dedicated landing + detail pages for “best” tours.
- **Cost:**  
  - Reduce serverless invocations (cache more, fewer dynamic routes hit).  
  - Consider moving static/low-change pages to a cheaper host or CDN if you ever split traffic.  
  - Keep Vercel for now; first priority is revenue, not moving infra.

---

## 3. Your idea: NYC-first, handpicked tours, unique detail pages

**Summary of your idea:**

1. **Start with NYC** – one rebuilt, tour-focused hub.
2. **Landing page** – 12–15 popular NYC categories, each with ~10 matching tours.
3. **Per category:** 6 subcategories.
4. **Per subcategory:** 2–3 “handpicked” tours.
5. **Detail pages for those handpicked tours** – **hardcoded/unique content**, not thin Viator-API-only pages, so they’re SEO-rich and indexable.

This aligns well with the existing SEO plan (Tier 1, depth over breadth, no pruning of long tail) and with fixing “crawled – currently not indexed” by creating a **small set of pages you fully control**.

---

## 4. Why this can work (SEO + product)

- **Fewer, stronger URLs** – Instead of 245k+ tour URLs (many thin), you add a limited set of **curated** URLs with unique copy, FAQs, and structure. Google is more likely to index and rank them.
- **Clear topical focus** – NYC hub → categories → subcategories → handpicked tours gives a clear hierarchy and internal linking (hub → category → sub → tour).
- **Intent match** – Queries like “best Central Park tours”, “NYC food tours Chelsea”, “Statue of Liberty boat tour” can be targeted by category/subcategory + handpicked tour pages.
- **You already have:** NYC in Tier 1, `seo.title` for NYC, `hardcoded_destination_tours` in Supabase, and a destination page that can be extended with this structure.

---

## 5. TopTours 3.0 landing (implemented)

A new **tour-focused landing template** is available at **`/explore/[destinationSlug]`** (e.g. **`/explore/new-york-city`**).

- **Data:** Supabase tables `v3_landing_destinations`, `v3_landing_top_picks`, `v3_landing_categories` (see **`docs/SUPABASE_V3_LANDING_SCHEMA.md`**). Run the schema + NYC seed SQL in Supabase to enable the page.
- **Content:** Hero, **6 top picks** (product IDs from DB, link to `/tours/{productId}`), **12 popular categories** (cards linking to `/explore/new-york-city/{categorySlug}`).
- **Category pages:** `/explore/[destinationSlug]/[categorySlug]` exists as a placeholder (breadcrumbs, title, CTA to destination tours); handpicked tours per category can be added later.
- **Style:** Landing-style, high tour focus (inspired by Aru365); uses existing TopTours nav/footer and primary styling. AI-powered UX can be layered on later.

---

## 6. Proposed structure (concrete)

### 6.1 NYC hub (one landing page)

- **URL:** e.g. `/destinations/new-york-city` (existing) or a dedicated `/new-york-city-tours` if you want a tour-only hub.
- **Content:** Hero, short intro, then **12–15 category cards** (e.g. Central Park, Broadway, Food & Culture, Museums, Statue of Liberty, Harbor Cruises, Street Art, Brooklyn, Helicopter, Walking, Night, Day Trips, Family, Photography, Architecture).
- **Per category:** Link to category page (e.g. `/destinations/new-york-city/tours/central-park`) and show “Top 10” or “Featured” tours (from Viator API or `hardcoded_destination_tours`).

### 6.2 Category level (12–15 pages)

- **URL:** e.g. `/destinations/new-york-city/tours/central-park`.
- **Content:** Unique intro, “Why this category”, **6 subcategories** (e.g. Bike Tours, Walking, Horse Carriage, Running, Picnic & Tours, Photography).
- **Each subcategory:** Link to subcategory page + 2–3 handpicked tours (by `product_id`).

### 6.3 Subcategory level (12–15 × 6 = 72–90 pages)

- **URL:** e.g. `/destinations/new-york-city/tours/central-park/bike-tours`.
- **Content:** Short unique paragraph, 2–3 handpicked tours with cards (title, image, price, CTA).
- **Handpicked tours:** Either existing `/tours/[productId]/[slug]` (if you add unique content there for these IDs) or **dedicated URLs** (see below).

### 6.4 Handpicked tour detail pages (unique, “hardcoded” SEO)

- **Option A – Use existing tour URL but enrich:**  
  Keep `/tours/[productId]/[slug]`. For a **whitelist** of product IDs (your handpicked set), inject **unique content**: e.g. extra sections ( “Why this tour”, “Good for…”, “What to expect”, FAQ), and optional custom meta/description. No new URL structure; only richer content for selected tours.

- **Option B – Dedicated “guide” URL per handpicked tour:**  
  New route, e.g. `/destinations/new-york-city/tours/central-park/bike-tours/[tour-slug]` or `/new-york-city-tours/central-park-bike-tours/[tour-slug]`. Page is a **curated guide** to that tour: unique intro, highlights, tips, FAQ, then embed the same Viator CTA (widget or link). Canonical can point to this URL; the generic `/tours/[productId]` can 301 or noindex for these IDs so you don’t duplicate.

**Recommendation:** Start with **Option A** (enrich existing tour page for handpicked IDs). Less new routing and duplicate URLs; you only add a “handpicked” content layer in the existing layout. If later you want a separate “guide” URL for branding, add Option B and set canonicals carefully.

---

## 6. Content model for “unique” handpicked tour pages

So that detail pages are **not thin**, add:

- **Short intro** (2–3 sentences) – why this tour stands out, who it’s for.
- **What’s included / what to expect** – bullets or short paragraphs (can be written once per subcategory type and lightly customized per tour).
- **Practical tips** – best time to go, what to bring, duration, meeting point.
- **FAQ** – 3–5 questions (schema markup); e.g. “How long is the tour?”, “Is it suitable for kids?”, “Can I cancel?”.
- **One strong CTA** – “Check price and availability on Viator” → affiliate link.

You can store this in:

- **Supabase:** e.g. `handpicked_tour_seo` table: `product_id`, `destination_id`, `subcategory_slug`, `intro`, `what_to_expect`, `tips`, `faq_json`, `meta_title`, `meta_description`.
- Or **static/JSON** for a small set (e.g. 50–100 handpicked NYC tours) and load by `product_id` in the tour page.

---

## 7. Categories and subcategories (example for NYC)

Example **12–15 categories** and **6 subcategories** each (you can trim or expand):

| Category | Example subcategories |
|----------|------------------------|
| Central Park | Bike, Walking, Horse carriage, Running, Picnic & tours, Photography |
| Broadway & Theater | Musicals, Plays, Backstage, TKTS, Theater district tours, Shows + dinner |
| Food & Culture | Food tours, Chelsea Market, Chinatown, Brooklyn food, Pizza, Dessert |
| Museums | MET, MoMA, Natural History, Guggenheim, Museum pass, Themed tours |
| Statue of Liberty & Harbor | Ferry, Ellis Island, Harbor cruises, Sunset cruises, Helicopter, Combo |
| Walking & Neighborhoods | Downtown, Brooklyn, Harlem, Greenwich Village, Street art, Hidden gems |
| Night & Skyline | Rooftop bars, Night bus, Helicopter night, Skyline cruises, Broadway at night |
| Day trips | Hamptons, Hudson Valley, Philly, DC, Niagara (if you want), Wine country |
| Family & Kids | Kid-friendly tours, Museums for kids, Boat, Central Park, Zoo, Interactive |
| Photography | Street, Skyline, Street art, Neighborhood, Golden hour, Photo tours |
| Architecture | Skyscrapers, Art deco, Brooklyn Bridge, High Line, Landmarks, Historic |
| Helicopter & Views | Day, Night, Doors-off, Combo with boat, Manhattan, Full island |
| Cruises & Water | Harbor, Sunset, Dinner cruise, Sail, Speedboat, Circle Line |
| Street art & Culture | Bushwick, Williamsburg, Murals, Graffiti, Guided street art |
| Brooklyn | DUMBO, Williamsburg, Food, Street art, Bridge walk, Neighborhoods |

Each category → one page; each subcategory → one page; each handpicked tour (2–3 per sub) → one enriched or dedicated detail page.

---

## 8. Technical integration with what you have

- **Destination page:** Already has `tourCategories` and `hardcodedTours` from `getHardcodedToursByDestination(destinationId)`. You can:
  - Extend NYC’s `tourCategories` (and optionally a new “subcategories” structure) in `destinationsData.js` or in DB.
  - Drive the new category/subcategory pages from that structure.
- **Hardcoded tours:** Table `hardcoded_destination_tours` has `destination`, `category`, `product_id`, `title`, `image_url`, `position`. You could add:
  - `subcategory` (or a separate mapping table) to support “category → subcategory → product_id”.
- **Tour detail page:** In `app/tours/[productId]/page.js` (or in the component that renders the main content), check if `productId` is in the handpicked set; if yes, load and render the extra blocks (intro, what to expect, tips, FAQ) from Supabase or static data.

---

## 9. Phased plan

| Phase | What | Outcome |
|-------|------|--------|
| **1. Define & data** | Fix 12–15 NYC categories and 6 subcategories each; list 2–3 handpicked tours per sub (product IDs). Put in Supabase or JSON. | Clear taxonomy and handpicked set. |
| **2. NYC hub** | Rebuild NYC landing (or add `/new-york-city-tours`) with 12–15 category cards and links to category pages. | One strong NYC entry point. |
| **3. Category + subcategory pages** | Add routes for category and subcategory; unique short copy per page; list handpicked tours with CTAs. | 12–15 + 72–90 indexable pages. |
| **4. Enriched handpicked detail** | For handpicked product IDs, add unique content (intro, expect, tips, FAQ) on existing tour page or new URL; add schema. | 150–270 “thick” tour pages. |
| **5. Internal linking & GSC** | Link hub → category → sub → tour; submit new URLs in GSC; request indexing for key pages. | Crawl and index priority. |
| **6. Titles & meta** | Per category/subcategory/tour, set title and meta from GSC queries and keywords. | Better CTR and relevance. |

---

## 10. Success metrics (aligned with SEO plan)

- **Impressions/clicks:** By 90 days, aim for NYC-related queries to show clear growth in GSC (e.g. “NYC tours”, “Central Park tours”, “best food tours NYC”).
- **Indexing:** New category, subcategory, and handpicked tour pages indexed (fewer “crawled – currently not indexed” for this set).
- **Position:** Improve average position for 5–10 target NYC queries by 2–5 positions.
- **Revenue:** Viator revenue per visit or per click (track if possible); goal to grow toward $200+/month as traffic recovers.

---

## 11. Summary

- **GSC:** Current drop fits restaurant removal and reindexing; focus on fewer, stronger URLs and Tier 1 (NYC).
- **Unit economics:** Improve by growing traffic and conversion first; optional later cost tweaks on Vercel.
- **Your idea** (NYC-first, 12–15 categories, 6 subcategories, 2–3 handpicked tours with unique detail pages) is **sound** and matches the existing SEO direction.
- **Next steps:** (1) Lock NYC categories/subcategories and handpicked list; (2) add or extend NYC hub and category/subcategory routes; (3) enrich existing tour page for handpicked IDs with unique content and FAQ; (4) internal linking and GSC submission.

If you want, next we can turn this into a **short implementation checklist** (files to add, DB columns, and one example category/subcategory + one handpicked tour) so you can build phase by phase.

---

## 12. Transition strategy: hide in UX, keep in index

**Principle:** You have many indexed pages that still get clicks from “unimportant” destinations, and reindexing can take up to 8 weeks. So **do not remove or 301** the current site while building the new NYC-first structure. Instead: **structurally “hide” old pages in the UX**, but **keep them in the index** and reachable. That avoids an immediate SEO hit and preserves long-tail revenue.

### 12.1 What to keep (no change)

| Item | Why |
|------|-----|
| **All destination URLs** | Keep live and indexable (`/destinations/[id]`, `/destinations/[id]/tours`, guides, etc.). No 301, no noindex. |
| **All tour detail URLs** | Keep in sitemap and indexable. Long-tail tour pages still drive clicks and revenue. |
| **Sitemaps** | Main sitemap + tour sitemap index unchanged; keep submitting so Google can still discover and re-crawl everything. |
| **robots.txt** | No new disallow; keep `index, follow` for all existing content. |
| **/destinations hub** | Keep the full list (3,300+) with search/filter. This is the “back door” for users and crawlers to reach any destination. |

### 12.2 What to “hide” in the UX (not in the index)

“Hide” = **don’t prominently surface** in nav, hero, or primary CTAs. Users and crawlers can still reach pages via search, direct link, or a deliberate “Browse all destinations” entry point.

| Where | Change |
|-------|--------|
| **Homepage** | Lead with **Tier 1 / NYC** (e.g. “Start with New York City” or “Popular: NYC, Paris, Barcelona”). Keep “Popular Destinations by Region” to a **short list** (e.g. 10–20 Tier 1), or one row of “Featured” + a single CTA: **“Browse all 3,500+ destinations →”** linking to `/destinations`. Do **not** remove the link to the full list. |
| **Nav / footer** | No mega-menu of hundreds of destinations. Keep “Destinations” → `/destinations`. Optionally add “New York City” or “Top destinations” as a secondary link that goes to NYC or a Tier 1 landing. |
| **Destination landing pages** | For **Tier 1** (e.g. NYC): most links stay same-destination (tours, guides, categories). “More destinations” can be a **short** list (5–8) + “View all destinations” → `/destinations`. For **non–Tier 1**: keep existing layout; no need to strip links, just avoid making them the main focus of the site. |
| **New NYC hub** | When you add the new NYC structure (categories, subcategories, handpicked tours), **add** it as the primary path for NYC. The existing `/destinations/new-york-city` can remain and link to the new hub, or become a redirect **only** if you later decide (initially keep both and link between them). |

### 12.3 What not to do

- **Do not** noindex existing destination or tour pages.
- **Do not** 301 existing URLs to new ones unless you are truly consolidating a single page (e.g. same content, same intent). 301s tell Google “this URL moved”; use only when the target is the canonical version.
- **Do not** remove URLs from sitemaps to “hide” them from Google—that can hurt indexing. Keep sitemaps as-is.
- **Do not** block crawlers from `/destinations` or long-tail paths in robots.txt.

### 12.4 Outcome

- **Index:** All current pages stay indexable; no sudden drop from removals or 301s.
- **UX:** New visitors see a clearer “start here” (NYC / Tier 1) and a clear path to the new structure, while “Browse all destinations” and direct/search traffic still reach the long tail.
- **SEO:** Reindexing of new NYC pages happens in parallel; existing long-tail pages keep earning until you have data to decide otherwise (and the 90-day plan already says “no pruning” for that reason).
