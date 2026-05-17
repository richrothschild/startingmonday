import type { Metadata } from 'next'
import Link from 'next/link'
import { CoachPreviewActions } from '../coach-preview-actions'

export const metadata: Metadata = {
  title: 'Coach Pricing and Economics | Starting Monday',
  description: 'Client pricing, partner economics, and preview structure for executive coaches evaluating Starting Monday.',
  alternates: { canonical: 'https://startingmonday.app/for-coaches/economics' },
}

const CLIENT_PLANS = [
  {
    name: 'Monitor',
    price: '$49/mo',
    fit: 'Executives who want structured signal monitoring and pipeline discipline before the search turns urgent.',
  },
  {
    name: 'Active',
    price: '$199/mo',
    fit: 'Executives in active search who need daily signal action, prep briefs, and stronger relationship follow-through.',
  },
  {
    name: 'Executive',
    price: '$499/mo',
    fit: 'High-stakes C-suite searches where preparation depth and right-role calibration are critical.',
  },
]

const ECONOMICS = [
  '20% recurring commission on paid client subscriptions referred through the coach partner link.',
  'No enrollment fee and no minimum volume for referral partners.',
  'Preferred-partner options available for coaches or firms enrolling multiple clients.',
  'Client plans still start with a 30-day free trial and no credit card.',
]

export default function CoachEconomicsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <Link href="/for-coaches" className="text-[13px] text-slate-400 hover:text-white transition-colors">
            Back to coach preview
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <header className="mb-12">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
            Coach pricing and partner economics
          </p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-4">
            The details, one click deeper.
          </h1>
          <p className="text-[15px] text-slate-600 leading-relaxed max-w-2xl">
            This page is for coaches who already understand the workflow and want to know how trials, client plans, and partner economics work in practice.
          </p>
        </header>

        <section className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 sm:p-7 mb-10">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-700 mb-3">
            Preview structure
          </p>
          <div className="space-y-3 text-[14px] text-slate-700 leading-relaxed">
            <p>Start with free coach access, two to three client preview seats, one sample brief walkthrough, and one short feedback session.</p>
            <p>After the preview, coaches can either keep recommending the standard client plans or discuss preferred-partner rollout if they are enrolling multiple clients.</p>
          </div>
        </section>

        <section className="mb-10">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-5">
            Client pricing
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CLIENT_PLANS.map((plan) => (
              <div key={plan.name} className="border border-slate-200 rounded-2xl p-5 bg-white">
                <p className="text-[16px] font-semibold text-slate-900 mb-1">{plan.name}</p>
                <p className="text-[20px] font-bold text-orange-600 mb-3">{plan.price}</p>
                <p className="text-[14px] text-slate-600 leading-relaxed">{plan.fit}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-slate-500 mt-4">
            All client plans start with a 30-day free trial and no credit card. The coach preview exists to make the referral decision low-risk before a broader rollout.
          </p>
        </section>

        <section className="mb-10">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-5">
            Partner economics
          </p>
          <div className="border border-slate-200 rounded-2xl p-6 bg-white">
            <ul className="space-y-3 mb-5">
              {ECONOMICS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[14px] text-slate-700 leading-relaxed">
                  <span className="text-orange-500 shrink-0 mt-0.5">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-4">
              <p className="text-[12px] font-semibold text-slate-900 mb-1">Illustrative example</p>
              <p className="text-[14px] text-slate-700 leading-relaxed">10 active client referrals on Active at $199/mo is about $398/mo in recurring partner revenue while those clients keep a structured execution layer between sessions.</p>
            </div>
          </div>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-3">
            Keep the trust boundary clear
          </p>
          <div className="space-y-3 text-[14px] text-slate-600 leading-relaxed">
            <p>Lead with client readiness and workflow fit, not commissions. Economics should support the relationship, not define it.</p>
            <p>The simplest framing: if this makes coaching more effective and gives clients better between-session discipline, there is also a partner model available.</p>
          </div>
        </section>

        <section className="border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">
            Next step
          </p>
          <p className="text-[14px] text-slate-600 leading-relaxed mb-5">
            If the economics look reasonable, go back to the coach preview and request the live walkthrough. That keeps the evaluation anchored in workflow quality, not theory.
          </p>
          <CoachPreviewActions />
          <div className="flex flex-wrap gap-4 mt-5 text-[13px]">
            <Link href="/for-coaches/faq" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Read the coach FAQ
            </Link>
            <Link href="/for-coaches" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Return to the coach preview
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
