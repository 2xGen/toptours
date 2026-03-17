# Import Aruba explore from aruba-export.json

Imports the Aru365 Aruba content into the v3 explore tables so **https://toptours.ai/explore/aruba** works like the NYC explore page.

## Prerequisites

- **aruba-export.json** from the Aru365 website repo (e.g. `C:\...\Aru365\website\aruba-export.json`).
- `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## Run

From project root:

```bash
# Pass path to the export file
node scripts/import-aruba-explore.js "C:\Users\matth\OneDrive\Bureaublad\Werk\Aru365\website\aruba-export.json"
```

Or set the path in env and run without args:

```bash
set ARUBA_EXPORT_JSON=C:\path\to\aruba-export.json
node scripts/import-aruba-explore.js
```

Or copy `aruba-export.json` into the TopTours project root and run:

```bash
node scripts/import-aruba-explore.js
```

## What it does

1. **Deletes** existing Aruba rows in:  
   `v3_landing_category_tours` → `v3_landing_category_subcategories` → `v3_landing_category_pages` → `v3_landing_categories` → `v3_landing_top_picks`.

2. **Inserts**:
   - **v3_landing_destinations**: one row for `aruba`.
   - **v3_landing_categories**: 12 categories from the export.
   - **v3_landing_category_pages**: about, FAQs, insider tips, etc. per category.
   - **v3_landing_top_picks**: first product of each of the first 6 categories (for the landing “Top picks” strip).
   - **v3_landing_category_subcategories**: subpages with `product_ids` from the export’s `picks` (tour slug → product code).
   - **v3_landing_category_tours**: all tours per category (from `pillarProductCodes` + `tours`), with position, `is_top_pick` (first 4 per category), and SEO/FAQs when present in the export.

## After import

- Open **https://toptours.ai/explore/aruba** (same structure as NYC).
- Add **Aruba** to the Explore nav dropdown in `src/components/NavigationNext.jsx` if you want it in the main nav.
- Run your existing **unique content / SEO / FAQ** scripts if you want to refine or regenerate copy.
- Ensure **viator_products** has payloads for the Aruba product codes (e.g. run your Viator ingest for those codes) so images and prices show.
