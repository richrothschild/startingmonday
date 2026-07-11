import { normalizeCompanyName, normalizePersonName } from '@/lib/enrichment/linkedin-export-matching'

export type LinkedInExportRow = {
  firstName: string | null
  lastName: string | null
  fullName: string
  email: string | null
  company: string | null
  position: string | null
  connectedOn: string | null
  profileUrl: string | null
  normalizedFullName: string
  normalizedCompany: string
}

type CsvRecord = Record<string, string>

function isLikelyLinkedInHeader(row: string[]): boolean {
  const lowered = row.map((cell) => cell.trim().toLowerCase())
  const hasName = lowered.includes('first name') || lowered.includes('full name') || lowered.includes('firstname')
  const hasCompany = lowered.includes('company') || lowered.includes('company name') || lowered.includes('current company')
  return hasName && hasCompany
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let i = 0
  let inQuotes = false

  while (i < text.length) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += ch
      i += 1
      continue
    }

    if (ch === '"') {
      inQuotes = true
      i += 1
      continue
    }

    if (ch === ',') {
      row.push(field)
      field = ''
      i += 1
      continue
    }

    if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i += 1
      continue
    }

    if (ch !== '\r') {
      field += ch
    }

    i += 1
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

function getValue(record: CsvRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }
  return ''
}

function toNull(value: string): string | null {
  return value.trim().length > 0 ? value.trim() : null
}

export function parseLinkedInExportCsv(text: string): LinkedInExportRow[] {
  const rows = parseCsv(text)
  if (rows.length < 2) return []

  const headerIndex = rows.findIndex(isLikelyLinkedInHeader)
  if (headerIndex < 0 || headerIndex >= rows.length - 1) return []

  const headers = rows[headerIndex]

  return rows.slice(headerIndex + 1)
    .map((values) => {
      const record: CsvRecord = {}
      headers.forEach((header, index) => {
        record[header.trim().toLowerCase()] = values[index] ?? ''
      })

      const firstName = getValue(record, 'first name', 'firstname')
      const lastName = getValue(record, 'last name', 'lastname')
      const fullName = getValue(record, 'full name', 'fullname') || `${firstName} ${lastName}`.trim()
      const company = getValue(record, 'company', 'company name', 'current company')

      return {
        firstName: toNull(firstName),
        lastName: toNull(lastName),
        fullName,
        email: toNull(getValue(record, 'email address', 'email')),
        company: toNull(company),
        position: toNull(getValue(record, 'position', 'title', 'job title')),
        connectedOn: toNull(getValue(record, 'connected on', 'connectedon', 'connected at')),
        profileUrl: toNull(getValue(record, 'profile url', 'public profile url', 'linkedin profile', 'url')),
        normalizedFullName: normalizePersonName(fullName),
        normalizedCompany: normalizeCompanyName(company),
      } satisfies LinkedInExportRow
    })
    .filter((row) => row.fullName.trim().length > 0)
    .filter((row) => row.normalizedFullName.length > 0)
}
