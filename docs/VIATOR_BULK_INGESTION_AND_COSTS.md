# Viator bulk APIs, ingestion, Gemini enrichment, and lower Vercel cost

You’re right: **`POST /products/bulk`** (up to 500 product codes per request) and **`POST /availability/schedules/bulk`** can **massively reduce live calls** compared to:

- `GET /partner/products/{productId}` (used today in `app/tours/[productId]/page.js`, `pages/api/internal/viator-product/[productId].js`, `src/lib/viatorPricing.js` path for schedules, etc.)
- `GET /partner/availability/schedules/{productId}` (one call per product in `src/lib/viatorPricing.js` → `getFromPrice`)

But Viator’s own docs are strict about **what** each endpoint is for.

---

## 1. What Viator says (important)

| Endpoint | What it’s for | What it’s **not** for |
|----------|----------------|------------------------|
| **`POST /products/bulk`** | Get **full product details** for up to **500** product codes in one call. | **Not** for “ingesting or updating the whole catalog.” For that they want **`/products/modified-since`** (cursor-based incremental sync). |
| **`POST /availability/schedules/bulk`** | Availability + pricing for **all product options** for up to **500** products. | **Not** for ingesting/updating the **entire** availability catalog. For ongoing updates use **`/availability/schedules/modified-since`** (poll e.g. hourly; they allow up to every 15 min). |

So:

- **Bulk** = great for **batch refresh** of a **known set** of IDs (e.g. handpicked NYC tours, or “everything we already have in DB”).
- **Modified-since** = right way to **keep the catalog in sync** over time without polling every product.

Your idea—**import into DB, run Gemini, serve from DB**—fits the **ingestion model** described in `VERCEL_COST_INVESTIGATION.md` (Option B). Bulk is the **hammer** to backfill or refresh chunks; modified-since is the **treadmill** that keeps data fresh.

---

## 2. Why we don’t already have full product data (description, inclusions, itinerary) in the DB

**Short answer:** The products **bulk** API does return full product details (description, inclusions, itinerary, FAQs, etc.), but we **never store that response**. We only use it to build a **summary** (image, price, rating, title) and then throw the rest away.

| What | Where it happens | What we keep |
|------|------------------|--------------|
| **Bulk products** | `src/lib/viatorBulk.js` → `fetchProductsBulk()` | Calls `POST /products/bulk` and gets back an **array of full product objects**. We only run each item through `mapBulkItemToSummary(item)`, which keeps: `productCode`, `title`, `productUrl`, `fromPriceDisplay`, `imageUrl`, `rating`, `reviewCount`, `freeCancellation`. **Description, inclusions, itinerary, exclusions, FAQs are never written to any table.** |
| **Tour detail page** | `app/explore/.../[subSlug]/page.js` | Needs full product (description, inclusions, itinerary, FAQs). It does **not** use the bulk response for that. It gets data from `getCachedTour(productId)` or **GET /partner/products/{productId}** (one Viator call per tour page load when cache misses). |
| **Explore tour SEO script** | `scripts/generate-explore-tour-seo-gemini.js` | Needs Viator description (and optionally inclusions) for Gemini. It has **no** DB table to read from, so it calls **GET /partner/products/{productId}** once per tour. |

So: we *could* have all of that in the database. To get there we need:

1. **A table** (e.g. `viator_products`) with at least: `product_code` (PK), `payload` (jsonb, full product JSON), `updated_at`.
2. **An ingest step** that takes product IDs from `v3_landing_category_tours` (and/or other sources), calls **POST /products/bulk** in chunks of 500, and **upserts the full response** into that table (one row per product, payload = full object).
3. **Tour page** and **SEO script** then **read from** `viator_products` instead of calling Viator on demand. No change to the *shape* of data the UI expects—just the *source* (DB instead of live API).

Until that’s in place, description, inclusions, itinerary, and FAQs are only available by calling the single-product API (or by reusing the bulk response in memory without persisting it).

---

## 3. How this maps to your codebase

| Today | Problem | Better approach |
|-------|--------|----------------|
| Tour page loads → `getCachedTour` / `fetch` **GET /products/{id}** | One Viator call per tour when cache misses; Supabase cache is **off by default** (`VIATOR_USE_SUPABASE_CACHE` false → egress). | **Ingest** product JSON into Supabase (or similar). Tour page **reads only from DB** → no Viator call on request. |
| `getFromPrice(productId)` → **GET /availability/schedules/{id}** | One schedules call per product when pricing is needed. | **Bulk schedules** for the same batch of IDs (500 max), store `fromPrice` + currency in DB; refresh on a schedule via **schedules/modified-since** or periodic bulk refresh for handpicked sets. |
| Long `revalidate` (e.g. 7 days) on tour pages | Fewer regenerations but **compliance** with real-time model is shaky (Viator allows max **1h** cache for that model—see `VERCEL_COST_INVESTIGATION.md` §6). | **Ingestion model**: you’re not relying on long-lived Viator cache; your **DB** is the source of truth; page can be ISR/static from DB. |

