# Destination Pages Implementation Plan
## For All 3,564 Destinations (182 with guides + 3,382 without)

---

## 📋 Phase 1: Generate Full Content (OpenAI)

### Script: `scripts/generate-destination-full-content.js`

**What it generates:**
- `whyVisit`: 6 compelling reasons
- `highlights`: 6-8 attractions/landmarks
- `gettingAround`: Transportation info
- `bestTimeToVisit`: Country-level data (shared)
- `tourCategories`: 6 popular categories per destination
- `briefDescription`: Card sentence (from existing script)
- `heroDescription`: Hero text (from existing script)
- `seo`: Title, description, keywords (from existing script)

**Output:** `generated-destination-full-content.json`

**Cost Estimate:**
- ~600-800 tokens per destination
- 3,382 destinations × 700 tokens = ~2.4M tokens
- Input: ~1.6M tokens = $0.80
- Output: ~0.8M tokens = $1.20
- **Total: ~$2.00**

---

## 📋 Phase 2: Create Data Access Module

### File: `src/data/destinationFullContent.js`

```javascript
import fullContentData from '../../generated-destination-full-content.json';
import { getDestinationSeoContent } from './destinationSeoContent';

export function getDestinationFullContent(slug) {
  return fullContentData[slug] || null;
}

export function getDestinationContent(slug) {
  // Combine SEO content (briefDescription, heroDescription, seo) 
  // with full content (whyVisit, highlights, gettingAround, etc.)
  const seoContent = getDestinationSeoContent(slug);
  const fullContent = getDestinationFullContent(slug);
  
  if (!fullContent) return null;
  
  return {
    ...fullContent,
    briefDescription: seoContent?.briefDescription || fullContent.briefDescription,
    heroDescription: seoContent?.heroDescription || fullContent.heroDescription,
    seo: seoContent?.seo || fullContent.seo,
  };
}
```

---

## 📋 Phase 3: Update Destination Page

### File: `app/destinations/[id]/page.js`

**Changes:**
1. Check if destination has guide (existing 182)
2. If not, load from `getDestinationFullContent()`
3. Merge with existing destination structure
4. Pass to client component

**Structure:**
```javascript
export default async function DestinationDetailPage({ params }) {
  const { id } = await params;
  let destination = getDestinationById(id); // 182 with guides
  
  if (!destination) {
    // Load from generated content
    const fullContent = getDestinationFullContent(id);
    if (fullContent) {
      destination = {
        id: id,
        name: fullContent.destinationName,
        fullName: fullContent.destinationName,
        category: fullContent.region || null,
        country: fullContent.country || null,
        briefDescription: fullContent.briefDescription,
        heroDescription: fullContent.heroDescription,
        whyVisit: fullContent.whyVisit || [],
        highlights: fullContent.highlights || [],
        gettingAround: fullContent.gettingAround || '',
        bestTimeToVisit: fullContent.bestTimeToVisit || null,
        tourCategories: fullContent.tourCategories || [],
        seo: fullContent.seo || {},
        imageUrl: null, // No image
        isViatorDestination: true, // Flag for client component
      };
    }
  }
  
  // ... rest of page logic
}
```

---

## 📋 Phase 4: Update Client Component

### File: `app/destinations/[id]/DestinationDetailClient.jsx`

**Changes:**
1. **Hero Section**: Check if `imageUrl` exists
   - If yes: Use split layout (existing)
   - If no: Use centered layout (like /tours page)

2. **Content Sections**: Use same structure
   - Why Visit (6 reasons)
   - Best Time to Visit
   - Getting Around
   - Highlights
   - Tour Categories (6 categories)

3. **Plan Your Trip**: Same as existing
   - Transportation Tips
   - Car Rental Deals (Expedia affiliate)
   - Where to Stay
   - Hotel Deals (Expedia affiliate)

4. **Ready to Explore CTA**: Same as existing
   - "Ready to Explore [Destination]?"
   - Description text
   - "View All Tours & Activities" button

