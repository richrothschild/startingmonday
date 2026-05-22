import type { Metadata } from 'next'
import Link from 'next/link'

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
  'What is the single most important behavior metric to publish on the site now: outreach sent per week, conversations started, or follow-up completion?',
  'Do we agree to treat person-first execution (not company-first browsing) as the primary product narrative on the page?',
  'If we ship only one conversion fix this week, should it be proof clarity, pricing clarity, or loop-closure visibility?',
]

const WHAT_CHANGED = [
  'Behavior-over-information framing is now explicit: the product must change weekly actions, not just improve awareness.',
  'Cadence model is visible: Monday review, daily triage, pre-conversation prep, and Friday accountability check.',
  'Trust proof language now requires denominator and confidence context for headline claims.',
  'Primary risk is named directly: signal to action to conversation loop is not yet measured end to end.',
  'Positioning now emphasizes person-first outcomes and relationship momentum, not company list management.',
]

const HORSTMAN_FILTER = [
  {
    lens: 'Behavior standard',
    check:
      'A user should be able to point to changed behavior in week 1 (who they contacted, what they followed up on, and what decision was made).',
  },
  {
    lens: 'Anti-vagueness standard',
    check:
      'Every value claim should translate to a measurable output, with denominator and confidence level visible.',
  },
  {
    lens: 'Cadence standard',
    check:
      'The operating rhythm should be obvious and repeatable so users can run a weekly system without extra overhead.',
  },
  {
    lens: 'Relationship standard',
    check:
      'The product should reinforce that executive outcomes are won through people and advocacy, not company tracking alone.',
  },
]

const CADENCE_STEPS = [
  'Monday: executive search cadence review (priorities, risks, and who needs follow-up).',
  'Daily: signal triage into one clear next move per priority target.',
  'Pre-conversation: prep brief review for likely objections and context-specific positioning.',
  'Friday: accountability review of outreach sent, responses received, and overdue follow-ups.',
]

const CORE_PHILOSOPHIES = [
  {
    title: 'Behavior management over information management',
    detail:
      'The product should coach weekly execution habits: decide who to contact, send the outreach, and close the follow-up loop. Information is only useful when it changes behavior.',
  },
  {
    title: 'Quality and effective experience',
    detail:
      'Every key interaction should reduce ambiguity and increase confidence. Guidance must be clear, evidence-aware, and specific enough to support immediate action by an executive user.',
  },
  {
    title: 'Outcome-based behaviors',
    detail:
      'Success is defined by outcomes created through repeatable behaviors: conversations started, advocates activated, and momentum sustained week over week.',
  },
]

const KEY_OBJECTIONS = [
  {
    concern: '"This sounds like another dashboard."',
    response:
      'It is not designed for passive monitoring. The model is explicit: signal -> decision -> outreach -> follow-up.',
  },
  {
    concern: '"Can I trust the AI output quality?"',
    response:
      'Output quality is strongest when company context is well populated, and every claim should carry denominator and confidence context.',
  },
  {
    concern: '"If this is behavior-first, where is the scoreboard?"',
    response:
      'The scoreboard to prioritize next is loop closure: signals received, outreach sent, conversations started, and follow-ups completed.',
  },
  {
    concern: '"Is this built for company tracking or relationship execution?"',
    response:
      'Company signals are input. Relationship execution is output. The page now centers the people-first outcome.',
  },
  {
    concern: '"I am employed. Is this private and low-risk to use?"',
    response:
      'Privacy remains first-order: no employer visibility, no recruiter visibility, and user-controlled deletion.',
  },
]

const NEXT_7_DAYS = [
  'Publish one behavior KPI on-site with denominator and confidence annotation.',
  'Add person-first copy directly in hero/supporting sections to remove company-first ambiguity.',
  'Instrument loop-closure tracking for outreach and follow-up actions.',
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
            <Link
              href="/signup"
              className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Try free
            </Link>
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
            This page reflects the latest brief updates: behavior-first positioning, cadence clarity, trust-proof standards, and explicit conversion decisions.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-18">
        <div className="max-w-4xl mx-auto space-y-10">
          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">What this is now</p>
            <p className="text-[15px] text-slate-700 leading-relaxed">
              Starting Monday is an execution system for C-suite and near-C-suite technology leaders in transition. It is built to create consistent, measurable weekly behaviors that produce better conversations and better-fit outcomes.
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
              <a
                href={feedbackLink}
                className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-5 py-2.5 rounded transition-colors text-center"
              >
                Send direct feedback
              </a>
              <a
                href={callLink}
                className="inline-block border border-slate-400 hover:border-slate-600 text-slate-800 text-[14px] px-5 py-2.5 rounded transition-colors text-center"
              >
                Request 15-minute call
              </a>
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Review links</p>
            <div className="space-y-3 text-[14px]">
              <Link href="/" className="block text-slate-800 hover:text-slate-900 underline underline-offset-2">
                Main site: https://startingmonday.app
              </Link>
              <Link href="/demo" className="block text-slate-800 hover:text-slate-900 underline underline-offset-2">
                Demo: https://startingmonday.app/demo
              </Link>
              <Link href="/demo/cio/notes" className="block text-slate-800 hover:text-slate-900 underline underline-offset-2">
                Notes mode (proof + cadence framing): https://startingmonday.app/demo/cio/notes
              </Link>
              <Link href="/pricing" className="block text-slate-800 hover:text-slate-900 underline underline-offset-2">
                Pricing: https://startingmonday.app/pricing
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
