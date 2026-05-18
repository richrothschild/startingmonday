import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUTREACH_DIR = path.join(process.cwd(), 'docs', 'outreach')
const DRY_RUN = process.argv.includes('--dry-run')

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

function serializeCsv(headers, rows) {
  const escapeCell = (value) => {
    const text = (value ?? '').toString()
    if (text.includes('"') || text.includes(',') || text.includes('\n') || text.includes('\r')) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }

  const lines = []
  lines.push(headers.map(escapeCell).join(','))
  for (const row of rows) {
    lines.push(headers.map(h => escapeCell(row[h] ?? '')).join(','))
  }
  return `${lines.join('\n')}\n`
}

function isEmailBodyColumn(header) {
  return /(^|_)(email_text|default_body|message_body|followup_text|draft_text|body)$/i.test(header)
}

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
  const entries = await readdir(OUTREACH_DIR, { withFileTypes: true })
  const csvFiles = entries.filter(e => e.isFile() && e.name.toLowerCase().endsWith('.csv')).map(e => e.name)

  let filesChanged = 0
  let rowsChanged = 0
  let fieldsChanged = 0

  for (const file of csvFiles) {
    const fullPath = path.join(OUTREACH_DIR, file)
    const raw = await readFile(fullPath, 'utf8')
    const { headers, rows } = parseCsv(raw)
    if (headers.length === 0 || rows.length === 0) continue

    let fileChanged = false
    const editableHeaders = headers.filter(isEmailBodyColumn)
    if (editableHeaders.length === 0) continue

    for (const row of rows) {
      let rowTouched = false
      for (const header of editableHeaders) {
        const existing = row[header] ?? ''
        const { value, changed } = ensureDomainBelowName(existing)
        if (changed) {
          row[header] = value
          fieldsChanged++
          rowTouched = true
          fileChanged = true
        }
      }
      if (rowTouched) rowsChanged++
    }

    if (fileChanged) {
      filesChanged++
      if (!DRY_RUN) {
        const next = serializeCsv(headers, rows)
        await writeFile(fullPath, next, 'utf8')
      }
    }
  }

  console.log(`CSV files scanned: ${csvFiles.length}`)
  console.log(`CSV files changed: ${filesChanged}`)
  console.log(`CSV rows changed: ${rowsChanged}`)
  console.log(`CSV fields changed: ${fieldsChanged}`)
  console.log(`Mode: ${DRY_RUN ? 'dry-run' : 'write'}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
