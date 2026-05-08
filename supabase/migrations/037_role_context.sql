-- role_context stores function-specific interview prep details (CISO frameworks,
-- CPO metrics, COO mandate types, etc.) as a flexible JSONB object.
-- Referenced in profile actions and prep brief generation.

alter table public.user_profiles
  add column if not exists role_context jsonb;
