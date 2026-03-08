# Google Search Console Indexing Issues – Causes & Fixes

This doc explains why you see large “not indexed” counts and how to fix them.

---

## 1. "Page with redirect" (9,701 pages)

**What it means:** Google discovered a URL that **redirects** to another URL (e.g. `http://` → `https://`, or `www.toptours.ai` → `toptours.ai`). Google indexes the **destination** (canonical), not the redirecting URL, so the redirecting URL is reported as “Page with redirect” and “not indexed.”

**Why you see it:**
- **HTTP vs HTTPS:** If Google (or links elsewhere) use `http://toptours.ai/`, that redirects to `https://toptours.ai/`. The HTTP URL is “not indexed”; the HTTPS one is.
- **www:** Vercel has `www.toptours.ai` → 307 → `toptours.ai`. Every `www` URL is a redirect and counts here.
- **blog.toptours.ai:** Redirects to `toptours.ai`. Any discovered `blog.toptours.ai` URL is “Page with redirect.”

**What to do:**
- **Canonicals:** Ensure every page’s canonical is **always** `https://toptours.ai/...` (no `http://`, no `www`). The codebase uses `metadataBase: new URL('https://toptours.ai')` in `app/layout.js` and explicit canonicals elsewhere; keep them HTTPS-only.
- **Base URL:** Don’t use `process.env.NEXT_PUBLIC_BASE_URL` for canonicals if it could ever be `http://` or `www`. Prefer a fixed `https://toptours.ai` for SEO URLs (see code fix below).
- **GSC:** Use a **single property** for the canonical site: **`https://toptours.ai`** (no “www”, no “http”). You can add `www` and `http` as properties to monitor redirects, but expect many “Page with redirect” there; the main property should be `https://toptours.ai`.
- **Internal links / sitemaps:** All internal links and sitemap URLs should use `https://toptours.ai`. That reduces discovery of `http`/`www` URLs and keeps “Page with redirect” from growing unnecessarily.

**Result:** The 9.7k “Page with redirect” count is expected for a site that normalizes to one canonical host. It’s not an error; focus on having one canonical property and correct canonicals in the code.

---

## 2. "Excluded by ‘noindex’ tag" (24,664 pages)

**What it means:** Those URLs return **200** with a **meta robots noindex** (or equivalent). Google respects it and does not index them.

**Where noindex is set in your app:**
- **Placeholder guide pages:** `/destinations/[id]/guides/[category]` when the guide has no content yet (“Generate with AI” placeholder). Many destination × category combinations can be placeholders, so this can be tens of thousands of URLs.
- **Missing data:** Destination page, destination/tours, destination/guides, restaurant page, restaurant guide – when the entity (destination, restaurant, etc.) is not found, the app either returns **404** or, in some code paths, **200 + noindex**.
- **Admin:** `/admin-matthijs/`, `/admin-matthijs/partner-guides` are noindex by design.

**What to do:**
- **Placeholder guides:** You have two options:
  - **A) Keep noindex (current):** Placeholder guides stay noindex. They still get crawled and count as “Excluded by noindex.” To reduce the number, avoid **linking** to placeholder guides from indexable pages (e.g. only link to guides that exist in DB or have tag content). That way Google discovers fewer of them.
  - **B) 404 placeholders:** For guides that have no content, call `notFound()` so the URL returns 404 instead of 200 + noindex. Then they’ll appear under “Not found (404)” instead of “Excluded by noindex,” and you don’t “waste” crawl budget on thin pages.
- **Other noindex:** Keep noindex for admin. For destination/restaurant “not found” cases, prefer **404** so Google doesn’t index empty shells.

**Result:** Reducing internal links to placeholder guides (or 404’ing them) will lower the “Excluded by noindex” count and keep crawl budget for important URLs.

---

## 3. "Crawled - currently not indexed" (182,957 pages)

**What it means:** Google **crawled** the URL but **chose not to index** it (no manual noindex, no redirect). Usually due to **quality**, **volume**, or **similarity** (e.g. too many similar or low-value pages).

**Why you see it:**
- **Scale:** You have 300k+ tour URLs, 3.3k+ destinations, and many guide URLs. Google can’t index everything; it prioritizes.
- **Thin or similar content:** Many tour or guide pages may be seen as low added value or duplicate-like.
- **Crawl budget:** Google crawls a lot but indexes a subset. “Crawled - currently not indexed” is that subset.

**What to do:**
- **Prioritize in sitemaps:** Put the most important URLs in the main sitemap with higher priority (you already use priorities). Keep tour URLs in the tour sitemap; don’t mix low-value URLs into the main sitemap.
- **Content and UX:** Improve unique value (copy, structure, FAQs, internal links) on key templates (destination, key guides, top tours). Stronger signals can help more of these get indexed over time.
- **No quick fix:** This status is mostly decided by Google’s systems. Improving quality and reducing low-value URL discovery (e.g. not linking to placeholder guides) helps over time.

---

## 4. "Duplicate without user-selected canonical" (10,801 pages)

**What it means:** Google sees two (or more) URLs as duplicates and **none** of them has a clear user-declared canonical, so Google doesn’t know which to index.

**Typical causes in your setup:**
- **Tours:** `/tours/[productId]` vs `/tours/[productId]/[slug]`. You already redirect to the slug version and set canonicals; ensure **every** tour page has a single canonical (the slug URL) and that redirects are 301.
- **Trailing slash / query params:** Same path with/without trailing slash or with query params can be seen as duplicate if canonical or redirects aren’t consistent.

