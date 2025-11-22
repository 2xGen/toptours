# Single API Call Implementation Guide
## How to Get All Tours & Group by Category

---

## 🎯 The Solution: One API Call Gets ALL Tours

### How Viator API Works:

The Viator API has a search endpoint that returns **all tours for a destination** in one call:

```javascript
POST https://api.viator.com/partner/search/freetext
{
  "searchTerm": "Rotterdam",  // Just the destination name
  "searchTypes": [{
    "searchType": "PRODUCTS",
    "pagination": {
      "start": 1,
      "count": 100  // Get up to 100 tours (or more if needed)
    }
  }]
}
```

**Response:** Returns ALL tours for Rotterdam (could be 50, 100, 200+ tours)

---

## 📋 Implementation Steps

### Step 1: Fetch All Tours (One API Call)

```javascript
// lib/destinationToursCache.js

const DESTINATION_TOURS_CACHE_TTL_DAYS = 7; // 7-day cache as requested

export async function fetchAllToursForDestination(destinationName, destinationId = null) {
  try {
    // Make ONE API call to get all tours
    const response = await fetch('/api/internal/viator-products-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchTerm: destinationName,
        viatorDestinationId: destinationId, // Optional: if you have Viator ID
        start: 1,
        count: 100, // Get up to 100 tours (adjust if needed)
      }),
    });

    const data = await response.json();
    return data.products?.results || [];
  } catch (error) {
    console.error('Error fetching tours:', error);
    return [];
  }
}
```

### Step 2: Cache the Results (7 Days)

```javascript
export async function getCachedDestinationTours(destinationId) {
  const supabase = createSupabaseServiceRoleClient();
  
  const { data } = await supabase
    .from('viator_cache')
    .select('*')
    .eq('cache_key', `destination_tours_${destinationId}`)
    .eq('cache_type', 'destination_tours')
    .single();
  
  if (!data) return null;
  
  // Check if expired (7 days)
  const cachedAt = new Date(data.cached_at);
  const daysSinceCache = (new Date() - cachedAt) / (1000 * 60 * 60 * 24);
  
  if (daysSinceCache > DESTINATION_TOURS_CACHE_TTL_DAYS) {
    await supabase
      .from('viator_cache')
      .delete()
      .eq('cache_key', `destination_tours_${destinationId}`);
    return null;
  }
  
  return JSON.parse(data.cache_data);
}

export async function cacheDestinationTours(destinationId, toursData) {
  const supabase = createSupabaseServiceRoleClient();
  
  await supabase
    .from('viator_cache')
    .upsert({
      cache_key: `destination_tours_${destinationId}`,
      cache_type: 'destination_tours',
      cache_data: JSON.stringify(toursData),
      cached_at: new Date().toISOString(),
    });
}
```

### Step 3: Group Tours by Category (Client-Side)

```javascript
// lib/tourCategorization.js

// Category keywords mapping
const CATEGORY_KEYWORDS = {
  'Sunset Cruises': ['sunset', 'cruise', 'boat', 'sailing', 'catamaran'],
  'ATV Tours': ['atv', 'quad', 'off-road', '4x4', 'jeep'],
  'Snorkeling Tours': ['snorkel', 'diving', 'underwater', 'reef'],
  'Cultural Tours': ['cultural', 'heritage', 'history', 'museum', 'local'],
  'Food Tours': ['food', 'culinary', 'tasting', 'restaurant', 'wine', 'dining'],
  'Walking Tours': ['walking', 'walk', 'stroll', 'pedestrian'],
  'Architecture Tours': ['architecture', 'building', 'design', 'modern'],
  'Harbor Cruises': ['harbor', 'harbour', 'port', 'maritime'],
  // Add more categories as needed
};

export function categorizeTour(tour, destinationCategories) {
  const title = (tour.title || '').toLowerCase();
  const description = (tour.description || '').toLowerCase();
  const text = `${title} ${description}`;
  
  // Score each category based on keyword matches
  const scores = {};
  
  destinationCategories.forEach(category => {
    const categoryName = typeof category === 'string' ? category : category.name;
    const keywords = CATEGORY_KEYWORDS[categoryName] || [];
    
    let score = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    if (score > 0) {
      scores[categoryName] = score;
    }
  });
  
  // Return category with highest score, or 'Other' if no match
  if (Object.keys(scores).length === 0) {
    return 'Other';
  }
  
  return Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  );
}

export function groupToursByCategory(tours, destinationCategories) {
  const grouped = {};
  
  // Initialize categories
  destinationCategories.forEach(category => {
    const categoryName = typeof category === 'string' ? category : category.name;
    grouped[categoryName] = [];
  });
  grouped['Other'] = [];
  
  // Categorize each tour
  tours.forEach(tour => {
    const category = categorizeTour(tour, destinationCategories);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(tour);
  });
  
  // Sort tours within each category by rating/reviews
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => {
      const ratingA = a.reviews?.combinedAverageRating || 0;
      const ratingB = b.reviews?.combinedAverageRating || 0;
      const reviewsA = a.reviews?.totalReviews || 0;
      const reviewsB = b.reviews?.totalReviews || 0;
      
      // Sort by rating first, then by number of reviews
      if (ratingA !== ratingB) {
        return ratingB - ratingA;
      }
      return reviewsB - reviewsA;
    });
  });
  
  return grouped;
}
```

