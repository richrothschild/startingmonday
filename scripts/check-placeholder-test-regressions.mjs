#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const BASELINE_PATH = path.join(ROOT, 'docs', 'placeholder-test-baseline.json')
const TEST_DIRS = [path.join(ROOT, 'src'), path.join(ROOT, 'tests')]
const TEST_FILE_RE = /\.(test|spec)\.[cm]?[jt]sx?$/
const PLACEHOLDER_PATTERNS = [
  /placeholder coverage/i,
  /marks module as covered for council traceability/i,
  /expect\(\s*true\s*\)\.toBe\(\s*true\s*\)/i,
]

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue
      out.push(...walk(full))
      continue
    }
    if (entry.isFile() && TEST_FILE_RE.test(entry.name)) out.push(full)
  }
  return out
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

function hasPlaceholder(content) {
  return PLACEHOLDER_PATTERNS.some((re) => re.test(content))
}

function getCurrentPlaceholderFiles() {
  const files = TEST_DIRS.flatMap(walk)
  return files
    .filter((f) => hasPlaceholder(fs.readFileSync(f, 'utf8')))
    .map(rel)
    .sort()
}

function readBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    return { version: 1, files: [] }
  }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
}

function writeBaseline(files) {
  fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true })
  fs.writeFileSync(
    BASELINE_PATH,
    JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), files }, null, 2) + '\n',
    'utf8',
  )
}

const update = process.argv.includes('--update-baseline')
const current = getCurrentPlaceholderFiles()

if (update) {
  writeBaseline(current)
  console.log(`Updated placeholder baseline: ${current.length} files`) 
  process.exit(0)
}

const baseline = readBaseline()
const baselineSet = new Set(baseline.files || [])
const regressions = current.filter((f) => !baselineSet.has(f))

if (regressions.length > 0) {
  console.error('Placeholder test regression detected. New placeholder-like tests:')
  for (const file of regressions) {
    console.error(`- ${file}`)
  }
  console.error('Fix by replacing placeholders with real behavior tests.')
  console.error('If intentionally accepted, update baseline with: node scripts/check-placeholder-test-regressions.mjs --update-baseline')
  process.exit(1)
}

console.log(`Placeholder regression check passed. Current=${current.length}, Baseline=${baselineSet.size}`)