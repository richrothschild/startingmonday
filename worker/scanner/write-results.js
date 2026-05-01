// scan_results schema: one row per company scan
// raw_hits: JSONB array of { title, score, is_match, summary }
// ai_score: highest match score found (0-100)
// ai_summary: plain-text summary of findings
// status: 'success' | 'blocked' | 'error'

export async function writeScanResult(supabase, { companyId, userId, hits, aiScore, aiSummary }) {
  const { error } = await supabase.from('scan_results').insert({
    company_id: companyId,
    user_id: userId,
    scanned_at: new Date().toISOString(),
    status: 'success',
    raw_hits: hits,
    ai_score: aiScore,
    ai_summary: aiSummary,
  })
  if (error) throw new Error(`Failed to write scan result: ${error.message}`)
}

export async function updateCompanyScanTime(supabase, companyId) {
  const { error } = await supabase
    .from('companies')
    .update({ last_checked_at: new Date().toISOString() })
    .eq('id', companyId)
  if (error) console.error(`[write-results] Failed to update last_checked_at: ${error.message}`)
}

export async function writeScanBlocked(supabase, { companyId, userId, message }) {
  await supabase.from('scan_results').insert({
    company_id: companyId,
    user_id: userId,
    scanned_at: new Date().toISOString(),
    status: 'blocked',
    raw_hits: [],
    ai_score: 0,
    error_message: (message ?? 'Site blocks automated access').slice(0, 500),
  })
}

export async function writeScanError(supabase, { companyId, userId, error }) {
  await supabase.from('scan_results').insert({
    company_id: companyId,
    user_id: userId,
    scanned_at: new Date().toISOString(),
    status: 'error',
    raw_hits: [],
    ai_score: 0,
    error_message: error.message?.slice(0, 500) ?? 'Unknown error',
  })
}
