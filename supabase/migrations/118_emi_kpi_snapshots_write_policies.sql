-- Allow authenticated automation routes to persist canonical KPI snapshots.

drop policy if exists "Authenticated insert EMI KPI snapshots"
  on public.emi_kpi_snapshots;

create policy "Authenticated insert EMI KPI snapshots"
  on public.emi_kpi_snapshots
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated update EMI KPI snapshots"
  on public.emi_kpi_snapshots;

create policy "Authenticated update EMI KPI snapshots"
  on public.emi_kpi_snapshots
  for update
  to authenticated
  using (true)
  with check (true);
