-- Ensure coach alert preferences are writable by coaches.

drop policy if exists "coaches_manage_prefs" on public.coach_alert_preferences;

create policy "coaches_manage_prefs"
  on public.coach_alert_preferences
  for all
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);
