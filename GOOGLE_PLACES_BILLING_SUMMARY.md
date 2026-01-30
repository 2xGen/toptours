# Google Places API – Billing summary

## Current implementation (legacy API – Starter plan)

The app now uses the **legacy** Places API so usage counts against your Starter plan (50,000 calls/month):

- **Text Search:** `GET https://maps.googleapis.com/maps/api/place/textsearch/json?query=...&key=...`  
  → Billed as "Places API Text Search Essentials".
- **Place Details:** `GET https://maps.googleapis.com/maps/api/place/details/json?place_id=...&fields=...&key=...`  
  → Billed as "Places API Place Details Essentials".

No calls are made to `places.googleapis.com/v1/...` (Places API (New)).

---

## What happened (January 2026)

- **Starter plan “0 tokens used”** applies only to the **legacy** Places API. It does **not** apply to **Places API (New)**.
- **Places API (New)** is billed separately (pay-as-you-go). Your ~$143 charge was from **Places API (New)**.

## Your January 2026 bill (Jan 1–29)

| SKU | Usage | Cost |
|-----|--------|------|
| **Place Details Enterprise + Atmosphere** | 6,699 calls | **$142.48** |
| Place Details Photos | 1,079 calls | $0.55 |
| Text Search Enterprise | 967 calls | $0.00 |
| **Total** | | **$143.03** |

The vast majority of the cost is **Place Details Enterprise + Atmosphere**. That SKU is used when your Place Details request asks for **any** Atmosphere-tier field (e.g. `reviews`, `editorialSummary`, `currentOpeningHours`, `regularOpeningHours`, or amenity fields like `servesCocktails`, `outdoorSeating`, etc.). One such field in the request makes the **entire** call bill at the Atmosphere rate (~$0.021 per call).

## Change made in code

- **Before:** Place Details was called with a large field mask that included Atmosphere fields (reviews, opening hours, editorialSummary, amenities).
- **After:** Place Details is called with **Basic + Contact (+ photos) only**:  
  `id, displayName, formattedAddress, addressComponents, location, types, rating, userRatingCount, priceLevel, businessStatus, primaryTypeDisplayName, viewport, plusCode, nationalPhoneNumber, internationalPhoneNumber, websiteUri, photos`  
  No `editorialSummary`, `reviews`, `currentOpeningHours`, `regularOpeningHours`, or any Atmosphere/amenity fields.

This should move future Place Details calls to the **basic** Place Details SKU (much cheaper) instead of “Place Details Enterprise + Atmosphere”.

## What you lose with the new mask

- Opening hours (regular/current) – will be `null` in DB.
- Editorial summary / description from Google – will be empty; you can rely on your own copy or leave blank.
- Reviews from Google – will be `null` in DB.
- Amenity booleans (outdoor seating, live music, serves cocktails, etc.) – will be `null`.

Restaurant name, address, phone, website, rating, review count, photos, types, location, and price level are still returned.

## References

- [Places API (New) – Place Data Fields](https://developers.google.com/maps/documentation/places/web-service/data-fields) – which fields belong to Basic vs Atmosphere.
- [Places API (New) – Usage and Billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing) – SKUs and pricing.