### Step 4: Use in Destination Page

```javascript
// app/destinations/[id]/page.js

export default async function DestinationDetailPage({ params }) {
  const { id } = await params;
  const destination = getDestinationById(id);
  
  let toursByCategory = {};
  
  // Check cache first
  let allTours = await getCachedDestinationTours(id);
  
  if (!allTours || allTours.length === 0) {
    // Cache miss or expired - fetch fresh
    const destinationName = destination.fullName || destination.name;
    allTours = await fetchAllToursForDestination(destinationName, destination.viatorId);
    
    // Cache for 7 days
    if (allTours.length > 0) {
      await cacheDestinationTours(id, allTours);
    }
  }
  
  // Group tours by category (client-side, no API call)
  if (allTours.length > 0) {
    toursByCategory = groupToursByCategory(
      allTours, 
      destination.tourCategories || []
    );
  }
  
  return (
    <DestinationDetailClient 
      destination={destination}
      toursByCategory={toursByCategory}
      // ... other props
    />
  );
}
```

### Step 5: Display Top 3-4 Tours Per Category

```javascript
// app/destinations/[id]/DestinationDetailClient.jsx

export default function DestinationDetailClient({ 
  destination, 
  toursByCategory 
}) {
  return (
    <>
      {/* For each category, show top 3-4 tours */}
      {destination.tourCategories.map(category => {
        const categoryName = typeof category === 'string' ? category : category.name;
        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
        const tours = toursByCategory[categoryName] || [];
        const topTours = tours.slice(0, 4); // Top 4 tours
        
        if (topTours.length === 0) return null;
        
        return (
          <section key={categoryName} className="py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{categoryName}</h2>
                {category.hasGuide && (
                  <Link href={`/destinations/${destination.id}/guides/${categorySlug}`}>
                    <Button variant="outline">
                      Read Guide
                    </Button>
                  </Link>
                )}
              </div>
              
              {/* Show top 3-4 tours */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topTours.map(tour => (
                  <TourCard key={tour.productId} tour={tour} />
                ))}
              </div>
              
              {/* View All button */}
              <div className="mt-6 text-center">
                <Link href={`/destinations/${destination.id}/tours?category=${categorySlug}`}>
                  <Button>
                    View All {categoryName} Tours →
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
```

---

## 📊 How It Works: Visual Flow

```
User visits /destinations/rotterdam
         ↓
Check Supabase cache
         ↓
    ┌────┴────┐
    │ Cached? │
    └────┬────┘
         │
    ┌────┴────┐
    │  YES    │  NO
    └────┬────┘  └──→ Make 1 API call
         │            ↓
         │        Get ALL tours (50-200 tours)
         │            ↓
         │        Cache in Supabase (7 days)
         │            ↓
         └────────────┘
              ↓
    Group tours by category (client-side)
         ↓
    Show top 3-4 per category
         ↓
    "View All" → Links to /tours (live API)
```

---

## 💰 Cost Analysis (7-Day Cache)

