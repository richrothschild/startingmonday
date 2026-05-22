import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load env files in Next.js-like precedence for local script runs.
loadEnv({ path: '.env' })
loadEnv({ path: '.env.local', override: true })

const DEFAULT_SENDER = 'richard@startingmonday.app'
const APPLY = process.argv.includes('--apply')
const senderArg = process.argv.find((arg) => arg.startsWith('--sender='))
const senderEmail = (senderArg ? senderArg.split('=')[1] : DEFAULT_SENDER).trim().toLowerCase()

function firstNameFromRecipient(name) {
  const cleaned = (name ?? '').toString().trim()
  if (!cleaned) return 'there'
  return cleaned.split(/\s+/)[0]
}

function depitchSubject(subject, firstName) {
  const raw = (subject ?? '').toString().trim()
  if (!raw) return `${firstName}, quick question`

  let next = raw
    .replace(/^Bad idea to send\s*/i, 'Quick question on ')
    .replace(/\?\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Keep subjects short and neutral.
  if (/^Quick question on\s*$/i.test(next)) {
    next = `${firstName}, quick question`
  }

  return next
}

function depitchBody(body, firstName) {
  const raw = (body ?? '').toString()
  if (!raw.trim()) {
    return `Hi ${firstName},\n\nQuick question for you.\n\nRich\nstartingmonday.app`
  }

  let next = raw
    .replace(/\r\n/g, '\n')
    .replace(/\u2014/g, '-')
    .replace(/If this is ignored[^\n]*/gi, 'If this is not relevant right now, no worries.')
    .replace(/reply\s+["']send it["'][^\n]*reply\s+["']pass["'][^\n]*/gi, 'If helpful, I can send a one-page example. If not useful right now, no worries.')
    .replace(/Starting Monday gives/gi, 'I built Starting Monday as')
    .replace(/hard-edged/gi, 'practical')

  // If a strong binary CTA remains on separate lines, replace it.
  next = next.replace(/reply\s+["']send it["'][^\n]*/gi, 'If helpful, I can send a one-page example.')
  next = next.replace(/reply\s+["']pass["'][^\n]*/gi, 'If not useful right now, no worries.')

  // Ensure the email still has a greeting.
  if (!/^\s*Hi\s+/i.test(next)) {
    next = `Hi ${firstName},\n\n${next.trim()}`
  }

  return next
}

function isQueuedUnsent(row) {
  const status = (row.delivery_status ?? '').toString().trim().toLowerCase()
  const sentAt = row.sent_at
  if (sentAt) return false
  if (!status) return true
  return ['pending', 'queued', 'draft', 'scheduled'].includes(status)
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const pageSize = 1000
  let from = 0
  const allRows = []

  while (true) {
    const { data, error } = await supabase
      .from('outreach_logs')
      .select('id, recipient_name, recipient_email, sender_email, subject, message_body, delivery_status, sent_at')
      .eq('sender_email', senderEmail)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(`Failed to fetch outreach logs: ${error.message}`)
      process.exit(1)
    }

    const rows = data ?? []
    allRows.push(...rows)
    if (rows.length < pageSize) break
    from += pageSize
  }

  const queuedRows = allRows.filter(isQueuedUnsent)
  const changedRows = []

  for (const row of queuedRows) {
    const firstName = firstNameFromRecipient(row.recipient_name)
    const nextSubject = depitchSubject(row.subject, firstName)
    const nextBody = depitchBody(row.message_body, firstName)

    if (nextSubject !== (row.subject ?? '') || nextBody !== (row.message_body ?? '')) {
      changedRows.push({
        id: row.id,
        recipient_name: row.recipient_name,
        recipient_email: row.recipient_email,
        subject_before: row.subject ?? '',
        subject_after: nextSubject,
        body_before: row.message_body ?? '',
        body_after: nextBody,
      })
    }
  }

  console.log(`Sender rows scanned: ${allRows.length}`)
  console.log(`Queued unsent rows: ${queuedRows.length}`)
  console.log(`Rows needing tone updates: ${changedRows.length}`)

  const sample = changedRows[0]
  if (sample) {
    console.log('--- SAMPLE CHANGE ---')
    console.log(`id: ${sample.id}`)
    console.log(`recipient: ${sample.recipient_name ?? ''} <${sample.recipient_email ?? ''}>`)
    console.log(`subject before: ${sample.subject_before}`)
    console.log(`subject after:  ${sample.subject_after}`)
  }

  if (!APPLY) {
    console.log('Dry run complete. Re-run with --apply to write updates.')
    return
  }

  let updated = 0
  for (const row of changedRows) {
    const { error } = await supabase
      .from('outreach_logs')
      .update({
        subject: row.subject_after,
        message_body: row.body_after,
      })
      .eq('id', row.id)

    if (error) {
      console.error(`Failed to update row ${row.id}: ${error.message}`)
      process.exit(1)
    }

    updated++
  }

  console.log(`Rows updated: ${updated}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
