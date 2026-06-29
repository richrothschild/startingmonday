#!/usr/bin/env node
/**
 * Pre-PR check suite — run before opening a PR via `npm run check:pr`.
 * Target: ~50s. Catches the most common CI failures before they reach GitHub.
 *
 * Parallel group (~12s wall time):
 *   auth enforcement, dep policy, eslint (cached)
 *
 * Sequential (~20s):
 *   tsc --noEmit (incremental), vitest run --changed origin/main
 *
 * Intentionally excluded:
 *   em-dash scan   — 130+ pre-existing violations; already in CI predeploy-gates
 *   lint:check-baseline — ~66s; CI only
 */

import { execSync, spawn } from 'node:child_process'
import { performance } from 'node:perf_hooks'

const RESET  = '\x1b[0m'
const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const BOLD   = '\x1b[1m'
const DIM    = '\x1b[2m'

function fmtMs(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function printResult({ label, ok, output, duration }) {
  const icon = ok ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`
  console.log(`  ${icon} ${label.padEnd(26)} ${DIM}${fmtMs(duration)}${RESET}`)
  if (!ok && output.trim()) {
    const lines = output.trim().split('\n')
    const preview = lines.slice(0, 25)
    console.log(preview.map(l => `      ${l}`).join('\n'))
    if (lines.length > 25) {
      console.log(`      ${DIM}... and ${lines.length - 25} more lines${RESET}`)
    }
  }
}

function runAsync(label, cmd) {
  return new Promise((resolve) => {
    const start = performance.now()
    const child = spawn(cmd, { shell: true, stdio: 'pipe' })
    let out = ''
    child.stdout.on('data', d => { out += d })
    child.stderr.on('data', d => { out += d })
    child.on('close', code => {
      resolve({ label, ok: code === 0, output: out, duration: Math.round(performance.now() - start) })
    })
  })
}

function runSync(label, cmd) {
  const start = performance.now()
  try {
    execSync(cmd, { stdio: 'pipe' })
    return { label, ok: true, output: '', duration: Math.round(performance.now() - start) }
  } catch (e) {
    const out = (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? '')
    return { label, ok: false, output: out, duration: Math.round(performance.now() - start) }
  }
}

const totalStart = performance.now()
const failures = []

console.log(`\n${BOLD}Pre-PR checks${RESET}\n`)

// ── Parallel group ─────────────────────────────────────────────────────────
console.log(`${DIM}parallel: auth · deps · lint${RESET}`)

const parallelResults = await Promise.all([
  runAsync('auth enforcement',  'node scripts/check-auth.mjs'),
  runAsync('dep policy',        'node scripts/check-dependency-policy.mjs'),
  runAsync('lint (cached)',     'npx eslint --cache src scripts worker tests'),
])

console.log()
for (const r of parallelResults) {
  printResult(r)
  if (!r.ok) failures.push(r.label)
}

// ── Sequential ─────────────────────────────────────────────────────────────
console.log()
console.log(`${DIM}sequential: tsc · vitest${RESET}`)
console.log()

const tsc = runSync('typecheck', 'npx tsc --noEmit')
printResult(tsc)
if (!tsc.ok) failures.push(tsc.label)

const tests = runSync('unit tests', 'npx vitest run --changed origin/main')
printResult(tests)
if (!tests.ok) failures.push(tests.label)

const landingStandard = runSync('required std gate (dev)', 'node scripts/check-required-standard-gates.mjs --env=dev')
printResult(landingStandard)
if (!landingStandard.ok) failures.push(landingStandard.label)

// ── Summary ────────────────────────────────────────────────────────────────
const total = Math.round(performance.now() - totalStart)
console.log()
console.log(`${DIM}─────────────────────────────────────${RESET}`)

if (failures.length === 0) {
  console.log(`${GREEN}${BOLD}All checks passed${RESET}  ${DIM}${fmtMs(total)}${RESET}`)
  console.log()
} else {
  console.log(`${RED}${BOLD}${failures.length} check(s) failed${RESET}  ${DIM}${fmtMs(total)}${RESET}`)
  console.log(`${RED}  ${failures.join(', ')}${RESET}`)
  console.log()
  process.exit(1)
}
