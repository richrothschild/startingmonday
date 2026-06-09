import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Evidence Room - Starting Monday',
  description: 'Public evidence room for Starting Monday: sources, claims, pilot metrics, and update history.',
  alternates: {
    canonical: 'https://startingmonday.app/evidence-room',
  },
  openGraph: {
    title: 'Evidence Room - Starting Monday',
    description: 'Public evidence room for Starting Monday: sources, claims, pilot metrics, and update history.',
    url: 'https://startingmonday.app/evidence-room',
    type: 'website',
  },
}

const CARDS = [
  {
    title: 'Case studies',
    body: 'Six publishable executive transition stories with before/after structure, quantified outcomes, and role context.',
    href: '/case-studies',
    label: 'Open case studies',
  },
  {
    title: 'Sources',
    body: 'Peer-reviewed coaching, transition, behavior-change, and weak-signal research. Every claim should trace back to a citable source or a clearly labeled internal metric.',
    href: '/references',
    label: 'Open references',
  },
  {
    title: 'Method',
    body: 'How we estimate early-role timing, define lag windows, and keep uncertainty visible instead of overselling precision.',
    href: '/method-and-evidence',
    label: 'See the method',
  },
  {
    title: 'Pilot findings',
    body: 'A more analytical view of what changed in the pilot and which outcomes appear most connected to structured execution.',
    href: '/pilot-findings',
    label: 'Read the pilot',
  },
  {
    title: 'Research brief',
    body: 'A print-friendly, memo-style brief formatted like a high-end advisory firm note. Best for investors, advisors, and partner conversations.',
    href: '/research-brief',
    label: 'Open the brief',
  },
  {
    title: 'Annual report',
    body: 'A tiny 2026 report on what we observed in executive search: timing, behavior, and what separated disciplined campaigns from reactive ones.',
    href: '/annual-report-2026',
    label: 'See the report',
  },
  {
    title: 'Founder note',
    body: 'Why the company exists, what category mistake it corrects, and why the product is built as an execution system rather than a content library.',
    href: '/founder-note',
    label: 'Read the note',
  },
]

const HISTORY = [
  'May 13, 2026: Added claim-to-source map and evidence policy.',
  'May 20, 2026: Added public evidence section and internal evidence summary.',
  'May 20, 2026: Added method-and-evidence hub and linked assets.',
  'June 08, 2026: Added KPI trend cards, role outcomes block, and source-note methodology section.',
]

const KPI_TRENDS = [
  {
    name: 'Homepage to signup conversion',
    value: '+18% vs baseline',
    cadence: 'Weekly update cadence',
    definition: 'Unique visitors who complete signup on primary acquisition routes.',
    source: 'Route conversion events from channel funnel instrumentation.',
  },
  {
    name: 'Trial to paid conversion',
    value: '+14% vs baseline',
    cadence: 'Weekly update cadence',
    definition: 'Trial starts that convert to paid status within the measured window.',
    source: 'Subscription status transitions and billing events.',
  },
  {
    name: 'Discover to action rate',
    value: '31% action start rate',
    cadence: 'Weekly update cadence',
    definition: 'Recommendation opens that advance to outreach start or watchlist action.',
    source: 'Discover recommendation open/add/outreach events.',
  },
  {
    name: '30-day retention',
    value: '+9% vs baseline',
    cadence: 'Monthly cohort rollup',
    definition: 'Activated users with qualifying activity at day 30.',
    source: 'Cohort retention analysis in weekly KPI summaries.',
  },
]

const ROLE_OUTCOMES = [
  {
    role: 'CIO and CTO transitions',
    outcome: 'Earlier signal detection and faster conversion from discovery to outreach execution.',
  },
  {
    role: 'VP to C-suite transitions',
    outcome: 'Higher briefing quality and stronger narrative readiness in first-round conversations.',
  },
  {
    role: 'CISO and security leaders',
    outcome: 'Improved role-context preparation for board and risk-oriented interview dialogues.',
  },
]

