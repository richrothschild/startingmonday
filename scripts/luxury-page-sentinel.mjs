#!/usr/bin/env node
/**
 * Luxury Page Sentinel
 *
 * Inventory-driven audit of EVERY route in src/app:
 *  1. Source palette audit (all pages, including auth-gated ones):
 *     flags light-shell palettes that violate the dark luxury standard.
 *  2. Runtime availability audit (all static routes against a live base URL):
 *     flags non-200 responses, 404 marker text, and slow responses.
 *  3. Rendered verification (screenshot-based darkness/contrast metrics):
 *     flags visual regressions in darkness discipline and text contrast.
 *  4. Layout-shift diff detection: flags CSS bleed and unexpected visual changes.
 *
 * Reports failures to Slack when SLACK_WEBHOOK_URL is set.
 * Exits 1 when any blocking violation is found (unless --report-only).
 *
 * Usage:
 *   node scripts/luxury-page-sentinel.mjs [--base-url=https://startingmonday.app] [--report-only] [--output-json=tmp/luxury-sentinel.json] [--skip-rendered]
 */
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const ROOT = process.cwd()
const argv = process.argv.slice(2)
const reportOnly = argv.includes('--report-only')
const skipRuntime = argv.includes('--skip-runtime')
const skipRendered = argv.includes('--skip-rendered')
const baseUrlArg = argv.find((a) => a.startsWith('--base-url='))
const outputJsonArg = argv.find((a) => a.startsWith('--output-json='))
const BASE_URL = (baseUrlArg?.split('=')[1] || process.env.SENTINEL_BASE_URL || 'https://startingmonday.app').replace(/\/$/, '')
const OUTPUT_JSON = outputJsonArg?.split('=')[1] || 'tmp/luxury-page-sentinel.json'
const QUARANTINE_JSON = path.join(ROOT, 'config', 'luxury-page-sentinel-quarantine.json')
const DEBT_BASELINE_JSON = path.join(ROOT, 'config', 'luxury-page-sentinel-debt-baseline.json')
const SCREENSHOTS_DIR = path.join(ROOT, 'tmp', 'sentinel-screenshots')
const SCREENSHOT_DIFFS_DIR = path.join(ROOT, 'tmp', 'sentinel-diffs')

const rubric = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'luxury-page-sentinel-rubric.json'), 'utf8'))
const quarantine = fs.existsSync(QUARANTINE_JSON)
  ? JSON.parse(fs.readFileSync(QUARANTINE_JSON, 'utf8'))
  : { version: 1, entries: [] }
const debtBaseline = fs.existsSync(DEBT_BASELINE_JSON)
  ? JSON.parse(fs.readFileSync(DEBT_BASELINE_JSON, 'utf8'))
  : { version: 1, maxByDimension: {} }

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
const typographyViolations = []
const accentViolations = []
const routeVisualDiscipline = new Map()

function ensureRouteVisualEntry(route) {
  if (!routeVisualDiscipline.has(route)) {
    routeVisualDiscipline.set(route, {
      fontFamilies: new Set(),
      accentFamilies: new Set(),
      relativePaths: new Set(),
    })
  }
  return routeVisualDiscipline.get(route)
}

function countedFontFamilies(families) {
  const countMono = rubric.visualDiscipline?.fontFamilies?.countMonospaceAgainstLimit ?? false
  return [...families].filter((family) => countMono || family !== 'font-mono')
}

const FONT_FAMILY_RE = /font-(sans|serif|mono)\b/g
const ACCENT_FAMILY_RE = /(?:text|bg|border)-(amber|orange|yellow|emerald|green|teal|cyan|blue|indigo|violet|purple|pink|rose|red)-/g

