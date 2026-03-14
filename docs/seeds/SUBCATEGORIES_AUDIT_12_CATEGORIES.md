# NYC: 12 categories × 6 subcategories audit

All 12 NYC explore categories have **6 subcategories each** after seeds and fixes are applied.

| # | Category | Source | Subcategory slugs (6) |
|---|----------|--------|------------------------|
| 1 | **central-park-tours** | Main schema + **fixes** | bike-tours, walking-tours, carriage-tours, secret-places, picnic-experiences, **running-and-yoga** *(fixes: merge running+yoga; delete family-tours, yoga-in-central-park)* |
| 2 | **broadway-shows** | Main schema + **fixes** | show-tickets, broadway-musicals, walking-tours, private-tours, food-and-drink-tours, museum-of-broadway |
| 3 | **food-tours** | Main schema + **fixes** | chinatown-asian-food, greenwich-village-food, chelsea-market-high-line, williamsburg-brooklyn-food, east-village-nolita, private-astoria-flatiron |
| 4 | **museum-tours** | Main schema | moma-modern-art, met-guided-highlights, met-themed-tours, met-private-special, 911-memorial, intrepid-unique-museums |
| 5 | **statue-of-liberty-harbor** | Seed + **fixes** | ferry-ellis-island, ellis-island-guided, sailing-sunset-cruises, harbor-skyline-cruises, private-tours, day-trips-sightseeing |
| 6 | **walking-neighborhoods** | Seed | greenwich-village-walks, downtown-tribeca, brooklyn-bridge-walks, central-park-walking, private-themed-walks, 42nd-street-williamsburg |
| 7 | **night-skyline** | Seed + **fixes** | dumbo-skyline-night, night-sailboat-cruise, private-night-tours, brooklyn-bridge-night, night-bus-tours, village-nights-speakeasy |
| 8 | **day-trips** | Subcategory seed | washington-dc, niagara-falls, nyc-area-sightseeing, shopping-wine, beaches-activity, other-day-trips |
| 9 | **family-kids** | Subcategory seed | american-dream-theme-parks, farms-planetarium, zoos-wildlife, private-family-tours, food-treats-classes, brooklyn-family-food |
| 10 | **helicopter-views** | Subcategory seed | romantic-proposal, classic-manhattan, manhattan-brooklyn-skyline, night-flights, airport-niagara, big-apple-deluxe |
| 11 | **cruises-water** | Subcategory seed | sightseeing-landmarks, architecture-yacht, schooner-sunset, jazz-holiday-cruises, dinner-brunch-cruises, city-lights-party |
| 12 | **brooklyn-tours** | Subcategory seed | brooklyn-bridge-dumbo, best-of-brooklyn, culture-history-walks, coney-island-sailing, street-art-graffiti, brooklyn-brewery-food |

## Notes

- **Central Park:** Main schema inserts 8 subcategories; `explore_nyc_subcategories_fixes.sql` updates `running-tours` → `running-and-yoga` (3 tours) and **deletes** `family-tours` and `yoga-in-central-park`, so the category has **6** subcategories.
- **Broadway, Food, Statue of Liberty, Night:** Fixes only update `product_ids` (and some titles/descriptions) so every subcategory has 2–3 tours; subcategory **count stays 6**.
- **Day trips, Family, Helicopter, Cruises, Brooklyn:** Subcategory seeds each insert exactly **6** rows.

**Run order:** Main schema/seed → `explore_nyc_subcategories_fixes.sql` → then each `explore_nyc_subcategories_*.sql` for the 5 categories that have separate subcategory seeds.
