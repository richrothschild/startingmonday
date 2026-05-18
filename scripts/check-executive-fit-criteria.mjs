import { readFile } from 'node:fs/promises'
import path from 'node:path'
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const OUTREACH_DIR = path.join(process.cwd(), 'docs', 'outreach')
const TARGET_BAND = '1001-10000'

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

function canonicalize(value) {
  return (value ?? '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function normalizeCompanyKey(value) {
  return canonicalize(value)
    .replace(/\b(inc|incorporated|corp|corporation|co|company|group|holdings|plc|llc|ltd|limited|communications)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function fitFromRole(roleText) {
  const t = canonicalize(roleText)
  if (!t) return 'low'

  const strongSignals = [
    'chief financial officer',
    'cfo',
    'chief operating officer',
    'coo',
    'chief information officer',
    'cio',
    'chief revenue officer',
    'cro',
    'chief human resources officer',
    'chro',
    'chief people officer',
    'vp it',
    'vp information technology',
    'vp sales',
    'vp revenue',
  ]

  const mediumSignals = [
    'chief technology officer',
    'cto',
    'chief information security officer',
    'ciso',
    'chief data officer',
    'cdo',
    'chief analytics officer',
    'vp technology',
    'vp engineering',
  ]

  if (strongSignals.some(signal => t.includes(signal))) return 'strong'
  if (mediumSignals.some(signal => t.includes(signal))) return 'medium'
  return 'low'
}

function normalizeCurrentFit(value) {
  const fit = (value ?? '').toString().trim().toLowerCase()
  if (fit === 'strong' || fit === 'medium' || fit === 'low') return fit
  return 'unknown'
}

function parseCompanyBand(value) {
  const raw = (value ?? '').toString().trim()
  if (!raw) return 'unknown'

  if (raw === TARGET_BAND) return 'target'
  if (raw.includes('10001+')) return 'other'

  const normalized = canonicalize(raw)
  if (normalized.includes('1001 10000')) return 'target'
  if (normalized.includes('10001')) return 'other'

  const numeric = Number(normalized.replace(/[^0-9]/g, ''))
  if (Number.isFinite(numeric) && numeric > 0) {
    if (numeric > 1000 && numeric < 10000) return 'target'
    return 'other'
  }

  return 'unknown'
}

function expectedFit(roleText, companyBand) {
  const roleFit = fitFromRole(roleText)
  if (companyBand === 'unknown') return 'unknown'
  if (companyBand !== 'target') return 'low'
  return roleFit
}

async function loadCsv(fileName) {
  const raw = await readFile(path.join(OUTREACH_DIR, fileName), 'utf8')
  return parseCsv(raw)
}

async function loadCsvIfExists(fileName) {
  try {
    return await loadCsv(fileName)
  } catch {
    return { headers: [], rows: [] }
  }
}

function buildCompanyBandLookup(rows) {
  const lookup = new Map()
  for (const row of rows) {
    const key = normalizeCompanyKey(row.target_account ?? row.company)
    const band = parseCompanyBand(row.company_size_band ?? row.company_size)
    if (!key || band === 'unknown') continue
    if (!lookup.has(key)) lookup.set(key, band)
  }
  return lookup
}

async function csvAudit(companyBandLookup) {
  const csv = await loadCsv('executives_prospecting_midmarket_strong_medium.csv')
  const mismatches = []
  const unverifiable = []
  const byEmail = new Map()
  const byName = new Map()

  for (const row of csv.rows) {
    const roleText = `${row.title ?? ''} ${row.role_bucket ?? ''}`
    const companyKey = normalizeCompanyKey(row.company)
    const companyBand = companyBandLookup.get(companyKey) ?? parseCompanyBand(row.company_size_band ?? row.company_size)
    const expected = expectedFit(roleText, companyBand)
    const current = normalizeCurrentFit(row.fit_tier || row.confidence)
    const emailKey = canonicalize(row.email_guess ?? row.email)
    const nameKey = canonicalize(row.full_name ?? `${row.first_name ?? ''} ${row.last_name ?? ''}`)

    const indexPayload = {
      expected,
      companyBand,
      roleText,
      company: row.company || 'Unknown',
      name: row.full_name || `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || 'Unknown',
    }

    if (emailKey) byEmail.set(emailKey, indexPayload)
    if (nameKey) byName.set(nameKey, indexPayload)

    if (expected === 'unknown' || current === 'unknown') {
      unverifiable.push({
        name: indexPayload.name,
        company: indexPayload.company,
        role: row.title || row.role_bucket || 'Unknown',
        reason: expected === 'unknown' ? 'missing company size band' : 'missing fit tier',
      })
      continue
    }

    if (expected !== current) {
      mismatches.push({
        name: indexPayload.name,
        company: indexPayload.company,
        role: row.title || row.role_bucket || 'Unknown',
        companyBand,
        expected,
        current,
      })
    }
  }

  const pass = csv.rows.length - mismatches.length - unverifiable.length
  return { total: csv.rows.length, pass, mismatches, unverifiable, byEmail, byName }
}

async function buildExecutiveReferenceIndex(companyBandLookup) {
  const fileNames = [
    'executives_prospecting_midmarket_strong_medium.csv',
    'prospecting_combined_strict_100.csv',
    'prospecting_combined_strict_50_personalized.csv',
    'prospecting_combined_strict_31_personalized.csv',
    'prospecting_combined_strict_21_personalized.csv',
    'prospecting_batch_001.csv',
    'prospecting_batch_001_strict_roles.csv',
    'prospecting_batch_002_strict_roles.csv',
    'prospecting_batch_003_personalized_real_10.csv',
    'prospecting_batch_004_personalized_real_19.csv',
    'apollo_priority_send_ready.csv',
    'apollo_priority_followups.csv',
  ]

  const byEmail = new Map()
  const byName = new Map()

  for (const fileName of fileNames) {
    const data = await loadCsvIfExists(fileName)
    for (const row of data.rows) {
      const roleText = `${row.title ?? ''} ${row.role_bucket ?? ''}`.trim()
      const company = row.company ?? row.target_account ?? 'Unknown'
      const companyBand =
        companyBandLookup.get(normalizeCompanyKey(company)) ??
        parseCompanyBand(row.company_size_band ?? row.company_size)
      const expected = expectedFit(roleText, companyBand)

      const payload = {
        expected,
        companyBand,
        roleText: roleText || 'Unknown',
        company,
        name: row.full_name || `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || 'Unknown',
      }

      const emailKey = canonicalize(row.email_guess ?? row.email)
      const nameKey = canonicalize(payload.name)
      if (emailKey && !byEmail.has(emailKey)) byEmail.set(emailKey, payload)
      if (nameKey && !byName.has(nameKey)) byName.set(nameKey, payload)
    }
  }

  return { byEmail, byName }
}

async function dbAudit(companyBandLookup, referenceIndex) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return { skipped: true, reason: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY', total: 0, pass: 0, checked: 0, mismatches: [], unverifiable: [] }
  }

  const supabase = createClient(url, key)

  const { data: logs, error: logsError } = await supabase
    .from('outreach_logs')
    .select('id, recipient_name, recipient_email, fit_tier, contact_id')
    .eq('outreach_channel', 'executives')

  if (logsError) {
    return { skipped: true, reason: `Failed outreach_logs query: ${logsError.message}`, total: 0, pass: 0, checked: 0, mismatches: [], unverifiable: [] }
  }

  const contactIds = [...new Set((logs ?? []).map(log => log.contact_id).filter(Boolean))]
  let contactsById = new Map()

  if (contactIds.length > 0) {
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, title, last_role_discussed, firm, company_id')
      .in('id', contactIds)

    if (!contactsError && contacts) {
      contactsById = new Map(contacts.map(contact => [contact.id, contact]))
    }
  }

  const companyIds = [...new Set(Array.from(contactsById.values()).map(c => c.company_id).filter(Boolean))]
  let companiesById = new Map()
  if (companyIds.length > 0) {
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, company_size')
      .in('id', companyIds)

    if (!companiesError && companies) {
      companiesById = new Map(companies.map(company => [company.id, company]))
    }
  }

  let checked = 0
  const mismatches = []
  const unverifiable = []

  for (const log of logs ?? []) {
    const current = normalizeCurrentFit(log.fit_tier)
    if (current === 'unknown') {
      unverifiable.push({
        recipient: log.recipient_name || log.recipient_email || 'Unknown',
        reason: 'missing fit tier',
      })
      continue
    }

    const csvEmailMatch = referenceIndex.byEmail.get(canonicalize(log.recipient_email))
    const csvNameMatch = referenceIndex.byName.get(canonicalize(log.recipient_name))
    const csvMatch = csvEmailMatch ?? csvNameMatch

    if (csvMatch) {
      checked++
      if (csvMatch.expected === 'unknown') {
        unverifiable.push({
          recipient: log.recipient_name || log.recipient_email || 'Unknown',
          reason: 'missing company size band from CSV match',
        })
        continue
      }
      if (current !== csvMatch.expected) {
        mismatches.push({
          recipient: log.recipient_name || log.recipient_email || 'Unknown',
          role: csvMatch.roleText,
          companyBand: csvMatch.companyBand,
          current,
          expected: csvMatch.expected,
        })
      }
      continue
    }

    const contact = log.contact_id ? contactsById.get(log.contact_id) : null
    const roleText = `${contact?.title ?? ''} ${contact?.last_role_discussed ?? ''}`.trim()
    if (!roleText) {
      unverifiable.push({
        recipient: log.recipient_name || log.recipient_email || 'Unknown',
        reason: 'missing role on contact and no CSV match',
      })
      continue
    }

    let companyBand = 'unknown'
    const companyFromDb = contact?.company_id ? companiesById.get(contact.company_id) : null
    if (companyFromDb) {
      companyBand = parseCompanyBand(companyFromDb.company_size)
      if (companyBand === 'unknown') {
        companyBand = companyBandLookup.get(normalizeCompanyKey(companyFromDb.name)) ?? 'unknown'
      }
    }

    if (companyBand === 'unknown') {
      companyBand = companyBandLookup.get(normalizeCompanyKey(contact?.firm)) ?? 'unknown'
    }

    if (companyBand === 'unknown') {
      unverifiable.push({
        recipient: log.recipient_name || log.recipient_email || 'Unknown',
        reason: 'missing company size band',
      })
      continue
    }

    const expected = expectedFit(roleText, companyBand)
    checked++

    if (current !== expected) {
      mismatches.push({
        recipient: log.recipient_name || log.recipient_email || 'Unknown',
        role: roleText,
        companyBand,
        current,
        expected,
      })
    }
  }

  const total = (logs ?? []).length
  const pass = total - mismatches.length - unverifiable.length
  return { skipped: false, total, pass, checked, mismatches, unverifiable }
}

async function main() {
  const targetSlate = await loadCsv('us-senior-executive-target-slate.csv')
  const companyBandLookup = buildCompanyBandLookup(targetSlate.rows)

  const csv = await csvAudit(companyBandLookup)
  const referenceIndex = await buildExecutiveReferenceIndex(companyBandLookup)
  const db = await dbAudit(companyBandLookup, referenceIndex)

  if (csv.mismatches.length > 0) {
    for (const row of csv.mismatches) {
      console.log(`[CSV] ${row.name} (${row.company}) role=${row.role} band=${row.companyBand} expected=${row.expected} current=${row.current}`)
    }
  }

  if (csv.unverifiable.length > 0) {
    for (const row of csv.unverifiable) {
      console.log(`[CSV-UNVERIFIABLE] ${row.name} (${row.company}) role=${row.role} reason=${row.reason}`)
    }
  }

  if (db.mismatches.length > 0) {
    for (const row of db.mismatches) {
      console.log(`[DB] ${row.recipient} role=${row.role} band=${row.companyBand} expected=${row.expected} current=${row.current}`)
    }
  }

  if (db.unverifiable.length > 0) {
    for (const row of db.unverifiable) {
      console.log(`[DB-UNVERIFIABLE] ${row.recipient} reason=${row.reason}`)
    }
  }

  if (db.skipped) {
    console.log(`[DB] SKIP: ${db.reason}`)
  }

  const failures = csv.mismatches.length + db.mismatches.length
  console.log(`Executive fit criteria check: csv_total=${csv.total}, csv_pass=${csv.pass}, csv_mismatches=${csv.mismatches.length}, csv_unverifiable=${csv.unverifiable.length}, db_total=${db.total}, db_pass=${db.pass}, db_checked=${db.checked}, db_mismatches=${db.mismatches.length}, db_unverifiable=${db.unverifiable.length}`)
  console.log(`All CSV rows processed: ${csv.total === (csv.pass + csv.mismatches.length + csv.unverifiable.length) ? 'yes' : 'no'}`)
  console.log(`All DB rows processed: ${db.total === (db.pass + db.mismatches.length + db.unverifiable.length) ? 'yes' : 'no'}`)

  if (failures > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