### Important: Cache-As-You-Go Strategy

**Key Point:** Cache only refreshes when someone visits the page AND cache is expired.

- ✅ **If destination is viewed**: Check cache → if expired → refresh
- ✅ **If destination is NOT viewed**: No API call (saves money!)
- ✅ **Popular destinations**: Refresh more often (weekly)
- ✅ **Unpopular destinations**: May not refresh for months (saves API calls)

### API Call Pattern:
```
User visits /destinations/rotterdam
    ↓
Check cache (7 days old?)
    ↓
┌───┴───┐
│ Fresh │ → Use cache (0 API calls)
│ Expired│ → Refresh (1 API call)
└───────┘
```

### Monthly Estimates (Realistic):

**Scenario 1: All destinations viewed once per week**
- **3,382 destinations** (182 with guides + 3,200 without) × **4 refreshes/month** = **~13,528 calls/month**
- **Cost**: 13,528 × $0.0016 = **~$0.022/month**

**Scenario 2: Realistic traffic (20% of destinations viewed weekly)**
- **3,382 destinations** × **20% popular** = **676 destinations**
- **676 destinations** × **4 refreshes/month** = **~2,704 calls/month**
- **Cost**: 2,704 × $0.0016 = **~$0.004/month** (less than 1 cent!)

**Scenario 3: Very low traffic (only top 100 destinations)**
- **100 popular destinations** × **4 refreshes/month** = **400 calls/month**
- **Cost**: 400 × $0.0016 = **~$0.0006/month** (practically nothing!)

### Comparison:
- **Current (5 calls per category, hardcoded)**: 
  - Setup: 16,000+ tours to hardcode
  - Ongoing: $0 but stale data risk
- **New (1 call per destination, 7-day cache)**: 
  - Setup: Automatic
  - Ongoing: $0.004-$0.022/month depending on traffic
  - **Fresh data, handles deletions automatically**

### Real-World Example:
- **Rotterdam** (popular): Viewed 50 times/week → Refreshes once per week = **4 calls/month**
- **Small town** (unpopular): Viewed once/month → Refreshes once/month = **1 call/month**
- **Unvisited destination**: Never viewed → **0 calls** (saves money!)

---

## ✅ Benefits

1. **One API Call**: Get all tours at once (not 5 per destination)
2. **7-Day Freshness**: Data updates weekly when visited
3. **Client-Side Categorization**: No extra API calls
4. **Scalable**: Works for ALL 3,382 destinations (182 with guides + 3,200 without)
5. **Fast Loading**: Cached data = instant page load
6. **Ultra Low Cost**: $0.004-$0.022/month (depends on traffic)
7. **Handles Deletions**: Expired tours removed after 7 days
8. **Smart Caching**: Only refreshes when destination is visited (saves money!)
9. **Applies to All Destinations**: Both with guides and without guides

---

## 🎯 Key Points

### Q: How do we get all tours in one call?
**A:** Viator API search endpoint returns ALL tours for a destination when you search by destination name (no category filter).

### Q: How do we group by category?
**A:** Client-side categorization using keyword matching on tour titles/descriptions.

### Q: What if a tour doesn't match any category?
**A:** It goes to "Other" category, or you can improve keyword matching.

### Q: What about tour quality/ranking?
**A:** Sort by rating and review count within each category before showing top 3-4.

### Q: What if we need more than 100 tours?
**A:** Make multiple paginated calls (start: 1, count: 100, then start: 101, count: 100, etc.) and combine results.

---

## 🚀 Ready to Implement?

This approach:
- ✅ Uses 1 API call per destination (not 5)
- ✅ Caches for 7 days (refreshes only when visited)
- ✅ Groups by category client-side
- ✅ Shows top 3-4 tours per category
- ✅ Costs $0.004-$0.022/month (depends on traffic)
- ✅ Applies to ALL destinations (182 with guides + 3,200 without)
- ✅ Smart: Only refreshes when someone visits (saves money!)
- ✅ Fully scalable

**Key Insight:** 
- Popular destinations refresh weekly (fresher data)
- Unpopular destinations may not refresh for months (saves API calls)
- This is actually BETTER than fixed refresh schedule!

Want me to implement this now?

