# NYC Explore Subcategories (6 per category, 2–3 tours each)

Each of the 12 NYC categories has **6 subcategory pages**, and each subcategory has **at least 2 and at most 3 tours** (no single-tour subcategories).

## New subcategory seeds (run after the main category seed)

Run these in the Supabase SQL editor **after** the corresponding category seed (e.g. after `explore_nyc_day_trips.sql` for day trips):

| File | Category | Subcategories |
|------|----------|---------------|
| `explore_nyc_subcategories_day_trips.sql` | Day Trips | Washington DC, Niagara Falls, NYC area sightseeing, Shopping & wine, Beaches & activity, Other day trips |
| `explore_nyc_subcategories_family_kids.sql` | Family & Kids | American Dream & theme parks, Farms & planetarium, Zoos & wildlife, Private family tours, Food & treats classes, Brooklyn family food |
| `explore_nyc_subcategories_helicopter_views.sql` | Helicopter & Views | Romantic & proposal, Classic Manhattan, Manhattan Brooklyn & skyline, Night flights, Airport & Niagara, Big Apple & deluxe |
| `explore_nyc_subcategories_cruises_water.sql` | Cruises & Water | Sightseeing & landmarks, Architecture yacht, Schooner & sunset, Jazz & holiday, Dinner & brunch, City lights & party |
| `explore_nyc_subcategories_brooklyn_tours.sql` | Brooklyn Tours | Brooklyn Bridge & DUMBO, Best of Brooklyn, Culture & history walks, Coney Island & sailing, Street art & graffiti, Brooklyn brewery & food |

## Fixes for existing categories (1-tour subcategories)

Run **once** after the main schema/seed:

- **`explore_nyc_subcategories_fixes.sql`**  
  - Broadway: food-and-drink and museum-of-broadway each get 2 tours.  
  - Food: chelsea-market, chinatown, east-village each 2.  
  - Statue of Liberty: day-trips-sightseeing 2 tours.  
  - Night & Skyline: night-sailboat-cruise 2 tours.  
  - Central Park: running and yoga merged into one subcategory “running-and-yoga” (3 tours); family-tours and yoga-in-central-park removed so the category has 6 subcategories with 2–3 tours each.

## Order to run

1. Main schema and NYC category seeds (category page + 13 tours) as you already have.
2. **Fixes:** `explore_nyc_subcategories_fixes.sql`
3. **New subcategories:**  
   `explore_nyc_subcategories_day_trips.sql`  
   `explore_nyc_subcategories_family_kids.sql`  
   `explore_nyc_subcategories_helicopter_views.sql`  
   `explore_nyc_subcategories_cruises_water.sql`  
   `explore_nyc_subcategories_brooklyn_tours.sql`

Icons for the new subcategory slugs are already added in `ExploreCategoryClient.jsx` (SUBCATEGORY_ICONS and CATEGORY_ICONS for day-trips, family-kids, helicopter-views, cruises-water, brooklyn-tours).
