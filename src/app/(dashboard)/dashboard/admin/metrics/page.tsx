import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import {
  ACTION_SCORES,
  compositeScore,
  GROUP_LABELS,
  type ScoreGroup,
} from '@/lib/action-scores'
import { MetricsCharts, type WeekRow, type EventDetail } from './metrics-charts'

function weekOf(isoDate: string): string {
  const d = new Date(isoDate)
  const day = d.getUTCDay()
  const offset = day === 0 ? 6 : day - 1
  const mon = new Date(d)
  mon.setUTCDate(d.getUTCDate() - offset)
  return mon.toISOString().split('T')[0]
}

function last12Weeks(): string[] {
  const weeks = new Set<string>()
  const now = new Date()
  for (let i = 0; i < 84; i++) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    weeks.add(weekOf(d.toISOString()))
  }
  return [...weeks].sort()
}

function ScoreBadge({ value, highGood }: { value: number; highGood: boolean }) {
  const good = highGood ? value >= 8 : value <= 3
  const mid  = highGood ? value >= 5 : value <= 6
  return (
    <span className={`font-bold ${good ? 'text-green-600' : mid ? 'text-amber-600' : 'text-red-500'}`}>
      {value}
    </span>
  )
}

export const metadata = { title: 'Action Scores - Admin' }

