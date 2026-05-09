-- Enable RLS on internal/admin tables that were created without it.
-- These tables are read/written only by the worker (service role, bypasses RLS)
-- or by admin-authenticated API routes. Anonymous and user-role queries are
-- blocked by the default-deny behavior when RLS is enabled with no policies.

ALTER TABLE public.sec_filings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.intelligence_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_access_tokens ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.b2b_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_materials ENABLE ROW LEVEL SECURITY;