export default function EvidenceRoomPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:text-slate-300 transition-colors">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/references" className="text-[13px] text-slate-400 hover:text-white transition-colors">References</Link>
            <Link href="/method-and-evidence" className="text-[13px] text-slate-400 hover:text-white transition-colors">Method</Link>
            <Link href="/signup" className="text-[13px] font-semibold text-slate-900 bg-white px-4 py-1.5 rounded hover:bg-slate-100 transition-colors">Try free</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-18">
<header className="mb-12 max-w-3xl">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">Evidence room</p>
          <h1 className="text-[34px] sm:text-[44px] font-bold text-slate-900 leading-tight mb-4">All the evidence assets in one place.</h1>
          <p className="text-[15px] text-slate-600 leading-relaxed">
            This page is the public hub for claims, methods, pilot metrics, update history, and the supporting research brief.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {CARDS.map((card) => (
            <Link key={card.title} href={card.href} className="group border border-slate-200 rounded-lg p-5 hover:border-slate-400 transition-colors">
              <p className="text-[13px] font-semibold text-slate-900 mb-2 group-hover:text-slate-600 transition-colors">{card.title}</p>
              <p className="text-[13px] text-slate-600 leading-relaxed mb-4">{card.body}</p>
              <span className="text-[13px] font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">{card.label} →</span>
            </Link>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="border border-slate-200 rounded-lg p-5">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Claims</p>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-4">The company makes a limited set of claims: better signal tracking, better preparation, better between-session execution, and better transition support.</p>
            <Link href="/references" className="text-[13px] font-semibold text-slate-900 underline underline-offset-2 hover:text-orange-600">Open the claim map</Link>
          </div>
          <div className="border border-slate-200 rounded-lg p-5">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Pilot metrics</p>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-4">The public pilot snapshot is intentionally modest and denominator-aware. We show what we can verify and label everything else as directional.</p>
            <Link href="/references" className="text-[13px] font-semibold text-slate-900 underline underline-offset-2 hover:text-orange-600">See metric definitions</Link>
          </div>
          <div className="border border-slate-200 rounded-lg p-5">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Update history</p>
            <ul className="space-y-2 text-[13px] text-slate-600 leading-relaxed">
              {HISTORY.map(item => <li key={item}>- {item}</li>)}
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Core KPI trend cards</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {KPI_TRENDS.map((kpi) => (
              <article key={kpi.name} className="border border-slate-200 rounded-lg p-5">
                <p className="text-[12px] font-semibold text-slate-900 mb-1">{kpi.name}</p>
                <p className="text-[22px] font-bold text-slate-900 mb-2">{kpi.value}</p>
                <p className="text-[12px] text-slate-500 mb-2">{kpi.cadence}</p>
                <p className="text-[12px] text-slate-600 leading-relaxed mb-1"><span className="font-semibold text-slate-700">Definition:</span> {kpi.definition}</p>
                <p className="text-[12px] text-slate-600 leading-relaxed"><span className="font-semibold text-slate-700">Source:</span> {kpi.source}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-12 border border-slate-200 rounded-lg p-5 sm:p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Role-specific outcomes</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLE_OUTCOMES.map((item) => (
              <article key={item.role} className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">{item.role}</p>
                <p className="text-[12px] text-slate-600 leading-relaxed">{item.outcome}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-12 border border-slate-200 rounded-lg p-5 sm:p-6 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Source notes and methodology</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[13px] text-slate-600 leading-relaxed">
            <p>
              KPI cards are directional unless explicitly marked audited. Weekly updates use the latest event windows, while monthly updates use cohort-stable windows.
            </p>
            <p>
              Definitions, assumptions, and denominator logic are maintained in method and reference assets so readers can separate measured signal from interpretation.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/method-and-evidence" className="text-[13px] font-semibold text-slate-900 underline underline-offset-2 hover:text-orange-600">Review methodology</Link>
            <Link href="/references" className="text-[13px] font-semibold text-slate-900 underline underline-offset-2 hover:text-orange-600">Review source notes</Link>
          </div>
        </section>

        <section className="border border-slate-200 rounded-lg bg-slate-50 p-5 sm:p-6">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">How to use this room</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[13px] text-slate-600 leading-relaxed">
            <p>Use the evidence room when you want the whole system at once: claims, methods, pilot findings, and the source stack behind them.</p>
            <p>Use the references page when you need citations. Use the research brief when you want the argument in advisory-firm memo form.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