export default async function MetricsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()
  const now = Date.now()
  const since7d  = new Date(now - 7  * 86_400_000).toISOString()
  const since30d = new Date(now - 30 * 86_400_000).toISOString()
  const since84d = new Date(now - 84 * 86_400_000).toISOString()

  const { data: rows84d } = await admin
    .from('user_events')
    .select('event_name, created_at')
    .gte('created_at', since84d)
    .limit(50000)

  const rows = rows84d ?? []

  // Per-event counts
  const counts30d: Record<string, number> = {}
  const counts7d:  Record<string, number> = {}
  for (const e of rows) {
    if (e.created_at >= since30d) counts30d[e.event_name] = (counts30d[e.event_name] ?? 0) + 1
    if (e.created_at >= since7d)  counts7d[e.event_name]  = (counts7d[e.event_name]  ?? 0) + 1
  }

  // Scored event list
  const allScored = Object.entries(ACTION_SCORES).map(([name, score]) => ({
    event_name: name,
    ...score,
    count30d: counts30d[name] ?? 0,
    count7d:  counts7d[name]  ?? 0,
    composite: compositeScore(score),
  }))

  const byCScore = [...allScored].sort((a, b) => b.composite - a.composite)
  const top3    = byCScore.slice(0, 3)
  const bottom3 = byCScore.slice(-3).reverse()

  const byGroup: Record<string, typeof allScored> = {}
  for (const item of allScored) {
    if (!byGroup[item.group]) byGroup[item.group] = []
    byGroup[item.group].push(item)
  }

  // Weekly time-series by group
  const weekKeys = last12Weeks()
  type Counts = Record<string, number>
  const weekly: Record<string, Counts> = {}
  for (const w of weekKeys) {
    weekly[w] = { onboarding: 0, pipeline: 0, intelligence: 0, signals: 0, communication: 0, profile: 0 }
  }
  for (const e of rows) {
    const w = weekOf(e.created_at)
    if (!weekly[w]) continue
    const score = ACTION_SCORES[e.event_name]
    if (!score) continue
    weekly[w][score.group] = (weekly[w][score.group] ?? 0) + 1
  }
  const weeklyData: WeekRow[] = weekKeys.map(w => ({
    week: w.slice(5),
    onboarding:    weekly[w].onboarding    ?? 0,
    pipeline:      weekly[w].pipeline      ?? 0,
    intelligence:  weekly[w].intelligence  ?? 0,
    signals:       weekly[w].signals       ?? 0,
    communication: weekly[w].communication ?? 0,
    profile:       weekly[w].profile       ?? 0,
  }))

  // groupDetails for drill-down
  const groupDetails: Record<string, EventDetail[]> = {}
  for (const [group, items] of Object.entries(byGroup)) {
    groupDetails[group] = items.map(i => ({
      event_name:     i.event_name,
      label:          i.label,
      count30d:       i.count30d,
      count7d:        i.count7d,
      emotion:        i.emotion,
      cognitive_load: i.cognitive_load,
      retention:      i.retention,
      composite:      i.composite,
    }))
  }

  const GROUP_ORDER: ScoreGroup[] = [
    'onboarding', 'pipeline', 'intelligence', 'signals', 'communication', 'profile',
  ]

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              ← Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Action Scores</h1>
          <p className="text-[13px] text-slate-500 mt-1.5 max-w-xl">
            Every tracked user action rated on three dimensions. Composite = emotion + retention &minus; cognitive load.
            Faded rows have zero events in the last 30 days.
          </p>
        </div>

        {/* Score methodology */}
        <div className="bg-white border border-slate-200 rounded p-5 mb-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">Score definitions</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: 'Emotion',       desc: 'Does this action make the user feel something? 1 = administrative, 10 = peak emotional moment (offer accepted, first prep brief).' },
              { label: 'Cognitive load', desc: 'Mental effort to complete the action (NASA-TLX simplified). 1 = one click, 10 = complex form with judgment required. Lower is better UX.' },
              { label: 'Retention',     desc: 'Impact on subscription renewal probability. 1 = no influence, 10 = strong predictor of continued payment.' },
            ].map(({ label, desc }) => (
              <div key={label}>
                <p className="text-[12px] font-bold text-slate-900 mb-1">{label}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top and bottom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-green-200 rounded p-5">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-green-600 mb-3">Highest composite</div>
            {top3.map(row => (
              <div key={row.event_name} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">{row.label}</p>
                  <p className="text-[11px] text-slate-400">{GROUP_LABELS[row.group as ScoreGroup]} &middot; {row.count30d} last 30d</p>
                </div>
                <span className="text-[22px] font-bold text-green-600 ml-4 shrink-0">{row.composite}</span>
              </div>
            ))}
          </div>
          <div className="bg-white border border-red-100 rounded p-5">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-red-500 mb-3">Lowest composite — review for friction or low impact</div>
            {bottom3.map(row => (
              <div key={row.event_name} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">{row.label}</p>
                  <p className="text-[11px] text-slate-400">{GROUP_LABELS[row.group as ScoreGroup]} &middot; {row.count30d} last 30d</p>
                </div>
                <span className="text-[22px] font-bold text-red-500 ml-4 shrink-0">{row.composite}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full report by group */}
        {GROUP_ORDER.map(group => {
          const items = byGroup[group]
          if (!items) return null
          const sorted = [...items].sort((a, b) => b.composite - a.composite)
          return (
            <div key={group} className="bg-white border border-slate-200 rounded overflow-hidden mb-4">
              <div className="px-6 py-[14px] border-b border-slate-200">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                  {GROUP_LABELS[group]}
                </span>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-2 font-semibold text-slate-400">Action</th>
                    <th className="px-4 py-2 font-semibold text-slate-400 text-right">30d</th>
                    <th className="px-4 py-2 font-semibold text-slate-400 text-right">7d</th>
                    <th className="px-4 py-2 font-semibold text-slate-400 text-right">Emotion</th>
                    <th className="px-4 py-2 font-semibold text-slate-400 text-right">Cog load</th>
                    <th className="px-4 py-2 font-semibold text-slate-400 text-right">Retention</th>
                    <th className="px-4 py-2 font-semibold text-slate-400 text-right">Composite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sorted.map(row => (
                    <tr key={row.event_name} className={row.count30d === 0 ? 'opacity-40' : ''}>
                      <td className="px-6 py-3 text-slate-700 font-medium">{row.label}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">{row.count30d}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{row.count7d}</td>
                      <td className="px-4 py-3 text-right"><ScoreBadge value={row.emotion} highGood /></td>
                      <td className="px-4 py-3 text-right"><ScoreBadge value={row.cognitive_load} highGood={false} /></td>
                      <td className="px-4 py-3 text-right"><ScoreBadge value={row.retention} highGood /></td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">{row.composite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}

        {/* Trend dashboard */}
        <div className="bg-white border border-slate-200 rounded p-6 mt-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">
            Weekly Event Volume by Group (12 weeks)
          </div>
          <p className="text-[12px] text-slate-400 mb-6">
            Click a group button below the chart to drill into event-level detail.
          </p>
          <MetricsCharts weeklyData={weeklyData} groupDetails={groupDetails} />
        </div>

      </main>
    </div>
  )
}
