// Inserts a signal into company_signals. Skips if source_url already exists for this company.
export async function writeSignal(supabase, { companyId, userId, signalType, signalSummary, sourceUrl, signalDate, outreachAngle }) {
  if (sourceUrl) {
    const { data: existing } = await supabase
      .from('company_signals')
      .select('id')
      .eq('company_id', companyId)
      .eq('source_url', sourceUrl)
      .maybeSingle()
    if (existing) return { skipped: true }
  }

  const { error } = await supabase
    .from('company_signals')
    .insert({
      company_id:    companyId,
      user_id:       userId,
      signal_type:   signalType,
      signal_summary: signalSummary,
      source_url:    sourceUrl ?? null,
      signal_date:   signalDate,
      outreach_angle: outreachAngle ?? null,
      notified_at:   null,
    })

  if (error) throw new Error(`writeSignal: ${error.message}`)
  return { skipped: false }
}
