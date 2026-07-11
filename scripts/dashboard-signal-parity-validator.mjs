#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { loadSES, getTierThresholds, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'dashboard-signal-parity.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'dashboard-signal-parity.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_ESCALATION_CHANNEL || 'reliability---service'

function nowIso() {
  return new Date().toISOString()
}

function loadDashboardReport() {
  const path1 = path.join(process.cwd(), 'docs', 'status', 'trust-integrity.latest.json')
  if (!fs.existsSync(path1)) return null
  return JSON.parse(fs.readFileSync(path1, 'utf8'))
}

function extractSignalCounts(report) {
  const findingByRoute = new Map()

  for (const finding of report.findings ?? []) {
    if (!finding.route) continue
    if (!findingByRoute.has(finding.route)) {
      findingByRoute.set(finding.route, [])
    }
    findingByRoute.get(finding.route).push(finding)
  }

  const parity = {}

  for (const [route, findings] of findingByRoute) {
    const routeFindings = findings.filter((f) => f.message && f.message.includes('signal'))

    parity[route] = {
      route,
      hasSignalParityFinding: routeFindings.length > 0,
      parityMessage: routeFindings.length > 0 ? routeFindings[0].message : 'No parity violation detected',
      severity: routeFindings.length > 0 ? 'P0' : 'pass',
    }
  }

  return parity
}

