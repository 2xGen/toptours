-- Cruises & Water (NYC) – 6 subcategories, each with 2 or 3 tours.
-- Run after explore_nyc_cruises_water.sql. Requires v3_landing_category_subcategories.

INSERT INTO v3_landing_category_subcategories (destination_slug, category_slug, slug, title, description, product_ids, about, faq_json, position, why_book, what_to_expect, summary_paragraph)
VALUES
  ('new-york-city', 'cruises-water', 'sightseeing-landmarks', 'Sightseeing & landmark cruises', 'NYC iconic landmarks cruise; sunset or daytime sightseeing cruise. Compare and book.', '["5594369P4","6288P29"]'::jsonb, 'Sightseeing cruises past NYC landmarks.', '[]'::jsonb, 1, null, '["Board at the pier.","Cruise with skyline and statue views.","Typically 1–2 hours."]'::jsonb, 'Compare sightseeing and landmark cruises in NYC.'),
  ('new-york-city', 'cruises-water', 'architecture-yacht', 'Architecture yacht & seasonal cruises', 'Manhattan architecture yacht cruise; afternoon fall foliage cruise with lunch. Compare and book.', '["6288P7","6288P32"]'::jsonb, 'Architecture yacht and seasonal fall foliage cruise with lunch.', '[]'::jsonb, 2, null, '["Board at the pier.","Yacht cruise with commentary or seasonal theme."]'::jsonb, 'Compare architecture yacht and seasonal cruises.'),
  ('new-york-city', 'cruises-water', 'schooner-sunset', 'Schooner & sunset cruises', 'Sunset schooner on the Hudson; NYC sunset cruise with DJ and Statue of Liberty. Compare and book.', '["6288P21","418361P16"]'::jsonb, 'Schooner and sunset cruises with skyline and statue views.', '[]'::jsonb, 3, null, '["Board at the pier.","Sail or cruise at sunset.","Typically 1.5–2 hours."]'::jsonb, 'Compare schooner and sunset cruises in NYC.'),
  ('new-york-city', 'cruises-water', 'jazz-holiday-cruises', 'Jazz & holiday cruises', 'New York Harbor live holiday jazz; Manhattan evening jazz; holiday sunset sightseeing cruise. Compare and book.', '["6288P16","6288P18","6288P41"]'::jsonb, 'Live jazz and holiday-themed sightseeing cruises.', '[]'::jsonb, 4, null, '["Board at the pier.","Cruise with live music or holiday theme."]'::jsonb, 'Compare jazz and holiday cruises in New York.'),
  ('new-york-city', 'cruises-water', 'dinner-brunch-cruises', 'Dinner & brunch cruises', 'Bateaux Premier dinner cruise; holiday brunch with cocoa cruise. Compare and book.', '["5042NYCBAT","12214P29"]'::jsonb, 'Upscale dinner and brunch cruises with meals and skyline views.', '[]'::jsonb, 5, null, '["Board at the pier.","Multi-course meal and cruise.","Typically 2–3 hours."]'::jsonb, 'Compare dinner and brunch cruises in NYC.'),
  ('new-york-city', 'cruises-water', 'city-lights-party', 'City lights & party cruises', 'City lights cruise; Blue Booze cruise experience. Compare and book.', '["12214P32","5572251P5"]'::jsonb, 'City lights and party-style cruises.', '[]'::jsonb, 6, null, '["Board at the pier.","Evening cruise; some include drinks."]'::jsonb, 'Compare city lights and party cruises in NYC.')
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
