# Database Cleanup Analysis - Potentially Unused Tables

## Summary
This document identifies database tables that may be unused, redundant, or could be optimized/removed to improve performance and reduce database bloat.

---

## 🔴 HIGH PRIORITY - Likely Unused/Redundant Tables

### 1. **`promoted_listings`** ⚠️ POTENTIALLY REDUNDANT
- **Status**: Has code in `src/lib/promotedListings.js` but **NOT actively used** in main app
- **Current System**: Using `promoted_tours` and `promoted_restaurants` tables instead
- **Evidence**: 
  - `promotedListings.js` exists but no imports found in main app routes
  - All promotion logic uses `promoted_tours`/`promoted_restaurants` directly
  - Created for B2B subscription model ($29/month) but superseded by new system
- **Recommendation**: **VERIFY** if any active subscriptions exist, then consider archiving/removing
- **Risk**: Low - appears to be old system

### 2. **`monthly_winners`** ⚠️ LIKELY UNUSED
- **Status**: Created in promotion system but **no queries found** in codebase
- **Purpose**: Historical tracking for "Winner of December" etc.
- **Evidence**: 
  - Only referenced in SQL function `reset_monthly_scores()` that archives winners
  - No UI or API endpoints found that display monthly winners
  - No leaderboard features using this table
- **Recommendation**: **VERIFY** if monthly winner feature is planned/needed, otherwise archive
- **Risk**: Low - historical data only

### 3. **`hardcoded_destination_tours`** ⚠️ UNKNOWN USAGE
- **Status**: Table exists but **no code references found**
- **Purpose**: Stores minimal tour data (productId, title, image) for destination pages
- **Evidence**: 
  - No `.from('hardcoded_destination_tours')` queries found
  - May have been replaced by dynamic tour fetching
- **Recommendation**: **VERIFY** if still needed for specific destinations, check if data exists
- **Risk**: Medium - might be used for special cases

### 4. **`partner_invite_codes`** ✅ ALREADY MARKED FOR REMOVAL
- **Status**: **Removal script exists** (`remove-partner-invite-codes-table.sql`)
- **Reason**: Switched to Stripe coupon codes
- **Recommendation**: **EXECUTE** removal script if not already done
- **Risk**: None - already planned for removal

---

## 🟡 MEDIUM PRIORITY - Check Usage

### 5. **`page_views`** ⚠️ LIMITED USAGE
- **Status**: Only used in analytics/admin route
- **Usage**: 
  - `src/lib/supabaseCache.js` - tracks page views
  - `app/api/admin/analytics/popular-viator-destinations/route.js` - admin analytics only
- **Recommendation**: **VERIFY** if analytics are actively used, consider archiving old data (>1 year)
- **Risk**: Low - can archive old data instead of removing

### 6. **`admin_settings`** ⚠️ UNKNOWN USAGE
- **Status**: Table created but **no code references found**
- **Purpose**: Unknown - may be for admin configuration
- **Recommendation**: **VERIFY** if used for any admin features
- **Risk**: Low - likely small table

### 7. **`travel_plans` + `travel_plan_items` + `plan_promotions`** ⚠️ ACTIVE BUT CHECK
- **Status**: **ACTIVELY USED** in `src/lib/travelPlans.js` and `src/lib/promotionSystem.js`
- **Usage**: Community travel plans/itineraries feature
- **Recommendation**: **VERIFY** if this feature is actively used by users
  - If feature is not popular, consider archiving old plans
  - If feature is dead, could archive entire system
- **Risk**: Medium - feature might be unused by users

---

## 🟢 LOW PRIORITY - Active Tables (Keep)

### 8. **`restaurant_promotions`** ✅ ACTIVE
- **Status**: **ACTIVELY USED** - gamified promotion system for restaurants
- **Usage**: Leaderboards, boost system, score tracking
- **Recommendation**: **KEEP** - actively used

### 9. **`tour_promotions`** ✅ ACTIVE
- **Status**: **ACTIVELY USED** - gamified promotion system for tours
- **Usage**: Leaderboards, boost system, score tracking
- **Recommendation**: **KEEP** - actively used

### 10. **`promotion_accounts`** ✅ ACTIVE
- **Status**: **ACTIVELY USED** - user promotion accounts
- **Usage**: Daily points, tier tracking
- **Recommendation**: **KEEP** - actively used

### 11. **`promotion_transactions`** ✅ ACTIVE
- **Status**: **ACTIVELY USED** - audit trail for point spending
- **Usage**: Transaction logging, score calculations
- **Recommendation**: **KEEP** - actively used (consider archiving old transactions >1 year)

### 12. **`promoted_tours`** ✅ ACTIVE
- **Status**: **ACTIVELY USED** - B2B subscription system for tours
- **Usage**: Current promotion system for tours
- **Recommendation**: **KEEP** - actively used

### 13. **`promoted_restaurants`** ✅ ACTIVE
- **Status**: **ACTIVELY USED** - B2B subscription system for restaurants
- **Usage**: Current promotion system for restaurants
- **Recommendation**: **KEEP** - actively used

---

## 📊 Optimization Recommendations

### Data Archiving (Instead of Deletion)
1. **`promotion_transactions`**: Archive transactions older than 1-2 years
2. **`page_views`**: Archive page views older than 6-12 months (keep aggregated stats)
3. **`travel_plans`**: Archive inactive plans (no updates in 2+ years)

### Index Optimization
- Review indexes on large tables - ensure they're being used
- Consider partial indexes for filtered queries (e.g., `WHERE status = 'active'`)

### Table Size Analysis
Run this query to see actual table sizes:
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔍 Verification Steps Before Removal

1. **Check for active data**:
   ```sql
   SELECT COUNT(*) FROM promoted_listings WHERE subscription_status = 'active';
   SELECT COUNT(*) FROM monthly_winners;
   SELECT COUNT(*) FROM hardcoded_destination_tours;
   SELECT COUNT(*) FROM travel_plans WHERE updated_at > NOW() - INTERVAL '6 months';
   ```

2. **Check for foreign key dependencies**:
   ```sql
   SELECT 
     tc.table_name, 
     kcu.column_name, 
     ccu.table_name AS foreign_table_name
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' 
     AND ccu.table_name IN ('promoted_listings', 'monthly_winners', 'hardcoded_destination_tours');
   ```

3. **Check last access dates** (if audit logging exists)

---

## ⚠️ WARNING
**DO NOT DELETE** without:
1. Verifying no active subscriptions/data
2. Backing up data first
3. Testing in staging environment
4. Confirming with team

---

## Quick Wins (Low Risk)
1. ✅ Execute `remove-partner-invite-codes-table.sql` if not done
2. ✅ Archive old `promotion_transactions` (>2 years)
3. ✅ Archive old `page_views` (>1 year)
4. ⚠️ Verify and potentially remove `promoted_listings` if unused
5. ⚠️ Verify and potentially archive `monthly_winners` if feature not used

