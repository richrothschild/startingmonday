import fs from 'node:fs'
import path from 'node:path'

let latestCompanionReports = null

/**
 * Classify a route into a tier based on its path.
 * @param {string} routePath - Route path (e.g., '/dashboard', '/signup', '/')
 * @returns {string} Tier: 'dashboard', 'funnel', 'public', or 'admin'
 */
export function routeToTier(routePath) {
  if (!routePath || routePath === '/') return 'public'
  
  const lower = routePath.toLowerCase()
  
  // Dashboard tier: authenticated routes
  if (lower.startsWith('/dashboard')) return 'dashboard'
  if (lower.startsWith('/(dashboard)')) return 'dashboard'
  
  // Funnel tier: signup, login, onboarding
  if (lower.includes('signup')) return 'funnel'
  if (lower.includes('login')) return 'funnel'
  if (lower.includes('auth')) return 'funnel'
  if (lower.includes('onboarding')) return 'funnel'
  
  // Admin tier
  if (lower.startsWith('/admin')) return 'admin'
  if (lower.includes('admin')) return 'admin'
  
  // Default: public
  return 'public'
}

/**
 * Load the Site Experience Standard (SES) config.
 * @param {string} sesPath - Path to SES config file
 * @returns {Object} Parsed SES config
 */
export function loadSES(sesPath = 'config/site-experience-standard.json') {
  const content = fs.readFileSync(sesPath, 'utf8')
  return JSON.parse(content)
}

/**
 * Get tier-based thresholds from SES for a given route tier.
 * @param {Object} ses - SES config object (from loadSES)
 * @param {string} tier - Route tier ('funnel', 'dashboard', 'public', 'admin')
 * @param {string} thresholdType - Type of threshold ('cwvBudget', 'gradeThresholds', 'trustContracts')
 * @returns {Object} Tier-specific thresholds or empty object if not found
 */
export function getTierThresholds(ses, tier, thresholdType = 'cwvBudget') {
  return ses?.tiers?.[tier]?.[thresholdType] ?? {}
}

/**
 * Get a specific Core Web Vital budget value for a tier.
 * @param {Object} ses - SES config object
 * @param {string} tier - Route tier
 * @param {string} metric - Metric name ('lcpP75Ms', 'ttfbP75Ms', 'clsP75', 'inpP75Ms')
 * @returns {number} Budget value or null if not found
 */
export function getCWVBudget(ses, tier, metric) {
  return getTierThresholds(ses, tier, 'cwvBudget')[metric] ?? null
}

export function ageMinutes(isoTime) {
  return Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000)
}

export async function ghJson({ owner, repo, token, pathname, userAgent }) {
  if (!owner || !repo || !token) {
    throw new Error('Missing GITHUB_REPOSITORY or GITHUB_TOKEN')
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': userAgent,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GitHub API ${res.status} for ${pathname}: ${text.slice(0, 300)}`)
  }

  return res.json()
}

export function writeLatestReportFiles({ jsonPath, markdownPath, report, markdown }) {
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true })
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(markdownPath, markdown, 'utf8')

  const companions = writeCompanionReportFiles({ markdownPath, report, markdown })
  latestCompanionReports = companions
  return companions
}

export async function postSlackText({ webhookUrl, text }) {
  if (!webhookUrl) {
    return false
  }

  const message = appendCompanionReportPaths(text)

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  })

  return true
}

function appendCompanionReportPaths(text) {
  if (!latestCompanionReports) return text
  if (text.includes('Executive summary file:') && text.includes('WBS file:')) return text

  return [
    text,
    '',
    '*Companion reports*',
    `- Executive summary file: ${latestCompanionReports.summaryRelativePath}`,
    `- WBS file: ${latestCompanionReports.wbsRelativePath}`,
  ].join('\n')
}

