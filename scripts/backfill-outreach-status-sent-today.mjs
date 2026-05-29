import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

loadEnv({ path: '.env.local' })
loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const todayUtc = new Date().toISOString().slice(0, 10)
const startIso = `${todayUtc}T00:00:00.000Z`
const endIso = `${todayUtc}T23:59:59.999Z`

async function loadLiveSends(start, end) {
  return supabase
    .from('outreach_logs')
    .select('id, user_id, recipient_name, recipient_email, outreach_channel, sent_at, send_mode, sender_email, subject')
    .eq('send_mode', 'live')
    .gte('sent_at', start)
    .lte('sent_at', end)
    .order('sent_at', { ascending: true })
}

let effectiveDateUtc = todayUtc
let { data: logs, error: logsError } = await loadLiveSends(startIso, endIso)

if (logsError) {
  console.error(`Failed to fetch outreach logs: ${logsError.message}`)
  process.exit(1)
}

if ((logs ?? []).length === 0) {
  const { data: latestRow, error: latestError } = await supabase
    .from('outreach_logs')
    .select('sent_at')
    .eq('send_mode', 'live')
    .order('sent_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) {
    console.error(`Failed to fetch latest live send: ${latestError.message}`)
    process.exit(1)
  }

  if (latestRow?.sent_at) {
    effectiveDateUtc = String(latestRow.sent_at).slice(0, 10)
    const fallbackStart = `${effectiveDateUtc}T00:00:00.000Z`
    const fallbackEnd = `${effectiveDateUtc}T23:59:59.999Z`
    const fallback = await loadLiveSends(fallbackStart, fallbackEnd)
    logs = fallback.data
    logsError = fallback.error
    if (logsError) {
      console.error(`Failed to fetch fallback outreach logs: ${logsError.message}`)
      process.exit(1)
    }
  }
}

const sentRows = (logs ?? []).filter((row) => (row.recipient_email ?? '').includes('@'))
const uniqueRecipients = new Map()

for (const row of sentRows) {
  const email = String(row.recipient_email).trim().toLowerCase()
  const key = `${row.user_id}::${email}`
  if (!uniqueRecipients.has(key)) {
    uniqueRecipients.set(key, {
      user_id: row.user_id,
      email,
      recipient_name: row.recipient_name ?? null,
      outreach_channel: row.outreach_channel ?? null,
      first_sent_at: row.sent_at,
      latest_subject: row.subject ?? null,
    })
  }
}

let matchedContacts = 0
let updatedContacts = 0
let createdContacts = 0
const touched = []

for (const recipient of uniqueRecipients.values()) {
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id, user_id, email, outreach_status, status, contacted_at')
    .eq('user_id', recipient.user_id)
    .eq('status', 'active')
    .ilike('email', recipient.email)

  if (contactsError) {
    console.error(`Contact lookup failed for ${recipient.email}: ${contactsError.message}`)
    continue
  }

  if ((contacts ?? []).length === 0) {
    const fallbackName = recipient.email.split('@')[0]
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

    const { data: insertedContact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        user_id: recipient.user_id,
        name: recipient.recipient_name || fallbackName,
        email: recipient.email,
        channel: 'cold',
        status: 'active',
        outreach_status: 'reached_out',
        contacted_at: recipient.first_sent_at,
      })
      .select('id, user_id')
      .single()

    if (insertError) {
      console.error(`Create contact failed for ${recipient.email}: ${insertError.message}`)
      continue
    }

    createdContacts += 1
    updatedContacts += 1
    touched.push({
      id: insertedContact?.id,
      user_id: insertedContact?.user_id ?? recipient.user_id,
      email: recipient.email,
      previous_status: 'missing',
      new_status: 'reached_out',
      contacted_at: recipient.first_sent_at,
    })
    continue
  }

  for (const contact of contacts ?? []) {
    matchedContacts += 1
    const shouldUpdate = contact.outreach_status === 'prospect'
    if (!shouldUpdate) continue

    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        outreach_status: 'reached_out',
        contacted_at: contact.contacted_at ?? recipient.first_sent_at,
      })
      .eq('id', contact.id)
      .eq('user_id', contact.user_id)

    if (updateError) {
      console.error(`Update failed for ${recipient.email}: ${updateError.message}`)
      continue
    }

    updatedContacts += 1
    touched.push({
      id: contact.id,
      user_id: contact.user_id,
      email: recipient.email,
      previous_status: contact.outreach_status,
      new_status: 'reached_out',
      contacted_at: contact.contacted_at ?? recipient.first_sent_at,
    })
  }
}

console.log(JSON.stringify({
  requested_date_utc: todayUtc,
  effective_date_utc: effectiveDateUtc,
  live_sends_effective_day: sentRows.length,
  unique_recipients_effective_day: uniqueRecipients.size,
  matched_contacts: matchedContacts,
  created_contacts: createdContacts,
  updated_contacts: updatedContacts,
  touched,
}, null, 2))
