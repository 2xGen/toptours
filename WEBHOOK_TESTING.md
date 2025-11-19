# Testing Stripe Webhooks Locally

## The Problem
When you complete a payment, Stripe sends webhooks to your server to update the database. However, for local development, Stripe can't reach `localhost:3006`, so webhooks aren't received and the database doesn't get updated.

## Solution: Use Stripe CLI

### Step 1: Install Stripe CLI
1. Download from: https://stripe.com/docs/stripe-cli
2. Or install via package manager:
   - **Windows**: `scoop install stripe` or download from GitHub
   - **Mac**: `brew install stripe/stripe-cli/stripe`
   - **Linux**: See Stripe docs

### Step 2: Login to Stripe CLI
```bash
stripe login
```
This will open your browser to authenticate.

### Step 3: Forward Webhooks to Local Server
In a **separate terminal window**, run:
```bash
stripe listen --forward-to localhost:3006/api/webhooks/stripe
```

This will:
- Forward all webhook events from Stripe to your local server
- Display a webhook signing secret (starts with `whsec_`)
- Show all webhook events in real-time

### Step 4: Update Your .env.local
Copy the webhook signing secret from the Stripe CLI output and add it to your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Use the secret from Stripe CLI
```

### Step 5: Restart Your Dev Server
After updating `.env.local`, restart your Next.js dev server.

### Step 6: Test Again
1. Make a test payment
2. Watch the Stripe CLI terminal - you should see webhook events being received
3. Check your database - it should now be updated!

## Alternative: Manual Webhook Testing

If you can't use Stripe CLI, you can manually trigger webhook events:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Find your webhook endpoint
3. Click "Send test webhook"
4. Select the event type (e.g., `checkout.session.completed`)
5. Send the test event

However, this won't work for localhost - you'd need to use a service like ngrok to expose your local server.

## Production Webhooks

For production, make sure:
1. Your webhook endpoint URL is set to: `https://toptours.ai/api/webhooks/stripe`
2. The webhook secret in your production environment variables matches the one in Stripe Dashboard
3. All required events are selected in the webhook configuration

## Events to Listen For

Make sure these events are enabled in your Stripe webhook:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `payment_intent.succeeded` (optional, backup)

## Troubleshooting

### Webhooks not received
- Check Stripe CLI is running and forwarding
- Verify webhook secret matches
- Check server logs for errors
- Verify webhook endpoint URL is correct

### Database not updating
- Check webhook handler logs
- Verify user ID is in metadata
- Check Supabase connection
- Look for error messages in console

### Signature verification failed
- Make sure `STRIPE_WEBHOOK_SECRET` is set correctly
- Use the secret from Stripe CLI (for local) or Stripe Dashboard (for production)
- Don't mix test and live mode secrets

