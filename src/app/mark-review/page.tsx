import type { Metadata } from 'next'
import Link from 'next/link'
import TrackedCtaLink from '@/components/TrackedCtaLink'

export const metadata: Metadata = {
  title: 'Starting Monday | Manager Tools Decision Brief',
  description:
    'Operator decision brief for Manager Tools: execution cadence, control metrics, risks, and near-term go/no-go calls.',
  alternates: { canonical: 'https://startingmonday.app/mark-review' },
  openGraph: {
    title: 'Starting Monday | Manager Tools Decision Brief',
    description:
      'Operator decision brief for Manager Tools: execution cadence, control metrics, risks, and near-term go/no-go calls.',
    url: 'https://startingmonday.app/mark-review',
  },
}

const NEXT_7_DAYS = [
  'Publish one control KPI with denominator, timeframe, and confidence annotation.',
  'Tighten person-first copy in hero and support sections.',
  'Instrument loop-closure tracking for outreach, conversation, and follow-up actions.',
]

const BLUF = [
  'This is an execution system, not a content site. It should drive weekly behavior that leads to conversations and closed loops.',
  'Primary near-term risk is measurement: if loop-closure controls are not visible, we cannot manage performance.',
  'Monday decision needed: approve the control scoreboard standard and the first KPI to publish this week.',
]

const LANE_ONE_GOALS = [
  {
    title: 'Decision speed first',
    detail:
      'A first-time reviewer should understand the operating model and business case in under five minutes.',
  },
  {
    title: 'Momentum Signal alignment',
    detail:
      'Motion Signal and Momentum Signal language are treated as one concept: early movement that triggers immediate relationship action.',
  },
  {
    title: 'Proof discipline',
    detail:
      'Every quantitative claim includes denominator, timeframe, and confidence before headline use.',
  },
]

const WHAT_STARTING_MONDAY_IS = [
  'An operating system for executive transition execution.',
  'A weekly cadence model: signal -> decision -> outreach -> follow-up.',
  'A management layer with measurable control points and accountability.',
]

const WHAT_STARTING_MONDAY_IS_NOT = [
  'Not a passive dashboard.',
  'Not generic AI content generation without operating context.',
  'Not a replacement for executive judgment, coaching judgment, or search judgment.',
]

const LOOP_CLOSURE_SCORECARD = [
  {
    metric: 'Signals triaged within 24h',
    baseline: 'No published site KPI yet',
    laneOneTarget: 'Publish KPI with denominator and cadence by Friday',
  },
  {
    metric: 'Outreach actions per week',
    baseline: 'Tracked in workflow, not visible publicly',
    laneOneTarget: 'Expose one normalized weekly benchmark',
  },
  {
    metric: 'Follow-up completion rate',
    baseline: 'Mentioned conceptually, not measured end to end',
    laneOneTarget: 'Instrument and report in weekly growth readout',
  },
]

const FEATURE_CHANNELS = [
  {
    channel: 'Individual executives (direct)',
    audience: 'VP, C-suite, and board-track operators managing their own search campaign.',
    features: [
      'Career page and signal monitoring for target accounts.',
      'AI prep briefs tied to each target company and role context.',
      'Pipeline, contacts, outreach drafting, and follow-up workflow.',
      'Daily and weekly cadence layer for execution accountability.',
    ],
    value: 'Turns fragmented search tasks into a repeatable operating system.',
  },
  {
    channel: 'Executive coaches',
    audience: 'Coaches supporting senior clients in transition.',
    features: [
      'Coach-visible client execution and follow-up health.',
      'Shared prep and strategy context between sessions.',
      'Signal intelligence to guide where coach time is spent.',
      'Quality controls for narrative and outreach consistency.',
    ],
    value: 'Increases coach leverage and client execution quality between sessions.',
  },
  {
    channel: 'Search firms',
    audience: 'Boutique and retained executive search teams.',
    features: [
      'Candidate readiness visibility and prep depth by target account.',
      'Signal tracking around hiring movement and leadership changes.',
      'Confidential workflow framing to support trust with clients and candidates.',
      'Structured briefing support for high-stakes conversation prep.',
    ],
    value: 'Improves readiness and quality of candidate conversations before key interviews.',
  },
  {
    channel: 'Outplacement and transition partners',
    audience: 'Institutional providers managing executive cohorts.',
    features: [
      'Program-level rollout with cohort visibility.',
      'Execution telemetry and standardized workflow guardrails.',
      'Channel-ready brief and prep modules for participants.',
      'Governance support for quality and adoption reviews.',
    ],
    value: 'Scales premium transition support without linear service labor.',
  },
]

