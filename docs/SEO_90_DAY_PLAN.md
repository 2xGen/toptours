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

*Doc generated as SEO plan; no code changes in this file. Implement technical parts (robots, sitemap, optional noindex) in codebase as needed.*
