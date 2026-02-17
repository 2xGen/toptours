# Remove Restaurant Sitemap from Google Search Console

The site is **tours-only**. The restaurant sitemap (`https://toptours.ai/sitemap-restaurants.xml`) is no longer generated or served. Remove it from Google Search Console so Google stops crawling those URLs.

## Steps in Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console) and select the **toptours.ai** property.
2. In the left menu, go to **Sitemaps** (under "Indexing").
3. Find **sitemap-restaurants.xml** (or the full URL `https://toptours.ai/sitemap-restaurants.xml`) in the list of submitted sitemaps.
4. Click the **three dots (⋮)** next to that sitemap.
5. Choose **Remove sitemap** (or "Delete sitemap" / "Unsubmit" depending on UI wording).
6. Confirm.

## After removal

- Google will stop using this sitemap. URLs that were only in this sitemap will eventually drop out of the index or be recrawled and treated according to your live site (e.g. redirects or 404).
- The codebase no longer generates `sitemap-restaurants.xml`; the script `scripts/generate-restaurants-tours-sitemaps.js` only generates tours and operators sitemaps.
- If the file still exists on the server from an old deploy, remove `public/sitemap-restaurants.xml` in your deployment so the URL returns 404.
