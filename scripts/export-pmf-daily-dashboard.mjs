#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const PMF_EVENTS = {
  activation: [
    'pmf_activation_profile_completed',
    'pmf_activation_first_company_added',
    'pmf_activation_first_prep_generated',
  ],
  prep: [
    'pmf_prep_brief_generated',
    'pmf_prep_brief_refined',
    'pmf_prep_low_confidence_seen',
  ],
  cadence: [
    'pmf_cadence_follow_up_logged',
    'pmf_cadence_weekly_session_completed',
    'pmf_cadence_stale_thread_recovered',
  ],
  outcomes: [
    'pmf_outcome_first_interview_reached',
    'pmf_outcome_offer_stage_reached',
    'pmf_outcome_role_closed',
  ],
}

const DEFAULT_WINDOW_DAYS = 7
const OUTPUT_JSON_PATH = path.join(process.cwd(), 'docs', 'status', 'pmf-daily-dashboard.latest.json')
const OUTPUT_MD_PATH = path.join(process.cwd(), 'docs', 'status', 'pmf-daily-dashboard.latest.md')

function parseArgs(argv) {
  const args = argv.slice(2)
  let windowDays = DEFAULT_WINDOW_DAYS

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--window-days' && args[i + 1]) {
      const parsed = Number(args[i + 1])
      if (Number.isFinite(parsed) && parsed > 0) {
        windowDays = Math.floor(parsed)
      }
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
  const now = new Date()
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

function allPMFEventNames() {
  return Object.values(PMF_EVENTS).flatMap((group) => group)
}

function eventCategory(eventName) {
  if (PMF_EVENTS.activation.includes(eventName)) return 'activation'
  if (PMF_EVENTS.prep.includes(eventName)) return 'prep'
  if (PMF_EVENTS.cadence.includes(eventName)) return 'cadence'
  if (PMF_EVENTS.outcomes.includes(eventName)) return 'outcomes'
  return 'unknown'
}

function dayKey(isoString) {
  return new Date(isoString).toISOString().slice(0, 10)
}

function safeRate(num, den) {
  if (!den || den <= 0) return 0
  return Number((num / den).toFixed(4))
}

async function fetchRows(windowDays) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const sinceIso = isoDaysAgo(windowDays)
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data, error } = await supabase
    .from('user_events')
    .select('event_name, user_id, created_at')
    .in('event_name', allPMFEventNames())
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: true })
    .limit(10000)

  if (error) {
    throw new Error(`Failed querying user_events: ${error.message}`)
  }

  return data ?? []
}

function aggregate(rows) {
  const byDay = {}
  const byEvent = {}
  const uniqueUsersByCategory = {
    activation: new Set(),
    prep: new Set(),
    cadence: new Set(),
    outcomes: new Set(),
  }

  for (const row of rows) {
    const eventName = row.event_name
    const userId = row.user_id
    const createdAt = row.created_at
    const day = dayKey(createdAt)
    const category = eventCategory(eventName)

    if (!byDay[day]) {
      byDay[day] = {
        day,
        totalEvents: 0,
        byCategory: {
          activation: 0,
          prep: 0,
          cadence: 0,
          outcomes: 0,
        },
        uniqueUsers: new Set(),
      }
    }

    byDay[day].totalEvents += 1
    if (category !== 'unknown') {
      byDay[day].byCategory[category] += 1
      uniqueUsersByCategory[category].add(userId)
    }
    byDay[day].uniqueUsers.add(userId)

    if (!byEvent[eventName]) {
      byEvent[eventName] = {
        eventName,
        count: 0,
        uniqueUsers: new Set(),
      }
    }
    byEvent[eventName].count += 1
    byEvent[eventName].uniqueUsers.add(userId)
  }

  const daily = Object.values(byDay)
    .sort((a, b) => a.day.localeCompare(b.day))
    .map((entry) => ({
      day: entry.day,
      totalEvents: entry.totalEvents,
      byCategory: entry.byCategory,
      uniqueUsers: entry.uniqueUsers.size,
    }))

  const eventBreakdown = Object.values(byEvent)
    .sort((a, b) => b.count - a.count)
    .map((entry) => ({
      eventName: entry.eventName,
      category: eventCategory(entry.eventName),
      count: entry.count,
      uniqueUsers: entry.uniqueUsers.size,
    }))

  const activationUsers = uniqueUsersByCategory.activation.size
  const prepUsers = uniqueUsersByCategory.prep.size
  const cadenceUsers = uniqueUsersByCategory.cadence.size
  const outcomeUsers = uniqueUsersByCategory.outcomes.size

  const funnel = {
    activationUsers,
    prepUsers,
    cadenceUsers,
    outcomeUsers,
    prepFromActivationRate: safeRate(prepUsers, activationUsers),
    cadenceFromPrepRate: safeRate(cadenceUsers, prepUsers),
    outcomeFromCadenceRate: safeRate(outcomeUsers, cadenceUsers),
  }

  return {
    daily,
    eventBreakdown,
    totals: {
      totalEvents: rows.length,
      activationEvents: rows.filter((row) => eventCategory(row.event_name) === 'activation').length,
      prepEvents: rows.filter((row) => eventCategory(row.event_name) === 'prep').length,
      cadenceEvents: rows.filter((row) => eventCategory(row.event_name) === 'cadence').length,
      outcomeEvents: rows.filter((row) => eventCategory(row.event_name) === 'outcomes').length,
      uniqueUsers: new Set(rows.map((row) => row.user_id)).size,
    },
    funnel,
  }
}

