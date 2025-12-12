# Gemini Guide Generation Workflow

## Overview
This workflow generates high-quality category guides using Gemini API and stores them in Supabase database for better scalability.

## Step-by-Step Process

### 1. Create Database Table
Run the SQL script in Supabase SQL Editor:
```sql
-- Copy and paste contents of: scripts/supabase-create-category-guides-table.sql
-- Execute in Supabase Dashboard → SQL Editor
```

### 2. Generate Guides with Gemini
```bash
# Test with Malaga first
node scripts/generate-category-guides-gemini.js malaga

# Or multiple destinations
node scripts/generate-category-guides-gemini.js malaga,marbella
```

**What happens:**
- Reads destination data from `destinationsData.js`
- For each category, calls Gemini API with detailed prompt
- Generates guide in exact same format as existing guides
- Saves to `generated-guides-gemini-output.js` for review

**Model Used:** `gemini-1.5-flash-lite` (cheapest option, perfect quality for this use case)

**Cost:** Very affordable - Flash Lite is Google's most cost-effective model

### 3. Review Generated Guides
```bash
# Open and review the output file
generated-guides-gemini-output.js
```

Check for:
- ✅ Accurate pricing (USD/EUR)
- ✅ Correct facts and details
- ✅ Proper formatting
- ✅ SEO optimization

### 4. Import to Database
```bash
node scripts/import-guides-to-database.js
```

**What happens:**
- Reads `generated-guides-gemini-output.js`
- Converts to database format
- Upserts into Supabase `category_guides` table
- Handles conflicts (updates existing guides)

### 5. Update Code to Read from Database
Once guides are in database, update the code to read from Supabase instead of JSON files.

## Image Handling

### Category Guide Images
- **Database field:** `hero_image` (TEXT) - stores image URL
- **Fallback:** If no `hero_image`, uses `destination.imageUrl`
- **OG Images:** Automatically uses `guideData.heroImage || destination.imageUrl`
- **Layout:** Category guide pages automatically use the image for hero sections

### Adding Images to Guides
You can add images in two ways:

1. **Via Database (Recommended):**
   ```sql
   UPDATE category_guides 
   SET hero_image = 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/destinations/malaga.png'
   WHERE destination_id = 'malaga';
   ```

2. **Via Import Script:**
   - Add `heroImage` field to generated guides before importing
   - Or update in database after import

### Destination Card Images
Destination cards use `destination.imageUrl` from `destinationsData.js`. To update:
- Edit `destinationsData.js` and set `imageUrl` field
- Cards will automatically show the new image

## Current Status

✅ **Database Schema:** Created (`scripts/supabase-create-category-guides-table.sql`)
✅ **Generation Script:** Ready (`scripts/generate-category-guides-gemini.js`)
✅ **Import Script:** Ready (`scripts/import-guides-to-database.js`)
⏳ **Code Update:** Need to update code to read from database instead of JSON

## Next Steps After Testing Malaga

1. Review quality of Malaga guides
2. If satisfied, update code to read from database
3. Generate guides for more destinations
4. Gradually migrate from JSON to database

## Environment Variables Required

```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Notes

- **Model:** Using `gemini-1.5-flash-lite` (cheapest, high quality)
- **Rate Limiting:** 2 second delay between API calls
- **Quality:** Matches existing guide style and format exactly
- **Scalability:** Database approach handles 3,382+ destinations easily

