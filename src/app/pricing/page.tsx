import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingCards } from './pricing-cards'

export const metadata: Metadata = {
  title: 'Pricing — Starting Monday',
  description: 'Simple pricing for senior executive job searches. Passive at $49/mo, Active at $199/mo, Executive at $499/mo. Concierge available by application.',
  alternates: { canonical: 'https://startingmonday.app/pricing' },
  openGraph: {
    title: 'Pricing — Starting Monday',
    description: 'Simple pricing for senior executive job searches.',
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
            30-day free trial. No credit card required to start.
          </p>
        </div>

        <PricingCards />

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
