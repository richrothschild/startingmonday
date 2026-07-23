-- Persist policy acceptance metadata for legal/privacy auditability.
-- These fields are written during signup and OAuth callback flows.

alter table public.users
  add column if not exists accepted_terms_version text,
  add column if not exists accepted_privacy_version text,
  add column if not exists policy_accepted_at timestamptz;

create index if not exists idx_users_policy_accepted_at
  on public.users(policy_accepted_at);

create index if not exists idx_users_policy_versions
  on public.users(accepted_terms_version, accepted_privacy_version);
