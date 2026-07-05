// Run-scoped pipeline metrics collector (observability lane O1).
// A job starts a run, choke points (classify-signal, write-signal) record
// into the active collector, and the job flushes aggregates per source_key
// to source_run_metrics at the end. Single-process worker + advisory locks
// keep runs from interleaving within one job type.

import { logger } from './logger.js'

let _active = null

function emptyBucket() {
  return {
    classify_calls: 0,
    classify_failures: 0,
    signals_written: 0,
    signals_skipped: 0,
    events_created: 0,
    events_merged: 0,
  }
}

export function startRunMetrics(job) {
  _active = {
    job,
    runStartedAt: new Date().toISOString(),
    startedMs: Date.now(),
    buckets: new Map(), // source_key -> bucket
  }
}

export function recordSourceMetric(sourceKey, field, increment = 1) {
  if (!_active) return
  const key = sourceKey || 'unknown'
  if (!_active.buckets.has(key)) _active.buckets.set(key, emptyBucket())
  const bucket = _active.buckets.get(key)
  if (field in bucket) bucket[field] += increment
}

export async function finishRunMetrics(supabase) {
  if (!_active) return
  const run = _active
  _active = null

  const rows = [...run.buckets.entries()].map(([sourceKey, bucket]) => ({
    job: run.job,
    source_key: sourceKey,
    run_started_at: run.runStartedAt,
    duration_ms: Date.now() - run.startedMs,
    ...bucket,
  }))
  if (!rows.length) return

  try {
    const { error } = await supabase.from('source_run_metrics').insert(rows)
    if (error) logger.warn('source-metrics: flush failed', { job: run.job, error: error.message })
  } catch (err) {
    logger.warn('source-metrics: flush threw', { job: run.job, error: err.message })
  }
}
