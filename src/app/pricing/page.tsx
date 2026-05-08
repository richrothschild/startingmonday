import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — Starting Monday',
  description: 'Simple pricing for senior executive job searches. Intelligence at $49/mo and Search at $129/mo. Teams and enterprise available.',
  alternates: { canonical: 'https://startingmonday.app/pricing' },
  openGraph: {
    title: 'Pricing — Starting Monday',
    description: 'Simple pricing for senior executive job searches.',
    url: 'https://startingmonday.app/pricing',
  },
}

const MONITOR_FEATURES = [
  'Pipeline tracking for up to 25 companies',
  'Company intelligence: news, 8-Ks, exec moves, funding, career pages',
  'Pattern alerts before roles are posted',
  'Weekly signal digest',
  'Contact tracker',
]

const ACTIVE_FEATURES = [
  'Everything in Intelligence',
  'AI interview prep briefs',
  'Search strategy brief',
  'AI chat advisor',
  'Outreach drafting and refinement',
  'Resume tailoring',
  'Daily morning briefing email',
]

function Check() {
  return <span className="text-emerald-500 shrink-0 mt-0.5 font-bold text-[13px]">&#10003;</span>
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-semibold bg-white text-slate-900 px-4 py-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-14">
          <h1 className="text-[38px] sm:text-[48px] font-bold text-slate-900 leading-tight tracking-tight">
            Pricing
          </h1>
          <p className="text-[16px] text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
            30-day free trial. No credit card required to start.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Intelligence */}
          <div className="border border-slate-200 rounded-lg p-8">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">
              Intelligence
            </p>
            <div className="mb-5">
              <span className="text-[44px] font-bold text-slate-900 leading-none">$49</span>
              <span className="text-[15px] text-slate-500 ml-1">/month</span>
            </div>
            <p className="text-[14px] text-slate-500 leading-relaxed mb-7">
              Stay ahead. Know what is happening at your target companies before the posting goes live.
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              {MONITOR_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-slate-700">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block text-center bg-slate-900 text-white text-[14px] font-semibold px-6 py-3 rounded hover:bg-slate-700 transition-colors"
            >
              Start free trial
            </Link>
          </div>

          {/* Search */}
          <div className="border-2 border-slate-900 rounded-lg p-8 relative">
            <span className="absolute top-4 right-4 text-[10px] font-bold tracking-[0.1em] uppercase bg-orange-500 text-white px-2.5 py-1 rounded">
              Most popular
            </span>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">
              Search
            </p>
            <div className="mb-5">
              <span className="text-[44px] font-bold text-slate-900 leading-none">$129</span>
              <span className="text-[15px] text-slate-500 ml-1">/month</span>
            </div>
            <p className="text-[14px] text-slate-500 leading-relaxed mb-7">
              The full search operating system. From pipeline to prep to outreach, in one place.
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              {ACTIVE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-slate-700">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block text-center bg-orange-500 text-white text-[14px] font-semibold px-6 py-3 rounded hover:bg-orange-600 transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>

        {/* Teams row */}
        <div className="border border-slate-200 rounded-lg px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className="text-[14px] font-semibold text-slate-900 mb-1">Teams and enterprise</p>
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-lg">
              Seat management, consolidated billing, and activation tracking for outplacement firms,
              relocation firms, and executive coaching practices.
            </p>
          </div>
          <Link
            href="/partners"
            className="shrink-0 text-[13px] font-semibold text-slate-900 border border-slate-300 hover:border-slate-600 px-5 py-2.5 rounded transition-colors"
          >
            Contact us
          </Link>
        </div>

        <p className="mt-10 text-center text-[13px] text-slate-400">
          All plans include a 30-day free trial. Cancel any time.{' '}
          Questions? <a href="mailto:support@startingmonday.app" className="text-slate-600 underline underline-offset-2">support@startingmonday.app</a>
        </p>
      </main>
    </div>
  )
}
