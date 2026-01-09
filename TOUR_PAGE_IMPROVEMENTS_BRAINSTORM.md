# Tour Page Improvements - Brainstorming & Strategy

## 🔍 **Current Issues Identified**

### 1. **AI Insight Not Always Generating on Page Load**

#### Problem:
- The "TopTours Insights" section shows a button to generate insight instead of showing content
- Server-side generation exists but may be failing silently

#### Root Cause Analysis:
```javascript
// In page.js (server-side):
if (!tourEnrichment || !tourEnrichment.ai_summary) {
  try {
    const generated = await generateTourEnrichment(productId, tour);
    if (!generated.error) {
      tourEnrichment = generated.data;
    }
  } catch (error) {
    console.error('Error generating tour enrichment server-side:', error);
    // ❌ Error is caught but enrichment stays null
  }
}
```

**Issues:**
1. If `generateTourEnrichment` fails, `tourEnrichment` remains `null`
2. Client-side only checks `enrichment?.ai_summary` - if enrichment is null, no insight shown
3. No retry mechanism or fallback
4. Generation might be slow/timeout and fail silently

#### Solutions:

**Option A: Ensure Server-Side Generation Always Runs**
```javascript
// In page.js - More robust generation
let tourEnrichment = null;
try {
  tourEnrichment = await getTourEnrichment(productId);
} catch (error) {
  console.error('Error fetching tour enrichment:', error);
}

// Always try to generate if missing
if (!tourEnrichment?.ai_summary) {
  try {
    // Add timeout wrapper
    const generated = await Promise.race([
      generateTourEnrichment(productId, tour),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      )
    ]);
    
    if (!generated.error && generated.data) {
      tourEnrichment = generated.data;
    } else {
      // Fallback: Use basic description
      tourEnrichment = {
        ai_summary: tour.description?.summary || tour.description?.shortDescription || ''
      };
    }
  } catch (error) {
    console.error('Error generating tour enrichment:', error);
    // Fallback to basic description
    tourEnrichment = {
      ai_summary: tour.description?.summary || tour.description?.shortDescription || ''
    };
  }
}
```

**Option B: Client-Side Auto-Generation on Mount**
```javascript
// In TourDetailClient.jsx
useEffect(() => {
  // Auto-generate if no insight on mount
  if (!editorialInsight && !isGeneratingInsight && productId) {
    // Small delay to avoid blocking initial render
    const timer = setTimeout(() => {
      handleGenerateInsight();
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [productId]); // Only run once on mount
```

**Option C: Background Job Queue**
- Create a background job that pre-generates insights for all tours
- Run during off-peak hours
- Ensures insights are ready before page load

**Recommended Approach:** Combine Option A (robust server-side) + Option B (client-side fallback)

---

## 2. **FAQ Generation at Scale (300k+ Tours)**

### Challenge:
- Can't manually create FAQs for 300k+ tours
- Need unique, valuable FAQs that work for all tours
- Must be SEO-friendly and add value

### Strategy: **Template-Based + AI-Enhanced FAQ Generation**

#### Approach 1: **Data-Driven FAQ Templates** (Recommended)

Create FAQ templates based on tour data fields:

