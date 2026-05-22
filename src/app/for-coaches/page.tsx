import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { CoachPreviewActions } from './coach-preview-actions'
import { SampleOutputSection } from './sample-output-section'
import { BrandIcon } from '@/components/BrandIcon'

export const metadata: Metadata = {
  title: 'Coach Partner Preview | Starting Monday for Executive Coaches',
  description: 'A warm-intro page for executive coaches. See how Starting Monday gives clients a private signal and readiness layer between sessions so coaches can stay in strategy.',
  alternates: { canonical: 'https://startingmonday.app/for-coaches' },
  openGraph: {
    title: 'Coach Partner Preview | Starting Monday',
    description: 'Help clients identify signals earlier, stay accountable between sessions, and show up better prepared for high-stakes conversations.',
    url: 'https://startingmonday.app/for-coaches',
  },
}

const WHAT_CHANGES = [
  {
    before: 'You rebuild context at the start of every session because your client has not tracked anything.',
    after: 'You have pipeline view access. You arrive knowing exactly where they are and what moved since your last call.',
  },
  {
    before: 'Your client is preparing for interviews the night before with a web search and a printout.',
    after: 'The prep brief is usually ready in about a minute. Win thesis, likely objections, peer-level questions, what to leave out. You can read it before the session.',
  },
  {
    before: 'You cannot track 30 companies between sessions. Things happen and your client misses the window.',
    after: 'The intelligence scanner watches every company on their target list. When signals cluster into a pre-search pattern, you both know.',
  },
  {
    before: 'Session time is split between strategy and research catch-up.',
    after: 'Session time is strategy. The platform handles the research, the tracking, and the daily briefing.',
  },
]

const SAMPLE_SIGNAL_ITEMS = [
  'CFO departure disclosed in an 8-K after market close',
  'Two VP-level technology openings posted within 48 hours',
  'Private equity operating partner added to the board this week',
]

const FULL_SAMPLE_SIGNAL_BRIEF = {
  company: 'Meridian Systems',
  date: 'March 14, 2026',
  signals: [
    'CFO departure disclosed in an 8-K after market close',
    'Two VP-level technology openings posted within 48 hours',
    'Private equity operating partner added to the board this week',
  ],
  impact: 'Post-acquisition integration risk visible. Finance function reshaping.',
  recommendedAction: 'Before 10am: send reconnection note to former COO now at Vista Equity Partners. Update company status from Watchlist to Active Outreach.',
  waitlistAction: 'Monitor for new CFO search details; likely 60-90 day runway before external hires begin interviewing.',
}

const SAMPLE_PREP_BRIEF_POINTS = [
  'Win thesis: stabilize a post-acquisition technology stack without slowing revenue operations.',
  'Likely objection: concern that your turnaround depth outweighs product-led growth experience.',
  'Peer-level question: how is the board measuring integration success across the first two operating reviews?',
]

const FULL_SAMPLE_PREP_BRIEF = {
  company: 'Meridian Systems',
  role: 'EVP, Technology Integration',
  search: 'PE-backed post-acquisition integration lead',
  winThesis: 'Stabilize a post-acquisition technology stack without slowing revenue operations. The PE fund has 24 months to prove integration value before exit.',
  yourBackground: '12 years leading technology consolidation across 4 acquisitions. Last role: CTO at a $400M SaaS company during acquisition by Insight Partners. 18-month integration completed 3 months early.',
  likelyObjections: [
    'Your turnaround depth may outweigh their need for a product-led growth mindset',
    'Will you stay focused on process or get pulled into long-term product strategy?',
    'How do we know you can balance pace with risk?',
  ],
  peerLevelQuestions: [
    'How is the board measuring integration success across the first two operating reviews?',
    'What is the appetite for replacing vs. consolidating the inherited tech stack?',
    'How much travel is expected in the first 90 days?',
  ],
  whatToLeaveOut: 'Do not lead with the detail of your acquisition timeline. Lead with the outcome: 18-month integration completed 3 months early with zero revenue impact.',
  preparedTalking: '2-minute summary ready. The brief above is what the coach will review before your session.',
}

