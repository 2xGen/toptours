# Explore Ingest & Scaling (v3 Landing)

How to scale explore categories, subcategories, and tours across many destinations (e.g. NYC × 15 categories × 6–9 subcategories × 12 tours, then 40–50 destinations) without doing everything by hand.

## What is the ingest for?

The ingest **writes tour data into the database** so the site doesn’t have to call the Viator API on every page load. It updates `v3_landing_category_tours` with:

- **image_url** – so tour cards and landing “Popular now” show a photo  
- **from_price** – so cards show “Price from $X”  
- **rating** and **review_count** – for stars and review counts on cards  

After you run the ingest (or add new tours via SQL seeds), run it again so those new rows get images and prices from Viator. The app can still fall back to a live API call when a row has no image/price, but storing them in the DB keeps pages fast and reduces API usage.

## One script for all category tours

Use **one generic ingest script** instead of one script per category:

```bash
# All NYC categories in one go (recommended after adding new categories or tours)
node scripts/ingest-all-nyc-categories.js

# Or use the generic script directly:
# Ingest a single category (e.g. Broadway)
node scripts/ingest-category-tours.js --destination=new-york-city --category=broadway-shows

# Ingest all categories for one destination (e.g. all NYC explore categories)
node scripts/ingest-category-tours.js --destination=new-york-city

# Ingest every (destination, category) in the DB (all explore tours, all destinations)
node scripts/ingest-category-tours.js
```

- Reads product IDs from `v3_landing_category_tours` for the chosen scope.
- Calls Viator `/products/bulk` (and schedules for from-price) in batches of 500.
- Writes back `image_url`, `from_price`, `rating`, `review_count`.

**Env:** Same as before: `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VIATOR_API_KEY`, `VIATOR_USE_LIVE_API=true`.

## Scaling content: add once, ingest once

### 1. Define structure in SQL (or seed files)

- **Categories** already live in `v3_landing_categories` (e.g. NYC: central-park-tours, broadway-shows, food-tours, …).
- **Category page SEO** and **tours** and **subcategories** live in:
  - `v3_landing_category_pages`
  - `v3_landing_category_tours`
  - `v3_landing_category_subcategories`

To add a **new category** (e.g. a 3rd NYC category):

1. Ensure the category row exists in `v3_landing_categories` (often already seeded).
2. Add one row to `v3_landing_category_pages` (hero, about, FAQs).
3. Add N rows to `v3_landing_category_tours` (product_id, title, tour_slug, position, is_top_pick).
4. Add 6–9 rows to `v3_landing_category_subcategories` (slug, title, product_ids, description, why_book, what_to_expect, summary_paragraph, faq_json).

You can:

- Maintain **one SQL seed file** (e.g. `docs/v3_landing_category_pages_schema_and_seed.sql`) and append new destinations/categories in blocks, or
- Split by destination (e.g. `docs/seeds/explore_nyc.sql`, `explore_miami.sql`) and run them in order.

### 2. Batch seed from config (optional future step)

To avoid hand-writing hundreds of SQL rows:

- **Option A:** Export a CSV/JSON per destination (columns: category_slug, subcategory_slug, product_id, title, tour_slug, position, is_top_pick, subcategory product_ids, etc.) and a **small Node script** that reads the file and does `supabase.from('v3_landing_category_tours').upsert(...)` and the same for subcategories. Schema stays the same; only the source of truth becomes the CSV/JSON.
- **Option B:** Keep SQL as source of truth but generate the INSERT blocks from a single **config file** (e.g. `explore_categories.yaml` or JSON) with a build script that outputs the SQL. That way “add 15 categories for NYC” is one config change + one script run.

### 3. Run ingest after schema/seed changes

After adding or changing tours in `v3_landing_category_tours`:

```bash
# Single category
node scripts/ingest-category-tours.js --destination=new-york-city --category=broadway-shows

# Whole destination (e.g. all NYC explore categories)
node scripts/ingest-category-tours.js --destination=new-york-city

# Everything (e.g. after a big seed for 40–50 destinations)
node scripts/ingest-category-tours.js
```

No per-category scripts needed; the same script scales to 15 categories in NYC and then 40–50 destinations.

## Summary

| Task | Approach |
|------|----------|
| Refresh images/prices/ratings for explore tours | `ingest-category-tours.js` with `--destination` and/or `--category` or no args |
| Add a new category (e.g. Broadway) | Add SQL blocks for `v3_landing_category_pages`, `v3_landing_category_tours`, `v3_landing_category_subcategories`; run ingest for that destination/category |
| Scale to many destinations | Same SQL + ingest; optionally add config-driven seed or CSV → DB script later |
| Avoid duplicate scripts | Use only `ingest-category-tours.js`; deprecate per-category ingest scripts |

The old `ingest-central-park-tours.js` can stay as a thin wrapper that calls the generic script with `--destination=new-york-city --category=central-park-tours` for backward compatibility, or be removed once everything uses `ingest-category-tours.js`.
