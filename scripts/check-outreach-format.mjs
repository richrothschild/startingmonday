import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

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
      if (inQuotes && content[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
      continue
    }
    if (ch === ',' && !inQuotes) { row.push(current); current = ''; continue }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && content[i + 1] === '\n') i++
      row.push(current); current = ''
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

function checkSignature(text) {
  const norm = (text ?? '').replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim()
  if (!norm) return false
  // Accept common signature variants used across historical outreach exports.
  return /startingmonday\.app/i.test(norm) || (/\bBest,\b/i.test(norm) && /\bRich\b/i.test(norm))
}

function checkForbidden(text) {
  const norm = (text ?? '').toLowerCase()
  return /remit|i hope this finds you well|guaranteed|risk free|act now|limited time|buy now|double your|no obligation|click here|winner|urgent response needed|em dash|—/.test(norm)
}

function checkFirstSentence(text) {
  const lines = (text ?? '')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return false
  return /[a-zA-Z]/.test(lines[1]) && lines[1].length >= 8
}

function checkSubject(subject) {
  const s = (subject ?? '').trim()
  if (s.length < 5 || s.length > 140) return false
  return !checkForbidden(s)
}

async function main() {
  const entries = await readdir(OUTREACH_DIR, { withFileTypes: true })
  const csvFiles = entries.filter(e => e.isFile() && e.name.toLowerCase().endsWith('.csv')).map(e => e.name)
  let total = 0, failures = 0
  for (const file of csvFiles) {
    const fullPath = path.join(OUTREACH_DIR, file)
    const raw = await readFile(fullPath, 'utf8')
    const { headers, rows } = parseCsv(raw)
    if (headers.length === 0 || rows.length === 0) continue
    const subjCol = headers.find(h => h.toLowerCase().includes('subject'))
    const bodyCol = headers.find(h => /email_text|default_body|message_body|body/i.test(h))
    if (!subjCol || !bodyCol) continue
    for (const row of rows) {
      total++
      const subj = row[subjCol] ?? ''
      const body = row[bodyCol] ?? ''
      const errors = []
      if (!checkSignature(body)) errors.push('Missing signature')
      if (checkForbidden(body) || checkForbidden(subj)) errors.push('Forbidden phrase')
      if (!checkFirstSentence(body)) errors.push('First sentence not compliant')
      if (!checkSubject(subj)) errors.push('Subject not compliant')
      if (errors.length) {
        failures++
        console.log(`[${file}] ${row.full_name || row.email || 'row'}: ${errors.join(', ')}`)
      }
    }
  }
  if (failures) {
    console.warn(`\nWARN: ${failures} of ${total} outreach rows failed format checks (advisory only).`)
  } else {
    console.log(`PASS: All ${total} outreach rows passed format checks.`)
  }
}

main().catch(e => {
  console.error(e)
  process.exitCode = 1
})
