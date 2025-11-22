# Destination Page Optimization Cost Estimate

## Overview
Cost estimate for optimizing `/destinations/` pages for ~3,200 destinations without guides, using OpenAI API and shared country-level data.

## Current Status
- **Total destinations**: 3,382
- **Destinations with guides**: 182
- **Destinations without guides**: ~3,200
- **Unique countries**: 215
- **Cities**: 2,270

## Content Sections to Generate

Based on existing destination structure, we need to generate:

1. **whyVisit** (6-8 bullet points) - ~150-200 tokens output
2. **bestTimeToVisit** (weather, bestMonths, peakSeason, offSeason) - ~100-150 tokens output
3. **gettingAround** (transportation info) - ~50-100 tokens output
4. **highlights** (6-8 attractions/landmarks) - ~150-200 tokens output
5. **tourCategories** (6 categories) - ~50 tokens output
6. **Additional SEO fields** (keywords, secondaryKeywords) - ~100 tokens output

**Total per destination**: ~600-800 tokens output

## Cost Optimization Strategy

### Strategy 1: Country-Level Data Sharing
Since destinations in the same country share climate/seasonal patterns:
- Generate `bestTimeToVisit` **once per country** (215 countries)
- Reuse for all cities in that country
- **Savings**: ~3,200 - 215 = 2,985 destinations × 100 tokens = ~298,500 tokens saved

### Strategy 2: Smart Prompting
- Use existing data from `viatorDestinationsClassified.json` (region, country, type)
- Reference similar destinations for context
- Generate city-specific content (whyVisit, highlights) but share country-level data

## Token Usage Estimate

### Per Destination (with optimization):
- **Input tokens**: ~800-1,000 tokens (prompt + context)
- **Output tokens**: ~500-700 tokens (excluding shared bestTimeToVisit)
- **Total per destination**: ~1,300-1,700 tokens

### Country-Level Data (bestTimeToVisit):
- **Input tokens**: ~600-800 tokens
- **Output tokens**: ~100-150 tokens
- **Total per country**: ~700-950 tokens

## Cost Calculation

### OpenAI GPT-3.5 Turbo Pricing (as of 2024):
- **Input**: $0.50 per 1M tokens
- **Output**: $1.50 per 1M tokens

### Scenario 1: Full Generation (No Optimization)
- Destinations: 3,200 × 1,500 tokens = 4,800,000 tokens
- Input: 3,200 × 1,000 = 3,200,000 tokens = $1.60
- Output: 3,200 × 500 = 1,600,000 tokens = $2.40
- **Total: ~$4.00**

### Scenario 2: Optimized (Country-Level Sharing)
- Destinations: 3,200 × 1,500 tokens = 4,800,000 tokens
  - Input: 3,200 × 1,000 = 3,200,000 tokens = $1.60
  - Output: 3,200 × 500 = 1,600,000 tokens = $2.40
- Countries (bestTimeToVisit): 215 × 900 tokens = 193,500 tokens
  - Input: 215 × 700 = 150,500 tokens = $0.08
  - Output: 215 × 150 = 32,250 tokens = $0.05
- **Total: ~$4.13**

*Note: Optimization saves minimal cost but improves consistency and reduces API calls.*

### Scenario 3: Enhanced Content (More Detailed)
If we want more detailed content (longer descriptions, more highlights):
- Per destination: ~2,000-2,500 tokens
- 3,200 destinations × 2,250 tokens = 7,200,000 tokens
- Input: 3,200 × 1,200 = 3,840,000 tokens = $1.92
- Output: 3,200 × 1,050 = 3,360,000 tokens = $5.04
- **Total: ~$6.96**

## Future Additions

### Hotels (RateHawk API)
- **RateHawk API**: Typically free or low-cost (check their pricing)
- **Data processing**: Minimal OpenAI costs if generating descriptions
- **Estimated cost**: $0-50/month (depending on API pricing)

### Restaurants (OpenAI API)
- **Per destination**: ~10-20 restaurants
- **Per restaurant**: ~200-300 tokens (name, description, cuisine type, price range)
- **3,200 destinations × 15 restaurants × 250 tokens = 12,000,000 tokens**
- Input: 6,000,000 tokens = $3.00
- Output: 6,000,000 tokens = $9.00
- **Total: ~$12.00**

## Recommended Approach

### Phase 1: Core Destination Content (~$4-7)
1. Generate `whyVisit`, `highlights`, `gettingAround`, `tourCategories` per destination
2. Generate `bestTimeToVisit` per country (215 countries)
3. Generate enhanced SEO fields

### Phase 2: Hotels (~$0-50/month)
1. Integrate RateHawk API
2. Generate hotel descriptions if needed (minimal OpenAI cost)

### Phase 3: Restaurants (~$12)
1. Generate restaurant recommendations per destination
2. Include cuisine types, price ranges, descriptions

## Total Estimated Costs

| Phase | Content | Cost |
|-------|---------|------|
| Phase 1 | Destination pages (optimized) | $4-7 |
| Phase 2 | Hotels (RateHawk API) | $0-50/month |
| Phase 3 | Restaurants | $12 |
| **Total One-Time** | **All content** | **~$16-69** |
| **Monthly** | **Hotels (if API costs)** | **$0-50** |

## Notes

1. **Batch Processing**: Process in batches of 50-100 to avoid rate limits
2. **Error Handling**: Budget 5-10% extra for retries
3. **Quality Control**: May need manual review for top destinations
4. **Updates**: Content may need periodic updates (seasonal changes, new attractions)
5. **Storage**: Generated content will be stored in JSON files (minimal storage cost)

## Implementation Script Structure

```
scripts/
├── generate-destination-content.js (main script)
├── generate-country-climate-data.js (country-level data)
└── generate-restaurant-content.js (future)
```

## Conclusion

The cost is **extremely low** (~$4-7 for 3,200 destinations) due to:
- Efficient GPT-3.5 Turbo pricing
- Country-level data sharing
- Focused, structured prompts
- Minimal output tokens needed

The main investment is **development time** for the scripts, not API costs.

