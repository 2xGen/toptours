# Page Views Performance Analysis

## Current Implementation

### How It Works:
1. **Client-side**: `PageViewTracker` component tracks every page navigation
2. **API Call**: 1 non-blocking fetch per page view to `/api/internal/page-views`
3. **Queue System**: Views queued in memory (max 100 items)
4. **Batched Writes**: Database inserts happen in batches:
   - When queue reaches 20 items, OR
   - Every 15 seconds (whichever comes first)
5. **Non-blocking**: API returns immediately, doesn't wait for DB write

---

## Performance Impact

### ✅ **Efficient Aspects:**

1. **Batched Database Writes**
   - 95% reduction in DB writes vs individual inserts
   - 20 records inserted at once (or every 15 seconds)
   - Much more efficient than 1 write per page view

2. **Non-blocking API**
   - Uses `keepalive: true` (fire-and-forget)
   - Returns immediately (doesn't wait for DB)
   - Won't slow down page loads

3. **Queue System**
   - Prevents memory bloat (max 100 items)
   - Handles DB slowdowns gracefully
   - Re-queues failed writes (up to limit)

4. **Server-side Only**
   - Uses service role client (no RLS overhead)
   - Efficient batch inserts

### ⚠️ **Potential Issues:**

1. **API Calls Per Page View**
   - **1 API call per page view** (even if non-blocking)
   - If you have 1000 page views/day = 1000 API calls/day
   - If you have 10,000 page views/day = 10,000 API calls/day
   - **Impact**: API route execution time, but non-blocking

2. **Table Growth**
   - Table grows indefinitely without archiving
   - Each row: ~200-300 bytes (with indexes)
   - 1,000 views/day = ~300KB/day = ~110MB/year
   - 10,000 views/day = ~3MB/day = ~1.1GB/year
   - **Impact**: Database storage costs, slower queries over time

3. **Index Maintenance**
   - 7 indexes on the table:
     - `idx_page_views_page_path`
     - `idx_page_views_page_type`
     - `idx_page_views_product_id`
     - `idx_page_views_destination_id`
     - `idx_page_views_created_at`
     - `idx_page_views_user_id`
     - `idx_page_views_path_date` (composite)
   - **Impact**: Slower inserts as table grows, more storage

4. **Memory Usage**
   - Queue in memory (max 100 items)
   - If DB is slow, queue could fill up
   - **Impact**: Minimal (only 100 items max)

---

## Real-World Impact Assessment

### Low Traffic Site (< 1,000 views/day):
- ✅ **Minimal impact** - API calls are cheap, DB writes are batched
- ✅ **Keep it** - Useful analytics, low overhead

### Medium Traffic Site (1,000 - 10,000 views/day):
- ⚠️ **Moderate impact** - 1,000-10,000 API calls/day
- ⚠️ **Table growth** - ~110MB - 1.1GB/year
- ⚠️ **Consider**: Archiving old data (>6 months)

### High Traffic Site (> 10,000 views/day):
- ⚠️ **Higher impact** - 10,000+ API calls/day
- ⚠️ **Table growth** - >1GB/year
- ⚠️ **Consider**: 
  - Archiving old data (>3 months)
  - Or removing if analytics not critical

---

## Does It Slow Down the Site?

### **Short Answer: NO (for page loads)**

- ✅ Non-blocking API calls
- ✅ Fire-and-forget (doesn't wait for response)
- ✅ Uses `keepalive: true` (browser handles efficiently)
- ✅ 100ms delay before tracking (doesn't block render)

### **But: YES (for database/server resources)**

- ⚠️ 1 API route execution per page view
- ⚠️ Database writes (batched, but still writes)
- ⚠️ Table/index maintenance overhead
- ⚠️ Storage growth over time

---

## Recommendations

### Option 1: **Keep It** (Recommended if traffic < 10K/day)
- ✅ Useful for admin analytics
- ✅ Efficient batching system
- ✅ Non-blocking (doesn't slow page loads)
- **Action**: Archive old data (>6 months) periodically

### Option 2: **Archive Old Data** (Recommended if traffic > 10K/day)
- ✅ Keep recent data (last 3-6 months)
- ✅ Archive older data to separate table or delete
- ✅ Reduces table size and index overhead
- **Action**: Create archiving script

### Option 3: **Remove It** (If analytics not needed)
- ✅ Eliminates all API calls
- ✅ Frees up database storage
- ✅ Reduces database maintenance overhead
- ❌ Lose analytics data
- **Action**: Remove `PageViewTracker` component and table

---

## Storage Calculation

### Per Page View:
- Row size: ~200-300 bytes (with metadata)
- Index overhead: ~100-150 bytes per index (7 indexes)
- **Total**: ~1-2KB per page view (with indexes)

### Annual Growth:
- 1,000 views/day = ~365,000 views/year = ~365-730MB/year
- 5,000 views/day = ~1.8M views/year = ~1.8-3.6GB/year
- 10,000 views/day = ~3.6M views/year = ~3.6-7.2GB/year

---

## My Recommendation

### **If you're not actively using the analytics:**
- ✅ **Remove it** - Saves API calls, storage, and maintenance
- ✅ Low risk - analytics only, doesn't affect functionality

### **If you use analytics occasionally:**
- ✅ **Keep it, but archive old data** (>6 months)
- ✅ Reduces storage while keeping recent data

### **If you actively use analytics:**
- ✅ **Keep it** - The batching system is efficient
- ✅ Archive old data periodically (>6 months)

---

## Quick Check: Are You Using It?

Check if you actually query this table:
```sql
-- Check if you have any analytics queries
SELECT COUNT(*) FROM page_views 
WHERE created_at >= NOW() - INTERVAL '30 days';
```

If you're not querying it regularly, **it's safe to remove**.

---

## If You Keep It: Archiving Script

```sql
-- Archive page views older than 6 months
-- Option 1: Delete old data
DELETE FROM page_views 
WHERE created_at < NOW() - INTERVAL '6 months';

-- Option 2: Move to archive table (if you want to keep it)
CREATE TABLE IF NOT EXISTS page_views_archive (LIKE page_views INCLUDING ALL);
INSERT INTO page_views_archive 
SELECT * FROM page_views 
WHERE created_at < NOW() - INTERVAL '6 months';
DELETE FROM page_views 
WHERE created_at < NOW() - INTERVAL '6 months';
```

---

## Bottom Line

**Is it heavy?** 
- ❌ **No** for page load performance (non-blocking)
- ⚠️ **Yes** for API/database resources (1 call per view, storage growth)

**Does it slow the site?**
- ❌ **No** for user experience (non-blocking)
- ⚠️ **Yes** for server resources (API calls, DB writes)

**Should you remove it?**
- ✅ **Yes** if you don't use analytics
- ⚠️ **Maybe** if you have high traffic (>10K/day) and don't actively use it
- ✅ **Keep it** if you actively use analytics and traffic is reasonable

