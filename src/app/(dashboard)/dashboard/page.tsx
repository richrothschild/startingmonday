import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { todayInTz, greetingInTz, fullDateInTz } from '@/lib/date'
import { getActivationStatus } from '@/lib/activation'
import { PipelineFilter } from './PipelineFilter'
import { LogoutButton } from './logout-button'
import { SuggestionCards } from '@/components/SuggestionCards'
import { FollowUpItem } from '@/components/FollowUpItem'
import { CmdKButton } from '@/components/CmdKButton'
import { EmptyState, EMPTY_ICONS } from '@/components/EmptyState'
import { signalLabel, SIGNAL_COLORS } from '@/lib/intelligence'
import { saveQuickProfile } from './profile/actions'
import { addSignalFollowUp } from './signals/actions'
import { markPlaced } from './placed/actions'
import { OpportunityRadar } from './opportunity-radar'

// Full class strings - must not be constructed dynamically (Tailwind scanner needs to see them)
const STAGE: Record<string, { label: string; cls: string }> = {
  watching:     { label: 'Watching',     cls: 'bg-slate-100 text-slate-500' },
  researching:  { label: 'Researching',  cls: 'bg-blue-50 text-blue-700' },
  applied:      { label: 'In Process',   cls: 'bg-indigo-50 text-indigo-700' },
  interviewing: { label: 'Interviewing', cls: 'bg-amber-50 text-amber-700' },
  offer:        { label: 'Offer',        cls: 'bg-green-50 text-green-700' },
}

