const RESCAN_WINDOW_HOURS = 48;

// Returns true if this company was successfully scanned within the rescan window.
// Prevents hammering a site twice in the same cycle.
export async function wasRecentlyScanned(supabase, companyId) {
  const cutoff = new Date()
  cutoff.setHours(cutoff.getHours() - RESCAN_WINDOW_HOURS)

  const { data, error } = await supabase
    .from('scan_results')
    .select('id')
    .eq('company_id', companyId)
    .eq('status', 'success')
    .gte('scanned_at', cutoff.toISOString())
    .limit(1)

  if (error) {
    console.error(`[deduplicate] DB error: ${error.message}`)
    return false
  }

  return data.length > 0
}

// Returns job titles from the most recent scan for this company, used to detect
// new postings vs ones already seen and notified.
export async function getPreviousHitTitles(supabase, companyId) {
  const { data, error } = await supabase
    .from('scan_results')
    .select('raw_hits')
    .eq('company_id', companyId)
    .eq('status', 'success')
    .order('scanned_at', { ascending: false })
    .limit(1)

  if (error || !data?.length) return new Set()

  const hits = data[0].raw_hits ?? []
  return new Set(hits.map(h => h.title?.toLowerCase()))
}
