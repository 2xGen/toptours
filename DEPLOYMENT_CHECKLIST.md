# 🚀 Deployment Checklist & Next Steps

## Current Status

✅ **Completed:**
- Page view tracking (all pages)
- Admin dashboard with password login
- Stripe integration (test mode)
- User authentication (email/password + Google)
- Subscription management
- Instant boost payments
- Promotion system (streaks, leaderboard, top promoters)

## 📋 Pre-Deployment Checklist

### 1. Database Setup (Run in Supabase)

Run these SQL scripts in order:
- [ ] `scripts/create-page-views-table.sql` - Page analytics
- [ ] `scripts/create-admin-settings-table.sql` - Admin login
- [ ] Set admin password in `admin_settings` table

### 2. Environment Variables (Production)

Update `.env.local` or Vercel environment variables:

**Stripe (Production Keys):**
```bash
STRIPE_SECRET_KEY=sk_live_...  # ⚠️ Change from sk_test_ to sk_live_
STRIPE_PUBLISHABLE_KEY=pk_live_...  # ⚠️ Change from pk_test_ to pk_live_
STRIPE_WEBHOOK_SECRET=whsec_...  # ⚠️ Get new webhook secret from production webhook
```

**Resend (Email Service):**
```bash
RESEND_API_KEY=re_2n7Hdbf7_DRY6zSx78rNzJJRC4395zkYn
RESEND_FROM_EMAIL=noreply@toptoursai.com
```

**Stripe Price IDs (Production):**
```bash
STRIPE_PRO_PRICE_ID=price_...  # Production price IDs from Stripe Dashboard
STRIPE_PRO_PLUS_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_1000_POINTS_PRICE_ID=price_...
STRIPE_3000_POINTS_PRICE_ID=price_...
STRIPE_5000_POINTS_PRICE_ID=price_...
```

**Other:**
```bash
NEXT_PUBLIC_APP_URL=https://toptours.ai
```

### 3. Stripe Production Setup

1. **Get Production API Keys:**
   - Go to Stripe Dashboard → Developers → API keys
   - Switch to "Live mode" (toggle in top right)
   - Copy `Publishable key` and `Secret key`

2. **Create Production Webhook:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://toptours.ai/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `payment_intent.succeeded`
   - Copy the webhook signing secret

3. **Get Production Price IDs:**
   - Go to Stripe Dashboard → Products
   - Switch to "Live mode"
   - Create products/prices for:
     - Pro subscription
     - Pro+ subscription
     - Enterprise subscription
     - 1000 points package
     - 3000 points package
     - 5000 points package
   - Copy the Price IDs (start with `price_`)

### 4. Testing Before Production

**Critical Tests:**
- [ ] Test subscription purchase (test mode)
- [ ] Test instant boost purchase (test mode)
- [ ] Test subscription cancellation
- [ ] Test password reset flow
- [ ] Test Google OAuth sign-in
- [ ] Test admin dashboard login
- [ ] Verify page view tracking is working
- [ ] Check webhook is receiving events

## 📧 Transaction Emails (Resend) ✅ COMPLETE

### ✅ Setup Complete

1. **Resend Package:** ✅ Installed
2. **Email Service:** ✅ Created (`src/lib/email.js`)
3. **Email Templates:** ✅ All created
   - Subscription Confirmation
   - Instant Boost Confirmation
   - Subscription Cancellation
   - Welcome Email (available, not yet integrated)

4. **Integration:** ✅ Added to webhooks and cancel endpoint

### Setup Required

1. **Add Environment Variables:**
   ```bash
   RESEND_API_KEY=re_2n7Hdbf7_DRY6zSx78rNzJJRC4395zkYn
   RESEND_FROM_EMAIL=noreply@toptoursai.com
   ```

2. **Verify Domain in Resend:**
   - Go to https://resend.com/domains
   - Add domain: `toptoursai.com`
   - Add DNS records (SPF, DKIM, DMARC)
   - Wait for verification

3. **Test Email Delivery:**
   - Make a test subscription purchase
   - Make a test instant boost purchase
   - Check email inbox for confirmations

## 🔄 Switching Stripe to Production

### Step-by-Step:

1. **Get Production Keys:**
   - Stripe Dashboard → Live mode → API keys
   - Copy `Secret key` and `Publishable key`

2. **Update Environment Variables:**
   ```bash
   # In .env.local (local) or Vercel (production)
   STRIPE_SECRET_KEY=sk_live_...  # Changed from sk_test_
   STRIPE_PUBLISHABLE_KEY=pk_live_...  # Changed from pk_test_
   ```

3. **Create Production Webhook:**
   - URL: `https://toptours.ai/api/webhooks/stripe`
   - Copy webhook secret
   - Add: `STRIPE_WEBHOOK_SECRET=whsec_...`

4. **Get Production Price IDs:**
   - Create products in Stripe (Live mode)
   - Copy Price IDs
   - Update all `STRIPE_*_PRICE_ID` variables

5. **Update Frontend:**
   - Update `src/lib/stripe.js` if needed (should auto-detect from env)

6. **Test in Production:**
   - Make a small test purchase
   - Verify webhook receives events
   - Check database updates correctly

## 🎯 Recommended Order

1. **Test Everything in Test Mode** ✅
   - Make sure all features work
   - Fix any bugs

2. **Add Transaction Emails** (Optional but recommended)
   - Set up Resend
   - Add email templates
   - Test email delivery

3. **Switch to Production Stripe**
   - Get production keys
   - Update environment variables
   - Test with small purchase

4. **Deploy to Production**
   - Push to main branch
   - Vercel auto-deploys
   - Monitor for errors

## ⚠️ Important Notes

- **Stripe Test vs Live:** Just changing API keys switches modes
- **Webhook Secret:** Must get new secret for production webhook
- **Price IDs:** Must create new products/prices in live mode
- **Testing:** Always test in test mode first!
- **Backup:** Export test data if needed before switching

