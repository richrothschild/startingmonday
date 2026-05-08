-- B2B prospect pipeline
create table if not exists public.b2b_prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  type text not null default 'other',
  -- outplacement | mba_program | vc_pe | other
  website text,
  stage text not null default 'identified',
  -- identified | contacted | demo_scheduled | proposal_sent | negotiating | closed_won | closed_lost
  estimated_seats int,
  estimated_arr int,  -- annual recurring revenue estimate in USD
  notes text,
  archived_at timestamptz
);

-- Contacts at prospect orgs
create table if not exists public.b2b_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  prospect_id uuid not null references public.b2b_prospects(id) on delete cascade,
  name text not null,
  title text,
  email text,
  linkedin_url text,
  notes text
);

-- Activity and conversation log
create table if not exists public.b2b_activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  prospect_id uuid not null references public.b2b_prospects(id) on delete cascade,
  contact_id uuid references public.b2b_contacts(id) on delete set null,
  activity_type text not null default 'other',
  -- call | email | demo | linkedin | intro | proposal | other
  summary text not null,
  occurred_at date not null default current_date,
  next_action text,
  next_action_due date,
  logged_by text
);

-- Generated leave-behind materials
create table if not exists public.b2b_materials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  prospect_id uuid not null references public.b2b_prospects(id) on delete cascade,
  title text not null,
  content text not null,
  created_by text
);

create index if not exists idx_b2b_prospects_stage on public.b2b_prospects(stage);
create index if not exists idx_b2b_contacts_prospect on public.b2b_contacts(prospect_id);
create index if not exists idx_b2b_activities_prospect on public.b2b_activities(prospect_id, occurred_at desc);
create index if not exists idx_b2b_materials_prospect on public.b2b_materials(prospect_id, created_at desc);
