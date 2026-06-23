'use client'

import { useMemo, useState } from 'react'

type CompanyOption = {
  id: string
  name: string
}

type MatchItem = {
  match_id: string
  candidate_name: string
  candidate_title: string | null
  connection_name: string
  connection_company: string | null
  confidence_tier: 'high' | 'medium' | 'low' | 'rejected'
  overall_score: number
  user_confirmed: boolean
}

type MatchResponse = {
  upload_id: string | null
  likely_known: MatchItem[]
  suggested_by_apollo: MatchItem[]
  confirmed_relationships: MatchItem[]
}

export function RelationshipMatchPanel({ companies }: { companies: CompanyOption[] }) {
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? '')
  const [uploadId, setUploadId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MatchResponse | null>(null)

  const hasCompany = useMemo(() => companyId.length > 0, [companyId])

  async function runMatch() {
    if (!hasCompany) return
    setLoading(true)
    setError(null)

    try {
      const qs = new URLSearchParams({ company_id: companyId })
      if (uploadId.trim().length > 0) {
        qs.set('upload_id', uploadId.trim())
      }

      const response = await fetch(`/api/linkedin-import/match?${qs.toString()}`, { method: 'GET' })
      const payload = await response.json()
      if (!response.ok) {
        setError(payload?.error ?? 'Failed to load relationship matches.')
        setData(null)
        return
      }

      setData(payload as MatchResponse)
    } catch {
      setError('Failed to load relationship matches.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  async function addConfirmedMatch(matchId: string) {
    const response = await fetch('/api/linkedin-import/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: matchId }),
    })

    if (!response.ok) {
      return
    }

    await runMatch()
  }

  return (
    <section className="mb-6 rounded border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <p className="text-[12px] font-bold tracking-[0.12em] uppercase text-slate-500">Relationship matching</p>
          <p className="mt-1 text-[13px] text-slate-600">Find likely connections from uploaded LinkedIn contacts + Apollo suggestions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <label className="text-[12px] text-slate-600">
          Company
          <select
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
            className="mt-1 block min-h-[44px] w-full rounded border border-slate-200 bg-white px-3 text-[13px] text-slate-900"
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </label>

        <label className="text-[12px] text-slate-600">
          Upload ID (optional)
          <input
            type="text"
            value={uploadId}
            onChange={(event) => setUploadId(event.target.value)}
            placeholder="Uses latest upload if blank"
            className="mt-1 block min-h-[44px] w-full rounded border border-slate-200 bg-white px-3 text-[13px] text-slate-900 placeholder:text-slate-400"
          />
        </label>

        <button
          type="button"
          onClick={runMatch}
          disabled={!hasCompany || loading}
          className="inline-flex min-h-[44px] items-center justify-center rounded border border-slate-900 bg-slate-900 px-4 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Matching…' : 'Run match'}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
          {error}
        </p>
      )}

      {data && (
        <div className="mt-4 space-y-4">
          <div className="rounded border border-slate-200 p-3">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500">Likely known to you</p>
            {data.likely_known.length === 0 ? (
              <p className="mt-2 text-[13px] text-slate-500">No high or medium-confidence matches yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {data.likely_known.map((item) => (
                  <li key={item.match_id} className="rounded border border-slate-200 px-3 py-2">
                    <p className="text-[13px] font-semibold text-slate-900">{item.candidate_name} <span className="font-normal text-slate-500">({item.candidate_title ?? 'Role unknown'})</span></p>
                    <p className="mt-1 text-[12px] text-slate-600">Matched to your connection: {item.connection_name}{item.connection_company ? ` at ${item.connection_company}` : ''}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] uppercase tracking-[0.08em] text-slate-600">{item.confidence_tier}</span>
                      <span className="text-[11px] text-slate-500">score {(item.overall_score * 100).toFixed(1)}%</span>
                      <button
                        type="button"
                        onClick={() => addConfirmedMatch(item.match_id)}
                        className="inline-flex min-h-[36px] items-center rounded border border-emerald-200 bg-emerald-50 px-2.5 text-[12px] font-semibold text-emerald-700"
                      >
                        Add to contacts
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded border border-slate-200 p-3">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500">Suggested by Apollo</p>
            {data.suggested_by_apollo.length === 0 ? (
              <p className="mt-2 text-[13px] text-slate-500">No low-confidence suggestions yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {data.suggested_by_apollo.map((item) => (
                  <li key={item.match_id} className="rounded border border-slate-200 px-3 py-2">
                    <p className="text-[13px] font-semibold text-slate-900">{item.candidate_name}</p>
                    <p className="mt-1 text-[12px] text-slate-600">Potential overlap with {item.connection_name}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded border border-slate-200 p-3">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500">Confirmed relationships</p>
            {data.confirmed_relationships.length === 0 ? (
              <p className="mt-2 text-[13px] text-slate-500">No confirmed relationships yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {data.confirmed_relationships.map((item) => (
                  <li key={item.match_id} className="rounded border border-slate-200 px-3 py-2">
                    <p className="text-[13px] font-semibold text-slate-900">{item.candidate_name}</p>
                    <p className="mt-1 text-[12px] text-slate-600">Confirmed through connection {item.connection_name}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