```javascript
const generateFAQs = (tour) => {
  const faqs = [];
  
  // Template 1: Duration (if available)
  if (tour.duration || tour.itinerary?.duration) {
    const duration = formatDuration(tour.duration || tour.itinerary.duration);
    faqs.push({
      question: `How long is ${tour.title}?`,
      answer: `${tour.title} lasts approximately ${duration}.`
    });
  }
  
  // Template 2: Inclusions
  if (tour.inclusions?.length > 0) {
    const topInclusions = tour.inclusions.slice(0, 3).map(i => 
      extractInclusionText(i)
    ).join(', ');
    faqs.push({
      question: "What's included in this tour?",
      answer: `This tour includes ${topInclusions}${tour.inclusions.length > 3 ? ' and more' : ''}.`
    });
  }
  
  // Template 3: Cancellation Policy
  if (tour.cancellationPolicy) {
    const canCancel = tour.cancellationPolicy.freeCancellation;
    const deadline = extractCancellationDeadline(tour.cancellationPolicy);
    faqs.push({
      question: "Can I cancel this tour?",
      answer: canCancel 
        ? `Yes, you can cancel this tour ${deadline ? `up to ${deadline} before` : 'free of charge'}.`
        : "Cancellation policies vary. Please check the cancellation policy for details."
    });
  }
  
  // Template 4: Meeting Point
  if (tour.logistics?.meetingPoint?.length > 0) {
    const firstPoint = tour.logistics.meetingPoint[0];
    faqs.push({
      question: "Where does the tour start?",
      answer: firstPoint.description || "The meeting point will be provided upon booking."
    });
  }
  
  // Template 5: Group Size / Private Tour
  if (tour.logistics?.groupType) {
    const isPrivate = tour.logistics.groupType === 'PRIVATE';
    faqs.push({
      question: "Is this a private or group tour?",
      answer: isPrivate 
        ? "This is a private tour, meaning it's just for you and your party."
        : "This is a group tour, where you'll join other travelers."
    });
  }
  
  // Template 6: Age Restrictions
  if (tour.logistics?.ageRestrictions) {
    faqs.push({
      question: "Are there age restrictions?",
      answer: formatAgeRestrictions(tour.logistics.ageRestrictions)
    });
  }
  
  // Template 7: What to Bring (based on tour type/category)
  const whatToBring = generateWhatToBring(tour);
  if (whatToBring) {
    faqs.push({
      question: "What should I bring?",
      answer: whatToBring
    });
  }
  
  // Template 8: Weather Policy
  if (tour.cancellationPolicy?.cancelIfBadWeather) {
    faqs.push({
      question: "What happens if the weather is bad?",
      answer: "This tour offers free cancellation due to bad weather conditions."
    });
  }
  
  // Template 9: Transportation
  if (tour.inclusions?.some(i => 
    i.category === 'TRANSPORTATION' || 
    i.description?.toLowerCase().includes('pickup') ||
    i.description?.toLowerCase().includes('transfer')
  )) {
    faqs.push({
      question: "Is transportation included?",
      answer: "Yes, transportation is included in this tour."
    });
  }
  
  // Template 10: Instant Confirmation
  if (tour.bookingConfirmation) {
    faqs.push({
      question: "Will I receive instant confirmation?",
      answer: "Yes, you'll receive instant confirmation upon booking."
    });
  }
  
  return faqs.slice(0, 6); // Limit to 6 FAQs for SEO
};
```

#### Approach 2: **AI-Enhanced FAQs** (For Unique Value)

For top-performing tours or tours with rich data, use AI to generate unique FAQs:

```javascript
const generateAIEnhancedFAQs = async (tour, baseFAQs) => {
  // Only generate for tours with sufficient data
  if (!tour.description?.summary || tour.description.summary.length < 200) {
    return baseFAQs;
  }
  
  const prompt = `
Generate 2-3 unique, valuable FAQs for this tour that aren't covered by standard questions.
Focus on:
- Unique aspects of this specific tour
- Common concerns travelers might have
- What makes this tour special
- Practical tips specific to this experience

Tour: ${tour.title}
Description: ${tour.description.summary}
Destination: ${extractDestination(tour)}

Return JSON:
{
  "faqs": [
    {"question": "...", "answer": "..."}
  ]
}
`;
  
  // Call AI (Gemini/OpenAI)
  const aiFAQs = await callAI(prompt);
  
  // Combine with base FAQs, prioritize AI ones
  return [...aiFAQs, ...baseFAQs].slice(0, 6);
};
```

#### Approach 3: **Category-Specific FAQ Templates**

Create FAQ templates by tour category:

```javascript
const categoryFAQTemplates = {
  'WATER_SPORTS': [
    {
      question: "Do I need to know how to swim?",
      answer: (tour) => tour.logistics?.ageRestrictions?.includes('SWIMMING_REQUIRED') 
        ? "Yes, swimming ability is required for this tour."
        : "Basic swimming skills are recommended but not required."
    },
    {
      question: "Will I get wet?",
      answer: "Yes, you will get wet during this water activity. We recommend bringing a change of clothes."
    }
  ],
  'FOOD_AND_DRINK': [
    {
      question: "Are dietary restrictions accommodated?",
      answer: "Please contact the tour operator in advance to discuss dietary restrictions."
    }
  ],
  'ADVENTURE': [
    {
      question: "What's the difficulty level?",
      answer: (tour) => {
        const level = tour.logistics?.difficultyLevel || 'moderate';
        return `This tour has a ${level} difficulty level.`
      }
    }
  ]
};
```

