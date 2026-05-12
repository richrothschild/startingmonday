-- A2-1: Enable RLS on staff_members to prevent privilege escalation.
--
-- Without RLS, any authenticated user can POST directly to the Supabase
-- REST API and INSERT a row with role = 'owner', bypassing application-
-- layer auth checks entirely. With RLS enabled and no permissive policy,
-- all direct table access is denied by default.
--
-- Application code uses createAdminClient() (service role key) for all
-- staff_members operations. The service role bypasses RLS by design, so
-- this change has no effect on the running application.

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_members_admin_only" ON public.staff_members
  FOR ALL USING (false);
