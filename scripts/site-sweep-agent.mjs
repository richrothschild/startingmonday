#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import { writeLatestReportFiles, postSlackText } from './lib/agent-report-kit.mjs'
import { filterRoutesBySelection, parseRouteSelection, selectionToArray } from './lib/route-selection.mjs'

const ROOT = process.cwd()
const INVENTORY_SCRIPT = path.join(ROOT, 'scripts', 'experience-route-inventory.mjs')
const INVENTORY_JSON = path.join(ROOT, 'docs', 'status', 'route-inventory.latest.json')
const LANDING_SCRIPT = path.join(ROOT, 'scripts', 'check-landing-standard-all-pages.mjs')
const COGNITIVE_SCRIPT = path.join(ROOT, 'scripts', 'check-cognitive-load-all-pages.mjs')
const TRUST_SCRIPT = path.join(ROOT, 'scripts', 'trust-integrity-agent.mjs')
const OUTPUT_JSON = path.join(ROOT, 'docs', 'status', 'site-sweep.latest.json')
const OUTPUT_MD = path.join(ROOT, 'docs', 'status', 'site-sweep.latest.md')

function parseArgs(argv) {
  const args = {
    routeSelection: parseRouteSelection(argv),
    skipTrust: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--base-url') args.baseUrl = argv[i + 1]
    if (token.startsWith('--base-url=')) args.baseUrl = token.slice('--base-url='.length)
    if (token === '--skip-trust') args.skipTrust = true
    if (token === '--json') args.json = true
  }

  return args
}

function runNode(scriptPath, args, env = {}) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error ? String(result.error.message ?? result.error) : null,
  }
}

function readInventory() {
  const generated = runNode(INVENTORY_SCRIPT, [])
  if (generated.status !== 0) {
    throw new Error(`Route inventory failed: ${generated.stderr || generated.stdout || generated.error || 'unknown error'}`)
  }

  return JSON.parse(fs.readFileSync(INVENTORY_JSON, 'utf8'))
}

function parseJsonOutput(output, label) {
  const trimmed = output.trim()
  if (!trimmed) {
    throw new Error(`Empty ${label} output`)
  }

  const jsonStart = trimmed.indexOf('{')
  const jsonText = jsonStart >= 0 ? trimmed.slice(jsonStart) : trimmed

  try {
    return JSON.parse(jsonText)
  } catch {
    throw new Error(`Unable to parse ${label} JSON output`)
  }
}

