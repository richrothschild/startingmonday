import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Starting Monday for Executive Coaches',
  description: 'Give your C-suite clients the intelligence infrastructure to run a better search. You focus on the strategy. The platform handles the research, the pipeline tracking, and the daily briefing.',
  alternates: { canonical: 'https://startingmonday.app/for-coaches' },
  openGraph: {
    title: 'Starting Monday for Executive Coaches',
    description: 'Your C-suite clients run better searches. You spend session time on strategy, not research.',
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
    after: 'The prep brief is ready in 60 seconds. Win thesis, likely objections, peer-level questions, what to leave out. You can read it before the session.',
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
            For Executive Coaches
          </p>
          <h1 className="text-[30px] sm:text-[38px] font-bold text-white leading-[1.15] tracking-tight mb-5">
            Your C-suite clients run<br />better searches.<br />You do better work.
          </h1>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg">
            Starting Monday gives your clients the infrastructure they need between sessions. Intelligence, pipeline discipline, prep. You arrive at every call ready to do the work only you can do.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto space-y-16">

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-6">
              What changes
            </p>
            <div className="space-y-5">
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
          </section>

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              The partner program
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
              When your C-suite clients activate a paid plan through your referral link, you earn 20% commission on their subscription for as long as they are active. There is no enrollment fee and no minimum volume.
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-6">
              Preferred partners who enroll multiple clients at once get consolidated billing, an activation dashboard, and volume pricing. You see who is active and engaged, without requiring a status call from your client.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/partners#apply"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-6 py-3 rounded transition-colors text-center"
              >
                Apply as a partner &rarr;
              </Link>
              <Link
                href="/coaches-guide"
                className="inline-block border border-slate-200 hover:border-slate-400 text-slate-700 text-[14px] px-6 py-3 rounded transition-colors text-center"
              >
                Read the full coaches guide &rarr;
              </Link>
            </div>
          </section>

          <section className="border-t border-slate-100 pt-10">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
              What your clients get
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Intelligence Scanner', body: 'Watches every company on their target list. Surfaces executive departures, board changes, funding, and career page postings before a search is formalized.' },
                { label: 'AI Prep Brief', body: 'Win thesis, likely objections, peer-level questions, what to leave out. Ready in 60 seconds. Accurate to the specific company and role.' },
                { label: 'Pipeline Command Center', body: 'Every company, contact, and conversation tracked. Nothing goes cold. You can view their pipeline between sessions.' },
                { label: 'Daily Morning Briefing', body: 'Overnight signals and a prioritized action list in their inbox before the market opens. One decision each morning, not thirty.' },
              ].map((item, i) => (
                <div key={i} className="border-t border-slate-100 pt-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-1.5">{item.label}</p>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <p className="text-[11px] text-slate-500">
            Questions?{' '}
            <a href="mailto:contact@startingmonday.app" className="hover:text-slate-300 transition-colors">
              contact@startingmonday.app
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
