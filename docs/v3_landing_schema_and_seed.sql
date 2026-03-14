-- TopTours 3.0 landing: tables + NYC seed with full SEO. Safe for new and existing DBs.
-- Run once in Supabase SQL editor. For existing tables, adds missing columns then upserts NYC.

-- 1) Create table with all columns (new DBs get full schema; existing tables are unchanged)
CREATE TABLE IF NOT EXISTS v3_landing_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  meta_title text,
  meta_description text,
  hero_title text,
  hero_subtitle text,
  hero_cta_text text DEFAULT 'Find tours',
  hero_badge text,
  og_image_url text,
  is_active boolean DEFAULT true,
  why_visit_text text,
  why_visit_bullets jsonb,
  what_to_expect_bullets jsonb,
  tips_bullets jsonb,
  faq_json jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Add SEO columns if they don't exist (for tables created before this script)
DO $$ BEGIN ALTER TABLE v3_landing_destinations ADD COLUMN hero_badge text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_destinations ADD COLUMN why_visit_text text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_destinations ADD COLUMN why_visit_bullets jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_destinations ADD COLUMN what_to_expect_bullets jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_destinations ADD COLUMN tips_bullets jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_destinations ADD COLUMN faq_json jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 3) NYC row with full SEO (hero + sections + FAQ)
INSERT INTO v3_landing_destinations (
  slug, name, meta_title, meta_description,
  hero_title, hero_subtitle, hero_cta_text, hero_badge, og_image_url,
  why_visit_text, why_visit_bullets, what_to_expect_bullets, tips_bullets, faq_json
)
VALUES (
  'new-york-city',
  'New York City',
  'Best New York City Tours & Excursions 2026 | NYC Activities & Things to Do',
  'Book the best tours and excursions in New York City. Central Park, Broadway, Statue of Liberty, food tours, harbor cruises & more. Compare prices and book with free cancellation.',
  'New York City Tours & Excursions: Top-Rated NYC Activities',
  'Book Central Park tours, Broadway shows, food tours, harbor cruises, and Statue of Liberty trips. Compare top-rated NYC excursions and reserve with free cancellation.',
  'See top NYC tours',
  'NYC Tours & Activities',
  'https://toptours.ai/OG%20Images/TopTours%20Destinations.jpg',
  'New York City is one of the world''s top destinations for tours and experiences. From iconic landmarks like the Statue of Liberty and Empire State Building to Central Park, Broadway, and neighborhood food tours, NYC offers a huge range of bookable activities for every interest and budget.',
  '["Central Park bike, walking, and carriage tours","Broadway shows and theater district experiences","Statue of Liberty & Ellis Island ferry and harbor cruises","Food and culture tours (Chelsea Market, Chinatown, Brooklyn)","Museum tours and passes (MET, MoMA, Natural History)","Helicopter tours and skyline views"]'::jsonb,
  '["Half-day and full-day tour options","Small-group and private experiences","Hotel pickup available on many tours","Free cancellation on most bookings","Instant confirmation and e-tickets","Expert local guides and operators"]'::jsonb,
  '["Book popular tours (Broadway, Statue of Liberty) at least a few days ahead","Spring and fall offer the best weather for walking and outdoor tours","Check tour inclusions (meals, entrance fees, pickup) before booking","Many tours run rain or shine; dress for the forecast"]'::jsonb,
  '[
    {"question": "What are the best tours to do in New York City?","answer": "Popular NYC tours include Central Park bike and carriage tours, Statue of Liberty and Ellis Island ferry trips, harbor cruises, Broadway show tickets, food tours in neighborhoods like Chelsea Market and Chinatown, and museum tours (MET, MoMA). Helicopter and walking tours are also top-rated."},
    {"question": "Can I cancel my New York City tour booking?","answer": "Many NYC tours on TopTours.ai offer free cancellation up to 24 or 48 hours before the start time. Check the specific tour page for the cancellation policy before you book."},
    {"question": "How far in advance should I book NYC tours?","answer": "For Broadway shows, Statue of Liberty, and popular food or helicopter tours, booking at least a few days to a week ahead is recommended, especially in peak season (spring and fall)."},
    {"question": "Are there family-friendly tours in New York City?","answer": "Yes. NYC has many family-friendly options including Central Park tours, harbor cruises, museum visits, and Broadway shows. Check age requirements on each tour page."}
  ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle,
  hero_cta_text = EXCLUDED.hero_cta_text,
  hero_badge = EXCLUDED.hero_badge,
  og_image_url = EXCLUDED.og_image_url,
  why_visit_text = EXCLUDED.why_visit_text,
  why_visit_bullets = EXCLUDED.why_visit_bullets,
  what_to_expect_bullets = EXCLUDED.what_to_expect_bullets,
  tips_bullets = EXCLUDED.tips_bullets,
  faq_json = EXCLUDED.faq_json,
  updated_at = now();

-- 4) Top picks and categories tables (if not exist)
CREATE TABLE IF NOT EXISTS v3_landing_top_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug text NOT NULL REFERENCES v3_landing_destinations(slug) ON DELETE CASCADE,
  product_id text NOT NULL,
  position smallint NOT NULL DEFAULT 1,
  title_override text,
  image_url_override text,
  from_price_override text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(destination_slug, position)
);
CREATE INDEX IF NOT EXISTS idx_v3_landing_top_picks_destination ON v3_landing_top_picks(destination_slug);

