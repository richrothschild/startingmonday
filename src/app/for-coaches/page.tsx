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

const COACH_PERSONAS = [
  {
    type: 'Career Transition Specialist',
    situation: 'Coaching executives through involuntary or voluntary transitions (30-90 days)',
    pressure: 'Session time consumed by research. Clients go dormant and miss signals.',
    leverage: 'Give your client the discipline to move fast and the signal awareness to strike at the right moment. You become their strategic thinking partner, not their research assistant.',
  },
  {
    type: 'VP-to-CXO Positioning Coach',
    situation: 'Coaching high-performers ready for next-level roles (12-24 months)',
    pressure: 'Clients go dormant between sessions. Long cycles mean attention spans shrink.',
    leverage: 'Maintain momentum over years without the work consuming you. Quarterly outreach cadence, updated narrative, sustained relationship tracking. You become the keeper of their executive narrative.',
  },
  {
    type: 'Executive Search Firm Coach',
    situation: 'Interview prep and messaging coaching for C-suite placements (2-4 weeks)',
    pressure: 'Coaching half-blind. You do not have pipeline visibility. Last-minute prep.',
    leverage: 'See what they are doing, what signals they are missing, what companies are moving. Coach with full context. Your 2-week window becomes 4 weeks of advantage.',
  },
  {
    type: 'Board & Governance Coach',
    situation: 'Coaching executives pursuing board seats and advisory roles (6-24 months)',
    pressure: 'Multi-year relationships require discipline. Tracking 50+ relationships is admin-heavy.',
    leverage: 'Monitor board composition changes, governance signals, and PE transitions at scale. You maintain relationships over years without consuming your attention. Your credibility compounds.',
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
            Your coaching leverage. Compounded.
          </h1>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg mb-2">
            You're paid to be a strategic thinking partner, not a research assistant. Starting Monday handles the intelligence, pipeline discipline, and daily briefing between sessions. Your clients move faster. You do better work. Your leverage with them increases.
          </p>
          <p className="text-[13px] text-orange-400 font-semibold mb-2">
            Most coaches operate in the dark. You won't.
          </p>
          <p className="text-[13px] text-slate-400 italic">
            Search coaches who are not tracking intelligence are operating at a disadvantage.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto space-y-16">

          <section>
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
              When your clients move faster and make better decisions, they tell their peers you made them better. Your reputation compounds. Engagement time increases. You become indispensable.
            </p>
          </section>

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-6">
              Your coaching style. Multiplied.
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-8 max-w-lg">
              Different coaches work with different timelines and client situations. Here is how Starting Monday amplifies your leverage in each one. The same platform, different contexts—your practice scales across all of these.
            </p>
            <div className="space-y-6">
              {/* Persona specificity and metrics added */}
              <div className="border border-slate-200 rounded-lg p-6 bg-white">
                <p className="text-[13px] font-bold text-slate-900 mb-1">Career Transition Specialist</p>
                <p className="text-[12px] text-slate-500 mb-4">Coaching executives through involuntary or voluntary transitions (30-90 days)</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">The pressure</p>
                    <p className="text-[13px] text-slate-600">Session time consumed by research. Clients go dormant and miss signals. Typical client moves through 3-4 waves of conversations in their first month, not their first quarter.</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-[0.08em] mb-1">Your leverage</p>
                    <p className="text-[13px] text-slate-700 font-medium">Give your client the discipline to move fast and the signal awareness to strike at the right moment. You become their strategic thinking partner, not their research assistant. You can now assess readiness for Q3 moves based on signals, not hope.</p>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Emotional shift:</span> Your client stops feeling behind and starts feeling in control between sessions.</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-6 bg-white">
                <p className="text-[13px] font-bold text-slate-900 mb-1">VP-to-CXO Positioning Coach</p>
                <p className="text-[12px] text-slate-500 mb-4">Coaching high-performers ready for next-level roles (12-24 months)</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">The pressure</p>
                    <p className="text-[13px] text-slate-600">Clients go dormant between sessions. Long cycles mean attention spans shrink. Typical engagement: 18 months, 6-8 active opportunities tracked at once.</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-[0.08em] mb-1">Your leverage</p>
                    <p className="text-[13px] text-slate-700 font-medium">Maintain momentum over years without the work consuming you. Quarterly outreach cadence, updated narrative, sustained relationship tracking. You become the keeper of their executive narrative. Your engagement time doesn't increase. Your impact does.</p>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Emotional shift:</span> Your client moves from uncertainty about readiness to confidence in progression and timing.</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-6 bg-white">
                <p className="text-[13px] font-bold text-slate-900 mb-1">Executive Search Firm Coach</p>
                <p className="text-[12px] text-slate-500 mb-4">Interview prep and messaging coaching for C-suite placements (2-4 weeks)</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">The pressure</p>
                    <p className="text-[13px] text-slate-600">Coaching half-blind. You do not have pipeline visibility. Last-minute prep. Typical: 2-3 C-suite placements per quarter, each with 4+ interviews in 2 weeks.</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-[0.08em] mb-1">Your leverage</p>
                    <p className="text-[13px] text-slate-700 font-medium">See what they are doing, what signals they are missing, what companies are moving. Coach with full context. Your 2-week window becomes 4 weeks of advantage. You become the coach search firms call repeatedly for C-suite placements.</p>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Emotional shift:</span> Your client replaces interview anxiety with peer-level confidence before each round.</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-6 bg-white">
                <p className="text-[13px] font-bold text-slate-900 mb-1">Board & Governance Coach</p>
                <p className="text-[12px] text-slate-500 mb-4">Coaching executives pursuing board seats and advisory roles (6-24 months)</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">The pressure</p>
                    <p className="text-[13px] text-slate-600">Multi-year relationships require discipline. Tracking 50+ relationships is admin-heavy. Typical: 50-80 board/advisor relationships tracked over 3 years.</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-[0.08em] mb-1">Your leverage</p>
                    <p className="text-[13px] text-slate-700 font-medium">Monitor board composition changes, governance signals, and PE transitions at scale. You maintain relationships over years without consuming your attention. Your credibility compounds. Coaches who maintain quarterly outreach cadence see 40% more client activations in the next cycle.</p>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Emotional shift:</span> Your client moves from low-grade uncertainty to steady long-range confidence in board positioning.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Execution rhythm
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-8 max-w-xl leading-snug">
              Three touchpoints. No wasted motion.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
              <div className="border-t-2 border-orange-500 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Monday morning</p>
                <p className="text-[15px] font-semibold text-slate-900 mb-2">Review the pipeline together.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Update stages. Drop what has gone cold. Choose who moves to outreach this week.</p>
              </div>
              <div className="border-t-2 border-slate-200 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Every morning</p>
                <p className="text-[15px] font-semibold text-slate-900 mb-2">Act on overnight signals.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">One decision: which company to contact first. The briefing surfaces it. Your client acts.</p>
              </div>
              <div className="border-t-2 border-slate-200 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Before each interview</p>
                <p className="text-[15px] font-semibold text-slate-900 mb-2">Run the prep brief.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Usually about a minute. Win thesis, likely objections, and peer-level questions before the session starts.</p>
              </div>
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
          </section>

          <section className="border-t border-slate-100 pt-10">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Partner economics
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
              When your clients activate a paid plan through your referral link, you earn 20% commission on their subscription for as long as they are active. No enrollment fee. No minimum volume. Revenue follows reputation.
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-6">
              Preferred partners who enroll multiple clients get consolidated billing, an activation dashboard, and volume pricing. You see who is active and engaged, without status calls from your clients.
            </p>
            <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 mb-6">
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 mb-2">Economics at a glance</p>
              <p className="text-[13px] text-slate-700 leading-relaxed mb-3">
                20% recurring commission on paid referrals. Example: 10 clients on Active ($199/mo) = approximately $398/mo recurring partner revenue.
              </p>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Your clients get daily execution infrastructure between sessions. You get a revenue stream from the work you are already doing. They move faster and stick with coaching longer. Your clients become repeat clients. Your revenue becomes predictable.
              </p>
            </div>
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
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              The coaching practice that compounds
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
              This is not about giving your clients a tool. It's about building a sustainable, scalable coaching practice. Better infrastructure means better pace. Better pace means you can do this for 20 years. Your impact compounds. Your reputation compounds. Your revenue compounds. Coaching doesn't burn you out.
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-2">
              Your clients feel the difference immediately. Someone is watching. Someone cares enough to track this. You become the coach who has the advantage, the insight, the discipline.
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed">
              Built for coaches who think in terms of relationship sustainability, not transaction completion.
            </p>
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
