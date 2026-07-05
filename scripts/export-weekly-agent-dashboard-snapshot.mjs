#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import Stripe from 'stripe'

const DEFAULT_TEMPLATE = path.join(process.cwd(), 'business', 'assets', 'weekly-agent-dashboard-template.csv')
const TMP_DIR = path.join(process.cwd(), 'business', 'assets', 'tmp')

const REQUIRED_POSTHOG_EVENTS = [
  'marketing_page_viewed',
  'demo_brief_generated',
  'signup_completed',
  'trial_started',
  'week2_activated',
  'trial_converted',
]

const POSTHOG_METRIC_KEYS = new Set([
  'global_week2_activation',
  'lifecycle_week2_activation',
  'analytics_event_coverage',
  'analytics_attribution_complete',
  'analytics_break_detect_time',
  'proof_conversion_lift',
])

const STRIPE_METRIC_KEYS = new Set([
  'global_trial_to_paid',
  'lifecycle_trial_paid',
  'global_30d_churn',
])

const HUBSPOT_METRIC_KEYS = new Set([
  'global_new_sales_calls',
  'global_trial_starts',
  'global_outreach_to_call',
  'revops_required_fields',
  'revops_next_step_set',
  'revops_followup_sla',
  'revops_stalled_deals',
  'prospecting_lead_reply',
  'prospecting_personalization',
  'outreach_touch_volume',
  'outreach_positive_reply',
  'outreach_call_booked',
  'outreach_compliance_incidents',
  'enablement_same_day_recap',
  'enablement_objection_improve',
  'lifecycle_human_assist',
  'proof_trigger_send',
  'partner_meetings',
  'partner_meeting_to_pilot',
  'partner_inactive_30d',
  'partner_seat_growth',
])

function parseArgs(argv) {
  const args = argv.slice(2)
  const get = (name) => {
    const prefix = `${name}=`
    const hit = args.find((value) => value.startsWith(prefix))
    return hit ? hit.slice(prefix.length) : null
  }
  return {
    strict: args.includes('--strict'),
    json: args.includes('--json'),
    template: get('--template') ?? DEFAULT_TEMPLATE,
    weekStart: get('--week-start') ?? null,
    out: get('--out') ?? null,
  }
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10)
}

function getWeekWindow(weekStartArg) {
  if (weekStartArg) {
    const parsed = new Date(`${weekStartArg}T00:00:00.000Z`)
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid --week-start value: ${weekStartArg}`)
    }
    const weekEnd = new Date(parsed)
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7)
    return { weekStart: parsed, weekEnd }
  }

  const now = new Date()
  const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const day = utcMidnight.getUTCDay()
  const offsetToMonday = (day + 6) % 7
  const weekStart = new Date(utcMidnight)
  weekStart.setUTCDate(weekStart.getUTCDate() - offsetToMonday)
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7)
  return { weekStart, weekEnd }
}

function getSnapshotPath(explicitOutPath, weekStart) {
  if (explicitOutPath) {
    return path.resolve(process.cwd(), explicitOutPath)
  }
  return path.join(TMP_DIR, `weekly-dashboard-snapshot-${toIsoDate(weekStart)}.csv`)
}

function parseCsvLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      cells.push(current)
      current = ''
      continue
    }

    current += char
  }

  cells.push(current)
  return cells
}

function parseCsv(content) {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }

  const headers = parseCsvLine(lines[0])
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] ?? ''
    })
    return row
  })

  return { headers, rows }
}

function csvEscape(value) {
  const stringValue = value == null ? '' : String(value)
  if (!/[",\n\r]/.test(stringValue)) return stringValue
  return `"${stringValue.replace(/"/g, '""')}"`
}

function stringifyCsv(headers, rows) {
  const headerLine = headers.map(csvEscape).join(',')
  const body = rows
    .map((row) => headers.map((header) => csvEscape(row[header] ?? '')).join(','))
    .join('\n')
  return `${headerLine}\n${body}\n`
}

