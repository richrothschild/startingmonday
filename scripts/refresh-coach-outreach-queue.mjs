import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import templateEngine from '../src/lib/outreach/template-engine.cjs'

loadEnv({ path: '.env' })
loadEnv({ path: '.env.local', override: true })

const APPLY = process.argv.includes('--apply')
const SENDER_EMAIL = 'richard@startingmonday.app'
const QUEUED_STATUSES = ['pending', 'queued', 'draft', 'scheduled']
const QUEUED_JOB_STATES = ['queued', 'sending']

const OLD_COACH_MARKERS = [
  /more client time, less prep/i,
  /less prep work between sessions/i,
  /coach prep worksheet/i,
  /prep work between sessions usually gets scattered/i,
  /coach notes, client signals, and next steps in one place/i,
]

function firstNameFromRecipient(name) {
  const cleaned = (name ?? '').toString().trim()
  if (!cleaned) return 'there'
  return cleaned.split(/\s+/)[0]
}

function ensureSignatureLine(messageText) {
  let normalized = messageText.replace(/\r\n/g, '\n').trim()
  if (!normalized) return normalized

  normalized = normalized
    .replace(/\n*---\nStarting Monday\nIf you prefer no further outreach, reply with "unsubscribe" and I will stop\.\s*$/i, '')
    .trim()

  const trailingSignaturePatterns = [
    /\n*Best,?\s*\n\s*Richard Rothschild\s*\n\s*startingmonday\.app\s*$/i,
    /\n*Best,?\s*\n\s*Rich\s*\n\s*startingmonday\.app\s*$/i,
    /\n*Richard Rothschild\s*\n\s*startingmonday\.app\s*$/i,
    /\n*Rich\s*\n\s*startingmonday\.app\s*$/i,
    /\n*startingmonday\.app\s*$/i,
  ]

  let changed = true
  while (changed) {
    changed = false
    for (const pattern of trailingSignaturePatterns) {
      const next = normalized.replace(pattern, '').trim()
      if (next !== normalized) {
        normalized = next
        changed = true
      }
    }
  }

  return `${normalized}\n\nRich\nstartingmonday.app`
}

function withComplianceFooter(messageText) {
  const trimmed = messageText.trim()
    .replace(/\n*---\nStarting Monday\nIf you prefer no further outreach, reply with "unsubscribe" and I will stop\.\s*$/i, '')
    .trim()
  return [
    trimmed,
    '',
    '---',
    'Starting Monday',
    'If you prefer no further outreach, reply with "unsubscribe" and I will stop.',
  ].join('\n')
}

function toHtml(text) {
  return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;">${text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')}</div>`
}

function hasOldCoachCopy(subject, body) {
  const combined = `${subject ?? ''}\n${body ?? ''}`
  return OLD_COACH_MARKERS.some((pattern) => pattern.test(combined))
}

function inferCompanyFromSubject(subject) {
  const s = (subject ?? '').toString()
  const match = s.match(/\bfor\s+(.+)$/i)
  if (!match?.[1]) return 'your team'
  return match[1].trim()
}

function buildCoachDraft({ firstName, company, roleLabel, focus, step }) {
  const generated = templateEngine.buildLatestTemplateDraft({
    channel: 'coaches',
    firstName,
    company,
    roleLabel: roleLabel || 'Executive Coach',
    focus: focus || roleLabel || 'Executive Coach',
    step: step || 'followup_1',
  })

  const signed = ensureSignatureLine(generated.body)
  const finalMessageText = withComplianceFooter(signed)

  return {
    subject: generated.subject,
    messageText: generated.body,
    finalMessageText,
    finalHtml: toHtml(finalMessageText),
  }
}

