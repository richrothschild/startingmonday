import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember, getAllStaff } from '@/lib/staff'
import { FunnelChart, EventVolumeChart } from './admin-charts'

const STEP_LABELS: Record<string, string> = {
  a1_resume:   'Resume uploaded',
  a2_company:  'Company added',
  a3_prep:     'Prep brief generated',
  a4_contact:  'Contact added',
  a5_briefing: 'Briefing configured',
  a6_follow_up:'Follow-up set',
}

const INTERNAL_PAGES = [
  { path: '/dashboard/admin',        label: 'Admin Hub',           owner: 'rw', admin: 'r',  viewer: '-' },
  { path: '/dashboard/admin/team',   label: 'Team Management',     owner: 'rw', admin: 'r',  viewer: '-' },
  { path: '/dashboard/admin',        label: 'Analytics',           owner: 'rw', admin: 'rw', viewer: 'r' },
]

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const adminClient = createAdminClient()
  const since7d  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString()
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: activeUsers },
    { data: profiles },
    { data: events7d },
    { data: events30d },
    { count: totalUsers },
    { count: paidUsers },
    { count: trialingUsers },
    teamMembers,
  ] = await Promise.all([
    adminClient.from('users').select('id').in('subscription_status', ['trialing', 'active']),
    adminClient.from('user_profiles').select('user_id, resume_text, positioning_summary, briefing_time'),
    adminClient.from('user_events').select('event_name').gte('created_at', since7d),
    adminClient.from('user_events').select('event_name').gte('created_at', since30d),
    adminClient.from('users').select('id', { count: 'exact', head: true }),
    adminClient.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    adminClient.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'trialing'),
    getAllStaff(),
  ])

  const activeUserIds = new Set((activeUsers ?? []).map(u => u.id))
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
    { count: a2Count }, { count: a3Count }, { count: a4Count }, { count: a6Count },
  ] = await Promise.all([
    adminClient.from('companies').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList).is('archived_at', null),
    adminClient.from('briefs').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList).eq('type', 'prep'),
    adminClient.from('contacts').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList),
    adminClient.from('follow_ups').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList),
  ])

  const denominator = activeUserIds.size || 1
  const funnelData = [
    { step: 'a1_resume',    label: 'Resume',    count: a1 },
    { step: 'a2_company',   label: 'Company',   count: a2Count ?? 0 },
    { step: 'a3_prep',      label: 'Brief',     count: a3Count ?? 0 },
    { step: 'a4_contact',   label: 'Contact',   count: a4Count ?? 0 },
    { step: 'a5_briefing',  label: 'Briefing',  count: a5 },
    { step: 'a6_follow_up', label: 'Follow-up', count: a6Count ?? 0 },
  ]

  const eventCounts7d  = (events7d  ?? []).reduce<Record<string, number>>((acc, e) => { acc[e.event_name] = (acc[e.event_name] ?? 0) + 1; return acc }, {})
  const eventCounts30d = (events30d ?? []).reduce<Record<string, number>>((acc, e) => { acc[e.event_name] = (acc[e.event_name] ?? 0) + 1; return acc }, {})
  const eventVolumeData = Object.entries(eventCounts30d).sort((a, b) => b[1] - a[1]).map(([event_name, count]) => ({ event_name, count }))

  const roleBadge = (role: string) =>
    role === 'owner' ? 'bg-amber-50 text-amber-700' :
    role === 'admin' ? 'bg-blue-50 text-blue-700' :
    'bg-slate-100 text-slate-500'

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">Starting Monday</span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/team" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Team</Link>
            <Link href="/dashboard" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">← Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Admin</h1>
            <p className="text-[13px] text-slate-500 mt-1.5">
              Signed in as <span className="font-semibold">{user.email}</span>
              <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded ${roleBadge(staff.role)}`}>{staff.role}</span>
            </p>
          </div>
          {staff.role === 'owner' && (
            <Link href="/dashboard/admin/team" className="text-[13px] font-semibold text-slate-900 bg-white border border-slate-200 hover:border-slate-400 px-4 py-2 rounded transition-colors shrink-0">
              Manage team
            </Link>
          )}
        </div>

        {/* Subscriber summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total users',   value: totalUsers    ?? 0 },
            { label: 'Active (paid)', value: paidUsers     ?? 0 },
            { label: 'Trialing',      value: trialingUsers ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-slate-200 rounded p-5">
              <div className="text-[28px] font-bold text-slate-900">{value}</div>
              <div className="text-[12px] text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Team summary */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Team</span>
            <Link href="/dashboard/admin/team" className="text-[12px] text-slate-500 hover:text-slate-700">Manage →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {teamMembers.map(m => (
              <div key={m.id} className="px-6 py-3 flex items-center justify-between">
                <span className="text-[13px] text-slate-900">{m.email}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${roleBadge(m.role)}`}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Internal pages + permissions */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-6 py-[18px] border-b border-slate-200">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Internal Pages</span>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left">
                <th className="px-6 py-2.5 font-semibold text-slate-400">Page</th>
                <th className="px-4 py-2.5 font-semibold text-amber-600 text-center">Owner</th>
                <th className="px-4 py-2.5 font-semibold text-blue-600 text-center">Admin</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {INTERNAL_PAGES.map((p, i) => (
                <tr key={i}>
                  <td className="px-6 py-3">
                    <Link href={p.path} className="text-slate-900 font-semibold hover:text-slate-600">{p.label}</Link>
                    <span className="ml-2 text-slate-300 font-mono text-[11px]">{p.path}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-amber-600">{p.owner}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-600">{p.admin}</td>
                  <td className="px-4 py-3 text-center text-slate-300">{p.viewer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Six-actions funnel */}
        <div className="bg-white border border-slate-200 rounded p-6 mb-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Six-Actions Funnel</div>
          <p className="text-[12px] text-slate-400 mb-6">Trialing + active users (n={activeUserIds.size})</p>
          <FunnelChart data={funnelData} />
          <table className="w-full mt-4 text-[12px]">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-1 font-semibold">Step</th>
                <th className="py-1 font-semibold text-right">Users</th>
                <th className="py-1 font-semibold text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {funnelData.map(row => (
                <tr key={row.step}>
                  <td className="py-2 text-slate-700">{STEP_LABELS[row.step] ?? row.step}</td>
                  <td className="py-2 text-right font-semibold text-slate-900">{row.count}</td>
                  <td className="py-2 text-right text-slate-400">{Math.round((row.count / denominator) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Event volume */}
        <div className="bg-white border border-slate-200 rounded p-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Event Volume (30d)</div>
          <p className="text-[12px] text-slate-400 mb-6">7d counts in right column</p>
          {eventVolumeData.length === 0 ? (
            <p className="text-[13px] text-slate-400">No events yet.</p>
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

      </main>
    </div>
  )
}
