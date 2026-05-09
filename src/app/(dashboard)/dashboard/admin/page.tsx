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
  { path: '/dashboard/admin',                  label: 'Admin Hub',           owner: 'rw', admin: 'r',  viewer: '-' },
  { path: '/dashboard/admin/team',             label: 'Team Management',     owner: 'rw', admin: 'r',  viewer: '-' },
  { path: '/dashboard/admin',                  label: 'Analytics',           owner: 'rw', admin: 'rw', viewer: 'r' },
  { path: '/dashboard/admin/intelligence',     label: 'Intelligence (B2B)',  owner: 'rw', admin: 'rw', viewer: '-' },
  { path: '/dashboard/admin/traces',           label: 'LLM Traces / Evals',  owner: 'rw', admin: 'rw', viewer: '-' },
  { path: '/dashboard/admin/social',           label: 'LinkedIn Social',      owner: 'rw', admin: 'rw', viewer: '-' },
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
    { data: partnerRows },
  ] = await Promise.all([
    adminClient.from('users').select('id').in('subscription_status', ['trialing', 'active']),
    adminClient.from('user_profiles').select('user_id, positioning_summary, briefing_time'),
    adminClient.from('user_events').select('event_name').gte('created_at', since7d).limit(5000),
    adminClient.from('user_events').select('event_name').gte('created_at', since30d).limit(5000),
    adminClient.from('users').select('id', { count: 'exact', head: true }),
    adminClient.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    adminClient.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'trialing'),
    getAllStaff(),
    adminClient.from('partners').select('id, name, email, referral_code, commission_pct, is_active, created_at').order('created_at', { ascending: false }),
  ])

  const activeUserIds = new Set((activeUsers ?? []).map(u => u.id))
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

  let a1 = 0, a5 = 0
  for (const uid of activeUserIds) {
    const p = profileMap[uid]
    if (!p) continue
    if ((p.positioning_summary?.length ?? 0) >= 100) a1++
    if (p.briefing_time) a5++
  }

  const userIdList = [...activeUserIds]
  const [
    { count: a2Count }, { count: a3Count }, { count: a4Count }, { count: a6Count },
    { data: endedTrials },
    { data: allSignals },
    { data: signalActions },
    { data: qualityLogs },
    { data: activeTrials },
  ] = await Promise.all([
    adminClient.from('companies').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList).is('archived_at', null),
    adminClient.from('briefs').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList).eq('type', 'prep'),
    adminClient.from('contacts').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList),
    adminClient.from('follow_ups').select('user_id', { count: 'exact', head: true }).in('user_id', userIdList),
    adminClient.from('users').select('subscription_status, plan_at_trial_end').not('trial_ends_at', 'is', null).lt('trial_ends_at', new Date().toISOString()),
    adminClient.from('company_signals').select('id, signal_type').limit(2000),
    adminClient.from('signal_action_events').select('signal_id, action_type').limit(2000),
    adminClient.from('brief_quality_log').select('context_score, has_resume, has_scan_result, has_contacts, word_count').gte('created_at', since30d).limit(500),
    adminClient.from('users').select('id, email, created_at, trial_ends_at, signup_source').eq('subscription_status', 'trialing').gt('trial_ends_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(50),
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

  // Active trial users: enrich with company status
  const trialUsers = activeTrials ?? []
  const trialUserIds = trialUsers.map(u => u.id)
  let trialCompanySet = new Set<string>()
  if (trialUserIds.length > 0) {
    const { data: trialCompanyRows } = await adminClient.from('companies').select('user_id').in('user_id', trialUserIds).is('archived_at', null)
    trialCompanySet = new Set((trialCompanyRows ?? []).map(r => r.user_id))
  }

  // Partners: attribution counts
  const partners = (partnerRows ?? []) as { id: string; name: string; email: string; referral_code: string; commission_pct: number; is_active: boolean; created_at: string }[]
  const partnerIds = partners.map(p => p.id)
  let attributionsByPartner: Record<string, { total: number; active: number; mrr: number }> = {}
  if (partnerIds.length > 0) {
    const { data: attrRows } = await adminClient
      .from('referral_attributions')
      .select('partner_id, signup_user_id')
      .in('partner_id', partnerIds)
    const attrUserIds = (attrRows ?? []).map(a => a.signup_user_id)
    let userStatusMap: Record<string, { status: string; tier: string }> = {}
    if (attrUserIds.length > 0) {
      const { data: attrUsers } = await adminClient
        .from('users')
        .select('id, subscription_status, subscription_tier')
        .in('id', attrUserIds)
      userStatusMap = Object.fromEntries((attrUsers ?? []).map(u => [u.id, { status: u.subscription_status, tier: u.subscription_tier ?? '' }]))
    }
    const TIER_MRR: Record<string, number> = { passive: 49, active: 129, executive: 249 }
    for (const attr of (attrRows ?? [])) {
      if (!attributionsByPartner[attr.partner_id]) attributionsByPartner[attr.partner_id] = { total: 0, active: 0, mrr: 0 }
      attributionsByPartner[attr.partner_id].total++
      const u = userStatusMap[attr.signup_user_id]
      if (u?.status === 'active') {
        attributionsByPartner[attr.partner_id].active++
        attributionsByPartner[attr.partner_id].mrr += TIER_MRR[u.tier] ?? 0
      }
    }
  }

  // Trial conversion
  const trialsEnded = endedTrials ?? []
  const totalEnded = trialsEnded.length
  const totalConverted = trialsEnded.filter(u => u.subscription_status === 'active').length
  const conversionRate = totalEnded > 0 ? Math.round((totalConverted / totalEnded) * 100) : null

  // Signal → action rate by signal type
  const actedSignalIds = new Set((signalActions ?? []).map((a: { signal_id: string }) => a.signal_id).filter(Boolean))
  const signalTypeCounts: Record<string, { total: number; acted: number }> = {}
  for (const s of (allSignals ?? []) as { id: string; signal_type: string }[]) {
    if (!signalTypeCounts[s.signal_type]) signalTypeCounts[s.signal_type] = { total: 0, acted: 0 }
    signalTypeCounts[s.signal_type].total++
    if (actedSignalIds.has(s.id)) signalTypeCounts[s.signal_type].acted++
  }
  const signalRows = Object.entries(signalTypeCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([type, counts]) => ({
      type,
      label: type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      total: counts.total,
      acted: counts.acted,
      rate: counts.total > 0 ? Math.round((counts.acted / counts.total) * 100) : 0,
    }))

  // Brief quality
  const logs = qualityLogs ?? []
  const avgContextScore = logs.length > 0
    ? Math.round(logs.reduce((sum: number, l: { context_score: number | null }) => sum + (l.context_score ?? 0), 0) / logs.length)
    : null
  const pctResume   = logs.length > 0 ? Math.round(logs.filter((l: { has_resume: boolean }) => l.has_resume).length / logs.length * 100) : null
  const pctScan     = logs.length > 0 ? Math.round(logs.filter((l: { has_scan_result: boolean }) => l.has_scan_result).length / logs.length * 100) : null
  const pctContacts = logs.length > 0 ? Math.round(logs.filter((l: { has_contacts: boolean }) => l.has_contacts).length / logs.length * 100) : null
  const wordCountLogs = logs.filter((l: { word_count: number | null }) => l.word_count)
  const avgWords = wordCountLogs.length > 0
    ? Math.round(wordCountLogs.reduce((sum: number, l: { word_count: number | null }) => sum + (l.word_count ?? 0), 0) / wordCountLogs.length)
    : null

  const roleBadge = (role: string) =>
    role === 'owner' ? 'bg-amber-50 text-amber-700' :
    role === 'admin' ? 'bg-blue-50 text-blue-700' :
    'bg-slate-100 text-slate-500'

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/social" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Social</Link>
            <Link href="/dashboard/admin/traces" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Traces</Link>
            <Link href="/dashboard/admin/team" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Team</Link>
            <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">← Dashboard</Link>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
        <div className="bg-white border border-slate-200 rounded p-6 mb-6">
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

        {/* Trial conversion */}
        <div className="bg-white border border-slate-200 rounded p-6 mb-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Trial Conversion</div>
          <p className="text-[12px] text-slate-400 mb-5">Users whose 30-day trial window has closed</p>
          {totalEnded === 0 ? (
            <p className="text-[13px] text-slate-400">No ended trials yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Trials ended', value: String(totalEnded), highlight: false },
                { label: 'Converted to paid', value: String(totalConverted), highlight: false },
                { label: 'Conversion rate', value: conversionRate !== null ? `${conversionRate}%` : '—', highlight: true, rate: conversionRate },
              ].map(({ label, value, highlight, rate }) => (
                <div key={label}>
                  <div className={`text-[28px] font-bold ${
                    highlight && rate !== null && rate !== undefined
                      ? rate >= 40 ? 'text-green-600' : rate >= 20 ? 'text-amber-600' : 'text-red-600'
                      : 'text-slate-900'
                  }`}>{value}</div>
                  <div className="text-[12px] text-slate-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active trial users */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-6 py-[18px] border-b border-slate-200">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Active Trials ({trialUsers.length})</span>
          </div>
          {trialUsers.length === 0 ? (
            <p className="px-6 py-5 text-[13px] text-slate-400">No active trials.</p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-6 py-2.5 font-semibold text-slate-400">Email</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400">Started</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400">Days left</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400">Companies</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {trialUsers.map(u => {
                  const daysLeft = u.trial_ends_at
                    ? Math.max(0, Math.round((new Date(u.trial_ends_at).getTime() - Date.now()) / 86400000))
                    : null
                  const daysIn = u.created_at
                    ? Math.round((Date.now() - new Date(u.created_at).getTime()) / 86400000)
                    : null
                  const hasCompanies = trialCompanySet.has(u.id)
                  return (
                    <tr key={u.id}>
                      <td className="px-6 py-3 font-semibold text-slate-900">{u.email}</td>
                      <td className="px-4 py-3 text-slate-500">{daysIn !== null ? `Day ${daysIn}` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${daysLeft !== null && daysLeft <= 3 ? 'text-red-600' : daysLeft !== null && daysLeft <= 7 ? 'text-amber-600' : 'text-slate-900'}`}>
                          {daysLeft !== null ? `${daysLeft}d` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${hasCompanies ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                          {hasCompanies ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{u.signup_source ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Signal → action rate */}
        <div className="bg-white border border-slate-200 rounded p-6 mb-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Signal → Action Rate</div>
          <p className="text-[12px] text-slate-400 mb-5">Signals that triggered outreach, brief gen, or contact add within 48h</p>
          {signalRows.length === 0 ? (
            <p className="text-[13px] text-slate-400">No signals yet.</p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="py-2 font-semibold">Signal type</th>
                  <th className="py-2 font-semibold text-right">Total</th>
                  <th className="py-2 font-semibold text-right">Acted</th>
                  <th className="py-2 font-semibold text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {signalRows.map(row => (
                  <tr key={row.type}>
                    <td className="py-2.5 text-slate-700">{row.label}</td>
                    <td className="py-2.5 text-right text-slate-400">{row.total}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">{row.acted}</td>
                    <td className="py-2.5 text-right">
                      <span className={`font-bold ${row.rate >= 50 ? 'text-green-600' : row.rate >= 25 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {row.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Partners */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Partners ({partners.length})</span>
          </div>
          {partners.length === 0 ? (
            <p className="px-6 py-5 text-[13px] text-slate-400">No partners yet.</p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-6 py-2.5 font-semibold text-slate-400">Partner</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400">Code</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400 text-right">Referred</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400 text-right">Active</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400 text-right">MRR</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {partners.map(p => {
                  const counts = attributionsByPartner[p.id] ?? { total: 0, active: 0, mrr: 0 }
                  const commission = Math.round(counts.mrr * p.commission_pct / 100)
                  return (
                    <tr key={p.id}>
                      <td className="px-6 py-3">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-slate-400 text-[11px]">{p.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{p.referral_code}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{counts.total}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">{counts.active}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{counts.mrr > 0 ? `$${counts.mrr}` : '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{commission > 0 ? `$${commission}/mo` : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Brief quality */}
        <div className="bg-white border border-slate-200 rounded p-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Brief Quality (30d)</div>
          <p className="text-[12px] text-slate-400 mb-5">Context richness at generation time (n={logs.length})</p>
          {logs.length === 0 ? (
            <p className="text-[13px] text-slate-400">No briefs logged yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-5">
              {[
                { label: 'Avg context score', value: avgContextScore !== null ? `${avgContextScore}/100` : '—' },
                { label: '% with resume',     value: pctResume   !== null ? `${pctResume}%`   : '—' },
                { label: '% with scan',       value: pctScan     !== null ? `${pctScan}%`     : '—' },
                { label: '% with contacts',   value: pctContacts !== null ? `${pctContacts}%` : '—' },
                { label: 'Avg word count',    value: avgWords    !== null ? avgWords.toLocaleString() : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[22px] font-bold text-slate-900">{value}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
