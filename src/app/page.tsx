import Link from 'next/link'

export const metadata = {
  title: 'Starting Monday — AI Career Tools for Executives',
  description: 'Pipeline tracking, automated opportunity scanning, and elite interview prep for executives.',
}

const FEATURES = [
  {
    label: 'Pipeline Command Center',
    body: 'Track every target company, stage, contact, and follow-up in one place. Never let a warm relationship go cold or miss a critical next step.',
  },
  {
    label: 'Automated Career Page Scanning',
    body: 'We monitor your target companies\' career pages three times a week and surface matching roles the moment they appear — scored against your target titles.',
  },
  {
    label: 'Elite Interview Prep',
    body: 'Before every conversation, generate a brief that rivals what a top executive coach produces: win thesis, anticipated pushback with counters, peer-level questions, and what to leave out.',
  },
  {
    label: 'Daily Briefing',
    body: 'A morning email with your pipeline status, new scan matches, and pending follow-ups. Your search stays moving without consuming your day.',
  },
]

const STEPS = [
  {
    n: '01',
    label: 'Build your target list',
    body: 'Add the companies you\'re pursuing, set pipeline stages, and track the people you know at each one.',
  },
  {
    n: '02',
    label: 'We scan while you work',
    body: 'Automated monitoring surfaces matching roles before they\'re widely circulated. Paste the job description into your company record and it feeds directly into your prep.',
  },
  {
    n: '03',
    label: 'Walk in prepared',
    body: 'Generate an elite prep brief from your documents, contacts, and pipeline data. Refine it with a single instruction — the way you\'d direct a researcher.',
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
          <Link
            href="/login"
            className="text-[13px] text-slate-400 hover:text-white transition-colors"
          >
            Log in →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-slate-900 px-6 pt-24 pb-28">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-6">
            Built for executives in active search
          </p>
          <h1 className="text-[48px] sm:text-[56px] font-bold text-white leading-[1.1] tracking-tight mb-6">
            Walk into every<br />interview owning<br />the room.
          </h1>
          <p className="text-[17px] text-slate-400 leading-relaxed max-w-xl mb-10">
            Starting Monday is an AI-powered search platform that tracks your pipeline, monitors target companies for openings, and generates elite interview prep — so you compete like you have a team behind you.
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-slate-900 text-[14px] font-bold px-7 py-3.5 rounded hover:bg-slate-100 transition-colors"
          >
            Get early access
          </Link>
        </div>
      </section>

      {/* Problem strip */}
      <section className="border-b border-slate-100 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-[20px] font-semibold text-slate-900 leading-relaxed">
            Most executive searches are managed with spreadsheets, calendar reminders, and gut feel. Starting Monday replaces all of it.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 px-6 py-20">
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

      {/* How it works */}
      <section className="px-6 py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-10">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {STEPS.map(s => (
              <div key={s.n}>
                <p className="text-[11px] font-bold tracking-[0.12em] text-slate-300 mb-4">{s.n}</p>
                <p className="text-[16px] font-bold text-slate-900 mb-3">{s.label}</p>
                <p className="text-[14px] text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview prep callout */}
      <section className="bg-slate-50 px-6 py-20 border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-6">
            Interview prep
          </p>
          <h2 className="text-[30px] font-bold text-slate-900 leading-tight mb-5">
            The brief a $5,000 coach would give you. On demand.
          </h2>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-5">
            Before every conversation, generate a prep brief grounded in your actual pipeline data — the company's situation, why you win the role, how to tell your story for that specific room, 3–4 likely objections with exact counters, and what to leave out.
          </p>
          <p className="text-[15px] text-slate-500 leading-relaxed">
            Paste in the job description, add what you know about the organization, and refine with a single instruction. The output changes depending on who's in the room.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[32px] font-bold text-white mb-4">
            Start your search with an edge.
          </h2>
          <p className="text-[15px] text-slate-400 mb-10">
            Early access is limited. No credit card required to get started.
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-slate-900 text-[14px] font-bold px-8 py-3.5 rounded hover:bg-slate-100 transition-colors"
          >
            Get early access
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-600">
            Starting Monday
          </span>
          <span className="text-[12px] text-slate-600">
            startingmonday.app
          </span>
        </div>
      </footer>

    </div>
  )
}
