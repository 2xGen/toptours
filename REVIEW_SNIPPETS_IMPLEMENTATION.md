# Review Snippets Implementation - Viator Compliant

## 📋 **API Response Structure Analysis**

### **Review Object Fields:**
```javascript
{
  reviewReference: "REV-...", // Unique ID
  userName: "mommamizzy",     // Display name
  publishedDate: "2025-12-16T12:51:40Z", // ISO date
  title: "Do it Just do it",  // Review title
  text: "Full review text...", // Full review (we show snippet)
  rating: 5,                  // 1-5 stars
  provider: "TRIPADVISOR" | "VIATOR", // MUST display provider
  language: "en",
  machineTranslated: false,
  helpfulVotes: 0,
  photosInfo: [...], // Optional photos
  ownerResponse: {...} // Optional owner response
}
```

### **Summary Data:**
```javascript
{
  totalReviewsSummary: {
    totalReviews: 135,
    sources: [
      { provider: "VIATOR", totalCount: 5 },
      { provider: "TRIPADVISOR", totalCount: 130 }
    ]
  }
}
```

---

## ✅ **Viator Compliance Requirements**

### **1. Non-Indexing (CRITICAL)**
- ✅ Reviews **MUST NOT be indexed** by search engines
- ✅ Use `<meta name="robots" content="noindex, nofollow">` on review section
- ✅ Add `data-noindex="true"` attribute to review container
- ✅ Verify in Google Search Console that reviews are not indexed

### **2. Provider Display (REQUIRED)**
- ✅ **MUST indicate provider** (Viator/Tripadvisor) even if only showing rating
- ✅ Show provider badge/indicator on each review snippet
- ✅ Can show: "Viator Review" or "Tripadvisor Review" badge

### **3. Caching (REQUIRED)**
- ✅ Cache reviews weekly (or monthly)
- ✅ **DO NOT** fetch in real-time (too much data)
- ✅ Refresh when product review count changes
- ✅ Delete reviews that no longer exist in API response

### **4. Content Display**
- ✅ Show snippets (80-120 characters)
- ✅ Include: userName, date, title, rating, snippet
- ✅ "Read Full Review" CTA → Links to Viator booking URL
- ✅ Subtle disclaimer: "Reviews are from Viator. If you click on read full review you will be directed to Viator's tour page"

---

## 🎨 **UI/UX Design**

### **Review Snippet Card Structure:**
```
┌─────────────────────────────────────┐
│ [Viator] [★★★★★]                    │  ← Provider badge + Stars
│                                      │
│ "Do it Just do it"                  │  ← Review Title
│                                      │
│ "Duuuuuuude yassssss. Seriously...  │  ← Snippet (80-120 chars)
│  tho YASSSS best experince of my    │
│  entire 7 day cruise..."            │
│                                      │
│ mommamizzy • December 2025          │  ← User name + Date
│                                      │
│ [Read Full Review →]                │  ← CTA Button (links to Viator)
└─────────────────────────────────────┘
```

### **Section Layout:**
```
Guest Ratings (Rating Breakdown)
↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Guest Reviews Preview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Review Card 1] [Review Card 2] [Review Card 3]
[Review Card 4] [Review Card 5]

*Reviews are from Viator. If you click on read full review 
you will be directed to Viator's tour page*

[View All Reviews & Availability on Viator] ← Main CTA
↓
FAQs
```

---

## 🏗️ **Implementation Structure**

### **1. Database Table (Caching)**
```sql
CREATE TABLE tour_reviews_cache (
  product_id TEXT PRIMARY KEY,
  reviews_data JSONB NOT NULL,
  total_reviews_count INTEGER,
  viator_count INTEGER,
  tripadvisor_count INTEGER,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- Weekly: NOW() + 7 days
  review_count_hash TEXT, -- Hash of review count for change detection
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tour_reviews_expires ON tour_reviews_cache(expires_at);
CREATE INDEX idx_tour_reviews_product ON tour_reviews_cache(product_id);
```

