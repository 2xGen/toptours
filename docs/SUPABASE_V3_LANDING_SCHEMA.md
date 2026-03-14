# Supabase schema: TopTours 3.0 landing pages (v3_*)

Used for the new tour-focused landing template (e.g. NYC: 6 top picks + 12 categories). Data lives in Supabase for scalability; same structure can power more destinations later.

Run the following in the Supabase SQL editor (or as a migration).

---

## 1. Tables

```sql
-- Landing destination config (one row per destination, e.g. new-york-city)
CREATE TABLE IF NOT EXISTS v3_landing_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  meta_title text,
  meta_description text,
  hero_title text,
  hero_subtitle text,
  hero_cta_text text DEFAULT 'Find tours',
  og_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Top picks for a destination (up to 6; order by position)
CREATE TABLE IF NOT EXISTS v3_landing_top_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug text NOT NULL REFERENCES v3_landing_destinations(slug) ON DELETE CASCADE,
  product_id text NOT NULL,
  position smallint NOT NULL DEFAULT 1,
  title_override text,
  image_url_override text,
  from_price_override text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(destination_slug, position)
);

CREATE INDEX IF NOT EXISTS idx_v3_landing_top_picks_destination
  ON v3_landing_top_picks(destination_slug);

-- Categories for a destination (e.g. 12 for NYC; order by position)
CREATE TABLE IF NOT EXISTS v3_landing_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug text NOT NULL REFERENCES v3_landing_destinations(slug) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  icon_name text,
  position smallint NOT NULL DEFAULT 1,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(destination_slug, slug)
);

CREATE INDEX IF NOT EXISTS idx_v3_landing_categories_destination
  ON v3_landing_categories(destination_slug);
```

---

## 2. NYC seed (run after tables exist)

```sql
-- Insert NYC destination
INSERT INTO v3_landing_destinations (slug, name, meta_title, meta_description, hero_title, hero_subtitle, hero_cta_text, og_image_url)
VALUES (
  'new-york-city',
  'New York City',
  'Best Tours & Excursions in New York City | Top-Rated NYC Activities',
  'Discover the best tours and excursions in New York City. Compare Central Park, Broadway, food tours, cruises & more. Book with free cancellation.',
  'Best Tours & Excursions in New York City',
  'Compare top-rated NYC tours — Central Park, Broadway, food tours, cruises & more. Book with free cancellation.',
  'Find tours',
  'https://toptours.ai/OG%20Images/TopTours%20Destinations.jpg'
)
ON CONFLICT (slug) DO UPDATE SET
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle,
  updated_at = now();

-- Top 6 picks: add product_id and position (title/image/price can come from Viator or overrides)
-- Replace product_id placeholders with real Viator product codes after you choose tours
INSERT INTO v3_landing_top_picks (destination_slug, product_id, position)
VALUES
  ('new-york-city', '3483P1', 1),
  ('new-york-city', '3721P1', 2),
  ('new-york-city', '26146P3', 3),
  ('new-york-city', '54570P16', 4),
  ('new-york-city', '38421P4', 5),
  ('new-york-city', '18421P4', 6)
ON CONFLICT (destination_slug, position) DO UPDATE SET product_id = EXCLUDED.product_id;

-- 12 NYC categories (slug used in URL: /explore/new-york-city/{slug})
INSERT INTO v3_landing_categories (destination_slug, slug, title, description, position)
VALUES
  ('new-york-city', 'central-park-tours', 'Central Park Tours', 'Bike, walk, and horse-drawn carriage tours in Central Park.', 1),
  ('new-york-city', 'broadway-shows', 'Broadway Shows', 'Musicals, plays, and theater district experiences.', 2),
  ('new-york-city', 'food-tours', 'Food & Culture Tours', 'Food tours, Chelsea Market, Chinatown, and neighborhood tastings.', 3),
  ('new-york-city', 'museum-tours', 'Museum Tours', 'MET, MoMA, Natural History, and museum passes.', 4),
  ('new-york-city', 'statue-of-liberty-harbor', 'Statue of Liberty & Harbor', 'Ferry, Ellis Island, harbor cruises, and skyline views.', 5),
  ('new-york-city', 'walking-neighborhoods', 'Walking & Neighborhoods', 'Downtown, Brooklyn, Harlem, and street art tours.', 6),
  ('new-york-city', 'night-skyline', 'Night & Skyline', 'Rooftop bars, night bus, helicopter, and sunset cruises.', 7),
  ('new-york-city', 'day-trips', 'Day Trips', 'Hamptons, Hudson Valley, Philadelphia, and Niagara.', 8),
  ('new-york-city', 'family-kids', 'Family & Kids', 'Kid-friendly tours, museums, and boat experiences.', 9),
  ('new-york-city', 'helicopter-views', 'Helicopter & Views', 'Helicopter tours and skyline experiences.', 10),
  ('new-york-city', 'cruises-water', 'Cruises & Water', 'Harbor cruises, sunset sails, and Circle Line.', 11),
  ('new-york-city', 'brooklyn-tours', 'Brooklyn Tours', 'DUMBO, Williamsburg, food, and street art in Brooklyn.', 12)
ON CONFLICT (destination_slug, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  updated_at = now();
```

---

## 3. RLS (optional)

If you use Row Level Security, allow public read for these tables:

```sql
ALTER TABLE v3_landing_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE v3_landing_top_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE v3_landing_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read v3_landing_destinations"
  ON v3_landing_destinations FOR SELECT USING (is_active = true);

CREATE POLICY "Public read v3_landing_top_picks"
  ON v3_landing_top_picks FOR SELECT USING (true);

CREATE POLICY "Public read v3_landing_categories"
  ON v3_landing_categories FOR SELECT USING (true);
```

If your project does not use RLS on these tables, you can skip this section.
