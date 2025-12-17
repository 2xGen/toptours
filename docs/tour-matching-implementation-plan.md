# Tour Matching System Implementation Plan

## Overview
Add personalized tour matching based on user preferences and tag-derived tour profiles.

## Implementation Phases

### Phase 1: Sort Option (Quick Win) ✅
- Add "Best Match" sort option
- Works for all users (anonymous = default "Balanced" profile)
- No UI changes to cards needed initially

### Phase 2: Match Badges on Cards (When Logged In)
- Show match score badge on tour cards
- Only for logged-in users with preferences set
- For users without preferences: Show CTA to set preferences
- For anonymous users: Show nothing (or subtle "Sign in" tooltip)

### Phase 3: Filter Option (Advanced)
- Add match threshold filter: "Show only 80%+ matches"
- Useful for highly personalized results

## Current Status
- ✅ Tag classification complete (1,257 tags classified)
- ✅ Matching functions ready (`src/lib/tourMatching.js`)
- ⏳ Need to integrate into tour listing pages
- ⏳ Need tour tag data (requires Full Access for bulk endpoints)

## Implementation Details

### 1. Sort Option
**Location**: `app/destinations/[id]/tours/ToursListingClient.jsx`

**Changes**:
- Add `'best-match'` to sortBy options
- Add match score calculation in `filteredTours` useMemo
- Sort by match score when `sortBy === 'best-match'`

**User Experience**:
- Anonymous users: Sorted by default "Balanced" profile match
- Logged-in users: Sorted by their personal preferences
- Users without preferences: Sorted by default "Balanced" profile match

### 2. Match Badges
**Location**: Tour card component

**Display Logic**:
```javascript
if (user && userPreferences) {
  // Show match badge
} else if (user && !userPreferences) {
  // Show "Set preferences" CTA
} else {
  // Show nothing (or subtle "Sign in" tooltip)
}
```

**Badge Design**:
- "92% Match · Perfect for You" (85%+)
- "78% Match · Great Fit" (70-84%)
- "65% Match · Good Option" (55-69%)
- "45% Match · Consider" (<55%)

### 3. Data Requirements
**Current Limitation**: Tours may not have tag IDs until Full Access

**Solution**:
- For now: Use fallback/default matching
- Once Full Access: Fetch tour tags and calculate accurate matches
- Can also use existing `extractTourStructuredValues` as fallback

## Next Steps
1. Add "Best Match" sort option
2. Add match score calculation hook
3. Add match badges to tour cards
4. Test with real user preferences
5. Wait for Full Access to get accurate tag data