#### Implementation Strategy:

1. **Phase 1: Template-Based (Week 1)**
   - Implement data-driven FAQ generation
   - Works for all 300k+ tours immediately
   - No API calls needed

2. **Phase 2: AI-Enhanced (Week 2-3)**
   - Add AI generation for top 10k tours
   - Cache results in database
   - Fallback to templates if AI fails

3. **Phase 3: Category Templates (Week 4)**
   - Add category-specific FAQs
   - Enhance existing templates

#### Storage:
```sql
-- Add to tour_enrichment table
ALTER TABLE tour_enrichment 
ADD COLUMN faqs JSONB;

-- Example structure:
{
  "faqs": [
    {
      "question": "How long is this tour?",
      "answer": "This tour lasts approximately 4 hours.",
      "source": "template", // or "ai" or "category"
      "generated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## 3. **Using New Viator API Endpoints**

### Endpoint 1: `/products/recommendations`

#### Use Case: Better "Similar Tours" Section

**Current:** Uses free-text search (less accurate)
**New:** Use ML-based recommendations (more accurate)

```javascript
// In page.js
const fetchRecommendedTours = async (productId) => {
  try {
    const response = await fetch('https://api.viator.com/partner/products/recommendations', {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productCodes: [productId],
        recommendationTypes: ['IS_SIMILAR_TO']
      }),
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (response.ok) {
      const data = await response.json();
      const recommendations = data[0]?.recommendations?.IS_SIMILAR_TO || [];
      return recommendations.slice(0, 6); // Top 6 similar tours
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error);
  }
  return [];
};
```

**Benefits:**
- More accurate recommendations (ML-based)
- Better user experience
- Higher conversion potential

### Endpoint 2: `/reviews/product`

#### Use Case: Review Snippets (Non-Indexed)

**Strategy:** Show review snippets to increase CTA clicks to Viator

```javascript
// In page.js (server-side)
const fetchReviewSnippets = async (productId) => {
  try {
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
        count: 3, // Only fetch 3 for snippets
        start: 1,
        provider: 'ALL',
        sortBy: 'MOST_HELPFUL_PER_LOCALE'
      }),
      next: { revalidate: 604800 } // Cache for 1 week (as per Viator guidelines)
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.reviews || [];
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
  return [];
};
```

**Display Strategy:**
```jsx
// In TourDetailClient.jsx
{reviewSnippets.length > 0 && (
  <section className="review-snippets">
    <h2>What People Are Saying</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {reviewSnippets.map((review, index) => (
        <Card key={index} className="review-snippet-card">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{review.rating}/5</span>
            <span className="text-sm text-gray-500">
              {formatDate(review.publishedDate)}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            "{review.text.slice(0, 100)}..."
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full"
          >
            <a
              href={viatorUrl} // Link to Viator booking page
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('review_snippet_click', { productId })}
            >
              Read Full Review
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </Button>
        </Card>
      ))}
    </div>
    <div className="mt-4 text-center">
      <Button
        asChild
        className="sunset-gradient text-white"
      >
        <a href={viatorUrl} target="_blank" rel="noopener noreferrer">
          View All Reviews & Book
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </Button>
    </div>
  </section>
)}
```

**Important:** Add `noindex` meta tag to review content:
```jsx
{reviewSnippets.length > 0 && (
  <>
    <meta name="robots" content="noindex, follow" />
    {/* Review snippets */}
  </>
)}
```

**Benefits:**
- Increases CTA clicks to Viator (main goal)
- Shows social proof without indexing
- Better user experience
- Compliant with Viator requirements

---

## 4. **Enhanced Meta Description Strategy**

### Current Issue:
- Falls back to generic: `"Book ${title} and discover amazing experiences."`
- No value propositions

### Enhanced Template:
```javascript
const buildEnhancedMetaDescription = (tour, enrichment, pricing, reviewCount) => {
  const parts = [];
  
  // 1. Rating (if high)
  if (tour.reviews?.combinedAverageRating >= 4.5) {
    parts.push(`${tour.reviews.combinedAverageRating}★`);
  }
  
  // 2. Review count (if significant)
  if (reviewCount >= 100) {
    parts.push(`${formatNumber(reviewCount)}+ reviews`);
  }
  
  // 3. Pricing (if competitive)
  if (pricing && pricing < 150) {
    parts.push(`From $${pricing}`);
  }
  
  // 4. Unique value prop from enrichment
  if (enrichment?.ai_summary) {
    const summary = cleanText(enrichment.ai_summary);
    parts.push(summary.slice(0, 80));
  } else if (tour.description?.summary) {
    parts.push(tour.description.summary.slice(0, 80));
  }
  
  // 5. Trust signal
  if (tour.cancellationPolicy?.freeCancellation) {
    parts.push('Free cancellation');
  }
  
  // Join and limit to 160 chars
  const description = parts.filter(Boolean).join(' • ').slice(0, 160);
  
  // Fallback if still empty
  return description || `Book ${tour.title} and discover amazing experiences.`;
};
```

---

## 5. **Implementation Priority**

### Week 1: Quick Wins
1. ✅ Fix AI insight generation (server-side + client-side fallback)
2. ✅ Implement template-based FAQ generation
3. ✅ Enhance meta descriptions

### Week 2: API Integration
4. ✅ Integrate `/products/recommendations` for better similar tours
5. ✅ Integrate `/reviews/product` for review snippets (non-indexed)

### Week 3: Enhancement
6. ✅ Add AI-enhanced FAQs for top tours
7. ✅ Add category-specific FAQ templates
8. ✅ Optimize review snippet display

### Week 4: Testing & Optimization
9. ✅ A/B test meta description formats
10. ✅ Monitor CTA click rates
11. ✅ Track FAQ engagement

---

## 6. **Expected Impact**

### FAQ Section:
- **SEO**: FAQPage schema = rich snippets in search
- **User Experience**: Answers common questions = lower bounce rate
- **Content Depth**: +200-400 words per page

### Review Snippets:
- **CTA Clicks**: +20-30% increase in clicks to Viator
- **Social Proof**: Better conversion rates
- **User Trust**: Higher engagement

### Better Recommendations:
- **User Experience**: More relevant similar tours
- **Conversion**: Higher cross-sell potential

### Enhanced Meta Descriptions:
- **CTR**: 0.3-0.4% → 0.8-1.2% (2-3x improvement)
- **Search Visibility**: Better rankings for commercial queries

---

## 7. **Technical Considerations**

### Caching Strategy:
- **FAQs**: Generate once, cache in `tour_enrichment` table
- **Recommendations**: Cache for 1 hour (Viator requirement)
- **Reviews**: Cache for 1 week (Viator requirement)

### Performance:
- **FAQ Generation**: Should be <100ms (template-based)
- **AI FAQ Generation**: Background job for top tours
- **Review Fetching**: Server-side, cached

### Compliance:
- **Reviews**: Must not be indexed (add `noindex` meta)
- **Reviews**: Must delete if removed from Viator API
- **API Limits**: Respect rate limits for all endpoints

---

## 8. **Database Schema Updates**

```sql
-- Add FAQs to tour_enrichment
ALTER TABLE tour_enrichment 
ADD COLUMN IF NOT EXISTS faqs JSONB;

-- Add review snippets cache (optional, or use existing cache)
CREATE TABLE IF NOT EXISTS tour_review_snippets (
  product_id TEXT PRIMARY KEY,
  snippets JSONB,
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Add recommendations cache
CREATE TABLE IF NOT EXISTS tour_recommendations (
  product_id TEXT PRIMARY KEY,
  recommendations JSONB,
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

---

## ✅ **Summary**

### **Immediate Actions:**
1. Fix AI insight generation (ensure it always runs)
2. Implement template-based FAQ generation
3. Enhance meta descriptions with value props

### **Short-Term (Week 2-3):**
4. Integrate new Viator API endpoints
5. Add review snippets (non-indexed)
6. Improve similar tours with ML recommendations

### **Long-Term:**
7. AI-enhanced FAQs for top tours
8. Category-specific FAQ templates
9. A/B testing and optimization

---

*This is a brainstorming document - prioritize based on expected ROI and development resources.*
