# Stripe Payment Integration Guide - Step by Step

## Overview
This guide will walk you through implementing Stripe payments for:
- **Subscription Plans**: Pro ($3.99/mo), Pro+ ($9.99/mo), Enterprise ($24.99/mo)
- **Instant Boost Packages**: 1000 points ($7.99), 3000 points ($18.99), 5000 points ($27.99)

---

## PART 1: YOUR TASKS (Stripe Dashboard Setup)

### Step 1: Create Stripe Account & Get API Keys
1. Go to https://stripe.com and create an account (or log in)
2. **For Testing**: Use Test Mode (toggle in top right)
3. Navigate to **Developers** → **API keys**
4. Copy your **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
5. Click **Reveal test key** and copy your **Secret key** (starts with `sk_test_...` or `sk_live_...`)
6. **Save these keys securely** - you'll need them in Step 3

### Step 2: Create Products & Prices in Stripe Dashboard

#### A. Create Subscription Products
For each subscription plan, create a product and recurring price:

**Pro Plan ($3.99/month)**
1. Go to **Products** → **Add product**
2. Name: `Pro Plan`
3. Description: `200 daily points, 5 AI matches/day`
4. Click **Add price**
   - Price: `$3.99`
   - Billing period: `Monthly (recurring)`
   - Click **Add price**
5. **Copy the Price ID** (starts with `price_...`) - save as `STRIPE_PRO_PRICE_ID`

**Pro+ Plan ($9.99/month)**
1. Add product: `Pro+ Plan`
2. Description: `600 daily points, 5 AI matches/day`
3. Add price: `$9.99` monthly recurring
4. **Copy the Price ID** - save as `STRIPE_PRO_PLUS_PRICE_ID`

**Enterprise Plan ($24.99/month)**
1. Add product: `Enterprise Plan`
2. Description: `2000 daily points, 20 AI matches/day`
3. Add price: `$24.99` monthly recurring
4. **Copy the Price ID** - save as `STRIPE_ENTERPRISE_PRICE_ID`

#### B. Create One-Time Payment Products (Instant Boosts)
**1000 Points Package ($7.99)**
1. Add product: `1000 Points Instant Boost`
2. Description: `One-time purchase of 1000 promotion points`
3. Add price: `$7.99` one-time payment
4. **Copy the Price ID** - save as `STRIPE_1000_POINTS_PRICE_ID`

**3000 Points Package ($18.99)**
1. Add product: `3000 Points Instant Boost`
2. Description: `One-time purchase of 3000 promotion points`
3. Add price: `$18.99` one-time payment
4. **Copy the Price ID** - save as `STRIPE_3000_POINTS_PRICE_ID`

**5000 Points Package ($27.99)**
1. Add product: `5000 Points Instant Boost`
2. Description: `One-time purchase of 5000 promotion points`
3. Add price: `$27.99` one-time payment
4. **Copy the Price ID** - save as `STRIPE_5000_POINTS_PRICE_ID`

### Step 3: Set Up Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-domain.com/api/webhooks/stripe`
   - For local testing: Use Stripe CLI (see Step 4)
4. **Events to listen to**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **Copy the Webhook Signing Secret** (starts with `whsec_...`) - save as `STRIPE_WEBHOOK_SECRET`

### Step 4: Install Stripe CLI (For Local Testing)
1. Download from: https://stripe.com/docs/stripe-cli
2. Install and authenticate: `stripe login`
3. Forward webhooks to local server: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. This will give you a webhook signing secret for local testing

---

## PART 2: MY TASKS (Code Implementation)

### Step 1: Install Stripe Package
I'll add `stripe` to your dependencies.

### Step 2: Create Environment Variables File
I'll create `.env.local` template with all required Stripe keys.

### Step 3: Create Stripe Configuration File
I'll create `src/lib/stripe.js` with Stripe client initialization.

### Step 4: Update Subscription API Endpoint
I'll update `/api/internal/promotion/subscribe.js` to:
- Create Stripe checkout session for subscriptions
- Return checkout URL
- Handle customer creation/lookup

### Step 5: Update Instant Boost API Endpoint
I'll update `/api/internal/promotion/purchase-a-la-carte.js` to:
- Create Stripe checkout session for one-time payments
- Pass tour/product context in metadata
- Return checkout URL

### Step 6: Create Webhook Handler
I'll create `/api/webhooks/stripe/route.js` to:
- Verify webhook signature
- Handle subscription events (created, updated, deleted)
- Handle payment success events
- Update database accordingly

### Step 7: Create Success/Cancel Pages
I'll create:
- `/success` page for successful payments
- `/cancel` page for cancelled payments

### Step 8: Update Frontend Components
I'll update:
- `TourPromotionCard.jsx` - redirect to Stripe checkout
- `ProfilePage.jsx` - redirect to Stripe checkout for subscriptions
- Add loading states and error handling

### Step 9: Add Database Helper Functions
I'll create functions to:
- Link Stripe customer to user account
- Update subscription status from webhooks
- Handle subscription upgrades/downgrades

---

## PART 3: TESTING CHECKLIST

### Test Subscriptions
- [ ] Subscribe to Pro plan
- [ ] Subscribe to Pro+ plan
- [ ] Subscribe to Enterprise plan
- [ ] Verify database updates correctly
- [ ] Verify points reset daily
- [ ] Test subscription cancellation
- [ ] Test subscription upgrade (Pro → Pro+)
- [ ] Test subscription downgrade (Enterprise → Pro)

### Test Instant Boosts
- [ ] Purchase 1000 points package
- [ ] Purchase 3000 points package
- [ ] Purchase 5000 points package
- [ ] Verify points applied to tour immediately
- [ ] Verify transaction recorded in database
- [ ] Test with different tours

### Test Webhooks
- [ ] Verify webhook signature validation
- [ ] Test subscription.created event
- [ ] Test subscription.updated event
- [ ] Test subscription.deleted event
- [ ] Test payment_intent.succeeded event
- [ ] Test failed payment handling

### Test Edge Cases
- [ ] User cancels checkout
- [ ] Payment fails
- [ ] Duplicate webhook events
- [ ] User already has subscription
- [ ] User upgrades mid-cycle

---

## PART 4: DEPLOYMENT CHECKLIST

### Before Going Live
- [ ] Switch Stripe to **Live Mode**
- [ ] Update all environment variables with live keys
- [ ] Update webhook endpoint URL to production domain
- [ ] Test all flows in live mode with real card (use test card numbers first)
- [ ] Set up monitoring/alerts for failed payments
- [ ] Document customer support process for billing issues

### Environment Variables Needed
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PRO_PLUS_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_1000_POINTS_PRICE_ID=price_...
STRIPE_3000_POINTS_PRICE_ID=price_...
STRIPE_5000_POINTS_PRICE_ID=price_...
```

---

## IMPORTANT NOTES

1. **Test Mode First**: Always test thoroughly in Stripe test mode before going live
2. **Webhook Security**: Never skip webhook signature verification
3. **Idempotency**: Handle duplicate webhook events gracefully
4. **Error Handling**: Always have fallback error handling for payment failures
5. **User Experience**: Show clear loading states and error messages
6. **Database Consistency**: Ensure database updates are atomic and consistent

---

## NEXT STEPS

Once you complete **Part 1** (Steps 1-4), let me know and I'll implement **Part 2** (all the code). Then we'll test together in **Part 3** before deploying in **Part 4**.

**Ready to start?** Begin with Step 1 in Part 1 and share your Stripe API keys and Price IDs when ready!