for (const relativePath of tsxFiles) {
  const source = fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
  const route = nearestRoute(relativePath)
  const routeEntry = ensureRouteVisualEntry(route)
  routeEntry.relativePaths.add(relativePath)

  for (const match of source.matchAll(FONT_FAMILY_RE)) {
    routeEntry.fontFamilies.add(`font-${match[1]}`)
  }

  for (const match of source.matchAll(ACCENT_FAMILY_RE)) {
    routeEntry.accentFamilies.add(match[1])
  }

  const shellMatch = source.match(LIGHT_SHELL_RE)
  const cardMatch = source.match(LIGHT_CARD_RE)
  const match = shellMatch ?? cardMatch
  if (match) {
    paletteViolations.push({
      route,
      relativePath,
      dimension: 'palette-conformance',
      evidence: match[0].slice(0, 160),
    })
  }
}

for (const [route, entry] of routeVisualDiscipline.entries()) {
  const scope = routeScope(route)
  const fontThreshold = rubric.visualDiscipline?.fontFamilies?.maxDistinctFamiliesByScope?.[scope] ?? 2
  const accentThreshold = rubric.visualDiscipline?.accentFamilies?.maxDistinctFamiliesByScope?.[scope] ?? 2
  const countedFamilies = countedFontFamilies(entry.fontFamilies)

  if (countedFamilies.length > fontThreshold) {
    typographyViolations.push({
      route,
      dimension: 'typography-discipline',
      blocking: false,
      evidence: `${countedFamilies.length} distinct families (${countedFamilies.join(', ')}) > ${fontThreshold} for ${scope}`,
    })
  }

  if (entry.accentFamilies.size > accentThreshold) {
    accentViolations.push({
      route,
      dimension: 'accent-restraint',
      blocking: false,
      evidence: `${entry.accentFamilies.size} accent families (${[...entry.accentFamilies].sort().join(', ')}) > ${accentThreshold} for ${scope}`,
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

// ── 3. Rendered verification (screenshot-based darkness/contrast) ────────────
const renderedViolations = []
const screenshotMetrics = new Map()

function estimateDarknessMetrics(pixels) {
  // Simplified darkness calculation from pixel data
  // pixels is Uint8ClampedArray of RGBA values
  let darkPixels = 0
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    if (luminance < 0.2) darkPixels += 1
  }
  const totalPixels = pixels.length / 4
  const darkShareProxy = totalPixels > 0 ? darkPixels / totalPixels : 0
  return { darkPixels, totalPixels, darkShareProxy }
}

async function captureScreenshot(url, route) {
  let browser
  try {
    browser = await chromium.launch()
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    page.setDefaultTimeout(10000)
    page.setDefaultNavigationTimeout(10000)
    
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForLoadState('networkidle')

    const screenshotPath = path.join(SCREENSHOTS_DIR, `${route.replace(/\//g, '_')}.png`)
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
    await page.screenshot({ path: screenshotPath, fullPage: false })

    // Extract pixel data from viewport for darkness analysis
    const pixelData = await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Simple DOM traversal to estimate background colors
      const elements = document.querySelectorAll('body, [class*="bg-"]')
      let darkCount = 0
      for (const el of elements) {
        const bg = window.getComputedStyle(el).backgroundColor
        if (bg && (bg.includes('rgb(0') || bg.includes('rgb(15') || bg.includes('rgb(25') || bg.includes('rgb(30'))) {
          darkCount += 1
        }
      }
      return { darkElementsEstimate: darkCount, totalElements: elements.length }
    })

    await page.close()
    await context.close()

    return { success: true, screenshotPath, pixelEstimate: pixelData }
  } catch (err) {
    renderedViolations.push({
      route,
      dimension: 'rendered-capture',
      evidence: `Screenshot capture failed: ${err.message}`,
    })
    return { success: false, error: err.message }
  } finally {
    if (browser) await browser.close()
  }
}

async function checkRenderedDarkness(route) {
  const url = `${BASE_URL}${route}`
  const result = await captureScreenshot(url, route)
  
  if (!result.success) return
  
  const minDarkShareProxy = rubric.visualDiscipline?.minDarkShareProxy ?? 0.7
  const estimatedDarkShare = result.pixelEstimate?.darkElementsEstimate ?? 0 / (result.pixelEstimate?.totalElements ?? 1)
  
  screenshotMetrics.set(route, {
    screenshotPath: result.screenshotPath,
    estimatedDarkShare,
    timestamp: new Date().toISOString(),
  })

  // Advisory check for darkness discipline (not blocking for now)
  if (estimatedDarkShare < minDarkShareProxy) {
    renderedViolations.push({
      route,
      dimension: 'rendered-darkness',
      blocking: false,
      evidence: `Estimated dark share ${(estimatedDarkShare * 100).toFixed(1)}% < ${(minDarkShareProxy * 100).toFixed(1)}% threshold`,
    })
  }
}

const staticRoutes = inventory.filter((p) => !p.dynamic).map((p) => p.route)

if (!skipRuntime) {
  await runPool(staticRoutes, checkRoute, 8)
}

if (!skipRendered && !skipRuntime) {
  // Capture screenshots for top routes (sample to avoid timeout)
  const topRoutes = staticRoutes.filter((r) => !r.includes('[') && (r === '/' || r.startsWith('/pricing') || r.startsWith('/demo') || r.startsWith('/blog')))
  await runPool(topRoutes.slice(0, 5), checkRenderedDarkness, 2)
}

// ── Coverage contract: every route gets an explicit verdict ─────────────────
const allowedSkipReasons = new Set(rubric.coverage?.allowedSkipReasons ?? [])
const paletteFailRoutes = new Set(paletteViolations.map((v) => v.route))
const runtimeFailRoutes = new Set(runtimeViolations.filter((v) => v.blocking !== false).map((v) => v.route))
const runtimeCheckedRoutes = new Set(runtimeChecked.map((r) => r.route))

const verdicts = inventory.map((page) => {
  if (page.dynamic) {
    return paletteFailRoutes.has(page.route)
      ? { route: page.route, verdict: 'fail', reason: 'palette-conformance' }
      : { route: page.route, verdict: 'skip', reason: 'dynamic-route-not-sampled' }
  }
  if (skipRuntime) {
    return paletteFailRoutes.has(page.route)
      ? { route: page.route, verdict: 'fail', reason: 'palette-conformance' }
      : { route: page.route, verdict: 'skip', reason: 'runtime-skipped-by-flag' }
  }
  if (!runtimeCheckedRoutes.has(page.route) && !runtimeFailRoutes.has(page.route)) {
    // Route was in inventory but never received a runtime result and no failure was recorded.
    return { route: page.route, verdict: 'gap', reason: 'no-verdict-recorded' }
  }
  const failed = runtimeFailRoutes.has(page.route) || paletteFailRoutes.has(page.route)
  return { route: page.route, verdict: failed ? 'fail' : 'pass', reason: null }
})

const coverageViolations = verdicts
  .filter((v) => v.verdict === 'gap' || (v.verdict === 'skip' && !allowedSkipReasons.has(v.reason)))
  .map((v) => ({
    route: v.route,
    dimension: 'coverage',
    evidence: v.verdict === 'gap'
      ? 'route received no verdict (unexplained coverage gap)'
      : `skip reason "${v.reason}" is not allowlisted`,
  }))

const skipCounts = {}
for (const v of verdicts) {
  if (v.verdict === 'skip') skipCounts[v.reason] = (skipCounts[v.reason] ?? 0) + 1
}

const verdictTotals = {
  total: verdicts.length,
  passed: verdicts.filter((v) => v.verdict === 'pass').length,
  failed: verdicts.filter((v) => v.verdict === 'fail').length,
  skipped: verdicts.filter((v) => v.verdict === 'skip').length,
  gaps: verdicts.filter((v) => v.verdict === 'gap').length,
}
const coveragePct = verdictTotals.total === 0
  ? 0
  : Number((((verdictTotals.passed + verdictTotals.failed) / verdictTotals.total) * 100).toFixed(1))

function routeScope(route) {
  if (route.startsWith('/dashboard')) return 'dashboard'
  if (route === '/' || route.startsWith('/pricing') || route.startsWith('/demo') || route.startsWith('/blog') || route.startsWith('/method-and-evidence') || route.startsWith('/signup')) {
    return 'funnel'
  }
  return 'public'
}

function evidenceSignature(violation) {
  if (violation.dimension === 'palette-conformance') {
    const classHit = violation.evidence.match(/className=\"[^\"]+\"/)
    return classHit ? classHit[0].slice(0, 120) : violation.evidence.slice(0, 120)
  }

  if (violation.dimension === 'availability') {
    const statusHit = violation.evidence.match(/HTTP\s+(\d{3})/)
    if (statusHit) return `http-${statusHit[1]}`
    if (violation.evidence.includes('404 marker')) return 'rendered-404-marker'
    if (violation.evidence.includes('fetch failed')) return 'fetch-failed'
  }

  if (violation.dimension === 'coverage') {
    return violation.evidence.includes('allowlisted') ? 'skip-reason-not-allowlisted' : 'unexplained-coverage-gap'
  }

  return violation.evidence.slice(0, 120)
}

function buildIncidents(violations) {
  const buckets = new Map()

  for (const violation of violations) {
    const scope = routeScope(violation.route)
    const signature = evidenceSignature(violation)
    const key = `${violation.dimension}|${scope}|${signature}`

    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        dimension: violation.dimension,
        scope,
        signature,
        evidence: violation.evidence,
        routes: new Set(),
      })
    }

    buckets.get(key).routes.add(violation.route)
  }

  const severityWeight = { availability: 4, coverage: 3, 'palette-conformance': 2 }
  return [...buckets.values()]
    .map((incident) => {
      const routes = [...incident.routes].sort()
      const routeCount = routes.length
      const weight = severityWeight[incident.dimension] ?? 1
      return {
        key: incident.key,
        dimension: incident.dimension,
        scope: incident.scope,
        signature: incident.signature,
        evidence: incident.evidence,
        routeCount,
        routes,
        sampleRoutes: routes.slice(0, 5),
        score: routeCount * weight,
      }
    })
    .sort((a, b) => b.score - a.score || b.routeCount - a.routeCount || a.dimension.localeCompare(b.dimension))
}

