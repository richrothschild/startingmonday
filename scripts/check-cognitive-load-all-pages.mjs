#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const APP_DIR = path.join(ROOT, 'src', 'app')
const args = new Set(process.argv.slice(2))
const asJson = args.has('--json')
const strict = args.has('--strict')

const LINK_OR_BUTTON_RE = /<(TrackLink|Link|a|button)\b[\s\S]*?>([\s\S]*?)<\/(TrackLink|Link|a|button)>/g

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

function toRouteAndRel(filePath) {
  const rel = path.relative(APP_DIR, filePath).replace(/\\/g, '/')
  const segments = rel.split('/')
  segments.pop()
  const routeSegments = segments.filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')))
  const route = `/${routeSegments.join('/')}`.replace(/\/+/g, '/')
  return {
    rel: `src/app/${rel}`,
    route: route === '/' ? '/' : route,
  }
}

function isPublicRoute(rel) {
  const appRelative = rel.replace(/^src\/app\//, '')
  if (appRelative.startsWith('(dashboard)/')) return false
  if (appRelative.startsWith('(auth)/')) return false
  if (appRelative.startsWith('api/')) return false
  if (appRelative.startsWith('mark-review/')) return false
  if (appRelative.startsWith('partners/mauricio-kickoff/')) return false
  if (appRelative.startsWith('mauricio-kickoff')) return false
  return true
}

function normalizeText(raw) {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]+\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordCount(text) {
  const words = text.match(/[A-Za-z0-9']+/g)
  return words ? words.length : 0
}

function sentenceSplit(text) {
  return text
    .split(/[.!?]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function evaluateFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath)
  const content = fs.readFileSync(fullPath, 'utf8')

  const paragraphCount = (content.match(/<p\b/g) || []).length
  const headingCount = (content.match(/<h[1-3]\b/g) || []).length
  const detailsCount = (content.match(/<details\b/g) || []).length

  const allText = normalizeText(content)
  const totalWords = wordCount(allText)
  const sentences = sentenceSplit(allText)
  const avgSentenceWords = sentences.length > 0 ? totalWords / sentences.length : 0

  const paragraphBodies = [...content.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => normalizeText(m[1] || ''))
  const longParagraphCount = paragraphBodies.filter((p) => wordCount(p) > 120).length

  const ctaLabels = []
  for (const match of content.matchAll(LINK_OR_BUTTON_RE)) {
    const label = normalizeText(match[2] || '')
    if (!label) continue
    if (/(start|view|open|see|watch|learn|request|choose|try|sign up|get started|read|book|explore|review)/i.test(label)) {
      ctaLabels.push(label)
    }
  }

  const ctaCount = ctaLabels.length
  const repeated = new Map()
  for (const label of ctaLabels) {
    repeated.set(label, (repeated.get(label) || 0) + 1)
  }
  const repeatedCtas = [...repeated.entries()].filter(([, count]) => count > 3)

  const issues = []
  if (avgSentenceWords > 28) {
    issues.push(`avg-sentence-too-dense: ${avgSentenceWords.toFixed(1)} words`)
  }
  if (longParagraphCount > 6) {
    issues.push(`too-many-long-paragraphs: ${longParagraphCount}`)
  }
  if (ctaCount > 18) {
    issues.push(`too-many-concurrent-ctas: ${ctaCount}`)
  }
  if (repeatedCtas.length > 0) {
    issues.push(`repeated-cta-labels: ${repeatedCtas.map(([label, count]) => `${label} (${count}x)`).join(', ')}`)
  }
  if (headingCount > 0 && paragraphCount / headingCount > 12) {
    issues.push(`weak-chunking-paragraph-to-heading-ratio: ${(paragraphCount / headingCount).toFixed(1)}`)
  }
  if (paragraphCount > 24 && detailsCount === 0) {
    issues.push('high-density-without-progressive-disclosure')
  }

  const { route } = toRouteAndRel(fullPath)
  return {
    route,
    relativePath,
    metrics: {
      totalWords,
      sentenceCount: sentences.length,
      avgSentenceWords: Number(avgSentenceWords.toFixed(1)),
      paragraphCount,
      headingCount,
      detailsCount,
      longParagraphCount,
      ctaCount,
    },
    issues,
    issueCount: issues.length,
  }
}

const pageFiles = walk(APP_DIR)
  .filter((filePath) => path.basename(filePath) === 'page.tsx')
  .map((filePath) => path.relative(ROOT, filePath).replace(/\\/g, '/'))
  .filter((relativePath) => isPublicRoute(relativePath))

const results = pageFiles.map(evaluateFile)
const failures = results.filter((r) => r.issueCount > 0)

const output = {
  generatedAt: new Date().toISOString(),
  mode: strict ? 'strict' : 'report',
  totalPages: results.length,
  pagesWithIssues: failures.length,
  totalIssues: results.reduce((sum, row) => sum + row.issueCount, 0),
  topFindings: failures
    .sort((a, b) => b.issueCount - a.issueCount || a.route.localeCompare(b.route))
    .slice(0, 20),
  pages: results,
}

if (asJson) {
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)
} else {
  console.log('Cognitive load gate (all public pages)')
  console.log(`Pages scanned: ${output.totalPages}`)
  console.log(`Pages with issues: ${output.pagesWithIssues}`)
  console.log(`Total issues: ${output.totalIssues}`)

  if (output.topFindings.length > 0) {
    console.log('Top findings:')
    for (const row of output.topFindings) {
      console.log(`- ${row.route} (${row.issueCount})`)
      for (const issue of row.issues) {
        console.log(`  - ${issue}`)
      }
    }
  }
}

if (strict && failures.length > 0) {
  process.exitCode = 1
}
