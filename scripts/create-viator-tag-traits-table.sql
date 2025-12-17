-- Viator Tag Traits Table
-- Stores AI-classified trait scores for each Viator tag
-- Used for personalized tour matching based on user preferences

CREATE TABLE IF NOT EXISTS viator_tag_traits (
  tag_id INTEGER PRIMARY KEY, -- Viator tag ID
  tag_name_en TEXT NOT NULL, -- English tag name
  parent_tag_ids INTEGER[], -- Array of parent tag IDs (hierarchical structure)
  
  -- Trait scores (0-100, where 50 = balanced/mid-range)
  -- Single axes (not dual) to avoid double-counting
  adventure_score INTEGER DEFAULT 50, -- 0=relaxed, 50=balanced, 100=adventurous
  relaxation_exploration_score INTEGER DEFAULT 50, -- 0=relax, 50=balanced, 100=explore
  group_intimacy_score INTEGER DEFAULT 50, -- 0=big groups, 50=either, 100=private/small
  price_comfort_score INTEGER DEFAULT 50, -- 0=budget, 50=mid-range, 100=luxury
  guidance_score INTEGER DEFAULT 50, -- 0=independent, 50=mixed, 100=guided
  food_drink_score INTEGER DEFAULT 50, -- 0=not important, 50=nice to have, 100=very important
  
  -- Classification metadata
  gemini_classification JSONB, -- Store Low/Medium/High mappings from Gemini
  tag_weight DECIMAL(3,2) DEFAULT 1.0, -- For downweighting generic tags (e.g., "Sightseeing" = 0.5)
  is_generic BOOLEAN DEFAULT FALSE, -- Flag for generic/low-value tags
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_viator_tag_traits_tag_id ON viator_tag_traits(tag_id);
CREATE INDEX IF NOT EXISTS idx_viator_tag_traits_tag_name ON viator_tag_traits(tag_name_en);

-- Add comment
COMMENT ON TABLE viator_tag_traits IS 'AI-classified trait scores for Viator tags. Used to calculate tour profiles and match with user preferences.';

