# 🔄 Switching Stripe from Test to Production

## Quick Answer

**Yes, it's mostly just changing API keys!** But there are a few important steps:

## Steps to Switch

### 1. Get Production API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle **"Test mode"** OFF (top right) → Now in **"Live mode"**
3. Go to **Developers** → **API keys**
4. Copy:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`) - Click "Reveal test key"

### 2. Update Environment Variables

**In `.env.local` (for local) or Vercel Environment Variables (for production):**

```bash
# Change these from test_ to live_:
STRIPE_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_PUBLISHABLE_KEY
```

### 3. Create Production Webhook

1. In Stripe Dashboard (Live mode) → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://toptours.ai/api/webhooks/stripe`
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET
   ```

### 4. Create Production Products & Prices

1. In Stripe Dashboard (Live mode) → **Products**
2. Create products for:
   - **Pro Subscription** → Copy Price ID
   - **Pro+ Subscription** → Copy Price ID
   - **Enterprise Subscription** → Copy Price ID
   - **1000 Points Package** → Copy Price ID
   - **3000 Points Package** → Copy Price ID
   - **5000 Points Package** → Copy Price ID

3. Update environment variables:
   ```bash
   STRIPE_PRO_PRICE_ID=price_YOUR_PRODUCTION_PRICE_ID
   STRIPE_PRO_PLUS_PRICE_ID=price_YOUR_PRODUCTION_PRICE_ID
   STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_PRODUCTION_PRICE_ID
   STRIPE_1000_POINTS_PRICE_ID=price_YOUR_PRODUCTION_PRICE_ID
   STRIPE_3000_POINTS_PRICE_ID=price_YOUR_PRODUCTION_PRICE_ID
   STRIPE_5000_POINTS_PRICE_ID=price_YOUR_PRODUCTION_PRICE_ID
   ```

### 5. Update Code (if needed)

The code should automatically use the environment variables, but verify:

- `src/lib/stripe.js` - Uses `process.env.STRIPE_SECRET_KEY`
- `pages/api/internal/promotion/subscribe.js` - Uses `STRIPE_PRICE_IDS` from env
- `pages/api/internal/promotion/purchase-a-la-carte.js` - Uses `STRIPE_PRICE_IDS` from env

### 6. Test Production

1. **Make a small test purchase** (e.g., $1 subscription)
2. **Check webhook logs** in Stripe Dashboard
3. **Verify database updates** in Supabase
4. **Check email confirmations** (if set up)

## ⚠️ Important Notes

- **Test Mode Data:** Test mode customers/subscriptions don't transfer to live mode
- **Webhook Secret:** Must be different for production (get new one)
- **Price IDs:** Must create new products in live mode (can't reuse test IDs)
- **Testing:** Always test with small amounts first!

## 🔒 Security

- **Never commit** production keys to git
- Use Vercel Environment Variables for production
- Keep `.env.local` in `.gitignore`
- Rotate keys if exposed

