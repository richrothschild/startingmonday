'use client'
import { useState } from 'react'

type PushbackItem = { objection: string; response: string }

type SalaryResult = {
  low: number
  target: number
  ceiling: number
  currency: string
  base: { low: number; target: number; ceiling: number }
  bonus: { target_pct: number; max_pct: number; notes: string }
  equity: { range: string; vesting: string; notes: string }
  levers: string[]
  notes: string
  negotiation_script: string
  pushback_responses: PushbackItem[]
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const SECTORS = [
  'Technology',
  'Healthcare / Life Sciences',
  'Financial Services / Banking',
  'Retail / Consumer',
  'Manufacturing / Industrial',
  'Professional Services',
  'Media / Entertainment',
  'Energy / Utilities',
  'Government / Education / Nonprofit',
  'Other',
]

const LEVELS = [
  'VP',
  'SVP / Group VP',
  'EVP / Division President',
  'C-Suite (CIO / CTO / CISO / CDO / COO)',
  'CEO / President',
]

const COMPANY_STAGES = [
  'Startup (Seed – Series B)',
  'Growth (Series C+)',
  'PE-backed',
  'Public (mid-cap)',
  'Public (large-cap / Fortune 500)',
  'Nonprofit / Government',
]

export function SalaryIntelClient({ defaultCompany, defaultRole }: { defaultCompany: string; defaultRole: string }) {
  const [role, setRole]               = useState(defaultRole)
  const [company, setCompany]         = useState(defaultCompany)
  const [location, setLocation]       = useState('')
  const [sector, setSector]           = useState('')
  const [level, setLevel]             = useState('')
  const [companyStage, setCompanyStage] = useState('')
  const [loading, setLoading]         = useState(false)
  const [result, setResult]           = useState<SalaryResult | null>(null)
  const [error, setError]             = useState('')

  const inputCls  = 'w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white'
  const selectCls = 'w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white'
  const labelCls  = 'block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5'

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
        body: JSON.stringify({ role, company, location, sector, level, company_stage: companyStage }),
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

        {/* Row 1: role + company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        {/* Row 2: level + sector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Level <span className="text-slate-300 font-normal normal-case tracking-normal">optional</span></label>
            <select value={level} onChange={e => setLevel(e.target.value)} className={selectCls}>
              <option value="">Select level…</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sector <span className="text-slate-300 font-normal normal-case tracking-normal">optional</span></label>
            <select value={sector} onChange={e => setSector(e.target.value)} className={selectCls}>
              <option value="">Select sector…</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Row 3: company stage + location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Company stage <span className="text-slate-300 font-normal normal-case tracking-normal">optional</span></label>
            <select value={companyStage} onChange={e => setCompanyStage(e.target.value)} className={selectCls}>
              <option value="">Select stage…</option>
              {COMPANY_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
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
        </div>

        <button
          type="submit"
          disabled={!role.trim() || !company.trim() || loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white text-[13px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed self-start"
        >
          {loading ? 'Analyzing…' : 'Generate salary analysis'}
        </button>
        {error && <p className="text-[13px] text-red-600">{error}</p>}
      </form>

      {result && (
        <div className="flex flex-col gap-4">

          {/* Total comp range */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-4">Total cash compensation</p>
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

          {/* Component breakdown */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-4">Compensation breakdown</p>
            <div className="flex flex-col gap-5">

              {/* Base */}
              {result.base && (
                <div>
                  <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-slate-500 mb-2">Base salary</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[11px] text-slate-400 mb-0.5">Floor</p>
                      <p className="text-[16px] font-semibold text-slate-700">{fmt(result.base.low)}</p>
                    </div>
                    <div className="border-x border-slate-100">
                      <p className="text-[11px] text-orange-500 mb-0.5">Target</p>
                      <p className="text-[16px] font-semibold text-orange-500">{fmt(result.base.target)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 mb-0.5">Ceiling</p>
                      <p className="text-[16px] font-semibold text-slate-700">{fmt(result.base.ceiling)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bonus */}
              {result.bonus && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-slate-500 mb-2">Annual bonus</p>
                  <div className="flex gap-6 mb-1.5">
                    <div>
                      <span className="text-[11px] text-slate-400">Target </span>
                      <span className="text-[14px] font-semibold text-slate-800">{result.bonus.target_pct}% of base</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Max </span>
                      <span className="text-[14px] font-semibold text-slate-800">{result.bonus.max_pct}% of base</span>
                    </div>
                  </div>
                  {result.bonus.notes && (
                    <p className="text-[12px] text-slate-400 leading-relaxed">{result.bonus.notes}</p>
                  )}
                </div>
              )}

              {/* Equity */}
              {result.equity && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-slate-500 mb-2">Equity</p>
                  <p className="text-[14px] font-semibold text-slate-800 mb-1">{result.equity.range}</p>
                  <p className="text-[12px] text-slate-500 mb-1">{result.equity.vesting}</p>
                  {result.equity.notes && (
                    <p className="text-[12px] text-slate-400 leading-relaxed">{result.equity.notes}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Negotiation levers */}
          {result.levers?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded p-6">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Negotiation levers</p>
              <ul className="flex flex-col gap-2">
                {result.levers.map((lever, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] text-slate-700 leading-relaxed">
                    <span className="text-orange-400 mt-px shrink-0">→</span>
                    {lever}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
