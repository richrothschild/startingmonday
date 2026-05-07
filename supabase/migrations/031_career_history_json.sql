-- PQ2: Structured, executive-verified career history stored alongside raw resume text.
-- When present, prep briefs use these entries instead of raw resume text.
-- The AI treats verified entries as authoritative and does not infer or contradict them.

alter table user_profiles
  add column if not exists career_history_json jsonb;