---

## 4. Suggested pipeline (bulk + DB + Gemini + less dynamic)

### Phase A – Backfill / refresh by bulk (handpicked or full sync)

1. **Product IDs**  
   - From `hardcoded_destination_tours`, tour sitemap table, or **`/products/modified-since`** cursor until you’ve built the set you care about (e.g. NYC-first handpicked list).

2. **Chunk into batches of ≤500**  
   - `POST /products/bulk` with `productCodes: [...]`.  
   - Store full JSON in e.g. `viator_products` (product_code PK, raw JSON, `updated_at`).

3. **Availability/pricing**  
   - `POST /availability/schedules/bulk` with the same (or overlapping) batches.  
   - Persist `summary.fromPrice`, currency, and anything else you need for cards/SEO—**no per-tour schedules GET** at runtime.

4. **Ongoing sync**  
   - **`/products/modified-since`** with cursor on a cron (hourly or as allowed).  
   - **`/availability/schedules/modified-since`** for price/schedule changes—reduces need to bulk the whole catalog daily.

### Phase B – Gemini (unique content, not thin pages)

- Run a **script** over rows in DB: product title + Viator description + destination → **unique intro, “what to expect”, tips, FAQ**, stored in e.g. `tour_seo_enrichment` (you already have enrichment patterns in `lib/tourEnrichment` / similar).
- **Tour page** renders: **DB product JSON + enrichment**. No dependency on live Viator for HTML generation—only optional “refresh” jobs.

### Phase C – Fewer dynamic requests → lower Vercel cost

- **Tour detail** becomes **read from Supabase + static shell** (or ISR with long revalidate **from your data**, not from Viator TTL).
- **No** `getFromPrice` → Viator on each request; use stored price with periodic bulk/modified-since refresh.
- Aligns with **Option B** in `VERCEL_COST_INVESTIGATION.md`: fewer serverless invocations doing external API + heavy JSON on the critical path.

---

## 5. Compliance note

Viator allows **either**:

- **Real-time search model** – search + single product for selected product; **cache max 1h** for those responses.  
- **Ingestion model** – **no** real-time `/products/{id}` for page views; sync via **modified-since** (and bulk as **batch** refresh, not as primary catalog ingestion).

Moving to **DB-first tour pages** + **modified-since** (and bulk only for batch loads) is the path that both **cuts live calls** and **keeps you in the ingestion column**.

---

## 6. Summary

| Goal | Mechanism |
|------|-----------|
| Fewer live Viator calls | **`/products/bulk`** + **`/availability/schedules/bulk`** in chunks of 500; then serve from DB. |
| Stay compliant | Primary sync = **`/products/modified-since`** and **`/availability/schedules/modified-since`**; bulk = backfill/refresh, not “crawl entire catalog” via bulk only. |
| Unique SEO | **Gemini (or similar) batch** on stored product text → FAQs, intros, etc., written to DB. |
| Lower Vercel cost | **Less dynamic** tour routes: no per-request Viator fetch; ISR/static from ingested + enriched data. |

**References in repo:**  
- `VERCEL_COST_INVESTIGATION.md` §6 (Option B ingestion, 1h cache, compliance).  
- `src/lib/viatorCache.js` (cache off by default; re-enable carefully).  
- `src/lib/viatorPricing.js` (`getFromPrice` → single schedules GET—candidate to replace with bulk-stored pricing).  
- `scripts/bulk-populate-hardcoded-tours.js` (today uses search per category; could be followed by **bulk** fetch for collected IDs).

**Implemented for v3 explore tours:**

- **Schema:** `docs/viator_products_schema.sql` — table `viator_products` (product_code PK, payload jsonb, updated_at). Apply in Supabase first.
- **Ingest:** `npm run ingest-viator-products-v3` (or `node scripts/ingest-viator-products-v3.js`) — reads product_id from `v3_landing_category_tours`, calls **POST /products/bulk** in chunks of 500, upserts full payload into `viator_products`. Use `--dry-run` to skip DB writes.
- **Tour page:** Explore tour detail (`/explore/[dest]/[category]/[tourSlug]`) uses `getV3ViatorProduct(productId)` first, then cache/Viator API. Itinerary, inclusions, and exclusions are shown from the stored payload.
- **SEO script:** `generate-explore-tour-seo-gemini.js` reads from `viator_products` when available, then falls back to Viator API. No change to `/tours/` route.
