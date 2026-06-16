import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Firm Admin View | Starting Monday',
  description: 'Compare by book and by cohort to manage counselor load, quality, and program consistency.',
}

type PartnerRow = { id: string; name: string }
type AttributionRow = { partner_id: string; signup_user_id: string; attributed_at: string }
type UserEventRow = { user_id: string; created_at: string }
type OutreachRow = { user_id: string; sent_at: string }
type FollowUpRow = { user_id: string; due_date: string; status: string; next_action_status: string }

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function toPercent(numerator: number, denominator: number): number {
  if (!denominator) return 0
  return Number(((numerator / denominator) * 100).toFixed(1))
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

function riskLabel(rate: number): 'on_track' | 'watch' | 'needs_attention' {
  if (rate >= 70) return 'on_track'
  if (rate >= 45) return 'watch'
  return 'needs_attention'
}

export default async function FirmAdminViewPage() {
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

  const [eventsRes, outreachRes, followUpsRes] = userIds.length > 0
    ? await Promise.all([
      supabase.from('user_events').select('user_id, created_at').in('user_id', userIds).gte('created_at', since30).limit(200000),
      supabase.from('outreach_logs').select('user_id, sent_at').in('user_id', userIds).gte('sent_at', since30).limit(200000),
      supabase.from('follow_ups').select('user_id, due_date, status, next_action_status').in('user_id', userIds).limit(200000),
    ])
    : [
      { data: [] as UserEventRow[] },
      { data: [] as OutreachRow[] },
      { data: [] as FollowUpRow[] },
    ]

  const eventRows = (eventsRes.data ?? []) as UserEventRow[]
  const outreachRows = (outreachRes.data ?? []) as OutreachRow[]
  const followUpRows = (followUpsRes.data ?? []) as FollowUpRow[]

  const events14 = new Set(eventRows.filter((row) => row.created_at >= since14).map((row) => row.user_id))
  const outreach14 = new Set(outreachRows.filter((row) => row.sent_at >= since14).map((row) => row.user_id))
  const activeUsers = new Set<string>([...events14, ...outreach14])

  const overdueByUser = new Map<string, number>()
  for (const row of followUpRows) {
    const status = normalizeStatus(row.next_action_status || row.status)
    if (status === 'done' || status === 'completed' || status === 'sent') continue
    if (row.due_date < nowIso) {
      overdueByUser.set(row.user_id, (overdueByUser.get(row.user_id) ?? 0) + 1)
    }
  }

  const stalledUsers = new Set(
    userIds.filter((userId) => !events14.has(userId) && !outreach14.has(userId)),
  )

  const usersByPartner = new Map<string, Set<string>>()
  const usersByCohort = new Map<string, Set<string>>()
  const partnerNameById = new Map(partners.map((row) => [row.id, row.name]))

  for (const row of attributedRows) {
    const partnerName = partnerNameById.get(row.partner_id)
    if (!partnerName) continue
    const partnerSet = usersByPartner.get(row.partner_id) ?? new Set<string>()
    partnerSet.add(row.signup_user_id)
    usersByPartner.set(row.partner_id, partnerSet)

    const cohortKey = cohortKeyFromIso(row.attributed_at)
    const cohortMapKey = `${row.partner_id}::${cohortKey}`
    const cohortSet = usersByCohort.get(cohortMapKey) ?? new Set<string>()
    cohortSet.add(row.signup_user_id)
    usersByCohort.set(cohortMapKey, cohortSet)
  }

  const BOOK_ROWS = partners
    .map((partner) => {
      const scopedUsers = Array.from(usersByPartner.get(partner.id) ?? new Set<string>())
      const scopedCount = scopedUsers.length
      const activation = toPercent(scopedUsers.filter((id) => activeUsers.has(id)).length, scopedCount)
      const overdue = scopedUsers.reduce((sum, id) => sum + (overdueByUser.get(id) ?? 0), 0)
      const stalls = scopedUsers.filter((id) => stalledUsers.has(id)).length
      const cohortCount = Array.from(usersByCohort.keys()).filter((key) => key.startsWith(`${partner.id}::`)).length
      const note =
        stalls > 0
          ? `${stalls} stalled participant${stalls > 1 ? 's' : ''}; prioritize intervention cadence.`
          : overdue > 0
            ? `${overdue} overdue action${overdue > 1 ? 's' : ''}; monitor follow-up closure.`
            : 'Healthy momentum with no active stall flags.'

      return {
        book: partner.name,
        coaches: scopedCount,
        cohorts: cohortCount,
        on_track: `${Math.round(activation)}%`,
        note,
      }
    })
    .sort((a, b) => b.coaches - a.coaches)

  const COHORT_ROWS = Array.from(usersByCohort.entries())
    .map(([key, userSet]) => {
      const [partnerId, cohort] = key.split('::')
      const partnerName = partnerNameById.get(partnerId) ?? 'Unknown partner'
      const scopedUsers = Array.from(userSet)
      const scopedCount = scopedUsers.length
      const activeCount = scopedUsers.filter((id) => activeUsers.has(id)).length
      const activation = toPercent(activeCount, scopedCount)
      const actionRate = scopedCount > 0 ? Number((outreachRows.filter((row) => userSet.has(row.user_id)).length / scopedCount / (30 / 7)).toFixed(1)) : 0

      return {
        cohort: `${partnerName} · ${cohort}`,
        activation: `${Math.round(activation)}%`,
        action_rate: actionRate.toFixed(1),
        risk: riskLabel(activation),
      }
    })
    .sort((a, b) => Number(b.activation.replace('%', '')) - Number(a.activation.replace('%', '')))

  const openExceptions = Array.from(overdueByUser.values()).reduce((sum, value) => sum + value, 0) + stalledUsers.size

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard/outplacement" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 text-[13px] text-slate-300">
            <Link href="/dashboard/outplacement/operator" className="hover:text-white transition-colors">Operator console</Link>
            <Link href="/dashboard/outplacement/counselor" className="hover:text-white transition-colors">Counselor view</Link>
            <Link href="/dashboard/outplacement/enterprise" className="hover:text-white transition-colors">Enterprise view</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">Firm admin view</p>
          <h1 className="text-[24px] font-bold text-slate-900 leading-tight">Compare by book and by cohort</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Practice leaders can compare counselor load, cohort consistency, and risk patterns without digging into individual participant records.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Active books', value: String(partners.length) },
            { label: 'Cohorts in review', value: String(COHORT_ROWS.length) },
            { label: 'Open exceptions', value: String(openExceptions) },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">{card.label}</p>
              <p className="mt-1 text-[28px] font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-500">Compare by book</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {BOOK_ROWS.length === 0 ? (
              <div className="px-5 py-4 text-[13px] text-slate-500">No partner books found for your scope yet.</div>
            ) : BOOK_ROWS.map((row) => (
              <div key={row.book} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1.8fr] gap-3 px-5 py-4">
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">{row.book}</p>
                  <p className="text-[12px] text-slate-500 mt-1">{row.note}</p>
                </div>
                <div className="text-[13px] text-slate-700">{row.coaches} counselors</div>
                <div className="text-[13px] text-slate-700">{row.cohorts} cohorts</div>
                <div className="text-[13px] font-semibold text-slate-900">On track: {row.on_track}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-500">Compare by cohort</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {COHORT_ROWS.length === 0 ? (
              <div className="px-5 py-4 text-[13px] text-slate-500">No cohorts in review yet.</div>
            ) : COHORT_ROWS.map((row) => (
              <div key={row.cohort} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-3 px-5 py-4 items-center">
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">{row.cohort}</p>
                  <p className="text-[12px] text-slate-500 mt-1">Review activation, action velocity, and narrative drift together.</p>
                </div>
                <div className="text-[13px] text-slate-700">Activation {row.activation}</div>
                <div className="text-[13px] text-slate-700">Actions {row.action_rate}/wk</div>
                <div className={`text-[13px] font-semibold capitalize ${
                  row.risk === 'on_track'
                    ? 'text-emerald-700'
                    : row.risk === 'watch'
                      ? 'text-amber-700'
                      : 'text-red-700'
                }`}>{row.risk}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
