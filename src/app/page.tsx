import Link from 'next/link'

export const metadata = {
  title: 'Starting Monday — AI Career Platform for Senior Professionals',
  description: 'Pipeline tracking, automated company monitoring, and elite interview prep for executives and senior professionals in active search.',
}

const SITUATIONS = [
  {
    id: 'urgent',
    headline: 'I just got the call.',
    sub: 'High urgency. I need a system now.',
  },
  {
    id: 'executive',
    headline: 'I know exactly what I want.',
    sub: 'Targeted search. I just need to move faster.',
  },
  {
    id: 'level-up',
    headline: "I'm ready for VP or C-suite.",
    sub: 'First senior search. I need the playbook.',
  },
  {
    id: 'passive',
    headline: "I'm not looking — but Sunday nights feel different.",
    sub: 'Not ready to commit. But not at peace either.',
  },
  {
    id: 'pivot',
    headline: "I'm changing direction entirely.",
    sub: 'My background is strong. The title is different.',
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
    body: 'Every target company, stage, contact, and follow-up in one place. Nothing falls through. Nothing goes cold.',
  },
  {
    label: 'Automated Career Page Scanning',
    body: 'We check your target companies three times a week and surface matching roles before they hit LinkedIn or Indeed.',
  },
  {
    label: 'Elite Interview Prep Brief',
    body: 'Win thesis. Anticipated pushback with exact counters. Peer-level questions to ask. What to leave out entirely. On demand.',
  },
  {
    label: 'Daily Morning Briefing',
    body: 'New scan matches, pending follow-ups, and company signals in your inbox before the day begins.',
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
            Starting Monday tracks your pipeline, surfaces openings at target companies before they&rsquo;re posted, and builds your prep brief on demand.
          </p>
          <p className="text-[13px] text-slate-500 mb-9">
            Paste your LinkedIn profile during setup. Running in 2 minutes.
          </p>
          <div>
            <Link
              href="/signup"
              className="inline-block bg-white text-slate-900 text-[14px] font-bold px-7 py-3.5 rounded hover:bg-slate-100 transition-colors"
            >
              Start your search &rarr;
            </Link>
            <p className="text-[12px] text-slate-600 mt-2.5">Free for 30 days. No credit card.</p>
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
            <span className="text-slate-900 font-semibold">A system that runs your search like a professional operation.</span>
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
            <span className="text-[12px] text-slate-600">startingmonday.app</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
