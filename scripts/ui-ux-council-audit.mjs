import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const APP_DIR = path.join(ROOT, 'src', 'app')
const OUT_MD = path.join(ROOT, 'docs', 'ui-ux-synthetic-council-audit-2026-05-21.md')
const OUT_CSV = path.join(ROOT, 'docs', 'ui-ux-page-scores-2026-05-21.csv')

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walk(full))
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      out.push(full)
    }
  }
  return out
}

function toRoute(filePath) {
  let rel = path.relative(APP_DIR, filePath).replace(/\\/g, '/')
  if (rel === 'page.tsx') return '/'
  rel = rel.replace(/\/page\.tsx$/, '')
  const segments = rel.split('/').filter(Boolean).filter((s) => !(s.startsWith('(') && s.endsWith(')')))
  const route = '/' + segments.join('/')
  return route === '/' ? '/' : route
}

function classifyRoute(route) {
  if (route.startsWith('/(dashboard)') || route.startsWith('/dashboard') || route.startsWith('/settings')) return 'dashboard'
  if (route.startsWith('/api')) return 'api'
  if (route.startsWith('/blog')) return 'blog'
  if (route === '/privacy' || route === '/terms' || route === '/security' || route.startsWith('/unsubscribe')) return 'legal'
  if (route.startsWith('/login') || route.startsWith('/signup') || route.startsWith('/auth')) return 'auth'
  if (route.includes('/admin')) return 'admin'
  return 'marketing'
}

function count(re, text) {
  const m = text.match(re)
  return m ? m.length : 0
}

function hasAny(reList, text) {
  return reList.some((re) => re.test(text))
}

function lineCountOf(text) {
  return text.split(/\r?\n/).length
}

function getDisclosureMetrics(source) {
  const lines = source.split(/\r?\n/)
  const stack = []
  let disclosureCount = 0
  let collapsedDisclosureCount = 0
  let collapsedDisclosureLineCount = 0
  let expandedDisclosureLineCount = 0
  let collapsedParagraphCount = 0
  let expandedParagraphCount = 0

  function hasStaticOpen(attrs) {
    if (/\bopen\b(?!\s*=)/.test(attrs)) return true
    if (/\bopen\s*=\s*("open"|'open')/.test(attrs)) return true
    if (/\bopen\s*=\s*{\s*true\s*}/.test(attrs)) return true
    return false
  }

  for (const line of lines) {
    const openMatches = Array.from(line.matchAll(/<details\b([^>]*)>/g))
    for (const match of openMatches) {
      const attrs = match[1] ?? ''
      const hasOpenAttr = hasStaticOpen(attrs)
      stack.push(hasOpenAttr)
      disclosureCount += 1
      if (!hasOpenAttr) collapsedDisclosureCount += 1
    }

    const pCount = count(/<p\b/g, line)
    if (stack.length > 0) {
      if (stack.some(Boolean)) {
        expandedDisclosureLineCount += 1
        expandedParagraphCount += pCount
      } else {
        collapsedDisclosureLineCount += 1
        collapsedParagraphCount += pCount
      }
    }

    const closeMatches = line.match(/<\/details>/g)
    const closeCount = closeMatches ? closeMatches.length : 0
    for (let i = 0; i < closeCount && stack.length > 0; i += 1) {
      stack.pop()
    }
  }

  return {
    disclosureCount,
    collapsedDisclosureCount,
    collapsedDisclosureLineCount,
    expandedDisclosureLineCount,
    collapsedParagraphCount,
    expandedParagraphCount,
  }
}

