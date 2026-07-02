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
    role === 'owner' ? 'bg-amber-500/15 text-amber-100 border-amber-300/20' :
    role === 'admin' ? 'bg-blue-500/15 text-blue-100 border-blue-300/20' :
    'bg-white/10 text-slate-300 border-white/10'
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_28%),linear-gradient(180deg,#0f172a_0%,#111827_45%,#020617_100%)] font-sans text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-300">Monday</span></span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/revenue" className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors">Revenue</Link>
            <Link href="/dashboard/admin/product" className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors">Product</Link>
            <Link href="/dashboard/admin/operations" className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors">Operations</Link>
            <Link href="/dashboard/admin/traces" className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors">Traces</Link>
            <Link href="/dashboard/admin/team" className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors">Team</Link>
            <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">â† Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-white leading-tight">Admin</h1>
            <p className="text-[13px] text-slate-300 mt-1.5">
              Signed in as <span className="font-semibold">{props.userEmail ?? '-'}</span>
              <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded border ${roleBadge(props.staffRole)}`}>{props.staffRole}</span>
            </p>
          </div>
        </div>

        <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-md">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Jump to section</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
            <a href="#subscriber-summary" className="text-slate-300 hover:text-white underline underline-offset-2">Subscribers</a>
            <a href="#system-health" className="text-slate-300 hover:text-white underline underline-offset-2">System health</a>
            <a href="#internal-pages" className="text-slate-300 hover:text-white underline underline-offset-2">Internal pages</a>
            <a href="#partners" className="text-slate-300 hover:text-white underline underline-offset-2">Partners</a>
          </div>
        </section>

        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Operating Areas</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {props.pages.map((group) => {
              const corePages = group.pages.filter((page) => page.priority === 'core')
              const advancedCount = group.pages.filter((page) => page.priority === 'advanced').length
              return (
                <div key={group.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
                  <p className="text-[14px] font-bold text-white">{group.label}</p>
                  <p className="text-[12px] text-slate-300 mt-1 leading-relaxed">{group.purpose}</p>
                  <div className="mt-3 space-y-1.5">
                    {corePages.map((page) => <Link key={page.path} href={page.path} className="block text-[12px] font-semibold text-slate-200 hover:text-white hover:underline">{page.label}</Link>)}
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
              <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
                <div className="text-[24px] font-bold text-white leading-none">{card.value}</div>
                <div className="text-[10px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">{card.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Link href="/guide" className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">
              Automation alerts open: <span className="text-white">{props.openAutomationAlerts}</span> â€¢ view runbooks
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
              <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
                <div className="text-[24px] font-bold text-white leading-none">{card.value}</div>
                <div className="text-[10px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">{card.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Daily trend</p>
              <span className={`text-[10px] font-bold px-2 py-1 rounded border ${props.telemetryAlertLevel === 'risk' ? 'text-red-100 bg-red-500/15 border-red-300/20' : props.telemetryAlertLevel === 'watch' ? 'text-amber-100 bg-amber-500/15 border-amber-300/20' : 'text-emerald-100 bg-emerald-500/15 border-emerald-300/20'}`}>
                {props.telemetryAlertLevel === 'risk' ? 'At risk' : props.telemetryAlertLevel === 'watch' ? 'Watch' : 'Healthy'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mb-3">Last 3d net: <span className="font-semibold text-white">{props.netPausedLast3d > 0 ? `+${props.netPausedLast3d}` : props.netPausedLast3d}</span> ({props.positiveNetDaysLast3d}/3 days net positive)</p>
            <div className="space-y-2">
              {props.pauseResumeTrend7d.map((row) => (
                <div key={row.dayKey} className="grid grid-cols-[84px_1fr_44px] items-center gap-3 text-[11px]">
                  <span className="text-slate-400">{row.label}</span>
                  <div className="grid grid-cols-2 gap-2"><progress max={props.trendPeak} value={row.paused} className="w-full h-2" /><progress max={props.trendPeak} value={row.resumed} className="w-full h-2" /></div>
                  <span className={`text-right font-semibold ${row.net > 0 ? 'text-amber-200' : row.net < 0 ? 'text-emerald-200' : 'text-slate-400'}`}>{row.net > 0 ? `+${row.net}` : row.net}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="go-no-go" className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Go/No-Go Scorecard</h2><p className="text-[12px] text-slate-300 mt-1">Auto-evaluated from current measurable thresholds.</p></div>
            <div className={`text-[12px] font-bold px-3 py-1.5 rounded border ${props.decision.status === 'green' ? 'text-green-100 bg-green-500/15 border-green-300/20' : props.decision.status === 'yellow' ? 'text-amber-100 bg-amber-500/15 border-amber-300/20' : 'text-red-100 bg-red-500/15 border-red-300/20'}`}>{props.decision.label}</div>
          </div>
          <p className="text-[12px] text-slate-300 mb-4">{props.decision.reason}</p>
          <div className="space-y-2">{props.scoreRows.map((row) => <div key={row.label} className="border border-white/10 rounded px-4 py-3 bg-white/5"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-[13px] font-semibold text-white truncate">{row.label}</p><p className="text-[11px] text-slate-400">Threshold: {row.threshold}</p></div><span className={`text-[11px] font-bold px-2.5 py-1 rounded border shrink-0 ${row.status === 'green' ? 'text-green-100 bg-green-500/15 border-green-300/20' : row.status === 'yellow' ? 'text-amber-100 bg-amber-500/15 border-amber-300/20' : row.status === 'red' ? 'text-red-100 bg-red-500/15 border-red-300/20' : 'text-slate-300 bg-white/10 border-white/10'}`}>{row.value}</span></div>{row.note && <p className="text-[11px] text-slate-400 mt-1.5">{row.note}</p>}</div>)}</div>
        </section>

        <section id="subscriber-summary" className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">{[{ label: 'Total users', value: props.totalUsers }, { label: 'Active (paid)', value: props.paidUsers }, { label: 'Trialing', value: props.trialingUsers }, { label: 'Placed', value: props.placements.length }].map(({ label, value }) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><div className="text-[28px] font-bold text-white">{value}</div><div className="text-[12px] text-slate-400 mt-1">{label}</div></div>)}</section>

        <section id="system-health" className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-3">System Health</div><div className="flex items-center gap-3"><span className={`w-2 h-2 rounded-full flex-shrink-0 ${props.briefingStale ? 'bg-red-400' : props.briefingConfiguredProfilesCount === 0 ? 'bg-slate-400' : 'bg-emerald-400'}`} /><span className="text-[13px] text-slate-200">Briefing worker {props.briefingConfiguredProfilesCount === 0 ? '-- no users configured' : props.briefingHoursAgo !== null ? `-- last sent ${props.briefingHoursAgo}h ago` : '-- never sent'}</span>{props.briefingStale && <span className="text-[11px] font-bold text-red-100 bg-red-500/15 px-2 py-0.5 rounded border border-red-300/20">STALE</span>}</div></section>

        <section id="team-summary" className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><div className="px-6 py-[18px] border-b border-white/10 flex items-center justify-between"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Team</h2></div><div className="divide-y divide-white/10">{props.teamMembers.map(m => <div key={m.id} className="px-6 py-3 flex items-center justify-between"><span className="text-[13px] text-slate-100">{m.email}</span><span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${roleBadge(m.role)}`}>{m.role}</span></div>)}</div></section>

        <details id="internal-pages" className="space-y-4 mb-6"><summary className="cursor-pointer text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Internal pages + permissions</summary><div className="pt-4 space-y-4">{props.pages.map((group) => <div key={group.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><div className="px-6 py-[18px] border-b border-white/10 flex items-center justify-between gap-3"><div><span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">{group.label}</span><p className="text-[12px] text-slate-300 mt-1">{group.purpose}</p></div><span className="text-[11px] text-slate-400">{group.pages.length} pages</span></div><table className="w-full text-[12px]"><tbody className="divide-y divide-white/10">{group.pages.map((page, i) => <tr key={`${group.id}-${i}`}><td className="px-6 py-3"><Link href={page.path} className="text-slate-100 font-semibold hover:text-white">{page.label}</Link><span className="ml-2 text-slate-400 font-mono text-[11px]">{page.path}</span></td><td className="px-4 py-3 text-center font-bold text-amber-200">{page.owner}</td><td className="px-4 py-3 text-center font-bold text-blue-200">{page.admin}</td><td className="px-4 py-3 text-center text-slate-400">{page.viewer}</td></tr>)}</tbody></table></div>)}</div></details>

        <details id="internal-apis" className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><summary className="cursor-pointer px-6 py-[18px] text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 border-b border-white/10">Internal APIs + permissions</summary><div><table className="w-full text-[12px]"><tbody className="divide-y divide-white/10">{props.internalApis.map((p, i) => <tr key={i}><td className="px-6 py-3"><span className="text-slate-100 font-semibold">{p.label}</span><span className="ml-2 text-slate-400 font-mono text-[11px]">{p.path}</span></td><td className="px-4 py-3 text-center font-bold text-amber-200">{p.owner}</td><td className="px-4 py-3 text-center font-bold text-blue-200">{p.admin}</td><td className="px-4 py-3 text-center text-slate-400">{p.viewer}</td></tr>)}</tbody></table></div></details>

        <section id="six-actions-funnel" className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Six-Actions Funnel</h2><p className="text-[12px] text-slate-300 mb-6">Trialing + active users (n={props.activeUserCount})</p><FunnelChart data={props.funnelData} /></section>

        <section id="event-volume" className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Event Volume (30d)</h2><p className="text-[12px] text-slate-300 mb-6">7d counts in right column</p><EventVolumeChart data={props.eventVolumeData} /></section>

        <section id="trial-conversion" className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Trial Conversion</h2><p className="text-[12px] text-slate-300 mb-5">Users whose 30-day trial window has closed</p><div className={`mb-5 border rounded p-4 ${props.linkedInAdsGatePass ? 'border-green-300/20 bg-green-500/10' : 'border-amber-300/20 bg-amber-500/10'}`}><div className="flex items-center justify-between gap-3 mb-1"><p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400">LinkedIn Ads Gate</p><span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${props.linkedInAdsGatePass ? 'bg-green-500/15 text-green-100 border-green-300/20' : 'bg-amber-500/15 text-amber-100 border-amber-300/20'}`}>{props.linkedInAdsDecision}</span></div><p className="text-[12px] text-slate-300">Requires trial-to-paid conversion of at least {props.linkedInAdsThreshold}%. Current: {props.conversionRate !== null ? `${props.conversionRate}%` : 'N/A'}.</p></div><div className="grid grid-cols-3 gap-6 mb-6"><div><div className="text-[28px] font-bold text-white">{props.totalEnded}</div><div className="text-[12px] text-slate-400 mt-1">Trials ended</div></div><div><div className="text-[28px] font-bold text-white">{props.totalConverted}</div><div className="text-[12px] text-slate-400 mt-1">Converted to paid</div></div><div><div className="text-[28px] font-bold text-white">{props.conversionRate !== null ? `${props.conversionRate}%` : '-'}</div><div className="text-[12px] text-slate-400 mt-1">Conversion rate</div></div></div></section>

        <details id="active-trials" className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><summary className="cursor-pointer px-6 py-[18px] text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 border-b border-white/10">Active Trials ({props.trialUsers.length})</summary><div>{props.trialUsers.length === 0 ? <p className="px-6 py-5 text-[13px] text-slate-300">No active trials.</p> : null}</div></details>

        <details id="signal-action-rate" className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><summary className="cursor-pointer text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Signal &rarr; Action Rate</summary><div className="pt-4"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Signal â†’ Action Rate</h2><p className="text-[12px] text-slate-300 mb-5">Signals that triggered outreach, brief gen, or contact add within 48h</p></div></details>

        <details id="partners" className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><summary className="cursor-pointer px-6 py-[18px] text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 border-b border-white/10">Partners ({props.partners.length})</summary><div>{props.partners.length === 0 ? <p className="px-6 py-5 text-[13px] text-slate-300">No partners yet.</p> : null}</div></details>

        {props.b2bAccounts.length > 0 && <details id="b2b-accounts" className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><summary className="cursor-pointer px-6 py-[18px] text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 border-b border-white/10">B2B Accounts ({props.b2bAccounts.length})</summary><div /></details>}
        {props.placements.length > 0 && <details id="placements" className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><summary className="cursor-pointer px-6 py-[18px] text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 border-b border-white/10">Placements ({props.placements.length})</summary><div /></details>}

        <details id="brief-quality" className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md"><summary className="cursor-pointer text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Brief Quality (30d)</summary><div className="pt-4"><h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Brief Quality (30d)</h2><p className="text-[12px] text-slate-300 mb-5">Context richness at generation time (n={props.logsLength})</p><div className="grid grid-cols-2 sm:grid-cols-5 gap-5"><div><div className="text-[22px] font-bold text-white">{props.avgContextScore !== null ? `${props.avgContextScore}/100` : '-'}</div><div className="text-[11px] text-slate-400 mt-1 leading-snug">Avg context score</div></div><div><div className="text-[22px] font-bold text-white">{props.pctResume !== null ? `${props.pctResume}%` : '-'}</div><div className="text-[11px] text-slate-400 mt-1 leading-snug">% with resume</div></div><div><div className="text-[22px] font-bold text-white">{props.pctScan !== null ? `${props.pctScan}%` : '-'}</div><div className="text-[11px] text-slate-400 mt-1 leading-snug">% with scan</div></div><div><div className="text-[22px] font-bold text-white">{props.pctContacts !== null ? `${props.pctContacts}%` : '-'}</div><div className="text-[11px] text-slate-400 mt-1 leading-snug">% with contacts</div></div><div><div className="text-[22px] font-bold text-white">{props.avgWords !== null ? props.avgWords.toLocaleString() : '-'}</div><div className="text-[11px] text-slate-400 mt-1 leading-snug">Avg word count</div></div></div></div></details>
      </main>
    </div>
  )
}
