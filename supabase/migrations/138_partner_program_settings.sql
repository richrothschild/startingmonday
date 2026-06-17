create table if not exists public.partner_program_settings (
  partner_id uuid primary key references public.partners(id) on delete cascade,
  default_program text not null default 'outplacement_standard',
  sponsor_template_variant text not null default 'pilot_compact',
  cohort_naming_prefix text,
  weekly_summary_day text not null default 'friday',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_partner_program_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_partner_program_settings_updated_at on public.partner_program_settings;
create trigger trg_touch_partner_program_settings_updated_at
before update on public.partner_program_settings
for each row
execute function public.touch_partner_program_settings_updated_at();

alter table public.partner_program_settings enable row level security;

drop policy if exists partner_program_settings_admin_only on public.partner_program_settings;
create policy partner_program_settings_admin_only on public.partner_program_settings
  for all using (false);
