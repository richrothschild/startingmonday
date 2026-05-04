-- Additional performance indexes identified in tech debt review.

-- contacts are queried by user_id + status in chat context, outreach, and prep.
create index if not exists idx_contacts_user_status
  on public.contacts(user_id, status);

-- scan_results: briefing-job filters by scanned_at range; existing index covers
-- user_id + ai_score but not the time window, so rows must be filtered post-scan.
-- This composite partial index covers both the time range and success filter.
create index if not exists idx_scan_results_user_scanned
  on public.scan_results(user_id, scanned_at desc)
  where status = 'success';
