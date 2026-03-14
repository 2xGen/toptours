-- TopTours 3.0: Category pages and subcategory pages (tours + SEO content).
-- Run in Supabase SQL editor after v3_landing_schema_and_seed.sql.
-- Supports /explore/[destination]/[category] (e.g. central-park-tours) and /explore/[destination]/[category]/[sub] (e.g. bike-tours).

-- 1) Category tours: up to 10 tours per category. First 4 = top picks, next 6 = other.
-- NOTE: For existing projects, tour_slug + rating + review_count are added below via ALTER TABLE blocks.
CREATE TABLE IF NOT EXISTS v3_landing_category_tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug text NOT NULL,
  category_slug text NOT NULL,
  product_id text NOT NULL,
  title text NOT NULL,
  image_url text,
  from_price text,
  rating numeric,
  review_count integer,
  position smallint NOT NULL,
  is_top_pick boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(destination_slug, category_slug, position)
);
CREATE INDEX IF NOT EXISTS idx_v3_category_tours_dest_cat
  ON v3_landing_category_tours(destination_slug, category_slug);

-- 2) Category page SEO: hero description, about, insider tips, what to expect, who is this for, highlights, FAQ.
CREATE TABLE IF NOT EXISTS v3_landing_category_pages (
  destination_slug text NOT NULL,
  category_slug text NOT NULL,
  hero_description text,
  about text,
  insider_tips jsonb,
  what_to_expect jsonb,
  who_is_this_for jsonb,
  highlights jsonb,
  faq_json jsonb,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (destination_slug, category_slug)
);
-- Add SEO columns if table already existed
DO $$ BEGIN ALTER TABLE v3_landing_category_pages ADD COLUMN hero_description text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_pages ADD COLUMN insider_tips jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_pages ADD COLUMN what_to_expect jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_pages ADD COLUMN who_is_this_for jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_pages ADD COLUMN highlights jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 3) Subcategories: each has slug, title, description, 2–3 product_ids, optional about + FAQ.
CREATE TABLE IF NOT EXISTS v3_landing_category_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug text NOT NULL,
  category_slug text NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  product_ids jsonb NOT NULL DEFAULT '[]',
  about text,
  faq_json jsonb,
  position smallint NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(destination_slug, category_slug, slug)
);
CREATE INDEX IF NOT EXISTS idx_v3_category_subcategories_dest_cat
  ON v3_landing_category_subcategories(destination_slug, category_slug);

-- SEO columns for subcategory pages (Aru365-style: why book, what to expect, summary)
DO $$ BEGIN ALTER TABLE v3_landing_category_subcategories ADD COLUMN why_book text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_subcategories ADD COLUMN what_to_expect jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_subcategories ADD COLUMN summary_paragraph text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Add tour_slug + rating + review_count columns + constraint if table already existed
DO $$ BEGIN ALTER TABLE v3_landing_category_tours ADD COLUMN tour_slug text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_tours ADD COLUMN rating numeric; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_tours ADD COLUMN review_count integer; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'v3_category_tours_dest_cat_tour_slug_uniq') THEN
    ALTER TABLE v3_landing_category_tours ADD CONSTRAINT v3_category_tours_dest_cat_tour_slug_uniq UNIQUE (destination_slug, category_slug, tour_slug);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_v3_category_tours_tour_slug
  ON v3_landing_category_tours(destination_slug, category_slug, tour_slug);

-- Tour-level SEO: unique content, FAQs, who is this for, insider tips (nullable; populate via AI or manual).
DO $$ BEGIN ALTER TABLE v3_landing_category_tours ADD COLUMN seo_meta_title text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_tours ADD COLUMN seo_meta_description text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_tours ADD COLUMN seo_about text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_tours ADD COLUMN who_is_this_for jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_tours ADD COLUMN insider_tips jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_tours ADD COLUMN faq_json jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_tours ADD COLUMN highlights jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_tours ADD COLUMN why_we_recommend text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 4) Seed: Central Park tours (NYC) – 10 Viator products; first 4 = handpicked top picks (bike, walking, horse, secrets).
INSERT INTO v3_landing_category_tours (destination_slug, category_slug, product_id, title, tour_slug, image_url, from_price, position, is_top_pick)
VALUES
  ('new-york-city', 'central-park-tours', '5548740P2', 'Central Park Bike Tour', 'central-park-bike-tour', null, null, 1, true),
  ('new-york-city', 'central-park-tours', '233384P5', 'Best of Central Park Bike Tour', 'best-of-central-park-bike-tour', null, null, 2, false),
  ('new-york-city', 'central-park-tours', '37907P15', 'Guided Walking Tour Of Central Park', 'guided-walking-tour-of-central-park', null, null, 3, true),
  ('new-york-city', 'central-park-tours', '147315P6', 'Central Park Private Walking Tour', 'central-park-private-walking-tour', null, null, 4, false),
  ('new-york-city', 'central-park-tours', '180862P2', 'NYC Central Park Horse and Carriage Ride: Long Ride 45 min', 'nyc-central-park-horse-and-carriage-ride-long-ride-45-min', null, null, 5, true),
  ('new-york-city', 'central-park-tours', '186327P2', 'Private NYC Central Park Horse Carriage Ride (Guided) Since 1965', 'private-nyc-central-park-horse-carriage-ride-guided-since-1965', null, null, 6, false),
  ('new-york-city', 'central-park-tours', '86536P1', 'Secret Places of Central Park', 'secret-places-of-central-park', null, null, 7, true),
  ('new-york-city', 'central-park-tours', '43581P4', 'Central Park Secrets And Highlights', 'central-park-secrets-and-highlights', null, null, 8, false),
  ('new-york-city', 'central-park-tours', '399066P1', 'Central Park Luxury Picnic for 2', 'central-park-luxury-picnic-for-2', null, null, 9, false),
  ('new-york-city', 'central-park-tours', '5557P20', 'Central Park Picnic with Full Day Bike Rental', 'central-park-picnic-with-full-day-bike-rental', null, null, 10, false),
  ('new-york-city', 'central-park-tours', '22253P1', 'Central Park Walking Tour with Yoga', 'central-park-walking-tour-with-yoga', null, null, 11, false),
  ('new-york-city', 'central-park-tours', '359827P1', 'Central Park Yoga Class with a View in the Heart of New York City', 'central-park-yoga-class-with-a-view-in-the-heart-of-new-york-city', null, null, 12, false),
  ('new-york-city', 'central-park-tours', '22253P4', 'Central Park Highlights Running Tour', 'central-park-highlights-running-tour', null, null, 13, false)
ON CONFLICT (destination_slug, category_slug, position) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  title = EXCLUDED.title,
  tour_slug = EXCLUDED.tour_slug,
  image_url = EXCLUDED.image_url,
  from_price = EXCLUDED.from_price,
  is_top_pick = EXCLUDED.is_top_pick;