CREATE TABLE IF NOT EXISTS v3_landing_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug text NOT NULL REFERENCES v3_landing_destinations(slug) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  icon_name text,
  position smallint NOT NULL DEFAULT 1,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(destination_slug, slug)
);
CREATE INDEX IF NOT EXISTS idx_v3_landing_categories_destination ON v3_landing_categories(destination_slug);

-- 5) NYC top picks
INSERT INTO v3_landing_top_picks (destination_slug, product_id, position)
VALUES
  ('new-york-city', '3483P1', 1),
  ('new-york-city', '3721P1', 2),
  ('new-york-city', '26146P3', 3),
  ('new-york-city', '54570P16', 4),
  ('new-york-city', '38421P4', 5),
  ('new-york-city', '18421P4', 6)
ON CONFLICT (destination_slug, position) DO UPDATE SET product_id = EXCLUDED.product_id;

-- 6) NYC categories
INSERT INTO v3_landing_categories (destination_slug, slug, title, description, position)
VALUES
  ('new-york-city', 'central-park-tours', 'Central Park Tours', 'Bike, walk, and horse-drawn carriage tours in Central Park.', 1),
  ('new-york-city', 'broadway-shows', 'Broadway Shows', 'Musicals, plays, and theater district experiences.', 2),
  ('new-york-city', 'food-tours', 'Food & Culture Tours', 'Food tours, Chelsea Market, Chinatown, and neighborhood tastings.', 3),
  ('new-york-city', 'museum-tours', 'Museum Tours', 'MET, MoMA, Natural History, and museum passes.', 4),
  ('new-york-city', 'statue-of-liberty-harbor', 'Statue of Liberty & Harbor', 'Ferry, Ellis Island, harbor cruises, and skyline views.', 5),
  ('new-york-city', 'walking-neighborhoods', 'Walking & Neighborhoods', 'Downtown, Brooklyn, Harlem, and street art tours.', 6),
  ('new-york-city', 'night-skyline', 'Night & Skyline', 'Rooftop bars, night bus, helicopter, and sunset cruises.', 7),
  ('new-york-city', 'day-trips', 'Day Trips', 'Hamptons, Hudson Valley, Philadelphia, and Niagara.', 8),
  ('new-york-city', 'family-kids', 'Family & Kids', 'Kid-friendly tours, museums, and boat experiences.', 9),
  ('new-york-city', 'helicopter-views', 'Helicopter & Views', 'Helicopter tours and skyline experiences.', 10),
  ('new-york-city', 'cruises-water', 'Cruises & Water', 'Harbor cruises, sunset sails, and Circle Line.', 11),
  ('new-york-city', 'brooklyn-tours', 'Brooklyn Tours', 'DUMBO, Williamsburg, food, and street art in Brooklyn.', 12)
ON CONFLICT (destination_slug, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  updated_at = now();
