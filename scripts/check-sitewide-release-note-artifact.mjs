#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DOCS_CONTENT = path.join(ROOT, 'docs', 'content')
const TRACKER_PATH = path.join(DOCS_CONTENT, 'sitewide-execution-epic-wbs-and-deployment-tracker-2026-05-26.md')
const RELEASE_NOTE_RE = /^release-note-\d{4}-\d{2}-\d{2}-sitewide-execution-epic\.md$/
const OUT_JSON = path.join(ROOT, 'docs', 'content', 'release-note-sitewide-check.latest.json')
const OUT_MD = path.join(ROOT, 'docs', 'content', 'release-note-sitewide-check.latest.md')
const MAX_RELEASE_NOTE_AGE_DAYS = 14

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  const strict = args.has('--strict')
  return {
    strict,
    json: args.has('--json'),
    writeArtifacts: args.has('--write-artifacts') || !strict,
  }
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function parseDateLine(markdown) {
  const match = markdown.match(/^Date:\s*(\d{4}-\d{2}-\d{2})\s*$/m)
  if (!match) return null
  const parsed = Date.parse(`${match[1]}T00:00:00Z`)
  if (!Number.isFinite(parsed)) return null
  return { value: match[1], timestampMs: parsed }
}

function formatRel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

function writeOutputs(result) {
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(result, null, 2)}\n`)

  const lines = [
    '# Sitewide Release Note Artifact Check',
    '',
    `Status: ${result.status}`,
    `Checked at: ${result.checkedAt}`,
    `Latest release note: ${result.latestReleaseNote || 'none'}`,
    '',
    '## Checks',
  ]

  for (const check of result.checks) {
    lines.push(`- ${check.name}: ${check.status}${check.detail ? ` (${check.detail})` : ''}`)
  }

  lines.push('', '## Failures')
  if (result.failures.length === 0) {
    lines.push('- none')
  } else {
    for (const failure of result.failures) lines.push(`- ${failure}`)
  }

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`)
}

function main() {
  const args = parseArgs(process.argv)
  const checks = []
  const failures = []

  const releaseNoteFiles = fs.existsSync(DOCS_CONTENT)
    ? fs.readdirSync(DOCS_CONTENT)
        .filter((fileName) => RELEASE_NOTE_RE.test(fileName))
        .sort((a, b) => b.localeCompare(a))
    : []

  const hasReleaseNote = releaseNoteFiles.length > 0
  checks.push({
    name: 'release-note-file-present',
    status: hasReleaseNote ? 'PASS' : 'FAIL',
    detail: `${releaseNoteFiles.length} file(s)`,
  })
  if (!hasReleaseNote) {
    failures.push('Missing docs/content/release-note-YYYY-MM-DD-sitewide-execution-epic.md artifact')
  }

  let latestReleaseNote = null
  if (hasReleaseNote) {
    latestReleaseNote = path.join(DOCS_CONTENT, releaseNoteFiles[0])
    const markdown = readUtf8(latestReleaseNote)

    const requiredHeadings = [
      '## User-visible changes',
      '## KPI intent',
      '## Rollback triggers',
    ]

    for (const heading of requiredHeadings) {
      const present = markdown.includes(heading)
      checks.push({
        name: `release-note-section:${heading.replace('## ', '').toLowerCase().replace(/\s+/g, '-')}`,
        status: present ? 'PASS' : 'FAIL',
      })
      if (!present) {
        failures.push(`${formatRel(latestReleaseNote)} is missing section: ${heading}`)
      }
    }

    const parsedDate = parseDateLine(markdown)
    if (!parsedDate) {
      checks.push({ name: 'release-note-date', status: 'FAIL', detail: 'missing or invalid Date line' })
      failures.push(`${formatRel(latestReleaseNote)} has missing or invalid Date line`) 
    } else {
      const ageDays = (Date.now() - parsedDate.timestampMs) / 86400000
      const fresh = ageDays <= MAX_RELEASE_NOTE_AGE_DAYS
      checks.push({
        name: 'release-note-freshness',
        status: fresh ? 'PASS' : 'FAIL',
        detail: `${ageDays.toFixed(1)}d old`,
      })
      if (!fresh) {
        failures.push(`${formatRel(latestReleaseNote)} is older than ${MAX_RELEASE_NOTE_AGE_DAYS} days`) 
      }
    }

    const trackerExists = fs.existsSync(TRACKER_PATH)
    if (!trackerExists) {
      checks.push({ name: 'tracker-reference', status: 'FAIL', detail: 'missing tracker file' })
      failures.push(`Missing tracker: ${formatRel(TRACKER_PATH)}`)
    } else {
      const tracker = readUtf8(TRACKER_PATH)
      const releaseNoteRef = formatRel(latestReleaseNote)
      const trackerReferencesNote = tracker.includes(releaseNoteRef)
      checks.push({
        name: 'tracker-references-release-note',
        status: trackerReferencesNote ? 'PASS' : 'FAIL',
      })
      if (!trackerReferencesNote) {
        failures.push(`${formatRel(TRACKER_PATH)} does not reference ${releaseNoteRef}`)
      }
    }
  }

  const result = {
    checkedAt: new Date().toISOString(),
    status: failures.length === 0 ? 'PASS' : 'FAIL',
    latestReleaseNote: latestReleaseNote ? formatRel(latestReleaseNote) : null,
    checks,
    failures,
  }

  if (args.writeArtifacts) {
    writeOutputs(result)
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log('Sitewide release-note artifact check')
    console.log('------------------------------------')
    console.log(`Status: ${result.status}`)
    console.log(`Latest release note: ${result.latestReleaseNote ?? 'none'}`)
    for (const check of result.checks) {
      console.log(`- ${check.name}: ${check.status}${check.detail ? ` (${check.detail})` : ''}`)
    }
    if (result.failures.length > 0) {
      for (const failure of result.failures) console.log(`- ${failure}`)
    }
  }

  if (args.strict && failures.length > 0) {
    process.exit(2)
  }
}

main()
