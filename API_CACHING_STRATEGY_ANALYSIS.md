# API Caching Strategy Analysis & Recommendations

## 🔍 Current Situation

### Current Setup (182 Destinations with Guides):
- **Hardcoded Tours**: 4 tours per category stored in `popularTours` data file
- **API Calls**: 5 calls per destination (one per category)
- **Total**: 182 destinations × 5 categories = ~910 potential API calls
- **Problem**: Tours can be deleted on Viator, hardcoded data becomes stale

### Future Challenge (3,200 Destinations):
- **Can't hardcode**: 3,200 × 5 categories = 16,000+ tours
- **Not scalable**: Manual maintenance impossible
- **Risk**: Broken links, stale data, poor UX

---

## 💡 Your Suggestions Analysis

### Option 1: 30-Day Caching on First Load
**How it would work:**
- On first visit to destination page → Make API call
- Cache results in Supabase for 30 days
- Subsequent visits use cached data
- After 30 days, refresh cache

**Pros:**
- ✅ Fresh data (updates monthly)
- ✅ Scalable (automatic caching)
- ✅ Handles deleted tours (refreshes after 30 days)
- ✅ Reduces API calls significantly

**Cons:**
- ⚠️ First visitor triggers API call (slight delay)
- ⚠️ Still requires API calls (but much fewer)

**API Call Pattern:**
- User visits destination page
- Check cache: if expired (>7 days) → 1 API call to refresh
- If cache is fresh → 0 calls (use cache)
- If destination never visited → 0 calls (saves money!)

**Realistic Estimates:**
- **All 3,382 destinations** (182 with guides + 3,200 without)
- **If 20% are popular** (viewed weekly): ~676 destinations × 4 = **~2,704 calls/month**
- **Cost**: ~$0.004/month (less than 1 cent!)

### Option 2: Single API Call Per Destination
**How it would work:**
- One API call to get ALL tours for destination
- Group by category client-side
- Show top tours per category
- Cache for 30 days

**Pros:**
- ✅ Only 1 API call instead of 5
- ✅ Fresh data
- ✅ Scalable
- ✅ More efficient

**Cons:**
- ⚠️ Need to restructure how tours are displayed
- ⚠️ Larger API response (but still manageable)

**API Call Pattern:**
- Per destination: 1 call (instead of 5)
- Cached for 30 days
- **Estimated**: ~107 calls/month (same as Option 1, but 5x fewer calls per destination)

---

## 🎯 Recommended Solution: Hybrid Approach

### Strategy: Single API Call + 30-Day Cache + Smart Display

**How it works:**

1. **Destination Page Load:**
   ```
   Check Supabase cache for destination tours
   ├─ If cached (< 30 days old) → Use cached data
   └─ If not cached or expired → Make 1 API call → Cache results
   ```

2. **Display Logic:**
   ```
   Get all tours from cache/API
   ├─ Group by category (client-side)
   ├─ Show top 3-4 tours per category
   ├─ If category has guide → Show "Read Guide" button
   └─ "View All Tours" → Links to /tours page (live API)
   ```

3. **Tours Page (/tours):**
   - Always uses live API calls (already implemented)
   - Fresh data for detailed browsing
   - Filters, search, etc.

---

## 📊 Comparison Table

| Approach | API Calls/Dest | Scalability | Fresh Data | Maintenance | Cost |
|----------|---------------|-------------|------------|-------------|------|
| **Current (Hardcoded)** | 0 (after setup) | ❌ No | ❌ No | ❌ High | $0 |
| **30-Day Cache** | 1 per 30 days | ✅ Yes | ✅ Yes | ✅ Auto | Low |
| **Single Call + Cache** | 1 per 30 days | ✅ Yes | ✅ Yes | ✅ Auto | Low |
| **Live API Always** | Every page load | ✅ Yes | ✅ Yes | ✅ Auto | High |

---

## 🚀 Implementation Plan

### Phase 1: Create Destination Tours Cache Function

```javascript
// lib/destinationToursCache.js

const DESTINATION_TOURS_CACHE_TTL_DAYS = 30;

export async function getCachedDestinationTours(destinationId) {
  const supabase = createSupabaseServiceRoleClient();
  
  // Check cache
  const { data } = await supabase
    .from('viator_cache')
    .select('*')
    .eq('cache_key', `destination_tours_${destinationId}`)
    .eq('cache_type', 'destination_tours')
    .single();
  
  if (!data) return null;
  
  // Check if expired
  const cachedAt = new Date(data.cached_at);
  const daysSinceCache = (new Date() - cachedAt) / (1000 * 60 * 60 * 24);
  
  if (daysSinceCache > DESTINATION_TOURS_CACHE_TTL_DAYS) {
    // Expired, delete cache
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

### Phase 2: Update Destination Page

```javascript
// app/destinations/[id]/page.js