const PROOF_METRICS = [
  {
    value: '81%',
    label: 'of the Jan-May 2026 executive pilot cohort reached a first interview within 30 days',
  },
  {
    value: '9 days',
    label: 'median time from setup to first qualified outreach in the same cohort',
  },
  {
    value: '43%',
    label: 'of early adopting coaches brought the daily briefing into coaching sessions within the first month',
  },
  {
    value: '27',
    label: 'executives included in the current verified pilot evidence snapshot',
  },
]

const COACH_FIT = [
  {
    title: 'Career transition coaches',
    detail: 'Best fit when clients need speed, accountability, and earlier signal visibility in the first 30-90 days.',
  },
  {
    title: 'VP-to-CXO coaches',
    detail: 'Best fit when clients need long-cycle narrative discipline and shared context across months, not just weeks.',
  },
  {
    title: 'Search-affiliate coaches',
    detail: 'Best fit when interview prep quality and live pipeline visibility affect placement outcomes immediately.',
  },
  {
    title: 'Board and governance coaches',
    detail: 'Best fit when clients need relationship maintenance and signal monitoring over a longer positioning horizon.',
  },
]

const COACH_SCOREBOARD = [
  {
    label: 'Companies updated weekly',
    target: '3-5',
    note: 'If fewer are moving, the pipeline is drifting or too broad.',
  },
  {
    label: 'Signal actions taken',
    target: '5+',
    note: 'Notes sent, intro asks made, or follow-ups rescheduled from real signal movement.',
  },
  {
    label: 'Prep briefs reviewed',
    target: '1+',
    note: 'At least one real high-stakes conversation should be prepared at depth during the week.',
  },
  {
    label: '30-day checkpoint',
    target: 'First interview or a clearer block',
    note: 'By day 30, the coach should know whether the issue is signal response, outreach quality, or positioning.',
  },
]

const PREVIEW_SENTENCE = 'In 15 minutes, you see one coach seat, two to three client seats, and a simple way to easily stay on top of each client in one place.'

const COUNCIL_BUY_SIGNALS = [
  {
    title: 'Outcomes they will pay for',
    points: [
      'Clients arrive prepared for high-stakes meetings',
      'Less session time rebuilding context from memory',
      'Faster first interviews and cleaner weekly momentum',
      'Coach can spot stalls before the client loses confidence',
    ],
  },
  {
    title: 'Feelings to address directly',
    points: [
      '"I am spending too much time on prep and admin, not strategy"',
      '"My client is too busy, so important prep gets skipped"',
      '"I do not want to coach half-blind between sessions"',
      '"I need to feel in control of every client account"',
    ],
  },
  {
    title: 'What Starting Monday offers',
    points: [
      'Shared coach-client signal and pipeline visibility',
      'Prep briefs usually ready in about a minute',
      'Daily focus prompts so clients make one good move each morning',
      '30-day pass/fail scorecard before any rollout decision',
    ],
  },
]

const PILOT_SCORECARD = [
  {
    metric: 'Week 1 signal action',
    success: 'At least one signal-driven action logged for each pilot client.',
  },
  {
    metric: 'Week 1 prep quality',
    success: 'At least one prep brief reviewed before a real conversation.',
  },
  {
    metric: 'Session yield',
    success: 'Coach reports less context rebuild and more strategic depth in sessions.',
  },
  {
    metric: 'Day-30 decision',
    success: 'Clear pass/fail on workflow fit for your practice before paying.',
  },
]

const ROLE_BOUNDARY = {
  platform: [
    'Detects signal movement and keeps the pipeline current between sessions',
    'Generates prep briefs and tracks execution activity',
    'Surfaces weekly risk markers and overdue actions',
  ],
  coach: [
    'Owns strategic judgment, narrative calibration, and accountability coaching',
    'Decides where to focus client effort and when to change search strategy',
    'Interprets context and drives high-stakes decision quality',
  ],
}

const WEEKLY_REVIEW_TEMPLATE = [
  'What changed in signals since last week, and which two changes matter most?',
  'Which companies moved stage, and which are stalled?',
  'Which prep brief will shape this week\'s highest-stakes conversation?',
  'What one action must happen before next session to protect momentum?',
]

