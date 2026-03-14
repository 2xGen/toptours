-- Cruises & Water (NYC) – category page + 13 tours.
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
  'cruises-water',
  'Cruises and water experiences in New York City: sightseeing, architecture yachts, sunset sails, dinner cruises, and holiday jazz or cocoa cruises.',
  'See New York City from the water with sightseeing cruises, architecture yacht tours, sunset schooners, live jazz sailings, and upscale dinner cruises. Sail past the Statue of Liberty, Brooklyn Bridge, and the Manhattan skyline by day or night, with drinks, music, or seasonal holiday themes.',
  '["Arrive early for boarding and bring a light jacket for cooler evenings on the water.","Check whether food and drinks are included or available for purchase.","For holiday and dinner cruises, book ahead—prime dates and times sell out."]'::jsonb,
  '["Board your boat or yacht at the designated pier.","Cruise past NYC landmarks with live or recorded commentary, music, or entertainment.","Most cruises last 1–3 hours; dinner and holiday sailings can run longer."]'::jsonb,
  '["Couples and friends looking for a scenic or romantic experience.","Families who want relaxed sightseeing without too much walking.","Visitors who want skyline views, photos, and live entertainment on the water."]'::jsonb,
  '["Iconic landmark and skyline cruises","Architecture yachts and sunset schooner sails","Dinner, jazz, and seasonal holiday cocoa cruises"]'::jsonb,
  '[
    {"question":"Do NYC cruises operate in all seasons?","answer":"Yes, many cruises operate year-round, with enclosed and heated indoor areas in colder months. Some seasonal sailings are only offered in summer or during the holidays."},
    {"question":"Is food included on New York City cruises?","answer":"Sightseeing and sunset cruises may offer snacks or drinks for purchase, while dinner and brunch cruises include full meals. Check the inclusions section for details."}
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


-- 2) Tours for Cruises & Water
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
    'cruises-water',
    '5594369P4',
    'NYC Iconic Landmarks Cruise and Tour',
    'nyc-iconic-landmarks-cruise-and-tour',
    1,
    TRUE
  ),
  (
    'new-york-city',
    'cruises-water',
    '6288P29',
    'New York City Sunset or Daytime Sightseeing Cruise',
    'new-york-city-sunset-or-daytime-sightseeing-cruise',
    2,
    TRUE
  ),
  (
    'new-york-city',
    'cruises-water',
    '6288P7',
    'Manhattan Architecture Yacht Cruise',
    'manhattan-architecture-yacht-cruise',
    3,
    TRUE
  ),
  (
    'new-york-city',
    'cruises-water',
    '6288P32',
    'New York Afternoon Fall Foliage Cruise with Lunch',
    'new-york-afternoon-fall-foliage-cruise-with-lunch',
    4,
    TRUE
  ),
  (
    'new-york-city',
    'cruises-water',
    '6288P21',
    'New York Sunset Schooner Cruise on the Hudson River',
    'new-york-sunset-schooner-cruise-on-the-hudson-river',
    5,
    FALSE
  ),
  (
    'new-york-city',
    'cruises-water',
    '6288P16',
    'New York Harbor Live Holiday Jazz Cruise',
    'new-york-harbor-live-holiday-jazz-cruise',
    6,
    FALSE
  ),
  (
    'new-york-city',
    'cruises-water',
    '6288P18',
    'Manhattan Evening Jazz Cruise',
    'manhattan-evening-jazz-cruise',
    7,
    FALSE
  ),
  (
    'new-york-city',
    'cruises-water',
    '6288P41',
    'New York City Holiday Sunset Sightseeing Cruise',
    'new-york-city-holiday-sunset-sightseeing-cruise',
    8,
    FALSE
  ),
  (
    'new-york-city',
    'cruises-water',
    '5042NYCBAT',
    'City Cruises New York Bateaux Premier Dinner Cruise',
    'city-cruises-new-york-bateaux-premier-dinner-cruise',
    9,
    FALSE
  ),
  (
    'new-york-city',
    'cruises-water',
    '418361P16',
    'NYC Sunset Cruise with DJ, Skyline, and Statue of Liberty',
    'nyc-sunset-cruise-with-dj-skyline-and-statue-of-liberty',
    10,
    FALSE
  ),
  (
    'new-york-city',
    'cruises-water',
    '12214P32',
    'City Lights Cruise: Experience the Skyline in Sparkling Lights',
    'city-lights-cruise-experience-the-skyline-in-sparkling-lights',
    11,
    FALSE
  ),
  (
    'new-york-city',
    'cruises-water',
    '5572251P5',
    'New York City Blue Booze Cruise Experience',
    'new-york-city-blue-booze-cruise-experience',
    12,
    FALSE
  ),
  (
    'new-york-city',
    'cruises-water',
    '12214P29',
    'Holiday Brunch with Cocoa Cruise in New York City',
    'holiday-brunch-with-cocoa-cruise-in-new-york-city',
    13,
    FALSE
  )
ON CONFLICT (destination_slug, category_slug, tour_slug) DO UPDATE
SET
  title = EXCLUDED.title,
  product_id = EXCLUDED.product_id,
  position = EXCLUDED.position,
  is_top_pick = EXCLUDED.is_top_pick;

