import { createHash } from 'crypto'
import { execFile } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { promisify } from 'util'

type InternalEntry = {
  id: string
  title: string
  body: string
  type: 'architecture' | 'feature' | 'api' | 'code' | 'infra' | 'doc' | 'script' | 'data'
  ref: string
  tags: string[]
  qualityWeight: number
  lastModifiedAt?: string
}

type InternalManifest = {
  generatedAt: string
  sourceHash: string
  sourceFileCount: number
  entryCount: number
  changedEntryCount: number
}

const ROOT = process.cwd()
const DOCS_DIR = path.join(ROOT, 'docs')
const INTERNAL_GUIDE_MD_PATH = path.join(DOCS_DIR, 'internal-guide.md')
const INTERNAL_GUIDE_INDEX_PATH = path.join(DOCS_DIR, 'internal-guide.index.json')
const INTERNAL_GUIDE_MANIFEST_PATH = path.join(DOCS_DIR, 'internal-guide.manifest.json')
const INTERNAL_SUMMARY_PATH = path.join(DOCS_DIR, 'internal-system-summary.md')

const CHECK_ONLY = process.argv.includes('--check')
const FORCE = process.argv.includes('--force')
const execFileAsync = promisify(execFile)
let trackedFilesPromise: Promise<Set<string>> | null = null

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  const out: string[] = []
  const stack = [dir]

  while (stack.length > 0) {
    const current = stack.pop()!
    const entries = await fs.readdir(current, { withFileTypes: true }).catch(() => [])
    entries.sort((left, right) => left.name.localeCompare(right.name))
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) stack.push(fullPath)
      else if (entry.isFile()) out.push(fullPath)
    }
  }

  return out
}

async function lastModifiedAt(filePath: string): Promise<string | undefined> {
  const stat = await fs.stat(filePath).catch(() => null)
  return stat?.mtime?.toISOString()
}

function rel(filePath: string): string {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

async function getTrackedFiles(): Promise<Set<string>> {
  if (!trackedFilesPromise) {
    trackedFilesPromise = execFileAsync('git', ['ls-files'], { cwd: ROOT, maxBuffer: 10 * 1024 * 1024 })
      .then(({ stdout }) => new Set(stdout.split('\n').map((line) => line.trim()).filter(Boolean)))
      .catch(() => new Set<string>())
  }

  return trackedFilesPromise
}

function routeLabel(route: string): string {
  return route
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replace(/-/g, ' '))
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' / ')
}

