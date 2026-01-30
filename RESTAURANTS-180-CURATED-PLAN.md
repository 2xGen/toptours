# Plan: Add restaurants for 180 curated destinations (max 150 each)

## Summary
- **Destinations:** 180 curated (182 minus Aruba and Curaçao, already done separately). Each currently has ~20 restaurants; target **max 150 total** per destination → **~120–130 new** each.
- **Tokens (approx.):** ~21,600 Place Details + ~900 Text Search ≈ 22,500. You have ~41k left after 9k used → ~18.5k remaining after this run.

## List and caps
- **restaurant-caps-180-destinations.json** — 180 destination IDs, each with `150` (max restaurants per destination; existing ~20 stay, so ~120–130 new uploaded).
- **Excluded:** aruba, curacao (already have many restaurants).
- Regenerate list: `node scripts/generate-restaurant-caps-180-curated.js`

## How to run
```bash
node scripts/fetch-restaurants-all-featured-destinations.js --batch-curated
```
- Processes only the 180 curated destinations (Aruba and Curaçao excluded).
- Uses per-destination cap 150 from `restaurant-caps-180-destinations.json` (max 150 total → ~120–130 new each).
- Existing restaurants are updated (by `google_place_id`); new ones are inserted until the API returns up to 150 places per destination.

**Optional:**
- `--batch-curated --test` — process 1 destination only.
- `--batch-curated --limit 5` — process first 5 destinations.
- `--batch-curated --skip-existing` — skip Place Details for places already in DB (saves tokens on re-runs).

## After the run
```bash
node scripts/generate-destinations-with-restaurants-list.js
```

## Full list (180 destinations, 150 max each)
Excludes **aruba** and **curacao**. Run `node scripts/generate-restaurant-caps-180-curated.js` to print the full list.

Total: **180 destinations × 150 max** → ~120–130 new each (existing ~20 updated, rest inserted). ~21,600 Place Details + ~900 Text Search ≈ 22,500 tokens.
