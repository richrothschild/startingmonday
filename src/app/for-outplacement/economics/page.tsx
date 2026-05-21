import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Outplacement Economics | Starting Monday',
  description: 'Seat structure, rollout model, and pilot economics for outplacement firms using Starting Monday with executive cohorts.',
  alternates: { canonical: 'https://startingmonday.app/for-outplacement/economics' },
}

const PARTNER_PLANS = [
  {
    name: 'Pilot Cohort',
    price: 'Custom pilot seats',
    fit: 'Best for firms validating workflow and outcomes with one live executive cohort before broader rollout.',
  },
  {
    name: 'Program Core',
    price: 'Seat-based monthly model',
    fit: 'Best for firms that run recurring transition cohorts and want predictable unit economics.',
  },
  {
    name: 'Enterprise Rollout',
    price: 'Volume pricing by term',
    fit: 'Best for multi-office or enterprise partners with centralized procurement and reporting needs.',
  },
]

const WHAT_IS_INCLUDED = [
  'Participant seat provisioning and activation support',
  'Cohort-level engagement visibility for counselor leaders',
  'Signal monitoring and prep brief workflows for active search execution',
  'Partner review cadence and pass/fail scorecard at day 30',
]

const SCORECARD_METRICS = [
  {
    metric: 'Activation rate',
    detail: 'Percent of assigned participants who complete setup and create initial target company list.',
  },
  {
    metric: 'Signal-driven actions',
    detail: 'Count of outreach or follow-up actions triggered by real signal movement.',
  },
  {
    metric: 'Prep readiness',
    detail: 'Rate of interview conversations with prep brief reviewed beforehand.',
  },
  {
    metric: 'Momentum markers',
    detail: 'Early indicators such as first qualified outreach, first interview, or meaningful stage movement.',
  },
]

const COMMERCIAL_NOTES = [
  'Pilot pricing is structured to lower risk and make the first decision evidence-based, not theoretical.',
  'Volume discounts are available for larger cohorts and longer program terms.',
  'Seat allocations can be tuned across Active and Intelligence usage patterns based on participant readiness.',
  'Centralized billing and reporting options are available for enterprise partners.',
]

const COHORT_SCENARIOS = [
  {
    cohort: '25 seats',
    profile: 'Single office pilot cohort',
    decisionUse: 'Validate activation quality and counselor workflow fit before expansion.',
  },
  {
    cohort: '50 seats',
    profile: 'Multi-team program cohort',
    decisionUse: 'Validate repeatability across counselor teams and participant segments.',
  },
  {
    cohort: '100 seats',
    profile: 'Regional rollout',
    decisionUse: 'Measure governance consistency and operating cadence at scale.',
  },
  {
    cohort: '250 seats',
    profile: 'Enterprise/multi-office rollout',
    decisionUse: 'Evaluate centralized reporting, procurement governance, and long-term economics.',
  },
]

const EMPLOYER_KPI_MAP = [
  {
    buyerMetric: 'Program engagement confidence',
    mappedSignal: 'Activation rate, weekly participant action consistency, stalled-participant trend.',
  },
  {
    buyerMetric: 'Transition momentum quality',
    mappedSignal: 'Time to first qualified outreach, signal-driven action count, interview-prep readiness.',
  },
  {
    buyerMetric: 'Counselor efficiency',
    mappedSignal: 'Reduced context rebuild and faster session preparation from shared workflow visibility.',
  },
  {
    buyerMetric: 'Client-facing program credibility',
    mappedSignal: 'Cohort-level scorecards and documented decision framework at day 30.',
  },
]

const SAMPLE_WEEKLY_REPORT = [
  'Activation summary by cohort and counselor team',
  'Top stalled participants with recommended interventions',
  'Signal-driven actions completed this week',
  'Prep-brief usage before interviews and high-stakes meetings',
  'Risks, escalations, and next-week plan',
]

