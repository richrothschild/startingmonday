-- Fix: add 'director' to the search_persona check constraint (was missing from migration 019)
alter table user_profiles
  drop constraint if exists user_profiles_search_persona_check;

alter table user_profiles
  add constraint user_profiles_search_persona_check
    check (search_persona in ('csuite', 'vp', 'director', 'board'));

-- Briefing frequency for passive/Monitor tier users
alter table user_profiles
  add column if not exists briefing_frequency text not null default 'daily'
    check (briefing_frequency in ('daily', 'weekly'));
