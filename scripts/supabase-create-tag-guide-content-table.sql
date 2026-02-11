-- Tag guide content: on-demand generated guides for (destination + Viator tag)
-- Same template as category guides; content generated on first page load via Gemini and cached here.

CREATE TABLE IF NOT EXISTS tag_guide_content (
  id BIGSERIAL PRIMARY KEY,
  destination_id TEXT NOT NULL,
  tag_slug TEXT NOT NULL,
  tag_name_en TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(destination_id, tag_slug)
);

CREATE INDEX IF NOT EXISTS idx_tag_guide_content_destination ON tag_guide_content(destination_id);
CREATE INDEX IF NOT EXISTS idx_tag_guide_content_tag_slug ON tag_guide_content(tag_slug);

COMMENT ON TABLE tag_guide_content IS 'On-demand generated guide content for destination + tag (e.g. Coffee & Tea Tours in Tanah Rata). Generated on first visit via Gemini, then served from cache.';
