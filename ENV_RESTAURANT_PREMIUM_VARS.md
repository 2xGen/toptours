# Restaurant Premium Subscription - Environment Variables

Add these to your `.env.local` and production environment variables:

## Stripe Price IDs

You need to create two products in Stripe:

### 1. Restaurant Premium Monthly ($7.99/month)
```
STRIPE_RESTAURANT_PREMIUM_MONTHLY_PRICE_ID=price_1SahpnHvf384RapiNAu7KsFc
```

### 2. Restaurant Premium Yearly ($59.88/year = $4.99/month)
```
STRIPE_RESTAURANT_PREMIUM_YEARLY_PRICE_ID=price_1SahryHvf384RapiEVhLoqar
```

## Creating the Products in Stripe

1. Go to Stripe Dashboard → Products
2. Click "Add product"
3. For **Monthly**:
   - Name: "Restaurant Premium (Monthly)"
   - Description: "Enhanced visibility for your restaurant with premium CTAs, sticky button, and TOP badge"
   - Price: $7.99 / month (recurring)
   - Copy the Price ID (starts with `price_`)

4. For **Yearly**:
   - Name: "Restaurant Premium (Yearly)"
   - Description: "Enhanced visibility for your restaurant - Save 37% with annual billing"
   - Price: $59.88 / year (recurring)
   - Copy the Price ID (starts with `price_`)

## Database Setup

Run the SQL schema to create the `restaurant_premium_subscriptions` table:

```bash
# In Supabase SQL editor, run:
# scripts/restaurant-premium-schema.sql
```

## Webhook Events

The existing Stripe webhook at `/api/webhooks/stripe` already handles:
- `checkout.session.completed` → Activates the subscription
- `customer.subscription.updated` → Updates subscription status
- `customer.subscription.deleted` → Cancels the subscription

No additional webhook configuration needed.

