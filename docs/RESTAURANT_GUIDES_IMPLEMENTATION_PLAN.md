# Restaurant Guides Implementation Plan
## Q1 2026: Scale Restaurant Content to 1,482 SEO Pages

### Overview
Create 9 cuisine-based restaurant guide pages per destination (247 destinations × 9 = 2,223 pages) to:
- Build internal linking authority
- Target long-tail restaurant keywords
- Drive organic traffic to restaurant listings
- Support premium restaurant subscription revenue

---

## 9 Cuisine-Based Restaurant Guide Categories

**Strategy:** Cuisine-based guides align with how people actually search: "best Italian restaurants in Aruba". This approach is more SEO-friendly and easier to filter.

### 1. **Best Seafood Restaurants in [Destination]**
**SEO Value:** Very High - "best seafood restaurants [destination]" gets 1,000-10,000 monthly searches
**Filters:**
- `cuisines` contains "Seafood"
- `google_rating >= 4.0`
- `review_count >= 30`
- Sort by: rating DESC, review_count DESC

**Example URL:** `/destinations/aruba/restaurants/guides/best-seafood-restaurants`

---

### 2. **Best Italian Restaurants in [Destination]**
**SEO Value:** Very High - "best Italian restaurants [destination]" gets 1,000-10,000 monthly searches
**Filters:**
- `cuisines` contains "Italian"
- `google_rating >= 4.0`
- `review_count >= 30`
- Sort by: rating DESC, review_count DESC

**Example URL:** `/destinations/aruba/restaurants/guides/best-italian-restaurants`

---

### 3. **Best Asian Restaurants in [Destination]**
**SEO Value:** High - "best Asian restaurants [destination]" gets 500-5,000 monthly searches
**Filters:**
- `cuisines` contains "Asian"
- `google_rating >= 4.0`
- `review_count >= 30`
- Sort by: rating DESC, review_count DESC

**Example URL:** `/destinations/aruba/restaurants/guides/best-asian-restaurants`

---

### 4. **Best American Restaurants in [Destination]**
**SEO Value:** High - "best American restaurants [destination]" gets 500-5,000 monthly searches
**Filters:**
- `cuisines` contains "American"
- `google_rating >= 4.0`
- `review_count >= 30`
- Sort by: rating DESC, review_count DESC

**Example URL:** `/destinations/aruba/restaurants/guides/best-american-restaurants`

---

### 5. **Best Latin & Caribbean Restaurants in [Destination]**
**SEO Value:** High - "best Caribbean restaurants [destination]" gets 500-5,000 monthly searches
**Filters:**
- `cuisines` contains "Caribbean & Latin"
- `google_rating >= 4.0`
- `review_count >= 30`
- Sort by: rating DESC, review_count DESC

**Example URL:** `/destinations/aruba/restaurants/guides/best-latin-caribbean-restaurants`

---

### 6. **Best Mediterranean Restaurants in [Destination]**
**SEO Value:** Medium-High - "best Mediterranean restaurants [destination]" gets 300-3,000 monthly searches
**Filters:**
- `cuisines` contains "Mediterranean"
- `google_rating >= 4.0`
- `review_count >= 30`
- Sort by: rating DESC, review_count DESC

**Example URL:** `/destinations/aruba/restaurants/guides/best-mediterranean-restaurants`

---

### 7. **Best French & European Restaurants in [Destination]**
**SEO Value:** Medium-High - "best French restaurants [destination]" gets 300-3,000 monthly searches
**Filters:**
- `cuisines` contains "European"
- `google_rating >= 4.0`
- `review_count >= 30`
- Sort by: rating DESC, review_count DESC

**Example URL:** `/destinations/aruba/restaurants/guides/best-french-european-restaurants`

---

### 8. **Best Vegetarian & Healthy Restaurants in [Destination]**
**SEO Value:** Medium - "best vegetarian restaurants [destination]" gets 200-2,000 monthly searches
**Filters:**
- `cuisines` contains "Vegetarian & Vegan"
- `google_rating >= 4.0`
- `review_count >= 30`
- Sort by: rating DESC, review_count DESC

**Example URL:** `/destinations/aruba/restaurants/guides/best-vegetarian-healthy-restaurants`

---

### 9. **Best Cafés & Dessert Spots in [Destination]**
**SEO Value:** Medium-High - "best cafes [destination]" gets 500-3,000 monthly searches
**Filters:**
- `cuisines` contains "Cafés & Casual Eats"
- `google_rating >= 4.0`
- `review_count >= 30`
- Sort by: rating DESC, review_count DESC

**Example URL:** `/destinations/aruba/restaurants/guides/best-cafes-dessert-spots`

---

## Database Schema

### Create `restaurant_guides` Table

