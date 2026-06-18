#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'docs')
const OUT_JSON = path.join(OUT_DIR, 'technical-debt-audit.latest.json')
const OUT_MD = path.join(OUT_DIR, 'technical-debt-audit.latest.md')
const NPM_CMD = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const TSC_CMD = path.join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc')
const ESLINT_CMD = path.join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'eslint.cmd' : 'eslint')
const SOURCE_DIRS = ['src', 'scripts', 'worker', 'tests']
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs'])
const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', 'playwright-report', 'test-results', 'public', 'docs'])
const PLACEHOLDER_PATTERNS = [
  /placeholder coverage/i,
  /marks module as covered for council traceability/i,
  /expect\(\s*true\s*\)\.toBe\(\s*true\s*\)/i,
]
const TEST_FILE_RE = /\.(test|spec)\.[cm]?[jt]sx?$/

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue
      out.push(...walk(full))
      continue
    }
    if (!entry.isFile()) continue
    const ext = path.extname(entry.name)
    if (!EXTENSIONS.has(ext)) continue
    out.push(full)
  }
  return out
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

function runJsonCommand(command, args) {
  const run = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' })
  const stdout = (run.stdout ?? '').trim()
  if (!stdout) return { ok: false, status: run.status ?? 1, raw: '' }
  try {
    return { ok: true, status: run.status ?? 0, data: JSON.parse(stdout) }
  } catch {
    return { ok: false, status: run.status ?? 1, raw: stdout }
  }
}

function runStatus(command, args) {
  const run = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' })
  return {
    status: run.status ?? 1,
    stdout: (run.stdout ?? '').trim(),
    stderr: (run.stderr ?? '').trim(),
  }
}

function countMatches(re, text) {
  const m = text.match(re)
  return m ? m.length : 0
}

function readPlaceholderBaselineCount() {
  const baselinePath = path.join(OUT_DIR, 'placeholder-test-baseline.json')
  if (!fs.existsSync(baselinePath)) return null
  try {
    const parsed = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
    return Array.isArray(parsed?.files) ? parsed.files.length : null
  } catch {
    return null
  }
}

function gatherFileMetrics() {
  const files = SOURCE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
  const metrics = []

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    const lines = source.split(/\r?\n/)
    metrics.push({
      path: rel(file),
      source,
      lineCount: lines.length,
      todoCount: countMatches(/TODO|FIXME|HACK|XXX/g, source),
      placeholderCoverage: /placeholder coverage/.test(source),
      importCorruption: /import\s*\{[\s\S]{0,240}\bconst\s+__councilObservabilitySignal\b[\s\S]{0,240}\}\s+from\s+['"]/m.test(source),
    })
  }

  return metrics
}

function countPlaceholderTests(metrics) {
  return metrics.filter((m) => {
    if (!TEST_FILE_RE.test(m.path)) return false
    return PLACEHOLDER_PATTERNS.some((re) => re.test(m.source))
  }).length
}

function toMarkdown(result) {
  const out = []
  out.push('# Technical Debt Deep-Dive Audit')
  out.push('')
  out.push(`Generated: ${result.generatedAt}`)
  out.push('')
  out.push('## Build Health')
  out.push('')
  out.push(`- Typecheck status: ${result.buildHealth.typecheck.status}`)
  out.push(`- Lint status: ${result.buildHealth.lint.status}`)
  out.push(`- Parser-corruption files: ${result.buildHealth.parserCorruptionCount}`)
  out.push('')
  out.push('## Test Debt')
  out.push('')
  out.push(`- Placeholder baseline count: ${result.testDebt.placeholderBaselineCount ?? 'n/a'}`)
  out.push(`- Placeholder files currently present: ${result.testDebt.currentPlaceholderFileCount}`)
  out.push('')
  out.push('## Structural Hotspots')
  out.push('')
  out.push('| File | Lines | TODO/FIXME |')
  out.push('| --- | ---: | ---: |')
  for (const row of result.hotspots.topLargeFiles) {
    out.push(`| ${row.path} | ${row.lineCount} | ${row.todoCount} |`)
  }
  out.push('')
  out.push('## Dependency Drift')
  out.push('')
  out.push(`- Outdated package count: ${result.dependencies.outdatedCount}`)
  if (result.dependencies.topOutdated.length > 0) {
    out.push('')
    out.push('| Package | Current | Wanted | Latest |')
    out.push('| --- | --- | --- | --- |')
    for (const pkg of result.dependencies.topOutdated) {
      out.push(`| ${pkg.name} | ${pkg.current} | ${pkg.wanted} | ${pkg.latest} |`)
    }
  }
  out.push('')
  return out.join('\n') + '\n'
}

function main() {
  const metrics = gatherFileMetrics()
  const placeholderCount = countPlaceholderTests(metrics)

  const typecheckRun = runStatus(TSC_CMD, ['--noEmit'])
  const lintRun = runStatus(ESLINT_CMD, [...SOURCE_DIRS, '--quiet'])
  const outdatedRun = runJsonCommand(NPM_CMD, ['outdated', '--json'])

  const parserCorruptionFiles = metrics.filter((m) => m.importCorruption).map((m) => m.path)
  const topLargeFiles = [...metrics]
    .sort((a, b) => b.lineCount - a.lineCount)
    .slice(0, 20)

  const outdatedEntries = outdatedRun.ok && outdatedRun.data && typeof outdatedRun.data === 'object'
    ? Object.entries(outdatedRun.data).map(([name, row]) => ({
      name,
      current: row.current,
      wanted: row.wanted,
      latest: row.latest,
    }))
    : []

  const result = {
    generatedAt: new Date().toISOString(),
    buildHealth: {
      typecheck: { status: typecheckRun.status === 0 ? 'pass' : 'fail', exitCode: typecheckRun.status },
      lint: { status: lintRun.status === 0 ? 'pass' : 'fail', exitCode: lintRun.status },
      parserCorruptionCount: parserCorruptionFiles.length,
      parserCorruptionFiles,
    },
    testDebt: {
      placeholderBaselineCount: readPlaceholderBaselineCount(),
      currentPlaceholderFileCount: placeholderCount,
    },
    hotspots: {
      topLargeFiles,
    },
    dependencies: {
      outdatedCount: outdatedEntries.length,
      topOutdated: outdatedEntries.slice(0, 20),
      parseFailed: !outdatedRun.ok,
    },
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n', 'utf8')
  fs.writeFileSync(OUT_MD, toMarkdown(result), 'utf8')

  console.log('Technical debt deep-dive audit complete.')
  console.log(`Report: ${rel(OUT_MD)}`)
  console.log(`Data:   ${rel(OUT_JSON)}`)

  if (result.buildHealth.parserCorruptionCount > 0) {
    process.exitCode = 1
  }
}

main()
