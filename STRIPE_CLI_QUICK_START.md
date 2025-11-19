# Stripe CLI Quick Start Guide

## Your Stripe CLI Location
```
C:\Users\matth\OneDrive\Bureaublad\Werk\TopToursai\stripe-cli\stripe.exe
```

## Step 1: Login to Stripe

Open PowerShell or Command Prompt and run:

```powershell
C:\Users\matth\OneDrive\Bureaublad\Werk\TopToursai\stripe-cli\stripe.exe login
```

This will open your browser to authenticate with Stripe.

## Step 2: Forward Webhooks to Your Local Server

In a **separate terminal window** (keep it running), run:

```powershell
C:\Users\matth\OneDrive\Bureaublad\Werk\TopToursai\stripe-cli\stripe.exe listen --forward-to localhost:3006/api/webhooks/stripe
```

You should see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

## Step 3: Copy the Webhook Secret

Copy the `whsec_xxxxxxxxxxxxx` secret from the terminal output.

## Step 4: Update Your .env.local

Add or update this line in your `.env.local` file:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## Step 5: Restart Your Dev Server

Stop and restart your Next.js dev server to load the new environment variable.

## Step 6: Test!

1. Make a test payment/subscription
2. Watch the Stripe CLI terminal - you should see webhook events
3. Check your database - it should be updated automatically!

## Optional: Add to PATH (Easier Commands)

If you want to use just `stripe` instead of the full path:

1. Right-click "This PC" → Properties
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find "Path" and click "Edit"
5. Click "New" and add: `C:\Users\matth\OneDrive\Bureaublad\Werk\TopToursai\stripe-cli`
6. Click OK on all windows
7. Restart your terminal

Then you can use:
```bash
stripe login
stripe listen --forward-to localhost:3006/api/webhooks/stripe
```

## Troubleshooting

- **"stripe is not recognized"**: Use the full path or add to PATH
- **Webhooks not received**: Make sure the `listen` command is still running
- **Database not updating**: Check server logs for webhook errors