export default async function DestinationDetailPage({ params }) {
  const { id } = await params;
  const destination = getDestinationById(id);
  
  // Get cached tours or fetch fresh
  let destinationTours = await getCachedDestinationTours(id);
  
  if (!destinationTours) {
    // Make single API call to get all tours
    destinationTours = await fetchAllToursForDestination(id);
    
    // Cache for 30 days
    await cacheDestinationTours(id, destinationTours);
  }
  
  // Group tours by category (client-side)
  const toursByCategory = groupToursByCategory(destinationTours);
  
  return (
    <DestinationDetailClient 
      destination={destination}
      toursByCategory={toursByCategory}
      // ... other props
    />
  );
}
```

### Phase 3: Update Display Component

```javascript
// app/destinations/[id]/DestinationDetailClient.jsx

// Show top 3-4 tours per category
{toursByCategory.map(category => (
  <div key={category.name}>
    <h3>{category.name}</h3>
    {category.tours.slice(0, 4).map(tour => (
      <TourCard tour={tour} />
    ))}
    {category.hasGuide && (
      <Link href={`/destinations/${id}/guides/${category.slug}`}>
        Read Guide →
      </Link>
    )}
    <Link href={`/destinations/${id}/tours?category=${category.slug}`}>
      View All {category.name} Tours →
    </Link>
  </div>
))}
```

---

## 💰 Cost Analysis

### Current Approach (Hardcoded):
- **Setup Cost**: Time to hardcode 16,000+ tours
- **Maintenance Cost**: High (manual updates)
- **API Cost**: $0 (but stale data risk)
- **Total**: High maintenance, poor UX

### Recommended Approach (7-Day Cache):
- **Setup Cost**: Development time (~2-3 hours)
- **Maintenance Cost**: $0 (automatic)
- **API Cost**: 
  - **Cache-as-you-go**: Only refreshes when destination is visited AND cache expired
  - **Realistic**: ~2,704 calls/month (if 20% of destinations are popular)
  - **Cost**: ~$0.004/month (less than 1 cent!)
  - **Best case**: Only popular destinations refresh (saves money!)
- **Total**: Ultra low cost, fresh data, scalable, smart caching

---

## ✅ Benefits of Recommended Approach

1. **Scalable**: Works for 3,200+ destinations automatically
2. **Fresh Data**: Updates every 30 days automatically
3. **Efficient**: 1 API call instead of 5 per destination
4. **Handles Deletions**: Expired tours removed after 30 days
5. **Fast Loading**: Cached data = instant page load
6. **Low Cost**: Minimal API calls, mostly cached
7. **No Maintenance**: Fully automatic

---

## 🎨 Display Strategy

### For Destinations WITH Guides (182):
- Show top 3-4 tours per category
- "Read Guide" button if category has guide
- "View All Tours" button
- Uses cached data (refreshes every 30 days)

### For Destinations WITHOUT Guides (3,200):
- Show top 3-4 tours per category
- "View All Tours" button
- Uses cached data (refreshes every 30 days)

### Tours Page (/tours):
- Always uses live API (already implemented)
- Fresh data for detailed browsing
- Filters, search, pagination

---

## 🔄 Migration Strategy

### Step 1: Keep Hardcoded Tours (Temporary)
- Don't remove hardcoded tours yet
- Use as fallback if cache fails

### Step 2: Implement Caching
- Add cache functions
- Update destination page to use cache
- Keep hardcoded as fallback

### Step 3: Monitor & Validate
- Monitor cache hit rates
- Validate tour data freshness
- Check for any issues

### Step 4: Remove Hardcoded (Optional)
- Once confident in caching, remove hardcoded tours
- Or keep as emergency fallback

---

## 📈 Expected Results

### API Call Reduction:
- **Before**: 5 calls per destination = 16,000 calls for 3,200 destinations
- **After**: 1 call per destination per 7 days (only when visited) = ~2,704 calls/month (realistic)
- **Reduction**: ~83% fewer API calls (and much fresher data!)
- **Note**: Applies to ALL 3,382 destinations (182 with guides + 3,200 without)

### Performance:
- **Page Load**: Instant (cached data)
- **Freshness**: Updates every 30 days
- **User Experience**: Fast, reliable, up-to-date

### Maintenance:
- **Before**: Manual updates for 16,000+ tours
- **After**: Fully automatic, zero maintenance

---

## 🎯 Final Recommendation

**Implement: Single API Call + 30-Day Cache**

**Why:**
1. ✅ Solves scalability problem
2. ✅ Handles deleted tours automatically
3. ✅ Reduces API calls by 99%+
4. ✅ Fast page loads (cached)
5. ✅ Fresh data (30-day refresh)
6. ✅ Zero maintenance
7. ✅ Low cost

**Next Steps:**
1. Create cache functions (30 min)
2. Update destination page (1 hour)
3. Update display component (1 hour)
4. Test & deploy (30 min)
5. Monitor for 1 week
6. Remove hardcoded tours (optional)

**Total Implementation Time: ~3 hours**

---

## ❓ Questions to Consider

1. **Cache Duration**: 30 days good, or prefer 14/60 days?
2. **Fallback Strategy**: Keep hardcoded tours as fallback?
3. **Cache Warming**: Pre-populate cache for popular destinations?
4. **Monitoring**: Add alerts for cache misses/errors?

Let me know your preferences and I'll implement accordingly!