function aggregateIssueCount(audits) {
  return audits.reduce((sum, audit) => sum + (audit.issueCount ?? 0), 0)
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Site Sweep Agent Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Base URL: ${report.baseUrl}`)
  lines.push(`Route selection: ${report.routeSelection.length > 0 ? report.routeSelection.join(', ') : 'all inventoried routes'}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Routes scanned: ${report.summary.routesScanned}`)
  lines.push(`- Routes with issues: ${report.summary.routesWithIssues}`)
  lines.push(`- Total issues: ${report.summary.totalIssues}`)
  lines.push(`- Landing audit pass: ${report.summary.landingPass ? 'yes' : 'no'}`)
  lines.push(`- Cognitive audit pass: ${report.summary.cognitivePass ? 'yes' : 'no'}`)
  lines.push(`- Trust audit pass: ${report.summary.trustPass ? 'yes' : 'no'}`)
  lines.push('')
  lines.push('## Route Results')
  lines.push('')
  for (const route of report.routes) {
    const auditSummary = route.audits
      .map((audit) => `${audit.name}:${audit.status}${audit.issueCount ? `(${audit.issueCount})` : ''}`)
      .join(', ')
    lines.push(`- ${route.route} [${route.tier}] ${auditSummary}`)
  }
  lines.push('')
  if (report.trustBundle) {
    lines.push('## Trust Bundle')
    lines.push('')
    lines.push(`- Routes: ${report.trustBundle.routes.join(', ')}`)
    lines.push(`- Status: ${report.trustBundle.pass ? 'pass' : 'fail'}`)
    lines.push(`- Findings: ${report.trustBundle.findings.length}`)
    lines.push('')
  }
  return `${lines.join('\n')}\n`
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const inventory = readInventory()
  const inventoryRoutes = filterRoutesBySelection(inventory.routes, args.routeSelection)

  if (inventoryRoutes.length === 0) {
    throw new Error(`No inventoried routes matched selection: ${selectionToArray(args.routeSelection).join(', ')}`)
  }

  const routeResults = []
  let landingPass = true
  let cognitivePass = true

  for (const route of inventoryRoutes) {
    const landingRun = runNode(LANDING_SCRIPT, ['--json', `--route=${route.route}`])
    const landing = parseJsonOutput(landingRun.stdout, 'landing standard')
    const landingRoute = landing.results?.[0]

    const cognitiveRun = runNode(COGNITIVE_SCRIPT, ['--json', `--route=${route.route}`])
    const cognitive = parseJsonOutput(cognitiveRun.stdout, 'cognitive load')
    const cognitiveRoute = cognitive.pages?.[0]

    const audits = []

    if (landingRoute) {
      const landingOk = landingRoute.issueCount === 0
      audits.push({ name: 'landing', status: landingOk ? 'pass' : 'fail', issueCount: landingRoute.issueCount })
      landingPass = landingPass && landingOk
    }

    if (cognitiveRoute) {
      const cognitiveOk = cognitiveRoute.issueCount === 0
      audits.push({ name: 'cognitive', status: cognitiveOk ? 'pass' : 'fail', issueCount: cognitiveRoute.issueCount })
      cognitivePass = cognitivePass && cognitiveOk
    }

    routeResults.push({
      route: route.route,
      tier: route.tier,
      audits,
      issueCount: aggregateIssueCount(audits),
      landing,
      cognitive,
    })
  }

  const dashboardRoutes = inventoryRoutes
    .filter((route) => route.tier === 'dashboard')
    .map((route) => route.route)

  let trustBundle = null
  let trustPass = true

  if (!args.skipTrust && dashboardRoutes.length > 0) {
    const trustRun = runNode(
      TRUST_SCRIPT,
      ['--json', `--routes=${dashboardRoutes.join(',')}`],
      args.baseUrl ? { PLAYWRIGHT_BASE_URL: args.baseUrl } : {},
    )
    const trust = parseJsonOutput(trustRun.stdout, 'trust integrity')

    trustBundle = {
      routes: dashboardRoutes,
      pass: trust.pass,
      findings: trust.findings ?? [],
      report: trust,
    }
    trustPass = trust.pass
  }

  const summary = {
    routesScanned: routeResults.length,
    routesWithIssues: routeResults.filter((route) => route.issueCount > 0).length,
    totalIssues: routeResults.reduce((sum, route) => sum + route.issueCount, 0),
    landingPass,
    cognitivePass,
    trustPass,
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: args.baseUrl ?? process.env.PLAYWRIGHT_BASE_URL ?? 'https://startingmonday.app',
    routeSelection: selectionToArray(args.routeSelection),
    inventory: {
      generatedAt: inventory.generatedAt,
      totalRoutes: inventory.totals?.routes ?? inventoryRoutes.length,
    },
    summary,
    routes: routeResults,
    trustBundle,
  }

  writeLatestReportFiles({
    jsonPath: OUTPUT_JSON,
    markdownPath: OUTPUT_MD,
    report,
    markdown: buildMarkdown(report),
  })

  await postSlackText({
    webhookUrl: process.env.SLACK_UI_DELIVERY_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || '',
    text: [
      '*Site sweep agent report*',
      `Routes scanned: ${summary.routesScanned}`,
      `Routes with issues: ${summary.routesWithIssues}`,
      `Total issues: ${summary.totalIssues}`,
      `Landing pass: ${landingPass ? 'yes' : 'no'}`,
      `Cognitive pass: ${cognitivePass ? 'yes' : 'no'}`,
      `Trust pass: ${trustPass ? 'yes' : 'no'}`,
    ].join('\n'),
  })

  if (args.json) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(`Site sweep agent scanned ${summary.routesScanned} route(s).`)
    console.log(`- routes with issues: ${summary.routesWithIssues}`)
    console.log(`- total issues: ${summary.totalIssues}`)
    console.log(`- landing: ${landingPass ? 'pass' : 'fail'}`)
    console.log(`- cognitive: ${cognitivePass ? 'pass' : 'fail'}`)
    console.log(`- trust: ${trustPass ? 'pass' : 'skip/fail'}`)
  }

  if (!landingPass || !cognitivePass || (!args.skipTrust && trustBundle && !trustBundle.pass)) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})