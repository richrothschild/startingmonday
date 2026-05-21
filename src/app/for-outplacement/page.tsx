import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Outplacement Partner Preview | Starting Monday',
  description: 'For outplacement and transition firms that want stronger cohort momentum, better interview readiness, and clearer placement outcomes without adding counselor admin load.',
  alternates: { canonical: 'https://startingmonday.app/for-outplacement' },
  openGraph: {
    title: 'Outplacement Partner Preview | Starting Monday',
    description: 'Give displaced executives a practical operating layer between sessions: pipeline, signals, prep briefs, and daily execution cadence.',
    url: 'https://startingmonday.app/for-outplacement',
  },
}

const FEATURES = [
  {
    name: 'Active Search Infrastructure',
    forFirm: 'Your program graduates executives with a clear understanding of the search process. Starting Monday gives them the platform to actually run it. Pipeline command center, company intelligence scanner, daily briefing, interview prep briefs - it is the operational layer that turns your workshop into an active campaign.',
    outcome: 'Executives leave your program with a running search, not a revised resume and a list of job boards. Your placement outcomes improve. Your client\'s HR team sees the difference.',
  },
  {
    name: 'Company Intelligence Scanner',
    forFirm: 'The scanner monitors every company an executive is tracking - news, executive departures, funding, 8-K filings, career page postings - every 48 hours. When signals cluster into a pattern that precedes a CIO or VP search, the platform names it and alerts the executive before the role is formalized.',
    outcome: 'Executives reach out to target companies before searches go to firms. That is the window that matters at the senior level. Your program delivers it.',
  },
  {
    name: 'Daily Briefing and Accountability',
    forFirm: 'Every morning, the platform sends each enrolled executive a digest of new signals, pending follow-up actions, and pipeline status. It installs the daily discipline that displaced executives often lose when the structure of employment disappears. No coach or counselor needs to manually check in.',
    outcome: 'Search activity stays consistent between check-ins. Executives who were drifting stay in motion. Your counselors spend time on strategy, not accountability.',
  },
  {
    name: 'AI Interview Prep Briefs',
    forFirm: 'Before every interview, the platform generates a full prep brief in about a minute: company situation, the win thesis the executive should lead with, likely objections and how to counter them, and the questions only a peer would ask. It draws from everything the executive has tracked and researched on that company.',
    outcome: 'Executives arrive at interviews prepared at depth. First-round pass rates improve. The difference between a prepared senior candidate and an unprepared one is audible in ten minutes.',
  },
  {
    name: 'Bulk Activation and Usage Tracking',
    forFirm: 'For outplacement programs, we provide bulk seat pricing with centralized billing and activation tracking. You can see which executives have activated their accounts, what their search activity looks like, and who may need a push. No manual check-ins required to know where each program participant stands.',
    outcome: 'Your counselors have a clear view of engagement across the cohort. You can identify who needs attention before they fall behind.',
  },
]

const PROOF_METRICS = [
  {
    value: '81%',
    label: 'of Jan-May 2026 pilot executives reached a first interview within 30 days',
  },
  {
    value: '9 days',
    label: 'median time from setup to first qualified outreach in the same pilot window',
  },
  {
    value: '27',
    label: 'executives in current verified evidence snapshot (methodology disclosed)',
  },
  {
    value: '43%',
    label: 'of pilot coaches adopted daily briefing into active session workflow',
  },
]

const PILOT_SCORECARD = [
  {
    metric: 'Week 1 cohort activation',
    success: 'At least 80% of assigned executives activate and set target list baseline.',
  },
  {
    metric: 'Week 2 signal response',
    success: 'Each active executive takes at least one signal-driven outreach action.',
  },
  {
    metric: 'Week 3 prep quality',
    success: 'At least one prep brief reviewed before a real interview conversation.',
  },
  {
    metric: 'Day 30 progress',
    success: 'Clear pass/fail signal on momentum lift vs. your current baseline.',
  },
]

const ANON_SOCIAL_PROOF = [
  {
    title: 'National outplacement provider, technology cohort',
    detail: 'Pilot cohort showed stronger week-2 outreach consistency after introducing daily decision prompts and counselor-side activity visibility.',
  },
  {
    title: 'Regional transition specialist, mixed leadership cohort',
    detail: 'Counselor prep time dropped as participants arrived with current pipeline status and signal context already organized.',
  },
  {
    title: 'Enterprise HR-sponsored transition program',
    detail: 'Program leads used the 30-day scorecard to identify stalled participants earlier and trigger targeted counselor intervention.',
  },
]

