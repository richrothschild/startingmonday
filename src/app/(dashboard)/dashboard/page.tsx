import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { todayInTz, greetingInTz, fullDateInTz } from '@/lib/date'
import { getActivationStatus } from '@/lib/activation'
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
  searchParams: Promise<{ q?: string; stage?: string; page?: string; profile_saved?: string }>
}) {
  const { q, stage, page: pageParam, profile_saved } = await searchParams
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

        <section className="mb-6 bg-slate-50 border border-slate-200 rounded p-4">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Jump to section</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
            <a href="#quick-access" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Quick access</a>
            <a href="#start-here" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Start here</a>
            <a href="#momentum-overview" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Momentum</a>
            <a href="#pipeline-pulse" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Pipeline</a>
          </div>
        </section>

        <section id="quick-access" className="mb-6 bg-slate-900 rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-400 mb-1">Quick access</h2>
            <p className="text-[13px] text-slate-300">Jump to the places you use most.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/briefing" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-200 hover:text-white border border-orange-500/40 bg-orange-500/15 px-3.5 py-2 rounded-full shadow-sm">
              Briefing
            </Link>
            {canUseOutreachHub && (
              <Link href="/dashboard/outreach" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-200 hover:text-white border border-orange-500/40 bg-orange-500/15 px-3.5 py-2 rounded-full shadow-sm">
                Outreach
              </Link>
            )}
            {isRothschildAdmin && (
              <Link href="/dashboard/admin" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-200 hover:text-white border border-orange-500/40 bg-orange-500/15 px-3.5 py-2 rounded-full shadow-sm">
                Admin
              </Link>
            )}
          </div>
        </section>

        <section id="start-here" className="mb-6 bg-white border border-slate-200 rounded p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">Start Here</h2>
            <p className="text-[14px] font-semibold text-slate-900">Open your daily briefing first.</p>
            <p className="text-[12px] text-slate-600 leading-relaxed mt-1">
              {signalCount} new signals, {overdueCount} due today. Use the briefing to pick your top three actions.
            </p>
          </div>
          <div className="flex flex-col w-full sm:w-auto sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/dashboard/briefing"
              className="inline-flex min-h-[44px] items-center justify-center bg-slate-900 text-white text-[13px] font-semibold px-4 py-2 rounded hover:bg-slate-700 transition-colors"
            >
              Open briefing
            </Link>
            <Link
              href="/dashboard/calendar"
              className="inline-flex min-h-[44px] items-center justify-center border border-slate-300 text-slate-700 text-[13px] font-semibold px-4 py-2 rounded hover:border-slate-400 transition-colors"
            >
              View due today
            </Link>
            <Link
              href="/guide"
              className="inline-flex min-h-[44px] items-center justify-center border border-slate-300 text-slate-700 text-[13px] font-semibold px-4 py-2 rounded hover:border-slate-400 transition-colors"
            >
              Open guide
            </Link>
          </div>
        </section>

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

        {/* Trial banner */}
        {isTrialing && (
          <div className={`mb-6 px-5 py-3 rounded flex items-center justify-between gap-4 text-[13px] ${
            trialDaysLeft <= 3
              ? 'bg-red-50 border border-red-200 text-red-800'
              : trialDaysLeft <= 7
                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                : 'bg-slate-100 border border-slate-200 text-slate-600'
          }`}>
            <span>
              {trialDaysLeft <= 0
                ? 'Your trial has ended. The signal history on your companies is paused.'
                : totalCount > 0
                  ? `You have built a pipeline of ${totalCount} ${totalCount === 1 ? 'company' : 'companies'}. That signal history disappears in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}.`
                  : `Trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}.`
              }
            </span>
            <Link href="/settings/billing" className="font-semibold underline shrink-0">
              Upgrade
            </Link>
          </div>
        )}

        {/* Offers in flight - shown whenever there's an active offer */}
        {allList.some(c => c.stage === 'offer') && (
          <div className="mb-6 px-5 py-3.5 rounded bg-green-50 border border-green-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-[13px] font-semibold text-green-900">
                {allList.filter(c => c.stage === 'offer').length === 1
                  ? `${allList.find(c => c.stage === 'offer')!.name} - offer in hand`
                  : `${allList.filter(c => c.stage === 'offer').length} offers in flight`}
              </span>
            </div>
            <Link href="/dashboard/offers" className="text-[12px] font-semibold text-green-700 hover:text-green-900 shrink-0">
              Compare &amp; negotiate ?
            </Link>
          </div>
        )}

        {/* Placement prompt -- shown when an offer-stage company exists and not yet placed */}
        {offerCompany && (
          <div className="mb-6 bg-green-900 rounded px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[14px] font-bold text-white">Did you accept the offer?</p>
              <p className="text-[12px] text-green-300 mt-0.5">Mark your search complete and we will take care of the rest.</p>
            </div>
            <form action={markPlaced} className="flex items-center gap-2 shrink-0">
              <input type="hidden" name="company" value={offerCompany.name} />
              <button
                type="submit"
                className="bg-white text-slate-900 text-[13px] font-bold px-5 py-2 rounded cursor-pointer border-0 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Yes, I accepted
              </button>
              <Link href="/dashboard" className="text-[12px] text-green-400 hover:text-green-200 transition-colors whitespace-nowrap">
                Not yet
              </Link>
            </form>
          </div>
        )}

        {/* Activation progress */}
        {!activation.isComplete && (
          <div className="mb-6 bg-white border border-slate-200 rounded px-5 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-1 shrink-0">
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-5 rounded-full ${i < activation.completedCount ? 'bg-slate-900' : 'bg-slate-200'}`}
                  />
                ))}
              </div>
              <span className="text-[12px] text-slate-500 font-semibold shrink-0">
                {activation.completedCount} of 6 steps complete
              </span>
            </div>
            <Link href="/dashboard/start" className="text-[12px] font-semibold text-slate-900 hover:underline shrink-0">
              Finish setup ?
            </Link>
          </div>
        )}

        <details className="mb-6 sm:mb-8 bg-white border border-slate-200 rounded overflow-hidden">
          <summary className="cursor-pointer list-none px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500">Profile and intelligence modules</span>
            <span className="text-[11px] text-slate-400">Open</span>
          </summary>
          <div className="px-5 py-5">

        {/* Profile completeness score */}
        {profileScore < 100 && (
          <Link
            href={profileHref}
            className="mb-6 bg-white border border-slate-200 rounded p-5 flex items-center gap-5 hover:border-slate-400 transition-colors block"
          >
            <div className={`text-[40px] font-bold leading-none tabular-nums shrink-0 ${
              profileScore >= 80 ? 'text-emerald-600' :
              profileScore >= 40 ? 'text-amber-500' :
              'text-slate-400'
            }`}>
              {profileScore}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-900">
                {profileScore >= 80 ? 'Profile nearly complete' :
                 profileScore >= 40 ? 'Profile in progress' :
                 'Complete your profile to unlock better briefs'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Profile score &middot; {nextProfileSection ? `${nextProfileSection.label} is next` : 'All sections done'}
              </div>
            </div>
            <span className="text-[12px] font-semibold text-slate-500 shrink-0">
              {nextProfileSection ? `Complete ${nextProfileSection.label} ?` : 'View profile ?'}
            </span>
          </Link>
        )}

        {/* Quick profile shortcut - shown when profile is very thin */}
        {profileScore < 40 && (
          <section className="mb-6 bg-slate-900 rounded p-5 sm:p-6">
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">
              Quick start
            </h2>
            <p className="text-[13px] text-slate-300 mb-4">
              3 fields. Unlocks your first prep brief in under 3 minutes.
            </p>
            <form action={saveQuickProfile} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  name="full_name"
                  type="text"
                  required
                  defaultValue={profile?.full_name ?? ''}
                  placeholder="Your full name"
                  className="w-full border border-slate-700 rounded px-3 py-2.5 text-[14px] text-white bg-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
                />
                <input
                  name="current_title"
                  type="text"
                  defaultValue={profile?.current_title ?? ''}
                  placeholder="Current or most recent title"
                  className="w-full border border-slate-700 rounded px-3 py-2.5 text-[14px] text-white bg-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
                />
              </div>
              <input
                name="positioning_summary"
                type="text"
                defaultValue={profile?.positioning_summary ?? ''}
                placeholder="One sentence: what you do and what you're targeting next"
                className="w-full border border-slate-700 rounded px-3 py-2.5 text-[14px] text-white bg-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold px-5 py-2 rounded transition-colors cursor-pointer border-0"
                >
                  Save and continue
                </button>
                <Link href="/dashboard/profile" className="text-[12px] text-slate-400 hover:text-slate-200">
                  Full profile ?
                </Link>
              </div>
            </form>
          </section>
        )}

        {/* Stats */}
        <div id="momentum-overview" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map(({ value, label, alert, amber, href }) => {
            const inner = (
              <>
                <div className={`text-[22px] sm:text-[28px] font-bold leading-none ${alert ? 'text-red-700' : amber ? 'text-amber-600' : 'text-slate-900'}`}>
                  {value}
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">
                  {label}
                </div>
              </>
            )
            return href ? (
              <Link key={label} href={href} className="bg-white border border-slate-200 rounded p-3 sm:p-5 hover:border-slate-400 transition-colors">
                {inner}
              </Link>
            ) : (
              <div key={label} className="bg-white border border-slate-200 rounded p-3 sm:p-5">
                {inner}
              </div>
            )
          })}
        </div>

        {/* Network health: surfaces coverage gaps when < 50% of companies have a contact */}
        {totalCount >= 3 && contactCountMap.size < totalCount && (contactCountMap.size / totalCount) < 0.5 && (
          <Link
            href="/dashboard/contacts"
            className="mb-6 sm:mb-8 bg-white border border-slate-200 rounded p-5 flex items-center gap-5 hover:border-slate-400 transition-colors block"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-900">
                {contactCountMap.size} of {totalCount} companies have a contact
              </p>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Roles at this level fill through relationships. Add contacts at your top targets.
              </p>
            </div>
            <span className="text-[12px] font-semibold text-slate-500 shrink-0">Add contacts ?</span>
          </Link>
        )}

        {/* Proactive intelligence cards � pipeline gap summary */}
        {totalCount >= 3 && numIntelGaps > 0 && (
          <section id="attention-gaps" className="mb-6 sm:mb-8">
            <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">What needs attention</h2>
            <div className={`grid grid-cols-1 gap-3 ${numIntelGaps === 2 ? 'sm:grid-cols-2' : numIntelGaps >= 3 ? 'sm:grid-cols-3' : ''}`}>
              {companiesWithoutContact.length > 0 && (
                <Link href="/dashboard/contacts/new" className="bg-white border border-slate-200 rounded p-4 hover:border-slate-400 transition-colors block">
                  <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">{companiesWithoutContact.length}</div>
                  <div className="text-[13px] font-semibold text-slate-700 mb-1.5">
                    {companiesWithoutContact.length === 1 ? 'company' : 'companies'} with no contact
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {companiesWithoutContact.slice(0, 2).map(c => c.name).join(', ')}
                    {companiesWithoutContact.length > 2 ? ` +${companiesWithoutContact.length - 2} more` : ''}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Add contacts &rarr;</span>
                </Link>
              )}
              {(prospectContactCount ?? 0) > 0 && (
                <Link href="/dashboard/contacts" className="bg-white border border-slate-200 rounded p-4 hover:border-slate-400 transition-colors block">
                  <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">{prospectContactCount}</div>
                  <div className="text-[13px] font-semibold text-slate-700 mb-1.5">
                    {prospectContactCount === 1 ? 'contact' : 'contacts'} not yet reached
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    People you know but have not yet connected with in this search.
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Draft outreach &rarr;</span>
                </Link>
              )}
              {companiesWithoutBrief.length > 0 && (
                <Link href="/dashboard" className="bg-white border border-slate-200 rounded p-4 hover:border-slate-400 transition-colors block">
                  <div className="text-[26px] font-bold text-slate-900 leading-none mb-1">{companiesWithoutBrief.length}</div>
                  <div className="text-[13px] font-semibold text-slate-700 mb-1.5">
                    {companiesWithoutBrief.length === 1 ? 'company' : 'companies'} with no prep brief
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {companiesWithoutBrief.slice(0, 2).map(c => c.name).join(', ')}
                    {companiesWithoutBrief.length > 2 ? ` +${companiesWithoutBrief.length - 2} more` : ''}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Run prep briefs &rarr;</span>
                </Link>
              )}
            </div>
          </section>
        )}

        <OpportunityRadar />

          </div>
        </details>

        {/* Nurture path welcome card � first 7 days, empty pipeline, between-roles user */}
        {showNurtureWelcome && (
          <section id="nurture-welcome" className="bg-slate-900 rounded-lg p-6 mb-6">
            <h2 className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Your search starts here</h2>
            <p className="text-[18px] font-bold text-white mb-3 leading-snug">You don&apos;t have to have it all figured out today.</p>
            <p className="text-[14px] text-slate-300 leading-relaxed mb-5">
              Do one focused action today. Consistency beats scattered effort.
            </p>
            <p className="text-[13px] font-semibold text-slate-200 mb-4">One thing to do right now:</p>
            <Link
              href="/dashboard/companies/new"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[13px] font-bold px-5 py-3 rounded transition-colors"
            >
              Add the first company you want to work for &rarr;
            </Link>
            <p className="text-[12px] text-slate-500 mt-4">
              You can come back for the rest. The system will be here.
            </p>
          </section>
        )}

        {/* Campaign path welcome � first 7 days, empty pipeline */}
        {showCampaignWelcome && (
          <section id="campaign-welcome" className="bg-slate-900 rounded-lg p-6 mb-6">
            <h2 className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Campaign mode</h2>
            <p className="text-[18px] font-bold text-white mb-3 leading-snug">Your target list is the campaign.</p>
            <p className="text-[14px] text-slate-300 leading-relaxed mb-5">
              Most executive roles are filled through relationships before posting. Start tracking target companies early.
            </p>
            <p className="text-[13px] font-semibold text-slate-200 mb-4">Start here: add the companies you already have a relationship or contact at.</p>
            <Link
              href="/dashboard/companies/new"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[13px] font-bold px-5 py-3 rounded transition-colors"
            >
              Add your first target company &rarr;
            </Link>
            <p className="text-[12px] text-slate-500 mt-4">
              Aim for 10 to 15 companies. Add career URLs as you go.
            </p>
          </section>
        )}

        {/* Watcher path welcome � first 7 days, empty pipeline */}
        {showWatcherWelcome && (
          <section id="watcher-welcome" className="bg-slate-900 rounded-lg p-6 mb-6">
            <h2 className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Market intelligence</h2>
            <p className="text-[18px] font-bold text-white mb-3 leading-snug">You don&apos;t have to be searching to stay ready.</p>
            <p className="text-[14px] text-slate-300 leading-relaxed mb-5">
              Stay ready by tracking the right companies before you need to move.
            </p>
            <p className="text-[13px] font-semibold text-slate-200 mb-4">Add the companies you would say yes to � and let the platform do the watching.</p>
            <Link
              href="/dashboard/companies/new"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[13px] font-bold px-5 py-3 rounded transition-colors"
            >
              Add a company to watch &rarr;
            </Link>
            <p className="text-[12px] text-slate-500 mt-4">
              No pressure to act now. You will know when timing shifts.
            </p>
          </section>
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

        <details className="mb-6 sm:mb-8 bg-white border border-slate-200 rounded overflow-hidden">
          <summary className="cursor-pointer list-none px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500">Weekly performance and advanced modules</span>
            <span className="text-[11px] text-slate-400">Open</span>
          </summary>
          <div className="px-5 py-5">

        {/* Weekly commitment device */}
        {(() => {
          const goal = profile?.weekly_goal ?? null
          const done = outreachThisWeek ?? 0
          if (goal) {
            const remaining = Math.max(0, goal - done)
            return (
              <div className="bg-white border border-slate-200 rounded p-5 mb-6 sm:mb-8 flex items-center gap-5">
                <div className={`text-[40px] font-bold leading-none tabular-nums shrink-0 ${
                  done >= goal ? 'text-green-600' : done > 0 ? 'text-amber-500' : 'text-slate-300'
                }`}>
                  {done}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-slate-900">
                    {done >= goal
                      ? 'Weekly goal hit. Strong week.'
                      : `${remaining} outreach draft${remaining === 1 ? '' : 's'} left to hit your goal.`}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Goal: {goal} per week � {done} done since Monday
                  </div>
                </div>
                <form action={saveWeeklyGoal} className="shrink-0">
                  <input type="hidden" name="weekly_goal" value={goal === 1 ? 1 : goal + 1} />
                  <button type="submit" className="text-[11px] text-slate-400 hover:text-slate-600 border border-slate-200 rounded px-2.5 py-1 cursor-pointer bg-transparent transition-colors">
                    Goal: {goal} &uarr;
                  </button>
                </form>
              </div>
            )
          }
          return (
            <div className="bg-white border border-slate-200 rounded p-5 mb-6 sm:mb-8">
              <p className="text-[13px] font-semibold text-slate-900 mb-1">Set a weekly outreach target.</p>
              <p className="text-[12px] text-slate-400 mb-3 leading-relaxed">
                A weekly target increases follow-through.
              </p>
              <form action={saveWeeklyGoal} className="flex items-center gap-3">
                <select
                  name="weekly_goal"
                  aria-label="Weekly outreach goal"
                  defaultValue="2"
                  className="border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 bg-white focus:outline-none focus:border-slate-400"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} per week</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-700 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors cursor-pointer border-0"
                >
                  Set goal
                </button>
              </form>
            </div>
          )
        })()}

        {/* Momentum Score - only renders after migration 022 is applied and worker has run */}
        {momentumData?.momentum_score != null && (
          <div className="bg-white border border-slate-200 rounded p-5 mb-6 sm:mb-8 flex items-center gap-5">
            <div className={`text-[40px] font-bold leading-none tabular-nums shrink-0 ${
              momentumData.momentum_score >= 70 ? 'text-green-600' :
              momentumData.momentum_score >= 40 ? 'text-amber-500' :
              'text-red-600'
            }`}>
              {momentumData.momentum_score}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-slate-900">
                {momentumData.momentum_score >= 70 ? 'Strong cadence. Keep it moving.' :
                 momentumData.momentum_score >= 40
                   ? `Momentum is dropping.${daysSinceLastAction != null ? ` ${daysSinceLastAction}d since your last action.` : ''}`
                   : 'Search at risk. This pace adds months to your timeline.'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Momentum score
                {momentumData.momentum_computed_at && (
                  <> &middot; Updated {Math.floor((Date.now() - new Date(momentumData.momentum_computed_at).getTime()) / 86400000)}d ago</>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5">
                Track your activity with{' '}
                <a href="https://www.manager-tools.com/2016/09/job-search-tracking" target="_blank" rel="noopener noreferrer" className="text-slate-500 underline hover:text-slate-700">Manager Tools</a>
                {' '}or{' '}
                <a href="https://www.manager-tools.com/career-tools-basics" target="_blank" rel="noopener noreferrer" className="text-slate-500 underline hover:text-slate-700">Career Tools</a>
              </div>
            </div>
          </div>
        )}

        {/* Social proof benchmarks */}
        <section id="benchmarks" className="bg-slate-50 border border-slate-200 rounded px-5 py-4 mb-6 sm:mb-8">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">What works at this level</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[20px] font-bold text-slate-900 leading-none">12-18</p>
              <p className="text-[12px] text-slate-500 mt-1">target companies in a 90-day search</p>
            </div>
            <div>
              <p className="text-[20px] font-bold text-slate-900 leading-none">2-3</p>
              <p className="text-[12px] text-slate-500 mt-1">new conversations per week to maintain momentum</p>
            </div>
            <div>
              <p className="text-[20px] font-bold text-slate-900 leading-none">72 hrs</p>
              <p className="text-[12px] text-slate-500 mt-1">typical response time after a warm intro</p>
            </div>
          </div>
        </section>

        <ActivityChart data={weekSlots} />
        <PipelineVelocity companies={velocityRows} />

        {/* Quick Actions */}
        <section id="quick-actions" className="mb-6 sm:mb-2">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
          {[
            { href: '/dashboard/briefing',       label: 'Daily Briefing',    sub: "Today's update" },
            { href: '/dashboard/strategy',       label: 'Strategy Brief',    sub: 'Your search playbook' },
            { href: '/dashboard/discover',       label: 'Discover',          sub: 'AI-suggested targets' },
            { href: '/dashboard/calendar',       label: 'Calendar',          sub: 'Upcoming follow-ups' },
            { href: '/optimize',                 label: 'LinkedIn',          sub: 'Profile optimizer' },
            { href: '/dashboard/positioning',    label: 'Positioning',       sub: 'Refine your story' },
            { href: '/dashboard/profile',        label: 'Configure Search',  sub: 'Titles, sectors, briefing' },
            ...(isCoach ? [{ href: '/dashboard/coach', label: 'My Clients', sub: 'Coach dashboard' }] : []),
          ].map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="group bg-white border border-slate-200 rounded p-4 hover:border-slate-400 hover:shadow-sm transition-all"
            >
              <p className="text-[13px] font-semibold text-slate-900 group-hover:text-slate-700">{a.label}</p>
            </Link>
          ))}
          </div>
        </section>

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

        {/* Pipeline Pulse - Executive only */}
        {isExecutive && (
          <section id="pipeline-pulse" className="bg-white border border-orange-200 rounded overflow-hidden mb-8">
            <div className="px-6 py-[18px] border-b border-orange-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500">
                  Pipeline Pulse
                </h2>
                <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                  Executive
                </span>
              </div>
              <Link href="/dashboard/signals" className="text-[12px] text-slate-400 hover:text-slate-600">
                All signals &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="px-6 py-5 text-center">
                <div className={`text-[28px] font-bold leading-none ${signalCount > 0 ? 'text-orange-500' : 'text-slate-300'}`}>
                  {signalCount}
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-1.5">New Signals</div>
                <div className="text-[11px] text-slate-400 mt-0.5">last 7 days</div>
              </div>
              <div className="px-6 py-5 text-center">
                <div className={`text-[28px] font-bold leading-none ${(draftReadyCount ?? 0) > 0 ? 'text-orange-500' : 'text-slate-300'}`}>
                  {draftReadyCount ?? 0}
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-1.5">Drafts Ready</div>
                <div className="text-[11px] text-slate-400 mt-0.5">last 14 days</div>
              </div>
              <div className="px-6 py-5 text-center">
                <div className={`text-[28px] font-bold leading-none ${overdueCount > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                  {overdueCount}
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-1.5">Today</div>
                <div className="text-[11px] text-slate-400 mt-0.5">overdue</div>
              </div>
              <div className="px-6 py-5 text-center">
                <div className={`text-[28px] font-bold leading-none ${activeCount > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                  {activeCount}
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-1.5">In Process</div>
                <div className="text-[11px] text-slate-400 mt-0.5">active companies</div>
              </div>
            </div>
          </section>
        )}

          </div>
        </details>

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
