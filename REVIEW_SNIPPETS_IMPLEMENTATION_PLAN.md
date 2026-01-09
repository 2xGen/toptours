# Review Snippets Implementation Plan - Brainstorm

## 🎯 **Goal**
Display review snippets from Viator API (non-indexed) on tour pages to:
- Increase CTR (social proof)
- Drive clicks to Viator (main CTA)
- Get certified by Viator before going live site-wide

---

## 📋 **Requirements (From Viator)**

### **API Endpoint:**
```
POST /reviews/product
```

### **Key Constraints:**
1. ✅ Reviews **MUST be non-indexed** (noindex or data-noindex)
2. ✅ Reviews are **proprietary** - can't be indexed by search engines
3. ✅ Display **short snippets** (first 25 characters + date + stars)
4. ✅ "Read Full Review" CTA → Links to Viator booking URL
5. ✅ Cached and refreshed weekly
6. ✅ Delete reviews that no longer exist in API response

---

## 🏗️ **Implementation Strategy**

### **Phase 1: Demo/Certification Page (For Viator)**

Create a **private demo page** that:
1. Shows review snippets implementation
2. Demonstrates non-indexing (noindex meta tag)
3. Shows proper CTA to Viator
4. Can be shared with Viator for certification
5. **Not publicly accessible** (password-protected or subdomain)

#### **Options for Demo Page:**

**Option A: Subdomain Demo**
```
demo.toptours.ai/tours/[productId]
- Separate Next.js app or same app
- Password protected
- Shows review implementation
- Viator team can review before certifying
```

**Option B: Private Route with Token**
```
toptours.ai/demo/tours/[productId]?token={secret}
- Same app, private route
- Token-based access
- Only Viator team gets link
```

**Option C: Staging Environment**
```
staging.toptours.ai/tours/[productId]
- Separate staging deployment
- Password protected
- Full implementation preview
```

**Option D: Preview Mode (Next.js)**
```
toptours.ai/api/preview?secret={token}&slug=/tours/[productId]
- Next.js preview mode
- Shows unpublished changes
- Easy to share with Viator
```

**Recommendation: Option C (Staging) or Option D (Preview Mode)**

---

### **Phase 2: Review Snippets Component**

#### **Data Structure:**
```javascript
{
  reviewSnippets: [
    {
      id: "review_123",
      snippet: "Amazing experience! We had...", // First 25 chars
      date: "2024-01-15",
      rating: 5,
      stars: "★★★★★",
      fullReviewUrl: "https://www.viator.com/tours/[destination]/[tour]/d[productId]?reviews=true#reviewId"
    },
    // ... more snippets
  ],
  totalReviews: 1234,
  averageRating: 4.8
}
```

#### **API Call:**
```javascript
POST /reviews/product
{
  productCode: "103020P7",
  count: 5, // Show 3-5 snippets
  start: 0,
  provider: "ALL", // or "VIATOR" only
  sortBy: "MOST_RECENT_PER_LOCALE",
  ratings: [4, 5], // Only 4-5 star reviews for snippets
  reviewsForNonPrimaryLocale: true,
  showMachineTranslated: false
}
```

#### **Display Component:**
```jsx
<section className="review-snippets" data-noindex="true">
  <h2>Guest Reviews</h2>
  <div className="snippets-grid">
    {reviewSnippets.map(review => (
      <div key={review.id} className="review-card">
        <div className="stars">{review.stars}</div>
        <p className="snippet">"{review.snippet}..."</p>
        <div className="meta">
          <span className="date">{formatDate(review.date)}</span>
        </div>
        <a 
          href={fullReviewUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="read-more-btn"
        >
          Read Full Review on Viator →
        </a>
      </div>
    ))}
  </div>
  <a href={viatorBookingUrl} className="cta-button">
    View All Reviews & Availability on Viator
  </a>
</section>
```

---

### **Phase 3: Non-Indexing Implementation**

#### **Method 1: Meta Tag (Recommended)**
```jsx
// In page.js generateMetadata or Head
<meta name="robots" content="noindex, nofollow" data-review-section="true" />
// Only for review section, not entire page

// OR use conditional rendering in component
{reviewSnippets.length > 0 && (
  <>
    <meta name="robots" content="noindex" data-selector="review-section" />
    <ReviewSnippetsSection data={reviewSnippets} />
  </>
)}
```

#### **Method 2: Data Attribute + JavaScript**
```jsx
<section data-noindex="true" data-robots="noindex, nofollow">
  {/* Review snippets */}
</section>

// Add to page head dynamically
useEffect(() => {
  const section = document.querySelector('[data-noindex="true"]');
  if (section) {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    meta.setAttribute('data-review-section', 'true');
    document.head.appendChild(meta);
  }
}, []);
```

#### **Method 3: X-Robots-Tag Header**
```javascript
// In API route or server component
headers: {
  'X-Robots-Tag': 'noindex, nofollow'
}
```

**Recommendation: Method 1 (Meta Tag) - Most reliable for Google**

---

### **Phase 4: Caching Strategy**

#### **Database Table:**
```sql
CREATE TABLE tour_reviews_cache (
  product_id TEXT PRIMARY KEY,
  reviews_data JSONB NOT NULL,
  total_reviews_count INTEGER,
  average_rating NUMERIC,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refresh weekly
CREATE INDEX idx_tour_reviews_expires ON tour_reviews_cache(expires_at);
```

#### **Cache Logic:**
```javascript
// Check cache first
const cached = await getCachedReviews(productId);

if (cached && cached.expires_at > new Date()) {
  return cached.reviews_data; // Use cached
}

// Fetch from API
const reviews = await fetchViatorReviews(productId);

// Cache for 7 days
await cacheReviews(productId, reviews, 7); // days

// Validate: Delete reviews that no longer exist in API response
await validateAndCleanupReviews(productId, reviews);
```