const PAGE_SIZE = 50

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

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('full_name, search_started_at, briefing_timezone, onboarding_completed_at, target_titles, resume_text, positioning_summary, briefing_time, current_title, placed_at, placement_company, search_status')
    .eq('user_id', user.id)
    .single()

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
    .select('stage, name')
    .eq('user_id', user.id)
    .is('archived_at', null)

  const since7d  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const since14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const adminClient = createAdminClient()
  const isPartnerPromise = Promise.resolve(
    adminClient
      .from('partners')
      .select('id', { count: 'exact', head: true })
      .eq('email', user.email ?? '')
      .eq('is_active', true)
  ).then(r => (r.count ?? 0) > 0).catch(() => false)

  const [{ data: companies, count: filteredCount }, { data: allCompanies }, { data: followUps }, { data: userRow }, { data: recentSignals }, { data: recentPatternAlerts }, activation, { data: momentumData }, { data: contactRows }, { count: draftReadyCount }] = await Promise.all([
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
  ])

  // isPartnerPromise was started before the main await above so it ran in parallel
  const isPartner = await isPartnerPromise
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const allList = allCompanies ?? []
  const totalCount = allList.length
  const activeCount = allList.filter(c =>
    ['interviewing', 'applied', 'offer'].includes(c.stage)
  ).length
  const overdueCount   = (followUps ?? []).length
  type SignalRow = { id: string; signal_type: string; signal_summary: string; outreach_angle?: string | null; signal_date: string; company_id: string; companies: { id: string; name: string } | null }
  const signals        = (recentSignals ?? []) as unknown as SignalRow[]
  const patternAlerts  = (recentPatternAlerts ?? []) as unknown as SignalRow[]
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

  const filtered = companies ?? []
  const totalFiltered = filteredCount ?? 0
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE)
  const hasFilters = !!(q || stage)

  const greeting = greetingInTz(tz)
  const today = fullDateInTz(tz)

  const trialEndsAt = userRow?.trial_ends_at ? new Date(userRow.trial_ends_at) : null
  const isTrialing = userRow?.subscription_status === 'trialing'
  const isExecutive = (userRow as unknown as { subscription_tier?: string } | null)?.subscription_tier === 'executive'
  const isCoach = (userRow as unknown as { subscription_tier?: string } | null)?.subscription_tier === 'coach'
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
    { value: overdueCount, label: 'Actions Due',  alert: overdueCount > 0, amber: false,             href: '/dashboard/calendar' },
  ]

  const offerCompany = !profile?.placed_at
    ? allList.find(c => c.stage === 'offer') ?? null
    : null

  const daysSinceOnboard = profile?.onboarding_completed_at
    ? Math.floor((Date.now() - new Date(profile.onboarding_completed_at).getTime()) / 86400000)
    : null
  const showWeek3Prompt = daysSinceOnboard !== null && daysSinceOnboard >= 18 && daysSinceOnboard <= 28

  const setupSteps = [
    { done: activation.a1_resume,    label: 'Upload your resume or import LinkedIn', sub: 'Drives every brief, every briefing, and every AI response you get.',                                                         href: '/dashboard/profile',        cta: 'Go to profile' },
    { done: activation.a2_company,   label: 'Add your first target company',         sub: 'Include the career page URL - we scan it within minutes and alert you to matching roles.',                                   href: '/dashboard/companies/new',  cta: 'Add a company' },
    { done: activation.a3_prep_brief,label: 'Generate your first prep brief',        sub: 'Open any target company and run the brief. Leadership signals, likely objections, best outreach angle.',                     href: '/dashboard/companies',      cta: 'Go to companies' },
    { done: activation.a4_contact,   label: 'Add your first contact',                sub: 'Who do you know at target companies? Roles at this level fill through relationships, not applications.',                     href: '/dashboard/contacts',       cta: 'Add a contact' },
    { done: activation.a5_briefing,  label: 'Set up your daily briefing',            sub: 'Signals and due actions in your inbox before you start work.',                                                               href: '/dashboard/profile',        cta: 'Configure briefing' },
    { done: activation.a6_follow_up, label: 'Log your first follow-up reminder',     sub: 'The difference between an active search and a passive one is whether the next action is scheduled.',                        href: '/dashboard/contacts',       cta: 'Go to contacts' },
  ]

  // Post-placement: Career Intelligence mode
  if (profile?.placed_at) {
    const placedCompany = (profile as unknown as { placement_company?: string | null }).placement_company
    const isPaid = userRow?.subscription_status === 'active'
    const tier = (userRow as unknown as { subscription_tier?: string } | null)?.subscription_tier ?? 'free'
    return (
      <div className="min-h-screen bg-slate-100 font-sans">
        <header className="bg-slate-900">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
            <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 shrink-0">
              <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
            </span>
            <div className="hidden sm:flex items-center gap-4 flex-1">
              <Link href="/dashboard/contacts" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Contacts</Link>
              <Link href="/dashboard/chat" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Chat</Link>
              <div className="ml-auto flex items-center gap-4 shrink-0">
                <Link href="/dashboard/profile" className="text-[12px] text-slate-300 hover:text-white transition-colors">{profile?.full_name ?? user.email}</Link>
                <Link href="/settings/billing" className="text-[12px] text-slate-300 hover:text-white transition-colors">Billing</Link>
                <LogoutButton label="Sign out" />
              </div>
            </div>
            <div className="flex sm:hidden items-center gap-4 ml-auto">
              <Link href="/dashboard/contacts" className="text-[12px] font-semibold text-slate-300 hover:text-white">Contacts</Link>
              <LogoutButton label="Sign out" />
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
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
                Keep your intelligence running -- subscribe to Passive ($49/mo)
              </Link>
            ) : null}
          </div>

          {/* Company watchlist */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
            <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                Your Companies ({totalCount})
              </span>
              <Link href="/dashboard/companies" className="text-[12px] text-slate-500 hover:text-slate-700 transition-colors">
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
                    +{allList.length - 20} more. <Link href="/dashboard/companies" className="underline">View all</Link>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Contacts and chat links */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/contacts" className="bg-white border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
              <p className="text-[13px] font-semibold text-slate-900 mb-1">Contacts</p>
              <p className="text-[12px] text-slate-400 leading-relaxed">Your network at target companies.</p>
            </Link>
            <Link href="/dashboard/chat" className="bg-white border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
              <p className="text-[13px] font-semibold text-slate-900 mb-1">Career Advisor</p>
              <p className="text-[12px] text-slate-400 leading-relaxed">Ask anything about your next move.</p>
            </Link>
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
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 shrink-0">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4 flex-1">
            <CmdKButton />
            <Link href="/dashboard/chat" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Chat</Link>
            <Link href="/dashboard/contacts" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Contacts</Link>
            <Link href="/dashboard/kanban" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Kanban</Link>
            <Link href="/dashboard/calendar" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Calendar</Link>
            <Link href="/optimize" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">LinkedIn</Link>
            <Link href="/dashboard/invite" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Invite</Link>
            <Link href="/dashboard/help" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap">Help</Link>
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
          <div className="flex sm:hidden items-center gap-4 ml-auto">
            <Link href="/dashboard/contacts" className="text-[12px] font-semibold text-slate-300 hover:text-white whitespace-nowrap">Contacts</Link>
            <Link href="/dashboard/chat" className="text-[12px] font-semibold text-slate-300 hover:text-white whitespace-nowrap">Chat</Link>
            <LogoutButton label="Sign out" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">
            {greeting}, {firstName}.
          </h1>
          <p className="text-[13px] text-slate-500 mt-1.5">{today}</p>
        </div>

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
              {trialDaysLeft > 0
                ? `Trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}.`
                : 'Your trial has ended.'}
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
              Compare &amp; negotiate →
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
              Finish setup →
            </Link>
          </div>
        )}

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
              {nextProfileSection ? `Complete ${nextProfileSection.label} →` : 'View profile →'}
            </span>
          </Link>
        )}

        {/* Quick profile shortcut - shown when profile is very thin */}
        {profileScore < 40 && (
          <div className="mb-6 bg-slate-900 rounded p-5 sm:p-6">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">
              Quick start
            </div>
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
                  Full profile →
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
            <span className="text-[12px] font-semibold text-slate-500 shrink-0">Add contacts →</span>
          </Link>
        )}

        <OpportunityRadar />

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
                {momentumData.momentum_score >= 70 ? 'Strong search cadence' :
                 momentumData.momentum_score >= 40 ? 'Moderate activity' :
                 'Search needs attention'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Momentum score
                {momentumData.momentum_computed_at && (
                  <> &middot; Updated {Math.floor((Date.now() - new Date(momentumData.momentum_computed_at).getTime()) / 86400000)}d ago</>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Week 3 coaching prompt - appears Day 18-28 after onboarding */}
        {showWeek3Prompt && (
          <div className="bg-amber-50 border border-amber-200 rounded p-5 mb-6 sm:mb-8">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-amber-600 mb-1">Week 3 Check-in</p>
            <p className="text-[14px] font-semibold text-slate-900 mb-1">Most searches lose momentum around now.</p>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
              Three things that keep searches moving: add companies weekly, complete follow-ups within 48 hours, and run a prep brief before any conversation.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/dashboard/companies/new" className="text-[12px] font-semibold text-slate-900 bg-white border border-slate-200 hover:border-slate-400 rounded px-3 py-1.5 transition-colors">
                Add a company
              </Link>
              <Link href="/dashboard/calendar" className="text-[12px] font-semibold text-slate-900 bg-white border border-slate-200 hover:border-slate-400 rounded px-3 py-1.5 transition-colors">
                View actions due
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3 mb-6 sm:mb-8">
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
              <p className="text-[11px] text-slate-400 mt-0.5">{a.sub}</p>
            </Link>
          ))}
        </div>

        {/* Actions Due */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-8">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              Actions Due
            </span>
            {(followUps ?? []).length > 0 && (
              <span className="text-[12px] font-semibold text-red-600">
                {followUps!.length} {followUps!.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          {(followUps ?? []).length === 0 ? (
            <div className="px-6 py-5">
              <p className="text-[13px] text-slate-400">No actions due. Your pipeline is current.</p>
              <p className="text-[12px] text-slate-300 mt-1">
                Follow-ups you set on companies and contacts appear here when they come due.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {(followUps ?? []).map(fu => {
                const isToday = fu.due_date === todayISO
                const co = fu.companies as unknown as { name: string } | null
                const dateLabel = isToday
                  ? 'Today'
                  : new Date(fu.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return (
                  <FollowUpItem
                    key={fu.id}
                    id={fu.id}
                    action={fu.action}
                    dueDate={fu.due_date}
                    dateLabel={dateLabel}
                    isToday={isToday}
                    companyName={co?.name}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Warm Paths */}
        {warmPaths.length > 0 && (
          <div className="bg-white border border-green-200 rounded overflow-hidden mb-8">
            <div className="px-6 py-[18px] border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-green-700">
                  Warm Paths
                </span>
                <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                  {warmPaths.length} {warmPaths.length === 1 ? 'opportunity' : 'opportunities'}
                </span>
              </div>
              <Link href="/dashboard/contacts" className="text-[12px] text-slate-400 hover:text-slate-600">
                All contacts
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {warmPaths.map(wp => {
                const dateLabel = new Date(wp.signal.signal_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return (
                  <div key={`${wp.contactId}-${wp.signal.id}`} className="px-6 py-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-700 text-[12px] font-bold shrink-0 mt-0.5">
                      {wp.contactName[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link href={`/dashboard/contacts/${wp.contactId}`} className="text-[14px] font-semibold text-slate-900 hover:text-slate-600">
                          {wp.contactName}
                        </Link>
                        {wp.contactTitle && (
                          <span className="text-[12px] text-slate-400">{wp.contactTitle}</span>
                        )}
                        <span className="text-[12px] text-slate-400">at</span>
                        <Link href={`/dashboard/companies/${wp.companyId}`} className="text-[12px] font-semibold text-slate-600 hover:text-slate-900">
                          {wp.companyName}
                        </Link>
                        <span className={[
                          'text-[10px] font-bold tracking-[0.06em] uppercase px-2 py-0.5 rounded-full',
                          SIGNAL_COLORS[wp.signal.signal_type] ?? 'bg-slate-100 text-slate-600',
                        ].join(' ')}>
                          {signalLabel(wp.signal.signal_type)}
                        </span>
                        <span className="text-[11px] text-slate-400">{dateLabel}</span>
                      </div>
                      <p className="text-[13px] text-slate-500 leading-relaxed truncate">{wp.signal.signal_summary}</p>
                    </div>
                    <Link
                      href={`/dashboard/contacts/${wp.contactId}/outreach`}
                      className="shrink-0 text-[12px] font-semibold text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded transition-colors"
                    >
                      Draft
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pattern Alerts */}
        {patternAlerts.length > 0 && (
          <div className="bg-white border border-orange-200 rounded overflow-hidden mb-8">
            <div className="px-6 py-[18px] border-b border-orange-100 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500">
                Pattern Alerts
              </span>
              <Link href="/dashboard/signals" className="text-[12px] text-slate-400 hover:text-slate-600">
                See all →
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {patternAlerts.map(sig => {
                const co = sig.companies
                const colonIdx = sig.signal_summary.indexOf(': ')
                const patternName = colonIdx > -1 ? sig.signal_summary.slice(0, colonIdx) : 'Pattern Alert'
                const patternBody = colonIdx > -1 ? sig.signal_summary.slice(colonIdx + 2) : sig.signal_summary
                const dateLabel = new Date(sig.signal_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return (
                  <div key={sig.id} className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {co && (
                          <Link href={`/dashboard/companies/${co.id}`} className="text-[14px] font-semibold text-slate-900 hover:text-slate-600">
                            {co.name}
                          </Link>
                        )}
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600">
                          {patternName}
                        </span>
                      </div>
                      <span className="text-[12px] text-slate-400 shrink-0">{dateLabel}</span>
                    </div>
                    <p className="text-[13px] text-slate-700 leading-relaxed mb-1.5">{patternBody}</p>
                    {sig.outreach_angle && (
                      <p className="text-[12px] text-slate-500 italic leading-relaxed">{sig.outreach_angle}</p>
                    )}
                    <form action={addSignalFollowUp} className="mt-2">
                      <input type="hidden" name="company_name" value={co?.name ?? ''} />
                      <input type="hidden" name="signal_summary" value={patternBody} />
                      <button type="submit" className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0">
                        + Follow up in 5 days
                      </button>
                    </form>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Signals */}
        {signals.length > 0 && (
          <div className="bg-white border border-amber-200 rounded overflow-hidden mb-8">
            <div className="px-6 py-[18px] border-b border-amber-100 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-amber-600">
                Company Signals
              </span>
              <Link href="/dashboard/signals" className="text-[12px] text-slate-400 hover:text-slate-600">
                See all →
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {signals.map(sig => {
                const co = sig.companies
                const dateLabel = new Date(sig.signal_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                const typeLabel = sig.signal_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                return (
                  <div key={sig.id} className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {co && (
                        <Link href={`/dashboard/companies/${co.id}`} className="text-[14px] font-semibold text-slate-900 hover:text-slate-600">
                          {co.name}
                        </Link>
                      )}
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                        {typeLabel}
                      </span>
                      <span className="text-[12px] text-slate-400 ml-auto">{dateLabel}</span>
                    </div>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{sig.signal_summary}</p>
                    {sig.outreach_angle && (
                      <p className="text-[12px] text-slate-400 italic mt-1 leading-relaxed">{sig.outreach_angle}</p>
                    )}
                    <form action={addSignalFollowUp} className="mt-2">
                      <input type="hidden" name="company_name" value={co?.name ?? ''} />
                      <input type="hidden" name="signal_summary" value={sig.signal_summary} />
                      <button type="submit" className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0">
                        + Follow up in 5 days
                      </button>
                    </form>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Setup checklist - visible until all 6 steps are complete */}
        {!activation.isComplete && !hasFilters && (
          <div className="bg-white border border-slate-200 rounded overflow-hidden mb-8">
            <div className="px-6 py-[18px] border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                Setup checklist
              </span>
              <Link href="/dashboard/start" className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
                View details &rarr;
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {setupSteps.map((step, i) => (
                <div
                  key={i}
                  className={`px-6 py-3.5 flex items-center gap-4 ${step.done ? 'opacity-50' : ''}`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    step.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <span className={`text-[13px] flex-1 min-w-0 ${
                    step.done ? 'line-through text-slate-400 decoration-slate-300' : 'text-slate-900'
                  }`}>
                    {step.label}
                  </span>
                  {!step.done && (
                    <Link
                      href={step.href}
                      className="text-[12px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors shrink-0"
                    >
                      {step.cta} &rarr;
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions - shown until dismissed or pipeline grows */}
        {totalCount < 5 && !hasFilters && <SuggestionCards />}

        {/* Pipeline Pulse - Executive only */}
        {isExecutive && (
          <div className="bg-white border border-orange-200 rounded overflow-hidden mb-8">
            <div className="px-6 py-[18px] border-b border-orange-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500">
                  Pipeline Pulse
                </span>
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
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-1.5">Actions Due</div>
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
          </div>
        )}

        {/* Pipeline */}
        <div id="pipeline" className="bg-white border border-slate-200 rounded overflow-hidden">

          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              Company Pipeline
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[12px] text-slate-400">
                {hasFilters && totalFiltered === 0
                  ? `0 of ${totalCount}`
                  : totalPages > 1 || hasFilters
                    ? `${start + 1}–${Math.min(start + PAGE_SIZE, totalFiltered)} of ${totalFiltered}`
                    : totalCount} {totalCount === 1 ? 'company' : 'companies'}
              </span>
              <Link
                href="/dashboard/companies/new"
                className="text-[12px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors"
              >
                + Add
              </Link>
            </div>
          </div>

          <PipelineFilter
            q={q ?? ''}
            stage={stage ?? ''}
            stages={Object.entries(STAGE).map(([key, { label }]) => ({ key, label }))}
          />

          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2.5 pl-6 pr-4 text-left text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400">
                  Company
                </th>
                <th className="py-2.5 px-4 text-left text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 hidden sm:table-cell">
                  Sector
                </th>
                <th className="py-2.5 px-4 text-left text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400">
                  Stage
                </th>
                <th className="py-2.5 pl-4 pr-6 text-right text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400">
                  Fit
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    {totalCount === 0 ? (
                      !activation.a1_resume ? (
                        <EmptyState
                          icon={EMPTY_ICONS.companies}
                          title="Start here: upload your resume"
                          body="Paste your LinkedIn profile text or upload your resume. It's what drives prep briefs, daily briefings, and every AI response you get."
                          cta={{ label: 'Go to profile →', href: '/dashboard/profile' }}
                        />
                      ) : (
                        <EmptyState
                          icon={EMPTY_ICONS.companies}
                          title="No target companies yet"
                          body="Add companies you want to work for. We'll scan for signals - exec moves, funding, openings - and alert you when the timing is right."
                          cta={{ label: 'Add your first company', href: '/dashboard/companies/new' }}
                        />
                      )
                    ) : (
                      <div className="py-10 text-center text-[14px] text-slate-400">
                        No companies match that filter.
                      </div>
                    )}
                  </td>
                </tr>
              ) : filtered.map((co, i) => {
                const s = STAGE[co.stage] ?? { label: co.stage, cls: 'bg-slate-100 text-slate-500' }
                return (
                  <tr
                    key={co.id}
                    className={i < filtered.length - 1 ? 'border-b border-slate-50' : ''}
                  >
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/companies/${co.id}`} className="text-[14px] font-semibold text-slate-900 hover:text-slate-600">{co.name}</Link>
                        {(contactCountMap.get(co.id) ?? 0) > 0 && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
                            {contactCountMap.get(co.id)} {contactCountMap.get(co.id) === 1 ? 'contact' : 'contacts'}
                          </span>
                        )}
                      </div>
                      {co.notes && (
                        <div className="text-[12px] text-slate-400 mt-0.5 truncate max-w-[200px] sm:max-w-[340px]">
                          {co.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-500 hidden sm:table-cell">
                      {co.sector ?? '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.04em] ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 pr-6 text-right text-[14px] font-bold text-slate-900">
                      {co.fit_score ?? '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[12px] text-slate-400">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                {page > 0 && (
                  <a
                    href={`/dashboard?${new URLSearchParams({ ...(q ? { q } : {}), ...(stage ? { stage } : {}), page: String(page - 1) }).toString()}`}
                    className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400"
                  >
                    ← Previous
                  </a>
                )}
                {page < totalPages - 1 && (
                  <a
                    href={`/dashboard?${new URLSearchParams({ ...(q ? { q } : {}), ...(stage ? { stage } : {}), page: String(page + 1) }).toString()}`}
                    className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400"
                  >
                    Next →
                  </a>
                )}
              </div>
            </div>
          )}

        {/* Search wrap-up link - discreet, for users who found a role outside the pipeline */}
        {!profile?.placed_at && (isTrialing || userRow?.subscription_status === 'active') && (
          <div className="mt-10 text-center">
            <Link
              href="/dashboard/wrap-up"
              className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              Did your search wrap up? Mark it complete.
            </Link>
          </div>
        )}

        </div>
      </main>
    </div>
  )
}
