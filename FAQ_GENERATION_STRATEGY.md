# FAQ Generation Strategy - SEO-Optimized & Scalable

## 🎯 **Strategy Overview**

This FAQ generation system creates **unique, SEO-optimized FAQs** for all 300k+ tours by:

1. **Combining multiple data sources:**
   - Viator API tour data (title, duration, inclusions, cancellation, etc.)
   - Destination information (name, country)
   - Tag characteristics from `viator_tag_traits` (family-friendly, adventure level, etc.)
   - Tour operator/supplier name

2. **Personalizing questions** with tour-specific data:
   - Tour name in questions: "How long is **[Tour Name]** in **[Destination]**?"
   - Operator name in answers: "**[Tour Name]** by **[Operator]**..."
   - Destination name throughout for local SEO

3. **SEO optimization:**
   - Natural keyword inclusion (tour name, destination, operator, category)
   - Long-tail question formats ("How long is...", "What's included in...")
   - Comprehensive answers (50-100 words) with multiple keyword mentions

---

## 📋 **FAQ Templates & SEO Value**

### **FAQ 1: Duration** (Highest SEO Value)
- **Question Format:** `"How long is [Tour Name] in [Destination]?"`
- **SEO Keywords:** Tour name, destination, duration
- **Example:** "How long is Sunset Catamaran Cruise in Aruba?"
- **Answer includes:** Duration, operator, destination, category

### **FAQ 2: What's Included** (High SEO Value)
- **Question Format:** `"What's included in [Tour Name] in [Destination]?"`
- **SEO Keywords:** Tour name, destination, inclusions, operator
- **Example:** "What's included in Caribbean Cooking Class in Aruba?"
- **Answer includes:** Top 3 inclusions, operator, destination, category

### **FAQ 3: Cancellation Policy** (High SEO Value)
- **Question Format:** `"Can I cancel [Tour Name] in [Destination]?"`
- **SEO Keywords:** Tour name, destination, cancellation, operator
- **Example:** "Can I cancel ATV Adventure Tour in Aruba?"
- **Answer includes:** Cancellation policy, deadline, operator, destination

### **FAQ 4: Meeting Point** (Medium SEO Value)
- **Question Format:** `"Where does [Tour Name] in [Destination] start?"`
- **SEO Keywords:** Tour name, destination, meeting point, operator
- **Example:** "Where does Snorkeling Tour in Aruba start?"
- **Answer includes:** Meeting point details, operator, destination

### **FAQ 5: Private vs Group** (Medium SEO Value)
- **Question Format:** `"Is [Tour Name] in [Destination] a private or group tour?"`
- **SEO Keywords:** Tour name, destination, private tour, group tour
- **Example:** "Is Sunset Cruise in Aruba a private or group tour?"
- **Answer includes:** Tour type, operator, destination, category

### **FAQ 6: Family-Friendly** (Medium SEO Value - Tag-Based)
- **Question Format:** `"Is [Tour Name] in [Destination] good for families?"`
- **SEO Keywords:** Tour name, destination, family-friendly, operator
- **Example:** "Is Beach Day Tour in Aruba good for families?"
- **Answer includes:** Family-friendly confirmation, operator, destination, category
- **Triggered by:** Tag with "family" in name OR `tour.logistics.isFamilyFriendly`

### **FAQ 7: What to Bring** (Medium SEO Value - Category-Based)
- **Question Format:** `"What should I bring for [Tour Name] in [Destination]?"`
- **SEO Keywords:** Tour name, destination, what to bring, operator
- **Example:** "What should I bring for Snorkeling Tour in Aruba?"
- **Answer includes:** Category-specific recommendations, operator, destination
- **Categories:** Water Sports, Food & Drink, Adventure, Cultural, etc.

