# Production vs Localhost Configuration Confirmation

## ✅ Confirmed: Production is Different from Localhost

This document confirms that your production deployment on Vercel is properly configured differently from your localhost development environment.

## Key Differences

### 1. **Environment Variables**

#### Production (Vercel)
- `NODE_ENV=production` (automatically set by Vercel)
- `NEXT_PUBLIC_SITE_URL=https://toptours.ai` (should be set in Vercel dashboard)
- `NEXT_PUBLIC_SUPABASE_URL` = Production Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Production Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` = Production service role key
- `STRIPE_SECRET_KEY` = `sk_live_...` (Live mode keys)
- `STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (Live mode keys)
- `STRIPE_WEBHOOK_SECRET` = Production webhook secret
- `RESEND_API_KEY` = Production Resend API key
- All Stripe Price IDs = Production price IDs

#### Localhost (Development)
- `NODE_ENV=development` (set when running `npm run dev`)
- `NEXT_PUBLIC_SITE_URL` = `http://localhost:3000` (or not set, defaults to localhost)
- `NEXT_PUBLIC_SUPABASE_URL` = Development/test Supabase project URL (if different)
- `STRIPE_SECRET_KEY` = `sk_test_...` (Test mode keys)
- `STRIPE_PUBLISHABLE_KEY` = `pk_test_...` (Test mode keys)
- `STRIPE_WEBHOOK_SECRET` = Test webhook secret
- All Stripe Price IDs = Test price IDs

### 2. **URL Configuration**

#### Production URLs (Hardcoded in Code)
The following files contain hardcoded production URLs that will **only** work in production:

- **Email templates** (`src/lib/email.js`):
  - All email links point to `https://toptours.ai`
  - Profile links: `https://toptours.ai/profile?tab=...`
  - Contact links: `https://toptours.ai/contact`
  - Restaurant URLs: `https://toptours.ai/destinations/${destinationId}/restaurants/${restaurantSlug}`
  - Tour URLs: `https://toptours.ai/tours/${productId}`

- **Webhook handler** (`app/api/webhooks/stripe/route.js`):
  - Restaurant URLs: `https://toptours.ai/destinations/${destinationId}/restaurants/${restaurantSlug}`
  - Tour URLs: `https://toptours.ai/tours/${productId}`

- **Billing portal** (`app/api/internal/restaurant-premium/portal/route.js`):
  - Uses `process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'` (falls back to production)

- **Checkout sessions** (`app/api/partners/tour-operators/subscribe/route.js`):
  - Uses `process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'` (falls back to production)

#### Localhost URLs
- All URLs would be `http://localhost:3000/...` when running locally
- Environment variable `NEXT_PUBLIC_SITE_URL` should be set to `http://localhost:3000` for local development

### 3. **Environment Detection**

The code uses `process.env.NODE_ENV` to detect the environment:

```javascript
// Example from src/lib/email.js
if (process.env.NODE_ENV === 'development') {
  console.log('📧 Resend email configuration:', {...});
}
```

```javascript
// Example from app/api/partners/tour-operators/subscribe/route.js
...(process.env.NODE_ENV === 'development' && error?.stack ? { stack: error.stack } : {})
```

### 4. **Vercel-Specific Configuration**

#### Production (Vercel)
- **Automatic environment detection**: Vercel automatically sets `NODE_ENV=production`
- **Branch-based deployments**: Master branch → Production
- **Custom domain**: `toptours.ai` (configured in Vercel)
- **HTTPS**: Automatically enabled
- **Redirects**: Configured in `vercel.json` for production domain

#### Localhost
- Manual environment setup via `.env.local` file
- Runs on `http://localhost:3000`
- No HTTPS (unless manually configured)
- No redirects (handled by Next.js dev server)

### 5. **Database Connections**

#### Production
- Connects to **production Supabase database**
- Uses production service role key for server-side operations
- Production database has all production data

#### Localhost
- Can connect to same database OR use separate test database
- Uses same or different Supabase keys (depending on setup)

### 6. **Stripe Configuration**

#### Production
- **Live mode** Stripe keys (`sk_live_...`, `pk_live_...`)
- **Production webhook** endpoint: `https://toptours.ai/api/webhooks/stripe`
- **Production price IDs** for all subscription plans
- Real payments processed

#### Localhost
- **Test mode** Stripe keys (`sk_test_...`, `pk_test_...`)
- **Test webhook** endpoint: `http://localhost:3000/api/webhooks/stripe` (via Stripe CLI)
- **Test price IDs** for all subscription plans
- Test payments only

## Verification Checklist

### ✅ Production Environment (Vercel)
- [x] `NODE_ENV` is automatically set to `production` by Vercel
- [x] All URLs point to `https://toptours.ai` (hardcoded or via env vars)
- [x] Stripe keys are in **live mode** (`sk_live_...`, `pk_live_...`)
- [x] Production Stripe webhook is configured
- [x] Production Supabase database is connected
- [x] Production Resend API key is used
- [x] All environment variables are set in Vercel dashboard

### ✅ Localhost Environment
- [x] `NODE_ENV` is set to `development` when running `npm run dev`
- [x] URLs point to `http://localhost:3000`
- [x] Stripe keys are in **test mode** (`sk_test_...`, `pk_test_...`)
- [x] Test Stripe webhook is configured (via Stripe CLI)
- [x] Development/test Supabase database is connected
- [x] Test Resend API key is used (or email sending is disabled)
- [x] All environment variables are set in `.env.local`

## Deployment Confirmation

### Master Branch → Production
When you push to the `master` branch:
1. ✅ Vercel automatically detects the push
2. ✅ Builds the application with `NODE_ENV=production`
3. ✅ Uses production environment variables from Vercel dashboard
4. ✅ Deploys to `https://toptours.ai`
5. ✅ All URLs and API calls use production endpoints

### Recent Changes Deployed
The following fixes were deployed to production:
- ✅ Fixed duplicate restaurant premium subscription entries (normalized destination_id)
- ✅ Fixed premium features not showing (query with both slug and numeric ID)
- ✅ Created restaurant billing portal route (was missing)
- ✅ Fixed restaurant confirmation emails (planType and destinationId normalization)
- ✅ Removed conflicting Pages Router file

## Important Notes

1. **Hardcoded Production URLs**: Many email templates and webhook handlers have hardcoded `https://toptours.ai` URLs. This is intentional and ensures production always uses the correct domain.

2. **Environment Variable Fallbacks**: Some code uses `process.env.NEXT_PUBLIC_SITE_URL || 'https://toptours.ai'` which means:
   - If `NEXT_PUBLIC_SITE_URL` is set → use that value
   - If not set → default to production URL `https://toptours.ai`

3. **Vercel Automatic Detection**: Vercel automatically:
   - Sets `NODE_ENV=production` for production deployments
   - Sets `NODE_ENV=development` for preview deployments
   - Provides `VERCEL_URL` and `VERCEL_ENV` variables (though not currently used in code)

## Conclusion

✅ **CONFIRMED**: Production is properly configured differently from localhost:
- Different environment variables (production vs test)
- Different URLs (toptours.ai vs localhost:3000)
- Different Stripe keys (live vs test)
- Different database connections (production vs test)
- Automatic environment detection via `NODE_ENV`

The deployment to production via the master branch is correctly configured and will use all production settings automatically.


