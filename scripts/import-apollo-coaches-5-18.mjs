import { copyFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const ROOT_DIR = process.cwd()
const OUTREACH_DIR = path.join(ROOT_DIR, 'docs', 'outreach')
const INPUT_FILES = [
  'apollo-contacts-export-coaches.5.18.26.1.csv',
  'apollo-contacts-export.coaches.5.18.26.2.csv',
  'apollo-contacts-export.coaches.5.18.26.3.csv',
]
const USER_ID = '797adda8-98a7-43c2-b4d7-2d68c9fdc502'
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
  const rows = lines.map(cols => {
    const mapped = {}
    for (let i = 0; i < headers.length; i++) mapped[headers[i]] = cols[i] ?? ''
    return mapped
  })
  return { headers, rows }
}

function clean(value) {
  return (value ?? '').toString().trim()
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { error: tableCheckError } = await supabase
    .from('outreach_logs')
    .select('id')
    .limit(1)

  if (tableCheckError) {
    console.error(`Table outreach_logs does not exist or is inaccessible: ${tableCheckError.message}`)
    process.exit(1)
  }

  const copied = []
  for (const fileName of INPUT_FILES) {
    const src = path.join(ROOT_DIR, fileName)
    const dst = path.join(OUTREACH_DIR, fileName)
    await copyFile(src, dst)
    copied.push(fileName)
  }

  let totalRows = 0
  const candidates = []

  for (const fileName of INPUT_FILES) {
    const raw = await readFile(path.join(ROOT_DIR, fileName), 'utf8')
    const csv = parseCsv(raw)

    for (const row of csv.rows) {
      const first = clean(row['First Name'])
      const last = clean(row['Last Name'])
      const name = clean(`${first} ${last}`) || 'Unknown'
      const email = clean(row.Email).toLowerCase()
      const title = clean(row.Title)
      const company = clean(row['Company Name'])
      const status = clean(row['Email Status']).toLowerCase()

      if (!email) continue
      if (status && status !== 'verified') continue

      candidates.push({
        user_id: USER_ID,
        recipient_name: name,
        recipient_email: email,
        sender_email: SENDER_EMAIL,
        channel: 'email',
        delivery_status: 'pending',
        outreach_channel: 'executives',
        fit_tier: null,
        persona_focus: `${title}${company ? ` @ ${company}` : ''}`,
      })
      totalRows++
    }
  }

  const uniqueByEmail = new Map()
  for (const row of candidates) {
    if (!uniqueByEmail.has(row.recipient_email)) uniqueByEmail.set(row.recipient_email, row)
  }

  const uniqueRows = [...uniqueByEmail.values()]

  const existingEmails = new Set()
  const pageSize = 1000
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('outreach_logs')
      .select('recipient_email')
      .eq('sender_email', SENDER_EMAIL)
      .not('recipient_email', 'is', null)
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(`Failed to fetch existing emails: ${error.message}`)
      process.exit(1)
    }

    const rows = data ?? []
    for (const row of rows) {
      existingEmails.add(clean(row.recipient_email).toLowerCase())
    }

    if (rows.length < pageSize) break
    from += pageSize
  }

  const newRows = uniqueRows.filter(row => !existingEmails.has(row.recipient_email))

  let inserted = 0
  const insertBatchSize = 200
  for (let i = 0; i < newRows.length; i += insertBatchSize) {
    const chunk = newRows.slice(i, i + insertBatchSize)
    const { data, error } = await supabase
      .from('outreach_logs')
      .insert(chunk)
      .select('id')

    if (error) {
      console.error(`Insert failed for batch starting at index ${i}: ${error.message}`)
      process.exit(1)
    }

    inserted += data?.length ?? 0
  }

  console.log(`Copied files into docs/outreach: ${copied.join(', ')}`)
  console.log(`Parsed rows from input files: ${totalRows}`)
  console.log(`Unique emails in new files: ${uniqueRows.length}`)
  console.log(`New rows inserted into outreach_logs: ${inserted}`)
  console.log(`Rows skipped as already present: ${uniqueRows.length - inserted}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
