import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const ROOT_DIR = process.cwd()
const OUTREACH_DIR = path.join(ROOT_DIR, 'docs', 'outreach')
const SENDER_EMAIL = 'richard@startingmonday.app'

function parseCsv(content) {
  if (!content.trim()) return { headers: [], rows: [] }
  const records = []
  let row = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]

    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && content[i + 1] === '\n') i++
      row.push(current)
      current = ''
      if (row.some(cell => cell.length > 0)) records.push(row)
      row = []
      continue
    }

    current += ch
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    if (row.some(cell => cell.length > 0)) records.push(row)
  }

  if (records.length === 0) return { headers: [], rows: [] }

  const [headers, ...lines] = records
  const rows = lines.map((cols) => {
    const mapped = {}
    for (let i = 0; i < headers.length; i++) mapped[headers[i]] = cols[i] ?? ''
    return mapped
  })

  return { headers, rows }
}

function normalizeEmail(value) {
  return (value ?? '').toString().trim().toLowerCase()
}

function firstNameFromRecipient(name) {
  const cleaned = (name ?? '').toString().trim()
  if (!cleaned) return 'there'
  return cleaned.split(/\s+/)[0]
}

function buildCoachEmail(firstName) {
  const subject = `${firstName}, useful for keeping clients moving between sessions?`
  const messageBody = `Hi ${firstName},

Quick observation from the coaching practices we speak with: too much session time gets spent rebuilding search context instead of coaching decisions.

Starting Monday handles the between-session execution layer with daily role and company signals, prep briefs, and pipeline tracking your clients can actually follow.

Coaches use this to get sharper sessions from minute one, better client follow-through, and less admin drag.

You can see the overview here: https://startingmonday.app/for-coaches

If it helps, reply yes and I will send two sample prep briefs so you can decide quickly if it fits your practice.

Rich
startingmonday.app`

  return { subject, messageBody }
}

async function getCoachSourceEmails() {
  const files = await readdir(OUTREACH_DIR)
  const candidateFiles = files
    .filter((name) => name.toLowerCase().endsWith('.csv'))
    .filter((name) => {
      const lower = name.toLowerCase()
      return lower.includes('coach') || lower.includes('apollo')
    })

  const emails = new Set()

  for (const fileName of candidateFiles) {
    const raw = await readFile(path.join(OUTREACH_DIR, fileName), 'utf8')
    const csv = parseCsv(raw)

    for (const row of csv.rows) {
      const email = normalizeEmail(
        row.Email || row.email || row.email_guess || row.email_address || row['Email Address']
      )
      if (email) emails.add(email)
    }
  }

  return emails
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const coachEmails = await getCoachSourceEmails()
  console.log(`Coach source emails from CSVs: ${coachEmails.size}`)

  const pageSize = 1000
  let from = 0
  const senderRows = []

  while (true) {
    const { data, error } = await supabase
      .from('outreach_logs')
      .select('id, recipient_name, recipient_email, sender_email, subject, message_body')
      .eq('sender_email', SENDER_EMAIL)
      .not('recipient_email', 'is', null)
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(`Failed to fetch outreach rows: ${error.message}`)
      process.exit(1)
    }

    const rows = data ?? []
    senderRows.push(...rows)

    if (rows.length < pageSize) break
    from += pageSize
  }

  const targets = senderRows.filter((row) => coachEmails.has(normalizeEmail(row.recipient_email)))
  console.log(`Target coach rows in DB: ${targets.length}`)

  let updated = 0
  for (const row of targets) {
    const firstName = firstNameFromRecipient(row.recipient_name)
    const { subject, messageBody } = buildCoachEmail(firstName)

    const { error } = await supabase
      .from('outreach_logs')
      .update({
        subject,
        message_body: messageBody,
      })
      .eq('id', row.id)

    if (error) {
      console.error(`Failed to update row ${row.id}: ${error.message}`)
      process.exit(1)
    }

    updated++
  }

  const { data: verifyRows, error: verifyError } = await supabase
    .from('outreach_logs')
    .select('id, recipient_name, recipient_email, subject, message_body')
    .eq('sender_email', SENDER_EMAIL)
    .not('recipient_email', 'is', null)

  if (verifyError) {
    console.error(`Verification query failed: ${verifyError.message}`)
    process.exit(1)
  }

  const verifiedTargets = (verifyRows ?? []).filter((row) => coachEmails.has(normalizeEmail(row.recipient_email)))
  const withLink = verifiedTargets.filter((row) =>
    (row.message_body ?? '').toString().includes('https://startingmonday.app/for-coaches')
  )

  console.log(`Updated rows: ${updated}`)
  console.log(`Coach rows verified: ${verifiedTargets.length}`)
  console.log(`Coach rows with for-coaches link: ${withLink.length}`)

  const sample = withLink[0]
  if (sample) {
    console.log('--- SAMPLE EMAIL ---')
    console.log(`id: ${sample.id}`)
    console.log(`recipient_name: ${sample.recipient_name}`)
    console.log(`recipient_email: ${sample.recipient_email}`)
    console.log(`subject: ${sample.subject}`)
    console.log('body:')
    console.log(sample.message_body)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
