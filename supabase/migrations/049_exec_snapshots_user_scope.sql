-- Scope exec_snapshots by user_id to prevent cross-user data contamination.
-- Without user_id, two users watching the same company share one snapshot row,
-- causing incorrect departure/hire diffs across user boundaries.

ALTER TABLE public.exec_snapshots ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Orphaned rows (from before this migration) carry no PII and serve only as
-- diff baselines. Delete them so the NOT NULL constraint can be applied cleanly.
-- The next signal-job run creates fresh user-scoped snapshots.
DELETE FROM public.exec_snapshots WHERE user_id IS NULL;

ALTER TABLE public.exec_snapshots ALTER COLUMN user_id SET NOT NULL;

-- Replace the company-date unique constraint with a user-scoped one
ALTER TABLE public.exec_snapshots DROP CONSTRAINT exec_snapshots_company_id_snapshot_date_key;
ALTER TABLE public.exec_snapshots ADD CONSTRAINT exec_snapshots_company_user_snapshot_key
  UNIQUE (company_id, user_id, snapshot_date);

-- Update the index to include user_id
DROP INDEX IF EXISTS idx_exec_snapshots_company_date;
CREATE INDEX idx_exec_snapshots_company_user_date
  ON public.exec_snapshots (company_id, user_id, snapshot_date DESC);

-- Enable RLS — worker uses service role and bypasses this automatically
ALTER TABLE public.exec_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own exec snapshots"
  ON public.exec_snapshots FOR SELECT
  USING (user_id = auth.uid());
