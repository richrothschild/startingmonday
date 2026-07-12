#!/usr/bin/env node
/**
 * Experience Visual Sentinel Reporter
 *
 * Daily report on rendered visual discipline:
 *  - Screenshot-based darkness/contrast metrics
 *  - Typography discipline findings
 *  - Accent color usage patterns
 *  - Visual regression detection (layout shifts, CSS bleed)
 *
 * Integrates with Slack and the SXO reporting cadence.
 * Consumes: tmp/luxury-page-sentinel.json
 * Produces: docs/status/experience-visual-sentinel.latest.{json,md}
 */
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, getTierThresholds, ageMinutes, writeLatestReportFiles, postSlackText } from './lib/agent-report-kit.mjs'

const ROOT = process.cwd()
const SENTINEL_JSON_PATH = path.join(ROOT, 'tmp', 'luxury-page-sentinel.json')
const SES_PATH = path.join(ROOT, 'config', 'site-experience-standard.json')
const OUTPUT_DIR = path.join(ROOT, 'docs', 'status')

function readSentinelReport() {
  if (!fs.existsSync(SENTINEL_JSON_PATH)) {
    return { available: false, summary: {} }
  }
  const report = JSON.parse(fs.readFileSync(SENTINEL_JSON_PATH, 'utf8'))
  return { available: true, report }
}

function analyzeVisualFindings(report) {
  const findings = {
    available: report.available,
    screenshotsCaptured: report.report?.screenshotsCaptured ?? 0,
    paletteViolations: report.report?.paletteViolations ?? 0,
    typographyWarnings: report.report?.typographyWarnings ?? 0,
    accentWarnings: report.report?.accentWarnings ?? 0,
    renderedDarknessWarnings: report.report?.renderedDarknessWarnings ?? 0,
    renderedCaptureFailures: report.report?.renderedCaptureFailures ?? 0,
    routesWithIssues: [],
    incidents: [],
  }

  if (report.report?.incidents?.top) {
    findings.incidents = report.report.incidents.top
      .filter((i) => i.dimension.includes('palette') || i.dimension.includes('rendered') || i.dimension.includes('typography'))
      .slice(0, 10)
  }

  // Collect routes with visual issues
  const violationsByRoute = new Map()
  if (report.report?.violations) {
    for (const v of report.report.violations) {
      if (!v.route || v.route === '(portfolio)') continue
      const key = v.route
      if (!violationsByRoute.has(key)) {
        violationsByRoute.set(key, [])
      }
      violationsByRoute.get(key).push(v.dimension)
    }
  }

  findings.routesWithIssues = Array.from(violationsByRoute.entries())
    .map(([route, dimensions]) => ({ route, dimensions, count: dimensions.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  return findings
}

function buildMarkdown(findings) {
  const lines = []
  lines.push('# Visual Sentinel Report')
  lines.push('')

  if (!findings.available) {
    lines.push('⚠️ Sentinel report not available')
    return lines.join('\n')
  }

  lines.push('## Overview')
  lines.push(`- Screenshots captured: **${findings.screenshotsCaptured}**`)
  lines.push(`- Palette violations: **${findings.paletteViolations}**`)
  lines.push(`- Typography warnings: **${findings.typographyWarnings}**`)
  lines.push(`- Accent warnings: **${findings.accentWarnings}**`)
  lines.push(`- Rendered darkness warnings: **${findings.renderedDarknessWarnings}**`)
  lines.push(`- Screenshot capture failures: **${findings.renderedCaptureFailures}**`)
  lines.push('')

  if (findings.incidents.length > 0) {
    lines.push('## Top Visual Incidents')
    for (const incident of findings.incidents) {
      lines.push(`### ${incident.dimension}/${incident.scope}`)
      lines.push(`- **Routes affected:** ${incident.routeCount}`)
      lines.push(`- **Evidence:** ${incident.signature}`)
      lines.push(`- **Samples:** ${incident.sampleRoutes.join(', ')}`)
      lines.push('')
    }
  }

  if (findings.routesWithIssues.length > 0) {
    lines.push('## Routes with Visual Issues')
    for (const route of findings.routesWithIssues.slice(0, 10)) {
      lines.push(`- **${route.route}**: ${route.dimensions.join(', ')} (${route.count} dimension(s))`)
    }
    lines.push('')
  }

  lines.push('## Rendered Checks Status')
  if (findings.screenshotsCaptured === 0) {
    lines.push('- No screenshots captured in latest run')
  } else {
    lines.push(`- ✅ Screenshots captured for ${findings.screenshotsCaptured} route(s)`)
    if (findings.renderedDarknessWarnings > 0) {
      lines.push(`- ⚠️ ${findings.renderedDarknessWarnings} route(s) with darkness discipline warnings`)
    } else {
      lines.push('- ✅ All captured routes pass darkness discipline checks')
    }
  }

  return lines.join('\n')
}

function buildSlackText(findings) {
  const lines = []
  lines.push(':camera: Visual Sentinel Report')
  lines.push('')

  if (!findings.available) {
    lines.push('⚠️ Sentinel report not available')
    return lines.join('\n')
  }

  const statusLine = findings.paletteViolations > 0 || findings.typographyWarnings > 0
    ? `:rotating_light: ${findings.paletteViolations} palette violations, ${findings.typographyWarnings} typography warnings, ${findings.renderedDarknessWarnings} rendered darkness warnings`
    : '✅ No visual violations detected'

  lines.push(statusLine)
  lines.push(`Screenshots captured: ${findings.screenshotsCaptured}`)
  lines.push(`Routes with issues: ${findings.routesWithIssues.length}`)

  if (findings.incidents.length > 0) {
    lines.push('')
    lines.push('Top incidents:')
    for (const incident of findings.incidents.slice(0, 5)) {
      lines.push(`• [${incident.dimension}/${incident.scope}] ${incident.routeCount} route(s): ${incident.signature}`)
    }
  }

  return lines.join('\n')
}

async function main() {
  const sentinelData = readSentinelReport()
  const findings = analyzeVisualFindings(sentinelData)
  const markdown = buildMarkdown(findings)
  const slackText = buildSlackText(findings)

  const report = {
    generatedAt: new Date().toISOString(),
    findings,
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  await writeLatestReportFiles({
    jsonPath: path.join(OUTPUT_DIR, 'experience-visual-sentinel.latest.json'),
    markdownPath: path.join(OUTPUT_DIR, 'experience-visual-sentinel.latest.md'),
    report,
    markdown,
  })

  console.log('Visual sentinel report generated')
  console.log(`- palette violations: ${findings.paletteViolations}`)
  console.log(`- typography warnings: ${findings.typographyWarnings}`)
  console.log(`- accent warnings: ${findings.accentWarnings}`)
  console.log(`- rendered darkness warnings: ${findings.renderedDarknessWarnings}`)
  console.log(`- routes with issues: ${findings.routesWithIssues.length}`)

  const webhook = process.env.SLACK_WEBHOOK_URL
  if (webhook) {
    await postSlackText({ webhookUrl: webhook, text: slackText })
  }
}

await main()
