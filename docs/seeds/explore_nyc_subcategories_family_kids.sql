-- Family & Kids (NYC) – 6 subcategories, each with 2 or 3 tours.
-- Run after explore_nyc_family_kids.sql. Requires v3_landing_category_subcategories.

INSERT INTO v3_landing_category_subcategories (destination_slug, category_slug, slug, title, description, product_ids, about, faq_json, position, why_book, what_to_expect, summary_paragraph)
VALUES
  ('new-york-city', 'family-kids', 'american-dream-theme-parks', 'American Dream & theme parks', 'American Dream full-day and DreamWorks Waterpark 4-in-1 pass. Kid-friendly fun from NYC. Compare and book.', '["132218P241","77348P8"]'::jsonb, 'American Dream mall and theme park experiences; DreamWorks Waterpark 4-in-1 pass. Kids 50% off on selected tours.', '[]'::jsonb, 1, null, '["Depart NYC or meet at venue.","Full-day theme park or waterpark.","Return or end at venue."]'::jsonb, 'Compare American Dream and theme park experiences for families from NYC.'),
  ('new-york-city', 'family-kids', 'farms-planetarium', 'Farms & planetarium', 'Long Island farm, WildPlay Jones Beach, Happy Farm, Vanderbilt Planetarium tours. Kids 50% off. Compare and book.', '["132218P407","132218P404","132218P408"]'::jsonb, 'Farm visits, beach play, and planetarium tours from NYC. Many offer kids 50% off.', '[]'::jsonb, 2, null, '["Full-day or half-day from NYC.","Farm, beach, or planetarium experience.","Family-friendly pacing."]'::jsonb, 'Compare farm and planetarium day trips for families—Long Island and Jones Beach.'),
  ('new-york-city', 'family-kids', 'zoos-wildlife', 'Zoos & wildlife', 'Central Park Zoo and Manhattan walking tour; Bronx Zoo admission. Compare and book.', '["224016P30","156679P1"]'::jsonb, 'Zoo experiences in NYC: Central Park Zoo combo with Manhattan tour, or Bronx Zoo admission.', '[]'::jsonb, 3, null, '["Zoo visit; some include walking tour.","Allow 2–4 hours.","Family-friendly."]'::jsonb, 'Compare zoo and wildlife experiences for families in New York City.'),
  ('new-york-city', 'family-kids', 'private-family-tours', 'Private family tours', 'Private NYC tour with fun activities for families; chocolate pizza and city fun. Compare and book.', '["368349P510","74756P13"]'::jsonb, 'Private family-focused tours: NYC with kid-friendly activities or chocolate pizza and city fun.', '[]'::jsonb, 4, null, '["Private guide; tailored to families.","Activities and tastings.","Duration varies."]'::jsonb, 'Compare private family tours in NYC—activities and chocolate pizza experiences.'),
  ('new-york-city', 'family-kids', 'food-treats-classes', 'Food & treats classes', 'Ice cream and sundae making classes in Brooklyn and NYC. Fun for families. Compare and book.', '["378639P147","378639P148"]'::jsonb, 'Ice cream, sundae, and donut experiences in NYC and Brooklyn. Some are adult-oriented; check age suitability.', '[]'::jsonb, 5, null, '["Class or walking tour with tastings.","Duration typically 1.5–2.5 hours.","Check age for alcohol-included options."]'::jsonb, 'Compare food and treat classes and tours for families in NYC and Brooklyn.'),
  ('new-york-city', 'family-kids', 'brooklyn-family-food', 'Brooklyn family food & walking', 'Brooklyn food walking tour and donuts: local eats and family-run shops. Compare and book.', '["5713P118","150136P2"]'::jsonb, 'Brooklyn food walking tours with local eats and family-run shops; donut tour option.', '[]'::jsonb, 6, null, '["Meet in Brooklyn.","Walk and taste.","Typically 2–3 hours."]'::jsonb, 'Compare Brooklyn family-friendly food and walking tours.')
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
