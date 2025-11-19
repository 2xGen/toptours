# Page Views Analytics System

## Overview
This system stores **raw page view data** in Supabase for your own analytics and analysis. You get both:
1. **Raw page view records** - Individual view records with metadata (flexible analysis)
2. **Aggregated counts** - Quick view counts in `tour_enrichment` table (for display)

## Database Setup

Run this SQL script in Supabase to create the `page_views` table:

```sql
-- See: scripts/create-page-views-table.sql
```

This creates a table with:
- `page_path` - Full URL path (e.g., `/tours/12345`)
- `page_type` - Type of page (`tour`, `destination`, `home`, etc.)
- `product_id` - Tour product ID (if tour page)
- `destination_id` - Destination ID (if applicable)
- `user_id` - User ID (if logged in)
- `session_id` - Browser session identifier
- `referrer` - Where they came from
- `user_agent` - Browser info
- `ip_address` - IP address (for geographic analysis)
- `created_at` - Timestamp

## How It Works

### Efficiency
- **Batched inserts**: 20 page views inserted at once (or every 15 seconds)
- **Non-blocking**: API returns immediately, doesn't wait for database write
- **Dual storage**: 
  - Raw records in `page_views` table (for analysis)
  - Aggregated counts in `tour_enrichment.view_count` (for quick queries)

### API Calls
- **1 API call per page view** (non-blocking, returns immediately)
- **Database writes**: Batched (20 records or 15 seconds)
- **Efficiency**: ~95% reduction in database writes vs. individual inserts

## Example Queries for Analysis

### Most viewed pages (last 30 days)
```sql
SELECT 
  page_path,
  page_type,
  COUNT(*) as view_count
FROM page_views
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY page_path, page_type
ORDER BY view_count DESC
LIMIT 20;
```

### Most viewed tours
```sql
SELECT 
  product_id,
  COUNT(*) as view_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions
FROM page_views
WHERE page_type = 'tour'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY product_id
ORDER BY view_count DESC
LIMIT 20;
```

### Views by destination
```sql
SELECT 
  destination_id,
  COUNT(*) as view_count,
  COUNT(DISTINCT product_id) as unique_tours
FROM page_views
WHERE destination_id IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY destination_id
ORDER BY view_count DESC;
```

### Daily view trends
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_views,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users
FROM page_views
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Top referrers
```sql
SELECT 
  referrer,
  COUNT(*) as views
FROM page_views
WHERE referrer IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY referrer
ORDER BY views DESC
LIMIT 20;
```

### User engagement (logged-in users)
```sql
SELECT 
  user_id,
  COUNT(*) as total_views,
  COUNT(DISTINCT page_path) as unique_pages,
  MIN(created_at) as first_view,
  MAX(created_at) as last_view
FROM page_views
WHERE user_id IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_views DESC
LIMIT 20;
```

## Current Status

✅ **Active for ALL pages** 
- Automatically tracks every page view across the entire site
- Stores raw data in `page_views` table
- Updates aggregated counts in `tour_enrichment.view_count` for tour pages
- Tracks: home, destinations, tours, travel guides, about, profile, auth, and all other pages

### How It Works
- `PageViewTracker` component in `app/layout.js` tracks all page navigation
- Automatically detects page type (tour, destination, home, etc.)
- Extracts product IDs and destination IDs from URLs
- Batches writes for efficiency (20 records or 15 seconds)

### Tour-Specific Tracking
- The old tour-specific tracking endpoint (`/api/internal/tour-views/[productId]`) is no longer needed
- All tracking is now handled by the unified `PageViewTracker` component
- Tour pages still update aggregated `view_count` in `tour_enrichment` table automatically

## Performance Impact

- **API calls**: 1 per page view (non-blocking)
- **Database writes**: Batched (20 records or 15 seconds)
- **Storage**: ~200 bytes per page view record
- **Estimated cost**: Very low - batched inserts are efficient

For 10,000 page views/day:
- ~500 database inserts (batched)
- ~10MB storage/month
- Minimal performance impact