### **FAQ 8: Weather Policy** (Low SEO Value - Conditional)
- **Question Format:** `"What happens if the weather is bad for [Tour Name] in [Destination]?"`
- **SEO Keywords:** Tour name, destination, weather, cancellation
- **Example:** "What happens if the weather is bad for Boat Tour in Aruba?"
- **Triggered by:** `tour.cancellationPolicy.cancelIfBadWeather === true`

### **FAQ 9: Transportation** (Low SEO Value - Conditional)
- **Question Format:** `"Is transportation included in [Tour Name] in [Destination]?"`
- **SEO Keywords:** Tour name, destination, transportation, pickup
- **Example:** "Is transportation included in City Tour in Aruba?"
- **Triggered by:** Inclusions contain "pickup", "transfer", or "transportation"

### **FAQ 10: Age Restrictions** (Low SEO Value - Conditional)
- **Question Format:** `"Are there age restrictions for [Tour Name] in [Destination]?"`
- **SEO Keywords:** Tour name, destination, age restrictions, operator
- **Example:** "Are there age restrictions for Adventure Tour in Aruba?"
- **Triggered by:** `tour.logistics.ageRestrictions` exists

### **FAQ 11: Instant Confirmation** (Low SEO Value - Conditional)
- **Question Format:** `"Will I receive instant confirmation for [Tour Name] in [Destination]?"`
- **SEO Keywords:** Tour name, destination, instant confirmation, booking
- **Example:** "Will I receive instant confirmation for Tour in Aruba?"
- **Triggered by:** `tour.bookingConfirmation` or `tour.instantConfirmation`

### **FAQ 12: Operator Info** (Low SEO Value - Fallback)
- **Question Format:** `"Who operates [Tour Name] in [Destination]?"`
- **SEO Keywords:** Tour name, destination, operator, supplier
- **Example:** "Who operates Sunset Cruise in Aruba?"
- **Triggered by:** Operator name available AND less than 8 FAQs generated

---

## 🔍 **SEO Optimization Features**

### **1. Natural Keyword Inclusion**
- **Tour name** appears in every question and answer
- **Destination name** appears in most questions and answers
- **Operator name** appears in answers (when available)
- **Category** appears naturally in answers (e.g., "this food tour", "this water activity")

### **2. Long-Tail Question Formats**
- Questions match how people search:
  - "How long is [tour] in [destination]?"
  - "What's included in [tour] in [destination]?"
  - "Can I cancel [tour] in [destination]?"

### **3. Comprehensive Answers**
- Answers are 50-100 words (not too short, not too long)
- Multiple keyword mentions naturally woven in
- Provides value to users (not just keyword stuffing)

### **4. Unique Per Tour**
- Every FAQ is unique because it includes:
  - Specific tour name
  - Specific destination
  - Specific operator (when available)
  - Specific details (duration, inclusions, etc.)

---

## 🎨 **Tag-Based Enhancements**

### **Using `viator_tag_traits` Table**

The system fetches tag characteristics from the database to enhance FAQs:

```javascript
// Example tag trait:
{
  "tag_id": 6216,
  "tag_name_en": "Family-friendly",
  "adventure_score": 25,
  "relaxation_exploration_score": 50,
  "group_intimacy_score": 25,
  "price_comfort_score": 50,
  "guidance_score": 50,
  "food_drink_score": 50
}
```

**How tags enhance FAQs:**
1. **Family-Friendly FAQ:** Triggered if tag contains "family" in name
2. **Category Detection:** Uses tag names to determine category (Food, Water Sports, Adventure, etc.)
3. **What to Bring:** Category-specific recommendations based on tag characteristics

---

## 📊 **Implementation**

### **Usage in Tour Detail Page:**

```javascript
// In app/tours/[productId]/page.js
import { generateTourFAQs, generateFAQSchema } from '@/lib/faqGeneration';

// Generate FAQs server-side
const faqs = await generateTourFAQs(tour, destinationData, productId);

// Generate schema for SEO
const faqSchema = generateFAQSchema(faqs);

// Pass to client component
<TourDetailClient 
  tour={tour}
  faqs={faqs}
  faqSchema={faqSchema}
  // ... other props
/>
```