**What to do:**
- Ensure every page type has a **single** canonical URL (e.g. always the slug version for tours).
- Use **301 redirects** from non-canonical to canonical (e.g. `/tours/123` → `/tours/123/tour-name`) so only one URL is crawlable.
- In `next.config.js` / Vercel, enforce **trailing slash** (or no trailing slash) site-wide so you don’t have two versions of each URL.

---

## 5. "Discovery > Sitemaps – Temporary processing error"

**What it means:** When Google tries to fetch your sitemap, something fails on their side (timeout, error parsing, or “try again later”).

**Possible causes:**
- **Sitemap too large:** Google allows **max 50,000 URLs per sitemap**. If `app/sitemap.js` returns more than 50k entries, split into multiple sitemaps and a sitemap index (e.g. `sitemap.xml` = index, `sitemap-pages.xml`, `sitemap-guides.xml`, etc.).
- **Slow generation:** If the sitemap is built on-the-fly with many DB calls, the request can be slow and Google may timeout. Consider caching the sitemap (e.g. ISR/revalidate) or pre-generating at build time for the largest parts.
- **Transient:** Sometimes “Temporary processing error” is just a temporary Google issue. Re-submit the sitemap and wait 24–48 hours.

**What to do:**
- Count total URLs in the main sitemap (static + destinations + tour listings + operators + travel guides + baby equipment + guides listing + car rentals + category guides + tag guides + airport transfers). If **> 50,000**, split (e.g. one sitemap for “pages”, one for “guides”) and serve a sitemap index at `https://toptours.ai/sitemap.xml`.
- Ensure all sitemap URLs use **https://toptours.ai** (no `http://`). Your code already uses `baseUrl = 'https://toptours.ai'` in `app/sitemap.js`; keep it that way.
- In GSC, submit only the **index** URL (e.g. `https://toptours.ai/sitemap.xml`). If the error persists, check GSC’s “Sitemaps” report for the exact error and any URL that fails.

---

## 6. URL Inspection: "http://toptours.ai/" – "Page with redirect"

**What it means:** You inspected the **HTTP** version of the homepage. That URL redirects to `https://toptours.ai/`, so it is **correctly** not indexed. The **canonical** is `https://toptours.ai/` and that’s the one that should be indexed.

**What to do:**
- In URL Inspection, use **`https://toptours.ai/`** (HTTPS). You should see “URL is on Google” (or “Submitted and indexed”) for that.
- Ensure your default property in GSC is **`https://toptours.ai`** so you’re not optimizing for the wrong host.

---

## Recommended sitemaps for GSC

Your **app** already generates everything you need via two URLs (both HTTPS and listed in `robots.txt`):

| Submit this | Type | What it contains |
|-------------|------|-------------------|
| **https://toptours.ai/sitemap.xml** | Sitemap index | Points to `/sitemap/0.xml` (and more if >50k URLs). Those contain: static pages, destinations, tour listings, **operators**, travel guides, baby equipment, guides listing, car rentals, **category guides**, **tag guides**, airport transfers. (~34k URLs) |
| **https://toptours.ai/sitemap-tours** | Sitemap index | Tour product pages (~284k). Points to `/sitemap-tours/0`, `/sitemap-tours/1`, etc. |

**What to do in GSC:**

1. **Use only HTTPS.** Remove **http://toptours.ai/sitemap-operators.xml** and any other `http://` sitemap. If you resubmit operators, use **https://toptours.ai/sitemap-operators.xml**.
2. **Optional cleanup:** The static sitemaps below are **redundant** — their URLs are already in the main sitemap (sitemap.xml → sitemap/0.xml). You can **remove** them from GSC to avoid duplicate discovery and keep things simple:
   - https://toptours.ai/sitemap-operators.xml (183 URLs — already in main sitemap)
   - https://toptours.ai/sitemap-guides.xml (20,078 — already in main sitemap)
   - https://toptours.ai/sitemap-destinations-without-guides.xml (2 — already in main sitemap)
3. **Recommended set:** Submit only:
   - **https://toptours.ai/sitemap.xml**
   - **https://toptours.ai/sitemap-tours**

That matches `robots.txt` and gives Google one place for “pages” and one for “tours” without duplicate or HTTP sitemaps.

---

## Summary checklist

| Issue | Action |
|--------|--------|
| Page with redirect | Use one GSC property: `https://toptours.ai`. Canonicals and links always HTTPS. |
| noindex (24k) | Reduce links to placeholder guides, or 404 placeholder guides instead of noindex. |
| Crawled - not indexed | Improve content/UX on key templates; keep sitemap priorities; accept gradual improvement. |
| Duplicate without canonical | One canonical per page; 301 from non-canonical (e.g. tour without slug → with slug). |
| Sitemap temporary error | Keep sitemap &lt; 50k URLs or split into index + multiple sitemaps; use HTTPS in sitemaps. |
| Inspecting http:// homepage | Inspect `https://toptours.ai/` instead; that’s the indexed URL. |

---

## Code change: Canonical and base URL always HTTPS

To avoid any env misconfiguration (e.g. `NEXT_PUBLIC_BASE_URL=http://...`) from affecting indexing, use a fixed canonical base for the homepage and other critical SEO URLs. In `app/page.js`, the canonical and Open Graph URL are already backed by a fallback to `https://toptours.ai`; for maximum safety, always use the canonical origin for SEO-related fields (see change in repo: force `https://toptours.ai` for homepage canonical/OG).
