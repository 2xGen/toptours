# Troubleshooting: Barcelona Restaurant Subscription Not Showing

## Issue
You created a test payment for a restaurant in Barcelona, but it's not showing in your query results.

## Possible Causes

### 1. **Webhook Didn't Fire (Most Likely)**
If you're testing locally, Stripe webhooks **won't work** because they need a public URL. The record is likely in `pending` status waiting for the webhook.

**Solution**: 
- Check `restaurant_subscriptions` table for `status = 'pending'`
- Manually activate it (see below)

### 2. **Wrong Table Being Queried**
You're querying `restaurant_premium_subscriptions`, but the new system uses `restaurant_subscriptions` as the primary table.

**Solution**: Query `restaurant_subscriptions` instead (or both tables)

### 3. **Record Created But Not Activated**
The webhook might have failed or the subscription wasn't verified.

**Solution**: Check webhook logs and manually activate if needed

---

## How to Find the Record

### Step 1: Check `restaurant_subscriptions` Table

Run this SQL in Supabase:

```sql
-- Find Barcelona subscription in the new table
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  restaurant_slug,
  status,
  restaurant_premium_plan,
  promoted_listing_plan,
  stripe_subscription_id,
  stripe_customer_id,
  user_id,
  email,
  created_at
FROM restaurant_subscriptions
WHERE destination_id LIKE '%barcelona%'
   OR restaurant_slug LIKE '%barcelona%'
   OR restaurant_name LIKE '%barcelona%'
ORDER BY created_at DESC;
```

### Step 2: Check for Pending Records

```sql
-- Check all pending subscriptions (might be waiting for webhook)
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  status,
  stripe_subscription_id,
  stripe_customer_id,
  user_id,
  created_at
FROM restaurant_subscriptions
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 10;
```

### Step 3: Check `restaurant_premium_subscriptions` (Legacy Table)

```sql
-- Check the old table (for comparison)
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  status,
  plan_type,
  stripe_subscription_id,
  user_id,
  created_at
FROM restaurant_premium_subscriptions
WHERE destination_id LIKE '%barcelona%'
ORDER BY created_at DESC;
```

---

## How to Manually Activate (If Webhook Didn't Fire)

### Option 1: Update Status Directly

If you have the subscription ID from Stripe:

```sql
-- Replace these values:
-- - YOUR_RESTAURANT_ID: The restaurant ID
-- - YOUR_USER_ID: Your user ID
-- - YOUR_STRIPE_SUBSCRIPTION_ID: The Stripe subscription ID from Stripe dashboard
-- - YOUR_DESTINATION_SLUG: e.g., 'barcelona'

UPDATE restaurant_subscriptions
SET 
  status = 'active',
  stripe_subscription_id = 'YOUR_STRIPE_SUBSCRIPTION_ID',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 year' -- or '1 month' for monthly
WHERE restaurant_id = YOUR_RESTAURANT_ID
  AND user_id = 'YOUR_USER_ID'
  AND status = 'pending';
```

### Option 2: Use Stripe CLI to Forward Webhooks

If you want to test webhooks locally:

```bash
# Install Stripe CLI
# Then forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Then trigger the webhook manually in Stripe dashboard or use:
```bash
stripe trigger checkout.session.completed
```

---

## Which Table Should You Query?

**For new subscriptions (created after the new system):**
- ✅ **`restaurant_subscriptions`** - Primary table (always check this first)
- ⚠️ **`restaurant_premium_subscriptions`** - Legacy table (only if premium was selected)

**The profile page queries BOTH tables** to show all subscriptions.

---

## Quick Check Script

I've created `scripts/check-barcelona-subscription.sql` that checks both tables. Run it in Supabase SQL Editor to find your Barcelona subscription.

---

## Next Steps

1. **Run the SQL queries above** to find the record
2. **If it's pending**: Manually activate it or set up Stripe CLI for webhook testing
3. **If it doesn't exist**: Check the subscribe route logs to see if the pending record was created
4. **Update your query** to check `restaurant_subscriptions` instead of (or in addition to) `restaurant_premium_subscriptions`

