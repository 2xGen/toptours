# Vercel Preview Deployment Setup for Viator API

## Required Environment Variables

To enable reviews and recommendations on Vercel preview deployments, you need to set these environment variables in your Vercel project:

### 1. Go to Vercel Dashboard
- Navigate to your project → **Settings** → **Environment Variables**

### 2. Add These Variables

#### For Preview Deployments (Sandbox API):
```
VIATOR_SANDBOX_API_KEY=2b588134-208d-4fc7-a35d-b4286a8eff58
VIATOR_API_BASE_URL=https://api.sandbox.viator.com
ENABLE_REVIEW_SNIPPETS=true
```

**Important:** Make sure to select **"Preview"** as the environment when adding these variables.

#### Optional (for debugging):
```
NEXT_PUBLIC_VERCEL_ENV=preview
```

### 3. Environment Variable Settings

When adding each variable, select:
- ✅ **Preview** (for preview deployments)
- ❌ **Production** (leave unchecked - only enable after certification)
- ❌ **Development** (optional - for local testing)

### 4. How It Works

The code automatically detects preview deployments by checking:
- `VERCEL_ENV === 'preview'` (automatically set by Vercel)
- `ENABLE_REVIEW_SNIPPETS === 'true'` (manual override)
- `NODE_ENV === 'development'` (local development)

### 5. Verify It's Working

After deploying, check the Vercel function logs. You should see:
```
🔍 [PREVIEW MODE] Detection: { ... }
🔑 [REVIEWS] Using SANDBOX API key: ...
✅ [REVIEWS] Fetched X reviews for tour ...
```

### 6. Troubleshooting

**If reviews still don't show:**

1. **Check Vercel logs:**
   - Go to your deployment → **Functions** tab
   - Look for console logs showing preview mode detection

2. **Verify environment variables:**
   - Make sure `VIATOR_SANDBOX_API_KEY` is set for **Preview** environment
   - Make sure `ENABLE_REVIEW_SNIPPETS=true` is set for **Preview** environment

3. **Check API key:**
   - Verify the sandbox API key is correct
   - Test the API key in Postman first

4. **Force rebuild:**
   - After adding environment variables, trigger a new deployment
   - Environment variables require a new build to take effect

### 7. After Certification

Once Viator certifies your integration:
1. Remove `ENABLE_REVIEW_SNIPPETS` (or set to `false`)
2. Add production `VIATOR_API_KEY` for **Production** environment
3. Set `VIATOR_API_BASE_URL=https://api.viator.com` for **Production**
4. Keep sandbox variables for **Preview** (for testing)
