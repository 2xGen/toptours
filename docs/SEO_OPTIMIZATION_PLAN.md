# SEO optimization plan: categories, subcategories & single tours

This doc describes how to optimize SEO across **category pages**, **subcategory pages**, and **single tour pages** with unique content, rich FAQs, “who is this for,” insider tips, and meta tags.

---

## 1. Current state

| Level | Table / source | SEO fields available | Used in UI / meta? |
|-------|----------------|----------------------|--------------------|
| **Category** | `v3_landing_category_pages` | `hero_description`, `about`, `insider_tips`, `what_to_expect`, `who_is_this_for`, `highlights`, `faq_json` | Yes (ExploreCategoryClient). Meta uses category `description` from categories list. |
| **Subcategory** | `v3_landing_category_subcategories` | `description`, `about`, `why_book`, `what_to_expect`, `summary_paragraph`, `faq_json` | Yes (ExploreSubcategoryClient). Meta uses `sub.description`. |
| **Single tour** | `v3_landing_category_tours` + Viator | **New:** `seo_meta_title`, `seo_meta_description`, `seo_about`, `who_is_this_for`, `insider_tips`, `faq_json`, `highlights` | Yes (ExploreTourDetailClient). Meta uses `seo_meta_title` / `seo_meta_description` when set; otherwise fallback. |

- **Categories:** Central Park, Broadway, Food, Museum have full content; Day Trips, Family & Kids, Helicopter, Cruises, Brooklyn often have minimal/placeholder content.
- **Subcategories:** Many have `description` but null/empty `why_book`, `faq_json`, and short copy.
- **Tours:** Previously only Viator data (description, inclusions, itinerary, Viator FAQs). There was no DB-backed unique content or tour-specific FAQs.

---

## 2. Schema changes (tours)

Tour-level SEO columns were added to `v3_landing_category_tours` in `docs/v3_landing_category_pages_schema_and_seed.sql`:

- `seo_meta_title` (text, nullable)
- `seo_meta_description` (text, nullable)
- `seo_about` (text, nullable) — unique “About this tour” copy; overrides Viator when set
- `who_is_this_for` (jsonb, nullable) — array of strings
- `insider_tips` (jsonb, nullable) — array of strings
- `faq_json` (jsonb, nullable) — array of `{ "question": "...", "answer": "..." }`
- `highlights` (jsonb, nullable) — array of strings

**Apply in Supabase:** Run the `ALTER TABLE` block for these columns from the schema file (or the full schema file if you haven’t yet). All new columns are nullable; existing rows are unchanged.

---

## 3. App behavior after schema

- **Metadata:** Tour pages use `seo_meta_title` and `seo_meta_description` when present; otherwise fallback to “{title} | {category} | {destination} | TopTours.ai” and a generic description.
- **Content:**  
  - **About:** If `seo_about` is set, it is shown as “About this tour”; otherwise Viator description is used.  
  - **Highlights / Who is this for / Insider tips:** Rendered only when the corresponding DB arrays are present.  
  - **FAQs:** If `faq_json` has items, those are used (and output as FAQPage JSON-LD); otherwise Viator FAQs are used.

So you can fill tour SEO gradually; until fields are populated, pages behave as before.

---

## 4. What to optimize per level

### Categories

- Differentiate **hero_description** and **about** per category (no generic copy across Day Trips, Brooklyn, etc.).
- Fill **insider_tips**, **what_to_expect**, **who_is_this_for**, **highlights**, **faq_json** where still empty or generic.
- Optional: add `meta_title` / `meta_description` to the category source (e.g. `v3_landing_category_pages` or categories table) and use them in `generateMetadata` for category pages.

### Subcategories

- Write unique **description** (and optional meta) per subcategory.
- Fill **why_book**, **summary_paragraph**, **what_to_expect**, and **faq_json** with specific, non-duplicate FAQs.
- Ensure **about** is useful where you show it on the page.

### Single tours

