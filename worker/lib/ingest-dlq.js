import { logger } from './logger.js'

// Dead-letter queue for ingestion/classification failures. Writes must never
// throw — a DLQ failure should not take down the pipeline it observes.

export async function writeIngestDlq(supabase, { source, companyName = null, payload = {}, error }) {
  if (!supabase) return { ok: false, error: 'no supabase client' }
  try {
    const { error: insertError } = await supabase.from('ingest_dlq').insert({
      source,
      company_name: companyName,
      payload,
      error: String(error ?? 'unknown'),
    })
    if (insertError) {
      logger.warn('ingest-dlq: insert failed', { source, error: insertError.message })
      return { ok: false, error: insertError.message }
    }
    return { ok: true }
  } catch (err) {
    logger.warn('ingest-dlq: insert threw', { source, error: err.message })
    return { ok: false, error: err.message }
  }
}

// Returns { depth, oldestAgeHours } for unresolved DLQ entries.
export async function getIngestDlqStats(supabase) {
  const { count, error: countError } = await supabase
    .from('ingest_dlq')
    .select('id', { count: 'exact', head: true })
    .is('resolved_at', null)
  if (countError) throw new Error(`ingest-dlq stats: ${countError.message}`)

  const { data: oldest, error: oldestError } = await supabase
    .from('ingest_dlq')
    .select('created_at')
    .is('resolved_at', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (oldestError) throw new Error(`ingest-dlq stats: ${oldestError.message}`)

  const oldestAgeHours = oldest?.created_at
    ? (Date.now() - new Date(oldest.created_at).getTime()) / 3600000
    : 0

  return { depth: count ?? 0, oldestAgeHours }
}
