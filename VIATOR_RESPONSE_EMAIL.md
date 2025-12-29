Dear Diego,

Thank you for your email and the additional information about endpoint usage requirements.

**Endpoint Usage Model:**
We have reviewed the documentation and confirm we are using the **real-time search model**:
- `/products/search` and `/search/freetext` endpoints for displaying search results to users in real-time
- `/products/{product-code}` endpoint for fetching full product details only when a customer selects a product from search results
- Search results are cached for up to 1 hour as permitted
- We do not use the ingestion model with `/products/modified-since` or `/availability/schedules/modified-since`

We also use `/destinations` and `/products/tags` endpoints for periodic database seeding (admin scripts only, not during user requests) to support destination lookup and tag-based matching functionality.

**Backend Checks Document:**
Please find attached our completed "Viator Affiliate API with full access - back-end checks" document with all requested information.

**Product Catalog:**
We do not want to opt in to the curated subset. We require access to the **full product catalog** to support all destinations and provide comprehensive search results to our users across all available products.

Please let me know if you need any additional information or clarification.

Best regards,
[Your Name]
TopTours.ai

