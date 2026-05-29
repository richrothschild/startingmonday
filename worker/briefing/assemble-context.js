import { logger } from '../lib/logger.js'

// Gathers all data needed for one user's daily briefing.
// Returns null if there is nothing actionable to send.
export async function assembleContext(supabase, userId, userEmail, tz = 'UTC', searchStatus = 'active') {
  const now = new Date()
  const since24h = new Date(now.getTime() -  24 * 60 * 60 * 1000)
  const since7d  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000)
  const since14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now)

  const since7dISO = since7d.toISOString()
  const isPlaced = searchStatus === 'complete'

  const [profileResult, companiesResult, recentScansResult, followUpsResult, signalsResult, patternAlertsResult, outreachResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, target_titles, role_type, search_persona')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('companies')
      .select('id, name, last_checked_at')
      .eq('user_id', userId)
      .is('archived_at', null),
    supabase
      .from('scan_results')
      .select('company_id, scanned_at, ai_score, ai_summary, raw_hits')
      .eq('user_id', userId)
      .eq('status', 'success')
      .gte('scanned_at', since24h.toISOString())
      .gt('ai_score', 0)
      .order('ai_score', { ascending: false }),
    supabase
      .from('follow_ups')
      .select('id, due_date, action, contact_id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .lte('due_date', todayStr)
      .order('due_date', { ascending: true }),
    supabase
      .from('company_signals')
      .select('id, company_id, signal_type, signal_summary, outreach_angle, signal_date, notified_at')
      .eq('user_id', userId)
      .neq('signal_type', 'pattern_alert')
      .gte('signal_date', since7d.toISOString().split('T')[0])
      .order('signal_date', { ascending: false })
      .limit(5),
    supabase
      .from('company_signals')
      .select('id, company_id, signal_type, signal_summary, outreach_angle, signal_date, notified_at')
      .eq('user_id', userId)
      .eq('signal_type', 'pattern_alert')
      .gte('signal_date', since14d.toISOString().split('T')[0])
      .order('signal_date', { ascending: false })
      .limit(3),
    supabase
      .from('outreach_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('sent_at', since7dISO),
  ])

  if (profileResult.error) {
    logger.warn('assemble-context: profile error', { userId, error: profileResult.error.message })
  }

  const profile = profileResult.data ?? {}
  const companies = companiesResult.data ?? []
  const recentScans = recentScansResult.data ?? []
  const rawFollowUps = followUpsResult.data ?? []
  const rawSignals       = signalsResult.data ?? []
  const rawPatternAlerts = patternAlertsResult.data ?? []
  const outreachThisWeek = outreachResult.count ?? 0

  const companyById = Object.fromEntries(companies.map(c => [c.id, c]))

  const newMatches = recentScans
    .map(scan => ({
      companyName: companyById[scan.company_id]?.name ?? 'Unknown Company',
      aiScore: scan.ai_score,
      aiSummary: scan.ai_summary,
      matchingRoles: (scan.raw_hits ?? [])
        .filter(h => h.is_match)
        .map(h => ({ title: h.title, score: h.score, isNew: h.is_new, summary: h.summary })),
    }))
    .filter(m => m.matchingRoles.length > 0)

  // Fetch contact names for any follow-ups that have a contact_id
  const contactIds = rawFollowUps.filter(f => f.contact_id).map(f => f.contact_id)
  let contactById = {}
  if (contactIds.length) {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, title')
      .in('id', contactIds)
    if (contacts) contactById = Object.fromEntries(contacts.map(c => [c.id, c]))
  }

  // Relationship cadence nudges: contacts that haven't been touched in threshold days
  const { data: allActiveContacts } = await supabase
    .from('contacts')
    .select('id, name, title, firm, contact_type, channel, outreach_status, contacted_at, last_role_discussed, company_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .neq('outreach_status', 'closed')

  const relationshipNudges = []
  for (const c of (allActiveContacts ?? [])) {
    const isRecruiter = c.contact_type === 'recruiter' || c.channel === 'recruiter'
    const daysSince = c.contacted_at
      ? Math.floor((now.getTime() - new Date(c.contacted_at).getTime()) / 86400_000)
      : null

    let threshold = null
    if (isRecruiter) threshold = 90
    else if (c.outreach_status === 'in_conversation' || c.outreach_status === 'meeting_scheduled') threshold = 14
    else if (c.outreach_status === 'reached_out') threshold = 30

    if (threshold && (daysSince === null || daysSince >= threshold)) {
      relationshipNudges.push({
        id: c.id,
        name: c.name,
        title: c.title ?? null,
        firm: c.firm ?? null,
        isRecruiter,
        lastRole: c.last_role_discussed ?? null,
        outreachStatus: c.outreach_status,
        daysSince,
        threshold,
      })
    }
  }
  // Cap at 5 most urgent (longest dormant relative to threshold)
  relationshipNudges.sort((a, b) => {
    const aScore = a.daysSince === null ? 9999 : a.daysSince - a.threshold
    const bScore = b.daysSince === null ? 9999 : b.daysSince - b.threshold
    return bScore - aScore
  })
  const topNudges = relationshipNudges.slice(0, 5)

  // Network health: companies with at least one active contact
  const companiesWithContacts = new Set(
    (allActiveContacts ?? []).filter(c => c.company_id).map(c => c.company_id)
  )
  const networkHealth = {
    totalCompanies: companies.length,
    companiesWithContacts: companiesWithContacts.size,
    coveragePct: companies.length > 0 ? Math.round(companiesWithContacts.size / companies.length * 100) : 0,
  }

  const followUps = rawFollowUps.map(f => ({
    id: f.id,
    dueDate: f.due_date,
    action: f.action,
    contact: f.contact_id ? (contactById[f.contact_id] ?? null) : null,
  }))

  const signals = rawSignals.map(s => ({
    id:           s.id,
    companyName:  companyById[s.company_id]?.name ?? 'Unknown Company',
    signalType:   s.signal_type,
    summary:      s.signal_summary,
    outreachAngle: s.outreach_angle,
    signalDate:   s.signal_date,
    notifiedAt:   s.notified_at ?? null,
  }))

  const patternAlerts = rawPatternAlerts.map(s => {
    const colonIdx  = s.signal_summary.indexOf(': ')
    const patternName = colonIdx > -1 ? s.signal_summary.slice(0, colonIdx) : 'Pattern Alert'
    const patternBody = colonIdx > -1 ? s.signal_summary.slice(colonIdx + 2) : s.signal_summary
    return {
      id:           s.id,
      companyName:  companyById[s.company_id]?.name ?? 'Unknown Company',
      patternName,
      patternBody,
      outreachAngle: s.outreach_angle,
      signalDate:   s.signal_date,
      notifiedAt:   s.notified_at ?? null,
    }
  })

  // Pull latest industry pulse (< 8 days old)
  const since8d = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
  const { data: pulseRow } = await supabase
    .from('industry_pulse')
    .select('bullets, generated_at')
    .eq('user_id', userId)
    .gte('generated_at', since8d.toISOString())
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const industryPulse = Array.isArray(pulseRow?.bullets) && pulseRow.bullets.length > 0
    ? pulseRow.bullets
    : null

  // Only skip if the user has no companies at all (nothing to brief on).
  // Always send on configured days so the user gets a pipeline-state email.
  if (!companies.length) return null

  return {
    userEmail,
    userName: profile.full_name ?? userEmail,
    targetTitles: profile.target_titles ?? [],
    roleType: profile.role_type ?? null,
    searchPersona: profile.search_persona ?? null,
    totalCompanies: companies.length,
    newMatches,
    followUps,
    signals,
    patternAlerts,
    outreachThisWeek,
    todayStr,
    relationshipNudges: topNudges,
    networkHealth,
    isPlaced,
    industryPulse,
  }
}