const PILOT_IMPLEMENTATION_STEPS = [
  {
    week: 'Week 0',
    action: 'Kickoff and baseline setup',
    owner: 'Partner lead + Starting Monday',
    outcome: 'Cohort defined, scorecard baseline approved, seat mix confirmed.',
  },
  {
    week: 'Week 1',
    action: 'Activation sprint',
    owner: 'Counselor leads + participant cohort',
    outcome: 'Target list setup complete and first signal review performed.',
  },
  {
    week: 'Week 2',
    action: 'Signal-to-action execution',
    owner: 'Participants with counselor oversight',
    outcome: 'Each active participant logs at least one signal-driven outreach action.',
  },
  {
    week: 'Week 3',
    action: 'Prep quality checkpoint',
    owner: 'Counselors + participants',
    outcome: 'At least one high-stakes conversation prepared through a prep brief.',
  },
  {
    week: 'Day 30',
    action: 'Pass/fail review',
    owner: 'Partner sponsor + Starting Monday',
    outcome: 'Decision to scale, tune, or close pilot based on agreed success criteria.',
  },
]

const WEEKLY_CADENCE = [
  'Monday: cohort pipeline review and stalled participant triage',
  'Tuesday through Thursday: daily signal review and one high-quality action per participant',
  'Pre-session: counselor reads what changed since prior conversation',
  'Friday: risk and momentum review with next-week intervention list',
]

const ROLE_MATRIX = [
  {
    role: 'Starting Monday platform',
    owns: 'Signal detection, prep brief generation, activity visibility, scorecard reporting.',
  },
  {
    role: 'Counselors',
    owns: 'Judgment, narrative coaching, prioritization, and confidence support.',
  },
  {
    role: 'Program lead',
    owns: 'Cohort governance, adoption accountability, and escalation decisions.',
  },
]

const OBJECTIONS = [
  {
    objection: 'We already provide this in coaching and workshops.',
    response:
      'That is exactly why this works. Starting Monday is not a replacement for your counselors. It is the between-session operating layer that reduces admin drag and keeps executives in motion.',
  },
  {
    objection: 'Our executives are overwhelmed and will not adopt another tool.',
    response:
      'Adoption improves when framed as one morning decision list, not another platform. Start with a 30-day cohort pilot and measure activation and action rates before deciding on rollout.',
  },
  {
    objection: 'Data privacy is too risky for transition programs.',
    response:
      'Client access is permission-based, logged, and revocable. This preserves trust while giving counselors enough visibility to identify stalls early.',
  },
]

