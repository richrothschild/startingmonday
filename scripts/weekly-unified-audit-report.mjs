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

function assertExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required audit input: ${path.relative(ROOT, filePath).replace(/\\/g, '/')}`)
  }
}

function toSummary(council, debt, security, guardRegressionStatus) {
  return {
    generatedAt: new Date().toISOString(),
    guardRegression: {
      status: guardRegressionStatus,
    },
    council: {
      score: council.overallScore,
      grade: council.grade,
      findings: council.findingCount,
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
    `Council: ${summary.council.score} (${summary.council.grade}), findings=${summary.council.findings}, parser-corruption=${summary.council.parserCorruptionCount}`,
    `Debt: typecheck=${summary.debt.typecheckStatus}, lint=${summary.debt.lintStatus}, placeholders=${summary.debt.placeholderCount}, outdated=${summary.debt.outdatedCount}`,
    `Security: critical=${summary.security.criticalVulns}, high=${summary.security.highVulns}, auth-gaps=${summary.security.trueAuthGaps}, secret-hits=${summary.security.hardcodedSecretHits}`,
  ].join('\n')
}

function main() {
  assertExists(INPUTS.council)
  assertExists(INPUTS.debt)
  assertExists(INPUTS.security)

  const council = readJson(INPUTS.council)
  const debt = readJson(INPUTS.debt)
  const security = readJson(INPUTS.security)
  const guardRegressionStatus = process.env.GUARD_REGRESSION_STATUS ?? 'not_run'

  const summary = toSummary(council, debt, security, guardRegressionStatus)
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
