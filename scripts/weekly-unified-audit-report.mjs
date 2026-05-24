#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DOCS = path.join(ROOT, 'docs')

const INPUTS = {
  council: path.join(DOCS, 'code-synthetic-council-audit.latest.json'),
  debt: path.join(DOCS, 'technical-debt-audit.latest.json'),
  security: path.join(DOCS, 'security-deep-dive-audit.latest.json'),
}

const OUT_JSON = path.join(DOCS, 'weekly-unified-audit.latest.json')
const OUT_MD = path.join(DOCS, 'weekly-unified-audit.latest.md')
const OUT_SLACK = path.join(DOCS, 'weekly-unified-audit.slack.txt')
const OUT_EMAIL = path.join(DOCS, 'weekly-unified-audit.email.txt')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null
  try {
    return readJson(filePath)
  } catch {
    return null
  }
}

function toSummary(council, debt, security, statuses) {
  return {
    generatedAt: new Date().toISOString(),
    guardRegression: {
      status: statuses.guardRegressionStatus,
    },
    checks: {
      importGuardStatus: statuses.importGuardStatus,
      councilStatus: statuses.councilStatus,
      debtStatus: statuses.debtStatus,
      securityStatus: statuses.securityStatus,
    },
    council: {
      score: council?.overallScore ?? 'unknown',
      grade: council?.grade ?? 'unknown',
      findings: council?.findingCount ?? 'unknown',
      parserCorruptionCount: council.blindspotReview?.parserCorruptionCount ?? 0,
      placeholderBaselineCount: council.blindspotReview?.placeholderBaselineCount ?? null,
    },
    debt: {
      typecheckStatus: debt.buildHealth?.typecheck?.status ?? 'unknown',
      lintStatus: debt.buildHealth?.lint?.status ?? 'unknown',
      parserCorruptionCount: debt.buildHealth?.parserCorruptionCount ?? 0,
      placeholderCount: debt.testDebt?.currentPlaceholderFileCount ?? 0,
      outdatedCount: debt.dependencies?.outdatedCount ?? 0,
    },
    security: {
      criticalVulns: security.npmAudit?.critical ?? 0,
      highVulns: security.npmAudit?.high ?? 0,
      trueAuthGaps: security.apiGuards?.trueGapCount ?? 0,
      hardcodedSecretHits: security.staticSignals?.hardcodedSecrets?.length ?? 0,
    },
  }
}

function buildMarkdown(summary) {
  const md = []
  md.push('# Weekly Unified Audit')
  md.push('')
  md.push(`Generated: ${summary.generatedAt}`)
  md.push('')
  md.push('## Guard Regression')
  md.push('')
  md.push(`- check-api-guards regression test: ${summary.guardRegression.status}`)
  md.push('')
  md.push('## Check Statuses')
  md.push('')
  md.push(`- import corruption guard: ${summary.checks.importGuardStatus}`)
  md.push(`- council audit: ${summary.checks.councilStatus}`)
  md.push(`- debt audit: ${summary.checks.debtStatus}`)
  md.push(`- security audit: ${summary.checks.securityStatus}`)
  md.push('')
  md.push('## Council')
  md.push('')
  md.push(`- Score: ${summary.council.score} (${summary.council.grade})`)
  md.push(`- Findings: ${summary.council.findings}`)
  md.push(`- Parser-corruption files: ${summary.council.parserCorruptionCount}`)
  md.push(`- Placeholder baseline count: ${summary.council.placeholderBaselineCount ?? 'n/a'}`)
  md.push('')
  md.push('## Technical Debt')
  md.push('')
  md.push(`- Typecheck: ${summary.debt.typecheckStatus}`)
  md.push(`- Lint: ${summary.debt.lintStatus}`)
  md.push(`- Parser-corruption files: ${summary.debt.parserCorruptionCount}`)
  md.push(`- Placeholder files present: ${summary.debt.placeholderCount}`)
  md.push(`- Outdated dependencies: ${summary.debt.outdatedCount}`)
  md.push('')
  md.push('## Security')
  md.push('')
  md.push(`- npm audit critical: ${summary.security.criticalVulns}`)
  md.push(`- npm audit high: ${summary.security.highVulns}`)
  md.push(`- Auth guard true gaps: ${summary.security.trueAuthGaps}`)
  md.push(`- Hardcoded secret pattern hits: ${summary.security.hardcodedSecretHits}`)
  md.push('')
  return md.join('\n') + '\n'
}

function buildSlackText(summary) {
  return [
    '*Weekly Unified Audit*',
    `Guard regression: ${summary.guardRegression.status}`,
    `Checks: import-guard=${summary.checks.importGuardStatus}, council=${summary.checks.councilStatus}, debt=${summary.checks.debtStatus}, security=${summary.checks.securityStatus}`,
    `Council: ${summary.council.score} (${summary.council.grade}), findings=${summary.council.findings}, parser-corruption=${summary.council.parserCorruptionCount}`,
    `Debt: typecheck=${summary.debt.typecheckStatus}, lint=${summary.debt.lintStatus}, placeholders=${summary.debt.placeholderCount}, outdated=${summary.debt.outdatedCount}`,
    `Security: critical=${summary.security.criticalVulns}, high=${summary.security.highVulns}, auth-gaps=${summary.security.trueAuthGaps}, secret-hits=${summary.security.hardcodedSecretHits}`,
  ].join('\n')
}

function main() {
  const council = readJsonIfExists(INPUTS.council)
  const debt = readJsonIfExists(INPUTS.debt)
  const security = readJsonIfExists(INPUTS.security)

  const statuses = {
    guardRegressionStatus: process.env.GUARD_REGRESSION_STATUS ?? 'not_run',
    importGuardStatus: process.env.IMPORT_GUARD_STATUS ?? 'not_run',
    councilStatus: process.env.COUNCIL_AUDIT_STATUS ?? 'not_run',
    debtStatus: process.env.DEBT_AUDIT_STATUS ?? 'not_run',
    securityStatus: process.env.SECURITY_AUDIT_STATUS ?? 'not_run',
  }

  const summary = toSummary(council, debt, security, statuses)
  const markdown = buildMarkdown(summary)
  const slackText = buildSlackText(summary)

  fs.mkdirSync(DOCS, { recursive: true })
  fs.writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2) + '\n', 'utf8')
  fs.writeFileSync(OUT_MD, markdown, 'utf8')
  fs.writeFileSync(OUT_SLACK, slackText + '\n', 'utf8')
  fs.writeFileSync(OUT_EMAIL, markdown, 'utf8')

  console.log('Weekly unified audit report generated.')
  console.log(`Report: ${path.relative(ROOT, OUT_MD).replace(/\\/g, '/')}`)
  console.log(`Data:   ${path.relative(ROOT, OUT_JSON).replace(/\\/g, '/')}`)
}

main()
