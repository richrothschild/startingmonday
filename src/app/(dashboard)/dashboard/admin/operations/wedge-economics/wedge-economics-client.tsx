'use client'

import { useEffect, useMemo, useState } from 'react'

type MarketingMotion = 'direct_paid_sprint' | 'partner_pilot' | 'other'
type PartnerCommercialEvent = 'pilot_fee_collected' | 'expansion_proposal_sent' | 'expansion_accepted' | 'expansion_rejected'

type LedgersResponse = {
  ok: boolean
  lookback_days: number
  marketing_spend_entries: Array<{
    id: string
    motion: MarketingMotion
    channel: string | null
    amount_usd: number
    effective_at: string
    notes: string | null
    metadata: Record<string, unknown>
    created_at: string
  }>
  partner_commercial_events: Array<{
    id: string
    partner_id: string
    event_type: PartnerCommercialEvent
    amount_usd: number | null
    effective_at: string
    metadata: Record<string, unknown>
    created_at: string
  }>
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

function toIsoOrUndefined(value: string): string | undefined {
  if (!value) return undefined
  const normalized = new Date(value)
  if (Number.isNaN(normalized.getTime())) return undefined
  return normalized.toISOString()
}

function money(value: number | null): string {
  if (value === null) return '--'
  return `$${value.toFixed(2)}`
}

export default function WedgeEconomicsClient() {
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [lookbackDays, setLookbackDays] = useState(30)
  const [payload, setPayload] = useState<LedgersResponse | null>(null)

  const [marketingMotion, setMarketingMotion] = useState<MarketingMotion>('direct_paid_sprint')
  const [marketingChannel, setMarketingChannel] = useState('')
  const [marketingAmount, setMarketingAmount] = useState('')
  const [marketingEffectiveAt, setMarketingEffectiveAt] = useState('')
  const [marketingNotes, setMarketingNotes] = useState('')

  const [partnerId, setPartnerId] = useState('')
  const [partnerEventType, setPartnerEventType] = useState<PartnerCommercialEvent>('pilot_fee_collected')
  const [partnerAmount, setPartnerAmount] = useState('')
  const [partnerEffectiveAt, setPartnerEffectiveAt] = useState('')

  const [submitState, setSubmitState] = useState<'idle' | 'saving'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  const marketingTotal = useMemo(() => {
    return (payload?.marketing_spend_entries ?? []).reduce((sum, row) => sum + Number(row.amount_usd ?? 0), 0)
  }, [payload])

  const partnerFeesTotal = useMemo(() => {
    return (payload?.partner_commercial_events ?? [])
      .filter((row) => row.event_type === 'pilot_fee_collected')
      .reduce((sum, row) => sum + Number(row.amount_usd ?? 0), 0)
  }, [payload])

  async function loadData(currentLookbackDays: number) {
    setLoadState('loading')
    setLoadError(null)

    try {
      const response = await fetch(`/api/admin/automation/reporting/wedge-economics-ledgers?lookbackDays=${currentLookbackDays}`, { cache: 'no-store' })
      const json = await response.json() as LedgersResponse | { error?: string }

      if (!response.ok) {
        throw new Error((json as { error?: string }).error ?? 'Failed to load wedge economics ledgers.')
      }

      setPayload(json as LedgersResponse)
      setLoadState('ready')
    } catch (error) {
      setLoadState('error')
      setLoadError(error instanceof Error ? error.message : 'Failed to load wedge economics ledgers.')
    }
  }

  useEffect(() => {
    void loadData(lookbackDays)
  }, [lookbackDays])

  async function submitMarketingEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitState('saving')
    setSubmitError(null)
    setSubmitMessage(null)

    const amount = Number(marketingAmount)
    if (!Number.isFinite(amount) || amount < 0) {
      setSubmitState('idle')
      setSubmitError('Marketing amount must be a valid non-negative number.')
      return
    }

    try {
      const response = await fetch('/api/admin/automation/reporting/wedge-economics-ledgers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: [
            {
              ledger: 'marketing_spend',
              motion: marketingMotion,
              channel: marketingChannel.trim() || undefined,
              amount_usd: amount,
              effective_at: toIsoOrUndefined(marketingEffectiveAt),
              notes: marketingNotes.trim() || undefined,
            },
          ],
        }),
      })

      const json = await response.json() as { error?: string }
      if (!response.ok) {
        throw new Error(json.error ?? 'Failed to write marketing ledger row.')
      }

      setMarketingAmount('')
      setMarketingChannel('')
      setMarketingEffectiveAt('')
      setMarketingNotes('')
      setSubmitMessage('Marketing spend entry saved.')
      await loadData(lookbackDays)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to write marketing ledger row.')
    } finally {
      setSubmitState('idle')
    }
  }

  async function submitPartnerEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitState('saving')
    setSubmitError(null)
    setSubmitMessage(null)

    const trimmedPartnerId = partnerId.trim()
    if (!trimmedPartnerId) {
      setSubmitState('idle')
      setSubmitError('Partner ID is required for partner commercial events.')
      return
    }

    const parsedAmount = partnerAmount.trim() === '' ? null : Number(partnerAmount)
    if (parsedAmount !== null && (!Number.isFinite(parsedAmount) || parsedAmount < 0)) {
      setSubmitState('idle')
      setSubmitError('Partner amount must be empty or a valid non-negative number.')
      return
    }

    try {
      const response = await fetch('/api/admin/automation/reporting/wedge-economics-ledgers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: [
            {
              ledger: 'partner_commercial',
              partner_id: trimmedPartnerId,
              event_type: partnerEventType,
              amount_usd: parsedAmount,
              effective_at: toIsoOrUndefined(partnerEffectiveAt),
            },
          ],
        }),
      })

      const json = await response.json() as { error?: string }
      if (!response.ok) {
        throw new Error(json.error ?? 'Failed to write partner commercial event.')
      }

      setPartnerAmount('')
      setPartnerEffectiveAt('')
      setSubmitMessage('Partner commercial event saved.')
      await loadData(lookbackDays)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to write partner commercial event.')
    } finally {
      setSubmitState('idle')
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-orange-200">Ledger controls</p>
          <label className="text-[12px] text-slate-300">
            Lookback days
            <input
              type="number"
              min={7}
              max={120}
              value={lookbackDays}
              onChange={(event) => setLookbackDays(Math.max(7, Math.min(120, Number(event.target.value) || 30)))}
              className="ml-2 w-20 rounded border border-white/15 bg-slate-950/50 px-2 py-1 text-[12px] text-slate-100"
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
            <p className="text-[11px] uppercase tracking-[0.1em] text-slate-400">Marketing rows</p>
            <p className="mt-1 text-[18px] font-semibold text-white">{payload?.marketing_spend_entries.length ?? 0}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
            <p className="text-[11px] uppercase tracking-[0.1em] text-slate-400">Marketing total</p>
            <p className="mt-1 text-[18px] font-semibold text-white">{money(marketingTotal)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
            <p className="text-[11px] uppercase tracking-[0.1em] text-slate-400">Partner events</p>
            <p className="mt-1 text-[18px] font-semibold text-white">{payload?.partner_commercial_events.length ?? 0}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
            <p className="text-[11px] uppercase tracking-[0.1em] text-slate-400">Pilot fees</p>
            <p className="mt-1 text-[18px] font-semibold text-white">{money(partnerFeesTotal)}</p>
          </div>
        </div>

        {submitError ? <p className="mt-3 text-[13px] text-rose-300">{submitError}</p> : null}
        {submitMessage ? <p className="mt-3 text-[13px] text-emerald-200">{submitMessage}</p> : null}
        {loadState === 'error' && loadError ? <p className="mt-3 text-[13px] text-rose-300">{loadError}</p> : null}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <form onSubmit={submitMarketingEntry} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-orange-200">Add marketing spend</p>
          <div className="mt-3 space-y-3 text-[13px] text-slate-200">
            <label className="block">
              Motion
              <select value={marketingMotion} onChange={(event) => setMarketingMotion(event.target.value as MarketingMotion)} className="mt-1 w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100">
                <option value="direct_paid_sprint">direct_paid_sprint</option>
                <option value="partner_pilot">partner_pilot</option>
                <option value="other">other</option>
              </select>
            </label>
            <label className="block">
              Channel
              <input value={marketingChannel} onChange={(event) => setMarketingChannel(event.target.value)} placeholder="paid_social" className="mt-1 w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100" />
            </label>
            <label className="block">
              Amount USD
              <input value={marketingAmount} onChange={(event) => setMarketingAmount(event.target.value)} type="number" min={0} step="0.01" required className="mt-1 w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100" />
            </label>
            <label className="block">
              Effective at
              <input value={marketingEffectiveAt} onChange={(event) => setMarketingEffectiveAt(event.target.value)} type="datetime-local" className="mt-1 w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100" />
            </label>
            <label className="block">
              Notes
              <input value={marketingNotes} onChange={(event) => setMarketingNotes(event.target.value)} placeholder="optional context" className="mt-1 w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100" />
            </label>
          </div>
          <button disabled={submitState === 'saving'} type="submit" className="mt-4 rounded border border-white/20 px-3 py-2 text-[13px] font-semibold text-slate-100 hover:border-orange-300/70 hover:bg-white/5 disabled:opacity-60">
            {submitState === 'saving' ? 'Saving...' : 'Save marketing row'}
          </button>
        </form>

        <form onSubmit={submitPartnerEvent} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-orange-200">Add partner commercial event</p>
          <div className="mt-3 space-y-3 text-[13px] text-slate-200">
            <label className="block">
              Partner ID
              <input value={partnerId} onChange={(event) => setPartnerId(event.target.value)} placeholder="UUID" required className="mt-1 w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100" />
            </label>
            <label className="block">
              Event type
              <select value={partnerEventType} onChange={(event) => setPartnerEventType(event.target.value as PartnerCommercialEvent)} className="mt-1 w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100">
                <option value="pilot_fee_collected">pilot_fee_collected</option>
                <option value="expansion_proposal_sent">expansion_proposal_sent</option>
                <option value="expansion_accepted">expansion_accepted</option>
                <option value="expansion_rejected">expansion_rejected</option>
              </select>
            </label>
            <label className="block">
              Amount USD (optional)
              <input value={partnerAmount} onChange={(event) => setPartnerAmount(event.target.value)} type="number" min={0} step="0.01" className="mt-1 w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100" />
            </label>
            <label className="block">
              Effective at
              <input value={partnerEffectiveAt} onChange={(event) => setPartnerEffectiveAt(event.target.value)} type="datetime-local" className="mt-1 w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100" />
            </label>
          </div>
          <button disabled={submitState === 'saving'} type="submit" className="mt-4 rounded border border-white/20 px-3 py-2 text-[13px] font-semibold text-slate-100 hover:border-orange-300/70 hover:bg-white/5 disabled:opacity-60">
            {submitState === 'saving' ? 'Saving...' : 'Save partner event'}
          </button>
        </form>
      </section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <p className="text-[13px] font-bold tracking-[0.14em] uppercase text-slate-400">Recent marketing spend rows</p>
          <span className="text-[12px] text-slate-400">{loadState === 'loading' ? 'Loading...' : `Rows: ${payload?.marketing_spend_entries.length ?? 0}`}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[12px] text-slate-200">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-5 py-2 pr-4">Effective</th>
                <th className="py-2 pr-4">Motion</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {(payload?.marketing_spend_entries ?? []).map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  <td className="px-5 py-2 pr-4 font-mono text-[11px] text-slate-300">{new Date(row.effective_at).toISOString()}</td>
                  <td className="py-2 pr-4">{row.motion}</td>
                  <td className="py-2 pr-4">{row.channel ?? '--'}</td>
                  <td className="py-2 pr-4">{money(row.amount_usd)}</td>
                  <td className="py-2 pr-4 max-w-[260px] truncate" title={row.notes ?? '--'}>{row.notes ?? '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <p className="text-[13px] font-bold tracking-[0.14em] uppercase text-slate-400">Recent partner commercial events</p>
          <span className="text-[12px] text-slate-400">{loadState === 'loading' ? 'Loading...' : `Rows: ${payload?.partner_commercial_events.length ?? 0}`}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[12px] text-slate-200">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-5 py-2 pr-4">Effective</th>
                <th className="py-2 pr-4">Partner</th>
                <th className="py-2 pr-4">Event</th>
                <th className="py-2 pr-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(payload?.partner_commercial_events ?? []).map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  <td className="px-5 py-2 pr-4 font-mono text-[11px] text-slate-300">{new Date(row.effective_at).toISOString()}</td>
                  <td className="py-2 pr-4 font-mono text-[11px] text-slate-300">{row.partner_id}</td>
                  <td className="py-2 pr-4">{row.event_type}</td>
                  <td className="py-2 pr-4">{money(row.amount_usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