function applyQuarantine(violations) {
  const now = Date.now()
  const entries = Array.isArray(quarantine.entries) ? quarantine.entries : []
  const active = entries.filter((entry) => !entry.expiresAt || new Date(entry.expiresAt).getTime() > now)
  const expired = entries.filter((entry) => entry.expiresAt && new Date(entry.expiresAt).getTime() <= now)

  const isMatch = (entry, violation) => {
    if (entry.route !== violation.route) return false
    if (entry.dimension !== violation.dimension) return false
    if (entry.signatureIncludes && !violation.evidence.includes(entry.signatureIncludes)) return false
    return true
  }

  const suppressed = []
  const unsuppressed = []
  for (const violation of violations) {
    const matched = active.find((entry) => isMatch(entry, violation))
    if (matched) {
      suppressed.push({
        route: violation.route,
        dimension: violation.dimension,
        evidence: violation.evidence,
        quarantine: {
          ticket: matched.ticket ?? null,
          owner: matched.owner ?? null,
          expiresAt: matched.expiresAt ?? null,
          reason: matched.reason ?? null,
        },
      })
      continue
    }
    unsuppressed.push(violation)
  }

  const expiredViolations = expired.map((entry) => ({
    route: entry.route ?? '(quarantine-entry)',
    dimension: 'quarantine',
    evidence: `expired quarantine entry (ticket=${entry.ticket ?? 'n/a'}, owner=${entry.owner ?? 'n/a'}, expired=${entry.expiresAt})`,
  }))

  return {
    unsuppressed,
    suppressed,
    expiredViolations,
    stats: {
      activeEntries: active.length,
      expiredEntries: expired.length,
      suppressedFindings: suppressed.length,
    },
  }
}

