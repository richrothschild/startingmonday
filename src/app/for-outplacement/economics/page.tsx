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

const COMMERCIAL_EXAMPLES = [
  {
    seats: '25 seats',
    term: '3-month pilot',
    mix: '15 Active, 10 Intelligence',
    monthlyList: '$3,485/mo list before volume discounts',
    estimate: '$10,455 total list over 3 months before negotiated partner terms',
  },
  {
    seats: '50 seats',
    term: '6-month program',
    mix: '30 Active, 20 Intelligence',
    monthlyList: '$6,950/mo list before volume discounts',
    estimate: '$41,700 total list over 6 months before negotiated partner terms',
  },
  {
    seats: '100 seats',
    term: '12-month rollout',
    mix: '55 Active, 45 Intelligence',
    monthlyList: '$13,240/mo list before volume discounts',
    estimate: '$158,880 total list over 12 months before negotiated partner terms',
  },
]

const BUSINESS_IMPACT = [
  {
    metric: 'Placement-cycle confidence',
    conservative: 'Use day-30 momentum lift as an early indicator, not a guaranteed placement claim.',
  },
  {
    metric: 'Counselor capacity quality',
    conservative: 'Target fewer context-rebuild minutes per session and more strategy-time minutes per session.',
  },
  {
    metric: 'Employer-facing program credibility',
    conservative: 'Use documented scorecards and governance notes to show disciplined transition support.',
  },
]

const METHOD_DISCLOSURE = [
  'Activation numerator: participants with complete setup and target list. Denominator: assigned seats.',
  'Signal action numerator: active participants with at least one signal-driven action. Denominator: active participants.',
  'Prep readiness numerator: high-stakes conversations with prep brief reviewed beforehand. Denominator: high-stakes conversations.',
]

const OWNER_MATRIX = [
  {
    meeting: 'Weekly operating review',
    owner: 'Program lead',
    output: 'Adoption status, top risks, and intervention owners.',
  },
  {
    meeting: 'Biweekly counselor quality review',
    owner: 'Counselor lead',
    output: 'Session-yield trend and prep-quality drift analysis.',
  },
  {
    meeting: 'Monthly sponsor governance review',
    owner: 'Partner sponsor',
    output: 'Scale/tune/stop recommendation with documented evidence.',
  },
]

const WEEKLY_PACKET_TEMPLATE = [
  'Activation rate: percent of assigned participants fully active this week',
  'Signal action velocity: average signal-driven actions per active participant',
  'Prep readiness rate: percent of high-stakes meetings with prep brief review before meeting',
  'Stall index: count of participants with 7+ days without meaningful action',
  'Intervention queue: named owners, due dates, and expected behavior change',
]

const QUANTIFIED_COMPARISON = [
  {
    metric: 'Weekly participant action consistency',
    current: '40-55% consistently active',
    target: '70-85% consistently active by day 30',
  },
  {
    metric: 'Prep reviewed before high-stakes meetings',
    current: '35-50%',
    target: '70-90%',
  },
  {
    metric: 'Counselor context rebuild time per session',
    current: '20-30 minutes',
    target: '5-12 minutes',
  },
  {
    metric: 'Stalled-participant detection latency',
    current: '7-14 days',
    target: '2-5 days',
  },
]

const QUOTE_PACKAGING = [
  {
    packageName: 'Pilot packaging',
    details: '1 cohort, fixed 30-day decision gate, onboarding + weekly governance support included under signed Order Form and MSA scope.',
    quoteInputs: 'Seat mix, support tier, reporting scope, legal review timeline, and named sponsor owner.',
  },
  {
    packageName: 'Program packaging',
    details: 'Multi-cohort or recurring cohorts with defined review cadence, named deliverables, and contract-linked reporting outputs.',
    quoteInputs: 'Expected cohort volume, term length, operating model complexity, training needs, and committee review schedule.',
  },
  {
    packageName: 'Enterprise packaging',
    details: 'Centralized governance, expanded reporting cadence, and enterprise procurement controls with contractual service commitments.',
    quoteInputs: 'Office count, compliance requirements, support SLA tier, sponsor governance model, and legal exhibit requirements.',
  },
]

const CONTRACT_SLA_MAP = [
  {
    clause: 'Support response commitments',
    contractualLanguage: 'Response-time commitments documented in Order Form schedule by severity tier (P1, P2, P3).',
    defaultPosition: 'P1 same business day, P2 next business day, P3 two business days.',
  },
  {
    clause: 'Pilot decision window',
    contractualLanguage: 'Pilot scope fixed to one cohort and one decision window with explicit pass/fail criteria.',
    defaultPosition: 'Day-30 decision gate with clean-no close path and optional corrective cycle terms.',
  },
  {
    clause: 'Reporting obligations',
    contractualLanguage: 'Weekly and monthly reporting outputs listed as deliverables in commercial schedule.',
    defaultPosition: 'Activation, action velocity, prep readiness, stall index, and intervention queue included.',
  },
  {
    clause: 'Security and trust artifacts',
    contractualLanguage: 'Trust artifact request process and diligence documents referenced in security exhibit.',
    defaultPosition: 'Public summary plus partner diligence packet under request workflow.',
  },
]

