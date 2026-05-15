-- A1-4: Add user_id attribution to testimonials so feedback is traceable.
-- Nullable so existing rows without a user are preserved.

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
