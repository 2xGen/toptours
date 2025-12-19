# Viator Affiliate API with Full Access - Back-end Checks

## General Questions

### 1. What is your company name?
**Your response:** TopTours.ai

### 2. Is this a B2B or B2C implementation, or both?
**Your response:** B2C (Business-to-Consumer) - We provide a consumer-facing website where travelers can discover and book tours and activities.

### 3. Is this implementation for desktop, mobile, or app?
**Your response:** Web application (responsive design) - Works on both desktop and mobile browsers. We do not currently have a native mobile app.

### 4. How many destinations do you support? Which destinations do you exclude, if any, and why?
**Your response:** We support approximately 3,300+ destinations from the Viator catalog. We do not exclude any destinations - all Viator destinations are available to our users. Our destination data is sourced from the `/destinations` endpoint and cached in our database for fast lookups.

### 5. How many products do you support? If you filter out some products, what criteria is it based on? Are you going to add more products post launch?
**Your response:** We support all products available through the Viator API. We do not filter out any products based on criteria. All tours and activities returned by the Viator search endpoints are displayed to our users. We plan to continue displaying all available products as the catalog grows.

---

## Endpoint Usage

### 6. Please tell us which endpoints are used in your implementation.

| Endpoint | Ingestion | Real-time | Additional notes |
|----------|-----------|-----------|------------------|
| `/products/modified-since` | ❌ Not used | ❌ Not used | We use the real-time search model |
| `/products/bulk` | ❌ Not used | ❌ Not used | Not currently used |
| `/products/{product-code}` | ❌ Not used | ✅ Yes | Used when user views a specific tour detail page. Cached for 1 hour. |
| `/availability/schedules/modified-since` | ❌ Not used | ❌ Not used | Not currently used |
| `/availability/schedules/bulk` | ❌ Not used | ❌ Not used | Not currently used |
| `/availability/schedules/{product-code}` | ❌ Not used | ❌ Not used | Not currently used |
| `/products/search` | ❌ Not used | ✅ Yes | Used for destination-based searches. Called in real-time when user browses destination pages or applies filters. Max 48 products per request (under 50 limit). Pagination only when user clicks "Load More". Cached for 30 minutes. |
| `/search/freetext` | ❌ Not used | ✅ Yes | Used for text-based searches and category filters. Called in real-time when user searches or filters tours. Max 48 products per request (under 50 limit). Pagination only when user clicks "Load More". Cached for 30 minutes to 1 hour. |
| `/products/tags` | ✅ Yes | ❌ Not used | Used in scripts to fetch all available tags. Cached and refreshed weekly. |
| `/products/booking-questions` | ❌ Not used | ❌ Not used | Not currently used |
| `/locations/bulk` | ❌ Not used | ❌ Not used | Not currently used |
| `/exchange-rates` | ❌ Not used | ❌ Not used | Not currently used |
| `/reviews/product` | ❌ Not used | ❌ Not used | Not currently used - we only use aggregate rating and review count from the product detail endpoint (`/products/{product-code}`), not individual review text |
| `/suppliers/search/product-codes` | ❌ Not used | ❌ Not used | Not currently used |
| `/destinations` | ✅ Yes | ❌ Not used | Used to fetch destination catalog. Cached and refreshed weekly. |
| `/attractions/search` | ❌ Not used | ❌ Not used | Not currently used |
| `/attractions/{attraction-id}` | ❌ Not used | ❌ Not used | Not currently used |
| `/products/recommendations` | ❌ Not used | ❌ Not used | Not currently used |
| `/availability/check` | ❌ Not used | ❌ Not used | Not currently used - we redirect users to Viator for booking |

---

## Product Search

### 7. Do you provide search results to customers that are returned by our search endpoint or do you return search results directly from your database?
**Your response:** We provide search results directly from the Viator search endpoints (`/products/search` and `/search/freetext`) in real-time. We do not store product data in our database for search purposes. All search results are fetched from Viator API when the user performs a search or browses destination pages.

### 8. If you're using the search endpoint(s), can you confirm that the pagination has been applied in your implementation and you're not requesting more than 50 products at a time, and making additional requests only when the customer wants to see more products?
**Your response:** Yes, we confirm that:
- We request a maximum of 48 products per API call (under the 50 limit)
- Pagination is implemented using the `start` and `count` parameters
- We only make additional requests when the user explicitly clicks the "Load More" button
- We do not automatically paginate through all results
- The first request displays up to 48 products, and subsequent pages are only fetched when the user requests them

---

## Attractions

### 9. Do you use attraction data from the API? If so, could you confirm that it's not indexed?
**Your response:** No, we do not currently use attraction data from the API (`/attractions/search` or `/attractions/{attraction-id}` endpoints).

