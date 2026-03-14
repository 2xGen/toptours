-- Statue of Liberty & Harbor (NYC) – category page, 13 tours, 6 subcategories.
-- Run in Supabase SQL editor. Requires v3_landing_category_pages, v3_landing_category_tours,
-- and v3_landing_category_subcategories to exist (from v3_landing_category_pages_schema_and_seed.sql).

-- Category page
INSERT INTO v3_landing_category_pages (destination_slug, category_slug, hero_description, about, insider_tips, what_to_expect, who_is_this_for, highlights, faq_json)
VALUES (
  'new-york-city',
  'statue-of-liberty-harbor',
  'Statue of Liberty, Ellis Island, and NYC harbor cruises. Official ferry tickets, guided tours, sunset sails, and skyline cruises. Compare and book with trusted partners.',
  'Options include the official Statue of Liberty and Ellis Island ferry, guided Ellis Island and immigration museum tours, private sailing and sunset cruises, harbor and skyline cruises, and NYC day trips that include the statue. Book ferry and crown access in advance in peak season.',
  '["Book official ferry and crown access well ahead in peak season.","Sunset and evening cruises offer great skyline views.","Guided tours help with Ellis Island and immigration museum context."]'::jsonb,
  '["For ferry: arrive at departure point; board with your ticket.","For cruises: check-in at the pier; cruise duration varies.","For guided tours: meet your guide; tour includes ferry and sites."]'::jsonb,
  '["First-time visitors to the statue and Ellis Island.","Families and groups.","Anyone who wants a harbor or sunset cruise with statue views."]'::jsonb,
  '["Official ferry, Ellis Island, guided tours","Sunset and sailing cruises","Harbor and skyline cruises","Private options"]'::jsonb,
  '[{"question": "How do I get to the Statue of Liberty?","answer": "The official ferry departs from Battery Park (NYC) and Liberty State Park (NJ). Book tickets in advance; crown and pedestal access have limited availability."},{"question": "Are harbor cruises good for seeing the statue?","answer": "Yes. Many harbor and sunset cruises pass the statue and offer skyline views. Some include narration or DJ; check the product for details."}]'::jsonb
)
ON CONFLICT (destination_slug, category_slug) DO UPDATE SET
  hero_description = EXCLUDED.hero_description,
  about = EXCLUDED.about,
  insider_tips = EXCLUDED.insider_tips,
  what_to_expect = EXCLUDED.what_to_expect,
  who_is_this_for = EXCLUDED.who_is_this_for,
  highlights = EXCLUDED.highlights,
  faq_json = EXCLUDED.faq_json,
  updated_at = now();

-- 13 tours (first 4 = top picks)
INSERT INTO v3_landing_category_tours (destination_slug, category_slug, product_id, title, tour_slug, image_url, from_price, position, is_top_pick)
VALUES
  ('new-york-city', 'statue-of-liberty-harbor', '49200P4', 'NYC Statue City Cruises Official Statue of Liberty Ticket', 'nyc-statue-city-cruises-official-statue-of-liberty-ticket', null, null, 1, true),
  ('new-york-city', 'statue-of-liberty-harbor', '43581P7', 'Statue of Liberty and Ellis Island Tour', 'statue-of-liberty-and-ellis-island-tour', null, null, 2, true),
  ('new-york-city', 'statue-of-liberty-harbor', '6288P24', 'New York City Sunset Sail to the Statue of Liberty', 'new-york-city-sunset-sail-to-the-statue-of-liberty', null, null, 3, true),
  ('new-york-city', 'statue-of-liberty-harbor', '170459P3', 'Private Statue of Liberty Sailing Tour', 'private-statue-of-liberty-sailing-tour', null, null, 4, true),
  ('new-york-city', 'statue-of-liberty-harbor', '455890P1', 'NYC Sightseeing Day Trip with Statue of Liberty Visit', 'nyc-sightseeing-day-trip-with-statue-of-liberty-visit', null, null, 5, false),
  ('new-york-city', 'statue-of-liberty-harbor', '5577762P2', 'Statue of Liberty and Ellis Island Tour', 'statue-of-liberty-ellis-island-guided-tour', null, null, 6, false),
  ('new-york-city', 'statue-of-liberty-harbor', '108074P1', 'Statue of Liberty and Ellis Island', 'statue-of-liberty-and-ellis-island', null, null, 7, false),
  ('new-york-city', 'statue-of-liberty-harbor', '31003P15', 'Private Statue of Liberty and Ellis Island Tour', 'private-statue-of-liberty-and-ellis-island-tour', null, null, 8, false),
  ('new-york-city', 'statue-of-liberty-harbor', '418361P16', 'NYC Sunset Cruise with DJ Skyline and Statue of Liberty', 'nyc-sunset-cruise-with-dj-skyline-and-statue-of-liberty', null, null, 9, false),
  ('new-york-city', 'statue-of-liberty-harbor', '62527P7', 'Statue of Liberty Tour with Ellis Island and Immigration Museum', 'statue-of-liberty-tour-with-ellis-island-and-immigration-museum', null, null, 10, false),
  ('new-york-city', 'statue-of-liberty-harbor', '125205P1', 'Statue of Liberty and NYC Skyline Cruise Freedom Liberty Tour', 'statue-of-liberty-and-nyc-skyline-cruise-freedom-liberty-tour', null, null, 11, false),
  ('new-york-city', 'statue-of-liberty-harbor', '336379P19', 'NYC Harbor Skyline and NYC Lights and Statue of Liberty', 'nyc-harbor-skyline-and-nyc-lights-and-statue-of-liberty', null, null, 12, false),
  ('new-york-city', 'statue-of-liberty-harbor', '255730P146', 'NYC in a Day Private Walking Tour with the Statue of Liberty', 'nyc-in-a-day-private-walking-tour-with-the-statue-of-liberty', null, null, 13, false)
