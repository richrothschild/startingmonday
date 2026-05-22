import http from 'http'
import cron from 'node-cron'
import * as Sentry from '@sentry/node'
import { logger } from './lib/logger.js'
import { getSupabase } from './lib/supabase.js'
import { scanCompany } from './scanner/scan-company.js'
import { runScanJob } from './jobs/scan-job.js'
import { runBriefingJob } from './jobs/briefing-job.js'
import { runFollowupJob } from './jobs/followup-job.js'
import { runMomentumJob } from './jobs/momentum-job.js'
import { runMomentumNudgeJob } from './jobs/momentum-nudge-job.js'
import { runWeeklyReportJob } from './jobs/weekly-report-job.js'
import { runUsageMonitorJob } from './jobs/usage-monitor-job.js'
import { runTrialReminderJob } from './jobs/trial-reminder-job.js'
import { runSignalJob } from './jobs/signal-job.js'
import { runOfferEmailJob } from './jobs/offer-email-job.js'
import { runReactivationJob } from './jobs/reactivation-job.js'
import { runActivationReminderJob } from './jobs/activation-reminder-job.js'
import { runMarketDigestJob } from './jobs/market-digest-job.js'
import { runExecutiveScanJob } from './jobs/executive-scan-job.js'
import { runCleanupJob } from './jobs/cleanup-job.js'
import { runPulseJob } from './jobs/pulse-job.js'
import { runBriefingWatchdogJob } from './jobs/briefing-watchdog-job.js'
import { runIndustryPulseJob } from './jobs/industry-pulse-job.js'
import { runOpportunityRadarJob } from './jobs/opportunity-radar-job.js'
import { runConciergePrepJob } from './jobs/concierge-prep-job.js'
import { runDemoCheck } from './lib/check-demo.js'
import { runOutreachDigestJob } from './jobs/outreach-digest-job.js'
import { runSocialPostJob } from './jobs/social-post-job.js'
import { runSyncLinkedInEngagementJob } from './jobs/sync-linkedin-engagement-job.js'
import { runLeadScoringJob } from './jobs/lead-scoring-job.js'
import { runUiUxWeeklyReviewJob } from './jobs/ui-ux-weekly-review-job.js'
import { runLinkIntegrityWeeklyReviewJob } from './jobs/link-integrity-weekly-review-job.js'
import { notify } from './lib/notify.js'

// ── Sentry ────────────────────────────────────────────────────────────────────

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'production',
  tracesSampleRate: 0,
})

// ── Crash handlers ────────────────────────────────────────────────────────────
// Log and capture unhandled errors so Sentry gets them before the process exits.
// On Railway the container will restart automatically; locally you must restart manually.

process.on('uncaughtException', (err) => {
  logger.error('worker: uncaught exception', { error: err.message, stack: err.stack })
  notify({
    subject: 'Worker crash: uncaught exception',
    body: [
      `Error: ${err.message}`,
      `Time: ${new Date().toISOString()}`,
      'Worker process will exit and rely on Railway restart.',
    ].join('\n'),
  }).catch(() => {})
  Sentry.captureException(err)
  Sentry.flush(2000).finally(() => process.exit(1))
})

process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason)
  logger.error('worker: unhandled rejection', { reason: message })
  if (shouldNotifyFailure('process:unhandledRejection')) {
    notify({
      subject: 'Worker warning: unhandled rejection',
      body: [
        `Reason: ${message}`,
        `Time: ${new Date().toISOString()}`,
        'Process continues, but this should be investigated.',
      ].join('\n'),
    }).catch(() => {})
  }
  Sentry.captureException(reason)
})

// ── Job runner ────────────────────────────────────────────────────────────────

const jobStatus = {}
const FAILURE_NOTIFY_COOLDOWN_MS = 60 * 60 * 1000
const lastFailureNotifyAt = new Map()

// Jobs that run longer than their timeout are forcibly rejected and logged as
// { event: 'job_timeout' } so they surface in Railway log queries.
const JOB_TIMEOUTS_MS = {
  'scan-job':              10 * 60_000,
  'executive-scan-job':    10 * 60_000,
  'executive-evening-scan': 10 * 60_000,
  'weekly-report-job':     15 * 60_000,
  'briefing-job':           3 * 60_000,
}
const DEFAULT_JOB_TIMEOUT_MS = 5 * 60_000

function shouldNotifyFailure(key) {
  const now = Date.now()
  const last = lastFailureNotifyAt.get(key) ?? 0
  if (now - last < FAILURE_NOTIFY_COOLDOWN_MS) return false
  lastFailureNotifyAt.set(key, now)
  return true
}