### **2. API Integration**
```javascript
// lib/viatorReviews.js

export async function fetchProductReviews(productId) {
  const apiKey = process.env.VIATOR_API_KEY;
  
  const response = await fetch('https://api.viator.com/partner/reviews/product', {
    method: 'POST',
    headers: {
      'exp-api-key': apiKey,
      'Accept': 'application/json;version=2.0',
      'Accept-Language': 'en-US',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productCode: productId,
      count: 5, // Get 5 reviews for snippets
      start: 1, // 1-based pagination
      provider: 'ALL',
      sortBy: 'MOST_RECENT_PER_LOCALE',
      reviewsForNonPrimaryLocale: true,
      showMachineTranslated: true,
      ratings: [4, 5] // Only 4-5 star reviews for snippets
    })
  });
  
  return await response.json();
}
```

### **3. Caching Logic**
```javascript
export async function getCachedReviews(productId, currentReviewCount = null) {
  // Check cache
  const cached = await supabase
    .from('tour_reviews_cache')
    .select('*')
    .eq('product_id', productId)
    .single();
  
  // If cache exists and not expired
  if (cached && cached.expires_at > new Date()) {
    // Check if review count changed (trigger refresh)
    if (currentReviewCount && cached.review_count_hash !== hashReviewCount(currentReviewCount)) {
      // Review count changed - refresh cache
      return await refreshReviewsCache(productId);
    }
    return cached.reviews_data;
  }
  
  // Cache expired or doesn't exist - fetch from API
  return await refreshReviewsCache(productId, currentReviewCount);
}

async function refreshReviewsCache(productId, reviewCount = null) {
  const reviewsData = await fetchProductReviews(productId);
  
  // Process and cache
  const cacheData = {
    product_id: productId,
    reviews_data: reviewsData,
    total_reviews_count: reviewsData.totalReviewsSummary?.totalReviews || 0,
    viator_count: reviewsData.totalReviewsSummary?.sources?.find(s => s.provider === 'VIATOR')?.totalCount || 0,
    tripadvisor_count: reviewsData.totalReviewsSummary?.sources?.find(s => s.provider === 'TRIPADVISOR')?.totalCount || 0,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    review_count_hash: reviewCount ? hashReviewCount(reviewCount) : null
  };
  
  // Upsert cache
  await supabase
    .from('tour_reviews_cache')
    .upsert(cacheData);
  
  return reviewsData;
}
```

### **4. Review Validation (Compliance)**
```javascript
// Validate: Delete reviews that no longer exist in API response
async function validateReviews(productId, newReviewsData) {
  const newReviewIds = new Set(
    newReviewsData.reviews.map(r => r.reviewReference)
  );
  
  // Get cached reviews
  const cached = await getCachedReviews(productId);
  if (!cached) return;
  
  // Find reviews that no longer exist
  const cachedReviews = cached.reviews || [];
  const reviewsToDelete = cachedReviews.filter(
    r => !newReviewIds.has(r.reviewReference)
  );
  
  // Delete from cache if they no longer exist in API
  if (reviewsToDelete.length > 0) {
    // Update cache to remove deleted reviews
    await refreshReviewsCache(productId);
  }
}
```

---

## 🎯 **Display Component**

### **Review Snippet Format:**
```jsx
<section 
  className="review-snippets" 
  data-noindex="true"
  data-robots="noindex, nofollow"
>
  {/* Meta tag for non-indexing */}
  <meta name="robots" content="noindex, nofollow" />
  
  <h2>Guest Reviews</h2>
  
  <div className="review-snippets-grid">
    {reviewSnippets.slice(0, 5).map(review => (
      <div key={review.reviewReference} className="review-card">
        {/* Provider Badge */}
        <div className="provider-badge">
          {review.provider === 'VIATOR' ? 'Viator' : 'Tripadvisor'} Review
        </div>
        
        {/* Stars */}
        <div className="stars">
          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
        </div>
        
        {/* Title */}
        <h3 className="review-title">{review.title}</h3>
        
        {/* Snippet (80-120 chars) */}
        <p className="review-snippet">
          "{getSnippet(review.text, 100)}..."
        </p>
        
        {/* User & Date */}
        <div className="review-meta">
          <span className="user-name">{review.userName}</span>
          <span className="date">{formatDate(review.publishedDate)}</span>
        </div>
        
        {/* CTA */}
        <a 
          href={getViatorBookingUrl(productId, review.reviewReference)}
          target="_blank"
          rel="noopener noreferrer"
          className="read-full-review-btn"
        >
          Read Full Review →
        </a>
      </div>
    ))}
  </div>
  
  {/* Compliance Disclaimer */}
  <p className="review-disclaimer">
    Reviews are from Viator. If you click on read full review 
    you will be directed to Viator's tour page.
  </p>
  
  {/* Main CTA */}
  <a 
    href={viatorBookingUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="view-all-reviews-btn"
  >
    View All Reviews & Availability on Viator
  </a>
</section>
```

