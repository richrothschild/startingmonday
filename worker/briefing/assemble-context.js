import { logger } from '../lib/logger.js'

function classifyBriefingStalls(input) {
  const stalls = []

  if (input.signalsSinceBaseline === 0) {
    if (input.lastSignalDays >= 14) {
      stalls.push({ lane: 'signals', state: 'stalled', reason: `No fresh signals for ${input.lastSignalDays} days.` })
    } else if (input.lastSignalDays >= 7) {
      stalls.push({ lane: 'signals', state: 'watch', reason: `Signal intake is aging at ${input.lastSignalDays} days.` })
    }
  }

  if (input.briefReviewsSinceBaseline === 0) {
    if (input.lastBriefDays >= 14) {
      stalls.push({ lane: 'preparation', state: 'stalled', reason: `No brief review progress for ${input.lastBriefDays} days.` })
    } else if (input.lastBriefDays >= 7) {
      stalls.push({ lane: 'preparation', state: 'watch', reason: `Prep activity is aging at ${input.lastBriefDays} days.` })
    }
  }

  if (input.activePipelineCount > 0 && input.pipelineChangesSinceBaseline === 0) {
    if (input.overdueActions >= 3) {
      stalls.push({ lane: 'pipeline', state: 'stalled', reason: `${input.overdueActions} overdue actions with no pipeline movement in the last 7 days.` })
    } else if (input.overdueActions >= 1) {
      stalls.push({ lane: 'pipeline', state: 'watch', reason: `Pipeline has ${input.overdueActions} overdue action${input.overdueActions === 1 ? '' : 's'} and no recent movement.` })
    }
  }

  return stalls
}

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

  const [profileResult, companiesResult, recentScansResult, followUpsResult, signalsResult, patternAlertsResult, outreachResult, signalHealthResult, briefsResult, pipelineEventsResult, touchpointsTodayResult, notesTodayResult, recommendationAddsResult, interviewProgressTodayResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, target_titles, role_type, search_persona')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('companies')
      .select('id, name, last_checked_at, stage')
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
    supabase
      .from('company_signals')
      .select('signal_date')
      .eq('user_id', userId)
      .gte('signal_date', since14d.toISOString().split('T')[0])
      .order('signal_date', { ascending: false })
      .limit(20),
    supabase
      .from('briefs')
      .select('created_at, reviewed_at, used_at, lifecycle_state')
      .eq('user_id', userId)
      .in('type', ['prep', 'prep_section'])
      .gte('created_at', since14d.toISOString())
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('user_events')
      .select('event_name, created_at')
      .eq('user_id', userId)
      .gte('created_at', since7d.toISOString())
      .in('event_name', ['company_added', 'pipeline_stage_changed']),
    supabase
      .from('relationship_touchpoints')
      .select('id, touch_type, created_at, contact_id')
      .eq('user_id', userId)
      .gte('created_at', since24h.toISOString())
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('contact_notes')
      .select('id, note_type, created_at, contact_id')
      .eq('user_id', userId)
      .gte('created_at', since24h.toISOString())
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('user_events')
      .select('id, created_at, properties')
      .eq('user_id', userId)
      .eq('event_name', 'discover_recommendation_added')
      .gte('created_at', since24h.toISOString())
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('company_interview_logs')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', since24h.toISOString())
      .order('created_at', { ascending: false })
      .limit(8),
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
  const signalHealthRows = signalHealthResult.data ?? []
  const briefs = briefsResult.data ?? []
  const pipelineEvents = pipelineEventsResult.data ?? []
  const touchpointsToday = touchpointsTodayResult.data ?? []
  const notesToday = notesTodayResult.data ?? []
  const recommendationAdds = recommendationAddsResult.data ?? []
  const interviewProgressToday = interviewProgressTodayResult.data ?? []

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
  const contactIds = [
    ...rawFollowUps.filter(f => f.contact_id).map(f => f.contact_id),
    ...touchpointsToday.filter(t => t.contact_id).map(t => t.contact_id),
    ...notesToday.filter(n => n.contact_id).map(n => n.contact_id),
  ]
  const uniqueContactIds = [...new Set(contactIds)]
  let contactById = {}
  if (uniqueContactIds.length) {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, title')
      .in('id', uniqueContactIds)
    if (contacts) contactById = Object.fromEntries(contacts.map(c => [c.id, c]))
  }

  const relationshipActionsToday = [
    ...touchpointsToday.map((row) => {
      const contact = row.contact_id ? contactById[row.contact_id] : null
      return {
        kind: 'touchpoint',
        actor: contact?.name ?? 'Contact',
        detail: row.touch_type ? String(row.touch_type).replace(/_/g, ' ') : 'relationship touchpoint logged',
        createdAt: row.created_at,
      }
    }),
    ...notesToday.map((row) => {
      const contact = row.contact_id ? contactById[row.contact_id] : null
      return {
        kind: 'note',
        actor: contact?.name ?? 'Contact',
        detail: row.note_type ? `note added (${String(row.note_type).replace(/_/g, ' ')})` : 'relationship note added',
        createdAt: row.created_at,
      }
    }),
    ...recommendationAdds.map((row) => {
      const props = row.properties && typeof row.properties === 'object' ? row.properties : {}
      const contactName = typeof props.contact_name === 'string' ? props.contact_name : null
      return {
        kind: 'recommendation_saved',
        actor: contactName ?? 'Saved recommendation',
        detail: 'recommendation converted to relationship contact',
        createdAt: row.created_at,
      }
    }),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  const chainSnapshotToday = {
    recommendationAccepted: recommendationAdds.length,
    relationshipActions: relationshipActionsToday.length,
    interviewProgressions: interviewProgressToday.length,
    path: 'recommendation -> relationship action -> interview progression',
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

  const companyIds = companies.map((company) => company.id)
  let likelyStakeholders = []
  if (companyIds.length) {
    const { data: candidateRows } = await supabase
      .from('company_people_candidates')
      .select('company_id, person_id, role_cluster, score, status')
      .eq('user_id', userId)
      .in('status', ['suggested', 'saved'])
      .in('company_id', companyIds)
      .order('score', { ascending: false })
      .limit(20)

    const personIds = [...new Set((candidateRows ?? []).map((row) => row.person_id).filter(Boolean))]
    let peopleById = {}
    if (personIds.length) {
      const { data: peopleRows } = await supabase
        .from('people')
        .select('id, full_name, current_title, current_company')
        .in('id', personIds)
      peopleById = Object.fromEntries((peopleRows ?? []).map((row) => [row.id, row]))
    }

    likelyStakeholders = (candidateRows ?? [])
      .map((row) => {
        const person = peopleById[row.person_id]
        return {
          name: person?.full_name ?? 'Stakeholder',
          title: person?.current_title ?? null,
          companyName: companyById[row.company_id]?.name ?? person?.current_company ?? null,
          roleCluster: row.role_cluster ?? 'other',
          score: typeof row.score === 'number' ? Number(row.score.toFixed(2)) : null,
        }
      })
      .filter((row) => Boolean(row.name))
      .slice(0, 5)
  }

  const activePipelineCount = companies.filter(c => ['applied', 'interviewing', 'offer'].includes(c.stage)).length
  const lastSignalDays = signalHealthRows.length > 0
    ? Math.ceil((Date.now() - new Date(signalHealthRows[0].signal_date).getTime()) / (1000 * 60 * 60 * 24))
    : 999
  const latestBriefProgressAt = briefs.reduce((latest, brief) => {
    const candidate = brief.used_at ?? brief.reviewed_at ?? brief.created_at
    if (!latest) return candidate
    return new Date(candidate).getTime() > new Date(latest).getTime() ? candidate : latest
  }, null)
  const lastBriefDays = latestBriefProgressAt
    ? Math.ceil((Date.now() - new Date(latestBriefProgressAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999
  const briefReviewsSinceBaseline = briefs.filter(brief => brief.reviewed_at && new Date(brief.reviewed_at).getTime() >= since7d.getTime()).length
  const stalledLanes = classifyBriefingStalls({
    activePipelineCount,
    overdueActions: followUps.length,
    lastSignalDays,
    lastBriefDays,
    signalsSinceBaseline: signalHealthRows.filter(signal => new Date(signal.signal_date).getTime() >= since7d.getTime()).length,
    pipelineChangesSinceBaseline: pipelineEvents.length,
    briefReviewsSinceBaseline,
  })

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
    relationshipActionsToday,
    chainSnapshotToday,
    likelyStakeholders,
    isPlaced,
    industryPulse,
    stalledLanes,
  }
}
