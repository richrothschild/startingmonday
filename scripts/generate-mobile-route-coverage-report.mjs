#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const inputPath = process.argv[2] || 'playwright-report/mobile-key-routes.json'
const outputPath = process.argv[3] || 'playwright-report/mobile-key-routes-coverage.md'

const PROJECTS = ['mobile-iphone', 'mobile-android', 'mobile-tablet']

function extractRoute(title) {
  const match = title.match(/route\s+(\/[^\s]*)\s+renders/i)
  return match?.[1] ?? null
}

function score(status) {
  if (status === 'failed' || status === 'timedOut' || status === 'interrupted') return 3
  if (status === 'skipped') return 2
  if (status === 'passed') return 1
  return 0
}

function normalizeStatus(status) {
  if (status === 'timedOut' || status === 'interrupted') return 'failed'
  if (status === 'passed' || status === 'failed' || status === 'skipped') return status
  return 'not_run'
}

function walkSuites(suites, pushSpec) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) pushSpec(spec)
    walkSuites(suite.suites ?? [], pushSpec)
  }
}

if (!fs.existsSync(inputPath)) {
  console.error(`Coverage input not found: ${inputPath}`)
  process.exit(1)
}

const rawInput = fs.readFileSync(inputPath, 'utf8')
const noAnsi = rawInput.replace(/\u001b\[[0-9;]*m/g, '')
const rootMatch = noAnsi.match(/\{\s*"config"\s*:/)
const firstBrace = rootMatch ? rootMatch.index : -1
const lastBrace = noAnsi.lastIndexOf('}')
if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
  console.error(`Coverage input did not contain a valid JSON object: ${inputPath}`)
  process.exit(1)
}
const report = JSON.parse(noAnsi.slice(firstBrace, lastBrace + 1))
const matrix = new Map()

function ensureRoute(route) {
  if (matrix.has(route)) return
  const projectStatus = {}
  for (const project of PROJECTS) projectStatus[project] = 'not_run'
  matrix.set(route, projectStatus)
}

walkSuites(report.suites ?? [], (spec) => {
  const route = extractRoute(spec.title ?? '')
  if (!route) return
  ensureRoute(route)

  for (const t of spec.tests ?? []) {
    const project = t.projectName
    if (!PROJECTS.includes(project)) continue

    const statuses = (t.results ?? []).map((r) => normalizeStatus(r.status))
    let finalStatus = 'not_run'
    for (const s of statuses) {
      if (score(s) > score(finalStatus)) finalStatus = s
    }

    const current = matrix.get(route)[project]
    if (score(finalStatus) > score(current)) {
      matrix.get(route)[project] = finalStatus
    }
  }
})

const statusEmoji = {
  passed: 'PASS',
  failed: 'FAIL',
  skipped: 'SKIP',
  not_run: 'N/A',
}

const totals = {
  passed: 0,
  failed: 0,
  skipped: 0,
  not_run: 0,
}

const lines = []
lines.push('# Mobile Key Routes Coverage Report')
lines.push('')
lines.push(`Generated: ${new Date().toISOString()}`)
lines.push('')
lines.push('| Route | iPhone | Android | Tablet |')
lines.push('| --- | --- | --- | --- |')

const routes = [...matrix.keys()].sort((a, b) => a.localeCompare(b))

for (const route of routes) {
  const row = matrix.get(route)
  for (const project of PROJECTS) {
    const value = row[project]
    totals[value] += 1
  }
  lines.push(`| ${route} | ${statusEmoji[row['mobile-iphone']]} | ${statusEmoji[row['mobile-android']]} | ${statusEmoji[row['mobile-tablet']]} |`)
}

const totalChecks = routes.length * PROJECTS.length
const passRate = totalChecks === 0 ? 0 : Math.round((totals.passed / totalChecks) * 100)

lines.push('')
lines.push('## Summary')
lines.push('')
lines.push(`- Total checks: ${totalChecks}`)
lines.push(`- Passed: ${totals.passed}`)
lines.push(`- Failed: ${totals.failed}`)
lines.push(`- Skipped: ${totals.skipped}`)
lines.push(`- Not run: ${totals.not_run}`)
lines.push(`- Pass rate: ${passRate}%`)

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8')
console.log(`Wrote coverage report: ${outputPath}`)
