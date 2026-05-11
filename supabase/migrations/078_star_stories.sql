-- STAR story vault: structured interview stories stored on user_profiles.
-- Schema: [{ id, situation, action, result, tags[] }]
-- Injected into prep brief prompts so "Likely Questions" can reference specific stories.

alter table user_profiles
  add column if not exists star_stories jsonb not null default '[]'::jsonb;
