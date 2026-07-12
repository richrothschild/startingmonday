#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const ROOT = process.cwd()
const APP_DIR = path.join(ROOT, 'src', 'app')
const OUTPUT_JSON = path.join(ROOT, 'docs', 'status', 'route-inventory.latest.json')
const OUTPUT_MD = path.join(ROOT, 'docs', 'status', 'route-inventory.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

function collectPageFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectPageFiles(full, acc)
    } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
      acc.push(full)
    }
  }
  return acc
}

function routeFromRelativePath(relativePath) {
  const route = relativePath
    .replace(/\\/g, '/')
    .replace(/^src\/app\//, '')
    .replace(/(^|\/)page\.tsx?$/, '')
    .split('/')
    .filter((segment) => segment && !(segment.startsWith('(') && segment.endsWith(')')))
    .join('/')
  return route ? `/${route}` : '/'
}

function inferTier(relativePath, route) {
  if (relativePath.startsWith('src/app/(dashboard)/dashboard/admin/')) return 'admin'
  if (route.startsWith('/dashboard')) return 'dashboard'
  if (route === '/' || route.startsWith('/pricing') || route.startsWith('/demo') || route.startsWith('/blog') || route.startsWith('/method-and-evidence') || route.startsWith('/signup')) {
    return 'funnel'
  }
  return 'public'
}

function inferTemplate(route) {
  if (route.includes('/[')) return 'dynamic'
  if (route.startsWith('/dashboard')) return 'app-shell'
  if (route === '/' || route.startsWith('/pricing') || route.startsWith('/demo')) return 'marketing-core'
  if (route.startsWith('/blog')) return 'editorial'
  if (route.startsWith('/api/')) return 'api-surface'
  return 'standard'
}

function isAuthGated(relativePath) {
  return (
    relativePath.startsWith('src/app/(dashboard)/') ||
    relativePath.startsWith('src/app/coach/') ||
    relativePath.startsWith('src/app/settings/')
  )
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Route Inventory Agent Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push(`Routes discovered: ${report.totals.routes}`)
  lines.push('')
  lines.push('## Coverage Summary')
  lines.push('')
  lines.push(`- Static routes: ${report.totals.staticRoutes}`)
  lines.push(`- Dynamic routes: ${report.totals.dynamicRoutes}`)
  lines.push(`- Auth-gated routes: ${report.totals.authGatedRoutes}`)
  lines.push('')
  lines.push('## Tier Breakdown')
  lines.push('')
  for (const [tier, count] of Object.entries(report.byTier)) {
    lines.push(`- ${tier}: ${count}`)
  }
  lines.push('')
  lines.push('## Route List')
  lines.push('')
  for (const route of report.routes) {
    lines.push(`- ${route.route} (${route.dynamic ? 'dynamic' : 'static'}, tier=${route.tier}, auth=${route.authGated ? 'yes' : 'no'}) → ${route.relativePath}`)
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const changedLine = report.delta.previousGeneratedAt
    ? `Previous snapshot: ${report.delta.previousGeneratedAt} | added=${report.delta.added.length}, removed=${report.delta.removed.length}`
    : 'No previous snapshot found (first seed run).'
  const executiveSummary = report.delta.previousGeneratedAt
    ? `Inventory is fresh with ${report.totals.routes} total routes; delta is +${report.delta.added.length}/-${report.delta.removed.length} since the last snapshot.`
    : `Inventory baseline established with ${report.totals.routes} total routes and full tier breakdown available for downstream agents.`

  const added = report.delta.added.slice(0, 10).join(', ') || 'none'
  const removed = report.delta.removed.slice(0, 10).join(', ') || 'none'

  return [
    '*Route inventory agent report*',
    `Channel: ${report.channel}`,
    '',
    '*Executive summary*',
    `- ${executiveSummary}`,
    `Routes discovered: ${report.totals.routes} (static ${report.totals.staticRoutes}, dynamic ${report.totals.dynamicRoutes}, auth-gated ${report.totals.authGatedRoutes})`,
    changedLine,
    `Added routes: ${added}`,
    `Removed routes: ${removed}`,
  ].join('\n')
}

async function postSlack(text) {
  if (!slackWebhook) {
    console.log('No Slack webhook configured; skipping Slack post.')
    return
  }
  await postSlackText({ webhookUrl: slackWebhook, text })
}

async function main() {
  if (!fs.existsSync(APP_DIR)) {
    throw new Error(`App directory not found: ${APP_DIR}`)
  }

  const pageFiles = collectPageFiles(APP_DIR)
    .map((filePath) => path.relative(ROOT, filePath).replace(/\\/g, '/'))
    .sort((a, b) => a.localeCompare(b))

  const routes = pageFiles.map((relativePath) => {
    const route = routeFromRelativePath(relativePath)
    const dynamic = /\[[^\]]+\]/.test(route)
    return {
      route,
      relativePath,
      dynamic,
      authGated: isAuthGated(relativePath),
      tier: inferTier(relativePath, route),
      template: inferTemplate(route),
    }
  })

  const previous = fs.existsSync(OUTPUT_JSON)
    ? JSON.parse(fs.readFileSync(OUTPUT_JSON, 'utf8'))
    : null

  const currentRoutes = new Set(routes.map((r) => r.route))
  const previousRoutes = new Set((previous?.routes ?? []).map((r) => r.route))
  const added = [...currentRoutes].filter((route) => !previousRoutes.has(route)).sort((a, b) => a.localeCompare(b))
  const removed = [...previousRoutes].filter((route) => !currentRoutes.has(route)).sort((a, b) => a.localeCompare(b))

  const byTier = routes.reduce((acc, route) => {
    acc[route.tier] = (acc[route.tier] ?? 0) + 1
    return acc
  }, {})

  const totals = {
    routes: routes.length,
    staticRoutes: routes.filter((r) => !r.dynamic).length,
    dynamicRoutes: routes.filter((r) => r.dynamic).length,
    authGatedRoutes: routes.filter((r) => r.authGated).length,
  }

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    totals,
    byTier,
    delta: {
      previousGeneratedAt: previous?.generatedAt ?? null,
      added,
      removed,
    },
    routes,
  }

  writeLatestReportFiles({
    jsonPath: OUTPUT_JSON,
    markdownPath: OUTPUT_MD,
    report,
    markdown: buildMarkdown(report),
  })

  console.log('Route inventory agent')
  console.log(`- routes discovered: ${totals.routes}`)
  console.log(`- static routes: ${totals.staticRoutes}`)
  console.log(`- dynamic routes: ${totals.dynamicRoutes}`)
  console.log(`- auth-gated routes: ${totals.authGatedRoutes}`)
  console.log(`- added routes vs previous snapshot: ${added.length}`)
  console.log(`- removed routes vs previous snapshot: ${removed.length}`)

  await postSlack(buildSlackText(report))

  if (totals.routes === 0) {
    throw new Error('Route inventory is empty. This indicates a scan failure.')
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
