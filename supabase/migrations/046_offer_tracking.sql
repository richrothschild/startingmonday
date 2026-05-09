-- Structured offer fields on each company (shown when stage = 'offer')
ALTER TABLE companies ADD COLUMN IF NOT EXISTS offer_role_title  text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS offer_base        integer;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS offer_bonus_pct   integer;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS offer_signing     integer;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS offer_equity      text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS offer_notes       text;
