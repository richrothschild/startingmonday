import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingCards } from './pricing-cards'

export const metadata: Metadata = {
  title: 'Pricing - Starting Monday for C-suite searches',
  description: 'Simple pricing for C-suite executive searches. Monitor at $49/mo, Active at $199/mo, Executive at $499/mo. Concierge available by application.',
  alternates: { canonical: 'https://startingmonday.app/pricing' },
  openGraph: {
    title: 'Pricing - Starting Monday for C-suite searches',
    description: 'Simple pricing for C-suite executive searches.',
    url: 'https://startingmonday.app/pricing',
  },
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
        <div className="text-center mb-10">
          <h1 className="text-[38px] sm:text-[48px] font-bold text-slate-900 leading-tight tracking-tight">
            Pricing
          </h1>
          <p className="text-[16px] text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
            30-day free trial. No credit card required to start. Built for C-suite searches.
          </p>
        </div>

        <PricingCards />

        <section className="mt-14 mb-12">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4 text-center">
            Which tier should I pick?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                tier: 'Monitor — $49/mo',
                who: 'Best for executives who are not in active search yet but want to track target companies quietly.',
              },
              {
                tier: 'Active — $199/mo',
                who: 'Best for VP and C-suite executives in an active campaign who need prep briefs, daily signals, and pipeline control.',
              },
              {
                tier: 'Executive — $499/mo',
                who: 'Best for high-stakes C-suite searches where you need full-depth intelligence, faster alerts, and unlimited coverage.',
              },
            ].map(item => (
              <div key={item.tier} className="border border-slate-200 rounded-lg p-5 bg-white">
                <p className="text-[13px] font-semibold text-slate-900 mb-2">{item.tier}</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">{item.who}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-slate-400 mt-4 text-center">
            Role guidance reflects common usage patterns from active campaigns, not hard eligibility rules.
          </p>
        </section>

        <section className="mb-12 border border-slate-200 rounded-lg p-6 sm:p-7 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            What outcomes to expect
          </p>
          <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
            <p><span className="font-semibold text-slate-900">Monitor:</span> passive monitoring with early signal visibility so opportunities do not surprise you.</p>
            <p><span className="font-semibold text-slate-900">Active:</span> a daily operating rhythm for active search, including prep and pipeline follow-through.</p>
            <p><span className="font-semibold text-slate-900">Executive:</span> full-depth coverage and speed for candidates optimizing every high-value conversation.</p>
          </div>
          <p className="text-[12px] text-slate-400 mt-4">
            Outcomes depend on sector, role scope, and campaign consistency. These are directional expectations, not guaranteed placement results.
          </p>
        </section>

        <section className="mb-12">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4 text-center">
            Why this over alternatives
          </p>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-900">Option</th>
                  <th className="px-4 py-3 font-semibold text-slate-900">Best for</th>
                  <th className="px-4 py-3 font-semibold text-slate-900">Limitation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {
                    option: 'Starting Monday',
                    best: 'Signal intelligence + prep + pipeline in one system for senior searches.',
                    limit: 'Requires disciplined weekly usage to compound results.',
                  },
                  {
                    option: 'LinkedIn Premium',
                    best: 'Broad candidate browsing and job board access.',
                    limit: 'Usually late in the cycle for senior executive searches.',
                  },
                  {
                    option: 'DIY spreadsheets',
                    best: 'Custom tracking with no software cost.',
                    limit: 'Manual, inconsistent, and easy to stall under load.',
                  },
                  {
                    option: 'Executive coaching only',
                    best: 'Narrative and interview strategy guidance.',
                    limit: 'Does not provide daily market monitoring infrastructure.',
                  },
                ].map(row => (
                  <tr key={row.option} className="bg-white">
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.option}</td>
                    <td className="px-4 py-3 text-slate-600">{row.best}</td>
                    <td className="px-4 py-3 text-slate-600">{row.limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

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

        <section className="mt-12 border-t border-slate-100 pt-10">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4 text-center">Pricing FAQ</p>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Can I upgrade or downgrade later?',
                a: 'Yes. You can move between plans at any time as your search intensity changes.',
              },
              {
                q: 'What if I pick the wrong tier to start?',
                a: 'Start where you are now. Most executives begin on Monitor or Active, then upgrade when the campaign becomes urgent.',
              },
              {
                q: 'Is there a long-term contract?',
                a: 'No. All plans start with a 30-day free trial and can be canceled at any time.',
              },
            ].map(item => (
              <div key={item.q} className="border border-slate-200 rounded-lg p-5">
                <p className="text-[13px] font-semibold text-slate-900 mb-1.5">{item.q}</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-[13px] text-slate-400">
          All plans include a 30-day free trial. Cancel any time.{' '}
          Questions? <a href="mailto:support@startingmonday.app" className="text-slate-600 underline underline-offset-2">support@startingmonday.app</a>
        </p>
      </main>
    </div>
  )
}
