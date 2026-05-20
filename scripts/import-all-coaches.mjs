import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const OUTREACH_DIR = path.join(process.cwd(), 'docs', 'outreach')

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

async function loadCsv(fileName) {
  const raw = await readFile(path.join(OUTREACH_DIR, fileName), 'utf8')
  return parseCsv(raw)
}

async function importAllCoaches() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const userId = '797adda8-98a7-43c2-b4d7-2d68c9fdc502'

  const coachPatterns = ['coach', 'coaches', 'apollo']
  const executivePatterns = ['executive', 'prospect']
  const excludePatterns = ['search', 'outplace']

  try {
    const files = await readdir(OUTREACH_DIR)
    const coachFiles = files
      .filter(f => f.endsWith('.csv'))
      .filter(f => {
        const lower = f.toLowerCase()
        const isCoach = coachPatterns.some(p => lower.includes(p))
        const isExecutive = executivePatterns.some(p => lower.includes(p))
        const isExcluded = excludePatterns.some(p => lower.includes(p))
        return (isCoach && !isExcluded) || (isExecutive && lower.includes('coach'))
      })
      .sort()

    console.log(`Found ${coachFiles.length} coach-related CSV files:\n`)
    for (const f of coachFiles) {
      console.log(`  - ${f}`)
    }
    console.log()

    let totalImported = 0
    const results = []

    for (const fileName of coachFiles) {
      try {
        const csv = await loadCsv(fileName)
        if (csv.rows.length === 0) {
          console.log(`Skipping ${fileName}: no data rows`)
          continue
        }

        console.log(`Processing ${fileName}: ${csv.rows.length} rows`)

        const batch = csv.rows
          .filter(row => {
            const email = row.email_guess || row.email || row.email_address || ''
            return email.trim().length > 0
          })
          .map(row => ({
            user_id: userId,
            recipient_name: row.full_name || `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || row.name || 'Unknown',
            recipient_email: row.email_guess || row.email || row.email_address || '',
            channel: 'email',
            sender_email: 'richard@startingmonday.app',
            delivery_status: 'pending',
          }))

        if (batch.length > 0) {
          const { data, error } = await supabase
            .from('outreach_logs')
            .insert(batch)
            .select('id')

          if (error) {
            console.error(`Failed to import ${fileName}:`, error.message)
            results.push({ file: fileName, status: 'failed', error: error.message, count: 0, total: csv.rows.length })
          } else {
            const imported = data?.length || 0
            console.log(`Successfully imported ${imported} of ${batch.length} rows from ${fileName}`)
            totalImported += imported
            results.push({ file: fileName, status: 'success', count: imported, total: csv.rows.length })
          }
        } else {
          console.log(`Skipping ${fileName}: no rows with valid email addresses`)
        }
      } catch (err) {
        console.error(`Error processing ${fileName}:`, err.message)
        results.push({ file: fileName, status: 'error', error: err.message, count: 0 })
      }
    }

    console.log('\n=== IMPORT SUMMARY ===')
    for (const result of results) {
      if (result.status === 'success') {
        console.log(`[OK] ${result.file}: ${result.count}/${result.total} rows`)
      } else if (result.status === 'failed') {
        console.log(`[FAIL] ${result.file}: ${result.error}`)
      } else {
        console.log(`[ERROR] ${result.file}: ${result.error}`)
      }
    }
    console.log(`\nTotal imported: ${totalImported} rows across ${results.filter(r => r.status === 'success').length} files`)

    if (totalImported === 0) {
      process.exit(1)
    }
  } catch (err) {
    console.error('Error reading outreach directory:', err.message)
    process.exit(1)
  }
}

importAllCoaches()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
