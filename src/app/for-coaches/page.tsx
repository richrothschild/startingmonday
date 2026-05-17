import type { Metadata } from 'next'
import Link from 'next/link'
import { CoachPreviewActions } from './coach-preview-actions'

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

const SAMPLE_PREP_BRIEF_POINTS = [
  'Win thesis: stabilize a post-acquisition technology stack without slowing revenue operations.',
  'Likely objection: concern that your turnaround depth outweighs product-led growth experience.',
  'Peer-level question: how is the board measuring integration success across the first two operating reviews?',
]

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
            Give your clients the signal and readiness infrastructure. Keep your session time for strategy.
          </h1>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg mb-2">
            Starting Monday helps executive coaches and their clients identify, track, and act on market signals earlier, with more discipline and better preparation. It handles the intelligence, pipeline rhythm, and prep infrastructure between sessions so you can stay in judgment, narrative, and accountability.
          </p>
          <p className="text-[13px] text-slate-300 leading-relaxed max-w-lg mb-3">
            Built for coaches working with CIOs, CTOs, CISOs, CDOs, and other senior technology leaders in transition. Precise, private, and designed for warm referrals.
          </p>
          <p className="text-[13px] text-orange-300 leading-relaxed max-w-lg mb-6">
            Coaches without shared intelligence are coaching half-blind. This gives them the same context their clients need before the market gets noisy.
          </p>
          <div className="border border-slate-700 rounded-2xl p-4 bg-slate-950/40 mb-6">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-orange-400 mb-2">
              You might be thinking
            </p>
            <div className="space-y-2 text-[13px] text-slate-300 leading-relaxed">
              <p><span className="text-white font-semibold">&quot;My clients already have LinkedIn Premium.&quot;</span> Good. This is the operating layer underneath that, not a replacement for it.</p>
              <p><span className="text-white font-semibold">&quot;I already handle this in coaching.&quot;</span> Exactly. The point is to stop spending paid coaching time rebuilding context and chasing research.</p>
              <p><span className="text-white font-semibold">&quot;I do not want another tool to manage.&quot;</span> Then start with the preview. One coach seat, two to three client seats, one walkthrough, no obligation.</p>
            </div>
          </div>
          <CoachPreviewActions />
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto space-y-16">

          <section className="border border-slate-200 rounded-2xl p-6 sm:p-7 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Early proof
            </p>
            <p className="text-[12px] text-slate-500 mb-5">
              Verification-first policy: named testimonials are published only after explicit permission and outcome verification.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {PROOF_METRICS.map((metric) => (
                <div key={metric.value} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                  <p className="text-[24px] font-bold text-slate-900 leading-none mb-2">{metric.value}</p>
                  <p className="text-[12px] text-slate-600 leading-relaxed">{metric.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-2">
              Verified pilot evidence is from the executive cohort, not a coach-claimed model. That matters. Coaches are being asked to trust a workflow with real operating data behind it, not just language.
            </p>
            <p className="text-[12px] text-slate-500 leading-relaxed mb-1">
              Updated May 2026. Denominator: 27 pilot executives. Window: Jan-May 2026.
            </p>
            <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
              Method: includes users who completed onboarding and launched at least one tracked outreach. Results vary by sector, narrative quality, and campaign consistency.
            </p>
            <div className="border border-orange-100 bg-orange-50/50 rounded-xl p-4 mb-4">
              <p className="text-[12px] font-semibold text-slate-900 mb-1">Coaching-adjacent usage signal</p>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                20% of early users brought the daily briefing into every coaching session. That is not yet a coach testimonial, but it is a useful signal that the workflow already fits real coaching behavior.
              </p>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              More evidence and claim mapping live in <Link href="/references" className="underline underline-offset-2 hover:text-slate-700 transition-colors">Evidence and References</Link>.
            </p>
          </section>

          <section className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 sm:p-7">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-700 mb-3">
              The preview offer
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-4 leading-snug">
              Start with one coach preview, not a commitment.
            </h2>
            <div className="space-y-3 text-[14px] text-slate-700 leading-relaxed mb-6">
              <p>Free coach access for the preview period. Two to three client preview seats. One sample prep brief walkthrough. One short feedback session with the founder.</p>
              <p>Coaches can see the workflow, decide if it fits their practice, and recommend it only if it improves client readiness and session quality.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Free coach access during the preview',
                '2-3 client preview seats for live evaluation',
                'Sample brief walkthrough before first use',
                'Short feedback session after the preview window',
              ].map((item) => (
                <div key={item} className="bg-white border border-emerald-100 rounded-lg px-4 py-3">
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-2xl p-6 sm:p-7 bg-slate-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              30-second skim
            </p>
            <div className="space-y-3 text-[14px] text-slate-700 leading-relaxed mb-5">
              <p><span className="font-semibold text-slate-900">Who it is for:</span> executive coaches working with senior technology leaders in transition or positioning.</p>
              <p><span className="font-semibold text-slate-900">What changes:</span> less session time rebuilding context, more time on strategy, judgment, and accountability.</p>
              <p><span className="font-semibold text-slate-900">How to try it:</span> one preview seat for the coach, two to three preview seats for clients, no broader commitment required.</p>
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
              When your clients move earlier, stay accountable, and show up better prepared, they credit you for the quality of the process. That is the compounding asset here: better client outcomes, better conversations, stronger reputation.
            </p>
          </section>

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Sample output
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-4 leading-snug">
              Show, don&rsquo;t tell.
            </h2>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-6 max-w-xl">
              Coaches do not need more feature language. They need to see the quality of the output and the kind of action it creates. This is the kind of artifact a coach preview should expose immediately.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="border border-slate-200 rounded-2xl p-5 bg-white">
                <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Morning signal brief</p>
                <p className="text-[14px] font-semibold text-slate-900 mb-3">One company moved overnight. Here is why it matters.</p>
                <ul className="space-y-2">
                  {SAMPLE_SIGNAL_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-slate-600 leading-relaxed">
                      <span className="text-orange-500 shrink-0 mt-0.5">+</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] text-slate-500 leading-relaxed mt-4">Recommended action before 10am: send the reconnection note to the former operating partner already in the client&rsquo;s network and update the company priority to watchlist tier one. Coach view shows the company moved from Watchlist to Active Outreach and whether the note was sent.</p>
              </div>
              <div className="border border-orange-200 rounded-2xl p-5 bg-orange-50/40">
                <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-orange-600 mb-3">Prep brief excerpt</p>
                <p className="text-[14px] font-semibold text-slate-900 mb-3">Pre-interview view for a PE-backed CIO search</p>
                <ul className="space-y-2">
                  {SAMPLE_PREP_BRIEF_POINTS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-slate-700 leading-relaxed">
                      <span className="text-orange-600 shrink-0 mt-0.5">+</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] text-slate-500 leading-relaxed mt-4">Usually ready in about a minute. Coaches review the brief before the session so the conversation stays strategic instead of reconstructive. In practice, the coach sees the same brief the client sees, plus the current pipeline stage, next follow-up date, and any fresh signal cluster tied to the company.</p>
              </div>
            </div>
          </section>

          <section>
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
              This is not about giving your clients a tool. It&apos;s about building a sustainable, scalable coaching practice. Better infrastructure means better pace. Better pace means you can do this for 20 years. Your impact compounds. Your reputation compounds. Your revenue compounds. Coaching doesn&apos;t burn you out.
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-2">
              Your clients feel the difference immediately. Someone is watching. Someone cares enough to track this. You become the coach who has the advantage, the insight, the discipline.
            </p>
            <p className="text-[14px] text-slate-600 leading-relaxed">
              Built for coaches who think in terms of relationship sustainability, not transaction completion.
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
              Terry only needs to send this page. If a coach wants the details, the FAQ and economics pages are here without crowding the first conversation.
            </p>
            <CoachPreviewActions />
            <div className="flex flex-wrap gap-4 mt-5 text-[13px]">
              <Link href="/for-coaches/faq" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
                Read the coach FAQ
              </Link>
              <Link href="/for-coaches/economics" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
                See pricing and partner economics
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
