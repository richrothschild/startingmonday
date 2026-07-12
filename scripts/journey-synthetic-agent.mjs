#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
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

function percentile(values, p) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.max(0, Math.min(sorted.length - 1, Math.floor((p / 100) * (sorted.length - 1))))
  return sorted[index]
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

function evaluateStepPercentiles(stepSummary, thresholds) {
  if (stepSummary.p95Ms > thresholds.criticalStepP95Ms) {
    return { severity: 'P0', status: 'critical', margin: stepSummary.p95Ms - thresholds.criticalStepP95Ms }
  }
  if (stepSummary.p95Ms > thresholds.warnStepP95Ms) {
    return { severity: 'P1', status: 'warn', margin: stepSummary.p95Ms - thresholds.warnStepP95Ms }
  }
  return { severity: null, status: 'pass', margin: 0 }
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
  const samplesPerJourney = Math.max(1, Number.parseInt(process.env.JOURNEY_SAMPLES ?? '3', 10))

  const journeyDefinitions = [
    {
      route: '/',
      label: 'Homepage → Signup',
      tier: 'funnel',
      steps: [
        { label: 'Page load', action: async (page) => page.goto('/') },
        { label: 'Scroll to signup CTA', action: async (page) => page.getByRole('link', { name: /Get started/i }).first().scrollIntoViewIfNeeded() },
        { label: 'Click signup', action: async (page) => page.getByRole('link', { name: /Get started/i }).first().click() },
      ],
    },
    {
      route: '/pricing',
      label: 'Pricing → Checkout',
      tier: 'funnel',
      steps: [
        { label: 'Page load', action: async (page) => page.goto('/pricing') },
        { label: 'Select plan', action: async (page) => page.getByRole('link', { name: /Get started/i }).first().click() },
      ],
    },
    {
      route: '/demo',
      label: 'Demo → Run',
      tier: 'funnel',
      steps: [
        { label: 'Page load', action: async (page) => page.goto('/demo') },
        { label: 'Run demo', action: async (page) => page.getByRole('button', { name: /run demo|run search|run/i }).first().click({ timeout: 7000 }) },
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
  const screenshotsDir = path.join(process.cwd(), 'tmp', 'journey-synthetic')
  fs.mkdirSync(screenshotsDir, { recursive: true })

  try {
    for (const [tier] of Object.entries(
      journeyDefinitions.reduce((acc, j) => {
        const journeyTier = j.tier ?? classifyRouteTier(j.route)
        const tier = journeyTier
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
      const tier = journeyDef.tier ?? classifyRouteTier(journeyDef.route)
      const thresholds = getThresholdsForTier(tier)
      const stepDurationsByLabel = new Map()
      let sampleFailures = 0
      const failureScreenshots = []

      for (let sample = 0; sample < samplesPerJourney; sample += 1) {
        try {
          for (const stepDef of journeyDef.steps) {
            const step = await measureJourneyStep(page, stepDef.label, async () => {
              await stepDef.action(page)
            })
            if (!stepDurationsByLabel.has(step.stepLabel)) stepDurationsByLabel.set(step.stepLabel, [])
            stepDurationsByLabel.get(step.stepLabel).push(step.durationMs)
          }
        } catch (error) {
          sampleFailures += 1
          const screenshotPath = path.join(screenshotsDir, `${journeyDef.route.replace(/[^a-zA-Z0-9_-]/g, '_')}-sample-${sample + 1}.png`)
          try {
            await page.screenshot({ path: screenshotPath, fullPage: false })
            failureScreenshots.push(path.relative(process.cwd(), screenshotPath).replace(/\\/g, '/'))
          } catch {}
          findings.push({
            severity: 'P1',
            route: journeyDef.route,
            message: `${journeyDef.label} sample ${sample + 1} failed: ${error instanceof Error ? error.message : String(error)}`,
          })
        }
      }

      const steps = [...stepDurationsByLabel.entries()].map(([stepLabel, durations]) => ({
        stepLabel,
        runs: durations.length,
        p50Ms: percentile(durations, 50),
        p75Ms: percentile(durations, 75),
        p95Ms: percentile(durations, 95),
        maxMs: Math.max(...durations),
      }))

      const evaluations = steps.map((step) => evaluateStepPercentiles(step, thresholds))
      for (let index = 0; index < steps.length; index += 1) {
        const step = steps[index]
        const evaluation = evaluations[index]
        if (evaluation.severity) {
          findings.push({
            severity: evaluation.severity,
            route: journeyDef.route,
            message: `${journeyDef.label} → ${step.stepLabel}: p95=${step.p95Ms}ms (${evaluation.status}, margin: ${evaluation.margin.toFixed(0)}ms)`,
          })
        }
      }

      const abandonmentRisk = evaluations.some((e) => e.severity === 'P0') || sampleFailures > 0
        ? 'high'
        : evaluations.some((e) => e.severity === 'P1')
          ? 'medium'
          : 'low'

      const journeyResult = {
        route: journeyDef.route,
        label: journeyDef.label,
        tier,
        steps,
        sampleRuns: samplesPerJourney,
        sampleFailures,
        failureScreenshots,
        abandonmentRisk,
        maxStepMs: steps.length > 0 ? Math.max(...steps.map((s) => s.maxMs)) : 0,
        evaluations,
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
      samplesPerJourney,
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
        `Journeys measured: ${journeys.length} (samples per journey: ${samplesPerJourney})`,
        '',
        '*Executive summary*',
        report.pass
          ? `- Tier-1 journey execution is stable with no threshold or interaction failures across ${journeys.length} journey definition(s).`
          : `- Journey reliability is degraded with ${findings.length} finding(s); prioritize fixing broken interaction targets on critical conversion flows.`,
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
