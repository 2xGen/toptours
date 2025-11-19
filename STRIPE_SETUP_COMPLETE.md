# Stripe Integration - Setup Complete! ✅

## What Has Been Implemented

### ✅ Backend Implementation
1. **Stripe Configuration** (`src/lib/stripe.js`)
   - Stripe client initialization
   - Price ID mappings
   - Plan to tier mapping

2. **Subscription API** (`pages/api/internal/promotion/subscribe.js`)
   - Creates Stripe checkout session for subscriptions
   - Handles customer creation/lookup
   - Returns checkout URL

3. **Instant Boost API** (`pages/api/internal/promotion/purchase-a-la-carte.js`)
   - Creates Stripe checkout session for one-time payments
   - Passes tour context in metadata
   - Returns checkout URL

4. **Webhook Handler** (`app/api/webhooks/stripe/route.js`)
   - Verifies webhook signatures
   - Handles subscription events (created, updated, deleted)
   - Handles payment success events
   - Updates database accordingly

### ✅ Frontend Implementation
1. **Success Page** (`app/success/page.js`)
   - Shows payment success confirmation
   - Links to profile and tours

2. **Cancel Page** (`app/cancel/page.js`)
   - Shows payment cancellation message
   - Allows retry

3. **Updated Components**
   - `TourPromotionCard.jsx` - Redirects to Stripe checkout for instant boosts
   - `ProfilePage.jsx` - Redirects to Stripe checkout for subscriptions

---

## ⚠️ IMPORTANT: Environment Variables Required

You **MUST** create a `.env.local` file in your project root with these variables:

```bash
# Stripe API Keys (Get these from your Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price IDs (Get these from your Stripe Dashboard > Products)
STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID
STRIPE_PRO_PLUS_PRICE_ID=price_YOUR_PRO_PLUS_PRICE_ID
STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_ENTERPRISE_PRICE_ID
STRIPE_1000_POINTS_PRICE_ID=price_YOUR_1000_POINTS_PRICE_ID
STRIPE_3000_POINTS_PRICE_ID=price_YOUR_3000_POINTS_PRICE_ID
STRIPE_5000_POINTS_PRICE_ID=price_YOUR_5000_POINTS_PRICE_ID

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=https://toptours.ai
```

**For Vercel deployment**, add these same variables in:
- Vercel Dashboard → Your Project → Settings → Environment Variables

---

## ⚠️ CRITICAL ISSUE TO FIX

**Pro+ Price ID is incorrect!** 

You provided the same price ID for both Pro and Pro+:
- Pro: `price_YOUR_PRO_PRICE_ID` ✅
- Pro+: `price_YOUR_PRO_PLUS_PRICE_ID` ✅

**Action Required:**
1. Go to Stripe Dashboard → Products
2. Find your Pro+ product
3. Get the correct Price ID
4. Update `STRIPE_PRO_PLUS_PRICE_ID` in `.env.local` and Vercel

---

## Testing Checklist

### Local Testing (with Stripe CLI)
1. **Install Stripe CLI**: https://stripe.com/docs/stripe-cli
2. **Login**: `stripe login`
3. **Forward webhooks**: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. **Use the webhook secret** from the CLI output (starts with `whsec_`) in your `.env.local`

### Test Subscriptions
- [ ] Subscribe to Pro plan
- [ ] Subscribe to Pro+ plan (after fixing price ID)
- [ ] Subscribe to Enterprise plan
- [ ] Verify database updates correctly
- [ ] Verify points reset daily
- [ ] Test subscription cancellation (via Stripe Dashboard)

### Test Instant Boosts
- [ ] Purchase 1000 points package
- [ ] Purchase 3000 points package
- [ ] Purchase 5000 points package
- [ ] Verify points applied to tour immediately
- [ ] Verify transaction recorded in database

### Test Webhooks
- [ ] Verify webhook signature validation works
- [ ] Check Stripe Dashboard → Webhooks → Your endpoint → Recent events
- [ ] Verify events are being received and processed

---

## How It Works

### Subscription Flow
1. User clicks "Subscribe" on a plan
2. Frontend calls `/api/internal/promotion/subscribe`
3. API creates Stripe checkout session
4. User redirected to Stripe checkout
5. User completes payment
6. Stripe sends webhook to `/api/webhooks/stripe`
7. Webhook handler updates database:
   - Sets `tier` (pro_booster, pro_plus, enterprise)
   - Sets `subscription_status` to 'active'
   - Updates `daily_points_available`
   - Saves Stripe customer/subscription IDs

### Instant Boost Flow
1. User clicks "Boost" on a tour card
2. User selects package (1000/3000/5000 points)
3. Frontend calls `/api/internal/promotion/purchase-a-la-carte`
4. API creates Stripe checkout session with tour metadata
5. User redirected to Stripe checkout
6. User completes payment
7. Stripe sends webhook to `/api/webhooks/stripe`
8. Webhook handler calls `purchaseALaCartePoints()`
9. Points applied immediately to the tour
10. Transaction recorded in database

---

## Production Deployment

### Before Going Live
1. **Switch Stripe to Live Mode** in Stripe Dashboard
2. **Update all environment variables** with live keys:
   - `STRIPE_SECRET_KEY` → `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - Get new webhook secret for live mode
3. **Update webhook endpoint** in Stripe Dashboard:
   - URL: `https://toptours.ai/api/webhooks/stripe`
   - Use live mode webhook secret
4. **Test with real card** (use test card numbers first):
   - Test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
5. **Monitor webhooks** in Stripe Dashboard

---

## Troubleshooting

### Webhook Not Receiving Events
- Check webhook endpoint URL is correct
- Verify webhook secret matches
- Check Stripe Dashboard → Webhooks → Recent events
- Use Stripe CLI for local testing

### Payment Succeeds But Database Not Updated
- Check webhook logs in Stripe Dashboard
- Check server logs for errors
- Verify webhook handler is processing events
- Check database connection

### Checkout Session Creation Fails
- Verify Stripe secret key is correct
- Check price IDs are valid
- Verify user exists in database
- Check API logs for specific errors

---

## Next Steps

1. ✅ Create `.env.local` file with all environment variables
2. ⚠️ **Fix Pro+ Price ID** (critical!)
3. ✅ Test locally with Stripe CLI
4. ✅ Deploy to Vercel with environment variables
5. ✅ Test in production with test cards
6. ✅ Switch to live mode when ready

---

## Support

If you encounter issues:
1. Check Stripe Dashboard → Logs for API errors
2. Check Vercel logs for server errors
3. Verify all environment variables are set
4. Test webhook endpoint manually using Stripe CLI

**You're all set!** 🎉 The integration is complete. Just add the environment variables and fix the Pro+ price ID, then you can start testing!

