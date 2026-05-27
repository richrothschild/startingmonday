import { createAdminClient } from '@/lib/supabase/admin'

const ROLE_PATH_CTA_PREFIX = 'footer_role_path_'
const LOOKBACK_DAYS = 90
const CONVERSION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000
const MAX_EVENTS = 15000
const POSTHOG_QUERY_TIMEOUT_MS = 8000

const CONVERSION_EVENTS = new Set([
  'onboarding_started',
  'onboarding_completed',
  'activation_complete',
  'offer_accepted',
])

type EventRow = {
  user_id: string
  event_name: string
  created_at: string
  properties: unknown
}

type RolePathStats = {
  authenticatedClicks: number
  posthogClicks: number
  clickUsers: Set<string>
  conversionUsers: Set<string>
}

type PosthogQueryResponse = {
  columns?: unknown
  results?: unknown
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  return value as Record<string, unknown>
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  return typeof value === 'string' ? value : null
}

function normalizePosthogApiHost(rawHost: string): string {
  const host = rawHost.trim().replace(/\/+$/, '')
  if (host.includes('.i.posthog.com')) {
    return host.replace('.i.posthog.com', '.posthog.com')
  }
  return host
}

function readNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function parsePosthogRows(payload: PosthogQueryResponse): Array<Record<string, unknown>> {
  if (!Array.isArray(payload.results)) {
    return []
  }

  if (payload.results.every((row) => row && typeof row === 'object' && !Array.isArray(row))) {
    return payload.results as Array<Record<string, unknown>>
  }

  if (!Array.isArray(payload.columns)) {
    return []
  }

  const columns = payload.columns.filter((column): column is string => typeof column === 'string')
  if (!columns.length) return []

  return payload.results
    .filter((row): row is unknown[] => Array.isArray(row))
    .map((row) => {
      const mapped: Record<string, unknown> = {}
      for (let index = 0; index < columns.length; index += 1) {
        mapped[columns[index]] = row[index]
      }
      return mapped
    })
}

async function getPosthogRolePathClicksByCtaKey(): Promise<Record<string, number>> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim()
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim()
  const configuredHost = process.env.POSTHOG_API_HOST?.trim() || process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com'

  if (!apiKey || !projectId) {
    return {}
  }

  const host = normalizePosthogApiHost(configuredHost)
  const sinceIso = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const endpoint = `${host}/api/projects/${projectId}/query/`
  const hogql = `
SELECT
  properties.cta_label AS cta_label,
  count() AS clicks
FROM events
WHERE event = 'channel_entry_clicked'
  AND timestamp >= toDateTime('${sinceIso}')
  AND properties.source_page = '/'
  AND properties.cta_label LIKE '${ROLE_PATH_CTA_PREFIX}%'
GROUP BY cta_label
ORDER BY clicks DESC
LIMIT 200
`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), POSTHOG_QUERY_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: hogql.trim(),
        },
      }),
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!response.ok) {
      return {}
    }

    const payload = (await response.json().catch(() => null)) as PosthogQueryResponse | null
    if (!payload) return {}

    const rows = parsePosthogRows(payload)
    const clicksByCtaKey: Record<string, number> = {}

    for (const row of rows) {
      const ctaLabel = readString(row, 'cta_label')
      const clicks = readNumber(row, 'clicks')
      if (!ctaLabel?.startsWith(ROLE_PATH_CTA_PREFIX) || !clicks || clicks <= 0) {
        continue
      }

      const ctaKey = ctaLabel.slice(ROLE_PATH_CTA_PREFIX.length)
      if (!ctaKey) continue
      clicksByCtaKey[ctaKey] = (clicksByCtaKey[ctaKey] ?? 0) + clicks
    }

    return clicksByCtaKey
  } catch {
    return {}
  } finally {
    clearTimeout(timeout)
  }
}

export async function getRolePathPriorityByCtaKey(): Promise<Record<string, number>> {
  const rows = await getRolePathPriorityDebugRows()
  return Object.fromEntries(rows.map((row) => [row.ctaKey, row.rank]))
}

export type RolePathPriorityDebugRow = {
  ctaKey: string
  rank: number
  clicks: number
  authenticatedClicks: number
  anonymousClickEstimate: number
  conversionUsers: number
  conversionRate: number
  score: number
}

