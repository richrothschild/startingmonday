import type { Metadata } from 'next'
import Link from 'next/link'
import TrackedCtaLink from '@/components/TrackedCtaLink'

const FEEDBACK_EMAIL = 'rothschild@gmail.com'

function mailtoHref(subject: string, body: string) {
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export const metadata: Metadata = {
  title: 'Starting Monday | Mark Horstman Decision Brief',
  description:
    'Updated decision brief for Mark Horstman: behavior-first positioning, cadence model, trust proof, and concrete next decisions.',
  alternates: { canonical: 'https://startingmonday.app/mark-review' },
  openGraph: {
    title: 'Starting Monday | Mark Horstman Decision Brief',
    description:
      'Updated decision brief for Mark Horstman: behavior-first positioning, cadence model, trust proof, and concrete next decisions.',
    url: 'https://startingmonday.app/mark-review',
  },
}

const DECISION_QUESTIONS = [
  'Which behavior KPI should be public now: outreach, conversations, or follow-up completion?',
  'Do we commit to person-first execution as the primary narrative?',
  'If we ship one conversion fix this week, is it proof, pricing, or loop-closure clarity?',
]

const WHAT_CHANGED = [
  'Behavior-over-information framing is explicit.',
  'Cadence is visible: Monday review, daily triage, prep, Friday accountability.',
  'Headline proof now requires denominator and confidence context.',
  'Primary risk is still loop measurement from signal to conversation.',
]

const HORSTMAN_FILTER = [
  {
    lens: 'Behavior standard',
    check:
      'By week 1, a user should show changed behavior: who they contacted and what they closed.',
  },
  {
    lens: 'Anti-vagueness standard',
    check:
      'Every value claim should map to a measurable output with denominator and confidence.',
  },
  {
    lens: 'Cadence standard',
    check:
      'The operating rhythm should be obvious and repeatable week to week.',
  },
]

const CADENCE_STEPS = [
  'Monday: review priorities and follow-ups.',
  'Daily: triage signals into one next move.',
  'Pre-conversation: review prep brief and likely objections.',
  'Friday: review outreach, responses, and overdue follow-ups.',
]

const CORE_PHILOSOPHIES = [
  {
    title: 'Behavior management over information management',
    detail:
      'Coach weekly execution habits: who to contact, what to send, and what to close.',
  },
  {
    title: 'Quality and effective experience',
    detail:
      'Each key interaction should reduce ambiguity and support immediate action.',
  },
  {
    title: 'Outcome-based behaviors',
    detail:
      'Success is repeatable behavior that creates conversations, advocates, and momentum.',
  },
]

const KEY_OBJECTIONS = [
  {
    concern: '"This sounds like another dashboard."',
    response:
      'It is not passive monitoring. The model is signal -> decision -> outreach -> follow-up.',
  },
  {
    concern: '"Can I trust the AI output quality?"',
    response:
      'Quality is strongest with complete context, and claims include denominator and confidence.',
  },
  {
    concern: '"If this is behavior-first, where is the scoreboard?"',
    response:
      'Scoreboard focus is loop closure: signals, outreach, conversations, follow-ups.',
  },
]

const NEXT_7_DAYS = [
  'Publish one behavior KPI with denominator and confidence annotation.',
  'Tighten person-first copy in hero and support sections.',
  'Instrument loop-closure tracking for outreach and follow-up actions.',
]

const LANE_ONE_GOALS = [
  {
    title: 'Decision speed first',
    detail:
      'A first-time reviewer should understand the business case and model in under five minutes.',
  },
  {
    title: 'Momentum Signal alignment',
    detail:
      'Motion Signal and Momentum Signal language are treated as one concept: early movement that triggers immediate relationship action.',
  },
  {
    title: 'Proof discipline',
    detail:
      'Every quant claim includes denominator, timeframe, and confidence before headline use.',
  },
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

const PRE_MEETING_QA = [
  'Narrative coherence: landing, Mark brief, and summary use the same Momentum framing.',
  'Copy clarity: each section has one decision outcome.',
  'Proof hygiene: every number has source, denominator, and timeframe.',
  'Telemetry: key CTA actions on Mark pages are event-tracked for engagement review.',
  'Deploy hygiene: Railway SUCCESS plus manual live-page verification logged in epic tracker.',
]

const feedbackLink = mailtoHref(
  'Starting Monday: Mark decision brief feedback',
  'Most important behavior KPI to publish now:\n\nMost damaging trust gap:\n\nBest single fix for this week:\n\nNotes on cadence clarity or person-first framing:\n',
)

const callLink = mailtoHref(
  'Starting Monday: 15-minute review call',
  'Mark,\n\nIf you are open to it, I would value 15 minutes to pressure-test the site for C-suite conversion.\n\nPreferred windows:\n- Option 1:\n- Option 2:\n\nThanks,\nRichard\n',
)

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
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">Updated Decision Brief</p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-white leading-[1.12] tracking-tight mb-5">
            Starting Monday: Mark Horstman review brief
          </h1>
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-3xl">
            Core question: can this site convert motion signals into relationship momentum. This page is structured for fast decisions and proof clarity.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-18">
                <section className="mb-6 border border-slate-200 rounded-lg bg-slate-50 px-4 py-3">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-1">Quick navigation</h2>
          <p className="text-[12px] text-slate-600 leading-relaxed">Use the section headers on this page to scan fast and jump to what matters first.</p>
        </section>
        <details className="mb-6 border border-slate-200 rounded-lg bg-white px-4 py-3">
          <summary className="cursor-pointer text-[12px] font-semibold text-slate-800">TL;DR</summary>
          <p className="mt-2 text-[12px] text-slate-600 leading-relaxed">This page is organized for quick scanning. Start with the first major section, then use headings to move directly to the next action.</p>
        </details>
<div className="max-w-4xl mx-auto space-y-10">
          <section className="border border-slate-900 rounded-lg p-6 bg-slate-950">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-4">Lane 1 in five minutes</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LANE_ONE_GOALS.map((goal) => (
                <div key={goal.title} className="rounded border border-white/10 bg-white/5 p-4">
                  <p className="text-[12px] font-semibold text-white mb-2">{goal.title}</p>
                  <p className="text-[12px] text-slate-200 leading-relaxed">{goal.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">What this is now</p>
            <p className="text-[15px] text-slate-700 leading-relaxed">
              Starting Monday is an execution system for C-suite and near-C-suite technology leaders in transition, built to create consistent weekly behaviors and better-fit outcomes.
            </p>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Core philosophies</p>
            <div className="space-y-4">
              {CORE_PHILOSOPHIES.map((item) => (
                <div key={item.title} className="border-l-4 border-orange-300 pl-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-1">{item.title}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">What changed since prior brief</p>
            <ul className="space-y-2.5">
              {WHAT_CHANGED.map((item) => (
                <li key={item} className="text-[14px] text-slate-800 leading-relaxed flex items-start gap-2.5">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Horstman filter</p>
            <div className="space-y-4">
              {HORSTMAN_FILTER.map((item) => (
                <div key={item.lens} className="border-l-4 border-slate-300 pl-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-1">{item.lens}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item.check}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-900 rounded-lg p-6 bg-slate-950">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-4">Cadence visual</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CADENCE_STEPS.map((step) => (
                <div key={step} className="text-[13px] text-slate-100 leading-relaxed border border-white/10 bg-white/5 rounded p-3">
                  {step}
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Current objections and answers</p>
            <div className="space-y-4">
              {KEY_OBJECTIONS.map((item) => (
                <div key={item.concern} className="border-l-4 border-slate-300 pl-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-1">{item.concern}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item.response}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Loop-closure KPI block</p>
            <p className="text-[14px] text-slate-700 leading-relaxed mb-4">
              This is the operating scoreboard for Motion Signal to Momentum Signal execution. Lane 1 is complete only when these metrics are visible and governed.
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
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Next 7-day execution priorities</p>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-900 leading-relaxed">
              {NEXT_7_DAYS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="border border-orange-300 rounded-lg p-6 bg-orange-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-600 mb-4">Decision ask</p>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-900 leading-relaxed">
              {DECISION_QUESTIONS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <TrackedCtaLink
                href={feedbackLink}
                eventName="mark_review_cta_click"
                eventProps={{ placement: 'decision_ask', cta: 'send_feedback' }}
                className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-5 py-2.5 rounded transition-colors text-center"
              >
                Send direct feedback
              </TrackedCtaLink>
              <TrackedCtaLink
                href={callLink}
                eventName="mark_review_cta_click"
                eventProps={{ placement: 'decision_ask', cta: 'request_call' }}
                className="inline-block border border-slate-400 hover:border-slate-600 text-slate-800 text-[14px] px-5 py-2.5 rounded transition-colors text-center"
              >
                Request 15-minute call
              </TrackedCtaLink>
            </div>
          </section>

          <section className="border border-green-300 rounded-lg p-6 bg-green-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-green-700 mb-4">Pre-meeting QA and readiness</p>
            <ul className="space-y-2.5 mb-5">
              {PRE_MEETING_QA.map((item) => (
                <li key={item} className="text-[14px] text-slate-800 leading-relaxed flex items-start gap-2.5">
                  <span className="text-green-700 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded border border-green-300 bg-white p-4">
              <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-green-700 mb-2">Readiness status</p>
              <p className="text-[14px] text-slate-800 leading-relaxed">
                Ready with conditions. Lane 1 closes when the KPI block publishes with denominators and the post-deploy live verification is logged in the execution tracker.
              </p>
            </div>
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
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
