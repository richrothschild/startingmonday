#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DEFAULT_STATE_PATH = path.join(ROOT, 'docs', 'status', 'placeholder-batch-agent.state.json')
const DEFAULT_OUTPUT_PATH = path.join(ROOT, 'tmp', 'placeholder-batch.current.json')
const TEST_ROOT = path.join(ROOT, 'src', 'app', 'api')
const TEST_FILE_RE = /\.test\.[cm]?[jt]sx?$/
const PLACEHOLDER_PATTERNS = [
  /placeholder coverage/i,
  /marks module as covered for council traceability/i,
  /expect\(\s*true\s*\)\.toBe\(\s*true\s*\)/i,
]

function parseArgs(argv) {
  const out = {
    count: 4,
    statePath: DEFAULT_STATE_PATH,
    outputPath: DEFAULT_OUTPUT_PATH,
    includePattern: 'src/app/api/**/route.test.ts',
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = argv[i + 1]
    if (arg === '--count' && next) {
      out.count = Math.max(1, Math.min(Number(next) || 4, 10))
      i += 1
      continue
    }
    if (arg === '--state' && next) {
      out.statePath = path.resolve(ROOT, next)
      i += 1
      continue
    }
    if (arg === '--output' && next) {
      out.outputPath = path.resolve(ROOT, next)
      i += 1
      continue
    }
    if (arg === '--include' && next) {
      out.includePattern = next
      i += 1
      continue
    }
  }

  return out
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue
      files.push(...walk(fullPath))
      continue
    }
    if (!entry.isFile()) continue
    if (!TEST_FILE_RE.test(entry.name)) continue
    files.push(fullPath)
  }
  return files
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

function scorePlaceholder(content) {
  return PLACEHOLDER_PATTERNS.reduce((sum, re) => {
    const matches = content.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`))
    return sum + (matches ? matches.length : 0)
  }, 0)
}

function discoverCandidates() {
  const files = walk(TEST_ROOT)
  const candidates = []

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8')
    const score = scorePlaceholder(content)
    if (score <= 0) continue
    candidates.push({
      file: rel(filePath),
      score,
      routeFile: rel(filePath).replace(/\.test\./, '.'),
    })
  }

  candidates.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score
    return a.file.localeCompare(b.file)
  })

  return candidates
}

function readState(statePath) {
  if (!fs.existsSync(statePath)) {
    return {
      version: 1,
      updatedAt: null,
      runs: 0,
      lastRun: null,
      history: [],
    }
  }

  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'))
  } catch {
    return {
      version: 1,
      updatedAt: null,
      runs: 0,
      lastRun: null,
      history: [],
    }
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const now = new Date().toISOString()
  const candidates = discoverCandidates()
  const selected = candidates.slice(0, args.count)

  const payload = {
    generatedAt: now,
    countRequested: args.count,
    selectedCount: selected.length,
    selected: selected.map((row) => row.file),
    selectedRouteFiles: selected.map((row) => row.routeFile),
    remainingCount: Math.max(0, candidates.length - selected.length),
    candidates,
  }

  writeJson(args.outputPath, payload)

  const state = readState(args.statePath)
  const history = Array.isArray(state.history) ? state.history.slice(-39) : []
  history.push({
    at: now,
    selectedCount: payload.selectedCount,
    remainingCount: payload.remainingCount,
    selected: payload.selected,
  })

  writeJson(args.statePath, {
    version: 1,
    updatedAt: now,
    runs: (Number(state.runs) || 0) + 1,
    lastRun: {
      at: now,
      selectedCount: payload.selectedCount,
      remainingCount: payload.remainingCount,
      selected: payload.selected,
    },
    history,
  })

  console.log(JSON.stringify({
    outputPath: rel(args.outputPath),
    selectedCount: payload.selectedCount,
    remainingCount: payload.remainingCount,
  }))
}

main()