const OBSTACLE_AND_COMPETITION_SNAPSHOT = [
  {
    heading: 'Adoption and behavior change risk',
    detail:
      'The model works only if users maintain weekly execution discipline, not just log in. Cadence adherence and loop-closure tracking remain the core adoption risk.',
  },
  {
    heading: 'AI and DIY as baseline competitors',
    detail:
      'General LLMs and personal spreadsheet stacks are the default alternative in every channel. The defense is workflow integration, context continuity, and measurable operating outcomes over one-off prompts.',
  },
  {
    heading: 'Switching costs in incumbent ecosystems',
    detail:
      'Coaches and firms already run on existing CRM, notes, and document systems. Adoption requires low-friction onboarding, clear migration value, and role-safe boundaries.',
  },
  {
    heading: 'Growth constraints: authority, reach, and frequency',
    detail:
      'Domain authority in executive search is still developing, paid reach is expensive, and message frequency needed for trust-building is high. Repeatable partner channels are required to compound distribution.',
  },
]

const MARK_DILIGENCE_GAPS = [
  'Per-channel week-1 activation benchmark with clear denominator definitions.',
  'Documented retention curves by channel with reason-coded churn.',
  'Channel-level unit economics: CAC, gross margin, payback, and expansion path.',
  'Evidence that AI-supported workflows improve decisions versus DIY baseline, not only speed.',
  'Implementation proof for partner channels: setup time, training burden, and role adoption rates.',
]

const BUSINESS_PLAN_LINK = '/mark-review/business-plan'

export default function MarkReviewPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase" aria-label="Go to Starting Monday homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Main site
            </Link>
            <Link href={BUSINESS_PLAN_LINK} className="text-[13px] text-slate-300 hover:text-white transition-colors">
              Business plan
            </Link>
            <TrackedCtaLink
              href="/signup"
              eventName="mark_review_cta_click"
              eventProps={{ placement: 'top_nav', cta: 'try_free' }}
              className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Try free
            </TrackedCtaLink>
          </div>
        </div>
      </nav>

      <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">Executive memo</p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-white leading-[1.12] tracking-tight mb-5">
            Starting Monday: review brief
          </h1>
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-3xl">
            Starting Monday lens: what it is, where it wins, where it breaks, and what I need from you.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-18">