async function fetchAllRows(supabase, queryFactory, pageSize = 1000) {
  const rows = []
  let from = 0

  while (true) {
    const query = queryFactory().range(from, from + pageSize - 1)
    const { data, error } = await query
    if (error) throw new Error(error.message)

    const chunk = data ?? []
    rows.push(...chunk)
    if (chunk.length < pageSize) break
    from += pageSize
  }

  return rows
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const queuedLogs = await fetchAllRows(
    supabase,
    () => supabase
      .from('outreach_logs')
      .select('id, recipient_name, recipient_email, sender_email, subject, message_body, outreach_channel, delivery_status, sent_at, persona_focus, webhook_payload')
      .eq('sender_email', SENDER_EMAIL)
      .eq('outreach_channel', 'coaches')
      .in('delivery_status', QUEUED_STATUSES)
      .is('sent_at', null)
      .order('id', { ascending: true }),
  )

  const queuedJobs = await fetchAllRows(
    supabase,
    () => supabase
      .from('outreach_send_jobs')
      .select('id, state, payload')
      .in('state', QUEUED_JOB_STATES)
      .order('id', { ascending: true }),
  )

  const coachJobs = queuedJobs.filter((row) => {
    const payload = row.payload && typeof row.payload === 'object' ? row.payload : null
    return payload?.outreachChannel === 'coaches'
  })

  const logUpdates = queuedLogs.map((row) => {
    const payload = row.webhook_payload && typeof row.webhook_payload === 'object' ? row.webhook_payload : {}
    const firstName = firstNameFromRecipient(row.recipient_name)
    const company = String(payload.company || inferCompanyFromSubject(row.subject) || 'your team')
    const roleLabel = String(payload.role_bucket || payload.roleLabel || 'Executive Coach')
    const step = String(payload.template_step || payload.campaign_step || 'followup_1')
    const draft = buildCoachDraft({
      firstName,
      company,
      roleLabel,
      focus: row.persona_focus || roleLabel,
      step,
    })

    return {
      id: row.id,
      subject: draft.subject,
      message_body: draft.finalMessageText,
      message_preview: draft.finalMessageText.slice(0, 200),
      webhook_payload: {
        ...payload,
        template_source: 'latest_template_engine',
      },
    }
  })

  const jobUpdates = coachJobs.map((row) => {
    const payload = row.payload
    const roleLabel = String(payload.roleBucket || 'Executive Coach')
    const step = String(payload.templateStep || payload.campaignStep || 'followup_1')
    const draft = buildCoachDraft({
      firstName: firstNameFromRecipient(payload.fullName),
      company: String(payload.company || 'your team'),
      roleLabel,
      focus: String(payload.personaFocus || roleLabel),
      step,
    })

    const finalSubject = payload.mode === 'test_to_self' ? `[TEST] ${draft.subject}` : draft.subject

    return {
      id: row.id,
      payload: {
        ...payload,
        subject: draft.subject,
        finalSubject,
        messageText: draft.messageText,
        finalMessageText: draft.finalMessageText,
        finalHtml: draft.finalHtml,
        templateSource: 'latest_template_engine',
      },
    }
  })

  console.log(`Queued coach outreach_logs rows: ${queuedLogs.length}`)
  console.log(`Queued coach outreach_send_jobs rows: ${coachJobs.length}`)

  const oldBeforeCount =
    queuedLogs.filter((r) => hasOldCoachCopy(r.subject, r.message_body)).length +
    coachJobs.filter((r) => hasOldCoachCopy(r.payload?.subject, r.payload?.messageText)).length
  console.log(`Rows with old coach copy before rewrite: ${oldBeforeCount}`)

  if (!APPLY) {
    console.log('Dry run only. Re-run with --apply to write updates.')
    return
  }

  for (const row of logUpdates) {
    const { error } = await supabase
      .from('outreach_logs')
      .update({
        subject: row.subject,
        message_body: row.message_body,
        message_preview: row.message_preview,
        webhook_payload: row.webhook_payload,
      })
      .eq('id', row.id)

    if (error) throw new Error(`Failed to update outreach_logs ${row.id}: ${error.message}`)
  }

  for (const row of jobUpdates) {
    const { error } = await supabase
      .from('outreach_send_jobs')
      .update({ payload: row.payload })
      .eq('id', row.id)

    if (error) throw new Error(`Failed to update outreach_send_jobs ${row.id}: ${error.message}`)
  }

  const verifyLogs = await fetchAllRows(
    supabase,
    () => supabase
      .from('outreach_logs')
      .select('id, subject, message_body, outreach_channel, delivery_status, sent_at, sender_email')
      .eq('sender_email', SENDER_EMAIL)
      .eq('outreach_channel', 'coaches')
      .in('delivery_status', QUEUED_STATUSES)
      .is('sent_at', null),
  )

  const verifyJobs = await fetchAllRows(
    supabase,
    () => supabase
      .from('outreach_send_jobs')
      .select('id, state, payload')
      .in('state', QUEUED_JOB_STATES),
  )

  const verifyCoachJobs = verifyJobs.filter((row) => {
    const payload = row.payload && typeof row.payload === 'object' ? row.payload : null
    return payload?.outreachChannel === 'coaches'
  })

  const oldAfterCount =
    verifyLogs.filter((r) => hasOldCoachCopy(r.subject, r.message_body)).length +
    verifyCoachJobs.filter((r) => hasOldCoachCopy(r.payload?.subject, r.payload?.messageText)).length

  console.log(`Updated outreach_logs rows: ${logUpdates.length}`)
  console.log(`Updated outreach_send_jobs rows: ${jobUpdates.length}`)
  console.log(`Rows with old coach copy after rewrite: ${oldAfterCount}`)

  if (oldAfterCount > 0) {
    throw new Error('Old coach outreach copy still present after rewrite.')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
