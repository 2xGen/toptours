-- Run this after v3_landing_schema_and_seed.sql to add SEO sections and NYC content.
-- Adds: hero_badge, why_visit_text, why_visit_bullets, what_to_expect_bullets, tips_bullets, faq_json.

-- Add columns (ignore if already exist)
DO $$
BEGIN
  ALTER TABLE v3_landing_destinations ADD COLUMN hero_badge text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE v3_landing_destinations ADD COLUMN why_visit_text text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE v3_landing_destinations ADD COLUMN why_visit_bullets jsonb;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE v3_landing_destinations ADD COLUMN what_to_expect_bullets jsonb;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE v3_landing_destinations ADD COLUMN tips_bullets jsonb;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE v3_landing_destinations ADD COLUMN faq_json jsonb;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- SEO-rich hero + section content for NYC
UPDATE v3_landing_destinations
SET
  meta_title = 'Best New York City Tours & Excursions 2026 | NYC Activities & Things to Do',
  meta_description = 'Book the best tours and excursions in New York City. Central Park, Broadway, Statue of Liberty, food tours, harbor cruises & more. Compare prices and book with free cancellation.',
  hero_badge = 'NYC Tours & Activities',
  hero_title = 'New York City Tours & Excursions: Top-Rated NYC Activities',
  hero_subtitle = 'Book Central Park tours, Broadway shows, food tours, harbor cruises, and Statue of Liberty trips. Compare top-rated NYC excursions and reserve with free cancellation.',
  hero_cta_text = 'See top NYC tours',
  why_visit_text = 'New York City is one of the world’s top destinations for tours and experiences. From iconic landmarks like the Statue of Liberty and Empire State Building to Central Park, Broadway, and neighborhood food tours, NYC offers a huge range of bookable activities for every interest and budget.',
  why_visit_bullets = '["Central Park bike, walking, and carriage tours","Broadway shows and theater district experiences","Statue of Liberty & Ellis Island ferry and harbor cruises","Food and culture tours (Chelsea Market, Chinatown, Brooklyn)","Museum tours and passes (MET, MoMA, Natural History)","Helicopter tours and skyline views"]'::jsonb,
  what_to_expect_bullets = '["Half-day and full-day tour options","Small-group and private experiences","Hotel pickup available on many tours","Free cancellation on most bookings","Instant confirmation and e-tickets","Expert local guides and operators"]'::jsonb,
  tips_bullets = '["Book popular tours (Broadway, Statue of Liberty) at least a few days ahead","Spring and fall offer the best weather for walking and outdoor tours","Check tour inclusions (meals, entrance fees, pickup) before booking","Many tours run rain or shine; dress for the forecast"]'::jsonb,
  faq_json = '[
    {"question": "What are the best tours to do in New York City?","answer": "Popular NYC tours include Central Park bike and carriage tours, Statue of Liberty and Ellis Island ferry trips, harbor cruises, Broadway show tickets, food tours in neighborhoods like Chelsea Market and Chinatown, and museum tours (MET, MoMA). Helicopter and walking tours are also top-rated."},
    {"question": "Can I cancel my New York City tour booking?","answer": "Many NYC tours on TopTours.ai offer free cancellation up to 24 or 48 hours before the start time. Check the specific tour page for the cancellation policy before you book."},
    {"question": "How far in advance should I book NYC tours?","answer": "For Broadway shows, Statue of Liberty, and popular food or helicopter tours, booking at least a few days to a week ahead is recommended, especially in peak season (spring and fall)."},
    {"question": "Are there family-friendly tours in New York City?","answer": "Yes. NYC has many family-friendly options including Central Park tours, harbor cruises, museum visits, and Broadway shows. Check age requirements on each tour page."}
  ]'::jsonb,
  updated_at = now()
WHERE slug = 'new-york-city';