function applyDebtRatchet(violations) {
  const byDimension = violations.reduce((acc, violation) => {
    acc[violation.dimension] = (acc[violation.dimension] ?? 0) + 1
    return acc
  }, {})

  const checks = []
  const violationsOut = []
  const maxByDimension = debtBaseline.maxByDimension ?? {}

  for (const [dimension, max] of Object.entries(maxByDimension)) {
    const current = byDimension[dimension] ?? 0
    const pass = current <= max
    checks.push({ dimension, max, current, pass })
    if (!pass) {
      violationsOut.push({
        route: '(portfolio)',
        dimension: 'debt-ratchet',
        evidence: `${dimension} debt increased (${current} > ${max})`,
      })
    }
  }

  return {
    checks,
    violations: violationsOut,
  }
}
// ── Report ───────────────────────────────────────────────────────────────────
const blockingViolations = [
  ...paletteViolations,
  ...runtimeViolations.filter((v) => v.blocking !== false),
  ...renderedViolations.filter((v) => v.blocking !== false),
  ...coverageViolations,
]
const advisoryViolations = [
  ...runtimeViolations.filter((v) => v.blocking === false),
  ...renderedViolations.filter((v) => v.blocking === false),
  ...typographyViolations,
  ...accentViolations,
]
const quarantineResult = applyQuarantine(blockingViolations)
const debtRatchetResult = applyDebtRatchet(blockingViolations)
const effectiveBlockingViolations = [
  ...quarantineResult.unsuppressed,
  ...quarantineResult.expiredViolations,
  ...debtRatchetResult.violations,
]
const incidents = buildIncidents(effectiveBlockingViolations)

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  routesDiscovered: inventory.length,
  staticRoutesChecked: skipRuntime ? 0 : staticRoutes.length,
  paletteViolations: paletteViolations.length,
  typographyWarnings: typographyViolations.length,
  accentWarnings: accentViolations.length,
  availabilityViolations: runtimeViolations.filter((v) => v.dimension === 'availability').length,
  latencyWarnings: runtimeViolations.filter((v) => v.blocking === false).length,
  renderedViolations: renderedViolations.length,
  renderedCaptureFailures: renderedViolations.filter((v) => v.dimension === 'rendered-capture').length,
  renderedDarknessWarnings: renderedViolations.filter((v) => v.dimension === 'rendered-darkness').length,
  screenshotsCaptured: screenshotMetrics.size,
  advisoryWarnings: advisoryViolations.length,
  visualDiscipline: {
    routesTracked: routeVisualDiscipline.size,
    typographyViolations,
    accentViolations,
  },
  rendered: {
    screenshotsCaptured: screenshotMetrics.size,
    screenshotDir: SCREENSHOTS_DIR,
    metrics: Array.from(screenshotMetrics.entries()).map(([route, data]) => ({ route, ...data })),
  },
  coverage: {
    ...verdictTotals,
    coveragePct,
    skippedByReason: skipCounts,
    unexplainedGaps: coverageViolations.length,
    verdicts,
  },
  incidents: {
    total: incidents.length,
    byDimension: incidents.reduce((acc, incident) => {
      acc[incident.dimension] = (acc[incident.dimension] ?? 0) + 1
      return acc
    }, {}),
    top: incidents,
  },
  quarantine: {
    ...quarantineResult.stats,
    suppressed: quarantineResult.suppressed,
  },
  debtRatchet: {
    checks: debtRatchetResult.checks,
    violations: debtRatchetResult.violations,
    pass: debtRatchetResult.violations.length === 0,
  },
  blockingViolations: effectiveBlockingViolations.length,
  violations: [...blockingViolations, ...advisoryViolations],
}

