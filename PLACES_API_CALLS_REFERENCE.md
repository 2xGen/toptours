# Places API — exact calls (legacy, Starter plan)

This doc describes **every** API call the restaurant fetch makes, so you can double-check against your Starter plan (Text Search Essentials + Place Details Essentials).

---

## 1. Text Search (get list of place IDs)

**Function:** `searchRestaurantsMany(queries, location, maxTotal)`  
→ calls `searchRestaurantsWithPagination(query, location, maxResults)` per query  
→ which calls `searchRestaurantsPage(query, location, pageToken)`  
→ which calls **`legacyTextSearchPage(query, pageToken)`** in `src/lib/googlePlacesApi.js`.

**HTTP call:**

- **Method:** `GET`
- **URL (first page):**  
  `https://maps.googleapis.com/maps/api/place/textsearch/json?query=...&key=...&language=en`
- **URL (next page, when paginating):**  
  `https://maps.googleapis.com/maps/api/place/textsearch/json?query=...&key=...&language=en&pagetoken=<next_page_token>`

**Query parameters:**

| Parameter   | Value                    | Notes                          |
|------------|---------------------------|--------------------------------|
| `query`    | e.g. `restaurants in Prague` | Text query                     |
| `key`      | `GOOGLE_PLACES_API_KEY`   | From env                       |
| `language` | `en`                     | Fixed                          |
| `pagetoken`| (optional)               | Only on 2nd/3rd page; from previous response |

**Example (first page):**  
`GET https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+Prague&key=YOUR_KEY&language=en`

**Billing:** Counts as **Places API Text Search Essentials** (Starter plan).

---

## 2. Place Details (get full place data for each ID)

**Function:** For each place from search, the script calls `getPlaceDetails(place.id)`  
→ which calls **`legacyPlaceDetails(placeId)`** in `src/lib/googlePlacesApi.js`.

**HTTP call:**

- **Method:** `GET`
- **URL:**  
  `https://maps.googleapis.com/maps/api/place/details/json?place_id=...&fields=...&key=...&language=en`

**Query parameters:**

| Parameter   | Value |
|------------|--------|
| `place_id` | Place ID from search (e.g. `ChIJ...`) |
| `fields`   | Comma-separated list (see below)     |
| `key`      | `GOOGLE_PLACES_API_KEY`              |
| `language` | `en`                                 |

**`fields` value (exact):**  
`place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,geometry,rating,user_ratings_total,types,opening_hours,address_components,price_level`

(No `photos` — we don’t request it.)

**Example:**  
`GET https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJ...&fields=place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,geometry,rating,user_ratings_total,types,opening_hours,address_components,price_level&key=YOUR_KEY&language=en`

**Billing:** Counts as **Places API Place Details Essentials** (Starter plan).

---

## 3. No other Google APIs

- We do **not** call `https://places.googleapis.com/v1/...` (Places API (New)).
- We do **not** request photos; no `.../photo?photo_reference=...` for listing data.

---

## 4. Prague batch: how many calls?

- **Text Search:**  
  `searchRestaurantsMany` runs 4 queries for Prague. Each query can paginate (up to 3 pages of 20). So about **4–12** Text Search requests (often 4–8).
- **Place Details:**  
  One per place we actually process, up to 150. So at most **150** Place Details requests.

**Total for Prague (max 150):** about **4–12** Text Search + **up to 150** Place Details = **~154–162** calls, all legacy (Starter).

---

## 5. Where in the code

| Step              | File                          | Function / constant              |
|-------------------|-------------------------------|-----------------------------------|
| Text Search URL   | `src/lib/googlePlacesApi.js` | `legacyTextSearchPage()` (line ~25) |
| Place Details URL | `src/lib/googlePlacesApi.js` | `legacyPlaceDetails()` (line ~82)   |
| Place Details fields | `src/lib/googlePlacesApi.js` | `LEGACY_DETAILS_FIELDS` (line ~66)  |
| Search entrypoint | `src/lib/googlePlacesApi.js` | `searchRestaurantsMany()`         |
| Details entrypoint| `src/lib/googlePlacesApi.js` | `getPlaceDetails()` → `legacyPlaceDetails()` |

You can search the repo for `LEGACY_PLACES_BASE` to see all legacy URLs; base is `https://maps.googleapis.com/maps/api/place`.

---

## 6. For Google Cloud Support (dispute / refund)

If you were billed for **Places API (New)** / **Place Details Enterprise + Atmosphere** while your code uses only the **legacy** Places API, you can send something like this:

**Project ID:** TopToursai (or your exact project ID)  
**Billing period in question:** e.g. January 1–29, 2026  

**Our implementation:**
- We use **only** the legacy Places API:
  - Text Search: `GET https://maps.googleapis.com/maps/api/place/textsearch/json?query=...&key=...&language=en` (and `pagetoken` for pagination).
  - Place Details: `GET https://maps.googleapis.com/maps/api/place/details/json?place_id=...&fields=place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,geometry,rating,user_ratings_total,types,opening_hours,address_components,price_level&key=...&language=en`.
- We do **not** call `https://places.googleapis.com/v1/...` (Places API (New)).
- We do **not** request photos or Atmosphere-tier fields.

**Expectation:** This usage should count under our **Starter** plan as “Places API Text Search Essentials” and “Places API Place Details Essentials” (50,000 monthly calls).

**Issue:** The billing report showed charges for “Places API (New)” and “Place Details Enterprise + Atmosphere.” We believe either (1) our usage was miscategorized, or (2) another service in the project is calling the New API. Please check API logs for this project and period to identify the source of those charges and whether a refund or credit is applicable.

**Reference:** Full description of our API calls is in `PLACES_API_CALLS_REFERENCE.md` in our codebase (sections 1–5 above).
