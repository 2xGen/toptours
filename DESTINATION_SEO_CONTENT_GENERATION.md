# Destination SEO Content Generation

## Overview

This script generates optimized SEO content for all destinations without guides (3,200 destinations).

## What Gets Generated

For each destination, the script generates:

1. **Card Sentence (briefDescription)**: A compelling one-sentence description (15-25 words)
   - Example: "Dramatic cliffs, colorful villages, and Mediterranean beauty — the Amalfi Coast is Italy's most stunning coastline."
   - Used in destination cards on the destinations page
   - Also becomes the meta description for SEO

2. **Hero Description**: A 2-3 sentence description (40-60 words) for the main hero section
   - Example: "Discover top-rated Amalfi Coast tours, excursions, and activities powered by AI. From coastal boat tours to Positano experiences, find the perfect way to explore Italy's most beautiful coastline."
   - Used in the hero section of destination detail pages

3. **SEO Title**: A 50-60 character title optimized for search engines
   - Example: "Amalfi Coast Tours & Excursions - Top-Rated Activities & Adventures"
   - Used as the page title and in meta tags

## Cost Estimate

**Total Cost: $1.60** for 3,200 destinations using GPT-3.5 Turbo

### Breakdown:
- **Input tokens**: 1,280,000 (~400 per destination)
- **Output tokens**: 640,000 (~200 per destination)
- **Input cost**: $0.64 ($0.50 per 1M tokens)
- **Output cost**: $0.96 ($1.50 per 1M tokens)
- **Total**: $1.60
- **Cost per destination**: $0.0005

### Notes:
- Actual cost may vary slightly based on actual token usage
- Processing time: ~2-3 hours (with delays between batches to avoid rate limits)

## How to Run

1. **Check the cost estimate**:
   ```bash
   node scripts/calculate-seo-content-cost.js
   ```

2. **Run the generation script**:
   ```bash
   node scripts/generate-destination-seo-content.js
   ```

3. **Review the output**:
   - Results will be saved to `generated-destination-seo-content.json`
   - Review the content for quality and accuracy

4. **Integrate the results**:
   - Update `app/destinations/page.js` to use the new `briefDescription` values
   - Create or update destination detail pages with `heroDescription` and `seo.title`
   - Use `briefDescription` as the meta description

## Script Features

- ✅ Automatically filters out destinations that already have guides (182 destinations)
- ✅ Processes in batches of 10 to avoid rate limits
- ✅ Includes 2-second delays between batches
- ✅ Saves progress to JSON file
- ✅ Provides detailed progress updates
- ✅ Handles errors gracefully

## Output Format

The script generates a JSON file with this structure:

```json
{
  "destination-slug": {
    "destinationId": "12345",
    "destinationName": "Destination Name",
    "country": "Country Name",
    "region": "Region Name",
    "type": "CITY",
    "briefDescription": "Card sentence here...",
    "heroDescription": "Hero description here...",
    "seo": {
      "title": "SEO Title Here",
      "description": "Card sentence (used as meta description)"
    }
  }
}
```

## Integration Steps

1. **Update destination cards** (`app/destinations/page.js`):
   - Replace the generic `briefDescription: "Discover tours and activities in ${destName}"` 
   - With the generated card sentences from the JSON file

2. **Create/update destination detail pages**:
   - Add `heroDescription` to the hero section
   - Add `seo.title` to the page metadata
   - Use `briefDescription` as the meta description

3. **Test thoroughly**:
   - Verify all destinations display correctly
   - Check SEO titles are under 60 characters
   - Ensure hero descriptions are engaging and accurate

## Current vs. Optimized Content

### Current (Destinations without guides):
- **Card**: "Discover tours and activities in [Destination]"
- **Hero**: "Discover the best tours and activities in [Destination]. Browse trusted operators and secure instant confirmations."
- **SEO Title**: Generic or missing

### Optimized (After generation):
- **Card**: "Dramatic cliffs, colorful villages, and Mediterranean beauty — the Amalfi Coast is Italy's most stunning coastline."
- **Hero**: "Discover top-rated Amalfi Coast tours, excursions, and activities powered by AI. From coastal boat tours to Positano experiences, find the perfect way to explore Italy's most beautiful coastline."
- **SEO Title**: "Amalfi Coast Tours & Excursions - Top-Rated Activities & Adventures"

## Questions?

If you have any questions or issues, check:
- The script logs for error messages
- The generated JSON file for content quality
- OpenAI API status if requests are failing

