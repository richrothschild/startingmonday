-- EA-Q3-001: claim-level provenance for prep briefs
ALTER TABLE public.briefs
  ADD COLUMN IF NOT EXISTS provenance_version integer,
  ADD COLUMN IF NOT EXISTS claim_provenance jsonb;

CREATE INDEX IF NOT EXISTS idx_briefs_claim_provenance_gin
  ON public.briefs USING gin (claim_provenance)
  WHERE claim_provenance IS NOT NULL;
