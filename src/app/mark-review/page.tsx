import type { Metadata } from 'next'
import Link from 'next/link'

const FEEDBACK_EMAIL = 'rothschild@gmail.com'

function mailtoHref(subject: string, body: string) {
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export const metadata: Metadata = {
  title: 'Starting Monday | Direct Review Brief',
  description:
    'Direct review brief for Mark Horstman: what Starting Monday is building, current stage, and the exact feedback request.',
  alternates: { canonical: 'https://startingmonday.app/mark-review' },
  openGraph: {
    title: 'Starting Monday | Direct Review Brief',
    description:
      'What Starting Monday is building, where it stands today, and the direct feedback request.',
    url: 'https://startingmonday.app/mark-review',
  },
}

export default function MarkReviewPage() {
  const structuredFeedbackLink = mailtoHref(
    'Starting Monday direct feedback',
    'Top 3 flaws (no softening):\n1)\n2)\n3)\n\nTop 1 fix first:\n\nWould you recommend this to one executive right now? (yes/no + why):\n\nWhat would make this an automatic yes for you?\n',
  )

  const callRequestLink = mailtoHref(
    '15-minute direct review call',
    'Mark,\n\nIf you are open to it, I would value 15 minutes for direct critique.\n\nPreferred windows:\n- Option 1:\n- Option 2:\n\nThanks,\nRich\n',
  )

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/mark-demo" className="text-[13px] text-slate-400 hover:text-white transition-colors">
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
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">Direct Review Brief</p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-white leading-[1.15] tracking-tight mb-5">
            Starting Monday: first-principles review request
          </h1>
          <p className="text-[15px] text-slate-300 leading-relaxed max-w-2xl">
            This is a first contact brief. No internal grading deck. No context required. Just what we are building, where it stands, and what feedback I need.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">What Starting Monday is trying to do</p>
            <p className="text-[15px] text-slate-700 leading-relaxed">
              Help VP and C-suite technology leaders run a disciplined search before the market gets crowded. The product combines early company signal monitoring, prep briefs for high-stakes conversations, and a pipeline system so outreach and follow-through stay tight.
            </p>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">Where we are in the build</p>
            <p className="text-[15px] text-slate-700 leading-relaxed">
              Live product. Live users. Core workflow is in place. Current focus is sharpening positioning, trust, and conversion quality so the story is as strong as the underlying product.
            </p>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Start Here</p>
            <div className="space-y-3">
              <Link href="/" className="block border border-slate-300 rounded p-4 hover:bg-slate-50 transition-colors">
                <p className="text-[14px] font-semibold text-slate-900">Public landing page</p>
                <p className="text-[13px] text-slate-600">https://startingmonday.app</p>
              </Link>
              <Link href="/mark-demo" className="block border border-slate-300 rounded p-4 hover:bg-slate-50 transition-colors">
                <p className="text-[14px] font-semibold text-slate-900">Live demo (no email required)</p>
                <p className="text-[13px] text-slate-600">https://startingmonday.app/mark-demo</p>
              </Link>
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Why different from alternatives</p>
            <div className="space-y-4">
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[13px] font-semibold text-slate-900 mb-2">vs. LinkedIn</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">LinkedIn is a job board. You wait for postings and compete with thousands. We find opportunities before they're posted by monitoring organizational signals. You move first.</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[13px] font-semibold text-slate-900 mb-2">vs. Executive coaches</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">Coaches provide strategy and accountability. They spend 90% of their time on the 10% of your search (the sessions). We handle the 90%: signal monitoring, prep briefs, pipeline discipline, daily execution. Better coaches use us for exactly this.</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[13px] font-semibold text-slate-900 mb-2">vs. Spray and pay (resume services, general job boards)</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">Those tools are transactional and generic. We are built for VP/C-suite tech searches only. Signal monitoring is specific to executive moves. Prep briefs are calibrated to peer-level conversations. Every feature assumes you are targeting 20-40 companies, not browsing thousands.</p>
              </div>
            </div>
          </section>

          <section className="border border-orange-300 rounded-lg p-6 bg-orange-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-600 mb-4">What I Want From You</p>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-800 leading-relaxed">
              <li>Top 3 flaws. No softening.</li>
              <li>Top 1 fix we should do first.</li>
              <li>Would you recommend this to one executive right now: yes or no, and why.</li>
            </ol>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <a
                href={structuredFeedbackLink}
                className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-5 py-2.5 rounded transition-colors text-center"
              >
                Send direct feedback email
              </a>
              <a
                href={callRequestLink}
                className="inline-block border border-slate-400 hover:border-slate-600 text-slate-800 text-[14px] px-5 py-2.5 rounded transition-colors text-center"
              >
                Request 15-minute call
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
