import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const DEFAULT_WINDOW_DAYS = 30
const OUTPUT_JSON_PATH = path.join(process.cwd(), 'docs', 'status', 'relationship-kpi-chain.latest.json')
const OUTPUT_MD_PATH = path.join(process.cwd(), 'docs', 'status', 'relationship-kpi-chain.latest.md')
const OUTPUT_USER_CSV_PATH = path.join(process.cwd(), 'docs', 'status', 'relationship-kpi-chain.user-breakdown.latest.csv')

function parseArgs(argv) {
  const args = argv.slice(2)
  let windowDays = DEFAULT_WINDOW_DAYS
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--window-days' && args[i + 1]) {
      const parsed = Number(args[i + 1])
      if (Number.isFinite(parsed) && parsed > 0) windowDays = Math.floor(parsed)
      i += 1
    }
  }

  const argSet = new Set(args)
  return {
    windowDays,
    json: argSet.has('--json'),
    markdown: argSet.has('--markdown'),
    summary: argSet.has('--summary'),
    strict: argSet.has('--strict'),
  }
}

function isoDaysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function dayKey(value) {
  return new Date(value).toISOString().slice(0, 10)
}

export function safeRate(numerator, denominator) {
  if (!denominator || denominator <= 0) return 0
  return Number((numerator / denominator).toFixed(4))
}

function csvEscape(value) {
  const text = String(value ?? '')
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function toCsv(rows, columns) {
  const header = columns.join(',')
  const body = rows.map((row) => columns.map((column) => csvEscape(row[column])).join(','))
  return `${[header, ...body].join('\n')}\n`
}

async function fetchRows(windowDays) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const sinceIso = isoDaysAgo(windowDays)
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const [recommendationRes, relationshipActionRes, partnerInterviewRes, companyInterviewRes] = await Promise.all([
    supabase
      .from('user_events')
      .select('id, user_id, created_at, properties')
      .eq('event_name', 'discover_recommendation_added')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .limit(50000),
    supabase
      .from('user_events')
      .select('id, user_id, created_at, properties')
      .eq('event_name', 'briefing_action_clicked')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .limit(50000),
    supabase
      .from('partner_outcome_events')
      .select('id, user_id, created_at, metadata')
      .eq('event_type', 'interview_stage_advance')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .limit(50000),
    supabase
      .from('company_interview_logs')
      .select('id, user_id, created_at, company_id')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .limit(50000),
  ])

  const errors = [recommendationRes.error, relationshipActionRes.error, partnerInterviewRes.error, companyInterviewRes.error]
    .filter(Boolean)
    .map((err) => err.message)
  if (errors.length) {
    throw new Error(errors.join(' | '))
  }

  return {
    recommendations: recommendationRes.data ?? [],
    relationshipActions: relationshipActionRes.data ?? [],
    partnerInterviews: partnerInterviewRes.data ?? [],
    companyInterviews: companyInterviewRes.data ?? [],
    sinceIso,
  }
}