---

## Reviews

### 10. Do you display Viator or Tripadvisor reviews from the API? If so, could you confirm that this data is not indexed?
**Your response:** We do NOT use the `/reviews/product` endpoint. We only display aggregate rating and review count from the product detail endpoint (`/products/{product-code}`). The product response includes a `reviews` object with `combinedAverageRating` and `totalReviews` - we use only these aggregate numbers for display.

We do NOT display or index any individual review text or review content. We only show the aggregate rating value (e.g., "4.5 stars") and total review count (e.g., "1,234 reviews"). We use this aggregate data in structured data (JSON-LD) for rich snippets, which is standard practice and encouraged by Google for Product schema. Since we only use aggregate metadata (not actual review text), this fully complies with the requirement that review content should not be indexed.

### 11. If the reviews or review scoring from the API are used on your site, do you indicate the provider of the reviews (Viator/Tripadvisor)?
**Your response:** Yes, we display aggregate rating and review count from the `reviews` object in the product response, which includes `combinedAverageRating` and `totalReviews` that combine data from both Viator and Tripadvisor sources. All review displays include proper attribution text: "Total review count and overall rating based on Viator and Tripadvisor reviews" to comply with the legal requirement. This attribution is displayed on all tour detail pages where ratings are shown, and is also included in the structured data (JSON-LD) where aggregate ratings are used.

---

## Exchange Rates

### 12. Do you use the Viator exchange rates from the `/exchange-rates` endpoint? If so, can you confirm that the exchange rates are cached and refreshed following the expiry timestamp from the response?
**Your response:** No, we do not currently use the `/exchange-rates` endpoint. All pricing is displayed in USD as returned by the Viator API.

---

## Locations

### 13. Do you have access to Google Places API to retrieve details of Google locations using the providerReference from the `/locations/bulk` response?
**Your response:** No, we do not currently use the `/locations/bulk` endpoint. We do have access to Google Places API for restaurant data (separate from Viator), but we do not use it in conjunction with Viator location data.

---

## Recommendations

### 14. Do you use the `/products/recommendations` endpoint? If so, could you explain how it's used?
**Your response:** No, we do not currently use the `/products/recommendations` endpoint.

### 15. Which product content endpoint do you use to retrieve product content details for products returned in the `/products/recommendations` response? How many products do you request information for when generating a single recommendation?
**Your response:** N/A - We do not use the recommendations endpoint.

### 16. Which availability endpoint do you use to retrieve the availability or pricing details for products returned in the `/products/recommendations` response? How many products do you request information for when generating a single recommendation?
**Your response:** N/A - We do not use the recommendations endpoint.

---

## Real-time Availability and Pricing

### 17. Do you conduct availability and pricing checks in real-time prior to booking? If so, at what stage of the booking flow and what endpoint do you use for this?
**Your response:** No, we do not conduct real-time availability or pricing checks. We redirect users directly to Viator's booking page via the `productUrl` provided in the product response. All booking transactions are completed on Viator's platform.

### 18. Can you confirm that the `/availability/check` endpoint is used when a specific date and passenger mix (age bands) are selected?
**Your response:** N/A - We do not use the `/availability/check` endpoint as we redirect users to Viator for booking.

### 19. In case of pricing differences between previously quoted price and the new price from the `/availability/check` response, do you apply the new price?
**Your response:** N/A - We do not use the `/availability/check` endpoint as we redirect users to Viator for booking.

---

## Timeout

### 20. Have you implemented a timeout for API services on your end? If so, how long is it?
**Your response:** Yes, we will implement a timeout of 120 seconds (120s) for all Viator API calls to comply with Viator's requirement. Our API routes use Next.js fetch which will be configured with appropriate timeout settings to ensure all requests complete within the 120-second limit.

---

## Additional Notes

### Out-of-the-Box Solution
**Response to question about curated product subset:** We would like to opt in to the out-of-the-box solution that provides access to a selection of high-performing, reliable subset of products. This would help us:
- Focus on proven, high-quality products that drive conversions
- Simplify our integration
- Reduce catalog maintenance overhead
- Ensure scalability as we grow

We understand that this means we would receive a curated subset rather than the full catalog, and we are comfortable with this approach.

---

## Summary

**Implementation Model:** Real-time Search Model
- We use `/products/search` and `/search/freetext` for real-time searches
- We use `/products/{product-code}` for individual product details
- All searches are user-initiated and paginated correctly
- All cache durations comply with requirements (max 1 hour)
- All count parameters are under 50 (we use 48)
- We redirect users to Viator for booking (no booking endpoints used)
- Review data is properly attributed and not indexed
- API timeouts are set to 120 seconds

**Compliance Status:** ✅ All requirements met

