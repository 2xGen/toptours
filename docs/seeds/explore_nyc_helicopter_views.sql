-- Helicopter & Views (NYC) – category page + 13 tours.
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
  'helicopter-views',
  'Helicopter tours and skyline views in New York City, from romantic proposals and private charters to classic daytime and night flights.',
  'See New York City from above with helicopter tours that fly past the Statue of Liberty, Empire State Building, Brooklyn Bridge, and the Manhattan skyline. Choose from proposal and engagement flights, private scenic charters, and classic daytime or night tours departing from Manhattan or New Jersey.',
  '["Arrive at the heliport early for check-in and safety briefing.","Bring a valid photo ID—required for all passengers.","Check weight limits and luggage restrictions before booking."]'::jsonb,
  '["Check in at the heliport and complete a short safety briefing.","Board the helicopter and enjoy a 12–30 minute flight over NYC landmarks.","Many flights include in-flight commentary and photo opportunities."]'::jsonb,
  '["Couples looking for a romantic or proposal experience.","First-time visitors who want a bucket-list NYC view.","Photographers and skyline lovers who want aerial perspectives."]'::jsonb,
  '["Romantic and proposal flights","Classic Manhattan and Brooklyn helicopter tours","Nighttime skyline and private scenic charters"]'::jsonb,
  '[
    {"question":"Do helicopter tours operate year-round in NYC?","answer":"Yes, most operators fly year-round, weather permitting. Flights may be rescheduled in case of poor weather or visibility."},
    {"question":"Is there a weight limit for helicopter tours?","answer":"Yes, each operator has specific weight limits per passenger and per helicopter. Check the product details and contact the operator if you are unsure."}
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


-- 2) Tours for Helicopter & Views
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
    'helicopter-views',
    '7030P26',
    'NYC Helicopter Proposal Tour with Photos and Champagne',
    'nyc-helicopter-proposal-tour-with-photos-and-champagne',
    1,
    FALSE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '7030P10',
    'New York Helicopter Airport Transfer with Scenic Tour',
    'new-york-helicopter-airport-transfer-with-scenic-tour',
    2,
    FALSE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '7030P27',
    'Niagara Falls Day Trip from Manhattan by Helicopter',
    'niagara-falls-day-trip-from-manhattan-by-helicopter',
    3,
    FALSE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '7030P20',
    'Helicopter Engagement Experience from NYC to Glenmere Mansion',
    'helicopter-engagement-experience-from-nyc-to-glenmere-mansion',
    4,
    FALSE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '2770P13',
    'New York City Night Lights Helicopter Tour from New Jersey',
    'new-york-city-night-lights-helicopter-tour-from-new-jersey',
    5,
    TRUE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '18421P3',
    'NY Helicopter Tour: Manhattan and Brooklyn',
    'ny-helicopter-tour-manhattan-and-brooklyn',
    6,
    FALSE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '18421P1',
    'NY Helicopter Tour: Manhattan Highlights',
    'ny-helicopter-tour-manhattan-highlights',
    7,
    TRUE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '18421P2',
    'NY Helicopter Tour: Ultimate NYC Sightseeing',
    'ny-helicopter-tour-ultimate-nyc-sightseeing',
    8,
    TRUE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '18421P4',
    'NY Helicopter Tour: New York City Skyline from New Jersey',
    'ny-helicopter-tour-new-york-city-skyline-from-new-jersey',
    9,
    FALSE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '5024NIGHT',
    'New York Manhattan Scenic Helicopter Tour (Night)',
    'new-york-manhattan-scenic-helicopter-tour',
    10,
    TRUE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '167148P2',
    'Deluxe Manhattan Helicopter Tour',
    'deluxe-manhattan-helicopter-tour',
    11,
    FALSE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '2770NYNY',
    'The Big Apple Helicopter Tour of New York City',
    'the-big-apple-helicopter-tour-of-new-york-city',
    12,
    FALSE
  ),
  (
    'new-york-city',
    'helicopter-views',
    '7030PRIHELI',
    'Private Romantic NYC Helicopter Scenic Charter with Champagne',
    'private-romantic-nyc-helicopter-scenic-charter-with-champagne',
    13,
    FALSE
  )
ON CONFLICT (destination_slug, category_slug, tour_slug) DO UPDATE
SET
  title = EXCLUDED.title,
  product_id = EXCLUDED.product_id,
  position = EXCLUDED.position,
  is_top_pick = EXCLUDED.is_top_pick;

