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

function isCoachRow(row, fileName) {
  const lower = fileName.toLowerCase()
  
  if (lower.includes('coach') || lower.includes('apollo')) {
    return true
  }
  
  const roleText = `${row.title ?? ''} ${row.role_bucket ?? ''} ${row.role ?? ''}`.toLowerCase()
  const companyText = `${row.company ?? ''} ${row.firm ?? ''}`.toLowerCase()
  
  const coachKeywords = ['coach', 'coaching', 'consultant', 'consultant (executive)', 'advisor']
  const roleIsCoach = coachKeywords.some(k => roleText.includes(k))
  
  const excludeKeywords = ['search', 'outplace', 'executive (not coach)']
  const isExcluded = excludeKeywords.some(k => roleText.includes(k) || companyText.includes(k))
  
  return roleIsCoach && !isExcluded
}

async function importCoachesComprehensive() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const userId = '797adda8-98a7-43c2-b4d7-2d68c9fdc502'

  try {
    const allFiles = await readdir(OUTREACH_DIR)
    const csvFiles = allFiles.filter(f => f.endsWith('.csv')).sort()

    console.log(`Scanning ${csvFiles.length} CSV files for coach prospects...\n`)

    let totalImported = 0
    let totalScanned = 0
    const results = []
    const emailsSeen = new Set()

    for (const fileName of csvFiles) {
      try {
        const csv = await loadCsv(fileName)
        if (csv.rows.length === 0) continue

        const coachRows = csv.rows
          .filter(row => isCoachRow(row, fileName))
          .filter(row => {
            const email = (row.email_guess || row.email || row.email_address || '').trim()
            return email.length > 0 && !emailsSeen.has(email)
          })

        if (coachRows.length === 0) continue

        coachRows.forEach(row => {
          const email = (row.email_guess || row.email || row.email_address || '').trim()
          emailsSeen.add(email)
        })

        console.log(`${fileName}: ${coachRows.length} coach prospects`)

        const batch = coachRows.map(row => ({
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
            console.error(`  ERROR: ${error.message}`)
            results.push({ file: fileName, status: 'failed', error: error.message, imported: 0, candidates: coachRows.length })
          } else {
            const imported = data?.length || 0
            totalImported += imported
            totalScanned += coachRows.length
            results.push({ file: fileName, status: 'success', imported, candidates: coachRows.length })
          }
        }
      } catch (err) {
        console.error(`Error processing ${fileName}:`, err.message)
      }
    }

    console.log('\n=== FINAL SUMMARY ===')
    console.log(`Scanned: ${csvFiles.length} files`)
    console.log(`Coach candidates found: ${totalScanned}`)
    console.log(`Successfully imported: ${totalImported}`)
    console.log(`Unique emails: ${emailsSeen.size}`)
    console.log(`\nFiles with coach prospects: ${results.filter(r => r.status === 'success').length}`)
    
    const failed = results.filter(r => r.status === 'failed')
    if (failed.length > 0) {
      console.log(`\nFailed imports: ${failed.length}`)
      failed.forEach(r => console.log(`  ${r.file}: ${r.error}`))
    }

    if (totalImported === 0) {
      process.exit(1)
    }
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

importCoachesComprehensive()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