function scorePage({ route, file, source }) {
  const lineCount = source.split(/\r?\n/).length
  const disclosure = getDisclosureMetrics(source)
  const effectiveLineCount = Math.max(
    0,
    Math.round(lineCount - disclosure.collapsedDisclosureLineCount * 0.65)
  )
  const sectionCount = count(/<section\b/g, source)
  const heading1Count = count(/<h1\b/g, source)
  const headingCount = count(/<h[1-3]\b/g, source)
  const paragraphCount = count(/<p\b/g, source)
  const effectiveParagraphCount = Math.max(0, paragraphCount - disclosure.collapsedParagraphCount)
  const linkCount = count(/<(Link|a)\b/g, source)
  const buttonCount = count(/<button\b/g, source)
  const formFieldCount = count(/<(input|textarea|select)\b/g, source)
  const listCount = count(/<(ul|ol)\b/g, source)
  const hasTOC = hasAny([
    /table of contents/i,
    /jump to/i,
    /quick nav/i,
    /on this page/i,
    /sticky top-0/i,
  ], source)
  const hasTrust = hasAny([
    /privacy/i,
    /confidential/i,
    /secure/i,
    /security/i,
    /evidence/i,
    /methodology/i,
    /verification/i,
  ], source)
  const hasOutcome = hasAny([
    /\b\d+%\b/,
    /\b\d+\s*(day|days|week|weeks|month|months)\b/i,
    /metric/i,
    /kpi/i,
    /conversion/i,
    /median/i,
    /score/i,
  ], source)
  const ctaCount = count(/(start free|try free|sign up|get started|book|request|watch demo|see demo|join waitlist|contact sales|talk to)/gi, source)

  const category = classifyRoute(route)
  const findings = []
  let score = 100

  if (heading1Count === 0) {
    score -= category === 'marketing' ? 15 : 8
    findings.push('Missing H1')
  }
  if (headingCount < 3 && lineCount > 180) {
    score -= 8
    findings.push('Weak heading hierarchy')
  }
  if (sectionCount < 3 && lineCount > 220) {
    score -= 8
    findings.push('Insufficient content chunking')
  }
  if (effectiveLineCount > 700) {
    score -= 25
    findings.push('Extreme scroll burden')
  } else if (effectiveLineCount > 500) {
    score -= 18
    findings.push('High scroll burden')
  } else if (effectiveLineCount > 350) {
    score -= 10
    findings.push('Moderate scroll burden')
  }
  if (lineCount > 280 && !hasTOC && category !== 'dashboard' && category !== 'admin') {
    score -= 8
    findings.push('Long page without quick navigation')
  }
  if (effectiveParagraphCount > 25 && sectionCount < 5 && effectiveLineCount > 450) {
    score -= 10
    findings.push('Dense copy blocks')
  }
  if (category === 'marketing') {
    if (ctaCount === 0) {
      score -= 18
      findings.push('No explicit CTA language')
    } else if (ctaCount > 10) {
      score -= 8
      findings.push('CTA overload')
    }
    if (!hasTrust) {
      score -= 6
      findings.push('Missing trust/confidentiality cues')
    }
    if (!hasOutcome) {
      score -= 8
      findings.push('Missing outcome metrics')
    }
  }
  if ((category === 'dashboard' || category === 'admin') && buttonCount + formFieldCount + linkCount < 3) {
    score -= 8
    findings.push('Low action density for workflow page')
  }
  if (linkCount > 45 && category === 'marketing') {
    score -= 6
    findings.push('Navigation/action clutter risk')
  }

  if (score < 0) score = 0
  const grade = score >= 97 ? 'A+' : score >= 93 ? 'A' : score >= 90 ? 'A-' : score >= 87 ? 'B+' : score >= 83 ? 'B' : score >= 80 ? 'B-' : score >= 75 ? 'C+' : score >= 70 ? 'C' : 'C-'
  const excellent = score >= 90

  return {
    route,
    file: path.relative(ROOT, file).replace(/\\/g, '/'),
    category,
    lineCount,
    effectiveLineCount,
    sectionCount,
    headingCount,
    paragraphCount,
    effectiveParagraphCount,
    linkCount,
    buttonCount,
    formFieldCount,
    listCount,
    ctaCount,
    disclosureCount: disclosure.disclosureCount,
    collapsedDisclosureCount: disclosure.collapsedDisclosureCount,
    hasTrust,
    hasOutcome,
    hasTOC,
    score,
    grade,
    excellent,
    findings: findings.length ? findings : ['No major static UX risks detected'],
  }
}

