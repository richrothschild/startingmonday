import http from 'http'
import cron from 'node-cron'
import * as Sentry from '@sentry/node'
import { logger } from './lib/logger.js'
import { runScanJob } from './jobs/scan-job.js'
import { runBriefingJob } from './jobs/briefing-job.js'
import { runFollowupJob } from './jobs/followup-job.js'
import { runMomentumJob } from './jobs/momentum-job.js'
import { runWeeklyReportJob } from './jobs/weekly-report-job.js'
import { runUsageMonitorJob } from './jobs/usage-monitor-job.js'

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
  Sentry.captureException(err)
  Sentry.flush(2000).finally(() => process.exit(1))
})

process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason)
  logger.error('worker: unhandled rejection', { reason: message })
  Sentry.captureException(reason)
})

// ── Job runner ────────────────────────────────────────────────────────────────

const jobStatus = {}

async function runJob(name, fn) {
  if (jobStatus[name] === 'running') {
    logger.warn(`${name}: already running — skipping this tick`)
    return
  }
  jobStatus[name] = 'running'
  const start = Date.now()
  try {
    await fn()
    jobStatus[name] = 'idle'
    logger.info(`${name}: finished`, { ms: Date.now() - start })
  } catch (err) {
    jobStatus[name] = 'idle'
    logger.error(`${name}: unhandled error`, { error: err.message })
    Sentry.captureException(err, { tags: { job: name } })
  }
}

// ── Cron schedules (all times UTC) ───────────────────────────────────────────

// Scan: Mon / Wed / Fri at 08:00
cron.schedule('0 8 * * 1,3,5', () => runJob('scan-job', runScanJob))

// Briefing: every 5 minutes — job checks each user's timezone, time, and days
cron.schedule('*/5 * * * *', () => runJob('briefing-job', runBriefingJob))

// Follow-up reminders: daily at 06:00 (not yet implemented)
cron.schedule('0 6 * * *', () => runJob('followup-job', runFollowupJob))

// Momentum score: Sunday at 23:00 (not yet implemented)
cron.schedule('0 23 * * 0', () => runJob('momentum-job', runMomentumJob))

// Weekly progress report: Sunday at 23:30 (not yet implemented)
cron.schedule('30 23 * * 0', () => runJob('weekly-report-job', runWeeklyReportJob))

// Usage monitor: daily at 09:00 UTC — checks all services against plan limits
cron.schedule('0 9 * * *', () => runJob('usage-monitor-job', runUsageMonitorJob))

logger.info('worker: cron schedules registered', {
  jobs: ['scan-job', 'briefing-job', 'followup-job', 'momentum-job', 'weekly-report-job', 'usage-monitor-job'],
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
