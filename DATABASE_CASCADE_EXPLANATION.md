# Database CASCADE Explained

## What is CASCADE?

**CASCADE** automatically deletes all dependent objects that reference the table you're dropping.

### Without CASCADE (Default)
- Will **FAIL** if there are:
  - Foreign key constraints pointing to this table
  - Views that use this table
  - Triggers on this table
  - Functions that reference this table
  - Other tables with foreign keys to this table

### With CASCADE
- **Automatically deletes** all dependent objects:
  - Foreign key constraints (in other tables pointing to this one)
  - Views that reference this table
  - Triggers on this table
  - Functions that depend on this table
  - **⚠️ WARNING**: Can delete more than you expect!

---

## When to Use CASCADE

### ✅ Use CASCADE When:
1. **You want to delete everything related** to the table
2. **You're sure no other tables need those foreign keys**
3. **You're cleaning up unused tables** (like in your cleanup)
4. **You've verified dependencies** and want them gone too

### ❌ Don't Use CASCADE When:
1. **Other tables still need the foreign keys** (even if pointing to empty table)
2. **You want to see what will break** first (use without CASCADE to see errors)
3. **You're unsure about dependencies**

---

## For Your Cleanup Scenario

### Safe to Use CASCADE:
- `travel_plan_items` → `travel_plans` (child table, safe to cascade)
- `plan_promotions` → `travel_plans` (child table, safe to cascade)
- `promotion_transactions` → `promotion_accounts` (old system, safe)
- `restaurant_promotions` → `restaurants` (old system, but check if restaurants table needs it)
- `tour_promotions` → (standalone, safe)

### Be Careful With CASCADE:
- `operator_tours` → May have foreign keys from other tables
- `promotion_accounts` → May be referenced by webhook code even if unused
- `hardcoded_destination_tours` → Check if views/functions depend on it

---

## Recommended Approach

### Step 1: Check Dependencies First
```sql
-- Check what depends on the table
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'YOUR_TABLE_NAME';
```

### Step 2: Try Without CASCADE First
```sql
-- Try dropping without CASCADE to see what breaks
DROP TABLE your_table_name;
-- If it fails, you'll see what's blocking it
```

### Step 3: Use CASCADE If Safe
```sql
-- If you're sure, use CASCADE
DROP TABLE your_table_name CASCADE;
```

---

## For Your Specific Tables

### ✅ Safe to Use CASCADE:
```sql
-- Child tables (safe to cascade)
DROP TABLE IF EXISTS travel_plan_items CASCADE;
DROP TABLE IF EXISTS plan_promotions CASCADE;

-- Old boost system (safe if truly unused)
DROP TABLE IF EXISTS promotion_transactions CASCADE;
DROP TABLE IF EXISTS restaurant_promotions CASCADE;
DROP TABLE IF EXISTS tour_promotions CASCADE;
DROP TABLE IF EXISTS promotion_accounts CASCADE;
DROP TABLE IF EXISTS monthly_winners CASCADE;
```

### ⚠️ Check First, Then CASCADE:
```sql
-- Check dependencies first
-- Then use CASCADE if safe
DROP TABLE IF EXISTS hardcoded_destination_tours CASCADE;
DROP TABLE IF EXISTS operator_tours CASCADE; -- Only after webhook refactor!
```

---

## Example: What CASCADE Does

### Without CASCADE:
```sql
-- If another table has foreign key to this table:
DROP TABLE promotion_accounts;
-- ERROR: cannot drop table promotion_accounts because other objects depend on it
-- DETAIL: constraint promotion_transactions_user_id_fkey on table promotion_transactions depends on table promotion_accounts
```

### With CASCADE:
```sql
DROP TABLE promotion_accounts CASCADE;
-- ✅ Deletes promotion_accounts
-- ✅ Also deletes the foreign key constraint in promotion_transactions
-- ⚠️ promotion_transactions table still exists, but constraint is gone
```

---

## Best Practice for Your Cleanup

1. **Start without CASCADE** to see what breaks
2. **Review the errors** - they tell you what depends on the table
3. **If dependencies are expected/unused**, use CASCADE
4. **If dependencies are unexpected**, investigate first

### Example Workflow:
```sql
-- Step 1: Try without CASCADE
DROP TABLE promotion_accounts;
-- If error: "constraint X depends on table promotion_accounts"

-- Step 2: Check if that constraint is needed
SELECT * FROM information_schema.table_constraints 
WHERE constraint_name = 'X';

-- Step 3: If safe, use CASCADE
DROP TABLE promotion_accounts CASCADE;
```

---

## Summary

**For your cleanup: YES, use CASCADE** because:
- You're removing unused/old tables
- You want a clean removal
- Dependencies are likely also unused
- It's safer than manually dropping constraints

**But**: Always backup first and test in staging!