```sql
CREATE TABLE IF NOT EXISTS restaurant_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id TEXT NOT NULL, -- e.g., "aruba", "marbella"
  category_slug TEXT NOT NULL, -- e.g., "best-seafood-restaurants"
  category_name TEXT NOT NULL, -- e.g., "Best Seafood Restaurants"
  
  -- Basic Information
  title TEXT NOT NULL, -- e.g., "Best Seafood Restaurants in Aruba"
  subtitle TEXT NOT NULL, -- e.g., "Fresh catches, ocean views, and unforgettable dining"
  hero_image TEXT, -- URL to hero image
  
  -- Statistics (auto-calculated from filtered restaurants)
  stats JSONB, -- { restaurantsAvailable: 24, avgRating: 4.5, priceFrom: "$", priceTo: "$$$" }
  
  -- Content
  introduction TEXT NOT NULL, -- SEO-optimized intro paragraph
  seo JSONB, -- { title: "...", description: "...", keywords: "..." }
  why_choose JSONB, -- Array of { icon, title, description }
  what_to_expect JSONB, -- { title: "...", items: [{ icon, title, description }] }
  expert_tips TEXT[], -- Array of tip strings
  faqs JSONB, -- Array of { question, answer }
  
  -- Filter Criteria (stored for dynamic filtering)
  filter_criteria JSONB, -- { cuisines: ["Seafood"], minRating: 4.0, minReviews: 50, ... }
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one guide per destination-category combination
  UNIQUE(destination_id, category_slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_guides_destination_id ON restaurant_guides(destination_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_guides_category_slug ON restaurant_guides(category_slug);
CREATE INDEX IF NOT EXISTS idx_restaurant_guides_destination_category ON restaurant_guides(destination_id, category_slug);

-- RLS Policies (same as category_guides)
ALTER TABLE restaurant_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON restaurant_guides
  FOR SELECT
  USING (true);

CREATE POLICY "Service role only for writes"
  ON restaurant_guides
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Page Structure

### Route: `/destinations/[id]/restaurants/guides/[category]/page.js`

**Server Component Responsibilities:**
1. Fetch guide data from `restaurant_guides` table
2. Fetch restaurants matching `filter_criteria`
3. Generate SEO metadata
4. Pass data to client component

**Client Component:** `RestaurantGuideClient.jsx`
- Display guide content (intro, stats, why choose, what to expect, tips, FAQs)
- Display filtered restaurant cards (reuse `RestaurantCard` component)
- Internal linking to other restaurant guides
- Breadcrumbs
- JSON-LD structured data

---

## Dynamic Restaurant Filtering

### Filter Function: `src/lib/restaurantGuides.js`

```javascript
/**
 * Get restaurants matching guide filter criteria
 */
export async function getRestaurantsForGuide(destinationId, filterCriteria) {
  const supabase = createSupabaseServiceRoleClient();
  
  let query = supabase
    .from('restaurants')
    .select('*')
    .eq('destination_id', destinationId)
    .eq('is_active', true);
  
  // Apply filters from filterCriteria
  if (filterCriteria.cuisines && filterCriteria.cuisines.length > 0) {
    query = query.contains('cuisines', filterCriteria.cuisines);
  }
  
  if (filterCriteria.minRating) {
    query = query.gte('google_rating', filterCriteria.minRating);
  }
  
  if (filterCriteria.minReviews) {
    query = query.gte('review_count', filterCriteria.minReviews);
  }
  
  if (filterCriteria.priceLevelMin !== undefined) {
    query = query.gte('price_level', filterCriteria.priceLevelMin);
  }
  
  if (filterCriteria.priceLevelMax !== undefined) {
    query = query.lte('price_level', filterCriteria.priceLevelMax);
  }
  
  if (filterCriteria.goodForChildren !== undefined) {
    query = query.eq('good_for_children', filterCriteria.goodForChildren);
  }
  
  if (filterCriteria.liveMusic !== undefined) {
    query = query.eq('live_music', filterCriteria.liveMusic);
  }
  
  if (filterCriteria.outdoorSeating !== undefined) {
    query = query.eq('outdoor_seating', filterCriteria.outdoorSeating);
  }
  
  if (filterCriteria.reservable !== undefined) {
    query = query.eq('reservable', filterCriteria.reservable);
  }
  
  if (filterCriteria.servesWine !== undefined) {
    query = query.eq('serves_wine', filterCriteria.servesWine);
  }
  
  if (filterCriteria.servesCocktails !== undefined) {
    query = query.eq('serves_cocktails', filterCriteria.servesCocktails);
  }
  
  // Sorting
  const sortBy = filterCriteria.sortBy || 'rating';
  const sortOrder = filterCriteria.sortOrder || 'desc';
  
  if (sortBy === 'rating') {
    query = query.order('google_rating', { ascending: sortOrder === 'asc' });
  } else if (sortBy === 'reviews') {
    query = query.order('review_count', { ascending: sortOrder === 'asc' });
  } else if (sortBy === 'price') {
    query = query.order('price_level', { ascending: sortOrder === 'asc' });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching restaurants for guide:', error);
    return [];
  }
  
  return data || [];
}
```

---

## SEO Optimization

### 1. **Title Tags**
- Pattern: `[Category] in [Destination] | TopTours.ai`
- Example: `Best Seafood Restaurants in Aruba | TopTours.ai`

### 2. **Meta Descriptions**
- Include: destination name, category, restaurant count, top rating
- Example: `Discover 24 top-rated seafood restaurants in Aruba, from beachfront grills to upscale dining. Find the perfect catch with 4.5+ star ratings and 100+ reviews.`

### 3. **H1 Tags**
- Match title exactly: `Best Seafood Restaurants in Aruba`

### 4. **Structured Data (JSON-LD)**
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Best Seafood Restaurants in Aruba",
  "description": "...",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Restaurant",
          "name": "Restaurant Name",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.5",
            "reviewCount": "2256"
          }
        }
      }
    ]
  }
}
```

