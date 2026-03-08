# TopTours.ai — 90-day SEO plan (year 1 review)

**Context:** Domain 1 year old. 177k indexed, 324k crawled currently not indexed (many = single tour detail pages). 3,300 destinations; each has landing, /tours, guides, car-rentals; some have baby-equipment. Restaurant pages removed (301s). Goal: grow impressions and clicks by focusing and deepening, not by adding more thin URLs.

---

## 1. Diagnosis (why impressions/clicks are “falling behind”)

### 1.1 Index composition

- **177k indexed** is large, but a lot is likely:
  - **Tour detail pages** (`/tours/{productId}/{slug}`): template pages with Viator product data + CTA. Google often crawls but does **not** index these (“Crawled – currently not indexed”) when it sees them as thin or low-value.
  - **Destination + listing + guides + car-rentals** across 3,300 destinations: many URLs with similar structure and medium-to-thin content, so limited unique value per URL.

- **324k “crawled currently not indexed”** fits that picture: Google knows the URLs (sitemap + internal links) but chooses **not** to index a big chunk (especially tour detail pages).

### 1.2 Structural issues (from codebase)

1. **Tour sitemap discovery**  
   Tour sitemap index is submitted in GSC (245k+ discovered). `robots.js` now also lists it so crawlers discover it without relying only on GSC.

2. **Huge breadth, limited depth**  
   ~3,300 destinations × (landing + /tours + guides listing + category guides + car-rentals + some baby-equipment) = tens of thousands of “destination” URLs. Without clear priority, authority and content depth are spread thin.

3. **Tour detail pages as “indexable by default”**  
   Every tour URL is indexable and in the tour sitemap. Most get little engagement and are thin. That encourages Google to crawl a lot and index only a fraction, which matches “324k crawled not indexed.”

4. **No clear “tier” of destinations**  
   All destinations are treated similarly in the sitemap and structure. There’s no technical or content signal for “priority” (e.g. New York, Paris, Barcelona) vs long-tail.

---

## 2. Strategic direction: strengthen priority, keep the long tail

**No pruning.** Revenue comes from the long tail (e.g. $500 Viator commission in a month from destinations that aren’t “tier 1”); removing or noindexing those would risk losing that.

- **Tier 1 destinations** = where you add *extra* effort (internal links from homepage/destinations, stronger titles/meta, maybe richer intros). Not a signal to noindex or remove the rest.
- **Keep all destinations and tour pages indexable.** Focus growth on getting more impressions/clicks from what you have, and on getting new content (e.g. tag-based guides) discovered and indexed faster.
- **Content volume is already strong:** Viator-tag-based script creates many guides per destination (e.g. 46 for New York City). Many guides are only 2–3 weeks old and not yet indexed. So the bottleneck is likely **indexing speed**, **crawl budget**, or **authority**, not “need more content.”

---

## 3. 90-day plan of action

### 3.1 Quick wins (weeks 1–2)

| Action | Status / Why |
|--------|----------------|
| **Submit tour sitemap index in GSC** | **Done.** Already submitted; 245k+ pages discovered, status Success. |
| **Add tour sitemap index to `robots`** | **Done.** `app/robots.js` now lists both `sitemap.xml` and `sitemap-tours` so crawlers discover the tour sitemap without relying only on GSC. |
| **Export GSC “Pages” + “Queries”** | Export 90-day data: which **pages** get impressions/clicks and which **queries** they rank for. Use this to pick “priority destinations” (for extra internal linking and title tweaks) from real data. |

No pruning—keep all destinations and tour pages indexable.

---

### 3.2 Choose “priority destinations” for extra emphasis (weeks 2–3)

- **Purpose:** Tier 1 = where you give *extra* internal links (e.g. homepage, /destinations) and title/meta attention. You do **not** noindex or remove the rest—long-tail destinations drive revenue.
- **Criteria:** Mix of (1) high search demand (e.g. New York, Paris, Barcelona), (2) strong GSC performance, (3) commercial value.
- **Target:** 10–20 destinations. List them in a doc; use the list only for “where to add emphasis,” not for pruning.

---

