import type { Metadata } from 'next'
import Link from 'next/link'

const FEEDBACK_EMAIL = 'rothschild@gmail.com'

function mailtoHref(subject: string, body: string) {
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export const metadata: Metadata = {
  title: 'Starting Monday | Mark Review Brief',
  description:
    'BLUF review page for Mark Horstman: what Starting Monday does, why it matters, and the exact feedback requested.',
  alternates: { canonical: 'https://startingmonday.app/mark-review' },
  openGraph: {
    title: 'Starting Monday | Mark Review Brief',
    description:
      'A concise review brief with BLUF, product walk-through, and feedback prompts.',
    url: 'https://startingmonday.app/mark-review',
  },
}

const FEATURE_BLOCKS = [
  {
    title: 'Signal Intelligence',
    body: 'Tracks organizational movement before roles are publicly posted so executives can act earlier with better timing.',
  },
  {
    title: 'Pipeline Command Center',
    body: 'Central system for target companies, contacts, and outreach status so activity stays focused and accountable.',
  },
  {
    title: 'AI Prep Brief',
    body: 'Company and role-specific prep package in under a minute: likely objections, talking points, and high-value questions.',
  },
  {
    title: 'Daily Briefing Loop',
    body: 'Each morning, users get signal changes and next actions so progress compounds instead of restarting each week.',
  },
]

const FEEDBACK_QUESTIONS = [
  'Would this position Starting Monday as a must-have operating system for serious executive search, or still optional?',
  'What is unclear, weak, or unfocused in the current landing-page story?',
  'Where does onboarding create drag before first value?',
  'What would make this compelling enough for a paying executive in the first week?',
  'What is the one thing we should stop doing immediately to improve conversion quality?',
]

const REACTION_SECTIONS = [
  'BLUF and Positioning',
  'Core Features and Outcomes',
  '12-Minute Review Path',
]

const REACTIONS = ['Clear', 'Unclear', 'Strong', 'Weak', 'Prioritize fix']

export default function MarkReviewPage() {
  const structuredFeedbackLink = mailtoHref(
    'Starting Monday review feedback',
    'Top 3 fixes:\n1)\n2)\n3)\n\nTop 1 stop doing:\n\nBiggest risk this month:\n\nOne fast win this week:\n',
  )

  const callRequestLink = mailtoHref(
    '20-minute review call request',
    'Mark,\n\nIf you are open to it, I would value 20 minutes for direct critique on the attached review page.\n\nPreferred windows:\n- Option 1:\n- Option 2:\n\nThanks,\nRich\n',
  )

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/demo" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Demo
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
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">Mark Review Brief</p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-white leading-[1.15] tracking-tight mb-5">
            BLUF: Starting Monday helps senior executives get ahead of searches before roles are publicly posted.
          </h1>
          <p className="text-[15px] text-slate-300 leading-relaxed max-w-2xl mb-6">
            Our immediate objective is simple: win first paid users and prove repeatable conversion while delivering an excellent first-week user experience.
          </p>
          <div className="bg-slate-800 border border-slate-700 rounded p-4">
            <p className="text-[12px] font-bold text-orange-500 uppercase tracking-[0.1em] mb-2">What we need from you</p>
            <p className="text-[14px] text-slate-200 leading-relaxed">
              Direct, candid feedback on positioning clarity, conversion friction, and execution focus.
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto space-y-14">
          <section className="border border-orange-200 bg-orange-50 rounded-lg p-5">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-600 mb-3">Fast feedback options</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <a
                href={structuredFeedbackLink}
                className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-5 py-2.5 rounded transition-colors text-center"
              >
                Send structured feedback email
              </a>
              <a
                href={callRequestLink}
                className="inline-block border border-slate-300 hover:border-slate-500 text-slate-800 text-[14px] px-5 py-2.5 rounded transition-colors text-center"
              >
                Request 20-minute review call
              </a>
            </div>
            <a
              href="/mark-feedback-template.md"
              download
              className="text-[13px] text-slate-700 underline hover:text-slate-900 transition-colors"
            >
              Download one-page feedback template
            </a>
          </section>

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">What this is</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded p-4 bg-white">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">Is</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  Executive opportunity intelligence and execution infrastructure for VP-to-C-suite searches.
                </p>
              </div>
              <div className="border border-slate-200 rounded p-4 bg-slate-50">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">Is not</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  A generic AI job search assistant, resume generator, or passive content product.
                </p>
              </div>
            </div>
          </section>

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Quick section reactions</p>
            <div className="space-y-4">
              {REACTION_SECTIONS.map(section => (
                <div key={section} className="border border-slate-200 rounded p-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-3">{section}</p>
                  <div className="flex flex-wrap gap-2">
                    {REACTIONS.map(reaction => (
                      <a
                        key={`${section}-${reaction}`}
                        href={mailtoHref(
                          `Quick reaction: ${section} - ${reaction}`,
                          `Section: ${section}\nReaction: ${reaction}\nReason (optional):\n`,
                        )}
                        className="text-[12px] border border-slate-300 rounded px-3 py-1.5 hover:border-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        {reaction}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Core features tied to job outcomes</p>
            <div className="space-y-4">
              {FEATURE_BLOCKS.map(block => (
                <div key={block.title} className="border-t border-slate-100 pt-4">
                  <p className="text-[14px] font-semibold text-slate-900 mb-1.5">{block.title}</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{block.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Fast review path (12 minutes)</p>
            <ol className="list-decimal pl-5 space-y-2 text-[13px] text-slate-700 leading-relaxed">
              <li>Read landing page positioning and hero flow.</li>
              <li>Run the live demo and inspect prep-brief quality.</li>
              <li>Review pricing page for conversion clarity and trust.</li>
            </ol>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link href="/" className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-6 py-3 rounded transition-colors text-center">
                Open landing page
              </Link>
              <Link href="/demo" className="inline-block border border-slate-200 hover:border-slate-400 text-slate-700 text-[14px] px-6 py-3 rounded transition-colors text-center">
                Run live demo
              </Link>
              <Link href="/pricing" className="inline-block border border-slate-200 hover:border-slate-400 text-slate-700 text-[14px] px-6 py-3 rounded transition-colors text-center">
                Review pricing
              </Link>
            </div>
          </section>

          <section className="border-t border-slate-100 pt-10">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Feedback we want, unfiltered</p>
            <ul className="space-y-2">
              {FEEDBACK_QUESTIONS.map(question => (
                <li key={question} className="text-[13px] text-slate-700 leading-relaxed">- {question}</li>
              ))}
            </ul>
            <p className="text-[13px] text-slate-600 mt-6">
              Preferred response format: top 3 fixes, top 1 stop-doing decision, and what to prioritize this month.
            </p>

            <div className="mt-6 border border-slate-200 rounded p-5 bg-slate-50">
              <p className="text-[12px] font-semibold text-slate-900 mb-3">60-second feedback form</p>
              <form action={`mailto:${FEEDBACK_EMAIL}`} method="post" encType="text/plain" className="space-y-3">
                <div>
                  <label htmlFor="clarity" className="block text-[12px] text-slate-700 mb-1">Clarity score (1-10)</label>
                  <input id="clarity" name="Clarity score" type="number" min={1} max={10} className="w-full sm:w-40 border border-slate-300 rounded px-3 py-2 text-[13px]" />
                </div>
                <div>
                  <label htmlFor="conversion" className="block text-[12px] text-slate-700 mb-1">Conversion confidence (1-10)</label>
                  <input id="conversion" name="Conversion confidence" type="number" min={1} max={10} className="w-full sm:w-40 border border-slate-300 rounded px-3 py-2 text-[13px]" />
                </div>
                <div>
                  <label htmlFor="biggest-flaw" className="block text-[12px] text-slate-700 mb-1">Biggest flaw</label>
                  <input id="biggest-flaw" name="Biggest flaw" type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-[13px]" />
                </div>
                <div>
                  <label htmlFor="first-change" className="block text-[12px] text-slate-700 mb-1">First change to make</label>
                  <input id="first-change" name="First change" type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-[13px]" />
                </div>
                <button
                  type="submit"
                  className="inline-block bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors"
                >
                  Send form by email
                </button>
              </form>
            </div>

            <p className="text-[13px] text-slate-600 mt-2">
              Send feedback to{' '}
              <a href={`mailto:${FEEDBACK_EMAIL}`} className="underline hover:text-slate-900 transition-colors">
                {FEEDBACK_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