### **Display in Client Component:**

```jsx
// In TourDetailClient.jsx
{faqs && faqs.length > 0 && (
  <section>
    <h2>Frequently Asked Questions</h2>
    {faqs.map((faq, index) => (
      <details key={index}>
        <summary>{faq.question}</summary>
        <p>{faq.answer}</p>
      </details>
    ))}
  </section>
)}

// Add schema to page
{faqSchema && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
  />
)}
```

---

## 🚀 **Scalability**

### **Works for All 300k+ Tours:**
- ✅ **No API calls needed** - Uses existing tour data
- ✅ **Fast generation** - Template-based, <100ms per tour
- ✅ **Database queries** - Only fetches tags when needed (batched)
- ✅ **Caching** - FAQs can be cached in `tour_enrichment` table

### **Caching Strategy:**

```sql
-- Add to tour_enrichment table
ALTER TABLE tour_enrichment 
ADD COLUMN IF NOT EXISTS faqs JSONB;

-- Example structure:
{
  "faqs": [
    {
      "question": "How long is Sunset Cruise in Aruba?",
      "answer": "Sunset Cruise by ABC Tours lasts approximately 2 hours...",
      "generated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Cache invalidation:**
- Regenerate when tour data changes (title, duration, inclusions, etc.)
- Regenerate when destination data changes
- Cache for 30 days (or until tour data updates)

---

## 📈 **Expected SEO Impact**

### **1. Rich Snippets**
- FAQPage schema = FAQ rich snippets in Google search
- Higher click-through rates from search results

### **2. Long-Tail Keyword Rankings**
- Questions match search queries:
  - "How long is sunset cruise in aruba"
  - "What's included in snorkeling tour aruba"
  - "Can I cancel atv tour aruba"

### **3. Content Depth**
- Adds 300-600 words per tour page (6-8 FAQs × 50-100 words each)
- Better rankings for comprehensive content

### **4. User Engagement**
- Answers common questions = lower bounce rate
- Longer time on page = better rankings

---

## ✅ **Quality Assurance**

### **FAQ Quality Checklist:**
- ✅ Every question includes tour name
- ✅ Every question includes destination (when available)
- ✅ Every answer includes operator name (when available)
- ✅ Answers are 50-100 words (comprehensive but not too long)
- ✅ Natural keyword inclusion (not keyword stuffing)
- ✅ Provides value to users (answers the question)
- ✅ Unique per tour (no duplicate content)

### **Example Output:**

**Tour:** "Sunset Catamaran Cruise"
**Destination:** "Aruba"
**Operator:** "ABC Tours"
**Duration:** "2 hours"

**Generated FAQs:**
1. "How long is Sunset Catamaran Cruise in Aruba?"
   - Answer: "Sunset Catamaran Cruise by ABC Tours lasts approximately 2 hours. This water sports experience in Aruba is designed to give you plenty of time to enjoy all the highlights."

2. "What's included in Sunset Catamaran Cruise in Aruba?"
   - Answer: "Sunset Catamaran Cruise by ABC Tours includes drinks, snacks, and equipment. This comprehensive water sports package ensures you have everything you need for an unforgettable experience in Aruba."

3. "Can I cancel Sunset Catamaran Cruise in Aruba?"
   - Answer: "Yes, you can cancel Sunset Catamaran Cruise by ABC Tours up to 24 hours before. This flexible cancellation policy makes it easy to book your water sports tour in Aruba with confidence."

---

## 🎯 **Next Steps**

1. **Integrate into tour detail page** (server-side generation)
2. **Add FAQ section to client component** (display with schema)
3. **Cache FAQs in database** (store in `tour_enrichment.faqs`)
4. **Monitor SEO impact** (track rankings for FAQ questions)
5. **A/B test** (different FAQ formats, question styles)

---

*This system is designed to scale to 300k+ tours while maintaining uniqueness and SEO value for each tour page.*
