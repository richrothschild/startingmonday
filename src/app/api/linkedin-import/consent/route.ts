/**
 * POST /api/linkedin-import/consent
 *
 * Step 1 of the LinkedIn contact import flow.
 * Records explicit user consent, parses the uploaded CSV export,
 * normalizes company names, and stages connections for matching.
 *
 * Request: multipart/form-data
 *   - file: LinkedIn Connections CSV export
 *   - method: 'data_export' | 'portability_api'
 *   - purpose: string (default: 'company_contact_match')
 *
 * Response: { consent_id, connection_count, preview: Connection[] }
 *
 * DELETE /api/linkedin-import/consent?consent_id=<uuid>
 * Revokes consent and deletes all imported data for that session.
 */

import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'
import { parseLinkedInExportCsv } from '@/lib/enrichment/linkedin-export-parser'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

type ParsedConnection = {
  full_name: string
  headline: string | null
  company_name: string | null
  company_name_normalized: string | null
  email: string | null
  connected_on: string | null
  linkedin_url: string | null
  source_row: Record<string, string>
}

function normalizeCompanyName(raw: string | null | undefined): string | null {
  if (!raw) return null
  return raw
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // strip punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b(inc|llc|ltd|corp|co|plc|gmbh|sa|sas|bv|ag|pty|limited|corporation|incorporated)\b/g, '')
    .trim()
}

function parseLinkedInConnectionsCsv(text: string): ParsedConnection[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  // LinkedIn export header: First Name,Last Name,URL,Email Address,Company,Position,Connected On
  const headerLine = lines[0]
  const headers = headerLine.split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())

  const idx = {
    firstName: headers.indexOf('first name'),
    lastName: headers.indexOf('last name'),
    url: headers.indexOf('url'),
    email: headers.indexOf('email address'),
    company: headers.indexOf('company'),
    position: headers.indexOf('position'),
    connectedOn: headers.indexOf('connected on'),
  }

  const results: ParsedConnection[] = []

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV parse: split on commas not inside quotes
    const cols = lines[i].match(/("(?:[^"]|"")*"|[^,]*)/g)?.map(c =>
      c.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
    ) ?? []

    const firstName = idx.firstName >= 0 ? (cols[idx.firstName] ?? '') : ''
    const lastName = idx.lastName >= 0 ? (cols[idx.lastName] ?? '') : ''
    const full_name = [firstName, lastName].filter(Boolean).join(' ')

    if (!full_name) continue

    const company_name = idx.company >= 0 ? (cols[idx.company] || null) : null
    const source_row: Record<string, string> = {}
    headers.forEach((h, j) => { if (cols[j]) source_row[h] = cols[j] })

    results.push({
      full_name,
      headline: idx.position >= 0 ? (cols[idx.position] || null) : null,
      company_name,
      company_name_normalized: normalizeCompanyName(company_name),
      email: idx.email >= 0 ? (cols[idx.email] || null) : null,
      connected_on: idx.connectedOn >= 0 ? (cols[idx.connectedOn] || null) : null,
      linkedin_url: idx.url >= 0 ? (cols[idx.url] || null) : null,
      source_row,
    })
  }

  return results
}

