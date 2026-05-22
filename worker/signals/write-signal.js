// Inserts a signal into company_signals. Skips if source_url already exists for this company.
// Tries to persist enrichment metadata when available; falls back gracefully if columns are not deployed yet.
export async function writeSignal(supabase, {
  companyId,
  userId,
  signalType,
  signalSummary,
  sourceUrl,
  signalDate,
  outreachAngle,
  confidence = null,
  sourceKind = null,
  focusTags = [],
  evidenceSnippets = [],
  filingForm = null,
  filingItems = [],
  partnerEntities = [],
}) {
  if (sourceUrl) {
    const { data: existing } = await supabase
      .from('company_signals')
      .select('id')
      .eq('company_id', companyId)
      .eq('source_url', sourceUrl)
      .maybeSingle()
    if (existing) return { skipped: true }
  }

  const basePayload = {
    company_id: companyId,
    user_id: userId,
    signal_type: signalType,
    signal_summary: signalSummary,
    source_url: sourceUrl ?? null,
    signal_date: signalDate,
    outreach_angle: outreachAngle ?? null,
    notified_at: null,
  }

  const enrichedPayload = {
    ...basePayload,
    confidence: typeof confidence === 'number' ? confidence : null,
    source_kind: sourceKind ?? null,
    focus_tags: Array.isArray(focusTags) ? focusTags.slice(0, 3) : [],
    evidence_snippets: Array.isArray(evidenceSnippets) ? evidenceSnippets.slice(0, 2) : [],
    filing_form: filingForm ?? null,
    filing_items: Array.isArray(filingItems) ? filingItems : [],
    partner_entities: Array.isArray(partnerEntities) ? partnerEntities.slice(0, 3) : [],
  }

  let inserted = null
  let error = null

  ;({ data: inserted, error } = await supabase
    .from('company_signals')
    .insert(enrichedPayload)
    .select('id')
    .single())

  if (error) {
    // Backward compatibility: if metadata columns are not deployed yet, retry with base payload.
    ;({ data: inserted, error } = await supabase
      .from('company_signals')
      .insert(basePayload)
      .select('id')
      .single())
  }

  if (error) throw new Error(`writeSignal: ${error.message}`)
  return { skipped: false, signalId: inserted?.id ?? null }
}
