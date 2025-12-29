# Viator Affiliate API with full access - back-end checks

## General questions

**What is your company name?**
TopTours.ai

**Is this a B2B or B2C implementation, or both?**
B2C - Consumer-facing travel platform

**Is this implementation for desktop, mobile, or app?**
Desktop and mobile web (responsive website)

**How many destinations do you support? Which destinations do you exclude, if any, and why?**
We support all destinations available through the Viator API. We do not exclude any destinations.

**How many products do you support? If you filter out some products, what criteria is it based on? Are you going to add more products post launch?**
We support all products returned by the Viator API for each destination. We do not filter out products. We plan to add more products as they become available through the API.

## Endpoint usage

| Endpoint | Ingestion | Real-time | Additional notes |
|----------|-----------|-----------|------------------|
| `/products/modified-since` | Not used | - | - |
| `/products/bulk` | Not used | - | - |
| `/products/{product-code}` | - | Yes | Used to fetch individual product details when user views a tour detail page |
| `/availability/schedules/modified-since` | Not used | - | - |
| `/availability/schedules/bulk` | Not used | - | - |
| `/availability/schedules/{product-code}` | Not used | - | - |
| `/products/search` | - | Yes | Used for destination-based searches when we have a destination ID. Called when user browses tours for a specific destination. |
| `/search/freetext` | - | Yes | Used for text-based searches when user searches by keyword or when destination ID is not available. |
| `/products/tags` | Yes | - | Used for database seeding to fetch all available tags and store them in our database for tag-based matching. Called periodically via admin scripts, not in real-time user requests. |
| `/products/booking-questions` | Not used | - | - |
| `/locations/bulk` | Not used | - | - |
| `/exchange-rates` | Not used | - | - |
| `/reviews/product*` | Not used | - | Reviews are retrieved from the product endpoint response (`/products/{product-code}`) |
| `/suppliers/search/product-codes` | Not used | - | - |
| `/destinations` | Yes | - | Used for database seeding to fetch all destinations and store them in our database for destination lookup and search. Called periodically via admin scripts, not in real-time user requests. |
| `/attractions/search` | Not used | - | - |
| `/attractions/{attraction-id}` | Not used | - | - |
| `/products/recommendations` | Not used | - | - |
| `/availability/check**` | Not used | - | - |

## Product search

**Do you provide search results to customers that are returned by our search endpoint or do you return search results directly from your database?**
We return search results directly from the Viator API endpoints (`/products/search` and `/search/freetext`) in real-time. We do not store product data in our database for search results.

**If you're using the search endpoint(s), can you confirm that the pagination has been applied in your implementation and you're not requesting more than 50 products at a time, and making additional requests only when the customer wants to see more products?**
Yes, we confirm pagination is implemented. We request a maximum of 50 products per page (the maximum allowed). Additional requests are only made when the user clicks "Load More" or navigates to the next page. We use the `start` and `count` parameters for pagination.

## Attractions

**Do you use attraction data from the API? If so, could you confirm that it's not indexed?**
No, we do not use attraction data from the API.

## Reviews

**Do you display Viator or Tripadvisor reviews from the API? If so, could you confirm that this data is not indexed?**
We display aggregate rating and review count from the `reviews` object in the product endpoint response (`/products/{product-code}`), which includes `combinedAverageRating` and `totalReviews` that combine data from both Viator and Tripadvisor sources. This data is displayed on product detail pages as part of the normal product information. We do not create separate review pages or index review content separately - the rating and review count are simply part of the product page content.

**If the reviews or review scoring from the API are used on your site, do you indicate the provider of the reviews (Viator/Tripadvisor)?**
Yes, we display the following attribution text on all tour detail pages where ratings are shown: "Total review count and overall rating based on Viator and Tripadvisor reviews". This attribution is also included in structured data (JSON-LD) where aggregate ratings are used.

## Exchange rates

**Do you use the Viator exchange rates from the /exchange-rates endpoint? If so, can you confirm that the exchange rates are cached and refreshed following the expiry timestamp from the response?**
No, we do not use the `/exchange-rates` endpoint. We display prices in USD as returned by the API.

## Locations

**Do you have access to Google Places API to retrieve details of Google locations using the providerReference from the /locations/bulk response?**
No, we do not use the `/locations/bulk` endpoint and do not retrieve location details from Google Places API.

## Recommendations

**Do you use the /products/recommendations endpoint? If so, could you explain how it's used?**
No, we do not use the `/products/recommendations` endpoint.

**Which product content endpoint do you use to retrieve product content details for products returned in the /products/recommendations response?**
N/A - We do not use the recommendations endpoint.

**Which availability endpoint do you use to retrieve the availability or pricing details for products returned in the /products/recommendations response?**
N/A - We do not use the recommendations endpoint.

## Real-time availability and pricing

**Do you conduct availability and pricing checks in real-time prior to booking? If so, at what stage of the booking flow and what endpoint do you use for this?**
No, we do not conduct real-time availability checks. We redirect users to Viator's booking page via affiliate links, where Viator handles availability and pricing checks.

**Can you confirm that the /availability/check endpoint is used when a specific date and passenger mix (age bands) are selected?**
N/A - We do not use the `/availability/check` endpoint.

**In case of pricing differences between previously quoted price and the new price from the /availability/check response, do you apply the new price?**
N/A - We do not use the `/availability/check` endpoint.

## Timeout

**Have you implemented a timeout for API services on your end? If so, how long is it?**
Yes, we have implemented a 120-second timeout for all Viator API calls, as required.

