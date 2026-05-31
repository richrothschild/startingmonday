#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const POLICY_PATH = path.join(ROOT, 'config', 'performance-regression-policy.json')
const BASELINE_PATH = path.join(ROOT, 'config', 'performance-baseline.json')
const CURRENT_MOBILE_PATH = path.join(ROOT, 'docs', 'performance-audit', 'production-mobile.latest.json')
const CURRENT_SMOKE_PATH = path.join(ROOT, 'docs', 'performance-audit', 'production-smoke.latest.json')
const OUT_JSON = path.join(ROOT, 'docs', 'performance-release-scorecard.latest.json')
const OUT_MD = path.join(ROOT, 'docs', 'performance-release-scorecard.latest.md')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

function percent(value) {
  return `${(value * 100).toFixed(1)}%`
}

function round(value) {
  return Math.round(value * 10) / 10
}

function regressionLimit(base, maxRegressionPercent, noiseBufferMs) {
  return base * (1 + maxRegressionPercent / 100) + noiseBufferMs
}

function evaluateRouteRegressions(policy, baseline, current) {
  const findings = []
  const baseRoutes = baseline.mobile?.routeDurationsMs ?? {}
  const currentRoutes = Array.isArray(current.results) ? current.results : []

  for (const [routePath, baseDuration] of Object.entries(baseRoutes)) {
    const currentRoute = currentRoutes.find((r) => r.path === routePath)
    if (!currentRoute) continue

    const currentDuration = Number(currentRoute.durationMs)
    const limit = regressionLimit(
      Number(baseDuration),
      policy.blockingRules.routeDuration.maxRegressionPercent,
      policy.blockingRules.routeDuration.noiseBufferMs,
    )

    findings.push({
      routePath,
      baselineMs: Number(baseDuration),
      currentMs: currentDuration,
      limitMs: round(limit),
      blocked: currentDuration > limit,
    })
  }

  return findings
}

