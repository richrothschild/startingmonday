#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const DASHBOARD_PATH = path.join(process.cwd(), 'docs', 'status', 'pmf-daily-dashboard.latest.json')
const OUTPUT_JSON_PATH = path.join(process.cwd(), 'docs', 'status', 'pmf-daily-monitor.latest.json')
const OUTPUT_MD_PATH = path.join(process.cwd(), 'docs', 'status', 'pmf-daily-monitor.latest.md')

const MAX_STALENESS_HOURS = 36
const MIN_PREP_FROM_ACTIVATION = 0.15
const MIN_CADENCE_FROM_PREP = 0.2

function parseArgs(argv) {
  const argSet = new Set(argv.slice(2))
  return {
    json: argSet.has('--json'),
    markdown: argSet.has('--markdown'),
    summary: argSet.has('--summary'),
    strict: argSet.has('--strict'),
  }
}

function readDashboard() {
  if (!fs.existsSync(DASHBOARD_PATH)) {
    throw new Error(`Dashboard file not found: ${DASHBOARD_PATH}`)
  }
  const raw = fs.readFileSync(DASHBOARD_PATH, 'utf8')
  return JSON.parse(raw)
}

function evaluate(dashboard) {
  const failures = []

  const generatedAt = Date.parse(String(dashboard.generatedAt ?? ''))
  if (!Number.isFinite(generatedAt)) {
    failures.push('generatedAt missing or invalid')
  } else {
    const stalenessHours = (Date.now() - generatedAt) / (1000 * 60 * 60)
    if (stalenessHours > MAX_STALENESS_HOURS) {
      failures.push(`dashboard is stale (${stalenessHours.toFixed(1)}h > ${MAX_STALENESS_HOURS}h)`)
    }
  }

  const totals = dashboard.totals ?? {}
  if (Number(totals.activationEvents ?? 0) < 1) {
    failures.push('activation event volume is zero')
  }
  if (Number(totals.prepEvents ?? 0) < 1) {
    failures.push('prep event volume is zero')
  }

  const funnel = dashboard.funnel ?? {}
  const prepFromActivationRate = Number(funnel.prepFromActivationRate ?? 0)
  const cadenceFromPrepRate = Number(funnel.cadenceFromPrepRate ?? 0)

  if (prepFromActivationRate < MIN_PREP_FROM_ACTIVATION) {
    failures.push(
      `prep_from_activation_rate too low (${prepFromActivationRate} < ${MIN_PREP_FROM_ACTIVATION})`,
    )
  }
  if (cadenceFromPrepRate < MIN_CADENCE_FROM_PREP) {
    failures.push(
      `cadence_from_prep_rate too low (${cadenceFromPrepRate} < ${MIN_CADENCE_FROM_PREP})`,
    )
  }

  return {
    checkedAt: new Date().toISOString(),
    sourcePath: DASHBOARD_PATH,
    metrics: {
      totalEvents: Number(totals.totalEvents ?? 0),
      uniqueUsers: Number(totals.uniqueUsers ?? 0),
      activationEvents: Number(totals.activationEvents ?? 0),
      prepEvents: Number(totals.prepEvents ?? 0),
      cadenceEvents: Number(totals.cadenceEvents ?? 0),
      outcomeEvents: Number(totals.outcomeEvents ?? 0),
      prepFromActivationRate,
      cadenceFromPrepRate,
      outcomeFromCadenceRate: Number(funnel.outcomeFromCadenceRate ?? 0),
    },
    guardrails: {
      maxStalenessHours: MAX_STALENESS_HOURS,
      minPrepFromActivation: MIN_PREP_FROM_ACTIVATION,
      minCadenceFromPrep: MIN_CADENCE_FROM_PREP,
    },
    failures,
    status: failures.length === 0 ? 'PASS' : 'FAIL',
  }
}

function toMarkdown(result) {
  const lines = [
    '# PMF Daily Monitor',
    '',
    `- Checked at: ${result.checkedAt}`,
    `- Source: ${result.sourcePath}`,
    `- Status: ${result.status}`,
    '',
    '## Metrics',
    `- total_events: ${result.metrics.totalEvents}`,
    `- unique_users: ${result.metrics.uniqueUsers}`,
    `- activation_events: ${result.metrics.activationEvents}`,
    `- prep_events: ${result.metrics.prepEvents}`,
    `- cadence_events: ${result.metrics.cadenceEvents}`,
    `- outcome_events: ${result.metrics.outcomeEvents}`,
    `- prep_from_activation_rate: ${result.metrics.prepFromActivationRate}`,
    `- cadence_from_prep_rate: ${result.metrics.cadenceFromPrepRate}`,
    `- outcome_from_cadence_rate: ${result.metrics.outcomeFromCadenceRate}`,
    '',
    '## Failures',
  ]

  if (result.failures.length === 0) {
    lines.push('- none')
  } else {
    for (const failure of result.failures) {
      lines.push(`- ${failure}`)
    }
  }

  return `${lines.join('\n')}\n`
}

function main() {
  const { json, markdown, summary, strict } = parseArgs(process.argv)
  const dashboard = readDashboard()
  const result = evaluate(dashboard)

  fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON_PATH, `${JSON.stringify(result, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD_PATH, toMarkdown(result))

  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else if (markdown) {
    process.stdout.write(toMarkdown(result))
  } else if (summary) {
    console.log(
      `status=${result.status} events=${result.metrics.totalEvents} ` +
      `prep_from_activation=${result.metrics.prepFromActivationRate} ` +
      `cadence_from_prep=${result.metrics.cadenceFromPrepRate}`,
    )
  } else {
    console.log('PMF daily monitor')
    console.log('-----------------')
    console.log(`Status: ${result.status}`)
    if (result.failures.length > 0) {
      for (const failure of result.failures) {
        console.log(`- ${failure}`)
      }
    }
  }

  if (strict && result.status !== 'PASS') {
    process.exitCode = 1
  }
}

main()
