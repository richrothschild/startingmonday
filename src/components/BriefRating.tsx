'use client'
import { useState } from 'react'

export function BriefRating({ briefId }: { briefId: string }) {
  const [rating, setRating] = useState<1 | -1 | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleRate(r: 1 | -1) {
    if (rating !== null || submitting) return
    setSubmitting(true)
    try {
      await fetch(`/api/briefs/${briefId}/rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: r }),
      })
      setRating(r)
    } finally {
      setSubmitting(false)
    }
  }

  if (rating !== null) {
    return <p className="text-[12px] text-slate-400">Thanks for the feedback.</p>
  }

  return (
    <div className="flex items-center gap-3 text-[12px] text-slate-400">
      <span>Useful?</span>
      <button
        type="button"
        onClick={() => handleRate(1)}
        disabled={submitting}
        className="border border-slate-200 rounded px-2.5 py-1 text-slate-600 hover:bg-slate-50 hover:border-slate-300 cursor-pointer bg-white disabled:opacity-40"
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => handleRate(-1)}
        disabled={submitting}
        className="border border-slate-200 rounded px-2.5 py-1 text-slate-600 hover:bg-slate-50 hover:border-slate-300 cursor-pointer bg-white disabled:opacity-40"
      >
        No
      </button>
    </div>
  )
}
