# API Setup Guide for TopTours.ai

## Viator API Configuration

The Viator API is **required** for the site to display tours and activities.

### Local Development Setup

1. **Create a `.env.local` file** in the root directory of the project (same level as package.json):

**File: `.env.local`**
```bash
VIATOR_API_KEY=your_actual_viator_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

**Important:** 
- Replace `your_actual_viator_api_key_here` with your real Viator API key from Vercel
- This file is already in `.gitignore` so it won't be committed to git
- You need to restart your dev server after creating this file

2. Get your Viator API key:
   - Visit: https://www.viator.com/partner/
   - Sign up for a partner account
   - Navigate to API settings to get your key

3. (Optional) Get OpenAI API key for AI-generated descriptions:
   - Visit: https://platform.openai.com/api-keys
   - Create a new API key

### Vercel Deployment Setup

1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:
   - `VIATOR_API_KEY`: Your Viator API key
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)

5. Redeploy your site for the changes to take effect

### Testing the API

To test if the Viator API is working:

1. Start your dev server: `npm run dev`
2. Visit any destination page (e.g., http://localhost:3000/destinations/paris)
3. Check if tours are loading
4. Open browser console - you should see API calls being made

If tours don't load, check:
- ✅ API key is correctly set in `.env.local`
- ✅ API key is valid (not expired or revoked)
- ✅ No typos in the environment variable name
- ✅ Server was restarted after adding the `.env.local` file

### API Endpoints

- **Viator Search**: `/api/internal/viator-search`
  - Method: POST
  - Body: `{ "destination": "Paris", "searchTerm": "Paris tours" }`
  
- **OpenAI Descriptions**: `/api/openai-description` (optional)
  - Method: POST
  - Body: `{ "destination": "Paris" }`

- **OpenAI Categories**: `/api/openai-categories` (optional)
  - Method: POST
  - Body: `{ "destination": "Paris" }`

## Current Status

✅ Viator API endpoint ready (`api/viator-search.js`)
✅ OpenAI endpoints ready (optional features)
✅ Frontend configured to call APIs
✅ Error handling and validation in place

⚠️ **Action Required**: Add your Viator API key to `.env.local` (local) or Vercel Environment Variables (production)

