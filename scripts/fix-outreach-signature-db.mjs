import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

function ensureDomainBelowName(text) {
  const normalized = (text ?? '').toString().replace(/\r\n/g, '\n')
  if (!normalized.trim()) return { value: normalized, changed: false }

  const lines = normalized.split('\n')
  const nameLines = new Set(['rich', 'rich rothschild', 'richard rothschild'])
  const out = []
  let changed = false

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i]
    const currentNorm = current.trim().toLowerCase()
    out.push(current)

    if (nameLines.has(currentNorm)) {
      const nextNorm = (lines[i + 1] ?? '').trim().toLowerCase()
      if (nextNorm !== 'startingmonday.app') {
        out.push('startingmonday.app')
        changed = true
      }
    }
  }

  return { value: out.join('\n'), changed }
}

async function main() {
  const pageSize = 1000
  let from = 0
  let scanned = 0
  let changed = 0

  while (true) {
    const { data, error } = await supabase
      .from('outreach_logs')
      .select('id, message_body, message_preview, sender_email')
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
      const { value, changed: rowChanged } = ensureDomainBelowName(row.message_body)
      if (!rowChanged) continue

      const nextPreview = value.slice(0, 200)
      const { error: updateError } = await supabase
        .from('outreach_logs')
        .update({
          message_body: value,
          message_preview: nextPreview,
        })
        .eq('id', row.id)

      if (updateError) {
        console.error(`Failed to update outreach_logs row ${row.id}:`, updateError.message)
        process.exit(1)
      }

      changed++
    }

    if (rows.length < pageSize) break
    from += pageSize
  }

  console.log(`DB rows scanned: ${scanned}`)
  console.log(`DB rows changed: ${changed}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
