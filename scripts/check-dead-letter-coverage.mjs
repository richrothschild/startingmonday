#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const LOOKBACK_HOURS = Number(process.env.DEAD_LETTER_LOOKBACK_HOURS ?? 24)

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString()

async function fetchScanFailures() {
  const { count, error } = await supabase
    .from('scan_failures')
    .select('*', { count: 'exact', head: true })
    .gte('attempted_at', since)

  if (error) throw new Error(`scan_failures_query_failed:${error.message}`)
  return count ?? 0
}

async function fetchHeavyQueueDeadLetters() {
  const { count, error } = await supabase
    .from('heavy_job_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'dead_letter')
    .gte('updated_at', since)

  if (error) throw new Error(`heavy_job_queue_query_failed:${error.message}`)
  return count ?? 0
}

async function fetchHeavyQueueRetries() {
  const { count, error } = await supabase
    .from('heavy_job_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'retry')
    .gte('updated_at', since)

  if (error) throw new Error(`heavy_job_queue_retry_query_failed:${error.message}`)
  return count ?? 0
}

async function main() {
  const [scanFailures, heavyDeadLetters, heavyRetries] = await Promise.all([
    fetchScanFailures(),
    fetchHeavyQueueDeadLetters(),
    fetchHeavyQueueRetries(),
  ])

  const totalDeadLetterSignals = scanFailures + heavyDeadLetters

  console.log('dead_letter_coverage_summary')
  console.log(`lookback_hours=${LOOKBACK_HOURS}`)
  console.log(`scan_failures=${scanFailures}`)
  console.log(`heavy_job_dead_letters=${heavyDeadLetters}`)
  console.log(`heavy_job_retries=${heavyRetries}`)
  console.log(`total_dead_letter_signals=${totalDeadLetterSignals}`)

  if (totalDeadLetterSignals > 0) {
    console.warn('dead_letter_attention_required=true')
    process.exitCode = 2
  }
}

main().catch((error) => {
  console.error('dead_letter_coverage_error', error instanceof Error ? error.message : String(error))
  process.exit(1)
})
