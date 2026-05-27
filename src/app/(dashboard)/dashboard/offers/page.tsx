import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OfferSynthesis } from './offer-synthesis'

export const metadata = { title: 'Offers - Starting Monday' }

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

type OfferCompany = {
  id: string
  name: string
  sector: string | null
  fit_score: number | null
  offer_role_title: string | null
  offer_base: number | null
  offer_bonus_pct: number | null
  offer_signing: number | null
  offer_equity: string | null
  offer_notes: string | null
  offer_decision_factors: string | null
}

export default async function OffersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: raw } = await supabase
    .from('companies')
    .select('id, name, sector, fit_score, offer_role_title, offer_base, offer_bonus_pct, offer_signing, offer_equity, offer_notes, offer_decision_factors')
    .eq('user_id', user.id)
    .eq('stage', 'offer')
    .is('archived_at', null)
    .order('fit_score', { ascending: false, nullsFirst: false })

  const offers = (raw ?? []) as unknown as OfferCompany[]

  const ROWS = [
    { label: 'Role',         render: (o: OfferCompany) => o.offer_role_title ?? <span className="text-slate-300">-</span> },
    { label: 'Base',         render: (o: OfferCompany) => o.offer_base ? fmt(o.offer_base) : <span className="text-slate-300">-</span> },
    { label: 'Bonus',        render: (o: OfferCompany) => {
      if (!o.offer_bonus_pct) return <span className="text-slate-300">-</span>
      const est = o.offer_base ? ` (${fmt(Math.round(o.offer_base * o.offer_bonus_pct / 100))})` : ''
      return `${o.offer_bonus_pct}%${est}`
    }},
    { label: 'Signing',      render: (o: OfferCompany) => o.offer_signing ? fmt(o.offer_signing) : <span className="text-slate-300">-</span> },
    { label: 'Equity',       render: (o: OfferCompany) => o.offer_equity ?? <span className="text-slate-300">-</span> },
    { label: 'Total cash',   render: (o: OfferCompany) => {
      if (!o.offer_base) return <span className="text-slate-300">-</span>
      const bonus = o.offer_bonus_pct ? Math.round(o.offer_base * o.offer_bonus_pct / 100) : 0
      return <span className="font-bold text-green-700">{fmt(o.offer_base + bonus)}</span>
    }},
    { label: 'Fit score',    render: (o: OfferCompany) => o.fit_score != null ? o.fit_score : <span className="text-slate-300">-</span> },
    { label: 'Notes',        render: (o: OfferCompany) => o.offer_notes
      ? <span className="text-[12px] text-slate-500 leading-relaxed">{o.offer_notes}</span>
      : <span className="text-slate-300">-</span>
    },
    { label: 'Factors',      render: (o: OfferCompany) => o.offer_decision_factors
      ? <span className="text-[12px] text-slate-500 leading-relaxed">{o.offer_decision_factors}</span>
      : <span className="text-slate-300">-</span>
    },
  ]

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <section className="mb-6 border border-slate-200 rounded-lg bg-slate-50 px-4 py-3">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-1">Quick navigation</h2>
          <p className="text-[12px] text-slate-600 leading-relaxed">Use the section headers on this page to scan fast and jump to what matters first.</p>
        </section>
        <details className="mb-6 border border-slate-200 rounded-lg bg-white px-4 py-3">
          <summary className="cursor-pointer text-[12px] font-semibold text-slate-800">TL;DR</summary>
          <p className="mt-2 text-[12px] text-slate-600 leading-relaxed">This page is organized for quick scanning. Start with the first major section, then use headings to move directly to the next action.</p>
        </details>
<div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Offers in Flight</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">
            {offers.length === 0
              ? 'No offers yet. Move a company to the Offer stage to start tracking.'
              : `${offers.length} offer${offers.length !== 1 ? 's' : ''} - compare compensation, fit, and negotiate.`}
          </p>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded p-16 text-center">
            <p className="text-[14px] text-slate-400 mb-4">No companies at the Offer stage.</p>
            <Link
              href="/dashboard/briefing"
              className="text-[13px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded transition-colors"
            >
              Open daily briefing →
            </Link>
          </div>
        ) : offers.length === 1 ? (
          // Single offer: vertical card layout
          <div className="bg-white border border-green-200 rounded overflow-hidden">
            <div className="px-6 py-[18px] border-b border-green-100 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-slate-900">{offers[0].name}</h2>
                {offers[0].sector && <p className="text-[12px] text-slate-400 mt-0.5">{offers[0].sector}</p>}
              </div>
              <div className="flex items-center gap-3">
                {offers[0].offer_role_title && (
                  <a
                    href={`/dashboard/salary?company=${encodeURIComponent(offers[0].name)}&role=${encodeURIComponent(offers[0].offer_role_title)}`}
                    className="text-[12px] font-semibold text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded transition-colors"
                  >
                    Get negotiation script →
                  </a>
                )}
                <Link
                  href={`/dashboard/companies/${offers[0].id}`}
                  className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded transition-colors"
                >
                  View company →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {ROWS.map(row => {
                const val = row.render(offers[0])
                return (
                  <div key={row.label} className="px-6 py-4 flex items-start gap-6">
                    <span className="text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 w-24 shrink-0 pt-0.5">{row.label}</span>
                    <span className="text-[14px] text-slate-800 flex-1">{val}</span>
                  </div>
                )
              })}
            </div>
            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50">
              <p className="text-[12px] text-slate-400">
                Add offer details on the{' '}
                <Link href={`/dashboard/companies/${offers[0].id}`} className="text-slate-600 underline hover:text-slate-900">
                  company page
                </Link>
                {' '}to unlock total cash calculation and the negotiation script.
              </p>
            </div>
          </div>
        ) : (
          // Multiple offers: comparison table
          <div className="bg-white border border-green-200 rounded overflow-hidden">
            <div className="px-6 py-[18px] border-b border-green-100">
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-green-700">Side-by-side comparison</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th scope="col" className="py-3 pl-6 pr-4 text-left text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 w-28">
                      Field
                    </th>
                    {offers.map(o => (
                      <th key={o.id} className="py-3 px-4 text-left">
                        <Link href={`/dashboard/companies/${o.id}`} className="text-[14px] font-bold text-slate-900 hover:text-slate-600 block">
                          {o.name}
                        </Link>
                        {o.sector && <p className="text-[11px] text-slate-400 font-normal mt-0.5">{o.sector}</p>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(row => (
                    <tr key={row.label} className="border-b border-slate-50">
                      <td className="py-3.5 pl-6 pr-4 text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 align-top">
                        {row.label}
                      </td>
                      {offers.map(o => (
                        <td key={o.id} className="py-3.5 px-4 text-[14px] text-slate-800 align-top">
                          {row.render(o)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="py-4 pl-6 pr-4" />
                    {offers.map(o => (
                      <td key={o.id} className="py-4 px-4">
                        <div className="flex flex-col gap-2">
                          {o.offer_role_title && (
                            <a
                              href={`/dashboard/salary?company=${encodeURIComponent(o.name)}&role=${encodeURIComponent(o.offer_role_title)}`}
                              className="text-[11px] font-semibold text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded transition-colors inline-block"
                            >
                              Negotiate →
                            </a>
                          )}
                          <Link
                            href={`/dashboard/companies/${o.id}`}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded transition-colors inline-block"
                          >
                            Details →
                          </Link>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {offers.length > 0 && <OfferSynthesis offers={offers} />}
      </main>
    </div>
  )
}
