-- Day Trips (NYC) – 6 subcategories, each with 2 or 3 tours.
-- Run after explore_nyc_day_trips.sql. Requires v3_landing_category_subcategories.

INSERT INTO v3_landing_category_subcategories (destination_slug, category_slug, slug, title, description, product_ids, about, faq_json, position, why_book, what_to_expect, summary_paragraph)
VALUES
  ('new-york-city', 'day-trips', 'washington-dc', 'Washington DC day trips', 'Day trips from NYC to Washington, D.C. Monuments, Capitol, and capital highlights. Compare options and book with free cancellation.', '["455017P6","132218P239"]'::jsonb, 'Full-day coach or train trips to Washington, D.C. from Manhattan or New Jersey. Typically include key monuments and free time.', '[]'::jsonb, 1, null, '["Early departure from NYC.","Guided sightseeing or free time in D.C.","Return to NYC in the evening."]'::jsonb, 'Compare Washington, D.C. day trips from New York City—monuments, Capitol, and capital highlights in one day.'),
  ('new-york-city', 'day-trips', 'niagara-falls', 'Niagara Falls day trips', 'Niagara Falls day trips from NYC by coach or helicopter. Optional Maid of the Mist. Compare and book.', '["132218P613","5608336P18"]'::jsonb, 'Full-day trips to Niagara Falls by bus or helicopter. Some include Maid of the Mist boat ride; helicopter is a premium option.', '[]'::jsonb, 2, null, '["Depart NYC early.","Travel to Niagara; sightseeing and optional boat.","Return to NYC."]'::jsonb, 'Compare Niagara Falls day trips from NYC—by coach or helicopter, with optional Maid of the Mist.'),
  ('new-york-city', 'day-trips', 'nyc-area-sightseeing', 'NYC area sightseeing & Hamptons', 'NYC sightseeing day trips with Statue of Liberty; private Hamptons day trips. Compare and book.', '["455890P1","7908P21"]'::jsonb, 'Day trips that combine NYC highlights (e.g. Statue of Liberty) or private Hamptons getaways from the city.', '[]'::jsonb, 3, null, '["Full-day itinerary from NYC.","Sightseeing or Hamptons exploration.","Return same day."]'::jsonb, 'Compare NYC-area day trips including Statue of Liberty sightseeing and private Hamptons experiences.'),
  ('new-york-city', 'day-trips', 'shopping-wine', 'Shopping & wine country', 'Woodbury Common outlets, Hudson Valley wine and food, Long Island wine day trips from NYC. Compare and book.', '["30688P2","64276P2","64276P1"]'::jsonb, 'Shopping at Woodbury Common or wine and food day trips to Hudson Valley or Long Island. Sommelier-hosted options available.', '[]'::jsonb, 4, null, '["Depart NYC.","Shopping or wine tastings and food.","Return in the evening."]'::jsonb, 'Compare shopping and wine country day trips from NYC—outlets, Hudson Valley, and Long Island.'),
  ('new-york-city', 'day-trips', 'beaches-activity', 'Beaches & activity day trips', 'Long Beach day trip, Pocono paintball and activity day trips from NYC. Compare and book.', '["5628293P1","414190P2"]'::jsonb, 'Day trips to the beach (e.g. Long Beach) or activity-based trips like Pocono paintball from NYC.', '[]'::jsonb, 5, null, '["Depart NYC.","Beach or activity experience.","Return same day."]'::jsonb, 'Compare beach and activity day trips from New York City.'),
  ('new-york-city', 'day-trips', 'other-day-trips', 'More day trips from NYC', 'Additional Washington and Niagara options: alternate coach tour, Niagara by helicopter. Compare and book.', '["221092P3","7030P27"]'::jsonb, 'Alternate Washington, D.C. day trip or Niagara Falls by helicopter from Manhattan.', '[]'::jsonb, 6, null, '["Full-day experience.","Varies by product.","Return to NYC."]'::jsonb, 'Compare more day trip options from NYC—Washington and Niagara helicopter.')
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
