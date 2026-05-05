import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { FunnelChart, EventVolumeChart } from './admin-charts'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

const STEP_LABELS: Record<string, string> = {
  a1_resume: 'Resume uploaded',
  a2_company: 'Company added',
  a3_prep: 'Prep brief generated',
  a4_contact: 'Contact added',
  a5_briefing: 'Briefing configured',
  a6_follow_up: 'Follow-up set',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL) notFound()

  const admin = createAdminClient()
  const since7d  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString()
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: users },
    { data: profiles },
    { data: events7d },
    { data: events30d },
    { count: totalUsers },
    { count: activeUsers },
    { count: trialingUsers },
  ] = await Promise.all([
    admin.from('users').select('id').in('subscription_status', ['trialing', 'active']),
    admin.from('user_profiles').select('user_id, resume_text, positioning_summary, briefing_time'),
    admin.from('user_events').select('event_name').gte('created_at', since7d),
    admin.from('user_events').select('event_name').gte('created_at', since30d),
    admin.from('users').select('id', { count: 'exact', head: true }),
    admin.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    admin.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'trialing'),
  ])

  const activeUserIds = new Set((users ?? []).map(u => u.id))
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

  let a1 = 0, a5 = 0
  for (const uid of activeUserIds) {
    const p = profileMap[uid]
    if (!p) continue
    if ((p.resume_text?.length ?? 0) >= 200 || (p.positioning_summary?.length ?? 0) >= 100) a1++
    if (p.briefing_time) a5++
  }

  const userIdList = [...activeUserIds]

  const [
    { count: a2Count },
    { count: a3Count },
    { count: a4Count },
    { count: a6Count },
  ] = await Promise.all([
    admin.from('companies').select('user_id', { count: 'exact', head: true })
      .in('user_id', userIdList).is('archived_at', null),
    admin.from('briefs').select('user_id', { count: 'exact', head: true })
      .in('user_id', userIdList).eq('type', 'prep'),
    admin.from('contacts').select('user_id', { count: 'exact', head: true })
      .in('user_id', userIdList),
    admin.from('follow_ups').select('user_id', { count: 'exact', head: true })
      .in('user_id', userIdList),
  ])

  const denominator = activeUserIds.size || 1
  const funnelData = [
    { step: 'a1_resume',    label: 'Resume',     count: a1 },
    { step: 'a2_company',   label: 'Company',    count: a2Count ?? 0 },
    { step: 'a3_prep',      label: 'Brief',      count: a3Count ?? 0 },
    { step: 'a4_contact',   label: 'Contact',    count: a4Count ?? 0 },
    { step: 'a5_briefing',  label: 'Briefing',   count: a5 },
    { step: 'a6_follow_up', label: 'Follow-up',  count: a6Count ?? 0 },
  ]

  const eventCounts7d = (events7d ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.event_name] = (acc[e.event_name] ?? 0) + 1
    return acc
  }, {})
  const eventCounts30d = (events30d ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.event_name] = (acc[e.event_name] ?? 0) + 1
    return acc
  }, {})

  const eventVolumeData = Object.entries(eventCounts30d)
    .sort((a, b) => b[1] - a[1])
    .map(([event_name, count]) => ({ event_name, count }))

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <Link href="/dashboard" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Admin</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">Internal analytics — not visible to users.</p>
        </div>

        {/* Subscriber summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total users',    value: totalUsers   ?? 0 },
            { label: 'Active (paid)',  value: activeUsers  ?? 0 },
            { label: 'Trialing',       value: trialingUsers ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-slate-200 rounded p-5">
              <div className="text-[28px] font-bold text-slate-900">{value}</div>
              <div className="text-[12px] text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Six-actions funnel */}
        <div className="bg-white border border-slate-200 rounded p-6 mb-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">
            Six-Actions Funnel
          </div>
          <p className="text-[12px] text-slate-400 mb-6">
            Users with at least one record per step (trialing + active, n={activeUserIds.size})
          </p>
          <FunnelChart data={funnelData} />
          <table className="w-full mt-4 text-[12px]">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-1 font-semibold">Step</th>
                <th className="py-1 font-semibold text-right">Users</th>
                <th className="py-1 font-semibold text-right">% of total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {funnelData.map(row => (
                <tr key={row.step}>
                  <td className="py-2 text-slate-700">{STEP_LABELS[row.step] ?? row.step}</td>
                  <td className="py-2 text-right font-semibold text-slate-900">{row.count}</td>
                  <td className="py-2 text-right text-slate-400">
                    {Math.round((row.count / denominator) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Event volume */}
        <div className="bg-white border border-slate-200 rounded p-6 mb-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">
            Event Volume (last 30 days)
          </div>
          <p className="text-[12px] text-slate-400 mb-6">
            All user_events rows by type — last 7d in parens
          </p>
          {eventVolumeData.length === 0 ? (
            <p className="text-[13px] text-slate-400">No events recorded yet.</p>
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
        </div>

        {/* Signal-to-action */}
        <div className="bg-white border border-slate-200 rounded p-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">
            Signal-to-Action Conversion
          </div>
          <p className="text-[12px] text-slate-400">
            Tracks when a signal leads to outreach, a brief, or a contact add within 48h.
            Data populates as signal_action_events are logged by the product.
          </p>
        </div>

      </main>
    </div>
  )
}
