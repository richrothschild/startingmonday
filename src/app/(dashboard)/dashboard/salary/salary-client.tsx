'use client'
import { useState } from 'react'

type PushbackItem = { objection: string; response: string }

type SalaryResult = {
  low: number
  target: number
  ceiling: number
  currency: string
  notes: string
  negotiation_script: string
  pushback_responses: PushbackItem[]
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function SalaryIntelClient({ defaultCompany, defaultRole }: { defaultCompany: string; defaultRole: string }) {
  const [role, setRole]         = useState(defaultRole)
  const [company, setCompany]   = useState(defaultCompany)
  const [location, setLocation] = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<SalaryResult | null>(null)
  const [error, setError]       = useState('')

  const inputCls = 'w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400'
  const labelCls = 'block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role.trim() || !company.trim() || loading) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/salary-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, company, location }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error === 'upgrade_required'
          ? 'This feature requires the Executive plan.'
          : 'Failed to generate analysis. Please try again.')
        return
      }
      setResult(data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded p-6 flex flex-col gap-4">
        <div>
          <label className={labelCls}>Role <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Chief Information Officer"
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Company <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Acme Corp"
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Location <span className="text-slate-300 font-normal normal-case tracking-normal">optional</span></label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="San Francisco, CA"
            className={inputCls}
          />
        </div>
        <button
          type="submit"
          disabled={!role.trim() || !company.trim() || loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white text-[13px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed self-start"
        >
          {loading ? 'Analyzing...' : 'Generate salary analysis'}
        </button>
        {error && (
          <p className="text-[13px] text-red-600">{error}</p>
        )}
      </form>

      {result && (
        <div className="flex flex-col gap-4">

          {/* Comp range */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-4">Compensation range</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-[11px] text-slate-400 mb-1">Floor</p>
                <p className="text-[22px] font-bold text-slate-900">{fmt(result.low)}</p>
              </div>
              <div className="text-center border-x border-slate-100">
                <p className="text-[11px] text-orange-500 font-semibold mb-1">Target</p>
                <p className="text-[22px] font-bold text-orange-500">{fmt(result.target)}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-slate-400 mb-1">Ceiling</p>
                <p className="text-[22px] font-bold text-slate-900">{fmt(result.ceiling)}</p>
              </div>
            </div>
            {result.notes && (
              <p className="text-[13px] text-slate-500 leading-relaxed border-t border-slate-100 pt-4">{result.notes}</p>
            )}
          </div>

          {/* Negotiation script */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">What to say when they present the offer</p>
            <p className="text-[14px] text-slate-700 leading-relaxed">{result.negotiation_script}</p>
          </div>

          {/* Pushback responses */}
          {result.pushback_responses?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded p-6">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-4">Pushback responses</p>
              <div className="flex flex-col gap-5">
                {result.pushback_responses.map((item, i) => (
                  <div key={i}>
                    <p className="text-[12px] font-semibold text-slate-500 mb-1.5">&ldquo;{item.objection}&rdquo;</p>
                    <p className="text-[14px] text-slate-700 leading-relaxed">{item.response}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
