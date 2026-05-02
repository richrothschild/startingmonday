import { getSupabase } from '../lib/supabase.js'
import { logger } from '../lib/logger.js'
import { trackUsage } from '../lib/usage-tracker.js'
import { createLimiter } from '../lib/concurrency.js'
import { scanCompany } from '../scanner/scan-company.js'

const MAX_CONCURRENT_SCANS = 10

// Retry a scan once on transient errors (network timeouts, Browserless blips).
// Does not retry robots.txt blocks or deliberate skips.
async function scanWithRetry(supabase, company, profile) {
  try {
    return await scanCompany(supabase, company, profile)
  } catch (err) {
    const isTransient = (
      err.message?.includes('timeout') ||
      err.message?.includes('ECONNRESET') ||
      err.message?.includes('ENOTFOUND') ||
      err.message?.includes('502') ||
      err.message?.includes('503')
    )
    if (!isTransient) throw err

    logger.warn(`scan-job: transient error for ${company.name}, retrying in 3s`, { error: err.message })
    await new Promise(r => setTimeout(r, 3000))
    return scanCompany(supabase, company, profile)
  }
}

const SCAN_LOCK_KEY = 7329841023n // arbitrary stable bigint key for pg_advisory_lock

export async function runScanJob() {
  const supabase = getSupabase()
  logger.info('scan-job: starting')

  // Acquire a Postgres advisory lock so only one worker instance runs at a time.
  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: SCAN_LOCK_KEY })
  if (!locked) {
    logger.warn('scan-job: another instance is already running — skipping')
    return
  }

  const { data: companies, error: companyErr } = await supabase
    .from('companies')
    .select('*')
    .is('archived_at', null)

  if (companyErr) {
    logger.error('scan-job: failed to fetch companies', { error: companyErr.message })
    return
  }

  if (!companies.length) {
    logger.info('scan-job: no active companies — done')
    return
  }

  const userIds = [...new Set(companies.map(c => c.user_id))]
  const { data: profiles, error: profileErr } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_id', userIds)

  if (profileErr) {
    logger.error('scan-job: failed to fetch profiles', { error: profileErr.message })
    return
  }

  const profileByUserId = Object.fromEntries(profiles.map(p => [p.user_id, p]))

  logger.info(`scan-job: ${companies.length} companies across ${userIds.length} user(s)`)

  let browserlessCalls = 0
  let anthropicCalls = 0

  const limit = createLimiter(MAX_CONCURRENT_SCANS)
  const tasks = companies.map(company =>
    limit(async () => {
      const profile = profileByUserId[company.user_id] ?? {}
      try {
        const result = await scanWithRetry(supabase, company, profile)
        if (!result.skipped && !result.blocked) {
          browserlessCalls++
          anthropicCalls += result.hits ?? 0
        }
        return result
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        logger.error('scan-job: unhandled error', { company: company.name, error: msg })
      }
    })
  )

  await Promise.all(tasks)

  await supabase.rpc('advisory_unlock', { p_key: SCAN_LOCK_KEY })

  // Track aggregate usage for this scan run
  if (browserlessCalls > 0) {
    await trackUsage(supabase, { service: 'browserless', requests: browserlessCalls })
  }
  if (anthropicCalls > 0) {
    // Each score-hit call uses ~200 tokens (Haiku)
    await trackUsage(supabase, { service: 'anthropic', requests: anthropicCalls, tokens: anthropicCalls * 200 })
  }

  logger.info('scan-job: complete', { browserlessCalls, anthropicCalls })
}