async function runJob(name, fn) {
  if (jobStatus[name] === 'running') {
    logger.warn(`${name}: already running, skipping this tick`)
    return
  }
  jobStatus[name] = 'running'
  const start = Date.now()
  const timeoutMs = JOB_TIMEOUTS_MS[name] ?? DEFAULT_JOB_TIMEOUT_MS
  const timeoutErr = Object.assign(new Error('job_timeout'), { isTimeout: true })
  try {
    await Promise.race([
      fn(),
      new Promise((_, reject) => setTimeout(() => reject(timeoutErr), timeoutMs)),
    ])
    jobStatus[name] = 'idle'
    logger.info(`${name}: finished`, { ms: Date.now() - start })
  } catch (err) {
    jobStatus[name] = 'idle'
    if (err.isTimeout) {
      logger.error(`${name}: timed out`, { event: 'job_timeout', job: name, timeout_ms: timeoutMs })
      if (shouldNotifyFailure(`${name}:timeout`)) {
        notify({
          subject: `Worker timeout: ${name}`,
          body: [
            `Job timed out after ${timeoutMs}ms.`,
            `Job: ${name}`,
            `Time: ${new Date().toISOString()}`,
            'Check Railway worker logs and Sentry for stack traces.',
          ].join('\n'),
        }).catch(() => {})
      }
    } else {
      logger.error(`${name}: unhandled error`, { error: err.message })
      if (shouldNotifyFailure(`${name}:error`)) {
        notify({
          subject: `Worker error: ${name}`,
          body: [
            `Job failed with unhandled error.`,
            `Job: ${name}`,
            `Error: ${err.message}`,
            `Time: ${new Date().toISOString()}`,
            'Check Railway worker logs and Sentry for full context.',
          ].join('\n'),
        }).catch(() => {})
      }
    }
    Sentry.captureException(err, { tags: { job: name } })
  }
}

// ── Cron schedules (all times UTC) ───────────────────────────────────────────

// Scan: Mon / Wed / Fri at 08:00 — all users
cron.schedule('0 8 * * 1,3,5', () => runJob('scan-job', runScanJob))

// Executive daily scan: Tue / Thu / Sat / Sun at 08:00 — executive tier only
cron.schedule('0 8 * * 0,2,4,6', () => runJob('executive-scan-job', runExecutiveScanJob))

// Executive evening scan: daily at 20:00 UTC — second scan for executive tier (2x daily)
cron.schedule('0 20 * * *', () => runJob('executive-evening-scan', runExecutiveScanJob))

// Signals: Mon / Wed / Fri at 08:30 (after scan)
cron.schedule('30 8 * * 1,3,5', () => runJob('signal-job', runSignalJob))

// Briefing: every 5 minutes — job checks each user's timezone, time, and days
cron.schedule('*/5 * * * *', () => runJob('briefing-job', runBriefingJob))

// Follow-up reminders: daily at 06:00 (not yet implemented)
cron.schedule('0 6 * * *', () => runJob('followup-job', runFollowupJob))

// Momentum score: Sunday at 23:00 (not yet implemented)
cron.schedule('0 23 * * 0', () => runJob('momentum-job', runMomentumJob))

// Momentum drop nudge: daily at 10:00 UTC — fires email when score drops ≥15 pts
cron.schedule('0 10 * * *', () => runJob('momentum-nudge-job', runMomentumNudgeJob))

// Market intelligence digest: Sunday at 22:30 — Monitor/passive tier users only
cron.schedule('30 22 * * 0', () => runJob('market-digest-job', runMarketDigestJob))

// Weekly progress report: Sunday at 23:30 (not yet implemented)
cron.schedule('30 23 * * 0', () => runJob('weekly-report-job', runWeeklyReportJob))

// Usage monitor: daily at 09:00 UTC — checks all services against plan limits
cron.schedule('0 9 * * *', () => runJob('usage-monitor-job', runUsageMonitorJob))

// Trial reminders: daily at 10:00 UTC — sends T-3 and T-0 emails to trialing users
cron.schedule('0 10 * * *', () => runJob('trial-reminder-job', runTrialReminderJob))

// Offer email: daily at 11:00 UTC — sends within 24h of offer_accepted_at being set
cron.schedule('0 11 * * *', () => runJob('offer-email-job', runOfferEmailJob))

// Annual reactivation: daily at 11:30 UTC — fires on the one-year anniversary of offer acceptance
cron.schedule('30 11 * * *', () => runJob('reactivation-job', runReactivationJob))

// Activation reminder: daily at 10:30 UTC — day-3 and day-7 nudge for incomplete setup
cron.schedule('30 10 * * *', () => runJob('activation-reminder-job', runActivationReminderJob))

// Cleanup: Sunday at 02:00 UTC — delete signals >90d and conversations stale >180d
cron.schedule('0 2 * * 0', () => runJob('cleanup-job', runCleanupJob))

// Pipeline pulse: daily at 07:00 UTC — Executive tier search health summary email
cron.schedule('0 7 * * *', () => runJob('pulse-job', runPulseJob))

// Industry pulse: Sunday at 06:00 UTC — sector-level exec movement digest per user
cron.schedule('0 6 * * 0', () => runJob('industry-pulse-job', runIndustryPulseJob))

