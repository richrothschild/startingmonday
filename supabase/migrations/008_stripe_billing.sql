-- Add trial tracking and Stripe billing fields

alter table public.users
  add column if not exists trial_ends_at timestamptz,
  add column if not exists subscription_period_end timestamptz;

-- Backfill trial for existing users who haven't subscribed yet
update public.users
set trial_ends_at = created_at + interval '7 days',
    subscription_status = 'trialing'
where subscription_status = 'inactive'
  and trial_ends_at is null;

-- Update auth trigger to set trial on new signups
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, subscription_status, trial_ends_at)
  values (new.id, new.email, 'trialing', now() + interval '7 days');
  insert into public.user_profiles (user_id) values (new.id);
  return new;
end;
$$;
