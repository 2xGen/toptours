-- Brooklyn Tours (NYC) – 6 subcategories, each with 2 or 3 tours.
-- Run after explore_nyc_brooklyn_tours.sql. Requires v3_landing_category_subcategories.

INSERT INTO v3_landing_category_subcategories (destination_slug, category_slug, slug, title, description, product_ids, about, faq_json, position, why_book, what_to_expect, summary_paragraph)
VALUES
  ('new-york-city', 'brooklyn-tours', 'brooklyn-bridge-dumbo', 'Brooklyn Bridge & DUMBO', 'Private Brooklyn Bridge tour with a local; Brooklyn Bridge Heights DUMBO tour. Compare and book.', '["345485P1","5527066P4"]'::jsonb, 'Brooklyn Bridge and DUMBO experiences: private tours with a local, heights and DUMBO tour, or food tour covering the area.', '[]'::jsonb, 1, null, '["Meet your guide.","Walk Brooklyn Bridge and/or DUMBO.","Duration typically 2–3 hours."]'::jsonb, 'Compare Brooklyn Bridge and DUMBO tours.'),
  ('new-york-city', 'brooklyn-tours', 'best-of-brooklyn', 'Best of Brooklyn', 'The best of Brooklyn tour; Brooklyn distillery tour. Compare and book.', '["5527280P3","5568544P6"]'::jsonb, 'Best-of-Brooklyn overview and Brooklyn distillery tour.', '[]'::jsonb, 2, null, '["Neighborhood and/or distillery visit.","Duration varies."]'::jsonb, 'Compare the best of Brooklyn and distillery tours.'),
  ('new-york-city', 'brooklyn-tours', 'culture-history-walks', 'Culture & history walks', 'Brooklyn literary pub crawl; hip-hop walking tour; Humorville immersive experience. Compare and book.', '["14783P2","3368P6","92326P1"]'::jsonb, 'Literary, hip-hop, and immersive culture and history walks in Brooklyn.', '[]'::jsonb, 3, null, '["Meet your guide.","Walk with stories and stops.","Typically 2–3 hours."]'::jsonb, 'Compare Brooklyn culture and history walking tours.'),
  ('new-york-city', 'brooklyn-tours', 'coney-island-sailing', 'Coney Island & sailing', 'Private visit to Coney Island; private sailing charter in Brooklyn. Compare and book.', '["313422P7","428616P1"]'::jsonb, 'Private Coney Island visit and private sailing charter from Brooklyn.', '[]'::jsonb, 4, null, '["Private experience.","Coney Island or sailing.","Duration varies."]'::jsonb, 'Compare Coney Island and sailing experiences in Brooklyn.'),
  ('new-york-city', 'brooklyn-tours', 'street-art-graffiti', 'Street art & graffiti', 'Brooklyn graffiti photo safari; Brooklyn graffiti workshop. Compare and book.', '["5537P14","7918P4"]'::jsonb, 'Street art and graffiti photo safari and hands-on graffiti workshop in Brooklyn.', '[]'::jsonb, 5, null, '["Photo tour or workshop.","Duration typically 2–3 hours."]'::jsonb, 'Compare Brooklyn street art and graffiti tours and workshops.'),
  ('new-york-city', 'brooklyn-tours', 'brooklyn-brewery-food', 'Brooklyn brewery & food', 'Underground Brooklyn walking brewery tour; private Brooklyn Heights, Bridge and DUMBO food tour. Compare and book.', '["75738P6","8501P18"]'::jsonb, 'Walking brewery tour and private Brooklyn Heights, Bridge and DUMBO food tour.', '[]'::jsonb, 6, null, '["Meet in Brooklyn.","Brewery or food tour.","Typically 2–3 hours."]'::jsonb, 'Compare Brooklyn brewery and food tours.')
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
