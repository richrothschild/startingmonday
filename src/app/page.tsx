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
    id: 'passive',
    headline: "I'm not looking hard — but I'd move for the right thing.",
    sub: 'I want to be alerted, not to go hunting.',
  },
  {
    id: 'level-up',
    headline: "I'm ready for VP or C-suite.",
    sub: 'First senior search. I need the playbook.',
  },
  {
    id: 'executive',
    headline: 'I know exactly what I want.',
    sub: 'Targeted search. I just need to move faster.',
  },
  {
    id: 'pivot',
    headline: "I'm changing direction entirely.",
    sub: 'My background is strong. The title is different.',
  },
  {
    id: 'returning',
    headline: "I've been out of the market.",
    sub: 'Gap to address. Network to warm back up.',
  },
]

const ALTS = [
  {
    label: 'Job boards',
    verdict: 'Not built for you',
    body: 'You apply and wait. Two hundred other applicants for every role. The ATS filters you before a human reads your name. Senior roles are rarely posted publicly.',
    highlight: false,
  },
  {
    label: 'Human coaches',
    verdict: 'Expensive and slow',
    body: '$5,000–$25,000 for an engagement. Can\'t monitor 20 career pages. Available during business hours. High value for some things — not a search system.',
    highlight: false,
  },
  {
    label: 'Starting Monday',
    verdict: 'Built for this',
    body: 'AI that tracks your pipeline, monitors target companies, and preps you for every conversation — available at midnight before your biggest interview, priced like a tool, not a retainer.',
    highlight: true,
  },
]

const FEATURES = [
  {
    label: 'Automated Career Page Scanning',
    body: 'We monitor your target companies\' career pages three times a week and surface matching roles the moment they appear — scored against your target titles before they\'re widely circulated.',
  },
  {
    label: 'Pipeline Command Center',
    body: 'Track every target company, stage, contact, and follow-up in one place. Never let a warm relationship go cold or miss a critical next step.',
  },
  {
    label: 'Elite Interview Prep',
    body: 'Generate a brief that rivals what a top executive coach produces: win thesis, anticipated pushback with exact counters, peer-level questions to ask, and what to leave out entirely.',
  },
  {
    label: 'Daily Briefing',
    body: 'A morning summary of your pipeline status, new scan matches, and pending follow-ups. Your search keeps moving without consuming your day.',
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
              href="/login"
              className="text-[13px] text-slate-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-semibold text-slate-900 bg-white px-4 py-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-slate-900 px-6 pt-24 pb-28">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-6">
            AI career platform for senior professionals
          </p>
          <h1 className="text-[48px] sm:text-[56px] font-bold text-white leading-[1.1] tracking-tight mb-6">
            Walk into every<br />interview owning<br />the room.
          </h1>
          <p className="text-[17px] text-slate-400 leading-relaxed max-w-xl mb-3">
            Starting Monday tracks your pipeline, monitors target companies for openings, and generates elite interview prep — so you compete like you have a team behind you.
          </p>
          <p className="text-[13px] text-slate-600 mb-10">
            Named for the day you start your next role. Everything here is built to get you there.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-slate-900 text-[14px] font-bold px-7 py-3.5 rounded hover:bg-slate-100 transition-colors"
          >
            Start your search →
          </Link>
        </div>
      </section>

      {/* Persona self-selection */}
      <section className="px-6 py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-3">
            Where you are right now
          </p>
          <h2 className="text-[26px] font-bold text-slate-900 mb-10">
            Which of these sounds like you?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SITUATIONS.map(s => (
              <Link
                key={s.id}
                href="/signup"
                className="group border border-slate-200 rounded-lg p-5 hover:border-slate-400 hover:shadow-sm transition-all"
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

      {/* Emotional bridge */}
      <section className="bg-slate-50 px-6 py-16 border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-[19px] font-semibold text-slate-900 leading-relaxed mb-4">
            You&rsquo;ve been exceptional at your job for years. You shouldn&rsquo;t have to figure out how to find the next one from scratch.
          </p>
          <p className="text-[15px] text-slate-500 leading-relaxed">
            Senior searches don&rsquo;t work the way everyone else&rsquo;s do. Most roles at this level are never posted publicly. They move through relationships, recruiting firms, and targeted outreach. Starting Monday is built for that reality &mdash; not for the job board world you already know doesn&rsquo;t work.
          </p>
        </div>
      </section>

      {/* Differentiation */}
      <section className="px-6 py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-10">
            Why not the alternatives
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {ALTS.map(a => (
              <div
                key={a.label}
                className={`p-8 ${a.highlight ? 'bg-slate-900' : 'bg-white'}`}
              >
                <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-2">
                  {a.label}
                </p>
                <p className={`text-[15px] font-semibold mb-3 ${a.highlight ? 'text-white' : 'text-slate-600'}`}>
                  {a.verdict}
                </p>
                <p className={`text-[13px] leading-relaxed ${a.highlight ? 'text-slate-400' : 'text-slate-400'}`}>
                  {a.body}
                </p>
              </div>
            ))}
          </div>
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
        </div>
      </section>

      {/* Interview prep callout */}
      <section className="px-6 py-20 border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-6">
            Interview prep
          </p>
          <h2 className="text-[30px] font-bold text-slate-900 leading-tight mb-5">
            The brief a $5,000 coach would give you. On demand.
          </h2>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-4">
            Before every conversation, generate a prep brief grounded in your actual pipeline data: the company&rsquo;s situation, why you win this role, how to tell your story for that specific room, 3&ndash;4 likely objections with exact counters, and what to leave out entirely.
          </p>
          <p className="text-[15px] text-slate-500 leading-relaxed">
            Add the job description. Add what you know about the organization. Refine it with a single instruction. The output changes depending on who&rsquo;s in the room.
          </p>
        </div>
      </section>

      {/* LinkedIn onramp */}
      <section className="bg-slate-50 px-6 py-14 border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-[14px] font-bold text-slate-900 mb-2">Start in under 2 minutes</p>
            <p className="text-[14px] text-slate-500 leading-relaxed">
              Export your LinkedIn profile as a PDF &mdash; go to your profile, click{' '}
              <span className="font-medium text-slate-700">Resources → Save to PDF</span> &mdash; and upload it during setup.
              Your history, positioning, and background are imported automatically. No typing required.
            </p>
          </div>
          <Link
            href="/signup"
            className="shrink-0 inline-block bg-slate-900 text-white text-[13px] font-bold px-6 py-3 rounded hover:bg-slate-800 transition-colors"
          >
            Get started →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-6">
            Your starting Monday is waiting
          </p>
          <h2 className="text-[32px] font-bold text-white mb-4">
            Start your search with an edge.
          </h2>
          <p className="text-[15px] text-slate-400 mb-10">
            No credit card required. Takes about 5 minutes to set up.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-slate-900 text-[14px] font-bold px-8 py-3.5 rounded hover:bg-slate-100 transition-colors"
          >
            Start your search →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-600">
            Starting Monday
          </span>
          <span className="text-[12px] text-slate-600">startingmonday.app</span>
        </div>
      </footer>

    </div>
  )
}