### 5. **Internal Linking**
- Link to other restaurant guides in the same destination
- Link to main restaurant listing page
- Link to destination page
- Link to related tour guides

### 6. **Breadcrumbs**
```
Home > Destinations > Aruba > Restaurants > Guides > Best Seafood Restaurants
```

---

## Content Generation Strategy

### Option 1: AI-Generated (Recommended for Scale)
- Use Gemini Flash 1.5 to generate guide content
- One-time generation per guide (stored in database)
- Template-based prompts for consistency

### Option 2: Manual (Higher Quality, Slower)
- Write 6 guides per destination manually
- Higher quality, more unique content
- Better for top destinations first

### Hybrid Approach (Recommended)
1. **Top 50 destinations:** Manual content (300 guides)
2. **Remaining 197 destinations:** AI-generated (1,182 guides)
3. **Iterative improvement:** Update AI guides based on performance

---

## Implementation Phases

### Phase 1: Infrastructure (Week 1-2)
- [ ] Create `restaurant_guides` table
- [ ] Create `src/lib/restaurantGuides.js` utility
- [ ] Create page route structure
- [ ] Create `RestaurantGuideClient.jsx` component

### Phase 2: Content Generation (Week 3-6)
- [ ] Build AI content generation script
- [ ] Generate guides for top 50 destinations (450 guides)
- [ ] Generate guides for remaining 197 destinations (1,773 guides)
- [ ] Quality check and manual edits for top destinations

### Phase 3: SEO & Linking (Week 7-8)
- [ ] Add JSON-LD structured data
- [ ] Add internal linking between guides
- [ ] Add breadcrumbs
- [ ] Update sitemap
- [ ] Add to robots.txt

### Phase 4: Testing & Launch (Week 9-10)
- [ ] Test filtering logic
- [ ] Test SEO metadata
- [ ] Test page load performance
- [ ] Monitor Google Search Console
- [ ] Iterate based on performance

---

## Expected SEO Impact

### Search Volume Estimates (Monthly)
- "best seafood restaurants [destination]": 1,000-10,000 searches
- "family restaurants [destination]": 2,000-20,000 searches
- "romantic restaurants [destination]": 1,000-10,000 searches
- "cheap restaurants [destination]": 2,000-20,000 searches
- "restaurants live music [destination]": 500-5,000 searches
- "beachfront restaurants [destination]": 1,000-15,000 searches

### Total Potential Monthly Searches
- Per destination: ~5,000-50,000 searches (9 cuisine guides)
- Across 247 destinations: ~1.24M-12.4M monthly searches

### Conservative CTR Estimates
- Position 1-3: 30-40% CTR
- Position 4-10: 10-15% CTR
- Position 11-20: 5-8% CTR

### Revenue Impact
- Each guide page can drive 50-500 monthly visitors
- Restaurant premium subscription: $4.99/month
- Conversion rate: 2-5%
- **Potential: $1,100-5,500/month per cuisine category (across all destinations)**

---

## Next Steps

1. **Review and approve this plan**
2. **Create database schema** (`scripts/supabase-create-restaurant-guides-table.sql`)
3. **Build filtering utility** (`src/lib/restaurantGuides.js`)
4. **Create page structure** (`app/destinations/[id]/restaurants/guides/[category]/`)
5. **Build content generation script** (`scripts/generate-restaurant-guides.js`)
6. **Extract cuisine types** (`scripts/extract-restaurant-cuisines.js`) - **CRITICAL FIRST STEP**
7. **Start with top 10 destinations** (90 guides) for testing
8. **Scale to all 247 destinations** (2,223 guides)

---

## Questions to Consider

1. **Content Quality:** AI-generated vs. manual? (Recommend hybrid)
2. **Image Strategy:** Use destination images or restaurant-specific?
3. **Update Frequency:** How often to refresh restaurant lists?
4. **Premium Integration:** Should premium restaurants appear first?
5. **User-Generated Content:** Allow user reviews/comments on guides?