5. **Other Destinations in Country**: 
   - Shows other destinations in same country (like on /tours page)
   - Uses `countryDestinations` state (already loaded)
   - Links to `/destinations/[slug]` pages
   - Same style as "Other Destinations in [Country]" on tours page
   - Shows before "More [Category] Destinations" section

**Hero Section Logic:**
```javascript
{destination.imageUrl ? (
  // Split layout (existing destinations with guides)
  <div className="grid grid-cols-1 lg:grid-cols-2">
    {/* Text on left, image on right */}
  </div>
) : (
  // Centered layout (destinations without guides)
  <div className="text-center">
    {/* Centered title and description */}
  </div>
)}
```

**Slug Format:**
- ✅ Same as existing: `/destinations/destination-name`
- ✅ Uses `generateSlug()` function (lowercase, hyphens, no special chars)
- ✅ Example: `/destinations/lofoten-islands`, `/destinations/oslo`
- ✅ All 3,564 destinations use same slug format

**Page Sections (In Order):**
1. Hero Section (centered if no image, split if image exists)
2. Breadcrumb
3. Why Visit (6 reasons)
4. Best Time to Visit
5. Getting Around
6. Highlights (6-8 attractions)
7. Tour Categories (6 categories with tours)
8. Plan Your Trip (Transportation + Hotels)
9. Ready to Explore CTA
10. Other Destinations in [Country] (new section, same style as tours page)
11. More [Category] Destinations (if applicable)
12. Travel Guides (if applicable)

---

## 📋 Phase 5: Integration Checklist

### Step 1: Run Content Generation
```bash
node scripts/generate-destination-full-content.js
```

### Step 2: Create Data Access Module
- Create `src/data/destinationFullContent.js`
- Export `getDestinationFullContent()` and `getDestinationContent()`

### Step 3: Update Page Component
- Modify `app/destinations/[id]/page.js`
- Add logic to load from generated content
- Handle both types of destinations

### Step 4: Update Client Component
- Modify `app/destinations/[id]/DestinationDetailClient.jsx`
- Add conditional hero layout
- Ensure all sections work with generated content

### Step 5: Test
- Test with destination with guide (e.g., Amsterdam)
- Test with destination without guide (e.g., Rotterdam)
- Verify all sections display correctly
- Check mobile responsiveness

---

## 🎨 Design Specifications

### Hero Section (No Image):
- **Layout**: Centered (like /tours page)
- **Background**: Gradient (ocean-gradient or similar)
- **Content**: 
  - Category badge (top)
  - Title (large, centered)
  - Description (centered)
  - Category badges (centered)
  - CTA button (centered)

### All Other Sections:
- **Same as existing**: Why Visit, Best Time, Getting Around, Highlights
- **Tour Categories**: Show 6 categories (from generated content)
- **Plan Your Trip**: 
  - Transportation Tips (from generated `gettingAround`)
  - Car Rental Deals (Expedia affiliate link)
  - Where to Stay section
  - Hotel Deals (Expedia affiliate link)
- **Ready to Explore CTA**: 
  - "Ready to Explore [Destination]?" heading
  - Description text
  - "View All Tours & Activities in [Destination]" button
- **Other Destinations in Country**: 
  - Shows other destinations in same country
  - Same style as "Other Destinations in [Country]" on tours page
  - Uses compact button layout with "View All" option
  - Links to `/destinations/[slug]` pages
  - Shows before "More [Category] Destinations" section

---

## ✅ Expected Result

### For Destinations WITH Guides (182):
- ✅ Existing design (split hero with image)
- ✅ All existing features work
- ✅ No changes to user experience

### For Destinations WITHOUT Guides (3,382):
- ✅ Centered hero (no image)
- ✅ Same content sections
- ✅ 6 tour categories
- ✅ Same "Plan Your Trip" section
- ✅ Same "More Destinations" section
- ✅ Consistent design language

---

## 🚀 Next Steps

1. **Generate Content**: Run the script
2. **Create Data Module**: Build access layer
3. **Update Pages**: Modify page.js and client component
4. **Test**: Verify both types of destinations work
5. **Deploy**: Push to production

Ready to start implementation?

