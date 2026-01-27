# Airport Transfers FAQ Strategy - Cost & Implementation Analysis

## 💰 Cost Analysis: Gemini Flash 1.5

### Current Pricing (2026)
- **Gemini 1.5 Flash**: $0.075 per million input tokens, $0.30 per million output tokens
- **Gemini 2.5 Flash Lite** (cheapest): $0.0375 per million input tokens, $0.15 per million output tokens
- **Batch Processing**: 50% discount available

### Token Estimation Per Request
**Prompt (Input):**
- System prompt: ~200 tokens
- Destination context: ~100 tokens (name, country, airport code if available)
- Total: ~300 tokens per request

**Response (Output):**
- Short description: ~50 tokens
- 3 FAQs (question + answer): ~200 tokens
- Total: ~250 tokens per request

**Total per request: ~550 tokens**
- Cost per request: ~$0.0000165 (Flash Lite) or ~$0.000033 (Flash 1.5)
- **$1 = ~60,000 requests** (Flash Lite) or **~30,000 requests** (Flash 1.5)

### Scale Analysis

#### Option 1: All Destinations with Airports (~1,000 destinations)
- Estimated destinations with airports: 800-1,200
- Cost: $0.013 - $0.020 (Flash Lite) or $0.026 - $0.040 (Flash 1.5)
- **One-time cost: <$0.05** ✅

#### Option 2: Featured/Curated Destinations Only (247 destinations)
- Cost: $0.004 - $0.008 (Flash Lite) or $0.008 - $0.016 (Flash 1.5)
- **One-time cost: <$0.02** ✅

#### Option 3: On-Demand Generation (Lazy Loading)
- Generate when page is first visited
- Cache in database forever
- Cost: Only pay for pages that get traffic
- **Ongoing cost: Minimal** ✅

## 🎯 Recommended Approach: **Hybrid Strategy**

### Phase 1: Featured Destinations (247) - Immediate
- Generate for all 247 curated destinations
- One-time cost: **~$0.01**
- High ROI (these get most traffic)
- Can be done in one batch

### Phase 2: On-Demand for Others
- Generate on first page visit
- Cache in database
- Fallback to template if generation fails
- Cost: Only pay for pages that get actual traffic

### Phase 3: Batch Generate Top 500 (Optional)
- Identify top 500 destinations by traffic/popularity
- Batch generate during low-traffic hours
- Cost: **~$0.02**

## 📝 Content Quality Improvements

### What AI Can Add:
1. **Specific Airport Names**
   - "PRG Airport" for Prague
   - "AUA Airport" for Aruba
   - "JFK Airport" for New York

2. **Destination-Specific Details**
   - Distance from airport to city center
   - Typical transfer duration
   - Local transportation context

3. **Better FAQs**
   - More relevant questions
   - Destination-specific answers
   - Local tips and insights

4. **Improved Descriptions**
   - More engaging
   - Include airport code
   - Mention specific neighborhoods/areas

## 🛠️ Implementation Options

### Option A: Database-Driven (Recommended)
- Store generated content in `category_guides` table
- Add fields: `ai_generated_description`, `ai_generated_faqs`
- Generate on-demand or batch
- Fallback to template if not generated

### Option B: API Route (On-Demand)
- Create `/api/internal/generate-airport-transfers-content`
- Generate when page loads (first time)
- Cache in database
- Show loading state during generation

### Option C: Background Job
- Generate for all destinations in background
- Use queue system (Vercel Cron or similar)
- Generate 100 per day to spread cost

## 💡 Implementation

### Step 1: Run Batch Generation Script
```bash
node scripts/generate-airport-transfers-content.js
```

This will:
- Generate content for all 247 featured destinations
- Use Gemini 2.5 Flash Lite (cheapest model)
- Store in `category_guides` table with `category_slug = 'airport-transfers'`
- Include airport codes from database when available
- Cost: **~$0.01** total

### Step 2: Page Already Uses Database
The airport transfers page (`/destinations/[id]/guides/airport-transfers`) already:
- Checks database first via `getGuideFromDatabase()`
- Falls back to default template if not found
- No code changes needed! ✅

### Step 3: Verify Results
After running the script, check:
- Database: `SELECT * FROM category_guides WHERE category_slug = 'airport-transfers'`
- Pages: Visit `/destinations/aruba/guides/airport-transfers` to see generated content

## 📊 Cost Breakdown

| Approach | Destinations | One-Time Cost | Monthly Cost |
|----------|-------------|---------------|--------------|
| Featured Only | 247 | $0.01 | $0 |
| Top 500 | 500 | $0.025 | $0 |
| All with Airports | 1,000 | $0.05 | $0 |

## ✅ Recommendation: **Batch Generate for 247 Featured Destinations**

### Why This Approach?
1. **Immediate Value**: 247 featured destinations get most traffic → highest ROI
2. **Database-Driven**: Store in `category_guides` table (like other category guides)
3. **Cost-Effective**: ~$0.01 one-time cost
4. **Quality**: Unique, destination-specific content for SEO
5. **Consistent**: Same pattern as existing category guides (hardcoded in database)

### Implementation Plan:

**Phase 1: Generate for 247 Featured Destinations (This Week)**
- One-time batch script
- Cost: ~$0.01
- Store in `category_guides` table with `category_slug = 'airport-transfers'`
- Includes airport codes from `viator_destinations.iata_codes`
- Uses Gemini 2.5 Flash Lite (cheapest model)

### Benefits:
- ✅ High-quality content for high-traffic pages
- ✅ Scalable solution for all 3,500 destinations
- ✅ Minimal ongoing costs (<$0.10/month)
- ✅ Better SEO (unique, destination-specific content)
- ✅ Better UX (relevant FAQs with airport names like "PRG Airport")
- ✅ Airport codes from database (already available!)

## 🔧 Technical Implementation

### Prompt Template:
```
Generate a short description (2-3 sentences, max 120 words) and 3 FAQs for airport transfers in {destination}.

Include:
- Airport code/name (e.g., "PRG Airport" for Prague)
- Distance to city center if known
- Typical transfer duration
- Local context

Return JSON:
{
  "description": "...",
  "faqs": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}
```

### Database Schema:
- Uses existing `category_guides` table
- `category_slug = 'airport-transfers'`
- `faqs` JSONB field stores the 3 FAQs
- `subtitle` field stores the short description

### Batch Script:
- `scripts/generate-airport-transfers-content.js`
- Reads 247 destinations from `destinationsData.js`
- Fetches airport codes from `viator_destinations.iata_codes`
- Generates content using Gemini 2.5 Flash Lite
- Inserts/updates `category_guides` table
