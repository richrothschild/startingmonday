-- Performance indexes for high-frequency dashboard queries.
-- The dashboard page runs 9+ parallel queries on every load;
-- these indexes reduce full-table scans as user data grows.

-- Companies: active pipeline (most common dashboard query)
create index if not exists idx_companies_user_active
  on public.companies (user_id, archived_at, fit_score desc nulls last);

-- Contacts: by user + status (active contacts list)
create index if not exists idx_contacts_user_status
  on public.contacts (user_id, status);

-- Contacts: by company (company detail page contact list)
create index if not exists idx_contacts_company_user
  on public.contacts (company_id, user_id);

-- Follow-ups: pending by due date (dashboard overdue/upcoming)
create index if not exists idx_follow_ups_user_status_due
  on public.follow_ups (user_id, status, due_date);

-- Company signals: by company + date (prep brief signal section)
create index if not exists idx_company_signals_company_date
  on public.company_signals (company_id, user_id, signal_date desc);

-- Company documents: by company (prep brief document section)
create index if not exists idx_company_documents_company_user
  on public.company_documents (company_id, user_id);

-- Briefs: by user + type (brief history lookups)
create index if not exists idx_briefs_user_type
  on public.briefs (user_id, type);
