#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

function getArg(name, fallback = null) {
  const prefix = `--${name}=`
  const arg = process.argv.find((value) => value.startsWith(prefix))
  if (!arg) return fallback
  return arg.slice(prefix.length)
}

const inputPath = getArg('input', 'tmp/luxury-ux-all-pages.json')
const outputPath = getArg('output', 'tmp/luxury-ux-remediation-backlog.csv')

function readJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Input report not found: ${relativePath}`)
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
}

function writeText(relativePath, content) {
  const fullPath = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content)
}

function parseIssueType(issue) {
  const idx = issue.indexOf(':')
  if (idx === -1) return issue.trim()
  return issue.slice(0, idx).trim()
}

function csvEscape(value) {
  const raw = String(value ?? '')
  if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`
  return raw
}

const TIER_WEIGHT = {
  'public-premium': 300,
  'public-nonpremium': 200,
  'internal-dashboard': 100,
}

const ISSUE_WEIGHT = {
  'missing-key-takeaway-above-comparison-table': 90,
  'missing-comparison-disclosure-control': 85,
  'repeated-cta-labels': 70,
  'excess-uppercase-micro-labels': 50,
  'tiny-text-heavy': 45,
}

function inferWave(tierName) {
  if (tierName === 'public-premium') return 'Wave 1'
  if (tierName === 'public-nonpremium') return 'Wave 2'
  return 'Wave 3'
}

const report = readJson(inputPath)
if (!Array.isArray(report.results)) {
  throw new Error('Invalid report format: missing results array')
}

const rows = []
for (const result of report.results) {
  if (!Array.isArray(result.issues) || result.issues.length === 0) continue

  const issueTypes = result.issues.map(parseIssueType)
  const uniqueIssueTypes = [...new Set(issueTypes)]
  const maxIssueWeight = Math.max(...uniqueIssueTypes.map((issueType) => ISSUE_WEIGHT[issueType] ?? 25))

  const priorityScore =
    (TIER_WEIGHT[result.tierName] ?? 0)
    + maxIssueWeight
    + result.issues.length * 10
    + Math.max(0, (result.tinyCount ?? 0) - (result.bodyCount ?? 0))

  rows.push({
    wave: inferWave(result.tierName),
    tier: result.tierName,
    page: result.relativePath,
    issueCount: result.issues.length,
    issueTypes: uniqueIssueTypes.join('|'),
    issues: result.issues.join(' || '),
    tinyCount: result.tinyCount ?? 0,
    bodyCount: result.bodyCount ?? 0,
    uppercaseMicroCount: result.uppercaseMicroCount ?? 0,
    repeatedCtaCount: Array.isArray(result.repeatedCtas) ? result.repeatedCtas.length : 0,
    priorityScore,
  })
}

rows.sort((a, b) => {
  if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore
  if (a.wave !== b.wave) return a.wave.localeCompare(b.wave)
  return a.page.localeCompare(b.page)
})

const header = [
  'wave',
  'tier',
  'priority_score',
  'page',
  'issue_count',
  'issue_types',
  'issues',
  'tiny_count',
  'body_count',
  'uppercase_micro_count',
  'repeated_cta_count',
]

const lines = [header.join(',')]
for (const row of rows) {
  lines.push([
    row.wave,
    row.tier,
    row.priorityScore,
    row.page,
    row.issueCount,
    row.issueTypes,
    row.issues,
    row.tinyCount,
    row.bodyCount,
    row.uppercaseMicroCount,
    row.repeatedCtaCount,
  ].map(csvEscape).join(','))
}

writeText(outputPath, `${lines.join('\n')}\n`)

const grouped = new Map()
for (const row of rows) {
  const key = `${row.tier}::${row.issueTypes}`
  if (!grouped.has(key)) grouped.set(key, { tier: row.tier, issueTypes: row.issueTypes, pages: 0 })
  grouped.get(key).pages += 1
}

const groupedPath = outputPath.replace(/\.csv$/i, '.groups.csv')
const groupedLines = ['tier,issue_types,page_count']
for (const entry of [...grouped.values()].sort((a, b) => b.pages - a.pages || a.tier.localeCompare(b.tier))) {
  groupedLines.push([entry.tier, entry.issueTypes, entry.pages].map(csvEscape).join(','))
}
writeText(groupedPath, `${groupedLines.join('\n')}\n`)

console.log(`Generated remediation backlog: ${outputPath}`)
console.log(`Generated grouped summary: ${groupedPath}`)
console.log(`Rows: ${rows.length}`)
