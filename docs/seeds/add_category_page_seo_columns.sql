-- Add SEO and top-picks copy columns to v3_landing_category_pages.
-- Run in Supabase SQL editor before using generate-explore-category-seo-gemini.js.
-- Used for: unique meta title/description, and varied "top picks" heading/subtext (e.g. "AI picks", "Insider picks").

DO $$ BEGIN ALTER TABLE v3_landing_category_pages ADD COLUMN seo_meta_title text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_pages ADD COLUMN seo_meta_description text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_pages ADD COLUMN top_picks_heading text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE v3_landing_category_pages ADD COLUMN top_picks_subtext text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
