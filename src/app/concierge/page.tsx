import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Executive Concierge — Starting Monday',
  description: 'Monthly one-to-one strategy with a senior technology executive who has run this search. AI-prepared agenda. Running notes. 10 seats.',
  alternates: {
    canonical: 'https://startingmonday.app/concierge',
  },
}

const WHAT_YOU_GET = [
  {
    label: '45 minutes, monthly',
    body: 'A focused strategy session with Rich Rothschild, a Transformation CIO who has run this search at the senior level. Not a coach reading a playbook. A peer who has been in the seat.',
  },
  {
    label: 'AI-prepared agenda',
    body: 'Before every call, Starting Monday assembles a brief from your live pipeline: where each company stands, which relationships have gone cold, which signals need a decision. You both walk in prepared.',
  },
  {
    label: 'Running notes',
    body: 'After each call, notes are stored in the platform and carry forward. Every session builds on the last. Nothing restated, nothing lost.',
  },
]

const HOW_IT_WORKS = [
  'Apply and schedule your first call.',
  'Starting Monday prepares a briefing from your pipeline the day before.',
  'You and Rich work through it together.',
  'Notes are stored and the next call picks up where this one left off.',
]

export default function ConciergePage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Nav */}
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-semibold text-white bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-slate-900 px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
            Executive Concierge
          </p>
          <h1 className="text-[36px] sm:text-[50px] font-bold text-white leading-[1.1] tracking-tight mb-5">
            One-to-one strategy.<br />Every month.
          </h1>
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-xl mb-3">
            The platform does the intelligence work. This tier adds the human layer. A monthly 45-minute session with a senior technology executive who has run this search. AI-prepared agenda. Running notes. 10 seats.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4 mt-8">
            <div>
              <a
                href="mailto:concierge@startingmonday.app?subject=Executive%20Concierge%20%E2%80%94%20Access%20Request"
                className="inline-block bg-orange-500 text-white text-[14px] font-bold px-7 py-3.5 rounded hover:bg-orange-600 transition-colors"
              >
                Apply for access &rarr;
              </a>
              <p className="text-[12px] text-slate-500 mt-2.5">10 seats. Currently accepting applications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-white px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
            What you get
          </p>
          <h2 className="text-[22px] font-bold text-slate-900 mb-10 max-w-xl leading-snug">
            Software plus the human judgment to use it well.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {WHAT_YOU_GET.map(item => (
              <div key={item.label} className="border-t-2 border-orange-500 pt-5">
                <p className="text-[14px] font-bold text-slate-900 mb-3">{item.label}</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
            How it works
          </p>
          <h2 className="text-[22px] font-bold text-slate-900 mb-10 leading-snug">
            Four steps. No overhead.
          </h2>
          <ol className="space-y-5">
            {HOW_IT_WORKS.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="text-[13px] font-bold text-orange-500 shrink-0 w-5 mt-0.5">{i + 1}</span>
                <p className="text-[15px] text-slate-700 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
            Pricing
          </p>
          <h2 className="text-[22px] font-bold text-slate-900 mb-4 leading-snug">
            Everything in Starting Monday. Plus the call.
          </h2>
          <p className="text-[14px] text-slate-500 mb-8 leading-relaxed max-w-lg">
            Concierge includes the full Search tier plus monthly sessions. Billed monthly or annually.
          </p>
          <div className="border border-slate-900 rounded-lg p-6 sm:p-8 bg-slate-900 max-w-sm">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Executive Concierge</p>
            <p className="text-[38px] font-bold text-white leading-none mb-1">
              $1,299<span className="text-[18px] font-normal text-slate-400">/mo</span>
            </p>
            <p className="text-[12px] text-slate-500 mb-0.5">10 seats. Apply for access.</p>
            <p className="text-[11px] text-slate-600 mb-6">or $13,999/yr</p>
            <a
              href="mailto:concierge@startingmonday.app?subject=Executive%20Concierge%20%E2%80%94%20Access%20Request"
              className="inline-block w-full text-center bg-orange-500 text-white text-[13px] font-bold px-5 py-3 rounded hover:bg-orange-600 transition-colors"
            >
              Apply for access &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* About Rich */}
      <section className="bg-slate-50 px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
            Who you are talking to
          </p>
          <h2 className="text-[22px] font-bold text-slate-900 mb-5 leading-snug">
            Not a coach. A practitioner.
          </h2>
          <p className="text-[15px] text-slate-600 leading-relaxed max-w-xl">
            Rich Rothschild is a Transformation CIO who has led large-scale technology organizations and run this search at the senior level. He built Starting Monday because the tools available to executives in transition did not match the reality of the search. The Concierge tier is the version of Starting Monday where he works alongside you directly.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[28px] sm:text-[34px] font-bold text-white mb-4 leading-tight">
            10 seats. Apply now.
          </h2>
          <p className="text-[15px] text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
            Concierge is limited to ensure every seat gets full attention. If you are in active search and want the direct strategy layer, apply now.
          </p>
          <a
            href="mailto:concierge@startingmonday.app?subject=Executive%20Concierge%20%E2%80%94%20Access%20Request"
            className="inline-block bg-orange-500 text-white text-[14px] font-bold px-8 py-3.5 rounded hover:bg-orange-600 transition-colors"
          >
            Apply for access &rarr;
          </a>
          <p className="text-[13px] text-slate-600 mt-4">
            Already a Starting Monday user?{' '}
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 underline transition-colors">
              Log in and apply from your dashboard &rarr;
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
            <Link href="/privacy" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Back to Starting Monday</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
