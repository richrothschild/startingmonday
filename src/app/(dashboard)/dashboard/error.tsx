'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-start">
        <div className="bg-white border border-slate-200 rounded p-8 max-w-md">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Dashboard Error
          </div>
          <h1 className="text-[20px] font-bold text-slate-900 mb-3">
            Something went wrong.
          </h1>
          <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
            The dashboard failed to load. This is usually a temporary issue.
            Try refreshing — if it persists, the team has been notified.
          </p>
          <button
            onClick={reset}
            className="bg-slate-900 text-white text-[14px] font-semibold px-6 py-2.5 rounded cursor-pointer border-0"
          >
            Try again
          </button>
        </div>
      </main>

    </div>
  )
}
