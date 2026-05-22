import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

loadEnv({ path: '.env' })
loadEnv({ path: '.env.local', override: true })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

function normalizeSignature(text) {
  let normalized = (text ?? '').toString().replace(/\r\n/g, '\n').trim()
  if (!normalized) return { value: normalized, changed: false }

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

  const value = `${normalized}\n\nRich\nstartingmonday.app`
  return { value, changed: value !== (text ?? '').toString().replace(/\r\n/g, '\n').trim() }
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
      const { value, changed: rowChanged } = normalizeSignature(row.message_body)
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
