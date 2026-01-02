# Database Cleanup - Confirmed Tables for Removal

## ✅ Confirmed by User - Can Be Removed

### 1. **`hardcoded_destination_tours`** ⚠️ NEEDS VERIFICATION
- **User says**: Not used anymore (Viator API data ingestion not allowed)
- **Code found**: **STILL ACTIVELY USED** in:
  - `app/destinations/[id]/page.js` - fetches hardcoded tours
  - `app/destinations/[id]/tours/page.js` - imports function
  - `app/destinations/[id]/DestinationDetailClient.jsx` - displays hardcoded tours
  - `src/lib/promotionSystem.js` - getHardcodedToursByDestination function
- **⚠️ WARNING**: Code still actively calls this table
- **Action**: **VERIFY** if feature is disabled in UI or table is empty
- **Recommendation**: Check if destination pages still show hardcoded tours section

### 2. **`operator_tours`** 🔴 CRITICAL - DO NOT REMOVE YET
- **User says**: Empty
- **Code found**: **CRITICAL - HEAVILY USED** in:
  - `app/api/webhooks/stripe/route.js` - **WEBHOOK HANDLERS** (lines 1331, 1388, 1426, 1566, 1584, 1967, 1998, 2089)
  - `app/api/partners/tour-operators/subscribe/route.js` - subscription creation
  - `app/api/partners/tour-operators/upgrade/route.js` - subscription upgrades
  - `src/lib/tourOperatorPremiumServer.js` - premium tour operations
  - `app/api/internal/promoted-tours/route.js` - fallback queries
- **🔴 CRITICAL WARNING**: Webhooks actively query/update this table
- **Action**: **DO NOT REMOVE** until webhooks are refactored to use `promoted_tours` instead
- **Recommendation**: 
  1. Verify table is truly empty: `SELECT COUNT(*) FROM operator_tours;`
  2. Refactor webhooks to use `promoted_tours` table
  3. Then remove `operator_tours` table

### 3. **`page_views`** ✅ CONFIRMED (CONDITIONAL)
- **User says**: For admin, can remove if it slows site/takes too many API requests
- **Code found**: Used in `src/lib/supabaseCache.js` and admin analytics
- **Action**: **SAFE TO REMOVE** if not needed for admin analytics
- **Recommendation**: Consider removing if performance is an issue

### 4. **`plan_promotions`** ✅ CONFIRMED
- **User says**: Not used anymore
- **Code found**: 2 references in `src/lib/promotionSystem.js` (likely dead code)
- **Action**: **SAFE TO REMOVE**

### 5. **`promotion_accounts`** ⚠️ NEEDS VERIFICATION
- **User says**: Not used anymore (old boost points system)
- **Code found**: **MANY active references** in:
  - `src/lib/promotionSystem.js` (getPromotionAccount, spendPoints functions)
  - `app/api/webhooks/stripe/route.js` (webhook handlers)
- **⚠️ WARNING**: Code still exists and may be called
- **Action**: **VERIFY** if boost points feature is completely disabled in UI
- **Recommendation**: Check if `/toptours` page or boost features are still accessible

### 6. **`promotion_transactions`** ⚠️ NEEDS VERIFICATION
- **User says**: Not used anymore (old boost points system)
- **Code found**: References in `src/lib/promotionSystem.js` (transaction logging)
- **⚠️ WARNING**: Linked to promotion_accounts
- **Action**: **VERIFY** if boost points feature is completely disabled
- **Recommendation**: Remove together with `promotion_accounts` if boost system is dead

### 7. **`promotions`** ✅ CONFIRMED
- **User says**: Empty
- **Code found**: No references found
- **Action**: **SAFE TO REMOVE**

### 8. **`restaurant_promotions`** ✅ CONFIRMED
- **User says**: Old boost system, can go
- **Code found**: Many references in `src/lib/promotionSystem.js` (old boost system)
- **Action**: **SAFE TO REMOVE** (old gamified boost system)

### 9. **`tour_promotions`** ✅ CONFIRMED
- **User says**: Old boost system, can go
- **Code found**: Many references in `src/lib/promotionSystem.js` (old boost system)
- **Action**: **SAFE TO REMOVE** (old gamified boost system)

### 10. **`travel_plan_items`** ✅ CONFIRMED
- **User says**: Can go
- **Code found**: References in `src/lib/travelPlans.js` and `app/api/internal/plan-details/route.js`
- **Action**: **SAFE TO REMOVE** (travel plans feature not used)

### 11. **`travel_plans`** ✅ CONFIRMED
- **User says**: Can go
- **Code found**: References in `src/lib/travelPlans.js`, `app/profile/page.js`, `app/api/internal/plan-details/route.js`
- **Action**: **SAFE TO REMOVE** (travel plans feature not used)

### 12. **`plan_promotions`** ✅ CONFIRMED (duplicate of #4)
- Already listed above

---

## ✅ KEEP - Current Active Systems

