import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import { IntelligenceAdminClient } from './client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'

type DiscoverSummary = {
  generatedEvents30d: number
  openedEvents30d: number
  addedCompanies30d: number
  recommendationCount30d: number
  avgFit30d: number
  peopleCoverage30d: number
  highConfidencePeopleCoverage30d: number
}

export default async function AdminIntelligencePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString()

  const [companiesRes, recommendationRowsRes, generatedEventsRes, openedEventsRes, companyAddedEventsRes] = await Promise.all([
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
      .eq('event_name', 'discover_recommendation_opened')
      .gte('created_at', thirtyDaysAgo),
    (admin as any)
      .from('user_events')
      .select('properties, created_at')
      .eq('event_name', 'company_added')
      .gte('created_at', thirtyDaysAgo)
      .limit(500),
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

  const discoverSummary: DiscoverSummary = {
    generatedEvents30d: generatedEventsRes.count ?? 0,
    openedEvents30d: openedEventsRes.count ?? 0,
    addedCompanies30d: addedCompaniesFromDiscover,
    recommendationCount30d: recommendationRows.length,
    avgFit30d: fitCount > 0 ? totalFit / fitCount : 0,
    peopleCoverage30d: recommendationRows.length > 0 ? withPeople / recommendationRows.length : 0,
    highConfidencePeopleCoverage30d: recommendationRows.length > 0 ? withHighConfidencePeople / recommendationRows.length : 0,
  }

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
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-slate-900 mb-4">Discover conversion + quality (last 30 days)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] uppercase tracking-[0.08em] text-slate-400 font-bold">Generated</div>
              <div className="text-[18px] font-bold text-slate-900">{discoverSummary.generatedEvents30d}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] uppercase tracking-[0.08em] text-slate-400 font-bold">Opened</div>
              <div className="text-[18px] font-bold text-slate-900">{discoverSummary.openedEvents30d}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] uppercase tracking-[0.08em] text-slate-400 font-bold">Added</div>
              <div className="text-[18px] font-bold text-slate-900">{discoverSummary.addedCompanies30d}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] uppercase tracking-[0.08em] text-slate-400 font-bold">Avg Fit</div>
              <div className="text-[18px] font-bold text-slate-900">{discoverSummary.avgFit30d.toFixed(1)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] uppercase tracking-[0.08em] text-slate-400 font-bold">People Coverage</div>
              <div className="text-[18px] font-bold text-slate-900">{Math.round(discoverSummary.peopleCoverage30d * 100)}%</div>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50">
              <div className="text-[10px] uppercase tracking-[0.08em] text-slate-400 font-bold">High-Conf People</div>
              <div className="text-[18px] font-bold text-slate-900">{Math.round(discoverSummary.highConfidencePeopleCoverage30d * 100)}%</div>
            </div>
          </div>
          <p className="text-[12px] text-slate-500 mt-3">
            Open-to-add conversion: {discoverSummary.openedEvents30d > 0 ? Math.round((discoverSummary.addedCompanies30d / discoverSummary.openedEvents30d) * 100) : 0}%
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
