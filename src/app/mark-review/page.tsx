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
    body: 'Track organizational moves at 2,000+ target companies so you often spot opportunities 1–3 weeks before broad-market posting channels.',
  },
  {
    title: 'AI Prep Brief',
    body: 'Usually generated in about a minute per role: likely objections, talking points, and high-value questions for outreach.',
  },
  {
    title: 'Daily Briefing Loop',
    body: 'Each morning, get signal changes at your targets so your pipeline compounds instead of stalling.',
  },
  {
    title: 'Pipeline Command Center',
    body: 'Central dashboard for target companies, contacts, and outreach status so activity stays focused and measurable.',
  },
]

export default function MarkReviewPage() {
  const structuredFeedbackLink = mailtoHref(
    'Starting Monday review feedback',
    'Objections by journey stage:\n- Hero:\n- Positioning/category:\n- Demo trust:\n- Pricing confidence:\n- Signup friction:\n- First-week usage:\n\nForce-rank:\nTop 3 fixes:\n1)\n2)\n3)\n\nTop 1 stop-doing:\n\nTop 1 thing to double down on:\n\nWhat would make you personally recommend this to one executive right now?\n',
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
            BLUF: Find executive job opportunities before LinkedIn posts them—and move faster than your firm's own recruiters.
          </h1>
          <p className="text-[15px] text-slate-300 leading-relaxed max-w-2xl mb-6">
            Starting Monday gives VPs and C-suite candidates a signal advantage: intelligence ahead of broad posting channels, prep briefs generated in about a minute, and a daily feed of moves at your target companies.
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
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-6">Mark's Full Audit</p>
            <div className="border border-slate-300 rounded-lg bg-blue-50 p-6 mb-6">
              <p className="text-[13px] text-slate-700 leading-relaxed mb-4">
                Mark has completed a comprehensive review of the entire Starting Monday site across all 9 major sections. He graded each section, identified dislikes, and provided specific tier-1, tier-2, and tier-3 recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/docs/mark-horstman-site-audit.md"
                  download
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-5 py-2.5 rounded transition-colors text-center"
                >
                  Download Full Audit (Markdown)
                </a>
                <Link
                  href="/mark-review/summary"
                  className="inline-block border border-slate-400 hover:border-slate-600 text-slate-800 text-[14px] px-5 py-2.5 rounded transition-colors text-center"
                >
                  View Summary & Top Fixes
                </Link>
              </div>
            </div>

            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">What this is</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded p-4 bg-white">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">Is</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  The intelligence layer that finds executive moves before LinkedIn does, and gives you prep briefs in about a minute.
                </p>
              </div>
              <div className="border border-slate-200 rounded p-4 bg-slate-50">
                <p className="text-[12px] font-semibold text-slate-900 mb-2">Is not</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  A resume generator, interview coach, passive job board, or generic AI assistant.
                </p>
              </div>
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
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">What happens in week 1</p>
            <div className="space-y-3 mb-6">
              <p className="text-[13px] text-slate-700 leading-relaxed"><span className="font-semibold">Day 1:</span> Pipeline intelligence appears quickly after signup. First AI prep brief is usually ready in about a minute.</p>
              <p className="text-[13px] text-slate-700 leading-relaxed"><span className="font-semibold">Days 2–7:</span> Daily briefing arrives each morning with new moves, signal changes, and one-click talking points for outreach.</p>
              <p className="text-[13px] text-slate-700 leading-relaxed"><span className="font-semibold">By day 7:</span> Most users have a clearer short list of opportunities and outreach priorities.</p>
            </div>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Fast review path (12 minutes)</p>
            <ol className="list-decimal pl-5 space-y-2 text-[13px] text-slate-700 leading-relaxed mb-6">
              <li>Read landing page positioning and hero flow.</li>
              <li>Run the live demo and inspect prep-brief quality (2–3 minutes).</li>
              <li>Review pricing page for conversion clarity and trust.</li>
            </ol>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-6 py-3 rounded transition-colors text-center">
                Open landing page
              </Link>
              <Link href="/demo" className="inline-block border border-slate-300 hover:border-slate-500 text-slate-800 text-[14px] px-6 py-3 rounded transition-colors text-center">
                Run live demo
              </Link>
              <Link href="/pricing" className="inline-block border border-slate-300 hover:border-slate-500 text-slate-800 text-[14px] px-6 py-3 rounded transition-colors text-center">
                Review pricing
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-slate-900 px-4 sm:px-6 py-10 border-t border-slate-800">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Send feedback</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={structuredFeedbackLink}
                className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-5 py-2.5 rounded transition-colors text-center"
              >
                Send structured feedback
              </a>
              <a
                href={callRequestLink}
                className="inline-block border border-slate-500 hover:border-slate-300 text-slate-200 text-[14px] px-5 py-2.5 rounded transition-colors text-center"
              >
                Request 20-minute call
              </a>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6">
            <p className="text-[12px] text-slate-400 mb-2">Need the feedback template?</p>
            <a
              href="/mark-feedback-template.md"
              download
              className="text-[13px] text-orange-400 underline hover:text-orange-300 transition-colors"
            >
              Download one-page template (Markdown)
            </a>
          </div>
          <div className="border-t border-slate-800 pt-6">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-3">Feedback requested by journey stage</p>
            <ul className="space-y-2 text-[12px] text-slate-400">
              <li>- Hero positioning and urgency</li>
              <li>- Category clarity (what problem are we solving?)</li>
              <li>- Demo proof and trust signals</li>
              <li>- Pricing confidence and anchoring</li>
              <li>- Signup flow friction</li>
              <li>- First-week value delivery</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
