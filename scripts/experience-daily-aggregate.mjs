#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const slackWebhook = process.env.SLACK_DAILY_EXPERIENCE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_DAILY_EXPERIENCE_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'experience-daily-aggregate.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'experience-daily-aggregate.latest.md')

const artifactPaths = {
  vitals: path.join(process.cwd(), 'docs', 'status', 'experience-vitals.latest.json'),
  cognitive: path.join(process.cwd(), 'docs', 'status', 'cognitive-load.latest.json'),
  trust: path.join(process.cwd(), 'docs', 'status', 'trust-integrity.latest.json'),
  portfolio: path.join(process.cwd(), 'docs', 'status', 'experience-portfolio-rollup.latest.json'),
}

function ageMinutes(isoTimestamp) {
  if (!isoTimestamp) return null
  const age = Date.now() - Date.parse(isoTimestamp)
  return age > 0 ? Math.floor(age / 60000) : 0
}

function loadJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function aggregateDailySummary() {
  const vitals = loadJsonIfExists(artifactPaths.vitals)
  const cognitive = loadJsonIfExists(artifactPaths.cognitive)
  const trust = loadJsonIfExists(artifactPaths.trust)
  const portfolio = loadJsonIfExists(artifactPaths.portfolio)

  const summary = {
    capturedAt: new Date().toISOString(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    sourceFreshness: {
      vitals: vitals?.generatedAt ? { age: ageMinutes(vitals.generatedAt), status: 'available' } : { age: null, status: 'missing' },
      cognitive: cognitive?.generatedAt ? { age: ageMinutes(cognitive.generatedAt), status: 'available' } : { age: null, status: 'missing' },
      trust: trust?.generatedAt ? { age: ageMinutes(trust.generatedAt), status: 'available' } : { age: null, status: 'missing' },
      portfolio: portfolio?.generatedAt ? { age: ageMinutes(portfolio.generatedAt), status: 'available' } : { age: null, status: 'missing' },
    },
    vitalsMetrics: vitals ? {
      routesMeasured: vitals.summary?.routesMeasured ?? 0,
      totalBreaches: vitals.summary?.totalBreaches ?? 0,
      byTier: vitals.summary?.byTier ?? {},
    } : null,
    cognitiveMetrics: cognitive ? {
      totalPages: cognitive.totalPages ?? 0,
      pagesWithIssues: cognitive.pagesWithIssues ?? 0,
      totalIssues: cognitive.totalIssues ?? 0,
      byTier: cognitive.byTier ?? {},
      tierGates: cognitive.tierGates ?? {},
    } : null,
    trustMetrics: trust ? {
      findingsCount: trust.findings?.length ?? 0,
      byRoute: trust.byRoute?.length ?? 0,
      p0Count: (trust.findings ?? []).filter((f) => f.severity === 'P0').length,
      p1Count: (trust.findings ?? []).filter((f) => f.severity === 'P1').length,
    } : null,
    portfolioMetrics: portfolio ? {
      openIssues: portfolio.summary?.openIssues ?? 0,
      artifactIssues: portfolio.summary?.artifactIssues ?? 0,
      routeClusters: portfolio.routeClusters?.length ?? 0,
      newSignatures: portfolio.signatureDelta?.newlyOpened?.length ?? 0,
      resolvedSignatures: portfolio.signatureDelta?.resolved?.length ?? 0,
    } : null,
  }

  return summary
}

function extractTopFindings() {
  const vitals = loadJsonIfExists(artifactPaths.vitals)
  const cognitive = loadJsonIfExists(artifactPaths.cognitive)
  const trust = loadJsonIfExists(artifactPaths.trust)
  const portfolio = loadJsonIfExists(artifactPaths.portfolio)

  const findings = []

  // Top vitals breaches
  if (vitals?.results) {
    const breaches = vitals.results
      .filter((r) => r.budget?.breaches?.length > 0)
      .slice(0, 5)
      .map((r) => ({
        agent: 'Vitals',
        route: r.route,
        tier: r.tier,
        breaches: r.budget.breaches.slice(0, 2),
        severity: r.tier === 'funnel' ? 'P1' : 'P2',
      }))
    findings.push(...breaches)
  }

  // Top cognitive issues
  if (cognitive?.pages) {
    const cogIssues = cognitive.pages
      .filter((p) => p.issueCount > 0 || p.thresholds?.fluency?.pass === false || p.thresholds?.load?.pass === false)
      .sort((a, b) => (b.issueCount ?? 0) - (a.issueCount ?? 0))
      .slice(0, 5)
      .map((p) => ({
        agent: 'Cognitive',
        route: p.route,
        tier: p.tier,
        issueCount: p.issueCount ?? 0,
        loadGate: p.thresholds?.load?.pass,
        fluencyGate: p.thresholds?.fluency?.pass,
        severity: p.tier === 'dashboard' && (p.thresholds?.load?.pass === false || p.thresholds?.fluency?.pass === false) ? 'P1' : 'P2',
      }))
    findings.push(...cogIssues)
  }

  // Top trust violations
  if (trust?.findings) {
    const trustViolations = trust.findings
      .slice(0, 5)
      .map((f) => ({
        agent: 'Trust',
        route: f.route || '(portfolio)',
        contract: f.contract,
        severity: f.severity || 'P1',
        message: f.message,
      }))
    findings.push(...trustViolations)
  }

  // Portfolio route clusters (only critical)
  if (portfolio?.routeClusters) {
    const critical = portfolio.routeClusters
      .filter((c) => c.severity === 'P0' || c.severity === 'P1')
      .slice(0, 5)
      .map((c) => ({
        agent: 'Portfolio',
        route: c.route,
        severity: c.severity,
        dimensions: c.dimensions,
        overlapCount: c.overlapCount,
      }))
    findings.push(...critical)
  }

  return findings
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Daily Experience Aggregate')
  lines.push('')
  lines.push(`Generated: ${report.capturedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Source Freshness')
  lines.push('')
  for (const [name, status] of Object.entries(report.sourceFreshness)) {
    const ageStr = status.age ? `${status.age}m old` : 'missing'
    lines.push(`- ${name}: ${status.status} (${ageStr})`)
  }
  lines.push('')

  lines.push('## Key Metrics')
  lines.push('')

  if (report.vitalsMetrics) {
    lines.push('### Vitals')
    lines.push(`- Routes measured: ${report.vitalsMetrics.routesMeasured}`)
    lines.push(`- Total breaches: ${report.vitalsMetrics.totalBreaches}`)
  }

  if (report.cognitiveMetrics) {
    lines.push('### Cognitive')
    lines.push(`- Pages scanned: ${report.cognitiveMetrics.totalPages}`)
    lines.push(`- Pages with issues: ${report.cognitiveMetrics.pagesWithIssues}`)
    lines.push(`- Total issues: ${report.cognitiveMetrics.totalIssues}`)
  }

  if (report.trustMetrics) {
    lines.push('### Trust')
    lines.push(`- Total findings: ${report.trustMetrics.findingsCount}`)
    lines.push(`- P0: ${report.trustMetrics.p0Count}`)
    lines.push(`- P1: ${report.trustMetrics.p1Count}`)
  }

  if (report.portfolioMetrics) {
    lines.push('### Portfolio')
    lines.push(`- Open issues: ${report.portfolioMetrics.openIssues}`)
    lines.push(`- Route clusters: ${report.portfolioMetrics.routeClusters}`)
    lines.push(`- New signatures: ${report.portfolioMetrics.newSignatures}`)
    lines.push(`- Resolved signatures: ${report.portfolioMetrics.resolvedSignatures}`)
  }

  lines.push('')
  lines.push('## Top Findings')
  lines.push('')
  if (report.findings.length === 0) {
    lines.push('- None')
  } else {
    for (const finding of report.findings) {
      lines.push(`- [${finding.severity}] ${finding.agent}: ${finding.route}`)
    }
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const vitalsStatus = report.sourceFreshness.vitals.status === 'available' ? '✓' : '✗'
  const cognitiveStatus = report.sourceFreshness.cognitive.status === 'available' ? '✓' : '✗'
  const trustStatus = report.sourceFreshness.trust.status === 'available' ? '✓' : '✗'
  const portfolioStatus = report.sourceFreshness.portfolio.status === 'available' ? '✓' : '✗'

  const issueCount = (report.portfolioMetrics?.openIssues ?? 0) + (report.trustMetrics?.findingsCount ?? 0) + (report.cognitiveMetrics?.pagesWithIssues ?? 0)
  const headline = issueCount === 0
    ? '*Daily experience aggregate: healthy*'
    : `*Daily experience aggregate: ${issueCount} open finding(s)*`

  const topFindings = report.findings.slice(0, 8).map((f) => `- [${f.severity}] ${f.agent}: ${f.route}`)

  return [
    headline,
    '',
    `*Source freshness* ${vitalsStatus} vitals ${cognitiveStatus} cognitive ${trustStatus} trust ${portfolioStatus} portfolio`,
    `Open issues: ${report.portfolioMetrics?.openIssues ?? 0}`,
    `Trust findings: ${report.trustMetrics?.findingsCount ?? 0}`,
    `Cognitive issues: ${report.cognitiveMetrics?.pagesWithIssues ?? 0}`,
    '',
    '*Top findings*',
    ...(topFindings.length > 0 ? topFindings : ['- None']),
  ].join('\n')
}

async function main() {
  const summary = aggregateDailySummary()
  const findings = extractTopFindings()

  const report = {
    ...summary,
    findings,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  await postSlackText({
    webhookUrl: slackWebhook,
    text: buildSlackText(report),
  })

  console.log(`Daily experience aggregate completed (${report.findings.length} top findings).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
