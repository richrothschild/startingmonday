import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import { IntelligenceAdminClient } from './client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'

type DiscoverSummary = {
  generatedEvents30d: number
  runCreatedEvents30d: number
  openedEvents30d: number
  outreachStarts30d: number
  recommendedContactsAdded30d: number
  addedCompanies30d: number
  recommendationCount30d: number
  avgFit30d: number
  peopleCoverage30d: number
  highConfidencePeopleCoverage30d: number
  narrativeOpenRate30d: number
  outreachStartRate30d: number
  suggestedPeopleAcceptanceRate30d: number
  watchlistAddRate30d: number
  watchlistLiftVsBaselinePct: number | null
}

export default async function AdminIntelligencePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString()
  const addRateBaseline = Number(process.env.DISCOVER_ADD_TO_WATCHLIST_BASELINE_RATE ?? '')
  const hasAddRateBaseline = Number.isFinite(addRateBaseline) && addRateBaseline > 0

  const [companiesRes, recommendationRowsRes, generatedEventsRes, runCreatedEventsRes, openedEventsRes, recommendationAddedEventsRes, outreachStartedEventsRes, companyAddedEventsRes, activeCampaignsRes, stalledCampaignsRes, dueFollowUpsRes] = await Promise.all([
    admin
      .from('intelligence_companies')
      .select('slug, company_name, sector, website, is_featured, created_at')
      .order('created_at', { ascending: false }),
    (admin as any)
      .from('company_recommendations')
      .select('fit, suggested_people, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(500),
    (admin as any)
      .from('user_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_name', 'discover_recommendations_generated')
      .gte('created_at', thirtyDaysAgo),
    (admin as any)
      .from('user_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_name', 'discover_run_created')
      .gte('created_at', thirtyDaysAgo),
    (admin as any)
      .from('user_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_name', 'discover_recommendation_opened')
      .gte('created_at', thirtyDaysAgo),
    (admin as any)
      .from('user_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_name', 'discover_recommendation_added')
      .gte('created_at', thirtyDaysAgo),
    (admin as any)
      .from('user_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_name', 'discover_outreach_started')
      .gte('created_at', thirtyDaysAgo),
    (admin as any)
      .from('user_events')
      .select('properties, created_at')
      .eq('event_name', 'company_added')
      .gte('created_at', thirtyDaysAgo)
      .limit(500),
    (admin as any)
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null)
      .in('stage', ['applied', 'interviewing', 'offer']),
    (admin as any)
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null)
      .lt('updated_at', new Date(Date.now() - 14 * 86400_000).toISOString()),
    (admin as any)
      .from('follow_ups')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lt('due_date', new Date().toISOString().slice(0, 10)),
  ])

  const companies = companiesRes.data ?? []
  const recommendationRows = (recommendationRowsRes.data ?? []) as Array<{ fit: number | null; suggested_people: unknown }>
  const companyAddedEvents = (companyAddedEventsRes.data ?? []) as Array<{ properties: { source?: string } | null }>

  let totalFit = 0
  let fitCount = 0
  let withPeople = 0
  let withHighConfidencePeople = 0

  for (const row of recommendationRows) {
    if (typeof row.fit === 'number') {
      totalFit += row.fit
      fitCount += 1
    }
    if (!Array.isArray(row.suggested_people) || row.suggested_people.length === 0) continue

    withPeople += 1
    const hasHighConfidence = row.suggested_people.some((person) => {
      const confidence = typeof (person as { confidence?: unknown })?.confidence === 'number'
        ? (person as { confidence: number }).confidence
        : 0
      return confidence >= 0.7
    })
    if (hasHighConfidence) withHighConfidencePeople += 1
  }

  const addedCompaniesFromDiscover = companyAddedEvents.filter((event) => {
    const source = event?.properties?.source
    return typeof source === 'string' && source.startsWith('discover')
  }).length

  const generatedEvents30d = generatedEventsRes.count ?? 0
  const runCreatedEvents30d = runCreatedEventsRes.count ?? 0
  const openedEvents30d = openedEventsRes.count ?? 0
  const outreachStarts30d = outreachStartedEventsRes.count ?? 0
  const recommendedContactsAdded30d = recommendationAddedEventsRes.count ?? 0

  const narrativeOpenRate30d = generatedEvents30d > 0 ? openedEvents30d / generatedEvents30d : 0
  const outreachStartRate30d = openedEvents30d > 0 ? outreachStarts30d / openedEvents30d : 0
  const suggestedPeopleAcceptanceRate30d = openedEvents30d > 0 ? recommendedContactsAdded30d / openedEvents30d : 0
  const watchlistAddRate30d = openedEvents30d > 0 ? addedCompaniesFromDiscover / openedEvents30d : 0
  const watchlistLiftVsBaselinePct = hasAddRateBaseline
    ? ((watchlistAddRate30d - addRateBaseline) / addRateBaseline) * 100
    : null

  const activeCampaigns = activeCampaignsRes.count ?? 0
  const stalledCampaigns = stalledCampaignsRes.count ?? 0
  const dueFollowUps = dueFollowUpsRes.count ?? 0

  const discoverSummary: DiscoverSummary = {
    generatedEvents30d,
    runCreatedEvents30d,
    openedEvents30d,
    outreachStarts30d,
    recommendedContactsAdded30d,
    addedCompanies30d: addedCompaniesFromDiscover,
    recommendationCount30d: recommendationRows.length,
    avgFit30d: fitCount > 0 ? totalFit / fitCount : 0,
    peopleCoverage30d: recommendationRows.length > 0 ? withPeople / recommendationRows.length : 0,
    highConfidencePeopleCoverage30d: recommendationRows.length > 0 ? withHighConfidencePeople / recommendationRows.length : 0,
    narrativeOpenRate30d,
    outreachStartRate30d,
    suggestedPeopleAcceptanceRate30d,
    watchlistAddRate30d,
    watchlistLiftVsBaselinePct,
  }

  const cadenceScore = Math.min(100, Math.round((discoverSummary.outreachStarts30d / 50) * 100))
  const followThroughScore = Math.max(0, 100 - Math.min(100, dueFollowUps * 2))
  const conversionScore = Math.max(0, Math.min(100, activeCampaigns * 2))
  const adminCampaignHealthScore = Math.round((cadenceScore * 0.4) + (followThroughScore * 0.35) + (conversionScore * 0.25))

  // For each company, fetch signal count and recent tokens
  const companyData = await Promise.all(
    (companies ?? []).map(async co => {
      const [{ count }, { data: tokens }] = await Promise.all([
        admin
          .from('company_signals')
          .select('id', { count: 'exact', head: true })
          .ilike('companies.name', co.company_name)
          .not('companies', 'is', null),
        admin
          .from('intelligence_access_tokens')
          .select('id, label, expires_at, created_at')
          .eq('company_slug', co.slug)
          .order('created_at', { ascending: false })
          .limit(5),
      ])
      return { ...co, signalCount: count ?? 0, tokens: tokens ?? [] }
    })
  )

  return (
    <main className="space-y-5">
      <h1 className="sr-only">Intelligence Admin</h1>
      <nav className="sr-only" aria-label="Intelligence admin quick actions">
        <Link href="/dashboard/admin">Back to admin home</Link>
        <Link href="/dashboard/admin/social">Open social admin</Link>
        <Link href="/dashboard/admin/speakers">Open speakers admin</Link>
      </nav>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 mb-5">
          <h2 className="text-[15px] font-bold text-slate-900 mb-3">Campaign health monitor</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">Health Score</div>
              <div className="text-[18px] font-bold text-slate-900">{adminCampaignHealthScore}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">Active Campaigns</div>
              <div className="text-[18px] font-bold text-slate-900">{activeCampaigns}</div>
            </div>
            <div className="rounded-lg border border-amber-200 px-3 py-2.5 bg-amber-50">
              <div className="text-[10px] tracking-[0.08em] text-amber-700 font-bold">Stalled 14+ Days</div>
              <div className="text-[18px] font-bold text-amber-900">{stalledCampaigns}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">Overdue Follow-ups</div>
              <div className="text-[18px] font-bold text-slate-900">{dueFollowUps}</div>
            </div>
          </div>
          <p className="text-[12px] text-slate-500 mt-3">Monitor stalled campaign count daily and trigger outreach triage when stalled campaigns increase week over week.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-slate-900 mb-4">Discover conversion + quality (last 30 days)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3">
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">Generated</div>
              <div className="text-[18px] font-bold text-slate-900">{discoverSummary.generatedEvents30d}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">Runs</div>
              <div className="text-[18px] font-bold text-slate-900">{discoverSummary.runCreatedEvents30d}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">Opened</div>
              <div className="text-[18px] font-bold text-slate-900">{discoverSummary.openedEvents30d}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">Contact Adds</div>
              <div className="text-[18px] font-bold text-slate-900">{discoverSummary.recommendedContactsAdded30d}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">Outreach Starts</div>
              <div className="text-[18px] font-bold text-slate-900">{discoverSummary.outreachStarts30d}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">Added</div>
              <div className="text-[18px] font-bold text-slate-900">{discoverSummary.addedCompanies30d}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">Avg Fit</div>
              <div className="text-[18px] font-bold text-slate-900">{discoverSummary.avgFit30d.toFixed(1)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">People Coverage</div>
              <div className="text-[18px] font-bold text-slate-900">{Math.round(discoverSummary.peopleCoverage30d * 100)}%</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] tracking-[0.08em] text-slate-400 font-bold">High-Conf People</div>
              <div className="text-[18px] font-bold text-slate-900">{Math.round(discoverSummary.highConfidencePeopleCoverage30d * 100)}%</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className={`rounded-lg border px-3 py-2.5 ${discoverSummary.narrativeOpenRate30d >= 0.35 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="text-[10px] tracking-[0.08em] text-slate-500 font-bold">Narrative Open Rate</div>
              <div className="text-[16px] font-bold text-slate-900">{Math.round(discoverSummary.narrativeOpenRate30d * 100)}%</div>
              <div className="text-[11px] text-slate-600">Target: 35%+</div>
            </div>
            <div className={`rounded-lg border px-3 py-2.5 ${discoverSummary.outreachStartRate30d >= 0.2 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="text-[10px] tracking-[0.08em] text-slate-500 font-bold">Outreach Start Rate</div>
              <div className="text-[16px] font-bold text-slate-900">{Math.round(discoverSummary.outreachStartRate30d * 100)}%</div>
              <div className="text-[11px] text-slate-600">Target: 20%+</div>
            </div>
            <div className={`rounded-lg border px-3 py-2.5 ${discoverSummary.suggestedPeopleAcceptanceRate30d >= 0.15 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="text-[10px] tracking-[0.08em] text-slate-500 font-bold">Suggested People Acceptance</div>
              <div className="text-[16px] font-bold text-slate-900">{Math.round(discoverSummary.suggestedPeopleAcceptanceRate30d * 100)}%</div>
              <div className="text-[11px] text-slate-600">Target: 15%+</div>
            </div>
            <div className={`rounded-lg border px-3 py-2.5 ${discoverSummary.watchlistLiftVsBaselinePct !== null && discoverSummary.watchlistLiftVsBaselinePct >= 25 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="text-[10px] tracking-[0.08em] text-slate-500 font-bold">Add-to-Watchlist Lift</div>
              <div className="text-[16px] font-bold text-slate-900">
                {discoverSummary.watchlistLiftVsBaselinePct === null ? 'N/A' : `${Math.round(discoverSummary.watchlistLiftVsBaselinePct)}%`}
              </div>
              <div className="text-[11px] text-slate-600">Target: +25% vs baseline</div>
            </div>
          </div>

          <p className="text-[12px] text-slate-500 mt-3">
            Open-to-add conversion: {discoverSummary.openedEvents30d > 0 ? Math.round((discoverSummary.addedCompanies30d / discoverSummary.openedEvents30d) * 100) : 0}%
            {discoverSummary.watchlistLiftVsBaselinePct === null ? ' (set DISCOVER_ADD_TO_WATCHLIST_BASELINE_RATE to enable lift calculation)' : ''}
          </p>
        </div>
      </section>

      <IntelligenceAdminClient
        companies={companyData}
        appUrl={APP_URL}
      />
    </main>
  )
}
