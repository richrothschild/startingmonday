#!/usr/bin/env node
import path from 'node:path'
import { trustWorkflows } from './lib/trust-workflows.mjs'
import { ageMinutes, ghJson, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'
const trustIntegrityReportPath = process.env.TRUST_INTEGRITY_REPORT_PATH || path.join(process.cwd(), 'docs', 'status', 'trust-integrity.latest.json')

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'trust-daily.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'trust-daily.latest.md')

async function gh(pathname) {
  return ghJson({
    owner,
    repo,
    token,
    pathname,
    userAgent: 'startingmonday-trust-daily-report',
  })
}

async function getWorkflowHealth() {
  const rows = []
  for (const workflow of trustWorkflows) {
    const data = await gh(`/actions/workflows/${workflow.id}/runs?branch=main&status=completed&per_page=5`)
    const runs = data.workflow_runs ?? []
    const latest = runs[0] ?? null

    if (!latest) {
      rows.push({
        id: workflow.id,
        name: workflow.name,
        status: 'missing',
        ageMinutes: null,
        conclusion: null,
        url: null,
        recommendation: workflow.recommendation,
      })
      continue
    }

    const age = ageMinutes(latest.created_at)
    const stale = age > workflow.maxAgeMinutes
    const failed = latest.conclusion !== 'success'

    rows.push({
      id: workflow.id,
      name: workflow.name,
      status: stale ? 'stale' : failed ? 'failed' : 'healthy',
      ageMinutes: age,
      conclusion: latest.conclusion,
      url: latest.html_url,
      maxAgeMinutes: workflow.maxAgeMinutes,
      recommendation: workflow.recommendation,
    })
  }

  return rows
}

function buildRiskRows(healthRows) {
  const hasIssues = healthRows.some((row) => row.status !== 'healthy')

  return [
    {
      key: 'signal-parity-drift',
      risk: 'Signal count parity drifts across dashboard, briefing, and signals surfaces without immediate detection.',
      mitigation: 'Trust Integrity Agent enforces parity as a P0 contract with daily cadence.',
      status: hasIssues ? 'elevated' : 'controlled',
    },
    {
      key: 'trust-copy-regression',
      risk: 'Stale relative-time language reappears and undermines trust in recency-sensitive guidance.',
      mitigation: 'Relative-time phrase checks run in trust integrity contracts and report findings via Slack and artifacts.',
      status: hasIssues ? 'elevated' : 'controlled',
    },
    {
      key: 'contract-observability-gap',
      risk: 'Trust issues are found but trend direction is unclear, delaying corrective prioritization.',
      mitigation: 'Weekly issue and monthly trend agents translate failures into directional operating signals.',
      status: hasIssues ? 'elevated' : 'controlled',
    },
  ]
}

function loadTrustIntegrityEvidence() {
  if (!fs.existsSync(trustIntegrityReportPath)) {
    return {
      available: false,
      source: trustIntegrityReportPath,
      generatedAt: null,
      pass: null,
      routeSnippets: [],
      findingSnippets: [],
      contractSnippets: [],
    }
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(trustIntegrityReportPath, 'utf8'))
    const routes = Array.isArray(parsed.routes) ? parsed.routes : []
    const findings = Array.isArray(parsed.findings) ? parsed.findings : []

    const routeSnippets = routes.slice(0, 5).map((route) => {
      const staleCount = Array.isArray(route.staleRelativePhrases) ? route.staleRelativePhrases.length : 0
      const titleStatus = route.titlePass ? 'title=ok' : 'title=mismatch'
      return `${route.route}: status=${route.status}, ${titleStatus}, main=${route.mainCount}, stalePhrases=${staleCount}`
    })

    const findingSnippets = findings.slice(0, 5).map((finding) => {
      return `[${finding.severity}] ${finding.contract}: ${finding.message}`
    })

    const parity = parsed.contracts?.signalParity
    const contractSnippets = [
      `signalParity=${parity?.pass ? 'pass' : 'fail'} (dashboard=${parity?.counts?.dashboard ?? 'n/a'}, briefing=${parity?.counts?.briefing ?? 'n/a'}, signals=${parity?.counts?.signals ?? 'n/a'})`,
      `title=${parsed.contracts?.title?.pass ? 'pass' : 'fail'}`,
      `landmark=${parsed.contracts?.landmark?.pass ? 'pass' : 'fail'}`,
      `relativeTime=${parsed.contracts?.relativeTime?.pass ? 'pass' : 'fail'}`,
    ]

    return {
      available: true,
      source: trustIntegrityReportPath,
      generatedAt: parsed.generatedAt ?? null,
      pass: typeof parsed.pass === 'boolean' ? parsed.pass : null,
      routeSnippets,
      findingSnippets,
      contractSnippets,
    }
  } catch (error) {
    return {
      available: false,
      source: trustIntegrityReportPath,
      generatedAt: null,
      pass: null,
      routeSnippets: [],
      findingSnippets: [`Could not parse trust-integrity report: ${error instanceof Error ? error.message : 'unknown parse error'}`],
      contractSnippets: [],
    }
  }
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Trust Daily Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push('')
  lines.push('## Workflow Health')
  lines.push('')

  for (const row of report.workflowHealth) {
    const age = row.ageMinutes === null ? 'n/a' : `${row.ageMinutes}m`
    const threshold = row.maxAgeMinutes ? `${row.maxAgeMinutes}m` : 'n/a'
    lines.push(`- ${row.name}: status=${row.status}, conclusion=${row.conclusion ?? 'n/a'}, age=${age}, threshold=${threshold}`)
  }

  lines.push('')
  lines.push('## Devil\'s Advocate Risks')
  lines.push('')
  for (const row of report.riskRows) {
    lines.push(`- [${row.status}] ${row.risk}`)
    lines.push(`  Mitigation: ${row.mitigation}`)
  }

  lines.push('')
  lines.push('## Route-Level Evidence Snippets')
  lines.push('')
  if (!report.trustIntegrityEvidence.available) {
    lines.push(`- Trust integrity snapshot unavailable at ${report.trustIntegrityEvidence.source}`)
  } else {
    lines.push(`- Source generated: ${report.trustIntegrityEvidence.generatedAt ?? 'n/a'}`)
    lines.push(`- Snapshot pass: ${report.trustIntegrityEvidence.pass === null ? 'n/a' : report.trustIntegrityEvidence.pass ? 'pass' : 'fail'}`)
    lines.push('- Contract snippets:')
    for (const snippet of report.trustIntegrityEvidence.contractSnippets) lines.push(`  - ${snippet}`)
    lines.push('- Route snippets:')
    for (const snippet of report.trustIntegrityEvidence.routeSnippets) lines.push(`  - ${snippet}`)
    lines.push('- Finding snippets:')
    for (const snippet of (report.trustIntegrityEvidence.findingSnippets.length > 0 ? report.trustIntegrityEvidence.findingSnippets : ['None'])) lines.push(`  - ${snippet}`)
  }

  lines.push('')
  lines.push('## Missing Guardrails')
  lines.push('')
  for (const item of report.missing) {
    lines.push(`- ${item}`)
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const unhealthy = report.workflowHealth.filter((row) => row.status !== 'healthy')
  const top = unhealthy.length === 0
    ? '*Trust daily report: healthy*'
    : `*Trust daily report: ${unhealthy.length} issue(s) detected*`

  const workflowLines = report.workflowHealth.map((row) => {
    const age = row.ageMinutes === null ? 'n/a' : `${row.ageMinutes}m`
    return `- ${row.name}: ${row.status} (${row.conclusion ?? 'n/a'}, age ${age})`
  })

  const riskLines = report.riskRows.map((row) => `- [${row.status}] ${row.risk}`)
  const evidenceLines = report.trustIntegrityEvidence.available
    ? report.trustIntegrityEvidence.routeSnippets.slice(0, 3).map((snippet) => `- ${snippet}`)
    : [`- Trust integrity snapshot unavailable at ${report.trustIntegrityEvidence.source}`]
  const missingLines = report.missing.map((item) => `- ${item}`)

  return [
    top,
    `Channel: ${report.channel}`,
    '',
    '*Workflow health*',
    ...workflowLines,
    '',
    '*Devil\'s advocate (what can go wrong)*',
    ...riskLines,
    '',
    '*Route-level trust evidence*',
    ...evidenceLines,
    '',
    '*What we are missing*',
    ...missingLines,
  ].join('\n')
}

async function postSlack(text) {
  const posted = await postSlackText({ webhookUrl: slackWebhook, text })
  if (!posted) {
    console.log('No Slack webhook configured; skipping Slack post.')
  }
}

async function main() {
  const workflowHealth = await getWorkflowHealth()
  const riskRows = buildRiskRows(workflowHealth)
  const trustIntegrityEvidence = loadTrustIntegrityEvidence()
  const missing = [
    'Automated owner mapping for repeated trust contract failures to reduce triage latency.',
    'Trust contract threshold ratchet that tightens after 30 consecutive healthy days.',
    'Cross-surface parity preflight in staging before production promotion runs.',
    'Contract-specific SLO targets (for example, parity extraction reliability) with rolling error budgets.',
  ]

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    workflowHealth,
    riskRows,
    trustIntegrityEvidence,
    missing,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  await postSlack(buildSlackText(report))
  console.log('Trust daily report completed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
