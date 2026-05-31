import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember, getAllStaff } from '@/lib/staff'
import { getStripe } from '@/lib/stripe'
import { getRolePathPriorityDebugRows } from '@/lib/role-path-priority'
import { FunnelChart, EventVolumeChart } from './admin-charts'
import { INTERNAL_APIS, PAGE_GROUPS, STEP_LABELS } from './admin-page-config'

type EmailCouncilLogEntry = {
  ts: string
  to?: string
  channel?: string
  subject?: string
  blocked?: boolean
  blockers?: string[]
  warnings?: string[]
  scores?: {
    ejes?: number
    open?: number
    understand?: number
    reply?: number
    productLift?: number
  }
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const rolePathPriorityDebugPromise = getRolePathPriorityDebugRows()

  const adminClient = createAdminClient()
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const since7d  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString()
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: activeUsers },
    { data: profiles },
    { data: events7d },
    { data: events30d },
    { count: totalUsers },
    { count: paidUsers },
    { count: trialingUsers },
    teamMembers,
    { data: partnerRows },
    { data: users24h },
    { data: companies24h },
    { data: contacts24h },
    { data: followUps24h },
    { data: briefingViews24h },
    { count: openAutomationAlerts },
  ] = await Promise.all([
    adminClient.from('users').select('id').in('subscription_status', ['trialing', 'active']),
    adminClient.from('user_profiles').select('user_id, positioning_summary, briefing_time, last_briefing_sent_at, placed_at, placement_company, full_name'),
    adminClient.from('user_events').select('event_name, created_at').gte('created_at', since7d).limit(5000),
    adminClient.from('user_events').select('event_name').gte('created_at', since30d).limit(5000),
    adminClient.from('users').select('id', { count: 'exact', head: true }),
    adminClient.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    adminClient.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'trialing'),
    getAllStaff(),
    adminClient.from('partners').select('id, name, email, referral_code, commission_pct, is_active, created_at').order('created_at', { ascending: false }),
    adminClient.from('users').select('id').gte('created_at', since24h).limit(5000),
    adminClient.from('companies').select('user_id').gte('created_at', since24h).is('archived_at', null).limit(5000),
    adminClient.from('contacts').select('user_id').gte('created_at', since24h).limit(5000),
    adminClient.from('follow_ups').select('user_id').gte('created_at', since24h).limit(5000),
    adminClient.from('user_events').select('user_id').eq('event_name', 'briefing_viewed').gte('created_at', since24h).limit(5000),
    adminClient.from('automation_alerts').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ])

  const usersWithCompany24h = new Set((companies24h ?? []).map(r => r.user_id)).size
  const usersWithContact24h = new Set((contacts24h ?? []).map(r => r.user_id)).size
  const usersWithFollowUp24h = new Set((followUps24h ?? []).map(r => r.user_id)).size
  const usersWithBriefingView24h = new Set((briefingViews24h ?? []).map(r => r.user_id)).size

  const activeUserIds = new Set((activeUsers ?? []).map(u => u.id))
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

  let a1 = 0, a5 = 0
  for (const uid of activeUserIds) {
    const p = profileMap[uid]
    if (!p) continue
    if ((p.positioning_summary?.length ?? 0) >= 100) a1++
    if (p.briefing_time) a5++
  }

  // Briefing health
  const briefingConfiguredProfiles = (profiles ?? []).filter(p => activeUserIds.has(p.user_id) && p.briefing_time)
  const lastBriefingSentAt = briefingConfiguredProfiles
    .map(p => p.last_briefing_sent_at)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null
  const briefingHoursAgo = lastBriefingSentAt
    ? Math.round((Date.now() - new Date(lastBriefingSentAt).getTime()) / 3_600_000)
    : null
  const briefingStale = briefingConfiguredProfiles.length > 0 && (briefingHoursAgo === null || briefingHoursAgo >= 36)

  const adminAny = adminClient as any
  const [{ data: latestExecutiveResearchRun }, { count: executiveResearchSourceCount }, { count: executiveResearchFailureCount }] = await Promise.all([
    adminAny
      .from('executive_research_refresh_runs')
      .select('run_started_at, run_finished_at, checked_count, changed_count, failed_count')
      .order('run_started_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    adminAny.from('executive_research_library').select('id', { count: 'exact', head: true }),
    adminAny.from('executive_research_library').select('id', { count: 'exact', head: true }).not('fetch_error', 'is', null),
  ])

  const executiveResearchHoursAgo = latestExecutiveResearchRun?.run_started_at
    ? Math.round((Date.now() - new Date(latestExecutiveResearchRun.run_started_at).getTime()) / 3_600_000)
    : null
  const executiveResearchStatus: 'healthy' | 'degraded' | 'stale' | 'missing' = !latestExecutiveResearchRun
    ? 'missing'
    : (latestExecutiveResearchRun.failed_count ?? 0) > 0
      ? 'degraded'
      : executiveResearchHoursAgo !== null && executiveResearchHoursAgo > 8 * 24
        ? 'stale'
        : 'healthy'

  // Placements
  const placements = (profiles ?? [])
    .filter(p => p.placed_at != null)
    .sort((a, b) => new Date(b.placed_at!).getTime() - new Date(a.placed_at!).getTime())

  const userIdList = [...activeUserIds]
  const [
    { count: a2Count }, { count: a3Count }, { count: a4Count }, { count: a6Count },
    { data: endedTrials },
    { data: allSignals },
    { data: signalActions },
    { data: qualityLogs },
    { data: activeTrials },
  ] = await Promise.all([
    adminClient.from('companies').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList).is('archived_at', null),
    adminClient.from('briefs').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList).eq('type', 'prep'),
    adminClient.from('contacts').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList),
    adminClient.from('follow_ups').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList),
    adminClient.from('users').select('subscription_status, plan_at_trial_end, signup_source').not('trial_ends_at', 'is', null).lt('trial_ends_at', new Date().toISOString()),
    adminClient.from('company_signals').select('id, signal_type').limit(2000),
    adminClient.from('signal_action_events').select('signal_id, action_type').limit(2000),
    adminClient.from('brief_quality_log').select('context_score, has_resume, has_scan_result, has_contacts, word_count').gte('created_at', since30d).limit(500),
    adminClient.from('users').select('id, email, created_at, trial_ends_at, signup_source').eq('subscription_status', 'trialing').gt('trial_ends_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(50),
  ])

  const denominator = activeUserIds.size || 1
  const funnelData = [
    { step: 'a1_resume',    label: 'Resume',    count: a1 },
    { step: 'a2_company',   label: 'Company',   count: a2Count ?? 0 },
    { step: 'a3_prep',      label: 'Brief',     count: a3Count ?? 0 },
    { step: 'a4_contact',   label: 'Contact',   count: a4Count ?? 0 },
    { step: 'a5_briefing',  label: 'Briefing',  count: a5 },
    { step: 'a6_follow_up', label: 'Follow-up', count: a6Count ?? 0 },
  ]

  const eventCounts7d  = (events7d  ?? []).reduce<Record<string, number>>((acc, e) => { acc[e.event_name] = (acc[e.event_name] ?? 0) + 1; return acc }, {})
  const eventCounts30d = (events30d ?? []).reduce<Record<string, number>>((acc, e) => { acc[e.event_name] = (acc[e.event_name] ?? 0) + 1; return acc }, {})
  const eventVolumeData = Object.entries(eventCounts30d).sort((a, b) => b[1] - a[1]).map(([event_name, count]) => ({ event_name, count }))
  const rolePathPriorityDebug = await rolePathPriorityDebugPromise
  const searchPaused7d = eventCounts7d.search_paused ?? 0
  const searchResumed7d = eventCounts7d.search_resumed ?? 0
  const netPaused7d = searchPaused7d - searchResumed7d
  const pauseResumeRatio7d = searchResumed7d > 0 ? (searchPaused7d / searchResumed7d).toFixed(2) : null
  const trendByDay: Record<string, { paused: number; resumed: number }> = {}
  for (const event of events7d ?? []) {
    const dayKey = event.created_at?.slice(0, 10)
    if (!dayKey) continue
    if (!trendByDay[dayKey]) trendByDay[dayKey] = { paused: 0, resumed: 0 }
    if (event.event_name === 'search_paused') trendByDay[dayKey].paused += 1
    if (event.event_name === 'search_resumed') trendByDay[dayKey].resumed += 1
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const pauseResumeTrend7d = Array.from({ length: 7 }, (_, idx) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - idx))
    const dayKey = date.toISOString().slice(0, 10)
    const stats = trendByDay[dayKey] ?? { paused: 0, resumed: 0 }
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
    return { dayKey, label, paused: stats.paused, resumed: stats.resumed, net: stats.paused - stats.resumed }
  })
  const trendPeak = pauseResumeTrend7d.reduce((peak, row) => Math.max(peak, row.paused, row.resumed), 1)
  const recent3d = pauseResumeTrend7d.slice(-3)
  const netPausedLast3d = recent3d.reduce((sum, row) => sum + row.net, 0)
  const positiveNetDaysLast3d = recent3d.filter((row) => row.net > 0).length
  const telemetryAlertLevel: 'normal' | 'watch' | 'risk' =
    netPausedLast3d >= 6 || positiveNetDaysLast3d === 3
      ? 'risk'
      : netPausedLast3d >= 3 || positiveNetDaysLast3d >= 2
        ? 'watch'
        : 'normal'

  // Go/no-go scorecard metrics (best-effort with explicit tracking gaps)
  const since14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const since60d = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  const [
    { data: users7d },
    { data: users60d },
    { data: companies7d },
    { data: contacts7d },
    { data: followUps7d },
    { data: briefingViews7d },
    { data: briefingViews14d },
    { data: actionEvents14d },
  ] = await Promise.all([
    adminClient.from('users').select('id, created_at').gte('created_at', since7d).limit(5000),
    adminClient.from('users').select('id, created_at, subscription_tier, subscription_status').gte('created_at', since60d).limit(5000),
    adminClient.from('companies').select('user_id').gte('created_at', since7d).is('archived_at', null).limit(5000),
    adminClient.from('contacts').select('user_id').gte('created_at', since7d).limit(5000),
    adminClient.from('follow_ups').select('user_id').gte('created_at', since7d).limit(5000),
    adminClient.from('user_events').select('user_id').eq('event_name', 'briefing_viewed').gte('created_at', since7d).limit(5000),
    adminClient.from('user_events').select('user_id').eq('event_name', 'briefing_viewed').gte('created_at', since14d).limit(5000),
    adminClient.from('user_events').select('user_id, event_name').in('event_name', ['follow_up_set', 'contact_added', 'company_added', 'outreach_draft_generated', 'briefing_action_clicked']).gte('created_at', since14d).limit(5000),
  ])

  const cohort7 = users7d ?? []
  const cohort7UserIds = new Set(cohort7.map(u => u.id))
  const usersWithCompany7d = new Set((companies7d ?? []).map(r => r.user_id))
  const usersWithContact7d = new Set((contacts7d ?? []).map(r => r.user_id))
  const usersWithFollowUp7d = new Set((followUps7d ?? []).map(r => r.user_id))
  const usersWithBriefing7d = new Set((briefingViews7d ?? []).map(r => r.user_id))

  let activated7dCount = 0
  for (const uid of cohort7UserIds) {
    if (usersWithCompany7d.has(uid) && usersWithContact7d.has(uid) && usersWithFollowUp7d.has(uid) && usersWithBriefing7d.has(uid)) {
      activated7dCount++
    }
  }
  const activationRate7d = cohort7.length > 0 ? Math.round((activated7dCount / cohort7.length) * 100) : null

  const briefingViewers14d = new Set((briefingViews14d ?? []).map(r => r.user_id))
  const actionUsers14d = new Set((actionEvents14d ?? []).map(r => r.user_id))
  const convertedUsers14d = [...briefingViewers14d].filter(uid => actionUsers14d.has(uid)).length
  const briefingToActionRate14d = briefingViewers14d.size > 0 ? Math.round((convertedUsers14d / briefingViewers14d.size) * 100) : null

  const monitorCohort = (users60d ?? []).filter(u => {
    const created = new Date(u.created_at).getTime()
    const min = Date.now() - 60 * 24 * 60 * 60 * 1000
    const max = Date.now() - 30 * 24 * 60 * 60 * 1000
    return created >= min && created <= max && u.subscription_tier === 'passive'
  })
  const monitorRetained = monitorCohort.filter(u => u.subscription_status === 'active').length
  const monitorRetention30d = monitorCohort.length > 0 ? Math.round((monitorRetained / monitorCohort.length) * 100) : null

  type ScoreStatus = 'green' | 'yellow' | 'red' | 'gray'
  function statusClass(status: ScoreStatus): string {
    if (status === 'green') return 'text-green-700 bg-green-50 border-green-200'
    if (status === 'yellow') return 'text-amber-700 bg-amber-50 border-amber-200'
    if (status === 'red') return 'text-red-700 bg-red-50 border-red-200'
    return 'text-slate-500 bg-slate-50 border-slate-200'
  }

  const scoreRows: { label: string; threshold: string; value: string; status: ScoreStatus; note?: string }[] = [
    {
      label: 'Activation completion (7d)',
      threshold: '>= 45%',
      value: activationRate7d === null ? 'N/A' : `${activationRate7d}%`,
      status: activationRate7d === null ? 'gray' : activationRate7d >= 45 ? 'green' : activationRate7d >= 35 ? 'yellow' : 'red',
      note: cohort7.length > 0 ? `Cohort n=${cohort7.length}` : 'Need more 7-day signups',
    },
    {
      label: 'Briefing to action (14d)',
      threshold: '>= 35%',
      value: briefingToActionRate14d === null ? 'N/A' : `${briefingToActionRate14d}%`,
      status: briefingToActionRate14d === null ? 'gray' : briefingToActionRate14d >= 35 ? 'green' : briefingToActionRate14d >= 25 ? 'yellow' : 'red',
      note: briefingViewers14d.size > 0 ? `Viewers n=${briefingViewers14d.size}` : 'No briefing viewers in window',
    },
    {
      label: 'Intelligence retention (30d)',
      threshold: '>= 70%',
      value: monitorRetention30d === null ? 'N/A' : `${monitorRetention30d}%`,
      status: monitorRetention30d === null ? 'gray' : monitorRetention30d >= 70 ? 'green' : monitorRetention30d >= 60 ? 'yellow' : 'red',
      note: monitorCohort.length > 0 ? `Cohort n=${monitorCohort.length}` : 'No matured Intelligence cohort yet',
    },
    {
      label: 'Upgrade pull (30d)',
      threshold: '>= 12%',
      value: 'Tracking gap',
      status: 'gray',
      note: 'Need tier-change event history for monitor_to_paid_upgrade.',
    },
    {
      label: 'Reliability floor',
      threshold: 'briefing fresh + no stale worker',
      value: briefingConfiguredProfiles.length === 0 ? 'N/A' : briefingStale ? 'Stale' : 'Healthy',
      status: briefingConfiguredProfiles.length === 0 ? 'gray' : briefingStale ? 'red' : 'green',
      note: briefingConfiguredProfiles.length === 0 ? 'No briefing configs yet' : `Last briefing ${briefingHoursAgo ?? '-'}h ago`,
    },
  ]

  const hardRedCount = scoreRows.filter(r => r.status === 'red').length
  const measurableCount = scoreRows.filter(r => r.status !== 'gray').length
  const measurableGreen = scoreRows.filter(r => r.status === 'green').length
  const decision: { label: 'GO' | 'CONDITIONAL GO' | 'NO-GO'; status: ScoreStatus; reason: string } =
    hardRedCount > 0
      ? { label: 'NO-GO', status: 'red', reason: 'One or more hard thresholds are below floor.' }
      : measurableCount > 0 && measurableGreen === measurableCount
        ? { label: 'GO', status: 'green', reason: 'All measurable thresholds are on target.' }
        : { label: 'CONDITIONAL GO', status: 'yellow', reason: 'No hard failures, but missing data or near-threshold metrics remain.' }

  // Active trial users: enrich with company status
  const trialUsers = activeTrials ?? []
  const trialUserIds = trialUsers.map(u => u.id)
  let trialCompanySet = new Set<string>()
  if (trialUserIds.length > 0) {
    const { data: trialCompanyRows } = await adminClient.from('companies').select('user_id').in('user_id', trialUserIds).is('archived_at', null)
    trialCompanySet = new Set((trialCompanyRows ?? []).map(r => r.user_id))
  }

  // Partners: attribution counts
  const partners = (partnerRows ?? []) as { id: string; name: string; email: string; referral_code: string; commission_pct: number; is_active: boolean; created_at: string }[]
  const partnerIds = partners.map(p => p.id)
  let attributionsByPartner: Record<string, { total: number; active: number; mrr: number }> = {}
  if (partnerIds.length > 0) {
    const { data: attrRows } = await adminClient
      .from('referral_attributions')
      .select('partner_id, signup_user_id')
      .in('partner_id', partnerIds)
    const attrUserIds = (attrRows ?? []).map(a => a.signup_user_id)
    let userStatusMap: Record<string, { status: string; tier: string }> = {}
    if (attrUserIds.length > 0) {
      const { data: attrUsers } = await adminClient
        .from('users')
        .select('id, subscription_status, subscription_tier')
        .in('id', attrUserIds)
      userStatusMap = Object.fromEntries((attrUsers ?? []).map(u => [u.id, { status: u.subscription_status, tier: u.subscription_tier ?? '' }]))
    }
    const TIER_MRR: Record<string, number> = { passive: 49, active: 129, executive: 249 }
    for (const attr of (attrRows ?? [])) {
      if (!attributionsByPartner[attr.partner_id]) attributionsByPartner[attr.partner_id] = { total: 0, active: 0, mrr: 0 }
      attributionsByPartner[attr.partner_id].total++
      const u = userStatusMap[attr.signup_user_id]
      if (u?.status === 'active') {
        attributionsByPartner[attr.partner_id].active++
        attributionsByPartner[attr.partner_id].mrr += TIER_MRR[u.tier] ?? 0
      }
    }
  }

  // B2B accounts: seat owners and their member counts
  const { data: allSeatsRows } = await adminClient
    .from('team_seats')
    .select('owner_id, status')
  const seatsByOwner: Record<string, { total: number; accepted: number }> = {}
  for (const s of (allSeatsRows ?? [])) {
    if (!seatsByOwner[s.owner_id]) seatsByOwner[s.owner_id] = { total: 0, accepted: 0 }
    seatsByOwner[s.owner_id].total++
    if (s.status === 'accepted') seatsByOwner[s.owner_id].accepted++
  }
  const seatOwnerIds = Object.keys(seatsByOwner)
  let b2bAccounts: { id: string; email: string; tier: string; total: number; accepted: number }[] = []
  if (seatOwnerIds.length > 0) {
    const { data: ownerData } = await adminClient
      .from('users')
      .select('id, email, subscription_tier')
      .in('id', seatOwnerIds)
    b2bAccounts = (ownerData ?? []).map((u: { id: string; email: string | null; subscription_tier: string | null }) => ({
      id: u.id,
      email: u.email ?? '',
      tier: u.subscription_tier ?? 'free',
      total: seatsByOwner[u.id]?.total ?? 0,
      accepted: seatsByOwner[u.id]?.accepted ?? 0,
    })).sort((a, b) => b.total - a.total)
  }

  // Trial conversion
  const trialsEnded = endedTrials ?? []
  const totalEnded = trialsEnded.length
  const totalConverted = trialsEnded.filter(u => u.subscription_status === 'active').length
  const conversionRate = totalEnded > 0 ? Math.round((totalConverted / totalEnded) * 100) : null
  const linkedInAdsThreshold = 35
  const linkedInAdsGatePass = conversionRate !== null && conversionRate >= linkedInAdsThreshold
  const linkedInAdsDecision = linkedInAdsGatePass ? 'GO' : 'DEFER'

  // Conversion by signup_source channel
  const channelMap: Record<string, { ended: number; converted: number }> = {}
  for (const u of trialsEnded) {
    const ch = u.signup_source ?? 'direct'
    if (!channelMap[ch]) channelMap[ch] = { ended: 0, converted: 0 }
    channelMap[ch].ended++
    if (u.subscription_status === 'active') channelMap[ch].converted++
  }
  const channelRows = Object.entries(channelMap)
    .sort((a, b) => b[1].ended - a[1].ended)
    .map(([ch, { ended, converted }]) => ({
      channel: ch,
      ended,
      converted,
      rate: ended > 0 ? Math.round((converted / ended) * 100) : 0,
    }))

  // Signal to action rate by signal type
  const actedSignalIds = new Set((signalActions ?? []).map(a => a.signal_id).filter((id): id is string => id !== null))
  const signalTypeCounts: Record<string, { total: number; acted: number }> = {}
  for (const s of (allSignals ?? []) as { id: string; signal_type: string }[]) {
    if (!signalTypeCounts[s.signal_type]) signalTypeCounts[s.signal_type] = { total: 0, acted: 0 }
    signalTypeCounts[s.signal_type].total++
    if (actedSignalIds.has(s.id)) signalTypeCounts[s.signal_type].acted++
  }
  const signalRows = Object.entries(signalTypeCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([type, counts]) => ({
      type,
      label: type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      total: counts.total,
      acted: counts.acted,
      rate: counts.total > 0 ? Math.round((counts.acted / counts.total) * 100) : 0,
    }))

  // Brief quality
  const logs = qualityLogs ?? []
  const avgContextScore = logs.length > 0
    ? Math.round(logs.reduce((sum: number, l: { context_score: number | null }) => sum + (l.context_score ?? 0), 0) / logs.length)
    : null
  const pctResume   = logs.length > 0 ? Math.round(logs.filter((l: { has_resume: boolean }) => l.has_resume).length / logs.length * 100) : null
  const pctScan     = logs.length > 0 ? Math.round(logs.filter((l: { has_scan_result: boolean }) => l.has_scan_result).length / logs.length * 100) : null
  const pctContacts = logs.length > 0 ? Math.round(logs.filter((l: { has_contacts: boolean }) => l.has_contacts).length / logs.length * 100) : null
  const wordCountLogs = logs.filter((l: { word_count: number | null }) => l.word_count)
  const avgWords = wordCountLogs.length > 0
    ? Math.round(wordCountLogs.reduce((sum: number, l: { word_count: number | null }) => sum + (l.word_count ?? 0), 0) / wordCountLogs.length)
    : null

  const roleBadge = (role: string) =>
    role === 'owner' ? 'bg-amber-50 text-amber-700' :
    role === 'admin' ? 'bg-blue-50 text-blue-700' :
    'bg-slate-100 text-slate-500'

  // Email council quality telemetry from local score log
  const emailCouncilLogPath = path.join(process.cwd(), '.logs', 'email-council-scores.jsonl')
  let emailCouncilEntries: EmailCouncilLogEntry[] = []
  try {
    const raw = await readFile(emailCouncilLogPath, 'utf8')
    emailCouncilEntries = raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as EmailCouncilLogEntry
        } catch {
          return null
        }
      })
      .filter((entry): entry is EmailCouncilLogEntry => entry !== null)
  } catch {
    emailCouncilEntries = []
  }

  const nowMs = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const sevenDayMs = 7 * oneDayMs

  const councilLast24h = emailCouncilEntries.filter((entry) => {
    const ts = Date.parse(entry.ts)
    return Number.isFinite(ts) && nowMs - ts <= oneDayMs
  })

  const councilLast7d = emailCouncilEntries.filter((entry) => {
    const ts = Date.parse(entry.ts)
    return Number.isFinite(ts) && nowMs - ts <= sevenDayMs
  })

  const blockedSends24h = councilLast24h.filter((entry) => entry.blocked).length
  const evaluated24h = councilLast24h.length
  const passed24h = evaluated24h - blockedSends24h
  const avgEjes24h = evaluated24h > 0
    ? Math.round(councilLast24h.reduce((sum, entry) => sum + (entry.scores?.ejes ?? 0), 0) / evaluated24h)
    : null

  const blockerCounts = new Map<string, number>()
  for (const entry of councilLast24h) {
    for (const blocker of entry.blockers ?? []) {
      blockerCounts.set(blocker, (blockerCounts.get(blocker) ?? 0) + 1)
    }
  }
  const topBlockers = Array.from(blockerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const councilChannelMap = new Map<string, { count: number; blocked: number; ejesSum: number }>()
  for (const entry of councilLast7d) {
    const key = entry.channel ?? 'general'
    const current = councilChannelMap.get(key) ?? { count: 0, blocked: 0, ejesSum: 0 }
    current.count += 1
    current.blocked += entry.blocked ? 1 : 0
    current.ejesSum += entry.scores?.ejes ?? 0
    councilChannelMap.set(key, current)
  }
  const channelEjesTrend = Array.from(councilChannelMap.entries())
    .map(([channel, stats]) => ({
      channel,
      evaluations: stats.count,
      blockedRate: stats.count > 0 ? Math.round((stats.blocked / stats.count) * 100) : 0,
      avgEjes: stats.count > 0 ? Math.round(stats.ejesSum / stats.count) : 0,
    }))
    .sort((a, b) => b.evaluations - a.evaluations)

  const signups7d = cohort7.length

  // MRR from Stripe (best-effort — falls back to null on error)
  let stripeMrr: number | null = null
  try {
    const stripe = getStripe()
    const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 })
    let totalCents = 0
    for (const sub of subs.data) {
      for (const item of sub.items.data) {
        const cents = (item.price.unit_amount ?? 0) * (item.quantity ?? 1)
        totalCents += item.price.recurring?.interval === 'year'
          ? Math.round(cents / 12)
          : cents
      }
    }
    stripeMrr = Math.round(totalCents / 100)
  } catch {
    // Stripe unavailable — show null
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/revenue" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Revenue</Link>
            <Link href="/dashboard/admin/product" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Product</Link>
            <Link href="/dashboard/admin/operations" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Operations</Link>
            <Link href="/dashboard/admin/guide" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Guide</Link>
            <Link href="/dashboard/admin/internal-guide" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Internal guide</Link>
            <Link href="/dashboard/admin/onboarding/video" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Onboarding video</Link>
            <Link href="/dashboard/admin/traces" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Traces</Link>
            <Link href="/dashboard/admin/team" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Team</Link>
            <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">Back to Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
<div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Admin</h1>
            <p className="text-[13px] text-slate-500 mt-1.5">
              Signed in as <span className="font-semibold">{user.email}</span>
              <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded ${roleBadge(staff.role)}`}>{staff.role}</span>
            </p>
          </div>
          {staff.role === 'owner' && (
            <Link href="/dashboard/admin/team" className="text-[13px] font-semibold text-slate-900 bg-white border border-slate-200 hover:border-slate-400 px-4 py-2 rounded transition-colors shrink-0">
              Manage team
            </Link>
          )}
        </div>

        <section className="mb-8 bg-slate-50 border border-slate-200 rounded p-4">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Jump to section</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
            <a href="#subscriber-summary" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Subscribers</a>
            <a href="#email-council-health" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Email council</a>
            <a href="#system-health" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">System health</a>
            <a href="#role-path-ranking" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Role-path ranking</a>
            <a href="#internal-pages" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Internal pages</a>
            <a href="#partners" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Partners</a>
          </div>
        </section>

        <section id="email-council-health" className="bg-white border border-slate-200 rounded p-6 mb-6">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Email Council Health (Daily)</h2>
          <p className="text-[12px] text-slate-400 mb-5">Blocked sends, top blockers, and 7-day EJES trend.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
            {[{
              label: 'Evaluated (24h)',
              value: evaluated24h,
            }, {
              label: 'Blocked (24h)',
              value: blockedSends24h,
            }, {
              label: 'Passed (24h)',
              value: passed24h,
            }, {
              label: 'Avg EJES (24h)',
              value: avgEjes24h ?? 'N/A',
            }].map((card) => (
              <div key={card.label} className="bg-slate-50 border border-slate-200 rounded p-4">
                <div className="text-[24px] font-bold text-slate-900 leading-none">{card.value}</div>
                <div className="text-[10px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded p-4">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Top blockers (24h)</p>
              {topBlockers.length === 0 ? (
                <p className="text-[12px] text-slate-500">No blockers logged in the last 24 hours.</p>
              ) : (
                <ul className="space-y-2">
                  {topBlockers.map(([blocker, count]) => (
                    <li key={blocker} className="text-[12px] text-slate-700 flex items-start justify-between gap-3">
                      <span className="leading-relaxed">{blocker}</span>
                      <span className="text-[11px] font-bold text-slate-500">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border border-slate-200 rounded p-4">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Channel EJES trend (7d)</p>
              {channelEjesTrend.length === 0 ? (
                <p className="text-[12px] text-slate-500">No channel score data yet.</p>
              ) : (
                <div className="space-y-2">
                  {channelEjesTrend.map((row) => (
                    <div key={row.channel} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-[12px]">
                      <span className="text-slate-700">{row.channel}</span>
                      <span className="text-slate-500">EJES {row.avgEjes}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${row.blockedRate === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        blocked {row.blockedRate}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Operating Areas</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PAGE_GROUPS.map((group) => {
              const corePages = group.pages.filter((page) => page.priority === 'core')
              const advancedCount = group.pages.filter((page) => page.priority === 'advanced').length
              return (
                <div key={group.id} className="bg-white border border-slate-200 rounded p-4">
                  <p className="text-[14px] font-bold text-slate-900">{group.label}</p>
                  <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{group.purpose}</p>
                  <div className="mt-3 space-y-1.5">
                    {corePages.map((page) => (
                      <Link key={page.path} href={page.path} className="block text-[12px] font-semibold text-slate-700 hover:text-slate-900 hover:underline">
                        {page.label}
                      </Link>
                    ))}
                    {advancedCount > 0 && (
                      <p className="text-[11px] text-slate-400 mt-2">+ {advancedCount} advanced pages</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Daily activation snapshot (24h)</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {[
              { label: 'New users', value: users24h?.length ?? 0 },
              { label: 'Added company', value: usersWithCompany24h },
              { label: 'Added contact', value: usersWithContact24h },
              { label: 'Set follow-up', value: usersWithFollowUp24h },
              { label: 'Viewed briefing', value: usersWithBriefingView24h },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-slate-200 rounded p-4">
                <div className="text-[24px] font-bold text-slate-900 leading-none">{card.value}</div>
                <div className="text-[10px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">{card.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Link href="/guide" className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Automation alerts: <span className="text-slate-900">{openAutomationAlerts ?? 0}</span> - view runbooks
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Search control telemetry (7d)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Paused events', value: searchPaused7d },
              { label: 'Resumed events', value: searchResumed7d },
              { label: 'Net paused', value: netPaused7d },
              { label: 'Pause/Resume ratio', value: pauseResumeRatio7d ?? 'N/A' },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-slate-200 rounded p-4">
                <div className="text-[24px] font-bold text-slate-900 leading-none">{card.value}</div>
                <div className="text-[10px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">{card.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-white border border-slate-200 rounded p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Daily trend</p>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded border ${
                  telemetryAlertLevel === 'risk'
                    ? 'text-red-700 bg-red-50 border-red-200'
                    : telemetryAlertLevel === 'watch'
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}
              >
                {telemetryAlertLevel === 'risk' ? 'At risk' : telemetryAlertLevel === 'watch' ? 'Watch' : 'Healthy'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Last 3d net: <span className="font-semibold text-slate-700">{netPausedLast3d > 0 ? `+${netPausedLast3d}` : netPausedLast3d}</span>
              {' '}({positiveNetDaysLast3d}/3 days positive)
            </p>
            <div className="space-y-2">
              {pauseResumeTrend7d.map((row) => (
                <div key={row.dayKey} className="grid grid-cols-[84px_1fr_44px] items-center gap-3 text-[11px]">
                  <span className="text-slate-500">{row.label}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <progress
                      max={trendPeak}
                      value={row.paused}
                      title={`Paused: ${row.paused}`}
                      className="w-full h-2 [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-slate-900 [&::-moz-progress-bar]:bg-slate-900"
                    />
                    <progress
                      max={trendPeak}
                      value={row.resumed}
                      title={`Resumed: ${row.resumed}`}
                      className="w-full h-2 [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500"
                    />
                  </div>
                  <span className={`text-right font-semibold ${row.net > 0 ? 'text-amber-700' : row.net < 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {row.net > 0 ? `+${row.net}` : row.net}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-400">
              <span><span className="inline-block w-2 h-2 rounded bg-slate-900 mr-1" />Paused</span>
              <span><span className="inline-block w-2 h-2 rounded bg-emerald-500 mr-1" />Resumed</span>
              <span>Net shown at right</span>
            </div>
          </div>
        </div>

        <section id="role-path-ranking" className="bg-white border border-slate-200 rounded p-6 mb-6">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Role Path Ranking Debug</h2>
          <p className="text-[12px] text-slate-400 mb-4">Live homepage order inputs from click volume and conversion behavior (90d window).</p>
          {rolePathPriorityDebug.length === 0 ? (
            <p className="text-[12px] text-slate-500">No role-path ranking data yet. Confirm footer click traffic and analytics credentials.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] min-w-[760px]">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="py-2 pr-3 font-semibold">Rank</th>
                    <th className="py-2 pr-3 font-semibold">CTA key</th>
                    <th className="py-2 pr-3 font-semibold text-right">Clicks</th>
                    <th className="py-2 pr-3 font-semibold text-right">Anon est.</th>
                    <th className="py-2 pr-3 font-semibold text-right">Conv users</th>
                    <th className="py-2 pr-3 font-semibold text-right">Conv rate</th>
                    <th className="py-2 font-semibold text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rolePathPriorityDebug.map((row) => (
                    <tr key={row.ctaKey}>
                      <td className="py-2 pr-3 font-semibold text-slate-900">#{row.rank}</td>
                      <td className="py-2 pr-3 text-slate-700">{row.ctaKey}</td>
                      <td className="py-2 pr-3 text-right text-slate-800">{row.clicks}</td>
                      <td className="py-2 pr-3 text-right text-slate-500">{row.anonymousClickEstimate}</td>
                      <td className="py-2 pr-3 text-right text-slate-800">{row.conversionUsers}</td>
                      <td className="py-2 pr-3 text-right text-slate-800">{(row.conversionRate * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right text-slate-900 font-semibold">{row.score.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="go-no-go" className="bg-white border border-slate-200 rounded p-6 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Go/No-Go Scorecard</h2>
              <p className="text-[12px] text-slate-400 mt-1">Auto-evaluated from current measurable thresholds.</p>
            </div>
            <div className={`text-[12px] font-bold px-3 py-1.5 rounded border ${statusClass(decision.status)}`}>
              {decision.label}
            </div>
          </div>
          <p className="text-[12px] text-slate-600 mb-4">{decision.reason}</p>
          <div className="space-y-2">
            {scoreRows.map((row) => (
              <div key={row.label} className="border border-slate-200 rounded px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 truncate">{row.label}</p>
                    <p className="text-[11px] text-slate-400">Threshold: {row.threshold}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded border shrink-0 ${statusClass(row.status)}`}>{row.value}</span>
                </div>
                {row.note && <p className="text-[11px] text-slate-500 mt-1.5">{row.note}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Subscriber summary */}
        <section id="subscriber-summary" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Total users',   value: String(totalUsers    ?? 0), highlight: false },
            { label: 'Active (paid)', value: String(paidUsers     ?? 0), highlight: false },
            { label: 'Trialing',      value: String(trialingUsers ?? 0), highlight: false },
            { label: 'Placed',        value: String(placements.length),  highlight: false },
            { label: 'New (7d)',       value: String(signups7d),          highlight: false },
            { label: 'Stripe MRR',    value: stripeMrr !== null ? `$${stripeMrr.toLocaleString()}` : '--', highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="bg-white border border-slate-200 rounded p-5">
              <div className={`text-[28px] font-bold ${highlight ? 'text-orange-500' : 'text-slate-900'}`}>{value}</div>
              <div className="text-[12px] text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </section>

        {/* System health */}
        <section id="system-health" className="bg-white border border-slate-200 rounded p-5 mb-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-3">System Health</div>
          <div className="flex items-center gap-3 mb-3">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${briefingStale ? 'bg-red-500' : briefingConfiguredProfiles.length === 0 ? 'bg-slate-300' : 'bg-green-500'}`} />
            <span className="text-[13px] text-slate-700">
              Briefing worker{' '}
              {briefingConfiguredProfiles.length === 0
                ? '-- no users configured'
                : briefingHoursAgo !== null
                  ? `-- last sent ${briefingHoursAgo}h ago`
                  : '-- never sent'}
            </span>
            {briefingStale && (
              <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">STALE</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              executiveResearchStatus === 'healthy'
                ? 'bg-green-500'
                : executiveResearchStatus === 'degraded'
                  ? 'bg-red-500'
                  : executiveResearchStatus === 'stale'
                    ? 'bg-amber-500'
                    : 'bg-slate-300'
            }`} />
            <span className="text-[13px] text-slate-700">
              Executive research refresh{' '}
              {latestExecutiveResearchRun
                ? `-- last run ${executiveResearchHoursAgo ?? '-'}h ago • checked ${latestExecutiveResearchRun.checked_count ?? 0} • changed ${latestExecutiveResearchRun.changed_count ?? 0}`
                : '-- no runs yet'}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
              executiveResearchStatus === 'healthy'
                ? 'text-green-700 bg-green-50'
                : executiveResearchStatus === 'degraded'
                  ? 'text-red-700 bg-red-50'
                  : executiveResearchStatus === 'stale'
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-slate-500 bg-slate-100'
            }`}>
              {executiveResearchStatus.toUpperCase()}
            </span>
            <span className="text-[11px] text-slate-500">
              Sources: {executiveResearchSourceCount ?? 0} • Failures: {executiveResearchFailureCount ?? 0}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 mt-2">
            API: <span className="font-mono">/api/admin/executive-research/health</span>
          </p>
        </section>

        {/* Team summary */}
        <section id="team-summary" className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Team</h2>
            <Link href="/dashboard/admin/team" className="text-[12px] text-slate-500 hover:text-slate-700">Manage Team</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {teamMembers.map(m => (
              <div key={m.id} className="px-6 py-3 flex items-center justify-between">
                <span className="text-[13px] text-slate-900">{m.email}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${roleBadge(m.role)}`}>{m.role}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="internal-pages" className="bg-white border border-slate-200 rounded p-5 mb-6">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-3">Internal navigation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
            <Link href="/dashboard/admin/team" className="border border-slate-200 rounded px-4 py-3 hover:border-slate-400 transition-colors">Team and permissions</Link>
            <Link href="/dashboard/admin/product" className="border border-slate-200 rounded px-4 py-3 hover:border-slate-400 transition-colors">Product ops</Link>
            <Link href="/dashboard/admin/operations" className="border border-slate-200 rounded px-4 py-3 hover:border-slate-400 transition-colors">Operations</Link>
            <Link href="/dashboard/admin/onboarding/video" className="border border-slate-200 rounded px-4 py-3 hover:border-slate-400 transition-colors">Onboarding video timeline</Link>
            <Link href="/dashboard/admin/revenue" className="border border-slate-200 rounded px-4 py-3 hover:border-slate-400 transition-colors">Revenue and conversion</Link>
          </div>
        </section>

        {/* Six-actions funnel */}
        <section id="six-actions-funnel" className="bg-white border border-slate-200 rounded p-6 mb-6">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Six-Actions Funnel</h2>
          <p className="text-[12px] text-slate-400 mb-6">Trialing + active users (n={activeUserIds.size})</p>
          <FunnelChart data={funnelData} />
          <table className="w-full mt-4 text-[12px]">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-1 font-semibold">Step</th>
                <th className="py-1 font-semibold text-right">Users</th>
                <th className="py-1 font-semibold text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {funnelData.map(row => (
                <tr key={row.step}>
                  <td className="py-2 text-slate-700">{STEP_LABELS[row.step] ?? row.step}</td>
                  <td className="py-2 text-right font-semibold text-slate-900">{row.count}</td>
                  <td className="py-2 text-right text-slate-400">{Math.round((row.count / denominator) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Event volume */}
        <section id="event-volume" className="bg-white border border-slate-200 rounded p-6 mb-6">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Event Volume (30d)</h2>
          <p className="text-[12px] text-slate-400 mb-6">7d counts in right column</p>
          {eventVolumeData.length === 0 ? (
            <p className="text-[13px] text-slate-400">No events yet.</p>
          ) : (
            <>
              <EventVolumeChart data={eventVolumeData} />
              <table className="w-full mt-4 text-[12px]">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="py-1 font-semibold">Event</th>
                    <th className="py-1 font-semibold text-right">30d</th>
                    <th className="py-1 font-semibold text-right">7d</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {eventVolumeData.map(row => (
                    <tr key={row.event_name}>
                      <td className="py-2 text-slate-700 font-mono text-[11px]">{row.event_name}</td>
                      <td className="py-2 text-right font-semibold text-slate-900">{row.count}</td>
                      <td className="py-2 text-right text-slate-400">{eventCounts7d[row.event_name] ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>

        {/* Trial conversion */}
        <section id="trial-conversion" className="bg-white border border-slate-200 rounded p-6 mb-6">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Trial Conversion</h2>
          <p className="text-[12px] text-slate-400 mb-5">Users whose 30-day trial window has closed</p>
          <div className={`mb-5 border rounded p-4 ${linkedInAdsGatePass ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center justify-between gap-3 mb-1">
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500">LinkedIn Ads Gate</p>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${linkedInAdsGatePass ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'}`}>
                {linkedInAdsDecision}
              </span>
            </div>
            <p className="text-[12px] text-slate-600">
              Requires trial-to-paid conversion of at least {linkedInAdsThreshold}%. Current: {conversionRate !== null ? `${conversionRate}%` : 'N/A'}.
            </p>
            {!linkedInAdsGatePass && (
              <p className="text-[12px] text-slate-500 mt-1">
                Paid ads stay deferred until this threshold is reached.
              </p>
            )}
          </div>
          {totalEnded === 0 ? (
            <p className="text-[13px] text-slate-400">No ended trials yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-6 mb-6">
                {[
                  { label: 'Trials ended', value: String(totalEnded), highlight: false },
                  { label: 'Converted to paid', value: String(totalConverted), highlight: false },
                  { label: 'Conversion rate', value: conversionRate !== null ? `${conversionRate}%` : '-', highlight: true, rate: conversionRate },
                ].map(({ label, value, highlight, rate }) => (
                  <div key={label}>
                    <div className={`text-[28px] font-bold ${
                      highlight && rate !== null && rate !== undefined
                        ? rate >= 40 ? 'text-green-600' : rate >= 20 ? 'text-amber-600' : 'text-red-600'
                        : 'text-slate-900'
                    }`}>{value}</div>
                    <div className="text-[12px] text-slate-400 mt-1">{label}</div>
                  </div>
                ))}
              </div>
              {channelRows.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">By channel</p>
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-left border-b border-slate-100">
                        <th className="pb-2 font-semibold text-slate-400">Source</th>
                        <th className="pb-2 font-semibold text-slate-400 text-right">Trials</th>
                        <th className="pb-2 font-semibold text-slate-400 text-right">Converted</th>
                        <th className="pb-2 font-semibold text-slate-400 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {channelRows.map(r => (
                        <tr key={r.channel}>
                          <td className="py-2 font-mono text-slate-600">{r.channel}</td>
                          <td className="py-2 text-right text-slate-500">{r.ended}</td>
                          <td className="py-2 text-right text-slate-500">{r.converted}</td>
                          <td className={`py-2 text-right font-semibold ${
                            r.rate >= 40 ? 'text-green-600' : r.rate >= 20 ? 'text-amber-600' : 'text-red-600'
                          }`}>{r.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        <section id="active-trials" className="bg-white border border-slate-200 rounded p-5 mb-6">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2">Trial watchlist</h2>
          <p className="text-[13px] text-slate-600">Active trials: {trialUsers.length}</p>
        </section>

        {/* Signal to action rate */}
        <details id="signal-action-rate" className="bg-white border border-slate-200 rounded p-6 mb-6">
          <summary className="cursor-pointer text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Signal &rarr; Action Rate</summary>
          <div className="pt-4">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Signal Action Rate</h2>
          <p className="text-[12px] text-slate-400 mb-5">Signals that triggered outreach, brief gen, or contact add within 48h</p>
          {signalRows.length === 0 ? (
            <p className="text-[13px] text-slate-400">No signals yet.</p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="py-2 font-semibold">Signal type</th>
                  <th className="py-2 font-semibold text-right">Total</th>
                  <th className="py-2 font-semibold text-right">Acted</th>
                  <th className="py-2 font-semibold text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {signalRows.map(row => (
                  <tr key={row.type}>
                    <td className="py-2.5 text-slate-700">{row.label}</td>
                    <td className="py-2.5 text-right text-slate-400">{row.total}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">{row.acted}</td>
                    <td className="py-2.5 text-right">
                      <span className={`font-bold ${row.rate >= 50 ? 'text-green-600' : row.rate >= 25 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {row.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
        </details>

        <section id="partners" className="bg-white border border-slate-200 rounded p-5">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2">Commercial snapshot</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
            <div className="border border-slate-200 rounded px-3 py-2">Partners: <span className="font-semibold">{partners.length}</span></div>
            <div className="border border-slate-200 rounded px-3 py-2">B2B accounts: <span className="font-semibold">{b2bAccounts.length}</span></div>
            <div className="border border-slate-200 rounded px-3 py-2">Placements: <span className="font-semibold">{placements.length}</span></div>
            <div className="border border-slate-200 rounded px-3 py-2">Avg context: <span className="font-semibold">{avgContextScore ?? 'N/A'}</span></div>
          </div>
        </section>

      </main>
    </div>
  )
}