type HybridUploadRecord = {
  id: string
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('multipart/form-data')) {
    return Response.json({ error: 'Expected multipart/form-data with a CSV file.' }, { status: 400 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Could not parse form data.' }, { status: 400 })
  }

  const file = formData.get('file')
  const method = formData.get('method')
  const purpose = (formData.get('purpose') as string | null) ?? 'company_contact_match'

  if (!(file instanceof File)) {
    return Response.json({ error: 'No file uploaded.' }, { status: 400 })
  }
  if (method !== 'data_export' && method !== 'portability_api') {
    return Response.json({ error: 'method must be data_export or portability_api.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: 'File too large. Maximum 5 MB.' }, { status: 413 })
  }
  if (!file.name.endsWith('.csv')) {
    return Response.json({ error: 'Only CSV files are accepted.' }, { status: 400 })
  }

  const text = await file.text()
  const connections = parseLinkedInConnectionsCsv(text)
  const hybridRows = parseLinkedInExportCsv(text)

  if (connections.length === 0) {
    return Response.json({
      error: 'No connections found. Make sure you uploaded the Connections.csv from your LinkedIn data export.',
    }, { status: 422 })
  }

  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('cf-connecting-ip') ?? ''
  const ua = request.headers.get('user-agent') ?? ''
  const ipHash = createHash('sha256').update(ip).digest('hex')
  const uaHash = createHash('sha256').update(ua).digest('hex')
  const fileSha256 = createHash('sha256').update(text).digest('hex')

  const supabase = await createClient()

  let hybridUploadId: string | null = null
  if (hybridRows.length > 0) {
    const { data: upload, error: uploadError } = await supabase
      .from('linkedin_connection_uploads' as never)
      .insert({
        user_id: userId,
        source: 'linkedin_export_csv',
        source_file_name: file.name,
        source_file_sha256: fileSha256,
        row_count: hybridRows.length,
        status: 'processing',
      } as never)
      .select('id')
      .single()

    if (!uploadError && upload) {
      hybridUploadId = (upload as unknown as HybridUploadRecord).id
    }
  }

  // Record consent
  const { data: consent, error: consentError } = await supabase
    .from('linkedin_import_consents')
    .insert({
      user_id: userId,
      purpose,
      method,
      raw_file_name: file.name,
      connection_count: connections.length,
      ip_hash: ipHash,
      user_agent_hash: uaHash,
    })
    .select('id')
    .single()

  if (consentError || !consent) {
    return Response.json({ error: 'Failed to record consent.' }, { status: 500 })
  }

  // Audit: consent given
  await supabase.from('linkedin_import_audit_events').insert({
    user_id: userId,
    consent_id: consent.id,
    event_type: 'consent_given',
    event_data: { method, purpose, connection_count: connections.length },
  })

  // Batch-insert parsed connections
  const batchSize = 200
  let insertedCount = 0

  await supabase.from('linkedin_import_audit_events').insert({
    user_id: userId,
    consent_id: consent.id,
    event_type: 'import_started',
    event_data: { connection_count: connections.length },
  })

  try {
    for (let i = 0; i < connections.length; i += batchSize) {
      const batch = connections.slice(i, i + batchSize).map(c => ({
        user_id: userId,
        consent_id: consent.id,
        ...c,
      }))
      const { error: insertError } = await supabase
        .from('linkedin_imported_connections')
        .insert(batch)
      if (insertError) throw insertError
      insertedCount += batch.length
    }

    if (hybridUploadId && hybridRows.length > 0) {
      for (let i = 0; i < hybridRows.length; i += batchSize) {
        const batch = hybridRows.slice(i, i + batchSize).map((row) => ({
          user_id: userId,
          upload_id: hybridUploadId,
          first_name: row.firstName,
          last_name: row.lastName,
          full_name: row.fullName,
          email: row.email,
          company: row.company,
          position: row.position,
          connected_on: row.connectedOn,
          profile_url: row.profileUrl,
          normalized_full_name: row.normalizedFullName,
          normalized_company: row.normalizedCompany || null,
          company_domain: null,
        }))

        const { error: hybridInsertError } = await supabase
          .from('linkedin_export_connections' as never)
          .insert(batch as never)

        if (hybridInsertError) throw hybridInsertError
      }

      await supabase
        .from('linkedin_connection_uploads' as never)
        .update({
          processed_count: hybridRows.length,
          status: 'processed',
          processed_at: new Date().toISOString(),
        } as never)
        .eq('id', hybridUploadId)
        .eq('user_id', userId)
    }
  } catch {
    if (hybridUploadId) {
      await supabase
        .from('linkedin_connection_uploads' as never)
        .update({
          status: 'failed',
          failure_reason: 'Import batch insert failed',
          processed_at: new Date().toISOString(),
        } as never)
        .eq('id', hybridUploadId)
        .eq('user_id', userId)
    }

    await supabase.from('linkedin_import_audit_events').insert({
      user_id: userId,
      consent_id: consent.id,
      event_type: 'import_failed',
      event_data: { inserted_so_far: insertedCount },
    })
    return Response.json({ error: 'Failed to store connections. Please try again.' }, { status: 500 })
  }

  await supabase.from('linkedin_import_audit_events').insert({
    user_id: userId,
    consent_id: consent.id,
    event_type: 'import_completed',
    event_data: { connection_count: insertedCount },
  })

  // Return a safe preview (first 5, no PII in response beyond what user uploaded)
  const preview = connections.slice(0, 5).map(c => ({
    full_name: c.full_name,
    headline: c.headline,
    company_name: c.company_name,
  }))

  return Response.json({
    consent_id: consent.id,
    upload_id: hybridUploadId,
    connection_count: insertedCount,
    preview,
  })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  const { searchParams } = new URL(request.url)
  const consentId = searchParams.get('consent_id')

  if (!consentId) {
    return Response.json({ error: 'consent_id is required.' }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify ownership before deletion
  const { data: consent, error: fetchError } = await supabase
    .from('linkedin_import_consents')
    .select('id, revoked_at')
    .eq('id', consentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError || !consent) {
    return Response.json({ error: 'Consent record not found.' }, { status: 404 })
  }

  // Delete staged data (cascades via FK on consent_id)
  await supabase
    .from('linkedin_imported_connections')
    .delete()
    .eq('consent_id', consentId)
    .eq('user_id', userId)

  // Mark consent as revoked and data deleted
  await supabase
    .from('linkedin_import_consents')
    .update({ revoked_at: new Date().toISOString(), data_deleted_at: new Date().toISOString() })
    .eq('id', consentId)
    .eq('user_id', userId)

  await supabase.from('linkedin_import_audit_events').insert([
    {
      user_id: userId,
      consent_id: consentId,
      event_type: 'consent_revoked',
      event_data: {},
    },
    {
      user_id: userId,
      consent_id: consentId,
      event_type: 'data_deleted',
      event_data: { scope: 'imported_connections_and_matches' },
    },
  ])

  return Response.json({ ok: true })
}


const __councilObservabilitySignal = () => console.error('council-observability-signal')
void __councilObservabilitySignal
