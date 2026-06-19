import { getSupabase } from '../lib/supabase.js'
import { logger } from '../lib/logger.js'
import { resolveSourceDecision } from '../lib/source-registry.js'

const SOURCE_KEY = 'leadership_changes'
const USER_PAGE_SIZE = 500
const SIGNAL_WINDOW_DAYS = Number(process.env.PERSON_SIGNAL_WINDOW_DAYS ?? 7)

function daysAgoIso(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function normalizePersonSignalType(companySignalType) {
  switch (companySignalType) {
    case 'exec_hire':
    case 'exec_departure':
    case 'board_change':
      return 'role_change'
    case 'award':
      return 'award'
    case 'new_product':
      return 'publication'
    case 'partnership':
    case 'funding':
    case 'expansion':
    case 'transformation_budget':
    case 'ai_investment':
      return 'company_news'
    default:
      return 'other'
  }
}

async function fetchActiveUserPage(supabase, afterUserId = null) {
  let query = supabase
    .from('users')
    .select('id, email')
    .in('subscription_status', ['active', 'trialing'])
    .order('id')
    .limit(USER_PAGE_SIZE)

  if (afterUserId) query = query.gt('id', afterUserId)

  const { data, error } = await query
  return { users: data ?? [], error }
}

async function upsertPersonFromContact(supabase, contact) {
  const linkedinUrl = contact.linkedin_url ? String(contact.linkedin_url).trim() : null

  if (linkedinUrl) {
    const { data: existingByLinkedIn } = await supabase
      .from('people')
      .select('id')
      .ilike('linkedin_url', linkedinUrl)
      .limit(1)
      .maybeSingle()

    if (existingByLinkedIn?.id) return existingByLinkedIn.id
  }

  const { data: inserted, error: insertError } = await supabase
    .from('people')
    .insert({
      full_name: contact.name,
      current_title: contact.title ?? null,
      current_company: contact.firm ?? null,
      linkedin_url: linkedinUrl,
      source_primary: contact.enrichment_source ?? 'manual',
      confidence: contact.enrichment_confidence ?? null,
      last_enriched_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (!insertError && inserted?.id) {
    return inserted.id
  }

  const { data: existingByName } = await supabase
    .from('people')
    .select('id')
    .eq('full_name', contact.name)
    .eq('current_company', contact.firm ?? null)
    .limit(1)
    .maybeSingle()

  return existingByName?.id ?? null
}

export async function runPersonSignalJob() {
  const supabase = getSupabase()

  const decision = await resolveSourceDecision(supabase, SOURCE_KEY)
  if (!decision.allowed) {
    logger.warn('person-signal-job: source blocked by registry', decision)
    return
  }

  const sinceIso = daysAgoIso(SIGNAL_WINDOW_DAYS)
  let usersProcessed = 0
  let contactsProcessed = 0
  let personSignalsInserted = 0
  let pages = 0
  let lastUserId = null

  while (pages < 20) {
    const { users, error } = await fetchActiveUserPage(supabase, lastUserId)
    if (error) {
      logger.error('person-signal-job: failed fetching users', { error: error.message })
      return
    }

    if (!users.length) break

    pages += 1
    usersProcessed += users.length
    const userIds = users.map((user) => user.id)

    const [{ data: contacts }, { data: companySignals }] = await Promise.all([
      supabase
        .from('contacts')
        .select('id, user_id, company_id, name, title, firm, linkedin_url, enrichment_source, enrichment_confidence')
        .in('user_id', userIds)
        .eq('status', 'active'),
      supabase
        .from('company_signals')
        .select('id, user_id, company_id, signal_type, signal_summary, source_url, signal_date, confidence')
        .in('user_id', userIds)
        .gte('created_at', sinceIso)
        .order('created_at', { ascending: false })
        .limit(10000),
    ])

    const signalsByKey = new Map()
    for (const signal of companySignals ?? []) {
      const key = `${signal.user_id}:${signal.company_id}`
      const bucket = signalsByKey.get(key) ?? []
      bucket.push(signal)
      signalsByKey.set(key, bucket)
    }

    for (const contact of contacts ?? []) {
      const key = `${contact.user_id}:${contact.company_id}`
      const relevantSignals = contact.company_id ? (signalsByKey.get(key) ?? []) : []
      if (!relevantSignals.length) continue

      contactsProcessed += 1
      const personId = await upsertPersonFromContact(supabase, contact)
      if (!personId) continue

      for (const signal of relevantSignals.slice(0, 3)) {
        const signalType = normalizePersonSignalType(signal.signal_type)
        const summary = signal.signal_summary
          ? `${contact.name}: ${signal.signal_summary}`
          : `${contact.name} has a new company-level signal relevant to relationship timing.`

        const { error: insertError } = await supabase
          .from('person_signals')
          .insert({
            person_id: personId,
            signal_type: signalType,
            title: summary.slice(0, 180),
            summary,
            source_url: signal.source_url ?? null,
            signal_date: signal.signal_date ?? null,
            confidence: signal.confidence ?? null,
          })

        if (insertError) {
          if (insertError.code === '23505') continue
          if (insertError.code === '42P01') {
            logger.warn('person-signal-job: person_signals table missing; skipping writes until migration applied')
            return
          }
          logger.warn('person-signal-job: failed to insert person signal', {
            contactId: contact.id,
            personId,
            signalId: signal.id,
            error: insertError.message,
          })
          continue
        }

        personSignalsInserted += 1
      }

      await supabase
        .from('person_sources')
        .insert({
          person_id: personId,
          source_type: 'public_web',
          source_name: 'company_signals',
          source_url: null,
          confidence: contact.enrichment_confidence ?? null,
        })
    }

    lastUserId = users[users.length - 1]?.id ?? null
    if (users.length < USER_PAGE_SIZE) break
  }

  logger.info('person-signal-job: completed', {
    usersProcessed,
    contactsProcessed,
    personSignalsInserted,
    sourceDecision: decision,
  })
}
