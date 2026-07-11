import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

function getArg(name, fallback = null) {
  const args = process.argv.slice(2)
  const idx = args.indexOf(`--${name}`)
  if (idx < 0) return fallback
  return args[idx + 1] ?? fallback
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
          continue
        }
        inQuotes = false
        continue
      }
      field += ch
      continue
    }

    if (ch === '"') {
      inQuotes = true
      continue
    }

    if (ch === ',') {
      row.push(field)
      field = ''
      continue
    }

    if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }

    if (ch !== '\r') field += ch
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

function findHeaderIndex(rows) {
  return rows.findIndex((r) => {
    const cells = r.map((c) => c.trim().toLowerCase())
    return cells.includes('first name') && cells.includes('last name') && cells.includes('company')
  })
}

function normalizeCompanyName(raw) {
  if (!raw) return null
  return String(raw)
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b(inc|llc|ltd|corp|co|plc|gmbh|sa|sas|bv|ag|pty|limited|corporation|incorporated)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim() || null
}

function normalizePersonName(raw) {
  return String(raw ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseLinkedInDate(raw) {
  if (!raw) return null
  const text = String(raw).trim()
  const dt = new Date(text)
  if (Number.isNaN(dt.getTime())) return null
  return dt.toISOString().slice(0, 10)
}

function emailDomain(email) {
  if (!email || !email.includes('@')) return null
  return email.split('@')[1].toLowerCase().trim() || null
}

function chunk(items, size) {
  const out = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

async function supabaseInsert({ baseUrl, key, table, rows, select = '', onConflict = null }) {
  const params = new URLSearchParams()
  if (select) params.set('select', select)
  if (onConflict) params.set('on_conflict', onConflict)
  const qs = params.toString()
  const url = `${baseUrl}/rest/v1/${table}${qs ? `?${qs}` : ''}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: onConflict ? 'resolution=merge-duplicates,return=representation' : 'return=representation',
    },
    body: JSON.stringify(rows),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Supabase insert failed for ${table}: ${res.status} ${body}`)
  }

  return res.json()
}

async function supabasePatch({ baseUrl, key, table, patch, filters }) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) params.set(k, `eq.${v}`)
  const url = `${baseUrl}/rest/v1/${table}?${params.toString()}`

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(patch),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Supabase patch failed for ${table}: ${res.status} ${body}`)
  }
}

async function supabaseSelect({ baseUrl, key, table, query }) {
  const qs = new URLSearchParams(query).toString()
  const url = `${baseUrl}/rest/v1/${table}?${qs}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Supabase select failed for ${table}: ${res.status} ${body}`)
  }
  return res.json()
}

async function main() {
  const file = getArg('file', 'docs/Connections.csv')
  const method = getArg('method', 'data_export')
  const purpose = getArg('purpose', 'company_contact_match')
  const userId = getArg('user-id', process.env.SUPABASE_USER_ID ?? process.env.DEMO_USER_ID ?? process.env.AUTOMATION_SERVICE_USER_ID)

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  if (!userId) {
    throw new Error('No user id provided. Use --user-id or set SUPABASE_USER_ID/DEMO_USER_ID/AUTOMATION_SERVICE_USER_ID')
  }

  const raw = await readFile(file, 'utf8')
  const rows = parseCsv(raw)
  const headerIndex = findHeaderIndex(rows)
  if (headerIndex < 0) {
    throw new Error('Could not find LinkedIn header row in CSV.')
  }

  const headers = rows[headerIndex].map((h) => h.trim().toLowerCase())
  const idx = {
    firstName: headers.indexOf('first name'),
    lastName: headers.indexOf('last name'),
    url: headers.indexOf('url'),
    email: headers.indexOf('email address'),
    company: headers.indexOf('company'),
    position: headers.indexOf('position'),
    connectedOn: headers.indexOf('connected on'),
  }

  const parsed = []
  const seenProfile = new Set()

  for (const row of rows.slice(headerIndex + 1)) {
    const first = idx.firstName >= 0 ? (row[idx.firstName] ?? '').trim() : ''
    const last = idx.lastName >= 0 ? (row[idx.lastName] ?? '').trim() : ''
    const full = `${first} ${last}`.trim()
    if (!full) continue

    const profileUrl = idx.url >= 0 ? (row[idx.url] ?? '').trim() : ''
    if (profileUrl && seenProfile.has(profileUrl.toLowerCase())) continue
    if (profileUrl) seenProfile.add(profileUrl.toLowerCase())

    const company = idx.company >= 0 ? (row[idx.company] ?? '').trim() : ''
    const email = idx.email >= 0 ? (row[idx.email] ?? '').trim() : ''
    const position = idx.position >= 0 ? (row[idx.position] ?? '').trim() : ''
    const connectedOn = idx.connectedOn >= 0 ? parseLinkedInDate(row[idx.connectedOn] ?? '') : null

    parsed.push({
      firstName: first || null,
      lastName: last || null,
      fullName: full,
      email: email || null,
      company: company || null,
      position: position || null,
      connectedOn,
      profileUrl: profileUrl || null,
      normalizedFullName: normalizePersonName(full),
      normalizedCompany: normalizeCompanyName(company),
      companyDomain: emailDomain(email),
      sourceRow: Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ''])),
    })
  }

  const fileSha256 = createHash('sha256').update(raw).digest('hex')
  const fileName = path.basename(file)

  const [consent] = await supabaseInsert({
    baseUrl: supabaseUrl,
    key: serviceKey,
    table: 'linkedin_import_consents',
    rows: [{
      user_id: userId,
      purpose,
      method,
      raw_file_name: fileName,
      connection_count: parsed.length,
      ip_hash: 'script-import',
      user_agent_hash: 'script-import',
    }],
    select: 'id',
  })

  const [upload] = await supabaseInsert({
    baseUrl: supabaseUrl,
    key: serviceKey,
    table: 'linkedin_connection_uploads',
    rows: [{
      user_id: userId,
      consent_id: consent.id,
      source: 'linkedin_export_csv',
      source_file_name: fileName,
      source_file_sha256: fileSha256,
      row_count: parsed.length,
      status: 'processing',
    }],
    select: 'id',
  })

  const importedRows = parsed.map((r) => ({
    user_id: userId,
    consent_id: consent.id,
    full_name: r.fullName,
    headline: r.position,
    company_name: r.company,
    company_name_normalized: r.normalizedCompany,
    email: r.email,
    connected_on: r.connectedOn,
    linkedin_url: r.profileUrl,
    source_row: r.sourceRow,
  }))

  const exportRowsAll = parsed.map((r) => ({
    user_id: userId,
    upload_id: upload.id,
    first_name: r.firstName,
    last_name: r.lastName,
    full_name: r.fullName,
    email: r.email,
    company: r.company,
    position: r.position,
    connected_on: r.connectedOn,
    profile_url: r.profileUrl,
    normalized_full_name: r.normalizedFullName,
    normalized_company: r.normalizedCompany,
    company_domain: r.companyDomain,
  }))

  const existingProfiles = await supabaseSelect({
    baseUrl: supabaseUrl,
    key: serviceKey,
    table: 'linkedin_export_connections',
    query: {
      select: 'profile_url',
      user_id: `eq.${userId}`,
      profile_url: 'not.is.null',
      limit: '5000',
    },
  })

  const existingProfileSet = new Set(
    (Array.isArray(existingProfiles) ? existingProfiles : [])
      .map((r) => String(r.profile_url || '').trim().toLowerCase())
      .filter(Boolean),
  )

  const exportRows = exportRowsAll.filter((r) => {
    if (!r.profile_url) return true
    return !existingProfileSet.has(String(r.profile_url).toLowerCase())
  })

  let importedCount = 0
  for (const batch of chunk(importedRows, 250)) {
    await supabaseInsert({
      baseUrl: supabaseUrl,
      key: serviceKey,
      table: 'linkedin_imported_connections',
      rows: batch,
    })
    importedCount += batch.length
  }

  let exportCount = 0
  for (const batch of chunk(exportRows, 250)) {
    await supabaseInsert({
      baseUrl: supabaseUrl,
      key: serviceKey,
      table: 'linkedin_export_connections',
      rows: batch,
    })
    exportCount += batch.length
  }

  await supabasePatch({
    baseUrl: supabaseUrl,
    key: serviceKey,
    table: 'linkedin_connection_uploads',
    patch: {
      processed_count: exportCount,
      status: 'processed',
      processed_at: new Date().toISOString(),
    },
    filters: { id: upload.id, user_id: userId },
  })

  await supabaseInsert({
    baseUrl: supabaseUrl,
    key: serviceKey,
    table: 'linkedin_import_audit_events',
    rows: [
      {
        user_id: userId,
        consent_id: consent.id,
        event_type: 'consent_given',
        event_data: { method, purpose, connection_count: parsed.length, source: 'script-import' },
      },
      {
        user_id: userId,
        consent_id: consent.id,
        event_type: 'import_started',
        event_data: { connection_count: parsed.length, source: 'script-import' },
      },
      {
        user_id: userId,
        consent_id: consent.id,
        event_type: 'import_completed',
        event_data: { imported_connections: importedCount, export_connections: exportCount, source: 'script-import' },
      },
    ],
  })

  console.log(`file=${fileName}`)
  console.log(`user_id_prefix=${String(userId).slice(0, 8)}...`)
  console.log(`consent_id=${consent.id}`)
  console.log(`upload_id=${upload.id}`)
  console.log(`rows_parsed=${parsed.length}`)
  console.log(`imported_connections_inserted=${importedCount}`)
  console.log(`export_connections_inserted_or_upserted=${exportCount}`)
  console.log(`export_connections_skipped_existing_profile_url=${exportRowsAll.length - exportRows.length}`)
}

main().catch((err) => {
  console.error(err.message || String(err))
  process.exit(1)
})
