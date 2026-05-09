CREATE TABLE IF NOT EXISTS company_interview_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company_id    uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  interview_date date,
  interview_stage text,
  questions_asked text,
  what_landed   text,
  what_surprised text,
  follow_up_needed text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE company_interview_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_interview_logs" ON company_interview_logs
  FOR ALL USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS company_interview_logs_company_user
  ON company_interview_logs (company_id, user_id);
