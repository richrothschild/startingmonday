-- Qualitative decision factors on offers (relocation, family, career trajectory, etc.)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS offer_decision_factors text;