### 13. **`promoted_restaurants`** ✅ KEEP
- **User says**: Current way of promoting restaurants
- **Status**: **ACTIVELY USED** - Current B2B subscription system

### 14. **`promoted_tours`** ✅ KEEP
- **User says**: Current way of promoting tours
- **Status**: **ACTIVELY USED** - Current B2B subscription system

---

## ⚠️ IMPORTANT VERIFICATIONS NEEDED

Before removing, verify these tables are truly unused:

### 1. Check `operator_tours` usage:
```sql
-- Check if table is empty
SELECT COUNT(*) FROM operator_tours;

-- Check if webhooks/subscriptions still need it
-- Review: app/api/webhooks/stripe/route.js lines 1331, 1388, 1426, etc.
```

### 2. Check `promotion_accounts` and `promotion_transactions`:
```sql
-- Check if boost system is truly disabled
SELECT COUNT(*) FROM promotion_accounts;
SELECT COUNT(*) FROM promotion_transactions;

-- Check if /toptours page or boost features are accessible
-- Review: app/toptours/ page and boost UI components
```

### 3. Check `hardcoded_destination_tours`:
```sql
SELECT COUNT(*) FROM hardcoded_destination_tours;
```

### 4. Check `travel_plans` usage:
```sql
SELECT COUNT(*) FROM travel_plans;
SELECT COUNT(*) FROM travel_plan_items;
SELECT COUNT(*) FROM plan_promotions;
```

---

## 📋 Recommended Cleanup Order

### Phase 1: Low Risk (Verify Empty First)
1. ✅ `promotions` (user says empty)
2. ✅ `hardcoded_destination_tours` (verify empty, then remove)
3. ✅ `plan_promotions` (verify empty, then remove)

### Phase 2: Medium Risk (Verify Feature Disabled)
4. ⚠️ `promotion_accounts` + `promotion_transactions` (verify boost system disabled)
5. ⚠️ `restaurant_promotions` + `tour_promotions` (verify old boost system disabled)
6. ⚠️ `operator_tours` (verify empty AND webhooks don't need it)

### Phase 3: Travel Plans (Verify Unused)
7. ✅ `travel_plan_items` (remove first - child table)
8. ✅ `travel_plans` (remove after items)
9. ✅ `plan_promotions` (already in Phase 1)

### Phase 4: Optional
10. ✅ `page_views` (if admin doesn't need it)

---

## 🗑️ SQL Cleanup Script Template

```sql
-- ============================================
-- DATABASE CLEANUP - Remove Unused Tables
-- ============================================
-- WARNING: Backup database before running!
-- Run verification queries first!

-- Phase 1: Remove child tables first
DROP TABLE IF EXISTS travel_plan_items CASCADE;
DROP TABLE IF EXISTS plan_promotions CASCADE;

-- Phase 2: Remove parent tables
DROP TABLE IF EXISTS travel_plans CASCADE;
DROP TABLE IF EXISTS hardcoded_destination_tours CASCADE;
DROP TABLE IF EXISTS promotions CASCADE; -- if exists

-- Phase 3: Remove old boost system tables
DROP TABLE IF EXISTS promotion_transactions CASCADE;
DROP TABLE IF EXISTS restaurant_promotions CASCADE;
DROP TABLE IF EXISTS tour_promotions CASCADE;
DROP TABLE IF EXISTS promotion_accounts CASCADE;
DROP TABLE IF EXISTS monthly_winners CASCADE; -- if exists

-- Phase 4: Remove operator_tours (VERIFY EMPTY FIRST!)
-- DROP TABLE IF EXISTS operator_tours CASCADE;

-- Phase 5: Optional - Remove page_views
-- DROP TABLE IF EXISTS page_views CASCADE;

-- Verify removal
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'travel_plan_items',
  'travel_plans',
  'plan_promotions',
  'hardcoded_destination_tours',
  'promotions',
  'promotion_transactions',
  'restaurant_promotions',
  'tour_promotions',
  'promotion_accounts',
  'monthly_winners'
);
-- Should return 0 rows
```

---

## ⚠️ CRITICAL WARNINGS

1. **`operator_tours`**: Still referenced in webhooks - verify if webhooks will break
2. **`promotion_accounts`**: Still referenced in webhook handlers - verify if needed
3. **Foreign Key Dependencies**: Some tables may have foreign keys - CASCADE will handle, but verify
4. **Backup First**: Always backup database before dropping tables
5. **Test in Staging**: Test cleanup script in staging environment first

---

## ✅ Final Confirmation Checklist

Before running cleanup:
- [ ] Backup database
- [ ] Verify `operator_tours` is empty AND webhooks don't need it
- [ ] Verify boost points system is completely disabled in UI
- [ ] Verify travel plans feature is not accessible to users
- [ ] Test cleanup script in staging
- [ ] Run verification queries to confirm tables are empty/unused
- [ ] Get final approval before production cleanup

