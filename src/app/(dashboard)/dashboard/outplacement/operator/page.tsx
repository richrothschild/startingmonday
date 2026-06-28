import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

type PartnerRow = { id: string; name: string }
type AttributionRow = { partner_id: string; signup_user_id: string; attributed_at: string }
type UserRow = { id: string; email: string; created_at: string }
type UserEventRow = { user_id: string; created_at: string }
type OutreachRow = { user_id: string; sent_at: string }
type BriefRow = { user_id: string; created_at: string }
type FollowUpRow = { user_id: string; due_date: string; status: string; next_action_status: string }

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function toPercent(numerator: number, denominator: number): number {
  if (!denominator) return 0
  return Number(((numerator / denominator) * 100).toFixed(1))
}

function statusFromRate(rate: number): 'on_track' | 'watch' | 'needs_attention' {
  if (rate >= 70) return 'on_track'
  if (rate >= 45) return 'watch'
  return 'needs_attention'
}

function cohortKeyFromIso(isoDate: string): string {
  const d = new Date(isoDate)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function normalizeStatus(value: string | null | undefined): string {
  return String(value ?? '').trim().toLowerCase()
}

export const metadata: Metadata = {
  title: 'Outplacement Operator Console | Starting Monday',
  description: 'Cohort health, exceptions, interventions, and readiness status for outplacement program operators.',
}

/**
 * Outplacement Operator Console - Sprint ITS-4 Ticket 23
 *
 * AC: partner buyers can see operating-system proof, not only docs.
 * This route shows cohort health, exception queue, intervention queue,
 * readiness status, and key program KPIs.
 */
export default async function OutplacementOperatorConsolePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: partnerOwnerRows } = await supabase
    .from('partners')
    .select('id, name')
    .eq('is_active', true)
    .eq('user_id', user.id)

  const { data: pilotRowsRaw } = await supabase
    .from('partner_pilots')
    .select('partner_name')
    .eq('program_owner_user_id', user.id)
    .limit(100)
  const pilotRows = (pilotRowsRaw ?? []) as Array<{ partner_name: string }>

  const pilotNames = Array.from(new Set(pilotRows.map((row) => row.partner_name).filter(Boolean)))
  const { data: pilotPartnerRows } = pilotNames.length > 0
    ? await supabase.from('partners').select('id, name').in('name', pilotNames)
    : { data: [] as PartnerRow[] }

  const partnerMap = new Map<string, PartnerRow>()
  for (const row of (partnerOwnerRows ?? []) as PartnerRow[]) partnerMap.set(row.id, row)
  for (const row of (pilotPartnerRows ?? []) as PartnerRow[]) partnerMap.set(row.id, row)

  const partners = Array.from(partnerMap.values())
  const partnerIds = partners.map((row) => row.id)

  const { data: attributions } = partnerIds.length > 0
    ? await supabase
      .from('referral_attributions')
      .select('partner_id, signup_user_id, attributed_at')
      .in('partner_id', partnerIds)
      .limit(200000)
    : { data: [] as AttributionRow[] }

  const attributedRows = (attributions ?? []) as AttributionRow[]
  const userIds = Array.from(new Set(attributedRows.map((row) => row.signup_user_id)))

  const since30 = isoDaysAgo(30)
  const since14 = isoDaysAgo(14)
  const nowIso = new Date().toISOString()

  const [usersRes, eventsRes, outreachRes, briefsRes, followUpsRes] = userIds.length > 0
    ? await Promise.all([
      supabase.from('users').select('id, email, created_at').in('id', userIds).limit(200000),
      supabase.from('user_events').select('user_id, created_at').in('user_id', userIds).gte('created_at', since30).limit(200000),
      supabase.from('outreach_logs').select('user_id, sent_at').in('user_id', userIds).gte('sent_at', since30).limit(200000),
      supabase.from('briefs').select('user_id, created_at').in('user_id', userIds).in('type', ['prep', 'prep_section']).gte('created_at', since30).limit(200000),
      supabase.from('follow_ups').select('user_id, due_date, status, next_action_status').in('user_id', userIds).limit(200000),
    ])
    : [
      { data: [] as UserRow[] },
      { data: [] as UserEventRow[] },
      { data: [] as OutreachRow[] },
      { data: [] as BriefRow[] },
      { data: [] as FollowUpRow[] },
    ]

  const users = (usersRes.data ?? []) as UserRow[]
  const eventRows = (eventsRes.data ?? []) as UserEventRow[]
  const outreachRows = (outreachRes.data ?? []) as OutreachRow[]
  const briefRows = (briefsRes.data ?? []) as BriefRow[]
  const followUpRows = (followUpsRes.data ?? []) as FollowUpRow[]

  const emailByUser = new Map(users.map((row) => [row.id, row.email]))

  const events14 = new Set(eventRows.filter((row) => row.created_at >= since14).map((row) => row.user_id))
  const outreach14 = new Set(outreachRows.filter((row) => row.sent_at >= since14).map((row) => row.user_id))
  const activeUsers = new Set<string>([...events14, ...outreach14])
  const prepUsers = new Set(briefRows.map((row) => row.user_id))

  const outreachCountByUser = new Map<string, number>()
  for (const row of outreachRows) {
    outreachCountByUser.set(row.user_id, (outreachCountByUser.get(row.user_id) ?? 0) + 1)
  }

  const overdueByUser = new Map<string, number>()
  let closedFollowups = 0
  for (const row of followUpRows) {
    const status = normalizeStatus(row.next_action_status || row.status)
    if (status === 'done' || status === 'completed' || status === 'sent') {
      closedFollowups += 1
      continue
    }
    if (row.due_date < nowIso) {
      overdueByUser.set(row.user_id, (overdueByUser.get(row.user_id) ?? 0) + 1)
    }
  }

  const stalledUsers = new Set(
    userIds.filter((userId) => !events14.has(userId) && !outreach14.has(userId)),
  )

  const totalUsers = userIds.length
  const activationRate = toPercent(activeUsers.size, totalUsers)
  const prepUsageRate = toPercent(prepUsers.size, totalUsers)
  const totalOutreach30 = outreachRows.length
  const actionsPerUserPerWeek = totalUsers > 0 ? Number((totalOutreach30 / totalUsers / (30 / 7)).toFixed(1)) : 0
  const stallCount = stalledUsers.size
  const overdueActions = Array.from(overdueByUser.values()).reduce((sum, value) => sum + value, 0)
  const followupClosureRate = toPercent(closedFollowups, followUpRows.length)

  const partnerNameById = new Map(partners.map((row) => [row.id, row.name]))
  const cohortBuckets = new Map<string, { partnerName: string; cohort: string; users: Set<string> }>()
  for (const row of attributedRows) {
    const partnerName = partnerNameById.get(row.partner_id)
    if (!partnerName) continue
    const cohort = cohortKeyFromIso(row.attributed_at)
    const key = `${row.partner_id}::${cohort}`
    const existing = cohortBuckets.get(key)
    if (existing) {
      existing.users.add(row.signup_user_id)
      continue
    }
    cohortBuckets.set(key, { partnerName, cohort, users: new Set([row.signup_user_id]) })
  }

  const cohortRows = Array.from(cohortBuckets.values())
    .map((bucket) => {
      const scopedUsers = Array.from(bucket.users)
      const scopedCount = scopedUsers.length
      const scopedActive = scopedUsers.filter((id) => activeUsers.has(id)).length
      const scopedOverdue = scopedUsers.reduce((sum, id) => sum + (overdueByUser.get(id) ?? 0), 0)
      const scopedStalls = scopedUsers.filter((id) => stalledUsers.has(id)).length
      const scopedStatus = statusFromRate(toPercent(scopedActive, scopedCount))

      return {
        name: `${bucket.partnerName} · ${bucket.cohort}`,
        participants: scopedCount,
        activationRate: toPercent(scopedActive, scopedCount),
        overdue: scopedOverdue,
        stalls: scopedStalls,
        status: scopedStatus,
      }
    })
    .sort((a, b) => b.participants - a.participants)
    .slice(0, 8)

  const exceptionQueue = userIds
    .flatMap((userId) => {
      const entries: Array<{ participant: string; issue: string; severity: 'high' | 'medium' | 'low'; owner: string }> = []
      const participant = emailByUser.get(userId) ?? `User ${userId.slice(0, 8)}`
      const overdue = overdueByUser.get(userId) ?? 0

      if (stalledUsers.has(userId)) {
        entries.push({
          participant,
          issue: 'No activity in the last 14 days',
          severity: 'high',
          owner: 'Counselor team',
        })
      }
      if (overdue > 0) {
        entries.push({
          participant,
          issue: `${overdue} overdue follow-up action${overdue > 1 ? 's' : ''}`,
          severity: overdue > 1 ? 'high' : 'medium',
          owner: 'Counselor queue',
        })
      }
      if (!prepUsers.has(userId)) {
        entries.push({
          participant,
          issue: 'No prep brief usage in the last 30 days',
          severity: 'low',
          owner: 'Prep coaching lane',
        })
      }

      return entries
    })
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 }
      return rank[a.severity] - rank[b.severity]
    })
    .slice(0, 12)

  const LIVE_COHORT_HEALTH = [
    {
      label: 'Activation rate',
      value: `${Math.round(activationRate)}%`,
      status: statusFromRate(activationRate),
      benchmark: '70%+',
    },
    {
      label: 'Signal-driven actions (wk)',
      value: `${actionsPerUserPerWeek.toFixed(1)} avg`,
      status: actionsPerUserPerWeek >= 5 ? 'on_track' : actionsPerUserPerWeek >= 3 ? 'watch' : 'needs_attention',
      benchmark: '5+',
    },
    {
      label: 'Prep brief usage',
      value: `${Math.round(prepUsageRate)}%`,
      status: statusFromRate(prepUsageRate),
      benchmark: '60%+',
    },
    {
      label: 'Stall index',
      value: `${stallCount} of ${totalUsers}`,
      status: stallCount <= 2 ? 'on_track' : stallCount <= 4 ? 'watch' : 'needs_attention',
      benchmark: '<2',
    },
    {
      label: 'Follow-up closure rate',
      value: `${Math.round(followupClosureRate)}%`,
      status: statusFromRate(followupClosureRate),
      benchmark: '65%+',
    },
    {
      label: 'Overdue actions',
      value: `${overdueActions} open`,
      status: overdueActions === 0 ? 'on_track' : overdueActions <= 4 ? 'watch' : 'needs_attention',
      benchmark: '0',
    },
  ]

  const STATUS_STYLE = {
    on_track: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    watch: 'text-amber-700 bg-amber-50 border-amber-200',
    needs_attention: 'text-red-700 bg-red-50 border-red-200',
  } as const

  const EXCEPTION_QUEUE = [
    { participant: 'Exec A', issue: 'No signal action for 7 days', severity: 'high', owner: 'Counselor team' },
    { participant: 'Exec B', issue: 'Pipeline stalled at watching stage (3 weeks)', severity: 'medium', owner: 'Counselor 2' },
    { participant: 'Exec C', issue: 'Narrative drift detected - 3 versions in 2 weeks', severity: 'medium', owner: 'Counselor lead' },
    { participant: 'Exec D', issue: 'Overdue follow-up × 2', severity: 'low', owner: 'Counselor 1' },
    { participant: 'Exec E', issue: 'No brief review in 14 days', severity: 'low', owner: 'Unassigned' },
  ]

  const SEVERITY_STYLE = {
    high: 'border-red-300 bg-red-50',
    medium: 'border-amber-200 bg-amber-50',
    low: 'border-slate-200 bg-white',
  } as const

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[13px] font-semibold text-slate-300">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <nav className="flex items-center gap-4 text-[13px] text-slate-300">
            <Link href="/dashboard/outplacement/sponsor-report" className="hover:text-white transition-colors">Sponsor report</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
          <p className="text-[13px] font-semibold text-orange-500 mb-1">Outplacement operator console</p>
          <h1 className="text-[22px] font-bold text-slate-900 leading-tight">Program operations overview</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Cohort health, exceptions, and intervention queue for the current program cycle.
          </p>
        </div>

        {/* Cohort health KPIs */}
        <div>
          <h2 className="text-[13px] font-semibold text-slate-600 mb-3">Cohort health - current cycle</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LIVE_COHORT_HEALTH.map((item) => (
              <div key={item.label} className={`rounded-xl border p-4 ${STATUS_STYLE[item.status as keyof typeof STATUS_STYLE]}`}>
                <p className="text-[13px] font-semibold text-slate-500 mb-1">{item.label}</p>
                <p className="text-[22px] font-bold leading-none">{item.value}</p>
                <p className="text-[13px] mt-1 text-slate-400">Benchmark: {item.benchmark}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Exception queue */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-slate-600">Exception queue ({exceptionQueue.length})</h2>
            <span className="text-[13px] text-slate-400">Sorted by severity</span>
          </div>
          <div className="space-y-2">
            {exceptionQueue.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">
                No active exceptions in your scoped partner cohorts.
              </div>
            ) : exceptionQueue.map((item) => (
              <div key={item.participant} className={`rounded-xl border px-4 py-3 flex items-start gap-4 ${SEVERITY_STYLE[item.severity as keyof typeof SEVERITY_STYLE]}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900">{item.participant}</p>
                  <p className="text-[13px] text-slate-600 mt-0.5">{item.issue}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[13px] font-semibold ${
                    item.severity === 'high' ? 'bg-red-100 text-red-700' :
                    item.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>{item.severity}</span>
                  <p className="text-[13px] text-slate-400 mt-1">Owner: {item.owner}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cohort efficiency summary */}
        <div>
          <h2 className="text-[13px] font-semibold text-slate-600 mb-3">Cohort efficiency</h2>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Cohort', 'Participants', 'Activation rate', 'Overdue actions', 'Stall flags', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[13px] font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cohortRows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-slate-500" colSpan={6}>No attributed cohorts found for your partner scope yet.</td>
                  </tr>
                ) : cohortRows.map((c) => (
                  <tr key={c.name} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.participants}</td>
                    <td className="px-4 py-3 text-slate-600">{Math.round(c.activationRate)}%</td>
                    <td className={`px-4 py-3 font-semibold ${c.overdue > 0 ? 'text-red-600' : 'text-slate-400'}`}>{c.overdue}</td>
                    <td className={`px-4 py-3 font-semibold ${c.stalls > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{c.stalls}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[13px] font-semibold ${
                        c.status === 'on_track'
                          ? 'bg-emerald-100 text-emerald-700'
                          : c.status === 'watch'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}>{c.status.replace('_', ' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/dashboard/outplacement/firm-admin', label: 'Firm admin view', desc: 'Compare books, cohorts, and counselor load.' },
            { href: '/dashboard/outplacement/counselor', label: 'Counselor view', desc: 'Session prep and intervention queue.' },
            { href: '/dashboard/outplacement/enterprise', label: 'Enterprise view', desc: 'Sponsor-safe reporting and review cadence.' },
            { href: '/dashboard/outplacement/sponsor-report', label: 'Sponsor report', desc: 'Generate monthly sponsor-ready readout' },
            { href: '/for-outplacement/trust-pack', label: 'Trust pack', desc: 'Governance and procurement materials' },
            { href: '/for-outplacement/runbook', label: 'Runbook', desc: 'Operational runbook and escalation rules' },
          ].map(({ href, label, desc }) => (
            <Link key={href} href={href} className="rounded-xl border border-slate-200 bg-white px-4 py-4 hover:border-orange-300 transition-colors group">
              <p className="text-[13px] font-semibold text-slate-900 group-hover:text-orange-700 transition-colors">{label}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
