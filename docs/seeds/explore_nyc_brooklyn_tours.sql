-- Brooklyn Tours (NYC) – category page + 13 tours.
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
  'brooklyn-tours',
  'Brooklyn tours: DUMBO, Brooklyn Bridge, street art, food, distilleries, Coney Island, and neighborhood walks. Book with a local or join a group.',
  'Explore Brooklyn with guided tours across DUMBO and the Brooklyn Bridge, street art and graffiti safaris, literary pub crawls, hip-hop history walks, food tours in Brooklyn Heights, distillery and brewery tours, and private visits to Coney Island or sailing charters.',
  '["Wear comfortable shoes—Brooklyn tours involve walking.","DUMBO and bridge views are popular; book ahead for weekends.","Check if food or tastings are included or at your own expense."]'::jsonb,
  '["Meet your guide at the designated Brooklyn meeting point.","Walk or ride through neighborhoods with stories, tastings, or photo stops.","Most tours run 2–4 hours; private and food tours may vary."]'::jsonb,
  '["First-time visitors who want to see more than Manhattan.","Street art and culture enthusiasts.","Food and drink lovers interested in Brooklyn neighborhoods and local spots."]'::jsonb,
  '["Brooklyn Bridge, DUMBO, and Brooklyn Heights","Street art, graffiti workshops, and photo safaris","Food tours, distilleries, breweries, and Coney Island"]'::jsonb,
  '[
    {"question":"How long do Brooklyn tours last?","answer":"Most run 2–4 hours. Private and full-day experiences may be longer. Check each product for exact duration."},
    {"question":"Do Brooklyn tours include food or drinks?","answer":"Some tours include tastings, a meal, or drinks; others are walking-only. See the inclusions section before booking."}
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


-- 2) Tours for Brooklyn Tours
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
    'brooklyn-tours',
    '345485P1',
    'Private Brooklyn Bridge Tour with a Local',
    'private-brooklyn-bridge-tour-with-a-local',
    1,
    TRUE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '5527066P4',
    'The Brooklyn Bridge Heights DUMBO Tour',
    'the-brooklyn-bridge-heights-dumbo-tour',
    2,
    TRUE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '5568544P6',
    'Brooklyn Distillery Tour',
    'brooklyn-distillery-tour',
    3,
    TRUE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '5527280P3',
    'New York: The Best of Brooklyn',
    'new-york-the-best-of-brooklyn',
    4,
    TRUE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '14783P2',
    'Brooklyn Literary Pub Crawl',
    'brooklyn-literary-pub-crawl',
    5,
    FALSE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '3368P6',
    'Brooklyn Hip-Hop Walking Tour: Where Brooklyn At',
    'brooklyn-hip-hop-walking-tour-where-brooklyn-at',
    6,
    FALSE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '92326P1',
    'Humorville: An Immersive Experience in Brooklyn',
    'humorville-an-immersive-experience-in-brooklyn',
    7,
    FALSE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '313422P7',
    'Private Visit to Coney Island, Brooklyn',
    'private-visit-to-coney-island-brooklyn',
    8,
    FALSE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '5537P14',
    'Brooklyn Graffiti Photo Safari',
    'brooklyn-grafitti-photo-safari',
    9,
    FALSE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '8501P18',
    'Private Brooklyn Heights, Brooklyn Bridge and DUMBO Food Tour',
    'private-brooklyn-heights-brooklyn-bridge-and-dumbo-food-tour',
    10,
    FALSE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '428616P1',
    'Private Sailing Charter in Brooklyn',
    'private-sailing-charter-in-brooklyn',
    11,
    FALSE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '7918P4',
    'Brooklyn Graffiti Workshop',
    'brooklyn-graffiti-workshop',
    12,
    FALSE
  ),
  (
    'new-york-city',
    'brooklyn-tours',
    '75738P6',
    'Underground Brooklyn Walking Brewery Tour',
    'underground-brooklyn-walking-brewery-tour',
    13,
    FALSE
  )
ON CONFLICT (destination_slug, category_slug, tour_slug) DO UPDATE
SET
  title = EXCLUDED.title,
  product_id = EXCLUDED.product_id,
  position = EXCLUDED.position,
  is_top_pick = EXCLUDED.is_top_pick;
