import Link from 'next/link'

export const metadata = {
  title: 'Starting Monday — AI Career Platform for Senior Professionals',
  description: 'Pipeline tracking, automated company monitoring, and elite interview prep for executives and senior professionals in active search.',
}

const SITUATIONS = [
  {
    id: 'urgent',
    headline: 'My role was eliminated.',
    sub: 'I need to land well. Quickly.',
  },
  {
    id: 'executive',
    headline: 'I know exactly what I want.',
    sub: 'Targeted search. I just need to move faster.',
  },
  {
    id: 'level-up',
    headline: "I've earned the next level.",
    sub: 'First senior search. I need the playbook.',
  },
  {
    id: 'passive',
    headline: "I'm not looking — but Sunday nights feel different.",
    sub: 'Not ready to commit. But not at peace either.',
  },
  {
    id: 'pivot',
    headline: "I've outgrown my lane.",
    sub: 'Same caliber. Different stage.',
  },
  {
    id: 'returning',
    headline: "I've been saying 'starting Monday' for months.",
    sub: 'This is the one that sticks.',
  },
]

const FEATURES = [
  {
    label: 'Pipeline Command Center',
    body: 'Every company, contact, and conversation — staged, sequenced, and tracked. Nothing falls through. Nothing goes cold.',
  },
  {
    label: 'Early Role Intelligence',
    body: 'Your target companies are being watched. Three times a week, we scan their career pages and flag matching roles before they reach LinkedIn or Indeed.',
  },
  {
    label: 'Elite Interview Prep Brief',
    body: 'Your win thesis. The objections they will raise, and how to counter each one. The questions only a peer would think to ask. What to leave out entirely. Ready in 60 seconds.',
  },
  {
    label: 'Daily Morning Briefing',
    body: 'New matches, pending actions, and company signals — assembled overnight and in your inbox before the day starts.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Nav */}
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white">
            Starting Monday
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/optimize"
              className="text-[13px] text-slate-400 hover:text-white transition-colors"
            >
              Free Profile Grade
            </Link>
            <Link
              href="/login"
              className="text-[13px] text-slate-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/demo"
              className="text-[13px] text-slate-400 hover:text-white transition-colors"
            >
              Try demo
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-semibold text-slate-900 bg-white px-4 py-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-slate-900 px-6 pt-20 pb-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-[19px] sm:text-[21px] text-slate-400 italic leading-relaxed mb-7">
            The search is harder than the job.
          </p>
          <h1 className="text-[44px] sm:text-[54px] font-bold text-white leading-[1.1] tracking-tight mb-5">
            Your next role<br />isn&rsquo;t on a<br />job board.
          </h1>
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-xl mb-3">
            The best roles at your level are filled before they&rsquo;re posted. We watch your target companies, surface openings before they go public, and have your brief ready before the first call.
          </p>
          <p className="text-[13px] text-slate-500 mb-8">
            Import your LinkedIn profile during setup. Running in 2 minutes.
          </p>

          <div className="flex flex-col gap-2.5 mb-9">
            {[
              'Add your target companies — we check their career pages three times a week, before roles go public',
              'Get alerted the moment a match appears — often days before it reaches LinkedIn or Indeed',
              'Generate a tailored prep brief in 60 seconds, built from their company and your actual background',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[11px] font-bold text-slate-600 shrink-0 w-4 mt-0.5">{i + 1}</span>
                <p className="text-[13px] text-slate-400 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div>
              <Link
                href="/signup"
                className="inline-block bg-white text-slate-900 text-[14px] font-bold px-7 py-3.5 rounded hover:bg-slate-100 transition-colors"
              >
                Start your search &rarr;
              </Link>
              <p className="text-[12px] text-slate-400 mt-2.5">Free for 30 days. No credit card.</p>
            </div>
            <Link
              href="/demo"
              className="inline-block text-[14px] text-slate-400 hover:text-slate-200 px-4 py-3.5 transition-colors"
            >
              See a live demo &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Persona self-selection — position 2 */}
      <section className="bg-slate-50 px-6 py-16 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[22px] font-bold text-slate-900 mb-1.5">
            Which of these sounds like you?
          </h2>
          <p className="text-[14px] text-slate-400 mb-8">Everyone here is in a different place. The platform meets you where you are.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SITUATIONS.map(s => (
              <Link
                key={s.id}
                href="/signup"
                className="group bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-800 hover:shadow-sm transition-all"
              >
                <p className="text-[15px] font-semibold text-slate-900 mb-1.5 group-hover:text-slate-700">
                  {s.headline}
                </p>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  {s.sub}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation — one sentence */}
      <section className="bg-white px-6 py-10 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[17px] text-slate-500 leading-relaxed">
            Not a job board. Not a $15,000 coaching engagement.{' '}
            <span className="text-slate-900 font-semibold">The operating system for your search.</span>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 px-6 py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-10">
            What it does
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {FEATURES.map(f => (
              <div key={f.label} className="bg-white p-8">
                <p className="text-[13px] font-bold text-slate-900 mb-3">{f.label}</p>
                <p className="text-[14px] text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/signup"
              className="inline-block bg-slate-900 text-white text-[13px] font-bold px-6 py-3 rounded hover:bg-slate-800 transition-colors"
            >
              Start your search &rarr;
            </Link>
            <p className="text-[12px] text-slate-400 mt-2">Free for 30 days. No credit card.</p>
          </div>
        </div>
      </section>

      {/* Social proof + stats */}
      <section className="bg-slate-900 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-[20px] sm:text-[23px] font-semibold text-white leading-relaxed mb-3 max-w-2xl">
            &ldquo;I had a recruiter call at 7am. The brief was ready. I walked in knowing exactly what to say and what to leave out.&rdquo;
          </blockquote>
          <p className="text-[13px] text-slate-500 mb-14">Senior technology executive, active search</p>

          <div className="grid grid-cols-3 gap-8 text-center border-t border-slate-800 pt-12">
            <div>
              <p className="text-[34px] font-bold text-white leading-none mb-2">3&times;</p>
              <p className="text-[13px] text-slate-400 leading-relaxed">Career page checks per week at every target company you add</p>
            </div>
            <div>
              <p className="text-[34px] font-bold text-white leading-none mb-2">60s</p>
              <p className="text-[13px] text-slate-400 leading-relaxed">To generate the prep brief an executive coach takes days to produce</p>
            </div>
            <div>
              <p className="text-[34px] font-bold text-white leading-none mb-2">$0</p>
              <p className="text-[13px] text-slate-400 leading-relaxed">To start. 30-day trial, no credit card, cancel any time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 px-6 py-24 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[30px] sm:text-[36px] font-bold text-white mb-4 leading-tight">
            The call will come.<br />Be ready when it does.
          </h2>
          <p className="text-[15px] text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            The people who land the best roles aren&rsquo;t luckier. They started sooner, stayed closer to their targets, and walked in prepared.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-slate-900 text-[14px] font-bold px-8 py-3.5 rounded hover:bg-slate-100 transition-colors"
          >
            Start your search &rarr;
          </Link>
          <p className="text-[12px] text-slate-500 mt-3">Free for 30 days. No credit card. Takes about 2 minutes.</p>
          <p className="text-[13px] text-slate-600 mt-4">
            Want to see it first?{' '}
            <Link href="/demo" className="text-slate-400 hover:text-slate-200 underline transition-colors">
              Explore a live demo &rarr;
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-600">
            Starting Monday
          </span>
          <div className="flex items-center gap-5">
            <Link href="/optimize" className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors">
              Free Profile Grade
            </Link>
            <Link href="/privacy" className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors">
              Terms
            </Link>
            <span className="text-[12px] text-slate-600">startingmonday.app</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
