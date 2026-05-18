import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

function checkSignature(text) {
  const norm = (text ?? '').replace(/\r\n/g, '\n').trim()
  if (!norm) return false
  return /\nRich\nstartingmonday\.app(\n|$)/.test(norm)
}

function checkForbidden(text) {
  const norm = (text ?? '').toLowerCase()
  return /remit|i hope this finds you well|guaranteed|risk free|act now|limited time|buy now|double your|no obligation|click here|winner|urgent response needed|em dash|—/.test(norm)
}

async function main() {
  let from = 0, pageSize = 1000, scanned = 0, failures = 0
  while (true) {
    const { data, error } = await supabase
      .from('outreach_logs')
      .select('id, message_body, subject, sender_email')
      .eq('sender_email', 'richard@startingmonday.app')
      .not('message_body', 'is', null)
      .range(from, from + pageSize - 1)
    if (error) {
      console.error('Failed to query outreach_logs:', error.message)
      process.exit(1)
    }
    const rows = data ?? []
    if (rows.length === 0) break
    scanned += rows.length
    for (const row of rows) {
      const errors = []
      if (!checkSignature(row.message_body)) errors.push('Missing signature')
      if (checkForbidden(row.message_body) || checkForbidden(row.subject)) errors.push('Forbidden phrase')
      if (errors.length) {
        failures++
        console.log(`[${row.id}] ${errors.join(', ')}`)
      }
    }
    if (rows.length < pageSize) break
    from += pageSize
  }
  if (failures) {
    console.error(`\nFAIL: ${failures} of ${scanned} outreach_log rows failed DB audit.`)
    process.exit(1)
  } else {
    console.log(`PASS: All ${scanned} outreach_log rows passed DB audit.`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
