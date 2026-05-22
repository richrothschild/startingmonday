import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const APP_DIR = path.join(ROOT, 'src', 'app')
const API_DIR = path.join(ROOT, 'src', 'app', 'api')
const PUBLIC_DIR = path.join(ROOT, 'public')
const SCAN_DIRS = [
  path.join(ROOT, 'src', 'app'),
  path.join(ROOT, 'src', 'components'),
]

const args = process.argv.slice(2)
const FIX = args.includes('--fix')

function argValue(name, fallback) {
  const i = args.indexOf(name)
  if (i >= 0 && args[i + 1]) return args[i + 1]
  return fallback
}

const DATE = new Date().toISOString().slice(0, 10)
const jsonReportPath = path.resolve(ROOT, argValue('--json', path.join('docs', `link-integrity-report-${DATE}.json`)))
const mdReportPath = path.resolve(ROOT, argValue('--md', path.join('docs', `link-integrity-report-${DATE}.md`)))

const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.html'])
const KNOWN_INTERNAL_REWRITES = new Map([
  ['/dashboard/companies', '/dashboard'],
  ['/settings', '/settings/billing'],
])

function isIgnoredUrl(url) {
  return (
    !url ||
    url.startsWith('#') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:') ||
    url.startsWith('javascript:') ||
    url.startsWith('data:')
  )
}

function normalizePathOnly(url) {
  return url.split('#')[0].split('?')[0]
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  return dp[a.length][b.length]
}

async function listFilesRecursive(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue
      out.push(...await listFilesRecursive(full))
    } else if (SOURCE_EXT.has(path.extname(entry.name))) {
      out.push(full)
    }
  }
  return out
}

async function listAllFilesRecursive(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue
      out.push(...await listAllFilesRecursive(full))
    } else {
      out.push(full)
    }
  }
  return out
}

function routeFromPageFile(file) {
  const rel = path.relative(APP_DIR, file).replace(/\\/g, '/')
  if (!rel.endsWith('/page.tsx') && rel !== 'page.tsx') return null
  const noPage = rel.replace(/\/page\.tsx$/, '').replace(/^page\.tsx$/, '')
  const segments = noPage.split('/').filter(Boolean).filter((seg) => !(seg.startsWith('(') && seg.endsWith(')')))
  if (segments.length === 0) return '/'
  return `/${segments.join('/')}`
}

function routeFromApiFile(file) {
  const rel = path.relative(API_DIR, file).replace(/\\/g, '/')
  if (!rel.endsWith('/route.ts') && rel !== 'route.ts') return null
  const noRoute = rel.replace(/\/route\.ts$/, '').replace(/^route\.ts$/, '')
  if (!noRoute) return '/api'
  return `/api/${noRoute}`
}

function patternFromRoute(route) {
  const escaped = route
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[\.\.\.[^\]]+\\\]/g, '.+')
    .replace(/\\\[[^\]]+\\\]/g, '[^/]+')
  return new RegExp(`^${escaped}$`)
}

function extractLinksFromText(text, filePath) {
  const links = []
  const pattern = /(href|src)\s*=\s*(["'`])([^"'`]+)\2/g
  let match
  while ((match = pattern.exec(text)) !== null) {
    const attr = match[1]
    const quote = match[2]
    const url = match[3]
    const valueStart = match.index + match[0].indexOf(url)
    const valueEnd = valueStart + url.length
    const line = text.slice(0, match.index).split(/\r?\n/).length
    links.push({
      filePath,
      attr,
      quote,
      url,
      valueStart,
      valueEnd,
      line,
    })
  }

  const objectPattern = /\b(href|url|target)\s*:\s*(["'`])([^"'`]+)\2/g
  while ((match = objectPattern.exec(text)) !== null) {
    const attr = match[1]
    const quote = match[2]
    const url = match[3]
    const valueStart = match.index + match[0].indexOf(url)
    const valueEnd = valueStart + url.length
    const line = text.slice(0, match.index).split(/\r?\n/).length
    links.push({
      filePath,
      attr,
      quote,
      url,
      valueStart,
      valueEnd,
      line,
    })
  }

  return links
}

function findInternalFix(url, routeSet, routePatterns) {
  const clean = normalizePathOnly(url)
  if (KNOWN_INTERNAL_REWRITES.has(clean)) {
    return url.replace(clean, KNOWN_INTERNAL_REWRITES.get(clean))
  }
  if (routeSet.has(clean)) return null
  if (routePatterns.some((r) => r.test(clean))) return null

  const trailing = clean.endsWith('/') && clean !== '/' ? clean.slice(0, -1) : `${clean}/`
  if (routeSet.has(trailing) || routePatterns.some((r) => r.test(trailing))) {
    return url.replace(clean, trailing)
  }

  const cleanLower = clean.toLowerCase()
  const sameCaseInsensitive = [...routeSet].find((r) => r.toLowerCase() === cleanLower)
  if (sameCaseInsensitive) {
    return url.replace(clean, sameCaseInsensitive)
  }

  const staticCandidates = [...routeSet].filter((r) => !r.includes('['))
  const targetFirst = clean.split('/')[1] ?? ''
  const scoped = staticCandidates.filter((r) => (r.split('/')[1] ?? '') === targetFirst)
  const pool = scoped.length ? scoped : staticCandidates
  let best = null
  for (const candidate of pool) {
    const dist = levenshtein(clean, candidate)
    if (!best || dist < best.dist) best = { candidate, dist }
  }
  if (best && best.dist <= 3) {
    return url.replace(clean, best.candidate)
  }

  return null
}

async function checkExternalUrl(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const headRes = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'startingmonday-link-audit/1.0' },
    })
    clearTimeout(timeout)

    if (headRes.status >= 200 && headRes.status < 400) {
      return { url, status: headRes.status, state: 'ok', method: 'HEAD' }
    }
    if (headRes.status === 401 || headRes.status === 403) {
      return { url, status: headRes.status, state: 'restricted', method: 'HEAD' }
    }

    const getController = new AbortController()
    const getTimeout = setTimeout(() => getController.abort(), 12000)
    const getRes = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: getController.signal,
      headers: { 'User-Agent': 'startingmonday-link-audit/1.0' },
    })
    clearTimeout(getTimeout)

    if (getRes.status >= 200 && getRes.status < 400) {
      return { url, status: getRes.status, state: 'ok', method: 'GET' }
    }
    if (getRes.status === 401 || getRes.status === 403) {
      return { url, status: getRes.status, state: 'restricted', method: 'GET' }
    }
    return { url, status: getRes.status, state: 'broken', method: 'GET' }
  } catch (error) {
    clearTimeout(timeout)
    return {
      url,
      status: 0,
      state: 'error',
      method: 'HEAD',
      error: error instanceof Error ? error.message : 'Request failed',
    }
  }
}

