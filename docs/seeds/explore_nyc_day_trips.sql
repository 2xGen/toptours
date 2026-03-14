-- Day Trips (NYC) – category page + 13 tours.
-- Run in Supabase SQL editor. Requires v3_landing_* tables from main schema.

-- 1) Category page metadata
INSERT INTO v3_landing_category_pages (
  destination_slug,
  category_slug,
  hero_description,
  about,
  insider_tips,
  what_to_expect,
  who_is_this_for,
  highlights,
  faq_json
)
VALUES (
  'new-york-city',
  'day-trips',
  'Day trips from New York City to Washington, D.C., Niagara Falls, the Hamptons, Hudson Valley, Long Island wine country, and more. Compare options with transport included.',
  'Escape the city for a day with guided trips from NYC to Washington, D.C., Niagara Falls, the Hamptons, Hudson Valley, Long Island wine country, and nearby beaches. Most tours include roundtrip transportation, a guide, and free time to explore.',
  '["Bring a passport for cross-border Niagara tours when required.","Check whether meals are included or if you should budget extra for food.","Wear comfortable shoes—many day trips include walking tours at the destination."]'::jsonb,
  '["Early-morning departure from Manhattan (or New Jersey).","Comfortable coach, train, or helicopter ride to your destination.","Guided sightseeing, free time, and return to NYC in the evening."]'::jsonb,
  '["First-time visitors who want to see more than just Manhattan.","Couples, families, and small groups looking for curated day trips.","Travelers with limited time who still want to visit Washington, Niagara Falls, or wine country."]'::jsonb,
  '["Washington, D.C. highlights and monuments","Niagara Falls views and boat rides","Hamptons, Hudson Valley, and Long Island wine and food day trips"]'::jsonb,
  '[
    {"question":"How long do NYC day trips last?","answer":"Most day trips run 10–14 hours including travel time. Check each tour for exact departure and return times."},
    {"question":"Are meals included on day trips?","answer":"Some tours include breakfast, lunch, or tastings, while others leave meals at your own expense. Review the inclusions section before booking."}
  ]'::jsonb
)
ON CONFLICT (destination_slug, category_slug) DO UPDATE
SET
  hero_description = EXCLUDED.hero_description,
  about = EXCLUDED.about,
  insider_tips = EXCLUDED.insider_tips,
  what_to_expect = EXCLUDED.what_to_expect,
  who_is_this_for = EXCLUDED.who_is_this_for,
  highlights = EXCLUDED.highlights,
  faq_json = EXCLUDED.faq_json,
  updated_at = now();


-- 2) Tours for Day Trips
-- NOTE: positions 1–4 are treated as top picks on the category page.
INSERT INTO v3_landing_category_tours (
  destination_slug,
  category_slug,
  product_id,
  title,
  tour_slug,
  position,
  is_top_pick
)
VALUES
  (
    'new-york-city',
    'day-trips',
    '455017P6',
    'Washington DC Day Trip from Manhattan or New Jersey',
    'washington-dc-day-trip-from-manhattan-or-new-jersey',
    1,
    TRUE
  ),
  (
    'new-york-city',
    'day-trips',
    '132218P613',
    'NYC to Niagara Falls Day Trip with Optional Maid of the Mist Ride',
    'nyc-to-niagara-falls-day-trip-with-optional-maid-of-the-mist-ride',
    2,
    TRUE
  ),
  (
    'new-york-city',
    'day-trips',
    '455890P1',
    'NYC Sightseeing Day Trip with Statue of Liberty Visit',
    'nyc-sightseeing-day-trip-with-statue-of-liberty-visit',
    3,
    TRUE
  ),
  (
    'new-york-city',
    'day-trips',
    '132218P239',
    'Escape to the Nation''s Capital: Washington DC Day Trip from NYC',
    'escape-to-the-nations-capital-washington-dc-day-trip-from-nyc',
    4,
    TRUE
  ),
  (
    'new-york-city',
    'day-trips',
    '30688P2',
    'Woodbury Common Premium Outlet Shopping Private Day Trip by Limousine from NYC',
    'woodbury-common-premium-outlet-shopping-private-day-trip-by-limousine-from-nyc',
    5,
    FALSE
  ),
  (
    'new-york-city',
    'day-trips',
    '5608336P18',
    'Niagara Falls Day Trip',
    'niagara-falls-day-trip',
    6,
    FALSE
  ),
  (
    'new-york-city',
    'day-trips',
    '7030P27',
    'Niagara Falls Day Trip from Manhattan by Helicopter',
    'niagara-falls-day-trip-from-manhattan-by-helicopter',
    7,
    FALSE
  ),
  (
    'new-york-city',
    'day-trips',
    '221092P3',
    'Day Trip to Washington from New York',
    'day-trip-to-washington-from-new-york',
    8,
    FALSE
  ),
  (
    'new-york-city',
    'day-trips',
    '7908P21',
    'Hamptons Private Day Trip from New York City',
    'hamptons-private-day-trip-from-new-york-city',
    9,
    FALSE
  ),
  (
    'new-york-city',
    'day-trips',
    '64276P2',
    'Hudson Valley Wine and Food Day Trip with Sommelier Host from NYC',
    'hudson-valley-wine-and-food-day-trip-with-sommelier-host-from-nyc',
    10,
    FALSE
  ),
  (
    'new-york-city',
    'day-trips',
    '64276P1',
    'Long Island Wine and Food Day Trip with Sommelier Host from NYC',
    'long-island-wine-and-food-day-trip-with-sommelier-host-from-nyc',
    11,
    FALSE
  ),
  (
    'new-york-city',
    'day-trips',
    '5628293P1',
    'City by the Sea: NYC Day Trip to Long Beach',
    'city-by-the-sea-nyc-day-trip-to-long-beach',
    12,
    FALSE
  ),
  (
    'new-york-city',
    'day-trips',
    '414190P2',
    'Pocono Paintball Day Trip from NYC',
    'pocono-paintball-day-trip-from-nyc',
    13,
    FALSE
  )
ON CONFLICT (destination_slug, category_slug, tour_slug) DO UPDATE
SET
  title = EXCLUDED.title,
  product_id = EXCLUDED.product_id,
  position = EXCLUDED.position,
  is_top_pick = EXCLUDED.is_top_pick;

