-- Walking & Neighborhoods (NYC) – category page, 13 tours, 6 subcategories.
-- Run in Supabase SQL editor. Requires v3_landing_* tables (from main schema/seed).

INSERT INTO v3_landing_category_pages (destination_slug, category_slug, hero_description, about, insider_tips, what_to_expect, who_is_this_for, highlights, faq_json)
VALUES (
  'new-york-city',
  'walking-neighborhoods',
  'Walking and neighborhood tours in New York City: Greenwich Village, Brooklyn Bridge, Central Park, Tribeca, Downtown, and private tours. Compare guided walks and themed experiences. Book with free cancellation.',
  'NYC walking tours cover Greenwich Village, Brooklyn Bridge, Central Park, Tribeca, Downtown, 42nd Street, and Williamsburg. Options include group and private tours, sunset and historical walks, and food or culture-focused experiences. Most tours run 2–3 hours.',
  '["Wear comfortable shoes. Tours run rain or shine.","Book private tours in advance for your preferred date.","Sunset Brooklyn Bridge tours are popular—book ahead."]'::jsonb,
  '["Meet your guide at the designated spot.","Walk through the neighborhood with commentary and stops.","Duration typically 2–3 hours; check each product."]'::jsonb,
  '["First-time visitors and neighborhood explorers.","Couples and small groups.","Anyone who prefers walking to bus or boat."]'::jsonb,
  '["Greenwich Village, Brooklyn Bridge, Central Park","Private and themed walks","Sunset and historical tours"]'::jsonb,
  '[{"question": "How long do NYC walking tours last?","answer": "Most run 2–3 hours. Private and themed tours may vary. Check the product for exact duration."},{"question": "Do walking tours run in bad weather?","answer": "Many run rain or shine. Dress for the weather; some operators may reschedule in severe conditions."}]'::jsonb
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
  ('new-york-city', 'walking-neighborhoods', '14783P4', 'Bohemian Culture Walk of Greenwich Village', 'bohemian-culture-walk-of-greenwich-village', null, null, 1, true),
  ('new-york-city', 'walking-neighborhoods', '5527066P28', 'Brooklyn Bridge Sunset Walking Tour', 'brooklyn-bridge-sunset-walking-tour', null, null, 2, true),
  ('new-york-city', 'walking-neighborhoods', '423559P3', 'The Downtown Experience Private Walking Tour', 'the-downtown-experience-private-walking-tour', null, null, 3, true),
  ('new-york-city', 'walking-neighborhoods', '134104P1', 'Central Park Guided Walking Tour', 'central-park-guided-walking-tour', null, null, 4, true),
  ('new-york-city', 'walking-neighborhoods', '5589203P7', 'A Walking Tour of 42nd Street', 'a-walking-tour-of-42nd-street', null, null, 5, false),
  ('new-york-city', 'walking-neighborhoods', '5539334P1', 'Brooklyn Bridge Historical Walking Tour', 'brooklyn-bridge-historical-walking-tour', null, null, 6, false),
  ('new-york-city', 'walking-neighborhoods', '5546362P1', 'NYC Riddle-Based Walking Adventure', 'nyc-riddle-based-walking-adventure', null, null, 7, false),
  ('new-york-city', 'walking-neighborhoods', '279763P1', 'The Boozy Broadway Walking Tour', 'the-boozy-broadway-walking-tour', null, null, 8, false),
  ('new-york-city', 'walking-neighborhoods', '423559P2', 'The Village Private Walking Tour', 'the-village-private-walking-tour', null, null, 9, false),
  ('new-york-city', 'walking-neighborhoods', '28394P3', 'NYC Private Walking Tour', 'nyc-private-walking-tour', null, null, 10, false),
  ('new-york-city', 'walking-neighborhoods', '43159P3', 'Central Park Walking Tour', 'central-park-walking-tour', null, null, 11, false),
  ('new-york-city', 'walking-neighborhoods', '150137P2', 'Tribeca Architecture and History Walking Tour', 'tribeca-architecture-and-history-walking-tour', null, null, 12, false),
  ('new-york-city', 'walking-neighborhoods', '117489P2', 'Williamsburg Food Tasting and Walking Tour', 'williamsburg-food-tasting-and-walking-tour', null, null, 13, false)
ON CONFLICT (destination_slug, category_slug, position) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  title = EXCLUDED.title,
  tour_slug = EXCLUDED.tour_slug,
  image_url = EXCLUDED.image_url,
  from_price = EXCLUDED.from_price,
  is_top_pick = EXCLUDED.is_top_pick;

INSERT INTO v3_landing_category_subcategories (destination_slug, category_slug, slug, title, description, product_ids, about, faq_json, position, why_book, what_to_expect, summary_paragraph)
VALUES
  ('new-york-city', 'walking-neighborhoods', 'greenwich-village-walks', 'Greenwich Village walking tours', 'Bohemian culture and Village private walking tours. Compare experiences. Book with free cancellation.', '["14783P4","423559P2"]'::jsonb, 'Greenwich Village walks cover culture, history, and neighborhood stories. Group and private options.', '[]'::jsonb, 1, null, '["Meet your guide in the Village.","Walk with commentary and stops.","Typically 2–3 hours."]'::jsonb, 'Compare Greenwich Village walking tours—bohemian culture and private Village walks.'),
  ('new-york-city', 'walking-neighborhoods', 'downtown-tribeca', 'Downtown & Tribeca', 'Downtown and Tribeca architecture and history walking tours. Private and group options. Book with trusted partners.', '["423559P3","150137P2"]'::jsonb, 'Downtown and Tribeca tours focus on architecture, history, and neighborhood character.', '[]'::jsonb, 2, null, '["Meet at the designated spot.","Walk through Downtown or Tribeca.","Duration varies; often 2–2.5 hours."]'::jsonb, 'Compare Downtown and Tribeca walking tours.'),
  ('new-york-city', 'walking-neighborhoods', 'brooklyn-bridge-walks', 'Brooklyn Bridge walking tours', 'Brooklyn Bridge sunset and historical walking tours. Compare and book with free cancellation.', '["5527066P28","5539334P1"]'::jsonb, 'Brooklyn Bridge walking tours include sunset and historical options. Iconic views and stories.', '[]'::jsonb, 3, null, '["Meet your guide; walk onto the bridge.","Commentary and photo stops.","Typically 2 hours."]'::jsonb, 'Compare Brooklyn Bridge walking tours—sunset and historical experiences.'),
  ('new-york-city', 'walking-neighborhoods', 'central-park-walking', 'Central Park walking tours', 'Central Park guided and walking tours. Explore the park with a guide. Book with free cancellation.', '["134104P1","43159P3"]'::jsonb, 'Central Park walking tours offer guided exploration of the park''s highlights and history.', '[]'::jsonb, 4, null, '["Meet at the park; walk with your guide.","Highlights and stories.","Typically 2–2.5 hours."]'::jsonb, 'Compare Central Park walking tours.'),
  ('new-york-city', 'walking-neighborhoods', 'private-themed-walks', 'Private & themed walking tours', 'Private NYC walking tours and riddle-based adventures. Tailored and themed experiences. Book with trusted partners.', '["28394P3","5546362P1"]'::jsonb, 'Private tours offer a dedicated guide; themed tours (e.g. riddle-based) add a different angle to exploring NYC.', '[]'::jsonb, 5, null, '["Private: meet your guide; itinerary can be tailored.","Themed: follow the theme (e.g. riddles) through the city.","Duration varies."]'::jsonb, 'Compare private and themed NYC walking tours.'),
  ('new-york-city', 'walking-neighborhoods', '42nd-street-williamsburg', '42nd Street, Broadway & Williamsburg', '42nd Street, Boozy Broadway, and Williamsburg food and walking tours. Compare and book.', '["5589203P7","279763P1","117489P2"]'::jsonb, '42nd Street tours, Broadway-area walks (including food/drink), and Williamsburg food and walking tours.', '[]'::jsonb, 6, null, '["Meet your guide.","Walk 42nd Street, Broadway area, or Williamsburg with tastings or stops.","Typically 2–3 hours."]'::jsonb, 'Compare 42nd Street, Broadway, and Williamsburg walking and food tours.')
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
