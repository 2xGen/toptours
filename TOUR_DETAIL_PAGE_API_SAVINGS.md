# Tour detail page — API usage & savings

Summary of API calls on `/tours/[productId]` (and slug variant) and options to reduce cost.

---

## Current server-side API usage (per page load)

| API / system | What | Notes |
|--------------|------|--------|
| **Viator** | Product: `GET /partner/products/{productId}` | Via getCachedTour / cache miss. Required for page. |
| **Viator** | Pricing: `GET /partner/availability/schedules/{productId}` | getFromPrice — shows "from $X". |
| **Viator** | Similar tours: `POST /partner/search/freetext` | 1 call per page (or cache hit). **→ Deferred to client (on demand).** |
| **Supabase** | Tour enrichment (cached), operator premium, viator_destinations, restaurants, category_guides, destination features | Multiple reads. |
| **Supabase** | CRM sync (operator upsert) | Fire-and-forget, no external API. |

Reviews are already on-demand (Load reviews). Promotion score was removed.

---

## Savings implemented

### 1. Similar tours on demand
- **Before:** 1 Viator freetext API call on every tour page load (or cache hit).
- **After:** No Viator similar-tours call on initial load. User sees "Load similar tours"; when clicked, client calls `GET /api/internal/similar-tours/[productId]`, which runs the same Viator freetext logic (with cache).
- **Savings:** 1 Viator API call per tour page view for users who never click "Load similar tours". At 300k+ tour pages, large reduction in Viator usage.

### 2. No restaurants on tour detail
- **Before:** Restaurant count + full or limited restaurant list fetched for "Top Restaurants" section.
- **After:** Tour detail page does not show restaurants. No restaurant fetch; no restaurant list. A single "Restaurants in {destination}" link card is shown only when `destinationFeatures.hasRestaurants` is true (links to `/destinations/[id]/restaurants`).
- **Savings:** No Supabase/static restaurant reads per tour page.

---

## Other options (not implemented)

| Option | Save | Trade-off |
|--------|------|-----------|
| **Defer pricing (getFromPrice) to client** | 1 Viator schedules call per page | No "from $X" in initial render; could show "Price on request" or load when sticky bar visible. May hurt conversion. |
| **Skip operator premium fetch** | 1–2 Supabase reads when operator has premium | Lose operator badge / premium section for paying operators. |
| **Skip category guides on tour page** | 1 Supabase read | Lose sticky nav "Guides" link for that destination. |
| **Skip destination features** | 1 small Supabase read | Lose sticky nav "Restaurants" / "Baby equipment" etc. visibility. |

---

## File reference

- Tour data: `app/tours/[productId]/page.js`, `TourDataLoader.js`
- Similar tours (on demand): `app/api/internal/similar-tours/[productId]/route.js`, `TourDetailClient.jsx` (Load similar tours)
- No restaurants: `TourDataLoader.js` `loadDestinationData` (no restaurant fetch); `TourDetailClient.jsx` (no restaurant list, optional link card only)
