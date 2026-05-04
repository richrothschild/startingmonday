-- Update trial period from 7 days to 30 days to match landing page copy

-- Update the auth trigger so new signups get 30-day trials
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, subscription_status, trial_ends_at)
  values (new.id, new.email, 'trialing', now() + interval '30 days')
  on conflict (id) do nothing;
  insert into public.user_profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Extend existing active trial users to 30 days from their created_at
-- (only if their trial hasn't expired yet)
update public.users
set trial_ends_at = created_at + interval '30 days'
where subscription_status = 'trialing'
  and trial_ends_at > now()
  and trial_ends_at < created_at + interval '30 days';