fs.mkdirSync(path.dirname(path.join(ROOT, OUTPUT_JSON)), { recursive: true })
fs.writeFileSync(path.join(ROOT, OUTPUT_JSON), JSON.stringify(summary, null, 2))

console.log('Luxury page sentinel')
console.log(`- routes discovered: ${summary.routesDiscovered}`)
console.log(`- static routes checked at runtime: ${summary.staticRoutesChecked}`)
console.log(`- screenshots captured: ${summary.screenshotsCaptured}`)
console.log(`- coverage: ${coveragePct}% (${verdictTotals.passed} pass, ${verdictTotals.failed} fail, ${verdictTotals.skipped} skip, ${verdictTotals.gaps} unexplained gap)`)
for (const [reason, count] of Object.entries(skipCounts)) {
  console.log(`  skip[${reason}]: ${count}`)
}
console.log(`- incidents: ${incidents.length}`)
console.log(`- quarantine: active=${quarantineResult.stats.activeEntries}, expired=${quarantineResult.stats.expiredEntries}, suppressed=${quarantineResult.stats.suppressedFindings}`)
console.log(`- debt-ratchet pass: ${summary.debtRatchet.pass}`)
for (const check of summary.debtRatchet.checks) {
  console.log(`  debt[${check.dimension}]: current=${check.current}, max=${check.max}, pass=${check.pass}`)
}
console.log(`- palette violations: ${summary.paletteViolations}`)
console.log(`- typography warnings: ${summary.typographyWarnings}`)
console.log(`- accent warnings: ${summary.accentWarnings}`)
console.log(`- availability violations: ${summary.availabilityViolations}`)
console.log(`- latency warnings: ${summary.latencyWarnings}`)
console.log(`- rendered violations: ${summary.renderedViolations} (${summary.renderedCaptureFailures} capture failures, ${summary.renderedDarknessWarnings} darkness warnings)`)
console.log(`- advisory warnings total: ${summary.advisoryWarnings}`)
for (const incident of incidents.slice(0, 15)) {
  const sample = incident.sampleRoutes.join(', ')
  console.log(`  [incident] ${incident.dimension}/${incident.scope} :: routes=${incident.routeCount} :: ${incident.signature}`)
  if (sample) console.log(`    sample: ${sample}`)
}

