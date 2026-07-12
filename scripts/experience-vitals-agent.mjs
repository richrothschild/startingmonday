#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright'
import { loadSES, writeLatestReportFiles, postSlackText } from './lib/agent-report-kit.mjs'

function parseArgs(argv) {
  const args = {
    report: 'docs/status/experience-vitals.latest.json',
    inventory: 'docs/status/route-inventory.latest.json',
    baseline: 'config/experience-vitals-baseline.json',
    ses: 'config/site-experience-standard.json',
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--base-url') args.baseUrl = argv[i + 1]
    if (token === '--report') args.report = argv[i + 1]
    if (token === '--inventory') args.inventory = argv[i + 1]
    if (token === '--baseline') args.baseline = argv[i + 1]
    if (token === '--ses') args.ses = argv[i + 1]
  }

  return args
}

function nowIso() {
  return new Date().toISOString()
}

function compareMetric(metric, value, budget) {
  if (typeof value !== 'number' || typeof budget !== 'number') return null
  return value > budget
}

function tieredRouteSelection(routes, selection) {
  const tiers = selection?.includeTiers ?? ['funnel', 'public', 'dashboard', 'admin']
  const maxRoutesPerTier = selection?.maxRoutesPerTier ?? {}
  const excludeDynamic = selection?.excludeDynamicRoutes ?? true

  const selected = []
  for (const tier of tiers) {
    const perTier = routes
      .filter((route) => route.tier === tier)
      .filter((route) => !excludeDynamic || !route.dynamic)
      .slice(0, maxRoutesPerTier[tier] ?? 10)
    selected.push(...perTier)
  }

  return selected
}

async function installVitalsObservers(page) {
  await page.addInitScript(() => {
    window.__sxoVitals = {
      lcp: null,
      cls: 0,
      longTaskBlockingMs: 0,
    }

    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          window.__sxoVitals.lcp = entry.startTime
        }
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {
      // Some browsers/environments may not expose this observer type.
    }

    try {
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__sxoVitals.cls += entry.value
          }
        }
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
    } catch {
      // Some browsers/environments may not expose this observer type.
    }

    try {
      const longTaskObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const blocking = Math.max(0, entry.duration - 50)
          window.__sxoVitals.longTaskBlockingMs += blocking
        }
      })
      longTaskObserver.observe({ type: 'longtask', buffered: true })
    } catch {
      // Long task observer may not be available in all contexts.
    }
  })
}

async function loginIfNeeded(page, email, password) {
  if (!email || !password) return false

  await page.goto('/login', { waitUntil: 'load', timeout: 30000 })
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: /^Sign in$/i }).click()
  await page.waitForURL((url) => url.pathname.startsWith('/dashboard'), { timeout: 20000 })
  return true
}

async function captureRouteVitals(page, route) {
  await installVitalsObservers(page)

  const startedAt = Date.now()
  const response = await page.goto(route.route, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null)

  const timings = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    const paints = performance.getEntriesByType('paint')
    const fcp = paints.find((entry) => entry.name === 'first-contentful-paint')

    return {
      ttfb: nav ? nav.responseStart : null,
      fcp: fcp ? fcp.startTime : null,
      lcp: window.__sxoVitals?.lcp ?? null,
      cls: window.__sxoVitals?.cls ?? null,
      inpProxy: window.__sxoVitals?.longTaskBlockingMs ?? null,
    }
  })

  return {
    route: route.route,
    tier: route.tier,
    status: response?.status() ?? 0,
    loadMs: Date.now() - startedAt,
    metrics: {
      ttfbMs: timings.ttfb === null ? null : Math.round(timings.ttfb),
      fcpMs: timings.fcp === null ? null : Math.round(timings.fcp),
      lcpMs: timings.lcp === null ? null : Math.round(timings.lcp),
      cls: timings.cls === null ? null : Number(timings.cls.toFixed(3)),
      inpProxyMs: timings.inpProxy === null ? null : Math.round(timings.inpProxy),
    },
  }
}