INSERT INTO v3_landing_category_pages (
  destination_slug, category_slug, hero_description, about,
  insider_tips, what_to_expect, who_is_this_for, highlights, faq_json
)
VALUES (
  'new-york-city',
  'central-park-tours',
  'Discover the best Central Park tours in New York City: bike rentals and guided bike tours, walking tours, horse-drawn carriage rides, running and photography tours, and family-friendly experiences. Explore the park''s famous bridges, lawns, and landmarks with a guide or at your own pace. Compare options and book with free cancellation.',
  'Central Park is one of the world''s most famous urban parks. Bike, walking, and carriage tours let you explore its bridges, lawns, and landmarks with a guide or at your own pace. Most tours cover highlights like Bethesda Fountain, Bow Bridge, and the Mall; some include running, photography, or family-focused options. Morning and afternoon departures are available. Book in advance in peak season (spring and fall) for the best choice.',
  '["Book at least a few days ahead in peak season — carriage rides and popular guided tours fill quickly.","Morning and late afternoon offer the best light for photography tours and comfortable temperatures for walking or biking.","Wear comfortable shoes for walking tours; for bike tours, flat paths make it suitable for all levels.","Carriage rides are iconic but weather-dependent; have a backup if rain is forecast."]'::jsonb,
  '["Check-in at the meeting point (often near the park entrance or a designated spot); you''ll get a brief orientation.","Your guide or rental: walking and running tours follow a set route with commentary; bike and carriage tours cover key landmarks.","Stops for photos and stories — Bethesda Fountain, Bow Bridge, the Mall, and seasonal highlights.","Return to the start. Most walking tours run 2–2.5 hours; bike tours 2–3 hours; carriage rides about 45–60 minutes."]'::jsonb,
  '["Couples and families looking for a relaxed way to see the park.","First-time visitors who want to cover more ground by bike or carriage.","Photography enthusiasts who want the best spots and light.","Active travelers who want a running tour combined with sightseeing.","Anyone who wants an iconic NYC experience (e.g. carriage ride) without a full-day commitment."]'::jsonb,
  '["Bike, walking, and horse-drawn carriage options","Guided tours with local experts and photo stops","Half-day and short experiences; most under 3 hours","Family-friendly walking and bike tours; carriage rides popular with kids"]'::jsonb,
  '[
    {"question": "What are the best Central Park tours?","answer": "Popular options include guided walking tours, bike rentals and bike tours, horse-drawn carriage rides, and running or photography tours. The best choice depends on your interests and how much of the park you want to cover."},
    {"question": "Do I need to book Central Park tours in advance?","answer": "Booking in advance is recommended, especially in spring and fall. Carriage rides and guided tours can sell out on busy days."},
    {"question": "Are Central Park tours good for families?","answer": "Yes. Many walking and bike tours are family-friendly. Carriage rides are also popular with children. Check each tour for age requirements and pace."},
    {"question": "How long do Central Park tours last?","answer": "Walking tours typically run 2–2.5 hours; bike tours 2–3 hours; carriage rides about 45–60 minutes. Check each product for exact duration."},
    {"question": "What should I bring on a Central Park tour?","answer": "Wear comfortable shoes. For bike tours, casual clothes are fine. Bring water and sunscreen in summer. For photography tours, your camera or phone."},
    {"question": "Where do Central Park tours start?","answer": "Meeting points vary by operator — often near park entrances such as Columbus Circle, Fifth Avenue, or Central Park South. Your confirmation will include the exact location."}
  ]'::jsonb
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

-- Broadway Shows (NYC) – category page SEO
INSERT INTO v3_landing_category_pages (destination_slug, category_slug, hero_description, about, insider_tips, what_to_expect, who_is_this_for, highlights, faq_json)
VALUES (
  'new-york-city',
  'broadway-shows',
  'Discover Broadway in New York City: show tickets for hit musicals and plays, walking tours of the Theater District, private tours, food and drink experiences, and the Museum of Broadway. Compare options and book with trusted partners.',
  'Broadway is the heart of American theater. Options include tickets to current shows and musicals, guided walking tours of the Theater District and historic theaters, private and small-group experiences, food and drink tours, and the Museum of Broadway. Book show tickets in advance for the best seats; walking tours run daily.',
  '["Book show tickets at least a few days ahead for popular shows; weekend and evening performances sell out first.","Walking tours run rain or shine; dress for the weather.","The Museum of Broadway is ideal before or after a show.","Check age and ID requirements for show tickets and drink-included tours."]'::jsonb,
  '["For show tickets: choose your date and show; receive e-tickets or pickup instructions.","For walking tours: meet at the designated spot; your guide leads you through theaters and landmarks.","For the museum: timed entry; allow 1–2 hours.","For food/drink tours: meet at the starting venue; drinks and stories included."]'::jsonb,
  '["Theater fans who want to see a current show.","Visitors who want to learn Broadway history and see historic theaters.","Couples or groups looking for a private or small-group experience.","Anyone who wants a Broadway-themed food or drink tour.","Families and first-time visitors exploring the Theater District."]'::jsonb,
  '["Show tickets for musicals and plays","Theater District walking tours","Private and small-group Broadway tours","Museum of Broadway","Broadway food and drink experiences"]'::jsonb,
  '[
    {"question": "How do I get Broadway show tickets?","answer": "You can book tickets through our partners; compare prices and dates. Book in advance for popular shows. E-tickets or pickup instructions are provided after booking."},
    {"question": "Are Broadway walking tours good for first-time visitors?","answer": "Yes. Walking tours cover the history of Broadway, iconic theaters, and backstage stories. They run daily and are a great way to see the Theater District with a guide."},
    {"question": "What is the Museum of Broadway?","answer": "The Museum of Broadway is an immersive museum celebrating Broadway history, with exhibits on shows, costumes, and behind-the-scenes. Allow 1–2 hours. Timed entry is recommended."},
    {"question": "Can I do a Broadway tour and see a show in the same day?","answer": "Yes. Many walking tours run in the morning or afternoon; you can book a show for the evening. The museum is also a good daytime activity before an evening show."}
  ]'::jsonb
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