function writeCompanionReportFiles({ markdownPath, report, markdown }) {
  const reportsDir = path.dirname(markdownPath)
  const markdownBaseName = path.basename(markdownPath)
  const stem = markdownBaseName
    .replace(/\.latest\.md$/i, '')
    .replace(/\.md$/i, '')

  const runTimestamp = toRunTimestamp(report?.generatedAt)
  const summaryFileName = `${stem}-executive-summary-and-wbs-${runTimestamp}.md`
  const wbsFileName = `${stem}-remediation-wbs-${runTimestamp}.md`
  const summaryPath = path.join(reportsDir, summaryFileName)
  const wbsPath = path.join(reportsDir, wbsFileName)

  const summaryMarkdown = buildCompanionExecutiveSummaryMarkdown({ stem, report, markdown, wbsFileName })
  const wbsMarkdown = buildCompanionWbsMarkdown({ stem, report, summaryFileName })

  fs.writeFileSync(summaryPath, summaryMarkdown, 'utf8')
  fs.writeFileSync(wbsPath, wbsMarkdown, 'utf8')

  return {
    summaryPath,
    wbsPath,
    summaryRelativePath: path.relative(process.cwd(), summaryPath).replace(/\\/g, '/'),
    wbsRelativePath: path.relative(process.cwd(), wbsPath).replace(/\\/g, '/'),
  }
}

function toRunTimestamp(value) {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().replace(/[:.]/g, '-').replace(/Z$/, 'Z')
  }
  return date.toISOString().replace(/[:.]/g, '-').replace(/Z$/, 'Z')
}

