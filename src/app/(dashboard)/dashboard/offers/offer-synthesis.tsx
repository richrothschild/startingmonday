'use client'
import { useState } from 'react'

type OfferInput = {
  name: string
  sector?: string | null
  offer_role_title?: string | null
  offer_base?: number | null
  offer_bonus_pct?: number | null
  offer_signing?: number | null
  offer_equity?: string | null
  offer_notes?: string | null
  offer_decision_factors?: string | null
}

export function OfferSynthesis({ offers }: { offers: OfferInput[] }) {
  const [synthesis, setSynthesis] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    setSynthesis('')
    try {
      const res = await fetch('/api/offer-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offers }),
      })
      const data = await res.json()
      if (!res.ok) { setError('Failed to generate. Try again.'); return }
      setSynthesis(data.synthesis)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (offers.length === 0) return null

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded overflow-hidden">
      <div className="px-6 py-[18px] border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Decision synthesis</p>
          <p className="text-[12px] text-slate-400 mt-0.5">Claude reads your offer data and decision factors and tells you where the real tension is.</p>
        </div>
        {!synthesis && (
          <button
            onClick={generate}
            disabled={loading}
            className="shrink-0 text-[12px] font-semibold text-white bg-slate-900 hover:bg-slate-700 disabled:opacity-40 px-4 py-2 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed"
          >
            {loading ? 'Thinking...' : 'Help me decide'}
          </button>
        )}
        {synthesis && (
          <button
            onClick={generate}
            disabled={loading}
            className="shrink-0 text-[11px] font-semibold text-slate-400 hover:text-slate-600 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded transition-colors cursor-pointer bg-white border-0"
          >
            {loading ? 'Thinking...' : 'Refresh'}
          </button>
        )}
      </div>
      {error && (
        <div className="px-6 py-4 text-[13px] text-red-600">{error}</div>
      )}
      {loading && !synthesis && (
        <div className="px-6 py-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:300ms]" />
        </div>
      )}
      {synthesis && (
        <div className="px-6 py-5">
          <p className="text-[14px] text-slate-800 leading-relaxed">{synthesis}</p>
        </div>
      )}
    </div>
  )
}
