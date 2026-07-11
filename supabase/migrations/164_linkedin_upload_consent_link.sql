alter table if exists public.linkedin_connection_uploads
  add column if not exists consent_id uuid references public.linkedin_import_consents(id) on delete set null;

create index if not exists linkedin_connection_uploads_consent_idx
  on public.linkedin_connection_uploads(consent_id)
  where consent_id is not null;