ON CONFLICT (destination_slug, category_slug, position) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  title = EXCLUDED.title,
  tour_slug = EXCLUDED.tour_slug,
  image_url = EXCLUDED.image_url,
  from_price = EXCLUDED.from_price,
  is_top_pick = EXCLUDED.is_top_pick;

-- 6 subcategories
INSERT INTO v3_landing_category_subcategories (destination_slug, category_slug, slug, title, description, product_ids, about, faq_json, position, why_book, what_to_expect, summary_paragraph)
VALUES
  ('new-york-city', 'statue-of-liberty-harbor', 'ferry-ellis-island', 'Ferry & Ellis Island', 'Official Statue of Liberty ferry and Ellis Island visits. Compare tickets and tours. Book with trusted partners.', '["49200P4","43581P7"]'::jsonb, 'Official ferry to Liberty Island and Ellis Island. Options include admission-only and guided experiences.', '[]'::jsonb, 1, null, '["Depart from Battery Park or NJ.","Ferry to Liberty Island and Ellis Island.","Allow 4–5 hours for both islands."]'::jsonb, 'Compare official Statue of Liberty ferry and Ellis Island tickets and tours.'),
  ('new-york-city', 'statue-of-liberty-harbor', 'ellis-island-guided', 'Ellis Island & immigration tours', 'Guided Ellis Island and immigration museum tours. Statue of Liberty included. Book with free cancellation.', '["5577762P2","62527P7","108074P1"]'::jsonb, 'Guided tours that include the ferry plus Ellis Island and the Immigration Museum. Ideal for context and highlights.', '[]'::jsonb, 2, null, '["Meet your guide; ferry to the islands.","Guided visit to Ellis Island and museum.","Duration typically 4–5 hours."]'::jsonb, 'Compare guided Statue of Liberty and Ellis Island tours with immigration museum visits.'),
  ('new-york-city', 'statue-of-liberty-harbor', 'sailing-sunset-cruises', 'Sailing & sunset cruises', 'Sunset sails and sailing tours to the Statue of Liberty. Private and group options. Book with trusted partners.', '["170459P3","6288P24","418361P16"]'::jsonb, 'Sailing and sunset cruises that pass the statue and offer harbor and skyline views. Private or group; some include DJ or narration.', '[]'::jsonb, 3, null, '["Board at the pier.","Sail past the statue and skyline.","Duration 1.5–2.5 hours typically."]'::jsonb, 'Compare sailing and sunset cruises to the Statue of Liberty and NYC harbor.'),
  ('new-york-city', 'statue-of-liberty-harbor', 'harbor-skyline-cruises', 'Harbor & skyline cruises', 'NYC harbor and skyline cruises with Statue of Liberty views. Day and evening options. Book with free cancellation.', '["125205P1","336379P19"]'::jsonb, 'Harbor and skyline cruises that include the statue and Manhattan skyline. Day and night options available.', '[]'::jsonb, 4, null, '["Board at the pier.","Cruise with statue and skyline views.","Duration varies by product."]'::jsonb, 'Compare harbor and skyline cruises with Statue of Liberty and NYC views.'),
  ('new-york-city', 'statue-of-liberty-harbor', 'private-tours', 'Private Statue of Liberty tours', 'Private Statue of Liberty and Ellis Island tours. Dedicated guide and tailored pace. Book with trusted partners.', '["31003P15","255730P146"]'::jsonb, 'Private tours include a dedicated guide for the statue and Ellis Island, or a full-day NYC tour that includes the statue.', '[]'::jsonb, 5, null, '["Meet your private guide.","Ferry and sites with dedicated commentary.","Duration varies; full-day option available."]'::jsonb, 'Compare private Statue of Liberty and Ellis Island tours.'),
  ('new-york-city', 'statue-of-liberty-harbor', 'day-trips-sightseeing', 'Day trips & sightseeing', 'NYC day trips and sightseeing that include the Statue of Liberty. Combine with city highlights. Book with free cancellation.', '["455890P1"]'::jsonb, 'Day trips that combine NYC sightseeing with a Statue of Liberty visit. Ideal for visitors who want to cover multiple highlights.', '[]'::jsonb, 6, null, '["Full-day itinerary with statue visit.","Other NYC highlights typically included.","Check product for exact schedule."]'::jsonb, 'Compare NYC day trips and sightseeing that include the Statue of Liberty.')
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