---

## 🎨 **UI/UX Design**

### **Review Snippets Section Placement:**

**Option A: After Tour Description**
```
Tour Description
↓
Review Snippets (3-5 cards)
↓
Highlights
```

**Option B: After Ratings Breakdown**
```
Ratings Breakdown
↓
Review Snippets (3-5 cards)
↓
FAQs
```

**Option C: Dedicated Reviews Section**
```
All Tour Details
↓
━━━━━━━━━━━━━━━━━━━━
Guest Reviews Preview
━━━━━━━━━━━━━━━━━━━━
Review Snippets (3-5 cards)
[View All Reviews on Viator] CTA
```

**Recommendation: Option C - Dedicated section with clear CTA**

### **Design Specifications:**
- **Cards:** 3-5 review snippet cards
- **Layout:** Grid (2-3 columns on desktop, 1 column mobile)
- **Each Card:**
  - ⭐ Stars (visual rating)
  - "Snippet text..." (first 25-30 characters)
  - Date (e.g., "January 2024")
  - "Read Full Review →" button (links to Viator)
- **CTA Button:** "View All Reviews & Availability on Viator" (main booking CTA)

---

## 🔒 **Certification/Demo Page Options**

### **Option 1: Next.js Preview Mode (Recommended)**

**Pros:**
- ✅ Built into Next.js
- ✅ Easy to share (just a URL with token)
- ✅ Shows unpublished changes
- ✅ No separate deployment needed

**Implementation:**
```javascript
// app/api/preview/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug'); // /tours/103020P7
  
  // Verify secret
  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }
  
  // Enable preview mode
  request.nextUrl.searchParams.set('preview', 'true');
  
  // Redirect to tour page
  return NextResponse.redirect(new URL(slug, request.url));
}
```

**Usage:**
```
https://toptours.ai/api/preview?secret={SECRET}&slug=/tours/103020P7
```

---

### **Option 2: Staging Environment**

**Pros:**
- ✅ Separate deployment
- ✅ Password protected
- ✅ Full environment preview
- ✅ Can test everything

**Implementation:**
- Deploy to staging.toptours.ai (or similar)
- Add password protection
- Show review implementation
- Share with Viator

---

### **Option 3: Demo Subdomain**

**Pros:**
- ✅ Completely separate
- ✅ Can show multiple variations
- ✅ Easy to iterate

**Implementation:**
- demo.toptours.ai
- Password protected
- Shows review snippets

---

### **Option 4: Private Route with Feature Flag**

**Pros:**
- ✅ Same codebase
- ✅ Feature flag control
- ✅ Easy to enable/disable

**Implementation:**
```javascript
// Only show reviews if feature flag enabled OR demo token present
const showReviews = 
  process.env.ENABLE_REVIEW_SNIPPETS === 'true' ||
  searchParams.get('demo') === process.env.DEMO_TOKEN;
```

**Usage:**
```
https://toptours.ai/tours/103020P7?demo={SECRET_TOKEN}
```

---

## ✅ **Recommended Approach**

### **For Certification:**

1. **Use Next.js Preview Mode** (Option 1)
   - Create `/api/preview` route
   - Share secret URL with Viator
   - Shows review implementation without going live

2. **Create Demo Tour Page**
   - Pick 2-3 representative tours
   - Show different scenarios:
     - Tour with many reviews
     - Tour with few reviews
     - Tour with mixed ratings

3. **Demonstrate Non-Indexing**
   - Show meta tag in page source
   - Show data-noindex attribute
   - Verify with Google Search Console

4. **Show Proper CTA**
   - "Read Full Review" links to Viator
   - "View All Reviews" links to Viator booking page
   - All links open in new tab

### **After Certification:**

1. **Feature Flag Control**
   - Add environment variable: `ENABLE_REVIEW_SNIPPETS=true`
   - Gradually roll out (10% → 50% → 100%)
   - Monitor performance

2. **A/B Testing**
   - Test with/without review snippets
   - Measure CTR improvements
   - Optimize based on data

---

## 📊 **Expected Impact**

### **CTR Improvement:**
- **Without reviews:** 0.8-1.2% (current with enhanced meta)
- **With review snippets:** 1.2-1.8% (+50% improvement)
- **Reason:** Social proof increases trust and clicks

### **Conversion Impact:**
- More trust = more bookings
- Review snippets = social proof
- CTA to Viator = direct conversion path

---

## 🚀 **Implementation Checklist**

### **Phase 1: Demo/Certification Page**
- [ ] Create preview mode API route
- [ ] Select 2-3 demo tours
- [ ] Implement review snippets component
- [ ] Add non-indexing meta tags
- [ ] Add proper CTAs to Viator
- [ ] Test on demo page
- [ ] Share with Viator for review

### **Phase 2: Production Implementation**
- [ ] Create review caching system
- [ ] Implement API integration
- [ ] Add feature flag
- [ ] Add to tour detail pages
- [ ] Monitor performance
- [ ] Optimize based on data

---

## 💡 **Next Steps (Brainstorm Only - No Changes Yet)**

1. **Decide on demo/certification approach** (Preview Mode recommended)
2. **Select demo tours** (2-3 representative tours)
3. **Design review snippets UI** (cards, layout, CTAs)
4. **Plan caching strategy** (database table, refresh logic)
5. **Define non-indexing method** (meta tag recommended)

**Ready to implement when you give the go-ahead!** 🚀
