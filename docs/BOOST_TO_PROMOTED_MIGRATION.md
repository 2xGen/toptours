# Boost System to Promoted Listings Migration

## Overview
Removing community boost system and replacing with B2B promoted listings ($29/month or $299/year).

## Status: In Progress

### ✅ Completed
1. Created `promoted_listings` database table schema
2. Created `src/lib/promotedListings.js` with utility functions
3. Updated `app/destinations/[id]/tours/page.js` to fetch promoted listings
4. Updated props in ToursListingClient to accept promoted listings

### 🔄 In Progress
5. Replace "Trending Now" section with "Promoted Listings" in ToursListingClient
6. Update restaurants listing page similarly
7. Remove boost buttons from cards and detail pages
8. Update profile page
9. Remove navigation pages (/leaderboard, /plans, /how-it-works)
10. Update homepage
11. Update /partners page

### 📋 Remaining Tasks
- [ ] Replace "Trending Now" section with "Promoted Listings" (above grid)
- [ ] Update restaurants listing page
- [ ] Remove boost buttons from tour cards
- [ ] Remove boost buttons from restaurant cards
- [ ] Remove boost buttons from detail pages
- [ ] Update profile page (remove daily streaks, boost points)
- [ ] Update homepage (remove boost CTAs)
- [ ] Update /partners page
- [ ] Remove /leaderboard page + redirect
- [ ] Remove /plans page + redirect
- [ ] Update /how-it-works or remove + redirect
- [ ] Update navigation component
- [ ] Create "For Operators" page
- [ ] Update sitemap
- [ ] Archive promotion tables

## Key Changes

### Database
- ✅ New table: `promoted_listings`
- ⏳ Archive: `tour_promotions`, `restaurant_promotions`, `promotion_accounts`, `promotion_transactions`

### Components
- ⏳ ToursListingClient: Replace trending section
- ⏳ RestaurantsListClient: Replace trending section
- ⏳ TourCard: Remove boost button
- ⏳ RestaurantCard: Remove boost button
- ⏳ TourDetailClient: Remove boost button
- ⏳ RestaurantDetailClient: Remove boost button

### Pages
- ⏳ Profile page: Remove boost-related sections
- ⏳ Homepage: Update CTAs
- ⏳ /partners: Update content
- ⏳ /leaderboard: Remove + redirect
- ⏳ /plans: Remove + redirect
- ⏳ /how-it-works: Update or remove + redirect
- ⏳ New: /for-operators (B2B landing page)

### Navigation
- ⏳ Remove: Plans, Leaderboard, How It Works
- ⏳ Add: For Operators

