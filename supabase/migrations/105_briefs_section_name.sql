-- Add section_name to briefs so per-section prep brief ratings can be tracked by section
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS section_name TEXT;

-- Add section_name to brief_quality_log for section-level quality analytics
ALTER TABLE brief_quality_log ADD COLUMN IF NOT EXISTS section_name TEXT;

-- Index for querying ratings by section
CREATE INDEX IF NOT EXISTS idx_briefs_section_name ON briefs (section_name) WHERE section_name IS NOT NULL;
