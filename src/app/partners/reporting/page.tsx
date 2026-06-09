import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Partner Reporting Packet - Starting Monday',
  description: 'Partner reporting template, renewal packet structure, and first issued monthly report artifact.',
  alternates: { canonical: 'https://startingmonday.app/partners/reporting' },
}

const REPORTING_TEMPLATE = [
  'Partner summary and account scope',
  'KPI performance snapshot with trend notes',
  'Execution quality findings and coaching actions',
  'Risk flags, stalled campaigns, and recommended interventions',
  'Next-month commitments and owner map',
]

const RENEWAL_PACKET = [
  'Contract period performance narrative and cohort outcomes',
  'KPI trend appendix with source notes',
  'Program-level wins, losses, and confidence statement',
  'Renewal options with plan economics and support levels',
  'Decision checklist and timeline',
]

export default function PartnerReportingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <Link href="/partners" className="text-[13px] text-slate-400 hover:text-white transition-colors">Back to partners</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-18">
        <header className="mb-9">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-orange-500 mb-3">Partner operations</p>
          <h1 className="text-[34px] sm:text-[42px] font-bold text-slate-900 leading-tight mb-4">Partner reporting and renewal packet</h1>
          <p className="text-[15px] text-slate-600 leading-relaxed max-w-3xl">
            Standardized structure for monthly partner reporting, renewal decision support, and issued reporting artifacts.
          </p>
        </header>

        <section className="mb-8 border border-slate-200 rounded-lg p-5 sm:p-6 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Monthly partner report template</p>
          <ul className="space-y-2">
            {REPORTING_TEMPLATE.map((item) => (
              <li key={item} className="text-[13px] text-slate-700">- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8 border border-slate-200 rounded-lg p-5 sm:p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Renewal decision packet template</p>
          <ul className="space-y-2">
            {RENEWAL_PACKET.map((item) => (
              <li key={item} className="text-[13px] text-slate-700">- {item}</li>
            ))}
          </ul>
        </section>

        <section className="border border-emerald-200 rounded-lg p-5 sm:p-6 bg-emerald-50">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-emerald-700 mb-2">First issued report</p>
          <h2 className="text-[18px] font-bold text-slate-900 mb-2">Pilot partner monthly report issued for June 2026</h2>
          <p className="text-[13px] text-slate-700 leading-relaxed">
            Initial packet includes performance summary, KPI trends, stalled campaign analysis, intervention plan, and renewal recommendation framing.
          </p>
        </section>
      </main>
    </div>
  )
}
