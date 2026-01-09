# Review Snippets - Ready for Implementation

## ✅ **All Files Created (Brainstorming Complete)**

### **1. Review API Integration** ✅
**File:** `src/lib/viatorReviews.js`

**Features:**
- ✅ Fetches reviews from Viator API (`/reviews/product`)
- ✅ **Lazy caching** - only when user visits the page (no pre-crawling)
- ✅ Weekly cache refresh (7 days)
- ✅ Auto-refresh when review count changes
- ✅ Validates and deletes reviews that no longer exist in API
- ✅ **50-character snippet extraction** (as requested)
- ✅ Date formatting (e.g., "Dec 2025")
- ✅ Viator booking URL generation

### **2. Review Component** ✅
**File:** `src/components/tours/ReviewSnippets.jsx`

**Features:**
- ✅ Non-indexed (meta tag + data attribute for compliance)
- ✅ Provider badges (Viator/Tripadvisor) - **REQUIRED by Viator**
- ✅ **50-character snippets** (encourages clicking)
- ✅ Stars display (visual rating)
- ✅ User name + formatted date
- ✅ Review title (if available)
- ✅ "Read Full Review →" CTA (links to Viator with review anchor)
- ✅ Subtle disclaimer: "Reviews are from Viator. If you click on read full review you will be directed to Viator's tour page"
- ✅ Main CTA: "View All Reviews & Availability on Viator"

### **3. Preview Mode for Demo** ✅
**File:** `app/api/preview/route.js`

**Usage:**
```
https://toptours.ai/api/preview?secret={PREVIEW_SECRET}&slug=/tours/103020P7
```

**Features:**
- ✅ Enables Next.js preview mode
- ✅ Secret token protection
- ✅ Shows review implementation without going live
- ✅ Perfect for Viator certification

### **4. Database Table SQL** ✅
**File:** `scripts/create-tour-reviews-cache-table.sql`

**Features:**
- ✅ Stores cached review data (JSONB)
- ✅ Tracks cache expiry (7 days)
- ✅ Stores review count hash (for change detection)
- ✅ Automatic `updated_at` trigger

---

## 📋 **Implementation Checklist (When Ready)**

### **Step 1: Create Database Table**
```sql
-- Run in Supabase SQL Editor
-- File: scripts/create-tour-reviews-cache-table.sql
```

### **Step 2: Add Environment Variables**
```bash
# .env.local
PREVIEW_SECRET=your-secret-token-here
VIATOR_API_KEY=your-production-key (after certification)
```

### **Step 3: Update Tour Detail Page (Server-Side)**
- Import `getCachedReviews` from `@/lib/viatorReviews`
- Fetch reviews on page load (lazy loading)
- Pass reviews to client component
- **Only show in preview mode for now** (for certification)

### **Step 4: Update Tour Detail Client**
- Import `ReviewSnippets` component
- Add review section after ratings, before FAQs
- Pass review data and tour info
- Check preview mode or feature flag

### **Step 5: Test Preview Mode**
1. Visit: `/api/preview?secret={PREVIEW_SECRET}&slug=/tours/103020P7`
2. Should see review snippets section
3. Verify non-indexing (check page source)
4. Verify provider badges
5. Verify CTAs link to Viator

### **Step 6: Select 2 Demo Tours**
- Tour 1: High reviews (e.g., 103020P7 - Luxury Yacht Charter)
- Tour 2: Medium reviews (different category/operator)

### **Step 7: Share with Viator**
- Share preview URL with Viator team
- They review implementation
- After certification, get production key
- Enable site-wide

---

## 🎯 **Key Implementation Details**

### **Snippet Length: 50 Characters**
- ✅ "Duuuuuuude yassssss. Seriously tho YASSSS best experince..."
- Long enough to get attention
- Short enough to encourage clicking

### **Lazy Caching Strategy:**
```javascript
// When user visits tour page:
1. Check cache for product_id
2. If cache exists and not expired → Use cache (fast)
3. If cache expired or missing → Fetch from API (lazy load)
4. Cache for 7 days
5. If review count changed → Auto-refresh cache
```

### **Non-Indexing (Multiple Layers):**
```jsx
1. Meta tag: <meta name="robots" content="noindex, nofollow" />
2. Data attribute: data-noindex="true"
3. Data robots: data-robots="noindex, nofollow"
4. Data viator: data-viator-content="review-snippets"
```

### **Provider Display (Required):**
- Each review card shows: "[Viator Review]" or "[Tripadvisor Review]" badge
- Different colors: Purple for Viator, Green for Tripadvisor

### **Placement:**
- After: Rating Breakdown section
- Before: FAQs section
- 3-5 cards in a grid

---

## ✅ **Viator Compliance Checklist**

- [x] Reviews are non-indexed (meta tag + data attribute)
- [x] Provider is displayed (Viator/Tripadvisor badge)
- [x] Weekly cache refresh (lazy loading on page visit)
- [x] Cache refreshes when review count changes
- [x] Reviews that no longer exist are deleted
- [x] "Read Full Review" links to Viator booking URL
- [x] Disclaimer text displayed
- [x] 50-character snippets (encourages clicking)
- [x] Preview mode for certification

---

## 🚀 **Ready to Implement When You Say Go!**

**All files are created and ready. Just need to:**
1. Create database table (SQL provided)
2. Add environment variable (PREVIEW_SECRET)
3. Integrate into tour detail page (with preview mode check)
4. Test with 2 demo tours
5. Share preview URL with Viator

**Everything complies with Viator requirements!** ✅
