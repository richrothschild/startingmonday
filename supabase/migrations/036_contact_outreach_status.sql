-- Track where each contact relationship stands in the outreach funnel
-- Values: prospect | reached_out | in_conversation | meeting_scheduled | closed
alter table public.contacts
  add column if not exists outreach_status text not null default 'prospect';
