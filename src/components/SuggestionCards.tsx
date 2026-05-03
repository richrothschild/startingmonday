'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Recruiter = { name: string; focus: string }
type Suggestions = { companies: string[]; recruiters: Recruiter[] }

const DISMISS_KEY = 'sm_suggestions_dismissed'

export function SuggestionCards() {
  const [data, setData]       = useState<Suggestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY)) {
      setDismissed(true)
      setLoading(false)
      return
    }
    fetch('/api/suggestions')
      .then(r => r.json())
      .then((d: Suggestions) => {
        if (!d.companies?.length && !d.recruiters?.length) {
          setDismissed(true)
        } else {
          setData(d)
        }
      })
      .catch(() => setDismissed(true))
      .finally(() => setLoading(false))
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  if (dismissed || (!loading && !data)) return null

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded p-6 mb-8 animate-pulse">
        <div className="h-3 bg-slate-100 rounded w-48 mb-4" />
        <div className="h-3 bg-slate-100 rounded w-full mb-2" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden mb-8">
      <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
            Suggestions
          </span>
          <p className="text-[12px] text-slate-400 mt-0.5">Based on your profile. Dismiss when you no longer need this.</p>
        </div>
        <button
          onClick={dismiss}
          className="text-[12px] text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0"
        >
          Dismiss
        </button>
      </div>

      <div className="divide-y divide-slate-50">

        {data.companies.length > 0 && (
          <div className="px-6 py-5">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">
              Companies to add to your pipeline
            </p>
            <div className="flex flex-wrap gap-2">
              {data.companies.map(name => (
                <Link
                  key={name}
                  href={`/dashboard/companies/new?name=${encodeURIComponent(name)}`}
                  className="inline-flex items-center gap-1.5 text-[13px] text-slate-700 border border-slate-200 rounded-full px-3.5 py-1.5 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-300 text-[11px]">+</span>
                  {name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {data.recruiters.length > 0 && (
          <div className="px-6 py-5">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">
              Executive search firms for your sector
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.recruiters.map(r => (
                <div key={r.name} className="flex items-start gap-2">
                  <span className="text-[13px] font-semibold text-slate-900 shrink-0">{r.name}</span>
                  <span className="text-[13px] text-slate-400">{r.focus}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