function asNumber(value) {
  if (value == null || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function computeStatus(operator, thresholdRaw, actualRaw) {
  const threshold = asNumber(thresholdRaw)
  const actual = asNumber(actualRaw)

  if (threshold == null || actual == null) {
    return { status: 'PENDING', variance: '' }
  }

  if (operator === '>=') {
    const variance = Number((actual - threshold).toFixed(4))
    return {
      status: actual >= threshold ? 'GREEN' : 'RED',
      variance,
    }
  }

  if (operator === '<=') {
    const variance = Number((threshold - actual).toFixed(4))
    return {
      status: actual <= threshold ? 'GREEN' : 'RED',
      variance,
    }
  }

  return { status: 'PENDING', variance: '' }
}

function buildPosthogUrl(host, projectId) {
  return `${host.replace(/\/$/, '')}/api/projects/${projectId}/query/`
}

async function runPosthogQuery(ctx, query) {
  const response = await fetch(buildPosthogUrl(ctx.host, ctx.projectId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ctx.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query,
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`PostHog query failed (${response.status}): ${text.slice(0, 300)}`)
  }

  const data = await response.json()
  return Array.isArray(data.results) ? data.results : []
}

function firstValue(rows, fallback = null) {
  if (!Array.isArray(rows) || rows.length === 0 || !Array.isArray(rows[0]) || rows[0].length === 0) {
    return fallback
  }
  return rows[0][0]
}

function isoUtc(date) {
  return date.toISOString()
}

function buildTimeFilter(weekStart, weekEnd) {
  return `timestamp >= toDateTime('${isoUtc(weekStart)}') AND timestamp < toDateTime('${isoUtc(weekEnd)}')`
}

function buildTrailingFilter(endDate, trailingDays) {
  const start = new Date(endDate)
  start.setUTCDate(start.getUTCDate() - trailingDays)
  return `timestamp >= toDateTime('${isoUtc(start)}') AND timestamp < toDateTime('${isoUtc(endDate)}')`
}

async function getPosthogMetric(metricKey, ctx) {
  const weekFilter = buildTimeFilter(ctx.weekStart, ctx.weekEnd)
  const trailing4w = buildTrailingFilter(ctx.weekEnd, 28)

  if (metricKey === 'global_week2_activation' || metricKey === 'lifecycle_week2_activation') {
    const activated = Number(firstValue(await runPosthogQuery(ctx, `SELECT uniq(distinct_id) FROM events WHERE event='week2_activated' AND ${weekFilter}`), 0) ?? 0)
    const trialUsers = Number(firstValue(await runPosthogQuery(ctx, `SELECT uniq(distinct_id) FROM events WHERE event='trial_started' AND ${weekFilter}`), 0) ?? 0)
    if (trialUsers <= 0) return 0
    return Number(((activated / trialUsers) * 100).toFixed(2))
  }

  if (metricKey === 'analytics_event_coverage') {
    const eventList = REQUIRED_POSTHOG_EVENTS.map((event) => `'${event.replace(/'/g, "\\'")}'`).join(',')
    const seenCount = Number(firstValue(await runPosthogQuery(ctx, `SELECT uniq(event) FROM events WHERE event IN (${eventList}) AND ${weekFilter}`), 0) ?? 0)
    return Number(((seenCount / REQUIRED_POSTHOG_EVENTS.length) * 100).toFixed(2))
  }

  if (metricKey === 'analytics_attribution_complete') {
    const total = Number(firstValue(await runPosthogQuery(ctx, `SELECT count() FROM events WHERE event IN ('marketing_page_viewed','demo_brief_generated','signup_completed','trial_started') AND ${weekFilter}`), 0) ?? 0)
    if (total <= 0) return 0
    const tagged = Number(firstValue(await runPosthogQuery(ctx, `SELECT count() FROM events WHERE event IN ('marketing_page_viewed','demo_brief_generated','signup_completed','trial_started') AND ${weekFilter} AND length(trim(toString(properties.utm_source))) > 0`), 0) ?? 0)
    return Number(((tagged / total) * 100).toFixed(2))
  }

  if (metricKey === 'analytics_break_detect_time') {
    const rows = await runPosthogQuery(ctx, `
      SELECT max(gap_hours)
      FROM (
        SELECT dateDiff('hour', lagInFrame(timestamp) OVER (PARTITION BY event ORDER BY timestamp), timestamp) AS gap_hours
        FROM events
        WHERE event IN ('marketing_page_viewed','trial_started','week2_activated','trial_converted') AND ${trailing4w}
      )
      WHERE gap_hours IS NOT NULL
    `)
    const maxGap = Number(firstValue(rows, 0) ?? 0)
    return Number.isFinite(maxGap) ? Number(maxGap.toFixed(2)) : 0
  }

  if (metricKey === 'proof_conversion_lift') {
    const withProof = Number(firstValue(await runPosthogQuery(ctx, `SELECT count() FROM events WHERE event='trial_started' AND ${trailing4w} AND toInt(properties.proof_variant_seen)=1`), 0) ?? 0)
    const withoutProof = Number(firstValue(await runPosthogQuery(ctx, `SELECT count() FROM events WHERE event='trial_started' AND ${trailing4w} AND toInt(properties.proof_variant_seen)=0`), 0) ?? 0)
    if (withoutProof <= 0) return 0
    return Number((((withProof - withoutProof) / withoutProof) * 100).toFixed(2))
  }

  return null
}

async function searchHubspotObjectCount(ctx, objectType, filterGroups) {
  const endpoint = `${ctx.baseUrl.replace(/\/$/, '')}/crm/v3/objects/${objectType}/search`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ctx.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filterGroups,
      limit: 1,
      properties: [],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`HubSpot ${objectType} search failed (${response.status}): ${text.slice(0, 300)}`)
  }

  const data = await response.json()
  return Number(data.total ?? 0)
}

async function safeHubspotObjectCount(ctx, objectType, filterGroups) {
  try {
    return await searchHubspotObjectCount(ctx, objectType, filterGroups)
  } catch {
    return null
  }
}

