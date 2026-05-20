-- Add prep_section to the briefs type check constraint
-- Previously only 'strategy', 'prep', 'outreach' were allowed
ALTER TABLE briefs DROP CONSTRAINT IF EXISTS briefs_type_check;
ALTER TABLE briefs ADD CONSTRAINT briefs_type_check
  CHECK (type IN ('strategy', 'prep', 'prep_section', 'outreach'));
