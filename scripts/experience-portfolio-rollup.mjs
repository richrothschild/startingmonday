#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { experienceWorkflows } from './lib/experience-workflows.mjs'
import { ageMinutes, ghJson, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'experience-portfolio-rollup.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'experience-portfolio-rollup.latest.md')
const ownerMapPath = path.join(process.cwd(), 'config', 'experience-issue-owners.json')
const historyPath = path.join(process.cwd(), 'docs', 'status', 'experience-portfolio-rollup.history.json')
const artifactPaths = {
  trust: path.join(process.cwd(), 'docs', 'status', 'trust-integrity.latest.json'),
  vitals: path.join(process.cwd(), 'docs', 'status', 'experience-vitals.latest.json'),
  cognitive: path.join(process.cwd(), 'docs', 'status', 'cognitive-load.latest.json'),
  sentinel: path.join(process.cwd(), 'docs', 'status', 'luxury-page-sentinel.latest.json'),
}

function severityRank(severity) {
  if (severity === 'P0') return 3
  if (severity === 'P1') return 2
  if (severity === 'P2') return 1
  return 0
}

function loadJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function loadHistory() {
  if (!fs.existsSync(historyPath)) {
    return { version: 1, updatedAt: null, runs: [], lastOpenSignatures: [] }
  }
  const parsed = JSON.parse(fs.readFileSync(historyPath, 'utf8'))
  return {
    version: parsed.version ?? 1,
    updatedAt: parsed.updatedAt ?? null,
    runs: Array.isArray(parsed.runs) ? parsed.runs : [],
    lastOpenSignatures: Array.isArray(parsed.lastOpenSignatures) ? parsed.lastOpenSignatures : [],
  }
}

function classifySignatureDelta(previousOpen, currentOpen) {
  const previous = new Set(previousOpen)
  const current = new Set(currentOpen)
  const newlyOpened = [...current].filter((sig) => !previous.has(sig))
  const stillOpen = [...current].filter((sig) => previous.has(sig))
  const resolved = [...previous].filter((sig) => !current.has(sig))
  return { newlyOpened, stillOpen, resolved }
}

function writeHistory({ history, report }) {
  const runSummary = {
    generatedAt: report.generatedAt,
    openIssueCount: report.summary.openIssues,
    artifactIssueCount: report.summary.artifactIssues,
    routeClusterCount: report.routeClusters.length,
    topSignatures: report.routeClusters.slice(0, 20).map((cluster) => cluster.signature),
  }

  const nextRuns = [...history.runs, runSummary].slice(-45)
  const nextHistory = {
    version: history.version ?? 1,
    updatedAt: report.generatedAt,
    runs: nextRuns,
    lastOpenSignatures: report.routeClusters.map((cluster) => cluster.signature),
  }

  fs.writeFileSync(historyPath, `${JSON.stringify(nextHistory, null, 2)}\n`, 'utf8')
  return nextHistory
}

function loadOwnerMap() {
  if (!fs.existsSync(ownerMapPath)) {
    return { defaultOwner: 'platform-experience', byDimension: {}, byCategory: {}, byRoutePrefix: {} }
  }
  const parsed = JSON.parse(fs.readFileSync(ownerMapPath, 'utf8'))
  return {
    defaultOwner: parsed.defaultOwner || 'platform-experience',
    byDimension: parsed.byDimension || {},
    byCategory: parsed.byCategory || {},
    byRoutePrefix: parsed.byRoutePrefix || {},
  }
}

function ownerForIssue(issue, ownerMap) {
  if (issue.dimension && ownerMap.byDimension[issue.dimension]) return ownerMap.byDimension[issue.dimension]
  if (issue.category && ownerMap.byCategory[issue.category]) return ownerMap.byCategory[issue.category]
  const route = issue.route || ''
  const routePrefixes = Object.keys(ownerMap.byRoutePrefix).sort((a, b) => b.length - a.length)
  for (const prefix of routePrefixes) {
    if (route.startsWith(prefix)) return ownerMap.byRoutePrefix[prefix]
  }
  return ownerMap.defaultOwner
}

function stableSignatureForIssue(issue) {
  return `${issue.route || '(unknown-route)'}|${issue.dimension || 'unknown-dimension'}|${issue.agent || 'unknown-agent'}`
}

async function gh(pathname) {
  return ghJson({
    owner,
    repo,
    token,
    pathname,
    userAgent: 'startingmonday-experience-portfolio-rollup',
  })
}

function severityForRow(row) {
  if (row.status === 'failed' || row.status === 'missing') return 'P1'
  if (row.status === 'stale') return 'P1'
  return 'ok'
}

function scoreForRow(row) {
  if (row.status === 'failed') return 100
  if (row.status === 'missing') return 95
  if (row.status === 'stale') return 80 + Math.min(20, row.ageMinutes ?? 0)
  return 0
}

async function getWorkflowHealth() {
  const rows = []
  for (const workflow of experienceWorkflows) {
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

    const currentAge = ageMinutes(latest.created_at)
    const status = currentAge > workflow.maxAgeMinutes
      ? 'stale'
      : latest.conclusion !== 'success'
        ? 'failed'
        : 'healthy'

    rows.push({
      id: workflow.id,
      name: workflow.name,
      status,
      ageMinutes: currentAge,
      conclusion: latest.conclusion,
      url: latest.html_url,
      maxAgeMinutes: workflow.maxAgeMinutes,
      recommendation: workflow.recommendation,
    })
  }
  return rows
}

function buildIssueRows(workflowHealth) {
  return workflowHealth
    .filter((row) => row.status !== 'healthy')
    .map((row) => ({
      agent: row.name,
      severity: severityForRow(row),
      status: row.status,
      conclusion: row.conclusion ?? 'n/a',
      ageMinutes: row.ageMinutes,
      suggestedAction: row.recommendation,
      evidence: row.ageMinutes === null
        ? 'No completed run found on main.'
        : `Latest ${row.conclusion ?? 'n/a'} run is ${row.ageMinutes}m old (threshold ${row.maxAgeMinutes ?? 'n/a'}m).`,
      signature: `${row.id}|${row.status}|${row.conclusion ?? 'n/a'}`,
      score: scoreForRow(row),
      url: row.url,
    }))
    .sort((a, b) => b.score - a.score || a.agent.localeCompare(b.agent))
}

function trustSuggestedAction(issue) {
  if (issue.dimension === 'signal-parity') return 'Reconcile signal-count sources across dashboard, briefing, and signals before certifying trust posture.'
  if (issue.dimension === 'title') return 'Fix route metadata titles to restore the expected Route Label - Starting Monday contract.'
  if (issue.dimension === 'landmark') return 'Restore exactly one main landmark and normalize route chrome structure.'
  if (issue.dimension === 'relative-time') return 'Replace stale relative-time copy with deterministic date anchors or shared recency labels.'
  return 'Inspect trust-integrity findings and remediate the affected route contract.'
}

function normalizeTrustIssues(report) {
  if (!report || !Array.isArray(report.findings)) return []
  return report.findings.map((finding) => ({
    agent: 'Trust Integrity Agent',
    category: 'trust',
    route: finding.route || '(trust-portfolio)',
    dimension: finding.contract,
    severity: finding.severity || 'P1',
    evidence: finding.evidence ? `${finding.message} | ${finding.evidence}` : finding.message,
    suggestedAction: trustSuggestedAction(finding),
    ageMinutes: report.generatedAt ? ageMinutes(report.generatedAt) : null,
  }))
}

function normalizeVitalsIssues(report) {
  if (!report || !Array.isArray(report.results)) return []
  const issues = []
  for (const row of report.results) {
    for (const breach of row.budget?.breaches ?? []) {
      issues.push({
        agent: 'Experience Vitals Agent',
        category: 'vitals',
        route: row.route,
        dimension: 'vitals-budget',
        severity: row.tier === 'funnel' ? 'P1' : 'P2',
        evidence: breach,
        suggestedAction: `Reduce ${row.tier} vitals regressions on ${row.route} or explicitly revise the tier baseline after review.`,
        ageMinutes: report.generatedAt ? ageMinutes(report.generatedAt) : null,
      })
    }
  }
  return issues
}

function normalizeCognitiveIssues(report) {
  if (!report || !Array.isArray(report.pages)) return []
  const issues = []
  for (const page of report.pages) {
    if (page.issueCount > 0) {
      issues.push({
        agent: 'Cognitive Load Agent',
        category: 'cognitive',
        route: page.route,
        dimension: 'cognitive-load',
        severity: page.tier === 'dashboard' && page.thresholds?.load?.pass === false ? 'P1' : 'P2',
        evidence: `${page.issueCount} issue(s): ${(page.issues ?? []).join('; ')}`,
        suggestedAction: 'Reduce CTA competition, improve chunking, and simplify dense route sections before the next cycle.',
        ageMinutes: report.generatedAt ? ageMinutes(report.generatedAt) : null,
      })
    }

    if (page.thresholds?.fluency?.pass === false) {
      issues.push({
        agent: 'Cognitive Load Agent',
        category: 'cognitive',
        route: page.route,
        dimension: 'cognitive-fluency',
        severity: page.tier === 'dashboard' ? 'P1' : 'P2',
        evidence: `Fluency grade ${page.fluency?.grade} below required ${page.thresholds.fluency.required}; score=${page.fluency?.score}`,
        suggestedAction: 'Improve heading hierarchy, sentence density, and information scent on the affected route.',
        ageMinutes: report.generatedAt ? ageMinutes(report.generatedAt) : null,
      })
    }

    if (page.thresholds?.load?.pass === false) {
      issues.push({
        agent: 'Cognitive Load Agent',
        category: 'cognitive',
        route: page.route,
        dimension: 'cognitive-load-threshold',
        severity: page.tier === 'dashboard' ? 'P1' : 'P2',
        evidence: `Load grade ${page.grade} below required ${page.thresholds.load.required}`,
        suggestedAction: 'Reduce concurrent choices and simplify the interaction burden on the route.',
        ageMinutes: report.generatedAt ? ageMinutes(report.generatedAt) : null,
      })
    }
  }
  return issues
}

function sentinelSeverityForDimension(dimension) {
  if (dimension === 'availability' || dimension === 'coverage' || dimension === 'debt-ratchet' || dimension === 'quarantine') return 'P1'
  if (dimension === 'palette-conformance') return 'P1'
  return 'P2'
}

function normalizeSentinelIssues(report) {
  if (!report || !Array.isArray(report.violations)) return []
  return report.violations.map((violation) => ({
    agent: 'Luxury Page Sentinel',
    category: 'visual',
    route: violation.route || '(portfolio)',
    dimension: violation.dimension,
    severity: sentinelSeverityForDimension(violation.dimension),
    evidence: violation.evidence,
    suggestedAction: violation.dimension === 'palette-conformance'
      ? 'Normalize the route back to the luxury shell palette and remove light-shell drift.'
      : violation.dimension === 'typography-discipline'
        ? 'Reduce the number of font families used on the route and preserve typographic discipline.'
        : violation.dimension === 'accent-restraint'
          ? 'Reduce competing accent-color families and restore palette restraint.'
          : 'Inspect the sentinel evidence and remediate the underlying route-level visual or availability issue.',
    ageMinutes: report.generatedAt ? ageMinutes(report.generatedAt) : null,
  }))
}

function collapseIssues(issues) {
  const buckets = new Map()
  for (const issue of issues) {
    const routeKey = issue.route || '(unknown-route)'
    const bucket = buckets.get(routeKey) ?? {
      route: routeKey,
      maxSeverity: 'P2',
      overlapCount: 0,
      agents: new Set(),
      dimensions: new Set(),
      signatures: new Set(),
      evidences: [],
      actions: new Set(),
      maxAgeMinutes: 0,
    }
    bucket.agents.add(issue.agent)
    bucket.dimensions.add(issue.dimension)
    bucket.signatures.add(issue.signature)
    bucket.evidences.push(issue.evidence)
    bucket.actions.add(issue.suggestedAction)
    bucket.maxAgeMinutes = Math.max(bucket.maxAgeMinutes, issue.ageMinutes ?? 0)
    bucket.overlapCount += 1
    if (severityRank(issue.severity) > severityRank(bucket.maxSeverity)) bucket.maxSeverity = issue.severity
    buckets.set(routeKey, bucket)
  }

  return [...buckets.values()]
    .map((bucket) => ({
      route: bucket.route,
      severity: bucket.maxSeverity,
      overlapCount: bucket.overlapCount,
      agents: [...bucket.agents].sort(),
      dimensions: [...bucket.dimensions].sort(),
      signatures: [...bucket.signatures].sort(),
      signature: [...bucket.signatures].sort().slice(0, 4).join(' || '),
      evidence: bucket.evidences.slice(0, 3),
      suggestedMitigation: [...bucket.actions].slice(0, 2),
      ageMinutes: bucket.maxAgeMinutes,
      score: severityRank(bucket.maxSeverity) * 100 + bucket.overlapCount * 10 + Math.min(9, bucket.maxAgeMinutes ?? 0),
    }))
    .sort((a, b) => b.score - a.score || a.route.localeCompare(b.route))
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Experience Portfolio Rollup')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push(`Agents tracked: ${report.summary.trackedAgents}`)
  lines.push(`Open issues: ${report.summary.openIssues}`)
  lines.push(`Artifact issues: ${report.summary.artifactIssues}`)
  lines.push(`Signature delta: new=${report.signatureDelta.newlyOpened.length}, repeated=${report.signatureDelta.stillOpen.length}, resolved=${report.signatureDelta.resolved.length}`)
  lines.push('')
  lines.push('## Portfolio Health')
  lines.push('')
  for (const row of report.workflowHealth) {
    const age = row.ageMinutes === null ? 'n/a' : `${row.ageMinutes}m`
    lines.push(`- ${row.name}: status=${row.status}, conclusion=${row.conclusion ?? 'n/a'}, age=${age}`)
  }
  lines.push('')
  lines.push('## Prioritized Issues')
  lines.push('')
  if (report.issues.length === 0) {
    lines.push('- None')
  } else {
    for (const issue of report.issues) {
      lines.push(`- [${issue.severity}] ${issue.agent}: ${issue.status}`)
      lines.push(`  Owner: ${issue.owner}`)
      lines.push(`  Signature: ${issue.signature}`)
      lines.push(`  Evidence: ${issue.evidence}`)
      lines.push(`  Action: ${issue.suggestedAction}`)
    }
  }
  lines.push('')
  lines.push('## Route Clusters')
  lines.push('')
  if (report.routeClusters.length === 0) {
    lines.push('- None')
  } else {
    for (const cluster of report.routeClusters) {
      lines.push(`- [${cluster.severity}] ${cluster.route}: overlap=${cluster.overlapCount}, agents=${cluster.agents.join(', ')}`)
      lines.push(`  Owner: ${cluster.owner}`)
      lines.push(`  Signature: ${cluster.signature}`)
      lines.push(`  Dimensions: ${cluster.dimensions.join(', ')}`)
      for (const evidence of cluster.evidence) lines.push(`  Evidence: ${evidence}`)
      for (const action of cluster.suggestedMitigation) lines.push(`  Action: ${action}`)
    }
  }
  lines.push('')
  lines.push('## Signature Delta')
  lines.push('')
  lines.push(`- New signatures: ${report.signatureDelta.newlyOpened.length}`)
  for (const signature of report.signatureDelta.newlyOpened.slice(0, 10)) {
    lines.push(`  - ${signature}`)
  }
  lines.push(`- Repeated signatures: ${report.signatureDelta.stillOpen.length}`)
  lines.push(`- Resolved signatures: ${report.signatureDelta.resolved.length}`)
  for (const signature of report.signatureDelta.resolved.slice(0, 10)) {
    lines.push(`  - ${signature}`)
  }
  lines.push('')
  lines.push('## Cross-Agent Mitigations')
  lines.push('')
  for (const mitigation of report.mitigations) {
    lines.push(`- ${mitigation}`)
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const headline = report.issues.length === 0
    ? '*Experience portfolio rollup: all tracked agents healthy*'
    : `*Experience portfolio rollup: ${report.issues.length} open issue(s) across agents*`

  const issueLines = report.routeClusters.length === 0
    ? ['- None']
    : report.routeClusters.slice(0, 8).map((cluster) => `- [${cluster.severity}] ${cluster.route} (${cluster.owner}): ${cluster.dimensions.join(', ')} - ${cluster.suggestedMitigation[0] ?? 'Inspect artifacts'}`)

  return [
    headline,
    `Channel: ${report.channel}`,
    `Tracked agents: ${report.summary.trackedAgents}`,
    `Artifact issues: ${report.summary.artifactIssues}`,
    `Signature delta: new=${report.signatureDelta.newlyOpened.length}, repeated=${report.signatureDelta.stillOpen.length}, resolved=${report.signatureDelta.resolved.length}`,
    '',
    '*Prioritized route clusters*',
    ...issueLines,
    '',
    '*Cross-agent mitigations*',
    ...report.mitigations.map((mitigation) => `- ${mitigation}`),
  ].join('\n')
}

async function main() {
  const history = loadHistory()
  const ownerMap = loadOwnerMap()
  const workflowHealth = await getWorkflowHealth()
  const workflowIssues = buildIssueRows(workflowHealth)
  const trustReport = loadJsonIfExists(artifactPaths.trust)
  const vitalsReport = loadJsonIfExists(artifactPaths.vitals)
  const cognitiveReport = loadJsonIfExists(artifactPaths.cognitive)
  const sentinelReport = loadJsonIfExists(artifactPaths.sentinel)

  const artifactIssues = [
    ...normalizeTrustIssues(trustReport),
    ...normalizeVitalsIssues(vitalsReport),
    ...normalizeCognitiveIssues(cognitiveReport),
    ...normalizeSentinelIssues(sentinelReport),
  ]

  const enrichedArtifactIssues = artifactIssues.map((issue) => ({
    ...issue,
    owner: ownerForIssue(issue, ownerMap),
    signature: stableSignatureForIssue(issue),
  }))

  const routeClusters = collapseIssues(enrichedArtifactIssues).map((cluster) => {
    const matchingIssues = enrichedArtifactIssues.filter((issue) => issue.route === cluster.route)
    const owners = [...new Set(matchingIssues.map((issue) => issue.owner))]
    return {
      ...cluster,
      owner: owners.length === 1 ? owners[0] : owners.join(', '),
    }
  })

  const issues = workflowIssues.map((issue) => ({
    ...issue,
    owner: ownerMap.defaultOwner,
  }))

  const mitigations = [
    'Treat stale or failed agents as observability debt: rerun the affected workflow, inspect its latest artifact, and assign an owner before the next cycle.',
    'When multiple agents point at the same surface, fix the shared route/root cause before tuning thresholds or silencing alerts.',
    'Use the agent recommendation text as the immediate next action, then reflect long-lived fixes back into SES thresholds or baseline configs.',
    'Prefer the highest-overlap route clusters first: one route fix that clears multiple agents outperforms isolated threshold tuning.',
  ]

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    summary: {
      trackedAgents: workflowHealth.length,
      openIssues: issues.length,
      artifactIssues: artifactIssues.length,
      healthyAgents: workflowHealth.filter((row) => row.status === 'healthy').length,
    },
    sourceArtifacts: {
      trust: trustReport?.generatedAt ?? null,
      vitals: vitalsReport?.generatedAt ?? null,
      cognitive: cognitiveReport?.generatedAt ?? null,
      sentinel: sentinelReport?.generatedAt ?? null,
    },
    workflowHealth,
    issues,
    artifactIssues: enrichedArtifactIssues,
    routeClusters,
    mitigations,
  }

  report.signatureDelta = classifySignatureDelta(history.lastOpenSignatures ?? [], report.routeClusters.map((cluster) => cluster.signature))

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  const posted = await postSlackText({ webhookUrl: slackWebhook, text: buildSlackText(report) })
  if (!posted) console.log('No Slack webhook configured; skipping Slack post.')

  writeHistory({ history, report })

  console.log(`Experience portfolio rollup completed (${report.summary.trackedAgents} agents, open issues=${report.summary.openIssues}).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