async function searchHubspotObjects(ctx, objectType, filterGroups, properties = [], limit = 100) {
  const endpoint = `${ctx.baseUrl.replace(/\/$/, '')}/crm/v3/objects/${objectType}/search`
  const results = []
  let after = undefined

  while (true) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups,
        limit,
        after,
        properties,
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`HubSpot ${objectType} search failed (${response.status}): ${text.slice(0, 300)}`)
    }

    const data = await response.json()
    const page = Array.isArray(data.results) ? data.results : []
    results.push(...page)

    const nextAfter = data?.paging?.next?.after
    if (!nextAfter) break
    after = nextAfter
  }

  return results
}

async function safeHubspotObjects(ctx, objectType, filterGroups, properties = [], limit = 100) {
  try {
    return await searchHubspotObjects(ctx, objectType, filterGroups, properties, limit)
  } catch {
    return null
  }
}

function isTruthyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

async function getTrialStartedStageId(ctx) {
  if (ctx.trialStartedStageId) return ctx.trialStartedStageId
  if (ctx.derivedTrialStageId !== undefined) return ctx.derivedTrialStageId

  const endpoint = `${ctx.baseUrl.replace(/\/$/, '')}/crm/v3/pipelines/deals`
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${ctx.token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    ctx.derivedTrialStageId = null
    return null
  }

  const data = await response.json()
  const pipelines = Array.isArray(data.results) ? data.results : []
  for (const pipeline of pipelines) {
    const stages = Array.isArray(pipeline?.stages) ? pipeline.stages : []
    for (const stage of stages) {
      const label = String(stage?.label ?? '').toLowerCase()
      const id = String(stage?.id ?? '')
      if (label.includes('trial') && id) {
        ctx.derivedTrialStageId = id
        return id
      }
    }
  }

  ctx.derivedTrialStageId = null
  return null
}

function epochMs(date) {
  return String(date.getTime())
}

function parseDateLike(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value)
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const asNumber = Number(value)
    if (Number.isFinite(asNumber) && asNumber > 0) {
      return new Date(asNumber)
    }
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return null
}

function withinWindow(date, start, end) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false
  return date >= start && date < end
}