export async function getRolePathPriorityDebugRows(): Promise<RolePathPriorityDebugRow[]> {
  try {
    const admin = createAdminClient()
    const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await admin
      .from('user_events')
      .select('user_id, event_name, created_at, properties')
      .in('event_name', ['channel_entry_clicked', ...CONVERSION_EVENTS])
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(MAX_EVENTS)

    if (error) {
      return []
    }

    const events = (data ?? []) as EventRow[]
    const conversionTimesByUser = new Map<string, number[]>()
    const firstClickTimeByUserAndCtaKey = new Map<string, number>()
    const statsByCtaKey = new Map<string, RolePathStats>()

    const ensureStats = (ctaKey: string): RolePathStats => {
      const existing = statsByCtaKey.get(ctaKey)
      if (existing) return existing
      const created: RolePathStats = {
        authenticatedClicks: 0,
        posthogClicks: 0,
        clickUsers: new Set<string>(),
        conversionUsers: new Set<string>(),
      }
      statsByCtaKey.set(ctaKey, created)
      return created
    }

    for (const event of events) {
      const ts = Date.parse(event.created_at)
      if (!Number.isFinite(ts) || !event.user_id) continue

      if (CONVERSION_EVENTS.has(event.event_name)) {
        const list = conversionTimesByUser.get(event.user_id) ?? []
        list.push(ts)
        conversionTimesByUser.set(event.user_id, list)
        continue
      }

      if (event.event_name !== 'channel_entry_clicked') {
        continue
      }

      const properties = asRecord(event.properties)
      const sourcePage = readString(properties, 'source_page')
      const ctaLabel = readString(properties, 'cta_label')
      if (sourcePage !== '/' || !ctaLabel?.startsWith(ROLE_PATH_CTA_PREFIX)) {
        continue
      }

      const ctaKey = ctaLabel.slice(ROLE_PATH_CTA_PREFIX.length)
      if (!ctaKey) continue

      const stats = ensureStats(ctaKey)
      stats.authenticatedClicks += 1
      stats.clickUsers.add(event.user_id)

      const userAndKey = `${event.user_id}::${ctaKey}`
      if (!firstClickTimeByUserAndCtaKey.has(userAndKey)) {
        firstClickTimeByUserAndCtaKey.set(userAndKey, ts)
      }
    }

    const posthogClicksByCtaKey = await getPosthogRolePathClicksByCtaKey()
    for (const [ctaKey, clicks] of Object.entries(posthogClicksByCtaKey)) {
      if (!Number.isFinite(clicks) || clicks <= 0) continue
      const stats = ensureStats(ctaKey)
      stats.posthogClicks = clicks
    }

    for (const [userAndKey, firstClickTs] of firstClickTimeByUserAndCtaKey.entries()) {
      const separatorIndex = userAndKey.indexOf('::')
      if (separatorIndex <= 0) continue
      const userId = userAndKey.slice(0, separatorIndex)
      const ctaKey = userAndKey.slice(separatorIndex + 2)
      const conversionTimes = conversionTimesByUser.get(userId) ?? []
      const converted = conversionTimes.some((conversionTs) => (
        conversionTs > firstClickTs && conversionTs <= firstClickTs + CONVERSION_WINDOW_MS
      ))
      if (!converted) continue

      const stats = statsByCtaKey.get(ctaKey)
      if (!stats) continue
      stats.conversionUsers.add(userId)
    }

    const totalClicks = Array.from(statsByCtaKey.values()).reduce((sum, stats) => {
      const clicks = Math.max(stats.authenticatedClicks, stats.posthogClicks)
      return sum + clicks
    }, 0)
    if (!totalClicks) {
      return []
    }

    const scored = Array.from(statsByCtaKey.entries()).map(([ctaKey, stats], index) => {
      const clicks = Math.max(stats.authenticatedClicks, stats.posthogClicks)
      const clickThroughShare = clicks / totalClicks
      const conversionRate = stats.clickUsers.size ? stats.conversionUsers.size / stats.clickUsers.size : 0
      const score = clickThroughShare * 0.7 + conversionRate * 0.3

      return {
        ctaKey,
        originalIndex: index,
        score,
        clicks,
        authenticatedClicks: stats.authenticatedClicks,
        anonymousClickEstimate: Math.max(0, clicks - stats.authenticatedClicks),
        conversionUsers: stats.conversionUsers.size,
        conversionRate,
      }
    })

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.clicks !== a.clicks) return b.clicks - a.clicks
      if (b.conversionRate !== a.conversionRate) return b.conversionRate - a.conversionRate
      if (b.originalIndex !== a.originalIndex) return a.originalIndex - b.originalIndex
      return a.ctaKey.localeCompare(b.ctaKey)
    })

    return scored.map((entry, index) => ({
      ctaKey: entry.ctaKey,
      rank: index + 1,
      clicks: entry.clicks,
      authenticatedClicks: entry.authenticatedClicks,
      anonymousClickEstimate: entry.anonymousClickEstimate,
      conversionUsers: entry.conversionUsers,
      conversionRate: entry.conversionRate,
      score: entry.score,
    }))
  } catch {
    return []
  }
}
