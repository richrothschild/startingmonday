-- Computed weekly momentum score (0-100) and when it was last calculated
alter table user_profiles add column if not exists momentum_score integer;
alter table user_profiles add column if not exists momentum_computed_at timestamptz;
