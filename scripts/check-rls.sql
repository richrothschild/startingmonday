-- RLS coverage check.
-- Run this in the Supabase SQL Editor or via psql.
-- Returns any public tables that do NOT have RLS enabled.
-- Zero rows = all tables are covered. Any row = missing RLS.

SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE
  schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;
