import path from 'node:path'
import { pathToFileURL } from 'node:url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

export function parseArgs(argv) {
  const args = argv.slice(2)
  const tagIndex = args.indexOf('--tag')
  const tag = tagIndex > -1 && args[tagIndex + 1]
    ? String(args[tagIndex + 1]).trim()
    : 'synthetic_kpi_chain_seed'

  return {
    tag,
    apply: args.includes('--apply'),
    json: args.includes('--json'),
    includeLegacy: args.includes('--include-legacy'),
  }
}

async function main() {
  const { tag, apply, json, includeLegacy } = parseArgs(process.argv)
  const marker = `synthetic_tag:${tag}`

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const sb = createClient(supabaseUrl, serviceRoleKey)

  const [eventsRes, taggedInterviewsRes] = await Promise.all([
    sb
      .from('user_events')
      .select('id, event_name, user_id, created_at, properties')
      .or(`properties->>synthetic_tag.eq.${tag},properties->>syntheticTag.eq.${tag}`)
      .limit(5000),
    sb
      .from('company_interview_logs')
      .select('id, user_id, company_id, created_at, what_surprised, follow_up_needed, what_landed')
      .or(`what_surprised.eq.${marker},follow_up_needed.eq.${marker}`)
      .limit(5000),
  ])

  if (eventsRes.error) throw new Error(`Failed querying user_events: ${eventsRes.error.message}`)
  if (taggedInterviewsRes.error) throw new Error(`Failed querying tagged company_interview_logs: ${taggedInterviewsRes.error.message}`)

  const eventRows = eventsRes.data ?? []
  const interviewById = new Map((taggedInterviewsRes.data ?? []).map((row) => [row.id, row]))

  if (includeLegacy) {
    const { data: legacyInterviews, error: legacyErr } = await sb
      .from('company_interview_logs')
      .select('id, user_id, company_id, created_at, what_surprised, follow_up_needed, what_landed, questions_asked, interview_stage')
      .eq('interview_stage', 'screen')
      .eq('questions_asked', 'Synthetic seed question')
      .ilike('what_landed', 'Synthetic seed for KPI chain%')
      .limit(100)

    if (legacyErr) throw new Error(`Failed querying legacy company_interview_logs: ${legacyErr.message}`)
    for (const row of legacyInterviews ?? []) {
      interviewById.set(row.id, row)
    }
  }

  const interviewRows = [...interviewById.values()]

  const summary = {
    tag,
    marker,
    apply,
    includeLegacy,
    found: {
      user_events: eventRows.length,
      company_interview_logs: interviewRows.length,
    },
    deleted: {
      user_events: 0,
      company_interview_logs: 0,
    },
  }

  if (apply) {
    if (eventRows.length) {
      const ids = eventRows.map((row) => row.id)
      const { error } = await sb.from('user_events').delete().in('id', ids)
      if (error) throw new Error(`Failed deleting user_events: ${error.message}`)
      summary.deleted.user_events = ids.length
    }

    if (interviewRows.length) {
      const ids = interviewRows.map((row) => row.id)
      const { error } = await sb.from('company_interview_logs').delete().in('id', ids)
      if (error) throw new Error(`Failed deleting company_interview_logs: ${error.message}`)
      summary.deleted.company_interview_logs = ids.length
    }
  }

  if (json) {
    console.log(JSON.stringify(summary, null, 2))
  } else {
    console.log(`Synthetic KPI cleanup (${apply ? 'apply' : 'dry-run'})`)
    console.log(`tag=${summary.tag}`)
    console.log(`found user_events=${summary.found.user_events} company_interview_logs=${summary.found.company_interview_logs}`)
    if (apply) {
      console.log(`deleted user_events=${summary.deleted.user_events} company_interview_logs=${summary.deleted.company_interview_logs}`)
    }
  }
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isDirectRun) {
  main().catch((error) => {
    console.error(`cleanup-relationship-kpi-chain-seed failed: ${error.message}`)
    process.exitCode = 1
  })
}
