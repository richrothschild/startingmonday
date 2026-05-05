alter table user_profiles
  add column if not exists search_persona text
    check (search_persona in ('csuite', 'vp', 'board'));
