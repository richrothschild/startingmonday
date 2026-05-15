-- A2-2 through A2-6: Enable RLS on admin/internal tables missing it.
--
-- All five tables are written exclusively by application code using
-- createAdminClient() (service role key), which bypasses RLS by design.
-- Enabling RLS with a deny-all policy blocks any direct PostgREST call
-- made with a user JWT without affecting application behavior.
--
-- rate_limits: accessed only via get_rate_limit_count and
-- check_and_increment_rate_limit RPCs, both SECURITY DEFINER — they
-- run as the function owner and bypass RLS, so this is safe.

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_posts_admin_only" ON public.social_posts
  FOR ALL USING (false);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners_admin_only" ON public.partners
  FOR ALL USING (false);

ALTER TABLE public.referral_attributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_attributions_admin_only" ON public.referral_attributions
  FOR ALL USING (false);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials_admin_only" ON public.testimonials
  FOR ALL USING (false);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rate_limits_admin_only" ON public.rate_limits
  FOR ALL USING (false);