### **Snippet Extraction (80-120 chars):**
```javascript
function getSnippet(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  
  // Try to cut at sentence boundary
  const snippet = text.substring(0, maxLength);
  const lastPeriod = snippet.lastIndexOf('.');
  const lastSpace = snippet.lastIndexOf(' ');
  
  // Prefer cutting at period, then space
  if (lastPeriod > maxLength * 0.7) {
    return text.substring(0, lastPeriod + 1);
  } else if (lastSpace > maxLength * 0.7) {
    return text.substring(0, lastSpace);
  }
  
  return snippet;
}
```

---

## 🔒 **Non-Indexing Implementation (Multiple Layers)**

### **Layer 1: Meta Tag (Recommended)**
```jsx
// In server component or page head
{reviewSnippets.length > 0 && (
  <meta 
    name="robots" 
    content="noindex, nofollow" 
    data-review-section="true"
  />
)}
```

### **Layer 2: Data Attributes**
```jsx
<section 
  data-noindex="true"
  data-robots="noindex, nofollow"
  data-viator-content="review-snippets"
>
```

### **Layer 3: X-Robots-Tag Header (For API responses)**
```javascript
// In API route
headers: {
  'X-Robots-Tag': 'noindex, nofollow'
}
```

### **Layer 4: robots.txt (If needed)**
```
User-agent: *
Allow: /
Disallow: /api/reviews/*
```

**Recommendation: Use Layer 1 + Layer 2 (Meta tag + Data attributes)**

---

## 📊 **Viator Booking URL Structure**

### **Format:**
```
https://www.viator.com/tours/{destination}/{tour-slug}/d{productId}?reviews=true#reviewId
```

### **Example:**
```
https://www.viator.com/tours/Aruba/Luxury-Private-Yacht-Charter-Aruba-Eden-Luca-Yachts/d28-103020P7?reviews=true#REV-CfHl47DyU7TU1PHGC+N8yGFsw5o+vz84zBr9DuOjH4E=
```

### **Implementation:**
```javascript
function getViatorBookingUrl(productId, reviewReference = null) {
  const baseUrl = tour.productUrl || `https://www.viator.com/tours/${productId}`;
  
  if (reviewReference) {
    // Link to specific review
    return `${baseUrl}?reviews=true#${reviewReference}`;
  }
  
  // Link to reviews section
  return `${baseUrl}?reviews=true`;
}
```

---

## ✅ **Compliance Checklist**

### **Before Certification:**
- [ ] Reviews are non-indexed (meta tag + data attribute)
- [ ] Provider is displayed on each review (Viator/Tripadvisor badge)
- [ ] Reviews are cached (weekly refresh)
- [ ] Cache refreshes when review count changes
- [ ] Reviews that no longer exist are deleted from cache
- [ ] "Read Full Review" links to Viator booking URL
- [ ] Disclaimer text is shown
- [ ] Main CTA links to Viator
- [ ] Non-indexing verified in Google Search Console

### **Demo Page Requirements:**
- [ ] Preview mode enabled
- [ ] 2 demo tours with reviews
- [ ] Show non-indexing implementation
- [ ] Show provider badges
- [ ] Show proper CTAs
- [ ] Show disclaimer text
- [ ] Ready for Viator review

---

## 🚀 **Next Steps (When Ready)**

1. **Create database table** for review caching
2. **Implement API integration** (`fetchProductReviews`)
3. **Implement caching logic** (weekly refresh, review count detection)
4. **Create review component** (non-indexed, provider badges, snippets)
5. **Add to tour detail page** (after ratings, before FAQs)
6. **Create preview mode** for demo/certification
7. **Test with 2 demo tours**
8. **Submit to Viator for certification**

---

## ⚠️ **Important Compliance Notes**

1. **Non-Indexing is MANDATORY** - Reviews are proprietary content
2. **Provider Display is REQUIRED** - Must show Viator/Tripadvisor
3. **Caching is REQUIRED** - Don't fetch in real-time
4. **Validation is REQUIRED** - Delete reviews that no longer exist
5. **Weekly Refresh** - Cache for 7 days, refresh weekly

**All of these are required for Viator certification!**
