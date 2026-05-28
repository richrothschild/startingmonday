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

const day = process.argv[2] || new Date().toISOString().slice(0, 10)
const start = `${day}T00:00:00.000Z`
const end = `${day}T23:59:59.999Z`

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: rows, error } = await supabase
  .from('outreach_logs')
  .select('id, user_id, recipient_name, recipient_email, sender_email, send_mode, delivery_status, webhook_event_type, resend_message_id, subject, sent_at, contact_id, outreach_channel, message_preview')
  .gte('sent_at', start)
  .lte('sent_at', end)
  .order('sent_at', { ascending: true })

if (error) {
  console.error(error.message)
  process.exit(1)
}

const allRows = rows ?? []
const liveRows = allRows.filter((r) => r.send_mode === 'live')
const liveEmails = [...new Set(liveRows.map((r) => (r.recipient_email ?? '').toLowerCase()).filter((e) => e.includes('@')))]

let contacts = []
if (liveEmails.length > 0) {
  const { data: contactRows, error: contactError } = await supabase
    .from('contacts')
    .select('id, user_id, name, email, outreach_status, status, contacted_at')
    .in('email', liveEmails)
  if (contactError) {
    console.error(contactError.message)
    process.exit(1)
  }
  contacts = contactRows ?? []
}

const byKey = new Map(
  contacts.map((c) => [`${c.user_id}::${String(c.email ?? '').toLowerCase()}`, c]),
)

const missing = liveRows.filter((r) => {
  const key2 = `${r.user_id}::${String(r.recipient_email ?? '').toLowerCase()}`
  return !byKey.has(key2)
})

const sendFailures = liveRows.filter((r) => {
  const ds = String(r.delivery_status ?? '').toLowerCase()
  const evt = String(r.webhook_event_type ?? '').toLowerCase()
  return ds.includes('fail') || ds.includes('bounce') || evt.includes('bounce') || evt.includes('failed')
})

console.log(JSON.stringify({
  date_utc: day,
  total_logs: allRows.length,
  live_sends: liveRows.length,
  failed_or_bounced: sendFailures.length,
  missing_contacts: missing.length,
  missing,
  send_failures: sendFailures,
}, null, 2))