<div className="max-w-4xl mx-auto space-y-10">
          <section className="border border-slate-900 rounded-lg p-6 bg-slate-950">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-4">Bottom line</p>
            <ul className="space-y-2.5">
              {BLUF.map((item) => (
                <li key={item} className="text-[14px] text-slate-100 leading-relaxed flex items-start gap-2.5">
                  <span className="text-orange-300 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">What Starting Monday is and is not</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">Is</p>
                <ul className="space-y-1.5">
                  {WHAT_STARTING_MONDAY_IS.map((item) => (
                    <li key={item} className="text-[13px] text-slate-800 leading-relaxed flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">Is not</p>
                <ul className="space-y-1.5">
                  {WHAT_STARTING_MONDAY_IS_NOT.map((item) => (
                    <li key={item} className="text-[13px] text-slate-800 leading-relaxed flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">Current operating position</p>
            <p className="text-[15px] text-slate-700 leading-relaxed">
              Starting Monday is an execution system for C-suite and near-C-suite technology leaders in transition, built to create consistent weekly operating discipline and better-fit outcomes.
            </p>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500">Core capabilities by channel</p>
              <TrackedCtaLink
                href={BUSINESS_PLAN_LINK}
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'features_by_channel', target: 'business_plan' }}
                className="text-[13px] font-semibold text-slate-900 underline underline-offset-2"
              >
                Open full planning and risk view
              </TrackedCtaLink>
            </div>
            <div className="space-y-4">
              {FEATURE_CHANNELS.map((item) => (
                <article key={item.channel} className="rounded border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[13px] font-semibold text-slate-900">{item.channel}</p>
                  <p className="text-[13px] text-slate-700 mt-1">{item.audience}</p>
                  <ul className="mt-3 space-y-1.5">
                    {item.features.map((feature) => (
                      <li key={feature} className="text-[13px] text-slate-800 leading-relaxed flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[12px] text-slate-600 mt-3">Operating value: {item.value}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Key obstacles and competitive pressure</p>
            <div className="space-y-4">
              {OBSTACLE_AND_COMPETITION_SNAPSHOT.map((item) => (
                <div key={item.heading} className="border-l-4 border-slate-300 pl-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-1">{item.heading}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed mt-4">
              Detailed TAM, monetization model, year 1-5 revenue estimate, channel competition, and switching-cost analysis are in the linked planning page.
            </p>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Control scorecard</p>
            <p className="text-[14px] text-slate-700 leading-relaxed mb-4">
              This is the operating scoreboard for Motion Signal to Momentum Signal execution. Lane 1 is complete only when these controls are visible and governed.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Metric</th>
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Current baseline</th>
                    <th className="py-2 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Lane 1 target</th>
                  </tr>
                </thead>
                <tbody>
                  {LOOP_CLOSURE_SCORECARD.map((row) => (
                    <tr key={row.metric} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-3 text-[13px] font-semibold text-slate-900">{row.metric}</td>
                      <td className="py-3 pr-3 text-[13px] text-slate-700">{row.baseline}</td>
                      <td className="py-3 text-[13px] text-slate-700">{row.laneOneTarget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Next 7-day priorities</p>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-900 leading-relaxed">
              {NEXT_7_DAYS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="border border-blue-300 rounded-lg p-6 bg-blue-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue-700 mb-4">How to assess the risk of execution</p>
            <ul className="space-y-2.5">
              {MARK_DILIGENCE_GAPS.map((item) => (
                <li key={item} className="text-[14px] text-slate-800 leading-relaxed flex items-start gap-2.5">
                  <span className="text-blue-700 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-orange-300 rounded-lg p-6 bg-orange-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-600 mb-4">What I'd like from you</p>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-900 leading-relaxed">
              <li>Brutally honest feedback.</li>
              <li>Does this seem like a viable product?</li>
              <li>What would you fix?</li>
            </ol>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Review links</p>
            <div className="space-y-3 text-[14px]">
              <TrackedCtaLink
                href="/"
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'review_links', target: 'main_site' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Main site: https://startingmonday.app
              </TrackedCtaLink>
              <TrackedCtaLink
                href="/demo"
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'review_links', target: 'demo' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Demo: https://startingmonday.app/demo
              </TrackedCtaLink>
              <TrackedCtaLink
                href="/demo/cio/notes"
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'review_links', target: 'notes_mode' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Notes mode (proof + cadence framing): https://startingmonday.app/demo/cio/notes
              </TrackedCtaLink>
              <TrackedCtaLink
                href="/pricing"
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'review_links', target: 'pricing' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Pricing: https://startingmonday.app/pricing
              </TrackedCtaLink>
              <TrackedCtaLink
                href={BUSINESS_PLAN_LINK}
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'review_links', target: 'business_plan' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Business plan for Manager Tools: https://startingmonday.app/mark-review/business-plan
              </TrackedCtaLink>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
