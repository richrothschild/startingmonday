#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { loadSES, getTierThresholds, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)
const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'journey-synthetic.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'journey-synthetic.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

function nowIso() {
  return new Date().toISOString()
}

function classifyRouteTier(route) {
  if (route.startsWith('/dashboard')) return 'dashboard'
  if (route === '/' || route.startsWith('/pricing') || route.startsWith('/demo') || route.startsWith('/signup')) return 'funnel'
  return 'public'
}

function getThresholdsForTier(tier) {
  const tierConfig = ses?.journeySynthetic?.tierThresholds?.[tier]
  const defaults = ses?.journeySynthetic?.defaultThresholds ?? {}
  return {
    warnStepP95Ms: tierConfig?.warnStepP95Ms ?? defaults.warnStepP95Ms ?? 6000,
    criticalStepP95Ms: tierConfig?.criticalStepP95Ms ?? defaults.criticalStepP95Ms ?? 12000,
    riskWeight: ses?.journeySynthetic?.tierRiskWeight?.[tier] ?? 1,
  }
}

async function measureJourneyStep(page, stepLabel, action) {
  const startMs = Date.now()
  await action()
  const durationMs = Date.now() - startMs
  return { stepLabel, durationMs, metrics: {} }
}

function evaluateStep(step, thresholds) {
  if (step.durationMs > thresholds.criticalStepP95Ms) {
    return { severity: 'P0', status: 'critical', margin: step.durationMs - thresholds.criticalStepP95Ms }
  }
  if (step.durationMs > thresholds.warnStepP95Ms) {
    return { severity: 'P1', status: 'warn', margin: step.durationMs - thresholds.warnStepP95Ms }
  }
  return { severity: null, status: 'pass', margin: 0 }
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Journey Synthetic Agent Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push(`Base URL: ${report.baseUrl}`)
  lines.push(`Pass: ${report.pass}`)
  lines.push('')

  lines.push('## Journey Thresholds (from SES)')
  lines.push('')
  for (const [tier, thresholds] of Object.entries(report.thresholdsByTier)) {
    lines.push(`### ${tier}`)
    lines.push(`- Warn threshold (P95): ${thresholds.warnStepP95Ms}ms`)
    lines.push(`- Critical threshold (P95): ${thresholds.criticalStepP95Ms}ms`)
    lines.push(`- Risk weight: ${thresholds.riskWeight}`)
    lines.push('')
  }

  lines.push('## Journey Results by Tier')
  lines.push('')
  for (const [tier, results] of Object.entries(report.byTier)) {
    lines.push(`### ${tier}`)
    lines.push(`- Journeys measured: ${results.count}`)
    lines.push(`- P0 critical steps: ${results.criticalCount}`)
    lines.push(`- P1 warn steps: ${results.warnCount}`)
    lines.push(`- Max step duration: ${results.maxDurationMs}ms`)
    lines.push(`- Weighted risk score: ${results.riskScore.toFixed(2)}`)
    lines.push('')
  }

  lines.push('## Top Findings')
  lines.push('')
  if (report.findings.length === 0) {
    lines.push('- None')
  } else {
    for (const finding of report.findings.slice(0, 20)) {
      lines.push(`- [${finding.severity}] ${finding.route}: ${finding.message}`)
    }
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

async function main() {
  const baseUrl = (process.env.PLAYWRIGHT_BASE_URL || 'https://startingmonday.app').replace(/\/$/, '')
  const email = process.env.PLAYWRIGHT_TEST_EMAIL
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD

  if (!email || !password) {
    console.log('Journey synthetic agent: PLAYWRIGHT_TEST_EMAIL/PASSWORD not set; using public routes only')
  }

  const journeyDefinitions = [
    {
      route: '/',
      label: 'Homepage → Signup',
      steps: [
        { label: 'Page load', action: async (page) => page.goto('/') },
        { label: 'Scroll to signup CTA', action: async (page) => page.locator('text=Get started').first().scrollIntoViewIfNeeded() },
        { label: 'Click signup', action: async (page) => page.locator('text=Get started').first().click() },
      ],
    },
    {
      route: '/pricing',
      label: 'Pricing → Checkout',
      steps: [
        { label: 'Page load', action: async (page) => page.goto('/pricing') },
        { label: 'Select plan', action: async (page) => page.locator('button:has-text("Get started")').first().click() },
      ],
    },
  ]

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ baseURL: baseUrl })
  const page = await context.newPage()

  const findings = []
  const journeys = []
  const byTier = {}
  const thresholdsByTier = {}

  try {
    for (const [tier, journeyDef] of Object.entries(
      journeyDefinitions.reduce((acc, j) => {
        const tier = classifyRouteTier(j.route)
        if (!acc[tier]) acc[tier] = []
        acc[tier].push(j)
        return acc
      }, {})
    )) {
      const thresholds = getThresholdsForTier(tier)
      thresholdsByTier[tier] = thresholds
      byTier[tier] = { count: 0, criticalCount: 0, warnCount: 0, maxDurationMs: 0, riskScore: 0 }
    }

    for (const journeyDef of journeyDefinitions) {
      const tier = classifyRouteTier(journeyDef.route)
      const thresholds = getThresholdsForTier(tier)
      const steps = []

      for (const stepDef of journeyDef.steps) {
        const step = await measureJourneyStep(page, stepDef.label, async () => {
          await stepDef.action(page)
        })
        steps.push(step)

        const evaluation = evaluateStep(step, thresholds)
        if (evaluation.severity) {
          findings.push({
            severity: evaluation.severity,
            route: journeyDef.route,
            message: `${journeyDef.label} → ${step.stepLabel}: ${step.durationMs}ms (${evaluation.status}, margin: ${evaluation.margin.toFixed(0)}ms)`,
          })
        }
      }

      const journeyResult = {
        route: journeyDef.route,
        label: journeyDef.label,
        tier,
        steps,
        maxStepMs: Math.max(...steps.map((s) => s.durationMs)),
        evaluations: steps.map((s) => evaluateStep(s, thresholds)),
      }
      journeys.push(journeyResult)

      // Update tier summary
      byTier[tier].count += 1
      byTier[tier].maxDurationMs = Math.max(byTier[tier].maxDurationMs, journeyResult.maxStepMs)
      byTier[tier].criticalCount += journeyResult.evaluations.filter((e) => e.severity === 'P0').length
      byTier[tier].warnCount += journeyResult.evaluations.filter((e) => e.severity === 'P1').length
      byTier[tier].riskScore += journeyResult.evaluations.reduce((sum, e) => {
        if (e.severity === 'P0') return sum + (2.0 * thresholds.riskWeight)
        if (e.severity === 'P1') return sum + (1.0 * thresholds.riskWeight)
        return sum
      }, 0)
    }

    const report = {
      generatedAt: nowIso(),
      baseUrl,
      sesVersion: ses.version,
      sesReviewBy: ses.reviewBy,
      journeyDefinitions: journeyDefinitions.map((j) => j.label),
      journeys,
      thresholdsByTier,
      byTier,
      findings,
      pass: findings.length === 0,
    }

    writeLatestReportFiles({
      jsonPath: reportJsonPath,
      markdownPath: reportMdPath,
      report,
      markdown: buildMarkdown(report),
    })

    await postSlackText({
      webhookUrl: slackWebhook,
      text: [
        report.pass ? '*Journey synthetic: all thresholds met*' : `*Journey synthetic: ${findings.length} finding(s)*`,
        `Channel: ${slackChannel}`,
        `Journeys measured: ${journeys.length}`,
        '',
        '*Findings*',
        ...(findings.length === 0 ? ['- None'] : findings.slice(0, 8).map((f) => `- [${f.severity}] ${f.message}`)),
      ].join('\n'),
    })

    console.log(`Journey synthetic agent completed (${journeys.length} journeys, ${findings.length} findings).`)
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