export default function OutplacementEconomicsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <Link href="/for-outplacement" className="text-[13px] text-slate-400 hover:text-white transition-colors">
            Back to outplacement page
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <header className="mb-12">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
            Outplacement economics
          </p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-4">
            Pilot structure and commercial model, one click deeper.
          </h1>
          <p className="text-[15px] text-slate-600 leading-relaxed max-w-2xl">
            This page is for partner teams who already understand the workflow and need pricing, scorecards, and rollout mechanics for internal decisions.
          </p>
        </header>

        <section className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 sm:p-7 mb-10">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-700 mb-3">
            Pilot first
          </p>
          <div className="space-y-3 text-[14px] text-slate-700 leading-relaxed">
            <p>Most partners begin with one cohort and a 30-day pass/fail review before expanding seats.</p>
            <p>This keeps procurement risk low while giving counselor teams enough workflow exposure to judge fit.</p>
            <p>The goal is to validate measurable momentum lift, not just product satisfaction.</p>
          </div>
        </section>

        <section className="mb-10">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-5">
            Partner models
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PARTNER_PLANS.map((plan) => (
              <div key={plan.name} className="border border-slate-200 rounded-2xl p-5 bg-white">
                <p className="text-[16px] font-semibold text-slate-900 mb-1">{plan.name}</p>
                <p className="text-[20px] font-bold text-orange-600 mb-3">{plan.price}</p>
                <p className="text-[14px] text-slate-600 leading-relaxed">{plan.fit}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            What is included
          </p>
          <ul className="space-y-3">
            {WHAT_IS_INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] text-slate-700 leading-relaxed">
                <span className="text-orange-500 shrink-0 mt-0.5">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            30-day decision scorecard
          </p>
          <div className="space-y-3">
            {SCORECARD_METRICS.map((row) => (
              <div key={row.metric} className="border border-slate-200 rounded-lg p-4 bg-white">
                <p className="text-[13px] font-semibold text-slate-900 mb-1">{row.metric}</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">{row.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-3">
            Commercial notes
          </p>
          <div className="space-y-3 text-[14px] text-slate-600 leading-relaxed">
            {COMMERCIAL_NOTES.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Cohort sizing scenarios for procurement
          </p>
          <div className="space-y-3">
            {COHORT_SCENARIOS.map((row) => (
              <div key={row.cohort} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <p className="text-[13px] font-semibold text-slate-900 mb-1">{row.cohort} - {row.profile}</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">{row.decisionUse}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-slate-500 mt-4 leading-relaxed">
            Final pricing depends on seat mix, term, and support model. These scenarios are for planning conversations and internal approvals.
          </p>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Enterprise KPI mapping (CHRO and procurement lens)
          </p>
          <div className="space-y-3">
            {EMPLOYER_KPI_MAP.map((row) => (
              <div key={row.buyerMetric} className="border border-slate-200 rounded-lg p-4 bg-white">
                <p className="text-[13px] font-semibold text-slate-900 mb-1">{row.buyerMetric}</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">{row.mappedSignal}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Sample weekly partner report
          </p>
          <ul className="space-y-2">
            {SAMPLE_WEEKLY_REPORT.map((line) => (
              <li key={line} className="text-[14px] text-slate-700 leading-relaxed">+ {line}</li>
            ))}
          </ul>
        </section>

        <section className="border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">
            Next step
          </p>
          <p className="text-[14px] text-slate-600 leading-relaxed mb-5">
            If the model looks viable, request a live partner walkthrough and define a pilot cohort with named success metrics.
          </p>
          <div className="flex flex-wrap gap-4 text-[13px]">
            <Link href="/partners#apply" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Apply to partner program
            </Link>
            <Link href="/for-outplacement/trust-pack" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Open trust and governance pack
            </Link>
            <Link href="/for-outplacement/faq" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Read outplacement FAQ
            </Link>
            <Link href="/for-outplacement" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Return to outplacement preview
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
