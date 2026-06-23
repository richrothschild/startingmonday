import { describe, expect, it } from 'vitest'
import { parseLinkedInExportCsv } from '@/lib/enrichment/linkedin-export-parser'

describe('parseLinkedInExportCsv', () => {
  it('parses canonical LinkedIn export headers', () => {
    const csv = [
      'First Name,Last Name,Email Address,Company,Position,Connected On,Profile URL',
      'Jane,Doe,jane@example.com,The Acme Inc,VP Product,2026-06-01,https://www.linkedin.com/in/jane-doe/',
    ].join('\n')

    const rows = parseLinkedInExportCsv(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].fullName).toBe('Jane Doe')
    expect(rows[0].normalizedFullName).toBe('jane doe')
    expect(rows[0].normalizedCompany).toBe('acme')
  })

  it('supports full name fallback shape', () => {
    const csv = [
      'Full Name,Current Company,Email',
      'Dr. John Q. Public Jr.,Northwind Technologies,john@example.com',
    ].join('\n')

    const rows = parseLinkedInExportCsv(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].normalizedFullName).toBe('john q public')
    expect(rows[0].normalizedCompany).toBe('northwind technologies')
  })

  it('ignores empty rows and invalid names', () => {
    const csv = [
      'First Name,Last Name,Company',
      ',,,',
      ' , ,Acme',
      'Sara,Ng,Acme',
    ].join('\n')

    const rows = parseLinkedInExportCsv(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].fullName).toBe('Sara Ng')
  })
})
