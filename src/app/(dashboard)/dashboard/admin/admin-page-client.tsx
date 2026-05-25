'use client'

import Link from 'next/link'
import { FunnelChart, EventVolumeChart } from './admin-charts'

type ScoreStatus = 'green' | 'yellow' | 'red' | 'gray'
type PageGroup = {
  id: string
  label: string
  purpose: string
  pages: Array<{ path: string; label: string; owner: string; admin: string; viewer: string; priority: 'core' | 'advanced' }>
}

type AdminPageProps = {
  userEmail: string | null | undefined
  staffRole: string
  pages: PageGroup[]
  activeUserCount: number
  usersWithCompany24h: number
  usersWithContact24h: number
  usersWithFollowUp24h: number
  usersWithBriefingView24h: number
  openAutomationAlerts: number
  searchPaused7d: number
  searchResumed7d: number
  netPaused7d: number
  pauseResumeRatio7d: string | null
  telemetryAlertLevel: 'normal' | 'watch' | 'risk'
  pauseResumeTrend7d: Array<{ dayKey: string; label: string; paused: number; resumed: number; net: number }>
  trendPeak: number
  netPausedLast3d: number
  positiveNetDaysLast3d: number
  scoreRows: Array<{ label: string; threshold: string; value: string; status: ScoreStatus; note?: string }>
  decision: { label: 'GO' | 'CONDITIONAL GO' | 'NO-GO'; status: ScoreStatus; reason: string }
  totalUsers: number
  paidUsers: number
  trialingUsers: number
  placements: Array<{ full_name: string | null; placement_company: string | null; placed_at: string | null }>
  briefingConfiguredProfilesCount: number
  briefingStale: boolean
  briefingHoursAgo: number | null
  teamMembers: Array<{ id: string; email: string; role: string }>
  internalApis: Array<{ path: string; label: string; owner: string; admin: string; viewer: string }>
  funnelData: Array<{ step: string; label: string; count: number }>
  denominator: number
  eventVolumeData: Array<{ event_name: string; count: number }>
  eventCounts7d: Record<string, number>
  linkedInAdsGatePass: boolean
  linkedInAdsDecision: string
  linkedInAdsThreshold: number
  conversionRate: number | null
  totalEnded: number
  totalConverted: number
  channelRows: Array<{ channel: string; ended: number; converted: number; rate: number }>
  trialUsers: Array<{ id: string; email: string; trial_ends_at: string | null; created_at: string | null; signup_source: string | null }>
  trialCompanySet: Set<string>
  signalRows: Array<{ type: string; label: string; total: number; acted: number; rate: number }>
  logsLength: number
  avgContextScore: number | null
  pctResume: number | null
  pctScan: number | null
  pctContacts: number | null
  avgWords: number | null
  partners: Array<{ id: string; name: string; email: string; referral_code: string; commission_pct: number }>
  attributionsByPartner: Record<string, { total: number; active: number; mrr: number }>
  b2bAccounts: Array<{ id: string; email: string; tier: string; total: number; accepted: number }>
}

