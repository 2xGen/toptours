# Debug: Barcelona Subscription Not Showing

## Issue
You created a test payment for Barcelona, but it's not in `restaurant_subscriptions` table.

## Possible Causes

### 1. **Pending Record Not Created** (Most Likely)
The subscribe route only creates a pending record if:
- `isPremiumSelected && premiumBillingCycle` OR
- `isPromotedSelected && promotedBillingCycle`

**Check**: Did you select Premium or Promotion in the checkout?

### 2. **Different User ID**
The record might be created with a different `user_id` than you're querying with.

**Check**: Run the SQL to find ALL pending records (see below)

### 3. **Webhook Created It But Different Status**
The webhook might have created it but it's in a different status or table.

**Check**: Check `restaurant_premium_subscriptions` table as well

### 4. **Error During Creation**
The insert might have failed silently.

**Check**: Check server logs for errors during checkout

---

## Debug Steps

### Step 1: Find ALL Pending Records

Run this SQL to see ALL pending subscriptions (regardless of user or destination):

```sql
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  status,
  user_id,
  email,
  created_at
FROM restaurant_subscriptions
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Step 2: Check Recent Subscriptions

```sql
-- All subscriptions created in last 24 hours
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  status,
  user_id,
  created_at
FROM restaurant_subscriptions
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Step 3: Check Barcelona Specifically

```sql
-- Check Barcelona with case-insensitive search
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  status,
  user_id,
  created_at
FROM restaurant_subscriptions
WHERE LOWER(destination_id) LIKE '%barcelona%'
   OR LOWER(restaurant_slug) LIKE '%barcelona%'
   OR LOWER(restaurant_name) LIKE '%barcelona%'
ORDER BY created_at DESC;
```

### Step 4: Check Your User ID

```sql
-- Replace 'YOUR_USER_ID' with your actual user ID
SELECT 
  id,
  restaurant_id,
  destination_id,
  restaurant_name,
  status,
  created_at
FROM restaurant_subscriptions
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

### Step 5: Check Stripe Dashboard

1. Go to Stripe Dashboard → Customers
2. Find your customer
3. Check the subscription ID
4. Use that to find the record:

```sql
-- Replace 'sub_xxx' with your Stripe subscription ID
SELECT * FROM restaurant_subscriptions
WHERE stripe_subscription_id = 'sub_xxx';
```

---

## What to Check in Code

### Check Server Logs

Look for these log messages in your terminal/server logs:

1. **During Checkout** (subscribe route):
   - `📝 Creating pending restaurant subscription record for restaurant XXX...`
   - `✅ Created pending subscription record (ID: xxx)`
   - OR `❌ Error creating pending subscription:`

2. **During Webhook** (if webhook fired):
   - `✅ [WEBHOOK] Updated restaurant_subscriptions from pending to active`
   - OR `✅ [WEBHOOK] Created restaurant_subscriptions record (fallback)`

### Check What Was Selected

The pending record is only created if:
- Premium is selected (`isPremiumSelected && premiumBillingCycle`)
- OR Promotion is selected (`isPromotedSelected && promotedBillingCycle`)

If you selected BOTH, it should create a record.

---

## Quick Fix: Check All Tables

Run this to check both tables:

```sql
-- Check new table
SELECT 'restaurant_subscriptions' as table_name, id, restaurant_id, destination_id, status, user_id, created_at
FROM restaurant_subscriptions
WHERE destination_id LIKE '%barcelona%' OR restaurant_slug LIKE '%barcelona%'

UNION ALL

-- Check old table
SELECT 'restaurant_premium_subscriptions' as table_name, id, restaurant_id, destination_id, status, user_id, created_at
FROM restaurant_premium_subscriptions
WHERE destination_id LIKE '%barcelona%' OR restaurant_slug LIKE '%barcelona%'
ORDER BY created_at DESC;
```

---

## If Record Doesn't Exist

If the record truly doesn't exist, it means:

1. **The subscribe route didn't create it** - Check if premium/promotion was selected
2. **There was an error** - Check server logs
3. **Different user_id** - Check with a different user_id

**Solution**: Manually create the record or redo the checkout with proper selections.