function evaluateBudgets(result, budgetsByTier) {
  const tierBudget = budgetsByTier[result.tier] ?? null
  if (!tierBudget) {
    return {
      pass: true,
      breaches: [],
      warnings: ['No tier budget configured'],
    }
  }

  const breaches = []
  if (compareMetric('lcpMs', result.metrics.lcpMs, tierBudget.lcpMs)) breaches.push(`lcpMs ${result.metrics.lcpMs} > ${tierBudget.lcpMs}`)
  if (compareMetric('ttfbMs', result.metrics.ttfbMs, tierBudget.ttfbMs)) breaches.push(`ttfbMs ${result.metrics.ttfbMs} > ${tierBudget.ttfbMs}`)
  if (compareMetric('fcpMs', result.metrics.fcpMs, tierBudget.fcpMs)) breaches.push(`fcpMs ${result.metrics.fcpMs} > ${tierBudget.fcpMs}`)
  if (compareMetric('cls', result.metrics.cls, tierBudget.cls)) breaches.push(`cls ${result.metrics.cls} > ${tierBudget.cls}`)
  if (compareMetric('inpProxyMs', result.metrics.inpProxyMs, tierBudget.inpProxyMs)) breaches.push(`inpProxyMs ${result.metrics.inpProxyMs} > ${tierBudget.inpProxyMs}`)

  return {
    pass: breaches.length === 0,
    breaches,
    warnings: [],
  }
}

/**
 * Merge SES CWV budgets with baseline budgets (for extended fields not in SES yet).
 * Prioritizes SES for standard CWV metrics, falls back to baseline for optional fields.
 */