function pageFileToRoute(filePath: string): string | null {
  const relative = rel(filePath)
  if (!relative.startsWith('src/app/') || !relative.endsWith('/page.tsx')) return null
  if (relative.includes('[')) return null

  const route = relative
    .replace(/^src\/app\//, '')
    .replace(/\/page\.tsx$/, '')
    .split('/')
    .filter((segment) => !segment.startsWith('(') && !segment.endsWith(')'))
    .join('/')

  return `/${route}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
}

function apiFileToRoute(filePath: string): string | null {
  const relative = rel(filePath)
  if (!relative.startsWith('src/app/api/') || !relative.endsWith('/route.ts')) return null
  return `/${relative.replace(/^src\/app\//, '').replace(/\/route\.ts$/, '')}`
}

async function firstMeaningfulLine(filePath: string): Promise<string> {
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '')
  if (!raw) return ''
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

  for (const line of lines) {
    if (line.startsWith('//')) return line.replace(/^\/\/\s*/, '').slice(0, 220)
    if (line.startsWith('# ')) return line.replace(/^#\s*/, '').slice(0, 220)
    if (line.startsWith('export ')) return line.slice(0, 220)
  }

  return lines[0]?.slice(0, 220) ?? ''
}

function qualityForType(type: InternalEntry['type']): number {
  if (type === 'architecture') return 1.4
  if (type === 'feature') return 1.25
  if (type === 'api') return 1.2
  if (type === 'infra') return 1.2
  if (type === 'doc') return 1.1
  if (type === 'code') return 1.0
  if (type === 'script') return 0.95
  return 0.95
}

async function buildEntries(): Promise<InternalEntry[]> {
  const [appFiles, libFiles, scriptFiles, docFiles, workflowFiles, migrationFiles] = await Promise.all([
    listFilesRecursive(path.join(ROOT, 'src', 'app')),
    listFilesRecursive(path.join(ROOT, 'src', 'lib')),
    listFilesRecursive(path.join(ROOT, 'scripts')),
    listFilesRecursive(path.join(ROOT, 'docs')),
    listFilesRecursive(path.join(ROOT, '.github', 'workflows')),
    listFilesRecursive(path.join(ROOT, 'supabase', 'migrations')),
  ])

  appFiles.sort((left, right) => left.localeCompare(right))
  libFiles.sort((left, right) => left.localeCompare(right))
  scriptFiles.sort((left, right) => left.localeCompare(right))
  docFiles.sort((left, right) => left.localeCompare(right))
  workflowFiles.sort((left, right) => left.localeCompare(right))
  migrationFiles.sort((left, right) => left.localeCompare(right))

  const featureEntries: InternalEntry[] = []
  for (const filePath of appFiles.filter((file) => file.endsWith('/page.tsx') || file.endsWith('\\page.tsx'))) {
    const route = pageFileToRoute(filePath)
    if (!route) continue
    featureEntries.push({
      id: `feature:${route}`,
      title: `Feature ${routeLabel(route)}`,
      body: `User-facing page route ${route}.`,
      type: 'feature',
      ref: route,
      tags: ['feature', 'route', 'app-router'],
      qualityWeight: qualityForType('feature'),
      lastModifiedAt: await lastModifiedAt(filePath),
    })
  }

  const apiEntries: InternalEntry[] = []
  for (const filePath of appFiles.filter((file) => file.endsWith('/route.ts') || file.endsWith('\\route.ts'))) {
    const route = apiFileToRoute(filePath)
    if (!route) continue
    const line = await firstMeaningfulLine(filePath)
    apiEntries.push({
      id: `api:${route}`,
      title: `API ${route}`,
      body: line || 'Route handler for internal or product API behavior.',
      type: 'api',
      ref: rel(filePath),
      tags: ['api', 'route-handler'],
      qualityWeight: qualityForType('api'),
      lastModifiedAt: await lastModifiedAt(filePath),
    })
  }

  const libEntries: InternalEntry[] = []
  for (const filePath of libFiles.filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'))) {
    const line = await firstMeaningfulLine(filePath)
    libEntries.push({
      id: `code:${rel(filePath)}`,
      title: `Code ${rel(filePath)}`,
      body: line || 'Library module used by app routes and services.',
      type: 'code',
      ref: rel(filePath),
      tags: ['code', 'library'],
      qualityWeight: qualityForType('code'),
      lastModifiedAt: await lastModifiedAt(filePath),
    })
  }

  const scriptEntries: InternalEntry[] = []
  for (const filePath of scriptFiles.filter((file) => /\.(ts|mjs|js)$/.test(file))) {
    const line = await firstMeaningfulLine(filePath)
    scriptEntries.push({
      id: `script:${rel(filePath)}`,
      title: `Script ${rel(filePath)}`,
      body: line || 'Operational script for audits, exports, checks, or automation.',
      type: 'script',
      ref: rel(filePath),
      tags: ['script', 'operations'],
      qualityWeight: qualityForType('script'),
      lastModifiedAt: await lastModifiedAt(filePath),
    })
  }

  const infraEntries: InternalEntry[] = []
  for (const filePath of workflowFiles.filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))) {
    const line = await firstMeaningfulLine(filePath)
    infraEntries.push({
      id: `infra:${rel(filePath)}`,
      title: `Workflow ${rel(filePath)}`,
      body: line || 'GitHub Actions workflow for CI, monitoring, or scheduled operations.',
      type: 'infra',
      ref: rel(filePath),
      tags: ['infra', 'github-actions'],
      qualityWeight: qualityForType('infra'),
      lastModifiedAt: await lastModifiedAt(filePath),
    })
  }

  const dataEntries: InternalEntry[] = []
  for (const filePath of migrationFiles.filter((file) => file.endsWith('.sql'))) {
    const line = await firstMeaningfulLine(filePath)
    dataEntries.push({
      id: `data:${rel(filePath)}`,
      title: `Migration ${rel(filePath)}`,
      body: line || 'Supabase schema or policy migration.',
      type: 'data',
      ref: rel(filePath),
      tags: ['data', 'migration', 'supabase'],
      qualityWeight: qualityForType('data'),
      lastModifiedAt: await lastModifiedAt(filePath),
    })
  }

  const docEntries: InternalEntry[] = []
  for (const filePath of docFiles.filter((file) => file.endsWith('.md'))) {
    const line = await firstMeaningfulLine(filePath)
    docEntries.push({
      id: `doc:${rel(filePath)}`,
      title: `Doc ${rel(filePath)}`,
      body: line || 'Documentation artifact for strategy, ops, runbooks, or product.',
      type: 'doc',
      ref: rel(filePath),
      tags: ['doc', 'knowledge'],
      qualityWeight: qualityForType('doc'),
      lastModifiedAt: await lastModifiedAt(filePath),
    })
  }

  const architectureEntry: InternalEntry = {
    id: 'architecture:platform',
    title: 'Platform architecture overview',
    body: 'Next.js App Router frontend and API surface, Supabase data/auth layer, scripts/workflows for reliability and growth operations.',
    type: 'architecture',
    ref: 'docs/internal-system-summary.md',
    tags: ['architecture', 'platform'],
    qualityWeight: qualityForType('architecture'),
    lastModifiedAt: await lastModifiedAt(INTERNAL_SUMMARY_PATH),
  }

  return [architectureEntry, ...featureEntries, ...apiEntries, ...libEntries, ...scriptEntries, ...infraEntries, ...dataEntries, ...docEntries]
}

function entryLine(entry: InternalEntry): string {
  return `- ${entry.title} | ${entry.ref} | ${entry.body}`
}

function buildMarkdown(entries: InternalEntry[], generatedAt: string): string {
  const sections = {
    architecture: entries.filter((entry) => entry.type === 'architecture'),
    features: entries.filter((entry) => entry.type === 'feature'),
    api: entries.filter((entry) => entry.type === 'api'),
    code: entries.filter((entry) => entry.type === 'code'),
    scripts: entries.filter((entry) => entry.type === 'script'),
    infra: entries.filter((entry) => entry.type === 'infra'),
    data: entries.filter((entry) => entry.type === 'data'),
    docs: entries.filter((entry) => entry.type === 'doc'),
  }

  return [
    '# Starting Monday Internal Guide',
    '',
    `Last generated: ${generatedAt}`,
    '',
    'This staff-only guide covers inner workings, infrastructure, operations, and codebase surface area.',
    '',
    `## Architecture (${sections.architecture.length})`,
    ...sections.architecture.map(entryLine),
    '',
    `## Features (${sections.features.length})`,
    ...sections.features.map(entryLine),
    '',
    `## API Surface (${sections.api.length})`,
    ...sections.api.map(entryLine),
    '',
    `## Codebase Modules (${sections.code.length})`,
    ...sections.code.map(entryLine),
    '',
    `## Internal Scripts (${sections.scripts.length})`,
    ...sections.scripts.map(entryLine),
    '',
    `## Infrastructure and Workflows (${sections.infra.length})`,
    ...sections.infra.map(entryLine),
    '',
    `## Data and Migrations (${sections.data.length})`,
    ...sections.data.map(entryLine),
    '',
    `## Documentation (${sections.docs.length})`,
    ...sections.docs.map(entryLine),
    '',
    '## What It Is Not',
    '- Not a public end-user manual. Use docs/user-guide.md for customer-facing guidance.',
    '- Not a security boundary by itself. It summarizes systems but does not grant access.',
    '- Not a substitute for runbook execution details in docs/sre/runbooks/.',
    '',
  ].join('\n')
}

function buildSummary(entries: InternalEntry[], generatedAt: string): string {
  const countByType = (type: InternalEntry['type']) => entries.filter((entry) => entry.type === type).length

  return [
    '# Starting Monday Internal System Summary',
    '',
    `Generated at: ${generatedAt}`,
    '',
    '## What exists',
    `- Feature pages: ${countByType('feature')}`,
    `- API routes: ${countByType('api')}`,
    `- Library modules: ${countByType('code')}`,
    `- Operational scripts: ${countByType('script')}`,
    `- Infra workflows: ${countByType('infra')}`,
    `- Migrations/data artifacts: ${countByType('data')}`,
    `- Internal docs: ${countByType('doc')}`,
    '',
    '## How it integrates',
    '- App routes render product/admin surfaces and call route handlers for actions and data flows.',
    '- API handlers orchestrate business logic and persist state through Supabase.',
    '- Library modules centralize shared retrieval/auth/analytics/domain logic.',
    '- Scripts and workflows provide CI gates, scheduled audits, and observability exports.',
    '- Migrations and RLS policies define data contracts and access semantics.',
    '',
    '## What it is not',
    '- Not a replacement for source code reviews when modifying critical paths.',
    '- Not the external customer onboarding guide.',
    '- Not exhaustive of runtime secrets/config; those remain environment-controlled.',
    '',
  ].join('\n')
}

async function collectWatchedFiles(): Promise<string[]> {
  const dirs = [
    path.join(ROOT, 'src', 'app'),
    path.join(ROOT, 'src', 'lib'),
    path.join(ROOT, 'scripts'),
    path.join(ROOT, 'docs'),
    path.join(ROOT, '.github', 'workflows'),
    path.join(ROOT, 'supabase', 'migrations'),
  ]

  const excluded = new Set([
    INTERNAL_GUIDE_MD_PATH,
    INTERNAL_GUIDE_INDEX_PATH,
    INTERNAL_GUIDE_MANIFEST_PATH,
    INTERNAL_SUMMARY_PATH,
  ])

  const [batches, trackedFiles] = await Promise.all([Promise.all(dirs.map((dir) => listFilesRecursive(dir))), getTrackedFiles()])
  return batches
    .flat()
    .filter((file) => /\.(ts|tsx|js|mjs|md|sql|yml|yaml)$/.test(file))
    .filter((file) => !excluded.has(file))
    .filter((file) => trackedFiles.has(rel(file)))
}

async function computeSourceHash(files: string[]): Promise<string> {
  const hash = createHash('sha256')
  const sorted = [...new Set(files)].sort((left, right) => {
    const leftKey = path.relative(ROOT, left).replace(/\\/g, '/')
    const rightKey = path.relative(ROOT, right).replace(/\\/g, '/')
    if (leftKey < rightKey) return -1
    if (leftKey > rightKey) return 1
    return 0
  })

  for (const filePath of sorted) {
    const exists = await fileExists(filePath)
    if (!exists) continue
    const contents = await fs.readFile(filePath, 'utf8')
    const normalizedContents = contents.replace(/\r\n/g, '\n')
    hash.update(path.relative(ROOT, filePath).replace(/\\/g, '/'))
    hash.update(normalizedContents)
  }

  return hash.digest('hex')
}

async function readManifest(): Promise<InternalManifest | null> {
  const exists = await fileExists(INTERNAL_GUIDE_MANIFEST_PATH)
  if (!exists) return null

  const raw = await fs.readFile(INTERNAL_GUIDE_MANIFEST_PATH, 'utf8').catch(() => '')
  if (!raw) return null

  try {
    return JSON.parse(raw) as InternalManifest
  } catch {
    return null
  }
}

async function writePayload(payload: { generatedAt: string; entries: InternalEntry[]; markdown: string; summary: string }, sourceHash: string, sourceFileCount: number) {
  await fs.mkdir(DOCS_DIR, { recursive: true })

  const priorIndexRaw = await fs.readFile(INTERNAL_GUIDE_INDEX_PATH, 'utf8').catch(() => '')
  const priorEntries = priorIndexRaw
    ? ((JSON.parse(priorIndexRaw) as { entries?: InternalEntry[] }).entries ?? [])
    : []
  const priorMap = new Map(priorEntries.map((entry) => [entry.id, JSON.stringify(entry)]))

  let changedEntryCount = 0
  for (const entry of payload.entries) {
    const previous = priorMap.get(entry.id)
    if (!previous || previous !== JSON.stringify(entry)) changedEntryCount += 1
  }

  await Promise.all([
    fs.writeFile(INTERNAL_GUIDE_MD_PATH, payload.markdown, 'utf8'),
    fs.writeFile(INTERNAL_SUMMARY_PATH, payload.summary, 'utf8'),
    fs.writeFile(
      INTERNAL_GUIDE_INDEX_PATH,
      JSON.stringify({ generatedAt: payload.generatedAt, entries: payload.entries }, null, 2),
      'utf8',
    ),
    fs.writeFile(
      INTERNAL_GUIDE_MANIFEST_PATH,
      JSON.stringify({ generatedAt: payload.generatedAt, sourceHash, sourceFileCount, entryCount: payload.entries.length, changedEntryCount }, null, 2),
      'utf8',
    ),
  ])
}

async function main() {
  const watchedFiles = await collectWatchedFiles()
  const sourceHash = await computeSourceHash(watchedFiles)
  const manifest = await readManifest()

  const needsUpdate = FORCE || !manifest || manifest.sourceHash !== sourceHash

  if (!needsUpdate) {
    console.log('internal-guide: up to date')
    return
  }

  if (CHECK_ONLY) {
    console.error('internal-guide: stale (run npm run guide:internal:sync)')
    process.exitCode = 1
    return
  }

  const entries = await buildEntries()
  const generatedAt = new Date().toISOString()

  const markdown = buildMarkdown(entries, generatedAt)
  const summary = buildSummary(entries, generatedAt)

  await writePayload({ generatedAt, entries, markdown, summary }, sourceHash, watchedFiles.length)
  console.log(`internal-guide: regenerated with ${entries.length} entries`)
}

main().catch((error) => {
  console.error('internal-guide: failed', error)
  process.exitCode = 1
})