export default function ForOutplacementPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Nav */}
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/demo" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              See a demo
            </Link>
            <Link href="/for-outplacement/faq" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="/for-outplacement/trust-pack" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Trust pack
            </Link>
            <Link
              href="/partners"
              className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Become a partner
            </Link>
          </div>
        </div>
      </nav>

      <main>

        {/* Header */}
        <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-12">
          <div className="max-w-2xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
              Partner Guide
            </p>
            <h1 className="text-[30px] sm:text-[38px] font-bold text-white leading-[1.15] tracking-tight mb-4">
              Starting Monday for <span className="whitespace-nowrap">Outplacement Firms</span>
            </h1>
            <p className="text-[16px] text-slate-400 leading-relaxed">
              Give displaced executives an active search platform. Not a workshop they will forget in two weeks.
            </p>
            <p className="text-[13px] text-orange-300 leading-relaxed mt-4 max-w-xl">
              The goal is simple: stronger placement momentum with less counselor admin overhead.
            </p>
            <div className="border border-slate-700 rounded-xl p-4 bg-slate-950/40 mt-6">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-orange-400 mb-2">You might be thinking</p>
              <div className="space-y-1.5 text-[13px] text-slate-300 leading-relaxed">
                <p><span className="text-white font-semibold">This sounds like one more platform to manage.</span> Fair concern. The design goal is to reduce counselor overhead, not add it.</p>
                <p><span className="text-white font-semibold">We already run workshops and coaching.</span> This handles the between-session operating work so your team stays in strategy.</p>
                <p><span className="text-white font-semibold">Security review may slow us down.</span> Security and legal review can run in parallel with pilot setup.</p>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto space-y-14">

            {/* What it is */}
            <section className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">What Starting Monday is</h2>
              <p>
                Starting Monday is an AI-powered search platform built for VP and C-suite executives
                in active career transition. Pipeline tracking, company intelligence scanning, AI
                interview prep briefs, daily briefing, and a strategy brief built from their background
                and target list.
              </p>
              <p>
                For outplacement firms, it is the operational layer that turns your program into an
                active campaign. Your counselors provide the strategy and support. Starting Monday
                provides the infrastructure the executive needs to actually run the search.
              </p>
              <p>
                In practical terms: one shared view for pipeline, signal movement, and prep readiness
                so counselors spend less time rebuilding context and more time on strategic coaching.
              </p>
            </section>

            <section className="border border-slate-200 rounded-xl p-6 bg-slate-50">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">Why partners buy</p>
              <h2 className="text-[22px] font-bold text-slate-900 mb-3">Outplacement partners buy outcomes first.</h2>
              <ul className="space-y-2 text-[15px] text-slate-700 leading-relaxed pl-1">
                <li>+ More executives taking weekly search actions instead of drifting</li>
                <li>+ Better interview readiness before high-stakes conversations</li>
                <li>+ Clear cohort-level visibility without manual check-in overhead</li>
                <li>+ Stronger client confidence in program progress during transition</li>
              </ul>
            </section>

            {/* The gap */}
            <section className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">The gap it fills</h2>
              <p>
                Most outplacement programs are built around workshops, resume reviews, and interview
                coaching. Those are necessary. But they do not give the executive the daily operational
                infrastructure to run a modern senior search.
              </p>
              <p>
                Your executive leaves the program with a revised resume, a revised LinkedIn profile,
                and a list of best practices. Then they go home and manage their search in a
                spreadsheet - manually tracking 40 companies, missing signals before roles are posted,
                preparing for interviews the night before with a ten-minute web search.
              </p>
              <p>
                The gap between your program and a successful placement is infrastructure. Starting
                Monday fills it.
              </p>
            </section>

            {/* How firms use it */}
            <section className="space-y-6">
              <h2 className="text-[22px] font-bold text-slate-900">How outplacement firms use it</h2>
              <div className="space-y-8">
                {FEATURES.map(f => (
                  <div key={f.name} className="border-l-2 border-orange-500 pl-5">
                    <p className="text-[13px] font-bold tracking-[0.1em] uppercase text-orange-600 mb-2">{f.name}</p>
                    <p className="text-[15px] text-slate-700 leading-relaxed mb-2">{f.forFirm}</p>
                    <p className="text-[13px] text-slate-500 leading-relaxed">
                      <span className="font-semibold text-slate-700">Outcome: </span>{f.outcome}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-[22px] font-bold text-slate-900">Pilot proof snapshot</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROOF_METRICS.map((m) => (
                  <div key={m.label} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <p className="text-[26px] font-bold text-orange-600 leading-none mb-2">{m.value}</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{m.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Source window: Jan-May 2026 pilot evidence set. Use this as directional signal, then validate with your own cohort baseline.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-[22px] font-bold text-slate-900">Evidence pattern snapshots (anonymized)</h2>
              <p className="text-[14px] text-slate-600 leading-relaxed">
                We do not publish partner names without permission. Instead, we share consistent outcome patterns, methodology notes, and scorecard structure you can validate in your own pilot.
              </p>
              <div className="space-y-3">
                {ANON_SOCIAL_PROOF.map((item) => (
                  <div key={item.title} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <p className="text-[13px] font-semibold text-slate-900 mb-1">{item.title}</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Claim discipline: use your own cohort outcomes first in client-facing materials. We can share methodology and evidence notes during due diligence.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-[22px] font-bold text-slate-900">30-day partner scorecard</h2>
              <div className="space-y-3">
                {PILOT_SCORECARD.map((row) => (
                  <div key={row.metric} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <p className="text-[13px] font-semibold text-slate-900 mb-1">{row.metric}</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{row.success}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-[22px] font-bold text-slate-900">Pilot implementation model</h2>
              <div className="space-y-3">
                {PILOT_IMPLEMENTATION_STEPS.map((step) => (
                  <div key={step.week} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <p className="text-[13px] font-semibold text-slate-900 mb-1">{step.week}: {step.action}</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed mb-1"><span className="font-semibold text-slate-700">Owner: </span>{step.owner}</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed"><span className="font-semibold text-slate-700">Expected outcome: </span>{step.outcome}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-[22px] font-bold text-slate-900">Weekly operating cadence</h2>
              <ul className="space-y-2 pl-1">
                {WEEKLY_CADENCE.map((line) => (
                  <li key={line} className="text-[14px] text-slate-700 leading-relaxed">+ {line}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-[22px] font-bold text-slate-900">Role boundaries and accountability</h2>
              <div className="space-y-3">
                {ROLE_MATRIX.map((row) => (
                  <div key={row.role} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <p className="text-[13px] font-semibold text-slate-900 mb-1">{row.role}</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{row.owns}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-6">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-700 mb-3">Trust and governance</p>
              <h2 className="text-[22px] font-bold text-slate-900 mb-3">Procurement-ready by design</h2>
              <p className="text-[14px] text-slate-700 leading-relaxed mb-3">
                We provide a trust pack covering data ownership, access controls, permission model, audit visibility, and pilot legal/security review workflow.
              </p>
              <div className="flex flex-wrap gap-4 text-[13px]">
                <Link href="/for-outplacement/trust-pack" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">
                  Open trust and governance pack
                </Link>
                <Link href="/for-outplacement/faq#security-&-privacy" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">
                  Review security FAQ
                </Link>
              </div>
            </section>

            {/* What it does not do */}
            <section className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">What it does not do</h2>
              <p>
                Starting Monday does not replace your counselors, your resume reviewers, or your
                interview coaches. It does not provide the human calibration, the emotional support,
                or the strategic judgment that a displaced senior executive needs in the first weeks
                of transition.
              </p>
              <p>
                It handles the research, the tracking, and the daily search discipline. Your team
                handles everything else.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-[22px] font-bold text-slate-900">Common objections</h2>
              <div className="space-y-3">
                {OBJECTIONS.map((o) => (
                  <div key={o.objection} className="border-l-2 border-orange-500 bg-orange-50/40 rounded-r-lg p-4">
                    <p className="text-[13px] font-semibold text-slate-900 mb-1">{o.objection}</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{o.response}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* For your practice */}
            <section className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">For your program</h2>
              <p>
                The simplest way to start: enroll your next senior executive cohort and include
                Starting Monday as part of the program package. Activation tracking shows you who
                is using it and who needs encouragement.
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  'Bulk seat pricing with centralized billing for outplacement programs',
                  'Activation tracking: see which executives have enrolled and are active',
                  'Active plan ($199/month per seat) includes all AI features',
                  'Intelligence plan ($49/month per seat) for executives not yet in active search mode',
                  'Volume discounts available for program cohorts of 5 or more seats',
                  'Apply to the partner program at startingmonday.app/partners to discuss bulk seat pricing, activation tracking, and preferred partner arrangements',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold shrink-0 mt-0.5">+</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4 pt-2 text-[13px]">
                <Link href="/for-outplacement/economics" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">
                  View outplacement economics
                </Link>
                <Link href="/for-outplacement/faq" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">
                  View outplacement FAQ
                </Link>
                <Link href="/for-outplacement/trust-pack" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">
                  View trust and governance pack
                </Link>
              </div>
            </section>

            {/* Apply CTA */}
            <section className="bg-slate-50 border border-slate-200 rounded-lg p-7">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
                Ready to partner?
              </p>
              <h2 className="text-[20px] font-bold text-slate-900 mb-3 leading-snug">
                Apply to the partner program
              </h2>
              <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
                Fill out the application and we will follow up within 2 business days with pilot structure, seat options, and implementation details for your cohort.
              </p>
              <div className="border border-slate-200 rounded-lg p-4 bg-white mb-6">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">What happens next</p>
                <ul className="space-y-1 text-[12px] text-slate-600 leading-relaxed">
                  <li>1. Within 2 business days: fit and cohort-scope call</li>
                  <li>2. Within 7 business days: pilot plan, scorecard baseline, and trust review track</li>
                  <li>3. Day 10 onward: activation sprint begins with counselor enablement</li>
                </ul>
              </div>
              <Link
                href="/partners#apply"
                className="inline-block bg-orange-500 text-slate-900 text-[14px] font-bold px-7 py-3 rounded hover:bg-orange-600 transition-colors"
              >
                Apply now &rarr;
              </Link>
              <p className="text-[12px] text-slate-500 mt-4 leading-relaxed">
                Would it be unreasonable to run one 30-day cohort pilot before deciding on broader rollout?
              </p>
              <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">
                If the pilot does not meet agreed success criteria, you close it cleanly with no expansion commitment.
              </p>
              <p className="text-[13px] text-slate-400 mt-4">
                Want to see the platform first?{' '}
                <Link href="/demo" className="text-slate-600 underline hover:text-slate-900 transition-colors">
                  Walk through a live demo
                </Link>
                .
              </p>
            </section>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <p className="text-[11px] text-slate-500">
            Questions? contact@startingmonday.app
          </p>
        </div>
      </footer>

    </div>
  )
}