function mergeBudgets(ses, baselineBudgets) {
  const merged = {}
  for (const [tier, sesBudget] of Object.entries(ses?.tiers ?? {})) {
    const cwv = sesBudget?.cwvBudget ?? {}
    const baselineTier = baselineBudgets?.[tier] ?? {}
    merged[tier] = {
      lcpMs: cwv.lcpP75Ms ?? baselineTier.lcpMs,
      ttfbMs: cwv.ttfbP75Ms ?? baselineTier.ttfbMs,
      fcpMs: baselineTier.fcpMs ?? null,
      cls: cwv.clsP75 ?? baselineTier.cls,
      inpProxyMs: baselineTier.inpProxyMs ?? null,
    }
  }
  return merged
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Experience Vitals Agent Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Base URL: ${report.baseUrl}`)
  lines.push(`Routes measured: ${report.summary.routesMeasured}`)
  lines.push(`Budget breaches: ${report.summary.totalBreaches}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  for (const [tier, summary] of Object.entries(report.summary.byTier)) {
    lines.push(`- ${tier}: measured=${summary.measured}, breaches=${summary.breaches}`)
  }
  lines.push('')
  lines.push('## Route Metrics')
  lines.push('')
  for (const row of report.results) {
    lines.push(`- ${row.route} [${row.tier}] status=${row.status}, lcp=${row.metrics.lcpMs ?? 'n/a'}ms, ttfb=${row.metrics.ttfbMs ?? 'n/a'}ms, fcp=${row.metrics.fcpMs ?? 'n/a'}ms, cls=${row.metrics.cls ?? 'n/a'}, inpProxy=${row.metrics.inpProxyMs ?? 'n/a'}ms, breaches=${row.budget.breaches.length}`)
    if (row.budget.breaches.length > 0) lines.push(`  Breaches: ${row.budget.breaches.join('; ')}`)
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

async function postSlack({ webhookUrl, report }) {
  if (!webhookUrl) return

  const headline = report.summary.totalBreaches === 0
    ? '*Experience vitals agent: no budget breaches*'
    : `*Experience vitals agent: ${report.summary.totalBreaches} budget breach(es)*`

  const tierLines = Object.entries(report.summary.byTier).map(([tier, summary]) => {
    return `- ${tier}: measured=${summary.measured}, breaches=${summary.breaches}`
  })

  const breachLines = report.results
    .filter((row) => row.budget.breaches.length > 0)
    .slice(0, 10)
    .map((row) => `- ${row.route}: ${row.budget.breaches.join('; ')}`)

  const executiveSummary = report.summary.totalBreaches === 0
    ? `Vitals are healthy for ${report.summary.routesMeasured} measured routes with no tier budget breaches.`
    : `Vitals risk is concentrated in ${report.summary.totalBreaches} budget breach(es); prioritize funnel route remediation.`

  const text = [
    headline,
    `Base URL: ${report.baseUrl}`,
    '',
    '*Executive summary*',
    `- ${executiveSummary}`,
    '',
    '*Tier summary*',
    ...tierLines,
    '',
    '*Top breaches*',
    ...(breachLines.length > 0 ? breachLines : ['- None']),
  ].join('\n')

  await postSlackText({ webhookUrl, text })
}

async function run() {
  const args = parseArgs(process.argv.slice(2))
  const root = process.cwd()

  const inventoryPath = path.join(root, args.inventory)
  const baselinePath = path.join(root, args.baseline)
  const sesPath = path.join(root, args.ses)
  const reportJsonPath = path.join(root, args.report)
  const reportMdPath = reportJsonPath.replace(/\.json$/i, '.md')

  const baseUrl = (args.baseUrl || process.env.PLAYWRIGHT_BASE_URL || 'https://startingmonday.app').replace(/\/$/, '')
  const email = process.env.PLAYWRIGHT_TEST_EMAIL
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD
  const slackWebhook = process.env.SLACK_UI_DELIVERY_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''

  if (!fs.existsSync(inventoryPath)) throw new Error(`Missing route inventory file: ${inventoryPath}`)
  if (!fs.existsSync(baselinePath)) throw new Error(`Missing baseline file: ${baselinePath}`)
  if (!fs.existsSync(sesPath)) throw new Error(`Missing SES file: ${sesPath}`)

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
  const ses = loadSES(sesPath)

  const selectedRoutes = tieredRouteSelection(inventory.routes ?? [], baseline.routeSelection)
  if (selectedRoutes.length === 0) throw new Error('No eligible routes found for vitals measurement.')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ baseURL: baseUrl })
  const page = await context.newPage()

  const authenticated = await loginIfNeeded(page, email, password)
  if (!authenticated) {
    console.log('PLAYWRIGHT_TEST_EMAIL/PASSWORD not set; authenticated routes may redirect to login and produce partial vitals coverage.')
  }

  const results = []
  const mergedBudgets = mergeBudgets(ses, baseline.budgets ?? {})
  for (const route of selectedRoutes) {
    const row = await captureRouteVitals(page, route)
    const budget = evaluateBudgets(row, mergedBudgets)
    results.push({ ...row, budget })
  }

  await context.close()
  await browser.close()

  const byTier = {}
  for (const row of results) {
    if (!byTier[row.tier]) byTier[row.tier] = { measured: 0, breaches: 0 }
    byTier[row.tier].measured += 1
    byTier[row.tier].breaches += row.budget.breaches.length
  }

  const totalBreaches = results.reduce((acc, row) => acc + row.budget.breaches.length, 0)
  const report = {
    generatedAt: nowIso(),
    baseUrl,
    inventoryGeneratedAt: inventory.generatedAt ?? null,
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    budgetsSource: 'Site Experience Standard (SES)',
    baselineCapturedAt: baseline.capturedAt ?? null,
    summary: {
      routesMeasured: results.length,
      totalBreaches,
      byTier,
    },
    results,
    enforceFailOnBreach: Boolean(baseline.enforcement?.failOnBreach),
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  await postSlack({ webhookUrl: slackWebhook, report })

  if (report.enforceFailOnBreach && totalBreaches > 0) {
    console.error(`Experience vitals budget breaches detected: ${totalBreaches}`)
    process.exit(1)
  }

  console.log(`Experience vitals agent completed (${results.length} routes, breaches=${totalBreaches}).`)
}

run().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
