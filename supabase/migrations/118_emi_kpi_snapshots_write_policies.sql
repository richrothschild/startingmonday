-- Allow authenticated automation routes to persist canonical KPI snapshots.

create policy if not exists "Authenticated insert EMI KPI snapshots"
  on public.emi_kpi_snapshots
  for insert
  to authenticated
  with check (true);

create policy if not exists "Authenticated update EMI KPI snapshots"
  on public.emi_kpi_snapshots
  for update
  to authenticated
  using (true)
  with check (true);
