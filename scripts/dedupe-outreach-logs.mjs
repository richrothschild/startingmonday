import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const TARGET_SENDER = process.env.DEDUPE_SENDER_EMAIL || 'richard@startingmonday.app'

function normalizeEmail(value) {
  return (value ?? '').toString().trim().toLowerCase()
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
  const rows = []

  while (true) {
    const { data, error } = await supabase
      .from('outreach_logs')
      .select('id, sender_email, recipient_email, sent_at')
      .eq('sender_email', TARGET_SENDER)
      .not('recipient_email', 'is', null)
      .order('sent_at', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(`Failed to query outreach_logs: ${error.message}`)
      process.exit(1)
    }

    const chunk = data ?? []
    rows.push(...chunk)
    if (chunk.length < pageSize) break
    from += pageSize
  }

  const keepByEmail = new Map()
  const duplicateIds = []

  for (const row of rows) {
    const email = normalizeEmail(row.recipient_email)
    if (!email) continue

    if (!keepByEmail.has(email)) {
      keepByEmail.set(email, row.id)
      continue
    }

    duplicateIds.push(row.id)
  }

  console.log(`Sender: ${TARGET_SENDER}`)
  console.log(`Rows scanned: ${rows.length}`)
  console.log(`Unique recipient emails: ${keepByEmail.size}`)
  console.log(`Duplicate rows identified: ${duplicateIds.length}`)

  if (!APPLY) {
    console.log('Dry run only. Re-run with --apply to delete duplicates.')
    return
  }

  if (duplicateIds.length === 0) {
    console.log('No duplicates to delete.')
    return
  }

  let deleted = 0
  for (let i = 0; i < duplicateIds.length; i += 200) {
    const chunk = duplicateIds.slice(i, i + 200)
    const { data, error } = await supabase
      .from('outreach_logs')
      .delete()
      .in('id', chunk)
      .select('id')

    if (error) {
      console.error(`Delete failed at batch ${i / 200 + 1}: ${error.message}`)
      process.exit(1)
    }

    deleted += (data ?? []).length
  }

  console.log(`Deleted duplicate rows: ${deleted}`)

  const { data: verifyRows, error: verifyError } = await supabase
    .from('outreach_logs')
    .select('recipient_email')
    .eq('sender_email', TARGET_SENDER)
    .not('recipient_email', 'is', null)

  if (verifyError) {
    console.error(`Verification query failed: ${verifyError.message}`)
    process.exit(1)
  }

  const seen = new Set()
  let remainingDupes = 0
  for (const row of verifyRows ?? []) {
    const email = normalizeEmail(row.recipient_email)
    if (!email) continue
    if (seen.has(email)) remainingDupes++
    else seen.add(email)
  }

  console.log(`Remaining duplicate rows after delete: ${remainingDupes}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