function toMarkdown(result) {
  const lines = [
    '# PMF Daily Dashboard',
    '',
    `- Generated at: ${result.generatedAt}`,
    `- Window days: ${result.windowDays}`,
    `- Total PMF events: ${result.totals.totalEvents}`,
    `- Unique users: ${result.totals.uniqueUsers}`,
    '',
    '## Funnel',
    '',
    `- activation users: ${result.funnel.activationUsers}`,
    `- prep users: ${result.funnel.prepUsers}`,
    `- cadence users: ${result.funnel.cadenceUsers}`,
    `- outcome users: ${result.funnel.outcomeUsers}`,
    `- prep_from_activation_rate: ${result.funnel.prepFromActivationRate}`,
    `- cadence_from_prep_rate: ${result.funnel.cadenceFromPrepRate}`,
    `- outcome_from_cadence_rate: ${result.funnel.outcomeFromCadenceRate}`,
    '',
    '## Daily Activity',
  ]

  if (result.daily.length === 0) {
    lines.push('- no PMF events in selected window')
  } else {
    for (const day of result.daily) {
      lines.push(
        `- ${day.day}: total=${day.totalEvents}, users=${day.uniqueUsers}, ` +
        `activation=${day.byCategory.activation}, prep=${day.byCategory.prep}, ` +
        `cadence=${day.byCategory.cadence}, outcomes=${day.byCategory.outcomes}`,
      )
    }
  }

  return `${lines.join('\n')}\n`
}

async function main() {
  const { windowDays, json, markdown, summary, strict } = parseArgs(process.argv)
  const rows = await fetchRows(windowDays)
  const aggregated = aggregate(rows)
  const result = {
    generatedAt: new Date().toISOString(),
    windowDays,
    ...aggregated,
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON_PATH, `${JSON.stringify(result, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD_PATH, toMarkdown(result))

  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else if (markdown) {
    process.stdout.write(toMarkdown(result))
  } else if (summary) {
    console.log(
      `events=${result.totals.totalEvents} users=${result.totals.uniqueUsers} ` +
      `prep_from_activation=${result.funnel.prepFromActivationRate} generated_at=${result.generatedAt}`,
    )
  } else {
    console.log('PMF daily dashboard export')
    console.log('--------------------------')
    console.log(`Events: ${result.totals.totalEvents}`)
    console.log(`Unique users: ${result.totals.uniqueUsers}`)
    console.log(`Prep from activation rate: ${result.funnel.prepFromActivationRate}`)
  }

  if (strict && result.totals.totalEvents === 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
