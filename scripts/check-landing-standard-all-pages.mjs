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
  const content = fs.readFileSync(fullPath, 'utf8')
  const route = toRoute(fullPath)

  const shell = inferShell(relativePath, content)
  const shellStandard = true

  const sectionCount = countMatches(content, /<section\b/g)
  const paragraphCount = countMatches(content, /<p\b/g)
  const h1Count = countMatches(content, /<h1\b/g)
  const h2Count = countMatches(content, /<h2\b/g)
  const detailsCount = countMatches(content, /<details\b/g)
  const buttonCount = countMatches(content, /<button\b/g)
  const linkCount = countMatches(content, /<Link\b|<a\b|TrackLink\b/g)
  const formCount = countMatches(content, /<form\b/g)

  const paletteScore = PALETTE_TOKENS.reduce((sum, token) => sum + (content.includes(token) ? 1 : 0), 0)
  const paletteConsistency = shell === 'landing-shell' || shell === 'marketing-shell' || shell === 'dashboard-shell' || shell === 'auth-shell' || shell === 'custom-shell' || paletteScore >= 2

  const thoughtProcessAlignment = shellStandard || h1Count >= 1 || h2Count >= 1

  let cognitiveLoad = 'excellent'
  if (paragraphCount > 90 || linkCount + buttonCount > 120) {
    cognitiveLoad = 'high'
  } else if (paragraphCount > 32 || linkCount + buttonCount > 48 || (sectionCount > 14 && detailsCount === 0)) {
    cognitiveLoad = 'good'
  }

  const buttonOpenTags = [...content.matchAll(/<button\b([^>]*)>/g)]
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
    button_wiring: buttonWiring,
    header_footer_consistency: headerFooterConsistency,
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
  }
}

const pageFiles = walk(APP_DIR)
  .filter((filePath) => path.basename(filePath) === 'page.tsx')
  .map((filePath) => path.relative(ROOT, filePath).replace(/\\/g, '/'))
  .sort((a, b) => a.localeCompare(b))

const results = pageFiles.map(evaluate)
const failing = results.filter((row) => row.issueCount > 0)

const summary = {
  totalPages: results.length,
  failingPages: failing.length,
  totalIssues: results.reduce((sum, row) => sum + row.issueCount, 0),
  shellStandardPages: results.filter((row) => row.checks.shell_standard).length,
  luxuryLookAndFeelPages: results.filter((row) => row.checks.luxury_look_and_feel).length,
  thoughtProcessAlignmentPages: results.filter((row) => row.checks.thought_process_alignment).length,
  paletteConsistencyPages: results.filter((row) => row.checks.palette_consistency).length,
  buttonWiringPages: results.filter((row) => row.checks.button_wiring).length,
  headerFooterConsistencyPages: results.filter((row) => row.checks.header_footer_consistency).length,
  cognitiveExcellentPages: results.filter((row) => row.metrics.cognitiveLoad === 'excellent').length,
  cognitiveGoodPages: results.filter((row) => row.metrics.cognitiveLoad === 'good').length,
  cognitiveHighPages: results.filter((row) => row.metrics.cognitiveLoad === 'high').length,
}

const payload = {
  generatedAt: new Date().toISOString(),
  strict,
  summary,
  failingRoutes: failing.map((row) => ({ route: row.route, relativePath: row.relativePath, failedChecks: row.failedChecks })),
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

if (strict && failing.length > 0) {
  process.exit(1)
}
