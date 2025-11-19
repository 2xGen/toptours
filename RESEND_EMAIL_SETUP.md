# 📧 Resend Email Setup Guide

## Quick Setup

### 1. Sign Up for Resend

1. Go to https://resend.com
2. Create account (free tier: 3,000 emails/month)
3. Verify your domain (optional, but recommended)
   - Or use their default domain for testing

### 2. Get API Key

1. Go to Resend Dashboard → **API Keys**
2. Click **"Create API Key"**
3. Name it: `TopTours Production`
4. Copy the API key (starts with `re_`)

### 3. Install Resend Package

```bash
npm install resend
```

### 4. Add Environment Variables

**In `.env.local` (local) or Vercel (production):**

```bash
RESEND_API_KEY=re_YOUR_API_KEY_HERE
RESEND_FROM_EMAIL=noreply@toptours.ai
# Or use Resend's default: onboarding@resend.dev (for testing)
```

### 5. Email Templates to Create

I'll create these for you:
1. ✅ Subscription confirmation
2. ✅ Instant boost payment confirmation
3. ✅ Subscription cancelled
4. ✅ Welcome email (optional)

## Email Events to Send

### When to Send:

1. **Subscription Activated** → After webhook processes `checkout.session.completed` (subscription mode)
2. **Instant Boost Purchased** → After webhook processes `payment_intent.succeeded`
3. **Subscription Cancelled** → When user cancels subscription
4. **Welcome Email** → After user signs up (optional)

## Next Steps

Would you like me to:
1. ✅ Set up Resend integration
2. ✅ Create email templates
3. ✅ Add email sending to webhook handlers
4. ✅ Test email delivery

Let me know and I'll implement it!

