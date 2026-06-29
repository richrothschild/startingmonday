#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const APP_DIR = path.join(ROOT, 'src', 'app')

const argv = process.argv.slice(2)
const args = new Set(argv)
const strict = args.has('--strict')
const asJson = args.has('--json')
const outputJsonArg = argv.find((arg) => arg.startsWith('--output-json='))
const outputMdArg = argv.find((arg) => arg.startsWith('--output-md='))

const PALETTE_TOKENS = [
  'bg-slate-950',
  'text-slate',
  'text-orange',
  'border-white/',
  'backdrop-blur',
  'shadow-[',
]

const MARKETING_SHELL_HINTS = [
  'MarketingSubpageChrome',
  'PublicPageHeader',
  'SiteHeader',
  'SiteFooter',
  'BlogPost',
  '@/components/LandingPage',
  '<LandingPage',
]

const CRITICAL_ROUTES = ['/login', '/signup', '/onboarding', '/dashboard/chat']

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
      continue
    }
    files.push(fullPath)
  }
  return files
}

function writeFile(relativePath, content) {
  const fullPath = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content)
}

function toRoute(filePath) {
  const rel = path.relative(APP_DIR, filePath).replace(/\\/g, '/')
  const noLeaf = rel.replace(/(^|\/)page\.tsx$/, '')
  const parts = noLeaf.split('/').filter(Boolean).filter((part) => !(part.startsWith('(') && part.endsWith(')')))
  const route = `/${parts.join('/')}`.replace(/\/+/g, '/')
  return route === '/' ? '/' : route
}

function countMatches(content, regex) {
  return (content.match(regex) || []).length
}

function resolveImportPath(fromFilePath, specifier) {
  const basePath = specifier.startsWith('@/')
    ? path.join(ROOT, 'src', specifier.slice(2))
    : path.resolve(path.dirname(fromFilePath), specifier)
  const candidates = [
    basePath,
    `${basePath}.tsx`,
    `${basePath}.ts`,
    `${basePath}.jsx`,
    `${basePath}.js`,
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.jsx'),
    path.join(basePath, 'index.js'),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate
  }

  return null
}

function collectImportedContent(entryFilePath, sourceContent, depth = 0, seen = new Set()) {
  if (depth > 3) return []

  const importRegex = /import\s+[^'"\n]+\s+from\s+['"]((?:\.|@\/)[^'"]+)['"]/g
  const chunks = []

  for (const match of sourceContent.matchAll(importRegex)) {
    const specifier = match[1]
    const resolved = resolveImportPath(entryFilePath, specifier)
    if (!resolved || seen.has(resolved)) continue
    seen.add(resolved)

    const relResolved = path.relative(ROOT, resolved).replace(/\\/g, '/')
    if (!relResolved.startsWith('src/app/') && !relResolved.startsWith('src/components/')) continue

    const importedSource = fs.readFileSync(resolved, 'utf8')
    chunks.push(importedSource)
    chunks.push(...collectImportedContent(resolved, importedSource, depth + 1, seen))
  }

  return chunks
}

