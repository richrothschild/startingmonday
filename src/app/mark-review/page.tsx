import type { Metadata } from 'next'
import Link from 'next/link'

const FEEDBACK_EMAIL = 'rothschild@gmail.com'

function mailtoHref(subject: string, body: string) {
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export const metadata: Metadata = {
  title: 'Starting Monday | C-Suite Conversion Review Brief',
  description:
    'One-page review brief for Mark Horstman: value proposition, C-suite objections, and specific decision asks.',
  alternates: { canonical: 'https://startingmonday.app/mark-review' },
  openGraph: {
    title: 'Starting Monday | C-Suite Conversion Review Brief',
    description:
      'One-page review brief for Mark Horstman: value proposition, C-suite objections, and specific decision asks.',
    url: 'https://startingmonday.app/mark-review',
  },
}

const DECISION_QUESTIONS = [
  'What are the top 3 reasons a serious C-suite buyer would hesitate or leave?',
  'Which trust gap is the most damaging right now: credibility, proof, privacy, positioning, pricing, or workflow burden?',
  'If we only fix one thing this week, what is it?',
]

const CORE_VALUE = [
  'Find role-shaping opportunity windows before postings become public.',
  'Turn raw market movement into decision-ready daily actions.',
  'Improve executive search behavior: fewer reactive moves, more consistent high-leverage actions.',
  'Strengthen relationship quality with better-timed, better-context outreach.',
  'Prepare outreach and interview narrative at executive depth, not job-board depth.',
  'Run a disciplined campaign with less noise and tighter follow-through to land the right-fit role.',
]

const KEY_OBJECTIONS = [
  {
    concern: '"This sounds like another dashboard."',
    response:
      'It is not built for passive monitoring. It is built for action: signal -> decision -> outreach -> follow-up.',
  },
  {
    concern: '"Can I trust the signal quality?"',
    response:
      'Signal is tied to timing and execution decisions, not vanity alerts. The standard is useful next step, not interesting data.',
  },
  {
    concern: '"I am employed. Is this private?"',
    response:
      'Privacy is a first-order requirement. No employer visibility. No recruiter visibility. User-controlled account and data deletion.',
  },
  {
    concern: '"Will this save time or add work?"',
    response:
      'The goal is reduced cognitive load: one place for target movement, prep context, and next actions.',
  },
  {
    concern: '"Is this built for people at my level?"',
    response:
      'The product is focused on C-suite and near-C-suite technology transitions, not broad apply-and-wait searches.',
  },
]

const feedbackLink = mailtoHref(
  'Starting Monday: C-suite conversion review',
  'Top 3 conversion blockers for C-suite buyers:\n1)\n2)\n3)\n\nMost damaging trust gap (pick one):\n\nOne fix to ship this week:\n\nAnything unclear or weak in the value proposition:\n',
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
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">One-Page Brief</p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-white leading-[1.12] tracking-tight mb-5">
            Starting Monday: C-suite conversion pressure test
          </h1>
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-3xl">
            This brief is direct by design: what the product is, where buyer trust can break, and the exact decisions needed to improve conversion.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-18">
        <div className="max-w-4xl mx-auto space-y-10">
          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">What this is</p>
            <p className="text-[15px] text-slate-700 leading-relaxed">
              Starting Monday is an execution platform for C-suite technology executives in search. It is designed to improve search behavior and relationship quality so serious buyers move earlier, prepare better, and land the right role for them, not just the first available role.
            </p>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Core value</p>
            <ul className="space-y-2.5">
              {CORE_VALUE.map((item) => (
                <li key={item} className="text-[14px] text-slate-800 leading-relaxed flex items-start gap-2.5">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">C-suite objections and current answers</p>
            <div className="space-y-4">
              {KEY_OBJECTIONS.map((item) => (
                <div key={item.concern} className="border-l-4 border-slate-300 pl-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-1">{item.concern}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item.response}</p>
                </div>
              ))}
            </div>
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
