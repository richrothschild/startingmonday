'use client'
import Link from 'next/link'
import { useState } from 'react'

const PASSIVE_FEATURES = [
  'Pipeline tracking for up to 25 companies',
  'Company intelligence: news, 8-Ks, exec moves, funding, career pages',
  'Pattern alerts before roles are posted',
  'Weekly signal digest',
  'Contact tracker',
]

const ACTIVE_FEATURES = [
  'Everything in Passive',
  'AI Interview Prep Briefs',
  'Search Strategy Brief',
  'AI Chat advisor',
  'Outreach drafting',
  'Resume tailoring + quality check',
  'Daily morning briefing',
]

const EXECUTIVE_FEATURES = [
  'Everything in Active',
  'Unlimited company pipeline',
  'Career page scanning 2x daily',
  'Immediate pattern and exec departure alerts',
  'Opus AI for interview prep briefs',
  'Salary intelligence and negotiation scripts',
  'Recruiter tracker with firm grouping',
  'Priority contact flagging and CSV export',
]

const MO    = { passive: 49,   active: 199,  executive: 499,  concierge: 1299 }
const YR    = { passive: 490,  active: 1990, executive: 5000, concierge: 13999 }
const YR_MO = { passive: 41,   active: 166,  executive: 417,  concierge: 1167 }

type Tier = keyof typeof MO

export function PricingSection({ trialNote }: { trialNote: string }) {
  const [annual, setAnnual] = useState(false)

  function price(tier: Tier): string {
    return (annual ? YR_MO[tier] : MO[tier]).toLocaleString()
  }

  function subline(tier: Tier): string {
    return annual
      ? `$${YR[tier].toLocaleString()} billed annually`
      : `or $${YR[tier].toLocaleString()}/yr - 2 months free`
  }

  return (
    <section className="bg-white px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
      <div className="max-w-5xl mx-auto">
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
          What it costs
        </p>
        <h2 className="text-[22px] font-bold text-slate-900 mb-4 max-w-xl leading-snug">
          Infrastructure pricing. Campaign outcomes.
        </h2>
        <p className="text-[14px] text-slate-500 mb-8 max-w-2xl leading-relaxed">
          You run the campaign. We power it. All plans include a 30-day free trial, no credit card required.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center gap-1 mb-10 bg-slate-100 rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`text-[13px] font-semibold px-4 py-1.5 rounded-md transition-colors ${!annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`flex items-center gap-2 text-[13px] font-semibold px-4 py-1.5 rounded-md transition-colors ${annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Annual
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${annual ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              2 months free
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl">

          {/* Passive */}
          <div className="border border-slate-200 rounded-lg p-5 sm:p-6 flex flex-col">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2">Passive</p>
            <p className="text-[32px] font-bold text-slate-900 leading-none mb-1">
              ${price('passive')}<span className="text-[16px] font-normal text-slate-400">/mo</span>
            </p>
            <p className="text-[12px] text-slate-400 mb-0.5">30-day free trial. No credit card.</p>
            <p className="text-[12px] text-slate-500 mb-5">{subline('passive')}</p>
            <ul className="space-y-2.5">
              {PASSIVE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="text-slate-300 shrink-0 mt-0.5 text-[12px]">+</span>
                  <span className="text-[13px] text-slate-500 leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-4 text-[12px] text-slate-400 leading-relaxed">
              Most users move to Active once they see what prep briefs do before an interview.
            </p>
            <Link
              href="/signup"
              className="mt-4 inline-block w-full text-center border border-slate-200 text-slate-700 text-[13px] font-semibold px-5 py-2.5 rounded hover:border-slate-400 transition-colors"
            >
              Try free &rarr;
            </Link>
          </div>

          {/* Active */}
          <div className="border border-slate-900 rounded-lg p-5 sm:p-6 bg-slate-900 flex flex-col">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2">Active</p>
            <p className="text-[32px] font-bold text-white leading-none mb-1">
              ${price('active')}<span className="text-[16px] font-normal text-slate-500">/mo</span>
            </p>
            <p className="text-[12px] text-slate-500 mb-0.5">{trialNote}</p>
            <p className="text-[12px] text-slate-500 mb-5">{subline('active')}</p>
            <p className="text-[13px] text-slate-400 mb-4 leading-relaxed">Stop running a reactive search.</p>
            <ul className="space-y-2.5">
              {ACTIVE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="text-slate-600 shrink-0 mt-0.5 text-[12px]">+</span>
                  <span className="text-[13px] text-slate-300 leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-auto inline-block w-full text-center bg-orange-500 text-slate-900 text-[13px] font-bold px-5 py-2.5 rounded hover:bg-orange-600 transition-colors"
            >
              Start your campaign &rarr;
            </Link>
          </div>

          {/* Executive */}
          <div className="border-2 border-orange-500 rounded-lg p-5 sm:p-6 bg-white flex flex-col">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-600 mb-2">Executive</p>
            <p className="text-[32px] font-bold text-slate-900 leading-none mb-1">
              ${price('executive')}<span className="text-[16px] font-normal text-slate-400">/mo</span>
            </p>
            <p className="text-[12px] text-slate-400 mb-0.5">{trialNote}</p>
            <p className="text-[12px] text-slate-500 mb-5">{subline('executive')}</p>
            <ul className="space-y-2.5">
              {EXECUTIVE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="text-orange-500 shrink-0 mt-0.5 text-[12px]">+</span>
                  <span className="text-[13px] text-slate-700 leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-auto inline-block w-full text-center bg-orange-500 text-slate-900 text-[13px] font-bold px-5 py-2.5 rounded hover:bg-orange-600 transition-colors"
            >
              Start your campaign &rarr;
            </Link>
          </div>

        </div>

        {/* Concierge band */}
        <div className="mt-6 max-w-4xl border border-slate-200 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <p className="text-[13px] font-bold text-slate-900">Executive Concierge</p>
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">Waitlist open</span>
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-lg">
              Everything in Active, plus a monthly 45-minute strategy session. AI prepares the agenda from your live pipeline. Notes carry forward every call.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[22px] font-bold text-slate-900 leading-none mb-0.5">
              ${price('concierge')}<span className="text-[13px] font-normal text-slate-400">/mo</span>
            </p>
            <p className="text-[11px] text-slate-400 mb-3">{subline('concierge')}</p>
            <Link
              href="/concierge"
              className="inline-block text-[13px] font-semibold text-orange-600 border border-orange-200 bg-orange-50 px-5 py-2 rounded hover:bg-orange-100 transition-colors"
            >
              Join the waitlist &rarr;
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
