// Compare current exec list against the most recent prior snapshot for this user.
// Saves current snapshot and returns { departures, hires }.
export async function diffExecSnapshot(supabase, companyId, userId, currentExecs, snapshotDate) {
  const { data: prior } = await supabase
    .from('exec_snapshots')
    .select('executives')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .lt('snapshot_date', snapshotDate)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  await supabase
    .from('exec_snapshots')
    .upsert(
      { company_id: companyId, user_id: userId, snapshot_date: snapshotDate, executives: currentExecs },
      { onConflict: 'company_id,user_id,snapshot_date' }
    )

  if (!prior) return { departures: [], hires: [] }

  const prevExecs = prior.executives ?? []
  const prevNames = new Set(prevExecs.map(e => norm(e.name)))
  const currNames = new Set(currentExecs.map(e => norm(e.name)))

  return {
    departures: prevExecs.filter(e => !currNames.has(norm(e.name))),
    hires:      currentExecs.filter(e => !prevNames.has(norm(e.name))),
  }
}

function norm(name) {
  return (name ?? '').toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim()
}