### 3.3 Content and indexing: guides are already there; focus on discovery and authority (weeks 3–8)

- **Guides:** You already have many (e.g. 46 for New York City from the Viator-tag script). Many are only 2–3 weeks old and not yet indexed. Content volume is not the main problem.
- **Priorities:**
  1. **Get new guides indexed:** Ensure they’re in the sitemap (category guides from DB are in main sitemap). In GSC, use “URL Inspection” or “Request indexing” for a few high-value new guide URLs if needed; avoid mass request.
  2. **Internal linking:** From destination hub and /tours page, link clearly to “Travel Guides” and to a few key category guides. From guides, link back to destination and /tours. Helps crawl and relevance.
  3. **Tier 1 extra:** For 10–20 priority destinations, add stronger internal links from homepage or /destinations and refine title/meta for destination and /tours using GSC query data.

No need to add lots of new content; focus on getting existing guides discovered and on improving CTR/position for pages that already rank.

---

### 3.4 Tour detail pages: keep indexable (no prune)

- **Do not noindex or prune tour pages.** Long-tail tour and destination URLs already drive revenue (e.g. $500/month from non–tier-1 destinations). Keeping them indexable preserves that.
- Many will stay “crawled – currently not indexed”; that’s acceptable. Growth should come from destination pages, /tours listing pages, and guides (including getting new guides indexed), not from removing tour URLs.

---

### 3.5 Titles and snippets (ongoing)

- Use GSC “Queries” to see which queries already get impressions but low CTR (e.g. position 5–15, CTR &lt; 2%).
- For the **pages** that rank for those queries, refine:
  - **Title:** Include main keyword + one differentiator (e.g. “Best …”, “Top 10 …”, “2026 Guide”).
  - **Meta description:** One clear benefit + CTA; avoid duplicate copy across 3,300 destinations.
- Do this first for Tier 1 destinations and their /tours and main guides.

---

### 3.6 Technical and discovery (weeks 1–4)

- **Sitemap:** Main sitemap includes destination pages, /tours, guides, car-rentals, etc. Tour sitemap index is in GSC and in `robots.js`.
- **Canonicals:** Keep one canonical per URL (no self-referencing canonicals on pagination or filters).
- **Redirects:** Keep 301s for restaurants and any other retired sections; no new mass redirects unless you deliberately prune sections.

---

### 3.7 Tier 1 destination landing page (e.g. New York City)

**New York City is a Tier 1 destination.** Below are recommendations for the main destination landing page (`/destinations/new-york-city` and similar Tier 1 pages).

#### What’s already strong

- **Hero:** Clear H1 (“Things to do in New York City”), region (North America), hero description, and stats (2,639+ tours, 46+ guides) with CTAs.
- **Popular Pages:** Tours, Travel Guides, Car Rentals, Airport Transfers, Baby Equipment — all linked.
- **Sections:** Why Visit, Getting Around, Must-See Attractions, Best Time to Visit — good for relevance and featured snippets.
- **Tour categories:** Times Square, Central Park, Museum, Food & Culture, Broadway, Architecture — aligned with search intent.
- **FAQs:** Best time, getting around, why visit, tour types, popular tours, must-see — good for FAQ schema and snippets.
- **Guides:** “Additional fees” guide linked; “Best Things to Do” and USA Travel Guides linked; long list of 46 category guides at bottom.

#### Recommendations

1. **Title tag (implemented)**  
   For destinations that have `seo.title` in data (e.g. NYC), the page now uses it:  
   **“New York City Tours & Excursions - Top-Rated Activities & Adventures | TopTours.ai”**  
   That targets “New York City tours” and “NYC tours” better than the generic “Things to Do in …”. Other Tier 1 destinations can get the same treatment by setting `seo.title` in `destinationsData.js`.

2. **Meta description**  
   Keep the current one or tighten: e.g.  
   *“Discover 2,600+ New York City tours: Broadway, Central Park, food tours & more. Compare prices, read guides, and book the best NYC activities. Updated 2026.”*  
   Stay under ~155 characters and include a light CTA or year.

