import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingCards } from './pricing-cards'
import { EmiMarketingTelemetry } from '@/components/EmiMarketingTelemetry'

export const metadata: Metadata = {
  title: 'Pricing - Starting Monday for C-suite searches',
  description: 'Simple pricing for C-suite executive searches. Improve campaign behavior, relationship quality, and right-role decisions with Intelligence ($49), Active ($199), or Executive ($499).',
  alternates: { canonical: 'https://startingmonday.app/pricing' },
  openGraph: {
    title: 'Pricing - Starting Monday for C-suite searches',
    description: 'Simple pricing for C-suite executive searches focused on behavior, relationships, and right-role outcomes.',
    url: 'https://startingmonday.app/pricing',
  },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <EmiMarketingTelemetry pageSlug="/pricing" personaSegment="executives" />
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
              data-emi-cta="pricing_nav_get_started"
              data-emi-to="/signup"
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
            30-day free trial. No credit card required to start. EMI pricing is built around one outcome: better executive decisions before the formal search window appears.
          </p>
        </div>

        <section className="mb-10 border border-slate-200 rounded-lg p-6 sm:p-7 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-4">Why this pricing model exists</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <p className="font-semibold text-slate-900 mb-1">Category default</p>
              <p className="text-slate-600 leading-relaxed">Pay for more applications and visibility after a role is posted.</p>
            </div>
            <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/40">
              <p className="font-semibold text-slate-900 mb-1">EMI model</p>
              <p className="text-slate-700 leading-relaxed">Pay for earlier intelligence, better weekly execution, and higher-quality conversations before searches are public.</p>
            </div>
          </div>
          <p className="text-[12px] text-slate-500 mt-4">Decision rule: pick the tier that matches campaign intensity, not job-board volume.</p>
        </section>

        <section className="mb-10 border border-slate-200 rounded-lg p-6 sm:p-7 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">First 7 days by tier</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="font-semibold text-slate-900 mb-2">Intelligence</p>
              <p className="text-slate-600">Day 1 target map. Day 3 first signals. Day 7 first weekly rhythm review.</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="font-semibold text-slate-900 mb-2">Active</p>
              <p className="text-slate-600">Day 1 outreach queue. Day 3 signal-led contact move. Day 7 cadence quality audit.</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="font-semibold text-slate-900 mb-2">Executive</p>
              <p className="text-slate-600">Day 1 role thesis. Day 3 objection map. Day 7 prep depth and fit checkpoint.</p>
            </div>
          </div>
        </section>

        <section className="mb-10 border border-slate-200 rounded-lg p-6 sm:p-7 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">Before you decide</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <details data-emi-objection="pricing_too_early" className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <summary className="list-none cursor-pointer text-[13px] font-semibold text-slate-900">"It may be too early for me."</summary>
              <p className="text-[12px] text-slate-600 leading-relaxed mt-2">Start on Intelligence. EMI is designed for optionality before urgency, not just active-search pressure.</p>
            </details>
            <details data-emi-objection="pricing_already_have_recruiter" className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <summary className="list-none cursor-pointer text-[13px] font-semibold text-slate-900">"I already have a recruiter."</summary>
              <p className="text-[12px] text-slate-600 leading-relaxed mt-2">Recruiters work formal cycles. EMI improves your context and timing before that cycle starts.</p>
            </details>
            <details data-emi-objection="pricing_confidentiality" className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <summary className="list-none cursor-pointer text-[13px] font-semibold text-slate-900">"I need this to stay private."</summary>
              <p className="text-[12px] text-slate-600 leading-relaxed mt-2">Private by default. No employer visibility and no sale of your activity data.</p>
            </details>
          </div>
        </section>

        <PricingCards />

        <section className="mt-14 mb-12">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4 text-center">
            Which tier should I pick?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                tier: 'Intelligence — $49/mo',
                who: 'Best for executives who are not in active search yet but want to build disciplined market awareness before urgency hits.',
              },
              {
                tier: 'Active — $199/mo',
                who: 'Best for VP and C-suite executives in active search who need better outreach behavior, stronger relationship cadence, and tighter execution.',
              },
              {
                tier: 'Executive — $499/mo',
                who: 'Best for high-stakes C-suite searches where right-role fit is critical and every high-value conversation must be prepared at depth.',
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
            <p><span className="font-semibold text-slate-900">Intelligence:</span> stronger search behavior before urgency: earlier signal visibility and cleaner target focus.</p>
            <p><span className="font-semibold text-slate-900">Active:</span> better weekly execution: sharper outreach, stronger relationship follow-through, and consistent pipeline momentum.</p>
            <p><span className="font-semibold text-slate-900">Executive:</span> right-role optimization: full-depth context and preparation for the conversations that determine final fit.</p>
          </div>
          <p className="text-[12px] text-slate-400 mt-4">
            Outcomes depend on sector, role scope, and campaign consistency. These are directional expectations, not guaranteed placement results.
          </p>
        </section>

        <section className="mb-12 border border-slate-200 rounded-lg p-6 sm:p-7 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Before you choose a tier
          </p>
          <div className="space-y-2">
            <Link href="/blog/executive-hiring-patterns-2026" className="block text-[13px] text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              We Analyzed 300+ Executive Hiring Profiles. Here Is What Actually Gets Senior Leaders Interviewed.
            </Link>
            <Link href="/blog/why-executive-recruiters-go-quiet" className="block text-[13px] text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Why Executive Recruiters Go Quiet (And How Senior Candidates Can Break the Pattern)
            </Link>
            <Link href="/blog/why-starting-monday-exists" className="block text-[13px] text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Why Starting Monday Exists: Executive Search Is Not a Resume Problem
            </Link>
          </div>
        </section>

        <section data-emi-proof="pricing_pilot_snapshot" className="mb-12 border border-emerald-200 rounded-lg p-6 sm:p-7 bg-emerald-50/40">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-700 mb-4">
            Pilot evidence snapshot
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-white border border-emerald-100 rounded-lg p-4">
              <p className="text-[24px] font-bold text-emerald-700 leading-none mb-1">81%</p>
              <p className="text-[13px] text-slate-700">Reached first interview inside 30 days</p>
            </div>
            <div className="bg-white border border-emerald-100 rounded-lg p-4">
              <p className="text-[24px] font-bold text-emerald-700 leading-none mb-1">27</p>
              <p className="text-[13px] text-slate-700">Pilot executives in Jan-May 2026 cohort</p>
            </div>
            <div className="bg-white border border-emerald-100 rounded-lg p-4">
              <p className="text-[24px] font-bold text-emerald-700 leading-none mb-1">9 days</p>
              <p className="text-[13px] text-slate-700">Median time to first qualified outreach from setup</p>
            </div>
          </div>
          <p className="text-[12px] text-slate-500">
            Methods: cohort includes users who completed onboarding and launched at least one tracked outreach between Jan-May 2026. Results vary by market conditions and campaign quality.
          </p>
          <p className="text-[12px] text-slate-500 mt-2">
            Source path: docs/strategy/emi-sprints/artifacts/production-exports/emi-production-query-results-2026-05-29.json. Freshness: 2026-05-25 snapshot, Jan-May 2026 cohort window.
          </p>
          <p className="text-[12px] text-slate-500 mt-2">
            See full claim mapping in{' '}
            <Link href="/references" className="underline hover:text-slate-700 transition-colors">
              Evidence and References
            </Link>
            .
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
              data-emi-cta="pricing_contact_enterprise"
              data-emi-to="/partners"
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
                a: 'Start where you are now. Most executives begin on Intelligence or Active, then upgrade when the campaign becomes urgent.',
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
          Questions? <a data-emi-cta="pricing_support_email" data-emi-to="mailto:support@startingmonday.app" href="mailto:support@startingmonday.app" className="text-slate-600 underline underline-offset-2">support@startingmonday.app</a>
        </p>
      </main>
    </div>
  )
}
