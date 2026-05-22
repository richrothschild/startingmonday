import { readFile } from 'node:fs/promises'
import path from 'node:path'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/lint-outreach-single-file.mjs <csv-path>')
  process.exit(2)
}

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
  const norm = (text ?? '').replace(/\r\n/g, '\n').trim()
  return /\nRich\nstartingmonday\.app(\n|$)/.test(norm)
}

function checkForbidden(text) {
  const norm = (text ?? '').toLowerCase()
  return /remit|i hope this finds you well|guaranteed|risk free|act now|limited time|buy now|double your|no obligation|click here|winner|urgent response needed|em dash|—/.test(norm)
}

function checkFirstSentence(text) {
  const lines = (text ?? '').replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return false
  const first = lines[1]
  return first.startsWith('I have been following') || first.startsWith('You work with senior leaders')
}

function checkSubject(subject) {
  const s = (subject ?? '').trim()
  return /^Bad idea to send a 1-page .+ conversation flow for .+\?$/.test(s)
    || /^Quick question on .+/.test(s)
}

async function main() {
  const fullPath = path.resolve(process.cwd(), file)
  const raw = await readFile(fullPath, 'utf8')
  const { headers, rows } = parseCsv(raw)
  if (headers.length === 0 || rows.length === 0) {
    console.error('No rows found')
    process.exit(1)
  }

  const subjCol = headers.find(h => h.toLowerCase().includes('subject'))
  const bodyCol = headers.find(h => /email_text|default_body|message_body|body/i.test(h))
  if (!subjCol || !bodyCol) {
    console.error('Required columns not found')
    process.exit(1)
  }

  let sigFail = 0, forbFail = 0, firstFail = 0, subjFail = 0
  for (const row of rows) {
    const subj = row[subjCol] ?? ''
    const body = row[bodyCol] ?? ''
    if (!checkSignature(body)) sigFail++
    if (checkForbidden(subj) || checkForbidden(body)) forbFail++
    if (!checkFirstSentence(body)) firstFail++
    if (!checkSubject(subj)) subjFail++
  }

  console.log(`File: ${file}`)
  console.log(`Rows checked: ${rows.length}`)
  console.log(`Signature failures: ${sigFail}`)
  console.log(`Forbidden failures: ${forbFail}`)
  console.log(`First sentence failures: ${firstFail}`)
  console.log(`Subject failures: ${subjFail}`)

  if (sigFail || forbFail || firstFail || subjFail) {
    console.error('FAIL: scoped lint check failed')
    process.exit(1)
  }

  console.log('PASS: scoped lint check passed')
}

main().catch(e => { console.error(e); process.exit(1) })
