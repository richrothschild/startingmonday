import fs from 'node:fs'
import path from 'node:path'

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
}

export async function postSlackText({ webhookUrl, text }) {
  if (!webhookUrl) {
    return false
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  return true
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