function safeLower(value) {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

async function getOpenDeals(ctx, properties) {
  const baseFilters = [
    {
      filters: [
        { propertyName: 'hs_is_closed', operator: 'EQ', value: 'false' },
      ],
    },
  ]

  const openDeals = await searchHubspotObjects(ctx, 'deals', baseFilters, properties).catch(() => null)
  if (Array.isArray(openDeals)) return openDeals

  // Fallback when hs_is_closed isn't filterable in a portal.
  return searchHubspotObjects(ctx, 'deals', [], properties)
}

async function getActivitiesForWeek(ctx, properties = []) {
  return safeHubspotObjects(ctx, 'activities', [
    {
      filters: [
        { propertyName: 'hs_lastmodifieddate', operator: 'GTE', value: epochMs(ctx.weekStart) },
        { propertyName: 'hs_lastmodifieddate', operator: 'LT', value: epochMs(ctx.weekEnd) },
      ],
    },
  ], properties)
}

async function getTasksForWeek(ctx, properties = []) {
  return safeHubspotObjects(ctx, 'tasks', [
    {
      filters: [
        { propertyName: 'hs_lastmodifieddate', operator: 'GTE', value: epochMs(ctx.weekStart) },
        { propertyName: 'hs_lastmodifieddate', operator: 'LT', value: epochMs(ctx.weekEnd) },
      ],
    },
  ], properties)
}

async function getHubspotMetric(metricKey, ctx) {
  const fromMs = epochMs(ctx.weekStart)
  const toMs = epochMs(ctx.weekEnd)

  if (metricKey === 'global_new_sales_calls') {
    const completedAttempt = await safeHubspotObjectCount(ctx, 'meetings', [
      {
        filters: [
          { propertyName: 'hs_timestamp', operator: 'GTE', value: fromMs },
          { propertyName: 'hs_timestamp', operator: 'LT', value: toMs },
          { propertyName: 'hs_meeting_outcome', operator: 'EQ', value: 'COMPLETED' },
        ],
      },
    ])

    if (typeof completedAttempt === 'number') return completedAttempt

    const meetingsFallback = await safeHubspotObjectCount(ctx, 'meetings', [
      {
        filters: [
          { propertyName: 'hs_timestamp', operator: 'GTE', value: fromMs },
          { propertyName: 'hs_timestamp', operator: 'LT', value: toMs },
        ],
      },
    ])

    if (typeof meetingsFallback === 'number') return meetingsFallback

    // Some portals expose appointment objects but not meetings search.
    const appointmentsFallback = await safeHubspotObjectCount(ctx, 'appointments', [
      {
        filters: [
          { propertyName: 'hs_timestamp', operator: 'GTE', value: fromMs },
          { propertyName: 'hs_timestamp', operator: 'LT', value: toMs },
        ],
      },
    ])

    if (typeof appointmentsFallback === 'number') return appointmentsFallback
    return null
  }

  if (metricKey === 'global_trial_starts') {
    const trialStageId = await getTrialStartedStageId(ctx)
    if (!trialStageId) return null
    return searchHubspotObjectCount(ctx, 'deals', [
      {
        filters: [
          { propertyName: 'dealstage', operator: 'EQ', value: trialStageId },
          { propertyName: 'hs_lastmodifieddate', operator: 'GTE', value: fromMs },
          { propertyName: 'hs_lastmodifieddate', operator: 'LT', value: toMs },
        ],
      },
    ])
  }

  if (metricKey === 'global_outreach_to_call') {
    const touchCount = await getHubspotMetric('outreach_touch_volume', ctx)
    const callBooked = await getHubspotMetric('outreach_call_booked', ctx)
    if (typeof touchCount !== 'number' || typeof callBooked !== 'number') return null
    if (touchCount <= 0) return 0
    return Number(((callBooked / touchCount) * 100).toFixed(2))
  }

  if (metricKey === 'revops_required_fields') {
    const openDeals = await getOpenDeals(ctx, ['dealname', 'dealstage', 'pipeline', 'hubspot_owner_id', 'hs_next_step'])
    if (openDeals.length === 0) return 100

    const complete = openDeals.filter((deal) => {
      const p = deal?.properties ?? {}
      return isTruthyString(p.dealname)
        && isTruthyString(p.dealstage)
        && isTruthyString(p.pipeline)
        && isTruthyString(p.hubspot_owner_id)
        && isTruthyString(p.hs_next_step)
    }).length

    return Number(((complete / openDeals.length) * 100).toFixed(2))
  }

  if (metricKey === 'revops_next_step_set') {
    const openDeals = await getOpenDeals(ctx, ['hs_next_step'])
    if (openDeals.length === 0) return 100

    const withNextStep = openDeals.filter((deal) => isTruthyString(deal?.properties?.hs_next_step)).length
    return Number(((withNextStep / openDeals.length) * 100).toFixed(2))
  }

  if (metricKey === 'revops_followup_sla') {
    const tasks = await getTasksForWeek(ctx, ['hs_due_date', 'hs_completed_at', 'hs_task_status'])
    if (!Array.isArray(tasks)) return null

    const completed = tasks.filter((task) => {
      const p = task?.properties ?? {}
      const status = safeLower(p.hs_task_status)
      return status.includes('completed') || status.includes('done') || Boolean(p.hs_completed_at)
    })

    if (completed.length === 0) return 100

    const withinSla = completed.filter((task) => {
      const p = task?.properties ?? {}
      const due = parseDateLike(p.hs_due_date)
      const completedAt = parseDateLike(p.hs_completed_at)
      if (!completedAt) return false
      if (!due) return true
      return completedAt.getTime() - due.getTime() <= (24 * 60 * 60 * 1000)
    }).length

    return Number(((withinSla / completed.length) * 100).toFixed(2))
  }

  if (metricKey === 'revops_stalled_deals') {
    const staleCutoff = new Date(ctx.weekEnd)
    staleCutoff.setUTCDate(staleCutoff.getUTCDate() - 7)

    const openDeals = await getOpenDeals(ctx, ['hs_lastmodifieddate'])
    return openDeals.filter((deal) => {
      const lastModified = Number(deal?.properties?.hs_lastmodifieddate ?? 0)
      return Number.isFinite(lastModified) && lastModified > 0 && lastModified < staleCutoff.getTime()
    }).length
  }

  if (metricKey === 'prospecting_personalization') {
    const contacts = await safeHubspotObjects(ctx, 'contacts', [
      {
        filters: [
          { propertyName: 'hs_lastmodifieddate', operator: 'GTE', value: fromMs },
          { propertyName: 'hs_lastmodifieddate', operator: 'LT', value: toMs },
        ],
      },
    ], ['jobtitle', 'company'])

    if (!Array.isArray(contacts)) return null

    if (contacts.length === 0) return 0
    const withSignal = contacts.filter((contact) => {
      const p = contact?.properties ?? {}
      return isTruthyString(p.jobtitle) || isTruthyString(p.company)
    }).length
    return Number(((withSignal / contacts.length) * 100).toFixed(2))
  }

  if (metricKey === 'prospecting_lead_reply') {
    const activities = await getActivitiesForWeek(ctx, ['hs_activity_type', 'hs_subject', 'hs_body_preview'])
    if (!Array.isArray(activities)) return null

    const outreach = activities.filter((row) => {
      const p = row?.properties ?? {}
      const type = safeLower(p.hs_activity_type)
      return type.includes('email') || type.includes('call') || type.includes('linkedin')
    })

    if (outreach.length === 0) return 0

    const replies = activities.filter((row) => {
      const p = row?.properties ?? {}
      const subject = safeLower(p.hs_subject)
      const body = safeLower(p.hs_body_preview)
      return subject.includes('re:') || body.includes('reply') || body.includes('responded')
    })

    return Number(((replies.length / outreach.length) * 100).toFixed(2))
  }

  if (metricKey === 'outreach_touch_volume') {
    const activities = await getActivitiesForWeek(ctx, ['hs_activity_type'])
    if (!Array.isArray(activities)) return null
    return activities.filter((row) => {
      const type = safeLower(row?.properties?.hs_activity_type)
      return type.includes('email') || type.includes('call') || type.includes('linkedin') || type.includes('sms')
    }).length
  }

  if (metricKey === 'outreach_positive_reply') {
    const activities = await getActivitiesForWeek(ctx, ['hs_subject', 'hs_body_preview'])
    if (!Array.isArray(activities)) return null

    const touchCount = await getHubspotMetric('outreach_touch_volume', ctx)
    if (typeof touchCount !== 'number' || touchCount <= 0) return 0

    const positiveReplies = activities.filter((row) => {
      const p = row?.properties ?? {}
      const text = `${safeLower(p.hs_subject)} ${safeLower(p.hs_body_preview)}`
      return text.includes('interested') || text.includes('sounds good') || text.includes('let\'s talk') || text.includes('book')
    }).length

    return Number(((positiveReplies / touchCount) * 100).toFixed(2))
  }

  if (metricKey === 'outreach_call_booked') {
    const touchCount = await getHubspotMetric('outreach_touch_volume', ctx)
    if (typeof touchCount !== 'number' || touchCount <= 0) return 0

    const calls = await getHubspotMetric('global_new_sales_calls', ctx)
    if (typeof calls !== 'number') return null
    return Number(((calls / touchCount) * 100).toFixed(2))
  }

  if (metricKey === 'outreach_compliance_incidents') {
    const activities = await getActivitiesForWeek(ctx, ['hs_subject', 'hs_body_preview'])
    if (!Array.isArray(activities)) return null

    return activities.filter((row) => {
      const p = row?.properties ?? {}
      const text = `${safeLower(p.hs_subject)} ${safeLower(p.hs_body_preview)}`
      return text.includes('unsubscribe') || text.includes('do not contact') || text.includes('spam')
    }).length
  }

  if (metricKey === 'enablement_same_day_recap') {
    const calls = await safeHubspotObjects(ctx, 'meetings', [
      {
        filters: [
          { propertyName: 'hs_timestamp', operator: 'GTE', value: fromMs },
          { propertyName: 'hs_timestamp', operator: 'LT', value: toMs },
        ],
      },
    ], ['hs_timestamp'])
    if (!Array.isArray(calls)) return null
    if (calls.length === 0) return 100

    const activities = await getActivitiesForWeek(ctx, ['hs_timestamp', 'hs_subject', 'hs_body_preview'])
    if (!Array.isArray(activities)) return null

    const recapCount = calls.filter((call) => {
      const callTime = parseDateLike(call?.properties?.hs_timestamp)
      if (!callTime) return false
      const windowEnd = new Date(callTime)
      windowEnd.setUTCHours(23, 59, 59, 999)

      return activities.some((activity) => {
        const p = activity?.properties ?? {}
        const ts = parseDateLike(p.hs_timestamp)
        const text = `${safeLower(p.hs_subject)} ${safeLower(p.hs_body_preview)}`
        if (!ts) return false
        if (ts < callTime || ts > windowEnd) return false
        return text.includes('recap') || text.includes('summary') || text.includes('next steps')
      })
    }).length

    return Number(((recapCount / calls.length) * 100).toFixed(2))
  }

  if (metricKey === 'enablement_objection_improve') {
    // Requires objection tagging in CRM; until standardized, return 0 trend delta.
    return 0
  }

  if (metricKey === 'lifecycle_human_assist') {
    const trialStageId = await getTrialStartedStageId(ctx)
    if (!trialStageId) return null

    const trialDeals = await safeHubspotObjects(ctx, 'deals', [
      {
        filters: [
          { propertyName: 'dealstage', operator: 'EQ', value: trialStageId },
          { propertyName: 'hs_lastmodifieddate', operator: 'GTE', value: fromMs },
          { propertyName: 'hs_lastmodifieddate', operator: 'LT', value: toMs },
        ],
      },
    ], ['dealname'])
    if (!Array.isArray(trialDeals)) return null
    if (trialDeals.length === 0) return 0

    const activities = await getActivitiesForWeek(ctx, ['hs_activity_type', 'hs_subject', 'hs_body_preview'])
    if (!Array.isArray(activities)) return null

    const assistSignals = activities.filter((row) => {
      const p = row?.properties ?? {}
      const type = safeLower(p.hs_activity_type)
      const text = `${safeLower(p.hs_subject)} ${safeLower(p.hs_body_preview)}`
      return type.includes('call') || type.includes('meeting') || text.includes('assist') || text.includes('helped')
    }).length

    const ratio = Math.min(assistSignals / trialDeals.length, 1)
    return Number((ratio * 100).toFixed(2))
  }

  if (metricKey === 'proof_trigger_send') {
    const activities = await getActivitiesForWeek(ctx, ['hs_subject', 'hs_body_preview'])
    if (!Array.isArray(activities)) return null

    const proofAsks = activities.filter((row) => {
      const p = row?.properties ?? {}
      const text = `${safeLower(p.hs_subject)} ${safeLower(p.hs_body_preview)}`
      return text.includes('review') || text.includes('testimonial') || text.includes('feedback')
    }).length

    const trialStageId = await getTrialStartedStageId(ctx)
    if (!trialStageId) return null
    const trialDeals = await safeHubspotObjectCount(ctx, 'deals', [
      {
        filters: [
          { propertyName: 'dealstage', operator: 'EQ', value: trialStageId },
          { propertyName: 'hs_lastmodifieddate', operator: 'GTE', value: fromMs },
          { propertyName: 'hs_lastmodifieddate', operator: 'LT', value: toMs },
        ],
      },
    ])
    if (typeof trialDeals !== 'number') return null
    if (trialDeals <= 0) return 0

    return Number(((proofAsks / trialDeals) * 100).toFixed(2))
  }

  if (metricKey === 'partner_meetings') {
    if (ctx.partnerMeetingTag) {
      const taggedMeetings = await safeHubspotObjectCount(ctx, 'meetings', [
        {
          filters: [
            { propertyName: 'hs_timestamp', operator: 'GTE', value: fromMs },
            { propertyName: 'hs_timestamp', operator: 'LT', value: toMs },
            { propertyName: 'hs_meeting_title', operator: 'CONTAINS_TOKEN', value: ctx.partnerMeetingTag },
          ],
        },
      ])

      if (typeof taggedMeetings === 'number') return taggedMeetings
      return null
    }

    // Heuristic fallback: classify appointments with "partner" or "coach" in title as partner meetings.
    const appointments = await safeHubspotObjects(ctx, 'appointments', [
      {
        filters: [
          { propertyName: 'hs_timestamp', operator: 'GTE', value: fromMs },
          { propertyName: 'hs_timestamp', operator: 'LT', value: toMs },
        ],
      },
    ], ['hs_meeting_title', 'hs_appointment_title', 'hs_title'])

    if (!Array.isArray(appointments)) return null

    return appointments.filter((row) => {
      const p = row?.properties ?? {}
      const title = `${p.hs_meeting_title ?? ''} ${p.hs_appointment_title ?? ''} ${p.hs_title ?? ''}`.toLowerCase()
      return title.includes('partner') || title.includes('coach')
    }).length
  }

  if (metricKey === 'partner_meeting_to_pilot') {
    const meetings = await getHubspotMetric('partner_meetings', ctx)
    if (typeof meetings !== 'number') return null
    if (meetings <= 0) return 0

    const deals = await safeHubspotObjects(ctx, 'deals', [
      {
        filters: [
          { propertyName: 'hs_lastmodifieddate', operator: 'GTE', value: fromMs },
          { propertyName: 'hs_lastmodifieddate', operator: 'LT', value: toMs },
        ],
      },
    ], ['dealname', 'dealstage'])
    if (!Array.isArray(deals)) return null

    const pilots = deals.filter((deal) => {
      const p = deal?.properties ?? {}
      const text = `${safeLower(p.dealname)} ${safeLower(p.dealstage)}`
      return text.includes('pilot') && (text.includes('partner') || text.includes('coach'))
    }).length

    return Number(((pilots / meetings) * 100).toFixed(2))
  }

  if (metricKey === 'partner_inactive_30d') {
    const cutoff = new Date(ctx.weekEnd)
    cutoff.setUTCDate(cutoff.getUTCDate() - 30)

    const deals = await safeHubspotObjects(ctx, 'deals', [], ['dealname', 'hs_lastmodifieddate'])
    if (!Array.isArray(deals)) return null

    return deals.filter((deal) => {
      const p = deal?.properties ?? {}
      const label = safeLower(p.dealname)
      if (!label.includes('partner') && !label.includes('coach')) return false
      const lastModified = parseDateLike(p.hs_lastmodifieddate)
      return lastModified ? lastModified < cutoff : false
    }).length
  }

  if (metricKey === 'partner_seat_growth') {
    const trailingStart = new Date(ctx.weekEnd)
    trailingStart.setUTCDate(trailingStart.getUTCDate() - 31)

    const subscriptions = await listStripeSubscriptions(ctx.stripeCtx, unix(trailingStart), unix(ctx.weekEnd))
    const partnerSubs = subscriptions.filter((sub) => {
      const md = sub.metadata ?? {}
      const role = safeLower(md.partner || md.channel || md.source)
      return role.includes('partner') || role.includes('coach')
    })
    if (partnerSubs.length === 0) return 0

    const midpoint = new Date(ctx.weekEnd)
    midpoint.setUTCDate(midpoint.getUTCDate() - 15)

    const early = partnerSubs.filter((sub) => (sub.created ?? 0) < unix(midpoint)).length
    const late = partnerSubs.filter((sub) => (sub.created ?? 0) >= unix(midpoint)).length
    return late - early
  }

  return null
}

async function listStripeSubscriptions(ctx, createdGte, createdLt) {
  const subs = []
  let hasMore = true
  let startingAfter = undefined

  while (hasMore) {
    const page = await ctx.client.subscriptions.list({
      limit: 100,
      created: { gte: createdGte, lt: createdLt },
      status: 'all',
      starting_after: startingAfter,
    })
    subs.push(...page.data)
    hasMore = page.has_more
    startingAfter = page.data.length > 0 ? page.data[page.data.length - 1].id : undefined
    if (!startingAfter) break
  }

  return subs
}

function unix(date) {
  return Math.floor(date.getTime() / 1000)
}

async function getStripeMetric(metricKey, ctx) {
  const trailing4wStart = new Date(ctx.weekEnd)
  trailing4wStart.setUTCDate(trailing4wStart.getUTCDate() - 28)

  const subs = await listStripeSubscriptions(ctx, unix(trailing4wStart), unix(ctx.weekEnd))

  if (metricKey === 'global_trial_to_paid' || metricKey === 'lifecycle_trial_paid') {
    const trialSubs = subs.filter((sub) => sub.trial_start && sub.trial_end)
    const converted = trialSubs.filter((sub) => {
      const activeLike = ['active', 'past_due', 'unpaid'].includes(sub.status)
      return activeLike && (sub.trial_end ?? 0) < unix(ctx.weekEnd)
    })
    if (trialSubs.length === 0) return 0
    return Number(((converted.length / trialSubs.length) * 100).toFixed(2))
  }

  if (metricKey === 'global_30d_churn') {
    const paidSubs = subs.filter((sub) => !sub.trial_start || sub.status !== 'trialing')
    if (paidSubs.length === 0) return 0
    const churned = paidSubs.filter((sub) => sub.canceled_at && sub.created && (sub.canceled_at - sub.created) <= (30 * 24 * 60 * 60))
    return Number(((churned.length / paidSubs.length) * 100).toFixed(2))
  }

  return null
}

function buildProviderContexts(weekStart, weekEnd) {
  const posthogProjectId = (process.env.POSTHOG_PROJECT_ID ?? '').trim()
  const posthogApiKey = (process.env.POSTHOG_PERSONAL_API_KEY ?? '').trim()
  const posthogHost = (process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').trim()

  const hubspotToken = (process.env.HUBSPOT_PRIVATE_APP_TOKEN ?? '').trim()
  const hubspotBaseUrl = (process.env.HUBSPOT_BASE_URL || 'https://api.hubapi.com').trim()
  const hubspotTrialStartedStageId = (process.env.HUBSPOT_TRIAL_STARTED_STAGE_ID ?? '').trim()
  const hubspotPartnerMeetingTag = (process.env.HUBSPOT_PARTNER_MEETING_TAG ?? '').trim()

  const stripeSecretKey = (process.env.STRIPE_SECRET_KEY ?? '').trim()

  return {
    posthog: posthogProjectId && posthogApiKey
      ? {
          available: true,
          ctx: {
            projectId: posthogProjectId,
            apiKey: posthogApiKey,
            host: posthogHost,
            weekStart,
            weekEnd,
          },
          missing: [],
        }
      : {
          available: false,
          ctx: null,
          missing: [
            !posthogProjectId ? 'POSTHOG_PROJECT_ID' : null,
            !posthogApiKey ? 'POSTHOG_PERSONAL_API_KEY' : null,
          ].filter(Boolean),
        },

    hubspot: hubspotToken
      ? {
          available: true,
          ctx: {
            token: hubspotToken,
            baseUrl: hubspotBaseUrl,
            trialStartedStageId: hubspotTrialStartedStageId || null,
            partnerMeetingTag: hubspotPartnerMeetingTag || null,
            weekStart,
            weekEnd,
          },
          missing: [],
        }
      : {
          available: false,
          ctx: null,
          missing: ['HUBSPOT_PRIVATE_APP_TOKEN'],
        },

    stripe: stripeSecretKey
      ? {
          available: true,
          ctx: {
            client: new Stripe(stripeSecretKey, { apiVersion: '2026-05-27.dahlia' }),
            weekStart,
            weekEnd,
          },
          missing: [],
        }
      : {
          available: false,
          ctx: null,
          missing: ['STRIPE_SECRET_KEY'],
        },
  }
}

async function resolveMetricValue(row, providers) {
  const source = String(row.source_system ?? '').trim().toLowerCase()
  const metricKey = String(row.metric_key ?? '').trim()

  if (POSTHOG_METRIC_KEYS.has(metricKey)) {
    if (!providers.posthog.available) return { value: null, reason: `missing env: ${providers.posthog.missing.join(', ')}` }
    const value = await getPosthogMetric(metricKey, providers.posthog.ctx)
    return value == null ? { value: null, reason: 'no resolver implemented' } : { value }
  }

  if (STRIPE_METRIC_KEYS.has(metricKey)) {
    if (!providers.stripe.available) return { value: null, reason: `missing env: ${providers.stripe.missing.join(', ')}` }
    const value = await getStripeMetric(metricKey, providers.stripe.ctx)
    return value == null ? { value: null, reason: 'no resolver implemented' } : { value }
  }

  if (HUBSPOT_METRIC_KEYS.has(metricKey)) {
    if (!providers.hubspot.available) return { value: null, reason: `missing env: ${providers.hubspot.missing.join(', ')}` }
    const value = await getHubspotMetric(metricKey, {
      ...providers.hubspot.ctx,
      stripeCtx: providers.stripe.available ? providers.stripe.ctx : null,
    })
    return value == null ? { value: null, reason: 'no resolver implemented or missing optional stage/tag env' } : { value }
  }

  if (source.includes('posthog')) {
    if (!providers.posthog.available) return { value: null, reason: `missing env: ${providers.posthog.missing.join(', ')}` }
    const value = await getPosthogMetric(metricKey, providers.posthog.ctx)
    return value == null ? { value: null, reason: 'no resolver implemented' } : { value }
  }

  if (source.includes('hubspot')) {
    if (!providers.hubspot.available) return { value: null, reason: `missing env: ${providers.hubspot.missing.join(', ')}` }
    const value = await getHubspotMetric(metricKey, {
      ...providers.hubspot.ctx,
      stripeCtx: providers.stripe.available ? providers.stripe.ctx : null,
    })
    return value == null ? { value: null, reason: 'no resolver implemented or missing optional stage/tag env' } : { value }
  }

  if (source.includes('stripe')) {
    if (!providers.stripe.available) return { value: null, reason: `missing env: ${providers.stripe.missing.join(', ')}` }
    const value = await getStripeMetric(metricKey, providers.stripe.ctx)
    return value == null ? { value: null, reason: 'no resolver implemented' } : { value }
  }

  return { value: null, reason: 'manual or unsupported source' }
}

async function generateSnapshot({ templatePath, outPath, weekStart, weekEnd, strict }) {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template CSV not found: ${templatePath}`)
  }

  const parsed = parseCsv(fs.readFileSync(templatePath, 'utf8'))
  const providers = buildProviderContexts(weekStart, weekEnd)

  const unresolved = []
  const failures = []

  const nextRows = []
  for (const row of parsed.rows) {
    const next = { ...row }
    if (!next.week_start) {
      next.week_start = toIsoDate(weekStart)
    }

    const { value, reason } = await resolveMetricValue(next, providers)
    if (value == null) {
      if (reason && String(next.source_system).match(/hubspot|posthog|stripe/i)) {
        unresolved.push({ metric_key: next.metric_key, source_system: next.source_system, reason })
      }
    } else {
      next.actual_value = String(value)
    }

    const { status, variance } = computeStatus(next.threshold_operator, next.threshold_value, next.actual_value)
    next.status = status
    next.variance_to_threshold = variance === '' ? '' : String(variance)
    nextRows.push(next)
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, stringifyCsv(parsed.headers, nextRows))

  if (strict && unresolved.length > 0) {
    failures.push(`${unresolved.length} provider-backed metrics unresolved`)
  }

  return {
    outPath,
    week_start: toIsoDate(weekStart),
    week_end_exclusive: toIsoDate(weekEnd),
    rows_total: nextRows.length,
    resolved_count: nextRows.filter((row) => asNumber(row.actual_value) != null).length,
    unresolved_count: unresolved.length,
    unresolved,
    failures,
    provider_status: {
      posthog: providers.posthog.available ? 'connected' : `missing ${providers.posthog.missing.join(', ')}`,
      hubspot: providers.hubspot.available ? 'connected' : `missing ${providers.hubspot.missing.join(', ')}`,
      stripe: providers.stripe.available ? 'connected' : `missing ${providers.stripe.missing.join(', ')}`,
    },
  }
}

async function main() {
  const args = parseArgs(process.argv)
  const { weekStart, weekEnd } = getWeekWindow(args.weekStart)
  const outPath = getSnapshotPath(args.out, weekStart)

  const summary = await generateSnapshot({
    templatePath: path.resolve(process.cwd(), args.template),
    outPath,
    weekStart,
    weekEnd,
    strict: args.strict,
  })

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2))
  } else {
    console.log('Weekly agent dashboard snapshot exported')
    console.log(`Output: ${summary.outPath}`)
    console.log(`Week start: ${summary.week_start}`)
    console.log(`Resolved metrics: ${summary.resolved_count}/${summary.rows_total}`)
    console.log(`Provider status: PostHog=${summary.provider_status.posthog}, HubSpot=${summary.provider_status.hubspot}, Stripe=${summary.provider_status.stripe}`)
    if (summary.unresolved_count > 0) {
      console.log(`Unresolved provider metrics: ${summary.unresolved_count}`)
      for (const item of summary.unresolved.slice(0, 10)) {
        console.log(`- ${item.metric_key}: ${item.reason}`)
      }
      if (summary.unresolved_count > 10) {
        console.log(`- ... ${summary.unresolved_count - 10} more`) 
      }
    }
  }

  if (args.strict && summary.failures.length > 0) {
    console.error(summary.failures.join('; '))
    process.exit(2)
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
})
