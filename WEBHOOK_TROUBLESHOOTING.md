# Webhook Troubleshooting Guide

## Issue: Records Stay "Pending" After Successful Payment

### Root Cause
The Stripe webhook isn't being received or processed correctly. The webhook is responsible for updating records from "pending" to "active" after payment.

## Step-by-Step Fix

### 1. Check Stripe Webhook Configuration

**In Stripe Dashboard:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Check if there's a webhook endpoint configured for your production domain
3. The endpoint should be: `https://toptours.ai/api/webhooks/stripe`

**If no webhook exists:**
1. Click "Add endpoint"
2. Endpoint URL: `https://toptours.ai/api/webhooks/stripe`
3. Select events to listen to:
   - `checkout.session.completed` ✅ (CRITICAL)
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click "Add endpoint"
5. **Copy the "Signing secret"** (starts with `whsec_`)

### 2. Update Environment Variables

**In Vercel (Production):**
1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `STRIPE_WEBHOOK_SECRET` with the new webhook secret from step 1
3. Make sure you're using the **production** webhook secret (not test mode)
4. Redeploy the application

### 3. Verify Webhook Secret Matches

**Current `.env.local` (for reference):**
```
STRIPE_WEBHOOK_SECRET=whsec_9c49211cf54be6c6b2e4ccc43b0e70b0aee60d5b11c39e872b647f7f754c7495
```

**Important:** 
- If you're using **sandbox/test keys** in production, you need a **test mode webhook secret**
- If you switch to **live keys**, you need a **live mode webhook secret**
- Test and live webhook secrets are DIFFERENT

### 4. Test Webhook Delivery

**In Stripe Dashboard:**
1. Go to: Webhooks → Your endpoint → Recent events
2. Look for `checkout.session.completed` events
3. Check if they show:
   - ✅ Green checkmark = Successfully delivered
   - ❌ Red X = Failed delivery
   - ⚠️ Yellow = Pending/Retrying

**If webhook is failing:**
- Check the error message
- Common issues:
  - Wrong webhook secret
  - Endpoint not accessible
  - SSL certificate issues
  - **307/301 redirect:** If Stripe shows "307 ERR" or "other errors", the endpoint URL is being redirected (e.g. www → non-www). Stripe does not follow redirects; the endpoint must return 200 at the exact URL. Use `https://toptours.ai/api/webhooks/stripe` (no www), or deploy with the vercel.json fix that excludes this path from the www redirect.

### 5. Manual Webhook Testing (If Needed)

**Option A: Use Stripe CLI (Recommended)**
```bash
# Install Stripe CLI
# Then forward webhooks to your local endpoint
stripe listen --forward-to https://toptours.ai/api/webhooks/stripe
```

**Option B: Manually Trigger Webhook**
1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click "Send test webhook"
3. Select `checkout.session.completed`
4. Use a real checkout session ID from your test payment

### 6. Check Application Logs

**In Vercel:**
1. Go to: Your Project → Deployments → Latest → Functions
2. Check logs for `/api/webhooks/stripe`
3. Look for:
   - `✅ [WEBHOOK] Processing tour operator premium checkout...`
   - `❌ [WEBHOOK] Error...`
   - `⚠️ [WEBHOOK] Event already processed...`

### 7. Verify Metadata Type

The webhook expects `metadata.type === 'tour_operator_premium'` for tour operator subscriptions.

**Check in Stripe Dashboard:**
1. Go to: Payments → Your test payment
2. Click on the checkout session
3. Check "Metadata" section
4. Should see: `type: tour_operator_premium`

## Quick Fix Checklist

- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Webhook secret matches in Vercel environment variables
- [ ] Using correct mode (test vs live) for webhook secret
- [ ] Webhook events include `checkout.session.completed`
- [ ] Application logs show webhook being received
- [ ] No errors in webhook delivery logs

## If Webhook Still Doesn't Work

### Option 1: Manual Activation (Temporary)
You can manually update the records in Supabase:
```sql
-- Update subscription
UPDATE tour_operator_subscriptions 
SET status = 'active',
    stripe_subscription_id = 'sub_xxxxx',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 year'
WHERE id = '7c9993d6-2362-4d44-8524-bda666f60995';

-- Update promoted tours
UPDATE promoted_tours 
SET status = 'active',
    stripe_subscription_id = 'sub_xxxxx',
    start_date = NOW(),
    end_date = NOW() + INTERVAL '1 year'
WHERE operator_subscription_id = '7c9993d6-2362-4d44-8524-bda666f60995';
```

### Option 2: Use Reconciliation Job
The reconciliation job should catch this, but it runs daily. You can trigger it manually:
```
GET /api/internal/reconcile-subscriptions
```

## Expected Behavior After Fix

Once webhook is working:
1. User completes payment ✅
2. Stripe sends `checkout.session.completed` webhook ✅
3. Webhook handler processes event ✅
4. `tour_operator_subscriptions.status` → `'active'` ✅
5. `promoted_tours.status` → `'active'` ✅
6. Confirmation email sent ✅