function buildScorecard(policy, baseline, currentMobile, currentSmoke) {
  const blockers = []

  const p95Baseline = Number(baseline.mobile?.p95ResponseMs ?? 0)
  const p95Current = Number(currentMobile.p95ResponseMs ?? 0)
  const p95Limit = regressionLimit(
    p95Baseline,
    policy.blockingRules.mobileP95.maxRegressionPercent,
    policy.blockingRules.mobileP95.noiseBufferMs,
  )

  if (p95Current > p95Limit) {
    blockers.push({
      metric: 'mobile.p95ResponseMs',
      reason: `Current ${p95Current}ms exceeds regression limit ${round(p95Limit)}ms from baseline ${p95Baseline}ms`,
    })
  }

  const passRateBaseline = Number(baseline.mobile?.passRate ?? 1)
  const passRateCurrent = Number(currentMobile.passRate ?? 0)
  const passRateMin = passRateBaseline - policy.blockingRules.mobilePassRate.maxDropPercentagePoints / 100

  if (passRateCurrent < passRateMin) {
    blockers.push({
      metric: 'mobile.passRate',
      reason: `Current ${percent(passRateCurrent)} below regression floor ${percent(passRateMin)} from baseline ${percent(passRateBaseline)}`,
    })
  }

  const baselineCriticalFailed = Number(baseline.smoke?.criticalFailed ?? 0)
  const currentCriticalFailed = Number(currentSmoke.criticalFailed ?? 0)
  const maxCriticalFailed = baselineCriticalFailed + Number(policy.blockingRules.smokeCriticalFailures.allowIncreaseBy ?? 0)

  if (currentCriticalFailed > maxCriticalFailed) {
    blockers.push({
      metric: 'smoke.criticalFailed',
      reason: `Current ${currentCriticalFailed} exceeds allowed maximum ${maxCriticalFailed}`,
    })
  }

  const routeFindings = evaluateRouteRegressions(policy, baseline, currentMobile)
  for (const finding of routeFindings) {
    if (finding.blocked) {
      blockers.push({
        metric: `mobile.route.${finding.routePath}`,
        reason: `Current ${finding.currentMs}ms exceeds regression limit ${finding.limitMs}ms from baseline ${finding.baselineMs}ms`,
      })
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    baseUrl: currentMobile.baseUrl,
    verdict: blockers.length === 0 ? 'pass' : 'fail',
    blockingPolicy: policy.blockingRules,
    baseline: {
      capturedAt: baseline.capturedAt,
      mobileP95ResponseMs: p95Baseline,
      mobilePassRate: passRateBaseline,
      smokeCriticalFailed: baselineCriticalFailed,
    },
    current: {
      capturedAt: currentMobile.ts,
      mobileP95ResponseMs: p95Current,
      mobilePassRate: passRateCurrent,
      smokeCriticalFailed: currentCriticalFailed,
    },
    routeComparisons: routeFindings,
    blockers,
    notes: [
      'This gate blocks only on configured regression thresholds against baseline.',
      'Small variance under configured buffers is treated as noise and does not block release.',
    ],
  }
}

function toMarkdown(scorecard) {
  const lines = []
  lines.push('# Performance Release Scorecard')
  lines.push('')
  lines.push(`Generated: ${scorecard.generatedAt}`)
  lines.push(`Base URL: ${scorecard.baseUrl}`)
  lines.push(`Verdict: ${scorecard.verdict.toUpperCase()}`)
  lines.push('')
  lines.push('## Blocking Policy (Regression-Only)')
  lines.push('')
  lines.push(`- Mobile p95 regression threshold: +${scorecard.blockingPolicy.mobileP95.maxRegressionPercent}% with ${scorecard.blockingPolicy.mobileP95.noiseBufferMs}ms noise buffer`)
  lines.push(`- Mobile pass-rate max drop: ${scorecard.blockingPolicy.mobilePassRate.maxDropPercentagePoints} percentage points`)
  lines.push(`- Route duration regression threshold: +${scorecard.blockingPolicy.routeDuration.maxRegressionPercent}% with ${scorecard.blockingPolicy.routeDuration.noiseBufferMs}ms noise buffer`)
  lines.push(`- Smoke critical failures allowed increase: ${scorecard.blockingPolicy.smokeCriticalFailures.allowIncreaseBy}`)
  lines.push('')
  lines.push('## Baseline vs Current')
  lines.push('')
  lines.push('| Metric | Baseline | Current |')
  lines.push('| --- | ---: | ---: |')
  lines.push(`| Mobile p95 (ms) | ${scorecard.baseline.mobileP95ResponseMs} | ${scorecard.current.mobileP95ResponseMs} |`)
  lines.push(`| Mobile pass rate | ${percent(scorecard.baseline.mobilePassRate)} | ${percent(scorecard.current.mobilePassRate)} |`)
  lines.push(`| Smoke critical failed | ${scorecard.baseline.smokeCriticalFailed} | ${scorecard.current.smokeCriticalFailed} |`)
  lines.push('')
  lines.push('## Route Regression Checks')
  lines.push('')
  lines.push('| Route | Baseline ms | Current ms | Regression limit ms | Status |')
  lines.push('| --- | ---: | ---: | ---: | --- |')
  for (const route of scorecard.routeComparisons) {
    lines.push(`| ${route.routePath} | ${route.baselineMs} | ${route.currentMs} | ${route.limitMs} | ${route.blocked ? 'BLOCK' : 'OK'} |`)
  }
  lines.push('')
  lines.push('## Blocking Findings')
  lines.push('')
  if (scorecard.blockers.length === 0) {
    lines.push('- None')
  } else {
    for (const blocker of scorecard.blockers) {
      lines.push(`- ${blocker.metric}: ${blocker.reason}`)
    }
  }
  lines.push('')
  lines.push('## Notes')
  lines.push('')
  for (const note of scorecard.notes) {
    lines.push(`- ${note}`)
  }
  lines.push('')
  return lines.join('\n')
}

function main() {
  const policy = readJson(POLICY_PATH)
  const baseline = readJson(BASELINE_PATH)
  const currentMobile = readJson(CURRENT_MOBILE_PATH)
  const currentSmoke = readJson(CURRENT_SMOKE_PATH)
  const gateMode = process.env.PERFORMANCE_RELEASE_GATE_MODE === 'advisory' ? 'advisory' : 'enforce'

  const scorecard = buildScorecard(policy, baseline, currentMobile, currentSmoke)

  fs.writeFileSync(OUT_JSON, JSON.stringify(scorecard, null, 2) + '\n', 'utf8')
  fs.writeFileSync(OUT_MD, toMarkdown(scorecard), 'utf8')

  console.log('Performance release scorecard generated.')
  console.log(`Report: ${rel(OUT_MD)}`)
  console.log(`Data:   ${rel(OUT_JSON)}`)

  if (scorecard.verdict !== 'pass' && gateMode === 'enforce') {
    process.exitCode = 1
  }

  if (scorecard.verdict !== 'pass' && gateMode === 'advisory') {
    console.warn('Performance release gate is running in advisory mode (non-blocking).')
  }
}

main()
