#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'docs')
const OUT_JSON = path.join(OUT_DIR, 'security-deep-dive-audit.latest.json')
const OUT_MD = path.join(OUT_DIR, 'security-deep-dive-audit.latest.md')
const NPM_CMD = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const SOURCE_DIRS = ['src', 'scripts', 'worker', 'tests']
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs'])
const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', 'playwright-report', 'test-results', 'public', 'docs'])

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
    if (!EXTENSIONS.has(path.extname(entry.name))) continue
    out.push(full)
  }
  return out
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

function runJson(command, args) {
  const run = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' })
  const stdout = (run.stdout ?? '').trim()
  const stderr = (run.stderr ?? '').trim()
  const merged = [stdout, stderr].filter(Boolean).join('\n')
  if (!merged) return { ok: false, status: run.status ?? 1, raw: '' }
  const jsonStart = merged.indexOf('{')
  const jsonPayload = jsonStart >= 0 ? merged.slice(jsonStart) : merged
  try {
    return { ok: true, status: run.status ?? 0, data: JSON.parse(jsonPayload) }
  } catch {
    return { ok: false, status: run.status ?? 1, raw: merged }
  }
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    strict: args.has('--strict'),
  }
}

function scanStaticSecurity() {
  const files = SOURCE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
  const findings = {
    evalUsage: [],
    dangerousHtml: [],
    hardcodedSecrets: [],
  }

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    const p = rel(file)
    if (/\beval\(|\bnew Function\(/.test(source)) findings.evalUsage.push(p)
    if (p.startsWith('src/') && /dangerouslySetInnerHTML/.test(source)) findings.dangerousHtml.push(p)
    if (/sk_(live|test)_[A-Za-z0-9]+|AKIA[0-9A-Z]{16}|-----BEGIN (RSA|EC|PRIVATE) KEY-----/.test(source)) {
      findings.hardcodedSecrets.push(p)
    }
  }

  return findings
}

function toMarkdown(result) {
  const out = []
  out.push('# Security Deep-Dive Audit')
  out.push('')
  out.push(`Generated: ${result.generatedAt}`)
  out.push('')
  out.push('## Dependency Vulnerabilities')
  out.push('')
  out.push(`- npm audit parse ok: ${result.npmAudit.parseOk}`)
  out.push(`- critical: ${result.npmAudit.critical}`)
  out.push(`- high: ${result.npmAudit.high}`)
  out.push(`- moderate: ${result.npmAudit.moderate}`)
  out.push(`- low: ${result.npmAudit.low}`)
  out.push('')
  out.push('## API Guard Coverage')
  out.push('')
  out.push(`- true gaps: ${result.apiGuards.trueGapCount}`)
  out.push(`- expected public POST routes without shared guard: ${result.apiGuards.publicPostWithoutSharedGuardCount}`)
  out.push('')
  out.push('## Static Security Signals')
  out.push('')
  out.push(`- eval/new Function files: ${result.staticSignals.evalUsage.length}`)
  out.push(`- dangerouslySetInnerHTML files: ${result.staticSignals.dangerousHtml.length}`)
  out.push(`- hardcoded secret pattern hits: ${result.staticSignals.hardcodedSecrets.length}`)
  out.push('')

  const addList = (title, items) => {
    out.push(`### ${title}`)
    out.push('')
    if (items.length === 0) {
      out.push('- none')
      out.push('')
      return
    }
    for (const item of items) out.push(`- ${item}`)
    out.push('')
  }

  addList('True Auth Gaps', result.apiGuards.trueGaps)
  addList('Eval/New Function Usage', result.staticSignals.evalUsage)
  addList('dangerouslySetInnerHTML Usage', result.staticSignals.dangerousHtml)
  addList('Hardcoded Secret Pattern Hits', result.staticSignals.hardcodedSecrets)

  return out.join('\n') + '\n'
}

function main() {
  const { strict } = parseArgs(process.argv)
  const npmAudit = runJson(NPM_CMD, ['audit', '--json'])
  const guardAudit = runJson('node', ['scripts/check-api-guards.mjs', '--json'])
  const staticSignals = scanStaticSecurity()

  const vulnerabilities = npmAudit.ok && npmAudit.data?.metadata?.vulnerabilities
    ? npmAudit.data.metadata.vulnerabilities
    : {}

  const guardData = guardAudit.ok && guardAudit.data ? guardAudit.data : {
    trueGapCount: -1,
    trueGaps: [],
    publicPostWithoutSharedGuardCount: -1,
  }

  const result = {
    generatedAt: new Date().toISOString(),
    npmAudit: {
      parseOk: npmAudit.ok,
      critical: vulnerabilities.critical ?? 0,
      high: vulnerabilities.high ?? 0,
      moderate: vulnerabilities.moderate ?? 0,
      low: vulnerabilities.low ?? 0,
      info: vulnerabilities.info ?? 0,
      total: vulnerabilities.total ?? 0,
      exitCode: npmAudit.status,
    },
    apiGuards: {
      parseOk: guardAudit.ok,
      trueGapCount: guardData.trueGapCount ?? 0,
      trueGaps: (guardData.trueGaps ?? []).map((g) => g.path),
      publicPostWithoutSharedGuardCount: guardData.publicPostWithoutSharedGuardCount ?? 0,
    },
    staticSignals,
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n', 'utf8')
  fs.writeFileSync(OUT_MD, toMarkdown(result), 'utf8')

  console.log('Security deep-dive audit complete.')
  console.log(`Report: ${rel(OUT_MD)}`)
  console.log(`Data:   ${rel(OUT_JSON)}`)

  const hasCriticalSecurityRisk =
    result.npmAudit.critical > 0 ||
    result.apiGuards.trueGapCount > 0 ||
    result.staticSignals.hardcodedSecrets.length > 0

  if (strict && hasCriticalSecurityRisk) {
    process.exitCode = 1
  }
}

main()