- **seo_meta_title** — e.g. “Central Park Bike Tour | Central Park Tours | NYC | TopTours.ai” or a custom title.
- **seo_meta_description** — 1–2 sentences, keyword-aware, no duplicate with other tours.
- **seo_about** — 1–3 short paragraphs unique to this tour (can expand or refine Viator copy).
- **who_is_this_for** — 3–6 bullets (e.g. “Families with kids 6+”, “First-time visitors”, “Photography enthusiasts”).
- **insider_tips** — 2–5 practical tips (best time, what to bring, booking tips).
- **highlights** — 4–8 short bullets (what they’ll see/do).
- **faq_json** — 3–8 Q&As specific to this tour (duration, meeting point, what’s included, cancellation, etc.).

---

## 5. How to populate content

### Manual / SQL

- Edit in Supabase Table Editor or run `UPDATE` statements.  
- **faq_json** format: `[{"question": "...", "answer": "..."}, ...]`  
- **who_is_this_for**, **insider_tips**, **highlights**: JSON arrays of strings, e.g. `["Item one", "Item two"]`.

### Bulk / CSV

- Export `destination_slug`, `category_slug`, `tour_slug` (and any existing SEO columns) to CSV.
- Add columns for `seo_meta_title`, `seo_meta_description`, `seo_about`, `who_is_this_for`, `insider_tips`, `faq_json`, `highlights`.
- Fill or generate content (e.g. with AI), then import/update via script or Supabase import (with a small script to map CSV → JSONB).

### AI-generated content (Gemini script)

- **Script:** `scripts/generate-explore-tour-seo-gemini.js` — generates SEO for tours in `v3_landing_category_tours` (the explore NYC tours at `/explore/new-york-city/...`). Reads tours from the DB; gets Viator description from **`viator_products`** (if populated by `npm run ingest-viator-products-v3`) or from the Viator API; calls Gemini; then writes `seo_meta_title`, `seo_meta_description`, `seo_about`, `who_is_this_for`, `insider_tips`, `faq_json`, `highlights` back to the same table.
- **Run:**
  - `npm run generate-explore-tour-seo` — NYC only, skips tours that already have `seo_meta_title`.
  - `node scripts/generate-explore-tour-seo-gemini.js --dry-run` — no DB writes.
  - `node scripts/generate-explore-tour-seo-gemini.js --limit 5` — first 5 tours.
  - `node scripts/generate-explore-tour-seo-gemini.js --overwrite` — regenerate even if SEO exists.
- **Env:** `GEMINI_API_KEY`, `VIATOR_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (e.g. in `.env.local`).
- **Prompting:** Human-first, no keyword stuffing or AI fluff; direct 40–60 word answer at start of `seo_about` for snippets; FAQs specific to the tour; aligned with E-E-A-T and Google 2026 Discover guidance.
- Same idea can be used for **categories** and **subcategories**: feed category/sub name + existing short description, get back richer `about`, `faq_json`, `who_is_this_for`, etc., and update the corresponding tables.

---

## 6. Checklist

- [ ] Run tour SEO schema changes in Supabase (`seo_meta_title`, `seo_meta_description`, `seo_about`, `who_is_this_for`, `insider_tips`, `faq_json`, `highlights` on `v3_landing_category_tours`).
- [ ] Categories: Replace minimal/placeholder content with unique copy and FAQs for Day Trips, Family & Kids, Helicopter, Cruises, Brooklyn, etc.
- [ ] Subcategories: Fill `why_book`, `faq_json`, `summary_paragraph`, `what_to_expect` per subcategory.
- [ ] Tours: Populate SEO fields (start with a few high-value tours; then scale via AI script or CSV).
- [ ] Optional: Add `meta_title` / `meta_description` for categories and subcategories and use them in `generateMetadata`.

Once the schema is applied and content is filled, category, subcategory, and tour pages will use the new SEO fields automatically; no further code changes are required for basic usage.
