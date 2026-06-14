import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { todayInTz, greetingInTz, fullDateInTz } from '@/lib/date'
import { getActivationStatus } from '@/lib/activation'
import { resolveCareerMode } from '@/lib/career-mode'
import { LogoutButton } from './logout-button'
import { HelpQuickButton } from '@/components/HelpQuickButton'
import { CmdKButton } from '@/components/CmdKButton'
import { saveQuickProfile, saveWeeklyGoal, dismissStallNudge } from './profile/actions'
import { markPlaced } from './placed/actions'
import { OpportunityRadar } from './opportunity-radar'
import { ActivityChart, type WeekActivity } from '@/components/ActivityChart'
import { PipelineVelocity, type VelocityRow } from '@/components/PipelineVelocity'
import { DailyMomentumPlan, type DailyMomentumAction } from '@/components/DailyMomentumPlan'
import { getStaffMember, hasAdminHeaderAccess } from '@/lib/staff'
import { DashboardPipelineSection } from './dashboard-pipeline-section'
import { DashboardDisclosureSection } from './dashboard-disclosure-section'
import { DashboardStatusBanners } from './dashboard-status-banners'
import { DashboardProfileIntelligenceSection } from './dashboard-profile-intelligence-section'
import { DashboardWelcomeNudgeSection } from './dashboard-welcome-nudge-section'
import { DashboardAdvancedModulesSection } from './dashboard-advanced-modules-section'
import { DashboardTopShellSection } from './dashboard-top-shell-section'
import { DashboardPostPlacementView } from './dashboard-post-placement-view'
import { DashboardDecisionTimelineSection } from './dashboard-decision-timeline-section'
import { updateDecisionOwner } from './actions'
import { decisionMarkerForStage, extractDecisionOwnerFromNotes } from './dashboard-decision-timeline-utils'
import { bumpWeek, getWeekMonday, weekLabel } from './dashboard-week-utils'
import { canAccessFeature, getUserSubscription } from '@/lib/subscription'

// Full class strings - must not be constructed dynamically (Tailwind scanner needs to see them)
const STAGE: Record<string, { label: string; cls: string }> = {
  watching:     { label: 'Watching',     cls: 'bg-slate-100 text-slate-500' },
  researching:  { label: 'Researching',  cls: 'bg-blue-50 text-blue-700' },
  applied:      { label: 'In Process',   cls: 'bg-indigo-50 text-indigo-700' },
  interviewing: { label: 'Interviewing', cls: 'bg-amber-50 text-amber-700' },
  offer:        { label: 'Offer',        cls: 'bg-green-50 text-green-700' },
}

const PAGE_SIZE = 50

type ProfileRow = {
  full_name: string | null
  search_started_at: string | null
  briefing_timezone: string | null
  onboarding_completed_at: string | null
  target_titles: string[] | null
  resume_text: string | null
  positioning_summary: string | null
  briefing_time: string | null
  briefing_frequency: string | null
  current_title: string | null
  placed_at: string | null
  placement_company: string | null
  search_status: string | null
  weekly_goal: number | null
  stall_nudge_dismissed_at: string | null
  search_path: string | null
}

type UserRow = {
  subscription_status: string | null
  trial_ends_at: string | null
  subscription_tier: string | null
}

type SignalRow = {
  id: string
  signal_type: string
  signal_summary: string
  outreach_angle?: string | null
  signal_date: string
  company_id: string
  companies: { id: string; name: string } | null
}

