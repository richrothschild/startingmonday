import type { Metadata } from 'next'
import Link from 'next/link'
import { EmiMarketingTelemetry } from '@/components/EmiMarketingTelemetry'
import { PricingCardsClient } from './pricing-cards-client'

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
              href="/signup?from=pricing"
              data-emi-cta="pricing_nav_get_started"
              data-emi-to="/signup?from=pricing"
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
            30-day free trial. No credit card. Choose based on search intensity, not job-board volume.
          </p>
        </div>

        <section className="mb-10 border border-slate-200 rounded-lg p-6 sm:p-7 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-4">Why this model</p>
          <p className="text-[13px] text-slate-600 leading-relaxed max-w-2xl">
            Pay for earlier intelligence, better weekly execution, and higher-quality conversations before searches are public.
          </p>
        </section>

        <PricingCardsClient />

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
