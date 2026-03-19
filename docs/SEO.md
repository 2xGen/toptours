# SEO notes (TopTours.ai)

## Canonical & Open Graph URLs

Use `@/lib/siteUrl`:

- `getSiteOrigin()` — HTTPS site root (from `NEXT_PUBLIC_BASE_URL` or `https://toptours.ai`).
- `absoluteUrl('/path')` — full URL for `alternates.canonical`, `openGraph.url`, and JSON-LD.

This keeps **staging/preview** correct when `NEXT_PUBLIC_BASE_URL` is set, and avoids mixed hardcoded `toptours.ai` vs env drift.

## “Partly there” on titles/descriptions

Most **marketing and destination** routes already define **unique** `title`, `description`, and **canonical** (via `generateMetadata` or route `layout.js`). Gaps were mainly:

- Some pages used **relative** canonicals while `openGraph.url` used a **different** base URL logic.
- Many strings hardcoded `https://toptours.ai` instead of the shared helper.

**Still worth checking over time:** dynamic templates (`/tours/[productId]`, `/explore/...`, nested destination guides) — spot-check in GSC for duplicates or thin descriptions.

## BreadcrumbList

Destination hubs (`/destinations/[id]`) emit **BreadcrumbList** JSON-LD: Home → Destinations → destination name, with URLs from `siteUrl`.

## `/terms`, `/cookie-policy`, `/disclosure` and robots

`app/robots.js` **disallows** those paths for `User-agent: *` to reduce **non-Google scraper volume**. **Googlebot** has a separate rule **without** those disallows, so you can still index legal pages in Google when desired. Footer links remain valid for users.

## “Crawled – currently not indexed” (GSC) — what it means

Google **fetched** the URL but **chose not to put it in the main index** (yet or at all). It is **not** the same as a crawl error. Common reasons:

| Cause | What to do |
|--------|------------|
| **Sitemap vs reality** | Sitemap should list **final canonical URLs**, not URLs that **301** elsewhere. (Fixed: removed `/tours` → destinations, `/how-it-works` → match-your-style; added `/match-your-style`.) |
| **Duplicate / near-duplicate** | Many tour/listing pages look like other sites (e.g. supplier text). Add **unique** intros, FAQs, editorial blocks, and clear **internal links** to hub pages. |
| **Scale** | Very large sites get **selective indexing**. Prioritize **money pages** (top destinations, best guides) with strong internal links from home and `/destinations`. |
| **Thin or boilerplate** | Pages with little unique text are deprioritized. Strengthen **title + meta description + above-the-fold copy** per URL. |
| **Quality / trust** | Overall site quality affects all URLs. Build **real backlinks**, consistent NAP/branding, fast CWV. |

### Practical workflow in GSC

1. Open **Pages** → **Crawled – currently not indexed** → pick a **sample URL**.
2. Use **URL Inspection** → **View crawled page** — confirm it’s not a soft 404 and content is visible.
3. Check **canonical** (your tag vs Google-selected). Align internal links and sitemap with **one** preferred URL.
4. For high-value URLs, add **more internal links** from indexed pages (destination hub, guides index, related tours).

### Sitemap hygiene (implemented in `lib/sitemapData.js`)

- **`lastModified`**: Most URLs use **generation time** (`new Date().toISOString()` on each build/request) so you never ship a stale fixed date. Tag guides use **`tag_guide_content.updated_at`** when present.
- **Tour sitemap index** (`app/sitemap-tours/route.js`): `<lastmod>` is **today’s date** at generation time (replaced old hardcoded `2026-02-11`).
- Use **`getSiteOrigin()`** so staging builds don’t poison production sitemap URLs.
- Do **not** list redirect-only paths as if they were real pages.
- **Tag guide URLs** are only included if cached `tag_guide_content` has **enough body text** (~400+ chars across intro/subtitle/SEO/FAQs). Thin shells stay **out of the sitemap** (still reachable via internal links).

### Faceted tour listings (`/destinations/.../tours?search=...`)

Any **query string** on the destination tours listing → **`noindex, follow`** + **canonical** = clean `/destinations/{id}/tours`. Stops Google from treating every filter/search combo as its own “page” to index.

---

## Reading your GSC “Why pages aren’t indexed” table

| Reason | What it usually means for TopTours |
|--------|-----------------------------------|
| **Excluded by `noindex`** | **Expected** for: **tag guide placeholders** (UI says “Generate this guide with AI” — no unique body in `tag_guide_content` yet), true 404 guides, unknown destinations, and **faceted** `?search=` tour URLs. After AI fills `tag_guide_content`, the same URL becomes **`index`** with real copy. |
| **Page with redirect** | Google hit URL A and got a **301/302** to B. Fix **internal links** and **sitemap** so they point at **B** (final URL). Numeric ID → slug redirects count here. |
| **Crawled – currently not indexed** | Google saw the page but **declined to index** (thin, duplicate vs Viator/supplier, or crawl budget). **Not fixed by a single meta tag** — improve **unique copy**, **internal links** to money pages, and **don’t push thin URLs** in sitemap. |
| **Duplicate without user-selected canonical** | Missing or inconsistent **`<link rel="canonical">`** (or conflicting signals). Audit templates and **one URL per logical page**. |
| **Soft 404** | Page looks empty or “no results” but returns **200**. Treat as UX + SEO bug for those URLs. |
| **404 / 5xx** | Broken or error URLs — fix or remove from sitemap. |

**Validation “Failed”** in GSC often means Google **re-crawled** and still sees the same pattern (e.g. many `noindex` URLs still exist). After deploy, use **“Validate fix”** only when you’ve actually changed the underlying URLs or tags.
