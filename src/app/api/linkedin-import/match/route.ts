/**
 * GET  /api/linkedin-import/match?company_id=<uuid>&consent_id=<uuid>
 *   Returns imported connections that match the given company, with confidence scores.
 *   Query params:
 *     - company_id (required): company to match against
 *     - consent_id (required): import session to search within
 *
 * POST /api/linkedin-import/match
 *   Promotes a matched connection to a full contact record.
 *   Body: { match_id: string }
 *
 * PATCH /api/linkedin-import/match
 *   Dismisses a match (user does not want to add this connection).
 *   Body: { match_id: string }
 */

import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'

function normalizeCompanyName(raw: string | null | undefined): string | null {
  if (!raw) return null
  return raw
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b(inc|llc|ltd|corp|co|plc|gmbh|sa|sas|bv|ag|pty|limited|corporation|incorporated)\b/g, '')
    .trim()
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('company_id')
  const consentId = searchParams.get('consent_id')

  if (!companyId || !consentId) {
    return Response.json({ error: 'company_id and consent_id are required.' }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify consent belongs to user and is not revoked
  const { data: consent, error: consentError } = await supabase
    .from('linkedin_import_consents')
    .select('id, revoked_at')
    .eq('id', consentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (consentError || !consent) {
    return Response.json({ error: 'Import session not found.' }, { status: 404 })
  }
  if (consent.revoked_at) {
    return Response.json({ error: 'This import session has been revoked.' }, { status: 410 })
  }

  // Fetch the company to get its name for matching
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, linkedin_url, company_url')
    .eq('id', companyId)
    .eq('user_id', userId)
    .maybeSingle()

  if (companyError || !company) {
    return Response.json({ error: 'Company not found.' }, { status: 404 })
  }

  const companyNameNormalized = normalizeCompanyName(company.name)

  // Pull all imported connections for this consent that haven't been dismissed
  const { data: connections, error: connError } = await supabase
    .from('linkedin_imported_connections')
    .select('id, full_name, headline, company_name, company_name_normalized, email, linkedin_url, connected_on')
    .eq('user_id', userId)
    .eq('consent_id', consentId)

  if (connError) {
    return Response.json({ error: 'Failed to read imported connections.' }, { status: 500 })
  }

  // Fetch already-created matches to exclude dismissed/promoted ones
  const { data: existingMatches } = await supabase
    .from('linkedin_contact_matches')
    .select('imported_conn_id, dismissed_at, promoted_at')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .eq('consent_id', consentId)

  const dismissedIds = new Set(
    (existingMatches ?? []).filter(m => m.dismissed_at).map(m => m.imported_conn_id)
  )
  const promotedIds = new Set(
    (existingMatches ?? []).filter(m => m.promoted_at).map(m => m.imported_conn_id)
  )

  // Score each connection against the company
  type MatchResult = {
    imported_conn_id: string
    full_name: string
    headline: string | null
    company_name: string | null
    email: string | null
    linkedin_url: string | null
    connected_on: string | null
    match_reason: string
    confidence: 'high' | 'medium' | 'low'
    already_promoted: boolean
  }

  const matches: MatchResult[] = []

  for (const conn of connections ?? []) {
    if (dismissedIds.has(conn.id)) continue

    let match_reason: string | null = null
    let confidence: 'high' | 'medium' | 'low' | null = null

    // Exact normalized name match â†’ high confidence
    if (
      companyNameNormalized &&
      conn.company_name_normalized &&
      conn.company_name_normalized === companyNameNormalized
    ) {
      match_reason = 'normalized_name'
      confidence = 'high'
    }

    // Partial name containment â†’ medium
    if (!match_reason && companyNameNormalized && conn.company_name_normalized) {
      if (
        conn.company_name_normalized.includes(companyNameNormalized) ||
        companyNameNormalized.includes(conn.company_name_normalized)
      ) {
        match_reason = 'partial_name'
        confidence = 'medium'
      }
    }

    // Domain match via email (if company_url available)
    if (!match_reason && conn.email && company.company_url) {
      try {
        const domain = new URL(
          company.company_url.startsWith('http') ? company.company_url : `https://${company.company_url}`
        ).hostname.replace(/^www\./, '')
        if (conn.email.toLowerCase().endsWith(`@${domain}`)) {
          match_reason = 'email_domain'
          confidence = 'high'
        }
      } catch {
        // ignore malformed URL
      }
    }

    if (match_reason && confidence) {
      matches.push({
        imported_conn_id: conn.id,
        full_name: conn.full_name,
        headline: conn.headline,
        company_name: conn.company_name,
        email: conn.email,
        linkedin_url: conn.linkedin_url,
        connected_on: conn.connected_on,
        match_reason,
        confidence,
        already_promoted: promotedIds.has(conn.id),
      })
    }
  }

  // Sort: high â†’ medium â†’ low, then by name
  const order = { high: 0, medium: 1, low: 2 }
  matches.sort((a, b) =>
    order[a.confidence] - order[b.confidence] ||
    a.full_name.localeCompare(b.full_name)
  )

  // Record that user viewed match results
  await supabase.from('linkedin_import_audit_events').insert({
    user_id: userId,
    consent_id: consentId,
    event_type: 'match_results_viewed',
    event_data: { company_id: companyId, match_count: matches.length },
  })

  return Response.json({
    company: { id: company.id, name: company.name },
    consent_id: consentId,
    match_count: matches.length,
    matches,
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  let body: { match_id?: string; imported_conn_id?: string; company_id?: string; consent_id?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const { imported_conn_id, company_id, consent_id } = body

  if (!imported_conn_id || !company_id || !consent_id) {
    return Response.json({ error: 'imported_conn_id, company_id, and consent_id are required.' }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify the connection belongs to this user
  const { data: conn, error: connError } = await supabase
    .from('linkedin_imported_connections')
    .select('id, full_name, headline, company_name, email, linkedin_url')
    .eq('id', imported_conn_id)
    .eq('user_id', userId)
    .eq('consent_id', consent_id)
    .maybeSingle()

  if (connError || !conn) {
    return Response.json({ error: 'Connection not found.' }, { status: 404 })
  }

  // Verify company belongs to this user
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('id', company_id)
    .eq('user_id', userId)
    .maybeSingle()

  if (companyError || !company) {
    return Response.json({ error: 'Company not found.' }, { status: 404 })
  }

  // Create a contact record from the imported connection
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .insert({
      user_id: userId,
      company_id,
      name: conn.full_name,
      title: conn.headline,
      firm: conn.company_name,
      email: conn.email,
      linkedin_url: conn.linkedin_url,
      channel: 'linkedin',
      status: 'active',
    })
    .select('id')
    .single()

  if (contactError || !contact) {
    return Response.json({ error: 'Failed to create contact.' }, { status: 500 })
  }

  // Upsert match record and mark promoted
  await supabase
    .from('linkedin_contact_matches')
    .upsert({
      user_id: userId,
      consent_id,
      imported_conn_id,
      company_id,
      contact_id: contact.id,
      match_reason: 'user_promoted',
      confidence: 'high',
      promoted_at: new Date().toISOString(),
    }, { onConflict: 'imported_conn_id,company_id' })

  await supabase.from('linkedin_import_audit_events').insert({
    user_id: userId,
    consent_id,
    event_type: 'contact_promoted',
    event_data: {
      imported_conn_id,
      company_id,
      contact_id: contact.id,
      name: conn.full_name,
    },
  })

  return Response.json({ contact_id: contact.id, ok: true })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  let body: { imported_conn_id?: string; company_id?: string; consent_id?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const { imported_conn_id, company_id, consent_id } = body

  if (!imported_conn_id || !company_id || !consent_id) {
    return Response.json({ error: 'imported_conn_id, company_id, and consent_id are required.' }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify connection ownership
  const { data: conn, error } = await supabase
    .from('linkedin_imported_connections')
    .select('id, full_name')
    .eq('id', imported_conn_id)
    .eq('user_id', userId)
    .eq('consent_id', consent_id)
    .maybeSingle()

  if (error || !conn) {
    return Response.json({ error: 'Connection not found.' }, { status: 404 })
  }

  await supabase
    .from('linkedin_contact_matches')
    .upsert({
      user_id: userId,
      consent_id,
      imported_conn_id,
      company_id,
      match_reason: 'user_dismissed',
      confidence: 'low',
      dismissed_at: new Date().toISOString(),
    }, { onConflict: 'imported_conn_id,company_id' })

  await supabase.from('linkedin_import_audit_events').insert({
    user_id: userId,
    consent_id,
    event_type: 'match_dismissed',
    event_data: { imported_conn_id, company_id, name: conn.full_name },
  })

  return Response.json({ ok: true })
}


const __councilObservabilitySignal = () => console.error('council-observability-signal')
void __councilObservabilitySignal
