import { logger } from './logger.js'

export async function startSecIngestionRun(supabase, input) {
  const startedAt = new Date().toISOString()

  try {
    const { data, error } = await supabase
      .from('sec_ingestion_runs')
      .insert({
        source: input.source,
        status: 'running',
        company_id: input.companyId ?? null,
        company_name: input.companyName ?? null,
        company_cik: input.companyCik ?? null,
        started_at: startedAt,
        metadata: input.metadata ?? {},
      })
      .select('id, started_at')
      .single()

    if (error) throw error

    return {
      runId: data.id,
      startedAt: data.started_at ?? startedAt,
    }
  } catch (error) {
    logger.warn('sec-ingestion-tracker: start failed', {
      source: input.source,
      companyId: input.companyId ?? null,
      error: error instanceof Error ? error.message : 'unknown',
    })

    return {
      runId: null,
      startedAt,
    }
  }
}

export async function finishSecIngestionRun(supabase, runId, input) {
  if (!runId) return

  try {
    await supabase
      .from('sec_ingestion_runs')
      .update({
        status: input.status,
        finished_at: new Date().toISOString(),
        filings_considered: input.filingsConsidered ?? 0,
        filings_indexed: input.filingsIndexed ?? 0,
        sec_articles: input.secArticles ?? 0,
        signals_emitted: input.signalsEmitted ?? 0,
        latest_filing_date: input.latestFilingDate ?? null,
        latest_ingested_at: input.latestIngestedAt ?? null,
        error_message: input.errorMessage ?? null,
        metadata: input.metadata ?? {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', runId)
  } catch (error) {
    logger.warn('sec-ingestion-tracker: finish failed', {
      runId,
      status: input.status,
      error: error instanceof Error ? error.message : 'unknown',
    })
  }
}
