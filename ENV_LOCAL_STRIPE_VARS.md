# Add These Stripe Variables to Your .env.local File

Copy and paste these into your existing `.env.local` file:

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

**Note:** Make sure each price ID is unique and matches your Stripe Dashboard products.

After adding these, restart your dev server for the changes to take effect!

