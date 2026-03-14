-- Family & Kids (NYC) – category page + 13 tours.
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
  'family-kids',
  'Family-friendly tours and activities in New York City: theme parks, farms, zoos, chocolate and ice cream classes, and kid-approved food tours.',
  'New York City is full of fun for families and kids. From American Dream waterparks and farm days to planetarium visits, zoos, chocolate-making, and donut and food tours, you can fill your trip with kid-approved experiences that adults enjoy too.',
  '["Check age and height requirements for rides and activities.","Bring swimwear and flip-flops for waterparks and splash areas.","Book popular weekend and holiday dates early—they sell out fast."]'::jsonb,
  '["Meet your guide or host at the designated location.","Enjoy hands-on activities, animal encounters, rides, or food tastings.","Most tours last 2–4 hours; full-day experiences include plenty of breaks for kids."]'::jsonb,
  '["Families visiting NYC with children of all ages.","Parents looking for kid-focused activities beyond standard sightseeing.","Grandparents and multi-generational groups who want easy, organized fun."]'::jsonb,
  '["American Dream theme and waterparks","Zoos, farms, and planetariums","Chocolate, ice cream, and donut tours the whole family will love"]'::jsonb,
  '[
    {"question":"Are these tours suitable for young children?","answer":"Many experiences welcome kids of all ages, but some have minimum age or height requirements. Always check the product details before booking."},
    {"question":"Do family tours in NYC include food?","answer":"Food-focused tours and classes include tastings, while other activities may not. Review the inclusions section to see what is covered."}
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


-- 2) Tours for Family & Kids
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
    'family-kids',
    '132218P241',
    'American Dream Full-Day Tour from NYC (Kids 50% Off)',
    'american-dream-full-day-tour-from-nyc-kids-50-off',
    1,
    TRUE
  ),
  (
    'new-york-city',
    'family-kids',
    '132218P407',
    'Long Island Farm and WildPlay Jones Beach Tour (Kids 50% Off)',
    'long-island-farm-and-wildplay-jones-beach-tour-kids-50-off',
    2,
    TRUE
  ),
  (
    'new-york-city',
    'family-kids',
    '132218P404',
    'Happy Farm Fun Day Tour from NY (Kids 50% Off)',
    'happy-farm-fun-day-tour-from-ny-kids-50-off',
    3,
    TRUE
  ),
  (
    'new-york-city',
    'family-kids',
    '132218P408',
    'Long Island Farm and Vanderbilt Planetarium Tour (Kids 50% Off)',
    'long-island-farm-and-vanderbilt-planetarium-tour-kids-50-off',
    4,
    TRUE
  ),
  (
    'new-york-city',
    'family-kids',
    '368349P510',
    'Private NYC Tour with Fun Activities for Families and Kids',
    'private-nyc-tour-with-fun-activities-for-families-and-kids',
    5,
    FALSE
  ),
  (
    'new-york-city',
    'family-kids',
    '224016P30',
    'Central Park Zoo and 3-Hour Manhattan Walking Tour',
    'central-park-zoo-and-3hrs-manhattan-walking-tour',
    6,
    FALSE
  ),
  (
    'new-york-city',
    'family-kids',
    '156679P1',
    'Bronx Zoo Admission Ticket',
    'bronx-zoo-admission-ticket',
    7,
    FALSE
  ),
  (
    'new-york-city',
    'family-kids',
    '74756P13',
    'Private Family Tour: Chocolate Pizza and City Fun',
    'private-family-tour-chocolate-pizza-and-city-fun',
    8,
    FALSE
  ),
  (
    'new-york-city',
    'family-kids',
    '77348P8',
    'American Dream One-Day Fun Day: DreamWorks Waterpark 4-in-1 Pass',
    'american-dream-one-day-fun-day-dreamworks-waterpark-4-in-1-pass',
    9,
    FALSE
  ),
  (
    'new-york-city',
    'family-kids',
    '378639P147',
    'Fun Ice Cream & Cocktail Making Class in Brooklyn',
    'fun-ice-cream-cocktail-making-class-in-brooklyn',
    10,
    FALSE
  ),
  (
    'new-york-city',
    'family-kids',
    '378639P148',
    'NYC Fun Boozy Sundae Making Class with Unlimited Tastings',
    'nyc-fun-boozy-sundae-making-class-with-unlimited-tastings',
    11,
    FALSE
  ),
  (
    'new-york-city',
    'family-kids',
    '150136P2',
    'Delicious Donuts of Brooklyn: Fun Food, History, and Culture Tour',
    'delicious-donuts-of-brooklyn-fun-food-history-and-culture-tour',
    12,
    FALSE
  ),
  (
    'new-york-city',
    'family-kids',
    '5713P118',
    'Brooklyn Food Walking Tour: Local Eats and Family-Run Shops',
    'brooklyn-food-walking-tour-local-eats-and-family-run-shops',
    13,
    FALSE
  )
ON CONFLICT (destination_slug, category_slug, tour_slug) DO UPDATE
SET
  title = EXCLUDED.title,
  product_id = EXCLUDED.product_id,
  position = EXCLUDED.position,
  is_top_pick = EXCLUDED.is_top_pick;

