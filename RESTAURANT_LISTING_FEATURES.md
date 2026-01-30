# Restaurant listing page – features (no photos from API)

Photos are **not** requested from the legacy Places API (saves on call cost; you don’t show them on the site anyway).

---

## Token / call impact

- **Place Details:** `photos` is no longer in the `fields` parameter, so we request one fewer field. Legacy “Place Details Essentials” may bill per field or per call; either way we do less work per call.
- **Text Search:** Legacy text search returns a default set of fields (we don’t control that). We ignore `photos` in the normalized result (`photos: []`), so we never pass photo data into Place Details or the DB. No extra Place Details “photos” usage.
- **Net:** Place Details calls are lighter; no photo URLs are stored. `hero_image_url` in the DB will be `null` for new/updated restaurants from this flow.

---

## How the listing page looks now (features)

**Destination restaurants listing** (`/destinations/[id]/restaurants`) – each restaurant card shows:

| Feature | Source | Notes |
|--------|--------|--------|
| **Name** | `name` | From API / DB. |
| **Short description** | `tagline` / `summary` / `description` | From API (legacy has no editorial summary) → often fallback: *"Discover [cuisines] cuisine at [name]"* or *"Experience great dining at [name]."* |
| **Rating** | `ratings.googleRating` | From API (`rating`). |
| **Review count** | `ratings.reviewCount` | From API (`user_ratings_total`). |
| **Price range** | `pricing.priceRange` | From API (`price_level` → $ / $$ / $$$ / $$$$). |
| **Cuisine tags** | `cuisines` | From API (`types` filtered for restaurant/food). |
| **Best Match %** | Client-side | From “Match to Your Taste” preferences (no API). |
| **Link** | `slug` | “View Restaurant” → detail page. |

**No restaurant image on the card.** Cards use an icon (e.g. UtensilsCrossed) and text only. The page hero uses the **destination** image (`destination.imageUrl`), not restaurant photos.

**Filters/sort on listing:**

- Search by name
- Max budget ($ / $$ / $$$ / $$$$$)
- Sort: Best Match, Highest Rated, Name A–Z, Price low→high, Price high→low
- Cuisine tags to filter
- “Match to Your Taste” to set preferences and see match %

---

## Individual restaurant detail page (`/destinations/[id]/restaurants/[slug]`)

With `hero_image_url` = `null`:

- **Hero:** Detail page can use a fallback (e.g. destination image or placeholder) where it would have shown `heroImage`; your existing code already uses `destination.imageUrl` in some places.
- **Body:** Name, rating, review count, address, phone, website, opening hours (from legacy `opening_hours.weekday_text`), price range, cuisines, “Reserve”/CTA, map link. No Google photo block.

So: listing stays text-focused with rating, price, cuisines, and match; detail page has the same data and no restaurant photo unless you add a placeholder or other image source.