3. **H1**  
   Current “Things to do in / New York City” is good for the query “things to do in New York City”. No change required. Optionally you could test “New York City Tours & Things to Do” for stronger “tours” signal; only test one variant.

4. **Internal links to key guides**  
   You have 46 guides; most are only linked in the long list at the bottom. Add a **“Popular guides for New York City”** block (e.g. after Popular Pages or before Tour Operators) with 6–8 links to high-intent guides: e.g. New York City Airport Transfers, Central Park Tours, Broadway Shows, Food & Culture Tours, Architecture Tours, Best Things to Do. That spreads link equity and helps those pages get crawled and indexed faster.

5. **Why Visit / Must-See**  
   Content is solid. For Tier 1 you could add 1–2 bullets or one short sentence so the section is a bit more substantial (e.g. one more “why” or one more must-see with a line of context). Not required.

6. **FAQ schema**  
   The destination page already outputs FAQ schema (from `page.js`). Ensure every FAQ you show on the page has a matching `Question`/`Answer` in that schema so Google can show them as rich results.

7. **Tier 1 list**  
   Document Tier 1 destinations (starting with **New York City**) in this plan or in a small config. Use the list to: (a) ensure each has a strong `seo.title` and `seo.description` in data, (b) add the “Popular guides” block on the landing page for those destinations (or for all, with no downside), (c) prioritize them for homepage or /destinations featured links if you add that later.

#### Tier 1 list (starter)

- **New York City** (implemented: uses `seo.title` from data)
- Add next: e.g. Paris, Barcelona, London, Rome, Amsterdam, Dubai, Tokyo, Los Angeles, Miami, Las Vegas — based on GSC performance and commercial value.

---

#### Why the NYC page should help NYC’s pages (not other destinations)

You’re correct: the NYC landing page should pass link equity and crawl priority to **this destination’s** pages (NYC /tours, NYC guides, NYC car rentals, etc.), not to Chicago or Miami. Links to “More North America Destinations” help those other pages; they don’t help the NYC page rank for NYC. So for Tier 1 we **prioritize same-destination links** and **reduce or move** big lists of other destinations and the full guide list. Crawl budget is finite: too many links on one page can mean Google spends less time on the most important URLs (this destination’s /tours and key guides). Doing this right means: fewer links on the main landing, and most of them point to NYC’s own child pages.

---

#### Concrete changes for the New York City landing page (implementation spec)

Use this as a checklist for the NYC destination page (and later for other Tier 1). No code is changed in this doc; implement in the destination client/layout as needed.

| # | What | Concrete action |
|---|------|------------------|
| 1 | **Primary links (keep)** | Keep hero CTAs and Popular Pages: **Explore Tours** → `/destinations/new-york-city/tours`, **Read Guides** → `/destinations/new-york-city/guides`, Car Rentals, Airport Transfers, Baby Equipment. All of these are **NYC URLs**. No change. |
| 2 | **Add “Popular guides for New York City”** | Add one new section (e.g. after Popular Pages or before Tour Operators). Show **6–8** links only, to high-intent NYC guides, e.g.: New York City Airport Transfers, Central Park Tours, Broadway Shows, Food & Culture Tours, Architecture Tours, Best Things to Do in New York City, plus 1–2 more (e.g. Museum Tours, Day Trips). Each link goes to `/destinations/new-york-city/guides/[category-slug]`. This sends equity to **NYC’s** guide pages. |
| 3 | **Full list of 46 NYC guides** | Do **not** list all 46 on the landing page. Keep the 6–8 “Popular guides” (above). Replace the long list of 46 guide links with a single line: **“View all 46 guides →”** linking to `/destinations/new-york-city/guides`. The full list stays on the guides index page. Result: fewer links on the landing, crawl and equity focused on key guides + the guides hub. |
| 4 | **“More North America Destinations”** | Shorten to **5–8** destinations (e.g. Chicago, Miami, Las Vegas, Los Angeles, San Francisco, Orlando, Boston, Washington D.C.). Move this block **lower** on the page (e.g. after Tour Operators or before footer). Optionally rename to “Explore more in North America” and style as a compact row of links. Do **not** list 20+ destinations on the NYC page. Full list of all destinations stays on `/destinations`. |
| 5 | **“North America Travel Guides” / “USA Travel Guides”** | If this section links to **non-NYC** guides (e.g. “Exploring Los Angeles”, “Miami Water Sports”), either: (a) limit to **3–5** links and move lower, or (b) replace with a **“More New York City guides”** link to `/destinations/new-york-city/guides`. Prefer making the NYC page NYC-centric so most links point to NYC’s own pages. |
| 6 | **Tour categories (Times Square, Central Park, etc.)** | Keep. These link to NYC /tours with filters or to NYC category guides; they support the same destination. |
| 7 | **“Additional fees” guide** | Keep (single link to one NYC guide). |
| 8 | **Link count** | Aim for a clear majority of same-destination links (NYC /tours, NYC /guides, NYC guides, NYC car rentals, etc.) and a **total** number of links on the main content that feels reasonable (e.g. well under 100 for the above-the-fold + main sections). Full lists live on hub pages (/guides, /destinations). |

