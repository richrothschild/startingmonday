#!/usr/bin/env node
/**
 * Luxury Page Sentinel
 *
 * Inventory-driven audit of EVERY route in src/app:
 *  1. Source palette audit (all pages, including auth-gated ones):
 *     flags light-shell palettes that violate the dark luxury standard.
 *  2. Runtime availability audit (all static routes against a live base URL):
 *     flags non-200 responses, 404 marker text, and slow responses.
 *
 * Reports failures to Slack when SLACK_WEBHOOK_URL is set.
 * Exits 1 when any blocking violation is found (unless --report-only).
 *
 * Usage:
 *   node scripts/luxury-page-sentinel.mjs [--base-url=https://startingmonday.app] [--report-only] [--output-json=tmp/luxury-sentinel.json]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const argv = process.argv.slice(2)
const reportOnly = argv.includes('--report-only')
const skipRuntime = argv.includes('--skip-runtime')
const baseUrlArg = argv.find((a) => a.startsWith('--base-url='))
const outputJsonArg = argv.find((a) => a.startsWith('--output-json='))
const BASE_URL = (baseUrlArg?.split('=')[1] || process.env.SENTINEL_BASE_URL || 'https://startingmonday.app').replace(/\/$/, '')
const OUTPUT_JSON = outputJsonArg?.split('=')[1] || 'tmp/luxury-page-sentinel.json'

const rubric = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'luxury-page-sentinel-rubric.json'), 'utf8'))

// ── Route inventory ──────────────────────────────────────────────────────────
function collectPageFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) collectPageFiles(full, acc)
    else if (entry.name === 'page.tsx' || entry.name === 'page.ts') acc.push(full)
  }
  return acc
}

function routeFromFile(relativePath) {
  // src/app/(group)/a/b/page.tsx -> /a/b
  const parts = relativePath
    .replace(/\\/g, '/')
    .replace(/^src\/app\//, '')
    .replace(/(^|\/)page\.tsx?$/, '')
    .split('/')
    .filter((seg) => seg && !(seg.startsWith('(') && seg.endsWith(')')))
  return '/' + parts.join('/')
}

const appDir = path.join(ROOT, 'src', 'app')
const pageFiles = collectPageFiles(appDir).map((f) => path.relative(ROOT, f).replace(/\\/g, '/'))
const inventory = pageFiles.map((relativePath) => {
  const route = routeFromFile(relativePath) || '/'
  return {
    relativePath,
    route: route === '' ? '/' : route,
    dynamic: /\[[^\]]+\]/.test(route),
    authGated: relativePath.startsWith('src/app/(dashboard)/') || relativePath.startsWith('src/app/settings/') || relativePath.startsWith('src/app/coach/'),
  }
})

// ── 1. Source palette audit ──────────────────────────────────────────────────
const LIGHT_SHELL_RE = /className\s*=\s*["'`][^"'`]*min-h-screen[^"'`]*(bg-slate-50|bg-slate-100|bg-gray-50|bg-gray-100)[^"'`]*["'`]|className\s*=\s*["'`][^"'`]*(bg-slate-50|bg-slate-100|bg-gray-50|bg-gray-100)[^"'`]*min-h-screen[^"'`]*["'`]/
// Light opaque card containers on the dark shell (e.g. bg-white/95 onboarding card).
const LIGHT_CARD_RE = /className\s*=\s*["'`][^"'`]*bg-white\/9[05][^"'`]*["'`]/

// Scan every non-test .tsx under src/app so client components cannot hide drift.
function collectTsxFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) collectTsxFiles(full, acc)
    else if (entry.name.endsWith('.tsx') && !entry.name.includes('.test.')) acc.push(full)
  }
  return acc
}

function nearestRoute(relativePath) {
  // Attribute a component file to the closest ancestor directory containing page.tsx
  let dir = path.posix.dirname(relativePath)
  while (dir.startsWith('src/app')) {
    if (fs.existsSync(path.join(ROOT, dir, 'page.tsx'))) {
      return routeFromFile(`${dir}/page.tsx`) || '/'
    }
    dir = path.posix.dirname(dir)
  }
  return '(shared-component)'
}

const tsxFiles = [
  ...collectTsxFiles(appDir),
  ...collectTsxFiles(path.join(ROOT, 'src', 'components')),
].map((f) => path.relative(ROOT, f).replace(/\\/g, '/'))
const paletteViolations = []
for (const relativePath of tsxFiles) {
  const source = fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  const shellMatch = source.match(LIGHT_SHELL_RE)
  const cardMatch = source.match(LIGHT_CARD_RE)
  const match = shellMatch ?? cardMatch
  if (match) {
    paletteViolations.push({
      route: nearestRoute(relativePath),
      relativePath,
      dimension: 'palette-conformance',
      evidence: match[0].slice(0, 160),
    })
  }
}

// ── 2. Runtime availability audit ────────────────────────────────────────────
const runtimeViolations = []
const runtimeChecked = []

async function checkRoute(route) {
  const url = `${BASE_URL}${route}`
  const startedAt = Date.now()
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), rubric.runtime.maxResponseMs + 4000)
    const res = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'luxury-page-sentinel/1.0' } })
    clearTimeout(timer)
    const elapsedMs = Date.now() - startedAt
    const body = await res.text()
    // Markers use rendered-markup form (">text<") so the escaped copy of the
    // not-found template inside the RSC flight payload does not false-positive.
    const notFoundHit = rubric.runtime.notFoundMarkers.find((marker) => body.includes(marker))

    runtimeChecked.push({ route, status: res.status, elapsedMs })

    if (!rubric.runtime.allowedStatusCodes.includes(res.status)) {
      runtimeViolations.push({ route, dimension: 'availability', evidence: `HTTP ${res.status} at ${url}` })
    } else if (notFoundHit) {
      runtimeViolations.push({ route, dimension: 'availability', evidence: `404 marker "${notFoundHit}" rendered at ${url}` })
    } else if (elapsedMs > rubric.runtime.maxResponseMs) {
      runtimeViolations.push({ route, dimension: 'latency', blocking: false, evidence: `${elapsedMs}ms > ${rubric.runtime.maxResponseMs}ms at ${url}` })
    }
  } catch (err) {
    runtimeViolations.push({ route, dimension: 'availability', evidence: `fetch failed at ${url}: ${err.message}` })
  }
}

async function runPool(items, worker, size = 8) {
  const queue = [...items]
  const workers = Array.from({ length: size }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()
      if (item !== undefined) await worker(item)
    }
  })
  await Promise.all(workers)
}

const staticRoutes = inventory.filter((p) => !p.dynamic).map((p) => p.route)

if (!skipRuntime) {
  await runPool(staticRoutes, checkRoute, 8)
}

// ── Report ───────────────────────────────────────────────────────────────────
const blockingViolations = [
  ...paletteViolations,
  ...runtimeViolations.filter((v) => v.blocking !== false),
]
const advisoryViolations = runtimeViolations.filter((v) => v.blocking === false)

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  routesDiscovered: inventory.length,
  staticRoutesChecked: skipRuntime ? 0 : staticRoutes.length,
  paletteViolations: paletteViolations.length,
  availabilityViolations: runtimeViolations.filter((v) => v.dimension === 'availability').length,
  latencyWarnings: advisoryViolations.length,
  blockingViolations: blockingViolations.length,
  violations: [...blockingViolations, ...advisoryViolations],
}

fs.mkdirSync(path.dirname(path.join(ROOT, OUTPUT_JSON)), { recursive: true })
fs.writeFileSync(path.join(ROOT, OUTPUT_JSON), JSON.stringify(summary, null, 2))

console.log('Luxury page sentinel')
console.log(`- routes discovered: ${summary.routesDiscovered}`)
console.log(`- static routes checked at runtime: ${summary.staticRoutesChecked}`)
console.log(`- palette violations: ${summary.paletteViolations}`)
console.log(`- availability violations: ${summary.availabilityViolations}`)
console.log(`- latency warnings: ${summary.latencyWarnings}`)
for (const v of blockingViolations.slice(0, 50)) {
  console.log(`  [${v.dimension}] ${v.route} :: ${v.evidence}`)
}

// ── Slack alert ──────────────────────────────────────────────────────────────
const webhook = process.env.SLACK_WEBHOOK_URL
if (webhook && blockingViolations.length > 0) {
  const lines = blockingViolations.slice(0, 25).map((v) => `• [${v.dimension}] ${v.route} - ${v.evidence}`)
  const extra = blockingViolations.length > 25 ? `\n…and ${blockingViolations.length - 25} more` : ''
  const text = [
    `:rotating_light: Luxury page sentinel found ${blockingViolations.length} non-conforming page(s)`,
    `Base URL: ${BASE_URL}`,
    `Routes discovered: ${summary.routesDiscovered} | Palette: ${summary.paletteViolations} | Availability: ${summary.availabilityViolations}`,
    '',
    ...lines,
  ].join('\n') + extra
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    console.log(`slack alert: ${res.status}`)
  } catch (err) {
    console.error(`slack alert failed: ${err.message}`)
  }
}

if (blockingViolations.length > 0 && !reportOnly) {
  process.exitCode = 1
}