function escapeMd(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Link Integrity Report')
  lines.push('')
  lines.push(`- Generated: ${new Date(report.generatedAt).toISOString()}`)
  lines.push(`- Mode: ${report.fixMode ? 'fix' : 'check-only'}`)
  lines.push(`- Source files scanned: ${report.summary.filesScanned}`)
  lines.push(`- Links discovered: ${report.summary.totalLinks}`)
  lines.push(`- Internal links: ${report.summary.internalLinks}`)
  lines.push(`- External links: ${report.summary.externalLinks}`)
  lines.push(`- Broken internal links: ${report.summary.brokenInternal}`)
  lines.push(`- Broken external links: ${report.summary.brokenExternal}`)
  lines.push(`- External restricted (401/403): ${report.summary.restrictedExternal}`)
  lines.push(`- Auto-fixes applied: ${report.summary.autoFixes}`)
  lines.push('')

  lines.push('## Auto-fixes Applied')
  lines.push('')
  if (!report.autoFixes.length) {
    lines.push('No automatic fixes were applied.')
  } else {
    lines.push('| File | Line | Before | After |')
    lines.push('| --- | ---: | --- | --- |')
    for (const item of report.autoFixes) {
      lines.push(`| ${escapeMd(item.file)} | ${item.line} | ${escapeMd(item.before)} | ${escapeMd(item.after)} |`)
    }
  }
  lines.push('')

  lines.push('## Broken Internal Links')
  lines.push('')
  if (!report.brokenInternal.length) {
    lines.push('No broken internal links found.')
  } else {
    lines.push('| File | Line | URL | Suggested fix |')
    lines.push('| --- | ---: | --- | --- |')
    for (const item of report.brokenInternal) {
      lines.push(`| ${escapeMd(item.file)} | ${item.line} | ${escapeMd(item.url)} | ${escapeMd(item.suggestedFix ?? '')} |`)
    }
  }
  lines.push('')

  lines.push('## Broken External Links')
  lines.push('')
  if (!report.brokenExternal.length) {
    lines.push('No broken external links found.')
  } else {
    lines.push('| URL | Status | Method | Source refs |')
    lines.push('| --- | ---: | --- | --- |')
    for (const item of report.brokenExternal) {
      const refs = item.refs.map((r) => `${r.file}:${r.line}`).join(', ')
      lines.push(`| ${escapeMd(item.url)} | ${item.status} | ${escapeMd(item.method)} | ${escapeMd(refs)} |`)
    }
  }
  lines.push('')

  lines.push('## Restricted External Links (401/403)')
  lines.push('')
  if (!report.restrictedExternal.length) {
    lines.push('No restricted external links detected.')
  } else {
    lines.push('| URL | Status | Source refs |')
    lines.push('| --- | ---: | --- |')
    for (const item of report.restrictedExternal) {
      const refs = item.refs.map((r) => `${r.file}:${r.line}`).join(', ')
      lines.push(`| ${escapeMd(item.url)} | ${item.status} | ${escapeMd(refs)} |`)
    }
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- Auto-fixes apply only to internal links and only when a deterministic safe replacement is found.')
  lines.push('- External links are never rewritten automatically by this script.')

  return lines.join('\n')
}

async function main() {
  const pageFiles = await listFilesRecursive(APP_DIR)
  const routes = pageFiles.map(routeFromPageFile).filter(Boolean)
  const apiFiles = await listFilesRecursive(API_DIR)
  const apiRoutes = apiFiles.map(routeFromApiFile).filter(Boolean)

  const routeSet = new Set(routes)
  const routePatterns = routes.map(patternFromRoute)
  const apiRouteSet = new Set(apiRoutes)
  const apiRoutePatterns = apiRoutes.map(patternFromRoute)

  const publicFiles = await listAllFilesRecursive(PUBLIC_DIR)
  const publicPathSet = new Set(
    publicFiles.map((f) => `/${path.relative(PUBLIC_DIR, f).replace(/\\/g, '/')}`)
  )

  const sourceFiles = []
  for (const d of SCAN_DIRS) {
    sourceFiles.push(...await listFilesRecursive(d))
  }

  const fileContents = new Map()
  const allLinks = []

  for (const file of sourceFiles) {
    const text = await fs.readFile(file, 'utf8')
    fileContents.set(file, text)
    const links = extractLinksFromText(text, file)
    allLinks.push(...links)
  }

  const internalLinks = []
  const externalLinks = []

  for (const link of allLinks) {
    if (isIgnoredUrl(link.url)) continue
    if (link.url.startsWith('/')) internalLinks.push(link)
    else if (/^https?:\/\//i.test(link.url)) externalLinks.push(link)
  }

  const brokenInternal = []
  const fixByFile = new Map()
  const autoFixes = []

  for (const link of internalLinks) {
    const clean = normalizePathOnly(link.url)
    const isApi = clean.startsWith('/api/') || clean === '/api'
    const isPublicAsset = publicPathSet.has(clean)
    const ok = isPublicAsset || (isApi
      ? (apiRouteSet.has(clean) || apiRoutePatterns.some((p) => p.test(clean)))
      : (routeSet.has(clean) || routePatterns.some((p) => p.test(clean))))
    if (ok) continue

    const suggestedFix = isApi ? null : findInternalFix(link.url, routeSet, routePatterns)
    if (FIX && suggestedFix && suggestedFix !== link.url) {
      if (!fixByFile.has(link.filePath)) fixByFile.set(link.filePath, [])
      fixByFile.get(link.filePath).push({
        start: link.valueStart,
        end: link.valueEnd,
        before: link.url,
        after: suggestedFix,
        line: link.line,
      })
      autoFixes.push({
        file: path.relative(ROOT, link.filePath).replace(/\\/g, '/'),
        line: link.line,
        before: link.url,
        after: suggestedFix,
      })
      continue
    }

    brokenInternal.push({
      file: path.relative(ROOT, link.filePath).replace(/\\/g, '/'),
      line: link.line,
      url: link.url,
      suggestedFix,
    })
  }

  for (const [file, replacements] of fixByFile.entries()) {
    const original = fileContents.get(file)
    const ordered = replacements.sort((a, b) => b.start - a.start)
    let next = original
    for (const rep of ordered) {
      next = `${next.slice(0, rep.start)}${rep.after}${next.slice(rep.end)}`
    }
    await fs.writeFile(file, next, 'utf8')
  }

  const externalMap = new Map()
  for (const link of externalLinks) {
    if (!externalMap.has(link.url)) externalMap.set(link.url, [])
    externalMap.get(link.url).push({
      file: path.relative(ROOT, link.filePath).replace(/\\/g, '/'),
      line: link.line,
    })
  }

  const brokenExternal = []
  const restrictedExternal = []

  for (const [url, refs] of externalMap.entries()) {
    const result = await checkExternalUrl(url)
    if (result.state === 'ok') continue
    if (result.state === 'restricted') {
      restrictedExternal.push({ url, status: result.status, method: result.method, refs })
    } else {
      brokenExternal.push({ url, status: result.status, method: result.method, refs, error: result.error ?? null })
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    fixMode: FIX,
    summary: {
      filesScanned: sourceFiles.length,
      totalLinks: internalLinks.length + externalLinks.length,
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      brokenInternal: brokenInternal.length,
      brokenExternal: brokenExternal.length,
      restrictedExternal: restrictedExternal.length,
      autoFixes: autoFixes.length,
    },
    autoFixes,
    brokenInternal,
    brokenExternal,
    restrictedExternal,
  }

  await fs.mkdir(path.dirname(jsonReportPath), { recursive: true })
  await fs.mkdir(path.dirname(mdReportPath), { recursive: true })
  await fs.writeFile(jsonReportPath, JSON.stringify(report, null, 2), 'utf8')
  await fs.writeFile(mdReportPath, buildMarkdown(report), 'utf8')

  console.log(`Scanned ${sourceFiles.length} source files.`)
  console.log(`Internal links: ${internalLinks.length}, External links: ${externalLinks.length}`)
  console.log(`Broken internal: ${brokenInternal.length}, Broken external: ${brokenExternal.length}, Restricted external: ${restrictedExternal.length}`)
  console.log(`Auto-fixes applied: ${autoFixes.length}`)
  console.log(`Wrote JSON: ${path.relative(ROOT, jsonReportPath)}`)
  console.log(`Wrote MD: ${path.relative(ROOT, mdReportPath)}`)

  process.exitCode = brokenInternal.length || brokenExternal.length ? 1 : 0
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
