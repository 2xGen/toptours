DO $$ BEGIN
  ALTER TABLE v3_landing_category_tours ADD COLUMN why_we_recommend text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