export function AdminPageClient(props: AdminPageProps) {
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
            <Link href="/dashboard/admin/revenue" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Revenue</Link>
            <Link href="/dashboard/admin/product" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Product</Link>
            <Link href="/dashboard/admin/operations" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Operations</Link>
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
              Signed in as <span className="font-semibold">{props.userEmail ?? '-'}</span>
              <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded ${roleBadge(props.staffRole)}`}>{props.staffRole}</span>
            </p>
          </div>
        </div>

        <section className="mb-8 bg-slate-50 border border-slate-200 rounded p-4">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Jump to section</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
            <a href="#subscriber-summary" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Subscribers</a>
            <a href="#system-health" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">System health</a>
            <a href="#internal-pages" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Internal pages</a>
            <a href="#partners" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Partners</a>
          </div>
        </section>

        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Operating Areas</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {props.pages.map((group) => {
              const corePages = group.pages.filter((page) => page.priority === 'core')
              const advancedCount = group.pages.filter((page) => page.priority === 'advanced').length
              return (
                <div key={group.id} className="bg-white border border-slate-200 rounded p-4">
                  <p className="text-[14px] font-bold text-slate-900">{group.label}</p>
                  <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{group.purpose}</p>
                  <div className="mt-3 space-y-1.5">
                    {corePages.map((page) => <Link key={page.path} href={page.path} className="block text-[12px] font-semibold text-slate-700 hover:text-slate-900 hover:underline">{page.label}</Link>)}
                    {advancedCount > 0 && <p className="text-[11px] text-slate-400 mt-2">+ {advancedCount} advanced pages</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Daily activation snapshot (24h)</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {[
              { label: 'New users', value: 0 },
              { label: 'Added company', value: props.usersWithCompany24h },
              { label: 'Added contact', value: props.usersWithContact24h },
              { label: 'Set follow-up', value: props.usersWithFollowUp24h },
              { label: 'Viewed briefing', value: props.usersWithBriefingView24h },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-slate-200 rounded p-4">
                <div className="text-[24px] font-bold text-slate-900 leading-none">{card.value}</div>
                <div className="text-[10px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">{card.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Link href="/guide" className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Automation alerts open: <span className="text-slate-900">{props.openAutomationAlerts}</span> • view runbooks
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Search control telemetry (7d)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Paused events', value: props.searchPaused7d },
              { label: 'Resumed events', value: props.searchResumed7d },
              { label: 'Net paused', value: props.netPaused7d },
              { label: 'Pause/Resume ratio', value: props.pauseResumeRatio7d ?? 'N/A' },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-slate-200 rounded p-4">
                <div className="text-[24px] font-bold text-slate-900 leading-none">{card.value}</div>
                <div className="text-[10px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">{card.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-white border border-slate-200 rounded p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Daily trend</p>
              <span className={`text-[10px] font-bold px-2 py-1 rounded border ${props.telemetryAlertLevel === 'risk' ? 'text-red-700 bg-red-50 border-red-200' : props.telemetryAlertLevel === 'watch' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                {props.telemetryAlertLevel === 'risk' ? 'At risk' : props.telemetryAlertLevel === 'watch' ? 'Watch' : 'Healthy'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Last 3d net: <span className="font-semibold text-slate-700">{props.netPausedLast3d > 0 ? `+${props.netPausedLast3d}` : props.netPausedLast3d}</span> ({props.positiveNetDaysLast3d}/3 days net positive)</p>
            <div className="space-y-2">
              {props.pauseResumeTrend7d.map((row) => (
                <div key={row.dayKey} className="grid grid-cols-[84px_1fr_44px] items-center gap-3 text-[11px]">
                  <span className="text-slate-500">{row.label}</span>
                  <div className="grid grid-cols-2 gap-2"><progress max={props.trendPeak} value={row.paused} className="w-full h-2" /><progress max={props.trendPeak} value={row.resumed} className="w-full h-2" /></div>
                  <span className={`text-right font-semibold ${row.net > 0 ? 'text-amber-700' : row.net < 0 ? 'text-emerald-700' : 'text-slate-500'}`}>{row.net > 0 ? `+${row.net}` : row.net}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="go-no-go" className="bg-white border border-slate-200 rounded p-6 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Go/No-Go Scorecard</h2><p className="text-[12px] text-slate-400 mt-1">Auto-evaluated from current measurable thresholds.</p></div>
            <div className={`text-[12px] font-bold px-3 py-1.5 rounded border ${props.decision.status === 'green' ? 'text-green-700 bg-green-50 border-green-200' : props.decision.status === 'yellow' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200'}`}>{props.decision.label}</div>
          </div>
          <p className="text-[12px] text-slate-600 mb-4">{props.decision.reason}</p>
          <div className="space-y-2">{props.scoreRows.map((row) => <div key={row.label} className="border border-slate-200 rounded px-4 py-3"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-[13px] font-semibold text-slate-900 truncate">{row.label}</p><p className="text-[11px] text-slate-400">Threshold: {row.threshold}</p></div><span className={`text-[11px] font-bold px-2.5 py-1 rounded border shrink-0 ${row.status === 'green' ? 'text-green-700 bg-green-50 border-green-200' : row.status === 'yellow' ? 'text-amber-700 bg-amber-50 border-amber-200' : row.status === 'red' ? 'text-red-700 bg-red-50 border-red-200' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>{row.value}</span></div>{row.note && <p className="text-[11px] text-slate-500 mt-1.5">{row.note}</p>}</div>)}</div>
        </section>

        <section id="subscriber-summary" className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">{[{ label: 'Total users', value: props.totalUsers }, { label: 'Active (paid)', value: props.paidUsers }, { label: 'Trialing', value: props.trialingUsers }, { label: 'Placed', value: props.placements.length }].map(({ label, value }) => <div key={label} className="bg-white border border-slate-200 rounded p-5"><div className="text-[28px] font-bold text-slate-900">{value}</div><div className="text-[12px] text-slate-400 mt-1">{label}</div></div>)}</section>

        <section id="system-health" className="bg-white border border-slate-200 rounded p-5 mb-6"><div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-3">System Health</div><div className="flex items-center gap-3"><span className={`w-2 h-2 rounded-full flex-shrink-0 ${props.briefingStale ? 'bg-red-500' : props.briefingConfiguredProfilesCount === 0 ? 'bg-slate-300' : 'bg-green-500'}`} /><span className="text-[13px] text-slate-700">Briefing worker {props.briefingConfiguredProfilesCount === 0 ? '-- no users configured' : props.briefingHoursAgo !== null ? `-- last sent ${props.briefingHoursAgo}h ago` : '-- never sent'}</span>{props.briefingStale && <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">STALE</span>}</div></section>

        <section id="team-summary" className="bg-white border border-slate-200 rounded overflow-hidden mb-6"><div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Team</h2></div><div className="divide-y divide-slate-50">{props.teamMembers.map(m => <div key={m.id} className="px-6 py-3 flex items-center justify-between"><span className="text-[13px] text-slate-900">{m.email}</span><span className={`text-[11px] font-bold px-2 py-0.5 rounded ${roleBadge(m.role)}`}>{m.role}</span></div>)}</div></section>

        <details id="internal-pages" className="space-y-4 mb-6"><summary className="cursor-pointer text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Internal pages + permissions</summary><div className="pt-4 space-y-4">{props.pages.map((group) => <div key={group.id} className="bg-white border border-slate-200 rounded overflow-hidden"><div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between gap-3"><div><span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">{group.label}</span><p className="text-[12px] text-slate-500 mt-1">{group.purpose}</p></div><span className="text-[11px] text-slate-400">{group.pages.length} pages</span></div><table className="w-full text-[12px]"><tbody className="divide-y divide-slate-50">{group.pages.map((page, i) => <tr key={`${group.id}-${i}`}><td className="px-6 py-3"><Link href={page.path} className="text-slate-900 font-semibold hover:text-slate-600">{page.label}</Link><span className="ml-2 text-slate-300 font-mono text-[11px]">{page.path}</span></td><td className="px-4 py-3 text-center font-bold text-amber-600">{page.owner}</td><td className="px-4 py-3 text-center font-bold text-blue-600">{page.admin}</td><td className="px-4 py-3 text-center text-slate-300">{page.viewer}</td></tr>)}</tbody></table></div>)}</div></details>

        <details id="internal-apis" className="bg-white border border-slate-200 rounded overflow-hidden mb-6"><summary className="cursor-pointer px-6 py-[18px] text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 border-b border-slate-200">Internal APIs + permissions</summary><div><table className="w-full text-[12px]"><tbody className="divide-y divide-slate-50">{props.internalApis.map((p, i) => <tr key={i}><td className="px-6 py-3"><span className="text-slate-900 font-semibold">{p.label}</span><span className="ml-2 text-slate-300 font-mono text-[11px]">{p.path}</span></td><td className="px-4 py-3 text-center font-bold text-amber-600">{p.owner}</td><td className="px-4 py-3 text-center font-bold text-blue-600">{p.admin}</td><td className="px-4 py-3 text-center text-slate-300">{p.viewer}</td></tr>)}</tbody></table></div></details>

        <section id="six-actions-funnel" className="bg-white border border-slate-200 rounded p-6 mb-6"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Six-Actions Funnel</h2><p className="text-[12px] text-slate-400 mb-6">Trialing + active users (n={props.activeUserCount})</p><FunnelChart data={props.funnelData} /></section>

        <section id="event-volume" className="bg-white border border-slate-200 rounded p-6 mb-6"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Event Volume (30d)</h2><p className="text-[12px] text-slate-400 mb-6">7d counts in right column</p><EventVolumeChart data={props.eventVolumeData} /></section>

        <section id="trial-conversion" className="bg-white border border-slate-200 rounded p-6 mb-6"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Trial Conversion</h2><p className="text-[12px] text-slate-400 mb-5">Users whose 30-day trial window has closed</p><div className={`mb-5 border rounded p-4 ${props.linkedInAdsGatePass ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}><div className="flex items-center justify-between gap-3 mb-1"><p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500">LinkedIn Ads Gate</p><span className={`text-[11px] font-bold px-2 py-0.5 rounded ${props.linkedInAdsGatePass ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'}`}>{props.linkedInAdsDecision}</span></div><p className="text-[12px] text-slate-600">Requires trial-to-paid conversion of at least {props.linkedInAdsThreshold}%. Current: {props.conversionRate !== null ? `${props.conversionRate}%` : 'N/A'}.</p></div><div className="grid grid-cols-3 gap-6 mb-6"><div><div className="text-[28px] font-bold text-slate-900">{props.totalEnded}</div><div className="text-[12px] text-slate-400 mt-1">Trials ended</div></div><div><div className="text-[28px] font-bold text-slate-900">{props.totalConverted}</div><div className="text-[12px] text-slate-400 mt-1">Converted to paid</div></div><div><div className="text-[28px] font-bold text-slate-900">{props.conversionRate !== null ? `${props.conversionRate}%` : '-'}</div><div className="text-[12px] text-slate-400 mt-1">Conversion rate</div></div></div></section>

        <details id="active-trials" className="bg-white border border-slate-200 rounded overflow-hidden mb-6"><summary className="cursor-pointer px-6 py-[18px] text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 border-b border-slate-200">Active Trials ({props.trialUsers.length})</summary><div>{props.trialUsers.length === 0 ? <p className="px-6 py-5 text-[13px] text-slate-400">No active trials.</p> : null}</div></details>

        <details id="signal-action-rate" className="bg-white border border-slate-200 rounded p-6 mb-6"><summary className="cursor-pointer text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Signal &rarr; Action Rate</summary><div className="pt-4"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Signal → Action Rate</h2><p className="text-[12px] text-slate-400 mb-5">Signals that triggered outreach, brief gen, or contact add within 48h</p></div></details>

        <details id="partners" className="bg-white border border-slate-200 rounded overflow-hidden mb-6"><summary className="cursor-pointer px-6 py-[18px] text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 border-b border-slate-200">Partners ({props.partners.length})</summary><div>{props.partners.length === 0 ? <p className="px-6 py-5 text-[13px] text-slate-400">No partners yet.</p> : null}</div></details>

        {props.b2bAccounts.length > 0 && <details id="b2b-accounts" className="bg-white border border-slate-200 rounded overflow-hidden mb-6"><summary className="cursor-pointer px-6 py-[18px] text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 border-b border-slate-200">B2B Accounts ({props.b2bAccounts.length})</summary><div /></details>}
        {props.placements.length > 0 && <details id="placements" className="bg-white border border-slate-200 rounded overflow-hidden mb-6"><summary className="cursor-pointer px-6 py-[18px] text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 border-b border-slate-200">Placements ({props.placements.length})</summary><div /></details>}

        <details id="brief-quality" className="bg-white border border-slate-200 rounded p-6"><summary className="cursor-pointer text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Brief Quality (30d)</summary><div className="pt-4"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Brief Quality (30d)</h2><p className="text-[12px] text-slate-400 mb-5">Context richness at generation time (n={props.logsLength})</p><div className="grid grid-cols-2 sm:grid-cols-5 gap-5"><div><div className="text-[22px] font-bold text-slate-900">{props.avgContextScore !== null ? `${props.avgContextScore}/100` : '-'}</div><div className="text-[11px] text-slate-400 mt-1 leading-snug">Avg context score</div></div><div><div className="text-[22px] font-bold text-slate-900">{props.pctResume !== null ? `${props.pctResume}%` : '-'}</div><div className="text-[11px] text-slate-400 mt-1 leading-snug">% with resume</div></div><div><div className="text-[22px] font-bold text-slate-900">{props.pctScan !== null ? `${props.pctScan}%` : '-'}</div><div className="text-[11px] text-slate-400 mt-1 leading-snug">% with scan</div></div><div><div className="text-[22px] font-bold text-slate-900">{props.pctContacts !== null ? `${props.pctContacts}%` : '-'}</div><div className="text-[11px] text-slate-400 mt-1 leading-snug">% with contacts</div></div><div><div className="text-[22px] font-bold text-slate-900">{props.avgWords !== null ? props.avgWords.toLocaleString() : '-'}</div><div className="text-[11px] text-slate-400 mt-1 leading-snug">Avg word count</div></div></div></div></details>
      </main>
    </div>
  )
}