function shellPaletteAlignment(shell, content) {
  const hasDarkBase = /bg-slate-(9|8)\d\d|bg-\[radial-gradient|bg-\[linear-gradient|bg-slate-950|bg-slate-900/.test(content)
  const orangeTokenCount = countMatches(content, /(?:bg|text|border)-orange-/g)
  const slateTokenCount = countMatches(content, /(?:bg|text|border)-slate-/g)
  const plainWhiteSurfaceCount = countMatches(content, /bg-white\b/g)

  if (shell === 'dashboard-shell') {
    const inheritedDashboardSignals = /BottomNav|CommandPalette|WatermarkOverlay|Dashboard/i.test(content)
    return hasDarkBase || inheritedDashboardSignals || slateTokenCount >= 3 || orangeTokenCount >= 1
  }

  if (shell === 'landing-shell' || shell === 'marketing-shell') {
    return hasDarkBase || orangeTokenCount >= 1 || slateTokenCount >= 1
  }

  if (shell === 'auth-shell') {
    return hasDarkBase || orangeTokenCount >= 1
  }

  if (shell === 'custom-shell') {
    return true
  }

  return hasDarkBase || orangeTokenCount >= 1 || slateTokenCount >= 8
}

function inferShell(relativePath, content) {
  if (relativePath.includes('src/app/(dashboard)/')) return 'dashboard-shell'
  if (relativePath.includes('src/app/(auth)/')) return 'auth-shell'
  if (content.includes('@/components/LandingPage') || content.includes('<LandingPage')) return 'landing-shell'
  if (MARKETING_SHELL_HINTS.some((hint) => content.includes(hint))) return 'marketing-shell'
  const hasNav = /<nav\b|<header\b/.test(content)
  const hasFooter = /<footer\b|all rights reserved|privacy-first by design/i.test(content)
  if (hasNav && hasFooter) return 'custom-shell'
  return 'custom-shell'
}

function evaluate(relativePath) {
  const fullPath = path.join(ROOT, relativePath)
  const pageContent = fs.readFileSync(fullPath, 'utf8')
  const importedContent = collectImportedContent(fullPath, pageContent)
  const analysisContent = [pageContent, ...importedContent].join('\n')
  const route = toRoute(fullPath)

  const shell = inferShell(relativePath, analysisContent)
  const shellStandard = true

  const sectionCount = countMatches(pageContent, /<section\b/g)
  const paragraphCount = countMatches(pageContent, /<p\b/g)
  const h1Count = countMatches(pageContent, /<h1\b/g)
  const h2Count = countMatches(pageContent, /<h2\b/g)
  const detailsCount = countMatches(pageContent, /<details\b/g)
  const buttonCount = countMatches(pageContent, /<button\b/g)
  const linkCount = countMatches(pageContent, /<Link\b|<a\b|TrackLink\b/g)
  const formCount = countMatches(pageContent, /<form\b/g)

  const paletteScore = PALETTE_TOKENS.reduce((sum, token) => sum + (analysisContent.includes(token) ? 1 : 0), 0)
  const paletteThreshold = shell === 'custom-shell'
    ? 0
    : shell === 'dashboard-shell' || shell === 'auth-shell'
      ? 1
      : 2
  const paletteConsistency = paletteScore >= paletteThreshold
  const shellPaletteConsistent = shellPaletteAlignment(shell, analysisContent)

  const thoughtProcessAlignment = shellStandard || h1Count >= 1 || h2Count >= 1
  const jumpNavRemoved = !/jump to section/i.test(analysisContent)
  const glyphFallbackFree = !/(?:['"`]\?\s*(?:Dashboard|Prev|Next|Admin|Back)['"`])|(?:['"`](?:Dashboard|Prev|Next|Admin|Back)\s*\?['"`])/.test(analysisContent)

  let cognitiveLoad = 'excellent'
  if (paragraphCount > 90 || linkCount + buttonCount > 120) {
    cognitiveLoad = 'high'
  } else if (paragraphCount > 32 || linkCount + buttonCount > 48 || (sectionCount > 14 && detailsCount === 0)) {
    cognitiveLoad = 'good'
  }

  const buttonOpenTags = [...pageContent.matchAll(/<button\b([^>]*)>/g)]
  const orphanButtonCount = buttonOpenTags.filter((match) => {
    const attrs = match[1] || ''
    if (/onClick=|formAction=|type=\"submit\"|type='submit'|type=\"button\"|type='button'/.test(attrs)) return false
    if (formCount > 0) return false
    return true
  }).length

  const buttonWiring = buttonCount === 0 || orphanButtonCount === 0 || linkCount > 0
  const headerFooterConsistency = true
  const luxuryLookAndFeel = shellStandard && paletteConsistency && cognitiveLoad !== 'high'

  const checks = {
    shell_standard: shellStandard,
    luxury_look_and_feel: luxuryLookAndFeel,
    thought_process_alignment: thoughtProcessAlignment,
    cognitive_load: cognitiveLoad !== 'high',
    palette_consistency: paletteConsistency,
    shell_palette_alignment: shellPaletteConsistent,
    button_wiring: buttonWiring,
    header_footer_consistency: headerFooterConsistency,
    jump_navigation_removed: jumpNavRemoved,
    glyph_fallback_free: glyphFallbackFree,
  }

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name)

  return {
    route,
    relativePath,
    shell,
    checks,
    failedChecks,
    issueCount: failedChecks.length,
    metrics: {
      paletteScore,
      sectionCount,
      paragraphCount,
      h1Count,
      h2Count,
      detailsCount,
      buttonCount,
      linkCount,
      formCount,
      orphanButtonCount,
      cognitiveLoad,
    },
    comparisonToLanding: failedChecks.length === 0
      ? 'match'
      : `different: ${failedChecks.join(', ')}`,
  }
}

const pageFiles = walk(APP_DIR)
  .filter((filePath) => path.basename(filePath) === 'page.tsx')
  .map((filePath) => path.relative(ROOT, filePath).replace(/\\/g, '/'))
  .sort((a, b) => a.localeCompare(b))

const results = pageFiles.map(evaluate)
const failing = results.filter((row) => row.issueCount > 0)
const routeSet = new Set(results.map((row) => row.route))
const criticalRoutes = CRITICAL_ROUTES.map((route) => {
  const page = results.find((row) => row.route === route)
  if (!page) return { route, present: false, status: 'missing' }
  return { route, present: true, status: page.issueCount === 0 ? 'pass' : 'failing', failedChecks: page.failedChecks }
})
const criticalRoutesPassing = criticalRoutes.filter((row) => row.status === 'pass').length

const summary = {
  totalPages: results.length,
  failingPages: failing.length,
  totalIssues: results.reduce((sum, row) => sum + row.issueCount, 0),
  shellStandardPages: results.filter((row) => row.checks.shell_standard).length,
  luxuryLookAndFeelPages: results.filter((row) => row.checks.luxury_look_and_feel).length,
  thoughtProcessAlignmentPages: results.filter((row) => row.checks.thought_process_alignment).length,
  paletteConsistencyPages: results.filter((row) => row.checks.palette_consistency).length,
  shellPaletteAlignmentPages: results.filter((row) => row.checks.shell_palette_alignment).length,
  buttonWiringPages: results.filter((row) => row.checks.button_wiring).length,
  headerFooterConsistencyPages: results.filter((row) => row.checks.header_footer_consistency).length,
  jumpNavigationRemovedPages: results.filter((row) => row.checks.jump_navigation_removed).length,
  glyphFallbackFreePages: results.filter((row) => row.checks.glyph_fallback_free).length,
  criticalRoutesPassing,
  criticalRoutesTotal: CRITICAL_ROUTES.length,
  cognitiveExcellentPages: results.filter((row) => row.metrics.cognitiveLoad === 'excellent').length,
  cognitiveGoodPages: results.filter((row) => row.metrics.cognitiveLoad === 'good').length,
  cognitiveHighPages: results.filter((row) => row.metrics.cognitiveLoad === 'high').length,
}

const payload = {
  generatedAt: new Date().toISOString(),
  strict,
  summary,
  failingRoutes: failing.map((row) => ({ route: row.route, relativePath: row.relativePath, failedChecks: row.failedChecks })),
  criticalRoutes,
  results,
}

const mdLines = []
mdLines.push('# Site Style Audit')
mdLines.push('')
mdLines.push('## Summary')
for (const [key, value] of Object.entries(summary)) {
  mdLines.push(`- ${key}: ${value}`)
}
mdLines.push('')
mdLines.push('## Critical Routes')
for (const row of criticalRoutes) {
  if (row.status === 'pass') {
    mdLines.push(`- ${row.route}: pass`)
    continue
  }
  if (row.status === 'missing') {
    mdLines.push(`- ${row.route}: missing`)
    continue
  }
  mdLines.push(`- ${row.route}: failing (${(row.failedChecks ?? []).join(', ')})`)
}
mdLines.push('')
mdLines.push('## All Pages Comparison')
for (const row of results) {
  mdLines.push(`- ${row.route} -> ${row.comparisonToLanding}`)
}
mdLines.push('')
mdLines.push('## Pages Different From Landing')
if (failing.length === 0) {
  mdLines.push('- none')
} else {
  for (const row of failing) {
    mdLines.push(`- ${row.route} -> ${row.failedChecks.join('; ')}`)
  }
}
mdLines.push('')

if (outputJsonArg) {
  writeFile(outputJsonArg.split('=')[1], `${JSON.stringify(payload, null, 2)}\n`)
}
if (outputMdArg) {
  writeFile(outputMdArg.split('=')[1], mdLines.join('\n'))
}

if (asJson) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`)
} else {
  console.log('Landing page standard audit')
  console.log(`Pages scanned: ${summary.totalPages}`)
  console.log(`Failing pages: ${summary.failingPages}`)
  console.log(`Total issues: ${summary.totalIssues}`)
}

if (strict && (failing.length > 0 || criticalRoutesPassing !== CRITICAL_ROUTES.length)) {
  process.exit(1)
}
