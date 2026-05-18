import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const OUTREACH_DIR = path.join(process.cwd(), 'docs', 'outreach')

function parseCsv(content: string) {
  if (!content.trim()) return { headers: [], rows: [] }
  const records: string[][] = []
  let row: string[] = []
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
    const mapped: Record<string, string> = {}
    for (let i = 0; i < headers.length; i++) mapped[headers[i]] = cols[i] ?? ''
    return mapped
  })
  return { headers, rows }
}

describe('Outreach template contract', () => {
  const files = fs.readdirSync(OUTREACH_DIR).filter(f => f.endsWith('.csv'))
  for (const file of files) {
    const raw = fs.readFileSync(path.join(OUTREACH_DIR, file), 'utf8')
    const { headers, rows } = parseCsv(raw)
    if (headers.length === 0 || rows.length === 0) continue
    const subjCol = headers.find(h => h.toLowerCase().includes('subject'))
    const bodyCol = headers.find(h => /email_text|default_body|message_body|body/i.test(h))
    if (!subjCol || !bodyCol) continue
    it(`${file} - all rows`, () => {
      for (const row of rows) {
        const subj = row[subjCol] ?? ''
        const body = row[bodyCol] ?? ''
        expect(/\nRich\nstartingmonday\.app(\n|$)/.test(body)).toBe(true)
        expect(/remit|i hope this finds you well|guaranteed|risk free|act now|limited time|buy now|double your|no obligation|click here|winner|urgent response needed|em dash|—/i.test(body + subj)).toBe(false)
        const lines = body.replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(Boolean)
        expect(lines.length >= 2 && lines[1].startsWith('I have been following')).toBe(true)
        expect(/^Bad idea to send a 1-page .+ conversation flow for .+\?$/.test(subj)).toBe(true)
      }
    })
  }
})