export function aggregate(payload, windowDays) {
  const relationshipActions = payload.relationshipActions.filter((event) => {
    const props = event.properties && typeof event.properties === 'object' ? event.properties : {}
    return props.chain_stage === 'relationship_action'
  })

  const actionTypeBreakdown = relationshipActions.reduce((acc, event) => {
    const props = event.properties && typeof event.properties === 'object' ? event.properties : {}
    const touchType = typeof props.touch_type === 'string' ? props.touch_type : null
    const actionType = typeof props.action_type === 'string' ? props.action_type : null
    const noteType = typeof props.note_type === 'string' ? `note:${props.note_type}` : null
    const sourceType = typeof props.source === 'string' ? `source:${props.source}` : 'source:unknown'
    const key = actionType ?? touchType ?? noteType ?? sourceType
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const actionChannelBreakdown = relationshipActions.reduce((acc, event) => {
    const props = event.properties && typeof event.properties === 'object' ? event.properties : {}
    const key = typeof props.action_channel === 'string'
      ? props.action_channel
      : (typeof props.direction === 'string' ? `direction:${props.direction}` : 'unknown')
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const recommendationUsers = new Set(payload.recommendations.map((row) => row.user_id))
  const relationshipActionUsers = new Set(relationshipActions.map((row) => row.user_id))
  const partnerInterviewUsers = new Set(payload.partnerInterviews.map((row) => row.user_id))
  const companyInterviewUsers = new Set(payload.companyInterviews.map((row) => row.user_id))
  const interviewUsers = new Set([...partnerInterviewUsers, ...companyInterviewUsers])

  const actionByUser = relationshipActions.reduce((acc, row) => {
    acc[row.user_id] = (acc[row.user_id] ?? 0) + 1
    return acc
  }, {})

  const recommendationsByUser = payload.recommendations.reduce((acc, row) => {
    acc[row.user_id] = (acc[row.user_id] ?? 0) + 1
    return acc
  }, {})

  const chainUsers = [...recommendationUsers].filter((userId) => relationshipActionUsers.has(userId) && interviewUsers.has(userId))

  const interviewByUser = {}
  for (const row of payload.partnerInterviews) {
    interviewByUser[row.user_id] = (interviewByUser[row.user_id] ?? 0) + 1
  }
  for (const row of payload.companyInterviews) {
    interviewByUser[row.user_id] = (interviewByUser[row.user_id] ?? 0) + 1
  }

  const daily = {}
  for (const row of payload.recommendations) {
    const day = dayKey(row.created_at)
    ;(daily[day] ??= { day, recommendationsAccepted: 0, relationshipActions: 0, interviewsAdvanced: 0 }).recommendationsAccepted += 1
  }
  for (const row of relationshipActions) {
    const day = dayKey(row.created_at)
    ;(daily[day] ??= { day, recommendationsAccepted: 0, relationshipActions: 0, interviewsAdvanced: 0 }).relationshipActions += 1
  }
  for (const row of payload.partnerInterviews) {
    const day = dayKey(row.created_at)
    ;(daily[day] ??= { day, recommendationsAccepted: 0, relationshipActions: 0, interviewsAdvanced: 0 }).interviewsAdvanced += 1
  }
  for (const row of payload.companyInterviews) {
    const day = dayKey(row.created_at)
    ;(daily[day] ??= { day, recommendationsAccepted: 0, relationshipActions: 0, interviewsAdvanced: 0 }).interviewsAdvanced += 1
  }

  const allUsers = new Set([
    ...recommendationUsers,
    ...relationshipActionUsers,
    ...interviewUsers,
  ])

  const userBreakdown = [...allUsers].map((userId) => {
    const recommendationsAccepted = recommendationsByUser[userId] ?? 0
    const relationshipActionsCount = actionByUser[userId] ?? 0
    const interviewProgressions = interviewByUser[userId] ?? 0
    const denominator = Math.max(recommendationsAccepted, relationshipActionsCount)
    const rawProxy = denominator > 0 ? safeRate(interviewProgressions, denominator) : null
    return {
      userId,
      recommendationsAccepted,
      relationshipActions: relationshipActionsCount,
      interviewProgressions,
      hasFullChain: recommendationsAccepted > 0 && relationshipActionsCount > 0 && interviewProgressions > 0,
      closeProbabilityProxy: rawProxy === null ? null : Math.min(1, rawProxy),
    }
  }).sort((a, b) => {
    const aProxy = a.closeProbabilityProxy ?? -1
    const bProxy = b.closeProbabilityProxy ?? -1
    return (bProxy - aProxy) || (b.recommendationsAccepted - a.recommendationsAccepted)
  })

  return {
    generatedAt: new Date().toISOString(),
    windowDays,
    windowStart: payload.sinceIso,
    workflow: {
      path: 'recommendation_accepted -> relationship_action -> interview_progression',
      intent: 'show if saved recommendations are being converted into relationship actions that lead to interview momentum',
    },
    methodology: {
      sources: ['user_events', 'company_interview_logs', 'partner_outcome_events'],
      recommendationEvent: 'discover_recommendation_added',
      relationshipActionEvent: 'briefing_action_clicked where properties.chain_stage=relationship_action',
      interviewProgressionEvents: ['company_interview_logs rows', 'partner_outcome_events:interview_stage_advance'],
      denominatorNotes: {
        recommendation_to_relationship_action_user_rate: 'users_with_recommendations',
        relationship_action_to_interview_user_rate: 'users_with_relationship_actions',
        recommendation_to_interview_user_rate: 'users_with_recommendations',
      },
    },
    counts: {
      recommendations_accepted: payload.recommendations.length,
      relationship_actions: relationshipActions.length,
      interview_progressions: payload.partnerInterviews.length + payload.companyInterviews.length,
      users_with_recommendations: recommendationUsers.size,
      users_with_relationship_actions: relationshipActionUsers.size,
      users_with_interview_progression: interviewUsers.size,
      users_with_full_chain: chainUsers.length,
    },
    rates: {
      recommendation_to_relationship_action_user_rate: safeRate(chainUsers.length, recommendationUsers.size),
      relationship_action_to_interview_user_rate: safeRate(chainUsers.length, relationshipActionUsers.size),
      recommendation_to_interview_user_rate: safeRate(chainUsers.length, recommendationUsers.size),
    },
    action_taxonomy: {
      action_type_breakdown: actionTypeBreakdown,
      action_channel_breakdown: actionChannelBreakdown,
    },
    daily: Object.values(daily).sort((a, b) => a.day.localeCompare(b.day)),
    userBreakdown,
  }
}

export function toMarkdown(report) {
  const lines = [
    '# Relationship KPI Chain',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Window days: ${report.windowDays}`,
    `- Window start: ${report.windowStart}`,
    `- Workflow path: ${report.workflow.path}`,
    '',
    '## Methodology',
    '',
    `- sources: ${report.methodology.sources.join(', ')}`,
    `- recommendation event: ${report.methodology.recommendationEvent}`,
    `- relationship action event: ${report.methodology.relationshipActionEvent}`,
    `- interview progression events: ${report.methodology.interviewProgressionEvents.join(' + ')}`,
    '',
    '## Counts',
    '',
    `- recommendations accepted: ${report.counts.recommendations_accepted}`,
    `- relationship actions: ${report.counts.relationship_actions}`,
    `- interview progressions: ${report.counts.interview_progressions}`,
    `- users with full chain: ${report.counts.users_with_full_chain}`,
    '',
    '## Rates',
    '',
    `- recommendation -> relationship action (user): ${report.rates.recommendation_to_relationship_action_user_rate}`,
    `- relationship action -> interview progression (user): ${report.rates.relationship_action_to_interview_user_rate}`,
    `- recommendation -> interview progression (user): ${report.rates.recommendation_to_interview_user_rate}`,
    '',
    '## Action Taxonomy',
    '',
    ...Object.entries(report.action_taxonomy.action_type_breakdown).map(([k, v]) => `- action type ${k}: ${v}`),
    ...Object.entries(report.action_taxonomy.action_channel_breakdown).map(([k, v]) => `- action channel ${k}: ${v}`),
    '',
    '## Daily',
  ]

  if (!report.daily.length) {
    lines.push('- no events in selected window')
  } else {
    for (const row of report.daily) {
      lines.push(`- ${row.day}: recommendations=${row.recommendationsAccepted}, relationship_actions=${row.relationshipActions}, interviews=${row.interviewsAdvanced}`)
    }
  }

  return `${lines.join('\n')}\n`
}

async function main() {
  const args = parseArgs(process.argv)
  const rows = await fetchRows(args.windowDays)
  const report = aggregate(rows, args.windowDays)

  fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD_PATH, toMarkdown(report))
  fs.writeFileSync(
    OUTPUT_USER_CSV_PATH,
    toCsv(report.userBreakdown, [
      'userId',
      'recommendationsAccepted',
      'relationshipActions',
      'interviewProgressions',
      'hasFullChain',
      'closeProbabilityProxy',
    ])
  )

  if (args.json) {
    console.log(JSON.stringify(report, null, 2))
  } else if (args.markdown) {
    process.stdout.write(toMarkdown(report))
  } else if (args.summary) {
    console.log(
      `recommendations=${report.counts.recommendations_accepted} relationship_actions=${report.counts.relationship_actions} ` +
      `interview_progressions=${report.counts.interview_progressions} full_chain_users=${report.counts.users_with_full_chain}`,
    )
  } else {
    console.log('Relationship KPI chain export')
    console.log('-----------------------------')
    console.log(`Recommendations accepted: ${report.counts.recommendations_accepted}`)
    console.log(`Relationship actions: ${report.counts.relationship_actions}`)
    console.log(`Interview progressions: ${report.counts.interview_progressions}`)
    console.log(`Users with full chain: ${report.counts.users_with_full_chain}`)
  }

  if (args.strict && report.counts.recommendations_accepted === 0) {
    process.exitCode = 1
  }
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isDirectRun) {
  main().catch((error) => {
    console.error(`export-relationship-kpi-chain failed: ${error.message}`)
    process.exitCode = 1
  })
}
