'use client'

import { useEffect, useMemo, useState } from 'react'

type MonthlyRow = {
  month_start: string
  total_outcomes: number
  advanced_count: number
  offer_count: number
  rejected_count: number
  advance_rate_pct: number
  offer_rate_pct: number
}

export function PrepEfficacyClient() {
  const [rows, setRows] = useState<MonthlyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/reports/prep-efficacy/monthly?months=6', { cache: 'no-store' })
        const payload = await res.json().catch(() => ({})) as { rows?: MonthlyRow[]; error?: string }
        if (!res.ok) {
          if (!active) return
          setError(payload.error ?? `Request failed (${res.status})`)
          return
        }
        if (!active) return
        setRows(Array.isArray(payload.rows) ? payload.rows : [])
      } catch {
        if (!active) return
        setError('Failed to load prep efficacy report.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => { active = false }
  }, [])

  const summary = useMemo(() => {
    if (rows.length === 0) return null
    const total = rows.reduce((sum, row) => sum + row.total_outcomes, 0)
    const offers = rows.reduce((sum, row) => sum + row.offer_count, 0)
    const advanced = rows.reduce((sum, row) => sum + row.advanced_count, 0)
    const offerRate = total > 0 ? Math.round((offers / total) * 1000) / 10 : 0
    const advanceRate = total > 0 ? Math.round((advanced / total) * 1000) / 10 : 0
    return { total, offers, advanced, offerRate, advanceRate }
  }, [rows])

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded p-6">
        <p className="text-[13px] text-slate-500">Loading monthly efficacy...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-6">
        <p className="text-[13px] text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Outcomes (6m)" value={summary.total} />
          <Stat label="Advanced" value={summary.advanced} />
          <Stat label="Offers" value={summary.offers} />
          <Stat label="Offer rate" value={`${summary.offerRate}%`} />
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-[12px] font-bold tracking-[0.12em] uppercase text-slate-500">Monthly rollup</p>
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-4 text-[13px] text-slate-500">No prep outcomes recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Month</th>
                  <th className="px-4 py-2 text-right font-semibold">Total</th>
                  <th className="px-4 py-2 text-right font-semibold">Advanced</th>
                  <th className="px-4 py-2 text-right font-semibold">Offers</th>
                  <th className="px-4 py-2 text-right font-semibold">Rejected</th>
                  <th className="px-4 py-2 text-right font-semibold">Advance rate</th>
                  <th className="px-4 py-2 text-right font-semibold">Offer rate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.month_start} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 text-slate-700">
                      {new Date(`${row.month_start}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-900 font-semibold">{row.total_outcomes}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{row.advanced_count}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{row.offer_count}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{row.rejected_count}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{row.advance_rate_pct}%</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{row.offer_rate_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-[22px] font-bold text-slate-900 leading-none">{value}</p>
    </div>
  )
}
