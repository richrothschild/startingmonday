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
      if (row.some((cell) => cell.length > 0)) records.push(row)
      row = []
      continue
    }

    current += ch
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    if (row.some((cell) => cell.length > 0)) records.push(row)
  }

  if (records.length === 0) return { headers: [], rows: [] }

  const [headers, ...lines] = records
  const rows = lines.map((cols) => {
    const mapped = {}
    for (let i = 0; i < headers.length; i++) mapped[headers[i]] = cols[i] ?? ''
    return mapped
  })

  return { headers, rows }
}

function findHeader(headers, patterns) {
  return headers.find((h) => patterns.some((p) => p.test(h)))
}

function inferChannel(fileName, rowChannel) {
  const lower = `${fileName} ${rowChannel ?? ''}`.toLowerCase()
  if (lower.includes('coach')) return 'coaches'
  if (lower.includes('outplacement')) return 'outplacement_firms'
  if (lower.includes('search')) return 'search_firms'
  if (lower.includes('executive')) return 'executives'
  return rowChannel || 'unknown'
}

async function main() {
  const files = (await readdir(OUTREACH_DIR)).filter((f) => f.toLowerCase().endsWith('.csv'))
  const channels = {
    coaches: [],
    search_firms: [],
    outplacement_firms: [],
    executives: [],
  }

  for (const fileName of files) {
    const raw = await readFile(path.join(OUTREACH_DIR, fileName), 'utf8')
    const { headers, rows } = parseCsv(raw)
    if (!headers.length || !rows.length) continue

    const subjectKey = findHeader(headers, [/subject/i])
    const bodyKey = findHeader(headers, [/message_body/i, /email_text/i, /default_body/i, /^body$/i])
    const nameKey = findHeader(headers, [/recipient_name/i, /full_name/i, /^name$/i, /first name/i])
    const channelKey = findHeader(headers, [/outreach_channel/i, /^channel$/i, /role_bucket/i])

    if (!subjectKey || !bodyKey) continue

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const channel = inferChannel(fileName, channelKey ? row[channelKey] : '')
      if (!(channel in channels) || channels[channel].length >= 2) continue

      const snippet = (row[bodyKey] ?? '')
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(' ')

      channels[channel].push({
        file: fileName,
        line: i + 2,
        name: (nameKey ? row[nameKey] : '') ?? '',
        subject: row[subjectKey] ?? '',
        snippet,
      })
    }

    if (Object.values(channels).every((entries) => entries.length >= 2)) break
  }

  for (const [channel, entries] of Object.entries(channels)) {
    console.log(`## ${channel}`)
    entries.forEach((entry, index) => {
      console.log(`${index + 1}. [${entry.file}:${entry.line}] ${entry.subject}`)
      console.log(`   ${entry.name ? `${entry.name} - ` : ''}${entry.snippet}`)
    })
    console.log('')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
