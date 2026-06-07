import type { Metadata } from 'next'
import Link from 'next/link'
import { ManagerToolsSignupLink, ManagerToolsTrackingBeacon } from './manager-tools-tracking'

export const metadata: Metadata = {
  title: 'Starting Monday for the Manager Tools Community',
  description: 'Built for executives who manage their search with discipline. Manager Tools community members get 30 days free with no credit card and no employer visibility.',
  alternates: { canonical: 'https://startingmonday.app/managertools' },
  openGraph: {
    title: 'Starting Monday for the Manager Tools Community',
    description: 'A focused executive search operating system for timing, narrative, and follow-through.',
    url: 'https://startingmonday.app/managertools',
    type: 'website',
  },
}

const SIGNUP_URL = '/signup?utm_source=managertools&utm_medium=newsletter&utm_campaign=horstman-june2026'

export default function ManagerToolsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <ManagerToolsTrackingBeacon />
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:opacity-80 transition-opacity" aria-label="Go to homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/login" className="text-[13px] text-slate-300 hover:text-white transition-colors">Log in</Link>
            <ManagerToolsSignupLink href={SIGNUP_URL} location="nav" className="inline-flex items-center justify-center bg-orange-500 text-slate-900 text-[13px] font-bold px-3.5 py-1.5 rounded hover:bg-orange-600 transition-colors">
              Start free trial
            </ManagerToolsSignupLink>
          </div>
        </div>
      </nav>

      <main>
        <section className="bg-slate-900 px-4 sm:px-6 pt-16 sm:pt-20 pb-16 sm:pb-20">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-300 mb-3">Manager Tools Community</p>
            <h1 className="text-white text-[2rem] sm:text-[2.3rem] lg:text-[2.8rem] font-bold leading-[1.08] tracking-tight mb-4 max-w-4xl">
              Built for executives who manage their search with discipline.
            </h1>
            <p className="text-slate-200 text-[16px] sm:text-[17px] leading-relaxed max-w-3xl mb-8">
              Starting Monday members from the Manager Tools community get 30 days free. No credit card. No employer visibility.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-orange-300 mb-2">Clarity</p>
                <p className="text-[13px] text-slate-300 leading-relaxed">Know which companies to prioritize before opportunities become obvious.</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-orange-300 mb-2">Timing</p>
                <p className="text-[13px] text-slate-300 leading-relaxed">Act earlier with signal context instead of reacting after the posting is public.</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-orange-300 mb-2">Follow-through</p>
                <p className="text-[13px] text-slate-300 leading-relaxed">Run a weekly operating cadence so relationships and prep compound.</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4 sm:p-5 mb-8">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">Opportunity Timing Gap</p>
              <div className="overflow-x-auto pb-1">
                <svg viewBox="0 0 520 252" className="w-[680px] max-w-none h-[236px] sm:w-full sm:max-w-full sm:h-[246px]" role="img" aria-label="Opportunity timing gap chart preview">
                  <rect x="0" y="0" width="520" height="252" rx="10" fill="#0b1428" />

                  <line x1="34" y1="138" x2="490" y2="138" stroke="#334155" strokeWidth="2.5" />
                  <circle cx="44" cy="138" r="4.5" fill="#64748b" />
                  <circle cx="116" cy="138" r="4.5" fill="#64748b" />
                  <circle cx="188" cy="138" r="4.5" fill="#64748b" />
                  <circle cx="260" cy="138" r="4.5" fill="#64748b" />
                  <circle cx="332" cy="138" r="4.5" fill="#64748b" />
                  <circle cx="404" cy="138" r="4.5" fill="#64748b" />
                  <circle cx="476" cy="138" r="4.5" fill="#64748b" />

                  <text x="24" y="168" fill="#cbd5e1" fontSize="13">Signal</text>
                  <text x="94" y="182" fill="#cbd5e1" fontSize="13">Shape</text>
                  <text x="160" y="168" fill="#cbd5e1" fontSize="13">Outreach</text>
                  <text x="242" y="182" fill="#cbd5e1" fontSize="13">Open</text>
                  <text x="302" y="168" fill="#cbd5e1" fontSize="13">Interviews</text>
                  <text x="384" y="182" fill="#cbd5e1" fontSize="13">Selection</text>
                  <text x="450" y="168" fill="#cbd5e1" fontSize="13">Start</text>

                  <text x="70" y="30" fill="#86efac" fontSize="14" fontWeight="700">Starting Monday enters here</text>
                  <line x1="116" y1="42" x2="116" y2="122" stroke="#22c55e" strokeWidth="4" />
                  <polygon points="116,133.5 109,121.5 123,121.5" fill="#22c55e" />

                  <text x="206" y="50" fill="#fdba74" fontSize="14" fontWeight="700">Typical candidates enter here</text>
                  <line x1="260" y1="60" x2="260" y2="122" stroke="#f97316" strokeWidth="4" />
                  <polygon points="260,133.5 253,121.5 267,121.5" fill="#f97316" />

                  <text x="16" y="228" fill="#cbd5e1" fontSize="14" fontWeight="700">Entering before the role opens materially improves shortlist odds.</text>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
                <p className="text-[22px] font-bold text-emerald-300 leading-none mb-1">81%</p>
                <p className="text-[12px] text-slate-300">Reached first interview in 30 days</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
                <p className="text-[22px] font-bold text-emerald-300 leading-none mb-1">27</p>
                <p className="text-[12px] text-slate-300">Pilot executives in Jan-May 2026 cohort</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
                <p className="text-[22px] font-bold text-emerald-300 leading-none mb-1">9 days</p>
                <p className="text-[12px] text-slate-300">Median time to first qualified outreach</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <ManagerToolsSignupLink
                href={SIGNUP_URL}
                location="hero"
                className="inline-flex items-center justify-center bg-orange-500 text-slate-900 text-[15px] font-bold px-6 py-3 rounded hover:bg-orange-600 transition-colors"
              >
                Start your free 30-day trial {'->'}
              </ManagerToolsSignupLink>
              <p className="text-[13px] text-slate-300">Your search stays private. We never share your identity, targets, or activity.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