**Outcome:** The NYC landing page clearly supports **NYC’s** pages. Crawl and relevance stay focused on NYC /tours and key NYC guides. Other destinations and the full guide list are one click away on their own pages. Apply the same pattern to other Tier 1 destinations when you’re ready.

---

## 4. What “success” looks like in 90 days

- **Impressions:** Up vs last 90 days, especially for Tier 1 destinations and “[Destination] tours” queries.
- **Clicks:** Up, with a clear share coming from Tier 1 destination and /tours pages (check in GSC by page).
- **Position:** Average position for target queries (e.g. “[City] tours”, “things to do in [City]”) improved by 2–5 positions where you’ve deepened content.
- **Index:** Either (A) 177k indexed stable or slightly down (if you noindex some tour pages) with **higher** clicks, or (B) indexed stable with more impressions/clicks from the same or slightly smaller set of URLs. “More indexed” is not the goal; “more traffic from the right pages” is.

---

## 5. Summary checklist

- [x] Submit tour sitemap index in GSC (**done**).
- [x] Add tour sitemap to `robots.js` (**done**).
- [ ] Export GSC Pages + Queries (90 days); identify top pages and queries.
- [ ] Define 10–20 Tier 1 destinations (for extra internal links and title/meta only); document them.
- [ ] For Tier 1: ensure strong internal links from homepage/destinations; refine titles and meta using GSC data.
- [ ] Help new guides get discovered/indexed (sitemap already includes them; request indexing for a few key URLs if useful).
- [ ] No pruning: keep all destinations and tour pages indexable.
- [ ] Review after 90 days: impressions, clicks, and share from key pages.

---

---

## 6. Title templates: current vs suggested, and “| TopTours.ai”

### 6.1 Current state (codebase)

| Page type | Current title (what you set) | Layout adds | Final in HTML |
|-----------|-----------------------------|-------------|----------------|
| **Destination** | `Things to Do in {Name} – Tours, Guides & Travel Tips` (one template for all) | ` \| TopTours.ai™` | Good, keyword-rich. |
| **Tour** | `{Tour title} in {Destination} \| Reviews, Price & Booking` (from `buildEnhancedTitle`) | ` \| TopTours.ai™` | Good; includes destination + intent. |
| **Guide (category)** | `seo.title` or `guideData.title` or `Best {Dest} {Category}` or `Guide` | ` \| TopTours.ai™` | Fallback “Guide” is weak. |
| **Travel guide (blog)** | Was `{Guide title} \| TopTours.ai` → **fixed** to `{Guide title}` | ` \| TopTours.ai™` | No duplicate brand. |

So: **destinations and tours are already in good shape.** Only guide fallback could be stronger (e.g. `{Guide title} \| {Destination} Guide` when no `seo.title`).

### 6.2 Do we need “| TopTours.ai” in every title? Is it dead space?

