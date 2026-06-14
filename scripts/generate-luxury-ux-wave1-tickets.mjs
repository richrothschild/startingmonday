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

const inputPath = getArg('input', 'tmp/luxury-ux-remediation-backlog.csv')
const wave = getArg('wave', 'Wave 1')
const safeWave = wave.toLowerCase().replace(/\s+/g, '-')
const outputPath = getArg('output', `tmp/luxury-ux-${safeWave}-autotickets.csv`)
const defaultOwner = getArg('owner', 'design-system')
const defaultEta = getArg('eta', '3d')

function readText(relativePath) {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Input file not found: ${relativePath}`)
  }
  return fs.readFileSync(fullPath, 'utf8')
}

function writeText(relativePath, content) {
  const fullPath = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content)
}

function parseCsvLine(line) {
  const out = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
        continue
      }
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      out.push(current)
      current = ''
      continue
    }

    current += char
  }

  out.push(current)
  return out
}

function toRows(csvText) {
  const lines = csvText.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []

  const header = parseCsvLine(lines[0])
  const rows = []

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line)
    const row = {}
    for (let i = 0; i < header.length; i += 1) {
      row[header[i]] = values[i] ?? ''
    }
    rows.push(row)
  }

  return rows
}

function csvEscape(value) {
  const raw = String(value ?? '')
  if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`
  return raw
}

function buildAcceptance(issueTypesRaw) {
  const issueTypes = (issueTypesRaw || '')
    .split('|')
    .map((v) => v.trim())
    .filter(Boolean)

  const checks = []

  if (issueTypes.includes('tiny-text-heavy')) {
    checks.push('Support/body copy moved to 13-14px baseline where applicable')
    checks.push('Page passes luxury tiny-text static gate')
  }

  if (issueTypes.includes('repeated-cta-labels')) {
    checks.push('Repeated CTA labels reduced to avoid duplicate intent overload')
    checks.push('Page has no repeated CTA label finding in static gate')
  }

  if (issueTypes.includes('excess-uppercase-micro-labels')) {
    checks.push('Uppercase micro labels reduced to occasional metadata only')
    checks.push('Page passes uppercase micro-label threshold in static gate')
  }

  if (issueTypes.includes('missing-key-takeaway-above-comparison-table')) {
    checks.push('Key takeaway sentence added above comparison table')
  }

  if (issueTypes.includes('missing-comparison-disclosure-control')) {
    checks.push('Comparison table keeps summary rows by default with expanded rows behind disclosure')
  }

  checks.push('Run: npm run ux:luxury:static:staged')

  return checks.join(' | ')
}

const backlogRows = toRows(readText(inputPath))
const selectedWaveRows = backlogRows.filter((row) => row.wave === wave)

const tickets = selectedWaveRows.map((row, index) => {
  const issueTypes = row.issue_types || ''
  return {
    ticket_id: `LUX-W1-${String(index + 1).padStart(3, '0')}`,
    wave: row.wave,
    tier: row.tier,
    page: row.page,
    issue_types: issueTypes,
    priority_score: row.priority_score,
    owner: defaultOwner,
    eta: defaultEta,
    status: 'todo',
    acceptance_criteria: buildAcceptance(issueTypes),
    source_report: inputPath,
  }
})

const header = [
  'ticket_id',
  'wave',
  'tier',
  'page',
  'issue_types',
  'priority_score',
  'owner',
  'eta',
  'status',
  'acceptance_criteria',
  'source_report',
]

const lines = [header.join(',')]
for (const row of tickets) {
  lines.push(header.map((key) => csvEscape(row[key])).join(','))
}

writeText(outputPath, `${lines.join('\n')}\n`)

console.log(`Generated ${wave} auto-ticket CSV: ${outputPath}`)
console.log(`Tickets: ${tickets.length}`)