-- Food & Culture Tours (NYC) – category page (minimal; enhance with Gemini later)
INSERT INTO v3_landing_category_pages (destination_slug, category_slug, hero_description, about, insider_tips, what_to_expect, who_is_this_for, highlights, faq_json)
VALUES (
  'new-york-city',
  'food-tours',
  'Discover the best food and culture tours in New York City: Chinatown, Little Italy, Chelsea Market, Greenwich Village, East Village, Williamsburg, and more. Walking food tours and neighborhood tastings. Compare and book with free cancellation.',
  'NYC food tours combine neighborhood walks with tastings and local history. Options include Chinatown and Little Italy, Chelsea Market and the High Line, Greenwich Village, East Village, NoLita, Williamsburg, Astoria, and private or small-group experiences. Most tours run 2–3 hours and include multiple stops.',
  '["Book popular tours a few days ahead, especially on weekends.","Tours run rain or shine; wear comfortable shoes.","Tell operators about dietary restrictions when booking.","Arrive hungry—tastings often add up to a meal."]'::jsonb,
  '["Meet your guide at the designated spot.","Walk through the neighborhood with stops for tastings and stories.","Duration typically 2–3 hours; check each tour for details."]'::jsonb,
  '["Food lovers and first-time visitors.","Couples and small groups.","Anyone who wants to explore a neighborhood with a local guide."]'::jsonb,
  '["Chinatown, Chelsea Market, Greenwich Village, East Village, Williamsburg","Walking tours with tastings","Group and private options"]'::jsonb,
  '[{"question": "Are food tours suitable for vegetarians or dietary restrictions?","answer": "Many operators can accommodate restrictions if you tell them when booking. Check each tour for options."},{"question": "How long do NYC food tours last?","answer": "Most run 2–3 hours. Check the tour description for exact duration and number of stops."}]'::jsonb
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

-- Food & Culture Tours (NYC) – 13 tours; first 4 = top picks
INSERT INTO v3_landing_category_tours (destination_slug, category_slug, product_id, title, tour_slug, image_url, from_price, position, is_top_pick)
VALUES
  ('new-york-city', 'food-tours', '5620443P2', 'Chinatown Little Italy Food Adventure', 'chinatown-little-italy-food-adventure', null, null, 1, true),
  ('new-york-city', 'food-tours', '420790P2', 'Foods of NY Tours: Chelsea Market Food Tour and High Line Park', 'foods-of-ny-tours-chelsea-market-food-tour-and-high-line-park', null, null, 2, true),
  ('new-york-city', 'food-tours', '9510P2', 'Greenwich Village Walking and Food Tasting Tour', 'greenwich-village-walking-and-food-tasting-tour', null, null, 3, true),
  ('new-york-city', 'food-tours', '172715P3', 'East Village Food Tour', 'east-village-food-tour', null, null, 4, true),
  ('new-york-city', 'food-tours', '420790P3', 'NoLita''s Past and Present Food and History Tour with FNYT', 'nolitas-past-and-present-food-and-history-tour-with-fnyt', null, null, 5, false),
  ('new-york-city', 'food-tours', '384738P1', 'Greenwich Village and Washington Square Park Food Tour', 'greenwich-village-and-washington-square-park-food-tour', null, null, 6, false),
  ('new-york-city', 'food-tours', '5609990P8', 'Southeast Asian and Chinese Food Tour in NYC', 'southeast-asian-and-chinese-food-tour-in-nyc', null, null, 7, false),
  ('new-york-city', 'food-tours', '5579313P2', 'Italian American Food Tour of Williamsburg', 'italian-american-food-tour-of-williamsburg', null, null, 8, false),
  ('new-york-city', 'food-tours', '9510P6', 'Astoria Food Walking Tour in New York', 'astoria-food-walking-tour-in-new-york', null, null, 9, false),
  ('new-york-city', 'food-tours', '8501P20', 'Private Flatiron Food, History and Architecture Tour', 'private-flatiron-food-history-and-architecture-tour', null, null, 10, false),
  ('new-york-city', 'food-tours', '36720P6', 'Chinatown Private Food Tour', 'chinatown-private-food-tour', null, null, 11, false),
  ('new-york-city', 'food-tours', '417996P2', 'Village Nights: Greenwich Village Food and History Walk', 'village-nights-greenwich-village-food-and-history-walk', null, null, 12, false),
  ('new-york-city', 'food-tours', '117489P2', 'Williamsburg Food Tasting and Walking Tour', 'williamsburg-food-tasting-and-walking-tour', null, null, 13, false)
ON CONFLICT (destination_slug, category_slug, position) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  title = EXCLUDED.title,
  tour_slug = EXCLUDED.tour_slug,
  image_url = EXCLUDED.image_url,
  from_price = EXCLUDED.from_price,
  is_top_pick = EXCLUDED.is_top_pick;

-- Museum Tours (NYC) – category page
INSERT INTO v3_landing_category_pages (destination_slug, category_slug, hero_description, about, insider_tips, what_to_expect, who_is_this_for, highlights, faq_json)
VALUES (
  'new-york-city',
  'museum-tours',
  'Discover museum tours and admission in New York City: the Met, MoMA, 9/11 Memorial, Intrepid, guided and themed tours, and unique NYC museums. Compare tickets and experiences. Book with trusted partners.',
  'NYC museum options include world-class art (Met, MoMA), memorial and history (9/11 Memorial, Ground Zero), military and science (Intrepid), and unique experiences like themed Met tours and Brooklyn Seltzer Museum. Book admission tickets or guided tours; many offer skip-the-line or timed entry.',
  '["Book popular museums (Met, MoMA, 9/11 Memorial) in advance for timed entry.","Guided tours help you see highlights without overwhelm.","Check age and bag policies before you go."]'::jsonb,
  '["For admission tickets: book online; receive e-ticket or pickup instructions.","For guided tours: meet your guide at the designated spot; tour runs 1.5–2.5 hours typically."]'::jsonb,
  '["Art and history lovers.","First-time visitors who want a curated experience.","Families and groups; check age suitability per museum."]'::jsonb,
  '["Met, MoMA, 9/11 Memorial, Intrepid","Guided and themed tours","Admission tickets and skip-the-line options"]'::jsonb,
  '[{"question": "Do I need to book museum tickets in advance?","answer": "For the Met, MoMA, and 9/11 Memorial, advance booking is recommended—especially on weekends and in peak season. Timed entry is common."},{"question": "Are guided museum tours worth it?","answer": "Guided tours help you see highlights and hear context without getting lost. Themed tours (e.g. literary, biblical at the Met) offer a focused experience."}]'::jsonb
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

-- Museum Tours (NYC) – 13 tours; first 4 = top picks
INSERT INTO v3_landing_category_tours (destination_slug, category_slug, product_id, title, tour_slug, image_url, from_price, position, is_top_pick)
VALUES
  ('new-york-city', 'museum-tours', '266847P276', 'Museum of Modern Art (MoMA) Admission Ticket in New York', 'museum-of-modern-art-moma-admission-ticket-in-new-york', null, null, 1, true),
  ('new-york-city', 'museum-tours', '5577762P3', 'Guided Tour of the Metropolitan Museum of Art', 'guided-tour-of-the-metropolitan-museum-of-art', null, null, 2, true),
  ('new-york-city', 'museum-tours', '142869P8', 'Highlights of the Met Museum Tour', 'highlights-of-the-met-museum-tour', null, null, 3, true),
  ('new-york-city', 'museum-tours', '7195SEPT11', '9/11 Memorial Museum Admission Ticket', '9-11-memorial-museum-admission-ticket', null, null, 4, true),
  ('new-york-city', 'museum-tours', '198803P5', 'The Art of Stories: A Literary Tour in the Metropolitan Museum', 'the-art-of-stories-a-literary-tour-in-the-metropolitan-museum', null, null, 5, false),
  ('new-york-city', 'museum-tours', '5523522P1', 'Brooklyn Seltzer Museum Factory Tour and Tasting', 'brooklyn-seltzer-museum-factory-tour-and-tasting', null, null, 6, false),
  ('new-york-city', 'museum-tours', '198803P1', 'Griffin''s Goblet and Gold: An Interactive Magical Arts Museum Tour', 'griffins-goblet-and-gold-an-interactive-magical-arts-museum-tour', null, null, 7, false),
  ('new-york-city', 'museum-tours', '224016P28', 'The Rise Museum and Best of Manhattan Tour', 'the-rise-museum-and-best-of-manhattan-tour', null, null, 8, false),
  ('new-york-city', 'museum-tours', '255730P115', 'Metropolitan Museum of Art Private 2-Hour Guided Tour', 'metropolitan-museum-of-art-private-2-hour-guided-tour', null, null, 9, false),
  ('new-york-city', 'museum-tours', '44983P11', '9/11 Ground Zero Tour and Museum Preferred Access', '911-ground-zero-tour-and-museum-preferred-access', null, null, 10, false),
  ('new-york-city', 'museum-tours', '142869P4', 'Biblical Israel Through the Exhibits at the Met Museum', 'biblical-israel-through-the-exhibits-at-the-met-museum', null, null, 11, false),
  ('new-york-city', 'museum-tours', '35210P2', 'Intrepid Museum Admission Ticket', 'intrepid-museum-admission-ticket', null, null, 12, false),
  ('new-york-city', 'museum-tours', '30191P1', 'Museum of Sex NYC Admission Ticket', 'museum-of-sex-nyc-admission-ticket', null, null, 13, false)
ON CONFLICT (destination_slug, category_slug, position) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  title = EXCLUDED.title,
  tour_slug = EXCLUDED.tour_slug,
  image_url = EXCLUDED.image_url,
  from_price = EXCLUDED.from_price,
  is_top_pick = EXCLUDED.is_top_pick;

-- Broadway Shows (NYC) – 13 tours; first 4 = top picks
INSERT INTO v3_landing_category_tours (destination_slug, category_slug, product_id, title, tour_slug, image_url, from_price, position, is_top_pick)
VALUES
  ('new-york-city', 'broadway-shows', '3242P272', 'Buena Vista Social Club on Broadway Ticket', 'buena-vista-social-club-on-broadway-ticket', null, null, 1, true),
  ('new-york-city', 'broadway-shows', '3242P281', 'Maybe Happy Ending on Broadway Ticket', 'maybe-happy-ending-on-broadway-ticket', null, null, 2, true),
  ('new-york-city', 'broadway-shows', '3242P256', 'The Great Gatsby on Broadway Ticket', 'the-great-gatsby-on-broadway-ticket', null, null, 3, true),
  ('new-york-city', 'broadway-shows', '3242P188', 'Moulin Rouge on Broadway Ticket', 'moulin-rouge-on-broadway-ticket', null, null, 4, true),
  ('new-york-city', 'broadway-shows', '3242P315', 'Giant on Broadway Ticket', 'giant-on-broadway-ticket', null, null, 5, false),
  ('new-york-city', 'broadway-shows', '3242P327', 'Ragtime on Broadway Ticket', 'ragtime-on-broadway-ticket', null, null, 6, false),
  ('new-york-city', 'broadway-shows', '5542306P1', 'Broadway the Tour- NYC Guided Immersive Historic Walking Tour', 'broadway-the-tour-nyc-guided-immersive-historic-walking-tour', null, null, 7, false),
  ('new-york-city', 'broadway-shows', '41377P37', 'Best of Broadway Story and Secrets Small Group Experience', 'best-of-broadway-story-and-secrets-small-group-experience', null, null, 8, false),
  ('new-york-city', 'broadway-shows', '7387P4', 'Broadway Musical Theater Walking Tour', 'broadway-musical-theater-walking-tour', null, null, 9, false),
  ('new-york-city', 'broadway-shows', '368349P517', 'NYC Broadway and Show Business Private Walking Tour', 'nyc-broadway-and-show-business-private-walking-tour', null, null, 10, false),
  ('new-york-city', 'broadway-shows', '279763P1', 'The Boozy Broadway Walking Tour', 'the-boozy-broadway-walking-tour', null, null, 11, false),
  ('new-york-city', 'broadway-shows', '3242P203', 'Museum of Broadway', 'museum-of-broadway', null, null, 12, false),
  ('new-york-city', 'broadway-shows', '3242P185', 'Harry Potter and the Cursed Child on Broadway Ticket', 'harry-potter-and-the-cursed-child-on-broadway-ticket', null, null, 13, false)
ON CONFLICT (destination_slug, category_slug, position) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  title = EXCLUDED.title,
  tour_slug = EXCLUDED.tour_slug,
  image_url = EXCLUDED.image_url,
  from_price = EXCLUDED.from_price,
  is_top_pick = EXCLUDED.is_top_pick;

INSERT INTO v3_landing_category_subcategories (destination_slug, category_slug, slug, title, description, product_ids, about, faq_json, position, why_book, what_to_expect, summary_paragraph)
VALUES
  ('new-york-city', 'central-park-tours', 'bike-tours', 'Central Park bike tours', 'Compare the best bike tours and rentals in Central Park—guided tours with expert guides and self-guided options. Cover the park''s loop, Bethesda Fountain, Bow Bridge, and more. Book with free cancellation.', '["5548740P2","233384P5"]'::jsonb, 'Bike tours and rentals let you cover more of the park in less time. Guided bike tours often include stops at Bethesda Fountain, Bow Bridge, and other landmarks. The park loop is car-free and suitable for all levels.', '[{"question": "Are Central Park bike tours good for beginners?","answer": "Yes. Most Central Park bike tours are suitable for all levels. The park has flat paths and dedicated bike lanes. Rentals and guided tours include safety briefings."},{"question": "How long do Central Park bike tours last?","answer": "Guided bike tours typically run 2–3 hours. Rentals can be by the hour or for the day. Check each product for exact duration."}]'::jsonb, 1, 'Central Park''s 6-mile loop is car-free and one of the best ways to see the park. Bike tours let you cover Bethesda Fountain, Bow Bridge, the Mall, and Strawberry Fields in a single trip. Guided options add history and film-location stories; rentals give you flexibility to explore at your own pace.', '["Meet at the bike shop or meeting point; get fitted for a bike and helmet.","Follow the guide (or map) along the park loop with stops at key landmarks.","Photo stops and short talks at Bethesda Fountain, Bow Bridge, the Mall, and more.","Return to the start. Most guided tours run 2–3 hours."]'::jsonb, 'The best Central Park bike tours range from intimate guided rides with expert commentary to flexible rentals for exploring on your own. Options suit couples, families, and first-time visitors who want to see the park without walking the full loop.'),
  ('new-york-city', 'central-park-tours', 'walking-tours', 'Central Park walking tours', 'Compare the best walking tours of Central Park—guided strolls through famous landmarks and hidden corners. History, film locations, and photo stops. Book with free cancellation.', '["37907P15","147315P6"]'::jsonb, 'Walking tours are ideal for taking in the park at a relaxed pace. Guides often cover film locations, history, and seasonal highlights. Options include group and private tours.', '[{"question": "How long are Central Park walking tours?","answer": "Most walking tours run 2–2.5 hours. Some offer shorter or longer options. Check the tour description for exact duration."}]'::jsonb, 2, 'Walking tours let you experience Central Park at a relaxed pace with a local guide. You''ll hear the stories behind the Mall, Bethesda Fountain, and Bow Bridge—and discover spots most visitors miss. Ideal for first-time visitors and anyone who prefers a guided narrative to a map.', '["Meet your guide at the designated spot (often near a park entrance).","Walk through the park with stops at landmarks; your guide shares history and stories.","Photo stops and optional detours (e.g. film locations, seasonal highlights).","Return to the start. Most tours run 2–2.5 hours."]'::jsonb, 'The best Central Park walking tours combine famous sights with local storytelling. Choose between group tours for a social experience or private tours for a personalized pace and deeper dive into the park''s history and hidden corners.'),
  ('new-york-city', 'central-park-tours', 'carriage-tours', 'Central Park horse carriage rides', 'Compare the best horse-drawn carriage rides in Central Park—romantic, iconic NYC experiences. Classic routes and private options. Book with free cancellation.', '["180862P2","186327P2"]'::jsonb, 'Carriage rides offer a classic NYC experience. Rides typically follow a set route through the park and last about 45–60 minutes. Some operators offer longer or private rides.', '[{"question": "How long is a Central Park carriage ride?","answer": "Standard carriage rides are typically 45 minutes to one hour. Some operators offer longer or private rides."}]'::jsonb, 3, 'A horse-drawn carriage ride is one of the most iconic ways to see Central Park. You''ll clip-clop past the lake, Bow Bridge, and tree-lined paths without lifting a foot. Perfect for couples, proposals, and anyone who wants a romantic or nostalgic New York moment.', '["Meet at the carriage stand (typically Central Park South near the Plaza).","Board your carriage; the driver sets the route through the park.","Relax as you pass the lake, Bow Bridge, and other landmarks.","Return to the stand. Rides typically last 45–60 minutes (longer options available)."]'::jsonb, 'The best Central Park carriage rides deliver a classic New York experience: romantic, scenic, and unhurried. Compare standard loops and longer or private rides to find the right fit for a special occasion or a relaxed sightseeing hour.'),
  ('new-york-city', 'central-park-tours', 'secret-places', 'Secret places & highlights of Central Park', 'Discover the best secret-places and highlights tours of Central Park—lesser-known spots, hidden history, and areas above 100th Street. Compare and book with free cancellation.', '["86536P1","43581P4"]'::jsonb, 'Secret-places and highlights tours take you above 100th Street and to historic, scenic spots many visitors miss. Guides share the park''s lesser-known stories and corners.', '[{"question": "What are the secret places of Central Park?","answer": "Tours cover Revolutionary War forts, formal gardens, the Adirondack Mountains area, and other less-trafficked, historic spots in the park."}]'::jsonb, 4, 'Most visitors never go north of the Great Lawn. Secret-places and highlights tours take you to forts, gardens, and quiet corners that even many New Yorkers don''t know. If you want to go beyond the postcard spots and hear the park''s hidden history, these tours are for you.', '["Meet your guide at the designated spot.","Walk (or bike) to lesser-known areas—often including the North Woods, forts, or formal gardens.","Your guide shares stories and history that aren''t in the average guidebook.","Return to the start. Duration varies by tour."]'::jsonb, 'The best secret-places tours of Central Park reveal the park beyond the Mall and Bethesda. From Revolutionary War history to secluded gardens and the North Woods, these experiences are ideal for repeat visitors and anyone curious about the park''s hidden layers.'),
  ('new-york-city', 'central-park-tours', 'picnic-experiences', 'Central Park picnic experiences', 'Compare the best picnic experiences in Central Park—luxury set-ups for two and picnic-plus-bike combos. Romantic and family-friendly options. Book with free cancellation.', '["399066P1","5557P20"]'::jsonb, 'Picnic experiences range from luxury set-ups for two to full-day bike rental with a picnic box. Ideal for couples or small groups. Some include food and blankets; others add bike rental.', '[{"question": "Do I need to bring food for a Central Park picnic experience?","answer": "It depends on the product. Some include a picnic box; others are setup-only with optional add-ons. Check each tour for details."}]'::jsonb, 5, 'A picnic in Central Park is a classic New York experience. Book a curated setup and you get a scenic spot, blankets, and often food and drinks—no packing required. Add a bike rental and you can explore before or after your picnic. Perfect for dates, proposals, or a relaxed afternoon with family or friends.', '["Arrive at the designated picnic spot (or meet for bike pickup first).","Your setup may include blankets, cushions, and a picnic spread.","Enjoy your meal and the park views; stay as long as your package allows.","Pack up or leave the cleanup to the operator, depending on the product."]'::jsonb, 'The best Central Park picnic experiences range from full luxury setups for two to bike-and-picnic combos. Whether you want a romantic spread by the lake or a family-friendly day with bikes and a picnic box, compare options to find the right fit.'),
  ('new-york-city', 'central-park-tours', 'family-tours', 'Central Park tours for families', 'Compare the best family-friendly Central Park tours—walking, bike, and carriage options designed for kids and parents. Engaging guides and flexible pacing. Book with free cancellation.', '["5548740P2","37907P15","147315P6"]'::jsonb, 'Family tours often include stories, games, and stops that keep kids engaged. Many walking and bike tours welcome children; check age requirements. Carriage rides are also popular with families.', '[{"question": "Are Central Park tours suitable for young children?","answer": "Many walking and bike tours welcome families. Carriage rides are also popular with kids. Check each tour for minimum age and whether strollers are allowed."}]'::jsonb, 6, 'Central Park is one of the most family-friendly places in New York. Guided walking and bike tours can be tailored to kids with stories, games, and photo stops. Carriage rides are a hit with little ones. Choose a tour that matches your kids'' ages and energy so everyone enjoys the park.', '["Meet your guide or pick up bikes; brief orientation.","Explore the park with stops geared to families—stories, photo ops, and rest breaks.","Guides often adjust pace and content based on the group.","Return to the start. Duration varies; many tours run 2–2.5 hours."]'::jsonb, 'The best Central Park tours for families combine sightseeing with engagement—guides who keep kids interested, bike or walking options that aren''t too long, and the option of a carriage ride for a relaxed, iconic experience. Compare options by age and pace.'),
  ('new-york-city', 'central-park-tours', 'running-tours', 'Central Park running tours', 'Compare the best running tours of Central Park—guided 5K-style runs past Bethesda Fountain, the Mall, and iconic landmarks. Active sightseeing with a local guide. Book with free cancellation.', '["22253P4"]'::jsonb, 'Running tours let you sightsee while you run. Guides set a casual pace and stop at key spots for short talks. Ideal for runners who want to combine a workout with Central Park history and views.', '[]'::jsonb, 7, 'Central Park is a runner''s paradise. A guided running tour lets you log miles while hitting the park''s most famous spots—Bethesda Fountain, the Mall, Strawberry Fields—with a local who shares stories at each stop. Perfect if you don''t want to choose between a run and sightseeing.', '["Meet your guide at the designated spot; quick intro and stretch if needed.","Run at a casual pace with stops at landmarks for short commentary.","Photo ops and water breaks as needed.","Finish back at the start. Most running tours are about 5K and last 1–1.5 hours."]'::jsonb, 'The best Central Park running tours combine a 5K-style run with guided sightseeing. You''ll pass the Mall, Bethesda Fountain, and other icons at a comfortable pace with a local guide. Ideal for runners visiting NYC who want to see the park without sacrificing their morning run.'),
  ('new-york-city', 'central-park-tours', 'yoga-in-central-park', 'Yoga in Central Park', 'Compare the best yoga experiences in Central Park—walking tours with yoga and meditation, and yoga classes with skyline views. Mindful movement in the park. Book with free cancellation.', '["22253P1","359827P1"]'::jsonb, 'Yoga in Central Park ranges from walking tours that include restorative yoga and meditation in serene spots to dedicated yoga classes with skyline views. Small groups and experienced instructors make these experiences accessible to all levels.', '[{"question": "Do I need yoga experience for Central Park yoga tours?","answer": "Most Central Park yoga experiences welcome all levels. Walking-and-yoga tours and outdoor classes are designed to be accessible. Check each product for details."},{"question": "What should I bring to a Central Park yoga class?","answer": "Wear comfortable clothes. Some operators provide mats; others offer rentals. Bring water and sunscreen. Check your confirmation for mat and prop details."}]'::jsonb, 8, 'Practicing yoga in Central Park is a unique way to connect with the city—nature, skyline views, and mindful movement in one experience. Options include walking tours that blend yoga and meditation in quiet corners of the park, and dedicated yoga classes with iconic views. Ideal for wellness-minded travelers and anyone who wants a calm start to the day.', '["Meet your guide or instructor at the designated spot (often near a park entrance or landmark).","For walking-and-yoga: walk to serene spots; pause for yoga flows and meditation.","For yoga classes: set up in a scenic location; class runs about 1–1.5 hours.","Wrap up and enjoy the park. Mats may be provided or available to rent."]'::jsonb, 'The best yoga experiences in Central Park range from walking tours with restorative yoga and meditation to dedicated outdoor classes with skyline views. Whether you want a gentle stretch after a stroll or a full class in the park, compare options to find the right level and style.'),
  -- Broadway Shows (NYC) – 6 subcategories
  ('new-york-city', 'broadway-shows', 'show-tickets', 'Broadway show tickets', 'Compare Broadway show tickets in New York City—current hits and popular shows. Buena Vista Social Club, Maybe Happy Ending, The Great Gatsby, and more. Book with trusted partners and secure your seats in advance.', '["3242P272","3242P281","3242P256","3242P185"]'::jsonb, 'Show tickets let you see Broadway productions in person. Options include musicals, plays, and limited runs. Book in advance for the best availability; e-tickets or pickup instructions are provided after booking.', '[{"question": "How far in advance should I book Broadway show tickets?","answer": "For popular shows and weekend performances, book at least a few days to a week ahead. Peak season and new hits sell out quickly."},{"question": "Will I get e-tickets or physical tickets?","answer": "It depends on the show and operator. Many bookings provide e-tickets; others offer will-call or pickup. Your confirmation will specify."}]'::jsonb, 1, 'Seeing a show on Broadway is a quintessential New York experience. Booking through a trusted partner lets you compare prices and dates and secure your seats before you travel. Current hits and long-running favorites are all available—book early for the best choice.', '["Choose your show and date; complete your booking.","Receive confirmation and e-tickets or pickup instructions.","Arrive at the theater with your ticket and ID.","Enjoy the show. Plan to arrive a little early for security and seating."]'::jsonb, 'The best Broadway show tickets give you access to current hits and beloved musicals and plays. Compare Buena Vista Social Club, Maybe Happy Ending, The Great Gatsby, and other top shows—and book with confidence for your New York theater night.'),
  ('new-york-city', 'broadway-shows', 'broadway-musicals', 'Broadway musicals', 'Compare Broadway musical tickets in NYC—Moulin Rouge, Giant, Ragtime, and more. Hit musicals with top casts and unforgettable scores. Book with free cancellation where available.', '["3242P188","3242P315","3242P327"]'::jsonb, 'Broadway musicals range from long-running spectacles to new productions. These options include Moulin Rouge!, Giant, and Ragtime—each with full orchestras, elaborate sets, and star performances.', '[{"question": "What is the difference between a musical and a play on Broadway?","answer": "Musicals include singing and often dancing as part of the story. Plays are typically spoken drama. All are performed in Broadway theaters with professional casts."}]'::jsonb, 2, 'Broadway musicals are the pinnacle of American theater. Booking tickets to Moulin Rouge, Giant, Ragtime, or other hit musicals ensures an unforgettable evening of song, story, and spectacle. Compare dates and prices to find the right show for your trip.', '["Select your musical and performance date.","Complete your booking; receive confirmation and tickets.","Arrive at the theater with your ticket and ID.","Enjoy the performance. Most musicals run 2–2.5 hours plus intermission."]'::jsonb, 'The best Broadway musical tickets put you in the room for Moulin Rouge, Giant, Ragtime, and more. Compare options and book in advance for the best seats and availability on your chosen date.'),
  ('new-york-city', 'broadway-shows', 'walking-tours', 'Broadway walking tours', 'Compare Broadway walking tours in NYC—guided strolls through the Theater District, historic theaters, and backstage stories. Broadway the Tour, Musical Theater Walking Tour, and Best of Broadway Story and Secrets. Book with trusted partners.', '["5542306P1","7387P4","41377P37"]'::jsonb, 'Walking tours take you through the heart of the Theater District with expert guides. You will see historic theaters, hear backstage stories, and learn how Broadway works. Options include immersive audio tours and small-group experiences.', '[{"question": "How long do Broadway walking tours last?","answer": "Most Broadway walking tours run 1.5–2.5 hours. Check each product for exact duration and meeting point."},{"question": "Do walking tours include show tickets?","answer": "No. Walking tours are separate from show tickets. You can book both—many visitors do a walking tour by day and a show in the evening."}]'::jsonb, 3, 'A Broadway walking tour is the best way to learn the history and secrets of the Theater District. Expert guides lead you past legendary theaters and share stories you won''t find in a guidebook. Ideal before or after seeing a show.', '["Meet your guide at the designated spot (often near Times Square or a landmark).","Walk through the Theater District; your guide shares history and backstage stories.","See historic theaters and iconic sites; ask questions along the way.","Tour ends near the start or at a central location. Most run 1.5–2.5 hours."]'::jsonb, 'The best Broadway walking tours combine theater history with behind-the-scenes stories. Compare Broadway the Tour, the Broadway Musical Theater Walking Tour, and the Best of Broadway Story and Secrets for an immersive Theater District experience.'),
  ('new-york-city', 'broadway-shows', 'private-tours', 'Broadway private & small group tours', 'Compare private and small-group Broadway experiences in NYC—dedicated guides, personalized pacing, and in-depth Theater District tours. Ideal for couples, families, and theater fans who want a tailored experience.', '["368349P517","41377P37"]'::jsonb, 'Private and small-group tours offer a more intimate way to explore Broadway. Your guide focuses on your interests—whether show business history, celebrity stories, or the inner workings of Broadway. Groups are capped so you can ask plenty of questions.', '[{"question": "What is included in a private Broadway tour?","answer": "Private tours typically include a dedicated guide, a custom or set route through the Theater District, and stories tailored to your group. Show tickets are not included unless specified."}]'::jsonb, 4, 'Private and small-group Broadway tours give you undivided attention from an expert guide. Perfect for serious theater fans, families, or anyone who wants to go deeper than a standard walking tour—without the crowds.', '["Meet your guide at the agreed or designated spot.","Your guide leads you through the Theater District at your pace.","Stops at theaters and landmarks; stories and Q&A tailored to your group.","Tour ends at a central location. Duration varies; often 1.5–2 hours."]'::jsonb, 'The best private and small-group Broadway tours offer personalized pacing and in-depth stories. Compare dedicated private walking tours and capped small-group experiences to find the right fit for your visit.'),
  ('new-york-city', 'broadway-shows', 'food-and-drink-tours', 'Broadway food and drink tours', 'Compare Broadway-themed food and drink tours in NYC—cocktails, stories, and the Theater District. The Boozy Broadway Walking Tour and more. Ages 21+ for alcohol; non-drinker options available. Book with trusted partners.', '["279763P1"]'::jsonb, 'Food and drink tours combine Broadway history with stops at bars and venues in the Theater District. Guides share stories about shows and stars while you enjoy a drink. Non-drinker tickets are often available at a lower price.', '[{"question": "Do I need to be 21 for Broadway food and drink tours?","answer": "To consume alcohol, yes. Some tours offer a non-drinker ticket for under-21 or non-drinking guests—check each product."}]'::jsonb, 5, 'A Broadway-themed food and drink tour is a fun way to see the Theater District with a cocktail in hand. Expert guides mix theater history with bar stops and celebrity lore. Ideal for groups and anyone who wants a social, relaxed Broadway experience.', '["Meet your guide at the starting venue (e.g. a bar in the Theater District).","Enjoy a drink while your guide shares Broadway stories and history.","Walk to additional stops; more drinks and stories.","Tour ends at a central location. Most run about 2 hours."]'::jsonb, 'The best Broadway food and drink tours blend Theater District history with cocktails and local venues. The Boozy Broadway Walking Tour is a top choice for a fun, social way to explore Broadway—with drink and non-drinker options.'),
  ('new-york-city', 'broadway-shows', 'museum-of-broadway', 'Museum of Broadway', 'Visit the Museum of Broadway in New York City—immersive exhibits on Broadway history, costumes, and behind-the-scenes. Ideal before or after a show. Timed entry; allow 1–2 hours. Book with trusted partners.', '["3242P203"]'::jsonb, 'The Museum of Broadway is an immersive museum in the Theater District celebrating the history of Broadway. Exhibits cover iconic shows, costumes, and the people who make theater. Timed entry helps manage crowds; allow 1–2 hours for a full visit.', '[{"question": "How long does a visit to the Museum of Broadway take?","answer": "Most visitors spend 1–2 hours. Timed entry is used; book in advance for your preferred slot."},{"question": "Is the Museum of Broadway good for kids?","answer": "Yes. The museum is family-friendly with interactive and visual exhibits. Check the museum''s current age recommendations."}]'::jsonb, 6, 'The Museum of Broadway is the only museum dedicated to Broadway history in the heart of the Theater District. It is the perfect complement to a show—visit by day and see a performance at night. A must for theater fans of all ages.', '["Book your timed entry slot in advance.","Arrive at the museum at your scheduled time; present your ticket.","Explore the exhibits at your own pace—costumes, sets, and Broadway history.","Allow 1–2 hours. The museum is in the Theater District, easy to combine with a show."]'::jsonb, 'The Museum of Broadway offers an immersive look at Broadway history, from early days to current hits. Book timed entry and allow 1–2 hours—ideal before or after seeing a show in the Theater District.'),
  -- Food & Culture Tours (NYC) – 6 subcategories
  ('new-york-city', 'food-tours', 'chinatown-asian-food', 'Chinatown & Asian food tours', 'Chinatown, Little Italy, and Asian food tours in NYC. Group and private options. Compare and book with free cancellation.', '["5620443P2","5609990P8","36720P6"]'::jsonb, 'Explore Chinatown and nearby neighborhoods with tastings and local history. Options include Little Italy combos, Southeast Asian and Chinese food tours, and private Chinatown experiences.', '[]'::jsonb, 1, null, '["Meet at the designated spot.","Walk through Chinatown (and optional Little Italy or other areas) with tastings and stories.","Most tours run 2–3 hours."]'::jsonb, 'Compare Chinatown and Asian food tours in New York City—group and private options with tastings and neighborhood history.'),
  ('new-york-city', 'food-tours', 'greenwich-village-food', 'Greenwich Village food tours', 'Greenwich Village and Washington Square Park food and history tours. Day and evening options. Book with free cancellation.', '["384738P1","9510P2","417996P2"]'::jsonb, 'Greenwich Village food tours combine tastings with neighborhood history and culture. Options include Washington Square Park area, walking and food tasting tours, and evening Village walks.', '[]'::jsonb, 2, null, '["Meet your guide in the Village.","Walk and taste with stops for history and stories.","Duration typically 2–3 hours."]'::jsonb, 'The best Greenwich Village food tours blend tastings with local history. Compare daytime and evening options.'),
  ('new-york-city', 'food-tours', 'chelsea-market-high-line', 'Chelsea Market & High Line', 'Chelsea Market food tour and High Line Park. Tastings and neighborhood exploration. Book with trusted partners.', '["420790P2"]'::jsonb, 'Chelsea Market and High Line food tours take you through the market and nearby area with tastings and context. A popular NYC experience.', '[]'::jsonb, 3, null, '["Meet at the designated spot.","Explore Chelsea Market and the High Line with tastings.","Tour runs approximately 3 hours."]'::jsonb, 'Compare Chelsea Market and High Line food tours—tastings and neighborhood exploration in one of NYC''s most popular areas.'),
  ('new-york-city', 'food-tours', 'williamsburg-brooklyn-food', 'Williamsburg & Brooklyn food tours', 'Williamsburg and Brooklyn food tours: Italian American, food tasting and walking tours. Compare and book.', '["5579313P2","117489P2"]'::jsonb, 'Williamsburg food tours cover the neighborhood''s diverse food scene and history. Options include Italian American heritage tours and general food tasting and walking tours.', '[]'::jsonb, 4, null, '["Meet in Williamsburg.","Walk and taste with stops for stories.","Most tours run 2–3 hours."]'::jsonb, 'Compare Williamsburg and Brooklyn food tours—Italian American and general tasting tours in one of NYC''s most popular neighborhoods.'),
  ('new-york-city', 'food-tours', 'east-village-nolita', 'East Village & NoLita food tours', 'East Village and NoLita food and history tours. Neighborhood tastings and local stories. Book with free cancellation.', '["172715P3","420790P3"]'::jsonb, 'East Village and NoLita food tours combine tastings with neighborhood history. Options include dedicated East Village tours and NoLita past-and-present food and history experiences.', '[]'::jsonb, 5, null, '["Meet your guide.","Walk through East Village or NoLita with tastings.","Duration typically 2–3 hours."]'::jsonb, 'Compare East Village and NoLita food tours—neighborhood tastings and history in two of Manhattan''s most vibrant areas.'),
  ('new-york-city', 'food-tours', 'private-astoria-flatiron', 'Private tours & Astoria', 'Private food tours and Astoria food walking tours. Flatiron, Astoria, and tailored experiences. Compare and book.', '["8501P20","9510P6"]'::jsonb, 'Private food tours offer a dedicated guide and customizable pace. Astoria food walking tours explore Queens with tastings and local flavor.', '[]'::jsonb, 6, null, '["Meet your guide (private) or at the group meeting point.","Walk and taste; private tours can be tailored.","Duration varies by tour."]'::jsonb, 'Compare private food tours and Astoria food walking tours—tailored experiences and Queens neighborhood tastings.'),
  -- Museum Tours (NYC) – 6 subcategories
  ('new-york-city', 'museum-tours', 'moma-modern-art', 'MoMA & modern art', 'MoMA admission and modern art museum experiences in NYC. Compare tickets and tours. Book with trusted partners.', '["266847P276","224016P28"]'::jsonb, 'MoMA and related experiences: admission to the Museum of Modern Art and combined Rise Museum and Manhattan tours.', '[]'::jsonb, 1, null, '["Book your ticket or tour.","Arrive at the museum; timed entry may apply.","Explore at your own pace or with a guide."]'::jsonb, 'Compare MoMA admission and modern art museum experiences in New York City.'),
  ('new-york-city', 'museum-tours', 'met-guided-highlights', 'Met Museum guided & highlights', 'Guided and highlights tours of the Metropolitan Museum of Art. See the best of the Met with an expert. Book with free cancellation.', '["5577762P3","142869P8"]'::jsonb, 'Guided and highlights tours of the Met help you cover key galleries and masterpieces without getting lost. Options include general guided tours and dedicated highlights experiences.', '[]'::jsonb, 2, null, '["Meet your guide at the Met.","Follow the guide through selected galleries.","Tour typically runs 1.5–2.5 hours."]'::jsonb, 'Compare guided and highlights tours of the Metropolitan Museum of Art—see the best of the Met with an expert.'),
  ('new-york-city', 'museum-tours', 'met-themed-tours', 'Met themed tours', 'Themed Met Museum tours: literary, biblical, and focused experiences. Explore the Met through a specific lens. Book with trusted partners.', '["198803P5","142869P4"]'::jsonb, 'Themed tours at the Met focus on a topic—e.g. literature, biblical art—so you see the collection through a curated narrative.', '[]'::jsonb, 3, null, '["Meet your guide at the Met.","Tour focuses on a theme (literary, biblical, etc.).","Duration varies; often 2 hours."]'::jsonb, 'Compare themed Met Museum tours—literary, biblical, and other focused experiences at the Metropolitan Museum of Art.'),
  ('new-york-city', 'museum-tours', 'met-private-special', 'Met private & special experiences', 'Private Met tours and interactive special experiences. Magical arts tour and dedicated guide. Book with free cancellation.', '["255730P115","198803P1"]'::jsonb, 'Private Met tours give you a dedicated guide; special experiences like the magical arts tour offer an interactive, themed way to explore the museum.', '[]'::jsonb, 4, null, '["Meet your guide; private or small group.","Experience the Met with a tailored or themed itinerary.","Duration typically 2 hours."]'::jsonb, 'Compare private and special Met Museum experiences—dedicated guides and interactive themed tours.'),
  ('new-york-city', 'museum-tours', '911-memorial', '9/11 Memorial & Ground Zero', '9/11 Memorial Museum admission and Ground Zero tours with museum access. Compare tickets and guided experiences. Book with trusted partners.', '["44983P11","7195SEPT11"]'::jsonb, '9/11 Memorial Museum admission and Ground Zero tours with preferred museum access. Options include admission-only and guided tour plus museum entry.', '[]'::jsonb, 5, null, '["Book admission or tour.","Arrive at the 9/11 Memorial area; museum has timed entry.","Allow 1.5–2+ hours for the museum."]'::jsonb, 'Compare 9/11 Memorial Museum admission and Ground Zero tours with museum access—tickets and guided experiences.'),
  ('new-york-city', 'museum-tours', 'intrepid-unique-museums', 'Intrepid & unique NYC museums', 'Intrepid Museum, Brooklyn Seltzer Museum, Museum of Sex, and other unique NYC museum experiences. Compare admission and tours.', '["35210P2","5523522P1","30191P1"]'::jsonb, 'Beyond the major art museums: Intrepid Sea, Air & Space Museum; Brooklyn Seltzer Museum factory tour and tasting; Museum of Sex; and other unique NYC options.', '[]'::jsonb, 6, null, '["Book your ticket or tour.","Arrive at the museum; check age and access policies.","Experience varies by venue."]'::jsonb, 'Compare Intrepid Museum and other unique NYC museum experiences—admission and special tours.')
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
