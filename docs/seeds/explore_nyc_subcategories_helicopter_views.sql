-- Helicopter & Views (NYC) – 6 subcategories, each with 2 or 3 tours.
-- Run after explore_nyc_helicopter_views.sql. Requires v3_landing_category_subcategories.

INSERT INTO v3_landing_category_subcategories (destination_slug, category_slug, slug, title, description, product_ids, about, faq_json, position, why_book, what_to_expect, summary_paragraph)
VALUES
  ('new-york-city', 'helicopter-views', 'romantic-proposal', 'Romantic & proposal flights', 'NYC helicopter proposal tour, engagement experience to Glenmere Mansion, private romantic charter with champagne. Compare and book.', '["7030P26","7030P20","7030PRIHELI"]'::jsonb, 'Romantic and proposal helicopter experiences: photos and champagne, engagement flights, private scenic charters.', '[]'::jsonb, 1, null, '["Check-in at heliport.","Scenic flight; proposal or romantic experience.","Duration varies; champagne often included."]'::jsonb, 'Compare romantic and proposal helicopter tours in NYC.'),
  ('new-york-city', 'helicopter-views', 'classic-manhattan', 'Classic Manhattan helicopter tours', 'Manhattan highlights and Ultimate NYC sightseeing helicopter tours. Compare and book.', '["18421P1","18421P2"]'::jsonb, 'Classic daytime helicopter tours over Manhattan: highlights, ultimate sightseeing, and deluxe options.', '[]'::jsonb, 2, null, '["Check-in; safety briefing.","Scenic flight over Manhattan.","Typically 15–30 minutes."]'::jsonb, 'Compare classic Manhattan helicopter tours.'),
  ('new-york-city', 'helicopter-views', 'manhattan-brooklyn-skyline', 'Manhattan, Brooklyn & skyline', 'Manhattan and Brooklyn helicopter tour; NYC skyline from New Jersey. Compare and book.', '["18421P3","18421P4"]'::jsonb, 'Helicopter tours covering Manhattan and Brooklyn or departing from New Jersey for skyline views.', '[]'::jsonb, 3, null, '["Depart from Manhattan or NJ.","Flight over Manhattan and/or Brooklyn.","Duration varies."]'::jsonb, 'Compare Manhattan, Brooklyn, and skyline helicopter tours.'),
  ('new-york-city', 'helicopter-views', 'night-flights', 'Night helicopter tours', 'New York City night lights from New Jersey; Manhattan scenic night tour. Compare and book.', '["2770P13","5024NIGHT"]'::jsonb, 'Night helicopter tours: city lights, Manhattan at night, and Big Apple experiences.', '[]'::jsonb, 4, null, '["Evening check-in.","Night flight over NYC.","Sparkling skyline views."]'::jsonb, 'Compare night helicopter tours over NYC.'),
  ('new-york-city', 'helicopter-views', 'airport-niagara', 'Airport transfer & Niagara helicopter', 'Helicopter airport transfer with scenic tour; Niagara Falls day trip by helicopter from Manhattan. Compare and book.', '["7030P10","7030P27"]'::jsonb, 'Airport transfer with scenic flight, or full-day Niagara Falls by helicopter from Manhattan.', '[]'::jsonb, 5, null, '["Airport: transfer with sightseeing.","Niagara: full-day trip by helicopter.","Premium experiences."]'::jsonb, 'Compare helicopter airport transfers and Niagara Falls helicopter day trips.'),
  ('new-york-city', 'helicopter-views', 'big-apple-deluxe', 'Big Apple & deluxe helicopter tours', 'The Big Apple and Deluxe Manhattan helicopter tours. Classic skyline flights. Compare and book.', '["2770NYNY","167148P2"]'::jsonb, 'The Big Apple and Deluxe Manhattan helicopter tours—classic NYC skyline experiences.', '[]'::jsonb, 6, null, '["Check-in; flight over NYC.","Classic Big Apple and deluxe views."]'::jsonb, 'Compare the Big Apple and Deluxe Manhattan helicopter tours.')
ON CONFLICT (destination_slug, category_slug, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  product_ids = EXCLUDED.product_ids,
  about = EXCLUDED.about,
  faq_json = EXCLUDED.faq_json,
  position = EXCLUDED.position,
  why_book = EXCLUDED.why_book,
  what_to_expect = EXCLUDED.what_to_expect,
  summary_paragraph = EXCLUDED.summary_paragraph,
  updated_at = now();
