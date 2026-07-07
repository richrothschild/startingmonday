-- Multi-select role tracks chosen during onboarding (Phase 1 of onboarding rebuild).
-- First element mirrors user_profiles.role_title (primary track) for backward compatibility.
alter table user_profiles add column if not exists target_role_tracks text[];