- **What it does:** The root layout uses `template: '%s | TopTours.ai™'`, so every page gets the brand at the end. That helps **recognition and trust** in SERPs (users see it’s you).
- **“Dead space”?** Google often shows only the first **~50–60 characters**. So for long titles (e.g. tour titles), the part that gets cut is usually the end — i.e. the brand. So the “visible” part is already the keyword-rich bit; the brand isn’t eating into what users see for long titles.
- **Recommendation:** **Keep the brand suffix.** Use a short one so it doesn’t push the limit: e.g. ` \| TopTours.ai` (or keep ` \| TopTours.ai™`). You can shorten to ` \| TopTours` to free a few characters if you want, but it’s optional. Don’t remove it entirely on inner pages; a consistent brand in the title is still useful when the title is short enough to show it.

### 6.3 Optional tweaks (only if you want to align with the “one size fits all” wording)

- **Destination:** Current “Things to Do in {Name} – Tours, Guides & Travel Tips” is strong. Optional: “{Name} Tours & Things to Do” if you prefer destination-first; not required.
- **Tour:** Already “{Tour} in {Destination} | Reviews, Price & Booking” — no change needed.
- **Guides (category):** When there’s no `seo.title`, use a fallback like “{Guide title} | {Destination} Guide” instead of “Guide” so the title is always descriptive.

---

## 7. Click drop and restaurant removal (Mar 2026)

### 7.1 Did removing restaurants cause the drop?

**Very likely, in part.** You had ~10k restaurant pages + restaurant hubs removed (301 to destination or /destinations). Before removal, many impressions and clicks could have come from:

- Queries like “best restaurants [destination]”, “[city] restaurants”, “restaurants in Aruba”.
- Those URLs had their own SERP real estate. After 301s, Google consolidates to the destination URL, but:
  - You no longer have a dedicated “restaurants” result, so you can lose the click for that intent.
  - Destination pages may not rank as well for “restaurants” as the old restaurant pages did.
  - Overall impressions can drop as Google drops the old URLs from the index and replaces them with the destination.

So a drop from ~50 to ~17 daily clicks over a few months is consistent with losing that long tail of restaurant traffic. It’s not the only possible factor (seasonality, competition, algorithm), but it’s a plausible and important one.

### 7.2 What’s already in place

- **301 redirects:** `/restaurants` → `/destinations`; `/destinations/:id/restaurants` and `/destinations/:id/restaurants/:path*` → `/destinations/:id`. Equity is passed to the destination; no 404s.
- **Internal link fix:** The restaurants hub “View Restaurants” CTA now links directly to `/destinations/[id]` with “Explore [destination]” so we don’t point to a redirect with a misleading label.

### 7.3 What to do next (recovery and optimization)

| Priority | Action |
|----------|--------|
| **1. GSC data** | Export **Pages** and **Queries** (last 90 days). See which **pages** still get impressions/clicks and which **queries** they rank for. That shows what’s left after the restaurant drop and where to double down. |
| **2. Tier 1 destinations** | Pick 10–20 priority destinations (e.g. NYC, Paris, Barcelona, London) from GSC + commercial value. Give them stronger titles/meta and more internal links from homepage and /destinations (see 3.2, 3.7). |
| **3. Titles and meta** | Use GSC Queries: find queries with decent impressions but CTR &lt; ~2% or position 5–15. Improve **title** and **meta description** for those pages (see 3.5). |
| **4. Internal linking** | On Tier 1 destination pages, add a short “Popular guides” block (6–8 links to key guides) and trim long lists of other destinations/guides so most links stay same-destination (see 3.7). |
| **5. No new pruning** | Don’t remove or noindex more sections. Grow traffic from tours, destinations, and guides instead. |

### 7.4 Realistic expectations

- Restaurant traffic is unlikely to “come back” as restaurant traffic; the 301s correctly pass equity to destinations, but the specific “restaurant” SERP role is gone.
- Recovery should come from: **better visibility for destination and tour pages** (titles, meta, internal links, Tier 1 focus) and **guides** getting indexed and ranking. The 90-day plan (sections 3–5) is the right roadmap for that.

---

## 8. Forecast: next 90 days, 6 months, 12 months (based on past 90 days)