export default function ForCoachesPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <Link href="/partners" className="text-[13px] text-slate-400 hover:text-white transition-colors">
            Become a partner
          </Link>
        </div>
      </nav>

      <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
            Coach Partner Preview
          </p>
          <h1 className="text-[30px] sm:text-[38px] font-bold text-white leading-[1.15] tracking-tight mb-5">
            Easily stay on top of every client in one place.<br />
            Clients arrive prepared.<br />
            You stay in strategy.
          </h1>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg mb-2">
            Starting Monday is the between-session operating layer for coaches who want less admin drag and stronger strategic sessions. You and your clients share one place for signal monitoring, prep briefs, and pipeline accountability.
          </p>
          <p className="text-[13px] text-slate-300 leading-relaxed max-w-lg mb-3">
            Built for coaches working with senior executives in transition who are too busy to prep consistently without structure.
          </p>
          <p className="text-[13px] text-orange-300 leading-relaxed max-w-lg mb-6">
            The goal is simple: stop coaching half-blind, and stop spending paid time rebuilding context from memory.
          </p>
          <p className="text-[13px] text-slate-300 leading-relaxed max-w-lg mb-6">
            How would you feel if every client came into each meeting prepared, while you spent less time chasing prep and more time coaching strategy?
          </p>
          <div className="border border-slate-700 rounded-2xl p-4 bg-slate-950/40 mb-6">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-orange-400 mb-2">
              You might be thinking
            </p>
            <div className="space-y-2 text-[13px] text-slate-300 leading-relaxed">
              <p><span className="text-white font-semibold">"This sounds like one more tool that steals session time."</span> Fair concern. The design goal is the opposite: cut context rebuild and raise strategy time.</p>
              <p><span className="text-white font-semibold">&quot;My clients already have LinkedIn Premium.&quot;</span> Good. This is the operating layer underneath that, not a replacement for it.</p>
              <p><span className="text-white font-semibold">&quot;I already handle this in coaching.&quot;</span> Exactly. The point is to stop spending paid coaching time rebuilding context and chasing research.</p>
              <p><span className="text-white font-semibold">&quot;I do not want another tool to manage.&quot;</span> {PREVIEW_SENTENCE}</p>
            </div>
          </div>
          <CoachPreviewActions />
          <p className="text-[12px] text-slate-400 mt-3">
            Would it be unreasonable to test this with two clients for 30 days before making a rollout decision?
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto space-y-16">

          <section className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
            <h2 className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-600 mb-3">Quick navigation</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] mb-4">
              <a href="#why-coaches-buy" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Why coaches buy</a>
              <a href="#role-boundary" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Role boundary</a>
              <a href="#execution-rhythm" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Execution rhythm</a>
              <a href="#next-step" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Next step</a>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/partners#apply" className="inline-block bg-slate-900 text-white text-[12px] font-semibold px-4 py-2 rounded hover:bg-slate-700 transition-colors">
                Get started with a 30-day coach preview
              </Link>
              <Link href="/for-coaches/faq" className="inline-block border border-slate-300 text-slate-700 text-[12px] font-semibold px-4 py-2 rounded hover:border-slate-500 transition-colors">
                Read coach FAQ before preview
              </Link>
            </div>
          </section>

          <section id="why-coaches-buy" className="border border-slate-200 rounded-2xl p-6 sm:p-7 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Why coaches buy
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-4 leading-snug">
              Coaches buy outcomes first, emotional relief second, workflow proof third.
            </h2>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-6 max-w-xl">
              This is not a feature purchase. Coaches buy when they believe three things: clients will show up prepared, the coach will feel in control between sessions, and the process can be tested quickly without adding operational drag.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">1) Outcome they want</p>
                <ul className="space-y-1 text-[12px] text-slate-700 leading-relaxed">
                  <li>• Clients come to meetings prepared</li>
                  <li>• Less paid time rebuilding context</li>
                  <li>• Faster momentum toward interviews</li>
                </ul>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">2) Feeling they are buying</p>
                <ul className="space-y-1 text-[12px] text-slate-700 leading-relaxed">
                  <li>• "I am not coaching half-blind"</li>
                  <li>• "I can see stalls before confidence drops"</li>
                  <li>• "I am spending time on strategy, not admin"</li>
                </ul>
              </div>
              <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/40">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">3) Offer that lowers risk</p>
                <ul className="space-y-1 text-[12px] text-slate-700 leading-relaxed">
                  <li>• 30-day test with 2-3 live clients</li>
                  <li>• Pass/fail scorecard before rollout</li>
                  <li>• Keep if it improves coaching outcomes</li>
                </ul>
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-white mb-4">
              <p className="text-[12px] font-semibold text-slate-900 mb-2">What makes this credible</p>
              <p className="text-[13px] text-slate-700 leading-relaxed mb-2">
                Early pilot signal is directional but useful: 81% of the Jan-May 2026 executive cohort reached a first interview within 30 days, and coaches who adopted the daily briefing reported better between-session control.
              </p>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Denominator: 27 pilot executives. Use this as decision support, then validate fit with your own 30-day pass/fail test.
              </p>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              More details live in <Link href="/references" className="underline underline-offset-2 hover:text-slate-700 transition-colors">Evidence and References</Link> and <Link href="/for-coaches/faq#proof" className="text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2">our proof methodology</Link>.
            </p>
          </section>

          <section className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 sm:p-7">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-700 mb-3">
              From pressure to control
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-4 leading-snug">
              Start with a 30-day preview and evaluate real outcomes.
            </h2>
            <div className="space-y-3 text-[14px] text-slate-700 leading-relaxed mb-6">
              <p>{PREVIEW_SENTENCE}</p>
              <p>This is designed for one practical test: can you spend less time on prep/admin and more time on strategy while clients show up better prepared?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Free coach access during the preview window',
                '2-3 live client seats to test with real workflows',
                'One shared place for pipeline, signals, and prep',
                'Scorecards that reveal where momentum is stalling',
                'Audit log and client controls for trust and transparency',
                'Clear pass/fail decision at day 30',
              ].map((item) => (
                <div key={item} className="bg-white border border-emerald-100 rounded-lg px-4 py-3">
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 border border-emerald-300 bg-emerald-50 rounded-lg p-4">
              <p className="text-[12px] font-semibold text-slate-900 mb-2">What coaches see during preview:</p>
              <ul className="space-y-1 text-[12px] text-slate-700">
                <li>• Complete company pipeline with fit scores and stage tracking</li>
                <li>• Real-time signals with detection dates and relevance scores</li>
                <li>• Interview prep briefs showing your approach before each conversation</li>
                <li>• 30-day activity scorecards: pipeline health, signal velocity, interview outcomes</li>
                <li>• All activity is logged—clients can see exactly when coaches accessed their data</li>
              </ul>
            </div>
            <div className="mt-4 border border-emerald-300 bg-white rounded-lg p-4">
              <p className="text-[12px] font-semibold text-slate-900 mb-3">30-day pilot success scorecard</p>
              <div className="space-y-2">
                {PILOT_SCORECARD.map((row) => (
                  <div key={row.metric} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 text-[12px] text-slate-700">
                    <p className="font-semibold text-slate-900">{row.metric}</p>
                    <p>{row.success}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="role-boundary" className="border border-slate-200 rounded-2xl p-6 sm:p-7 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Role boundary
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-4 leading-snug">
              Starting Monday supports coaching. It does not replace it.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">Platform owns</p>
                <ul className="space-y-2 text-[13px] text-slate-700 leading-relaxed">
                  {ROLE_BOUNDARY.platform.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </div>
              <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/40">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">Coach owns</p>
                <ul className="space-y-2 text-[13px] text-slate-700 leading-relaxed">
                  {ROLE_BOUNDARY.coach.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-[12px] text-slate-500 mt-4">
              Need compliance-ready details? Read the <Link href="/for-coaches/trust-pack" className="underline underline-offset-2 hover:text-slate-700 transition-colors">Coach Trust Pack</Link>.
            </p>
          </section>

          <section className="border border-slate-200 rounded-2xl p-6 sm:p-7 bg-slate-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              30-second skim
            </p>
            <div className="space-y-3 text-[14px] text-slate-700 leading-relaxed mb-5">
              <p><span className="font-semibold text-slate-900">Who it is for:</span> executive coaches working with senior technology leaders in transition or positioning.</p>
              <p><span className="font-semibold text-slate-900">What changes:</span> less session time rebuilding context, more time on strategy, judgment, and accountability.</p>
              <p><span className="font-semibold text-slate-900">How to try it:</span> {PREVIEW_SENTENCE}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-[13px]">
              <Link href="#execution-rhythm" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
                See the operating rhythm
              </Link>
              <Link href="#next-step" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
                Jump to next step
              </Link>
            </div>
          </section>

          <section id="buy-signals">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-6">
              What coaches said they would buy for
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-5 leading-snug">
              Lead with outcomes. Name the pressure. Show the path.
            </h2>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-7 max-w-xl">
              Council feedback was consistent: the page should persuade on practical outcomes and emotional relief first, then prove the workflow. This section captures the highest-frequency buy criteria.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {COUNCIL_BUY_SIGNALS.map((column) => (
                <div key={column.title} className="border border-slate-200 rounded-xl p-5 bg-white">
                  <p className="text-[13px] font-semibold text-slate-900 mb-3">{column.title}</p>
                  <ul className="space-y-2 text-[13px] text-slate-600 leading-relaxed">
                    {column.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="text-orange-500 shrink-0 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section id="credibility-play">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-6">
              The coach credibility play
            </p>
            <div className="space-y-5 mb-8">
              {WHAT_CHANGES.map((item, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded p-4">
                    <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-2">Before</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{item.before}</p>
                  </div>
                  <div className="bg-white border border-orange-200 rounded p-4">
                    <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-orange-500 mb-2">After</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{item.after}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[14px] text-slate-600 leading-relaxed max-w-lg">
              When your clients move earlier, stay accountable, and show up better prepared, they credit you for the quality of the process. That is the compounding asset here: better client outcomes, better conversations, stronger reputation.
            </p>
          </section>

          <section id="sample-output">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Sample output
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-4 leading-snug">
              Show, don&rsquo;t tell.
            </h2>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-6 max-w-xl">
              Coaches do not need more feature language. They need to see the quality of the output and the kind of action it creates. This is the kind of artifact a coach preview should expose immediately.
            </p>
            <SampleOutputSection
              sampleSignalItems={SAMPLE_SIGNAL_ITEMS}
              samplePrepBriefPoints={SAMPLE_PREP_BRIEF_POINTS}
              fullSampleSignalBrief={FULL_SAMPLE_SIGNAL_BRIEF}
              fullSamplePrepBrief={FULL_SAMPLE_PREP_BRIEF}
            />
          </section>

          <section id="shared-intelligence">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-6">
              Shared intelligence with clients
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-4 leading-snug">
              Coach and client see the same data. No silos, no secrets.
            </h2>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-6 max-w-lg">
              Coaches and clients share the same pipeline view, signal detection, and prep briefs. This eliminates the translation layer. When a coach asks "Did you see the signal about the CFO?" the client already knows—because they saw it when it happened, and the coach saw them see it.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="border border-slate-200 rounded-2xl p-5 bg-white">
                <p className="text-[14px] font-semibold text-slate-900 mb-3">Coach perspective</p>
                <ul className="space-y-2 text-[13px] text-slate-600 leading-relaxed mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 shrink-0 mt-0.5">✓</span>
                    <span>See which signals clients acted on</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 shrink-0 mt-0.5">✓</span>
                    <span>Know exactly when prep briefs were reviewed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 shrink-0 mt-0.5">✓</span>
                    <span>Track accountability between sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 shrink-0 mt-0.5">✓</span>
                    <span>Reduce misalignment on what clients actually know</span>
                  </li>
                </ul>
                <Link href="/for-coaches/faq#sharing" className="text-[12px] text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2">
                  Learn more about sharing →
                </Link>
              </div>
              <div className="border border-orange-200 rounded-2xl p-5 bg-orange-50/40">
                <p className="text-[14px] font-semibold text-slate-900 mb-3">Client perspective</p>
                <ul className="space-y-2 text-[13px] text-slate-600 leading-relaxed mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 shrink-0 mt-0.5">✓</span>
                    <span>Full control over coach data access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 shrink-0 mt-0.5">✓</span>
                    <span>Audit log shows when coaches viewed what</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 shrink-0 mt-0.5">✓</span>
                    <span>Grant or revoke access anytime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 shrink-0 mt-0.5">✓</span>
                    <span>See exactly what each coach can access</span>
                  </li>
                </ul>
                <Link href="/for-coaches/faq#client-control" className="text-[12px] text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2">
                  Learn more about client controls →
                </Link>
              </div>
            </div>
          </section>

          <section id="coach-fit">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-6">
              Where this fits best
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-8 max-w-lg">
              Different coaches use the same platform in different contexts. If you only scan one section before deciding whether this is worth a preview, scan this one.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COACH_FIT.map((item) => (
                <div key={item.title} className="border border-slate-200 rounded-lg p-5 bg-white">
                  <p className="text-[13px] font-bold text-slate-900 mb-2">{item.title}</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="execution-rhythm">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Execution rhythm
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-8 max-w-xl leading-snug">
              Three touchpoints. About 12 minutes of disciplined motion.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
              <div className="border-t-2 border-orange-500 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Monday morning</p>
                <p className="text-[15px] font-semibold text-slate-900 mb-2">Review the pipeline together. 5 minutes.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Update 3 to 5 company stages. Drop what has gone cold. Choose one priority contact and one priority company for the week.</p>
              </div>
              <div className="border-t-2 border-slate-200 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Every morning</p>
                <p className="text-[15px] font-semibold text-slate-900 mb-2">Act on overnight signals. 2 minutes.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">One decision: which company to contact first. One action: send the note, make the intro ask, or move the follow-up date. The briefing surfaces it.</p>
              </div>
              <div className="border-t-2 border-slate-200 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Before each interview</p>
                <p className="text-[15px] font-semibold text-slate-900 mb-2">Run the prep brief. 5 minutes.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Usually about a minute to generate, a few minutes to review. Win thesis, likely objections, peer-level questions, and what to leave out before the session starts.</p>
              </div>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mt-6 max-w-xl">
              This is the accountability loop: if the client is not producing interviews or stronger conversations, the coach can see whether the issue is signal response, outreach follow-through, or prep depth instead of guessing from memory.
            </p>
            <div className="mt-8 border border-slate-200 rounded-2xl p-6 bg-slate-50">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
                Coach scoreboard
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COACH_SCOREBOARD.map((item) => (
                  <div key={item.label} className="border border-slate-200 rounded-xl p-4 bg-white">
                    <p className="text-[12px] text-slate-500 mb-1">{item.label}</p>
                    <p className="text-[16px] font-semibold text-slate-900 mb-2">{item.target}</p>
                    <p className="text-[12px] text-slate-600 leading-relaxed">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 border border-slate-200 rounded-2xl p-6 bg-white">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">
                Weekly review template
              </p>
              <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
                Use this exact agenda in your Monday review so the operating cadence stays consistent across clients.
              </p>
              <ol className="space-y-2 text-[13px] text-slate-700 leading-relaxed list-decimal pl-5">
                {WEEKLY_REVIEW_TEMPLATE.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
          </section>

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              What changes for your clients
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[13px] font-semibold text-slate-900 mb-1.5">They stop missing signals</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Signals are surfaced while they sleep. Executive departures, board changes, funding, and career page postings are tracked automatically. They act before the market moves.</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[13px] font-semibold text-slate-900 mb-1.5">They walk in prepared</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Win thesis, likely objections, peer-level questions, what to leave out. Usually ready in about a minute. Accurate to the specific company and role. You see the brief before the session.</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[13px] font-semibold text-slate-900 mb-1.5">Nothing goes cold</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Every company, contact, and conversation tracked. You can view their pipeline between sessions. Dormancy is a thing of the past.</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[13px] font-semibold text-slate-900 mb-1.5">One decision each morning</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Overnight signals and a prioritized action list in their inbox before the market opens. Instead of thirty decisions, they make one. You help them focus on what matters most.</p>
              </div>
            </div>
            <div className="flex gap-3 text-[12px]">
              <Link href="/for-coaches/faq#client-benefits" className="text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2">
                Learn more about client benefits →
              </Link>
            </div>
          </section>

          <section id="next-step" className="border-t border-slate-100 pt-10">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              What this is not
            </p>
            <div className="space-y-4 text-[14px] text-slate-600 leading-relaxed max-w-xl">
              <p>It is not a replacement for coaching. It does not replace judgment, accountability, or the human work of helping a senior leader manage uncertainty and narrative.</p>
              <p>It is not generic job-search automation. It is a signal, preparation, and execution layer built for senior technology leaders running confidential, relationship-driven searches.</p>
              <p>It is not dramatic market prophecy. The value is disciplined early-signal tracking, shared context between sessions, and better preparation before high-stakes conversations.</p>
            </div>
          </section>

          <section className="border-t border-slate-100 pt-10">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              The coaching practice that compounds
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
              This is not about giving your clients a tool. It is about running a more consistent coaching process when a client is in active transition. The practical gain is simpler: less session time rebuilding context, better weekly visibility, and cleaner preparation before high-stakes conversations.
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-2">
              If the preview works, the coach should expect three things in the first 30 days: clearer pipeline visibility, faster identification of where a client is stalling, and better prep quality before important calls.
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed">
              Built for coaches who want a disciplined between-session layer without changing the core coaching relationship.
            </p>
          </section>

          <section className="border-t border-slate-100 pt-10">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Next step
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-4 leading-snug">
              Start with the preview. Review pricing and FAQ only if the workflow fits.
            </h2>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-6 max-w-xl">
              You only need to send this page. {PREVIEW_SENTENCE} If a coach wants the details, the FAQ and economics pages are here without crowding the first conversation.
            </p>
            <CoachPreviewActions />
            <div className="flex flex-wrap gap-4 mt-6 text-[13px]">
              <Link href="/for-coaches/faq" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
                <BrandIcon name="faq" className="h-4 w-4 text-orange-600" />
                Read the coach FAQ
              </Link>
              <Link href="/for-coaches/faq#security" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
                <BrandIcon name="security" className="h-4 w-4 text-orange-600" />
                Data security guide
              </Link>
              <Link href="/for-coaches/trust-pack" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
                <BrandIcon name="trust" className="h-4 w-4 text-orange-600" />
                Coach trust pack
              </Link>
              <Link href="/for-coaches/economics" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
                <BrandIcon name="pricing" className="h-4 w-4 text-orange-600" />
                Pricing & economics
              </Link>
            </div>
            <div className="mt-6 border border-slate-200 rounded-2xl p-5 bg-slate-50">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">
                The partner motion
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-[13px] text-slate-600 leading-relaxed">
                <p><span className="font-semibold text-slate-900">1.</span> Warm intro to this page.</p>
                <p><span className="font-semibold text-slate-900">2.</span> Coach preview with two to three live client seats.</p>
                <p><span className="font-semibold text-slate-900">3.</span> Decide whether to roll into standard client referrals.</p>
                <p><span className="font-semibold text-slate-900">4.</span> Capture feedback, refine, and expand only if it improves coaching outcomes.</p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <section className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">More resources</p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-5 leading-snug">Questions? We&rsquo;ve got answers.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/for-coaches/faq" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                <Image src="/brand/icon-exploration-v1/faq.svg" alt="FAQ icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">Coaching FAQs</p>
                  <p className="text-[12px] text-slate-500">Objections & responses</p>
                </div>
              </Link>
              <Link href="/for-coaches/faq#security" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                <Image src="/brand/icon-exploration-v1/security.svg" alt="Security icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">Data Security</p>
                  <p className="text-[12px] text-slate-500">Privacy & compliance</p>
                </div>
              </Link>
              <Link href="/for-coaches/trust-pack" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                <Image src="/brand/icon-exploration-v1/security.svg" alt="Trust pack icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">Coach Trust Pack</p>
                  <p className="text-[12px] text-slate-500">No recruiter-side sharing + controls</p>
                </div>
              </Link>
              <Link href="/for-coaches/economics" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                <Image src="/brand/icon-exploration-v1/pricing.svg" alt="Pricing icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">Pricing</p>
                  <p className="text-[12px] text-slate-500">Investment & ROI</p>
                </div>
              </Link>
              <a href="mailto:contact@startingmonday.app?subject=Coach%20Feedback" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                <Image src="/brand/icon-exploration-v1/feedback.svg" alt="Feedback icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">Feedback</p>
                  <p className="text-[12px] text-slate-500">Share your thoughts</p>
                </div>
              </a>
              <Link href="/references" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                <Image src="/brand/icon-exploration-v1/evidence.svg" alt="Evidence icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">Evidence</p>
                  <p className="text-[12px] text-slate-500">Research & references</p>
                </div>
              </Link>
              <Link href="/partners" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                <Image src="/brand/icon-exploration-v1/partner.svg" alt="Partner program icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">Partner Program</p>
                  <p className="text-[12px] text-slate-500">Affiliate & referral</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <p className="text-[11px] text-slate-500">
            Questions?{' '}
            <a href="mailto:contact@startingmonday.app" className="hover:text-slate-300 transition-colors">
              contact@startingmonday.app
            </a>{' '}
            •{' '}
            <a href="mailto:contact@startingmonday.app?subject=Coach%20Feedback" className="hover:text-slate-300 transition-colors">
              Send feedback
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
