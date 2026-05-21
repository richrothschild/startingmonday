import { readdir, readFile, writeFile } from 'node:fs/promises'
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

function escapeCsvCell(value) {
  const str = String(value ?? '')
  if (/[",\r\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function toCsv(headers, rows) {
  const lines = [headers.map(escapeCsvCell).join(',')]
  for (const row of rows) {
    lines.push(headers.map(h => escapeCsvCell(row[h] ?? '')).join(','))
  }
  return lines.join('\r\n') + '\r\n'
}

function isCoachRow(row) {
  const rb = (row.role_bucket || row.role || '').toLowerCase()
  const title = (row.title || '').toLowerCase()
  if (rb.includes('coach')) return true
  if (title.includes('coach')) return true
  return false
}

function hasEmailColumns(headers) {
  const lower = headers.map(h => h.toLowerCase())
  const hasSubject = lower.some(h => h.includes('subject'))
  const hasBody = lower.some(h => /email_text|default_body|message_body|email_body|body/.test(h))
  return hasSubject && hasBody
}

function getFirstName(row) {
  if (row.first_name) return row.first_name.trim()
  const full = (row.full_name || '').trim()
  if (full) return full.split(/\s+/)[0]
  return 'there'
}

function getCompany(row) {
  return (row.company || row['company_name'] || row['Company Name'] || 'your team').trim() || 'your team'
}

function buildCompliantSubject(company) {
  return `Bad idea to send a 1-page executive transition conversation flow for ${company}?`
}

function buildCompliantBody(first, company) {
  return [
    `Hi ${first},`,
    '',
    `I have been following your work at ${company}, and I thought this might be useful for the executives you support.`,
    '',
    'Starting Monday gives executive coaches a practical execution layer: target company intelligence, structured prep briefs, and outreach workflows that help senior candidates move with focus.',
    '',
    'Executive coaches across multiple programs use it as a referral resource when clients are ready to go active, while the coach stays at the strategic level.',
    '',
    'If useful, I can walk you through it in 20 minutes and you can decide quickly if it fits your practice.',
    '',
    'Rich',
    'startingmonday.app',
  ].join('\n')
}

function checkSubject(subject) {
  return /^Bad idea to send a 1-page .+ conversation flow for .+\?$/.test(subject)
}

function checkForbidden(text) {
  const norm = (text ?? '').toLowerCase()
  return /remit|i hope this finds you well|guaranteed|risk free|act now|limited time|buy now|double your|no obligation|click here|winner|urgent response needed|em dash|—/.test(norm)
}

function checkFirstSentence(text) {
  const lines = (text ?? '').replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return false
  return lines[1].startsWith('I have been following')
}

function checkSignature(text) {
  const norm = (text ?? '').replace(/\r\n/g, '\n').trim()
  return /\nRich\nstartingmonday\.app(\n|$)/.test(norm)
}

async function main() {
  const entries = await readdir(OUTREACH_DIR, { withFileTypes: true })
  const csvFiles = entries
    .filter(e => e.isFile() && e.name.toLowerCase().endsWith('.csv'))
    .map(e => e.name)

  const excludeFiles = new Set([
    'exec_coaches_full_batch_may2026.csv',
    'exec_coaches_batch_may2026_personalized.csv',
  ])

  let totalCoachRowsUpdated = 0
  const touched = []

  for (const file of csvFiles) {
    if (excludeFiles.has(file)) continue

    const fullPath = path.join(OUTREACH_DIR, file)
    const raw = await readFile(fullPath, 'utf8')
    const { headers, rows } = parseCsv(raw)
    if (!headers.length || !rows.length) continue
    if (!hasEmailColumns(headers)) continue

    const subjectCols = headers.filter(h => h.toLowerCase().includes('subject'))
    const bodyCols = headers.filter(h => /email_text|default_body|message_body|email_body|body/i.test(h))

    let updatedInFile = 0
    for (const row of rows) {
      if (!isCoachRow(row)) continue

      const first = getFirstName(row)
      const company = getCompany(row)
      const subject = buildCompliantSubject(company)
      const body = buildCompliantBody(first, company)

      for (const c of subjectCols) row[c] = subject
      for (const c of bodyCols) row[c] = body

      updatedInFile++
      totalCoachRowsUpdated++
    }

    if (updatedInFile > 0) {
      await writeFile(fullPath, toCsv(headers, rows), 'utf8')
      touched.push({ file, updatedInFile })
    }
  }

  // Coach-only lint verification on touched files
  const lint = []
  for (const { file } of touched) {
    const fullPath = path.join(OUTREACH_DIR, file)
    const raw = await readFile(fullPath, 'utf8')
    const { headers, rows } = parseCsv(raw)
    const subjectCols = headers.filter(h => h.toLowerCase().includes('subject'))
    const bodyCols = headers.filter(h => /email_text|default_body|message_body|email_body|body/i.test(h))

    let checked = 0, sigFail = 0, firstFail = 0, subjFail = 0, forbFail = 0
    for (const row of rows) {
      if (!isCoachRow(row)) continue
      checked++
      const subject = subjectCols.map(c => row[c] || '').find(Boolean) || ''
      const body = bodyCols.map(c => row[c] || '').find(Boolean) || ''
      if (!checkSignature(body)) sigFail++
      if (!checkFirstSentence(body)) firstFail++
      if (!checkSubject(subject)) subjFail++
      if (checkForbidden(subject) || checkForbidden(body)) forbFail++
    }

    lint.push({ file, checked, sigFail, firstFail, subjFail, forbFail })
  }

  console.log('Legacy coach email normalization complete.')
  console.log(`Coach rows updated: ${totalCoachRowsUpdated}`)
  for (const t of touched) {
    console.log(`UPDATED ${t.file}: ${t.updatedInFile} coach rows`)
  }

  console.log('\nCoach-only lint check (touched files):')
  for (const r of lint) {
    console.log(`${r.file}: checked=${r.checked}, signature=${r.sigFail}, firstSentence=${r.firstFail}, subject=${r.subjFail}, forbidden=${r.forbFail}`)
  }

  const anyFail = lint.some(r => r.sigFail || r.firstFail || r.subjFail || r.forbFail)
  if (anyFail) process.exit(1)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