const RACI_ROWS = [
  {
    deliverable: 'Metric dictionary maintenance',
    responsible: 'Program analytics owner',
    accountable: 'Partner sponsor',
    consulted: 'Counselor lead, Starting Monday partner success',
    informed: 'Client HR stakeholders',
  },
  {
    deliverable: 'Weekly review packet publication',
    responsible: 'Program lead',
    accountable: 'Partner sponsor',
    consulted: 'Counselor lead',
    informed: 'Executive steering group',
  },
  {
    deliverable: 'Intervention rule updates',
    responsible: 'Counselor lead',
    accountable: 'Program lead',
    consulted: 'Partner success, analytics owner',
    informed: 'Sponsor and client HR partners',
  },
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
            <p className="font-semibold text-slate-800">Pilot is a decision instrument, not a commitment instrument.</p>
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

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Quantified current-model vs operating-layer outcomes
          </p>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full text-left text-[13px]">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Metric</th>
                  <th className="px-4 py-3 font-semibold">Typical current range</th>
                  <th className="px-4 py-3 font-semibold">Pilot target range</th>
                </tr>
              </thead>
              <tbody>
                {QUANTIFIED_COMPARISON.map((row) => (
                  <tr key={row.metric} className="border-t border-slate-200 bg-white">
                    <td className="px-4 py-3 text-slate-900 font-medium">{row.metric}</td>
                    <td className="px-4 py-3 text-slate-600">{row.current}</td>
                    <td className="px-4 py-3 text-slate-700">{row.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-slate-500 mt-3 leading-relaxed">
            Ranges are directional planning bands; calibrate with your baseline and governance model before launch.
          </p>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Commercial examples by term and seat mix (illustrative)
          </p>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full text-left text-[13px]">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cohort</th>
                  <th className="px-4 py-3 font-semibold">Term</th>
                  <th className="px-4 py-3 font-semibold">Seat mix</th>
                  <th className="px-4 py-3 font-semibold">Monthly list estimate</th>
                  <th className="px-4 py-3 font-semibold">Term estimate</th>
                </tr>
              </thead>
              <tbody>
                {COMMERCIAL_EXAMPLES.map((row) => (
                  <tr key={`${row.seats}-${row.term}`} className="border-t border-slate-200 bg-white">
                    <td className="px-4 py-3 text-slate-900 font-medium">{row.seats}</td>
                    <td className="px-4 py-3 text-slate-600">{row.term}</td>
                    <td className="px-4 py-3 text-slate-600">{row.mix}</td>
                    <td className="px-4 py-3 text-slate-700">{row.monthlyList}</td>
                    <td className="px-4 py-3 text-slate-700">{row.estimate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-slate-500 mt-3 leading-relaxed">
            Illustrative calculations use published plan prices before partner discounts, term incentives, and negotiated service scope.
          </p>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Quote-level packaging framework
          </p>
          <div className="space-y-3">
            {QUOTE_PACKAGING.map((row) => (
              <div key={row.packageName} className="border border-slate-200 rounded-lg p-4 bg-white">
                <p className="text-[13px] font-semibold text-slate-900 mb-1">{row.packageName}</p>
                <p className="text-[13px] text-slate-600 mb-1">{row.details}</p>
                <p className="text-[13px] text-slate-600"><span className="font-semibold text-slate-700">Quote inputs: </span>{row.quoteInputs}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-slate-500 mt-3 leading-relaxed">
            Final approval packages should use quoted commercial terms issued against agreed scope, not only illustrative planning examples.
          </p>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Contract-linked quote package language
          </p>
          <p className="text-[14px] text-slate-700 leading-relaxed mb-3">
            Commercial approval should reference signed package artifacts: Order Form scope, MSA service boundaries, and pilot acceptance schedule.
          </p>
          <ul className="space-y-2">
            <li className="text-[14px] text-slate-700 leading-relaxed">+ Package statement must include seat counts, term, named deliverables, and sponsor owner.</li>
            <li className="text-[14px] text-slate-700 leading-relaxed">+ Pilot acceptance criteria must be listed as measurable thresholds, not narrative goals.</li>
            <li className="text-[14px] text-slate-700 leading-relaxed">+ Expansion terms should be conditional on documented day-30 or day-60 decision evidence.</li>
          </ul>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            SLA and contract-clause mapping
          </p>
          <div className="space-y-3">
            {CONTRACT_SLA_MAP.map((row) => (
              <div key={row.clause} className="border border-slate-200 rounded-lg p-4 bg-white">
                <p className="text-[13px] font-semibold text-slate-900 mb-1">{row.clause}</p>
                <p className="text-[13px] text-slate-600 mb-1"><span className="font-semibold text-slate-700">Contract language: </span>{row.contractualLanguage}</p>
                <p className="text-[13px] text-slate-600"><span className="font-semibold text-slate-700">Default position: </span>{row.defaultPosition}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Methodology disclosure mini-section
          </p>
          <ul className="space-y-2">
            {METHOD_DISCLOSURE.map((item) => (
              <li key={item} className="text-[14px] text-slate-700 leading-relaxed">+ {item}</li>
            ))}
          </ul>
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
            Conservative business impact framing
          </p>
          <div className="space-y-3">
            {BUSINESS_IMPACT.map((row) => (
              <div key={row.metric} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <p className="text-[13px] font-semibold text-slate-900 mb-1">{row.metric}</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">{row.conservative}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Owner and meeting cadence matrix
          </p>
          <div className="space-y-3">
            {OWNER_MATRIX.map((row) => (
              <div key={row.meeting} className="border border-slate-200 rounded-lg p-4 bg-white">
                <p className="text-[13px] font-semibold text-slate-900 mb-1">{row.meeting}</p>
                <p className="text-[13px] text-slate-600 mb-1"><span className="font-semibold text-slate-700">Owner: </span>{row.owner}</p>
                <p className="text-[13px] text-slate-600"><span className="font-semibold text-slate-700">Required output: </span>{row.output}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Owner accountability (RACI variant for larger partner teams)
          </p>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full text-left text-[13px]">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Deliverable</th>
                  <th className="px-4 py-3 font-semibold">Responsible</th>
                  <th className="px-4 py-3 font-semibold">Accountable</th>
                  <th className="px-4 py-3 font-semibold">Consulted</th>
                  <th className="px-4 py-3 font-semibold">Informed</th>
                </tr>
              </thead>
              <tbody>
                {RACI_ROWS.map((row) => (
                  <tr key={row.deliverable} className="border-t border-slate-200 bg-white">
                    <td className="px-4 py-3 text-slate-900 font-medium">{row.deliverable}</td>
                    <td className="px-4 py-3 text-slate-600">{row.responsible}</td>
                    <td className="px-4 py-3 text-slate-700">{row.accountable}</td>
                    <td className="px-4 py-3 text-slate-600">{row.consulted}</td>
                    <td className="px-4 py-3 text-slate-600">{row.informed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Friday MBR-lite packet template (with definitions)
          </p>
          <ul className="space-y-2">
            {WEEKLY_PACKET_TEMPLATE.map((line) => (
              <li key={line} className="text-[14px] text-slate-700 leading-relaxed">+ {line}</li>
            ))}
          </ul>
        </section>

        <section className="border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">
            Next step
          </p>
          <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/50 mb-5">
            <p className="text-[12px] font-semibold text-slate-900 mb-1">Short objection response</p>
            <p className="text-[12px] text-slate-700 leading-relaxed">Worried this creates commitment pressure? It does not. Pilot is scoped as a decision gate with a documented clean-no exit path.</p>
          </div>
          <p className="text-[14px] text-slate-600 leading-relaxed mb-5">
            If the model looks viable, request a live partner walkthrough and define a pilot cohort with named success metrics.
          </p>
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 mb-5">
            <p className="text-[12px] font-semibold text-slate-900 mb-2">Calibrated decision questions</p>
            <p className="text-[12px] text-slate-600 leading-relaxed">Would it be unreasonable to use one 30-day cohort as the only decision gate before scaling?</p>
            <p className="text-[12px] text-slate-600 leading-relaxed mt-1">What specific day-30 evidence would make expansion feel obvious to your committee?</p>
          </div>
          <div className="flex flex-wrap gap-4 text-[13px]">
            <Link href="/partners#apply" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Apply to partner program
            </Link>
            <Link href="/for-outplacement/executive-summary" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              View committee one-pager
            </Link>
            <Link href="/for-outplacement/runbook" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Open runbook and templates
            </Link>
            <Link href="/for-outplacement/metric-dictionary" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Open canonical metric dictionary
            </Link>
            <Link href="/for-outplacement/operating-scorecard" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Open printable operating scorecard
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
          <p className="text-[12px] text-slate-500 leading-relaxed mt-4">
            Clean no path: if pilot criteria are not met at day 30, close without expansion commitment and retain the decision artifacts.
          </p>
          <p className="text-[12px] text-slate-500 leading-relaxed mt-2">
            Day-30 pause path: if evidence is mixed, pause expansion, run one corrective 30-day cycle, and decide at day 60 with the same scorecard definitions.
          </p>
        </section>
      </main>
    </div>
  )
}