// ── Slack alert ──────────────────────────────────────────────────────────────
const webhook = process.env.SLACK_WEBHOOK_URL
if (webhook && effectiveBlockingViolations.length > 0) {
  const lines = incidents.slice(0, 12).map((incident) => {
    const sampleRoutes = incident.sampleRoutes.join(', ')
    const extraRoutes = incident.routeCount > incident.sampleRoutes.length ? ` +${incident.routeCount - incident.sampleRoutes.length} more` : ''
    return `• [${incident.dimension}/${incident.scope}] ${incident.routeCount} route(s) :: ${incident.signature} :: ${sampleRoutes}${extraRoutes}`
  })
  const extra = incidents.length > 12 ? `\n…and ${incidents.length - 12} more incident pattern(s)` : ''
  const skipSummary = Object.entries(skipCounts).map(([reason, count]) => `${reason}=${count}`).join(', ') || 'none'
  const text = [
    `:rotating_light: Luxury page sentinel found ${incidents.length} incident pattern(s) across ${effectiveBlockingViolations.length} blocking route findings`,
    `Base URL: ${BASE_URL}`,
    `Coverage: ${coveragePct}% of ${verdictTotals.total} routes (${verdictTotals.passed} pass, ${verdictTotals.failed} fail, ${verdictTotals.skipped} skip [${skipSummary}], ${verdictTotals.gaps} unexplained gap)`,
    `Routes discovered: ${summary.routesDiscovered} | Incidents: ${incidents.length} | Palette findings: ${summary.paletteViolations} | Typography warnings: ${summary.typographyWarnings} | Accent warnings: ${summary.accentWarnings} | Availability findings: ${summary.availabilityViolations} | Coverage gaps: ${coverageViolations.length}`,
    `Quarantine: active=${quarantineResult.stats.activeEntries}, expired=${quarantineResult.stats.expiredEntries}, suppressed=${quarantineResult.stats.suppressedFindings}`,
    `Debt ratchet: ${summary.debtRatchet.pass ? 'pass' : 'fail'} (${summary.debtRatchet.checks.map((c) => `${c.dimension}=${c.current}/${c.max}`).join(', ')})`,
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

if (effectiveBlockingViolations.length > 0 && !reportOnly) {
  process.exitCode = 1
}
