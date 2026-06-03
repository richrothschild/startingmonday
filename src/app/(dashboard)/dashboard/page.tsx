import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { todayInTz, greetingInTz, fullDateInTz } from '@/lib/date'
import { getActivationStatus } from '@/lib/activation'
import { resolveCareerMode } from '@/lib/career-mode'
import { LogoutButton } from './logout-button'
import { SuggestionCards } from '@/components/SuggestionCards'
import { NextBestActionPrompt } from '@/components/NextBestActionPrompt'
import { HelpQuickButton } from '@/components/HelpQuickButton'
import { SearchControlsPanel } from '@/components/SearchControlsPanel'
import { CmdKButton } from '@/components/CmdKButton'
import { saveQuickProfile, saveWeeklyGoal, dismissStallNudge } from './profile/actions'
import { markPlaced } from './placed/actions'
import { OpportunityRadar } from './opportunity-radar'
import { ActivityChart, type WeekActivity } from '@/components/ActivityChart'
import { PipelineVelocity, type VelocityRow } from '@/components/PipelineVelocity'
import { DailyMomentumPlan, type DailyMomentumAction } from '@/components/DailyMomentumPlan'
import { getStaffMember, hasAdminHeaderAccess } from '@/lib/staff'
import { DashboardIntelSetupSections } from './dashboard-intel-setup-sections'
import { DashboardPipelineSection } from './dashboard-pipeline-section'
import { DashboardDisclosureSection } from './dashboard-disclosure-section'
import { DashboardPrimaryNavSections } from './dashboard-primary-nav-sections'
import { DashboardPathWelcomeCard } from './dashboard-path-welcome-card'
import { DashboardWeeklyPerformanceSection } from './dashboard-weekly-performance-section'
import { DashboardPipelinePulse } from './dashboard-pipeline-pulse'
import { DashboardStatusBanners } from './dashboard-status-banners'
import { DashboardProfileIntelligenceSection } from './dashboard-profile-intelligence-section'
import { bumpWeek, getWeekMonday, weekLabel } from './dashboard-week-utils'

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
  searchParams: Promise<{ q?: string; stage?: string; page?: string; profile_saved?: string; focus?: string }>
}) {
  const { q, stage, page: pageParam, profile_saved, focus } = await searchParams
  const page = Math.max(0, parseInt(pageParam ?? '0', 10) || 0)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
    .select('id, stage, name')
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
  const isCoach = userRow?.subscription_tier === 'coach'
  const staffMember = await getStaffMember(user.email ?? '')
  const isRothschildAdmin = hasAdminHeaderAccess(staffMember)
  const canUseOutreachHub = staffMember?.role === 'owner' || staffMember?.role === 'admin'
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
      <div className="min-h-screen bg-slate-100 font-sans">
        <header className="bg-slate-900">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center gap-4 sm:gap-6">
            <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 shrink-0">
              <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
            </span>
            <div className="hidden sm:flex items-center gap-4 flex-1">
              <Link href="/dashboard/contacts" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Contacts</Link>
              <Link href="/dashboard/chat" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Chat</Link>
              <Link href="/dashboard/feedback" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Feedback</Link>
              {canUseOutreachHub && (
                <Link href="/dashboard/outreach" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Outreach</Link>
              )}
              <div className="ml-auto flex items-center gap-4 shrink-0">
                <Link href="/dashboard" className="text-[12px] font-semibold text-orange-300 hover:text-white transition-colors whitespace-nowrap border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 rounded-full">Dashboard</Link>
                <Link href="/dashboard/profile" className="text-[12px] text-slate-300 hover:text-white transition-colors">{profile?.full_name ?? user.email}</Link>
                <Link href="/settings/billing" className="text-[12px] text-slate-300 hover:text-white transition-colors">Billing</Link>
                {isRothschildAdmin && (
                  <Link href="/dashboard/admin" className="text-[12px] font-semibold text-orange-300 hover:text-white transition-colors whitespace-nowrap border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 rounded-full">Admin</Link>
                )}
                <LogoutButton label="Sign out" />
              </div>
            </div>
            <div className="flex sm:hidden items-center gap-2 ml-auto">
              <Link
                href="/dashboard"
                className="inline-flex min-h-[44px] items-center rounded-md border border-orange-500/40 bg-orange-500/10 px-3 text-[12px] font-semibold text-orange-300 hover:text-white"
              >
                Dashboard
              </Link>
              <LogoutButton label="Sign out" />
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-10">
<div className="mb-8">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Career Intelligence</p>
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight">
              {greeting}, {firstName}.
            </h1>
            <p className="text-[13px] text-slate-500 mt-1.5">{today}</p>
          </div>

          {/* Placement banner */}
          <div className="bg-white border border-slate-200 rounded p-6 mb-6">
            <p className="text-[13px] font-semibold text-slate-900 mb-1">
              {placedCompany ? `You placed at ${placedCompany}.` : 'Your search is complete.'}
            </p>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
              Your companies, contacts, and research history are all here. Your weekly intelligence digest is running -- you will hear from us every Monday.
            </p>
            {isPaid && tier !== 'passive' && tier !== 'free' ? (
              <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded mb-4">
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-slate-900 mb-0.5">Stay sharp at $49/mo</p>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    Switch to Intelligence for ongoing market monitoring without active search tools. Most executives search again within 3 years.
                  </p>
                </div>
                <Link
                  href="/settings/billing"
                  className="shrink-0 text-[12px] font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors px-4 py-2 rounded"
                >
                  Review options
                </Link>
              </div>
            ) : !isPaid ? (
              <Link
                href="/settings/billing"
                className="inline-block text-[13px] font-semibold text-slate-700 border border-slate-200 rounded px-4 py-2 hover:bg-slate-50 transition-colors"
              >
                Keep your intelligence running -- subscribe to Intelligence ($49/mo)
              </Link>
            ) : null}
          </div>

          {/* Company watchlist */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
            <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                Your Companies ({totalCount})
              </span>
              <Link href="/dashboard" className="text-[12px] text-slate-500 hover:text-slate-700 transition-colors">
                Manage
              </Link>
            </div>
            {allList.length === 0 ? (
              <p className="px-6 py-8 text-[13px] text-slate-400">No companies in your list yet.</p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {allList.slice(0, 20).map(c => (
                  <li key={c.name} className="px-6 py-3 flex items-center justify-between">
                    <span className="text-[13px] text-slate-700">{c.name}</span>
                    <span className="text-[11px] text-slate-400 capitalize">{c.stage}</span>
                  </li>
                ))}
                {allList.length > 20 && (
                  <li className="px-6 py-3 text-[12px] text-slate-400">
                    +{allList.length - 20} more. <Link href="/dashboard" className="underline">View all</Link>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Contacts and chat links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/dashboard/contacts" className="bg-white border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
              <p className="text-[13px] font-semibold text-slate-900 mb-1">Contacts</p>
              <p className="text-[12px] text-slate-400 leading-relaxed">Your network at target companies.</p>
            </Link>
            <Link href="/dashboard/chat" className="bg-white border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
              <p className="text-[13px] font-semibold text-slate-900 mb-1">Career Advisor</p>
              <p className="text-[12px] text-slate-400 leading-relaxed">Ask anything about your next move.</p>
            </Link>
            {canUseOutreachHub && (
              <Link href="/dashboard/outreach" className="bg-white border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
                <p className="text-[13px] font-semibold text-slate-900 mb-1">Outreach Hub</p>
                <p className="text-[12px] text-slate-400 leading-relaxed">Send queue, follow-ups, and personalized prospects.</p>
              </Link>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link href="/dashboard/profile" className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
              Update your profile
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* Nav */}
      <header className="bg-slate-900">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center gap-4 sm:gap-6">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 shrink-0">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4 flex-1">
            <CmdKButton />
            <Link href="/dashboard/chat" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Chat</Link>
            <Link href="/dashboard/contacts" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Contacts</Link>
            <Link href="/dashboard/feedback" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Feedback</Link>
            <Link href="/dashboard/briefing" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Briefing</Link>
            <Link href="/dashboard/calendar" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Calendar</Link>
            {canUseOutreachHub && (
              <Link href="/dashboard/outreach" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Outreach</Link>
            )}
            <Link href="/optimize" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">LinkedIn</Link>
            <Link href="/dashboard/invite" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Invite</Link>
            <Link href="/guide" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Guide</Link>
            <Link href="/dashboard/help" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Help</Link>
            {isRothschildAdmin && (
              <Link href="/dashboard/admin" className="text-[12px] font-semibold text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap">Admin</Link>
            )}
            {isPartner && (
              <Link href="/dashboard/partner" className="text-[12px] font-semibold text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap">Partner</Link>
            )}
            <div className="ml-auto flex items-center gap-4 shrink-0">
              <Link href="/dashboard/profile" className="text-[12px] text-slate-300 hover:text-white transition-colors whitespace-nowrap">{profile?.full_name ?? user.email}</Link>
              <Link href="/settings/billing" className="text-[12px] text-slate-300 hover:text-white transition-colors whitespace-nowrap">Billing</Link>
              <LogoutButton label="Sign out" />
            </div>
          </div>
          {/* Mobile nav */}
          <div className="flex sm:hidden items-center gap-2 ml-auto">
            <Link
              href="/dashboard/briefing"
              className="inline-flex min-h-[44px] items-center rounded-md border border-slate-700 px-3 text-[12px] font-semibold text-slate-200 hover:text-white hover:border-slate-500"
            >
              Briefing
            </Link>
            <LogoutButton label="Sign out" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-10">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-[22px] sm:text-[26px] font-bold text-slate-900 leading-tight">
            {greeting}, {firstName}.
          </h1>
          <p className="text-[13px] text-slate-600 mt-1.5">{today}</p>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed max-w-[38ch]">
            Start with the briefing, then work the next relationship and the next action.
          </p>
        </div>

        <DashboardPrimaryNavSections
          signalCount={signalCount}
          overdueCount={overdueCount}
          canUseOutreachHub={canUseOutreachHub}
          isRothschildAdmin={isRothschildAdmin}
        />

        <DailyMomentumPlan
          actions={dailyMomentumActions}
          dateKey={todayISO}
          status={momentumStatus}
        />

        {/* Profile quick-save confirmation */}
        {profile_saved && (
          <div className="mb-6 px-5 py-3 rounded bg-green-50 border border-green-200 text-[13px] text-green-800 flex items-center justify-between gap-4">
            <span>Profile updated. Your briefs and coaching will reflect this now.</span>
            <Link href="/dashboard/profile" className="font-semibold underline shrink-0">
              Finish profile
            </Link>
          </div>
        )}

        <DashboardStatusBanners
          isTrialing={isTrialing}
          trialDaysLeft={trialDaysLeft}
          totalCount={totalCount}
          offerCount={offerCompanies.length}
          offerName={offerCompanies[0]?.name ?? null}
          offerCompanyName={offerCompany?.name ?? null}
          onMarkPlaced={markPlaced}
          activationComplete={activation.isComplete}
          activationCompletedCount={activation.completedCount}
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
        />

        </DashboardDisclosureSection>

        {/* Nurture path welcome card � first 7 days, empty pipeline, between-roles user */}
        {showNurtureWelcome && (
          <DashboardPathWelcomeCard
            id="nurture-welcome"
            eyebrow="Your search starts here"
            title="You don't have to have it all figured out today."
            body="Do one focused action today. Consistency beats scattered effort."
            prompt="One thing to do right now:"
            ctaHref="/dashboard/companies/new"
            ctaLabel="Add the first company you want to work for ->"
            footer="You can come back for the rest. The system will be here."
          />
        )}

        {/* Campaign path welcome � first 7 days, empty pipeline */}
        {showCampaignWelcome && (
          <DashboardPathWelcomeCard
            id="campaign-welcome"
            eyebrow="Campaign mode"
            title="Your target list is the campaign."
            body="Most executive roles are filled through relationships before posting. Start tracking target companies early."
            prompt="Start here: add the companies you already have a relationship or contact at."
            ctaHref="/dashboard/companies/new"
            ctaLabel="Add your first target company ->"
            footer="Aim for 10 to 15 companies. Add career URLs as you go."
          />
        )}

        {/* Watcher path welcome � first 7 days, empty pipeline */}
        {showWatcherWelcome && (
          <DashboardPathWelcomeCard
            id="watcher-welcome"
            eyebrow="Market intelligence"
            title="You don't have to be searching to stay ready."
            body="Stay ready by tracking the right companies before you need to move."
            prompt="Add the companies you would say yes to and let the platform do the watching."
            ctaHref="/dashboard/companies/new"
            ctaLabel="Add a company to watch ->"
            footer="No pressure to act now. You will know when timing shifts."
          />
        )}

        {/* Persistent Next Best Action Prompt */}
        {stallNudge ? (
          <div className="relative">
            <NextBestActionPrompt action={stallNudge.action} href={stallNudge.href} description={stallNudge.headline + ' ' + stallNudge.body} source="stall_nudge" />
            <form action={dismissStallNudge} className="absolute top-2 right-2">
              <button
                type="submit"
                className="text-[12px] text-amber-600 hover:text-amber-900 bg-transparent border-0 cursor-pointer p-1 transition-colors"
                aria-label="Dismiss"
              >
                ?
              </button>
            </form>
          </div>
        ) : (
          <NextBestActionPrompt
            action="Open your daily briefing"
            href="/dashboard/briefing"
            description="Start with your daily briefing to see signals, due actions, and your top priorities."
            source="dashboard_default"
          />
        )}

        <DashboardDisclosureSection
          id="advanced-modules"
          title="Weekly performance and advanced modules"
          defaultOpen={focus === 'advanced'}
        >

        {/* Mobile contract anchor: grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3 */}
        <DashboardWeeklyPerformanceSection
          weeklyGoal={profile?.weekly_goal ?? null}
          outreachThisWeek={outreachThisWeek ?? 0}
          onSaveWeeklyGoal={saveWeeklyGoal}
          momentumData={(momentumData as { momentum_score: number | null; momentum_computed_at: string | null } | null) ?? null}
          daysSinceLastAction={daysSinceLastAction}
          weekSlots={weekSlots}
          velocityRows={velocityRows}
          isCoach={isCoach}
        />

        <SearchControlsPanel
          initialFrequency={profile?.briefing_frequency === 'weekly' ? 'weekly' : 'daily'}
          initialBriefingTime={profile?.briefing_time ?? null}
          isPaused={userRow?.subscription_status === 'paused'}
        />

        <DashboardIntelSetupSections
          todayISO={todayISO}
          followUps={(followUps ?? []) as Array<{ id: string; due_date: string; action: string; companies: { name: string } | null }>}
          warmPaths={warmPaths}
          patternAlerts={patternAlerts}
          signals={signals}
          activation={{ isComplete: activation.isComplete }}
          hasFilters={hasFilters}
          setupSteps={setupSteps}
        />

        {/* Suggestions - shown until dismissed or pipeline grows */}
        {totalCount < 5 && !hasFilters && <SuggestionCards />}

        <DashboardPipelinePulse
          isExecutive={isExecutive}
          signalCount={signalCount}
          draftReadyCount={draftReadyCount ?? 0}
          overdueCount={overdueCount}
          activeCount={activeCount}
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
