# No Google Places / Maps API Calls

**Nothing in this app or scripts calls Google Places API or Google Maps API.**

## Safeguards

### 1. Library (`src/lib/googlePlacesApi.js`)
- All network functions **throw immediately** (no `fetch` runs): `legacyTextSearchPage`, `legacyPlaceDetails`, `getApiKey`.
- `getPhotoUrl()` always returns `null` (no Google photo URLs generated).

### 2. API routes
- **`/api/restaurants/complete`** – Returns `501` only. Does not import or call Google.
- **`/api/restaurants/fetch-google-places`** – Returns `501` only. Does not import or call Google.

### 3. Scripts (exit before any Google call)
- `scripts/fetch-restaurants-from-google-places.js` – `process.exit(1)` before any API call.
- `scripts/fetch-restaurant-raw-json.js` – `process.exit(1)` before any API call.
- `scripts/fetch-restaurants-prague.js` – `process.exit(1)` before main.
- `scripts/fetch-restaurants-all-featured-destinations.js` – `process.exit(1)` before main.
- `scripts/download-restaurant-images.js` – `process.exit(1)` before any download.
- `scripts/download-restaurant-images-supabase.js` – `process.exit(1)` before any download.

### 4. App (no restaurant images, no Google image URLs)
- **`src/lib/restaurants.js`** – `heroImage` is always `null` (restaurant photos not used).
- **`src/lib/promotionSystem.js`** – `restaurantImageUrl` is always `null`.

### 5. Database
- Run `node scripts/clear-google-image-urls.js` (optionally with `--dry-run`) to clear any stored `hero_image_url` so no legacy URL can be used.

## Not related to Places/Maps billing
- **`google_maps_url`** in restaurant data – Link for “Get directions” (user opens Google Maps in browser). Not an API call from our server.
- **`fonts.googleapis.com`** (layout) – Google Fonts (CSS/fonts). Different product.
- **`GOOGLE_GENERATIVE_AI_API_KEY`** / **`GEMINI_API_KEY`** – Gemini (AI). Different API.
- **Google Tag Manager / gtag** – Analytics. Different product.