function titleFromStem(stem) {
  return stem
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildCompanionExecutiveSummaryMarkdown({ stem, report, markdown, wbsFileName }) {
  const title = titleFromStem(stem)
  const generatedAt = report?.generatedAt ?? new Date().toISOString()
  const keyBullets = extractKeyBullets(markdown)
  const reportStatus = deriveOverallStatus(report)

  const lines = []
  lines.push(`# ${title} Executive Summary and Remediation WBS`)
  lines.push('')
  lines.push(`Date: ${generatedAt}`)
  lines.push(`Source baseline: docs/status/${stem}.latest.md`)
  lines.push('')
  lines.push('## Rolled-Up Executive Summary')
  lines.push('')
  lines.push(`1. Overall status: ${reportStatus}.`)
  lines.push('2. This companion file is generated for every report run to preserve run-scoped executive context.')
  lines.push('3. Remediation work breakdown is published in the paired WBS companion file listed below.')
  lines.push('')
  lines.push('## Executive Summary Highlights')
  lines.push('')
  if (keyBullets.length === 0) {
    lines.push('- No bullet highlights were detected in the baseline markdown report.')
  } else {
    for (const bullet of keyBullets) {
      lines.push(`- ${bullet}`)
    }
  }
  lines.push('')
  lines.push('## Work Breakdown Structure for Approved Changes')
  lines.push('')
  lines.push(`- See companion file: docs/status/${wbsFileName}`)
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildCompanionWbsMarkdown({ stem, report, summaryFileName }) {
  const title = titleFromStem(stem)
  const generatedAt = report?.generatedAt ?? new Date().toISOString()
  const workItems = deriveWorkItems(report)

  const lines = []
  lines.push(`# ${title} Remediation Work Breakdown Structure`)
  lines.push('')
  lines.push(`Date: ${generatedAt}`)
  lines.push(`Source baseline: docs/status/${summaryFileName}`)
  lines.push('')
  lines.push('## Legend')
  lines.push('')
  lines.push('- Severity: P0 critical, P1 high, P2 medium, P3 low')
  lines.push('- Impact domains: Conversion, Trust, Reliability, Editorial Quality, Governance')
  lines.push('')

  for (let i = 0; i < workItems.length; i += 1) {
    const item = workItems[i]
    const index = String(i + 1).padStart(2, '0')
    lines.push(`## WBS-${index} ${item.title}`)
    lines.push('')
    lines.push(`- Severity: ${item.severity}`)
    lines.push(`- Why it matters: ${item.why}`)
    lines.push(`- Evidence: ${item.evidence}`)
    lines.push('- Work items:')
    lines.push('1. Confirm owner and ETA.')
    lines.push('2. Implement the remediation change.')
    lines.push('3. Verify with deterministic rerun and artifact evidence.')
    lines.push('4. Close with trend/recurrence guardrail updates.')
    lines.push(`- Deliverable: ${item.deliverable}`)
    lines.push('- Owner: To be assigned.')
    lines.push('')
  }

  lines.push('## Approval Checklist')
  lines.push('')
  lines.push('- Confirm severity and owner assignment per WBS item.')
  lines.push('- Confirm target dates and weekly checkpoint cadence.')
  lines.push('- Confirm which gates should be hard-fail versus alert-only.')
  lines.push('')

  return `${lines.join('\n')}\n`
}

function extractKeyBullets(markdown) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^-\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^[-\d.\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 8)
}

function deriveOverallStatus(report) {
  if (typeof report?.status === 'string' && report.status.trim()) return report.status
  if (typeof report?.overallStatus === 'string' && report.overallStatus.trim()) return report.overallStatus
  if (Array.isArray(report?.workflowHealth)) {
    const unhealthy = report.workflowHealth.filter((row) => row?.status && row.status !== 'healthy')
    return unhealthy.length === 0 ? 'healthy' : 'elevated risk'
  }
  return 'monitoring'
}

function deriveWorkItems(report) {
  if (Array.isArray(report?.missing) && report.missing.length > 0) {
    return report.missing.slice(0, 6).map((item) => ({
      title: truncateSentence(item, 70),
      severity: 'P2',
      why: 'This gap can reduce report quality and slow remediation confidence.',
      evidence: item,
      deliverable: 'Gap is closed and verified in the next report run.',
    }))
  }

  if (Array.isArray(report?.findings) && report.findings.length > 0) {
    return report.findings.slice(0, 6).map((item) => ({
      title: truncateSentence(item?.title ?? item?.message ?? 'Finding remediation', 70),
      severity: item?.severity ?? 'P2',
      why: 'Open findings represent unresolved user-facing or governance risk.',
      evidence: item?.title ?? item?.message ?? JSON.stringify(item),
      deliverable: 'Finding is resolved and no longer appears in subsequent runs.',
    }))
  }

  return [
    {
      title: 'General report hardening and follow-up',
      severity: 'P2',
      why: 'Every report run should result in explicit ownership and closure tracking.',
      evidence: 'No explicit structured remediation list was detected in the base report payload.',
      deliverable: 'Owner-assigned remediation plan exists and is linked to this run.',
    },
  ]
}

function truncateSentence(text, maxLength) {
  const normalized = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trim()}...`
}

/**
 * Get an ISO date string for N days ago.
 * @param {number} days - Number of days in the past
 * @returns {string} ISO date string
 */
export function daysAgoIso(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * Fetch all workflow runs since a given ISO date.
 * Uses pagination to handle large result sets.
 * @param {Function} ghJsonFn - ghJson function (bound to owner/repo/token/userAgent)
 * @param {string} workflowId - Workflow ID or filename
 * @param {string} sinceIso - ISO date string to filter from
 * @returns {Array} Array of workflow runs
 */
export async function getRunsSince(ghJsonFn, workflowId, sinceIso) {
  const runs = []
  const maxPages = 120
  const perPage = 100

  for (let page = 1; page <= maxPages; page += 1) {
    const data = await ghJsonFn(
      `/actions/workflows/${workflowId}/runs?branch=main&status=completed&per_page=${perPage}&page=${page}`
    )
    const pageRuns = data.workflow_runs ?? []

    if (pageRuns.length === 0) break

    let shouldStop = false
    for (const run of pageRuns) {
      if (run.created_at < sinceIso) {
        shouldStop = true
        continue
      }
      runs.push(run)
    }

    if (shouldStop) break
  }

  return runs
}
