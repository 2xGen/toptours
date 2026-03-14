-- Night & Skyline (NYC) – category page, 13 tours, 6 subcategories.
-- Run in Supabase SQL editor. Requires v3_landing_* tables (from main schema/seed).

INSERT INTO v3_landing_category_pages (destination_slug, category_slug, hero_description, about, insider_tips, what_to_expect, who_is_this_for, highlights, faq_json)
VALUES (
  'new-york-city',
  'night-skyline',
  'New York City night and skyline experiences: DUMBO and LIC skyline tours, night sailboat cruises, night bus tours, Brooklyn Bridge at night, and Village nights. Compare and book with trusted partners.',
  'NYC night options include skyline tours in DUMBO and Long Island City, sailboat and boat cruises, night bus tours (open-top and panoramic), Brooklyn Bridge at-night photography, private night tours, and Greenwich Village food and speakeasy experiences. Ideal for evening views and nightlife.',
  '["Book sunset and night cruises in advance for peak dates.","Dress for the weather on open-top buses and boats.","Check age requirements for bar and speakeasy tours."]'::jsonb,
  '["For cruises and boats: check-in at the pier; duration varies.","For bus tours: board at the designated stop; narrated route.","For walking tours: meet your guide; evening itinerary."]'::jsonb,
  '["Couples and groups looking for evening views.","Photography enthusiasts (Brooklyn Bridge at night).","Anyone who wants to see the skyline after dark."]'::jsonb,
  '["Skyline tours, sailboat and boat cruises","Night bus tours","Brooklyn Bridge at night","Village nights and speakeasy tours"]'::jsonb,
  '[{"question": "What is the best time for NYC night tours?","answer": "Sunset and just after dark are popular. Summer offers later daylight; winter tours start earlier. Check each product for departure times."},{"question": "Are night bus tours open-top?","answer": "Some are open-top; others are enclosed with large windows. Check the product description."}]'::jsonb
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

INSERT INTO v3_landing_category_tours (destination_slug, category_slug, product_id, title, tour_slug, image_url, from_price, position, is_top_pick)
VALUES
  ('new-york-city', 'night-skyline', '132218P765', 'Iconic New York City Skyline Night Tour: DUMBO and Long Island City', 'iconic-new-york-city-skyline-night-tour-dumbo-and-long-island-city', null, null, 1, true),
  ('new-york-city', 'night-skyline', '6288P49', 'New York City Skyline Night Sailboat Tour', 'new-york-city-skyline-night-sailboat-tour', null, null, 2, true),
  ('new-york-city', 'night-skyline', '7908P2', 'New York City Private Night Tour with Driver Guide', 'new-york-city-private-night-tour-with-driver-guide', null, null, 3, true),
  ('new-york-city', 'night-skyline', '5537P12', 'Brooklyn Bridge at Night Photography Tour', 'brooklyn-bridge-at-night-photography-tour', null, null, 4, true),
  ('new-york-city', 'night-skyline', '5588996P1', 'Late Night Rat Tours', 'late-night-rat-tours', null, null, 5, false),
  ('new-york-city', 'night-skyline', '417996P2', 'Village Nights: Greenwich Village Food and History Walk', 'village-nights-greenwich-village-food-and-history-walk', null, null, 6, false),
  ('new-york-city', 'night-skyline', '64702P2', 'New York City Skyline at Night Guided Tour', 'new-york-city-skyline-at-night-guided-tour', null, null, 7, false),
  ('new-york-city', 'night-skyline', '74756P9', 'Hidden Bar and Speakeasy Night Tour NYC', 'hidden-bar-and-speakeasy-night-tour-nyc', null, null, 8, false),
  ('new-york-city', 'night-skyline', '7290P28', 'Skyline Night Bus Audio Narrated Tour Experience', 'skyline-night-bus-audio-narrated-tour-experience', null, null, 9, false),
  ('new-york-city', 'night-skyline', '7290P2', 'New York Night Tour Open Top Bus Tour by TopView', 'new-york-night-tour-open-top-bus-tour-by-topview', null, null, 10, false),
  ('new-york-city', 'night-skyline', '6390P14', 'NYC Panoramic Brooklyn and New Jersey Waterfront Night Tour', 'nyc-panoramic-brooklyn-and-new-jersey-waterfront-night-tour', null, null, 11, false),
  ('new-york-city', 'night-skyline', '255280P7', 'NYC Night Bus Sightseeing Tour with Free Statue of Liberty Cruise', 'nyc-night-bus-sightseeing-tour-with-free-statue-of-liberty-cruise', null, null, 12, false),
  ('new-york-city', 'night-skyline', '320920P17', 'Romantic Italian Date Night in NYC', 'romantic-italian-date-night-in-nyc', null, null, 13, false)
ON CONFLICT (destination_slug, category_slug, position) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  title = EXCLUDED.title,
  tour_slug = EXCLUDED.tour_slug,
  image_url = EXCLUDED.image_url,
  from_price = EXCLUDED.from_price,
  is_top_pick = EXCLUDED.is_top_pick;

INSERT INTO v3_landing_category_subcategories (destination_slug, category_slug, slug, title, description, product_ids, about, faq_json, position, why_book, what_to_expect, summary_paragraph)
VALUES
  ('new-york-city', 'night-skyline', 'dumbo-skyline-night', 'DUMBO & skyline night tours', 'Iconic NYC skyline night tours in DUMBO and Long Island City. Guided skyline experiences. Book with trusted partners.', '["132218P765","64702P2"]'::jsonb, 'Skyline night tours from DUMBO and LIC offer iconic views of Manhattan. Guided options available.', '[]'::jsonb, 1, null, '["Meet your guide or at the meeting point.","Tour DUMBO/LIC with skyline views.","Evening duration varies."]'::jsonb, 'Compare DUMBO and skyline night tours in NYC.'),
  ('new-york-city', 'night-skyline', 'night-sailboat-cruise', 'Night sailboat & boat cruises', 'Night sailboat and boat cruises with NYC skyline views. Compare and book with free cancellation.', '["6288P49"]'::jsonb, 'Night sailboat tours offer a relaxed way to see the skyline from the water.', '[]'::jsonb, 2, null, '["Board at the pier.","Sail with skyline views.","Duration typically 1.5–2 hours."]'::jsonb, 'Compare night sailboat and boat cruises with NYC skyline views.'),
  ('new-york-city', 'night-skyline', 'private-night-tours', 'Private night tours', 'Private NYC night tours with driver guide and romantic date experiences. Book with trusted partners.', '["7908P2","320920P17"]'::jsonb, 'Private night tours by vehicle or romantic date-night experiences in the city.', '[]'::jsonb, 3, null, '["Private: meet your driver/guide; custom itinerary.","Date night: experience varies by product."]'::jsonb, 'Compare private night tours and romantic NYC date-night experiences.'),
  ('new-york-city', 'night-skyline', 'brooklyn-bridge-night', 'Brooklyn Bridge at night', 'Brooklyn Bridge at night photography and panoramic waterfront night tours. Book with free cancellation.', '["5537P12","6390P14"]'::jsonb, 'Brooklyn Bridge at night and panoramic Brooklyn/NJ waterfront night tours for views and photography.', '[]'::jsonb, 4, null, '["Photography tour: meet guide; shoot the bridge at night.","Panoramic: bus or vehicle tour with waterfront views."]'::jsonb, 'Compare Brooklyn Bridge at night and waterfront night tours.'),
  ('new-york-city', 'night-skyline', 'night-bus-tours', 'Night bus tours', 'NYC night bus sightseeing: open-top, audio narrated, and tours with Statue of Liberty cruise. Compare and book.', '["7290P28","7290P2","255280P7"]'::jsonb, 'Night bus tours include open-top, narrated, and combo experiences (e.g. bus plus Statue of Liberty cruise).', '[]'::jsonb, 5, null, '["Board at the designated stop.","Narrated night route; some include a cruise.","Duration varies by product."]'::jsonb, 'Compare NYC night bus sightseeing tours.'),
  ('new-york-city', 'night-skyline', 'village-nights-speakeasy', 'Village nights & speakeasy tours', 'Greenwich Village food and history walks, hidden bar and speakeasy tours, and late-night experiences. Book with trusted partners.', '["417996P2","74756P9","5588996P1"]'::jsonb, 'Village nights combine food and history; speakeasy and bar tours focus on hidden venues. Age restrictions may apply.', '[]'::jsonb, 6, null, '["Meet your guide; evening walk with food or bar stops.","Check product for age and dress code."]'::jsonb, 'Compare Village nights and speakeasy and bar tours in NYC.')
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