async function validateSignalParityLive(page, baseUrl = 'http://localhost:3000') {
  const results = {
    dashboard: null,
    briefing: null,
    signalsIndex: null,
    parityStatus: 'unknown',
  }

  try {
    // Navigate to dashboard
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.locator('main').first().waitFor({ state: 'visible', timeout: 10000 })

    const dashboardText = await page.locator('body').innerText()
    const dashboardMatch = dashboardText.match(/Signals\s+this\s+week:\s*(\d+)|(\d+)\s+fresh\s+signal(?:s)?/)
    const dashboardCount = dashboardMatch ? Number.parseInt(dashboardMatch[1] || dashboardMatch[2], 10) : null

    results.dashboard = {
      route: '/dashboard',
      signalCount: dashboardCount,
      accessible: dashboardCount !== null,
    }

    // Navigate to briefing
    await page.goto(`${baseUrl}/dashboard/briefing`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.locator('main').first().waitFor({ state: 'visible', timeout: 10000 })

    const briefingText = await page.locator('body').innerText()
    const briefingMatch = briefingText.match(/(\d+)\s+market\s+move(?:s)?\s+this\s+week/)
    const briefingCount = briefingMatch ? Number.parseInt(briefingMatch[1], 10) : null

    results.briefing = {
      route: '/dashboard/briefing',
      signalCount: briefingCount,
      accessible: briefingCount !== null,
    }

    // Determine parity
    if (results.dashboard.signalCount !== null && results.briefing.signalCount !== null) {
      if (results.dashboard.signalCount === results.briefing.signalCount) {
        results.parityStatus = 'pass'
      } else {
        results.parityStatus = 'fail'
      }
    } else {
      results.parityStatus = 'unable-to-verify'
    }
  } catch (error) {
    results.parityStatus = 'error'
    results.error = error instanceof Error ? error.message : String(error)
  }

  return results
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Dashboard Signal Parity Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Overall Status')
  lines.push('')
  if (report.overallStatus === 'pass') {
    lines.push('✅ Signal count parity validated across all dashboard routes')
  } else if (report.overallStatus === 'fail') {
    lines.push('❌ Signal count parity violations detected')
  } else {
    lines.push('⚠️ Unable to validate parity (insufficient data)')
  }
  lines.push('')

  lines.push('## Dashboard')
  lines.push('')
  lines.push(`- Route: /dashboard`)
  lines.push(`- Signal Count: ${report.dashboard?.signalCount ?? 'unknown'}`)
  lines.push(`- Status: ${report.dashboard?.accessible ? 'accessible' : 'inaccessible'}`)
  lines.push('')

  lines.push('## Briefing')
  lines.push('')
  lines.push(`- Route: /dashboard/briefing`)
  lines.push(`- Market Moves Count: ${report.briefing?.signalCount ?? 'unknown'}`)
  lines.push(`- Status: ${report.briefing?.accessible ? 'accessible' : 'inaccessible'}`)
  lines.push('')

  lines.push('## Parity Analysis')
  lines.push('')
  if (report.parityStatus === 'pass') {
    lines.push(`✅ Signal counts match: dashboard=${report.dashboard?.signalCount} briefing=${report.briefing?.signalCount}`)
  } else if (report.parityStatus === 'fail') {
    lines.push(`❌ Signal count mismatch: dashboard=${report.dashboard?.signalCount} vs briefing=${report.briefing?.signalCount}`)
    lines.push('   → Investigate data source queries and reconcile counts')
  } else {
    lines.push(`⚠️ Unable to verify: ${report.parityStatus}`)
  }
  lines.push('')

  lines.push('## Findings from Trust Integrity')
  lines.push('')
  if (report.trustFindings && Object.keys(report.trustFindings).length > 0) {
    for (const [route, finding] of Object.entries(report.trustFindings)) {
      lines.push(`- ${route}: ${finding.severity} - ${finding.parityMessage}`)
    }
  } else {
    lines.push('- No signal parity findings from trust integrity agent')
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const headline = report.parityStatus === 'pass'
    ? '✅ Dashboard signal parity: valid'
    : `❌ Dashboard signal parity: ${report.parityStatus}`

  const details = report.parityStatus === 'fail'
    ? `Dashboard count: ${report.dashboard?.signalCount} | Briefing count: ${report.briefing?.signalCount}`
    : `Dashboard: ${report.dashboard?.signalCount} | Briefing: ${report.briefing?.signalCount}`

  return [
    headline,
    `Channel: ${report.channel}`,
    `Status: ${report.parityStatus}`,
    `${details}`,
    report.parityStatus === 'fail' ? 'Action: Investigate signal source queries and reconcile counts' : 'No action required',
  ].join('\n')
}

async function main() {
  const trustReport = loadDashboardReport()
  const trustFindings = trustReport ? extractSignalCounts(trustReport) : {}

  const email = process.env.PLAYWRIGHT_TEST_EMAIL
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

  let liveValidation = null

  if (email && password) {
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
      // Log in
      await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.fill('input[type="email"]', email)
      await page.fill('input[type="password"]', password)
      await page.click('button[type="submit"]')
      await page.waitForURL(`${baseUrl}/dashboard**`, { timeout: 30000 })

      liveValidation = await validateSignalParityLive(page, baseUrl)
    } catch (error) {
      console.log('Live validation skipped:', error instanceof Error ? error.message : String(error))
    } finally {
      await browser.close()
    }
  } else {
    console.log('Playwright credentials not set; skipping live parity validation')
  }

  const overallStatus = liveValidation
    ? liveValidation.parityStatus
    : trustFindings && Object.values(trustFindings).some((f) => f.hasSignalParityFinding)
      ? 'fail'
      : 'unknown'

  const report = {
    generatedAt: nowIso(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    parityStatus: liveValidation?.parityStatus || overallStatus,
    dashboard: liveValidation?.dashboard,
    briefing: liveValidation?.briefing,
    overallStatus,
    trustFindings,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  // Only post to Slack if there's a parity violation
  if (report.parityStatus === 'fail') {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: buildSlackText(report),
    })
  }

  const status = liveValidation
    ? `parity=${liveValidation.parityStatus}`
    : trustFindings && Object.values(trustFindings).some((f) => f.hasSignalParityFinding)
      ? 'violations detected'
      : 'no violations'

  console.log(`Dashboard signal parity validation completed (${status}).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