type CompanyRow = {
  id: string
  name: string
  sector: string | null
  stage: string
  fit_score: number | null
  notes: string | null
  updated_at: string | null
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stage?: string; page?: string; profile_saved?: string; focus?: string; preview?: string; timelinePage?: string; timelineSort?: string }>
}) {
  const { q, stage, page: pageParam, profile_saved, focus, preview, timelinePage: timelinePageParam, timelineSort: timelineSortParam } = await searchParams
  const page = Math.max(0, parseInt(pageParam ?? '0', 10) || 0)
  const timelinePage = Math.max(0, parseInt(timelinePageParam ?? '0', 10) || 0)
  const timelineSort = timelineSortParam === 'recent_desc' || timelineSortParam === 'name_asc'
    ? timelineSortParam
    : 'stalled_desc'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const subscription = await getUserSubscription(user.id, supabase)
  if (canAccessFeature(subscription, 'coach_dashboard')) {
    redirect('/dashboard/coach')
  }

  const { data: profileRaw, error: profileError } = await supabase
    .from('user_profiles')
    .select('full_name, search_started_at, briefing_timezone, onboarding_completed_at, target_titles, resume_text, positioning_summary, briefing_time, briefing_frequency, current_title, placed_at, placement_company, search_status, weekly_goal, stall_nudge_dismissed_at, search_path')
    .eq('user_id', user.id)
    .single()
  const profile = profileRaw as ProfileRow | null

  if (profileError && profileError.code !== 'PGRST116') {
    console.error(JSON.stringify({ ts: new Date().toISOString(), event: 'dashboard_profile_error', code: profileError.code, message: profileError.message, userId: user.id }))
  } else if (!profile?.onboarding_completed_at) {
    redirect('/onboarding')
  }

  const careerMode = resolveCareerMode({ placedAt: profile?.placed_at, searchStatus: profile?.search_status })
  if (careerMode === 'post_search') {
    redirect('/dashboard/post-search')
  }

  const tz = profile?.briefing_timezone ?? 'UTC'
  const todayISO = todayInTz(tz)

  // Build filtered company query (server-side) with pagination
  let companyQuery = supabase
    .from('companies')
    .select('id, name, sector, stage, fit_score, notes, updated_at', { count: 'planned' })
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('fit_score', { ascending: false, nullsFirst: false })

  if (q) companyQuery = companyQuery.ilike('name', `%${q}%`)
  if (stage) companyQuery = companyQuery.eq('stage', stage)

  const start = page * PAGE_SIZE
  companyQuery = companyQuery.range(start, start + PAGE_SIZE - 1)

  // Stats query: total + active count (unfiltered)
  const statsQuery = supabase
    .from('companies')
    .select('id, stage, name, notes, updated_at')
    .eq('user_id', user.id)
    .is('archived_at', null)

  const since7d  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const since14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const since70d = new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
  const thisMonday = (() => {
    const d = new Date(); const day = d.getDay()
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0, 0, 0, 0)
    return d.toISOString()
  })()

  const adminClient = createAdminClient()
  const isPartnerPromise = Promise.resolve(
    adminClient
      .from('partners')
      .select('id', { count: 'exact', head: true })
      .eq('email', user.email ?? '')
      .eq('is_active', true)
  ).then(r => (r.count ?? 0) > 0).catch(() => false)

  const [{ data: rawCompanies, count: filteredCount }, { data: allCompanies }, { data: followUps }, { data: rawUserRow }, { data: rawSignals }, { data: rawPatternAlerts }, activation, { data: momentumData }, { data: contactRows }, { count: draftReadyCount }, { data: actCompanies }, { data: actContacts }, { data: actBriefs }, { data: actFollowUps }, { count: outreachThisWeek }, { count: prospectContactCount }, { data: briefedCompanyRows }] = await Promise.all([
    companyQuery,
    statsQuery,
    supabase
      .from('follow_ups')
      .select('id, due_date, action, companies(name)')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lte('due_date', todayISO)
      .order('due_date', { ascending: true })
      .limit(20),
    supabase
      .from('users')
      .select('subscription_status, trial_ends_at, subscription_tier')
      .eq('id', user.id)
      .single(),
    supabase
      .from('company_signals')
      .select('id, signal_type, signal_summary, outreach_angle, signal_date, company_id, companies(id, name)')
      .eq('user_id', user.id)
      .neq('signal_type', 'pattern_alert')
      .gte('signal_date', since7d)
      .order('signal_date', { ascending: false })
      .limit(5),
    supabase
      .from('company_signals')
      .select('id, signal_type, signal_summary, outreach_angle, signal_date, company_id, companies(id, name)')
      .eq('user_id', user.id)
      .eq('signal_type', 'pattern_alert')
      .gte('signal_date', since14d)
      .order('signal_date', { ascending: false })
      .limit(3),
    getActivationStatus(user.id),
    // Separate query - columns added in migration 022; returns { data: null } gracefully if not yet applied
    supabase
      .from('user_profiles')
      .select('momentum_score, momentum_computed_at')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('contacts')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .not('company_id', 'is', null),
    supabase
      .from('company_signals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('outreach_draft', 'is', null)
      .gte('signal_date', since14d),
    // Activity chart queries (last 10 weeks)
    supabase.from('companies').select('created_at').eq('user_id', user.id).is('archived_at', null).gte('created_at', since70d),
    supabase.from('contacts').select('created_at').eq('user_id', user.id).gte('created_at', since70d),
    supabase.from('briefs').select('created_at').eq('user_id', user.id).gte('created_at', since70d),
    supabase.from('follow_ups').select('created_at').eq('user_id', user.id).gte('created_at', since70d),
    supabase.from('briefs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'outreach').gte('created_at', thisMonday),
    supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active').eq('outreach_status', 'prospect'),
    supabase.from('briefs').select('company_id').eq('user_id', user.id).eq('type', 'prep').not('company_id', 'is', null).limit(500),
  ])

  const companies = rawCompanies as CompanyRow[] | null
  const userRow   = rawUserRow as UserRow | null
  const signals   = (rawSignals ?? []) as unknown as SignalRow[]
  const patternAlerts = (rawPatternAlerts ?? []) as unknown as SignalRow[]

  // Build weekly activity chart data (last 10 weeks)
  const weekSlots: WeekActivity[] = []
  for (let i = 9; i >= 0; i--) {
    const d = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)
    weekSlots.push({ week: weekLabel(getWeekMonday(d)), companies: 0, contacts: 0, briefs: 0, followUps: 0 })
  }
  const weekMap = new Map(weekSlots.map((slot) => [slot.week, slot]))
  for (const r of actCompanies ?? []) bumpWeek(weekMap, r.created_at, 'companies')
  for (const r of actContacts ?? []) bumpWeek(weekMap, r.created_at, 'contacts')
  for (const r of actBriefs ?? []) bumpWeek(weekMap, r.created_at, 'briefs')
  for (const r of actFollowUps ?? []) bumpWeek(weekMap, r.created_at, 'followUps')

  const allActivityDates = [
    ...(actCompanies ?? []).map(r => r.created_at),
    ...(actContacts  ?? []).map(r => r.created_at),
    ...(actBriefs    ?? []).map(r => r.created_at),
    ...(actFollowUps ?? []).map(r => r.created_at),
  ]
  const lastActivityMs = allActivityDates.length > 0 ? Math.max(...allActivityDates.map(d => new Date(d).getTime())) : 0
  const daysSinceLastAction = lastActivityMs > 0 ? Math.floor((Date.now() - lastActivityMs) / 86400000) : null

  // Nurture path � derived from profile; showNurtureWelcome computed after totalCount and daysSinceOnboard
  const searchPath = profile?.search_path ?? null
  const isNurturePath = searchPath === 'nurture'

  // Stall detection � pattern-specific nudge shown after 14 days of low activity
  type StallNudge = { headline: string; body: string; action: string; href: string } | null
  let stallNudge: StallNudge = null
  const dismissedAt = profile?.stall_nudge_dismissed_at
  const dismissedDaysAgo = dismissedAt ? Math.floor((Date.now() - new Date(dismissedAt).getTime()) / 86400000) : Infinity
  const searchStartedAt = profile?.search_started_at ? new Date(profile.search_started_at) : null
  const daysSinceStart = searchStartedAt ? Math.floor((Date.now() - searchStartedAt.getTime()) / 86400000) : null
  const contactCount = (contactRows ?? []).length
  const totalCompanies = (allCompanies ?? []).length
  const hasAdvancedStage = (allCompanies ?? []).some(c => ['interviewing', 'applied', 'offer'].includes(c.stage))

  if (!profile?.placed_at && dismissedDaysAgo > 7 && daysSinceStart !== null && daysSinceStart >= 14) {
    if (totalCompanies > 0 && contactCount === 0) {
      stallNudge = {
        headline: 'Companies tracked. No contacts added.',
        body: 'Your target list is built. Adding the people you know at these companies is usually what holds the first outreach back. Even one contact changes the shape of the conversation.',
        action: 'Add a contact',
        href: '/dashboard/contacts',
      }
    } else if (contactCount > 0 && !hasAdvancedStage && daysSinceLastAction !== null && daysSinceLastAction >= 14) {
      const hasSummary = !!profile?.positioning_summary
      stallNudge = {
        headline: 'No activity in two weeks.',
        body: hasSummary
          ? 'You have contacts to work but nothing has moved. Run a strategy brief to see where the gap is.'
          : 'You have contacts to work but no positioning summary. That is usually what holds the first outreach back � you are not sure what to say yet.',
        action: hasSummary ? 'Run strategy brief' : 'Add your positioning',
        href: hasSummary ? '/dashboard/strategy' : '/dashboard/profile',
      }
    } else if (totalCompanies > 0 && !hasAdvancedStage && daysSinceLastAction !== null && daysSinceLastAction >= 21) {
      stallNudge = {
        headline: 'Nothing has moved in three weeks.',
        body: 'Every company is still at watching or researching. Either the target list needs narrowing, or the outreach has not started. Both are diagnosable.',
        action: 'Run a strategy brief',
        href: '/dashboard/strategy',
      }
    }
  }

  // Pipeline velocity rows (all companies, sorted by staleness)
  const velocityRows: VelocityRow[] = (companies ?? []).map(c => ({
    id: c.id,
    name: c.name,
    stage: c.stage,
    updated_at: c.updated_at ?? null,
  }))

  // isPartnerPromise was started before the main await above so it ran in parallel
  const isPartner = await isPartnerPromise
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const allList = allCompanies ?? []
  const totalCount = allList.length
  const activeCount = allList.filter(c =>
    ['interviewing', 'applied', 'offer'].includes(c.stage)
  ).length
  const overdueCount   = (followUps ?? []).length
  const signalCount    = signals.length + patternAlerts.length

  const stalledCampaignRows = velocityRows
    .map((row) => {
      if (!row.updated_at) return null
      const daysStalled = Math.floor((Date.now() - new Date(row.updated_at).getTime()) / 86400000)
      if (daysStalled < 14) return null
      return { ...row, daysStalled }
    })
    .filter((row): row is VelocityRow & { daysStalled: number } => !!row)
    .sort((a, b) => b.daysStalled - a.daysStalled)

  const cadenceScore = Math.min(100, (outreachThisWeek ?? 0) * 20)
  const followThroughScore = Math.max(0, 100 - overdueCount * 15)
  const conversionScore = totalCount > 0 ? Math.min(100, Math.round((activeCount / totalCount) * 100)) : 0
  const campaignHealthScore = Math.round((cadenceScore * 0.4) + (followThroughScore * 0.35) + (conversionScore * 0.25))
  const campaignHealthBand = campaignHealthScore >= 75 ? 'Strong' : campaignHealthScore >= 50 ? 'Watch' : 'At risk'
  const topStalledCampaigns = stalledCampaignRows.slice(0, 5)

  const timelineOwnerLabel = profile?.full_name ?? user.email ?? 'Account owner'
  const decisionTimelineItemsAll = (allList ?? [])
    .map((company) => {
      const stageLabel = STAGE[company.stage]?.label ?? company.stage
      const updatedAtMs = company.updated_at ? new Date(company.updated_at).getTime() : null
      const daysSinceUpdate = updatedAtMs ? Math.floor((Date.now() - updatedAtMs) / 86400000) : null
      const stalled = (daysSinceUpdate ?? 0) >= 14
      const marker = decisionMarkerForStage(company.stage)
      const assignedOwner = extractDecisionOwnerFromNotes(company.notes) ?? timelineOwnerLabel

      return {
        id: company.id,
        name: company.name,
        stageLabel,
        nextDecisionMarker: marker.marker,
        decisionWindowLabel: marker.decisionWindowLabel,
        daysSinceUpdate,
        stalled,
        ownerLabel: assignedOwner,
        href: `/dashboard/companies/${company.id}`,
      }
    })

  const decisionTimelineItemsSorted = [...decisionTimelineItemsAll].sort((a, b) => {
    if (timelineSort === 'name_asc') return a.name.localeCompare(b.name)
    if (timelineSort === 'recent_desc') return (a.daysSinceUpdate ?? 0) - (b.daysSinceUpdate ?? 0)
    if (a.stalled !== b.stalled) return a.stalled ? -1 : 1
    return (b.daysSinceUpdate ?? 0) - (a.daysSinceUpdate ?? 0)
  })

  const timelinePageSize = 6
  const timelineTotalPages = Math.max(1, Math.ceil(decisionTimelineItemsSorted.length / timelinePageSize))
  const safeTimelinePage = Math.min(timelinePage, timelineTotalPages - 1)
  const decisionTimelineItems = decisionTimelineItemsSorted.slice(
    safeTimelinePage * timelinePageSize,
    safeTimelinePage * timelinePageSize + timelinePageSize,
  )

  // Warm paths: contacts at companies with recent signals
  const signalCompanyIds = [...new Set([...signals, ...patternAlerts].map(s => s.company_id).filter(Boolean))]
  type WarmPath = { contactId: string; contactName: string; contactTitle: string | null; companyId: string; companyName: string; signal: SignalRow }
  let warmPaths: WarmPath[] = []
  if (signalCompanyIds.length > 0) {
    const { data: warmContacts } = await supabase
      .from('contacts')
      .select('id, name, title, company_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .in('company_id', signalCompanyIds)
      .limit(10)
    if (warmContacts && warmContacts.length > 0) {
      const seen = new Set<string>()
      for (const ct of warmContacts) {
        if (!ct.company_id) continue
        const sig = [...signals, ...patternAlerts].find(s => s.company_id === ct.company_id)
        if (!sig || !sig.companies) continue
        const key = `${ct.id}-${sig.id}`
        if (seen.has(key)) continue
        seen.add(key)
        warmPaths.push({
          contactId:   ct.id,
          contactName: ct.name,
          contactTitle: ct.title,
          companyId:   ct.company_id,
          companyName: sig.companies.name,
          signal:      sig,
        })
      }
      warmPaths = warmPaths.slice(0, 5)
    }
  }

  const contactCountMap = new Map<string, number>()
  for (const row of (contactRows ?? [])) {
    if (row.company_id) {
      contactCountMap.set(row.company_id, (contactCountMap.get(row.company_id) ?? 0) + 1)
    }
  }

  const briefedCompanyIds = new Set((briefedCompanyRows ?? []).map(b => b.company_id).filter(Boolean) as string[])
  const companiesWithoutContact = (allCompanies ?? []).filter(c => c.id && !contactCountMap.has(c.id))
  const companiesWithoutBrief   = (allCompanies ?? []).filter(c => c.id && !briefedCompanyIds.has(c.id))
  const numIntelGaps = [companiesWithoutContact.length > 0, (prospectContactCount ?? 0) > 0, companiesWithoutBrief.length > 0].filter(Boolean).length

  const filtered = companies ?? []
  const totalFiltered = filteredCount ?? 0
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE)
  const hasFilters = !!(q || stage)

  const greeting = greetingInTz(tz)
  const today = fullDateInTz(tz)

  const trialEndsAt = userRow?.trial_ends_at ? new Date(userRow.trial_ends_at) : null
  const isTrialing = userRow?.subscription_status === 'trialing'
  const isExecutive = userRow?.subscription_tier === 'executive'
  const isExecutivePreview = preview === 'executive-v2'
  const isExecutiveMode = isExecutive || isExecutivePreview
  const isCoach = userRow?.subscription_tier === 'coach'
  const staffMember = await getStaffMember(user.email ?? '')
  const isRothschildAdmin = hasAdminHeaderAccess(staffMember)
  const canUseOutreachHub = staffMember?.role === 'owner' || staffMember?.role === 'admin'
  const roleLensLabel = isRothschildAdmin
    ? 'Admin'
    : isPartner
      ? 'Partner'
      : isCoach
        ? 'Coach'
        : 'Executive'
  const trialDaysLeft = trialEndsAt
    ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  const profileSections = [
    { label: 'Identity',    done: !!profile?.full_name,                                                anchor: 'section-identity' },
    { label: 'Targets',     done: ((profile?.target_titles as string[] | null)?.length ?? 0) > 0,     anchor: 'section-targets' },
    { label: 'Resume',      done: (profile?.resume_text?.length ?? 0) >= 200,                          anchor: 'section-resume' },
    { label: 'Positioning', done: (profile?.positioning_summary?.length ?? 0) >= 50,                   anchor: 'section-positioning' },
    { label: 'Briefing',    done: !!profile?.briefing_time,                                             anchor: 'section-briefing' },
  ]
  const profileScore = Math.round((profileSections.filter(s => s.done).length / 5) * 100)
  const nextProfileSection = profileSections.find(s => !s.done)
  const profileHref = nextProfileSection
    ? `/dashboard/profile#${nextProfileSection.anchor}`
    : '/dashboard/profile'

  const stats = [
    { value: totalCount,   label: 'Companies',   alert: false,            amber: false,              href: '#pipeline' },
    { value: activeCount,  label: 'Active',       alert: false,            amber: activeCount > 0,    href: '#pipeline' },
    { value: signalCount,  label: 'Signals',      alert: false,            amber: signalCount > 0,    href: '/dashboard/signals' },
    { value: overdueCount, label: 'Due Today',    alert: overdueCount > 0, amber: false,             href: '/dashboard/calendar' },
  ]

  const offerCompany = !profile?.placed_at
    ? allList.find(c => c.stage === 'offer') ?? null
    : null
  const offerCompanies = allList.filter(c => c.stage === 'offer')
  const interviewingCompany = allList.find(c => c.stage === 'interviewing') ?? null

  const daysSinceOnboard = profile?.onboarding_completed_at
    ? Math.floor((Date.now() - new Date(profile.onboarding_completed_at).getTime()) / 86400000)
    : null
  const showWeek3Prompt = daysSinceOnboard !== null && daysSinceOnboard >= 18 && daysSinceOnboard <= 28
  const showNurtureWelcome  = isNurturePath              && totalCount === 0 && daysSinceOnboard !== null && daysSinceOnboard <= 7
  const showCampaignWelcome = searchPath === 'campaign'  && totalCount === 0 && daysSinceOnboard !== null && daysSinceOnboard <= 7
  const showWatcherWelcome  = searchPath === 'watcher'   && totalCount === 0 && daysSinceOnboard !== null && daysSinceOnboard <= 7

  const momentumScore = typeof momentumData?.momentum_score === 'number'
    ? momentumData.momentum_score
    : null
  const momentumStatus: 'low' | 'medium' | 'strong' = momentumScore !== null
    ? (momentumScore >= 70 ? 'strong' : momentumScore >= 40 ? 'medium' : 'low')
    : ((signalCount + overdueCount + activeCount) >= 3 ? 'strong' : (signalCount + overdueCount + activeCount) > 0 ? 'medium' : 'low')

  const relationshipAction: DailyMomentumAction = warmPaths[0]
    ? {
        id: 'relationship-action',
        track: 'relationship',
        title: `Work ${warmPaths[0].contactName} at ${warmPaths[0].companyName}`,
        body: `${warmPaths[0].signal.signal_summary} gives you a concrete reason to re-engage. Use that signal while it is still fresh.`,
        effortMinutes: 15,
        href: `/dashboard/contacts/${warmPaths[0].contactId}/outreach`,
        cta: 'Open outreach',
      }
    : overdueCount > 0
      ? {
          id: 'relationship-action',
          track: 'relationship',
          title: 'Clear the next relationship follow-up',
          body: 'A due follow-up is the cleanest way to recover momentum. Close one loop before you add anything new.',
          effortMinutes: 15,
          href: '/dashboard/calendar',
          cta: 'Open calendar',
        }
      : {
          id: 'relationship-action',
          track: 'relationship',
          title: 'Pick one warm relationship to move',
          body: 'Open contacts, choose one person who can unblock a real conversation, and schedule the next step.',
          effortMinutes: 15,
          href: '/dashboard/contacts',
          cta: 'Open contacts',
        }

  const readinessAction: DailyMomentumAction = interviewingCompany
    ? {
        id: 'readiness-action',
        track: 'readiness',
        title: `Generate prep for ${interviewingCompany.name}`,
        body: 'If you already have a live conversation, readiness work outranks almost everything else.',
        effortMinutes: 25,
        href: `/dashboard/companies/${interviewingCompany.id}/prep`,
        cta: 'Run prep brief',
      }
    : profileScore < 100
      ? {
          id: 'readiness-action',
          track: 'readiness',
          title: 'Tighten the profile inputs driving your search',
          body: 'Briefing quality, prep quality, and positioning all degrade when the profile is incomplete.',
          effortMinutes: 20,
          href: profileHref,
          cta: 'Finish profile',
        }
      : {
          id: 'readiness-action',
          track: 'readiness',
          title: 'Run one readiness pass before more outreach',
          body: 'Use the strategy layer to sharpen what you will say before the next live conversation opens.',
          effortMinutes: 20,
          href: '/dashboard/strategy',
          cta: 'Open strategy',
        }

  const focusAction: DailyMomentumAction = signalCount > 0
    ? {
        id: 'focus-action',
        track: 'focus',
        title: 'Review the freshest market signals',
        body: 'New signal density is highest-leverage when you turn it into a sharper outreach angle the same day.',
        effortMinutes: 15,
        href: '/dashboard/signals',
        cta: 'Open signals',
      }
    : totalCount < 12
      ? {
          id: 'focus-action',
          track: 'focus',
          title: 'Add one more target company',
          body: 'A thin pipeline creates pressure. Add one target with a real reason it belongs in the search.',
          effortMinutes: 15,
          href: '/dashboard/companies/new',
          cta: 'Add company',
        }
      : {
          id: 'focus-action',
          track: 'focus',
          title: 'Convert today into a concrete next step',
          body: 'If the pipeline already exists, pick the next visible move instead of expanding scope.',
          effortMinutes: 10,
          href: overdueCount > 0 ? '/dashboard/calendar' : '/dashboard/briefing',
          cta: overdueCount > 0 ? 'View due today' : 'Open briefing',
        }

  const dailyMomentumActions: DailyMomentumAction[] = [relationshipAction, readinessAction, focusAction]

  const sponsorCoveragePercent = totalCount > 0 ? Math.round((contactCountMap.size / totalCount) * 100) : 0
  const signalToActionPercent = signalCount > 0 ? Math.min(100, Math.round(((draftReadyCount ?? 0) / signalCount) * 100)) : 0
  const followUpSlaPercent = overdueCount === 0 ? 100 : Math.max(0, 100 - overdueCount * 15)
  const decisionLagDays = offerCompanies.length > 0 ? (daysSinceLastAction ?? 0) : null

  const executiveStageLabel = offerCompanies.length > 0
    ? 'Offer and Decision'
    : (activeCount > 0 || !!interviewingCompany)
      ? 'Interviewing and Conversion'
      : (totalCount > 0 && contactCount > 0)
        ? 'Market Activation'
        : totalCount > 0
          ? 'Target and Narrative Design'
          : 'Trigger and Identity Reset'

  const threatRiskHigh = (daysSinceLastAction ?? 0) >= 14 || (totalCount === 0 && (daysSinceOnboard ?? 0) > 7)
  const perfectionRiskHigh = profileScore < 80 && totalCount === 0 && (daysSinceOnboard ?? 0) > 5
  const isolationRiskHigh = totalCount >= 3 && sponsorCoveragePercent < 50
  const decisionRiskHigh = offerCompanies.length > 0 && (daysSinceLastAction ?? 0) >= 7

  const riskItems: Array<{
    id: string
    label: string
    level: 'low' | 'medium' | 'high'
    detail: string
    href: string
    cta: string
  }> = [
    {
      id: 'threat-state',
      label: 'Threat and uncertainty state',
      level: threatRiskHigh ? 'high' : (signalCount > 0 ? 'low' : 'medium'),
      detail: threatRiskHigh
        ? 'Activity decay suggests rising uncertainty. Use one concrete move to restore control today.'
        : 'Signal and action flow is stable enough to keep confidence anchored in execution.',
      href: '/dashboard/briefing',
      cta: 'Open daily briefing',
    },
    {
      id: 'perfection-loop',
      label: 'Perfection loop risk',
      level: perfectionRiskHigh ? 'high' : (profileScore < 100 ? 'medium' : 'low'),
      detail: perfectionRiskHigh
        ? 'You may be polishing inputs without enough market activation. Ship one outreach action.'
        : 'Profile quality is improving. Keep edits tied to live outreach outcomes.',
      href: profileScore < 100 ? '/dashboard/profile' : '/dashboard/strategy',
      cta: profileScore < 100 ? 'Finish profile inputs' : 'Run strategy brief',
    },
    {
      id: 'isolation-risk',
      label: 'Sponsor map depth',
      level: isolationRiskHigh ? 'high' : (sponsorCoveragePercent < 70 ? 'medium' : 'low'),
      detail: isolationRiskHigh
        ? 'Coverage is low for an executive search. Relationship depth is likely the bottleneck now.'
        : 'Sponsor coverage is trending in the right direction. Keep adding depth at top targets.',
      href: '/dashboard/contacts',
      cta: 'Expand sponsor map',
    },
    {
      id: 'decision-drag',
      label: 'Decision drag risk',
      level: decisionRiskHigh ? 'high' : (offerCompanies.length > 0 ? 'medium' : 'low'),
      detail: offerCompanies.length > 0
        ? 'Offer context exists. Decision quality drops when timeline and no-go criteria stay implicit.'
        : 'No active offer context. Keep criteria explicit before final-round intensity rises.',
      href: offerCompanies.length > 0 ? '/dashboard/offers' : '/dashboard/strategy',
      cta: offerCompanies.length > 0 ? 'Open offer compare' : 'Capture criteria',
    },
  ]

  const executivePrimaryRisk = (() => {
    if (decisionRiskHigh) return { label: 'Decision drag', level: 'high' as const, href: '/dashboard/offers', cta: 'Resolve tradeoffs' }
    if (isolationRiskHigh) return { label: 'Sponsor depth gap', level: 'high' as const, href: '/dashboard/contacts', cta: 'Add sponsors' }
    if (threatRiskHigh) return { label: 'Momentum decay', level: 'high' as const, href: '/dashboard/briefing', cta: 'Re-anchor today' }
    if (perfectionRiskHigh) return { label: 'Perfection loop', level: 'medium' as const, href: '/dashboard/profile', cta: 'Ship and move' }
    return { label: 'Managed', level: 'low' as const, href: '/dashboard/briefing', cta: 'Keep cadence' }
  })()

  const executiveDecisionBrief = (() => {
    if (offerCompanies.length > 0) {
      return {
        changed: `${offerCompanies.length} offer ${offerCompanies.length === 1 ? 'is' : 'are'} in play and decision pressure is rising.`,
        whyNow: 'Late-stage ambiguity increases regret risk more than almost any other phase.',
        recommendedMove: 'Run the offer comparison and lock explicit no-go criteria before new conversations start.',
        downsideIfDelayed: 'Decision lag weakens negotiation leverage and increases reactive choices.',
        href: '/dashboard/offers',
        cta: 'Run offer comparison',
      }
    }

    if (signalCount > 0) {
      return {
        changed: `${signalCount} fresh market signal${signalCount === 1 ? '' : 's'} landed this week.`,
        whyNow: 'Signal freshness decays quickly unless converted to relationship action.',
        recommendedMove: 'Convert one high-relevance signal into a warm outreach draft today.',
        downsideIfDelayed: 'You lose timing edge and return to generic outreach.',
        href: '/dashboard/signals',
        cta: 'Convert strongest signal',
      }
    }

    if (overdueCount > 0) {
      return {
        changed: `${overdueCount} follow-up ${overdueCount === 1 ? 'is' : 'are'} overdue.`,
        whyNow: 'At executive level, delay is often interpreted as loss of conviction.',
        recommendedMove: 'Clear the next due relationship action before adding new scope.',
        downsideIfDelayed: 'Pipeline credibility drops and conversation velocity slows.',
        href: '/dashboard/calendar',
        cta: 'Clear overdue now',
      }
    }

    return {
      changed: 'No urgent blockers, but sponsor depth and cadence still determine outcomes.',
      whyNow: 'Quiet weeks are where high-quality systems get built.',
      recommendedMove: 'Add one sponsor at a priority company and schedule one next step.',
      downsideIfDelayed: 'Momentum looks stable but conversion quality erodes over time.',
      href: '/dashboard/contacts',
      cta: 'Strengthen sponsor map',
    }
  })()

  const offerCockpit = {
    show: offerCompanies.length > 0,
    offerCount: offerCompanies.length,
    offerCompanyName: offerCompany?.name ?? null,
    contextSignals: [
      { label: 'Role thesis clarity', ok: (profile?.positioning_summary?.length ?? 0) >= 80 },
      { label: 'Context constraints captured', ok: !!profile?.briefing_timezone },
      { label: 'Sponsor confirmation path', ok: sponsorCoveragePercent >= 50 },
    ],
  }

  const setupSteps = [
    { done: activation.a1_resume,    label: 'Upload your resume or import LinkedIn', sub: 'Drives every brief, every briefing, and every AI response you get.',                                                         href: '/dashboard/profile',        cta: 'Go to profile' },
    { done: activation.a2_company,   label: 'Add your first target company',         sub: 'Include the career page URL - we scan it within minutes and alert you to matching roles.',                                   href: '/dashboard/companies/new',  cta: 'Add a company' },
    { done: activation.a3_prep_brief,label: 'Generate your first prep brief',        sub: 'Open any target company and run the brief. Leadership signals, likely objections, best outreach angle.',                     href: '/dashboard',      cta: 'Go to companies' },
    { done: activation.a4_contact,   label: 'Add your first contact',                sub: 'Who do you know at target companies? Roles at this level fill through relationships, not applications.',                     href: '/dashboard/contacts',       cta: 'Add a contact' },
    { done: activation.a5_briefing,  label: 'Set up your daily briefing',            sub: 'Signals and due actions in your inbox before you start work.',                                                               href: '/dashboard/profile',        cta: 'Configure briefing' },
    { done: activation.a6_follow_up, label: 'Log your first follow-up reminder',     sub: 'The difference between an active search and a passive one is whether the next action is scheduled.',                        href: '/dashboard/contacts',       cta: 'Go to contacts' },
  ]

  // Post-placement: Career Intelligence mode
  if (profile?.placed_at) {
    const placedCompany = profile?.placement_company
    const isPaid = userRow?.subscription_status === 'active'
    const tier = userRow?.subscription_tier ?? 'free'
    return (
      <DashboardPostPlacementView
        greeting={greeting}
        firstName={firstName}
        today={today}
        placedCompany={placedCompany}
        isPaid={isPaid}
        tier={tier}
        totalCount={totalCount}
        allList={allList}
        canUseOutreachHub={canUseOutreachHub}
        isRothschildAdmin={isRothschildAdmin}
        profileNameOrEmail={profile?.full_name ?? user.email ?? ''}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* Nav */}
      <header className="bg-slate-900">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center gap-4 sm:gap-6">
          <span className="text-[13px] font-bold tracking-[0.16em] uppercase text-slate-400 shrink-0">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4 flex-1">
            <CmdKButton />
            <Link href="/dashboard/chat" className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Chat</Link>
            <Link href="/dashboard/contacts" className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Contacts</Link>
            <Link href="/dashboard/feedback" className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Feedback</Link>
            <Link href="/dashboard/briefing" className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Briefing</Link>
            <Link href="/dashboard/calendar" className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Calendar</Link>
            {canUseOutreachHub && (
              <Link href="/dashboard/outreach" className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Outreach</Link>
            )}
            <Link href="/optimize" className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">LinkedIn</Link>
            <Link href="/dashboard/invite" className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Invite</Link>
            <Link href="/guide" className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Guide</Link>
            <Link href="/dashboard/help" className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Help</Link>
            {isRothschildAdmin && (
              <Link href="/dashboard/admin" className="text-[13px] font-semibold text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap">Admin</Link>
            )}
            {isPartner && (
              <Link href="/dashboard/partner" className="text-[13px] font-semibold text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap">Partner</Link>
            )}
            <div className="ml-auto flex items-center gap-4 shrink-0">
              <Link href="/dashboard/profile" className="text-[13px] text-slate-300 hover:text-white transition-colors whitespace-nowrap">{profile?.full_name ?? user.email}</Link>
              <Link href="/settings/billing" className="text-[13px] text-slate-300 hover:text-white transition-colors whitespace-nowrap">Billing</Link>
              <LogoutButton label="Sign out" />
            </div>
          </div>
          {/* Mobile nav */}
          <div className="flex sm:hidden items-center gap-2 ml-auto">
            <Link
              href="/dashboard/briefing"
              className="inline-flex min-h-[44px] items-center rounded-md border border-slate-700 px-3 text-[13px] font-semibold text-slate-200 hover:text-white hover:border-slate-500"
            >
              Briefing
            </Link>
            <LogoutButton label="Sign out" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-10">
        <DashboardTopShellSection
          greeting={greeting}
          firstName={firstName}
          today={today}
          signalCount={signalCount}
          overdueCount={overdueCount}
          canUseOutreachHub={canUseOutreachHub}
          isRothschildAdmin={isRothschildAdmin}
          dailyMomentumActions={dailyMomentumActions}
          todayISO={todayISO}
          momentumStatus={momentumStatus}
          profileSaved={!!profile_saved}
          isTrialing={isTrialing}
          trialDaysLeft={trialDaysLeft}
          totalCount={totalCount}
          offerCount={offerCompanies.length}
          offerName={offerCompanies[0]?.name ?? null}
          offerCompanyName={offerCompany?.name ?? null}
          onMarkPlaced={markPlaced}
          activationComplete={activation.isComplete}
          activationCompletedCount={activation.completedCount}
          isExecutiveMode={isExecutiveMode}
          isExecutivePreview={isExecutivePreview}
          executiveStageLabel={executiveStageLabel}
          executivePrimaryRisk={executivePrimaryRisk}
          executiveDecisionBrief={executiveDecisionBrief}
        />

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[13px] font-bold tracking-[0.14em] uppercase text-slate-500">Campaign health</p>
              <h2 className="text-[20px] font-bold text-slate-900 mt-1">{campaignHealthScore}/100 <span className="text-[13px] font-semibold text-slate-500">{campaignHealthBand}</span></h2>
              <p className="text-[13px] text-slate-600 mt-1">Cadence, follow-through, and stage progression combined into one execution score.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center w-full sm:w-auto">
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[13px] uppercase tracking-[0.08em] text-slate-500 font-bold">Cadence</p>
                <p className="text-[16px] font-bold text-slate-900">{cadenceScore}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[13px] uppercase tracking-[0.08em] text-slate-500 font-bold">Follow-through</p>
                <p className="text-[16px] font-bold text-slate-900">{followThroughScore}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[13px] uppercase tracking-[0.08em] text-slate-500 font-bold">Conversion</p>
                <p className="text-[16px] font-bold text-slate-900">{conversionScore}</p>
              </div>
            </div>
          </div>

          {topStalledCampaigns.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-[13px] font-bold tracking-[0.1em] uppercase text-amber-800 mb-2">Stalled alerts</p>
              <ul className="space-y-1.5">
                {topStalledCampaigns.map((item) => (
                  <li key={item.id} className="text-[13px] text-amber-900">
                    <span className="font-semibold">{item.name}</span> has been idle for {item.daysStalled} days.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <DashboardDecisionTimelineSection
          roleLensLabel={roleLensLabel}
          items={decisionTimelineItems}
          stalledCount={stalledCampaignRows.length}
          sort={timelineSort}
          page={safeTimelinePage}
          totalPages={timelineTotalPages}
          updateDecisionOwner={updateDecisionOwner}
        />

        <DashboardDisclosureSection
          id="profile-modules"
          title="Profile and intelligence modules"
          defaultOpen={focus === 'profile'}
        >
        <DashboardProfileIntelligenceSection
          profileScore={profileScore}
          profileHref={profileHref}
          nextProfileSection={nextProfileSection}
          onSaveQuickProfile={saveQuickProfile}
          quickProfileDefaults={{
            fullName: profile?.full_name ?? '',
            currentTitle: profile?.current_title ?? '',
            positioningSummary: profile?.positioning_summary ?? '',
          }}
          stats={stats}
          totalCount={totalCount}
          contactCoverageCount={contactCountMap.size}
          numIntelGaps={numIntelGaps}
          companiesWithoutContact={companiesWithoutContact.map(c => ({ name: c.name }))}
          prospectContactCount={prospectContactCount ?? 0}
          companiesWithoutBrief={companiesWithoutBrief.map(c => ({ name: c.name }))}
          opportunityRadar={<OpportunityRadar />}
          isExecutiveMode={isExecutiveMode}
        />

        </DashboardDisclosureSection>

        <DashboardWelcomeNudgeSection
          showNurtureWelcome={showNurtureWelcome}
          showCampaignWelcome={showCampaignWelcome}
          showWatcherWelcome={showWatcherWelcome}
          stallNudge={stallNudge}
          onDismissStallNudge={dismissStallNudge}
        />

        <DashboardDisclosureSection
          id="advanced-modules"
          title="Weekly performance and advanced modules"
          defaultOpen={focus === 'advanced'}
        >
        {/* Mobile contract anchor: grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3 */}
        <DashboardAdvancedModulesSection
          weeklyGoal={profile?.weekly_goal ?? null}
          outreachThisWeek={outreachThisWeek ?? 0}
          onSaveWeeklyGoal={saveWeeklyGoal}
          momentumData={(momentumData as { momentum_score: number | null; momentum_computed_at: string | null } | null) ?? null}
          daysSinceLastAction={daysSinceLastAction}
          weekSlots={weekSlots}
          velocityRows={velocityRows}
          isCoach={isCoach}
          initialFrequency={profile?.briefing_frequency === 'weekly' ? 'weekly' : 'daily'}
          initialBriefingTime={profile?.briefing_time ?? null}
          isPaused={userRow?.subscription_status === 'paused'}
          todayISO={todayISO}
          followUps={(followUps ?? []) as Array<{ id: string; due_date: string; action: string; companies: { name: string } | null }>}
          warmPaths={warmPaths}
          patternAlerts={patternAlerts}
          signals={signals}
          activationComplete={activation.isComplete}
          hasFilters={hasFilters}
          setupSteps={setupSteps}
          totalCount={totalCount}
          isExecutive={isExecutive}
          signalCount={signalCount}
          draftReadyCount={draftReadyCount ?? 0}
          overdueCount={overdueCount}
          activeCount={activeCount}
          isExecutiveMode={isExecutiveMode}
          executiveStageLabel={executiveStageLabel}
          riskItems={riskItems}
          offerCockpit={offerCockpit}
          signalToActionPercent={signalToActionPercent}
          followUpSlaPercent={followUpSlaPercent}
          sponsorCoveragePercent={sponsorCoveragePercent}
          decisionLagDays={decisionLagDays}
        />

        </DashboardDisclosureSection>

        {/* Pipeline */}
        <DashboardPipelineSection
          q={q ?? ''}
          stage={stage ?? ''}
          page={page}
          start={start}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          totalFiltered={totalFiltered}
          totalPages={totalPages}
          hasFilters={hasFilters}
          filtered={filtered}
          contactCountMap={contactCountMap}
          stageMap={STAGE}
          stageOptions={Object.entries(STAGE).map(([key, { label }]) => ({ key, label }))}
          activationResumeDone={activation.a1_resume}
          showWrapUpLink={!profile?.placed_at && (isTrialing || userRow?.subscription_status === 'active')}
        />
      </main>
      <HelpQuickButton source="dashboard" />
    </div>
  )
}