// Opportunity radar: Sunday at 06:30 UTC — proactive company suggestions per user
cron.schedule('30 6 * * 0', () => runJob('opportunity-radar-job', runOpportunityRadarJob))

// Concierge prep: daily at 07:30 UTC — generate agendas for calls scheduled in next 24h
cron.schedule('30 7 * * *', () => runJob('concierge-prep-job', runConciergePrepJob))

// Briefing watchdog: daily at 14:00 UTC — alerts Rich if no briefings sent in 36h
cron.schedule('0 14 * * *', () => runJob('briefing-watchdog-job', runBriefingWatchdogJob))

// Outreach digest: daily at 15:00 UTC — send/delivery status summary + bounce/stuck alerts
cron.schedule('0 15 * * *', () => runJob('outreach-digest-job', runOutreachDigestJob))

// Lead scoring + routing: weekdays at 16:00 UTC
cron.schedule('0 16 * * 1-5', () => runJob('lead-scoring-job', runLeadScoringJob))

// LinkedIn social posting: three times per week in America/Chicago to preserve local publish windows
cron.schedule('35 8 * * 1', () => runJob('social-post-job', runSocialPostJob), { timezone: 'America/Chicago' })
cron.schedule('45 8 * * 3', () => runJob('social-post-job', runSocialPostJob), { timezone: 'America/Chicago' })
cron.schedule('35 8 * * 5', () => runJob('social-post-job', runSocialPostJob), { timezone: 'America/Chicago' })
// LinkedIn engagement sync — runs daily at 6pm CT to pull latest likes/comments
cron.schedule('0 18 * * *', () => runJob('sync-linkedin-engagement', runSyncLinkedInEngagementJob), { timezone: 'America/Chicago' })

// Weekly site-wide UI/UX council review summary: Sunday 21:00 UTC
cron.schedule('0 21 * * 0', () => runJob('ui-ux-weekly-review-job', runUiUxWeeklyReviewJob))

// Weekly site-wide link integrity review summary + safe auto-fix pass: Sunday 20:30 UTC
cron.schedule('30 20 * * 0', () => runJob('link-integrity-weekly-review-job', runLinkIntegrityWeeklyReviewJob))

// ── Demo health check on startup ──────────────────────────────────────────────
// Runs 10s after boot so the DB connection pool is settled.
// Logs warnings to Railway for any demo data gaps — does not block startup.
setTimeout(() => runDemoCheck().catch(err => logger.error('check-demo: failed', { error: err.message })), 10_000)

logger.info('worker: cron schedules registered', {
  jobs: ['scan-job', 'executive-scan-job', 'executive-evening-scan', 'signal-job', 'briefing-job', 'followup-job', 'momentum-job', 'momentum-nudge-job', 'market-digest-job', 'weekly-report-job', 'usage-monitor-job', 'trial-reminder-job', 'offer-email-job', 'reactivation-job', 'activation-reminder-job', 'cleanup-job', 'pulse-job', 'briefing-watchdog-job', 'industry-pulse-job', 'opportunity-radar-job', 'concierge-prep-job', 'outreach-digest-job', 'lead-scoring-job', 'social-post-job', 'ui-ux-weekly-review-job', 'link-integrity-weekly-review-job'],
})

// ── Health endpoint ───────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3010

http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      jobs: jobStatus,
      ts: new Date().toISOString(),
    }))
    return
  }

  // Immediate scan trigger — called by the main app when a company is added.
  // Returns 202 immediately; scan runs async so the caller isn't blocked.
  if (req.url === '/trigger-scan' && req.method === 'POST') {
    const secret = process.env.WORKER_SECRET
    if (!secret || req.headers['x-worker-secret'] !== secret) {
      res.writeHead(401)
      res.end()
      return
    }

    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      res.writeHead(202)
      res.end()

      let parsed
      try { parsed = JSON.parse(body) } catch { return }
      const { companyId, userId } = parsed
      if (!companyId || !userId) return

      logger.info('trigger-scan: received', { companyId, userId })

      const supabase = getSupabase()
      Promise.all([
        supabase.from('companies').select('*').eq('id', companyId).eq('user_id', userId).single(),
        supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      ]).then(([{ data: company }, { data: profile }]) => {
        if (!company) return
        return scanCompany(supabase, company, profile ?? {})
      }).catch(err => {
        logger.error('trigger-scan: failed', { companyId, error: err.message })
        Sentry.captureException(err)
      })
    })
    return
  }

  res.writeHead(404)
  res.end()
}).listen(PORT, () => {
  logger.info(`worker: health endpoint listening on :${PORT}`)
})

// ── Graceful shutdown ─────────────────────────────────────────────────────────

process.on('SIGTERM', () => {
  logger.info('worker: received SIGTERM — shutting down')
  Sentry.flush(2000).finally(() => process.exit(0))
})