**What the past 90 days showed:**  
- **Dec 7–16:** ~42 clicks/day, ~9.5k impressions/day, position ~23.  
- **Dec 17 – early Jan:** Drop to ~30 clicks, ~5.5k impressions (likely start of restaurant removal impact).  
- **Jan 3–6:** Short spike (52–64 clicks, position 15–17).  
- **Jan 19 – Feb 3:** Impressions rose to 8k–21k but position worsened (25–30), CTR ~0.3–0.5%.  
- **Feb 4 – Mar 6:** Gradual decline; **recent baseline ~20–27 clicks/day, ~5.5k–7k impressions**, position 16–25.

So the **current baseline** (post–restaurant removal, before new titles fully re-indexed) is roughly **~22 clicks/day, ~6k impressions/day, position ~22**.

### 8.1 Next 90 days (Mar – May 2026)

| Scenario | Clicks/day (approx) | Impressions/day (approx) | Notes |
|----------|---------------------|---------------------------|--------|
| **Baseline** | 18–25 | 5k–7k | No major change; new titles still rolling out, minimal extra action. |
| **Recovery** | 28–38 | 7k–10k | New destination/tour titles and meta get re-indexed; CTR improves a bit on key queries. |
| **Upside** | 35–50 | 9k–14k | Re-indexing + you do GSC-driven title/description tweaks and Tier 1 internal linking. |

**Realistic for next 90 days:** **25–35 clicks/day, 6k–9k impressions/day.** Small improvement as Google recrawls and shows updated titles; no big jump unless you actively optimise from GSC data.

### 8.2 Next 6 months (by Aug 2026)

| Scenario | Clicks/day (approx) | Impressions/day (approx) | Notes |
|----------|---------------------|---------------------------|--------|
| **Baseline** | 22–30 | 6k–8k | Stable; no new pruning, no big content/SEO push. |
| **Recovery** | 35–50 | 9k–14k | Titles/meta and internal linking pay off; more “[destination] tours” visibility. |
| **Upside** | 45–65 | 12k–18k | Consistent optimisation (titles, descriptions, Tier 1 links, guides); some seasonality (summer travel). |

**Realistic for 6 months:** **35–50 clicks/day, 9k–14k impressions/day.** Assumes you do the planned title/meta and internal-linking work; 6 months is enough for re-indexing and some ranking/CTR gains.

### 8.3 Next 12 months (by Mar 2027)

Your **best recent month** (late Jan – early Feb 2026) was **~50–77 clicks/day** and **~13k–21k impressions/day**. The 12‑month target is to **at least match that** and ideally grow past it.

| Scenario | Clicks/day (approx) | Impressions/day (approx) | Notes |
|----------|---------------------|---------------------------|--------|
| **Baseline** | 30–45 | 8k–12k | Slow recovery; no major SEO push. |
| **Recovery** | 55–80 | 14k–20k | Back to or above your Feb 2026 peak; titles/meta and internal linking pay off. |
| **Upside** | 70–100+ | 18k–25k+ | Sustained SEO + content; seasonal peaks; clear growth above previous peak. |

**Realistic for 12 months:** **55–85 clicks/day, 14k–20k impressions/day** — i.e. **match or exceed your last strong month**. **70–100+ clicks/day** is possible with consistent optimisation and no further big removals.

### 8.4 What drives the range

- **Downside:** No action on GSC data; new titles take a long time to re-index; more competition; no new content.
- **Upside:** Re-indexing of new titles; GSC-based title/description improvements; Tier 1 internal linking; guides indexing; seasonal demand; no further big removals (like restaurants).

**Summary:** Use **~22 clicks / ~6k impressions** as today’s baseline. Expect **next 90 days** in the **25–35 clicks / 6k–9k impressions** range and **6 months** in **35–50 clicks / 9k–14k impressions**. By **12 months**, the aim is to **match or beat your best recent month** (50–77 clicks, 13k–21k impressions): **55–85 clicks/day, 14k–20k impressions/day** with consistent execution, and **70–100+** if you push SEO and content.

---

*Doc generated as SEO plan; no code changes in this file. Implement technical parts (robots, sitemap, optional noindex) in codebase as needed.*