function csvEscape(value) {
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

const pages = walk(APP_DIR)
  .map((file) => {
    const source = fs.readFileSync(file, 'utf8')
    return scorePage({ route: toRoute(file), file, source })
  })
  .sort((a, b) => a.route.localeCompare(b.route))

const byCategory = new Map()
for (const p of pages) {
  if (!byCategory.has(p.category)) byCategory.set(p.category, [])
  byCategory.get(p.category).push(p)
}

const total = pages.length
const excellentCount = pages.filter((p) => p.excellent).length
const flagged = pages.filter((p) => !p.excellent)
const highRisk = pages.filter((p) => p.score < 80)

const categoryRows = Array.from(byCategory.entries())
  .map(([category, list]) => {
    const avg = list.reduce((sum, x) => sum + x.score, 0) / list.length
    const ex = list.filter((x) => x.excellent).length
    return { category, count: list.length, avg: avg.toFixed(1), excellent: ex, flagged: list.length - ex }
  })
  .sort((a, b) => a.category.localeCompare(b.category))

const topFindings = new Map()
for (const p of pages) {
  for (const f of p.findings) {
    topFindings.set(f, (topFindings.get(f) || 0) + 1)
  }
}
const topFindingRows = Array.from(topFindings.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)

const md = []
md.push('# UI/UX Synthetic Council Full-Site Audit')
md.push('')
md.push('Date: May 21, 2026')
md.push('Scope: All App Router page routes under src/app/**/page.tsx (157 pages).')
md.push('Method: Static page-level audit using council-aligned standards from docs/main-landing-page-council-review.md, docs/landing-page-council-review.md, docs/search-firm-landing-page-council-review.md, and docs/site-review-from-new-council-members-may-2026.md.')
md.push('Note: Scroll burden uses effective line count that discounts content inside collapsed details disclosure blocks.')
md.push('')
md.push('## Council Standards and Metrics Used')
md.push('')
md.push('- Clarity and hierarchy: h1 presence, heading depth, section chunking')
md.push('- Scroll burden and information architecture: page length, long-page quick navigation support')
md.push('- Conversion architecture: explicit CTA density and overload risk')
md.push('- Trust and risk handling: privacy/confidentiality/security/methodology cues')
md.push('- Outcome specificity: measurable result language (percent/time/metrics)')
md.push('- Workflow interaction adequacy for product pages: action density for dashboard/admin routes')
md.push('')
md.push('Excellence threshold: score >= 90 (A- or better).')
md.push('')
md.push('## Overall Results')
md.push('')
md.push(`- Total pages audited: ${total}`)
md.push(`- Excellent pages (A- or better): ${excellentCount}`)
md.push(`- Flagged pages (below excellent): ${flagged.length}`)
md.push(`- High-risk pages (score < 80): ${highRisk.length}`)
md.push(`- Site excellence rate: ${((excellentCount / total) * 100).toFixed(1)}%`)
md.push('')
md.push('## Results by Page Category')
md.push('')
md.push('| Category | Pages | Avg score | Excellent | Flagged |')
md.push('|---|---:|---:|---:|---:|')
for (const row of categoryRows) {
  md.push(`| ${row.category} | ${row.count} | ${row.avg} | ${row.excellent} | ${row.flagged} |`)
}
md.push('')
md.push('## Most Common Non-Excellent Patterns')
md.push('')
md.push('| Pattern | Page count |')
md.push('|---|---:|')
for (const [pattern, countValue] of topFindingRows) {
  if (pattern === 'No major static UX risks detected') continue
  md.push(`| ${pattern} | ${countValue} |`)
}
md.push('')
md.push('## High-Risk Pages (Score < 80)')
md.push('')
if (highRisk.length === 0) {
  md.push('- None')
} else {
  md.push('| Route | Score | Grade | Category | Top flags |')
  md.push('|---|---:|---:|---|---|')
  for (const page of highRisk.sort((a, b) => a.score - b.score)) {
    md.push(`| ${page.route} | ${page.score} | ${page.grade} | ${page.category} | ${page.findings.slice(0, 3).join('; ')} |`)
  }
}
md.push('')
md.push('## Full Page-by-Page Audit')
md.push('')
md.push('| Route | Score | Grade | Excellent | Category | File | Primary findings |')
md.push('|---|---:|---:|---|---|---|---|')
for (const page of pages) {
  md.push(`| ${page.route} | ${page.score} | ${page.grade} | ${page.excellent ? 'Yes' : 'No'} | ${page.category} | ${page.file} | ${page.findings.slice(0, 3).join('; ')} |`)
}
md.push('')
md.push('## Remediation Strategy (No Major Functional Disruption)')
md.push('')
md.push('### Phase 1: Low-risk UX structure fixes (layout only, no business logic changes)')
md.push('- Add an on-page quick navigation block for pages longer than 280 lines (anchor links to major sections).')
md.push('- Standardize heading ladders (single H1, clear H2/H3 structure) and split dense text into scan-friendly sections.')
md.push('- Add top-of-page summary cards (what this page is, who it is for, what to do next) on long marketing pages.')
md.push('- Keep all existing copy and sections, but collapse secondary detail into accordions to reduce initial scroll depth.')
md.push('')
md.push('### Phase 2: Conversion and trust upgrades (copy and placement changes only)')
md.push('- On marketing pages, enforce one primary CTA and one secondary CTA above the fold; demote tertiary actions below.')
md.push('- Add explicit trust blocks near the hero (privacy, confidentiality, methodology, proof provenance).')
md.push('- Promote outcome metrics from lower sections to hero/first proof block.')
md.push('- Preserve all current destination routes and links; only adjust visual hierarchy and ordering.')
md.push('')
md.push('### Phase 3: Workflow page efficiency (dashboard/admin)')
md.push('- Add "next action" modules at top of long workflow screens to reduce hunt time.')
md.push('- Introduce progressive disclosure for advanced controls so core flow remains visible with less scrolling.')
md.push('- Maintain existing APIs, state shapes, and form schemas; changes are presentational and IA-only.')
md.push('')
md.push('### Phase 4: Governance and measurement')
md.push('- Add a UI/UX release checklist gate: heading integrity, CTA hierarchy, trust cue presence, and scroll burden control.')
md.push('- Track page effectiveness metrics per route: scroll depth (25/50/75/100), CTA click-through, time-to-first-action, and completion rate.')
md.push('- Set pass criteria for excellence: >=90 audit score and no unresolved high-risk flags.')
md.push('')
md.push('## Risk Controls to Avoid Functional Regressions')
md.push('')
md.push('- Do not remove existing forms, links, routes, or API interactions during UX updates.')
md.push('- Keep current data contracts and event wiring untouched; refactor only composition and copy ordering.')
md.push('- Ship in batches by route family (main landing, persona pages, blog templates, dashboard) with regression checks after each batch.')
md.push('- Use before/after snapshots and route-level smoke tests to ensure key content remains present.')

fs.writeFileSync(OUT_MD, md.join('\n') + '\n', 'utf8')

const csvHeaders = [
  'route','file','category','score','grade','excellent','lineCount','effectiveLineCount','sectionCount','headingCount','paragraphCount','effectiveParagraphCount','linkCount','buttonCount','formFieldCount','listCount','ctaCount','disclosureCount','collapsedDisclosureCount','hasTrust','hasOutcome','hasTOC','findings'
]
const csvRows = [csvHeaders.join(',')]
for (const p of pages) {
  const row = [
    p.route,
    p.file,
    p.category,
    p.score,
    p.grade,
    p.excellent,
    p.lineCount,
    p.effectiveLineCount,
    p.sectionCount,
    p.headingCount,
    p.paragraphCount,
    p.effectiveParagraphCount,
    p.linkCount,
    p.buttonCount,
    p.formFieldCount,
    p.listCount,
    p.ctaCount,
    p.disclosureCount,
    p.collapsedDisclosureCount,
    p.hasTrust,
    p.hasOutcome,
    p.hasTOC,
    p.findings.join(' | '),
  ].map(csvEscape)
  csvRows.push(row.join(','))
}
fs.writeFileSync(OUT_CSV, csvRows.join('\n') + '\n', 'utf8')

console.log(`Audited ${total} pages.`)
console.log(`Excellent: ${excellentCount}, Flagged: ${flagged.length}, High risk: ${highRisk.length}`)
console.log(`Wrote: ${path.relative(ROOT, OUT_MD)}`)
console.log(`Wrote: ${path.relative(ROOT, OUT_CSV)}`)
